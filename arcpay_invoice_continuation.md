# ArcPay Invoice & Receipt Infrastructure — Session Continuation

> **Generated:** May 27, 2026  
> **Previous Agent:** Buffy (deepseek/deepseek-v4-flash)  
> **Project:** ArcPay (`arcpaye.com`) — extending the existing stablecoin payments OS  
> **Build:** Invoice & Receipt Infrastructure Layer for the Arc Network ecosystem

---

## ✅ What Has Been Built (Complete)

### Phase 1 — Core Receipt & Invoice Upgrade

| Feature | Files | Status |
|---|---|---|
| **Prisma Schema** — All new models: `MerchantProfile`, `InvoiceBatch`, `ApiKey`, `Webhook`, `RecurringInvoice`, extended `Invoice` with `lineItems`, `batchId`, `paidAt`, `blockNumber`, `memo`, `metadata` | `apps/api/prisma/schema.prisma` | ✅ |
| **Prisma Client Generated** | `apps/api/prisma/client/` | ✅ |
| **Shared Helpers Module** — `generateInvoiceNumber()`, `sendInvoiceEmail()`, `generateInvoicePdf()` (PDF with pdfkit: header, line items table, merchant branding, on-chain proof, footer) | `apps/api/lib/invoiceHelpers.mjs` | ✅ |
| **Merchant Profile API** — `GET/PUT /api/merchant/profile` | `apps/api/routes/merchant.mjs` | ✅ |
| **Merchant Profile UI** — Business name, email, tax ID, website, logo, address form | `apps/dashboard/src/app/settings/profile/page.tsx` | ✅ |
| **PDF Receipt Generation** — `GET /api/invoices/:id/receipt.pdf` → full PDF via pdfkit | `apps/api/routes/invoices.mjs` (uses shared helpers) | ✅ |
| **Public Receipt Page** — `/receipt/[invoiceId]` with dynamic OG meta tags (invoice amount, merchant name, status in link previews), line items table, on-chain proof, polling for pending, PDF download, clipboard copy | `apps/dashboard/src/app/receipt/[invoiceId]/page.tsx` (server wrapper) + `receipt-client.tsx` (client component) | ✅ |
| **Settings Page with Tabs** — Profile, API Keys, Webhooks, General navigation | `apps/dashboard/src/app/settings/page.tsx` + sub-pages | ✅ |

### Phase 2 — Batch Invoicing

| Feature | Files | Status |
|---|---|---|
| **Batch API** — `POST /api/invoices/batch` creates batch record + all invoices in sequence, dispatches emails | `apps/api/routes/invoices.mjs` | ✅ |
| **Batch UI** — Drag-and-drop CSV upload, preview table with validation, batch creation with success view | `apps/dashboard/src/app/invoices/batch/page.tsx` | ✅ |

### Phase 3 — Ecosystem Integration API

| Feature | Files | Status |
|---|---|---|
| **API Key Auth Middleware** — SHA-256 hash lookup, `x-arcpay-api-key` header, auto-updates `lastUsedAt` | `apps/api/middleware/apiKeyAuth.mjs` | ✅ |
| **API Key Management API** — `GET/POST/DELETE /api/api-keys` (one-time key display on creation) | `apps/api/routes/apikeys.mjs` | ✅ |
| **API Key Management UI** — Generate/revoke keys with one-time key display + copy | `apps/dashboard/src/app/settings/api-keys/page.tsx` | ✅ |
| **Webhook System API** — `GET/POST/DELETE /api/webhooks` with HMAC-SHA256 signing, `dispatchWebhookEvent()` with 3x retry + exponential backoff | `apps/api/routes/webhooks.mjs` | ✅ |
| **Webhook Management UI** — Create/delete webhooks with event subscription checkboxes | `apps/dashboard/src/app/settings/webhooks/page.tsx` | ✅ |
| **Public REST API v1** — `POST/GET/PUT/DELETE /api/v1/invoices`, `POST /api/v1/invoices/batch`, `GET /api/v1/invoices/:id/pdf` (all behind apiKeyAuth) | `apps/api/routes/v1/invoices.mjs` | ✅ |
| **SDK Package** — `ArcPayClient` with `invoices.create()`, `.get()`, `.list()`, `.update()`, `.cancel()`, `.createBatch()`, webhook management, `verifyWebhookSignature()`, `verifyOnChainSettlement()` | `packages/sdk/src/index.ts` | ✅ |

### Phase 4 — Recurring Invoices

| Feature | Files | Status |
|---|---|---|
| **Recurring Invoice API** — `GET/POST/PATCH/DELETE /api/recurring-invoices` (inline in server.mjs) | `apps/api/server.mjs` | ✅ |
| **Recurring Generate Endpoint** — `POST /api/invoices/recurring/generate` — creates invoices from due schedules, advances `nextRunAt` | `apps/api/routes/invoices.mjs` | ✅ |
| **Recurring Invoices UI** — Create/manage schedules (weekly/monthly/quarterly) with pause/activate toggles | `apps/dashboard/src/app/invoices/recurring/page.tsx` | ✅ |
| **Scheduler Service** — Polls `/api/invoices/recurring/generate` every 60s, graceful shutdown | `services/scheduler/index.js`, `services/scheduler/package.json` | ✅ |

### Server Wiring

| Feature | Files | Status |
|---|---|---|
| **server.mjs** — All route modules wired: `merchantRoutes`, `extendedInvoiceRoutes`, `apiKeyRoutes`, `webhookRoutes`, `v1InvoiceRoutes` + inline recurring CRUD + db-init with all new tables + original invoice/payout/settings routes for backward compatibility | `apps/api/server.mjs` | ✅ |

---

## 📁 Complete File Inventory

```
arcpay/
├── arcpay_invoice_build_prompt.md          # Original build spec
├── arcpay_invoice_continuation.md          # THIS FILE — session handoff
│
├── apps/api/
│   ├── lib/
│   │   └── invoiceHelpers.mjs              # NEW — Shared helpers (gen invoice#, email, PDF)
│   ├── middleware/
│   │   ├── apiKeyAuth.mjs                  # NEW — API key authentication middleware
│   │   └── clerkAuth.mjs                   # NEW — Clerk JWT verification middleware
│   ├── routes/
│   │   ├── merchant.mjs                    # NEW — Merchant profile routes
│   │   ├── invoices.mjs                    # NEW — PDF, batch, recurring generate routes
│   │   ├── apikeys.mjs                     # NEW — API key management routes
│   │   ├── webhooks.mjs                    # NEW — Webhook management + dispatcher
│   │   └── v1/
│   │       └── invoices.mjs                # NEW — Public REST API v1 routes (key-auth protected)
│   ├── server.mjs                          # UPDATED — All new routes wired, recurring CRUD
│   └── prisma/schema.prisma                # UPDATED — All new models added
│
├── apps/dashboard/src/app/
│   ├── receipt/[invoiceId]/page.tsx        # NEW — Public receipt page (no auth)
│   ├── invoices/
│   │   ├── batch/page.tsx                  # NEW — CSV batch upload page
│   │   └── recurring/page.tsx             # NEW — Recurring invoice management
│   └── settings/
│       ├── profile/page.tsx                # NEW — Business profile settings
│       ├── api-keys/page.tsx               # NEW — API key management
│       └── webhooks/page.tsx              # NEW — Webhook management
│
├── packages/sdk/
│   ├── src/index.ts                        # UPDATED — Full SDK with all new methods
│   └── dist/                               # NEW — Compiled TypeScript output (index.js + index.d.ts)
│
└── services/scheduler/
    ├── index.js                             # NEW — Recurring invoice poller
    └── package.json                        # NEW — Scheduler dependencies
```

---

## 🗄️ Prisma Schema — New Models

All added to `apps/api/prisma/schema.prisma`:

- **`MerchantProfile`** — `id`, `userId` (unique), `businessName`, `logoUrl`, `email`, `address`, `taxId`, `website`, timestamps
- **`InvoiceBatch`** — `id`, `merchantId`, `totalCount`, `totalAmount`, `invoices[]` relation
- **`ApiKey`** — `id`, `merchantId`, `keyHash` (SHA-256, unique), `keyPrefix`, `label`, `lastUsedAt`, `active`
- **`Webhook`** — `id`, `merchantId`, `url`, `events` (String[]), `secret`, `active`
- **`RecurringInvoice`** — `id`, `merchantId`, `templateData` (Json), `frequency`, `nextRunAt`, `active`
- **`Invoice` extended** — added: `invoiceNumber`, `clientWallet`, `lineItems` (Json), `blockNumber`, `paidAt`, `dueDate`, `merchantId`, `batchId`, `memo`, `metadata` (Json), `updatedAt`. Relation: `batch InvoiceBatch?`

---

## 🔌 Key API Routes Reference

### Merchant
- `GET /api/merchant/profile?userId=xxx` — Get merchant profile
- `PUT /api/merchant/profile` — Create/update profile

### Invoices (internal)
- `GET /api/invoices/:id/receipt.pdf` — Download PDF receipt
- `POST /api/invoices/batch` — Batch create invoices `{ invoices: [{ clientEmail, amount, ... }] }`
- `POST /api/invoices/recurring/generate` — Trigger recurring invoice generation

### API Keys
- `GET /api/api-keys?merchantId=xxx` — List keys (keyHash never returned)
- `POST /api/api-keys` — Create key `{ merchantId, label }` → returns full key ONCE
- `DELETE /api/api-keys/:id` — Revoke key (sets active=false)

### Webhooks
- `GET /api/webhooks?merchantId=xxx` — List webhooks
- `POST /api/webhooks` — Create `{ merchantId, url, events: [...] }` → returns secret ONCE
- `DELETE /api/webhooks/:id` — Delete webhook

### Recurring Invoices (inline in server.mjs)
- `GET /api/recurring-invoices?merchantId=xxx` — List schedules
- `POST /api/recurring-invoices` — Create `{ merchantId, templateData, frequency }`
- `PATCH /api/recurring-invoices/:id` — Toggle `{ active: bool }`
- `DELETE /api/recurring-invoices/:id` — Delete schedule

### Public API v1 (requires `x-arcpay-api-key` header)
- `POST /api/v1/invoices` — Create invoice `{ to: { wallet, email, name? }, items: [{ description, quantity?, unitPrice }], currency?, dueDate?, memo?, metadata? }`
- `GET /api/v1/invoices` — List (paginated, filterable by `?status=&page=&limit=`)
- `GET /api/v1/invoices/:id` — Get details
- `PUT /api/v1/invoices/:id` — Update (only if pending)
- `DELETE /api/v1/invoices/:id` — Cancel (only if pending)
- `POST /api/v1/invoices/batch` — Batch create `{ invoices: [{ to: {...}, items: [...] }] }`
- `GET /api/v1/invoices/:id/pdf` — Download PDF receipt

### Original (backward compatible, in server.mjs)
- `GET/POST /api/invoices` — List/create
- `GET /api/invoices/:id` — Get one
- `POST /api/invoices/:id/pay` — Mark paid (with email alerts)
- `GET/POST /api/payouts` — Payout CRUD
- `GET/POST /api/settings` — Legacy settings
- `GET /api/dashboard` — Aggregated metrics
- `POST /api/db-init` — Create all tables programmatically
- `POST /api/seed` — Seed mock data

---

## 🐛 Known Issues / TODOs

1. ~~**Hardcoded `merchantId = 'default_merchant'`**~~ — **FIXED.** New `clerkAuth.mjs` middleware verifies Clerk JWTs and sets `req.merchantId` on all /api/* routes. Falls back to `'default_merchant'` in dev mode when `CLERK_SECRET_KEY` is not set. All route modules now use `req.merchantId || req.query.merchantId || 'default_merchant'` for backward compatibility.

2. ~~**`dispatchWebhookEvent` third param**~~ — **FIXED.** `routes/invoices.mjs` batch route now passes `merchantId` to `dispatchWebhookEvent`.

3. **Duplicate `sendTransactionalEmail` + `dispatchWebhook` in `server.mjs`** — These exist alongside the new shared helpers. They serve old inline routes in `server.mjs` and are kept for backward compatibility. Eventually migrate all routes to route modules and remove old inline functions.

4. **`dispatchWebhook` in `server.mjs`** uses the old `Setting` model (key-value store), while `dispatchWebhookEvent` in `webhooks.mjs` uses the new `Webhook` model. Two different systems coexisting — eventually consolidate to the new `Webhook` model.

5. **Scheduler not deployed** — `services/scheduler/` needs to be deployed as a standalone service (e.g., Docker container, systemd unit, or a cron job). Not wired into any deployment config.

6. **SDK not published** — `packages/sdk/` now has `dist/` output (built with `tsc`) but needs `npm publish` setup.

### Phase 5 — SDK NPM Publishing Setup (Session 3)

| Feature | Files | Status |
|---|---|---|
| **package.json enhanced** — `files`, `exports`, `publishConfig`, `engines`, `sideEffects`, `repository`, `keywords`, `license`, `prepublishOnly` script | `packages/sdk/package.json` | ✅ |
| **`verifyWebhookSignature()` rewritten** — Dual path: `node:crypto` (server) + `crypto.subtle` (browser). Strips `sha256=` prefix. Returns `Promise<boolean>` | `packages/sdk/src/index.ts` | ✅ |
| **`verifyOnChainSettlement()` cleaned** — Removed dead `expectedAmountUSDC` param | `packages/sdk/src/index.ts` | ✅ |
| **`ArcPay` alias** — `ArcPayClient as ArcPay` for backward compatibility | `packages/sdk/src/index.ts` | ✅ |
| **JSDoc** — Every exported symbol has `@param`, `@returns`, `@example` | `packages/sdk/src/index.ts` | ✅ |
| **README.md** — Quick start, full API table, type refs, webhook verification example, error handling | `packages/sdk/README.md` | ✅ |
| **Compiled `dist/`** — `index.js` + `index.d.ts`, zero type errors | `packages/sdk/dist/` | ✅ |

---

## 🧱 Recommended Next Steps (Priority Order)

1. **Deploy the API** → Push to Vercel, run `/api/db-init` to create all tables
2. **Publish SDK** → `cd packages/sdk && npm publish` (already ready, just need `npm login`)
3. **Deploy scheduler** → Docker or systemd unit for `services/scheduler/index.js`
4. **Set CLERK_SECRET_KEY in production** → Enables real JWT auth via `clerkAuth.mjs`
5. **Add additional tests** → Unit tests for v1 API endpoints + e2e receipt flow testing
6. **OG image asset** → Create actual `/og-receipt.png` for link previews
7. **Deprecate old `Setting` model** → Migrate legacy settings/webhook routes to new `Webhook` + `MerchantProfile` models

---

## 🎯 Ecosystem Pitch (Quick Reference)

ArcPay's invoice infrastructure is designed to be integrated by other Arc Network projects:

| Project Type | Integration |
|---|---|
| DEX / AMM | `POST /api/v1/invoices` → receipt for every swap |
| Lending protocols | Loan repayment statements via batch API |
| DAO payroll tools | Batch contributor receipts |
| NFT marketplaces | Itemized purchase receipts |
| Freelance platforms | Branded client invoices |
| B2B commerce | Net-30/60 invoice workflow |

Integration is one API call with an API key:
```ts
POST https://api.arcpaye.com/api/v1/invoices
x-arcpay-api-key: apk_live_xxxx
{ to: { wallet: "0x...", email: "user@example.com" }, items: [...] }
```
Returns: `{ invoiceId, receiptUrl, checkoutUrl, status }`

---

*ArcPay — The paper trail for the Arc Economy.*
