import { Router } from 'express';
import { PrismaClient } from '../../prisma/client/index.js';
import { apiKeyAuth } from '../../middleware/apiKeyAuth.mjs';
import { dispatchWebhookEvent } from '../webhooks.mjs';
import { generateInvoiceNumber, sendInvoiceEmail, generateInvoicePdf } from '../../lib/invoiceHelpers.mjs';

const prisma = new PrismaClient();
const router = Router();

// All v1 routes require API key auth
router.use(apiKeyAuth);

// POST /api/v1/invoices - Create invoice
router.post('/', async (req, res) => {
  try {
    const { to, items, currency, dueDate, memo, metadata } = req.body;

    if (!to || !to.wallet || !to.email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to.wallet, to.email' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, error: 'items array is required with at least one item' 
      });
    }

    // Calculate total from line items
    const totalAmount = items.reduce((sum, item) => {
      return sum + (item.quantity || 1) * (item.unitPrice || 0);
    }, 0);

    const invoiceNumber = generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        merchantId: req.merchantId,
        clientName: to.name || to.email,
        clientEmail: to.email,
        clientWallet: to.wallet,
        amount: totalAmount,
        description: items[0]?.description || 'Invoice items',
        lineItems: JSON.stringify(items),
        status: 'pending',
        dueDate: dueDate ? new Date(dueDate) : null,
        memo: memo || null,
        metadata: metadata || null
      }
    });

    const receiptBase = process.env.RECEIPT_BASE_URL || 'https://arcpaye.com';
    const receiptUrl = `${receiptBase}/receipt/${invoice.id}`;
    const checkoutUrl = `${receiptBase}/invoices/pay/${invoice.id}`;

    await dispatchWebhookEvent('invoice.created', invoice, req.merchantId);
    await sendInvoiceEmail(invoice);

    res.status(201).json({
      success: true,
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        receiptUrl,
        checkoutUrl,
        status: invoice.status,
        amount: invoice.amount,
        currency: currency || 'USDC'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/invoices - List invoices (paginated, filterable)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const where = { merchantId: req.merchantId };
    if (status) where.status = status;

    const [invoices, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      success: true,
      invoices,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/invoices/:id - Get invoice details
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: req.params.id,
        merchantId: req.merchantId
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const receiptBase = process.env.RECEIPT_BASE_URL || 'https://arcpaye.com';

    res.json({
      success: true,
      invoice: {
        ...invoice,
        lineItems: typeof invoice.lineItems === 'string' ? JSON.parse(invoice.lineItems) : invoice.lineItems,
        receiptUrl: `${receiptBase}/receipt/${invoice.id}`,
        checkoutUrl: `${receiptBase}/invoices/pay/${invoice.id}`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/v1/invoices/:id - Update unpaid invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: req.params.id,
        merchantId: req.merchantId,
        status: 'pending'
      }
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invoice not found or cannot be updated (already paid/cancelled)' 
      });
    }

    const { to, items, dueDate, memo } = req.body;

    const updateData = {};
    if (to) {
      if (to.name) updateData.clientName = to.name;
      if (to.email) updateData.clientEmail = to.email;
      if (to.wallet) updateData.clientWallet = to.wallet;
    }
    if (items && Array.isArray(items) && items.length > 0) {
      updateData.lineItems = JSON.stringify(items);
      updateData.amount = items.reduce((sum, item) => sum + (item.quantity || 1) * (item.unitPrice || 0), 0);
      updateData.description = items[0].description;
    }
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (memo) updateData.memo = memo;

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ success: true, invoice: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/v1/invoices/:id - Cancel unpaid invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: req.params.id,
        merchantId: req.merchantId,
        status: 'pending'
      }
    });

    if (!invoice) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invoice not found or cannot be cancelled' 
      });
    }

    await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' }
    });

    await dispatchWebhookEvent('invoice.cancelled', invoice, req.merchantId);

    res.json({ success: true, message: 'Invoice cancelled.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/v1/invoices/batch - Create multiple invoices
router.post('/batch', async (req, res) => {
  try {
    const { invoices: invoiceData } = req.body;

    if (!invoiceData || !Array.isArray(invoiceData) || invoiceData.length === 0) {
      return res.status(400).json({ 
        success: false, error: 'invoices array is required' 
      });
    }

    // Validate entries
    for (const inv of invoiceData) {
      if (!inv.to?.wallet || !inv.to?.email || !inv.items?.length) {
        return res.status(400).json({ 
          success: false, 
          error: 'Each invoice requires to.wallet, to.email, and items array' 
        });
      }
    }

    // Create batch record
    const totalAmount = invoiceData.reduce((sum, inv) => {
      return sum + inv.items.reduce((s, item) => s + (item.quantity || 1) * (item.unitPrice || 0), 0);
    }, 0);

    const batch = await prisma.invoiceBatch.create({
      data: {
        merchantId: req.merchantId,
        totalCount: invoiceData.length,
        totalAmount: totalAmount
      }
    });

    // Create all invoices
    const createdInvoices = [];
    for (let i = 0; i < invoiceData.length; i++) {
      const inv = invoiceData[i];
      const invAmount = inv.items.reduce((sum, item) => sum + (item.quantity || 1) * (item.unitPrice || 0), 0);

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(i),
          merchantId: req.merchantId,
          batchId: batch.id,
          clientName: inv.to.name || inv.to.email,
          clientEmail: inv.to.email,
          clientWallet: inv.to.wallet,
          amount: invAmount,
          description: inv.items[0]?.description || 'Batch invoice',
          lineItems: JSON.stringify(inv.items),
          status: 'pending',
          dueDate: inv.dueDate ? new Date(inv.dueDate) : null,
          memo: inv.memo || null,
          metadata: inv.metadata || null
        }
      });

      createdInvoices.push(invoice);
      await dispatchWebhookEvent('invoice.created', invoice, req.merchantId);
      await sendInvoiceEmail(invoice);
    }

    await dispatchWebhookEvent('batch.completed', { batchId: batch.id, count: createdInvoices.length }, req.merchantId);

    const receiptBase = process.env.RECEIPT_BASE_URL || 'https://arcpaye.com';

    res.status(201).json({
      success: true,
      batch: {
        id: batch.id,
        totalCount: batch.totalCount,
        totalAmount: batch.totalAmount
      },
      invoices: createdInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        receiptUrl: `${receiptBase}/receipt/${inv.id}`,
        checkoutUrl: `${receiptBase}/invoices/pay/${inv.id}`,
        status: inv.status
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/v1/invoices/:id/pdf - Download PDF receipt
router.get('/:id/pdf', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: req.params.id,
        merchantId: req.merchantId
      }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    await generateInvoicePdf(invoice, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
