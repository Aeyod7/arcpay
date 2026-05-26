'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceStatusBadge } from '@arcpay/ui';

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
  createdAt: string;
}

export default function InvoicesHistoryPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b586',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      amount: 12500.0,
      description: 'Consulting Services Q3',
      status: 'paid',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '63c4be3b-46da-4d6e-b11d-6634e7995278',
      clientName: 'Initech',
      clientEmail: 'finance@initech.com',
      amount: 8900.0,
      description: 'Custom Platform Licensing',
      status: 'overdue',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '6b20dddd-e1c8-4f76-a46b-c0a65e3f8bb6',
      clientName: 'Globex Inc.',
      clientEmail: 'payments@globex.com',
      amount: 4200.0,
      description: 'API Gateway Subscription',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('http://localhost:62650/api/invoices');
        const data = await res.json();
        if (data.success) {
          setInvoices(data.invoices);
        }
      } catch (err) {
        console.error('Failed to fetch invoices:', err);
      }
    };
    fetchInvoices();
  }, []);

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
        <div className="px-2">
          <button
            onClick={() => router.push('/invoices/create')}
            className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md transform active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Create Invoice</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow pl-64 flex flex-col">
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div>
            <h2 className="text-xl font-bold text-zinc-850">Invoices Directory</h2>
          </div>
        </header>

        <main className="p-8 max-w-6.5xl">
          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-bold text-zinc-850 text-base">All Ledger Invoices</h3>
              <button
                onClick={() => router.push('/invoices/create')}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                <span>New Invoice</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-[#bfc9bd]/15">
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Client Details</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Created</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Settlement Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-[#bfc9bd]/10 hover:bg-[#faf9f9]/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-zinc-800 text-sm">{invoice.clientName}</div>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">{invoice.clientEmail}</div>
                      </td>
                      <td className="p-4 text-sm text-zinc-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-zinc-500">{invoice.description}</td>
                      <td className="p-4 font-mono font-semibold text-sm text-zinc-800">
                        {invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                      </td>
                      <td className="p-4">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
