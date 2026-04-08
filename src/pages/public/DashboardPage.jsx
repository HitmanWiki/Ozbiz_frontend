import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Eye, Edit, Trash2, Clock, CheckCircle, XCircle, MessageSquare, Send, ChevronDown, ChevronUp, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { StatusBadge } from '../../components/common/UI';
import api from '../../utils/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);
  const [expandedEnquiry, setExpandedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchListings = () => {
    api.get('/listings/my').then(res => { setListings(res.data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const fetchEnquiries = async () => {
    if (enquiries.length > 0) return;
    setEnquiriesLoading(true);
    try {
      // Fetch enquiries for all listings
      const all = [];
      for (const listing of listings) {
        try {
          const res = await api.get(`/listings/${listing.id}/enquiries`);
          all.push(...(res.data || []).map(e => ({ ...e, listingTitle: listing.title, listingSlug: listing.slug })));
        } catch (_) {}
      }
      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setEnquiries(all);
    } finally { setEnquiriesLoading(false); }
  };

  useEffect(() => {
    if (activeTab === 'enquiries' && listings.length > 0) fetchEnquiries();
  }, [activeTab, listings]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/listings/${id}`);
      toast.success('Listing deleted');
      fetchListings();
    } catch { toast.error('Failed to delete listing'); }
  };

  const handleReply = async (enquiryId) => {
    if (!replyText.trim()) return toast.error('Reply message is required');
    setReplyLoading(true);
    try {
      await api.post(`/enquiries/${enquiryId}/reply`, { message: replyText });
      toast.success('Reply sent! The customer has been emailed.');
      setReplyText('');
      setExpandedEnquiry(null);
      setEnquiries([]);
      fetchEnquiries();
    } catch { toast.error('Failed to send reply'); }
    finally { setReplyLoading(false); }
  };

  const stats = [
    { label: 'Total Listings', value: listings.length },
    { label: 'Active', value: listings.filter(l => l.status === 'active').length },
    { label: 'Pending', value: listings.filter(l => l.status === 'pending').length },
    { label: 'Total Views', value: listings.reduce((s, l) => s + (l.viewCount || 0), 0).toLocaleString() },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="bg-navy-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gold-400 flex items-center justify-center">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : <span className="font-display font-bold text-navy-900 text-lg">{user?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">My Dashboard</h1>
              <p className="text-white/60 text-sm">Welcome back, {user?.name}</p>
              {!user?.emailVerified && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-300 text-xs">⚠ Email not verified —</span>
                  <Link to="/verify-email" className="text-gold-400 text-xs hover:underline">Verify now</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value }) => (
            <div key={label} className="card p-5 text-center">
              <p className="text-2xl font-bold font-display text-navy-900">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-100 mb-6 w-fit">
          {[
            { id: 'listings', label: 'My Listings', count: listings.length },
            { id: 'enquiries', label: 'Enquiries', count: enquiries.length || null },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === t.id ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {t.label}
              {t.count != null && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? 'bg-white/20' : 'bg-slate-200'}`}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display font-semibold text-lg text-navy-900">My Listings</h2>
              <Link to="/add-listing" className="btn-primary text-xs px-4 py-2">
                <PlusCircle size={14} /> Add New
              </Link>
            </div>
            {loading ? (
              <div className="divide-y divide-slate-100">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-5 animate-pulse flex gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle size={28} className="text-slate-300" />
                </div>
                <h3 className="font-display font-semibold text-navy-900 mb-2">No listings yet</h3>
                <p className="text-slate-500 text-sm mb-5">Add your first business listing to get started</p>
                <Link to="/add-listing" className="btn-primary">Add Your Business</Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {listings.map(listing => (
                  <div key={listing.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-lg bg-navy-800 flex items-center justify-center shrink-0 overflow-hidden">
                      {listing.logoUrl
                        ? <img src={listing.logoUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="font-display font-bold text-white text-xl">{listing.title?.[0]}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-navy-900 text-sm truncate">{listing.title}</h3>
                        <StatusBadge status={listing.status} />
                      </div>
                      <p className="text-xs text-slate-500">{listing.category?.name} · {[listing.city, listing.state].filter(Boolean).join(', ')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {(listing.viewCount || 0).toLocaleString()} views · {listing._count?.enquiries || 0} enquiries · {new Date(listing.createdAt).toLocaleDateString('en-AU')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {listing.status === 'active' && (
                        <Link to={`/listings/${listing.slug}`} className="p-2 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors" title="View">
                          <Eye size={16} />
                        </Link>
                      )}
                      <Link to={`/edit-listing/${listing.id}`} className="p-2 text-slate-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(listing.id, listing.title)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Enquiries tab */}
        {activeTab === 'enquiries' && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-display font-semibold text-lg text-navy-900">Customer Enquiries</h2>
              <p className="text-xs text-slate-500">Reply by email or through the form below</p>
            </div>
            {enquiriesLoading ? (
              <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-navy-800 border-t-transparent rounded-full mx-auto" /></div>
            ) : enquiries.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No enquiries yet. Enquiries will appear here when customers contact your businesses.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {enquiries.map(enq => (
                  <div key={enq.id} className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                            <User size={14} className="text-navy-600" />
                          </div>
                          <span className="font-semibold text-sm text-navy-900">{enq.senderName}</span>
                          <StatusBadge status={enq.status} />
                          <span className="text-xs text-slate-400">{new Date(enq.createdAt).toLocaleDateString('en-AU')}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-2 ml-9">
                          {enq.senderEmail} {enq.senderPhone && `· ${enq.senderPhone}`} · Re: <span className="font-medium">{enq.listingTitle}</span>
                        </p>
                        {enq.subject && <p className="text-xs font-semibold text-navy-800 mb-1 ml-9">{enq.subject}</p>}
                        <p className="text-sm text-slate-600 leading-relaxed ml-9 line-clamp-2">{enq.message}</p>

                        {/* Show reply if already replied */}
                        {enq.replyMessage && (
                          <div className="ml-9 mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                            <p className="text-xs font-semibold text-green-700 mb-1">Your reply:</p>
                            <p className="text-xs text-green-800">{enq.replyMessage}</p>
                          </div>
                        )}
                      </div>
                      <button onClick={() => setExpandedEnquiry(expandedEnquiry === enq.id ? null : enq.id)}
                        className="btn-outline text-xs px-3 py-1.5 shrink-0 flex items-center gap-1.5">
                        {expandedEnquiry === enq.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {enq.status === 'replied' ? 'View' : 'Reply'}
                      </button>
                    </div>

                    {/* Expanded: full message + reply form */}
                    {expandedEnquiry === enq.id && (
                      <div className="mt-4 ml-9 space-y-3">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Full Message:</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{enq.message}</p>
                        </div>
                        {enq.status !== 'replied' && (
                          <div>
                            <textarea rows={4} placeholder="Write your reply... (will be sent to customer via email)"
                              value={replyText} onChange={e => setReplyText(e.target.value)}
                              className="input text-sm resize-none w-full" />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => handleReply(enq.id)} disabled={replyLoading}
                                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5">
                                <Send size={13} /> {replyLoading ? 'Sending...' : 'Send Reply'}
                              </button>
                              <button onClick={() => setExpandedEnquiry(null)} className="btn-outline text-xs px-4 py-2">
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
