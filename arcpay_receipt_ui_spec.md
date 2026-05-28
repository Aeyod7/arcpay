# ArcPay — Receipt & Invoice UI Specification

> **For:** Codex / Gemini Antigravity  
> **Scope:** Invoice creation form, invoice ledger, and receipt/checkout view  
> **Priority:** Fix all issues before building Phase 2 features  
> **Brand rule:** Merchant identity is the hero. ArcPay is the infrastructure — "Powered by ArcPay" in the footer only.

---

## 🔍 Issues Found in Current Build (Fix These)

| Screen | Issue | Fix |
|---|---|---|
| Invoice Form | Single flat amount field, no line items | Replace with dynamic line items table |
| Invoice Form | No due date field | Add due date picker |
| Invoice Form | No client wallet address | Add optional wallet address field |
| Invoice Ledger | No invoice number column | Add `INV-YYYYMMDD-XXXX` column |
| Invoice Ledger | No due date column | Add due date — needed to determine overdue |
| Receipt View | Raw tx hash as plain text | Replace with QR code + explorer link |
| Receipt View | No dates shown | Add issued date + settled date/time |
| Receipt View | No line items | Show full line items table |
| Receipt View | Says "ARCPAY CHECKOUT" as header | Replace with merchant name + logo |
| Receipt View | No PDF download | Add "Download PDF" button |
| Invoice Number | `INV-SIM-71074` random format | Use `INV-20260528-0042` date-stamped format |

---

## 📋 1. Invoice Creation Form — Redesign

### Remove
- Single `SETTLEMENT AMOUNT (USDC)` number field
- Single `DESCRIPTION / MEMO` textarea

### Add — Line Items Table

Replace the above with a dynamic line items builder:

```
┌──────────────────────────────┬──────┬────────────┬────────────┬────┐
│ DESCRIPTION                  │ QTY  │ UNIT PRICE │ SUBTOTAL   │ 🗑 │
├──────────────────────────────┼──────┼────────────┼────────────┼────┤
│ [text input]                 │ [n]  │ [price]    │ auto-calc  │ x  │
└──────────────────────────────┴──────┴────────────┴────────────┴────┘
                                              [+ Add Line Item]
                                         ┌──────────────────────────┐
                                         │ TOTAL   500.00 USDC      │
                                         └──────────────────────────┘
```

- Start with 1 empty row
- `+ Add Line Item` button appends a new row
- Subtotal = qty × unit price, auto-calculated client-side
- Total = sum of all subtotals, displayed below the table
- All fields required per row before submission

### Add — Due Date Field

Place between `CLIENT EMAIL ADDRESS` and the line items table:

```
DUE DATE
[ Date Picker — defaults to 30 days from today ]
```

### Add — Client Wallet Address (Optional)

Place below `CLIENT EMAIL ADDRESS`:

```
CLIENT WALLET ADDRESS (OPTIONAL)
[ e.g. 0xClientWalletAddress ]
```

Helper text: `"Used to match on-chain settlement automatically"`

### Updated Full Form Field Order

1. CLIENT NAME
2. CLIENT EMAIL ADDRESS
3. CLIENT WALLET ADDRESS *(optional)*
4. DUE DATE
5. LINE ITEMS TABLE *(dynamic rows)*
6. TOTAL *(auto-calculated, read-only)*
7. PAYMENT ASSET *(USDC — Arc Native, locked)*
8. `Generate Invoice Intent` button

---

## 🗂️ 2. Invoice Ledger — Column Updates

### Current columns
`CLIENT DETAILS` | `CREATED` | `DESCRIPTION` | `AMOUNT` | `SETTLEMENT STATUS`

### Updated columns
`INVOICE #` | `CLIENT DETAILS` | `ISSUED` | `DUE DATE` | `AMOUNT` | `STATUS`

### Column specs

**INVOICE #**
- Format: `INV-YYYYMMDD-XXXX` where XXXX is zero-padded sequential per merchant
- Example: `INV-20260528-0042`
- Monospace font, clickable — opens receipt page

**DUE DATE**
- Show actual due date: `Jun 27, 2026`
- If status is `Overdue`, render due date in red: `May 20, 2026 ⚠`

**STATUS badge rules**
| Status | Dot color | Background |
|---|---|---|
| Paid | Green `#22c55e` | Light green tint |
| Pending | Amber `#f59e0b` | Light amber tint |
| Overdue | Red `#ef4444` | Light red tint |
| Cancelled | Grey | Light grey tint |

### Row actions (hover or `...` menu)
- View Receipt
- Download PDF
- Copy Receipt Link
- Cancel Invoice *(only if Pending)*

---

## 🧾 3. Receipt / Checkout View — Full Redesign

### Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  HEADER: Merchant Identity                          │
├─────────────────────────────────────────────────────┤
│  INVOICE META: Number, Status, Dates                │
├─────────────────────────────────────────────────────┤
│  BILLED TO: Client details                          │
├─────────────────────────────────────────────────────┤
│  LINE ITEMS TABLE                                   │
├─────────────────────────────────────────────────────┤
│  TOTAL                                              │
├─────────────────────────────────────────────────────┤
│  ON-CHAIN PROOF: QR Code + Explorer Link            │
├─────────────────────────────────────────────────────┤
│  ACTIONS: Download PDF                              │
├─────────────────────────────────────────────────────┤
│  FOOTER: Powered by ArcPay                          │
└─────────────────────────────────────────────────────┘
```

---

### Section 1 — Header: Merchant Identity

```
[Merchant Logo — 48px]   Globex Inc.
                         payments@globex.com
```

- Pull from `MerchantProfile` (businessName, logoUrl, email)
- If no profile set: show "ArcPay Merchant" as fallback
- Do NOT show "ARCPAY CHECKOUT" as the primary header — that goes to footer only
- Right-aligned: status badge (`PAID & VERIFIED` / `PENDING` / `OVERDUE`)

---

### Section 2 — Invoice Meta

```
INVOICE    INV-20260528-0042
ISSUED     May 28, 2026
DUE        Jun 27, 2026           ← hide on paid invoices
SETTLED    May 28, 2026 at 14:22 UTC   ← show only on paid invoices
```

- `SETTLED` timestamp pulled from indexer's confirmed block timestamp
- All dates in human-readable format: `Month DD, YYYY`
- Settled time in UTC

---

### Section 3 — Billed To

```
BILLED TO
Acme Corp
billing@acme.com
0xClientWallet1234...5678          ← truncated, full on hover
```

- Show wallet only if it was provided at invoice creation
- Truncate wallet: first 6 + `...` + last 4 chars

---

### Section 4 — Line Items Table

```
┌─────────────────────────────┬──────┬────────────┬────────────┐
│ DESCRIPTION                 │ QTY  │ UNIT PRICE │ TOTAL      │
├─────────────────────────────┼──────┼────────────┼────────────┤
│ API Integration Fee Q3      │  1   │ $2,500.00  │ $2,500.00  │
│ Setup & Onboarding          │  1   │   $500.00  │   $500.00  │
├─────────────────────────────┴──────┴────────────┼────────────┤
│                                          TOTAL   │ $3,000.00  │
│                                 SETTLEMENT ASSET │    USDC    │
└──────────────────────────────────────────────────┴────────────┘
```

- Clean table, no zebra stripes — use subtle border lines only
- Total row: bold, slightly larger font
- Currency label: `USDC` right-aligned next to total

---

### Section 5 — On-Chain Proof (replaces raw tx hash)

**When invoice is PAID:**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   [QR CODE — 120x120px]                         │
│                                                 │
│   ON-CHAIN SETTLEMENT PROOF                     │
│   View on Arc Explorer ↗                        │
│   0x8a7b6c5d4e3f...a9b8c7                       │  ← tiny grey subtext
│   Block #4829103 · May 28, 2026 14:22 UTC       │
│                                                 │
└─────────────────────────────────────────────────┘
```

- QR encodes: `https://explorer.arc.io/tx/{fullTxHash}`
- "View on Arc Explorer ↗" is a clickable link opening in new tab
- Raw tx hash shown as small grey text below the link — for technical reference only
- Block number and timestamp on the last line
- This entire section only renders when `status === 'paid'` and `txHash` exists

**When invoice is PENDING:**

```
⏳ Awaiting on-chain settlement
   This invoice will auto-confirm when payment is detected on Arc.
```

- Poll status every 10 seconds on the public receipt page
- Auto-update to paid state without page refresh when indexer confirms

---

### Section 6 — Actions

```
[ ⬇ Download PDF Receipt ]     [ 🔗 Copy Receipt Link ]
```

- `Download PDF Receipt` → triggers `GET /api/invoices/:id/receipt.pdf`
- `Copy Receipt Link` → copies `https://arcpaye.com/receipt/{invoiceId}` to clipboard
- Show only on paid invoices; hide on pending/overdue
- Buttons: outline style, not filled — don't compete with merchant branding

---

### Section 7 — Footer

```
─────────────────────────────────────
Verified receipt · Powered by ArcPay
arcpaye.com
```

- Small, muted grey text
- ArcPay branding lives here only — not in the header

---

## 🎨 4. Visual & Typography Rules

### Colors (inherit existing ArcPay theme)
- Primary action: `#1a3a2a` (dark green — matches existing "Generate Invoice Intent" button)
- Paid badge: `#22c55e` green
- Pending badge: `#f59e0b` amber  
- Overdue badge: `#ef4444` red
- Background: `#f9fafb` light grey page, `#ffffff` card
- Border: `1px solid #e5e7eb`
- Muted text: `#9ca3af`

### Typography
- Invoice number, amounts: monospace font (IBM Plex Mono or equivalent)
- Labels (CLIENT NAME, INVOICE, etc.): uppercase, `0.75rem`, letter-spacing `0.05em`, muted
- Body text: `0.875rem`
- Total amount: `1.5rem`, bold

### Spacing
- Card padding: `2rem`
- Section gap: `1.5rem`
- Table cell padding: `0.75rem 1rem`

---

## ✅ Acceptance Criteria

- [ ] Invoice form has dynamic line items with auto-calculated total
- [ ] Invoice form has due date picker defaulting to +30 days
- [ ] Invoice ledger shows invoice number in `INV-YYYYMMDD-XXXX` format
- [ ] Invoice ledger shows due date column with red styling on overdue rows
- [ ] Receipt header shows merchant name + logo, not "ARCPAY CHECKOUT"
- [ ] Receipt shows issued date and settled date/time (UTC)
- [ ] Receipt shows full line items table with qty, unit price, subtotal, total
- [ ] Paid receipt shows QR code linking to Arc block explorer — no raw hash as hero element
- [ ] Raw tx hash visible only as small grey subtext below QR
- [ ] Pending receipt shows polling state with auto-update on settlement
- [ ] "Download PDF" and "Copy Link" buttons present on paid receipts
- [ ] Footer reads "Powered by ArcPay" — ArcPay not mentioned in header

---

*ArcPay — The paper trail for the Arc Economy.*
