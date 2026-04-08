import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ListingCard from '../../components/public/ListingCard';
import { AdBanner } from '../../components/common/UI';
import api from '../../utils/api';

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-40 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

export default function CategoryPage() {
  const { slug } = useParams();
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState(null);
  const [pagination, setPagination] = useState({});
  const [bannerAd, setBannerAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/categories'),
      api.get(`/listings?category=${slug}&page=${page}&limit=12`),
      api.get('/ads?placement=category'),
    ]).then(([catRes, listRes, adRes]) => {
      const cat = catRes.data.find(c => c.slug === slug);
      setCategory(cat);
      setListings(listRes.data.data || []);
      setPagination(listRes.data.pagination || {});
      setBannerAd((adRes.data || [])[0] || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug, page]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Category hero */}
      <div className="bg-navy-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link to="/listings" className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-4 transition-colors w-fit">
            <ChevronLeft size={14} /> All Categories
          </Link>
          {category ? (
            <div>
              <p className="text-gold-400 text-sm font-medium mb-1">Browse Category</p>
              <h1 className="font-display text-3xl font-bold text-white">{category.name}</h1>
              {category.description && <p className="text-white/60 text-sm mt-2 max-w-xl">{category.description}</p>}
              <p className="text-white/40 text-xs mt-2">{pagination.total || 0} businesses found</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="h-7 bg-white/10 rounded animate-pulse w-64" />
              <div className="h-4 bg-white/10 rounded animate-pulse w-48" />
            </div>
          )}
        </div>
      </div>

      {/* Banner ad */}
      {bannerAd && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <AdBanner ad={bannerAd} className="h-24 sm:h-32" />
        </div>
      )}

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg mb-4">No listings in this category yet.</p>
            <Link to="/add-listing" className="btn-primary">Be the first — Add Your Business</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>

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
      <Footer />
    </div>
  );
}
