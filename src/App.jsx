import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  query, 
  updateDoc,
  where,
  orderBy,
  getDocs,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- CONFIGURATION ---
const getFirebaseConfig = () => {
  // Your actual Firebase configuration
  return {
    apiKey: "AIzaSyCL3nmvDtX7QO-xqVCVQg3vGVD2weVhgpM",
    authDomain: "barterbite-c735d.firebaseapp.com",
    projectId: "barterbite-c735d",
    storageBucket: "barterbite-c735d.firebasestorage.app",
    messagingSenderId: "77392068948",
    appId: "1:77392068948:web:036761985e672f80f708c1"
  };
};

const getAppId = () => {
  return typeof __app_id !== 'undefined' ? __app_id : 
         process.env.REACT_APP_ID || 'default-app-id';
};

const getAuthToken = () => {
  return typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : 
         process.env.REACT_APP_AUTH_TOKEN || null;
};

const appId = getAppId();
const firebaseConfig = getFirebaseConfig();
const initialAuthToken = getAuthToken();

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- NIGERIAN LOCATION DATABASE ---
const nigerianLocations = {
  states: [
    {
      name: "Lagos",
      cities: ["Ikeja", "Victoria Island", "Surulere", "Lekki", "Yaba", "Apapa", "Maryland", "Gbagada", "Ijebu-Lekki", "Badagry", "Ikorodu", "Epe"]
    },
    {
      name: "Abuja",
      cities: ["Garki", "Wuse", "Maitama", "Asokoro", "Jabi", "Gwarinpa", "Kubwa", "Lugbe", "Nyanya", "Karu", "City Center"]
    },
    {
      name: "Rivers",
      cities: ["Port Harcourt", "Borokiri", "Rumuokoro", "Trans-Amadi", "Ogbunabali", "Diobu", "Elelenwo", "Woji", "Rumuola"]
    },
    {
      name: "Kano",
      cities: ["Kano City", "Nassarawa", "Fagge", "Dala", "Gwale", "Tarauni", "Kumbotso", "Ungogo", "Kano Municipal"]
    },
    {
      name: "Oyo",
      cities: ["Ibadan", "Mokola", "Bodija", "Sango", "UI Area", "Agodi", "Gate", "Challenge", "Molete", "Apata"]
    },
    {
      name: "Kaduna",
      cities: ["Kaduna City", "Barnawa", "Kawo", "Tudun Wada", "Malali", "U/Rimi", "Kaduna South", "Sabon Tasha"]
    },
    {
      name: "Edo",
      cities: ["Benin City", "GRA", "Ugbowo", "Siluko", "New Benin", "Ogida", "Ikpoba Hill", "Ugbor", "Airport Road"]
    },
    {
      name: "Delta",
      cities: ["Warri", "Asaba", "Ughelli", "Sapele", "Agbor", "Oghara", "Burutu", "Koko", "Ozoro"]
    },
    {
      name: "Enugu",
      cities: ["Enugu City", "New Haven", "Abakpa", "Emene", "Uwani", "Independence Layout", "GRA", "Trans-Ekulu"]
    },
    {
      name: "Anambra",
      cities: ["Onitsha", "Awka", "Nnewi", "Ekwulobia", "Aguata", "Ogidi", "Otuocha", "Ihiala", "Umunya"]
    },
    {
      name: "Plateau",
      cities: ["Jos", "Bukuru", "Rantya", "Anglo-Jos", "Jenta", "Gangare", "Dadinkowa", "Sabon Gidan"]
    },
    {
      name: "Cross River",
      cities: ["Calabar", "Marian", "Etta-Agbor", "State Housing", "8 Miles", "Akai Effa", "Ikot Ansa", "Atimbo"]
    },
    {
      name: "Akwa Ibom",
      cities: ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak", "Etinan", "Ikot Abasi", "Ukanafun"]
    },
    {
      name: "Ogun",
      cities: ["Abeokuta", "Sagamu", "Ijebu-Ode", "Ilaro", "Ifo", "Owode", "Ado-Odo", "Ota", "Mowe"]
    },
    {
      name: "Other States",
      cities: ["Select your city..."]
    }
  ];


// --- MULTI-LANGUAGE SYSTEM ---
const translations = {
  en: {
    appName: "BarterBite",
    userID: "User ID",
    demoMode: "Demo Mode",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    profile: "Profile",
    welcome: "Welcome",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    continueWithGoogle: "Continue with Google",
    or: "or",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?"
  }
};

    
    // Main Headers
    marketFeed: "BarterBite Marketplace",
    tradeDescription: "Trade or buy locally grown or prepared food items! All listings are public for this app ID",
    
    // Listing Types
    listItem: "List an Item",
    listForTrade: "List for Trade",
    listForSale: "List for Sale",
    trade: "Trade",
    sale: "Sale",
    price: "Price",
    pricePlaceholder: "Enter price in Naira",
    currency: "₦",
    
    // Listing Form
    itemName: "Item Name",
    itemNamePlaceholder: "e.g., Homemade Sourdough Loaf",
    description: "Description",
    descriptionPlaceholder: "Describe the item, quantity, and expiration date.",
    category: "Category",
    submitListing: "Submit Listing",
    connecting: "Connecting...",
    createDemoListing: "Create Demo Listing",
    uploadImage: "Upload Image",
    chooseFile: "Choose File",
    noFileChosen: "No file chosen",
    
    // Categories
    produce: "Produce",
    bakedGoods: "Baked Goods",
    pantryItems: "Pantry Items",
    homeMeals: "Home Meals",
    other: "Other",
    
    // Nigerian Categories
    nigerianStaples: "Nigerian Staples",
    soupsStews: "Soups & Stews Ingredients",
    traditionalDishes: "Traditional Dishes",
    streetFoods: "Street Foods",
    freshProduce: "Fresh Produce",
    
    // Messages
    listingCreated: "Listing Created!",
    gotIt: "Got It",
    yourItem: "Your item",
    hasBeenListed: "has been successfully listed!",
    demoSimulation: "In demo mode, this is just a simulation.",
    
    // Status
    available: "Available",
    sold: "Sold",
    traded: "Traded",
    loadingListings: "Loading listings...",
    noItemsYet: "No items listed yet. Be the first!",
    
    // Connection
    connectingToNetwork: "Connecting to BarterBite network...",
    connectionIssue: "Connection Issue",
    runningInDemoMode: "Running in demo mode - Firebase not configured",
    appContinueLimited: "The app will continue in limited mode.",
    demoModeActive: "Demo Mode Active",
    showingSampleListings: "Showing sample listings. Real Firebase connection is not configured.",
    demoModeNotice: "Demo Mode: Listings are simulated and won't be saved permanently.",
    
    // Listing Card
    posted: "Posted",
    traderID: "Trader ID",
    you: "You",
    other: "Other",
    demoListing: "Demo Listing",
    manageListing: "Manage Listing",
    offerTrade: "Offer Trade",
    buyNow: "Buy Now",
    contactSeller: "Contact Seller",
    
    // Location
    selectState: "Select State",
    selectCity: "Select City",
    location: "Location",
    
    // Language
    language: "Language",
    english: "English",
    yoruba: "Yoruba",
    igbo: "Igbo",
    hausa: "Hausa",

    // Trade & Messaging
    makeOffer: "Make Offer",
    sendMessage: "Send Message",
    typeMessage: "Type your message...",
    offers: "Offers",
    messages: "Messages",
    newMessage: "New Message",
    noMessages: "No messages yet",
    noOffers: "No offers yet",
    offerSent: "Offer Sent!",
    messageSent: "Message Sent!",
    yourOffer: "Your Offer",
    tradeProposal: "Trade Proposal",
    whatYouOffer: "What you're offering in exchange",
    sendOffer: "Send Offer",
    cancel: "Cancel",
    accept: "Accept",
    reject: "Reject",
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    tradeHistory: "Trade History",

    // Search & Filters
    search: "Search",
    searchPlaceholder: "Search items...",
    filters: "Filters",
    clearFilters: "Clear Filters",
    sortBy: "Sort By",
    newestFirst: "Newest First",
    oldestFirst: "Oldest First",
    category: "Category",
    location: "Location",
    status: "Status",
    allCategories: "All Categories",
    allLocations: "All Locations",
    allStatus: "All Status",
    nearby: "Nearby",
    withinCity: "Within My City",
    withinState: "Within My State",
    listingType: "Listing Type",
    allTypes: "All Types",
    forTrade: "For Trade",
    forSale: "For Sale",

    // Notifications
    notifications: "Notifications",
    noNotifications: "No notifications",
    newOffer: "New trade offer",
    offerAccepted: "Your offer was accepted!",
    offerRejected: "Your offer was rejected",
    newMessage: "New message",
    tradeCompleted: "Trade completed",
    saleCompleted: "Sale completed",

    // Ratings & Reviews
    ratings: "Ratings",
    leaveReview: "Leave Review",
    yourReview: "Your Review",
    submitReview: "Submit Review",
    averageRating: "Average Rating",
    reviews: "Reviews",
    noReviews: "No reviews yet",
    reviewPlaceholder: "Share your experience with this trader...",
    starRating: "Star Rating",

    // Profile
    myProfile: "My Profile",
    tradeStats: "Trade Stats",
    totalListings: "Total Listings",
    successfulTrades: "Successful Trades",
    memberSince: "Member Since",
    editProfile: "Edit Profile",
    saveProfile: "Save Profile",
    bio: "Bio",
    bioPlaceholder: "Tell others about yourself...",
    rating: "Rating"
  },
  yo: {
    // Yoruba translations (extended)
    appName: "BarterBite",
    listForTrade: "Fi Sile fun Iswapohun",
    listForSale: "Fi Sile fun Tita",
    price: "Iye owo",
    pricePlaceholder: "Tẹ iye owo ni Naira",
    currency: "₦",
    buyNow: "Ra Bayi",
    contactSeller: "Kan si Olutaja",
    // ... other translations
  },
  ig: {
    // Igbo translations (extended)
    appName: "BarterBite",
    listForTrade: "Depụta maka Ịzụ Ahịa",
    listForSale: "Depụta maka Ire",
    price: "Ọnụ ahịa",
    pricePlaceholder: "Tinye ọnụ ahịa na Naira",
    currency: "₦",
    buyNow: "Zụta Ugbu a",
    contactSeller: "Kpọtụrụ Onye na-ere",
    // ... other translations
  },
  ha: {
    // Hausa translations (extended)
    appName: "BarterBite",
    listForTrade: "Lissafa don Ciniki",
    listForSale: "Lissafa don Sayarwa",
    price: "Farashin",
    pricePlaceholder: "Shigar da farashi a Naira",
    currency: "₦",
    buyNow: "Saya Yanzu",
    contactSeller: "Tuntuɓi Mai Sayarwa",
    // ... other translations
  }
};

// Language Context
const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [userLocation, setUserLocation] = useState({ state: '', city: '' });

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    if (['yo', 'ig', 'ha'].includes(browserLang)) {
      setLanguage(browserLang);
    }
  }, []);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, userLocation, setUserLocation }}>
      {children}
    </LanguageContext.Provider>
  );
};

const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Context for Firebase and User Data
const FirebaseContext = createContext(null);

// --- UTILITY COMPONENTS ---

// Star Rating Component
const StarRating = ({ rating, onRatingChange, readonly = false, size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange(star)}
          disabled={readonly}
          className={`${sizeClasses[size]} ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } transition-transform`}
        >
          <svg
            className={`${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } fill-current`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

// Notification Bell Component
const NotificationBell = () => {
  const { t } = useLanguage();
  const { user, usingDemoMode } = useContext(FirebaseContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || usingDemoMode) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user, usingDemoMode]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold">{t('notifications')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-green-600 hover:text-green-700"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center p-4">{t('noNotifications')}</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {notification.timestamp?.toDate?.().toLocaleDateString() || 'Recently'}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// User Profile Component
const UserProfile = ({ userId, onClose }) => {
  const { t } = useLanguage();
  const { db, user: currentUser } = useContext(FirebaseContext);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (!userId) return;

    // Fetch user profile
    const userDocRef = doc(db, 'users', userId);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setProfile(doc.data());
        setEditData(doc.data());
      }
    });

    // Fetch user reviews
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('targetUserId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    });

    // Fetch user listings
    const listingsQuery = query(
      collection(db, `artifacts/${appId}/public/data/listings`),
      where('userId', '==', userId)
    );

    const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
      const listingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserListings(listingsData);
    });

    return () => {
      unsubscribeUser();
      unsubscribeReviews();
      unsubscribeListings();
    };
  }, [userId, db]);

  const saveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...editData,
        updatedAt: serverTimestamp()
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  if (!profile) return <div>Loading profile...</div>;

  const isOwnProfile = currentUser?.uid === userId;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          {profile.photoURL ? (
            <img 
              src={profile.photoURL} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {profile.displayName?.[0] || profile.email?.[0] || 'U'}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{profile.displayName || 'User'}</h2>
            <p className="text-gray-600">{profile.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <StarRating rating={averageRating} readonly size="sm" />
              <span className="text-sm text-gray-600">
                ({reviews.length} {t('reviews')})
              </span>
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            {editing ? t('cancel') : t('editProfile')}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('bio')}</label>
            <textarea
              value={editData.bio || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
              rows="3"
              placeholder={t('bioPlaceholder')}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('phoneNumber')}</label>
            <input
              type="tel"
              value={editData.phoneNumber || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            />
          </div>
          <button
            onClick={saveProfile}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            {t('saveProfile')}
          </button>
        </div>
      ) : (
        profile.bio && (
          <div className="mb-6">
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )
      )}

      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{userListings.length}</p>
          <p className="text-sm text-gray-600">{t('totalListings')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">
            {userListings.filter(l => l.status === 'Traded' || l.status === 'Sold').length}
          </p>
          <p className="text-sm text-gray-600">{t('successfulTrades')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{averageRating.toFixed(1)}</p>
          <p className="text-sm text-gray-600">{t('averageRating')}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4">{t('reviews')}</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t('noReviews')}</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{review.reviewerName}</p>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {review.timestamp?.toDate?.().toLocaleDateString() || 'Recently'}
                  </p>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Review Modal Component
const ReviewModal = ({ isOpen, onClose, targetUserId, targetUserName, onReviewSubmitted }) => {
  const { t } = useLanguage();
  const { db, user } = useContext(FirebaseContext);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    if (!rating || !comment.trim()) {
      alert("Please provide both a rating and comment");
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        targetUserId,
        targetUserName,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email,
        rating,
        comment: comment.trim(),
        timestamp: serverTimestamp()
      });

      // Update user's average rating
      const userDocRef = doc(db, 'users', targetUserId);
      await updateDoc(userDocRef, {
        totalRatings: increment(1),
        ratingSum: increment(rating)
      });

      setRating(0);
      setComment('');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">{t('leaveReview')} - {targetUserName}</h3>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('starRating')}</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('yourReview')}</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              placeholder={t('reviewPlaceholder')}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={submitReview}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            {t('submitReview')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Listing Form with Trade/Sale Options
const CreateListing = () => {
  const { db, user, usingDemoMode } = useContext(FirebaseContext);
  const { t, userLocation } = useLanguage();
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: t('produce'),
    listingType: 'trade', // 'trade' or 'sale'
    price: '',
    imageUrl: null
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState(false);

  const categories = [
    t('produce'), t('bakedGoods'), t('pantryItems'), t('homeMeals'), t('other'),
    t('nigerianStaples'), t('soupsStews'), t('traditionalDishes'), t('streetFoods'), t('freshProduce')
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.itemName.trim() || !formData.description.trim()) {
      setFormError("Item name and description are required.");
      return;
    }

    if (formData.listingType === 'sale' && (!formData.price || parseFloat(formData.price) <= 0)) {
      setFormError("Please enter a valid price for sale items.");
      return;
    }

    if (usingDemoMode) {
      setIsModalOpen(true);
      setFormData({
        itemName: '',
        description: '',
        category: t('produce'),
        listingType: 'trade',
        price: '',
        imageUrl: null
      });
      return;
    }
    
    if (!user || !db) {
      setFormError("Authentication is not ready. Please wait.");
      return;
    }

    setUploading(true);
    try {
      const listingData = {
        userId: user.uid,
        itemName: formData.itemName.trim(),
        description: formData.description.trim(),
        category: formData.category,
        listingType: formData.listingType,
        status: t('available'),
        imageUrl: formData.imageUrl,
        location: userLocation,
        timestamp: serverTimestamp(),
      };

      if (formData.listingType === 'sale') {
        listingData.price = parseFloat(formData.price);
        listingData.currency = 'NGN';
      }

      const collectionPath = `artifacts/${appId}/public/data/listings`;
      await addDoc(collection(db, collectionPath), listingData);
      
      setFormData({
        itemName: '',
        description: '',
        category: t('produce'),
        listingType: 'trade',
        price: '',
        imageUrl: null
      });
      setIsModalOpen(true);
      
    } catch (error) {
      console.error("Error creating listing:", error);
      setFormError("Failed to create listing. Check console.");
    }
    setUploading(false);
  };

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('listItem')}</h2>
      {usingDemoMode && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            {t('demoModeNotice')}
          </p>
        </div>
      )}
      
      <LocationSelector />
      
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {/* Listing Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('listingType')}</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="listingType"
                value="trade"
                checked={formData.listingType === 'trade'}
                onChange={(e) => handleChange('listingType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{t('listForTrade')}</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="listingType"
                value="sale"
                checked={formData.listingType === 'sale'}
                onChange={(e) => handleChange('listingType', e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{t('listForSale')}</span>
            </label>
          </div>
        </div>

        {/* Price Field for Sale Items */}
        {formData.listingType === 'sale' && (
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">{t('price')}</label>
            <div className="mt-1 relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">{t('currency')}</span>
              </div>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500"
                placeholder={t('pricePlaceholder')}
                required
              />
            </div>
          </div>
        )}

        <ImageUpload 
          onImageUpload={handleImageUpload}
          existingImageUrl={formData.imageUrl}
        />

        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">{t('itemName')}</label>
          <input
            id="itemName"
            type="text"
            value={formData.itemName}
            onChange={(e) => handleChange('itemName', e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            placeholder={t('itemNamePlaceholder')}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('description')}</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows="3"
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-2 border"
            placeholder={t('descriptionPlaceholder')}
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">{t('category')}</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
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
          disabled={uploading || !user}
          className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition duration-150"
        >
          {uploading ? t('connecting') : (usingDemoMode ? t('createDemoListing') : t('submitListing'))}
        </button>
      </form>

      <Modal 
        isOpen={isModalOpen} 
        title={t('listingCreated')} 
        onClose={() => setIsModalOpen(false)}
        footer={
          <button 
            onClick={() => setIsModalOpen(false)}
            className="py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {t('gotIt')}
          </button>
        }
      >
        <p>{t('yourItem')} <strong>{formData.itemName}</strong> {t('hasBeenListed')}</p>
        {formData.listingType === 'sale' && (
          <p className="text-green-600 font-semibold mt-2">
            Price: {t('currency')}{formData.price}
          </p>
        )}
        {usingDemoMode && (
          <p className="text-sm text-gray-600 mt-2">{t('demoSimulation')}</p>
        )}
      </Modal>
    </div>
  );
};

// Enhanced Listing Card with Sale/Trade Options
const ListingCard = ({ listing }) => {
  const { user, usingDemoMode } = useContext(FirebaseContext);
  const { t } = useLanguage();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const isOwner = user && user.uid === listing.userId;

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleOfferSent = () => {
    console.log("Offer sent successfully");
  };

  const handleContactSeller = () => {
    // This would open a chat with the seller
    console.log("Contact seller:", listing.userId);
  };

  const handleBuyNow = () => {
    // This would initiate a purchase process
    console.log("Buy now:", listing.id);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
        {listing.imageUrl && (
          <div className="h-48 overflow-hidden">
            <img 
              src={listing.imageUrl} 
              alt={listing.itemName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                listing.listingType === 'sale' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
              }`}>
                {listing.listingType === 'sale' ? t('sale') : t('trade')}
              </span>
              <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                {listing.category}
              </span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              listing.status === 'Available' ? 'bg-green-100 text-green-800' :
              listing.status === 'Sold' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {listing.status}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.itemName}</h3>
          <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
          
          {listing.listingType === 'sale' && listing.price && (
            <p className="text-lg font-bold text-green-600 mb-2">
              {t('currency')}{listing.price}
            </p>
          )}
          
          {listing.location && listing.location.city && (
            <p className="text-sm text-gray-500 mb-2">
              📍 {listing.location.city}, {listing.location.state}
            </p>
          )}
          
          <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 space-y-1">
            <p>{t('posted')}: {formatDate(listing.timestamp)}</p>
            <button 
              onClick={() => setShowProfile(listing.userId)}
              className="break-all font-mono hover:text-green-600 transition-colors"
            >
              {t('traderID')}: {listing.userId?.substring(0, 10)}... ({isOwner ? t('you') : t('other')})
            </button>
            {usingDemoMode && (
              <p className="text-orange-600 font-semibold">{t('demoListing')}</p>
            )}
          </div>
        </div>
        
        <div className={`p-4 ${isOwner ? 'bg-green-50' : 'bg-gray-50'} border-t border-gray-200`}>
          {isOwner ? (
            <button className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-gray-400 cursor-not-allowed">
              {t('manageListing')}
            </button>
          ) : listing.listingType === 'trade' ? (
            <button 
              onClick={() => setShowOfferModal(true)}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition duration-150 shadow-md"
            >
              {t('offerTrade')}
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleBuyNow}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition duration-150 shadow-md"
              >
                {t('buyNow')}
              </button>
              <button 
                onClick={handleContactSeller}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150 shadow-md"
              >
                {t('contactSeller')}
              </button>
            </div>
          )}
        </div>
      </div>

      <TradeOfferModal
        isOpen={showOf
