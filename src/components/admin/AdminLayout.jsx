import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Star, MessageSquare, Tag,
  LogOut, Menu, X, Bell, ExternalLink, Megaphone, BookOpen, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/listings', label: 'Listings', icon: Building2 },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  { path: '/admin/categories', label: 'Categories', icon: Tag },
  { path: '/admin/ads', label: 'Advertisements', icon: Megaphone },
  { path: '/admin/blogs', label: 'Blog Posts', icon: BookOpen },
  { path: '/admin/newsletter', label: 'Newsletter', icon: Mail },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-navy-950 w-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 shrink-0">
        <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-navy-900 text-lg">O</span>
        </div>
        <div>
          <div className="font-display font-bold text-white text-lg leading-none">OzBiz</div>
          <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        <p className="text-white/30 text-[9px] font-semibold uppercase tracking-widest px-3 py-2">Management</p>
        {NAV.map(({ path, label, icon: Icon, end }) => (
          <NavLink key={path} to={path} end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-gold-400 text-navy-900'
                : 'text-white/65 hover:text-white hover:bg-white/8'
              }`
            }>
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="pt-4">
          <p className="text-white/30 text-[9px] font-semibold uppercase tracking-widest px-3 py-2">Site</p>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/65 hover:text-white hover:bg-white/8 transition-all">
            <ExternalLink size={17} /> View Website
          </a>
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5">
          <div className="w-8 h-8 bg-navy-700 rounded-full flex items-center justify-center border border-white/20 shrink-0 overflow-hidden">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <span className="text-white font-medium text-xs">{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-white/40 text-[10px] capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="text-white/40 hover:text-red-400 transition-colors p-1 shrink-0">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 shadow-xl">
        <Sidebar />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 flex flex-col shadow-2xl z-10">
            <Sidebar />
          </div>
          <button onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-white bg-black/20 rounded-lg p-1.5 z-20">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-navy-700 p-1">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg relative transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-medium text-xs">{user?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
