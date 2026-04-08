import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Briefcase, User, Building2, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import api from '../../utils/api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ── Register ──────────────────────────────────────────────
export function RegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: '',
    userType: 'consumer',
    businessName: '',
    businessABN: '',
    businessPhone: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            // Pass userType to google login
            const user = await googleLogin(credential, form.userType);
            toast.success('Account created! Welcome to OzBiz.');
            navigate('/dashboard');
          } catch (err) {
            toast.error(err.response?.data?.error || 'Google signup failed');
          }
        },
      });
      window.google?.accounts.id.renderButton(
        document.getElementById('google-register-btn'),
        { theme: 'outline', size: 'large', width: '100%', text: 'signup_with' }
      );
    };
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, [form.userType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    
    // Validate vendor fields
    if (form.userType !== 'consumer' && !form.businessName) {
      return toast.error('Business name is required for vendor accounts');
    }
    
    setLoading(true);
    try {
      const registerData = {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        userType: form.userType,
      };
      
      // Add vendor fields if applicable
      if (form.userType !== 'consumer') {
        registerData.businessName = form.businessName;
        registerData.businessABN = form.businessABN;
        registerData.businessPhone = form.businessPhone;
      }
      
      await register(registerData);
      toast.success('Account created! Please check your email to verify.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const isVendor = form.userType !== 'consumer';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="font-display font-bold text-gold-400 text-2xl">O</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900">Join OzBiz Directory</h1>
            <p className="text-slate-500 text-sm mt-1">Create a free account to get started</p>
          </div>
          <div className="card p-8">
            {GOOGLE_CLIENT_ID && (
              <>
                <div id="google-register-btn" className="w-full mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">or register with email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
              </>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, userType: 'consumer' }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.userType === 'consumer' 
                        ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-200' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-2">
                      <User size={20} className="text-navy-700" />
                    </div>
                    <span className="text-sm font-semibold text-navy-900">Consumer</span>
                    <p className="text-xs text-slate-500 mt-0.5">Browse & review businesses</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, userType: 'vendor' }))}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      form.userType === 'vendor' 
                        ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-200' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-2">
                      <Briefcase size={20} className="text-navy-700" />
                    </div>
                    <span className="text-sm font-semibold text-navy-900">Vendor</span>
                    <p className="text-xs text-slate-500 mt-0.5">List & manage your business</p>
                  </button>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Full Name *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder="Raj Kumar" 
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  className="input" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Email Address *
                </label>
                <input 
                  type="email" 
                  required 
                  placeholder="raj@example.com" 
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  className="input" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Phone (optional)
                </label>
                <input 
                  type="tel" 
                  placeholder="04XX XXX XXX" 
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
                  className="input" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <input 
                    type={showPwd ? 'text' : 'password'} 
                    required 
                    placeholder="Min 8 characters" 
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                    className="input pr-10" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters</p>
              </div>

              {/* Vendor-specific fields */}
              {isVendor && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} className="text-gold-500" />
                    <p className="text-xs font-semibold text-navy-800">Business Details</p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Business Name *
                    </label>
                    <input 
                      type="text" 
                      required={isVendor}
                      placeholder="Your business name" 
                      value={form.businessName}
                      onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} 
                      className="input" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      ABN (Optional)
                    </label>
                    <input 
                      type="text" 
                      placeholder="12 345 678 901" 
                      value={form.businessABN}
                      onChange={e => setForm(f => ({ ...f, businessABN: e.target.value }))} 
                      className="input" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Business Phone (Optional)
                    </label>
                    <input 
                      type="tel" 
                      placeholder="03 XXXX XXXX" 
                      value={form.businessPhone}
                      onChange={e => setForm(f => ({ ...f, businessPhone: e.target.value }))} 
                      className="input" 
                    />
                  </div>

                  <div className="bg-gold-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CreditCard size={14} className="text-gold-600" />
                      <p className="text-xs text-navy-700 font-medium">Free Plan Included</p>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Start with our Free plan. Upgrade anytime to Premium or Elite for more features.
                    </p>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary w-full justify-center py-3 mt-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Creating account...' : isVendor ? 'Create Vendor Account' : 'Create Free Account'}
              </button>
            </form>
            
            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <Link to="/login" className="text-navy-700 font-semibold hover:text-gold-600">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Verify Email ──────────────────────────────────────────
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      api.get(`/auth/verify-email?token=${token}`)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('resend');
    }
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setResendLoading(true);
    try {
      await api.post('/auth/resend-verification', { email });
      toast.success('Verification email sent!');
    } catch { toast.error('Failed to send'); }
    finally { setResendLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {status === 'loading' && (
            <div className="card p-10"><Loader2 size={36} className="animate-spin text-navy-700 mx-auto mb-4" /><p className="text-slate-500">Verifying your email...</p></div>
          )}
          {status === 'success' && (
            <div className="card p-10">
              <CheckCircle size={52} className="text-green-500 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Email Verified!</h2>
              <p className="text-slate-500 text-sm mb-6">Your account is now active. Welcome to OzBiz!</p>
              <Link to="/login" className="btn-primary inline-flex">Sign In Now</Link>
            </div>
          )}
          {status === 'error' && (
            <div className="card p-10">
              <AlertCircle size={52} className="text-red-400 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Link Expired</h2>
              <p className="text-slate-500 text-sm mb-6">This verification link is invalid or has expired.</p>
              <button onClick={() => setStatus('resend')} className="btn-outline">Request New Link</button>
            </div>
          )}
          {status === 'resend' && (
            <div className="card p-8">
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-2">Verify Your Email</h2>
              <p className="text-slate-500 text-sm mb-6">Enter your email to resend the verification link.</p>
              <form onSubmit={handleResend} className="space-y-3">
                <input type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} className="input" />
                <button type="submit" disabled={resendLoading} className="btn-primary w-full justify-center py-3">
                  {resendLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Send Verification Email
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Forgot Password ───────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch { toast.error('Failed to send reset email'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Forgot Password</h1>
            <p className="text-slate-500 text-sm mb-6">Enter your email and we'll send a reset link.</p>
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle size={44} className="text-green-500 mx-auto mb-3" />
                <p className="text-navy-900 font-semibold mb-1">Check your inbox!</p>
                <p className="text-slate-500 text-sm">If an account exists with that email, a reset link has been sent.</p>
                <Link to="/login" className="btn-outline mt-4 inline-flex">Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)} className="input" />
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Send Reset Link
                </button>
                <Link to="/login" className="block text-center text-sm text-slate-500 hover:text-navy-700">Back to login</Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password ────────────────────────────────────────
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    if (form.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center"><AlertCircle size={44} className="text-red-400 mx-auto mb-3" />
        <p className="text-navy-900 font-semibold">Invalid reset link</p>
        <Link to="/forgot-password" className="btn-outline mt-4 inline-flex">Request New Link</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-1">Reset Password</h1>
            <p className="text-slate-500 text-sm mb-6">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required placeholder="Min 8 characters"
                    value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} className="input pr-10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} required placeholder="Confirm your password"
                    value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} className="input pr-10" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null} Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;