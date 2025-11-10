import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// --- CONFIGURATION ---
// IMPORTANT: These global variables are provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof _firebase_config !== 'undefined' ? JSON.parse(_firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Context for Firebase and User Data
const FirebaseContext = createContext(null);

// --- UTILITY COMPONENTS ---

// Custom Modal for Alerts/Confirmations
const Modal = ({ isOpen, title, children, onClose, footer }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-auto transform transition-all">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- HOOKS ---

// Hook to manage Firebase services and Auth state
const useFirebase = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Object.keys(firebaseConfig).length) {
      console.warn("Firebase config is missing or incomplete.");
      return;
    }

    try {
      const app = initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const authService = getAuth(app);
      
      setDb(firestore);
      setAuth(authService);

      // 1. Initial Authentication
      const authenticate = async () => {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(authService, initialAuthToken);
            console.log("Signed in with custom token.");
          } else {
            await signInAnonymously(authService);
            console.log("Signed in anonymously.");
          }
        } catch (e) {
          console.error("Authentication failed:", e);
          setError("Failed to sign in. Check console for details.");
          await signInAnonymously(authService); // Fallback to anonymous sign-in
        }
      };

      authenticate();

      // 2. Auth State Listener (for getting the user object)
      const unsubscribe = onAuthStateChanged(authService, (currentUser) => {
        setUser(currentUser);
        setIsAuthReady(true);
        console.log("Auth state changed. User ID:", currentUser?.uid);
      });

      return () => unsubscribe();
      
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setError("Firebase initialization failed. Check console.");
    }
  }, []);

  return { db, auth, user, isAuthReady, error };
};

// Hook to fetch and listen to real-time data
const useListings = () => {
  const { db, user, isAuthReady } = useContext(FirebaseContext);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthReady || !db || !user) return;

    // Path: /artifacts/{appId}/public/data/listings
    const collectionPath = artifacts/${appId}/public/data/listings;
    const listingsCollection = collection(db, collectionPath);
    
    // Using a simple query without orderBy for broader compatibility with security rules/indexes
    const q = query(listingsCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by timestamp descending (newest first) in memory
      items.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

      setListings(items);
      setIsLoading(false);
      console.log("Listings updated:", items.length);
    }, (error) => {
      console.error("Error fetching listings:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, user, isAuthReady]);

  return { listings, isLoading };
};

// --- COMPONENTS ---

// Navigation Component
const Navbar = () => {
  const { user } = useContext(FirebaseContext);
  
  // Use crypto.randomUUID() as a fallback userId if not logged in (though Firebase handles this)
  const userId = user?.uid || 'Unknown User'; 

  return (
    <div className="p-4 bg-white shadow-md sticky top-0 z-10">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-green-700 font-inter">BarterBite</h1>
        <div className="text-xs text-right font-mono p-1 rounded-lg bg-gray-50 border border-gray-200">
          User ID: <span className="text-gray-600 break-all">{userId}</span>
        </div>
      </div>
    </div>
  );
};

// Listing Form Component
const CreateListing = () => {
  const { db, user } = useContext(FirebaseContext);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Produce');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');

  const categories = ['Produce', 'Baked Goods', 'Pantry Items', 'Home Meals', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!itemName.trim() || !description.trim()) {
      setFormError("Item name and description are required.");
      return;
    }
    
    if (!user || !db) {
      setFormError("Authentication is not ready. Please wait.");
      return;
    }

    try {
      // Path: /artifacts/{appId}/public/data/listings
      const collectionPath = artifacts/${appId}/public/data/listings;
      await addDoc(collection(db, collectionPath), {
        userId: user.uid,
        itemName: itemName.trim(),
        description: description.trim(),
        category,
        status: 'Available',
        timestamp: serverTimestamp(),
      });
      
      setItemName('');
      setDescription('');
      setCategory('Produce');
      setIsModalOpen(true);
      
    } catch (error) {
      console.error("Error creating listing:", error);
      setFormError("Failed to create listing. Check console.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">List an Item for Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            id="itemName"
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            placeholder="e.g., Homemade Sourdough Loaf"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (What you want to trade)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            placeholder="Describe the item, quantity, and expiration date."
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border bg-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {formError && (
          <p className="text-red-500 text-sm">{formError}</p>
        )}

        <button
          type="submit"
          disabled={!user || formError}
          className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-150"
        >
          {user ? 'Submit Listing' : 'Connecting...'}
        </button>
      </form>

      <Modal 
        isOpen={isModalOpen} 
        title="Listing Created!" 
        onClose={() => setIsModalOpen(false)}
        footer={
          <button 
            onClick={() => setIsModalOpen(false)}
            className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Got It
          </button>
        }
      >
        <p>Your item *{itemName}* has been successfully listed for trade!</p>
      </Modal>
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing }) => {
  const { user } = useContext(FirebaseContext);
  const isOwner = user && user.uid === listing.userId;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Firebase Timestamps have a toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
            {listing.category}
          </span>
          <span className={text-xs font-medium px-2 py-0.5 rounded-full ${listing.status === 'Available' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}}>
            {listing.status}
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.itemName}</h3>
        <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
        
        <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1">
          <p>Posted: {formatDate(listing.timestamp)}</p>
          <p className="break-all font-mono">Trader ID: {listing.userId.substring(0, 10)}... ({isOwner ? 'You' : 'Other'})</p>
        </div>
      </div>
      
      <div className={p-4 ${isOwner ? 'bg-green-50' : 'bg-gray-50'} border-t border-gray-200}>
        <button 
          className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-md"
        >
          {isOwner ? 'Manage Listing' : 'Offer Trade'}
        </button>
      </div>
    </div>
  );
};

// Main Listing Feed Component
const ListingFeed = () => {
  const { listings, isLoading } = useListings();

  if (isLoading) {
    return (
      <div className="text-center p-8 text-gray-500">
        <svg className="animate-spin h-8 w-8 text-green-500 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading listings...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {listings.length === 0 ? (
        <p className="text-center text-gray-500 md:col-span-2 lg:col-span-2">No items listed yet. Be the first!</p>
      ) : (
        listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))
      )}
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
const App = () => {
  const firebaseData = useFirebase();
  const { isAuthReady, error } = firebaseData;

  if (!isAuthReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600 font-medium">Connecting to BarterBite network...</p>
          {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={firebaseData}>
      <div className="min-h-screen bg-gray-50 font-inter">
        <Navbar />
        
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-6">BarterBite Market Feed</h1>
          <p className="text-gray-600 mb-8">Trade locally grown or prepared food items—no cash required! All listings are public for this app ID: <span className='font-mono text-xs text-green-700 break-all'>{appId}</span></p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CreateListing />
            </div>
            <div className="lg:col-span-2">
              <ListingFeed />
            </div>
          </div>
        </div>
        
      </div>
    </FirebaseContext.Provider>
  );
};

export default App;
