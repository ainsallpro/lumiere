import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas';
import { saveBase64Image, deleteUploadedImage } from '../utils/imageUpload';

const router = Router();

// Helper to enrich product with frontend calculated fields
export function enrichProduct(p: any) {
  return {
    ...p,
    price: Math.round((p.originalPrice * (1 - p.discount / 100)) / 1000) * 1000,
    tabs: p.tabs && p.tabs.length ? p.tabs : ['featured'],
    hasTimer: p.id % 6 === 0,
    subcategory: p.subcategory || p.category,
  };
}

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(products.map(enrichProduct));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// ── POST /api/products (Admin) ────────────────────────────────────────────────
router.post('/', requireAuth, requireAdmin, validateBody(createProductSchema), async (req: Request, res: Response) => {
  try {
    const { name, category, subcategory, originalPrice, discount, rating, reviews, img, gallery, inStock, room, material, colors } = req.body;

    let finalImg = img || '';
    if (finalImg.startsWith('data:image/')) {
      finalImg = saveBase64Image(finalImg, 'product') || '';
    }

    const finalGallery: string[] = [];
    if (Array.isArray(gallery)) {
      gallery.forEach((gImg, idx) => {
        if (typeof gImg === 'string' && gImg.startsWith('data:image/')) {
          const uploaded = saveBase64Image(gImg, `gallery-${idx}`);
          if (uploaded) finalGallery.push(uploaded);
        } else if (typeof gImg === 'string' && gImg.trim()) {
          finalGallery.push(gImg);
        }
      });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        category,
        subcategory: subcategory || category,
        originalPrice,
        discount: discount || 0,
        rating: rating || 5,
        reviews: reviews || 0,
        img: finalImg,
        gallery: finalGallery,
        inStock: inStock !== undefined ? inStock : true,
        room: room || 'Living Room',
        material: material || 'Wood',
        colors: Array.isArray(colors) && colors.length ? colors : ['#000000'],
        tabs: ['Description', 'Details'],
      }
    });

    res.status(201).json(enrichProduct(newProduct));
  } catch (error: any) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
});

// ── PUT /api/products/:id (Admin) ─────────────────────────────────────────────
router.put('/:id', requireAuth, requireAdmin, validateBody(updateProductSchema), async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, category, subcategory, originalPrice, discount, inStock, room, material, colors, img, gallery } = req.body;
    const dataToUpdate: any = {};

    if (name !== undefined) dataToUpdate.name = name.trim();
    if (category !== undefined) dataToUpdate.category = category;
    if (subcategory !== undefined) dataToUpdate.subcategory = subcategory;
    if (originalPrice !== undefined) dataToUpdate.originalPrice = originalPrice;
    if (discount !== undefined) dataToUpdate.discount = discount;
    if (inStock !== undefined) dataToUpdate.inStock = inStock;
    if (room !== undefined) dataToUpdate.room = room;
    if (material !== undefined) dataToUpdate.material = material;
    if (colors !== undefined) dataToUpdate.colors = colors;

    if (img !== undefined) {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        dataToUpdate.img = saveBase64Image(img, `product-${id}`) || img;
        if (existing.img && existing.img !== dataToUpdate.img) {
          deleteUploadedImage(existing.img);
        }
      } else {
        dataToUpdate.img = img;
      }
    }

    if (gallery !== undefined && Array.isArray(gallery)) {
      const finalGallery: string[] = [];
      gallery.forEach((gImg, idx) => {
        if (typeof gImg === 'string' && gImg.startsWith('data:image/')) {
          const uploaded = saveBase64Image(gImg, `gallery-${id}-${idx}`);
          if (uploaded) finalGallery.push(uploaded);
        } else if (typeof gImg === 'string') {
          finalGallery.push(gImg);
        }
      });
      dataToUpdate.gallery = finalGallery;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate
    });

    res.json(enrichProduct(updated));
  } catch (error: any) {
    console.error('Failed to update product:', error);
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
});

// ── DELETE /api/products/:id (Admin) ──────────────────────────────────────────
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

    const orderItems = await prisma.orderItem.findMany({ where: { productId: id } });
    if (orderItems.length > 0) {
      return res.status(400).json({ error: 'Cannot delete product because it is linked to existing customer order history.' });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (existing) {
      deleteUploadedImage(existing.img);
      if (Array.isArray(existing.gallery)) {
        existing.gallery.forEach(g => deleteUploadedImage(g));
      }
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Failed to delete product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
