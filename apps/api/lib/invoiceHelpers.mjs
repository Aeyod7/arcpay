import PDFDocument from 'pdfkit';
import { PrismaClient } from '../prisma/client/index.js';

const prisma = new PrismaClient();

/**
 * Generate an invoice number in the format INV-YYYY-XXXX
 */
export function generateInvoiceNumber(index = 0) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9000) + 1000 + index).slice(-4).padStart(4, '0');
  return `INV-${yyyy}${mm}${dd}-${seq}`;
}

/**
 * Send invoice email to client via Resend
 */
export async function sendInvoiceEmail(invoice) {
  try {
    const resend = global.__resend;
    if (!resend) return;

    const checkoutUrl = `${process.env.RECEIPT_BASE_URL || 'https://arcpaye.com'}/invoices/pay/${invoice.id}`;

    await resend.emails.send({
      from: 'ArcPay <billing@arcpaye.com>',
      to: [invoice.clientEmail],
      subject: `Invoice ${invoice.invoiceNumber} from Arc Network`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Invoice ${invoice.invoiceNumber}</title></head>
        <body style="font-family: -apple-system, sans-serif; margin: 0; padding: 32px; background: #faf9f9;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 16px; padding: 32px; border: 1px solid #bfc9bd;">
            <h2 style="color: #004c22;">Invoice ${invoice.invoiceNumber}</h2>
            <p style="color: #767d74; font-size: 14px;">From: Arc Network Solutions</p>
            <div style="background: #f0f7f2; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <div style="font-size: 32px; font-weight: 800; color: #004c22;">$${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div style="font-size: 12px; color: #767d74; text-transform: uppercase;">USDC Due</div>
            </div>
            <p style="color: #1a1c1c;"><strong>${invoice.clientName}</strong> &mdash; ${invoice.description}</p>
            <a href="${checkoutUrl}" style="display: block; text-align: center; background: #004c22; color: white; text-decoration: none; padding: 16px; border-radius: 8px; font-weight: bold; margin: 24px 0;">Pay Invoice</a>
            <p style="font-size: 12px; color: #767d74; text-align: center;">ArcPay &mdash; The paper trail for the Arc Economy.</p>
          </div>
        </body>
        </html>
      `
    });
  } catch (err) {
    console.error('[InvoiceHelper] Failed to send email:', err.message);
  }
}

/**
 * Generate and pipe a PDF receipt for an invoice to the HTTP response
 */
export async function generateInvoicePdf(invoice, res) {
  // Get merchant profile for branding
  const merchantProfile = await prisma.merchantProfile.findFirst({
    where: { userId: invoice.merchantId || 'default_merchant' }
  });

  const merchant = merchantProfile || { 
    businessName: 'Arc Network Solutions', 
    email: 'finance@arcpay.io',
    address: null
  };

  const lineItems = typeof invoice.lineItems === 'string' 
    ? JSON.parse(invoice.lineItems) 
    : (invoice.lineItems || []);

  // Create PDF document
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt-${invoice.invoiceNumber || invoice.id}.pdf"`);
  doc.pipe(res);

  // ======== HEADER ========
  doc.fontSize(24).font('Helvetica-Bold').fillColor('#004c22')
    .text('Arc Network', { align: 'center' });
  doc.fontSize(10).font('Helvetica').fillColor('#767d74')
    .text('Stablecoin Payment Receipt', { align: 'center' });
  doc.moveDown(1.5);

  // Status badge
  const statusColors = { paid: '#166534', pending: '#9a6a06', overdue: '#ba1a1a', cancelled: '#767d74' };
  const statusColor = statusColors[invoice.status] || '#767d74';
  doc.fontSize(11).font('Helvetica-Bold').fillColor(statusColor)
    .text(invoice.status.toUpperCase(), { align: 'center' });
  doc.moveDown(1);

  // Divider
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#bfc9bd').stroke();
  doc.moveDown(1);

  // ======== DETAILS ========
  const detailsTop = doc.y;
  doc.fontSize(10).fillColor('#1a1c1c');

  // Left column
  doc.font('Helvetica-Bold').text('Invoice:', 50, detailsTop);
  doc.font('Helvetica').text(invoice.invoiceNumber || invoice.id.substring(0, 18).toUpperCase(), 130, detailsTop);

  doc.font('Helvetica-Bold').text('Date:', 50, detailsTop + 18);
  doc.font('Helvetica').text(
    new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    130, detailsTop + 18
  );

  if (invoice.paidAt) {
    doc.font('Helvetica-Bold').text('Paid:', 50, detailsTop + 36);
    doc.font('Helvetica').text(
      new Date(invoice.paidAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      130, detailsTop + 36
    );
  }

  // Right column
  const rightX = 320;
  doc.font('Helvetica-Bold').text('Merchant:', rightX, detailsTop);
  doc.font('Helvetica').text(merchant.businessName, rightX + 75, detailsTop);

  if (merchant.email) {
    doc.font('Helvetica-Bold').text('Email:', rightX, detailsTop + 18);
    doc.font('Helvetica').text(merchant.email, rightX + 75, detailsTop + 18);
  }

  doc.moveDown(4.5);

  // ======== SENDER / RECIPIENT ========
  const sectionY = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#767d74').text('FROM', 50, sectionY);
  doc.fontSize(10).fillColor('#1a1c1c').font('Helvetica');
  doc.text(merchant.businessName, 50, sectionY + 14);
  doc.text(`Wallet: ${invoice.merchantId || 'Arc Network Treasury'}`, 50, sectionY + 30);

  doc.fontSize(9).font('Helvetica-Bold').fillColor('#767d74').text('TO', 320, sectionY);
  doc.fontSize(10).fillColor('#1a1c1c').font('Helvetica');
  doc.text(invoice.clientName, 320, sectionY + 14);
  doc.text(invoice.clientEmail, 320, sectionY + 30);
  if (invoice.clientWallet) {
    doc.text(`Wallet: ${invoice.clientWallet}`, 320, sectionY + 46);
  }

  doc.moveDown(4);

  // ======== LINE ITEMS TABLE ========
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#bfc9bd').stroke();
  doc.moveDown(0.5);

  const tableTop = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').fillColor('#767d74');
  doc.text('Description', 50, tableTop);
  doc.text('Qty', 340, tableTop, { width: 50, align: 'right' });
  doc.text('Unit Price', 400, tableTop, { width: 70, align: 'right' });
  doc.text('Subtotal', 475, tableTop, { width: 70, align: 'right' });

  doc.moveDown(0.5);
  let rowY = doc.y;

  doc.fontSize(10).font('Helvetica').fillColor('#1a1c1c');

  if (lineItems.length > 0) {
    for (const item of lineItems) {
      const qty = item.quantity || 1;
      const unitPrice = item.unitPrice || 0;
      const subtotal = qty * unitPrice;
      doc.text(item.description || 'Item', 50, rowY, { width: 280 });
      doc.text(String(qty), 340, rowY, { width: 50, align: 'right' });
      doc.text(`$${unitPrice.toFixed(2)}`, 400, rowY, { width: 70, align: 'right' });
      doc.text(`$${subtotal.toFixed(2)}`, 475, rowY, { width: 70, align: 'right' });
      rowY += 20;
    }
  } else {
    doc.text(invoice.description || 'USDC Settlement', 50, rowY, { width: 280 });
    doc.text('1', 340, rowY, { width: 50, align: 'right' });
    doc.text(`$${invoice.amount.toFixed(2)}`, 400, rowY, { width: 70, align: 'right' });
    doc.text(`$${invoice.amount.toFixed(2)}`, 475, rowY, { width: 70, align: 'right' });
    rowY += 20;
  }

  // Total
  const afterTable = Math.max(rowY + 8, doc.y + 8);
  doc.moveTo(50, afterTable).lineTo(545, afterTable).strokeColor('#bfc9bd').stroke();
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#004c22');
  doc.text('Total (USDC)', 50, afterTable + 8);
  doc.text(`$${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    475, afterTable + 8, { width: 70, align: 'right' });

  doc.moveDown(3);

  // ======== BLOCKCHAIN PROOF ========
  if (invoice.status === 'paid' && invoice.txHash) {
    const proofY = doc.y + 8;
    doc.moveTo(50, proofY).lineTo(545, proofY).strokeColor('#bfc9bd').stroke();
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#767d74').text('ON-CHAIN PROOF', 50, proofY + 8);
    doc.fontSize(9).font('Helvetica').fillColor('#1a1c1c');
    doc.text('Transaction Hash:', 50, proofY + 24);
    doc.font('Courier').fillColor('#004c22').fontSize(8);
    doc.text(invoice.txHash, 50, proofY + 40, { width: 495 });
    if (invoice.blockNumber) {
      doc.font('Helvetica').fillColor('#1a1c1c').fontSize(9);
      doc.text(`Block Number: ${invoice.blockNumber}`, 50, proofY + 56);
    }
    doc.moveDown(4);
  }

  // Footer
  const footerY = doc.y;
  doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor('#bfc9bd').stroke();
  doc.fontSize(8).font('Helvetica').fillColor('#767d74');
  doc.text('This receipt was cryptographically verified on the Arc Network.', 50, footerY + 8, { align: 'center' });
  doc.text('ArcPay \u2014 The paper trail for the Arc Economy.', 50, footerY + 20, { align: 'center' });

  doc.end();
}
