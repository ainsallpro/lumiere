import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sanitizeObject } from '../utils/sanitize';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = sanitizeObject(parsed);
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const issues = (error as any).issues || (error as any).errors || [];
        const errorMessages = issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json({ error: errorMessages || 'Validation error', details: issues });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
};
