import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { requireAuth, AuthRequest, SALT_ROUNDS } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema, addressSchema } from '../schemas';

const router = Router();

// ── PUT /api/users/:id/profile ────────────────────────────────────────────────
router.put('/:id/profile', requireAuth, validateBody(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });
  if (req.user!.id !== id && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { name, phone } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { name: name.trim(), phone: phone || null }
    });
    res.json({ id: updated.id, name: updated.name, email: updated.email, phone: updated.phone || '', isAdmin: updated.isAdmin });
  } catch (error) {
    console.error('Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── PUT /api/users/:id/password (Change Password) ─────────────────────────────
router.put('/:id/password', requireAuth, validateBody(changePasswordSchema), async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID' });
  if (req.user!.id !== id && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ error: 'Akun ini terdaftar lewat Google Sign In dan tidak memiliki kata sandi lama.' });
    }

    let match = false;
    if (user.password.startsWith('$2')) {
      match = await bcrypt.compare(currentPassword, user.password);
    } else {
      match = user.password === currentPassword;
    }

    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword }
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Failed to update password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ── GET /api/users/:id/orders ─────────────────────────────────────────────────
router.get('/:id/orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
    if (req.user!.id !== userId && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

    const orders = await prisma.order.findMany({
      where: { userId },
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
      address: o.address,
      total: o.total,
      status: o.status,
      date: o.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      method: o.paymentMethod,
      items: o.items.map(item => ({
        product: item.product,
        qty: item.qty,
        color: item.color
      }))
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch user orders:', error);
    res.status(500).json({ error: 'Failed to fetch user orders' });
  }
});

// ── ADDRESSES (Item 3 in Database) ────────────────────────────────────────────

// GET /api/users/:id/addresses
router.get('/:id/addresses', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  if (req.user!.id !== userId && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const addresses = await (prisma as any).address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    });
    res.json(addresses);
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /api/users/:id/addresses
router.post('/:id/addresses', requireAuth, validateBody(addressSchema), async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  if (req.user!.id !== userId && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { name, phone, street, city, zip, country, isDefault } = req.body;

  try {
    // If setting as default, unset other default addresses for this user
    if (isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    // Check if this is the first address, make it default automatically
    const count = await (prisma as any).address.count({ where: { userId } });
    const shouldBeDefault = isDefault || count === 0;

    const newAddress = await (prisma as any).address.create({
      data: {
        userId,
        name: name.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        zip: zip.trim(),
        country: country || 'Indonesia',
        isDefault: shouldBeDefault,
      }
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Failed to create address:', error);
    res.status(500).json({ error: 'Failed to save address' });
  }
});

// PUT /api/users/:id/addresses/:addressId
router.put('/:id/addresses/:addressId', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const addressId = parseInt(req.params.addressId);
  if (isNaN(userId) || isNaN(addressId)) return res.status(400).json({ error: 'Invalid ID parameters' });
  if (req.user!.id !== userId && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const { name, phone, street, city, zip, country, isDefault } = req.body;

  try {
    if (isDefault) {
      await (prisma as any).address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone.trim();
    if (street !== undefined) dataToUpdate.street = street.trim();
    if (city !== undefined) dataToUpdate.city = city.trim();
    if (zip !== undefined) dataToUpdate.zip = zip.trim();
    if (country !== undefined) dataToUpdate.country = country;
    if (isDefault !== undefined) dataToUpdate.isDefault = isDefault;

    const updated = await (prisma as any).address.update({
      where: { id: addressId },
      data: dataToUpdate
    });

    res.json(updated);
  } catch (error) {
    console.error('Failed to update address:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// DELETE /api/users/:id/addresses/:addressId
router.delete('/:id/addresses/:addressId', requireAuth, async (req: AuthRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const addressId = parseInt(req.params.addressId);
  if (isNaN(userId) || isNaN(addressId)) return res.status(400).json({ error: 'Invalid ID parameters' });
  if (req.user!.id !== userId && !req.user!.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  try {
    await (prisma as any).address.delete({
      where: { id: addressId }
    });
    res.json({ success: true, message: 'Address removed successfully.' });
  } catch (error) {
    console.error('Failed to delete address:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
