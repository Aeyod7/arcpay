import { Router } from 'express';
import { PrismaClient } from '../prisma/client/index.js';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = Router();

// Generate a cryptographically secure API key
function generateApiKey() {
  const prefix = 'apk_live_';
  const randomBytes = crypto.randomBytes(24).toString('hex');
  return prefix + randomBytes;
}

// GET /api/api-keys - List all API keys for merchant
router.get('/', async (req, res) => {
  try {
    const merchantId = req.merchantId || req.query.merchantId || 'default_merchant';
    
    const keys = await prisma.apiKey.findMany({
      where: { merchantId },
      select: {
        id: true,
        keyPrefix: true,
        label: true,
        createdAt: true,
        lastUsedAt: true,
        active: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/api-keys - Create a new API key
router.post('/', async (req, res) => {
  try {
    const merchantId = req.merchantId || req.body.merchantId || 'default_merchant';
    const { label } = req.body;

    if (!label) {
      return res.status(400).json({ success: false, error: 'Label is required' });
    }

    const rawKey = generateApiKey();
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyPrefix = rawKey.substring(0, 16) + '...';

    const apiKey = await prisma.apiKey.create({
      data: {
        merchantId,
        keyHash,
        keyPrefix,
        label
      }
    });

    // Return the full key only on creation
    res.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        key: rawKey, // Only shown once!
        keyPrefix: apiKey.keyPrefix,
        label: apiKey.label,
        createdAt: apiKey.createdAt
      },
      message: 'Save this key now. It will not be shown again.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/api-keys/:id - Revoke an API key
router.delete('/:id', async (req, res) => {
  try {
    await prisma.apiKey.update({
      where: { id: req.params.id },
      data: { active: false }
    });

    res.json({ success: true, message: 'API key revoked.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
