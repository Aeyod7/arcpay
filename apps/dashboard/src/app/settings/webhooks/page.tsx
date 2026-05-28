'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  'invoice.created',
  'invoice.paid',
  'invoice.overdue',
  'invoice.cancelled',
  'batch.completed'
];

export default function WebhooksPage() {
  const router = useRouter();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formEvents, setFormEvents] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/webhooks?merchantId=default_merchant`);
      const data = await res.json();
      if (data.success) setWebhooks(data.webhooks);
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl || formEvents.length === 0) return;
    setSaving(true);
    setSecret(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: 'default_merchant', url: formUrl, events: formEvents })
      });
      const data = await res.json();
      if (data.success) {
        setSecret(data.webhook.secret);
        setFormUrl('');
        setFormEvents([]);
        setShowForm(false);
        loadWebhooks();
      }
    } catch (err) {
      console.error('Failed to create webhook:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook endpoint?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      await fetch(`${apiUrl}/api/webhooks/${id}`, { method: 'DELETE' });
      loadWebhooks();
    } catch (err) {
      console.error('Failed to delete webhook:', err);
    }
  };

  const toggleEvent = (event: string) => {
    setFormEvents(prev => 
      prev.includes(event) ? prev.filter(e => e !== event) : [...prev, event]
    );
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
          <div><h2 className="text-xl font-bold text-zinc-850">Webhook Management</h2></div>
        </header>

        <main className="p-8 max-w-3xl">
          {/* Tabs */}
          <div className="flex space-x-1 mb-8 bg-white border border-[#bfc9bd]/20 rounded-xl p-1 shadow-sm">
            <button onClick={() => router.push('/settings/profile')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">Profile</button>
            <button onClick={() => router.push('/settings/api-keys')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">API Keys</button>
            <button onClick={() => router.push('/settings/webhooks')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#004c22] text-white transition-all">Webhooks</button>
            <button onClick={() => router.push('/settings')} className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 transition-all">General</button>
          </div>

          {/* Secret Display */}
          {secret && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <span className="material-symbols-outlined text-amber-500">warning</span>
                <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-sm">Webhook Secret - Save It Now!</h4>
                  <p className="text-xs text-amber-700 mt-1">Use this secret to verify webhook payload signatures via HMAC-SHA256.</p>
                  <div className="mt-3 bg-white border border-amber-300 rounded-lg p-3 font-mono text-xs text-amber-900 break-all select-all">
                    {secret}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(secret); alert('Copied!'); }}
                    className="mt-2 text-xs font-semibold text-amber-800 hover:underline">Copy secret</button>
                </div>
                <button onClick={() => setSecret(null)} className="text-amber-400 hover:text-amber-600">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
          )}

          {/* New Webhook Form */}
          {showForm && (
            <div className="mb-6 bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-zinc-800 text-sm mb-4">New Webhook Endpoint</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Endpoint URL</label>
                  <input type="url" value={formUrl} onChange={e => setFormUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#004c22]"
                    placeholder="https://yourdomain.com/api/webhooks" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Subscribe to Events</label>
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_EVENTS.map(event => (
                      <label key={event} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={formEvents.includes(event)} onChange={() => toggleEvent(event)}
                          className="rounded border-gray-300 text-[#004c22] focus:ring-[#004c22]" />
                        <span className="text-xs font-mono text-gray-700">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button type="submit" disabled={saving}
                    className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                    {saving ? 'Creating...' : 'Create Webhook'}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center">
              <h3 className="font-bold text-zinc-800 text-base">Webhook Endpoints</h3>
              <button onClick={() => setShowForm(true)}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>Add Webhook</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
            ) : webhooks.length === 0 && !showForm ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">webhook</span>
                <p className="text-sm text-gray-500">No webhooks configured. Add one to receive invoice events.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#bfc9bd]/10">
                {webhooks.map(wh => (
                  <div key={wh.id} className="p-6 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${wh.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="font-mono text-sm text-zinc-800 truncate">{wh.url}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {wh.events.map(event => (
                          <span key={event} className="inline-block bg-[#004c22]/10 text-[#004c22] text-[10px] font-semibold px-2 py-0.5 rounded-full">{event}</span>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Created: {new Date(wh.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(wh.id)}
                      className="ml-4 text-xs font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                      Delete
                    </button>
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
