import { PrismaClient } from '../prisma/client/index.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export async function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-arcpay-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ 
      success: false, 
      error: 'Missing API key. Provide it via x-arcpay-api-key header.' 
    });
  }

  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    const keyRecord = await prisma.apiKey.findUnique({
      where: { keyHash }
    });

    if (!keyRecord || !keyRecord.active) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or revoked API key.' 
      });
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() }
    });

    req.merchantId = keyRecord.merchantId;
    next();
  } catch (err) {
    console.error('[API Key Auth] Error:', err.message);
    return res.status(500).json({ success: false, error: 'Authentication error.' });
  }
}
