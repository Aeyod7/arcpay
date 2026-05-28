import { Router } from 'express';
import { PrismaClient } from '../prisma/client/index.js';
import { dispatchWebhookEvent } from './webhooks.mjs';
import { generateInvoiceNumber, sendInvoiceEmail, generateInvoicePdf } from '../lib/invoiceHelpers.mjs';

const prisma = new PrismaClient();
const router = Router();

// GET /api/invoices/:id/receipt.pdf - Generate and download PDF receipt
router.get('/:id/receipt.pdf', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    await generateInvoicePdf(invoice, res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/batch - CSV style batch invoice creation
router.post('/batch', async (req, res) => {
  try {
    const { invoices: invoiceData } = req.body;

    if (!invoiceData || !Array.isArray(invoiceData) || invoiceData.length === 0) {
      return res.status(400).json({ success: false, error: 'invoices array is required' });
    }

    // Validate
    for (const inv of invoiceData) {
      if (!inv.clientEmail || !inv.amount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Each entry requires clientEmail and amount' 
        });
      }
    }

    // Calculate total
    const totalAmount = invoiceData.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);

    const merchantId = req.merchantId || req.query.merchantId || req.body.merchantId || 'default_merchant';
    // Create batch record
    const batch = await prisma.invoiceBatch.create({
      data: {
        merchantId,
        totalCount: invoiceData.length,
        totalAmount: totalAmount
      }
    });

    // Create all invoices in sequence (for email sending)
    const created = [];
    for (let i = 0; i < invoiceData.length; i++) {
      const inv = invoiceData[i];
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: generateInvoiceNumber(i),
          merchantId,
          batchId: batch.id,
          clientName: inv.clientName || inv.clientEmail,
          clientEmail: inv.clientEmail,
          clientWallet: inv.clientWallet || null,
          amount: parseFloat(inv.amount),
          description: inv.description || 'Batch Invoice',
          lineItems: inv.lineItems ? JSON.stringify(inv.lineItems) : JSON.stringify([{
            description: inv.description || 'Batch Invoice Item',
            quantity: 1,
            unitPrice: parseFloat(inv.amount)
          }]),
          status: 'pending'
        }
      });
      created.push(invoice);
      await sendInvoiceEmail(invoice);
    }

    await dispatchWebhookEvent('batch.completed', { batchId: batch.id, count: created.length }, merchantId);

    res.status(201).json({
      success: true,
      batch: { id: batch.id, totalCount: batch.totalCount, totalAmount: batch.totalAmount },
      invoices: created.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        status: inv.status,
        amount: inv.amount,
        clientEmail: inv.clientEmail
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/invoices/recurring/generate - Manually trigger recurring invoice generation
router.post('/recurring/generate', async (req, res) => {
  try {
    const now = new Date();
    const dueInvoices = await prisma.recurringInvoice.findMany({
      where: {
        active: true,
        nextRunAt: { lte: now }
      }
    });

    let generated = 0;
    for (const recurring of dueInvoices) {
      const template = typeof recurring.templateData === 'string' 
        ? JSON.parse(recurring.templateData) 
        : recurring.templateData;
      
      if (template && template.clientEmail && template.amount) {
        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: generateInvoiceNumber(),
            merchantId: recurring.merchantId,
            clientName: template.clientName || template.clientEmail,
            clientEmail: template.clientEmail,
            clientWallet: template.clientWallet || null,
            amount: parseFloat(template.amount),
            description: template.description || 'Recurring Invoice',
            lineItems: template.lineItems ? JSON.stringify(template.lineItems) : null,
            status: 'pending'
          }
        });
        
        await sendInvoiceEmail(invoice);
        generated++;

        // Calculate next run
        const nextRun = new Date(recurring.nextRunAt);
        switch (recurring.frequency) {
          case 'weekly': nextRun.setDate(nextRun.getDate() + 7); break;
          case 'monthly': nextRun.setMonth(nextRun.getMonth() + 1); break;
          case 'quarterly': nextRun.setMonth(nextRun.getMonth() + 3); break;
        }

        await prisma.recurringInvoice.update({
          where: { id: recurring.id },
          data: { nextRunAt: nextRun }
        });
      }
    }

    res.json({ success: true, generated, totalDue: dueInvoices.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
