// frontend/src/pages/public/ListingDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Globe, CheckCircle, Zap, Share2, Send,
  ChevronRight, Facebook, Instagram, Twitter, Linkedin, Youtube,
  MessageCircle, Tag, ImageIcon, Star, Clock, X, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import ProductCard from '../../components/public/ProductCard';
import { StarRating, StarPicker } from '../../components/common/UI';
import api from '../../utils/api';

const InfoRow = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 bg-navy-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-navy-600" />
    </div>
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer"
          className="text-sm font-medium text-navy-700 hover:text-gold-600 break-all transition-colors">
          {value}
        </a>
      ) : <p className="text-sm font-medium text-navy-900 break-all">{value}</p>}
    </div>
  </div>
);

const SocialLink = ({ href, icon: Icon, label, color }) => {
  if (!href) return null;
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${color}`}
      title={label}>
      <Icon size={16} />
    </a>
  );
};

// Similar Listings Component
const SimilarListingCard = ({ listing }) => (
  <Link to={`/listings/${listing.slug}`} className="group block">
    <div className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all">
      <div className="w-16 h-16 rounded-lg bg-navy-100 overflow-hidden shrink-0">
        {listing.logoUrl ? (
          <img src={listing.logoUrl} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-navy-600 font-bold text-xl">
            {listing.title?.[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-navy-900 group-hover:text-gold-600 line-clamp-1">{listing.title}</h4>
        {listing.city && (
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <MapPin size={10} /> {listing.city}
          </p>
        )}
        {listing.ratingCount > 0 && (
          <div className="mt-1">
            <StarRating rating={listing.ratingAvg} size={10} />
          </div>
        )}
      </div>
    </div>
  </Link>
);

export default function ListingDetailPage() {
  const { slug } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [lightboxImg, setLightboxImg] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!currentUser?.token;

  const [enquiryForm, setEnquiryForm] = useState({ 
    sender_name: currentUser?.name || '', 
    sender_email: currentUser?.email || '', 
    sender_phone: '', 
    subject: '', 
    message: '' 
  });
  
  const [reviewForm, setReviewForm] = useState({ 
    rating: 5, 
    title: '', 
    body: '', 
    reviewer_name: currentUser?.name || '', 
    reviewer_email: currentUser?.email || '' 
  });

  useEffect(() => {
    fetchListingData();
    if (isAuthenticated) {
      checkSavedStatus();
    }
  }, [slug, isAuthenticated]);

  const fetchListingData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/listings/${slug}`);
      setListing(res.data);
      
      if (res.data.categoryId) {
        const similarRes = await api.get(`/listings?category=${res.data.categoryId}&limit=5`);
        setSimilarListings(similarRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const checkSavedStatus = async () => {
    try {
      const res = await api.get('/user/favorites');
      setIsSaved(res.data.some(fav => fav.listingId === listing?.id));
    } catch (err) {
      console.log('Favorites feature ready');
    }
  };

  const handleSaveFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/user/favorites/${listing.id}`);
        toast.success('Removed from favorites');
      } else {
        await api.post('/user/favorites', { listingId: listing.id });
        toast.success('Added to favorites');
      }
      setIsSaved(!isSaved);
    } catch (err) {
      toast.error('Failed to update favorites');
    }
  };

  const handleEnquiry = async (e) => {
    e.preventDefault();
    if (!enquiryForm.sender_name || !enquiryForm.sender_email || !enquiryForm.message) {
      return toast.error('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      await api.post(`/listings/${listing.id}/enquiry`, enquiryForm);
      toast.success("Enquiry sent! You'll receive a confirmation email.");
      setEnquiryForm({ 
        sender_name: currentUser?.name || '', 
        sender_email: currentUser?.email || '', 
        sender_phone: '', 
        subject: '', 
        message: '' 
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.reviewer_name || !reviewForm.reviewer_email || !reviewForm.body) {
      return toast.error('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      await api.post(`/listings/${listing.id}/reviews`, reviewForm);
      toast.success('Review submitted for moderation!');
      setShowReviewForm(false);
      setReviewForm({ 
        rating: 5, 
        title: '', 
        body: '', 
        reviewer_name: currentUser?.name || '', 
        reviewer_email: currentUser?.email || '' 
      });
      fetchListingData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulReview = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      toast.success('Thanks for your feedback!');
      fetchListingData();
    } catch (err) {
      toast.error('Failed to mark as helpful');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Listing Not Found</h2>
          <p className="text-slate-500 mb-6">This listing may have been removed.</p>
          <Link to="/listings" className="btn-primary">Browse Listings</Link>
        </div>
      </div>
    </div>
  );

  const address = [listing.address, listing.suburb, listing.city, listing.state, listing.postcode].filter(Boolean).join(', ');
  
  // IMPROVED: Better image handling from multiple sources
  const logoImage = listing.logoUrl || listing.images?.find(i => i.type === 'logo')?.url || null;
  const coverImage = listing.coverUrl || listing.images?.find(i => i.type === 'cover' || i.type === 'banner')?.url || null;
  
  // Gallery images - exclude logo and cover from gallery to avoid duplication
  const galleryImages = listing.images?.filter(i => 
    i.type === 'gallery' || i.type === 'office' || i.type === 'product'
  ) || [];
  
  const allGallery = [...galleryImages];
  const hasGallery = allGallery.length > 0;

  const hasSocial = listing.socialFacebook || listing.socialInstagram || listing.socialTwitter ||
    listing.socialLinkedin || listing.socialYoutube || listing.socialWhatsapp;

  // Safe parsing of businessHours
  const businessHours = (() => {
    if (!listing.businessHours) return null;
    if (typeof listing.businessHours === 'object') return listing.businessHours;
    try {
      return JSON.parse(listing.businessHours);
    } catch (e) {
      console.error('Error parsing business hours:', e);
      return null;
    }
  })();

  const isOpenNow = () => {
    if (!businessHours) return null;
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const day = days[now.getDay()];
    const hours = businessHours[day];
    if (!hours || hours === 'Closed') return false;
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openTime, closeTime] = hours.split('-').map(t => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    });
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    ...(listing.products?.length > 0 ? [{ id: 'products', label: `Products (${listing.products.length})` }] : []),
    ...(hasGallery ? [{ id: 'photos', label: `Photos (${allGallery.length})` }] : []),
    { id: 'reviews', label: `Reviews (${listing.reviews?.length || 0})` },
    ...(similarListings.length > 0 ? [{ id: 'similar', label: 'Similar' }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link to="/" className="hover:text-navy-700">Home</Link>
          <ChevronRight size={12} />
          <Link to="/listings" className="hover:text-navy-700">Listings</Link>
          {listing.category && (
            <><ChevronRight size={12} />
              <Link to={`/category/${listing.category.slug}`} className="hover:text-navy-700">
                {listing.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-navy-700 line-clamp-1">{listing.title}</span>
        </div>
      </div>

      {/* Cover Image - IMPROVED */}
      <div className="h-60 sm:h-80 relative overflow-hidden bg-gradient-to-br from-navy-800 to-navy-950">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={listing.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `
                <div class="w-full h-full hero-pattern flex items-center justify-center">
                  <span class="font-display text-9xl font-bold text-white/10">${listing.title?.[0] || 'O'}</span>
                </div>
              `;
            }}
          />
        ) : (
          <div className="w-full h-full hero-pattern flex items-center justify-center">
            <span className="font-display text-9xl font-bold text-white/10">{listing.title?.[0] || 'O'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header card with Logo - IMPROVED */}
            <div className="card p-6 mb-6 -mt-16 relative z-10 shadow-lg">
              <div className="flex items-start gap-4">
                {logoImage ? (
                  <img 
                    src={logoImage} 
                    alt={listing.title} 
                    className="w-20 h-20 rounded-xl border-2 border-white shadow object-contain bg-white shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-20 h-20 rounded-xl bg-navy-800 flex items-center justify-center shrink-0">
                          <span class="font-display text-3xl font-bold text-white">${listing.title?.[0] || 'O'}</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-navy-800 flex items-center justify-center shrink-0">
                    <span className="font-display text-3xl font-bold text-white">{listing.title?.[0] || 'O'}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {listing.isFeatured && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold-100 text-gold-700 gap-1"><Zap size={10} className="fill-current" /> Featured</span>}
                    {listing.isVerified && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 gap-1"><CheckCircle size={10} /> Verified</span>}
                    {listing.category && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-navy-100 text-navy-700">{listing.category.name}</span>}
                    {businessHours && isOpenNow() && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 gap-1">
                        <Clock size={10} /> Open Now
                      </span>
                    )}
                  </div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 leading-tight">{listing.title}</h1>
                  {Number(listing.ratingCount) > 0 && (
                    <div className="mt-2">
                      <StarRating rating={listing.ratingAvg} count={listing.ratingCount} size={16} />
                    </div>
                  )}
                  {address && (
                    <p className="text-slate-500 text-sm mt-2 flex items-center gap-1.5">
                      <MapPin size={13} className="text-gold-500 shrink-0" />{address}
                    </p>
                  )}

                  <button 
                    onClick={handleSaveFavorite}
                    className={`mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
                      isSaved ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Heart size={14} className={isSaved ? 'fill-current' : ''} />
                    {isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
                  </button>

                  {hasSocial && (
                    <div className="flex gap-2 mt-3">
                      <SocialLink href={listing.socialFacebook} icon={Facebook} label="Facebook" color="bg-blue-100 text-blue-700 hover:bg-blue-200" />
                      <SocialLink href={listing.socialInstagram} icon={Instagram} label="Instagram" color="bg-pink-100 text-pink-700 hover:bg-pink-200" />
                      <SocialLink href={listing.socialTwitter} icon={Twitter} label="Twitter/X" color="bg-slate-100 text-slate-700 hover:bg-slate-200" />
                      <SocialLink href={listing.socialLinkedin} icon={Linkedin} label="LinkedIn" color="bg-blue-100 text-blue-800 hover:bg-blue-200" />
                      <SocialLink href={listing.socialYoutube} icon={Youtube} label="YouTube" color="bg-red-100 text-red-700 hover:bg-red-200" />
                      {listing.socialWhatsapp && (
                        <a href={`https://wa.me/${listing.socialWhatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center transition-all hover:scale-110" title="WhatsApp">
                          <MessageCircle size={16} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto mb-5 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === t.id ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Overview tab */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {listing.description && (
                  <div className="card p-6">
                    <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">About this Business</h2>
                    <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</div>
                  </div>
                )}
                
                {businessHours && (
                  <div className="card p-6">
                    <h2 className="font-display text-xl font-semibold text-navy-900 mb-4 flex items-center gap-2">
                      <Clock size={18} /> Business Hours
                    </h2>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(businessHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between py-1.5 border-b border-slate-50">
                          <span className="capitalize font-medium text-slate-600">{day}</span>
                          <span className="text-slate-500">{hours || 'Closed'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {listing.tags?.length > 0 && (
                  <div className="card p-6">
                    <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Services & Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Products tab */}
            {activeTab === 'products' && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Products & Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {listing.products?.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {/* Photos tab */}
            {activeTab === 'photos' && hasGallery && (
              <div className="card p-5">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Photo Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allGallery.map((img, i) => (
                    <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setLightboxImg(img.url)}>
                      <img src={img.url} alt={img.caption || `Photo ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ImageIcon size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2">
                          <p className="text-white text-[10px] capitalize">{img.type}: {img.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === 'reviews' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-semibold text-navy-900">Customer Reviews</h2>
                  <button onClick={() => setShowReviewForm(!showReviewForm)} className="btn-outline text-xs px-4 py-2">
                    Write a Review
                  </button>
                </div>

                {showReviewForm && (
                  <form onSubmit={handleReview} className="bg-slate-50 rounded-xl p-5 mb-6 space-y-3">
                    <h3 className="font-semibold text-sm text-navy-900">Your Review</h3>
                    <StarPicker value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="Your name *" value={reviewForm.reviewer_name}
                        onChange={e => setReviewForm(f => ({ ...f, reviewer_name: e.target.value }))} className="input text-sm" />
                      <input placeholder="Your email *" value={reviewForm.reviewer_email}
                        onChange={e => setReviewForm(f => ({ ...f, reviewer_email: e.target.value }))} className="input text-sm" />
                    </div>
                    <input placeholder="Review title" value={reviewForm.title}
                      onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} className="input text-sm" />
                    <textarea rows={3} placeholder="Share your experience..." value={reviewForm.body}
                      onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))} className="input text-sm resize-none" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={submitting} className="btn-primary text-xs px-4 py-2">
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button type="button" onClick={() => setShowReviewForm(false)} className="btn-outline text-xs px-4 py-2">Cancel</button>
                    </div>
                  </form>
                )}

                {listing.reviews?.length > 0 ? (
                  listing.reviews.map(review => (
                    <div key={review.id} className="border-b border-slate-100 py-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-navy-900">{review.reviewerName || review.user?.name || 'Anonymous'}</p>
                          <StarRating rating={review.rating} size={12} />
                        </div>
                        <span className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-AU')}</span>
                      </div>
                      {review.title && <p className="font-medium text-sm text-navy-800 mb-1">{review.title}</p>}
                      {review.body && <p className="text-sm text-slate-600 leading-relaxed mb-2">{review.body}</p>}
                      
                      <button 
                        onClick={() => handleHelpfulReview(review.id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-navy-600 transition-colors"
                      >
                        👍 Helpful ({review.helpfulCount || 0})
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm text-center py-8">No reviews yet. Be the first to review!</p>
                )}
              </div>
            )}

            {/* Similar Listings tab */}
            {activeTab === 'similar' && similarListings.length > 0 && (
              <div className="card p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">Similar Businesses</h2>
                <div className="space-y-2">
                  {similarListings.map(listing => (
                    <SimilarListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0 space-y-5">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-navy-900 mb-3">Contact Information</h3>
              {listing.phone && <InfoRow icon={Phone} label="Phone" value={listing.phone} href={`tel:${listing.phone}`} />}
              {listing.email && <InfoRow icon={Mail} label="Email" value={listing.email} href={`mailto:${listing.email}`} />}
              {listing.website && <InfoRow icon={Globe} label="Website" value={listing.website.replace(/^https?:\/\//, '')} href={listing.website} />}
              {address && <InfoRow icon={MapPin} label="Address" value={address} />}
            </div>

            <div className="card p-5">
              <h3 className="font-display font-semibold text-navy-900 mb-1">Send an Enquiry</h3>
              <p className="text-xs text-slate-500 mb-4">We'll send your message and confirm via email</p>
              <form onSubmit={handleEnquiry} className="space-y-3">
                <input placeholder="Your name *" value={enquiryForm.sender_name}
                  onChange={e => setEnquiryForm(f => ({ ...f, sender_name: e.target.value }))} className="input text-sm" required />
                <input type="email" placeholder="Your email *" value={enquiryForm.sender_email}
                  onChange={e => setEnquiryForm(f => ({ ...f, sender_email: e.target.value }))} className="input text-sm" required />
                <input placeholder="Your phone" value={enquiryForm.sender_phone}
                  onChange={e => setEnquiryForm(f => ({ ...f, sender_phone: e.target.value }))} className="input text-sm" />
                <input placeholder="Subject" value={enquiryForm.subject}
                  onChange={e => setEnquiryForm(f => ({ ...f, subject: e.target.value }))} className="input text-sm" />
                <textarea rows={4} placeholder="Your message *" value={enquiryForm.message}
                  onChange={e => setEnquiryForm(f => ({ ...f, message: e.target.value }))} className="input text-sm resize-none" required />
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  <Send size={15} /> {submitting ? 'Sending...' : 'Send Enquiry'}
                </button>
              </form>
            </div>

            <div className="card p-5">
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="btn-outline w-full justify-center text-sm">
                <Share2 size={14} /> Share this Business
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={28} />
          </button>
          <img src={lightboxImg} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </div>
  );
}