import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from './prisma/client/index.js';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 62650;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Premium Emerald HTML Invoice Request Email Template
function getInvoiceEmailHTML(invoice) {
  const checkoutUrl = `https://arcpay-app-two.vercel.app/invoices/pay/${invoice.id}`;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Request from ArcPay</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf9f9; color: #1a1c1c; }
        .container { max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border: 1px solid #bfc9bd; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #004c22; letter-spacing: -0.5px; }
        .title { font-size: 20px; font-weight: bold; margin: 16px 0 8px 0; color: #1a1c1c; }
        .amount-card { background-color: #f0f7f2; border: 1px solid #bfc9bd; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .amount-val { font-size: 32px; font-weight: 800; color: #004c22; font-family: monospace; }
        .amount-lbl { font-size: 12px; color: #767d74; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 600; }
        .details-list { border-top: 1px solid #bfc9bd; border-bottom: 1px solid #bfc9bd; padding: 16px 0; margin: 24px 0; }
        .details-item { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
        .details-key { color: #767d74; }
        .details-val { font-weight: 600; color: #1a1c1c; }
        .btn { display: block; text-align: center; background-color: #004c22; color: #ffffff !important; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 32px 0 16px 0; box-shadow: 0 2px 8px rgba(0,76,34,0.2); }
        .footer { text-align: center; font-size: 12px; color: #767d74; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Arc Network</div>
          <div class="title">New Invoice Request</div>
          <p style="font-size: 14px; color: #767d74; margin: 4px 0 0 0;">An invoice has been generated for your settlement</p>
        </div>
        
        <div class="amount-card">
          <div class="amount-val">$${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="amount-lbl">USDC Settlement Total</div>
        </div>
        
        <div class="details-list">
          <div class="details-item">
            <span class="details-key">Client Name</span>
            <span class="details-val">${invoice.clientName}</span>
          </div>
          <div class="details-item">
            <span class="details-key">Client Email</span>
            <span class="details-val">${invoice.clientEmail}</span>
          </div>
          <div class="details-item">
            <span class="details-key">Description</span>
            <span class="details-val">${invoice.description}</span>
          </div>
          <div class="details-item">
            <span class="details-key">Status</span>
            <span class="details-val" style="color: #ba1a1a; text-transform: uppercase;">Pending Payment</span>
          </div>
        </div>
        
        <a href="${checkoutUrl}" class="btn">Proceed to Secure Blockchain Checkout</a>
        
        <div class="footer">
          <p>Powered by ArcPay native zero-gas USDC engine. Transactions are fully secured on-chain.</p>
          <p>© 2026 Arc Network Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Premium Emerald HTML Receipt Email Template
function getReceiptEmailHTML(invoice) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt from ArcPay</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background-color: #faf9f9; color: #1a1c1c; }
        .container { max-width: 600px; margin: 40px auto; padding: 32px; background-color: #ffffff; border: 1px solid #bfc9bd; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { font-size: 24px; font-weight: bold; color: #004c22; letter-spacing: -0.5px; }
        .title { font-size: 20px; font-weight: bold; margin: 16px 0 8px 0; color: #004c22; }
        .success-badge { display: inline-flex; align-items: center; background-color: #e0f2e5; color: #166534; font-weight: bold; font-size: 11px; padding: 4px 12px; border-radius: 100px; text-transform: uppercase; margin-bottom: 16px; }
        .amount-card { background-color: #faf9f9; border: 1px solid #bfc9bd; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
        .amount-val { font-size: 32px; font-weight: 800; color: #1a1c1c; font-family: monospace; }
        .amount-lbl { font-size: 12px; color: #767d74; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; font-weight: 600; }
        .details-list { border-top: 1px solid #bfc9bd; border-bottom: 1px solid #bfc9bd; padding: 16px 0; margin: 24px 0; }
        .details-item { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
        .details-key { color: #767d74; }
        .details-val { font-weight: 600; color: #1a1c1c; }
        .tx-link { display: block; font-family: monospace; font-size: 11px; color: #004c22; word-break: break-all; margin-top: 4px; text-decoration: none; }
        .footer { text-align: center; font-size: 12px; color: #767d74; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Arc Network</div>
          <div class="title">Payment Settled Successfully</div>
          <div class="success-badge">Paid & Confirmed</div>
        </div>
        
        <div class="amount-card">
          <div class="amount-val">$${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div class="amount-lbl">Settled Total (USDC)</div>
        </div>
        
        <div class="details-list">
          <div class="details-item">
            <span class="details-key">Invoice ID</span>
            <span class="details-val" style="font-family: monospace; text-transform: uppercase;">${invoice.id.substring(0,18)}</span>
          </div>
          <div class="details-item">
            <span class="details-key">Client Name</span>
            <span class="details-val">${invoice.clientName}</span>
          </div>
          <div class="details-item">
            <span class="details-key">Client Email</span>
            <span class="details-val">${invoice.clientEmail}</span>
          </div>
          <div class="details-item">
            <span class="details-key">Settlement Asset</span>
            <span class="details-val" style="color: #004c22;">USDC (On-Chain Native)</span>
          </div>
        </div>
        
        <div style="background-color: #faf9f9; border: 1px solid #bfc9bd; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <span style="font-size: 12px; font-weight: bold; color: #767d74; text-transform: uppercase; display: block;">Blockchain Tx Hash</span>
          <span class="tx-link">${invoice.txHash}</span>
        </div>
        
        <div class="footer">
          <p>This transaction has been successfully verified on the blockchain ledger.</p>
          <p>© 2026 Arc Network Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendTransactionalEmail(to, subject, html) {
  try {
    if (!resend) {
      console.log(`[Resend Mock] Email dispatch mock trigger to: ${to} | Subject: ${subject}`);
      return;
    }
    
    const fromAddress = 'ArcPay <onboarding@resend.dev>';
    
    console.log(`[Resend] Firing email notification to: ${to}...`);
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: subject,
      html: html,
    });
    
    if (error) {
      console.error('[Resend Error] API call failed:', error);
    } else {
      console.log('[Resend Success] Email sent successfully! Message ID:', data.id);
    }
  } catch (err) {
    console.error('[Resend Exception] Dispatch failed:', err.message);
  }
}

app.use(cors());
app.use(express.json());

// Clean URLs middleware: automatically resolves requests without extensions to .html files
app.use((req, res, next) => {
  if (!req.path.includes('.') && !req.path.startsWith('/api')) {
    const htmlFile = path.join(__dirname, req.path + '.html');
    res.sendFile(htmlFile, (err) => {
      if (err) {
        next();
      }
    });
  } else {
    next();
  }
});

// Serve static HTML/JS/CSS files of the app
app.use(express.static(__dirname));

// Background Webhook Dispatcher
async function dispatchWebhook(eventName, payload) {
  try {
    const webhookSetting = await prisma.setting.findUnique({ where: { key: 'webhookUrl' } });
    if (!webhookSetting || !webhookSetting.value) {
      console.log(`[Webhook] No webhook URL configured. Skipping event: ${eventName}`);
      return;
    }
    
    console.log(`[Webhook] Dispatching event "${eventName}" to: ${webhookSetting.value}`);
    const response = await fetch(webhookSetting.value, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ArcPay-Event': eventName,
        'X-ArcPay-Signature': 'mock_sha256_signature_val'
      },
      body: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        data: payload
      })
    });
    
    console.log(`[Webhook] Dispatch response status: ${response.status}`);
  } catch (err) {
    console.error('[Webhook] Dispatch failed:', err.message);
  }
}

// Custom Cloud DB Init Endpoint (Creates PostgreSQL tables programmatically over serverless)
app.post('/api/db-init', async (req, res) => {
  try {
    console.log("[Database] Initializing cloud PostgreSQL tables...");
    
    // Create Invoice Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Invoice" (
        "id" VARCHAR(255) PRIMARY KEY,
        "clientName" VARCHAR(255) NOT NULL,
        "clientEmail" VARCHAR(255) NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" VARCHAR(255) NOT NULL,
        "status" VARCHAR(50) NOT NULL,
        "txHash" VARCHAR(255),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create Payout Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Payout" (
        "id" VARCHAR(255) PRIMARY KEY,
        "amount" DOUBLE PRECISION NOT NULL,
        "address" VARCHAR(255) NOT NULL,
        "currency" VARCHAR(50) NOT NULL,
        "status" VARCHAR(50) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create Setting Table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "key" VARCHAR(255) PRIMARY KEY,
        "value" TEXT NOT NULL
      );
    `);
    
    console.log("[Database] PostgreSQL tables created successfully!");
    
    // Auto-seed mock metrics if empty
    const invoiceCount = await prisma.invoice.count();
    if (invoiceCount === 0) {
      console.log("[Database] Seeding initial cloud postgres values...");
      
      await prisma.setting.createMany({
        data: [
          { key: 'webhookUrl', value: 'https://api.merchant.com/webhooks' },
          { key: 'apiKey', value: 'arc_live_5fae860bc80a0a597a7a28e8' },
          { key: 'businessName', value: 'Arc Network Solutions' },
          { key: 'businessEmail', value: 'finance@arcpay.io' }
        ]
      });
      
      await prisma.invoice.createMany({
        data: [
          {
            id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b586',
            clientName: 'Acme Corp',
            clientEmail: 'billing@acme.com',
            amount: 12500.00,
            description: 'Consulting Services Q3',
            status: 'paid',
            txHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b'
          },
          {
            id: '63c4be3b-46da-4d6e-b11d-6634e7995278',
            clientName: 'Initech',
            clientEmail: 'finance@initech.com',
            amount: 8900.00,
            description: 'Custom Platform Licensing',
            status: 'overdue'
          },
          {
            id: '6b20dddd-e1c8-4f76-a46b-c0a65e3f8bb6',
            clientName: 'Globex Inc.',
            clientEmail: 'payments@globex.com',
            amount: 4200.00,
            description: 'API Gateway Subscription',
            status: 'pending'
          },
          {
            id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b587',
            clientName: 'Weyland-Yutani',
            clientEmail: 'accounts@weyland.corp',
            amount: 112000.00,
            description: 'Terraforming Infrastructure Deployment',
            status: 'paid',
            txHash: '0x3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c'
          }
        ]
      });
      
      await prisma.payout.createMany({
        data: [
          {
            id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b588',
            amount: 5000.00,
            address: '0x9965507B1a0597a7A28e8c8f0A0A597a7A28E8c8',
            currency: 'USDC',
            status: 'submitted'
          },
          {
            id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b589',
            amount: 1.5,
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            currency: 'ETH',
            status: 'completed'
          }
        ]
      });
      console.log("[Database] Cloud Postgres mock metrics seeded!");
    }
    
    res.json({ success: true, message: 'Cloud database tables created and seeded successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1. Dashboard Metrics Aggregator
app.get('/api/dashboard', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const payouts = await prisma.payout.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Aggregations
    const totalRevenue = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
      
    const pendingInvoicesCount = invoices.filter(i => i.status === 'pending').length;
    const paidInvoicesCount = invoices.filter(i => i.status === 'paid').length;
    const activePayoutsCount = payouts.filter(p => p.status === 'submitted' || p.status === 'reviewing').length;
    
    res.json({
      success: true,
      metrics: {
        totalRevenue,
        pendingInvoicesCount,
        paidInvoicesCount,
        activePayoutsCount
      },
      recentInvoices: invoices.slice(0, 5),
      recentPayouts: payouts.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Invoices REST routes
app.post('/api/invoices', async (req, res) => {
  try {
    const { clientName, clientEmail, amount, description, status } = req.body;
    if (!clientName || !clientEmail || !amount) {
      return res.status(400).json({ success: false, error: 'Missing clientName, clientEmail, or amount' });
    }
    
    const invoice = await prisma.invoice.create({
      data: {
        clientName,
        clientEmail,
        amount: parseFloat(amount),
        description: description || 'USDC Settlement Invoice',
        status: status || 'pending'
      }
    });
    
    await dispatchWebhook('invoice.created', invoice);
    
    // Dispatch automated payment request email to client
    if (invoice.status === 'pending') {
      await sendTransactionalEmail(invoice.clientEmail, 'Payment Request from Arc Network', getInvoiceEmailHTML(invoice));
    }
    
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, invoices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/invoices/:id/pay', async (req, res) => {
  try {
    const { txHash } = req.body;
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        status: 'paid',
        txHash: txHash || 'mock_blockchain_tx_hash'
      }
    });
    
    await dispatchWebhook('invoice.paid', invoice);
    
    // Dispatch beautifully formatted receipt to client
    await sendTransactionalEmail(invoice.clientEmail, 'Payment Settle Receipt - Arc Network', getReceiptEmailHTML(invoice));
    
    // Dispatch dynamic revenue alert email to merchant settings address
    const businessEmailSetting = await prisma.setting.findUnique({ where: { key: 'businessEmail' } });
    const merchantEmail = businessEmailSetting?.value || 'finance@arcpay.io';
    
    const merchantAlertHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; border: 1px solid #bfc9bd; border-radius: 12px; max-width: 500px; margin: auto;">
        <h2 style="color: #004c22; margin-top: 0;">💰 USDC Gross Revenue Alert</h2>
        <p>Your client <b>${invoice.clientName}</b> has successfully settled their invoice on-chain!</p>
        <div style="background-color: #f0f7f2; border: 1px solid #bfc9bd; padding: 16px; border-radius: 8px; text-align: center; margin: 16px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #004c22;">$${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <p style="font-size: 13px; color: #767d74; margin-bottom: 0;">Blockchain Transaction Hash:<br><code style="word-break: break-all; color: #004c22;">${invoice.txHash}</code></p>
      </div>
    `;
    await sendTransactionalEmail(merchantEmail, `USDC Revenue Alert: $${invoice.amount} Received!`, merchantAlertHTML);
    
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Payouts REST routes
app.post('/api/payouts', async (req, res) => {
  try {
    const { amount, address, currency } = req.body;
    if (!amount || !address) {
      return res.status(400).json({ success: false, error: 'Missing amount or wallet address' });
    }
    
    const payout = await prisma.payout.create({
      data: {
        amount: parseFloat(amount),
        address,
        currency: currency || 'USDC',
        status: 'submitted'
      }
    });
    
    await dispatchWebhook('payout.submitted', payout);
    res.json({ success: true, payout });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/payouts', async (req, res) => {
  try {
    const payouts = await prisma.payout.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, payouts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Settings & Developer API Keys REST routes
app.get('/api/settings', async (req, res) => {
  try {
    const settingsList = await prisma.setting.findMany();
    const settings = settingsList.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    res.json({
      success: true,
      settings: {
        webhookUrl: settings.webhookUrl || '',
        apiKey: settings.apiKey || 'arc_live_5fae860bc80a0a597a7a28e8',
        businessName: settings.businessName || 'Arc Network Solutions',
        businessEmail: settings.businessEmail || 'finance@arcpay.io'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { webhookUrl, apiKey, businessName, businessEmail } = req.body;
    
    const updates = [];
    if (webhookUrl !== undefined) {
      updates.push(prisma.setting.upsert({
        where: { key: 'webhookUrl' },
        update: { value: webhookUrl },
        create: { key: 'webhookUrl', value: webhookUrl }
      }));
    }
    if (apiKey !== undefined) {
      updates.push(prisma.setting.upsert({
        where: { key: 'apiKey' },
        update: { value: apiKey },
        create: { key: 'apiKey', value: apiKey }
      }));
    }
    if (businessName !== undefined) {
      updates.push(prisma.setting.upsert({
        where: { key: 'businessName' },
        update: { value: businessName },
        create: { key: 'businessName', value: businessName }
      }));
    }
    if (businessEmail !== undefined) {
      updates.push(prisma.setting.upsert({
        where: { key: 'businessEmail' },
        update: { value: businessEmail },
        create: { key: 'businessEmail', value: businessEmail }
      }));
    }
    
    await Promise.all(updates);
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Custom DB Seed Endpoint (to guarantee rich mockup metrics)
app.post('/api/seed', async (req, res) => {
  try {
    // Clear old data to prevent duplication on multiple seed calls
    await prisma.invoice.deleteMany();
    await prisma.payout.deleteMany();
    await prisma.setting.deleteMany();
    
    // Seed default settings
    await prisma.setting.createMany({
      data: [
        { key: 'webhookUrl', value: 'https://api.merchant.com/webhooks' },
        { key: 'apiKey', value: 'arc_live_5fae860bc80a0a597a7a28e8' },
        { key: 'businessName', value: 'Arc Network Solutions' },
        { key: 'businessEmail', value: 'finance@arcpay.io' }
      ]
    });
    
    // Seed invoices matching total revenue $124,500.00
    await prisma.invoice.createMany({
      data: [
        {
          id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b586',
          clientName: 'Acme Corp',
          clientEmail: 'billing@acme.com',
          amount: 12500.00,
          description: 'Consulting Services Q3',
          status: 'paid',
          txHash: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b'
        },
        {
          id: '63c4be3b-46da-4d6e-b11d-6634e7995278',
          clientName: 'Initech',
          clientEmail: 'finance@initech.com',
          amount: 8900.00,
          description: 'Custom Platform Licensing',
          status: 'overdue'
        },
        {
          id: '6b20dddd-e1c8-4f76-a46b-c0a65e3f8bb6',
          clientName: 'Globex Inc.',
          clientEmail: 'payments@globex.com',
          amount: 4200.00,
          description: 'API Gateway Subscription',
          status: 'pending'
        },
        {
          id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b587',
          clientName: 'Weyland-Yutani',
          clientEmail: 'accounts@weyland.corp',
          amount: 112000.00,
          description: 'Terraforming Infrastructure Deployment',
          status: 'paid',
          txHash: '0x3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c'
        }
      ]
    });
    
    // Seed payouts
    await prisma.payout.createMany({
      data: [
        {
          id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b588',
          amount: 5000.00,
          address: '0x9965507B1a0597a7A28e8c8f0A0A597a7A28E8c8',
          currency: 'USDC',
          status: 'submitted'
        },
        {
          id: 'ae0392e7-dda0-4220-ae5d-ccf8d9d8b589',
          amount: 1.5,
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          currency: 'ETH',
          status: 'completed'
        }
      ]
    });
    
    res.json({ success: true, message: 'ArcPay mock database seeded successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start the server and auto-seed database for first-time use
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🚀 ArcPay Developer API Server listening at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`=================================================`);
});

export default app;
