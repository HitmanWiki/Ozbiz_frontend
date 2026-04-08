import { useState } from 'react';
import { User, Lock, Bell, Shield, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

const Section = ({ title, desc, children }) => (
  <div className="card p-6 mb-5">
    <div className="mb-5 pb-4 border-b border-slate-100">
      <h3 className="font-display font-semibold text-navy-900 text-base">{title}</h3>
      {desc && <p className="text-slate-500 text-sm mt-0.5">{desc}</p>}
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [newsletter, setNewsletter] = useState(user?.newsletterSubscribed || false);
  const [nlLoading, setNlLoading] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', profileForm);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setProfileLoading(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) return toast.error('Passwords do not match');
    if (pwdForm.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setPwdLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed!');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally { setPwdLoading(false); }
  };

  const toggleNewsletter = async () => {
    setNlLoading(true);
    try {
      if (!newsletter) {
        await api.post('/newsletter/subscribe', { email: user?.email, name: user?.name });
        setNewsletter(true);
        toast.success('Subscribed to newsletter!');
      } else {
        toast('To unsubscribe, reply "UNSUBSCRIBE" to any newsletter email.', { icon: 'ℹ️' });
      }
    } finally { setNlLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="bg-navy-900 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="font-display text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-white/60 text-sm mt-1">Manage your profile, password and preferences</p>
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Account status */}
        <div className="card p-5 mb-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : <span className="font-display font-bold text-white text-2xl">{user?.name?.[0]?.toUpperCase()}</span>
            }
          </div>
          <div>
            <p className="font-semibold text-navy-900">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                <CheckCircle size={11} />
                {user?.emailVerified ? 'Email verified' : 'Email not verified'}
              </span>
              {user?.provider === 'google' && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Google account</span>
              )}
              <span className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Profile */}
        <Section title="Profile Information" desc="Update your name and contact number">
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="input" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Phone</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className="input" placeholder="04XX XXX XXX" type="tel" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Email</label>
                <input value={user?.email} disabled className="input opacity-60 cursor-not-allowed" />
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
            </div>
            <button type="submit" disabled={profileLoading} className="btn-primary">
              {profileLoading ? <Loader2 size={15} className="animate-spin" /> : <User size={15} />}
              Save Profile
            </button>
          </form>
        </Section>

        {/* Password */}
        {user?.provider !== 'google' && (
          <Section title="Change Password" desc="Choose a strong password of at least 8 characters">
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Current Password</label>
                <input type={showPwd ? 'text' : 'password'} required value={pwdForm.currentPassword}
                  onChange={e => setPwdForm(f => ({ ...f, currentPassword: e.target.value }))}
                  className="input" placeholder="Enter current password" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input type={showPwd ? 'text' : 'password'} required value={pwdForm.newPassword}
                      onChange={e => setPwdForm(f => ({ ...f, newPassword: e.target.value }))}
                      className="input pr-10" placeholder="Min 8 characters" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input type={showPwd ? 'text' : 'password'} required value={pwdForm.confirm}
                    onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                    className="input" placeholder="Repeat new password" />
                </div>
              </div>
              <button type="submit" disabled={pwdLoading} className="btn-primary">
                {pwdLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                Change Password
              </button>
            </form>
          </Section>
        )}

        {/* Newsletter */}
        <Section title="Newsletter Preferences" desc="Manage your email subscription preferences">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-navy-900">OzBiz Newsletter</p>
              <p className="text-slate-500 text-xs mt-0.5">Receive updates on new businesses, featured listings and community news</p>
            </div>
            <button onClick={toggleNewsletter} disabled={nlLoading}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${newsletter ? 'bg-green-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${newsletter ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Section>

        {/* Security info */}
        <Section title="Security" desc="Information about your account security">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-slate-400" />
                <span className="text-sm text-navy-800">Sign-in method</span>
              </div>
              <span className="text-sm text-slate-500 capitalize">{user?.provider === 'google' ? 'Google OAuth' : 'Email & Password'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-slate-400" />
                <span className="text-sm text-navy-800">Email verification</span>
              </div>
              <span className={`text-sm font-medium ${user?.emailVerified ? 'text-green-600' : 'text-amber-600'}`}>
                {user?.emailVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <User size={16} className="text-slate-400" />
                <span className="text-sm text-navy-800">Account type</span>
              </div>
              <span className="text-sm text-slate-500 capitalize">{user?.role}</span>
            </div>
          </div>
          {!user?.emailVerified && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm font-medium mb-1">⚠ Verify your email address</p>
              <p className="text-amber-700 text-xs">Check your inbox for the verification link, or <a href="/verify-email" className="underline">request a new one</a>.</p>
            </div>
          )}
        </Section>
      </div>
      <Footer />
    </div>
  );
}
