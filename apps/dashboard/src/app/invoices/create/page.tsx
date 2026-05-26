'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Direct post connection to express developer backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName,
          clientEmail,
          amount: parseFloat(amount),
          description: description || 'USDC Settlement Invoice',
        }),
      });

      // Redirect back to dashboard directory
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push('/merchant_dashboard');
    } catch (err) {
      console.error('[ArcPay Dashboard] Invoice creation failed:', err);
      router.push('/merchant_dashboard'); // fallback redirect
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
                className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"
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
                className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3"
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
            <h2 className="text-xl font-bold text-zinc-850">Create New Invoice</h2>
          </div>
        </header>

        <main className="p-8 max-w-2xl">
          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Client Name
                </label>
                <input
                  required
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Client Email Address
                </label>
                <input
                  required
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all"
                  placeholder="e.g. accounts@acme.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Settlement Amount (USDC)
                  </label>
                  <input
                    required
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all"
                    placeholder="e.g. 500.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Payment Asset
                  </label>
                  <div className="w-full px-4 py-3 border border-[#bfc9bd]/25 rounded-lg text-sm bg-zinc-50 text-zinc-500 flex items-center justify-between font-semibold select-none">
                    <span>USDC Coin</span>
                    <span className="text-[#2775CA] text-xs">Arc Native</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                  Description / Memo
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all h-24 resize-none"
                  placeholder="Provide payment details or project terms..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition-all transform active:scale-[0.98] shadow-md flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Generating Intent...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">qr_code</span>
                    <span>Generate Invoice Intent</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
