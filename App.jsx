import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, ShieldCheck, Clock, ShoppingCart, Search, Plus, MessageCircle, 
  CheckCircle, Star, Camera, Calendar, Tag, CreditCard, Send, User, Home, 
  Users, Settings, Menu, X, ThumbsUp, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data
const mockListings = [
  {
    id: 1,
    storeName: "Amina's Organic Garden",
    avatar: "https://placehold.co/60x60/4ade80/ffffff?text=A",
    rating: 4.8,
    distance: "0.8 km",
    title: "Fresh Spinach Bundle",
    description: "Harvested this morning, pesticide-free, 500g bundle",
    quantity: "12 bundles",
    expiry: "2025-11-15",
    wants: ["Tomatoes", "Eggs", "Trade Credits"],
    image: "https://placehold.co/300x200/22c55e/ffffff?text=Spinach",
    verified: true
  },
  {
    id: 2,
    storeName: "Chef Tunde's Kitchen",
    avatar: "https://placehold.co/60x60/f59e0b/ffffff?text=T",
    rating: 4.9,
    distance: "1.2 km",
    title: "Jollof Rice (3 servings)",
    description: "Homemade, spicy & aromatic, packed fresh daily",
    quantity: "5 packs",
    expiry: "2025-11-11",
    wants: ["Plantains", "Trade Credits"],
    image: "https://placehold.co/300x200/ea580c/ffffff?text=Jollof",
    verified: true
  },
  {
    id: 3,
    storeName: "Lagos Farm Co-op",
    avatar: "https://placehold.co/60x60/3b82f6/ffffff?text=L",
    rating: 4.6,
    distance: "2.5 km",
    title: "Farm Fresh Eggs",
    description: "Free-range, 12-egg carton, laid within 48h",
    quantity: "8 cartons",
    expiry: "2025-11-20",
    wants: ["Onions", "Peppers", "Trade Credits"],
    image: "https://placehold.co/300x200/60a5fa/ffffff?text=Eggs",
    verified: false
  }
];

const mockChat = [
  { id: 1, sender: 'you', text: "Hi Amina! I'd like to trade 3 tomatoes for 1 spinach bundle?", time: "10:23 AM" },
  { id: 2, sender: 'other', text: "Sure! I have ripe ones. Can you pick up today? I'm open until 5pm.", time: "10:25 AM" },
  { id: 3, sender: 'you', text: "Perfect! I'll be there by 4pm. Should I bring the tomatoes in a bag?", time: "10:26 AM" }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('onboarding');
  const [storeData, setStoreData] = useState({
    name: '',
    description: '',
    location: 'Lagos, Nigeria',
    radius: 3,
    openHours: '8 AM - 6 PM'
  });
  const [selectedListing, setSelectedListing] = useState(null);
  const [chatMessages, setChatMessages] = useState(mockChat);
  const [newMessage, setNewMessage] = useState('');
  const [tradeConfirmed, setTradeConfirmed] = useState(false);

  // Screen navigation
  const navigate = (screen) => setCurrentScreen(screen);

  // Simulate trade flow
  const handleProposeTrade = () => {
    navigate('chat');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        sender: 'you',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  const confirmTrade = () => {
    setTradeConfirmed(true);
    setTimeout(() => {
      navigate('confirmation');
    }, 1500);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen navigate={navigate} />;
      case 'storeSetup':
        return <StoreSetupScreen 
          storeData={storeData} 
          setStoreData={setStoreData} 
          navigate={navigate} 
        />;
      case 'store':
        return <StoreScreen navigate={navigate} />;
      case 'listing':
        return <ListingScreen navigate={navigate} />;
      case 'search':
        return <SearchScreen 
          listings={mockListings} 
          onSelect={setSelectedListing}
          navigate={navigate}
        />;
      case 'listingDetail':
        return <ListingDetailScreen 
          listing={selectedListing} 
          navigate={navigate}
          onPropose={handleProposeTrade}
        />;
      case 'chat':
        return <ChatScreen 
          listing={selectedListing}
          messages={chatMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSend={handleSendMessage}
          onConfirm={confirmTrade}
          tradeConfirmed={tradeConfirmed}
        />;
      case 'confirmation':
        return <ConfirmationScreen navigate={navigate} />;
      default:
        return <OnboardingScreen navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Top navigation bar */}
      <AnimatePresence>
        {currentScreen !== 'onboarding' && (
          <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <button 
                onClick={() => navigate('search')}
                className="flex items-center space-x-2"
              >
                <Home className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-600">BarterBite</span>
              </button>
              <div className="flex space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`pt-16 ${currentScreen === 'onboarding' ? 'pt-0' : ''}`}>
        {renderScreen()}
      </div>

      {/* Bottom navigation (mobile) */}
      <AnimatePresence>
        {currentScreen !== 'onboarding' && currentScreen !== 'chat' && currentScreen !== 'confirmation' && (
          <motion.nav 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 px-4"
          >
            <button 
              onClick={() => navigate('search')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg ${currentScreen === 'search' ? 'bg-green-100 text-green-600' : 'text-gray-600'}`}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs mt-1">Search</span>
            </button>
            <button 
              onClick={() => navigate('store')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg ${currentScreen === 'store' ? 'bg-green-100 text-green-600' : 'text-gray-600'}`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs mt-1">Store</span>
            </button>
            <button 
              onClick={() => navigate('listing')}
              className="flex flex-col items-center px-3 py-2 rounded-lg bg-green-600 text-white"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs mt-1">Add</span>
            </button>
            <button 
              onClick={() => navigate('chat')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg ${currentScreen === 'chat' ? 'bg-green-100 text-green-600' : 'text-gray-600'}`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs mt-1">Offers</span>
            </button>
            <button 
              onClick={() => navigate('storeSetup')}
              className={`flex flex-col items-center px-3 py-2 rounded-lg ${currentScreen === 'storeSetup' ? 'bg-green-100 text-green-600' : 'text-gray-600'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs mt-1">Account</span>
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}

// Onboarding Screen
const OnboardingScreen = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LeafIcon className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">BarterBite</h1>
        <p className="text-gray-600 mb-6">
          Swap fresh food with your neighbours. No cash required.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex items-start mb-4">
          <div className="bg-green-100 p-2 rounded-lg mr-3 mt-1">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">1. Sign up</h3>
            <p className="text-gray-600 text-sm">Phone or email verification</p>
          </div>
        </div>
        
        <div className="flex items-start mb-4">
          <div className="bg-green-100 p-2 rounded-lg mr-3 mt-1">
            <Home className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">2. Create your store</h3>
            <p className="text-gray-600 text-sm">Add photos, location, and opening hours</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="bg-green-100 p-2 rounded-lg mr-3 mt-1">
            <ShoppingCart className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">3. List items</h3>
            <p className="text-gray-600 text-sm">Specify what you have and what you want in return</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-amber-700 text-sm">
            <span className="font-medium">Safety first:</span> Meet in public, check expiry dates, and rate trades.
          </p>
        </div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('storeSetup')}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors"
      >
        Get Started →
      </motion.button>
      
      <p className="text-gray-500 text-center text-sm mt-4">
        Already have an account? <button className="text-green-600 font-medium">Sign in</button>
      </p>
    </div>
  </div>
);

// Store Setup Screen
const StoreSetupScreen = ({ storeData, setStoreData, navigate }) => (
  <div className="max-w-md mx-auto p-4">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Your Store</h1>
      <p className="text-gray-600">Set up your mini-store profile</p>
    </div>

    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
        <input
          type="text"
          value={storeData.name}
          onChange={(e) => setStoreData({...storeData, name: e.target.value})}
          placeholder="e.g., Amina's Organic Garden"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={storeData.description}
          onChange={(e) => setStoreData({...storeData, description: e.target.value})}
          placeholder="Tell others about your food and story..."
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={storeData.location}
            onChange={(e) => setStoreData({...storeData, location: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (km)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={storeData.radius}
          onChange={(e) => setStoreData({...storeData, radius: parseInt(e.target.value)})}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 km</span>
          <span>{storeData.radius} km</span>
          <span>10 km</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
        <div className="relative">
          <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={storeData.openHours}
            onChange={(e) => setStoreData({...storeData, openHours: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 8 AM - 6 PM"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start">
          <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">Verification</h3>
            <p className="text-blue-700 text-sm mt-1">
              Verified stores get more visibility and trust. We'll verify your phone number and optional ID.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('search')}
        disabled={!storeData.name}
        className={`w-full py-4 rounded-xl font-semibold text-lg ${
          storeData.name 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } transition-colors`}
      >
        Continue to Marketplace
      </button>
    </div>
  </div>
);

// Store Screen (Mini-Store Home)
const StoreScreen = ({ navigate }) => (
  <div className="max-w-md mx-auto p-4">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">My Store</h1>
    </div>

    {/* Store Header */}
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="h-32 bg-gradient-to-r from-green-500 to-emerald-600"></div>
      <div className="px-4 pb-4 -mt-12">
        <div className="flex items-end">
          <div className="bg-white p-1 rounded-full mr-3">
            <img 
              src="https://placehold.co/80x80/4ade80/ffffff?text=A" 
              alt="Store" 
              className="w-20 h-20 rounded-full border-4 border-white"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-800">Amina's Organic Garden</h2>
              <ShieldCheck className="w-5 h-5 text-green-600 ml-2" />
            </div>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">4.8 (24 reviews)</span>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-gray-700 mb-2">Growing organic vegetables in Surulere, Lagos</p>
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          <span>Within 3 km</span>
          <span className="mx-2">•</span>
          <Clock className="w-4 h-4 mr-1" />
          <span>8 AM - 6 PM</span>
        </div>
      </div>
    </div>

    {/* Store Stats */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
        <div className="text-2xl font-bold text-green-600">12</div>
        <div className="text-xs text-gray-600">Listings</div>
      </div>
      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
        <div className="text-2xl font-bold text-green-600">8</div>
        <div className="text-xs text-gray-600">Active Trades</div>
      </div>
      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
        <div className="text-2xl font-bold text-green-600">42</div>
        <div className="text-xs text-gray-600">Completed</div>
      </div>
    </div>

    {/* Listings */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">My Listings</h2>
        <button 
          onClick={() => navigate('listing')}
          className="text-green-600 font-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </button>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex">
              <div className="w-16 h-16 bg-gray-200 rounded-lg mr-3 flex-shrink-0">
                <img 
                  src="https://placehold.co/64x64/22c55e/ffffff?text=S" 
                  alt="Spinach" 
                  className="w-full h-full rounded-lg object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">Fresh Spinach Bundle</h3>
                <p className="text-sm text-gray-600 mt-1">500g • 12 bundles available</p>
                <div className="flex items-center mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Wants: Tomatoes</span>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end pl-2">
                <span className="text-xs text-gray-500">Expires Nov 15</span>
                <div className="flex space-x-2">
                  <button className="p-1.5 rounded-full hover:bg-gray-100">
                    <ThumbsUp className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Premium Upgrade */}
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
      <h3 className="font-bold text-amber-800 mb-2">🌟 Premium Store</h3>
      <p className="text-amber-700 text-sm mb-3">
        Get featured in search, advanced analytics, and priority support for ₦500/month.
      </p>
      <button className="w-full bg-amber-500 text-white py-2 rounded-lg text-sm font-medium">
        Upgrade Now
      </button>
    </div>
  </div>
);

// Listing Creation Screen
const ListingScreen = ({ navigate }) => (
  <div className="max-w-md mx-auto p-4">
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Add New Listing</h1>
      <p className="text-gray-600">What food item do you want to trade?</p>
    </div>

    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
        <input
          type="text"
          placeholder="e.g., Fresh Spinach Bundle"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          placeholder="Details about your item (freshness, origin, etc.)"
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photos</label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">Tap to add photos</p>
          <p className="text-gray-500 text-xs mt-1">Recommended: 1-3 clear photos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
          <input
            type="number"
            placeholder="12"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
          <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option>Bundles</option>
            <option>Packs</option>
            <option>Kilograms</option>
            <option>Cartons</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Best Before *</label>
        <div className="relative">
          <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
          <input
            type="date"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <div className="grid grid-cols-3 gap-2">
          {['Produce', 'Staples', 'Prepared'].map((cat) => (
            <button
              key={cat}
              className="py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What do you want in return? *</label>
        <div className="space-y-3">
          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="item1" 
              className="mt-1 mr-2 h-4 w-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="item1" className="text-gray-700">
              <span className="font-medium">Direct item trade</span>
              <p className="text-gray-600 text-sm mt-1">Specify items you want</p>
            </label>
          </div>
          
          <div className="pl-6">
            <input
              type="text"
              placeholder="e.g., Tomatoes, Eggs"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="credits" 
              className="mt-1 mr-2 h-4 w-4 text-green-600 rounded focus:ring-green-500"
            />
            <label htmlFor="credits" className="text-gray-700">
              <span className="font-medium">Accept Trade Credits</span>
              <div className="flex items-center mt-1">
                <CreditCard className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 text-sm">BarterBite Credits</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('search')}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
      >
        Publish Listing
      </button>
    </div>
  </div>
);

// Search Screen
const SearchScreen = ({ listings, onSelect, navigate }) => (
  <div className="max-w-md mx-auto p-4">
    <div className="mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search for tomatoes, eggs, jollof..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="mb-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {['All', 'Produce', 'Staples', 'Prepared', 'Nearby'].map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === 'All' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>

    <div className="mb-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Available Items</h2>
      
      <div className="space-y-3">
        {listings.map((listing) => (
          <motion.div
            key={listing.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="bg-white rounded-xl overflow-hidden shadow-sm"
            onClick={() => {
              onSelect(listing);
              navigate('listingDetail');
            }}
          >
            <div className="relative">
              <img 
                src={listing.image} 
                alt={listing.title} 
                className="w-full h-32 object-cover"
              />
              {listing.verified && (
                <div className="absolute top-2 right-2 bg-green-600 text-white p-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{listing.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{listing.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{listing.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">{listing.distance}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <div>
                  <span className="text-sm font-medium text-green-600">{listing.quantity}</span>
                  <span className="text-xs text-gray-500 ml-2">Expires {new Date(listing.expiry).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-600">{listing.storeName.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

// Listing Detail Screen
const ListingDetailScreen = ({ listing, navigate, onPropose }) => {
  if (!listing) return null;

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="w-full h-64 object-cover rounded-xl"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{listing.title}</h1>
            <div className="flex items-center mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 ml-1">{listing.rating} • {listing.distance}</span>
            </div>
          </div>
          {listing.verified && <ShieldCheck className="w-5 h-5 text-green-600" />}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700">{listing.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-500">Quantity</span>
          <p className="font-medium text-gray-800">{listing.quantity}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <span className="text-xs text-gray-500">Expires</span>
          <p className="font-medium text-gray-800">
            {new Date(listing.expiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Wants in Return</h3>
        <div className="flex flex-wrap gap-2">
          {listing.wants.map((want, index) => (
            <span 
              key={index} 
              className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm"
            >
              {want}
            </span>
          ))}
        </div>
      </div>

      {/* Store Info */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center mb-3">
          <img 
            src={listing.avatar} 
            alt="Store" 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{listing.storeName}</h3>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-600">{listing.distance}</span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium">
            View Store
          </button>
          <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </button>
        </div>
      </div>

      <button
        onClick={onPropose}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center hover:bg-green-700 transition-colors"
      >
        <Send className="w-5 h-5 mr-2" />
        Propose Trade
      </button>
    </div>
  );
};

// Chat Screen
const ChatScreen = ({ listing, messages, newMessage, setNewMessage, onSend, onConfirm, tradeConfirmed }) => {
  const textareaRef = React.useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newMessage]);

  if (!listing) return null;

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Chat Header */}
      <div className="bg-white rounded-t-2xl shadow-sm p-4 mb-4 flex items-center">
        <button 
          onClick={() => window.history.back()}
          className="p-1 mr-3 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
        <img 
          src={listing.avatar} 
          alt="Store" 
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <h2 className="font-semibold text-gray-800">{listing.storeName}</h2>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
            <span className="text-sm text-green-600">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-b-2xl shadow-sm flex-1 mb-4 max-h-[60vh] overflow-y-auto">
        <div className="p-4 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === 'you' 
                    ? 'bg-green-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'you' ? 'text-green-200' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          
          {tradeConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-4"
            >
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800">Trade Confirmed!</h3>
                  <p className="text-green-700 text-sm mt-1">
                    You've agreed to trade 3 tomatoes for 1 spinach bundle. 
                    Both parties will receive notifications when the trade is completed.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trade Proposal */}
      {!tradeConfirmed && (
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Your Trade Proposal</h3>
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex items-center mb-2">
              <img 
                src="https://placehold.co/40x40/f59e0b/ffffff?text=T" 
                alt="Tomatoes" 
                className="w-8 h-8 rounded mr-2"
              />
              <span className="font-medium text-gray-800">3 Tomatoes</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 text-sm">→</span>
              <img 
                src="https://placehold.co/40x40/22c55e/ffffff?text=S" 
                alt="Spinach" 
                className="w-8 h-8 rounded mx-2"
              />
              <span className="font-medium text-gray-800">1 Spinach Bundle</span>
            </div>
          </div>
          <button
            onClick={onConfirm}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium flex items-center justify-center"
          >
            Confirm Trade
          </button>
        </div>
      )}

      {/* Message Input */}
      {!tradeConfirmed && (
        <div className="bg-white rounded-xl p-2 shadow-sm">
          <div className="flex items-end">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border-0 focus:ring-0 focus:outline-none resize-none max-h-24 py-2 px-3"
              rows="1"
            />
            <button
              onClick={onSend}
              disabled={!newMessage.trim()}
              className={`p-2 rounded-full ml-2 ${
                newMessage.trim() 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Confirmation Screen
const ConfirmationScreen = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 p-4">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
    >
      <CheckCircle className="w-16 h-16 text-green-600" />
    </motion.div>
    
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-2xl font-bold text-gray-800 text-center mb-2"
    >
      Trade Confirmed!
    </motion.h1>
    
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-gray-600 text-center mb-6 max-w-md"
    >
      Your trade has been recorded. You'll both receive notifications when the exchange is complete. 
      Remember to meet in a public place and check expiry dates.
    </motion.p>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mb-6"
    >
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <ShoppingCart className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-800">Trade Summary</h3>
          <p className="text-sm text-gray-600">Nov 10, 2025 • 4:00 PM</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">From You</span>
          <span className="font-medium">3 Tomatoes</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-700">From Amina</span>
          <span className="font-medium">1 Spinach Bundle</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-green-700">Platform Fee</span>
          <span className="font-medium text-green-700">₦20 BarterBite Credits</span>
        </div>
      </div>
    </motion.div>
    
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('search')}
      className="w-full max-w-md bg-green-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition-colors"
    >
      Back to Marketplace
    </motion.button>
  </div>
);

// Custom Leaf Icon
const LeafIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6.1"/>
  </svg>
);
