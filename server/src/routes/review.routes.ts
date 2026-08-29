import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createReviewSchema } from '../schemas';

const router = Router();

// ── POST /api/reviews (Authenticated User) ────────────────────────────────────
router.post('/', requireAuth, validateBody(createReviewSchema), async (req: AuthRequest, res: Response) => {
  const { productId, orderId, authorName, rating, title, body } = req.body;

  try {
    const review = await (prisma as any).review.upsert({
      where: {
        productId_orderId: { productId: Number(productId), orderId }
      },
      update: {
        rating: Number(rating),
        title: title || '',
        body: body || '',
        authorName: authorName || req.user?.email || 'Anonymous',
      },
      create: {
        productId: Number(productId),
        orderId,
        authorName: authorName || req.user?.email || 'Anonymous',
        rating: Number(rating),
        title: title || '',
        body: body || '',
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Failed to save review:', error);
    res.status(500).json({ error: 'Failed to save review' });
  }
});

// ── GET /api/products/:id/reviews (Public) ───────────────────────────────────
router.get('/products/:id/reviews', async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.id);
    if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });

    const reviews = await (prisma as any).review.findMany({
      where: { productId },
      orderBy: { date: 'desc' }
    });

    res.json(reviews);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
