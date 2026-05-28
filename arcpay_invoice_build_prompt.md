# ArcPay Invoice & Receipt Infrastructure — Full Build Specification

> **For:** Codex / Gemini Antigravity  
> **Project:** ArcPay (`arcpaye.com`) — extending the existing stablecoin payments OS  
> **Objective:** Build the Invoice & Receipt Infrastructure Layer for the Arc Network ecosystem  
> **Stack:** Next.js (frontend), Express + Prisma + Neon PostgreSQL (API), Arc blockchain indexer

---

## 🧭 Context & Background

ArcPay is a live, production gasless stablecoin payments and settlement system built on the **Arc Network** (Circle's stablecoin-native L1 blockchain). The existing system handles:

- Merchant invoice creation
- USDC on-chain payment settlement
- On-chain indexer that watches and auto-confirms payments
- Transactional emails via Resend (`billing@arcpaye.com`)
- Clerk authentication under custom domain (`clerk.arcpaye.com`)
- Full monorepo: `apps/dashboard` (Next.js), `apps/api` (Express), `services/indexer`

**The problem being solved:** On-chain today, a "receipt" is just a transaction hash + wallet address + amount. There is no structured invoice — no line items, no business name, no PDF, nothing an accountant or compliance team can use. Arc is targeting institutional finance and regulated commerce. ArcPay fills this gap by becoming the **invoice and receipt infrastructure layer** for the entire Arc ecosystem.

**The position:** "You handle the transaction. We handle the paper trail."

---

## 🏗️ What to Build — Full Specification

---

### PHASE 1 — Core Receipt & Invoice Upgrade

#### 1.1 — PDF Receipt Generation

Every paid invoice must generate a downloadable, print-ready PDF receipt.

**Requirements:**
- Use `@react-pdf/renderer` or `pdfkit` (server-side) to generate the PDF
- PDF must include:
  - ArcPay logo + merchant business name and logo (if set)
  - Invoice number (e.g. `INV-2025-0042`)
  - Invoice date + date paid
  - Sender details: merchant name, email, wallet address
  - Recipient details: client name, email, wallet address
  - Line items table: description | quantity | unit price | subtotal
  - Total amount in USDC
  - Arc transaction hash (clickable reference)
  - Block number + timestamp of settlement
  - Status badge: `PAID`
  - Footer: "This receipt was cryptographically verified on the Arc Network."
- PDF generated server-side in `apps/api` at route `GET /api/invoices/:id/receipt.pdf`
- PDF stored temporarily or generated on-demand (no permanent storage required for MVP)
- Response: `Content-Type: application/pdf` with `Content-Disposition: attachment`

#### 1.2 — Public Shareable Receipt Page

Each invoice gets a public, read-only receipt URL.

**Route:** `GET https://arcpaye.com/receipt/[invoiceId]`

**Page requirements:**
- No authentication required — fully public
- Displays all invoice fields (same data as PDF)
- Shows on-chain proof: tx hash linking to Arc block explorer
- "Download PDF" button triggering the PDF endpoint
- Clean, minimal design — suitable for forwarding to a client or accountant
- OG meta tags for link previews (invoice amount, merchant name, status)
- If invoice is still `PENDING`, show status and polling to auto-update when paid

#### 1.3 — Business Profile Setup

Merchants can configure their business identity, which appears on all invoices.

**New DB model `MerchantProfile`:**
```prisma
model MerchantProfile {
  id           String  @id @default(cuid())
  userId       String  @unique
  businessName String
  logoUrl      String?
  email        String?
  address      String?
  taxId        String?
  website      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**API routes:**
- `GET /api/merchant/profile` — fetch current merchant's profile
- `PUT /api/merchant/profile` — create or update profile

**Frontend (`apps/dashboard/src/app/settings/`):**
- Settings page with a business profile form
- Logo upload (store URL, use Vercel Blob or Cloudinary)
- All fields pre-fill on invoice and PDF generation

---

### PHASE 2 — Batch Invoicing

#### 2.1 — CSV Batch Invoice Upload

Allow merchants to upload a CSV and generate + dispatch multiple invoices at once.

**CSV Format:**
```
recipient_email,recipient_wallet,description,amount_usdc
client@example.com,0xABC123,Consulting services Q1,500
vendor@example.com,0xDEF456,Software license,120
```

**Implementation:**
- Frontend: drag-and-drop CSV upload component at `apps/dashboard/src/app/invoices/batch/page.tsx`
- Parse CSV client-side using `papaparse`
- Preview table showing parsed rows before submission
- Validation: required fields, valid wallet addresses, positive amounts
- On confirm: POST to `POST /api/invoices/batch` with array of invoice objects
- API creates all invoices in a single DB transaction
- Sends individual invoice emails to each recipient via Resend
- Returns batch summary: total invoices created, total USDC amount

**Batch record tracking:**
```prisma
model InvoiceBatch {
  id         String    @id @default(cuid())
  merchantId String
  createdAt  DateTime  @default(now())
  invoices   Invoice[]
  totalCount Int
  totalAmount Decimal
}
```

#### 2.2 — Batch Payment Dispatch

Merchants can pay all pending invoices to a set of wallets in one on-chain transaction using Arc's batch transfer capabilities.

**Implementation:**
- UI: "Pay All Selected" button on invoice list with checkboxes
- Client constructs batch transaction payload
- Integrates with MetaMask or connected wallet to sign a multi-send USDC transaction
- Indexer recognizes batch tx and matches amounts to individual invoices
- Each matched invoice gets marked `PAID` and receipt dispatched

---

### PHASE 3 — Ecosystem Integration API

#### 3.1 — Public REST API with API Key Auth

Any Arc ecosystem project (DEX, lending protocol, marketplace, DAO) can integrate ArcPay to generate receipts for their users.

**API Key system:**
```prisma
model ApiKey {
  id         String   @id @default(cuid())
  merchantId String
  key        String   @unique  // hashed in DB, shown once on creation
  label      String
  createdAt  DateTime @default(now())
  lastUsedAt DateTime?
  active     Boolean  @default(true)
}
```

**Auth middleware:** `x-arcpay-api-key` header on all `/api/v1/` routes

**Core public endpoints:**

```
POST   /api/v1/invoices            — Create invoice
GET    /api/v1/invoices/:id        — Get invoice details + status
GET    /api/v1/invoices/:id/pdf    — Download PDF receipt
POST   /api/v1/invoices/batch      — Create multiple invoices
GET    /api/v1/invoices            — List invoices (paginated, filterable)
PUT    /api/v1/invoices/:id        — Update invoice (before payment)
DELETE /api/v1/invoices/:id        — Cancel unpaid invoice
```

**Invoice create payload:**
```json
{
  "to": {
    "wallet": "0xClientWallet",
    "email": "client@example.com",
    "name": "Client Name"
  },
  "items": [
    { "description": "API subscription - May 2025", "quantity": 1, "unitPrice": 50 }
  ],
  "currency": "USDC",
  "dueDate": "2025-06-01",
  "memo": "Optional note",
  "metadata": {}
}
```

**Response includes:** `invoiceId`, `receiptUrl`, `checkoutUrl`, `status`

#### 3.2 — Webhook System

Ecosystem projects subscribe to invoice events.

```prisma
model Webhook {
  id         String   @id @default(cuid())
  merchantId String
  url        String
  events     String[] // ["invoice.paid", "invoice.created", "invoice.overdue"]
  secret     String   // for HMAC signature verification
  active     Boolean  @default(true)
}
```

**Events dispatched:**
- `invoice.created`
- `invoice.paid`
- `invoice.overdue`
- `invoice.cancelled`
- `batch.completed`

**Payload example (`invoice.paid`):**
```json
{
  "event": "invoice.paid",
  "invoiceId": "inv_xxxxx",
  "txHash": "0xabc...",
  "blockNumber": 4829103,
  "amount": "500",
  "currency": "USDC",
  "paidAt": "2025-05-27T14:22:00Z",
  "receiptUrl": "https://arcpaye.com/receipt/inv_xxxxx"
}
```

Webhook delivery: retry up to 3 times with exponential backoff on non-2xx responses.

**Frontend:** Webhook management UI at `apps/dashboard/src/app/settings/webhooks/`

#### 3.3 — SDK Package

Publish `@arcpay/sdk` to npm.

**File:** `packages/sdk/index.ts`

```ts
import { ArcPay } from "@arcpay/sdk";

const client = new ArcPay({ apiKey: "apk_live_xxxx" });

// Create invoice
const invoice = await client.invoices.create({
  to: { wallet: "0xClientWallet", email: "client@example.com" },
  items: [{ description: "Service fee", quantity: 1, unitPrice: 100 }],
  currency: "USDC"
});

// Get receipt URL
console.log(invoice.receiptUrl);

// Batch create
const batch = await client.invoices.createBatch([...]);
```

Add `packages/sdk/` to the monorepo workspaces.

---

### PHASE 4 — Recurring Invoices

#### 4.1 — Recurring Invoice Scheduler

```prisma
model RecurringInvoice {
  id          String   @id @default(cuid())
  merchantId  String
  templateData Json    // same structure as invoice items/recipient
  frequency   String  // "weekly" | "monthly" | "quarterly"
  nextRunAt   DateTime
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

- Cron job in `services/indexer` or a separate `services/scheduler` module
- Runs every hour, checks `RecurringInvoice` where `nextRunAt <= now()`
- Creates a new invoice from the template, dispatches email
- Updates `nextRunAt` to next interval

**Frontend:** `apps/dashboard/src/app/invoices/recurring/` — create and manage recurring schedules

---

## 📂 Updated Monorepo File Tree

```
arcpay/
├── vercel.json
├── tsconfig.json
├── package.json
├── packages/
│   └── sdk/                          # NEW: @arcpay/sdk npm package
│       ├── index.ts
│       ├── client.ts
│       ├── resources/
│       │   ├── invoices.ts
│       │   └── webhooks.ts
│       └── package.json
├── apps/
│   ├── dashboard/
│   │   └── src/app/
│   │       ├── receipt/[invoiceId]/   # NEW: Public receipt page
│   │       ├── invoices/
│   │       │   ├── batch/             # NEW: Batch upload page
│   │       │   └── recurring/         # NEW: Recurring invoices
│   │       └── settings/
│   │           ├── profile/           # NEW: Business profile
│   │           ├── api-keys/          # NEW: API key management
│   │           └── webhooks/          # NEW: Webhook management
│   └── api/
│       ├── server.mjs
│       ├── routes/
│       │   ├── invoices.mjs           # Extended with batch + PDF
│       │   ├── merchant.mjs           # NEW: Profile routes
│       │   ├── v1/                    # NEW: Public API v1
│       │   │   ├── invoices.mjs
│       │   │   └── webhooks.mjs
│       │   └── apikeys.mjs            # NEW: API key management
│       └── prisma/
│           └── schema.prisma          # Extended with new models
└── services/
    ├── indexer/
    └── scheduler/                     # NEW: Recurring invoice cron
        ├── index.js
        └── package.json
```

---

## 🗄️ Full Updated Prisma Schema (additions)

```prisma
// Add to existing schema.prisma

model MerchantProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  businessName String
  logoUrl      String?
  email        String?
  address      String?
  taxId        String?
  website      String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model InvoiceBatch {
  id          String    @id @default(cuid())
  merchantId  String
  createdAt   DateTime  @default(now())
  totalCount  Int
  totalAmount Decimal
  invoices    Invoice[]
}

model ApiKey {
  id         String    @id @default(cuid())
  merchantId String
  keyHash    String    @unique
  keyPrefix  String    // first 8 chars for display: "apk_live_xxxx..."
  label      String
  createdAt  DateTime  @default(now())
  lastUsedAt DateTime?
  active     Boolean   @default(true)
}

model Webhook {
  id         String   @id @default(cuid())
  merchantId String
  url        String
  events     String[]
  secret     String
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())
}

model RecurringInvoice {
  id           String   @id @default(cuid())
  merchantId   String
  templateData Json
  frequency    String
  nextRunAt    DateTime
  active       Boolean  @default(true)
  createdAt    DateTime @default(now())
}
```

---

## ⚙️ Environment Variables to Add

### `apps/api`
```env
PDF_SERVICE=local                   # or "lambda" for future offload
WEBHOOK_SIGNING_SECRET=whsec_xxxxx  # base secret for HMAC webhook signing
```

### `apps/dashboard`
```env
NEXT_PUBLIC_RECEIPT_BASE_URL=https://arcpaye.com/receipt
```

---

## 🧱 Implementation Order (Recommended)

Build in this exact sequence to ship value fast:

1. **MerchantProfile model + settings page** — unlocks branded invoices immediately
2. **PDF receipt generation** — highest-value visible feature
3. **Public receipt page** (`/receipt/[invoiceId]`) — shareable proof of payment
4. **Batch CSV upload + invoice creation** — unlocks B2B and payroll use case
5. **API key system + v1 routes** — enables ecosystem integrations
6. **Webhook system** — makes integrations production-grade
7. **SDK package** — developer experience layer
8. **Recurring invoice scheduler** — subscription/retainer use case

---

## 🎯 Ecosystem Pitch (Context for AI building this)

ArcPay's invoice infrastructure is designed to be integrated by **other Arc Network projects**:

| Ecosystem Project Type | How They Use ArcPay |
|---|---|
| DEX / AMM | Receipt for every swap |
| Lending protocols | Loan repayment statements |
| DAO payroll tools | Batch contributor receipts |
| NFT marketplaces | Itemized purchase receipts |
| Freelance platforms | Branded client invoices |
| B2B commerce | Net-30/60 invoice workflow |

The integration is a single API call:
```ts
POST https://api.arcpaye.com/api/v1/invoices
x-arcpay-api-key: apk_live_xxxx
```

They get back a `receiptUrl` their users can view and download. ArcPay handles everything else.

---

## ✅ Acceptance Criteria (Done = all of these pass)

- [ ] A paid invoice generates a PDF with all required fields and downloads correctly
- [ ] `arcpaye.com/receipt/[id]` loads publicly without auth and shows invoice + on-chain proof
- [ ] Business profile saves and appears on all invoice PDFs and receipt pages
- [ ] CSV batch upload parses, previews, and creates multiple invoices in one action
- [ ] API key can be generated, revoked, and used to authenticate v1 API calls
- [ ] `POST /api/v1/invoices` with valid API key creates invoice and returns `receiptUrl`
- [ ] Webhook fires on `invoice.paid` with correct payload to registered URL
- [ ] Recurring invoice creates a new invoice on schedule and updates `nextRunAt`
- [ ] SDK `client.invoices.create()` works end-to-end against production API

---

*ArcPay — The paper trail for the Arc Economy.*
