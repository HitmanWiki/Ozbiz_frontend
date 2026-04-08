// frontend/src/components/common/ProfessionalAd.jsx
import { Star, MapPin, Sparkles, ExternalLink, Clock } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';

export const ProfessionalAd = ({ ad, variant = 'card', className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = async () => {
    try {
      const res = await api.post(`/ads/${ad.id}/click`);
      if (res.data.linkUrl) window.open(res.data.linkUrl, '_blank', 'noopener');
    } catch {
      if (ad.linkUrl) window.open(ad.linkUrl, '_blank', 'noopener');
    }
  };

  // Card variant - looks like a regular business listing
  if (variant === 'card') {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group cursor-pointer bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
          isHovered 
            ? 'border-gold-300 shadow-lg -translate-y-0.5' 
            : 'border-slate-100 shadow-sm'
        } ${className}`}
      >
        {/* Sponsored Badge */}
        <div className="relative">
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-navy-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles size={10} className="text-gold-500" />
              Sponsored
            </span>
          </div>
          
          {/* Image Area */}
          <div className="h-36 overflow-hidden bg-gradient-to-r from-navy-50 to-slate-100">
            {ad.imageUrl && !ad.imageUrl.includes('placehold.co') ? (
              <img 
                src={ad.imageUrl} 
                alt={ad.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isHovered ? 'scale-105' : 'scale-100'
                }`}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-navy-600 to-navy-800">
                <div className="text-5xl mb-2">📢</div>
                <p className="text-white/80 text-sm font-medium">{ad.businessName || 'Advertisement'}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-4">
          <h3 className={`font-semibold text-navy-900 line-clamp-1 transition-colors ${
            isHovered ? 'text-gold-600' : ''
          }`}>
            {ad.title}
          </h3>
          
          {ad.businessName && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ad.businessName}</p>
          )}
          
          {/* Fake rating for trust */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-0.5">
              <Star size={12} className="fill-gold-400 text-gold-400" />
              <span className="text-xs font-medium text-slate-600">4.8</span>
            </div>
            <span className="text-xs text-slate-300">•</span>
            <div className="flex items-center gap-0.5">
              <MapPin size={10} className="text-slate-400" />
              <span className="text-xs text-slate-500">Australia</span>
            </div>
          </div>
          
          {/* CTA Button */}
          <button className={`mt-3 text-xs font-medium flex items-center gap-1 transition-all ${
            isHovered ? 'text-gold-600 gap-1.5' : 'text-navy-500'
          }`}>
            Learn More <ExternalLink size={10} />
          </button>
        </div>
      </div>
    );
  }

  // Banner variant - for wide ads
  if (variant === 'banner') {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group cursor-pointer bg-gradient-to-r from-white to-slate-50 rounded-xl border transition-all duration-300 overflow-hidden ${
          isHovered ? 'border-gold-300 shadow-md' : 'border-slate-200'
        } ${className}`}
      >
        <div className="flex items-center">
          {/* Left side - Image or Icon */}
          <div className="w-28 h-28 bg-gradient-to-br from-navy-100 to-gold-100 flex items-center justify-center shrink-0">
            {ad.imageUrl && !ad.imageUrl.includes('placehold.co') ? (
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-1">✨</div>
                <p className="text-xs text-navy-600 font-medium">Sponsored</p>
              </div>
            )}
          </div>
          
          {/* Right side - Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full">
                    Advertisement
                  </span>
                  {ad.businessName && (
                    <span className="text-[10px] text-slate-400">{ad.businessName}</span>
                  )}
                </div>
                <h3 className={`font-semibold text-navy-900 transition-colors ${
                  isHovered ? 'text-gold-600' : ''
                }`}>
                  {ad.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-md">
                  Special offer for OzBiz users. Click to learn more about this exclusive deal.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button className="text-xs font-medium text-gold-600 flex items-center gap-1">
                    Claim Offer <ExternalLink size={10} />
                  </button>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={10} /> Limited time
                  </span>
                </div>
              </div>
              <div className="ml-4 text-right">
                <div className="text-xs font-bold text-navy-800">Learn More →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar variant - compact for side columns
  if (variant === 'sidebar') {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group cursor-pointer bg-white rounded-lg border transition-all duration-300 p-3 ${
          isHovered ? 'border-gold-300 shadow-md' : 'border-slate-100'
        } ${className}`}
      >
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-navy-100 to-gold-100 flex items-center justify-center shrink-0">
            <span className="text-xl">💼</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[9px] font-semibold text-gold-600">Sponsored</span>
            </div>
            <h4 className={`text-sm font-semibold text-navy-900 line-clamp-1 transition-colors ${
              isHovered ? 'text-gold-600' : ''
            }`}>
              {ad.title}
            </h4>
            {ad.businessName && (
              <p className="text-xs text-slate-500 line-clamp-1">{ad.businessName}</p>
            )}
            <div className="mt-1.5 text-[10px] font-medium text-gold-500 flex items-center gap-0.5">
              Learn more →
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div onClick={handleClick} className={`cursor-pointer bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
          <span>📢</span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gold-600 font-medium">Sponsored</p>
          <h4 className="font-semibold text-navy-900">{ad.title}</h4>
        </div>
        <div className="text-navy-400">→</div>
      </div>
    </div>
  );
};