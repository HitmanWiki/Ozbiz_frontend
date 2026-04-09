// frontend/src/pages/vendor/ReviewManagement.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Flag, Reply, ThumbsUp, Search, Filter, ArrowLeft, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const listingsRes = await api.get('/listings/my');
      const listings = listingsRes.data;
      
      const allReviews = [];
      for (const listing of listings) {
        const reviewsRes = await api.get(`/listings/${listing.slug}`);
        if (reviewsRes.data.reviews) {
          allReviews.push(...reviewsRes.data.reviews.map(r => ({ ...r, listingTitle: listing.title, listingSlug: listing.slug })));
        }
      }
      setReviews(allReviews);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    try {
      await api.post(`/vendor/reviews/${reviewId}/reply`, { reply: replyText });
      toast.success('Reply posted successfully');
      setSelectedReview(null);
      setReplyText('');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const handleFlagSpam = async (reviewId) => {
    try {
      await api.post(`/vendor/reviews/${reviewId}/flag`);
      toast.success('Review flagged as spam');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to flag review');
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'high') return review.rating >= 4;
    if (filter === 'medium') return review.rating === 3;
    if (filter === 'low') return review.rating <= 2;
    return true;
  }).filter(review => 
    review.reviewerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to="/vendor/dashboard" className="text-slate-400 hover:text-navy-600">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-navy-900">Review Management</h1>
              <p className="text-slate-500 text-sm mt-1">Monitor and respond to customer reviews</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by reviewer name or review content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9 text-sm w-full"
              />
            </div>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Reviews' },
                { value: 'high', label: '4-5 Stars' },
                { value: 'medium', label: '3 Stars' },
                { value: 'low', label: '1-2 Stars' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === opt.value
                      ? 'bg-navy-800 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">•</span>
                      <Link to={`/listings/${review.listingSlug}`} className="text-xs text-amber-600 hover:text-amber-700">
                        {review.listingTitle}
                      </Link>
                    </div>
                    <h4 className="font-semibold text-navy-900">{review.title || 'Customer Review'}</h4>
                    <p className="text-sm text-slate-600 mt-1">{review.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-slate-400">
                        — {review.reviewerName} • {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                      {review.vendorReply && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Reply size={10} /> Replied
                        </span>
                      )}
                    </div>
                    
                    {/* Vendor Reply Display */}
                    {review.vendorReply && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                        <p className="text-xs font-medium text-amber-700 mb-1">Your Reply:</p>
                        <p className="text-sm text-slate-600">{review.vendorReply}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!review.vendorReply && (
                      <button
                        onClick={() => setSelectedReview(review)}
                        className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                        title="Reply to review"
                      >
                        <Reply size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleFlagSpam(review.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Flag as spam"
                    >
                      <Flag size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredReviews.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                <Star size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">No reviews found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold text-navy-900">Reply to {selectedReview.reviewerName}</h3>
              <button onClick={() => setSelectedReview(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className={i < selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700">{selectedReview.body}</p>
            </div>

            <textarea
              rows={4}
              placeholder="Type your reply to this review..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="input w-full resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleReply(selectedReview.id)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Send size={14} /> Post Reply
              </button>
              <button
                onClick={() => setSelectedReview(null)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}