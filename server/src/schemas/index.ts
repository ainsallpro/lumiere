import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const orderItemSchema = z.object({
  productId: z.number().int().positive('Invalid product ID'),
  qty: z.number().int().min(1, 'Quantity must be at least 1'),
  color: z.string().default('Default'),
});

export const createOrderSchema = z.object({
  userId: z.number().int().positive().optional().nullable(),
  customerName: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default(''),
  address: z.string().min(5, 'Delivery address is required'),
  total: z.number().int().min(0, 'Total cannot be negative'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['Accepted', 'Processing', 'On the Way', 'Delivered', 'Cancelled']),
});

export const addressSchema = z.object({
  name: z.string().min(2, 'Recipient name is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  zip: z.string().min(3, 'Postal code is required'),
  country: z.string().default('Indonesia'),
  isDefault: z.boolean().optional().default(false),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(2, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  originalPrice: z.coerce.number().int().positive('Price must be greater than 0'),
  discount: z.coerce.number().int().min(0).max(100).default(0),
  rating: z.coerce.number().min(0).max(5).default(5),
  reviews: z.coerce.number().int().min(0).default(0),
  img: z.string().optional().default(''),
  gallery: z.array(z.string()).optional().default([]),
  inStock: z.coerce.boolean().default(true),
  room: z.string().default('Living Room'),
  material: z.string().default('Wood'),
  colors: z.array(z.string()).optional().default(['#000000']),
});

export const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional().nullable(),
  originalPrice: z.coerce.number().int().positive().optional(),
  discount: z.coerce.number().int().min(0).max(100).optional(),
  inStock: z.coerce.boolean().optional(),
  room: z.string().optional(),
  material: z.string().optional(),
  colors: z.array(z.string()).optional(),
  img: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

export const createReviewSchema = z.object({
  productId: z.number().int().positive(),
  orderId: z.string().min(1),
  authorName: z.string().min(1).default('Anonymous'),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional().default(''),
  body: z.string().max(1000).optional().default(''),
});
