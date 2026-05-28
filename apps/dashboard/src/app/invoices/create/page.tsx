'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientWallet, setClientWallet] = useState('');
  
  // Set default due date to 30 days from now
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };
  const [dueDate, setDueDate] = useState(getDefaultDueDate());

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, val: string | number) => {
    setLineItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          [field]: field === 'description' ? val : Number(val)
        };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lineItems.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      alert('Please fill in all line item details correctly.');
      return;
    }
    setLoading(true);
    try {
      const totalAmount = calculateTotal();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';

      const response = await fetch(`${apiUrl}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientWallet: clientWallet || undefined,
          dueDate,
          lineItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
          })),
          amount: totalAmount,
          description: lineItems[0]?.description || 'USDC Settlement Invoice',
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Redirect back to invoices list directory
        await new Promise((resolve) => setTimeout(resolve, 800));
        router.push('/invoices');
      } else {
        alert('Failed to generate invoice: ' + data.error);
      }
    } catch (err) {
      console.error('[ArcPay Dashboard] Invoice creation failed:', err);
      alert('Network exception occurred. Please verify backend API is active.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = calculateTotal();

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

        <main className="p-8 max-w-4xl">
          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 shadow-sm">
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
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

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Client Wallet Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={clientWallet}
                    onChange={(e) => setClientWallet(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22] font-mono"
                    placeholder="e.g. 0xClientWalletAddress"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Used to match on-chain settlement automatically
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Due Date
                  </label>
                  <input
                    required
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 focus:outline-none focus:border-[#004c22]"
                  />
                </div>
              </div>

              {/* Dynamic Line Items Table */}
              <div className="pt-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
                  Line Items Table
                </label>
                <div className="border border-[#bfc9bd]/25 rounded-xl overflow-hidden shadow-sm bg-zinc-50/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-[#bfc9bd]/15 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="p-3 pl-4">Description</th>
                        <th className="p-3 w-20 text-right">Qty</th>
                        <th className="p-3 w-32 text-right">Unit Price</th>
                        <th className="p-3 w-32 text-right">Subtotal</th>
                        <th className="p-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#bfc9bd]/10 hover:bg-[#faf9f9]/30 transition-colors">
                          <td className="p-3 pl-4">
                            <input
                              required
                              type="text"
                              value={item.description}
                              onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                              placeholder="e.g. Consulting fee"
                              className="w-full px-2 py-1.5 border border-zinc-200 rounded text-xs bg-white focus:outline-none focus:border-[#004c22]"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              required
                              min="1"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1.5 border border-zinc-200 rounded text-xs text-right bg-white focus:outline-none focus:border-[#004c22]"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              required
                              min="0"
                              step="0.01"
                              type="number"
                              value={item.unitPrice || ''}
                              onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                              placeholder="0.00"
                              className="w-full px-2 py-1.5 border border-zinc-200 rounded text-xs text-right bg-white focus:outline-none focus:border-[#004c22] font-mono"
                            />
                          </td>
                          <td className="p-3 text-xs font-mono font-bold text-zinc-800 text-right">
                            ${(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-center">
                            {lineItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(idx)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm align-middle">delete</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 bg-zinc-50 border-t border-[#bfc9bd]/10 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="border border-[#bfc9bd]/40 hover:bg-[#bfc9bd]/15 text-[#004c22] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1"
                    >
                      <span className="material-symbols-outlined text-xs">add</span>
                      <span>Add Line Item</span>
                    </button>

                    <div className="text-right pr-12">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Total Amount</span>
                      <span className="text-lg font-bold font-mono text-[#004c22]">
                        ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                    Payment Asset
                  </label>
                  <div className="w-full px-4 py-3 border border-[#bfc9bd]/25 rounded-lg text-sm bg-zinc-50 text-zinc-500 flex items-center justify-between font-semibold select-none">
                    <span>USDC Coin</span>
                    <span className="text-[#2775CA] text-xs">Arc Native</span>
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition-all transform active:scale-[0.98] shadow-md flex items-center justify-center space-x-2 h-[46px]"
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
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
