import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Eye, Tag, ChevronLeft, ChevronRight, User, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { NewsletterBox } from '../../components/common/UI';
import api from '../../utils/api';

// ── Blog Card ──────────────────────────────────────────────
const BlogCard = ({ blog }) => (
  <Link to={`/blog/${blog.slug}`} className="card group block overflow-hidden hover:shadow-lg transition-all duration-200">
    <div className="h-48 bg-gradient-to-br from-navy-800 to-navy-950 overflow-hidden">
      {blog.coverUrl ? (
        <img src={blog.coverUrl} alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full hero-pattern flex items-center justify-center">
          <span className="font-display text-5xl font-bold text-white/10">{blog.title?.[0]}</span>
        </div>
      )}
    </div>
    <div className="p-5">
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {blog.tags.slice(0, 2).map(t => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-50 text-gold-700 rounded-full text-[10px] font-medium">
              <Tag size={8} /> {t}
            </span>
          ))}
        </div>
      )}
      <h2 className="font-display font-semibold text-navy-900 text-lg leading-snug mb-2 group-hover:text-gold-600 transition-colors line-clamp-2">
        {blog.title}
      </h2>
      {blog.excerpt && (
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-3">{blog.excerpt}</p>
      )}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {blog.author?.name && (
            <span className="flex items-center gap-1">
              <User size={11} /> {blog.author.name}
            </span>
          )}
          {blog.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar size={11} /> {new Date(blog.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
        <span className="flex items-center gap-1">
          <Eye size={11} /> {blog.viewCount || 0}
        </span>
      </div>
    </div>
  </Link>
);

// ── Blog List Page ─────────────────────────────────────────
export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/blogs?page=${page}&limit=9`)
      .then(res => { setBlogs(res.data.data || []); setPagination(res.data.pagination || {}); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const featured = blogs[0];
  const rest = blogs.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-navy-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-2">Community & Business News</p>
          <h1 className="font-display text-4xl font-bold text-white mb-3">OzBiz Blog</h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            Tips, news, success stories and guides for the Indian business community in Australia.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && page === 1 && (
              <Link to={`/blog/${featured.slug}`} className="card group block overflow-hidden mb-10 hover:shadow-xl transition-all">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-navy-800 to-navy-950 overflow-hidden">
                    {featured.coverUrl ? (
                      <img src={featured.coverUrl} alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full hero-pattern flex items-center justify-center">
                        <span className="font-display text-8xl font-bold text-white/10">{featured.title?.[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="md:w-1/2 p-8 flex flex-col justify-center">
                    <span className="inline-block bg-gold-100 text-gold-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit">
                      ✦ Featured Post
                    </span>
                    {featured.tags?.length > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {featured.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                    <h2 className="font-display text-2xl font-bold text-navy-900 mb-3 group-hover:text-gold-600 transition-colors leading-snug">
                      {featured.title}
                    </h2>
                    {featured.excerpt && <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">{featured.excerpt}</p>}
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {featured.author?.name && <span className="flex items-center gap-1"><User size={11} /> {featured.author.name}</span>}
                      {featured.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {new Date(featured.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(page === 1 ? rest : blogs).map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </div>

            {/* Pagination */}
            {(pagination.totalPages || 0) > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-outline px-3 py-2 disabled:opacity-40">
                  <ChevronLeft size={16} />
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                      ${i + 1 === page ? 'bg-navy-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="btn-outline px-3 py-2 disabled:opacity-40">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <NewsletterBox />
      <Footer />
    </div>
  );
}

// ── Blog Detail Page ───────────────────────────────────────
export function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then(res => { setBlog(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Post Not Found</h2>
          <p className="text-slate-500 mb-6">This blog post may have been removed.</p>
          <Link to="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Cover */}
      {blog.coverUrl && (
        <div className="h-72 sm:h-96 overflow-hidden">
          <img src={blog.coverUrl} alt={blog.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <Link to="/blog" className="flex items-center gap-1.5 text-slate-500 hover:text-navy-700 text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Blog
        </Link>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-gold-50 text-gold-700 rounded-full text-xs font-medium">
                <Tag size={10} /> {t}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 leading-tight mb-4">{blog.title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-200">
          {blog.author && (
            <div className="flex items-center gap-2">
              {blog.author.avatarUrl
                ? <img src={blog.author.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                : <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center"><User size={14} className="text-navy-600" /></div>
              }
              <span className="font-medium text-navy-800">{blog.author.name}</span>
            </div>
          )}
          {blog.publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {new Date(blog.publishedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye size={13} /> {blog.viewCount || 0} views
          </span>
        </div>

        {/* Content */}
        <div className="prose prose-slate max-w-none prose-headings:font-display prose-a:text-navy-700 prose-blockquote:border-gold-400 prose-img:rounded-xl"
          style={{ lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
        />

        <div className="mt-10 pt-8 border-t border-slate-200">
          <Link to="/blog" className="btn-outline inline-flex items-center gap-2">
            <ArrowLeft size={15} /> More Articles
          </Link>
        </div>
      </div>

      <NewsletterBox />
      <Footer />
    </div>
  );
}
