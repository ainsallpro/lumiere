import fs from 'fs';
import path from 'path';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function saveBase64Image(dataString: string, prefix = 'img'): string | null {
  if (!dataString || typeof dataString !== 'string') return null;
  if (!dataString.startsWith('data:image/')) return dataString; // Already a URL or path

  // On Vercel / serverless environments or if filesystem is read-only, keep base64 directly
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return dataString;
  }

  try {
    const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return dataString;
    }

    const mimeType = matches[1].toLowerCase();
    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      return dataString;
    }

    const buffer = Buffer.from(matches[2], 'base64');
    if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image size exceeds 5MB limit.');
    }

    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const cleanPrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '');
    const fileName = `${cleanPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}.${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, buffer);
    return `http://localhost:5000/uploads/${fileName}`;
  } catch (err) {
    console.warn('Fallback to storing base64 image:', err);
    return dataString;
  }
}

export function deleteUploadedImage(imageUrl?: string | null) {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  if (!imageUrl.includes('/uploads/')) return;

  try {
    const fileName = imageUrl.split('/uploads/')[1];
    if (!fileName) return;

    const publicDir = path.join(process.cwd(), 'public');
    const filePath = path.join(publicDir, 'uploads', fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up old image file: ${fileName}`);
    }
  } catch (err) {
    console.warn('Failed to delete old image file:', err);
  }
}
