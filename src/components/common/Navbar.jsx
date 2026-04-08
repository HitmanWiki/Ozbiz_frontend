// frontend/src/components/common/Navbar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, LayoutDashboard, PlusCircle, Shield, LogOut, 
  Settings, User, Heart, MessageCircle, History, Bell, Star, Crown, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin, isVendor, isConsumer } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => { 
    logout(); 
    setUserMenuOpen(false); 
    navigate('/'); 
  };

  return (
    <header className="bg-navy-900 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center">
              <span className="font-display font-bold text-navy-900 text-lg">O</span>
            </div>
            <div>
              <span className="font-display font-bold text-white text-xl">Oz</span>
              <span className="font-display font-bold text-gold-400 text-xl">Biz</span>
              <span className="text-white/50 text-xs ml-1.5 hidden sm:inline">Directory</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {[
              ['Browse', '/listings'],
              ['Featured', '/listings?featured=true'],
              ['Restaurants', '/category/restaurants-cafes'],
              ['Migration', '/category/migration-visa'],
              ['Blog', '/blog'],
            ].map(([label, href]) => (
              <Link key={label} to={href} className="text-white/75 hover:text-gold-400 text-sm font-medium transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link to="/add-listing" className="hidden sm:flex items-center gap-1.5 bg-gold-400 text-navy-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gold-300 transition-colors">
              <PlusCircle size={14} /> Add Listing
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors">
                  <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden bg-navy-700 flex items-center justify-center">
                    {user.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="text-white font-medium text-xs">{user.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <span className="hidden sm:block font-medium">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-navy-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {user.userType && (
                          <span className="text-[10px] font-medium text-gold-600 mt-1 inline-block">
                            {user.userType === 'vendor' ? '🏢 Business Owner' : user.userType === 'both' ? '👤🏢 Consumer + Vendor' : '👤 Consumer'}
                          </span>
                        )}
                      </div>
                      
                      {/* Dashboard & Listings */}
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                        <LayoutDashboard size={15} /> My Dashboard
                      </Link>
                      <Link to="/add-listing" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                        <PlusCircle size={15} /> Add Listing
                      </Link>
                      
                      {/* Profile Section */}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <div className="px-3 py-1">
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Account</p>
                        </div>
                        <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                          <User size={15} /> My Profile
                        </Link>
                        <Link to="/profile?tab=favorites" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                          <Heart size={15} /> Saved Businesses
                        </Link>
                        <Link to="/profile?tab=enquiries" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                          <MessageCircle size={15} /> My Enquiries
                        </Link>
                        <Link to="/profile?tab=notifications" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                          <Bell size={15} /> Notifications
                        </Link>
                        <Link to="/settings" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                          <Settings size={15} /> Account Settings
                        </Link>
                      </div>
                      
                      {/* Vendor Section - Only show if user is vendor or both */}
                      {(isVendor || user.userType === 'both') && (
                        <div className="border-t border-slate-100 mt-1 pt-1">
                          <div className="px-3 py-1">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vendor Tools</p>
                          </div>
                          <Link to="/vendor/dashboard" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                            <Briefcase size={15} /> Vendor Dashboard
                          </Link>
                          <Link to="/vendor/leads" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                            <MessageCircle size={15} /> Manage Leads
                          </Link>
                          <Link to="/vendor/reviews" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                            <Star size={15} /> Reviews
                          </Link>
                          <Link to="/subscription" onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy-700 hover:bg-slate-50 transition-colors">
                            <Crown size={15} /> Upgrade Plan
                          </Link>
                        </div>
                      )}
                      
                      {/* Admin Panel (if admin) */}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50 transition-colors border-t border-slate-100 mt-1">
                          <Shield size={15} /> Admin Panel
                        </Link>
                      )}
                      
                      {/* Logout */}
                      <div className="border-t border-slate-100 mt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-white/75 hover:text-white text-sm font-medium hidden sm:block transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-gold-400 text-navy-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gold-300 transition-colors">
                  Join Free
                </Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-white/80 hover:text-white p-1">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {[
              ['Browse Businesses', '/listings'],
              ['Featured', '/listings?featured=true'],
              ['Restaurants', '/category/restaurants-cafes'],
              ['Migration', '/category/migration-visa'],
              ['Blog', '/blog'],
              ['Add Listing', '/add-listing'],
            ].map(([label, href]) => (
              <Link key={href} to={href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium">
                {label}
              </Link>
            ))}
            
            {user ? (
              <>
                <div className="h-px bg-white/10 my-2" />
                <Link to="/profile" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium">
                  👤 My Profile
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium">
                  📊 Dashboard
                </Link>
                {(isVendor || user.userType === 'both') && (
                  <Link to="/vendor/dashboard" onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium">
                    🏢 Vendor Dashboard
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg text-sm font-medium">
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 bg-gold-400 text-navy-900 rounded-lg text-sm font-medium text-center mt-2">
                  Join Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}