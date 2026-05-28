'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Invoice {
  id: string;
  invoiceNumber?: string;
  clientName: string;
  clientEmail: string;
  clientWallet?: string;
  amount: number;
  description: string;
  lineItems?: any[];
  status: string;
  txHash?: string;
  blockNumber?: number;
  paidAt?: string;
  createdAt: string;
  dueDate?: string;
  memo?: string;
  merchantId?: string;
}

interface Merchant {
  businessName: string;
  email?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
}

export default function PublicReceiptPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [merchant, setMerchant] = useState<Merchant>({
    businessName: 'Arc Network Solutions',
    email: 'finance@arcpay.io'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
        
        const invRes = await fetch(`${apiUrl}/api/invoices/${invoiceId}`);
        const invData = await invRes.json();
        
        if (invData.success) {
          setInvoice(invData.invoice);
          
          const merchantRes = await fetch(`${apiUrl}/api/merchant/profile?userId=${invData.invoice.merchantId || 'default_merchant'}`);
          const merchantData = await merchantRes.json();
          if (merchantData.success && merchantData.profile?.businessName) {
            setMerchant(merchantData.profile);
          }
        }
      } catch (err) {
        console.error('Failed to load receipt:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (invoiceId) fetchData();
  }, [invoiceId]);

  // Poll for status updates if pending
  useEffect(() => {
    if (!invoice || invoice.status !== 'pending') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices/${invoiceId}`);
        const data = await res.json();
        if (data.success && data.invoice.status !== invoice.status) {
          setInvoice(data.invoice);
        }
      } catch (e) {}
    }, 5000);
    
    return () => clearInterval(interval);
  }, [invoice, invoiceId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const lineItems = invoice?.lineItems 
    ? (typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems) : invoice.lineItems)
    : [];

  const getPdfUrl = () => `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices/${invoiceId}/receipt.pdf`;
  const getExplorerUrl = (txHash: string) => `https://explorer.arc.network/tx/${txHash}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f9]">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-[#004c22] mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 font-medium text-sm animate-pulse">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f9]">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">receipt_long</span>
          <h3 className="text-lg font-bold text-gray-800">Receipt Not Found</h3>
          <p className="text-sm text-gray-500 mt-2">
            This receipt does not exist or has been removed. Please check the link and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f9] py-16 px-4 flex items-center justify-center font-sans text-sm text-[#1a1c1c]">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl border border-[#bfc9bd]/25 shadow-md overflow-hidden">
          
          {/* Section 1 — Header: Merchant Identity */}
          <div className="px-8 py-8 border-b border-gray-100 flex justify-between items-center bg-zinc-50/10">
            <div className="flex items-center space-x-4">
              {merchant.logoUrl ? (
                <img 
                  src={merchant.logoUrl} 
                  alt={merchant.businessName} 
                  className="w-12 h-12 rounded-xl object-contain border border-[#bfc9bd]/20 p-1 bg-white" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl border border-dashed border-[#bfc9bd]/40 flex items-center justify-center bg-[#f0f7f2] text-[#004c22]">
                  <span className="material-symbols-outlined text-2xl">store</span>
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-zinc-850 tracking-tight">
                  {merchant.businessName || 'ArcPay Merchant'}
                </h1>
                {merchant.email && (
                  <p className="text-xs text-zinc-400 mt-0.5">{merchant.email}</p>
                )}
              </div>
            </div>
            
            <div>
              {invoice.status === 'paid' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border bg-green-50 text-green-700 border-green-200 uppercase tracking-wider space-x-1.5 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                  <span>Paid & Verified</span>
                </span>
              )}
              {invoice.status === 'pending' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-wider space-x-1.5 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b]"></span>
                  <span>Pending</span>
                </span>
              )}
              {invoice.status === 'overdue' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border bg-red-50 text-red-700 border-red-200 uppercase tracking-wider space-x-1.5 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]"></span>
                  <span>Overdue</span>
                </span>
              )}
              {invoice.status === 'cancelled' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border bg-gray-50 text-gray-500 border-gray-200 uppercase tracking-wider space-x-1.5 select-none">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-300"></span>
                  <span>Cancelled</span>
                </span>
              )}
            </div>
          </div>

          {/* Section 2 — Invoice Meta */}
          <div className="px-8 py-6 border-b border-gray-100 grid grid-cols-2 gap-y-3 text-xs bg-zinc-50/5">
            <div className="flex justify-between pr-8 border-r border-[#bfc9bd]/10">
              <span className="font-bold text-zinc-400 uppercase tracking-wider">Invoice</span>
              <span className="font-mono font-bold text-zinc-800">
                {invoice.invoiceNumber || invoice.id.substring(0, 18).toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between pl-8">
              <span className="font-bold text-zinc-400 uppercase tracking-wider">Issued</span>
              <span className="font-semibold text-zinc-800">
                {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {invoice.status !== 'paid' && invoice.dueDate && (
              <div className="flex justify-between pr-8 border-r border-[#bfc9bd]/10 pt-1">
                <span className="font-bold text-zinc-400 uppercase tracking-wider">Due</span>
                <span className="font-semibold text-zinc-800">
                  {new Date(invoice.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            {invoice.status === 'paid' && invoice.paidAt && (
              <div className="flex justify-between pr-8 border-r border-[#bfc9bd]/10 pt-1">
                <span className="font-bold text-zinc-400 uppercase tracking-wider">Settled</span>
                <span className="font-semibold text-zinc-800">
                  {new Date(invoice.paidAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} at {new Date(invoice.paidAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC',
                    timeZoneName: 'short'
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Section 3 — Billed To */}
          <div className="px-8 py-6 border-b border-gray-100">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Billed To</span>
            <div className="text-sm font-semibold text-zinc-800">{invoice.clientName}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{invoice.clientEmail}</div>
            {invoice.clientWallet && (
              <div className="text-xs text-zinc-400 font-mono mt-1 flex items-center space-x-1" title={invoice.clientWallet}>
                <span>Wallet:</span>
                <span className="cursor-help hover:text-[#004c22] underline decoration-dotted">
                  {`${invoice.clientWallet.substring(0, 6)}...${invoice.clientWallet.substring(invoice.clientWallet.length - 4)}`}
                </span>
              </div>
            )}
          </div>

          {/* Section 4 — Line Items Table */}
          <div className="px-8 py-6 border-b border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#bfc9bd]/15 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <th className="pb-2">Description</th>
                  <th className="pb-2 w-16 text-right">Qty</th>
                  <th className="pb-2 w-24 text-right">Unit Price</th>
                  <th className="pb-2 w-28 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? (
                  lineItems.map((item: any, idx: number) => {
                    const qty = item.quantity || 1;
                    const price = item.unitPrice || 0;
                    return (
                      <tr key={idx} className="border-b border-gray-50 text-xs">
                        <td className="py-3 text-zinc-800 font-medium">{item.description}</td>
                        <td className="py-3 text-zinc-500 text-right">{qty}</td>
                        <td className="py-3 text-zinc-500 text-right font-mono">${price.toFixed(2)}</td>
                        <td className="py-3 text-zinc-800 text-right font-mono font-semibold">${(qty * price).toFixed(2)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className="border-b border-gray-50 text-xs">
                    <td className="py-3 text-zinc-800 font-medium">{invoice.description}</td>
                    <td className="py-3 text-zinc-500 text-right">1</td>
                    <td className="py-3 text-zinc-500 text-right font-mono">${invoice.amount.toFixed(2)}</td>
                    <td className="py-3 text-zinc-800 text-right font-mono font-semibold">${invoice.amount.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="pt-4 text-xs font-bold text-zinc-500 text-right uppercase tracking-wider">Total</td>
                  <td className="pt-4 text-right font-mono font-bold text-[#004c22] text-base flex items-center justify-end space-x-1.5">
                    <span>${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span className="text-[10px] text-zinc-400 select-none">USDC</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5 — On-Chain Proof */}
          <div className="px-8 py-6 border-b border-gray-100 bg-zinc-50/10">
            {invoice.status === 'paid' && invoice.txHash ? (
              <div className="flex flex-col items-center text-center space-y-3 py-2">
                <div className="bg-white p-2 rounded-xl border border-[#bfc9bd]/25 shadow-sm inline-block select-none">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(getExplorerUrl(invoice.txHash))}`} 
                    alt="Arc Ledger QR Link" 
                    className="w-24 h-24"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-widest">
                    On-Chain Settlement Proof
                  </h4>
                  <a 
                    href={getExplorerUrl(invoice.txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#004c22] hover:underline flex items-center justify-center space-x-0.5"
                  >
                    <span>View on Arc Explorer</span>
                    <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </a>
                  <span className="text-[9px] font-mono text-zinc-400 select-all block max-w-sm truncate mt-1">
                    {invoice.txHash}
                  </span>
                  {invoice.blockNumber && (
                    <span className="text-[10px] text-zinc-400 block pt-0.5">
                      Block #{invoice.blockNumber} &bull; Cryptographically Verified
                    </span>
                  )}
                </div>
              </div>
            ) : invoice.status === 'pending' ? (
              <div className="py-4 text-center space-y-2">
                <div className="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs font-semibold select-none animate-pulse">
                  <span className="material-symbols-outlined text-sm">sync</span>
                  <span>Awaiting on-chain settlement</span>
                </div>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  This invoice will auto-confirm instantly when payment is detected on the Arc Network.
                </p>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-zinc-400 select-none">
                No active settlement logs found for this invoice.
              </div>
            )}
          </div>

          {/* Section 6 — Actions */}
          {invoice.status === 'paid' && (
            <div className="px-8 py-6 border-b border-gray-100 flex space-x-4 bg-zinc-50/5">
              <a
                href={getPdfUrl()}
                download
                className="flex-1 border border-[#bfc9bd]/50 hover:border-[#004c22] text-[#004c22] text-center py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-gray-50/50 flex items-center justify-center space-x-1.5"
              >
                <span className="material-symbols-outlined text-xs">download</span>
                <span>Download PDF Receipt</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Receipt link copied!');
                }}
                className="px-4 py-2.5 border border-[#bfc9bd]/50 hover:border-[#004c22] rounded-xl text-xs font-bold text-zinc-500 hover:text-[#004c22] transition-all hover:bg-gray-50/50"
              >
                <span className="material-symbols-outlined text-xs">content_copy</span>
              </button>
            </div>
          )}

          {/* Section 7 — Footer */}
          <div className="px-8 py-6 text-center space-y-1 select-none">
            <p className="text-[10px] text-zinc-400 font-medium">
              Verified receipt &bull; Powered by ArcPay
            </p>
            <p className="text-[10px] text-zinc-300 font-mono">
              arcpaye.com
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
