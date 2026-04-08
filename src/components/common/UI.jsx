// src/components/common/UI.jsx — shared reusable components

import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';

// ── Spinner ────────────────────────────────────────────────
export const Spinner = ({ size = 8 }) => (
  <div className={`animate-spin w-${size} h-${size} border-4 border-navy-800 border-t-transparent rounded-full`} />
);

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <Spinner />
  </div>
);

// ── Star rating display ────────────────────────────────────
export const StarRating = ({ rating = 0, count, size = 14 }) => (
  <div className="flex items-center gap-1.5">
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size}
          className={i <= Math.round(Number(rating)) ? 'text-gold-400 fill-current' : 'text-slate-300'} />
      ))}
    </div>
    {count !== undefined && (
      <span className="text-xs text-slate-500">({count})</span>
    )}
  </div>
);

// ── Interactive star picker ────────────────────────────────
export const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <Star size={28}
          className={s <= value ? 'text-gold-400 fill-current' : 'text-slate-300 hover:text-gold-300'}
        />
      </button>
    ))}
  </div>
);

// ── Status badge ───────────────────────────────────────────
const BADGE_CLASSES = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  featured: 'bg-purple-100 text-purple-700',
  inactive: 'bg-slate-100 text-slate-600',
  approved: 'bg-green-100 text-green-700',
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-slate-100 text-slate-600',
  replied: 'bg-green-100 text-green-700',
  published: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-600',
};

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${BADGE_CLASSES[status] || 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
);

// ── Ad Banner component ────────────────────────────────────
export const AdBanner = ({ ad, className = '' }) => {
  if (!ad) return null;
  const handleClick = async () => {
    try {
      const { default: api } = await import('../../utils/api');
      const res = await api.post(`/ads/${ad.id}/click`);
      if (res.data.linkUrl) window.open(res.data.linkUrl, '_blank', 'noopener');
    } catch { if (ad.linkUrl) window.open(ad.linkUrl, '_blank', 'noopener'); }
  };
  return (
    <div onClick={handleClick}
      className={`cursor-pointer overflow-hidden rounded-xl ${className}`}
      title={ad.businessName || ad.title}>
      <img src={ad.imageUrl} alt={ad.title}
        className="w-full h-full object-cover hover:opacity-95 transition-opacity"
        onError={e => { e.target.parentElement.style.display = 'none'; }}
      />
    </div>
  );
};

// ── Section header ─────────────────────────────────────────
export const SectionHeader = ({ label, title, action, actionHref }) => (
  <div className="flex items-end justify-between mb-8">
    <div>
      {label && <p className="text-gold-600 text-sm font-semibold uppercase tracking-wider mb-1">{label}</p>}
      <h2 className="font-display text-3xl font-bold text-navy-900">{title}</h2>
    </div>
    {action && actionHref && (
      <a href={actionHref} className="text-sm text-navy-600 hover:text-navy-900 font-medium flex items-center gap-1 transition-colors">
        {action} <span>›</span>
      </a>
    )}
  </div>
);

// ── Newsletter box ─────────────────────────────────────────
export const NewsletterBox = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const { default: api } = await import('../../utils/api');
      await api.post('/newsletter/subscribe', { email, name });
      setDone(true);
    } catch (err) {
      const { default: toast } = await import('react-hot-toast');
      toast.error(err.response?.data?.error || 'Subscription failed');
    } finally { setLoading(false); }
  };

  return (
    <section className="bg-navy-900 py-14">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="inline-block bg-gold-400/20 border border-gold-400/30 rounded-full px-4 py-1.5 mb-4">
          <span className="text-gold-300 text-xs font-medium">Stay Updated</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Subscribe to Our Newsletter</h2>
        <p className="text-white/60 text-sm mb-8">Get the latest Indian business news, new listings and community updates delivered to your inbox.</p>
        {done ? (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6">
            <p className="text-green-300 font-semibold text-lg">🎉 You're subscribed!</p>
            <p className="text-green-400/80 text-sm mt-1">Check your inbox for a welcome email.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm outline-none focus:border-gold-400 transition-colors" />
            <input type="email" required placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm outline-none focus:border-gold-400 transition-colors" />
            <button type="submit" disabled={loading}
              className="bg-gold-400 text-navy-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gold-300 transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-2 justify-center">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
