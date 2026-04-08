// frontend/src/pages/public/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, Clock, Mail, Bell, User, ShoppingBag, Star, 
  Trash2, ChevronRight, MapPin, Phone, MessageCircle,
  Settings, History, Bookmark, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active 
        ? 'bg-navy-800 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={16} />
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
        active ? 'bg-gold-400 text-navy-900' : 'bg-slate-200 text-slate-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const FavoriteCard = ({ listing, onRemove }) => (
  <div className="flex gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all">
    <div className="w-20 h-20 rounded-lg bg-navy-100 overflow-hidden shrink-0">
      {listing.logoUrl ? (
        <img src={listing.logoUrl} alt={listing.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-navy-600 font-bold text-xl">
          {listing.title?.[0]}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <Link to={`/listings/${listing.slug}`} className="font-semibold text-navy-900 hover:text-gold-600 transition-colors">
        {listing.title}
      </Link>
      {listing.city && (
        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
          <MapPin size={10} /> {listing.city}, {listing.state}
        </p>
      )}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={() => onRemove(listing.id)}
          className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
        >
          <Trash2 size={12} /> Remove
        </button>
        <Link to={`/listings/${listing.slug}`} className="text-xs text-gold-600 hover:text-gold-700">
          View Details →
        </Link>
      </div>
    </div>
  </div>
);

const EnquiryCard = ({ enquiry }) => (
  <div className="p-4 bg-white rounded-xl border border-slate-100">
    <div className="flex items-start justify-between">
      <div>
        <Link to={`/listings/${enquiry.listing?.slug}`} className="font-semibold text-navy-900 hover:text-gold-600">
          {enquiry.listing?.title}
        </Link>
        <p className="text-xs text-slate-500 mt-0.5">
          Sent on {new Date(enquiry.createdAt).toLocaleDateString('en-AU')}
        </p>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        enquiry.status === 'replied' 
          ? 'bg-green-100 text-green-700' 
          : enquiry.status === 'read'
          ? 'bg-blue-100 text-blue-700'
          : 'bg-amber-100 text-amber-700'
      }`}>
        {enquiry.status === 'replied' ? 'Replied' : enquiry.status === 'read' ? 'Read' : 'New'}
      </span>
    </div>
    {enquiry.subject && <p className="text-sm font-medium text-navy-800 mt-2">{enquiry.subject}</p>}
    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{enquiry.message}</p>
    {enquiry.replyMessage && (
      <div className="mt-3 p-3 bg-navy-50 rounded-lg">
        <p className="text-xs font-medium text-navy-700 mb-1">Business Reply:</p>
        <p className="text-sm text-slate-600">{enquiry.replyMessage}</p>
      </div>
    )}
  </div>
);

const SearchHistoryItem = ({ search, onClear }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
    <div className="flex items-center gap-3">
      <History size={16} className="text-slate-400" />
      <div>
        <p className="text-sm font-medium text-navy-800">{search.query}</p>
        <p className="text-xs text-slate-400">{new Date(search.searchedAt).toLocaleString()}</p>
      </div>
    </div>
    <button onClick={() => onClear(search.id)} className="text-slate-400 hover:text-red-500">
      <Trash2 size={14} />
    </button>
  </div>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnquiries: true,
    emailReviews: true,
    emailNewsletter: false,
    emailPromotions: false,
    pushEnquiries: true,
    pushReviews: true
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchFavorites();
    fetchEnquiries();
    fetchSearchHistory();
    fetchNotificationSettings();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/user/favorites');
      setFavorites(res.data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/user/enquiries');
      setEnquiries(res.data);
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const res = await api.get('/user/search-history');
      setSearchHistory(res.data);
    } catch (err) {
      console.error('Error fetching search history:', err);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const res = await api.get('/user/notification-settings');
      setNotificationSettings(res.data);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (listingId) => {
    try {
      await api.delete(`/user/favorites/${listingId}`);
      setFavorites(favorites.filter(f => f.listingId !== listingId));
      toast.success('Removed from favorites');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleClearSearchHistory = async (searchId = null) => {
    try {
      if (searchId) {
        // Delete single item - need endpoint
        setSearchHistory(searchHistory.filter(s => s.id !== searchId));
      } else {
        await api.delete('/user/search-history');
        setSearchHistory([]);
        toast.success('Search history cleared');
      }
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const handleUpdateNotificationSettings = async (key, value) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettings(updated);
    try {
      await api.put('/user/notification-settings', updated);
      toast.success('Settings updated');
    } catch (err) {
      toast.error('Failed to update settings');
    }
  };

  const tabs = [
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favorites.length },
    { id: 'enquiries', label: 'Enquiries', icon: MessageCircle, count: enquiries.filter(e => e.status === 'new').length },
    { id: 'search', label: 'Search History', icon: History, count: searchHistory.length },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-navy-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-2xl font-bold text-white">My Account</h1>
          <p className="text-white/60 text-sm mt-1">Manage your favorites, enquiries, and settings</p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-100 p-4 sticky top-20">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                  <User size={20} className="text-navy-600" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                {tabs.map(tab => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    icon={tab.icon}
                    label={tab.label}
                    count={tab.count}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Heart size={20} className="text-red-500" /> Saved Businesses
                </h2>
                {favorites.length > 0 ? (
                  <div className="space-y-3">
                    {favorites.map(fav => (
                      <FavoriteCard 
                        key={fav.id} 
                        listing={fav.listing} 
                        onRemove={handleRemoveFavorite} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No saved businesses yet</p>
                    <Link to="/listings" className="btn-primary text-sm mt-4 inline-block">
                      Browse Businesses
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Enquiries Tab */}
            {activeTab === 'enquiries' && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} /> My Enquiries
                </h2>
                {enquiries.length > 0 ? (
                  <div className="space-y-3">
                    {enquiries.map(enquiry => (
                      <EnquiryCard key={enquiry.id} enquiry={enquiry} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No enquiries sent yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Search History Tab */}
            {activeTab === 'search' && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold text-navy-900 flex items-center gap-2">
                    <History size={20} /> Search History
                  </h2>
                  {searchHistory.length > 0 && (
                    <button 
                      onClick={() => handleClearSearchHistory()}
                      className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Clear All
                    </button>
                  )}
                </div>
                {searchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {searchHistory.map(search => (
                      <SearchHistoryItem 
                        key={search.id} 
                        search={search} 
                        onClear={handleClearSearchHistory} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No search history yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Notification Settings Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Bell size={20} /> Notification Preferences
                </h2>
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="font-semibold text-navy-800 mb-3">Email Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-600">Enquiry replies</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailEnquiries}
                          onChange={(e) => handleUpdateNotificationSettings('emailEnquiries', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-600">Review responses</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailReviews}
                          onChange={(e) => handleUpdateNotificationSettings('emailReviews', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-600">Newsletter</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailNewsletter}
                          onChange={(e) => handleUpdateNotificationSettings('emailNewsletter', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-800 mb-3">Push Notifications</h3>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-600">New enquiry responses</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.pushEnquiries}
                          onChange={(e) => handleUpdateNotificationSettings('pushEnquiries', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm text-slate-600">Review updates</span>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.pushReviews}
                          onChange={(e) => handleUpdateNotificationSettings('pushReviews', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && user && (
              <div className="bg-white rounded-xl border border-slate-100 p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <User size={20} /> Profile Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                    <p className="text-navy-900">{user.name}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                    <p className="text-navy-900">{user.email}</p>
                    {user.emailVerified ? (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-xs text-amber-600">Not verified</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                    <p className="text-navy-900">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Member Since</label>
                    <p className="text-navy-900">{new Date(user.createdAt).toLocaleDateString('en-AU')}</p>
                  </div>
                  <Link to="/settings" className="btn-outline text-sm inline-block">
                    Edit Profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}