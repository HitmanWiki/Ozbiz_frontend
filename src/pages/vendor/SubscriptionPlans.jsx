// frontend/src/pages/vendor/SubscriptionPlans.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Star, Crown, Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import api from '../../utils/api';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: Sparkles,
    price: 0,
    period: 'month',
    features: [
      '1 Active Listing',
      'Basic Listing Features',
      'Email Support',
      'Basic Analytics',
      'Standard Visibility'
    ],
    limitations: [
      'No Featured placement',
      'Limited to 50 views/month',
      'No priority support'
    ],
    color: 'slate',
    buttonClass: 'btn-outline'
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Star,
    price: 29,
    period: 'month',
    features: [
      '5 Active Listings',
      'Premium Listing Features',
      'Priority Email Support',
      'Advanced Analytics',
      'Increased Visibility',
      'Featured on Homepage',
      'Verified Badge'
    ],
    limitations: [],
    color: 'amber',
    popular: true,
    buttonClass: 'btn-primary'
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: Crown,
    price: 79,
    period: 'month',
    features: [
      'Unlimited Listings',
      'Elite Listing Features',
      '24/7 Priority Support',
      'Full Analytics Suite',
      'Maximum Visibility',
      'Featured + Top Placement',
      'Verified + Trust Badge',
      'Sponsored Placement',
      'Dedicated Account Manager'
    ],
    limitations: [],
    color: 'purple',
    buttonClass: 'bg-purple-600 text-white hover:bg-purple-700'
  }
];

export default function SubscriptionPlans() {
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const res = await api.get('/listings/my');
      if (res.data.length > 0) {
        setCurrentPlan(res.data[0].plan || 'free');
      }
    } catch (err) {
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) {
      toast.error(`You are already on the ${planId} plan`);
      return;
    }
    try {
      await api.post('/subscription/upgrade', { planId });
      toast.success(`Successfully upgraded to ${planId} plan!`);
      setCurrentPlan(planId);
    } catch (err) {
      toast.error('Failed to upgrade plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-navy-800 border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to="/vendor/dashboard" className="text-slate-400 hover:text-navy-600">
              <ArrowLeft size={20} />
            </Link>
            <div className="text-center flex-1">
              <h1 className="font-display text-3xl font-bold text-navy-900">Choose Your Plan</h1>
              <p className="text-slate-500 mt-2">Upgrade to grow your business and reach more customers</p>
            </div>
            <div className="w-8"></div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div 
                key={plan.id}
                className={`bg-white rounded-xl border p-6 shadow-sm transition-all hover:shadow-md ${
                  plan.popular ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <div className="mb-4">
                    <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 mb-4">
                  <plan.icon size={24} className={plan.id === 'premium' ? 'text-amber-500' : plan.id === 'elite' ? 'text-purple-500' : 'text-slate-500'} />
                  <h2 className="text-xl font-bold text-navy-900">{plan.name}</h2>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-navy-900">${plan.price}</span>
                  <span className="text-slate-500">/{plan.period}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={14} className="text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={currentPlan === plan.id}
                  className={`w-full py-2 rounded-lg text-sm font-semibold transition-colors ${
                    currentPlan === plan.id
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : plan.buttonClass
                  }`}
                >
                  {currentPlan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">What's Included in Each Plan?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PLANS.map(plan => (
                <div key={plan.id} className={`p-4 rounded-lg ${
                  plan.id === 'premium' ? 'bg-amber-50 border border-amber-200' :
                  plan.id === 'elite' ? 'bg-purple-50 border border-purple-200' :
                  'bg-slate-50 border border-slate-200'
                }`}>
                  <h4 className="font-semibold text-navy-900 mb-2">{plan.name}</h4>
                  <ul className="space-y-1">
                    {plan.features.slice(0, 5).map(f => (
                      <li key={f} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Check size={10} className="text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}