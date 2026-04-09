// frontend/src/components/admin/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, Star, MessageSquare, 
  Tag, Megaphone, Newspaper, Mail, TrendingUp, Settings,
  Shield, LogOut, ChevronDown, Eye, CreditCard, SearchCode,
  User, Briefcase, Bell, Menu, FileText, Send, Download,
  Globe, Code, FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/listings', label: 'Listings', icon: Building2 },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { path: '/admin/categories', label: 'Categories', icon: Tag },
  { path: '/admin/ads', label: 'Advertisements', icon: Megaphone },
  { path: '/admin/blogs', label: 'Blog Posts', icon: Newspaper },
  { path: '/admin/newsletter', label: 'Newsletter', icon: Mail },
  { path: '/admin/email-templates', label: 'Email Templates', icon: FileText },
  { path: '/admin/exports', label: 'Exports', icon: Download },
  { path: '/admin/revenue', label: 'Revenue', icon: CreditCard },
  { path: '/admin/site', label: 'Site', icon: Settings },
  { path: '/admin/seo', label: 'SEO', icon: SearchCode },
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [rolePreview, setRolePreview] = useState(() => {
    return sessionStorage.getItem('admin_preview_role') || null;
  });
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Apply role preview to localStorage for cross-page persistence
  useEffect(() => {
    if (rolePreview) {
      const originalUser = JSON.parse(localStorage.getItem('user') || '{}');
      const previewUser = { ...originalUser, userType: rolePreview, isPreview: true };
      localStorage.setItem('user', JSON.stringify(previewUser));
      sessionStorage.setItem('original_user', JSON.stringify(originalUser));
    } else {
      const originalUser = sessionStorage.getItem('original_user');
      if (originalUser) {
        localStorage.setItem('user', originalUser);
        sessionStorage.removeItem('original_user');
      }
    }
  }, [rolePreview]);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { default: api } = await import('../../utils/api');
      const res = await api.get('/user/notifications').catch(() => ({ data: [] }));
      setNotifications(res.data || []);
      setUnreadCount((res.data || []).filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      const { default: api } = await import('../../utils/api');
      await api.patch(`/user/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      const { default: api } = await import('../../utils/api');
      await api.post('/user/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const previewRole = (role) => {
    if (role === 'clear') {
      setRolePreview(null);
      sessionStorage.removeItem('admin_preview_role');
      toast.success('Preview mode disabled');
    } else {
      setRolePreview(role);
      sessionStorage.setItem('admin_preview_role', role);
      toast.success(`Previewing as: ${role.charAt(0).toUpperCase() + role.slice(1)}`);
    }
    setShowRoleSwitcher(false);
  };

  const canAccessAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  
  if (!canAccessAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={40} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-6">You don't have permission to access the admin panel.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-navy-800 text-white px-6 py-2.5 rounded-lg hover:bg-navy-700 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-navy-900 to-navy-800 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Menu size={20} />
            </button>
            
            <Link to="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <span className="font-display font-bold text-navy-900 text-xl">O</span>
              </div>
              <div>
                <span className="font-display font-bold text-white text-xl">OzBiz</span>
                <span className="text-amber-400 text-sm ml-1 font-medium">Admin</span>
              </div>
            </Link>
            
            {/* Role Preview Badge */}
            {rolePreview && (
              <div className="ml-4 flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm text-amber-300 px-3 py-1.5 rounded-full text-xs border border-amber-500/30">
                <Eye size={12} />
                Previewing as: <span className="font-semibold capitalize">{rolePreview}</span>
                <button onClick={() => previewRole('clear')} className="ml-1 hover:text-white transition-colors">✕</button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-navy-50 to-white">
                      <h3 className="font-semibold text-navy-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 10).map(notification => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                              !notification.isRead ? 'bg-amber-50/50' : ''
                            }`}
                            onClick={() => markNotificationRead(notification.id)}
                          >
                            <p className="text-sm font-medium text-navy-900">{notification.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">No notifications</p>
                        </div>
                      )}
                    </div>
                    <Link
                      to="/profile?tab=notifications"
                      className="block text-center py-2.5 text-xs text-amber-600 hover:bg-amber-50 transition-colors font-medium"
                      onClick={() => setShowNotifications(false)}
                    >
                      View all notifications →
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="flex items-center gap-2 text-white/80 hover:text-white text-sm bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all"
              >
                <Shield size={14} />
                <span className="hidden sm:inline">Preview as</span>
                <ChevronDown size={14} className="transition-transform" style={{ transform: showRoleSwitcher ? 'rotate(180deg)' : 'none' }} />
              </button>
              {showRoleSwitcher && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleSwitcher(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 overflow-hidden">
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Preview Mode</p>
                    </div>
                    <button
                      onClick={() => previewRole('superadmin')}
                      className="w-full text-left px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Shield size={14} /> Super Admin
                    </button>
                    <button
                      onClick={() => previewRole('admin')}
                      className="w-full text-left px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Shield size={14} /> Admin
                    </button>
                    <button
                      onClick={() => previewRole('vendor')}
                      className="w-full text-left px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <Briefcase size={14} /> Vendor
                    </button>
                    <button
                      onClick={() => previewRole('consumer')}
                      className="w-full text-left px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <User size={14} /> Consumer
                    </button>
                    {rolePreview && (
                      <>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          onClick={() => previewRole('clear')}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                        >
                          <Eye size={14} /> Exit Preview
                        </button>
                      </>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <Link
                      to="/"
                      className="block w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                    >
                      <Eye size={14} /> View Live Site
                    </Link>
                  </div>
                </>
              )}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/20">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="text-[10px] text-amber-400">{user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
                <span className="text-navy-900 font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <button
                onClick={() => logout()}
                className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:relative z-30 w-64 bg-white border-r border-slate-200 min-h-screen transition-all duration-300 ease-in-out shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Sidebar Header */}
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-navy-900 font-bold text-sm">O</span>
              </div>
              <div>
                <p className="font-semibold text-navy-900 text-sm">Admin Panel</p>
                <p className="text-[10px] text-slate-400">Management</p>
              </div>
            </div>
          </div>
          
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-navy-50 to-navy-100 text-navy-800 shadow-sm border-l-2 border-amber-500'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-navy-700'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center">
                <span className="text-navy-600 text-xs">v2.0</span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">OzBiz Directory</p>
                <p className="text-[9px] text-slate-400">© 2024 All rights reserved</p>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}