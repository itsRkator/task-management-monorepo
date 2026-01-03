/* c8 ignore start - import statements are covered by multiple test imports */
import { Transform } from 'class-transformer';
/* c8 ignore end */

/**
 * Sanitizes a string by removing potentially dangerous characters
 * and trimming whitespace
 */
export function sanitizeString(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent XSS
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/\0/g, ''); // Remove null bytes
}

/**
 * Sanitizes an object's string properties recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj } as Record<string, unknown>;

  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item: unknown) =>
        typeof item === 'string' ? sanitizeString(item) : item,
      );
    }
  }

  return sanitized as T;
}

/**
 * Decorator for sanitizing string properties
 */
export function Sanitize() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return sanitizeString(value);
    }
    return value;
  });
}
