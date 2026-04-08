import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, MapPin, TrendingUp, Shield, Users, Award, ChevronRight,
  Utensils, Heart, GraduationCap, Briefcase, Wrench, Sparkles, Car,
  Home, Landmark, Monitor, Plane, ShoppingBag, Star, Globe
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ListingCard from '../../components/public/ListingCard';
import ProductCard from '../../components/public/ProductCard';
import { AdBanner, SectionHeader, NewsletterBox } from '../../components/common/UI';
import { ProfessionalAd } from '../../components/common/ProfessionalAd';
import api from '../../utils/api';

const ICON_MAP = {
  utensils: Utensils, 'heart-pulse': Heart, 'graduation-cap': GraduationCap,
  briefcase: Briefcase, wrench: Wrench, sparkles: Sparkles, car: Car,
  home: Home, 'home-heart': Home, landmark: Landmark, monitor: Monitor,
  'party-popper': Sparkles, plane: Plane, 'shopping-bag': ShoppingBag,
  star: Star, globe: Globe,
};
const CITIES = ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast', 'Hobart'];
const STATS = [
  { label: 'Businesses Listed', value: '5,000+', icon: Briefcase },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
  { label: 'Monthly Visitors', value: '100K+', icon: Users },
  { label: 'Categories', value: '200+', icon: Award },
];

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="h-40 bg-slate-200" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [mostVisited, setMostVisited] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroAds, setHeroAds] = useState([]);
  const [sidebarAds, setSidebarAds] = useState([]);
  const [bannerAd, setBannerAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/listings?featured=true&limit=6'),
      api.get('/homepage/most-visited'),
      api.get('/homepage/featured-products'),
      api.get('/ads?placement=hero_top'),
      api.get('/ads?placement=sidebar_left'),
      api.get('/ads?placement=banner_mid'),
    ]).then(([cats, feat, visited, prods, heroRes, sideRes, banRes]) => {
      setCategories(cats.data || []);
      setFeatured(feat.data.data || []);
      setMostVisited(visited.data || []);
      setFeaturedProducts(prods.data || []);
      setHeroAds(heroRes.data || []);
      setSidebarAds(sideRes.data || []);
      setBannerAd((banRes.data || [])[0] || null);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (city) params.set('city', city);
    navigate(`/listings?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/20 to-navy-900" />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-gold-400/5 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gold-400/20 border border-gold-400/30 rounded-full px-4 py-1.5 mb-6">
                <Star size={12} className="text-gold-400 fill-current" />
                <span className="text-gold-300 text-xs font-medium">Australia's #1 Indian Business Directory</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                Find Indian Businesses<br />
                <span className="text-gold-400">Across Australia</span>
              </h1>
              <p className="text-white/65 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 mb-10">
                Discover trusted Indian businesses, restaurants, professionals and services in Melbourne, Sydney, Brisbane, Perth and beyond.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto lg:mx-0">
                <div className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0">
                    <Search size={16} className="text-slate-400 shrink-0" />
                    <input type="text" placeholder="Search businesses, services..."
                      value={search} onChange={e => setSearch(e.target.value)}
                      className="flex-1 text-sm outline-none text-navy-900 placeholder-slate-400 bg-transparent py-2" />
                  </div>
                  <div className="flex items-center gap-3 px-4 pb-2 sm:pb-0">
                    <MapPin size={16} className="text-slate-400 shrink-0" />
                    <select value={city} onChange={e => setCity(e.target.value)}
                      className="text-sm outline-none text-navy-900 bg-transparent py-2 pr-2 cursor-pointer">
                      <option value="">All Cities</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <button type="submit"
                    className="bg-navy-800 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors flex items-center gap-2 justify-center">
                    <Search size={15} /> Search
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-5">
                {['Indian Restaurants', 'Migration Agents', 'Accountants', 'Doctors', 'Grocery Stores'].map(tag => (
                  <button key={tag} onClick={() => navigate(`/listings?search=${encodeURIComponent(tag)}`)}
                    className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 transition-all">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero sidebar ads */}
            {heroAds.length > 0 && (
  <div className="lg:w-72 shrink-0 space-y-3">
    {heroAds.slice(0, 2).map(ad => (
      <ProfessionalAd key={ad.id} ad={ad} variant="card" />
    ))}
  </div>
)}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-navy-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2"><Icon size={20} className="text-gold-400" /></div>
                <div className="font-display font-bold text-2xl text-white">{value}</div>
                <div className="text-white/60 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader label="Explore" title="Browse by Category" action="View All" actionHref="/listings" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.slice(0, 16).map(cat => {
              const Icon = ICON_MAP[cat.icon] || Briefcase;
              return (
                <Link key={cat.id} to={`/category/${cat.slug}`}
                  className="group flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 hover:border-gold-300 hover:bg-gold-50 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-navy-50 group-hover:bg-gold-100 flex items-center justify-center mb-2.5 transition-colors">
                    <Icon size={22} className="text-navy-700 group-hover:text-gold-700 transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-navy-700 leading-tight line-clamp-2">{cat.name}</span>
                  {cat.listingCount > 0 && (
                    <span className="text-[10px] text-slate-400 mt-0.5">{cat.listingCount}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mid Banner Ad ── */}
     {bannerAd && (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
    <ProfessionalAd ad={bannerAd} variant="banner" />
  </div>
)}

      {/* ── Featured Listings ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader label="Spotlight" title="Featured Businesses" action="View All" actionHref="/listings?featured=true" />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12">No featured listings yet.</p>
          )}
        </div>
      </section>

      {/* ── Most Visited ── */}
      {mostVisited.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader label="Trending" title="Most Visited Businesses" action="Browse All" actionHref="/listings?sort=views" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {mostVisited.slice(0, 8).map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products / Services ── */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <SectionHeader label="Products & Services" title="Featured Offers" action="Browse Listings" actionHref="/listings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.slice(0, 8).map(p => (
                <ProductCard key={p.id} product={p} showListing />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Sidebar Ads + Browse by City ── */}
      <section className="py-16 bg-navy-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* City browser */}
            <div className="flex-1">
              <div className="mb-8">
                <p className="text-gold-400 text-sm font-semibold uppercase tracking-wider mb-1">Locations</p>
                <h2 className="font-display text-3xl font-bold text-white">Browse by City</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CITIES.map(c => (
                  <Link key={c} to={`/listings?city=${c}`}
                    className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-gold-400/20 hover:border-gold-400/40 transition-all text-center group">
                    <MapPin size={20} className="text-gold-400 mb-2" />
                    <span className="text-white text-sm font-medium group-hover:text-gold-300">{c}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar ads */}
            {sidebarAds.length > 0 && (
              <div className="lg:w-64 shrink-0 space-y-4">
                <h3 className="text-white/50 text-xs uppercase tracking-wider font-semibold">Sponsored</h3>
                {sidebarAds.slice(0, 3).map(ad => (
                  <AdBanner key={ad.id} ad={ad} className="rounded-xl overflow-hidden" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Why OzBiz ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-1">Why Choose Us</p>
            <h2 className="font-display text-3xl font-bold text-navy-900">The Trusted Indian Business Directory</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Verified Businesses', desc: 'All businesses are manually reviewed before going live.' },
              { icon: TrendingUp, title: 'Grow Your Business', desc: 'Get discovered by thousands of Indian Australians daily.' },
              { icon: Users, title: 'Community Driven', desc: 'Read genuine reviews from the Indian Australian community.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon size={28} className="text-navy-700" />
                </div>
                <h3 className="font-display font-semibold text-xl text-navy-900 mb-3">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <NewsletterBox />

      <Footer />
    </div>
  );
}
