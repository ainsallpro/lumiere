import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { SALT_ROUNDS } from './middleware/auth';
import { globalApiLimiter } from './middleware/rateLimit';

// Route imports
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';
import customerRoutes from './routes/customer.routes';
import reviewRoutes from './routes/review.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ── Security Middlewares ──────────────────────────────────────────────────────
app.disable('x-powered-by');

// Helmet for secure HTTP headers with cross-origin resource policy for uploaded media
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // handled by client/Vite in dev
}));

// CORS Configuration supporting Localhost, Dev server, and Local Network (Mobile Testing via Wi-Fi)
app.use(cors({
  origin: true, // Automatically reflect request origin (supports localhost, 192.168.x.x, mobile testing)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with safe size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiter across all API routes
app.use('/api', globalApiLimiter);

// Static files directory for uploads
const publicDir = path.join(process.cwd(), 'public');
const uploadsDir = path.join(publicDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(express.static(publicDir));

// ── Ensure Default Super Admin ────────────────────────────────────────────────
async function ensureAdmin() {
  try {
    const adminEmail = 'admin@lumiere.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: adminEmail,
          password: hashedPassword,
          isAdmin: true,
        }
      });
      console.log('Default admin user created (admin@lumiere.com / admin123)');
    } else if (existingAdmin.password && !existingAdmin.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(existingAdmin.password, SALT_ROUNDS);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { password: hashedPassword }
      });
      console.log('Admin password migrated to bcrypt hash.');
    }
  } catch (err) {
    console.error('Error ensuring default admin:', err);
  }
}
ensureAdmin();

// ── Mount Modular API Routes ──────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 Handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API route ${req.method} ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Lumière Backend server running on port ${port} (0.0.0.0)`);
});
