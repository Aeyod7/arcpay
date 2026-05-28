# @arcpay/sdk

> Official ArcPay SDK — Create, manage, and verify invoices and receipts for the Arc Network stablecoin economy.

ArcPay turns every on-chain USDC transaction into a structured, branded, printable receipt. This SDK lets any Arc Network project (DEX, lending protocol, marketplace, DAO, freelancer platform) integrate ArcPay's invoice infrastructure in minutes.

## Installation

```bash
npm install @arcpay/sdk
```

## Quick Start

```ts
import { ArcPayClient } from '@arcpay/sdk';

const client = new ArcPayClient('apk_live_xxxx');

// Create an invoice
const invoice = await client.createInvoice({
  to: {
    wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f3bD00',
    email: 'client@example.com',
    name: 'Alice Adams',
  },
  items: [
    { description: 'API subscription - June 2025', quantity: 1, unitPrice: 99 },
    { description: 'Setup fee', quantity: 1, unitPrice: 50 },
  ],
  currency: 'USDC',
  dueDate: '2025-07-01',
});

console.log(invoice.receiptUrl);
// → https://arcpaye.com/receipt/inv_xxxxx
```

## API

### `ArcPayClient`

| Method | Description |
|---|---|
| `createInvoice(options)` | Create a new invoice |
| `getInvoice(id)` | Get invoice details |
| `listInvoices(params?)` | List invoices with optional status/pagination |
| `updateInvoice(id, data)` | Update an unpaid invoice |
| `cancelInvoice(id)` | Cancel an unpaid invoice |
| `getPdfUrl(id)` | Get PDF receipt download URL |
| `createBatch(options)` | Create multiple invoices at once |
| `createWebhook(url, events)` | Register a webhook endpoint |
| `listWebhooks()` | List registered webhooks |
| `deleteWebhook(id)` | Delete a webhook |

### Utilities

| Function | Description |
|---|---|
| `verifyWebhookSignature(payload, signature, secret)` | Verify HMAC-SHA256 webhook signature |
| `verifyOnChainSettlement(txHash, recipient?, rpcUrl?)` | Verify transaction on Arc Network |

### Types

```ts
CreateInvoiceOptions {
  to:    { wallet: string; email: string; name?: string }
  items: { description: string; quantity?: number; unitPrice: number }[]
  currency?: string   // default: "USDC"
  dueDate?: string    // ISO date
  memo?: string
  metadata?: Record<string, unknown>
}

Invoice {
  id: string
  invoiceNumber?: string     // e.g. "INV-2025-0042"
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  receiptUrl?: string
  checkoutUrl?: string
  // ... full invoice data
}
```

## Webhook Verification

ArcPay signs webhook payloads with HMAC-SHA256. Verify them in your webhook handler:

```ts
import { verifyWebhookSignature, ARCPAY_SIGNATURE_HEADER } from '@arcpay/sdk';

// In your Express / Next.js API route
const isValid = await verifyWebhookSignature(
  JSON.stringify(req.body),
  req.headers[ARCPAY_SIGNATURE_HEADER],  // "x-arcpay-signature"
  'whsec_xxxxx',                         // your webhook secret
);

if (!isValid) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

## Error Handling

All methods throw descriptive `Error` messages on failure:

```ts
try {
  await client.createInvoice({ ... });
} catch (err) {
  console.error(err.message);
  // → "ArcPay API error: 401 Unauthorized"
  // → "ArcPay API error: 422 Invoice requires at least one line item"
}
```

## Requirements

- Node.js 18+ or modern browser
- An ArcPay API key (`apk_live_xxxx`)

## License

MIT — ArcPay
