'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate interactive loading
    await new Promise((resolve) => setTimeout(resolve, 800));
    router.push('/merchant_dashboard');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#faf9f9] via-white to-[#a6f4b5]/20 p-6 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#004c22]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2775CA]/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md bg-white border border-[#bfc9bd]/40 rounded-2xl p-8 shadow-xl relative z-10 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-[#004c22]/10 text-[#004c22] mb-4">
            <span className="material-symbols-outlined text-3xl font-bold">payments</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 font-headline">ArcPay</h1>
          <p className="text-sm text-zinc-500 mt-2 font-body-md">
            Stablecoin Payments & Settlement Operating System
          </p>
        </div>

        {/* Mock Auth Form simulating Clerk flow */}
        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Merchant Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                mail
              </span>
              <input
                required
                type="email"
                defaultValue="finance@arcpay.io"
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all font-sans"
                placeholder="you@company.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                lock
              </span>
              <input
                required
                type="password"
                defaultValue="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-lg text-sm bg-zinc-50/50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#004c22] focus:ring-1 focus:ring-[#004c22]/10 transition-all font-sans"
                placeholder="Enter password"
              />
            </div>
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
                <span>Authenticating with Clerk...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Sign In to Console</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400">
          <button type="button" className="hover:text-[#004c22] transition-colors">
            Forgot Password?
          </button>
          <button type="button" className="hover:text-[#004c22] transition-colors font-medium">
            Create Merchant Account
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-zinc-400 max-w-xs leading-relaxed relative z-10">
        By continuing, you agree to ArcPay's terms of service and secure Web3 policy. Gas settlements are natively resolved in USDC.
      </div>
    </main>
  );
}
