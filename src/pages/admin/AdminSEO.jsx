// frontend/src/pages/admin/AdminSEO.jsx
import { useState } from 'react';
import { Save, Globe, FileText, Code, Settings, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminSEO() {
  const [metaTags, setMetaTags] = useState({
    title: 'OzBiz Directory - Indian Business Directory Australia',
    description: 'Find trusted Indian businesses, restaurants, and services across Australia. Discover verified listings, read reviews, and connect with local businesses.',
    keywords: 'indian business directory, australia indian businesses, indian restaurants, migration agents, accountants',
    ogTitle: 'OzBiz Directory',
    ogDescription: 'Discover Indian businesses across Australia',
    twitterCard: 'summary_large_image'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/admin/seo', metaTags);
      toast.success('SEO settings saved successfully');
    } catch (err) {
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  const generateSitemap = async () => {
    try {
      await api.post('/admin/generate-sitemap');
      toast.success('Sitemap generated successfully');
    } catch {
      toast.error('Failed to generate sitemap');
    }
  };

  const updateRobots = async () => {
    try {
      await api.post('/admin/update-robots', { content: 'User-agent: *\nAllow: /\nSitemap: https://ozbiz.com.au/sitemap.xml' });
      toast.success('Robots.txt updated');
    } catch {
      toast.error('Failed to update robots.txt');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">SEO Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage meta tags, sitemap, and SEO settings</p>
      </div>

      {/* Meta Tags Section */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-gold-500" />
          <h2 className="font-display text-lg font-semibold text-navy-900">Meta Tags</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Title</label>
            <input
              type="text"
              value={metaTags.title}
              onChange={(e) => setMetaTags({ ...metaTags, title: e.target.value })}
              className="input w-full"
              placeholder="Page title for SEO"
            />
            <p className="text-xs text-slate-400 mt-1">Recommended length: 50-60 characters</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Description</label>
            <textarea
              rows={3}
              value={metaTags.description}
              onChange={(e) => setMetaTags({ ...metaTags, description: e.target.value })}
              className="input w-full resize-none"
              placeholder="Brief description for search results"
            />
            <p className="text-xs text-slate-400 mt-1">Recommended length: 150-160 characters</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Keywords</label>
            <input
              type="text"
              value={metaTags.keywords}
              onChange={(e) => setMetaTags({ ...metaTags, keywords: e.target.value })}
              className="input w-full"
              placeholder="Comma separated keywords"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">OG Title</label>
              <input
                type="text"
                value={metaTags.ogTitle}
                onChange={(e) => setMetaTags({ ...metaTags, ogTitle: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Twitter Card</label>
              <select
                value={metaTags.twitterCard}
                onChange={(e) => setMetaTags({ ...metaTags, twitterCard: e.target.value })}
                className="input w-full"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sitemap & Robots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-blue-500" />
            <h2 className="font-display text-lg font-semibold text-navy-900">Sitemap</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Generate XML sitemap for search engines to crawl your site</p>
          <button onClick={generateSitemap} className="btn-primary text-sm px-4 py-2">
            Generate Sitemap
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Code size={20} className="text-purple-500" />
            <h2 className="font-display text-lg font-semibold text-navy-900">Robots.txt</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Control how search engines crawl your website</p>
          <button onClick={updateRobots} className="btn-outline text-sm px-4 py-2">
            Update Robots.txt
          </button>
        </div>
      </div>

      {/* Analytics Config */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-green-500" />
          <h2 className="font-display text-lg font-semibold text-navy-900">Analytics Configuration</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Google Analytics ID</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Google Tag Manager ID</label>
            <input
              type="text"
              placeholder="GTM-XXXXXX"
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Pixel ID</label>
            <input
              type="text"
              placeholder="XXXXXXXXXXXXX"
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-2 flex items-center gap-2">
          {saving ? 'Saving...' : <Save size={16} />}
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </div>
  );
}