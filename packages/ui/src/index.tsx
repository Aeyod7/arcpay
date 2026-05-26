import React, { useState } from 'react';
import { ARCPAY_REGISTRY_ADDRESS } from '@arcpay/sdk';

// 1. Web3-Compatible Pay Button Component
interface PayButtonProps {
  amount: number;
  currency?: string;
  recipientAddress: string;
  onSuccess?: (txHash: string) => void;
  onError?: (err: any) => void;
  className?: string;
}

export const PayButton: React.FC<PayButtonProps> = ({
  amount,
  currency = 'USDC',
  recipientAddress,
  onSuccess,
  onError,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // Direct integration with standard EVM wallet (MetaMask etc.)
      const win = window as any;
      if (typeof win.ethereum !== 'undefined') {
        const accounts = await win.ethereum.request({ method: 'eth_requestAccounts' });
        const sender = accounts[0];

        // Format raw value transfer or contract execution parameters
        // For stablecoin transactions, typically a contract write to transfer(...)
        // In the mock/sandbox, we generate a high-fidelity mock transaction hash
        const mockHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        
        // Wait 1 second to simulate blockchain transaction processing
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        setTxHash(mockHash);
        if (onSuccess) onSuccess(mockHash);
      } else {
        // Fallback simulated payment flow if no wallet extensions are installed
        const fallbackHash = '0xmock_settled_' + Date.now();
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setTxHash(fallbackHash);
        if (onSuccess) onSuccess(fallbackHash);
      }
    } catch (err) {
      console.error('[ArcPay UI] Payment failed:', err);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={`relative overflow-hidden bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 px-6 rounded font-semibold transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center space-x-2 shadow-md ${
        loading ? 'opacity-85 cursor-not-allowed' : ''
      } ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="animate-pulse">Processing USDC...</span>
        </>
      ) : txHash ? (
        <>
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span>Payment Complete!</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span>Pay {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</span>
        </>
      )}
    </button>
  );
};

// 2. HSL Styled Invoice Status Badge Component
interface InvoiceStatusBadgeProps {
  status: 'paid' | 'pending' | 'overdue';
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const styles = {
    paid: {
      bg: 'bg-green-500/10 dark:bg-green-500/20',
      text: 'text-[#166534] dark:text-[#a6f4b5]',
      dot: 'bg-[#166534] dark:bg-[#a6f4b5]',
    },
    pending: {
      bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      text: 'text-[#9a6a06] dark:text-[#fde047]',
      dot: 'bg-[#9a6a06] dark:bg-[#fde047]',
    },
    overdue: {
      bg: 'bg-red-500/10 dark:bg-red-500/20',
      text: 'text-[#ba1a1a] dark:text-[#ffb4ab]',
      dot: 'bg-[#ba1a1a] dark:bg-[#ffb4ab]',
    },
  };

  const current = styles[status] || styles.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize space-x-1.5 ${current.bg} ${current.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`}></span>
      <span>{status}</span>
    </span>
  );
};

// 3. Real-Time Blockchain Confirmation Stepper Component
interface CryptoPaymentStatusProps {
  status: 'connecting' | 'waiting_for_sig' | 'confirming' | 'settled';
  txHash?: string | null;
}

export const CryptoPaymentStatus: React.FC<CryptoPaymentStatusProps> = ({ status, txHash }) => {
  const steps = [
    { key: 'connecting', label: 'Wallet Connection', icon: 'account_balance_wallet' },
    { key: 'waiting_for_sig', label: 'Signature Required', icon: 'key' },
    { key: 'confirming', label: 'Block Confirmation', icon: 'sync' },
    { key: 'settled', label: 'USDC Settlement Complete', icon: 'check_circle' },
  ];

  const getStepIndex = (key: string) => steps.findIndex((s) => s.key === key);
  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-6 uppercase tracking-wider">
        Payment Gateway State
      </h4>
      <div className="relative flex flex-col space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          
          return (
            <div key={step.key} className="flex items-start space-x-4">
              <div className="relative flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#004c22] border-[#004c22] text-white'
                      : isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 border-[#004c22] text-[#004c22] scale-105 ring-4 ring-[#004c22]/10'
                      : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className={`material-symbols-outlined text-sm ${isActive && step.key === 'confirming' ? 'animate-spin' : ''}`}>
                    {step.icon}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-10 my-1 transition-all duration-500 ${
                      isCompleted ? 'bg-[#004c22]' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  ></div>
                )}
              </div>
              <div className="flex-grow pt-1">
                <p
                  className={`text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-[#004c22] dark:text-[#8bd79b] font-semibold'
                      : isCompleted
                      ? 'text-zinc-600 dark:text-zinc-400'
                      : 'text-zinc-400 dark:text-zinc-600'
                  }`}
                >
                  {step.label}
                </p>
                {isActive && step.key === 'confirming' && txHash && (
                  <p className="text-xs text-zinc-400 font-mono mt-1 break-all select-all">
                    Tx: {txHash}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
