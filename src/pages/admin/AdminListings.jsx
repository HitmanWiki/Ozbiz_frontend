import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, XCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../../components/common/UI';
import api from '../../utils/api';

const STATUS_OPTIONS = ['all', 'pending', 'active', 'inactive', 'rejected', 'featured'];

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);
      const res = await api.get(`/admin/listings?${params}`);
      setListings(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  }, [page, status, search]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const updateStatus = async (id, updates) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, updates);
      toast.success('Updated');
      fetchListings();
    } catch { toast.error('Update failed'); }
  };

  const totalPages = Math.ceil((pagination.total || 0) / 20);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Listings</h1>
          <p className="text-slate-500 text-sm">{pagination.total || 0} total listings</p>
        </div>
        <Link to="/add-listing" className="btn-primary text-sm px-4 py-2">+ Add Listing</Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search by title or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors
                ${status === s ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Business', 'Category', 'Location', 'Status', 'Plan', 'Views', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>)}
                  </tr>
                ))
              ) : listings.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No listings found</td></tr>
              ) : listings.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 min-w-[200px]">
                    <p className="text-sm font-medium text-navy-900 line-clamp-1">{l.title}</p>
                    <p className="text-xs text-slate-400">{l.user?.name || '—'} · {l.email || l.user?.email || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{l.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{[l.city, l.state].filter(Boolean).join(', ') || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">
                    <select value={l.plan} onChange={e => updateStatus(l.id, { plan: e.target.value })}
                      className="text-xs border border-slate-200 rounded px-2 py-1 bg-white outline-none cursor-pointer capitalize">
                      {['free', 'basic', 'premium', 'featured'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{l.viewCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {l.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(l.id, { status: 'active' })}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => updateStatus(l.id, { status: 'rejected' })}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {l.status === 'active' && (
                        <button onClick={() => updateStatus(l.id, { isFeatured: !l.isFeatured })}
                          title={l.isFeatured ? 'Remove featured' : 'Mark featured'}
                          className={`p-1.5 rounded-lg transition-colors ${l.isFeatured ? 'text-gold-600 bg-gold-50' : 'text-slate-400 hover:text-gold-600 hover:bg-gold-50'}`}>
                          <Star size={16} />
                        </button>
                      )}
                      {(l.status === 'rejected' || l.status === 'inactive') && (
                        <button onClick={() => updateStatus(l.id, { status: 'active' })}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Activate">
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <select value={l.status} onChange={e => updateStatus(l.id, { status: e.target.value })}
                        className="text-xs border border-slate-200 rounded px-1.5 py-1 bg-white outline-none cursor-pointer ml-1">
                        {['pending', 'active', 'inactive', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Page {page} of {totalPages} · {pagination.total} listings</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-outline px-2 py-1.5 text-xs disabled:opacity-40"><ChevronLeft size={14} /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-outline px-2 py-1.5 text-xs disabled:opacity-40"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
