'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Payout {
  id: string;
  amount: number;
  address: string;
  currency: string;
  status: 'submitted' | 'reviewing' | 'completed';
  createdAt: string;
}

export default function PayoutsPage() {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>([
    {
      id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b588',
      amount: 5000.00,
      address: '0x9965507B1a0597a7A28e8c8f0A0A597a7A28E8c8',
      currency: 'USDC',
      status: 'submitted',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b589',
      amount: 1.5,
      address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      currency: 'ETH',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/payouts`);
        const data = await res.json();
        if (data.success) {
          setPayouts(data.payouts);
        }
      } catch (err) {
        console.error('Failed to fetch payouts:', err);
      }
    };
    fetchPayouts();
  }, []);

  const [csvFile, setCsvFile] = useState<string | null>(null);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0].name);
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
                className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3"
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
            <h2 className="text-xl font-bold text-zinc-850">Payouts Batch Manager</h2>
          </div>
        </header>

        <main className="p-8 max-w-6.5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Upload Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-zinc-800 text-base mb-4">Bulk Payout (CSV Upload)</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-body-md">
                Upload a CSV file containing columns `address`, `amount`, and `currency`. Payout gas settles natively in USDC on the Arc Network.
              </p>
              
              <div className="border-2 border-dashed border-zinc-200 hover:border-[#004c22]/50 transition-all rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer relative bg-zinc-50/50">
                <span className="material-symbols-outlined text-3xl text-zinc-400 mb-3">upload_file</span>
                <span className="text-xs text-zinc-600 font-semibold text-center block">
                  {csvFile ? `Selected: ${csvFile}` : 'Drag & drop CSV file here'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {csvFile && (
                <button
                  onClick={() => alert('Batch transactions ready for wallet signing!')}
                  className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all mt-6"
                >
                  Initiate Wallet Signatures
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Batch History Table */}
          <div className="lg:col-span-2 bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden h-fit">
            <div className="p-6 border-b border-[#bfc9bd]/15 bg-zinc-50/50">
              <h3 className="font-bold text-zinc-850 text-base">Batch Distribution Logs</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-[#bfc9bd]/15">
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Payout ID</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Address</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Asset</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Amount</th>
                    <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b border-[#bfc9bd]/10 hover:bg-[#faf9f9]/50 transition-colors"
                    >
                      <td className="p-4 font-mono text-xs text-zinc-400">
                        {payout.id.substring(0, 16).toUpperCase()}
                      </td>
                      <td className="p-4 text-sm font-mono text-zinc-600">
                        {payout.address.substring(0, 10)}...{payout.address.substring(34)}
                      </td>
                      <td className="p-4 text-sm font-semibold text-zinc-800">{payout.currency}</td>
                      <td className="p-4 font-mono font-semibold text-sm text-zinc-800">
                        {payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold capitalize ${
                          payout.status === 'completed'
                            ? 'bg-green-500/10 text-[#166534]'
                            : 'bg-yellow-500/10 text-[#9a6a06]'
                        }`}>
                          {payout.status}
                        </span>
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
