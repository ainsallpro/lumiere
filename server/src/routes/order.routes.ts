import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { checkoutLimiter } from '../middleware/rateLimit';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas';

const router = Router();

// ── POST /api/orders (Public Checkout) ────────────────────────────────────────
router.post('/', checkoutLimiter, validateBody(createOrderSchema), async (req: Request, res: Response) => {
  const { userId, customerName, email, phone, address, total, paymentMethod, items } = req.body;

  try {
    // 1. Validate product existence and inStock status
    const productIds = items.map((item: any) => item.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more selected products no longer exist.' });
    }

    const outOfStockProducts = dbProducts.filter(p => !p.inStock);
    if (outOfStockProducts.length > 0) {
      const names = outOfStockProducts.map(p => `"${p.name}"`).join(', ');
      return res.status(400).json({
        error: `Sorry, the following product(s) are currently out of stock: ${names}. Please remove them from your cart to proceed.`
      });
    }

    // 2. Generate unique order ID
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const orderId = `#LM-${today}-${rand}`;

    // 3. Create order with items in a database transaction
    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: userId || null,
        customerName: customerName.trim(),
        email: email.toLowerCase().trim(),
        address: address.trim(),
        total,
        status: 'Accepted',
        paymentMethod,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            qty: item.qty,
            color: item.color || 'Default'
          }))
        }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // 4. Update user's phone if registered and phone provided
    if (userId && phone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone }
      }).catch(() => {});
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Checkout failed. Please try again.' });
  }
});

// ── GET /api/orders (Admin) ───────────────────────────────────────────────────
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { date: 'desc' },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    const formatted = orders.map(o => ({
      id: o.id,
      customer: o.customerName,
      email: o.email,
      address: o.address,
      total: o.total,
      status: o.status,
      date: o.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      method: o.paymentMethod,
      items: o.items.reduce((sum, item) => sum + item.qty, 0),
      itemDetails: o.items.map(i => ({
        productName: i.product?.name || 'Unknown Product',
        qty: i.qty,
        color: i.color,
        img: i.product?.img || ''
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ── PUT /api/orders/:id/cancel (User or Admin) ────────────────────────────────
router.put('/:id/cancel', requireAuth, async (req: any, res: Response) => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Permission check: only order owner or admin can cancel
    if (!isAdmin && order.userId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to cancel this order.' });
    }

    // Status check: users can only cancel orders in 'Accepted' state
    if (!isAdmin && order.status !== 'Accepted') {
      return res.status(400).json({
        error: `Order cannot be cancelled because it is already in "${order.status}" status. Please contact customer support.`
      });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'Cancelled' }
    });

    res.json({ success: true, message: 'Order has been cancelled successfully.', order: updated });
  } catch (error) {
    console.error('Failed to cancel order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
