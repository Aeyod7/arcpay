'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceStatusBadge } from '@arcpay/ui';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

interface DashboardMetrics {
  totalRevenue: number;
  pendingInvoicesCount: number;
  paidInvoicesCount: number;
  activePayoutsCount: number;
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
  createdAt: string;
}

export default function MerchantDashboard() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 124500.0,
    pendingInvoicesCount: 1,
    paidInvoicesCount: 2,
    activePayoutsCount: 1,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([
    {
      id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b586',
      clientName: 'Acme Corp',
      clientEmail: 'billing@acme.com',
      amount: 12500.0,
      description: 'Consulting Services Q3',
      status: 'paid',
      createdAt: new Date().toISOString(),
    },
    {
      id: '63c4be3b-46da-4d6e-b11d-6634e7995278',
      clientName: 'Initech',
      clientEmail: 'finance@initech.com',
      amount: 8900.0,
      description: 'Custom Platform Licensing',
      status: 'overdue',
      createdAt: new Date().toISOString(),
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
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('http://localhost:62650/api/dashboard');
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          setRecentInvoices(data.recentInvoices);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      }
    };
    fetchDashboardData();
  }, []);

  // Connect Wallet Action
  const handleConnectWallet = async () => {
    const win = window as any;
    if (typeof win.ethereum !== 'undefined') {
      try {
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
      } catch (err) {
        console.error('Wallet connection failed:', err);
      }
    } else {
      // simulated connect
      setWalletAddress('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
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
                className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"
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

      {/* Main Content View */}
      <div className="flex-grow pl-64 flex flex-col">
        {/* Top App Bar */}
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div>
            <h2 className="text-xl font-bold text-zinc-850">Merchant Dashboard</h2>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-zinc-400 hover:text-[#004c22] transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[#ba1a1a]"></span>
            </button>

            {/* Connect Wallet Button */}
            <button
              onClick={handleConnectWallet}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg text-sm font-semibold transition-all ${
                walletAddress
                  ? 'border-[#004c22]/20 bg-[#004c22]/5 text-[#004c22]'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {walletAddress ? 'check_circle' : 'account_balance_wallet'}
              </span>
              <span>
                {walletAddress
                  ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(38)}`
                  : 'Connect Wallet'}
              </span>
            </button>

            {/* Profile / Auth Controls */}
            <div className="flex items-center space-x-3">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-zinc-600 hover:text-[#004c22] text-sm font-semibold transition-all">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-8 max-w-6.5xl space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Revenue</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                  ${metrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm font-bold text-[#2775CA]">USDC</span>
              </div>
            </div>

            {/* Pending Invoices */}
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pending Invoices</h3>
              <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                {metrics.pendingInvoicesCount}
              </span>
            </div>

            {/* Paid Invoices */}
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Paid Invoices</h3>
              <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                {metrics.paidInvoicesCount}
              </span>
            </div>

            {/* Active Payouts */}
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Active Payouts</h3>
              <span className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                {metrics.activePayoutsCount}
              </span>
            </div>
          </div>

          {/* Revenue Chart & Quick Action */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm h-80 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-4 border-b border-[#bfc9bd]/10">
                <h3 className="font-semibold text-zinc-800 text-base">Revenue Chart</h3>
                <span className="text-xs text-[#004c22] font-semibold bg-[#004c22]/10 px-2.5 py-1 rounded-md">
                  Active (Arc Ledger)
                </span>
              </div>
              <div className="flex-grow flex items-center justify-center relative overflow-hidden bg-[#faf9f9]/50 rounded-xl my-4 border border-dashed border-[#bfc9bd]/30">
                <div className="text-center z-10">
                  <p className="text-xs font-mono text-zinc-400">0xArcNetwork USDC Settlement Activity</p>
                </div>
                <svg className="absolute bottom-0 w-full h-[60%] text-[#a6f4b5]/30" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,100 C30,40 60,60 100,10 L100,100 Z" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm h-80 flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-xl">send</span>
                </div>
                <h4 className="font-bold text-zinc-800 text-lg">Quick Invoicing</h4>
                <p className="text-sm text-zinc-500 mt-2 leading-relaxed font-body-md">
                  Generate dynamic billing intents on the Arc Network. Gas fee is natively resolved in USDC.
                </p>
              </div>
              <button
                onClick={() => router.push('/invoices/create')}
                className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all"
              >
                Create New Invoice
              </button>
            </div>
          </div>

          {/* Recent Invoices Table */}
          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center">
              <h3 className="font-bold text-zinc-800 text-base">Recent Invoices</h3>
              <button className="text-[#004c22] text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-[#bfc9bd]/15">
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Client</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-[#bfc9bd]/10 hover:bg-[#faf9f9]/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-semibold text-zinc-800 text-sm">{invoice.clientName}</div>
                        <div className="text-xs font-mono text-zinc-400 mt-0.5">
                          INV-{invoice.id.substring(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-zinc-500">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono font-semibold text-sm text-zinc-800">
                        {invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                      </td>
                      <td className="p-4">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => router.push(`/invoices/pay/${invoice.id}`)}
                          className="p-2 text-zinc-400 hover:text-[#004c22] rounded-lg hover:bg-zinc-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">payments</span>
                        </button>
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
