// frontend/src/pages/vendor/ReviewManagement.jsx
import { useState, useEffect } from 'react';
import { Star, Flag, Reply, ThumbsUp, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function ReviewManagement() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Get vendor's listings first
      const listingsRes = await api.get('/listings/my');
      const listings = listingsRes.data;
      
      // Fetch reviews for each listing
      const allReviews = [];
      for (const listing of listings) {
        const reviewsRes = await api.get(`/listings/${listing.slug}`);
        if (reviewsRes.data.reviews) {
          allReviews.push(...reviewsRes.data.reviews.map(r => ({ ...r, listingTitle: listing.title })));
        }
      }
      setReviews(allReviews);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagSpam = async (reviewId) => {
    try {
      await api.patch(`/admin/reviews/${reviewId}`, { status: 'rejected' });
      toast.success('Review reported as spam');
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
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Review Management</h1>
        <p className="text-slate-500 text-sm mt-1">Monitor and respond to customer reviews</p>
      </div>

      {/* Filters */}
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

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < review.rating ? 'fill-gold-400 text-gold-400' : 'text-slate-300'} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{review.listingTitle}</span>
                </div>
                <h4 className="font-semibold text-navy-900">{review.title || 'Customer Review'}</h4>
                <p className="text-sm text-slate-600 mt-1">{review.body}</p>
                <p className="text-xs text-slate-400 mt-2">
                  — {review.reviewerName} • {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFlagSpam(review.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
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
            <p className="text-slate-500">No reviews yet</p>
          </div>
        )}
      </div>
    </div>
  );
}