import { ethers } from 'ethers';

// ========== Constants ==========

export const ARCPAY_REGISTRY_ADDRESS = '0xD81C2CDa790231a8e701911175519d3521F1d51c';
export const ARCPAY_SIGNATURE_HEADER = 'x-arcpay-signature';

// ========== Types ==========

export interface InvoiceRecipient {
  wallet: string;
  email: string;
  name?: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  unitPrice: number;
}

export interface CreateInvoiceOptions {
  to: InvoiceRecipient;
  items: InvoiceLineItem[];
  currency?: string;
  dueDate?: string;
  memo?: string;
  metadata?: Record<string, unknown>;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  clientName: string;
  clientEmail: string;
  clientWallet?: string;
  amount: number;
  description: string;
  lineItems?: InvoiceLineItem[];
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  txHash?: string;
  blockNumber?: number;
  paidAt?: string;
  createdAt: string;
  dueDate?: string;
  receiptUrl?: string;
  checkoutUrl?: string;
}

export interface BatchCreateOptions {
  invoices: CreateInvoiceOptions[];
}

export interface BatchInvoiceResult {
  id: string;
  invoiceNumber: string;
  receiptUrl: string;
  checkoutUrl: string;
  status: string;
}

export interface BatchResult {
  id: string;
  totalCount: number;
  totalAmount: number;
  invoices: BatchInvoiceResult[];
}

export interface MerchantProfile {
  userId?: string;
  businessName: string;
  logoUrl?: string;
  email?: string;
  address?: string;
  taxId?: string;
  website?: string;
}

export interface WebhookConfig {
  id?: string;
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
}

export interface ApiKeyInfo {
  id?: string;
  key?: string;
  keyPrefix?: string;
  label: string;
  createdAt?: string;
  lastUsedAt?: string;
  active?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ========== Client ==========

/**
 * ArcPay API client for creating and managing invoices, webhooks, and receipts.
 *
 * @example
 * ```ts
 * import { ArcPayClient } from '@arcpay/sdk';
 *
 * const client = new ArcPayClient('apk_live_xxxx');
 *
 * const invoice = await client.createInvoice({
 *   to: { wallet: '0x...', email: 'client@example.com' },
 *   items: [{ description: 'Service fee', quantity: 1, unitPrice: 100 }],
 * });
 *
 * console.log(invoice.receiptUrl);
 * ```
 */
export class ArcPayClient {
  private apiKey: string;
  private apiBaseUrl: string;

  constructor(apiKey: string, apiBaseUrl = 'https://api.arcpaye.com/api/v1') {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('ArcPayClient: apiKey is required');
    }
    this.apiKey = apiKey;
    this.apiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = new Headers(options.headers);
    headers.set('x-arcpay-api-key', this.apiKey);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData as { error?: string }).error ||
        `ArcPay API error: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  }

  // ========== Invoices ==========

  /** Create a new invoice and receive a receipt URL and checkout link */
  async createInvoice(options: CreateInvoiceOptions): Promise<Invoice> {
    const result = await this.request<{ success: boolean; invoice: Invoice }>(
      '/invoices',
      { method: 'POST', body: JSON.stringify(options) },
    );
    return result.invoice;
  }

  /** Get invoice by ID */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const result = await this.request<{ success: boolean; invoice: Invoice }>(
      `/invoices/${invoiceId}`,
    );
    return result.invoice;
  }

  /** List invoices with optional status filter and pagination */
  async listInvoices(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: Invoice[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const result = await this.request<{
      success: boolean;
      invoices: Invoice[];
      pagination: Pagination;
    }>(`/invoices?${query.toString()}`);
    return { invoices: result.invoices, pagination: result.pagination };
  }

  /** Update an unpaid invoice */
  async updateInvoice(
    invoiceId: string,
    data: Partial<CreateInvoiceOptions>,
  ): Promise<Invoice> {
    const result = await this.request<{ success: boolean; invoice: Invoice }>(
      `/invoices/${invoiceId}`,
      { method: 'PUT', body: JSON.stringify(data) },
    );
    return result.invoice;
  }

  /** Cancel an unpaid invoice. Once cancelled, it cannot be paid. */
  async cancelInvoice(invoiceId: string): Promise<void> {
    await this.request(`/invoices/${invoiceId}`, { method: 'DELETE' });
  }

  /** Get the PDF receipt download URL for an invoice */
  getPdfUrl(invoiceId: string): string {
    return `${this.apiBaseUrl}/invoices/${invoiceId}/pdf`;
  }

  // ========== Batch Operations ==========

  /** Create multiple invoices in a single batch */
  async createBatch(options: BatchCreateOptions): Promise<BatchResult> {
    const result = await this.request<{
      success: boolean;
      batch: { id: string; totalCount: number; totalAmount: number };
      invoices: BatchInvoiceResult[];
    }>('/invoices/batch', {
      method: 'POST',
      body: JSON.stringify({ invoices: options.invoices }),
    });
    return {
      id: result.batch.id,
      totalCount: result.batch.totalCount,
      totalAmount: result.batch.totalAmount,
      invoices: result.invoices,
    };
  }

  // ========== Webhooks ==========

  /** Register a webhook endpoint to receive invoice events */
  async createWebhook(url: string, events: string[]): Promise<WebhookConfig> {
    const result = await this.request<{ success: boolean; webhook: WebhookConfig }>(
      '/webhooks',
      { method: 'POST', body: JSON.stringify({ url, events }) },
    );
    return result.webhook;
  }

  /** List all registered webhooks */
  async listWebhooks(): Promise<WebhookConfig[]> {
    const result = await this.request<{
      success: boolean;
      webhooks: WebhookConfig[];
    }>('/webhooks');
    return result.webhooks;
  }

  /** Delete a webhook by ID */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request(`/webhooks/${webhookId}`, { method: 'DELETE' });
  }
}

// ========== Utility Functions ==========

/**
 * Verify an HMAC-SHA256 signed webhook payload from ArcPay.
 *
 * ArcPay signs webhook payloads using HMAC-SHA256 with your webhook's secret key.
 * The signature is sent in the `x-arcpay-signature` header as `sha256=<hex>`.
 *
 * @param payload - The raw request body as a string
 * @param signature - The signature from the `x-arcpay-signature` header
 * @param secret - Your webhook's secret key
 *
 * @example
 * ```ts
 * import { verifyWebhookSignature } from '@arcpay/sdk';
 *
 * const isValid = await verifyWebhookSignature(
 *   JSON.stringify(req.body),
 *   req.headers['x-arcpay-signature'],
 *   'whsec_xxxxx',
 * );
 * ```
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    if (typeof payload !== 'string') {
      payload = JSON.stringify(payload);
    }

    // Strip "sha256=" prefix if present
    const expectedSig = signature.replace(/^sha256=/, '').toLowerCase();

    // --- Node.js path (uses process.versions.node check) ---
    if (typeof process !== 'undefined' && process.versions?.node) {
      const { createHmac } = await import('node:crypto');
      const computed = createHmac('sha256', secret)
        .update(payload, 'utf-8')
        .digest('hex');
      return computed === expectedSig;
    }

    // --- Browser / Workers / Bun / Deno path (Web Crypto API) ---
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    const sigBytes = hexToBytes(expectedSig);
    return crypto.subtle.verify('HMAC', key, sigBytes as BufferSource, encoder.encode(payload) as BufferSource);
  } catch (err) {
    console.error('[ArcPay SDK] Signature verification failed:', err);
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Verify on-chain settlement on the Arc Network.
 *
 * Checks the blockchain for a transaction receipt and optionally validates
 * the recipient address.
 *
 * @param txHash - The Arc Network transaction hash
 * @param recipientAddress - Expected recipient wallet address (optional)
 * @param rpcUrl - Arc Network RPC URL
 *
 * @example
 * ```ts
 * import { verifyOnChainSettlement } from '@arcpay/sdk';
 *
 * const result = await verifyOnChainSettlement('0xabc...', '0xRecipientWallet');
 * console.log(result.blockNumber); // 4209673
 * ```
 */
export async function verifyOnChainSettlement(
  txHash: string,
  recipientAddress?: string,
  rpcUrl = 'https://rpc.testnet.arc.network',
): Promise<{ success: boolean; blockNumber?: number }> {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const tx = await provider.getTransaction(txHash);
    if (!tx) return { success: false };

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) return { success: false };

    // Optionally verify the recipient
    if (recipientAddress && tx.to?.toLowerCase() !== recipientAddress.toLowerCase()) {
      return { success: false };
    }

    return { success: true, blockNumber: receipt.blockNumber };
  } catch (err) {
    console.warn(`[ArcPay SDK] On-chain check failed:`, (err as Error).message);
    return { success: false };
  }
}

// ========== Legacy alias (backward compatible) ==========
// The SDK was originally named `ArcPayClient` but the spec referred to `ArcPay`.
// Export under both names for flexibility.
export { ArcPayClient as ArcPay };
