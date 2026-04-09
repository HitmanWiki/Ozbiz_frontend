// frontend/src/pages/admin/AdminSEO.jsx
import { useState, useEffect } from 'react';
import { Save, Globe, FileText, Code, Settings, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminSEO() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [metaTags, setMetaTags] = useState({
    siteTitle: 'OzBiz Directory - Indian Business Directory Australia',
    siteDescription: 'Find trusted Indian businesses, restaurants, and services across Australia. Discover verified listings, read reviews, and connect with local businesses.',
    siteKeywords: 'indian business directory, australia indian businesses, indian restaurants, migration agents, accountants',
    ogTitle: 'OzBiz Directory',
    ogDescription: 'Discover Indian businesses across Australia',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    canonicalUrl: '',
    robots: 'index, follow'
  });
  
  const [analytics, setAnalytics] = useState({
    googleAnalyticsId: '',
    googleTagManagerId: '',
    metaPixelId: ''
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    try {
      const res = await api.get('/admin/seo');
      if (res.data) {
        setMetaTags(res.data.metaTags || metaTags);
        setAnalytics(res.data.analytics || analytics);
      }
    } catch (err) {
      console.error('Error fetching SEO settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSEO = async () => {
    setSaving(true);
    try {
      await api.post('/admin/seo', { metaTags, analytics });
      toast.success('SEO settings saved successfully');
    } catch (err) {
      toast.error('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  const generateSitemap = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/admin/generate-sitemap');
      toast.success(res.data.message || 'Sitemap generated successfully');
    } catch (err) {
      toast.error('Failed to generate sitemap');
    } finally {
      setGenerating(false);
    }
  };

  const updateRobots = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/admin/update-robots', { 
        content: `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /vendor\nSitemap: https://ozbiz.com.au/sitemap.xml` 
      });
      toast.success(res.data.message || 'Robots.txt updated');
    } catch (err) {
      toast.error('Failed to update robots.txt');
    } finally {
      setGenerating(false);
    }
  };

  const previewSite = () => {
    window.open('/', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">SEO Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage meta tags, sitemap, robots.txt, and analytics configuration</p>
        </div>
        <button onClick={previewSite} className="btn-outline text-sm flex items-center gap-2">
          <ExternalLink size={14} /> Preview Site
        </button>
      </div>

      {/* Meta Tags Section */}
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-amber-500" />
          <h2 className="font-display text-lg font-semibold text-navy-900">Meta Tags</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Site Title</label>
            <input
              type="text"
              value={metaTags.siteTitle}
              onChange={(e) => setMetaTags({ ...metaTags, siteTitle: e.target.value })}
              className="input w-full"
              placeholder="Site title for SEO"
            />
            <p className="text-xs text-slate-400 mt-1">Recommended length: 50-60 characters. Current: {metaTags.siteTitle.length} chars</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Description</label>
            <textarea
              rows={3}
              value={metaTags.siteDescription}
              onChange={(e) => setMetaTags({ ...metaTags, siteDescription: e.target.value })}
              className="input w-full resize-none"
              placeholder="Brief description for search results"
            />
            <p className="text-xs text-slate-400 mt-1">Recommended length: 150-160 characters. Current: {metaTags.siteDescription.length} chars</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Keywords</label>
            <input
              type="text"
              value={metaTags.siteKeywords}
              onChange={(e) => setMetaTags({ ...metaTags, siteKeywords: e.target.value })}
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
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Robots Directive</label>
            <select
              value={metaTags.robots}
              onChange={(e) => setMetaTags({ ...metaTags, robots: e.target.value })}
              className="input w-full"
            >
              <option value="index, follow">index, follow</option>
              <option value="index, nofollow">index, nofollow</option>
              <option value="noindex, follow">noindex, follow</option>
              <option value="noindex, nofollow">noindex, nofollow</option>
            </select>
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
          <p className="text-sm text-slate-500 mb-4">Generate XML sitemap for search engines to crawl your site. Includes all listings, categories, and blog posts.</p>
          <button 
            onClick={generateSitemap} 
            disabled={generating}
            className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
          >
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <FileText size={14} />}
            {generating ? 'Generating...' : 'Generate Sitemap'}
          </button>
          <p className="text-xs text-slate-400 mt-3">Sitemap URL: <code className="bg-slate-100 px-1 rounded">/sitemap.xml</code></p>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Code size={20} className="text-purple-500" />
            <h2 className="font-display text-lg font-semibold text-navy-900">Robots.txt</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Control how search engines crawl your website. Disallow admin and API routes.</p>
          <button onClick={updateRobots} disabled={generating} className="btn-outline text-sm px-4 py-2 flex items-center gap-2">
            {generating ? <RefreshCw size={14} className="animate-spin" /> : <Code size={14} />}
            Update Robots.txt
          </button>
          <p className="text-xs text-slate-400 mt-3">Robots URL: <code className="bg-slate-100 px-1 rounded">/robots.txt</code></p>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Google Analytics ID (GA4)</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={analytics.googleAnalyticsId}
              onChange={(e) => setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })}
              className="input w-full"
            />
            <p className="text-xs text-slate-400 mt-1">Format: G- followed by 10 characters</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Google Tag Manager ID</label>
            <input
              type="text"
              placeholder="GTM-XXXXXX"
              value={analytics.googleTagManagerId}
              onChange={(e) => setAnalytics({ ...analytics, googleTagManagerId: e.target.value })}
              className="input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Meta Pixel ID</label>
            <input
              type="text"
              placeholder="XXXXXXXXXXXXX"
              value={analytics.metaPixelId}
              onChange={(e) => setAnalytics({ ...analytics, metaPixelId: e.target.value })}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSaveSEO} disabled={saving} className="btn-primary px-6 py-2 flex items-center gap-2">
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save SEO Settings'}
        </button>
      </div>
    </div>
  );
}