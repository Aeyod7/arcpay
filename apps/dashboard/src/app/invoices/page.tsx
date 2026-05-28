'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InvoiceStatusBadge } from '@arcpay/ui';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  createdAt: string;
  dueDate?: string;
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices`);
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [processingBatch, setProcessingBatch] = useState(false);
  const [batchTxHash, setBatchTxHash] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices`);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const pendingInvoices = invoices.filter(i => i.status === 'pending');
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pendingInvoices.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  const handleBatchPay = async () => {
    setProcessingBatch(true);
    try {
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';

      // Pay all selected invoices in sequence
      for (const id of selectedIds) {
        await fetch(`${apiUrl}/api/invoices/${id}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash: mockTxHash })
        });
      }

      setBatchTxHash(mockTxHash);
      await fetchInvoices();
    } catch (err) {
      console.error('Batch payment settlement failed:', err);
    } finally {
      setProcessingBatch(false);
    }
  };

  const copyReceiptLink = (id: string) => {
    const url = `${window.location.origin}/receipt/${id}`;
    navigator.clipboard.writeText(url);
    alert('Receipt link copied!');
  };

  const handleCancelInvoice = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      const res = await fetch(`${apiUrl}/api/invoices/${id}/cancel`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        alert('Invoice cancelled successfully.');
        await fetchInvoices();
      } else {
        alert('Failed to cancel invoice: ' + data.error);
      }
    } catch (err) {
      console.error('Failed to cancel invoice:', err);
    }
  };

  const getStatusBadge = (status: string, dueDateStr?: string) => {
    const normalized = status.toLowerCase();
    
    // Check if overdue
    const isOverdue = normalized === 'overdue' || (normalized === 'pending' && dueDateStr && new Date(dueDateStr) < new Date());
    
    let bg = 'bg-gray-50 text-gray-500 border-gray-200';
    let dot = 'bg-gray-400';
    let label = status.charAt(0).toUpperCase() + status.slice(1);

    if (normalized === 'paid') {
      bg = 'bg-green-50 text-green-700 border-green-200';
      dot = 'bg-[#22c55e]';
      label = 'Paid';
    } else if (isOverdue) {
      bg = 'bg-red-50 text-red-700 border-red-200';
      dot = 'bg-[#ef4444]';
      label = 'Overdue';
    } else if (normalized === 'pending') {
      bg = 'bg-amber-50 text-amber-700 border-amber-200';
      dot = 'bg-[#f59e0b]';
      label = 'Pending';
    } else if (normalized === 'cancelled') {
      bg = 'bg-gray-50 text-gray-400 border-gray-200';
      dot = 'bg-gray-300';
      label = 'Cancelled';
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${bg} space-x-1.5 select-none uppercase tracking-wider`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`}></span>
        <span>{label}</span>
      </span>
    );
  };

  const selectedInvoices = invoices.filter(i => selectedIds.includes(i.id));
  const batchTotal = selectedInvoices.reduce((sum, i) => sum + i.amount, 0);

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
          {/* Batch Invoices Bar */}
          {selectedIds.length > 0 && (
            <div className="mb-6 bg-[#f0f7f2] border border-[#bfc9bd]/30 rounded-2xl p-4 flex justify-between items-center shadow-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-[#004c22] text-xl">layers</span>
                <span className="text-sm font-semibold text-zinc-700">
                  {selectedIds.length} invoice(s) selected &bull;{' '}
                  <span className="font-mono text-[#004c22] font-bold">
                    ${batchTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                  </span>
                </span>
              </div>
              <button
                onClick={() => { setBatchTxHash(null); setShowBatchModal(true); }}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm flex items-center space-x-1.5"
              >
                <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                <span>Batch Settle ({selectedIds.length})</span>
              </button>
            </div>
          )}

          <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-bold text-zinc-850 text-base">All Ledger Invoices</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/invoices/batch')}
                  className="border border-[#bfc9bd]/40 hover:bg-[#bfc9bd]/10 text-[#004c22] px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>CSV Batch Upload</span>
                </button>
                <button
                  onClick={() => router.push('/invoices/create')}
                  className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center space-x-1"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>New Invoice</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-[#bfc9bd]/15 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      {pendingInvoices.length > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedIds.length === pendingInvoices.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-gray-300 text-[#004c22] focus:ring-[#004c22]"
                        />
                      )}
                    </th>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Client Details</th>
                    <th className="p-4">Issued</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => {
                    const isOverdue = invoice.status === 'overdue' || 
                      (invoice.status === 'pending' && invoice.dueDate && new Date(invoice.dueDate) < new Date());

                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-[#bfc9bd]/10 hover:bg-[#faf9f9]/50 transition-colors text-sm"
                      >
                        <td className="p-4 text-center">
                          {invoice.status === 'pending' && (
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(invoice.id)}
                              onChange={(e) => handleSelectRow(invoice.id, e.target.checked)}
                              className="rounded border-gray-300 text-[#004c22] focus:ring-[#004c22]"
                            />
                          )}
                        </td>
                        <td className="p-4 font-mono font-bold text-xs">
                          <a 
                            href={`/receipt/${invoice.id}`} 
                            target="_blank" 
                            className="text-[#004c22] hover:underline"
                          >
                            {invoice.invoiceNumber || invoice.id.substring(0, 18).toUpperCase()}
                          </a>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-zinc-800">{invoice.clientName}</div>
                          <div className="text-xs font-mono text-zinc-400 mt-0.5">{invoice.clientEmail}</div>
                        </td>
                        <td className="p-4 text-xs text-zinc-500">
                          {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4 text-xs">
                          {invoice.dueDate ? (
                            <span className={isOverdue ? "text-red-500 font-semibold flex items-center space-x-1" : "text-zinc-600"}>
                              <span>{new Date(invoice.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</span>
                              {isOverdue && <span className="text-xs">⚠</span>}
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="p-4 font-mono font-semibold text-zinc-800 text-right">
                          ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                        </td>
                        <td className="p-4">
                          {getStatusBadge(invoice.status, invoice.dueDate || undefined)}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <a
                              href={`/receipt/${invoice.id}`}
                              target="_blank"
                              title="View Receipt"
                              className="p-1 hover:text-[#004c22] text-zinc-400 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                            </a>
                            {invoice.status === 'paid' && (
                              <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices/${invoice.id}/receipt.pdf`}
                                download
                                title="Download PDF"
                                className="p-1 hover:text-[#004c22] text-zinc-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                              </a>
                            )}
                            <button
                              type="button"
                              title="Copy Receipt Link"
                              onClick={() => copyReceiptLink(invoice.id)}
                              className="p-1 hover:text-[#004c22] text-zinc-400 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                            {invoice.status === 'pending' && (
                              <button
                                type="button"
                                title="Cancel Invoice"
                                onClick={() => handleCancelInvoice(invoice.id)}
                                className="p-1 hover:text-red-500 text-zinc-400 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">cancel</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Multi-Send Web3 Batch Settlement Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-[#004c22] px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined">layers</span>
                <h3 className="font-bold text-base tracking-tight">On-Chain Batch Settlement</h3>
              </div>
              <button onClick={() => setShowBatchModal(false)} className="hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {batchTxHash ? (
                /* Success View */
                <div className="text-center space-y-4 py-4">
                  <span className="material-symbols-outlined text-5xl text-green-600 animate-bounce">check_circle</span>
                  <h4 className="font-bold text-lg text-zinc-800">Batch Dispatched Successfully</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Settled {selectedIds.length} invoice(s) in a single cryptographic multi-send transaction block.
                  </p>
                  
                  <div className="bg-[#f0f7f2] border border-[#bfc9bd]/30 rounded-xl p-4 text-left space-y-2 mt-4 max-w-md mx-auto">
                    <p className="text-xs font-semibold text-[#004c22] uppercase tracking-wider">Transaction Ledger Proof</p>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Multisend Hash</span>
                      <span className="text-xs font-mono text-[#004c22] break-all block">{batchTxHash}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-400 block">Total Dispatched Volume</span>
                      <span className="text-sm font-semibold font-mono text-zinc-850">${batchTotal.toLocaleString()} USDC</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowBatchModal(false); setSelectedIds([]); }}
                    className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all mt-6 shadow-sm"
                  >
                    Done & Return
                  </button>
                </div>
              ) : (
                /* Payment Details View */
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-zinc-850 text-sm mb-2">Review Batch Multi-Send</h4>
                    <p className="text-xs text-zinc-500">
                      Sign a single transaction to batch-transfer stablecoins to {selectedIds.length} client settlement wallets.
                    </p>
                  </div>

                  {/* List items */}
                  <div className="border border-[#bfc9bd]/25 rounded-xl divide-y divide-[#bfc9bd]/10 max-h-40 overflow-y-auto">
                    {selectedInvoices.map(inv => (
                      <div key={inv.id} className="p-3 flex justify-between items-center bg-zinc-50/20">
                        <div className="min-w-0 pr-4">
                          <span className="font-semibold text-xs text-zinc-855 block truncate">{inv.clientName}</span>
                          <span className="text-[10px] font-mono text-zinc-400 block truncate">{inv.clientEmail}</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-800">${inv.amount.toLocaleString()} USDC</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-[#f0f7f2] border border-[#bfc9bd]/30 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-semibold text-zinc-600 block">Aggregated Total Amount</span>
                      <span className="text-[10px] text-zinc-400">Zero gas Arc native contract routing</span>
                    </div>
                    <span className="text-xl font-extrabold font-mono text-[#004c22]">
                      ${batchTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleBatchPay}
                      disabled={processingBatch}
                      className="flex-1 bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center space-x-2"
                    >
                      {processingBatch ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Signing and Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                          <span>Trigger Wallet Transaction</span>
                        </>
                      )}
                    </button>
                    <button
                      disabled={processingBatch}
                      onClick={() => setShowBatchModal(false)}
                      className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
