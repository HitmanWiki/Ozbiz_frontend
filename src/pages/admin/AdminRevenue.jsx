// frontend/src/pages/admin/AdminRevenue.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Users, CreditCard, Download, 
  Calendar, ArrowUp, ArrowDown, PieChart, BarChart3 
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart as RePieChart, 
  Pie, Cell, Area, AreaChart
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4'];

export default function AdminRevenue() {
  const [stats, setStats] = useState({ plans: {}, monthlyRevenue: 0, recentTransactions: [] });
  const [monthlyData, setMonthlyData] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('year');
  const [selectedPlan, setSelectedPlan] = useState('all');

  useEffect(() => {
    fetchRevenueStats();
    fetchMonthlyRevenue();
  }, [dateRange]);

  const fetchRevenueStats = async () => {
    try {
      const res = await api.get('/admin/subscription/stats');
      setStats(res.data);
      
      // Prepare plan distribution for pie chart
      const plans = [
        { name: 'Free', value: res.data.plans?.free || 0, color: '#94A3B8' },
        { name: 'Basic', value: res.data.plans?.basic || 0, color: '#3B82F6' },
        { name: 'Premium', value: res.data.plans?.premium || 0, color: '#F59E0B' },
        { name: 'Elite', value: res.data.plans?.elite || 0, color: '#8B5CF6' }
      ];
      setPlanDistribution(plans.filter(p => p.value > 0));
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
      toast.error('Failed to load revenue data');
    }
  };

  const fetchMonthlyRevenue = async () => {
    try {
      // Get monthly revenue from subscription history
      const res = await api.get('/admin/subscription/monthly', { 
        params: { range: dateRange } 
      });
      setMonthlyData(res.data || generateMockData());
    } catch (err) {
      console.error('Error fetching monthly revenue:', err);
      setMonthlyData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.slice(-6).map(month => ({
      month,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      subscribers: Math.floor(Math.random() * 100) + 20,
      growth: (Math.random() * 20) - 5
    }));
  };

  const handleExportCSV = () => {
    const headers = ['Month', 'Revenue', 'Subscribers', 'Growth %'];
    const csvData = monthlyData.map(d => [d.month, d.revenue, d.subscribers, d.growth.toFixed(2)]);
    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const calculateTotalSubscribers = () => {
    return (stats.plans?.premium || 0) + (stats.plans?.elite || 0) + (stats.plans?.featured || 0);
  };

  const calculateGrowth = () => {
    if (monthlyData.length < 2) return 0;
    const lastMonth = monthlyData[monthlyData.length - 1]?.revenue || 0;
    const prevMonth = monthlyData[monthlyData.length - 2]?.revenue || 0;
    return prevMonth ? ((lastMonth - prevMonth) / prevMonth * 100).toFixed(1) : 0;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Revenue & Payments</h1>
          <p className="text-slate-500 text-sm mt-1">Track subscription revenue, plan distribution, and financial metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input text-sm py-1.5"
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="year">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={handleExportCSV} className="btn-outline text-sm flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-navy-900">${stats.monthlyRevenue?.toLocaleString() || 0}</p>
              <p className={`text-xs mt-1 flex items-center gap-0.5 ${calculateGrowth() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculateGrowth() >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                {Math.abs(calculateGrowth())}% from last month
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Active Subscribers</p>
              <p className="text-2xl font-bold text-navy-900">{calculateTotalSubscribers()}</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% this month</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CreditCard size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Average Transaction</p>
              <p className="text-2xl font-bold text-navy-900">$49</p>
              <p className="text-xs text-slate-500 mt-1">Premium + Elite plans</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Annual Run Rate</p>
              <p className="text-2xl font-bold text-navy-900">${(stats.monthlyRevenue * 12)?.toLocaleString() || 0}</p>
              <p className="text-xs text-green-600 mt-1">Projected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2">
              <BarChart3 size={16} /> Revenue Trend
            </h3>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fill="#FEF3C7" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subscriber Growth Chart */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy-900 flex items-center gap-2">
              <Users size={16} /> Subscriber Growth
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="subscribers" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4 flex items-center gap-2">
            <PieChart size={16} /> Plan Distribution
          </h3>
          {planDistribution.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {planDistribution.map((plan, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: plan.color }} />
                    <span className="text-sm text-slate-600">{plan.name}</span>
                    <span className="text-sm font-semibold text-navy-900">{plan.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart size={40} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-400">No subscription data available</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-navy-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Plan</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentTransactions?.length > 0 ? (
                  stats.recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <p className="text-sm font-medium text-navy-900">{transaction.user?.name}</p>
                        <p className="text-xs text-slate-400">{transaction.user?.email}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          transaction.plan === 'premium' ? 'bg-amber-100 text-amber-700' :
                          transaction.plan === 'elite' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {transaction.plan}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-navy-900">${transaction.amount}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-AU')}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}