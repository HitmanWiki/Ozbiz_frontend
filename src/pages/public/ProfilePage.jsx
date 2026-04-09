// frontend/src/pages/public/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, Clock, Mail, Bell, User, ShoppingBag, Star, 
  Trash2, ChevronRight, MapPin, Phone, MessageCircle,
  Settings, History, Bookmark, LogOut, CheckCircle, XCircle,
  Shield, QrCode, Copy, Download, FileText, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all w-full ${
      active 
        ? 'bg-navy-800 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    <Icon size={16} />
    {label}
    {count !== undefined && count > 0 && (
      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
        active ? 'bg-amber-400 text-navy-900' : 'bg-slate-200 text-slate-600'
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
      <Link to={`/listings/${listing.slug}`} className="font-semibold text-navy-900 hover:text-amber-600 transition-colors">
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
        <Link to={`/listings/${listing.slug}`} className="text-xs text-amber-600 hover:text-amber-700">
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
        <Link to={`/listings/${enquiry.listing?.slug}`} className="font-semibold text-navy-900 hover:text-amber-600">
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

const SearchHistoryItem = ({ search, onClear, onRerun }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
    <div className="flex items-center gap-3 flex-1">
      <History size={16} className="text-slate-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-navy-800">{search.query}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {search.city && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin size={10} /> {search.city}
            </span>
          )}
          {search.category && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Bookmark size={10} /> {search.category}
            </span>
          )}
          <span className="text-xs text-slate-400">{new Date(search.searchedAt).toLocaleString()}</span>
        </div>
      </div>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => onRerun(search)}
        className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-50"
      >
        Search Again
      </button>
      <button 
        onClick={() => onClear(search.id)} 
        className="text-slate-400 hover:text-red-500 p-1"
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

const NotificationCard = ({ notification, onMarkRead }) => (
  <div className={`p-3 rounded-lg border ${notification.isRead ? 'bg-white border-slate-100' : 'bg-amber-50 border-amber-200'}`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-navy-900">{notification.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
      </div>
      {!notification.isRead && (
        <button 
          onClick={() => onMarkRead(notification.id)}
          className="text-xs text-amber-600 hover:text-amber-700"
        >
          Mark read
        </button>
      )}
    </div>
  </div>
);

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // 2FA States
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [step, setStep] = useState('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFAToken, setTwoFAToken] = useState('');
  
  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnquiries: true,
    emailReviews: true,
    emailNewsletter: false,
    emailPromotions: false,
    pushEnquiries: true,
    pushReviews: true
  });

  useEffect(() => {
    if (tabParam && ['favorites', 'enquiries', 'search', 'notifications', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [userRes, favRes, enquiriesRes, searchRes, notifRes, settingsRes] = await Promise.all([
        api.get('/auth/me').catch(() => ({ data: null })),
        api.get('/user/favorites').catch(() => ({ data: [] })),
        api.get('/user/enquiries').catch(() => ({ data: [] })),
        api.get('/user/search-history').catch(() => ({ data: [] })),
        api.get('/user/notifications').catch(() => ({ data: [] })),
        api.get('/user/notification-settings').catch(() => ({ data: {} }))
      ]);

      setUser(userRes.data);
      setFavorites(favRes.data || []);
      setEnquiries(enquiriesRes.data || []);
      setSearchHistory(searchRes.data || []);
      setNotifications(notifRes.data || []);
      setUnreadCount((notifRes.data || []).filter(n => !n.isRead).length);
      setNotificationSettings(settingsRes.data || notificationSettings);
    } catch (err) {
      console.error('Error fetching profile data:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // 2FA Handlers
  const handleSetup2FA = async () => {
    try {
      const res = await api.post('/auth/enable-2fa');
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setStep('setup');
      setShow2FAModal(true);
    } catch (err) {
      toast.error('Failed to setup 2FA');
    }
  };

  const handleVerify2FA = async () => {
    if (!twoFAToken || twoFAToken.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    try {
      await api.post('/auth/verify-2fa', { token: twoFAToken });
      setStep('verify');
      toast.success('2FA enabled successfully!');
      fetchAllData();
    } catch (err) {
      toast.error('Invalid code. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    const token = prompt('Enter your 2FA code to disable:');
    if (!token) return;
    try {
      await api.post('/auth/disable-2fa', { token });
      toast.success('2FA disabled');
      fetchAllData();
    } catch (err) {
      toast.error('Invalid code');
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
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
        await api.delete(`/user/search-history/${searchId}`);
        setSearchHistory(searchHistory.filter(s => s.id !== searchId));
        toast.success('Search removed');
      } else {
        await api.delete('/user/search-history');
        setSearchHistory([]);
        toast.success('Search history cleared');
      }
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  const handleRerunSearch = (search) => {
    const params = new URLSearchParams();
    if (search.query) params.set('search', search.query);
    if (search.city) params.set('city', search.city);
    if (search.category) params.set('category', search.category);
    navigate(`/listings?${params.toString()}`);
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/user/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/user/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
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
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'settings', label: 'Settings', icon: Settings },
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
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-2xl font-bold text-white">My Account</h1>
          <p className="text-white/60 text-sm mt-1">Manage your favorites, enquiries, and settings</p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-xl border border-slate-100 p-4 sticky top-20 shadow-sm">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                  <User size={20} className="text-navy-600" />
                </div>
                <div>
                  <p className="font-semibold text-navy-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                  {user?.emailVerified && (
                    <span className="text-[10px] text-green-600 flex items-center gap-0.5">
                      <CheckCircle size={8} /> Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                {tabs.map(tab => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      navigate(`/profile?tab=${tab.id}`, { replace: true });
                    }}
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
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
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
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
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
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
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
                        onRerun={handleRerunSearch}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No search history yet</p>
                    <div className="mt-2 text-xs text-slate-400">
                      Try searching for restaurants, migration agents, or accountants
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold text-navy-900 flex items-center gap-2">
                    <Bell size={20} /> Notifications
                    {unreadCount > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {unreadCount} unread
                      </span>
                    )}
                  </h2>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-xs text-amber-600 hover:text-amber-700"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {notifications.length > 0 ? (
                  <div className="space-y-2">
                    {notifications.map(notification => (
                      <NotificationCard 
                        key={notification.id} 
                        notification={notification}
                        onMarkRead={handleMarkNotificationRead}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bell size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500">No notifications yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      You'll receive notifications for enquiry replies and review responses
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                  <Settings size={20} /> Notification Preferences
                </h2>
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="font-semibold text-navy-800 mb-3">Email Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Enquiry replies</span>
                          <p className="text-xs text-slate-400">Get email when a business replies to your enquiry</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailEnquiries}
                          onChange={(e) => handleUpdateNotificationSettings('emailEnquiries', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Review responses</span>
                          <p className="text-xs text-slate-400">Get email when a business responds to your review</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailReviews}
                          onChange={(e) => handleUpdateNotificationSettings('emailReviews', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Newsletter</span>
                          <p className="text-xs text-slate-400">Weekly updates on new businesses and offers</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.emailNewsletter}
                          onChange={(e) => handleUpdateNotificationSettings('emailNewsletter', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="font-semibold text-navy-800 mb-3">Push Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-slate-700">New enquiry replies</span>
                          <p className="text-xs text-slate-400">Get browser notifications for replies</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.pushEnquiries}
                          onChange={(e) => handleUpdateNotificationSettings('pushEnquiries', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-slate-700">Review updates</span>
                          <p className="text-xs text-slate-400">Get browser notifications for review responses</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notificationSettings.pushReviews}
                          onChange={(e) => handleUpdateNotificationSettings('pushReviews', e.target.checked)}
                          className="toggle-checkbox"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="font-semibold text-navy-800 mb-3 flex items-center gap-2">
                      <Shield size={16} /> Two-Factor Authentication (2FA)
                    </h3>
                    {user?.twoFactorEnabled ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">✅ 2FA is enabled</p>
                            <p className="text-xs text-green-600 mt-1">Your account is protected with two-factor authentication</p>
                          </div>
                          <button
                            onClick={handleDisable2FA}
                            className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-300 rounded-lg hover:bg-red-50"
                          >
                            Disable 2FA
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <p className="text-sm text-slate-600 mb-3">Add an extra layer of security to your account</p>
                        <button
                          onClick={handleSetup2FA}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          Set up Two-Factor Authentication
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Account Information */}
                  <div className="border-t border-slate-100 pt-4">
                    <h3 className="font-semibold text-navy-800 mb-3">Account Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-slate-500">Member since</span>
                        <span className="text-sm text-navy-900">{new Date(user?.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-slate-500">Account type</span>
                        <span className="text-sm font-medium text-navy-900 capitalize">{user?.userType}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-slate-500">Email status</span>
                        <span className={`text-sm font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                          {user?.emailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold text-navy-900">Setup Two-Factor Authentication</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            {step === 'setup' ? (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">1. Scan this QR code with Google Authenticator or Authy</p>
                </div>
                {qrCode && (
                  <div className="flex justify-center mb-4">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border rounded-lg" />
                  </div>
                )}
                <p className="text-xs text-slate-500 text-center mb-4">
                  Or enter this code manually: <code className="bg-slate-100 px-1 rounded font-mono">{secret}</code>
                  <button onClick={copySecret} className="ml-2 text-amber-600 hover:text-amber-700">
                    <Copy size={12} />
                  </button>
                </p>
                
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Enter 6-digit code from app</label>
                  <input
                    type="text"
                    maxLength="6"
                    placeholder="000000"
                    value={twoFAToken}
                    onChange={(e) => setTwoFAToken(e.target.value)}
                    className="input text-center text-2xl tracking-widest"
                  />
                </div>
                
                <button
                  onClick={handleVerify2FA}
                  disabled={!twoFAToken || twoFAToken.length !== 6}
                  className="btn-primary w-full py-2 disabled:opacity-50"
                >
                  Verify and Enable
                </button>
              </>
            ) : step === 'verify' ? (
              <>
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <p className="text-navy-900 font-semibold mb-1">2FA Enabled Successfully!</p>
                  <p className="text-sm text-slate-500">Your account is now more secure.</p>
                  <button onClick={() => { setShow2FAModal(false); fetchAllData(); }} className="btn-primary mt-4">
                    Done
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}