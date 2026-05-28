import { Router } from 'express';
import { PrismaClient } from '../prisma/client/index.js';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

const DEFAULT_WEBHOOK_SECRET = process.env.WEBHOOK_SIGNING_SECRET || 'whsec_dev_default_key';

// GET /api/webhooks - List webhooks
router.get('/', async (req, res) => {
  try {
    const merchantId = req.merchantId || req.query.merchantId || 'default_merchant';
    
    const webhooks = await prisma.webhook.findMany({
      where: { merchantId },
      select: {
        id: true,
        url: true,
        events: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, webhooks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/webhooks - Create webhook subscription
router.post('/', async (req, res) => {
  try {
    const merchantId = req.merchantId || req.body.merchantId || 'default_merchant';
    const { url, events } = req.body;

    if (!url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'url and events (array) are required' 
      });
    }

    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhook.create({
      data: {
        merchantId,
        url,
        events,
        secret
      }
    });

    res.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
        active: webhook.active,
        createdAt: webhook.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/webhooks/:id - Remove webhook
router.delete('/:id', async (req, res) => {
  try {
    await prisma.webhook.delete({
      where: { id: req.params.id }
    });

    res.json({ success: true, message: 'Webhook deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Webhook dispatcher utility (shared)
export async function dispatchWebhookEvent(eventName, payload, merchantId = 'default_merchant') {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: { 
        merchantId, 
        active: true,
        events: { has: eventName }
      }
    });

    if (webhooks.length === 0) {
      console.log(`[Webhook] No active webhooks for event: ${eventName}`);
      return;
    }

    for (const webhook of webhooks) {
      const timestamp = new Date().toISOString();
      const body = JSON.stringify({
        event: eventName,
        timestamp,
        data: payload
      });

      // Create HMAC signature
      const hmac = crypto.createHmac('sha256', webhook.secret);
      hmac.update(body);
      const signature = hmac.digest('hex');

      console.log(`[Webhook] Dispatching "${eventName}" to ${webhook.url}`);

      // Fire-and-forget with retry logic (up to 3 attempts)
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-ArcPay-Event': eventName,
              'X-ArcPay-Signature': signature,
              'X-ArcPay-Timestamp': timestamp
            },
            body
          });

          if (response.ok) {
            console.log(`[Webhook] Successfully delivered to ${webhook.url} (attempt ${attempt})`);
            break;
          } else {
            console.warn(`[Webhook] Delivery to ${webhook.url} returned ${response.status} (attempt ${attempt})`);
            if (attempt < 3) {
              await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000)); // exponential backoff
            }
          }
        } catch (err) {
          console.error(`[Webhook] Delivery error to ${webhook.url} (attempt ${attempt}):`, err.message);
          if (attempt < 3) {
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }
  } catch (err) {
    console.error('[Webhook Dispatcher] Error:', err.message);
  }
}

export default router;
