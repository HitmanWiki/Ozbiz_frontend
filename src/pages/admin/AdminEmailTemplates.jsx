// frontend/src/pages/admin/AdminEmailTemplates.jsx
import { useState, useEffect } from 'react';
import { Save, Mail, Edit, Eye, RefreshCw, FileText, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const emailTemplates = [
  { id: 'verification', name: 'Email Verification', description: 'Sent when a user registers' },
  { id: 'welcome', name: 'Welcome Email', description: 'Sent after email verification' },
  { id: 'listing_submitted', name: 'Listing Submitted', description: 'Sent to vendor after listing submission' },
  { id: 'listing_approved', name: 'Listing Approved', description: 'Sent when admin approves a listing' },
  { id: 'listing_rejected', name: 'Listing Rejected', description: 'Sent when admin rejects a listing' },
  { id: 'enquiry_received', name: 'Enquiry Received', description: 'Sent to vendor when customer sends enquiry' },
  { id: 'enquiry_reply', name: 'Enquiry Reply', description: 'Sent to customer when vendor replies' },
  { id: 'password_reset', name: 'Password Reset', description: 'Sent when user requests password reset' },
  { id: 'newsletter_welcome', name: 'Newsletter Welcome', description: 'Sent when user subscribes to newsletter' },
];

export default function AdminEmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateContent, setTemplateContent] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (selectedTemplate) {
      fetchTemplate(selectedTemplate.id);
    }
  }, [selectedTemplate]);

  const fetchTemplate = async (templateId) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/email-templates/${templateId}`);
      setTemplateContent(res.data);
    } catch (err) {
      // Load default template
      setTemplateContent({
        subject: `[OzBiz] ${selectedTemplate?.name || 'Email'}`,
        body: `<h2>Hello {{name}},</h2><p>This is a test email from OzBiz Directory.</p><p>Thank you for using our platform!</p>`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      await api.post(`/admin/email-templates/${selectedTemplate.id}`, templateContent);
      toast.success('Email template saved successfully');
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async () => {
    try {
      await api.post('/admin/email-templates/test', { templateId: selectedTemplate.id });
      toast.success('Test email sent to admin email');
    } catch (err) {
      toast.error('Failed to send test email');
    }
  };

  const resetToDefault = async () => {
    try {
      await api.post(`/admin/email-templates/${selectedTemplate.id}/reset`);
      fetchTemplate(selectedTemplate.id);
      toast.success('Template reset to default');
    } catch (err) {
      toast.error('Failed to reset template');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Email Templates</h1>
        <p className="text-slate-500 text-sm mt-1">Customize email templates sent to users and vendors</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <h2 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Mail size={16} /> Templates
          </h2>
          <div className="space-y-1">
            {emailTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'bg-navy-50 border-l-4 border-navy-800'
                    : 'hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-medium text-navy-900">{template.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
          {selectedTemplate ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-900">{selectedTemplate.name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    <Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
                  </button>
                  <button
                    onClick={resetToDefault}
                    className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    <RefreshCw size={14} /> Reset
                  </button>
                  <button
                    onClick={handleTestSend}
                    className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    <Send size={14} /> Test
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-2 border-navy-800 border-t-transparent rounded-full" />
                </div>
              ) : previewMode ? (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="border-b pb-2 mb-3">
                      <p className="text-sm text-slate-500">Subject: <span className="font-medium text-navy-900">{templateContent.subject}</span></p>
                    </div>
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: templateContent.body }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-3">
                    Available variables: <code className="bg-slate-200 px-1 rounded">{'{{name}}'}</code>, <code className="bg-slate-200 px-1 rounded">{'{{email}}'}</code>, <code className="bg-slate-200 px-1 rounded">{'{{listingTitle}}'}</code>, <code className="bg-slate-200 px-1 rounded">{'{{link}}'}</code>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subject Line</label>
                    <input
                      type="text"
                      value={templateContent.subject}
                      onChange={(e) => setTemplateContent({ ...templateContent, subject: e.target.value })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Body (HTML)</label>
                    <textarea
                      rows={12}
                      value={templateContent.body}
                      onChange={(e) => setTemplateContent({ ...templateContent, body: e.target.value })}
                      className="input w-full font-mono text-sm resize-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleSave} disabled={saving} className="btn-primary px-5 py-2 flex items-center gap-2">
                      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      {saving ? 'Saving...' : 'Save Template'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Mail size={48} className="text-slate-300 mb-3" />
              <p className="text-slate-500">Select an email template to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}