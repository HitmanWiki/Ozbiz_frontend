import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-lg">
          {/* Big 404 */}
          <div className="relative mb-8">
            <div className="font-display text-[120px] sm:text-[180px] font-bold text-navy-50 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div>
                <div className="w-20 h-20 bg-gold-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search size={36} className="text-navy-900" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-8">
            We couldn't find the page you're looking for. It may have been moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary">
              <Home size={16} /> Go to Homepage
            </Link>
            <Link to="/listings" className="btn-outline">
              <Search size={16} /> Browse Businesses
            </Link>
            <button onClick={() => window.history.back()} className="btn-outline">
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-400 mb-3">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                ['Restaurants', '/category/restaurants-cafes'],
                ['Migration', '/category/migration-visa'],
                ['Doctors', '/category/health-medical'],
                ['Blog', '/blog'],
                ['Add Listing', '/add-listing'],
              ].map(([label, href]) => (
                <Link key={href} to={href}
                  className="text-xs text-navy-600 bg-navy-50 hover:bg-navy-100 px-3 py-1.5 rounded-full transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
