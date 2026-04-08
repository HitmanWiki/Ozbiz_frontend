import { useState, useEffect } from 'react';
import { Mail, Download, Users, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminNewsletter() {
  const [data, setData] = useState({ data: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/newsletter/subscribers')
      .then(res => setData(res.data || { data: [], total: 0 }))
      .catch(() => toast.error('Failed to load subscribers'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? data.data.filter(s => s.email.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))
    : data.data;

  const exportCSV = () => {
    const rows = [['Name', 'Email', 'Subscribed Date'], ...filtered.map(s => [s.name || '', s.email, new Date(s.createdAt).toLocaleDateString('en-AU')])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'ozbiz-subscribers.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported!');
  };

  const activeCount = data.data.filter(s => s.isActive).length;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Newsletter Subscribers</h1>
          <p className="text-slate-500 text-sm">{data.total} total subscribers</p>
        </div>
        <button onClick={exportCSV} className="btn-outline text-sm px-4 py-2 flex items-center gap-2">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <div className="flex justify-center mb-2"><Users size={20} className="text-navy-600" /></div>
          <p className="text-2xl font-display font-bold text-navy-900">{data.total}</p>
          <p className="text-xs text-slate-500 mt-1">Total Subscribers</p>
        </div>
        <div className="card p-5 text-center">
          <div className="flex justify-center mb-2"><CheckCircle size={20} className="text-green-600" /></div>
          <p className="text-2xl font-display font-bold text-navy-900">{activeCount}</p>
          <p className="text-xs text-slate-500 mt-1">Active Subscribers</p>
        </div>
        <div className="card p-5 text-center">
          <div className="flex justify-center mb-2"><Mail size={20} className="text-gold-600" /></div>
          <p className="text-2xl font-display font-bold text-navy-900">
            {data.data.filter(s => {
              const d = new Date(s.createdAt);
              const now = new Date();
              return (now - d) < 30 * 24 * 60 * 60 * 1000;
            }).length}
          </p>
          <p className="text-xs text-slate-500 mt-1">New This Month</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <input placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="input text-sm max-w-sm" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Name', 'Email', 'Status', 'Subscribed'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(4)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-32" /></td>)}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-slate-400 text-sm">
                {search ? 'No subscribers match your search.' : 'No subscribers yet. Add a Newsletter Subscription box to your pages.'}
              </td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                        <span className="text-navy-600 text-xs font-medium">{(s.name || s.email)[0].toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-navy-900">{s.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {s.isActive ? 'Active' : 'Unsubscribed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(s.createdAt).toLocaleDateString('en-AU')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {data.total} subscribers
          </div>
        )}
      </div>
    </div>
  );
}
