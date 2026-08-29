/**
 * Basic XSS sanitizer to escape or strip potentially dangerous HTML and script tags.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove <script>...</script>
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // remove <iframe>...</iframe>
    .replace(/javascript:[^"']*/gi, '') // remove javascript: URIs
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // remove inline event handlers like onclick=""
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Recursively sanitize all string properties in an object.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      // Don't sanitize password or base64 image data strings
      if (key.toLowerCase().includes('password') || key === 'img' || key === 'gallery') {
        cleaned[key] = (obj as any)[key];
      } else {
        cleaned[key] = sanitizeObject((obj as any)[key]);
      }
    }
    return cleaned;
  }
  return obj;
}
