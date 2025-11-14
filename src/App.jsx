import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  updateDoc,
  increment
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// --------------------------
// Firebase configuration
// --------------------------
const getFirebaseConfig = () => ({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCL3nmvDtX7QO-xqVCVQg3vGVD2weVhgpM",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "barterbite-c735d.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "barterbite-c735d",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "barterbite-c735d.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "77392068948",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:77392068948:web:036761985e672f80f708c1"
});

const firebaseConfig = getFirebaseConfig();
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// --------------------------
// Data: Locations and Translations
// (fixed and validated)
// --------------------------
const nigerianLocations = {
  states: [
    { name: "Lagos", cities: ["Ikeja","Victoria Island","Surulere","Lekki","Yaba","Apapa","Maryland","Gbagada","Ijebu-Lekki","Badagry","Ikorodu","Epe"] },
    { name: "Abuja", cities: ["Garki","Wuse","Maitama","Asokoro","Jabi","Gwarinpa","Kubwa","Lugbe","Nyanya","Karu","City Center"] },
    { name: "Rivers", cities: ["Port Harcourt","Borokiri","Rumuokoro","Trans-Amadi","Ogbunabali","Diobu","Elelenwo","Woji","Rumuola"] },
    { name: "Kano", cities: ["Kano City","Nassarawa","Fagge","Dala","Gwale","Tarauni","Kumbotso","Ungogo","Kano Municipal"] },
    { name: "Oyo", cities: ["Ibadan","Mokola","Bodija","Sango","UI Area","Agodi","Gate","Challenge","Molete","Apata"] },
    { name: "Kaduna", cities: ["Kaduna City","Barnawa","Kawo","Tudun Wada","Malali","U/Rimi","Kaduna South","Sabon Tasha"] },
    { name: "Edo", cities: ["Benin City","GRA","Ugbowo","Siluko","New Benin","Ogida","Ikpoba Hill","Ugbor","Airport Road"] },
    { name: "Delta", cities: ["Warri","Asaba","Ughelli","Sapele","Agbor","Oghara","Burutu","Koko","Ozoro"] },
    { name: "Enugu", cities: ["Enugu City","New Haven","Abakpa","Emene","Uwani","Independence Layout","GRA","Trans-Ekulu"] },
    { name: "Anambra", cities: ["Onitsha","Awka","Nnewi","Ekwulobia","Aguata","Ogidi","Otuocha","Ihiala","Umunya"] },
    { name: "Plateau", cities: ["Jos","Bukuru","Rantya","Anglo-Jos","Jenta","Gangare","Dadinkowa","Sabon Gidan"] },
    { name: "Cross River", cities: ["Calabar","Marian","Etta-Agbor","State Housing","8 Miles","Akai Effa","Ikot Ansa","Atimbo"] },
    { name: "Akwa Ibom", cities: ["Uyo","Eket","Ikot Ekpene","Oron","Abak","Etinan","Ikot Abasi","Ukanafun"] },
    { name: "Ogun", cities: ["Abeokuta","Sagamu","Ijebu-Ode","Ilaro","Ifo","Owode","Ado-Odo","Ota","Mowe"] },
    { name: "Other States", cities: ["Select your city..."] }
  ]
};

const translations = {
  en: {
    // Navigation & Auth
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
    alreadyHaveAccount: "Already have an account?",

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
    appName: "BarterBite",
    listForTrade: "Fi Sile fun Iswapohun",
    listForSale: "Fi Sile fun Tita",
    price: "Iye owo",
    pricePlaceholder: "Tẹ iye owo ni Naira",
    currency: "₦",
    buyNow: "Ra Bayi",
    contactSeller: "Kan si Olutaja"
  },
  ig: {
    appName: "BarterBite",
    listForTrade: "Depụta maka Ịzụ Ahịa",
    listForSale: "Depụta maka Ire",
    price: "Ọnụ ahịa",
    pricePlaceholder: "Tinye ọnụ ahịa na Naira",
    currency: "₦",
    buyNow: "Zụta Ugbu a",
    contactSeller: "Kpọtụrụ Onye na-ere"
  },
  ha: {
    appName: "BarterBite",
    listForTrade: "Lissafa don Ciniki",
    listForSale: "Lissafa don Sayarwa",
    price: "Farashin",
    pricePlaceholder: "Shigar da farashi a Naira",
    currency: "₦",
    buyNow: "Saya Yanzu",
    contactSeller: "Tuntuɓi Mai Sayarwa"
  }
};

// --------------------------
// Language Context
// --------------------------
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [userLocation, setUserLocation] = useState({ state: '', city: '' });

  useEffect(() => {
    try {
      const browserLang = navigator.language?.split('-')[0];
      if (['yo', 'ig', 'ha'].includes(browserLang)) setLanguage(browserLang);
    } catch (e) {
      // ignore
    }
  }, []);

  const t = (key) => translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, userLocation, setUserLocation }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

// --------------------------
// Firebase Context (lightweight)
// --------------------------
const FirebaseContext = createContext(null);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usingDemoMode, setUsingDemoMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // lightweight helpers can be expanded and moved to firebase.js
  const signInAnonymous = async () => {
    try {
      await signInAnonymously(auth);
    } catch (e) {
      console.error(e);
    }
  };

  const signUserOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <FirebaseContext.Provider value={{ db, storage, auth, user, usingDemoMode, signInAnonymous, signUserOut }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) throw new Error('useFirebase must be used within FirebaseProvider');
  return ctx;
};

// --------------------------
// Minimal utility components (cleaned)
// Placeholders below should be split into components/ later
// --------------------------
const StarRating = ({ rating = 0, onRatingChange = () => {}, readonly = false, size = 'md' }) => {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  return (
    <div className="flex">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onClick={() => !readonly && onRatingChange(s)} disabled={readonly} className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}>
          <svg className={`${s <= rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const Placeholder = ({ children }) => (
  <div className="p-6 bg-white rounded-xl shadow-lg mb-8 border border-gray-100">{children}</div>
);

// --------------------------
// App (cleaned, ready to split)
// --------------------------
const App = () => {
  return (
    <LanguageProvider>
      <FirebaseProvider>
        <div className="min-h-screen bg-gray-50 p-6">
          <header className="max-w-4xl mx-auto mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{translations.en.appName}</h1>
            <p className="text-gray-600 mt-2">{translations.en.tradeDescription}</p>
          </header>

          <main className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2">
              <Placeholder>
                <h2 className="text-xl font-semibold mb-2">Marketplace (placeholder)</h2>
                <p className="text-sm text-gray-600">Listing feed and search go here.</p>
              </Placeholder>

              <Placeholder>
                <h2 className="text-xl font-semibold mb-2">Listing Cards</h2>
                <p className="text-sm text-gray-600">Individual listing UI — split into components/ListingCard.jsx</p>
              </Placeholder>
            </section>

            <aside>
              <Placeholder>
                <h3 className="font-semibold mb-2">Create a listing</h3>
                <p className="text-sm text-gray-600">Form UI goes here — split into components/CreateListing.jsx</p>
              </Placeholder>

              <Placeholder>
                <h3 className="font-semibold mb-2">Profile & Notifications</h3>
                <p className="text-sm text-gray-600">Profile, notifications, and quick actions</p>
              </Placeholder>
            </aside>
          </main>

          <footer className="max-w-4xl mx-auto mt-8 text-sm text-gray-500">© {new Date().getFullYear()} BarterBite</footer>
        </div>
      </FirebaseProvider>
    </LanguageProvider>
  );
};

export default App;
