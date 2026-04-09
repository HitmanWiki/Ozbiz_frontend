// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Star, MessageSquare, ChevronRight, Clock, CheckCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/UI';
import api from '../../utils/api';

const StatCard = ({ label, value, sub, icon: Icon, color, to }) => (
  <Link to={to || '#'} className="card p-5 hover:shadow-md transition-shadow group">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>
    <p className="text-2xl font-display font-bold text-navy-900">{value}</p>
    <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </Link>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/stats', { timeout: 30000 });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl">
        <div><div className="h-7 bg-slate-200 rounded w-40 animate-pulse mb-1" /><div className="h-4 bg-slate-200 rounded w-56 animate-pulse" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-28"><div className="w-11 h-11 bg-slate-200 rounded-xl mb-3" /><div className="h-6 bg-slate-200 rounded w-16" /></div>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-navy-900 mb-2">Unable to Load Dashboard</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button onClick={fetchStats} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentListings, topCategories, recentEnquiries } = data || {};

  const totalListings = stats?.listings?.total || 0;
  const pendingListings = stats?.listings?.pending || 0;
  const activeListings = stats?.listings?.active || 0;
  const featuredListings = stats?.listings?.featured || 0;
  const totalUsers = stats?.users?.total || 0;
  const pendingReviews = stats?.reviews?.pending || 0;
  const newEnquiries = stats?.enquiries?.new || 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">Overview of your OzBiz Directory platform</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Listings" 
          value={totalListings} 
          sub={`${pendingListings} pending`} 
          icon={Building2} 
          color="bg-navy-700" 
          to="/admin/listings" 
        />
        <StatCard 
          label="Active Listings" 
          value={activeListings} 
          sub={`${featuredListings} featured`} 
          icon={CheckCircle} 
          color="bg-green-600" 
          to="/admin/listings?status=active" 
        />
        <StatCard 
          label="Registered Users" 
          value={totalUsers} 
          icon={Users} 
          color="bg-blue-600" 
          to="/admin/users" 
        />
        <StatCard 
          label="Pending Reviews" 
          value={pendingReviews} 
          sub={`${newEnquiries} new enquiries`} 
          icon={Star} 
          color="bg-amber-500" 
          to="/admin/reviews" 
        />
      </div>

      {/* Alert banners */}
      {(pendingListings > 0 || pendingReviews > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pendingListings > 0 && (
            <Link to="/admin/listings?status=pending"
              className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 hover:bg-amber-100 transition-colors">
              <Clock size={18} className="text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-amber-800 font-semibold text-sm">{pendingListings} listing{pendingListings !== 1 ? 's' : ''} awaiting review</p>
                <p className="text-amber-600 text-xs">Click to review and approve</p>
              </div>
              <ChevronRight size={16} className="text-amber-400 shrink-0" />
            </Link>
          )}
          {pendingReviews > 0 && (
            <Link to="/admin/reviews"
              className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors">
              <Star size={18} className="text-blue-600 shrink-0" />
              <div className="flex-1">
                <p className="text-blue-800 font-semibold text-sm">{pendingReviews} review{pendingReviews !== 1 ? 's' : ''} awaiting moderation</p>
                <p className="text-blue-600 text-xs">Click to moderate</p>
              </div>
              <ChevronRight size={16} className="text-blue-400 shrink-0" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent listings */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="font-display font-semibold text-navy-900">Recent Listings</h2>
            <Link to="/admin/listings" className="text-xs text-navy-600 hover:text-navy-900 font-medium flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {(recentListings || []).map(listing => (
              <div key={listing.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 bg-navy-800 rounded-lg flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-white text-sm">{listing.title?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{listing.title}</p>
                  <p className="text-xs text-slate-400">{listing.category?.name} · {listing.city}</p>
                </div>
                <StatusBadge status={listing.status} />
              </div>
            ))}
            {(!recentListings || recentListings.length === 0) && (
              <p className="text-xs text-slate-400 text-center py-8">No listings yet</p>
            )}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="font-display font-semibold text-navy-900 text-sm">Top Categories</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {(topCategories || []).map((cat, i) => (
                <div key={cat.slug} className="flex items-center justify-between px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-300 w-4">#{i + 1}</span>
                    <span className="text-xs font-medium text-navy-800 truncate max-w-[140px]">{cat.name}</span>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{cat.listingCount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-display font-semibold text-navy-900 text-sm">Recent Enquiries</h2>
              <Link to="/admin/enquiries" className="text-xs text-navy-600 hover:text-navy-900">View all</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {(recentEnquiries || []).map(enq => (
                <div key={enq.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-navy-900 truncate">{enq.senderName}</p>
                    {enq.status === 'new' && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">New</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{enq.listing?.title}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{enq.message?.substring(0, 55)}...</p>
                </div>
              ))}
              {(!recentEnquiries || recentEnquiries.length === 0) && (
                <p className="text-xs text-slate-400 text-center py-5">No enquiries yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}