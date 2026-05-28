'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    userId: 'default_merchant',
    businessName: '',
    email: '',
    address: '',
    website: '',
    taxId: '',
    logoUrl: ''
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
        const res = await fetch(`${apiUrl}/api/merchant/profile?userId=default_merchant`);
        const data = await res.json();
        if (data.success && data.profile) {
          setProfile({
            userId: data.profile.userId || 'default_merchant',
            businessName: data.profile.businessName || '',
            email: data.profile.email || '',
            address: data.profile.address || '',
            website: data.profile.website || '',
            taxId: data.profile.taxId || '',
            logoUrl: data.profile.logoUrl || ''
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/merchant/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile saved successfully!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage('Error: ' + data.error);
      }
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#1a1c1c] font-sans flex">
      <nav className="w-64 bg-white border-r border-[#bfc9bd]/30 h-screen fixed left-0 top-0 py-8 px-4 flex flex-col justify-between z-40">
        <div>
          <div className="mb-10 px-4">
            <h1 className="text-2xl font-bold tracking-tight text-[#004c22]">Arc Network</h1>
            <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Merchant Console</p>
          </div>
          <ul className="space-y-1.5">
            <li><button onClick={() => router.push('/merchant_dashboard')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">dashboard</span><span>Dashboard</span></button></li>
            <li><button onClick={() => router.push('/invoices')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">receipt_long</span><span>Invoices</span></button></li>
            <li><button onClick={() => router.push('/payouts')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">account_balance_wallet</span><span>Payouts</span></button></li>
            <li><button onClick={() => router.push('/settings')} className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">settings</span><span>Settings</span></button></li>
          </ul>
        </div>
      </nav>

      <div className="flex-grow pl-64 flex flex-col">
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div>
            <h2 className="text-xl font-bold text-zinc-850">Business Profile</h2>
          </div>
        </header>

        <main className="p-8 max-w-3xl">
          {/* Settings Tabs */}
          <div className="flex space-x-1 mb-8 bg-white border border-[#bfc9bd]/20 rounded-xl p-1 shadow-sm">
            <button onClick={() => router.push('/settings/profile')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#004c22] text-white transition-all">Profile</button>
            <button onClick={() => router.push('/settings/api-keys')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">API Keys</button>
            <button onClick={() => router.push('/settings/webhooks')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">Webhooks</button>
            <button onClick={() => router.push('/settings')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">General</button>
          </div>

          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 shadow-sm">
            <h3 className="font-bold text-zinc-800 text-base mb-6">Business Information</h3>
            <p className="text-sm text-zinc-500 mb-6">
              This information appears on all invoices and PDF receipts sent to your clients.
            </p>

            {message && (
              <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Business Name</label>
                  <input type="text" value={profile.businessName} onChange={e => setProfile(p => ({...p, businessName: e.target.value}))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all"
                    placeholder="Your Company Name" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                    placeholder="finance@yourcompany.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Tax ID</label>
                  <input type="text" value={profile.taxId} onChange={e => setProfile(p => ({...p, taxId: e.target.value}))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                    placeholder="XX-XXXXXXX" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Website</label>
                  <input type="url" value={profile.website} onChange={e => setProfile(p => ({...p, website: e.target.value}))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                    placeholder="https://yourcompany.com" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Logo URL</label>
                  <input type="url" value={profile.logoUrl} onChange={e => setProfile(p => ({...p, logoUrl: e.target.value}))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                    placeholder="https://yourcompany.com/logo.png" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Address</label>
                  <input type="text" value={profile.address} onChange={e => setProfile(p => ({...p, address: e.target.value}))}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                    placeholder="123 Business St, City, Country" />
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-8 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-sm transform active:scale-[0.98] flex items-center space-x-2">
                {saving ? (
                  <><svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg><span>Saving...</span></>
                ) : (
                  <><span className="material-symbols-outlined text-sm">save</span><span>Save Profile</span></>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
