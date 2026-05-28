'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ApiKey {
  id: string;
  keyPrefix: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
  active: boolean;
}

export default function ApiKeysPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/api-keys?merchantId=default_merchant`);
      const data = await res.json();
      if (data.success) setKeys(data.keys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyLabel.trim()) return;
    setCreating(true);
    setShowNewKey(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: 'default_merchant', label: newKeyLabel })
      });
      const data = await res.json();
      if (data.success) {
        setShowNewKey(data.apiKey.key);
        setNewKeyLabel('');
        loadKeys();
      }
    } catch (err) {
      console.error('Failed to create API key:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      await fetch(`${apiUrl}/api/api-keys/${id}`, { method: 'DELETE' });
      loadKeys();
    } catch (err) {
      console.error('Failed to revoke API key:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#1a1c1c] font-sans flex">
      <nav className="w-64 bg-white border-r border-[#bfc9bd]/30 h-screen fixed left-0 top-0 py-8 px-4 flex flex-col justify-between z-40">
        <div>
          <div className="mb-10 px-4"><h1 className="text-2xl font-bold tracking-tight text-[#004c22]">Arc Network</h1><p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Merchant Console</p></div>
          <ul className="space-y-1.5">
            <li><button onClick={() => router.push('/merchant_dashboard')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">dashboard</span><span>Dashboard</span></button></li>
            <li><button onClick={() => router.push('/invoices')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">receipt_long</span><span>Invoices</span></button></li>
            <li><button onClick={() => router.push('/settings')} className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">settings</span><span>Settings</span></button></li>
          </ul>
        </div>
      </nav>

      <div className="flex-grow pl-64 flex flex-col">
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div><h2 className="text-xl font-bold text-zinc-850">API Key Management</h2></div>
        </header>

        <main className="p-8 max-w-3xl">
          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white border border-[#bfc9bd]/20 rounded-xl p-1 shadow-sm">
            <button onClick={() => router.push('/settings/profile')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">Profile</button>
            <button onClick={() => router.push('/settings/api-keys')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#004c22] text-white transition-all">API Keys</button>
            <button onClick={() => router.push('/settings/webhooks')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">Webhooks</button>
            <button onClick={() => router.push('/settings')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">General</button>
          </div>

          {/* Create New Key Dialog */}
          {showNewKey && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-amber-500">warning</span>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-sm">API Key Generated - Save It Now!</h4>
                  <p className="text-xs text-amber-700 mt-1">This key will not be shown again. Store it securely.</p>
                  <div className="mt-3 bg-white border border-amber-300 rounded-lg p-3 font-mono text-sm text-amber-900 break-all select-all">
                    {showNewKey}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(showNewKey); alert('Copied!'); }}
                    className="mt-2 text-xs font-semibold text-amber-800 hover:underline">Copy to clipboard</button>
                </div>
                <button onClick={() => setShowNewKey(null)} className="text-amber-400 hover:text-amber-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center">
              <h3 className="font-bold text-zinc-800 text-base">API Keys</h3>
              <div className="flex space-x-2">
                <input type="text" value={newKeyLabel} onChange={e => setNewKeyLabel(e.target.value)}
                  className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-zinc-50 focus:outline-none focus:border-[#004c22] w-48"
                  placeholder="Label (e.g. Production)" />
                <button onClick={handleCreateKey} disabled={creating || !newKeyLabel.trim()}
                  className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center space-x-1">
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Generate Key</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
            ) : keys.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">key</span>
                <p className="text-sm text-gray-500">No API keys yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#bfc9bd]/10">
                {keys.map(key => (
                  <div key={key.id} className="p-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${key.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-semibold text-sm text-zinc-800">{key.label}</span>
                      </div>
                      <p className="text-xs font-mono text-zinc-400 mt-1">{key.keyPrefix}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                      {key.lastUsedAt && <p className="text-xs text-zinc-400">Last used: {new Date(key.lastUsedAt).toLocaleDateString()}</p>}
                    </div>
                    {key.active && (
                      <button onClick={() => handleRevoke(key.id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
