// frontend/src/pages/public/ListingsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Search, MapPin, SlidersHorizontal, X, Star, Clock, 
  ChevronLeft, ChevronRight, Filter, Briefcase, Award,
  TrendingUp, ThumbsUp, Zap
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ListingCard from '../../components/public/ListingCard';
import { ProfessionalAd } from '../../components/common/ProfessionalAd';
import { NewsletterBox } from '../../components/common/UI';
import api from '../../utils/api';

const CITIES = ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast', 'Hobart'];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'featured', label: 'Featured First' },
  { value: 'newest', label: 'Newest First' },
];

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-40 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  </div>
);

export default function ListingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [sidebarAds, setSidebarAds] = useState([]);
  
  // Filters
  const [search, setSearch] = useState(queryParams.get('search') || '');
  const [city, setCity] = useState(queryParams.get('city') || '');
  const [category, setCategory] = useState(queryParams.get('category') || '');
  const [minRating, setMinRating] = useState(queryParams.get('rating') || '');
  const [sortBy, setSortBy] = useState(queryParams.get('sort') || 'relevance');
  const [showFilters, setShowFilters] = useState(false);
  
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchListings();
    fetchSidebarAds();
  }, [location.search]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (city) params.append('city', city);
      if (category) params.append('category', category);
      if (minRating) params.append('minRating', minRating);
      if (sortBy) params.append('sort', sortBy);
      params.append('page', pagination.page);
      params.append('limit', 12);
      
      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSidebarAds = async () => {
    try {
      const res = await api.get('/ads?placement=sidebar_left');
      setSidebarAds(res.data || []);
    } catch (err) {
      console.error('Error fetching ads:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateUrl();
  };

  const updateUrl = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    if (minRating) params.set('rating', minRating);
    if (sortBy && sortBy !== 'relevance') params.set('sort', sortBy);
    navigate(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setCity('');
    setCategory('');
    setMinRating('');
    setSortBy('relevance');
    navigate('/listings');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      {/* Hero Header */}
      <div className="bg-navy-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Browse Local Businesses
          </h1>
          <p className="text-white/60 text-sm">
            Discover trusted businesses serving the Indian community across Australia
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus-within:border-gold-400 focus-within:bg-white transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search businesses, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-navy-900"
              />
            </div>
            
            <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200 focus-within:border-gold-400 focus-within:bg-white transition-all">
              <MapPin size={18} className="text-slate-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent outline-none text-sm text-navy-900 pr-6 cursor-pointer"
              >
                <option value="">All Cities</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <button type="submit" className="btn-primary px-6 py-2">
              Search
            </button>
            
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline px-4 py-2 flex items-center gap-2"
            >
              <Filter size={16} />
              Filters
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 shrink-0 space-y-5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy-900">Filters</h3>
                {(search || city || category || minRating) && (
                  <button onClick={clearFilters} className="text-xs text-gold-600 hover:text-gold-700">
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full input text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Minimum Rating</label>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map(r => (
                    <button
                      key={r}
                      onClick={() => setMinRating(minRating === r.toString() ? '' : r.toString())}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        minRating === r.toString()
                          ? 'bg-gold-400 text-navy-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {r}+ <Star size={10} className="inline fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                  updateUrl();
                  setShowFilters(false);
                }}
                className="w-full btn-primary text-sm py-2"
              >
                Apply Filters
              </button>
            </div>
            
            {/* Sidebar Ads */}
            {sidebarAds.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Sponsored</p>
                {sidebarAds.map(ad => (
                  <ProfessionalAd key={ad.id} ad={ad} variant="sidebar" />
                ))}
              </div>
            )}
          </div>
          
          {/* Results Area */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-navy-900">{listings.length}</span> of{' '}
                <span className="font-semibold text-navy-900">{pagination.total}</span> results
              </p>
              
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-500">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setTimeout(() => updateUrl(), 100);
                  }}
                  className="input text-sm py-1.5"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === pagination.page
                              ? 'bg-navy-800 text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-display text-xl font-semibold text-navy-900 mb-2">No results found</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <NewsletterBox />
      <Footer />
    </div>
  );
}