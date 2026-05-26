'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [webhookUrl, setWebhookUrl] = useState('https://api.merchant.com/webhooks');
  const [apiKey, setApiKey] = useState('arc_live_5fae860bc80a0a597a7a28e8');
  const [businessName, setBusinessName] = useState('Arc Network Solutions');
  const [businessEmail, setBusinessEmail] = useState('finance@arcpay.io');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:62650/api/settings');
        const data = await res.json();
        if (data.success) {
          setWebhookUrl(data.settings.webhookUrl || '');
          setApiKey(data.settings.apiKey || '');
          setBusinessName(data.settings.businessName || '');
          setBusinessEmail(data.settings.businessEmail || '');
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:62650/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webhookUrl,
          apiKey,
          businessName,
          businessEmail,
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert('Merchant credentials saved successfully!');
      } else {
        alert('Failed to save settings: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please verify the backend API is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#1a1c1c] font-sans flex">
      {/* Side Navigation Bar */}
      <nav className="w-64 bg-white border-r border-[#bfc9bd]/30 h-screen fixed left-0 top-0 py-8 px-4 flex flex-col justify-between z-40">
        <div>
          <div className="mb-10 px-4">
            <h1 className="text-2xl font-bold tracking-tight text-[#004c22]">Arc Network</h1>
            <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Merchant Console</p>
          </div>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => router.push('/merchant_dashboard')}
                className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"
              >
                <span className="material-symbols-outlined text-xl">dashboard</span>
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/invoices')}
                className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"
              >
                <span className="material-symbols-outlined text-xl">receipt_long</span>
                <span>Invoices</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/payouts')}
                className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"
              >
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                <span>Payouts</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"
              >
                <span className="material-symbols-outlined text-xl">settings</span>
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow pl-64 flex flex-col">
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div>
            <h2 className="text-xl font-bold text-zinc-850">Merchant Settings</h2>
          </div>
        </header>

        <main className="p-8 max-w-3xl space-y-8">
          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 shadow-sm">
            <h3 className="font-bold text-zinc-850 text-base pb-3 border-b border-zinc-100 mb-6">
              Developer API & Credentials
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Merchant Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all"
                  placeholder="https://yourdomain.com/api/webhooks"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Developer Live API Key
                </label>
                <div className="relative">
                  <input
                    readOnly
                    type="text"
                    value={apiKey}
                    className="w-full pl-4 pr-12 py-3 border border-[#bfc9bd]/25 rounded-lg text-sm bg-zinc-50 text-zinc-500 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(apiKey);
                      alert('Copied to clipboard!');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#004c22] transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Finance Contact Email
                  </label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-6 py-3 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all transform active:scale-[0.98]"
              >
                {loading ? 'Saving credentials...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
