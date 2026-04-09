// frontend/src/pages/vendor/VendorDashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Eye, MessageCircle, Star, Briefcase,
  Clock, CheckCircle, AlertCircle, ArrowUp, ArrowDown,
  Users, ShoppingBag, Calendar, Download, Filter
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

const StatCard = ({ title, value, icon: Icon, trend, color, subtext }) => (
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
        {subtext && <p className="text-[10px] text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </div>
);

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalLeads: 0,
    activeListings: 0,
    pendingListings: 0,
    averageRating: 0,
    conversionRate: 0,
    subscriptionPlan: 'free'
  });
  const [listings, setListings] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [monthlyViews, setMonthlyViews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState([]);
  const [trafficSources] = useState([
    { source: 'Direct Search', percentage: 45, color: '#F59E0B' },
    { source: 'Category Browse', percentage: 28, color: '#3B82F6' },
    { source: 'Featured Listing', percentage: 15, color: '#10B981' },
    { source: 'Homepage', percentage: 8, color: '#8B5CF6' },
    { source: 'External Link', percentage: 4, color: '#EF4444' },
  ]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchVendorData();
  }, [dateRange]);

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vendor/dashboard');
      setStats(res.data.stats);
      setListings(res.data.listings);
      setRecentLeads(res.data.recentLeads || []);
      setRecentReviews(res.data.recentReviews || []);
      
      if (res.data.monthlyViews && res.data.monthlyViews.length > 0) {
        setMonthlyViews(res.data.monthlyViews);
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        setMonthlyViews(months.slice(-6).map(m => ({ month: m, views: Math.floor(Math.random() * 500) + 100 })));
      }
      
      const reviews = res.data.recentReviews || [];
      const distribution = [
        { rating: '5★', count: reviews.filter(r => r.rating === 5).length, color: '#10B981' },
        { rating: '4★', count: reviews.filter(r => r.rating === 4).length, color: '#3B82F6' },
        { rating: '3★', count: reviews.filter(r => r.rating === 3).length, color: '#F59E0B' },
        { rating: '2★', count: reviews.filter(r => r.rating === 2).length, color: '#EF4444' },
        { rating: '1★', count: reviews.filter(r => r.rating === 1).length, color: '#8B5CF6' },
      ];
      setRatingDistribution(distribution.filter(d => d.count > 0));
      
    } catch (err) {
      console.error('Error fetching vendor data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = () => {
    const plans = {
      free: { label: 'Free Plan', color: 'bg-slate-100 text-slate-700' },
      basic: { label: 'Basic Plan', color: 'bg-blue-100 text-blue-700' },
      premium: { label: 'Premium Plan', color: 'bg-amber-100 text-amber-700' },
      elite: { label: 'Elite Plan', color: 'bg-purple-100 text-purple-700' }
    };
    return plans[stats.subscriptionPlan] || plans.free;
  };

  const planBadge = getPlanBadge();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-navy-900">Vendor Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1">Track your business performance and manage your listings</p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input text-sm py-1.5"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="12months">Last 12 months</option>
              </select>
              <button className="btn-outline text-sm flex items-center gap-2">
                <Download size={14} /> Export
              </button>
            </div>
          </div>

          {/* Subscription Banner */}
          <div className={`rounded-xl p-4 flex items-center justify-between ${stats.subscriptionPlan === 'free' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stats.subscriptionPlan === 'free' ? '⚠️' : '✅'}</span>
              <div>
                <p className={`font-semibold ${stats.subscriptionPlan === 'free' ? 'text-amber-800' : 'text-green-800'}`}>
                  {stats.subscriptionPlan === 'free' ? 'Free Plan - Limited Features' : `${planBadge.label} Active`}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stats.subscriptionPlan === 'free' 
                    ? 'Upgrade to Premium or Elite to unlock more listings, analytics, and priority support.'
                    : 'Your subscription is active. Thank you for being a valued partner!'}
                </p>
              </div>
            </div>
            {stats.subscriptionPlan === 'free' && (
              <Link to="/subscription" className="btn-primary text-sm py-1.5 px-4">
                Upgrade Now →
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Listings" 
              value={stats.totalListings} 
              icon={Briefcase} 
              color="bg-amber-500"
              subtext={`${stats.activeListings} active, ${stats.pendingListings} pending`}
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
              title="Avg Rating" 
              value={stats.averageRating?.toFixed(1) || 0} 
              icon={Star} 
              color="bg-purple-500"
              subtext={`Based on ${recentReviews.length} reviews`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-900 flex items-center gap-2">
                  <TrendingUp size={16} /> Views Trend
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="views" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <Users size={16} /> Traffic Sources
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="percentage"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <MessageCircle size={16} /> Leads Overview
              </h3>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-navy-900">{stats.totalLeads}</p>
                <p className="text-sm text-slate-500 mt-1">Total enquiries received</p>
                <p className="text-xs text-green-600 mt-2">↑ 8% vs last month</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Conversion Rate</span>
                  <span className="font-semibold text-navy-900">{stats.conversionRate || 0}%</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${Math.min(stats.conversionRate || 0, 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
                <Star size={16} /> Rating Distribution
              </h3>
              {ratingDistribution.length > 0 ? (
                <div className="space-y-3">
                  {ratingDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-12 text-sm font-medium text-slate-600">{item.rating}</div>
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${(item.count / recentReviews.length) * 100}%`, backgroundColor: item.color }} />
                      </div>
                      <div className="w-12 text-sm text-slate-500 text-right">{item.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-sm">No reviews yet</p>
                </div>
              )}
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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Leads</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Rating</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <Link to={`/listings/${listing.slug}`} className="text-sm font-medium text-navy-900 hover:text-amber-600">
                          {listing.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">{listing.viewCount || 0}</td>
                      <td className="px-5 py-3 text-sm text-slate-600">{listing.leadCount || 0}</td>
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
                        <Link to={`/add-listing/${listing.id}`} className="text-xs text-amber-600 hover:text-amber-700">
                          Edit
                        </Link>
                       </td>
                     </tr>
                  ))}
                  {listings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                        No listings yet. Create your first listing!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link to="/add-listing" className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
              <Briefcase size={16} className="text-amber-600" />
              <span className="text-sm font-medium text-amber-700">New Listing</span>
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
      </div>
      
      <Footer />
    </div>
  );
}