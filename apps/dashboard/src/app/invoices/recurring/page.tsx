'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RecurringInvoice {
  id: string;
  templateData: any;
  frequency: string;
  nextRunAt: string;
  active: boolean;
  createdAt: string;
}

export default function RecurringInvoicesPage() {
  const router = useRouter();
  const [recurrings, setRecurrings] = useState<RecurringInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientWallet, setClientWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('monthly');

  useEffect(() => {
    loadRecurrings();
  }, []);

  const loadRecurrings = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/recurring-invoices?merchantId=default_merchant`);
      const data = await res.json();
      if (data.success) setRecurrings(data.recurrings || []);
    } catch (err) {
      console.error('Failed to load recurring invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !amount) return;
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/recurring-invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: 'default_merchant',
          templateData: {
            clientName: clientName || clientEmail,
            clientEmail,
            clientWallet: clientWallet || null,
            amount: parseFloat(amount),
            description: description || 'Recurring Invoice',
            lineItems: [{ description: description || 'Recurring service', quantity: 1, unitPrice: parseFloat(amount) }]
          },
          frequency
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        resetForm();
        loadRecurrings();
      }
    } catch (err) {
      console.error('Failed to create recurring:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setClientEmail('');
    setClientName('');
    setClientWallet('');
    setAmount('');
    setDescription('');
    setFrequency('monthly');
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      await fetch(`${apiUrl}/api/recurring-invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      });
      loadRecurrings();
    } catch (err) {
      console.error('Failed to toggle recurring:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#1a1c1c] font-sans flex">
      <nav className="w-64 bg-white border-r border-[#bfc9bd]/30 h-screen fixed left-0 top-0 py-8 px-4 flex flex-col justify-between z-40">
        <div>
          <div className="mb-10 px-4"><h1 className="text-2xl font-bold tracking-tight text-[#004c22]">Arc Network</h1><p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Merchant Console</p></div>
          <ul className="space-y-1.5">
            <li><button onClick={() => router.push('/merchant_dashboard')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">dashboard</span><span>Dashboard</span></button></li>
            <li><button onClick={() => router.push('/invoices')} className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">receipt_long</span><span>Invoices</span></button></li>
            <li><button onClick={() => router.push('/invoices/recurring')} className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">repeat</span><span>Recurring</span></button></li>
            <li><button onClick={() => router.push('/payouts')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"><span className="material-symbols-outlined text-xl">account_balance_wallet</span><span>Payouts</span></button></li>
          </ul>
        </div>
      </nav>

      <div className="flex-grow pl-64 flex flex-col">
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div><h2 className="text-xl font-bold text-zinc-850">Recurring Invoices</h2></div>
        </header>

        <main className="p-8 max-w-4xl">
          {/* Create Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
              <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-gray-200" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-zinc-800 text-lg mb-6">New Recurring Schedule</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Client Email</label>
                      <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#004c22]" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Client Name</label>
                      <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#004c22]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Client Wallet</label>
                      <input type="text" value={clientWallet} onChange={e => setClientWallet(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#004c22]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Amount (USDC)</label>
                      <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#004c22]" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Frequency</label>
                      <select value={frequency} onChange={e => setFrequency(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#004c22] bg-white">
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                      <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-[#004c22]" />
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <button type="submit" disabled={saving}
                      className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                      {saving ? 'Creating...' : 'Create Schedule'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)}
                      className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-800 text-base">Active Schedules</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Automatically generate invoices on a recurring basis</p>
              </div>
              <button onClick={() => setShowForm(true)}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1">
                <span className="material-symbols-outlined text-sm">add</span>
                <span>New Schedule</span>
              </button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
            ) : recurrings.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">repeat</span>
                <p className="text-sm text-gray-500">No recurring schedules yet.</p>
                <p className="text-xs text-gray-400 mt-1">Create a schedule to automatically invoice clients weekly, monthly, or quarterly.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#bfc9bd]/10">
                {recurrings.map(rec => {
                  const template = typeof rec.templateData === 'string' ? JSON.parse(rec.templateData) : rec.templateData;
                  return (
                    <div key={rec.id} className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`h-2 w-2 rounded-full ${rec.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className="font-semibold text-sm text-zinc-800">{template?.clientName || template?.clientEmail}</span>
                          <span className="text-xs font-mono text-[#004c22] bg-[#004c22]/10 px-2 py-0.5 rounded-full capitalize">{rec.frequency}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1.5">
                          <span className="text-xs text-gray-500">${parseFloat(template?.amount || 0).toFixed(2)} USDC</span>
                          <span className="text-xs text-gray-400">Next: {new Date(rec.nextRunAt).toLocaleDateString()}</span>
                          {template?.clientEmail && <span className="text-xs text-gray-400 font-mono">{template.clientEmail}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleToggle(rec.id, !rec.active)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          rec.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                        }`}>
                        {rec.active ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
