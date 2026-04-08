import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const CATS = [
  ['Restaurants & Cafes', 'restaurants-cafes'], ['Health & Medical', 'health-medical'],
  ['Education & Training', 'education-training'], ['Migration & Visa', 'migration-visa'],
  ['Professional Services', 'professional-services'], ['Trade Services', 'trade-services'],
  ['Beauty & Wellness', 'beauty-wellness'], ['Financial Services', 'financial-services'],
];
const CITIES = ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Canberra', 'Gold Coast'];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70">
      <div className="bg-gold-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-navy-900 text-2xl sm:text-3xl font-bold mb-2">List Your Business Today</h2>
          <p className="text-navy-800/80 mb-6 text-sm">Join thousands of Indian businesses. Free listing available.</p>
          <Link to="/add-listing"
            className="inline-flex items-center gap-2 bg-navy-900 text-white px-8 py-3 rounded-lg font-semibold text-sm hover:bg-navy-800 transition-colors">
            Add Your Business Free
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-gold-400 rounded-lg flex items-center justify-center">
                <span className="font-display font-bold text-navy-900 text-lg">O</span>
              </div>
              <span className="font-display font-bold text-white text-xl">Oz<span className="text-gold-400">Biz</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-white/60">
              Australia's leading Indian business directory. Connecting Indian businesses with the community across all major Australian cities.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold-400 hover:text-navy-900 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {CATS.map(([name, slug]) => (
                <li key={slug}>
                  <Link to={`/category/${slug}`} className="text-sm hover:text-gold-400 transition-colors">{name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Browse by City</h4>
            <ul className="space-y-2.5">
              {CITIES.map(city => (
                <li key={city}>
                  <Link to={`/listings?city=${city}`} className="text-sm hover:text-gold-400 transition-colors flex items-center gap-1.5">
                    <MapPin size={12} className="text-gold-500/60" />{city}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 mb-6">
              {[
                ['Add Listing', '/add-listing'], ['Browse Businesses', '/listings'],
                ['Featured', '/listings?featured=true'], ['Blog', '/blog'],
                ['Sign Up Free', '/register'], ['Login', '/login'],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm hover:text-gold-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-3">Contact</h4>
            <div className="space-y-2 text-sm">
              <a href="mailto:info@ozbiz.com.au" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <Mail size={14} className="text-gold-500/60" /> info@ozbiz.com.au
              </a>
              <a href="tel:1300123456" className="flex items-center gap-2 hover:text-gold-400 transition-colors">
                <Phone size={14} className="text-gold-500/60" /> 1300 123 456
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} OzBiz Directory. All rights reserved. ABN 12 345 678 901</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70">Privacy Policy</a>
            <a href="#" className="hover:text-white/70">Terms of Use</a>
            <a href="#" className="hover:text-white/70">Advertise</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
