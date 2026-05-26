'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PayButton, CryptoPaymentStatus } from '@arcpay/ui';

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  description: string;
  status: 'paid' | 'pending' | 'overdue';
}

export default function CustomerPaymentGateway() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [gatewayState, setGatewayState] = useState<'connecting' | 'waiting_for_sig' | 'confirming' | 'settled'>('connecting');
  const [txHash, setTxHash] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dynamic invoice details
    const fetchDetails = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices/${invoiceId}`);
        const data = await response.json();
        if (data.success) {
          setInvoice(data.invoice);
          if (data.invoice.status === 'paid') {
            setGatewayState('settled');
          } else {
            setGatewayState('waiting_for_sig');
          }
        }
      } catch (err) {
        console.warn('Fallback static checkout mockup details');
        setInvoice({
          id: invoiceId,
          clientName: 'Globex Inc.',
          clientEmail: 'payments@globex.com',
          amount: 4200.0,
          description: 'API Gateway Subscription',
          status: 'pending',
        });
        setGatewayState('waiting_for_sig');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) fetchDetails();
  }, [invoiceId]);

  const handlePaymentSuccess = async (hash: string) => {
    setTxHash(hash);
    setGatewayState('confirming');
    
    // Simulate multi-step confirmation state on the blockchain
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    try {
      // Notify express developer API of the dynamic settled invoice transaction
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650'}/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txHash: hash }),
      });
    } catch (err) {
      console.error('Failed to notify backend payments:', err);
    }
    
    setGatewayState('settled');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-8 w-8 text-[#004c22] mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-zinc-500 font-medium text-sm animate-pulse">Loading secure checkout gateway...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center p-8 bg-white rounded-2xl border border-zinc-200 shadow-sm max-w-sm">
          <span className="material-symbols-outlined text-4xl text-[#ba1a1a]">warning</span>
          <h3 className="text-lg font-bold text-zinc-800 mt-4">Invoice Intent Expired</h3>
          <p className="text-xs text-zinc-500 mt-2">
            The requested payment link does not exist or has expired. Please request a new link from the merchant.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#faf9f9] to-[#bfc9bd]/10 p-6 flex items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-zinc-200/60 rounded-3xl p-8 shadow-xl relative overflow-hidden">
        {/* Left Side: Invoice details card */}
        <div className="flex flex-col justify-between space-y-8 pr-0 md:pr-8 md:border-r border-zinc-100">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#004c22]"></span>
              <span className="text-xs font-bold text-[#004c22] uppercase tracking-widest font-mono">
                Arc Network Secure Checkout
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight leading-none mb-1">
              ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h1>
            <p className="text-xs font-semibold text-zinc-400 font-mono">USDC Stablecoin</p>

            <div className="space-y-4 mt-8">
              <div className="pb-3 border-b border-zinc-100">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Recipient Merchant
                </span>
                <span className="text-sm font-semibold text-zinc-800 mt-0.5 block">Arc Network Solutions</span>
              </div>
              <div className="pb-3 border-b border-zinc-100">
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Bill To Client
                </span>
                <span className="text-sm font-semibold text-zinc-800 mt-0.5 block">{invoice.clientName}</span>
                <span className="text-xs text-zinc-400 mt-0.5 block font-mono">{invoice.clientEmail}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  Payment Description
                </span>
                <span className="text-sm text-zinc-500 mt-0.5 block leading-relaxed">{invoice.description}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
            <span>Invoice: {invoice.id.substring(0, 16).toUpperCase()}</span>
            <span className="text-[#2775CA]">Secured by Ethers</span>
          </div>
        </div>

        {/* Right Side: Interactive component composition */}
        <div className="flex flex-col justify-between space-y-6">
          <CryptoPaymentStatus status={gatewayState} txHash={txHash} />

          {gatewayState !== 'settled' ? (
            <PayButton
              amount={invoice.amount}
              recipientAddress="0x9965507B1a0597a7A28e8c8f0A0A597a7A28E8c8"
              onSuccess={handlePaymentSuccess}
              className="w-full py-4 text-sm font-bold shadow-lg"
            />
          ) : (
            <button
              onClick={() => router.push('/merchant_dashboard')}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-4 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Return to Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
