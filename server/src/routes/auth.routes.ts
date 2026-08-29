import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../prisma';
import { signToken, SALT_ROUNDS } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas';
import { sendPasswordResetEmail } from '../utils/mailer';

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/register', authLimiter, validateBody(registerSchema), async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword, phone }
    });

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '', isAdmin: user.isAdmin }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

router.post('/login', authLimiter, validateBody(loginSchema), async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.password) {
      return res.status(400).json({ error: 'Akun ini terdaftar lewat Google Sign In. Silakan masuk menggunakan Google.' });
    }

    let passwordMatch = false;
    if (user.password.startsWith('$2')) {
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Legacy plaintext migration
      passwordMatch = user.password === password;
      if (passwordMatch) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone || '', isAdmin: user.isAdmin }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

router.post('/google', authLimiter, async (req: Request, res: Response) => {
  const { credential, accessToken } = req.body;
  if (!credential && !accessToken) {
    return res.status(400).json({ error: 'Google credential or access token is required.' });
  }

  try {
    let email: string = '';
    let name: string = '';
    let googleId: string = '';

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID || undefined,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ error: 'Invalid Google token payload.' });
      }
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || email.split('@')[0];
      googleId = payload.sub;
    } else if (accessToken) {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userRes.ok) {
        throw new Error('Failed to verify Google access token');
      }
      const userProfile: any = await userRes.json();
      if (!userProfile.email) {
        return res.status(400).json({ error: 'Invalid Google user profile.' });
      }
      email = userProfile.email.toLowerCase().trim();
      name = userProfile.name || userProfile.given_name || email.split('@')[0];
      googleId = userProfile.sub;
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          googleId,
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Google authentication failed. Please try again.' });
  }
});

// ── POST /api/forgot-password ────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, validateBody(forgotPasswordSchema), async (req: Request, res: Response) => {
  const email = req.body.email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with a generic success message to prevent user enumeration attacks
    if (!user) {
      return res.json({
        message: 'Jika email Anda terdaftar, instruksi reset kata sandi telah dikirim ke email tersebut.'
      });
    }

    // Generate cryptographic random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      }
    });

    const clientUrl = process.env.CLIENT_URL || (req.headers.origin as string) || 'http://localhost:8443';
    const resetUrl = `${clientUrl}/#reset-password?token=${resetToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    res.json({
      message: 'Instruksi reset kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Gagal memproses permintaan reset kata sandi. Silakan coba lagi.' });
  }
});

// ── POST /api/reset-password ─────────────────────────────────────────────────
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Tautan reset kata sandi tidak valid atau telah kadaluarsa (melebihi 15 menit). Silakan minta tautan baru.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      }
    });

    res.json({
      message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Gagal mengatur ulang kata sandi. Silakan coba lagi.' });
  }
});

export default router;

