import { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge, StarPicker } from '../../components/common/UI';
import api from '../../utils/api';

// ── Admin Users ───────────────────────────────────────────
export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.set('search', search);
      setUsers((await api.get(`/admin/users?${params}`)).data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateUser = async (id, updates) => {
    try { await api.patch(`/admin/users/${id}`, updates); fetch(); toast.success('Updated'); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Users</h1>
        <p className="text-slate-500 text-sm">{users.length} registered users</p>
      </div>
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-9 text-sm" />
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['User', 'Email', 'Provider', 'Role', 'Listings', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">{[...Array(8)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>)}</tr>
            )) : users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      {u.avatarUrl
                        ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white text-xs font-medium">{u.name?.[0]?.toUpperCase()}</span>
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium text-navy-900">{u.name}</p>
                      {!u.emailVerified && <p className="text-[10px] text-amber-500">Email not verified</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.provider === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                    {u.provider || 'local'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select value={u.role} onChange={e => updateUser(u.id, { role: e.target.value })}
                    className="text-xs border border-slate-200 rounded px-2 py-1 bg-white outline-none capitalize cursor-pointer">
                    {['user', 'admin', 'superadmin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600 text-center">{u.listing_count || 0}</td>
                <td className="px-4 py-3"><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString('en-AU')}</td>
                <td className="px-4 py-3">
                  <button onClick={() => updateUser(u.id, { is_active: !u.isActive })}
                    className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    title={u.isActive ? 'Suspend' : 'Activate'}>
                    {u.isActive ? <UserX size={16} /> : <CheckCircle size={16} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Reviews ─────────────────────────────────────────
export function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setReviews((await api.get(`/admin/reviews?status=${statusFilter}&limit=50`)).data.data || []); }
    catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateReview = async (id, status) => {
    try { await api.patch(`/admin/reviews/${id}`, { status }); toast.success(`Review ${status}`); fetch(); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Reviews</h1>
        <p className="text-slate-500 text-sm">Moderate customer reviews before they go live</p>
      </div>
      <div className="flex gap-2">
        {['pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-28" />) :
          reviews.length === 0 ? (
            <div className="card p-10 text-center text-slate-400 text-sm">No {statusFilter} reviews</div>
          ) : reviews.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-sm text-navy-900">{r.reviewerName || 'Anonymous'}</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <span key={i} className={`text-sm ${i <= r.rating ? 'text-gold-400' : 'text-slate-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">For: <span className="font-medium">{r.listing?.title}</span> · {new Date(r.createdAt).toLocaleDateString('en-AU')}</p>
                </div>
                {statusFilter === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => updateReview(r.id, 'approved')} className="btn-success text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => updateReview(r.id, 'rejected')} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5">
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
              {r.title && <p className="font-medium text-sm text-navy-800 mb-1">{r.title}</p>}
              {r.body && <p className="text-sm text-slate-600 leading-relaxed">{r.body}</p>}
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ── Admin Enquiries ───────────────────────────────────────
export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setEnquiries((await api.get(`/admin/enquiries?status=${statusFilter}`)).data.data || []); }
    catch { toast.error('Failed to load enquiries'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Enquiries</h1>
        <p className="text-slate-500 text-sm">Customer enquiries sent to businesses</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'read', 'replied', 'archived'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['From', 'Business', 'Subject / Message', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">{[...Array(5)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>)}</tr>
              )) : enquiries.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No enquiries found</td></tr>
              ) : enquiries.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-navy-900">{e.senderName}</p>
                    <p className="text-xs text-slate-400">{e.senderEmail}</p>
                    {e.senderPhone && <p className="text-xs text-slate-400">{e.senderPhone}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 max-w-[140px]">
                    <span className="line-clamp-2">{e.listing?.title || '—'}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[250px]">
                    {e.subject && <p className="text-xs font-semibold text-navy-800 mb-0.5">{e.subject}</p>}
                    <p className="text-xs text-slate-600 line-clamp-2">{e.message}</p>
                    {e.replyMessage && (
                      <p className="text-[10px] text-green-600 mt-1 line-clamp-1">✓ Reply sent: {e.replyMessage}</p>
                    )}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(e.createdAt).toLocaleDateString('en-AU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Admin Categories ──────────────────────────────────────
export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', icon: '', sort_order: 0 });

  const fetch = async () => {
    setLoading(true);
    try { setCategories((await api.get('/admin/categories')).data || []); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/admin/categories/${editingId}`, form); toast.success('Updated'); }
      else { await api.post('/admin/categories', form); toast.success('Created'); }
      setShowForm(false); setEditingId(null); setForm({ name: '', slug: '', description: '', icon: '', sort_order: 0 }); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', icon: cat.icon || '', sort_order: cat.sortOrder || 0 });
    setEditingId(cat.id); setShowForm(true);
  };

  const toggleActive = (cat) => {
    api.put(`/admin/categories/${cat.id}`, { is_active: !cat.isActive })
      .then(() => { toast.success('Updated'); fetch(); })
      .catch(() => toast.error('Failed'));
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Categories</h1>
          <p className="text-slate-500 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: '', slug: '', description: '', icon: '', sort_order: 0 }); }}
          className="btn-primary text-sm px-4 py-2">
          {showForm && !editingId ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-navy-900 mb-4">{editingId ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Name *</label>
              <input required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                className="input text-sm" placeholder="e.g. Restaurants & Cafes" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Slug *</label>
              <input required value={form.slug} onChange={set('slug')} className="input text-sm" placeholder="restaurants-cafes" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Icon</label>
              <input value={form.icon} onChange={set('icon')} className="input text-sm" placeholder="e.g. utensils, home, car" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) }))} className="input text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Description</label>
              <input value={form.description} onChange={set('description')} className="input text-sm" placeholder="Brief description" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-sm px-5 py-2">Save Category</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Category', 'Slug', 'Icon', 'Listings', 'Status', 'Sort', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? [...Array(6)].map((_, i) => (
              <tr key={i} className="animate-pulse">{[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>)}</tr>
            )) : categories.map(cat => (
              <tr key={cat.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-navy-900">{cat.name}</p>
                  {cat.description && <p className="text-xs text-slate-400 line-clamp-1">{cat.description}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">{cat.slug}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{cat.icon || '—'}</td>
                <td className="px-4 py-3 text-xs text-slate-600 text-center">{cat.listingCount || 0}</td>
                <td className="px-4 py-3"><StatusBadge status={cat.isActive ? 'active' : 'inactive'} /></td>
                <td className="px-4 py-3 text-xs text-slate-500">{cat.sortOrder}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cat)} className="text-xs text-navy-600 hover:text-navy-900 font-medium px-2 py-1 hover:bg-slate-100 rounded transition-colors">Edit</button>
                    <button onClick={() => toggleActive(cat)} className={`text-xs font-medium px-2 py-1 rounded transition-colors ${cat.isActive ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                      {cat.isActive ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
