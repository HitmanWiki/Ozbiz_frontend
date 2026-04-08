// frontend/src/components/public/ListingCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, CheckCircle, Zap } from 'lucide-react';

export default function ListingCard({ listing }) {
  // Handle both camelCase and snake_case field names
  const featured = listing.isFeatured || listing.is_featured || listing.plan === 'featured';
  const verified = listing.isVerified || listing.is_verified;
  const ratingAvg = Number(listing.ratingAvg || listing.rating_avg || 0);
  const ratingCount = listing.ratingCount || listing.rating_count || 0;
  const categoryName = listing.category?.name || listing.category_name;
  const city = [listing.suburb, listing.city, listing.state].filter(Boolean).join(', ');
  
  // IMPROVED: Better image extraction from multiple sources
  // Try coverUrl first, then images array with cover/banner type, then first image, then null
  const coverImage = (() => {
    if (listing.coverUrl) return listing.coverUrl;
    if (listing.cover_url) return listing.cover_url;
    if (listing.images && listing.images.length > 0) {
      const coverType = listing.images.find(i => i.type === 'cover' || i.type === 'banner');
      if (coverType) return coverType.url;
      return listing.images[0]?.url;
    }
    return null;
  })();
  
  // Logo image extraction
  const logoImage = (() => {
    if (listing.logoUrl) return listing.logoUrl;
    if (listing.logo_url) return listing.logo_url;
    if (listing.images && listing.images.length > 0) {
      const logoType = listing.images.find(i => i.type === 'logo');
      if (logoType) return logoType.url;
    }
    return null;
  })();
  
  const shortDesc = listing.shortDescription || listing.short_description || '';
  
  // Fallback text for when no image exists
  const fallbackText = listing.title?.[0] || 'O';

  return (
    <Link to={`/listings/${listing.slug}`} className="listing-card group block">
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Cover Image Section */}
        <div className="relative h-44 bg-gradient-to-br from-navy-800 to-navy-950 overflow-hidden">
          {coverImage ? (
            <img 
              src={coverImage} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center hero-pattern">
                      <span class="font-display text-5xl font-bold text-white/20">${fallbackText}</span>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center hero-pattern">
              <span className="font-display text-5xl font-bold text-white/20">{fallbackText}</span>
            </div>
          )}
          
          {/* Badges - Featured & Verified */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {featured && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gold-400 text-navy-900 gap-1">
                <Zap size={10} className="fill-current" /> Featured
              </span>
            )}
            {verified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white gap-1">
                <CheckCircle size={10} /> Verified
              </span>
            )}
          </div>
          
          {/* Category Badge */}
          {categoryName && (
            <div className="absolute bottom-3 left-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-navy-800">
                {categoryName}
              </span>
            </div>
          )}
          
          {/* Logo Overlay */}
          {logoImage && (
            <div className="absolute bottom-3 right-3 w-11 h-11 rounded-lg overflow-hidden border-2 border-white shadow-md bg-white">
              <img 
                src={logoImage} 
                alt="" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-navy-900 text-sm leading-snug mb-1 group-hover:text-gold-600 transition-colors line-clamp-1">
            {listing.title}
          </h3>
          
          {/* Rating Stars */}
          {ratingCount > 0 ? (
            <div className="flex items-center gap-1 mb-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star 
                    key={i} 
                    size={11} 
                    className={i <= Math.round(ratingAvg) ? 'text-gold-400 fill-current' : 'text-slate-300'} 
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">({ratingCount})</span>
            </div>
          ) : (
            <div className="h-4 mb-1.5"></div> // Placeholder to maintain spacing
          )}
          
          {/* Short Description */}
          {shortDesc && (
            <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">
              {shortDesc}
            </p>
          )}
          
          {/* Location & Phone Info */}
          <div className="space-y-1">
            {city && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={11} className="text-gold-500 shrink-0" />
                <span className="line-clamp-1">{city}</span>
              </div>
            )}
            {listing.phone && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Phone size={11} className="text-gold-500 shrink-0" />
                <span>{listing.phone}</span>
              </div>
            )}
          </div>
          
          {/* Footer - Views & CTA */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {(listing.viewCount || listing.view_count || 0).toLocaleString()} views
            </span>
            <span className="text-xs font-medium text-navy-600 group-hover:text-gold-600 transition-colors">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}