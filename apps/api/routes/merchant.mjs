import { Router } from 'express';
import { PrismaClient } from '../prisma/client/index.js';

const prisma = new PrismaClient();
const router = Router();

// GET /api/merchant/profile - Fetch merchant profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.merchantId || req.query.userId || 'default_merchant';
    
    let profile = await prisma.merchantProfile.findUnique({
      where: { userId }
    });

    // Return empty object if no profile exists yet
    res.json({ 
      success: true, 
      profile: profile || {
        userId,
        businessName: '',
        logoUrl: null,
        email: null,
        address: null,
        taxId: null,
        website: null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/merchant/profile - Create or update merchant profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.merchantId || req.body.userId || 'default_merchant';
    const { businessName, logoUrl, email, address, taxId, website } = req.body;

    const profile = await prisma.merchantProfile.upsert({
      where: { userId },
      update: {
        businessName: businessName || undefined,
        logoUrl: logoUrl || undefined,
        email: email || undefined,
        address: address || undefined,
        taxId: taxId || undefined,
        website: website || undefined
      },
      create: {
        userId,
        businessName: businessName || 'My Business',
        logoUrl: logoUrl || null,
        email: email || null,
        address: address || null,
        taxId: taxId || null,
        website: website || null
      }
    });

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
