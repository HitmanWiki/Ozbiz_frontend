// frontend/src/components/common/PushNotification.jsx
import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function PushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkSubscription();
      registerServiceWorker();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  };

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Check subscription error:', err);
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
      });
      
      await api.post('/notifications/subscribe', { subscription });
      setIsSubscribed(true);
      toast.success('Push notifications enabled!');
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await api.post('/notifications/unsubscribe', { endpoint: subscription.endpoint });
        setIsSubscribed(false);
        toast.success('Push notifications disabled');
      }
    } catch (err) {
      console.error('Unsubscribe error:', err);
      toast.error('Failed to disable notifications');
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      await api.post('/notifications/test');
      toast.success('Test notification sent!');
    } catch (err) {
      toast.error('Failed to send test notification');
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">Push Notifications</h3>
            <p className="text-xs text-slate-500">Get real-time alerts on your browser</p>
          </div>
        </div>
        <button
          onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
          disabled={loading}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSubscribed
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          } disabled:opacity-50`}
        >
          {loading ? (
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          ) : isSubscribed ? (
            <span className="flex items-center gap-1"><BellOff size={14} /> Disable</span>
          ) : (
            <span className="flex items-center gap-1"><Bell size={14} /> Enable</span>
          )}
        </button>
      </div>
      
      {isSubscribed && (
        <button
          onClick={testNotification}
          className="mt-3 text-xs text-amber-600 hover:text-amber-700 w-full text-center"
        >
          Send test notification
        </button>
      )}
    </div>
  );
}