import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Globe, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const EMPTY = { title: '', content: '', excerpt: '', coverUrl: '', tags: '', status: 'draft' };

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const fetch = async () => {
    setLoading(true);
    try { setBlogs((await api.get('/admin/blogs')).data || []); }
    catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Title and content are required');
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
      if (editingId) {
        await api.put(`/admin/blogs/${editingId}`, payload);
        toast.success('Blog updated');
      } else {
        await api.post('/admin/blogs', payload);
        toast.success('Blog created');
      }
      setShowForm(false); setEditingId(null); setForm(EMPTY); fetch();
    } catch { toast.error('Failed to save blog'); }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Delete this blog post?')) return;
    try { await api.delete(`/admin/blogs/${id}`); fetch(); toast.success('Deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const startEdit = (blog) => {
    setForm({
      title: blog.title, content: blog.content, excerpt: blog.excerpt || '',
      coverUrl: blog.coverUrl || '', tags: (blog.tags || []).join(', '), status: blog.status,
    });
    setEditingId(blog.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStatus = async (blog) => {
    try {
      await api.put(`/admin/blogs/${blog.id}`, { status: blog.status === 'published' ? 'draft' : 'published' });
      fetch(); toast.success(`Blog ${blog.status === 'published' ? 'unpublished' : 'published'}`);
    } catch { toast.error('Failed to update'); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Blog Posts</h1>
          <p className="text-slate-500 text-sm">{blogs.length} posts · {blogs.filter(b => b.status === 'published').length} published</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY); }}
          className="btn-primary text-sm px-4 py-2">
          <Plus size={15} /> {showForm && !editingId ? 'Cancel' : 'New Post'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-navy-900 mb-5">{editingId ? 'Edit Post' : 'New Blog Post'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Title *</label>
                <input required value={form.title} onChange={set('title')} placeholder="Enter blog post title" className="input" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Excerpt (shown in card)</label>
                <input value={form.excerpt} onChange={set('excerpt')} placeholder="Brief summary shown on blog listing page" className="input" maxLength={300} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Cover Image URL</label>
                <input value={form.coverUrl} onChange={set('coverUrl')} placeholder="https://..." className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Tags (comma separated)</label>
                <input value={form.tags} onChange={set('tags')} placeholder="business, migration, tips" className="input text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Status</label>
                <select value={form.status} onChange={set('status')} className="input text-sm">
                  <option value="draft">Draft (not visible)</option>
                  <option value="published">Published (live)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Content * <span className="normal-case font-normal text-slate-400">(supports basic HTML)</span></label>
              <textarea required rows={16} value={form.content} onChange={set('content')}
                placeholder="Write your blog post content here. You can use HTML tags like <h2>, <p>, <strong>, <ul>, <li>, <a href='...'> etc."
                className="input resize-y font-mono text-sm" />
              <p className="text-xs text-slate-400 mt-1">Supports HTML. Use &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;&lt;li&gt;, &lt;img src="..."&gt;, etc.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary text-sm px-6 py-2.5">Save Post</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-outline text-sm px-4 py-2.5">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Blog list */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Title', 'Author', 'Tags', 'Views', 'Status', 'Published', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-200 rounded w-24" /></td>)}
                </tr>
              ))
            ) : blogs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm">No blog posts yet. Create your first post above.</td></tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 max-w-[220px]">
                    <div className="flex items-start gap-2">
                      {blog.coverUrl
                        ? <img src={blog.coverUrl} alt="" className="w-10 h-10 rounded object-cover shrink-0 border border-slate-100" />
                        : <div className="w-10 h-10 rounded bg-navy-100 flex items-center justify-center shrink-0"><FileText size={16} className="text-navy-400" /></div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy-900 line-clamp-2 leading-snug">{blog.title}</p>
                        {blog.excerpt && <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{blog.excerpt}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{blog.author?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(blog.tags || []).slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{blog.viewCount || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                    {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-AU') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {blog.status === 'published' && (
                        <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors" title="View">
                          <Eye size={15} />
                        </a>
                      )}
                      <button onClick={() => startEdit(blog)} className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => toggleStatus(blog)}
                        className="p-1.5 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title={blog.status === 'published' ? 'Unpublish' : 'Publish'}>
                        <Globe size={15} />
                      </button>
                      <button onClick={() => deleteBlog(blog.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
  );
}
