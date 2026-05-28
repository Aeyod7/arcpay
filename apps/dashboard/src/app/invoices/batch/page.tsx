'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface CSVRow {
  recipient_email: string;
  recipient_wallet: string;
  description: string;
  amount_usdc: string;
  [key: string]: string;
}

export default function BatchInvoicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [parsedRows, setParsedRows] = useState<CSVRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{
    batchId?: string;
    totalCount?: number;
    totalAmount?: number;
    invoiceIds?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simple CSV parser
  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        const row: CSVRow = {} as CSVRow;
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });
        // Normalize field names
        row.recipient_email = row.recipient_email || row.email || '';
        row.recipient_wallet = row.recipient_wallet || row.wallet || '';
        row.description = row.description || row.desc || '';
        row.amount_usdc = row.amount_usdc || row.amount || '';
        rows.push(row);
      }
    }
    return rows;
  };

  const handleFile = (file: File) => {
    setError(null);
    setResult(null);
    
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      
      if (rows.length === 0) {
        setError('No valid rows found. Check that your CSV has headers: recipient_email, recipient_wallet, description, amount_usdc');
        return;
      }

      // Validate
      const invalidRows = rows.filter(r => !r.recipient_email || !r.amount_usdc || isNaN(parseFloat(r.amount_usdc)));
      if (invalidRows.length > 0) {
        setError(`${invalidRows.length} row(s) have missing or invalid data. Each row needs recipient_email and a valid amount_usdc.`);
        return;
      }

      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleCreateBatch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
      
      const invoices = parsedRows.map(row => ({
        clientName: row.recipient_email.split('@')[0],
        clientEmail: row.recipient_email,
        clientWallet: row.recipient_wallet || undefined,
        description: row.description || 'Batch Invoice',
        amount: parseFloat(row.amount_usdc),
        lineItems: [{
          description: row.description || 'Batch Item',
          quantity: 1,
          unitPrice: parseFloat(row.amount_usdc)
        }]
      }));

      const response = await fetch(`${apiUrl}/api/invoices/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoices })
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          batchId: data.batch.id,
          totalCount: data.batch.totalCount,
          totalAmount: data.batch.totalAmount,
          invoiceIds: data.invoices.map((inv: any) => inv.id)
        });
      } else {
        setError(data.error || 'Failed to create batch');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create batch invoices');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = parsedRows.reduce((sum, row) => sum + (parseFloat(row.amount_usdc) || 0), 0);

  return (
    <div className="min-h-screen bg-[#faf9f9] text-[#1a1c1c] font-sans flex">
      {/* Side Navigation */}
      <nav className="w-64 bg-white border-r border-[#bfc9bd]/30 h-screen fixed left-0 top-0 py-8 px-4 flex flex-col justify-between z-40">
        <div>
          <div className="mb-10 px-4">
            <h1 className="text-2xl font-bold tracking-tight text-[#004c22]">Arc Network</h1>
            <p className="text-xs font-semibold text-zinc-400 mt-1 uppercase tracking-wider">Merchant Console</p>
          </div>
          <ul className="space-y-1.5">
            <li>
              <button onClick={() => router.push('/merchant_dashboard')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3">
                <span className="material-symbols-outlined text-xl">dashboard</span><span>Dashboard</span>
              </button>
            </li>
            <li>
              <button onClick={() => router.push('/invoices')} className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3">
                <span className="material-symbols-outlined text-xl">receipt_long</span><span>Invoices</span>
              </button>
            </li>
            <li>
              <button onClick={() => router.push('/invoices/batch')} className="w-full flex items-center px-4 py-3 rounded-lg text-[#004c22] font-semibold bg-[#bfc9bd]/25 transition-all text-sm space-x-3">
                <span className="material-symbols-outlined text-xl">batch_prediction</span><span>Batch</span>
              </button>
            </li>
            <li>
              <button onClick={() => router.push('/payouts')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3">
                <span className="material-symbols-outlined text-xl">account_balance_wallet</span><span>Payouts</span>
              </button>
            </li>
            <li>
              <button onClick={() => router.push('/settings')} className="w-full flex items-center px-4 py-3 rounded-lg text-zinc-500 hover:text-[#004c22] hover:bg-[#bfc9bd]/10 transition-all text-sm space-x-3">
                <span className="material-symbols-outlined text-xl">settings</span><span>Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow pl-64 flex flex-col">
        <header className="h-20 bg-white border-b border-[#bfc9bd]/20 sticky top-0 px-8 flex justify-between items-center z-30">
          <div>
            <h2 className="text-xl font-bold text-zinc-850">Batch Invoice Upload</h2>
          </div>
        </header>

        <main className="p-8 max-w-4xl">
          {result ? (
            /* Success View */
            <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 shadow-sm text-center">
              <span className="material-symbols-outlined text-5xl text-green-600 mb-4">check_circle</span>
              <h3 className="text-xl font-bold text-zinc-800">Batch Created Successfully</h3>
              <p className="text-sm text-zinc-500 mt-2">
                Created {result.totalCount} invoices totaling ${result.totalAmount?.toLocaleString()} USDC
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6 inline-block">
                <p className="text-xs font-mono text-green-800">Batch ID: {result.batchId}</p>
              </div>
              <div className="flex justify-center space-x-3 mt-8">
                <button
                  onClick={() => router.push('/invoices')}
                  className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  View All Invoices
                </button>
                <button
                  onClick={() => { setResult(null); setParsedRows([]); }}
                  className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Create Another Batch
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Upload Section */}
              <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl p-8 shadow-sm mb-6">
                <h3 className="font-bold text-zinc-800 text-base mb-2">Upload CSV File</h3>
                <p className="text-sm text-zinc-500 mb-6">
                  Upload a CSV with columns: <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono">recipient_email</code>,{' '}
                  <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono">recipient_wallet</code>,{' '}
                  <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono">description</code>,{' '}
                  <code className="bg-zinc-100 px-2 py-0.5 rounded text-xs font-mono">amount_usdc</code>
                </p>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    dragOver ? 'border-[#004c22] bg-[#004c22]/5' : 'border-gray-200 hover:border-[#004c22]/40 hover:bg-gray-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <span className="material-symbols-outlined text-4xl text-zinc-300 mb-3">upload_file</span>
                  <p className="text-sm font-semibold text-zinc-600">Drag & drop your CSV here, or click to browse</p>
                  <p className="text-xs text-zinc-400 mt-1">Supports .csv files</p>
                </div>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              {parsedRows.length > 0 && (
                <div className="bg-white border border-[#bfc9bd]/25 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#bfc9bd]/15 flex justify-between items-center bg-zinc-50/50">
                    <div>
                      <h3 className="font-bold text-zinc-800 text-base">
                        Preview ({parsedRows.length} invoices)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Total: <span className="font-mono font-semibold">${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDC</span>
                      </p>
                    </div>
                    <button
                      onClick={handleCreateBatch}
                      disabled={loading}
                      className="bg-[#004c22] hover:bg-[#1f6c3a] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">send</span>
                          <span>Create & Dispatch {parsedRows.length} Invoices</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 border-b border-[#bfc9bd]/15">
                          <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Recipient</th>
                          <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Wallet</th>
                          <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</th>
                          <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Amount (USDC)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedRows.map((row, idx) => (
                          <tr key={idx} className="border-b border-[#bfc9bd]/10 hover:bg-[#faf9f9]/50 transition-colors">
                            <td className="p-4">
                              <div className="font-semibold text-zinc-800 text-sm">{row.recipient_email}</div>
                            </td>
                            <td className="p-4 text-sm font-mono text-zinc-500 max-w-[200px] truncate">
                              {row.recipient_wallet || '-'}
                            </td>
                            <td className="p-4 text-sm text-zinc-500">{row.description || '-'}</td>
                            <td className="p-4 text-sm font-mono font-semibold text-zinc-800 text-right">
                              ${parseFloat(row.amount_usdc).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-zinc-50">
                          <td colSpan={3} className="p-4 text-sm font-bold text-zinc-800 text-right">Total</td>
                          <td className="p-4 text-sm font-mono font-bold text-[#004c22] text-right">
                            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
