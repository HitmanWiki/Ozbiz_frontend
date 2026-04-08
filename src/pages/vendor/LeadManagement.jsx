// frontend/src/pages/vendor/LeadManagement.jsx
import { useState, useEffect } from 'react';
import { Search, Filter, Mail, Phone, Calendar, Reply, CheckCircle, Clock, Archive, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  read: 'bg-slate-100 text-slate-600',
  replied: 'bg-green-100 text-green-700',
  archived: 'bg-slate-100 text-slate-500'
};

const STATUS_ICONS = {
  new: Clock,
  read: CheckCircle,
  replied: Reply,
  archived: Archive
};

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  useEffect(() => {
    fetchLeads();
  }, [filterStatus, pagination.page]);

  const fetchLeads = async () => {
    try {
      const res = await api.get(`/vendor/leads?status=${filterStatus}&page=${pagination.page}`);
      setLeads(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (leadId, status) => {
    try {
      await api.patch(`/vendor/leads/${leadId}`, { status });
      toast.success(`Lead marked as ${status}`);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async (leadId) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }
    try {
      await api.post(`/enquiries/${leadId}/reply`, { message: replyText });
      toast.success('Reply sent successfully!');
      setSelectedLead(null);
      setReplyText('');
      fetchLeads();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const filteredLeads = leads.filter(lead =>
    lead.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Lead Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage customer enquiries and respond to potential leads</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 text-sm w-full"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'new', 'read', 'replied', 'archived'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterStatus === status
                  ? 'bg-navy-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Message</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Listing</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const StatusIcon = STATUS_ICONS[lead.status] || Clock;
                return (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{lead.senderName}</p>
                        <p className="text-xs text-slate-500">{lead.senderEmail}</p>
                        {lead.senderPhone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={10} /> {lead.senderPhone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-slate-600 line-clamp-2 max-w-xs">{lead.message}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-slate-600">{lead.listing?.title}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status]}`}>
                        <StatusIcon size={10} /> {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="text-gold-600 hover:text-gold-700 text-xs"
                        >
                          Reply
                        </button>
                        {lead.status !== 'archived' && (
                          <button
                            onClick={() => handleUpdateStatus(lead.id, 'archived')}
                            className="text-slate-400 hover:text-slate-600 text-xs"
                          >
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-400">
                    No leads found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-slate-100">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                  pagination.page === i + 1
                    ? 'bg-navy-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold text-navy-900">Reply to {selectedLead.senderName}</h3>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Original Message:</p>
              <p className="text-sm text-slate-700">{selectedLead.message}</p>
              <p className="text-xs text-slate-400 mt-2">
                From: {selectedLead.senderEmail}
                {selectedLead.senderPhone && ` • Phone: ${selectedLead.senderPhone}`}
              </p>
            </div>

            <textarea
              rows={5}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="input w-full resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleReply(selectedLead.id)}
                className="btn-primary flex-1"
              >
                Send Reply
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}