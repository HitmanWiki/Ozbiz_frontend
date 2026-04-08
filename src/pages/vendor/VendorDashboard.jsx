// frontend/src/pages/vendor/VendorDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Eye, MessageCircle, Star, Briefcase,
  Clock, CheckCircle, AlertCircle, ArrowUp, ArrowDown,
  Users, ShoppingBag, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-navy-900 mt-1">{value?.toLocaleString() || 0}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 flex items-center gap-0.5 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalLeads: 0,
    activeListings: 0,
    pendingListings: 0
  });
  const [listings, setListings] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorData();
  }, []);

  const fetchVendorData = async () => {
    try {
      const res = await api.get('/vendor/dashboard');
      setStats(res.data.stats);
      setListings(res.data.listings);
      setRecentLeads(res.data.recentLeads || []);
      setRecentReviews(res.data.recentReviews || []);
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Vendor Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track your business performance and manage your listings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Listings" 
          value={stats.totalListings} 
          icon={Briefcase} 
          color="bg-gold-500"
        />
        <StatCard 
          title="Total Views" 
          value={stats.totalViews} 
          icon={Eye} 
          color="bg-blue-500"
          trend={12}
        />
        <StatCard 
          title="Total Leads" 
          value={stats.totalLeads} 
          icon={MessageCircle} 
          color="bg-green-500"
          trend={8}
        />
        <StatCard 
          title="Active Listings" 
          value={stats.activeListings} 
          icon={CheckCircle} 
          color="bg-emerald-500"
        />
      </div>

      {/* Simple Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Views Trend - Simple version */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Views Overview
          </h3>
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-navy-900">{stats.totalViews}</p>
            <p className="text-sm text-slate-500 mt-1">Total business views</p>
            <p className="text-xs text-green-600 mt-2">↑ 12% vs last month</p>
          </div>
        </div>

        {/* Rating Summary */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <Star size={16} /> Rating Summary
          </h3>
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-gold-400 text-gold-400" />
              ))}
            </div>
            <p className="text-2xl font-bold text-navy-900">4.8 ★</p>
            <p className="text-sm text-slate-500 mt-1">Based on {recentReviews.length} reviews</p>
          </div>
        </div>
      </div>

      {/* My Listings Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy-900">My Listings</h3>
          <Link to="/add-listing" className="btn-primary text-sm py-1.5 px-3">
            + Add New Listing
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Business Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Views</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <Link to={`/listings/${listing.slug}`} className="text-sm font-medium text-navy-900 hover:text-gold-600">
                      {listing.title}
                    </Link>
                   </td>
                  <td className="px-5 py-3 text-sm text-slate-600">{listing.viewCount || 0}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{listing.ratingAvg || 0}★</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      listing.status === 'active' ? 'bg-green-100 text-green-700' :
                      listing.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/add-listing/${listing.id}`} className="text-xs text-gold-600 hover:text-gold-700">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No listings yet. Create your first listing!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <MessageCircle size={16} /> Recent Leads
          </h3>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                    <Users size={14} className="text-navy-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{lead.senderName}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{lead.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Link to="/vendor/leads" className="text-xs text-gold-600">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No leads yet</p>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Star size={16} /> Recent Reviews
          </h3>
          {recentReviews.length > 0 ? (
            <div className="space-y-3">
              {recentReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-300'} />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-navy-900">{review.reviewerName || 'Anonymous'}</p>
                    <p className="text-xs text-slate-600 line-clamp-1">{review.body}</p>
                  </div>
                  <Link to="/vendor/reviews" className="text-xs text-gold-600">
                    Reply
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">No reviews yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link to="/add-listing" className="flex items-center gap-2 p-3 bg-gold-50 rounded-lg hover:bg-gold-100 transition-colors">
          <Briefcase size={16} className="text-gold-600" />
          <span className="text-sm font-medium text-gold-700">New Listing</span>
        </Link>
        <Link to="/vendor/leads" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <MessageCircle size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-700">Manage Leads</span>
        </Link>
        <Link to="/vendor/reviews" className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <Star size={16} className="text-purple-600" />
          <span className="text-sm font-medium text-purple-700">Reviews</span>
        </Link>
        <Link to="/subscription" className="flex items-center gap-2 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <ShoppingBag size={16} className="text-green-600" />
          <span className="text-sm font-medium text-green-700">Upgrade Plan</span>
        </Link>
      </div>
    </div>
  );
}