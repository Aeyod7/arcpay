'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, SignUpButton, Show } from '@clerk/nextjs';

export default function LandingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'sdk' | 'api' | 'webhooks'>('sdk');
  const [simEmail, setSimEmail] = useState('billing@acme.com');
  const [simAmount, setSimAmount] = useState('2,500.00');
  const [simDesc, setSimDesc] = useState('API Integration Fee Q3');
  const [simulated, setSimulated] = useState(false);
  const [simPaid, setSimPaid] = useState(false);

  const triggerSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    setSimulated(true);
    setSimPaid(false);
  };

  const handleSimulatePayment = () => {
    setSimPaid(true);
  };

  return (
    <div className="bg-[#faf9f9] text-[#1a1c1c] font-sans min-h-screen flex flex-col antialiased selection:bg-[#004c22]/15 selection:text-[#004c22]">
      {/* Grid Pattern Background Container */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(191,201,189,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(191,201,189,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Premium Sticky Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#bfc9bd]/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-10 w-10 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl font-bold">payments</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900 font-headline">ArcPay</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-semibold text-zinc-500 hover:text-[#004c22] transition-colors">Features</a>
            <a href="#developers" className="text-sm font-semibold text-zinc-500 hover:text-[#004c22] transition-colors">Developers</a>
            <a href="#pricing" className="text-sm font-semibold text-zinc-500 hover:text-[#004c22] transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <Show when="signed-in">
              <button
                onClick={() => router.push('/merchant_dashboard')}
                className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md transform hover:scale-[1.01] active:scale-[0.99] flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                <span>Merchant Console</span>
              </button>
            </Show>

            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-zinc-600 hover:text-[#004c22] text-sm font-semibold transition-colors px-3 py-2">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm transform hover:scale-[1.01] active:scale-[0.99]">
                  Get Started
                </button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative z-10">
        
        {/* Hero Section */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-[#004c22]/5 text-[#004c22] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-[#004c22]/10 animate-fade-in">
              <span className="h-2 w-2 rounded-full bg-[#166534] animate-ping" />
              <span>Native Arc Network USDC Settle Engine</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
              Stablecoin payments for <span className="bg-gradient-to-r from-[#004c22] to-[#2775CA] bg-clip-text text-transparent">internet-native</span> businesses
            </h1>
            <p className="text-lg lg:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed font-body-lg">
              Seamlessly generate, dispatch, and settle billing intents natively in USDC on the Arc Network. High-velocity billing with zero gas friction.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
              <Show when="signed-in">
                <button
                  onClick={() => router.push('/merchant_dashboard')}
                  className="w-full sm:w-auto bg-[#004c22] hover:bg-[#1f6c3a] text-white px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all shadow-lg transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <span>Go to Merchant Dashboard</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </Show>
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="w-full sm:w-auto bg-[#004c22] hover:bg-[#1f6c3a] text-white px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all shadow-lg transform hover:scale-[1.01] active:scale-[0.99]">
                    Start Building Natively
                  </button>
                </SignUpButton>
              </Show>
              <a
                href="#developers"
                className="w-full sm:w-auto bg-white text-zinc-600 border border-[#bfc9bd]/60 px-8 py-4 rounded-xl text-base font-semibold transition-all hover:bg-zinc-50/50 flex items-center justify-center space-x-2"
              >
                <span className="material-symbols-outlined text-lg">code</span>
                <span>View API Documentation</span>
              </a>
            </div>

            {/* Dashboard Mockup Display */}
            <div className="relative max-w-5xl mx-auto rounded-2xl border border-[#bfc9bd]/40 bg-white shadow-2xl overflow-hidden p-1.5 transition-transform duration-500 hover:scale-[1.005]">
              <div className="h-8 bg-zinc-50 border-b border-zinc-100 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#166534]" />
                <span className="text-xs text-zinc-400 font-mono ml-4">https://arcpaye.com/merchant_dashboard</span>
              </div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6Yv3MVD2aZGvZ-oo_BbVJ_zpIoc9Ocd7bf3f2CSMjihVD_X0hWzp8K5xc1bbXSZRY2UpsWgwgpQbR8yBPFogeF2Q7UjwGnZLCJi4gSloeBdpNAeqIKtPJmJ94sEoq7oUwOFnAQ7ACl2DzJvH8qaHFENxDgVJDh3P6RCrFwURD_gfvkhCZAg8clxvh09B8I3VERMyN8xP71q1b9vTmfZpvLdpcc3T5FWm4_40KI_wXHXRfQ42Z3f8OneCv7XbkOEEFb2VHzBpGMfI"
                alt="ArcPay Merchant Console"
                className="w-full h-auto object-cover rounded-b-xl filter brightness-[0.99] contrast-[1.01]"
              />
            </div>
          </div>
        </section>

        {/* Stats Metrics Ribbon */}
        <section className="py-12 border-y border-[#bfc9bd]/30 bg-white relative z-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#bfc9bd]/20">
              <div className="py-4">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Arc Network Gas Fee</div>
                <div className="text-4xl font-extrabold text-[#004c22] font-mono">$0.00 USDC</div>
              </div>
              <div className="py-4">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">On-Chain Finality</div>
                <div className="text-4xl font-extrabold text-[#004c22] font-mono">&lt; 2 Seconds</div>
              </div>
              <div className="py-4">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Native Settlement</div>
                <div className="text-4xl font-extrabold text-[#2775CA] flex items-center justify-center gap-2 font-mono">
                  <span className="material-symbols-outlined text-3xl font-bold">payments</span>
                  <span>USDC</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <section id="features" className="py-24 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4 font-headline">Enterprise Stablecoin Billing Infrastructure</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                Accept global stablecoin flows with the look, feel, and security of traditional institutional-grade SaaS platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 transition-all hover:border-[#bfc9bd]/50 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl font-semibold">receipt_long</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Stablecoin Invoicing</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-body-md">
                  Generate professional digital invoice sheets that collect secure MetaMask or Ledger settlements automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 transition-all hover:border-[#bfc9bd]/50 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl font-semibold">verified_user</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">On-Chain Verification</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-body-md">
                  Every settle maps directly to a transaction receipt block hash, making accounting cryptographically provable.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 transition-all hover:border-[#bfc9bd]/50 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl font-semibold">mail_outline</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Transactional Emails</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-body-md">
                  Automatically email payment links and gross receipts to clients dynamically from your verified brand domain.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 transition-all hover:border-[#bfc9bd]/50 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl font-semibold">analytics</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Analytics & telemetry</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-body-md">
                  Track real-time gross volume metrics, active payouts status, and overdue accounts directly inside the console.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 transition-all hover:border-[#bfc9bd]/50 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl font-semibold">code</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Developer REST API</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-body-md">
                  Generate invoices, set dynamic webhooks, and trigger bulk payouts programmatically with our developer keys.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 transition-all hover:border-[#bfc9bd]/50 shadow-sm hover:shadow-md">
                <div className="w-12 h-12 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl font-semibold">database</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Neon Serverless Links</h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-body-md">
                  Highly persistent serverless database synchronization ensures your ledger stays consistent across transactions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Payment Intent Simulator (WOW Element!) */}
        <section className="py-24 bg-white border-y border-[#bfc9bd]/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="h-10 w-10 bg-[#004c22]/10 text-[#004c22] rounded-xl flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">bolt</span>
              </div>
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4 font-headline">Interactive Invoice Simulator</h2>
              <p className="text-base text-zinc-500 mb-6 leading-relaxed">
                Test the ArcPay settlement flow yourself in real-time. Enter simulated billing details and generate an instant payment request page.
              </p>
              <form onSubmit={triggerSimulation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Client Email</label>
                  <input
                    type="email"
                    value={simEmail}
                    onChange={(e) => setSimEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-[#bfc9bd]/40 rounded-lg text-sm bg-zinc-50/20 text-zinc-800 focus:outline-none focus:border-[#004c22] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Amount (USDC)</label>
                    <input
                      type="text"
                      value={simAmount}
                      onChange={(e) => setSimAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-[#bfc9bd]/40 rounded-lg text-sm bg-zinc-50/20 text-zinc-800 focus:outline-none focus:border-[#004c22] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">Description</label>
                    <input
                      type="text"
                      value={simDesc}
                      onChange={(e) => setSimDesc(e.target.value)}
                      className="w-full px-4 py-3 border border-[#bfc9bd]/40 rounded-lg text-sm bg-zinc-50/20 text-zinc-800 focus:outline-none focus:border-[#004c22] transition-colors"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold tracking-wide transition-all shadow-md"
                >
                  Generate Interactive Mock Invoice
                </button>
              </form>
            </div>

            {/* Simulated Checkout Frame */}
            <div className="bg-zinc-50 border border-[#bfc9bd]/40 rounded-2xl p-6 shadow-xl h-[420px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#a6f4b5]/15 rounded-full blur-[80px] pointer-events-none" />
              
              {!simulated ? (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 relative z-10">
                  <span className="material-symbols-outlined text-5xl text-zinc-300 mb-4 animate-bounce">dock_to_left</span>
                  <h4 className="font-bold text-zinc-800 text-lg">Interactive Frame Idle</h4>
                  <p className="text-xs text-zinc-400 max-w-xs mt-2">
                    Enter details in the simulator panel and click the button to load the custom MetaMask checkout frame!
                  </p>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-between h-full relative z-10">
                  <div>
                    <div className="flex justify-between items-center pb-4 border-b border-[#bfc9bd]/20">
                      <div>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">ArcPay Checkout</span>
                        <div className="text-xs text-zinc-400 font-mono mt-0.5">INV-SIM-{Math.floor(Math.random()*89999+10000)}</div>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        simPaid ? 'bg-emerald-100 text-[#166534]' : 'bg-[#bfc9bd]/30 text-zinc-600'
                      }`}>
                        {simPaid ? 'Paid & Verified' : 'Pending Intent'}
                      </span>
                    </div>

                    <div className="bg-white border border-[#bfc9bd]/25 rounded-xl p-4 text-center my-6">
                      <div className="text-2xl font-extrabold text-zinc-800 font-mono">${simAmount}</div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5 font-bold">Settlement Asset: USDC</div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-zinc-400">Client Email:</span><span className="font-semibold text-zinc-700">{simEmail}</span></div>
                      <div className="flex justify-between"><span className="text-zinc-400">Billing Description:</span><span className="font-semibold text-zinc-700">{simDesc}</span></div>
                      {simPaid && (
                        <div className="flex justify-between"><span className="text-zinc-400">Tx Hash:</span><span className="font-mono text-[10px] text-[#004c22]">0x8a7b6c5d4e3f...a9b8c7d</span></div>
                      )}
                    </div>
                  </div>

                  {!simPaid ? (
                    <button
                      onClick={handleSimulatePayment}
                      className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold transition-all transform active:scale-[0.98] shadow-sm flex items-center justify-center space-x-2"
                    >
                      <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                      <span>Sign & Settle with MetaMask</span>
                    </button>
                  ) : (
                    <div className="bg-[#f0f7f2] border border-[#004c22]/20 text-[#004c22] rounded-xl p-4 text-center text-xs font-semibold animate-pulse flex items-center justify-center space-x-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      <span>Verified Receipt Emailed to {simEmail}!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Developer Documentation & API Code Center */}
        <section id="developers" className="py-24 bg-[#0f1b16] text-[#faf9f9] relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-[#004c22]/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="inline-flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 px-4.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-500/20">
                <span className="material-symbols-outlined text-xs">code</span>
                <span>Active Cloud Endpoint: api.arcpaye.com</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4 font-headline">Developer-First Architecture</h2>
              <p className="text-base text-zinc-400 mb-8 leading-relaxed">
                Connect your accounting, software suite, or backend services with our fully standardized developer toolkit. Get up and running in under 5 lines of code.
              </p>

              <div className="flex border-b border-zinc-700/50 mb-8">
                <button
                  onClick={() => setActiveTab('sdk')}
                  className={`pb-4 px-2 font-mono text-sm font-semibold transition-all border-b-2 ${
                    activeTab === 'sdk' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  SDK (TypeScript)
                </button>
                <button
                  onClick={() => setActiveTab('api')}
                  className={`pb-4 px-6 font-mono text-sm font-semibold transition-all border-b-2 ${
                    activeTab === 'api' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  REST API (cURL)
                </button>
                <button
                  onClick={() => setActiveTab('webhooks')}
                  className={`pb-4 px-6 font-mono text-sm font-semibold transition-all border-b-2 ${
                    activeTab === 'webhooks' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Webhooks (JSON)
                </button>
              </div>

              <ul className="space-y-3.5 text-sm text-zinc-400">
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Fully typed packages utilizing modern TypeScript compilers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Persistent webhook retries with secure SHA-256 signature verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                  <span>Natively compatible with AI Agentic Commerce APIs</span>
                </li>
              </ul>
            </div>

            {/* Code Block Container */}
            <div className="rounded-xl border border-zinc-700/50 bg-[#070b09] overflow-hidden shadow-2xl relative">
              <div className="flex items-center px-4 py-3.5 border-b border-zinc-800 bg-[#0a0e0b]">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                  <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                  <div className="w-3 h-3 rounded-full bg-[#166534]" />
                </div>
                <div className="ml-4 font-mono text-xs text-zinc-500">
                  {activeTab === 'sdk' ? 'create-invoice.ts' : activeTab === 'api' ? 'curl_invoice.sh' : 'webhook_invoice_paid.json'}
                </div>
              </div>
              <div className="p-6 overflow-x-auto text-xs font-mono leading-relaxed h-[280px]">
                {activeTab === 'sdk' && (
                  <pre className="text-zinc-300">
                    <code>
{`import { ArcPay } from '@arcpay/sdk';

// Initialize ArcPay SDK
const arcpay = new ArcPay(process.env.ARCPAY_API_KEY);

// Generate a USDC payment request intent
const invoice = await arcpay.invoices.create({
  amount: 2500.00,
  currency: 'USDC',
  clientEmail: 'billing@acme.com',
  description: 'API Integration Fee Q3'
});

console.log(\`Invoice created: \${invoice.checkoutUrl}\`);`}
                    </code>
                  </pre>
                )}
                {activeTab === 'api' && (
                  <pre className="text-zinc-300">
                    <code>
{`# Create an invoice intent via live REST API
curl -X POST https://api.arcpaye.com/api/invoices \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer arc_live_5fae860bc80a0a597a7a28e8" \\
  -d '{
    "clientName": "Acme Corp",
    "clientEmail": "billing@acme.com",
    "amount": "2500.00",
    "description": "API Integration Fee Q3"
  }'`}
                    </code>
                  </pre>
                )}
                {activeTab === 'webhooks' && (
                  <pre className="text-zinc-300">
                    <code>
{`{
  "event": "invoice.paid",
  "timestamp": "2026-05-27T01:31:06Z",
  "data": {
    "id": "ae0392e7-dda0-4220-ae5d-ccf8d9d8b586",
    "clientName": "Acme Corp",
    "clientEmail": "billing@acme.com",
    "amount": 2500.00,
    "status": "paid",
    "txHash": "0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b"
  }
}`}
                    </code>
                  </pre>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Matrix */}
        <section id="pricing" className="py-24 bg-white relative z-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4 font-headline">Transparent Tiered Pricing</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto leading-relaxed">
                Simple, predictable rates built to scale with your volume. Natively optimized for stablecoins.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {/* Developer Tier */}
              <div className="border border-[#bfc9bd]/30 rounded-2xl p-8 bg-white flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Developer</h3>
                  <div className="text-4xl font-extrabold text-[#004c22] font-mono mb-4">Free</div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">Perfect for testing, personal projects, and sandbox validation.</p>
                  <ul className="space-y-4 text-xs text-zinc-600 mb-8 border-t border-[#bfc9bd]/15 pt-6">
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check</span> <span>Up to 5 invoices/mo</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check</span> <span>Sandbox Resend email limits</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check</span> <span>Community developer support</span></li>
                  </ul>
                </div>
                <SignUpButton mode="modal">
                  <button className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 py-3 rounded-lg text-sm font-semibold transition-colors border border-zinc-200">
                    Get Started Free
                  </button>
                </SignUpButton>
              </div>

              {/* Pro Tier (Highlighted) */}
              <div className="border-2 border-[#004c22] rounded-2xl p-8 bg-[#faf9f9] relative flex flex-col justify-between shadow-lg">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#004c22] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  RECOMMENDED
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Pro Business</h3>
                  <div className="text-4xl font-extrabold text-[#004c22] font-mono mb-4">$49<span className="text-xs text-zinc-400 font-normal font-sans">/mo</span></div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">Designed for professional freelancers, startups, and active merchant operations.</p>
                  <ul className="space-y-4 text-xs text-zinc-700 mb-8 border-t border-[#bfc9bd]/25 pt-6">
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check_circle</span> <span>Unlimited invoices & payouts</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check_circle</span> <span>Verified custom sender domain</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check_circle</span> <span>Advanced SHA-256 Webhooks</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check_circle</span> <span>Priority 24/7 technical support</span></li>
                  </ul>
                </div>
                <SignUpButton mode="modal">
                  <button className="w-full bg-[#004c22] hover:bg-[#1f6c3a] text-white py-3 rounded-lg text-sm font-semibold transition-all shadow-md">
                    Upgrade to Pro
                  </button>
                </SignUpButton>
              </div>

              {/* Enterprise Tier */}
              <div className="border border-[#bfc9bd]/30 rounded-2xl p-8 bg-white flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Enterprise</h3>
                  <div className="text-4xl font-extrabold text-[#004c22] font-mono mb-4">Custom</div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-6">Tailored solutions for platforms requiring dedicated servers and custom finality.</p>
                  <ul className="space-y-4 text-xs text-zinc-600 mb-8 border-t border-[#bfc9bd]/15 pt-6">
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check</span> <span>Dedicated infrastructure & nodes</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check</span> <span>SLA guaranteed support</span></li>
                    <li className="flex items-center space-x-2"><span className="material-symbols-outlined text-[#004c22] text-sm">check</span> <span>Custom developer integrations</span></li>
                  </ul>
                </div>
                <button
                  onClick={() => window.location.href = 'mailto:sales@arcpaye.com'}
                  className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-700 py-3 rounded-lg text-sm font-semibold transition-colors border border-zinc-200"
                >
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-24 bg-gradient-to-br from-[#004c22] to-[#0f1b16] text-[#faf9f9] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 font-headline">Ready to automate your stablecoin billing?</h2>
            <p className="text-base text-zinc-300 max-w-xl mx-auto mb-10 leading-relaxed font-body-lg">
              Unlock instant global invoicing with zero gas friction. Connect and scale natively on the Arc Network.
            </p>
            <SignUpButton mode="modal">
              <button className="bg-white text-[#004c22] hover:bg-zinc-50 px-8 py-4 rounded-xl text-base font-semibold tracking-wide transition-all shadow-xl transform hover:scale-[1.02] active:scale-[0.98]">
                Get Started Natively Now
              </button>
            </SignUpButton>
          </div>
        </section>

      </main>

      {/* Premium Footer */}
      <footer className="bg-white text-zinc-500 py-12 border-t border-[#bfc9bd]/30 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-[#004c22]/10 text-[#004c22] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-lg font-bold">payments</span>
            </div>
            <span className="text-lg font-bold text-zinc-900">ArcPay</span>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            © 2026 ArcPay Inc. Natively settled in USDC. All rights reserved.
          </div>
          <div className="flex space-x-6 text-xs font-semibold">
            <a href="#" className="hover:text-[#004c22] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#004c22] transition-colors">Privacy Policy</a>
            <a href="mailto:support@arcpaye.com" className="hover:text-[#004c22] transition-colors">Developer Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
