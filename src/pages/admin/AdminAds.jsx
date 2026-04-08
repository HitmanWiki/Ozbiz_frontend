import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Eye, EyeOff, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const PLACEMENTS = [
  { value: 'hero_top', label: 'Hero Top (above search)' },
  { value: 'hero_bottom', label: 'Hero Bottom (below search)' },
  { value: 'sidebar_left', label: 'Sidebar Left' },
  { value: 'sidebar_right', label: 'Sidebar Right (Browse page)' },
  { value: 'banner_mid', label: 'Mid-Page Banner (Homepage)' },
  { value: 'footer', label: 'Footer Banner' },
  { value: 'category', label: 'Category Page Banner' },
];

const EMPTY = { title: '', businessName: '', imageUrl: '', linkUrl: '', placement: 'banner_mid', isActive: true, sortOrder: 0 };

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetch = async () => {
    setLoading(true);
    try { setAds((await api.get('/admin/ads')).data || []); }
    catch { toast.error('Failed to load ads'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) return toast.error('Title and image URL are required');
    try {
      if (editingId) {
        await api.put(`/admin/ads/${editingId}`, form);
        toast.success('Ad updated');
      } else {
        await api.post('/admin/ads', form);
        toast.success('Ad created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
      fetch();
    } catch { toast.error('Failed to save ad'); }
  };

  const toggleActive = async (ad) => {
    try {
      await api.put(`/admin/ads/${ad.id}`, { isActive: !ad.isActive });
      fetch();
    } catch { toast.error('Failed to update'); }
  };

  const deleteAd = async (id) => {
    if (!confirm('Delete this ad?')) return;
    try { await api.delete(`/admin/ads/${id}`); fetch(); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const startEdit = (ad) => {
    setForm({ title: ad.title, businessName: ad.businessName || '', imageUrl: ad.imageUrl, linkUrl: ad.linkUrl || '', placement: ad.placement, isActive: ad.isActive, sortOrder: ad.sortOrder });
    setEditingId(ad.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const placementGroups = PLACEMENTS.reduce((acc, p) => {
    const group = p.label.split('(')[0].trim().split(' ')[0];
    acc[p.value] = p.label;
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Advertisements</h1>
          <p className="text-slate-500 text-sm">Manage banner ads placed across the site</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY); }}
          className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> {showForm && !editingId ? 'Cancel' : 'Add Ad'}
        </button>
      </div>

      {/* Placement guide */}
      <div className="card p-4">
        <h3 className="font-semibold text-sm text-navy-900 mb-3">Ad Placements Guide</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PLACEMENTS.map(p => (
            <div key={p.value} className="flex items-start gap-2 text-xs">
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 shrink-0">{p.value}</span>
              <span className="text-slate-500">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-navy-900 mb-4">{editingId ? 'Edit Advertisement' : 'Create New Advertisement'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Ad Title *</label>
              <input required value={form.title} onChange={set('title')} placeholder="e.g. Lakshya Migration Banner" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Business Name</label>
              <input value={form.businessName} onChange={set('businessName')} placeholder="e.g. Lakshya Migrations" className="input text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Image URL *</label>
              <input required value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://..." className="input text-sm" />
              <p className="text-xs text-slate-400 mt-1">Upload your image to Cloudinary or any CDN, paste the URL here. Recommended sizes: Banner 728×90px, Sidebar 300×250px, Hero 1200×300px</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Link URL</label>
              <input value={form.linkUrl} onChange={set('linkUrl')} placeholder="https://business-website.com.au" className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Placement *</label>
              <select value={form.placement} onChange={set('placement')} className="input text-sm">
                {PLACEMENTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Sort Order</label>
              <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) }))} className="input text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="adActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
              <label htmlFor="adActive" className="text-sm text-navy-700 font-medium cursor-pointer">Active (visible on site)</label>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary text-sm px-6 py-2.5">Save Advertisement</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-outline text-sm px-4 py-2.5">Cancel</button>
            </div>
          </form>

          {/* Preview */}
          {form.imageUrl && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview</p>
              <div className="max-w-sm">
                <img src={form.imageUrl} alt="Preview" className="w-full rounded-xl border border-slate-200 object-cover" onError={e => e.target.style.display = 'none'} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ads table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Preview', 'Title / Business', 'Placement', 'Clicks', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-20" /></td>)}
                  </tr>
                ))
              ) : ads.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No ads yet. Create your first advertisement above.</td></tr>
              ) : (
                ads.map(ad => (
                  <tr key={ad.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-24 h-14 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" onError={e => e.target.parentElement.classList.add('flex','items-center','justify-center')} />
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-sm font-medium text-navy-900 truncate">{ad.title}</p>
                      {ad.businessName && <p className="text-xs text-slate-400 truncate">{ad.businessName}</p>}
                      {ad.linkUrl && (
                        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] text-navy-500 hover:text-gold-600 flex items-center gap-0.5 mt-0.5">
                          <ExternalLink size={9} /> {ad.linkUrl.replace(/^https?:\/\//, '').substring(0, 25)}...
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-mono">{ad.placement}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{ad.clickCount || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {ad.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(ad)} className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => toggleActive(ad)} title={ad.isActive ? 'Deactivate' : 'Activate'}
                          className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors">
                          {ad.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                        <button onClick={() => deleteAd(ad.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
