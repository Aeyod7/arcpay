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
    <div className="min-h-screen bg-[#faf9f9] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-[#004c22] px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Arc Network</h1>
                <p className="text-[#a6f4b5] text-sm mt-1">Stablecoin Payment Receipt</p>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(invoice.status)}`}>
                {invoice.status === 'paid' ? 'PAID' : invoice.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Amount Hero */}
          <div className="px-8 py-8 bg-gradient-to-b from-[#f0f7f2] to-white border-b border-gray-100">
            <div className="text-center">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-4xl font-extrabold text-[#004c22] font-mono">
                ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm font-semibold text-gray-400 mt-1">USDC on Arc Network</p>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="px-8 py-6 grid grid-cols-2 gap-x-8 gap-y-4 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice Number</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 font-mono">
                {invoice.invoiceNumber || invoice.id.substring(0, 18).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Issued</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {new Date(invoice.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </p>
            </div>
            {invoice.paidAt && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Paid</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {new Date(invoice.paidAt).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
            )}
            {invoice.dueDate && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</p>
                <p className="text-sm font-semibold text-gray-800 mt-1">
                  {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                  })}
                </p>
              </div>
            )}
          </div>

          {/* From / To */}
          <div className="px-8 py-6 grid grid-cols-2 gap-x-8 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">From</p>
              <p className="text-sm font-semibold text-gray-800">{merchant.businessName}</p>
              {merchant.email && <p className="text-sm text-gray-500 mt-0.5">{merchant.email}</p>}
              {merchant.address && <p className="text-sm text-gray-500 mt-0.5">{merchant.address}</p>}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">To</p>
              <p className="text-sm font-semibold text-gray-800">{invoice.clientName}</p>
              <p className="text-sm text-gray-500 mt-0.5">{invoice.clientEmail}</p>
              {invoice.clientWallet && (
                <p className="text-xs font-mono text-gray-400 mt-1 break-all">Wallet: {invoice.clientWallet}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="px-8 py-6 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Line Items</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="text-right pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                  <th className="text-right pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Unit Price</th>
                  <th className="text-right pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? lineItems.map((item: any, idx: number) => {
                  const qty = item.quantity || 1;
                  const unitPrice = item.unitPrice || 0;
                  const subtotal = qty * unitPrice;
                  return (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-3 text-sm text-gray-800">{item.description || 'Item'}</td>
                      <td className="py-3 text-sm text-gray-600 text-right">{qty}</td>
                      <td className="py-3 text-sm text-gray-600 text-right font-mono">${unitPrice.toFixed(2)}</td>
                      <td className="py-3 text-sm font-semibold text-gray-800 text-right font-mono">${subtotal.toFixed(2)}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td className="py-3 text-sm text-gray-800">{invoice.description || 'USDC Settlement'}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">1</td>
                    <td className="py-3 text-sm text-gray-600 text-right font-mono">${invoice.amount.toFixed(2)}</td>
                    <td className="py-3 text-sm font-semibold text-gray-800 text-right font-mono">${invoice.amount.toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-sm font-bold text-gray-800 text-right">Total (USDC)</td>
                  <td className="pt-4 text-sm font-bold text-[#004c22] text-right font-mono">
                    ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Blockchain Proof */}
          {invoice.status === 'paid' && invoice.txHash && (
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">On-Chain Proof</p>
              <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 font-semibold">Transaction Hash</p>
                  <a 
                    href={getExplorerUrl(invoice.txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#004c22] hover:underline break-all block mt-0.5"
                  >
                    {invoice.txHash}
                    <span className="material-symbols-outlined text-xs ml-1 align-middle">open_in_new</span>
                  </a>
                </div>
                {invoice.blockNumber && (
                  <div>
                    <p className="text-xs text-gray-500 font-semibold">Block Number</p>
                    <p className="text-sm font-mono text-gray-800 mt-0.5">{invoice.blockNumber}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Memo */}
          {invoice.memo && (
            <div className="px-8 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Memo</p>
              <p className="text-sm text-gray-600">{invoice.memo}</p>
            </div>
          )}

          {/* Actions + Footer */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex space-x-3">
              <a
                href={getPdfUrl()}
                download
                className="flex-1 bg-[#004c22] hover:bg-[#1f6c3a] text-white text-center py-3 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download PDF</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Receipt URL copied!');
                }}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              This receipt was cryptographically verified on the Arc Network.
            </p>
            <p className="text-xs text-gray-400 text-center">
              ArcPay &mdash; The paper trail for the Arc Economy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
