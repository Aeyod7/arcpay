import 'dotenv/config';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:62650';
const POLL_INTERVAL = 60000; // Check every 60 seconds

console.log('=================================================');
console.log('⏰ ArcPay Recurring Invoice Scheduler Starting...');
console.log(`🌐 Target API Backend: ${API_URL}`);
console.log(`⏱️  Poll Interval: ${POLL_INTERVAL / 1000}s`);
console.log('=================================================');

async function processDueRecurringInvoices() {
  try {
    console.log('[Scheduler] Checking for due recurring invoices...');
    
    const res = await fetch(`${API_URL}/api/invoices/recurring/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log(`[Scheduler] Generated ${data.generated} invoice(s) from ${data.totalDue} due schedule(s).`);
    } else {
      console.error('[Scheduler] Failed to generate:', data.error);
    }
  } catch (err) {
    console.error('[Scheduler] Processing error:', err.message);
  }
}

// Run immediately on start, then poll
processDueRecurringInvoices();
setInterval(processDueRecurringInvoices, POLL_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Scheduler] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Scheduler] Shutting down gracefully...');
  process.exit(0);
});
