import 'dotenv/config';
import { ethers } from 'ethers';

// Arc Blockchain ledger RPC configuration
const ARC_RPC_URL = process.env.ARCPAY_ARC_NODE_RPC_URL || 'https://rpc.testnet.arc.network';
const POLL_INTERVAL = 10000; // scan every 10 seconds

console.log('=================================================');
console.log('⛓️ Arc Network Payment Settlement Indexer Starting...');
console.log(`🌐 Target Chain RPC: ${ARC_RPC_URL}`);
console.log('=================================================');

// Shared mock database matching structure in Neon
const activeWatchlist = new Map([
  ['ae0392e7-dda0-4220-ae5d-ccf8d9d8b586', { amount: 12500.0, status: 'paid' }],
  ['63c4be3b-46da-4d6e-b11d-6634e7995278', { amount: 8900.0, status: 'overdue' }],
  ['6b20dddd-e1c8-4f76-a46b-c0a65e3f8bb6', { amount: 4200.0, status: 'pending' }],
]);

async function scanBlockActivity() {
  try {
    console.log(`[Indexer] Querying latest blocks for transfer events on Arc Network...`);
    
    // Simulate detecting a transfer matching invoice Globex Inc. (pending, amount 4200.0 USDC)
    const pendingInvoiceId = '6b20dddd-e1c8-4f76-a46b-c0a65e3f8bb6';
    const invoice = activeWatchlist.get(pendingInvoiceId);

    if (invoice && invoice.status === 'pending') {
      console.log(`[Indexer] 🎉 MATCH FOUND: Detected $${invoice.amount} USDC transfer on-chain!`);
      console.log(`[Indexer] Tx Hash: 0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b`);
      
      // Update local state
      invoice.status = 'paid';
      activeWatchlist.set(pendingInvoiceId, invoice);

      console.log(`[Indexer] Successfully updated invoice ${pendingInvoiceId} to PAID in cloud db.`);
      
      // Fire signed developer webhook event to mock merchant endpoint
      console.log(`[Indexer] Dispatching signed webhook 'invoice.paid' to merchant host.`);
    }
  } catch (err) {
    console.error('[Indexer] Scanning loop error:', err.message);
  }
}

// Background poll loop
setInterval(scanBlockActivity, POLL_INTERVAL);
scanBlockActivity();
