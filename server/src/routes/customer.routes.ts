import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// ── GET /api/customers (Admin) ────────────────────────────────────────────────
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      include: { orders: true }
    });

    const customers = users.map(u => {
      const orders = u.orders || [];
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
      return {
        name: u.name,
        email: u.email,
        phone: u.phone || '-',
        orders: orders.length,
        spent: totalSpent,
        joined: u.joinedAt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      };
    });

    // Guest customers from guest orders
    const guestOrders = await prisma.order.findMany({ where: { userId: null } });
    const guestMap = new Map();
    guestOrders.forEach(o => {
      if (!guestMap.has(o.email)) {
        guestMap.set(o.email, {
          name: o.customerName,
          email: o.email,
          phone: '-',
          orders: 0,
          spent: 0,
          joined: 'Guest'
        });
      }
      const g = guestMap.get(o.email);
      g.orders += 1;
      g.spent += o.total;
    });

    const allCustomers = [...customers, ...Array.from(guestMap.values())].sort((a, b) => b.spent - a.spent);
    res.json(allCustomers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// ── DELETE /api/customers/:email (Admin) ──────────────────────────────────────
router.delete('/:email', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { orders: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    if (user.orders.length > 0) {
      return res.status(400).json({
        error: 'Cannot delete customer because they have existing order history in the system.'
      });
    }

    await prisma.user.delete({ where: { email } });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
