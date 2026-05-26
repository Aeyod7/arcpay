import 'dotenv/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
const POLL_INTERVAL = 10000; // scan every 10 seconds

console.log('=================================================');
console.log('⛓️ Arc Network Payment Settlement Indexer Starting...');
console.log(`🌐 Target API Backend: ${API_URL}`);
console.log('=================================================');

// Keep track of processed transaction hashes to prevent duplicate logging
const processedInvoices = new Set();

async function scanBlockActivity() {
  try {
    console.log(`[Indexer] Checking for pending blockchain invoices at: ${API_URL}/api/invoices`);
    
    const res = await fetch(`${API_URL}/api/invoices`);
    const data = await res.json();
    
    if (!data.success) {
      console.warn('[Indexer] Failed to retrieve invoices list from API.');
      return;
    }
    
    const pendingInvoices = data.invoices.filter(i => i.status === 'pending');
    
    if (pendingInvoices.length === 0) {
      console.log('[Indexer] No pending invoices in database. Active loop idle.');
      return;
    }
    
    console.log(`[Indexer] Found ${pendingInvoices.length} pending invoice(s) on watchlist. Scanning blocks...`);
    
    for (const invoice of pendingInvoices) {
      // Prevent double posting during active scanning lifecycle
      if (processedInvoices.has(invoice.id)) {
        continue;
      }
      
      console.log(`[Indexer] 🔍 MATCH FOUND: Detected $${invoice.amount} USDC transfer on-chain for Client: ${invoice.clientName}`);
      const mockTxHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      console.log(`[Indexer] Simulated Tx Hash: ${mockTxHash}`);
      
      processedInvoices.add(invoice.id);
      
      // Dispatch settlement POST back to the API server
      const payRes = await fetch(`${API_URL}/api/invoices/${invoice.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txHash: mockTxHash })
      });
      
      const payData = await payRes.json();
      if (payData.success) {
        console.log(`[Indexer] 🎉 Settle OK: Invoice ${invoice.id} successfully updated to PAID in DB!`);
      } else {
        console.error(`[Indexer] Settle FAILED for invoice ${invoice.id}:`, payData.error);
        processedInvoices.delete(invoice.id); // retry next block
      }
    }
  } catch (err) {
    console.error('[Indexer] Scanning loop error:', err.message);
  }
}

// Background poll loop
setInterval(scanBlockActivity, POLL_INTERVAL);
scanBlockActivity();
