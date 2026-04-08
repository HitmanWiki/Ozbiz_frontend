import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Public pages
import HomePage from './pages/public/HomePage';
import ListingsPage from './pages/public/ListingsPage';
import ListingDetailPage from './pages/public/ListingDetailPage';
import CategoryPage from './pages/public/CategoryPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AddListingPage from './pages/public/AddListingPage';
import DashboardPage from './pages/public/DashboardPage';
import SettingsPage from './pages/public/SettingsPage';
import NotFoundPage from './pages/public/NotFoundPage';
import VerifyEmailPage from './pages/public/VerifyEmailPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import BlogPage from './pages/public/BlogPage';
import BlogDetailPage from './pages/public/BlogDetailPage';
import ProfilePage from './pages/public/ProfilePage';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import LeadManagement from './pages/vendor/LeadManagement';
import ReviewManagement from './pages/vendor/ReviewManagement';
import SubscriptionPlans from './pages/vendor/SubscriptionPlans';

// Admin pages
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminReviews from './pages/admin/AdminReviews';
import AdminEnquiries from './pages/admin/AdminEnquiries';
import AdminCategories from './pages/admin/AdminCategories';
import AdminAds from './pages/admin/AdminAds';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminNewsletter from './pages/admin/AdminNewsletter';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminSEO from './pages/admin/AdminSEO';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requireVendor = false }) => {
  const { user, loading, isVendor } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (requireVendor && !isVendor && user?.userType !== 'both') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:slug" element={<ListingDetailPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected User Routes */}
       {/* Protected User Routes */}
<Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
<Route path="/add-listing" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />
<Route path="/add-listing/:id" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />
<Route path="/edit-listing/:id" element={<ProtectedRoute><AddListingPage /></ProtectedRoute>} />  {/* ADD THIS */}

        {/* Vendor Routes */}
        <Route path="/vendor/dashboard" element={<ProtectedRoute requireVendor><VendorDashboard /></ProtectedRoute>} />
        <Route path="/vendor/leads" element={<ProtectedRoute requireVendor><LeadManagement /></ProtectedRoute>} />
        <Route path="/vendor/reviews" element={<ProtectedRoute requireVendor><ReviewManagement /></ProtectedRoute>} />
        <Route path="/subscription" element={<ProtectedRoute><SubscriptionPlans /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="seo" element={<AdminSEO />} />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          borderRadius: '10px',
          maxWidth: '380px',
        },
        success: { iconTheme: { primary: '#0f2a56', secondary: '#fff' } },
      }}
    />
  </AuthProvider>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);