// frontend/src/pages/admin/AdminListings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle, XCircle, Eye, Star, Zap, ChevronLeft, ChevronRight, CheckSquare, Square } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge } from '../../components/common/UI';
import api from '../../utils/api';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [pagination.page, statusFilter, search]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20,
        status: statusFilter,
        ...(search && { search })
      });
      const res = await api.get(`/admin/listings?${params}`);
      setListings(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      toast.error('Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedListings.size === listings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map(l => l.id)));
    }
  };

  const handleSelectListing = (id) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedListings(newSelected);
  };

  const handleBulkAction = async (action, value = null) => {
    const ids = Array.from(selectedListings);
    if (ids.length === 0) {
      toast.error('No listings selected');
      return;
    }

    try {
      if (action === 'status') {
        await Promise.all(ids.map(id => api.patch(`/admin/listings/${id}/status`, { status: value })));
        toast.success(`${ids.length} listings ${value === 'active' ? 'approved' : value === 'rejected' ? 'rejected' : 'updated'}`);
      } else if (action === 'feature') {
        await Promise.all(ids.map(id => api.patch(`/admin/listings/${id}/status`, { isFeatured: value })));
        toast.success(`${ids.length} listings ${value ? 'featured' : 'unfeatured'}`);
      } else if (action === 'verify') {
        await Promise.all(ids.map(id => api.patch(`/admin/listings/${id}/status`, { isVerified: value })));
        toast.success(`${ids.length} listings ${value ? 'verified' : 'unverified'}`);
      } else if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${ids.length} listings?`)) {
          await Promise.all(ids.map(id => api.delete(`/admin/listings/${id}`)));
          toast.success(`${ids.length} listings deleted`);
        }
      }
      setSelectedListings(new Set());
      fetchListings();
    } catch (err) {
      toast.error('Bulk action failed');
    }
  };

  const updateListingStatus = async (id, status) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { status });
      toast.success(`Listing ${status}`);
      fetchListings();
    } catch {
      toast.error('Update failed');
    }
  };

  const updateFeatured = async (id, isFeatured) => {
    try {
      await api.patch(`/admin/listings/${id}/status`, { isFeatured });
      toast.success(isFeatured ? 'Featured' : 'Unfeatured');
      fetchListings();
    } catch {
      toast.error('Update failed');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const selectedCount = selectedListings.size;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Listings Moderation</h1>
        <p className="text-slate-500 text-sm">Approve, reject, or feature business listings</p>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-navy-800 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="font-semibold">{selectedCount}</span> listings selected
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('status', 'active')} className="bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-sm">
              Approve All
            </button>
            <button onClick={() => handleBulkAction('status', 'rejected')} className="bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-sm">
              Reject All
            </button>
            <button onClick={() => handleBulkAction('feature', true)} className="bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg text-sm">
              Feature All
            </button>
            <button onClick={() => handleBulkAction('feature', false)} className="bg-slate-600 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-sm">
              Unfeature All
            </button>
            <button onClick={() => handleBulkAction('verify', true)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm">
              Verify All
            </button>
            <button onClick={() => handleBulkAction('delete')} className="bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg text-sm">
              Delete All
            </button>
            <button onClick={() => setSelectedListings(new Set())} className="border border-white/30 hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pending', 'active', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search listings..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9 text-sm w-64"
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 w-10">
                  <button onClick={handleSelectAll} className="text-slate-500 hover:text-navy-800">
                    {selectedListings.size === listings.length && listings.length > 0 ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Business</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>)}
                  </tr>
                ))
              ) : listings.map(listing => (
                <tr key={listing.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button onClick={() => handleSelectListing(listing.id)}>
                      {selectedListings.has(listing.id) ? <CheckSquare size={16} className="text-navy-800" /> : <Square size={16} className="text-slate-400" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/listings/${listing.slug}`} className="text-sm font-medium text-navy-900 hover:text-gold-600">
                      {listing.title}
                    </Link>
                    <p className="text-xs text-slate-400">{listing.user?.name}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{listing.category?.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{listing.city}</td>
                  <td className="px-4 py-3"><StatusBadge status={listing.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => updateFeatured(listing.id, !listing.isFeatured)}>
                      {listing.isFeatured ? <Star size={16} className="fill-amber-400 text-amber-400" /> : <Star size={16} className="text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => updateListingStatus(listing.id, listing.isVerified ? 'unverify' : 'verify')}>
                      {listing.isVerified ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-slate-300" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {listing.status === 'pending' && (
                      <>
                        <button onClick={() => updateListingStatus(listing.id, 'active')} className="text-green-600 hover:text-green-700 text-xs">Approve</button>
                        <button onClick={() => updateListingStatus(listing.id, 'rejected')} className="text-red-600 hover:text-red-700 text-xs">Reject</button>
                      </>
                    )}
                    <Link to={`/add-listing/${listing.id}`} className="text-navy-600 hover:text-navy-800 text-xs">Edit</Link>
                  </td>
                </tr>
              ))}
              {listings.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-slate-400">No listings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-slate-100">
            <button
              disabled={pagination.page <= 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              let pageNum = i + 1;
              if (pagination.totalPages > 5 && pagination.page > 3) {
                pageNum = pagination.page - 2 + i;
                if (pageNum > pagination.totalPages) return null;
              }
              return (
                <button
                  key={i}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm ${pagination.page === pageNum ? 'bg-navy-800 text-white' : 'hover:bg-slate-100'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}