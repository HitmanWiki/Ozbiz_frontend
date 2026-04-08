import { Link } from 'react-router-dom';
import { Tag, ExternalLink } from 'lucide-react';

export default function ProductCard({ product, listingSlug, showListing = false }) {
  const price = product.price != null ? Number(product.price) : null;

  return (
    <div className="card group overflow-hidden">
      {/* Product image */}
      <div className="h-44 bg-slate-100 overflow-hidden relative">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-50 to-slate-100">
            <Tag size={36} className="text-slate-300" />
          </div>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 left-2 bg-gold-400 text-navy-900 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {product.category && (
          <span className="absolute bottom-2 left-2 bg-white/90 text-navy-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
            {product.category}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-navy-900 text-sm line-clamp-1 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">{product.description}</p>
        )}

        <div className="flex items-center justify-between">
          {price != null ? (
            <div>
              <span className="text-navy-900 font-bold text-base">
                ${price.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
              {product.priceUnit && (
                <span className="text-slate-400 text-xs ml-1">{product.priceUnit}</span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 text-xs">Contact for price</span>
          )}

          {showListing && product.listing && (
            <Link to={`/listings/${product.listing.slug}`}
              className="text-xs text-navy-600 hover:text-gold-600 font-medium flex items-center gap-1 transition-colors">
              View Business <ExternalLink size={10} />
            </Link>
          )}
        </div>

        {showListing && product.listing && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <Link to={`/listings/${product.listing.slug}`} className="flex items-center gap-2 group/biz">
              {product.listing.logoUrl && (
                <img src={product.listing.logoUrl} alt="" className="w-6 h-6 rounded object-contain border border-slate-100" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-navy-800 group-hover/biz:text-gold-600 truncate transition-colors">
                  {product.listing.title}
                </p>
                {(product.listing.city || product.listing.category?.name) && (
                  <p className="text-[10px] text-slate-400 truncate">
                    {[product.listing.category?.name, product.listing.city].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
