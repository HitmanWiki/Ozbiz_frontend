// frontend/src/pages/admin/AdminExports.jsx
import { useState } from 'react';
import { Download, FileText, Users, Mail, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminExports() {
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const exportData = async (type) => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append('fromDate', dateRange.from);
      if (dateRange.to) params.append('toDate', dateRange.to);
      
      const res = await api.get(`/admin/export/${type}?${params.toString()}`);
      const data = res.data.data;
      
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const csvRows = [headers.join(',')];
      for (const row of data) {
        const values = headers.map(header => `"${row[header] || ''}"`);
        csvRows.push(values.join(','));
      }
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} exported successfully`);
    } catch (err) {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Data Exports</h1>
        <p className="text-slate-500 text-sm mt-1">Export leads, users, and other data to CSV format</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
        <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
          <Calendar size={16} /> Filter by Date Range (Optional)
        </h3>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Leads */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Mail size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Export Leads</h2>
              <p className="text-xs text-slate-500">Export all customer enquiries and leads</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Download all leads with customer details, messages, and status.</p>
          <button
            onClick={() => exportData('leads')}
            disabled={exporting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export Leads (CSV)
          </button>
        </div>

        {/* Export Users */}
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Export Users</h2>
              <p className="text-xs text-slate-500">Export all registered users</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Download all users with their roles, listings count, and join dates.</p>
          <button
            onClick={() => exportData('users')}
            disabled={exporting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Export Users (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}