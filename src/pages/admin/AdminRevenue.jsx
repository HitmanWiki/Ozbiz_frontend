// frontend/src/pages/admin/AdminRevenue.jsx
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, CreditCard, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminRevenue() {
  const [stats, setStats] = useState({ plans: {}, monthlyRevenue: 0, recentTransactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueStats();
  }, []);

  const fetchRevenueStats = async () => {
    try {
      const res = await api.get('/admin/subscription/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching revenue stats:', err);
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const planColors = {
    free: 'bg-slate-100 text-slate-600',
    basic: 'bg-blue-100 text-blue-700',
    premium: 'bg-gold-100 text-gold-700',
    featured: 'bg-purple-100 text-purple-700',
    elite: 'bg-amber-100 text-amber-700'
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Revenue & Payments</h1>
          <p className="text-slate-500 text-sm mt-1">Track subscription revenue and plan distribution</p>
        </div>
        <button className="btn-outline text-sm flex items-center gap-2">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-navy-900">${stats.monthlyRevenue?.toLocaleString() || 0}</p>
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
              <p className="text-2xl font-bold text-navy-900">
                {(stats.plans?.premium || 0) + (stats.plans?.elite || 0) + (stats.plans?.featured || 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Growth (Month over Month)</p>
              <p className="text-2xl font-bold text-green-600">+15%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-navy-900 mb-4">Subscription Plan Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(stats.plans || {}).map(([plan, count]) => (
            <div key={plan} className={`p-4 rounded-xl text-center ${planColors[plan] || 'bg-slate-100'}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs uppercase tracking-wider mt-1">{plan}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display text-lg font-semibold text-navy-900">Recent Transactions</h2>
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
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${planColors[transaction.plan]}`}>
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
  );
}