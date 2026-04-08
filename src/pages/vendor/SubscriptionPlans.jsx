// frontend/src/pages/vendor/SubscriptionPlans.jsx
import { useState, useEffect } from 'react';
import { Check, Zap, Star, Crown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
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
    color: 'gold',
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
      // Get plan from first listing or user's subscription
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
    toast.success(`Upgrading to ${planId} plan... (Payment integration coming soon)`);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-navy-900">Choose Your Plan</h1>
        <p className="text-slate-500 mt-2">Upgrade to grow your business and reach more customers</p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl border border-slate-100">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="p-4 text-left"></th>
              {PLANS.map(plan => (
                <th key={plan.id} className="p-4 text-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    plan.id === 'premium' ? 'bg-gold-100 text-gold-700' :
                    plan.id === 'elite' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    <plan.icon size={12} /> {plan.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-medium text-navy-900">Monthly Price</td>
              {PLANS.map(plan => (
                <td key={plan.id} className="p-4 text-center">
                  <span className="text-2xl font-bold text-navy-900">${plan.price}</span>
                  <span className="text-slate-400 text-sm">/{plan.period}</span>
                </td>
              ))}
            </tr>
            <tr className="border-b border-slate-100">
              <td className="p-4 font-medium text-navy-900">Active Listings</td>
              {PLANS.map(plan => (
                <td key={plan.id} className="p-4 text-center text-slate-600">
                  {plan.id === 'free' ? '1' : plan.id === 'premium' ? '5' : 'Unlimited'}
                </td>
              ))}
            </tr>
            {PLANS[0].features.map((feature, idx) => (
              <tr key={idx} className="border-b border-slate-50">
                <td className="p-4 text-sm text-slate-600">{feature}</td>
                {PLANS.map(plan => (
                  <td key={plan.id} className="p-4 text-center">
                    {plan.features.includes(feature) ? (
                      <Check size={18} className="text-green-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="p-4"></td>
              {PLANS.map(plan => (
                <td key={plan.id} className="p-4 text-center">
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
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Feature Comparison Details */}
      <div className="bg-slate-50 rounded-xl p-6">
        <h3 className="font-semibold text-navy-900 mb-4">What's Included in Each Plan?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div key={plan.id} className={`p-4 rounded-lg ${
              plan.id === 'premium' ? 'bg-gold-50 border border-gold-200' :
              plan.id === 'elite' ? 'bg-purple-50 border border-purple-200' :
              'bg-white border border-slate-200'
            }`}>
              <h4 className="font-semibold text-navy-900 mb-2">{plan.name} Plan</h4>
              <ul className="space-y-1">
                {plan.features.map(f => (
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
  );
}