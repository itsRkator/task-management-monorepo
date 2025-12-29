import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    // Test with false condition (constant binary expression is intentional for testing)
    // eslint-disable-next-line no-constant-binary-expression
    const result = cn('foo', false && 'bar', 'baz');
    expect(result).toBe('foo baz');
  });

  it('should handle undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar');
    expect(result).toBe('foo bar');
  });

  it('should handle empty strings', () => {
    const result = cn('foo', '', 'bar');
    expect(result).toBe('foo bar');
  });

  it('should merge tailwind classes correctly', () => {
    const result = cn('px-2 py-1', 'px-4');
    expect(result).toContain('py-1');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz');
    expect(result).toBe('foo bar baz');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      foo: true,
      bar: false,
      baz: true,
    });
    expect(result).toBe('foo baz');
  });

  it('should handle mixed inputs', () => {
    const result = cn('foo', ['bar', 'baz'], { qux: true }, 'quux');
    expect(result).toContain('foo');
    expect(result).toContain('bar');
    expect(result).toContain('baz');
    expect(result).toContain('qux');
    expect(result).toContain('quux');
  });

  it('should handle no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle only falsy values', () => {
    const result = cn(false, null, undefined, '');
    expect(result).toBe('');
  });

  it('should merge conflicting tailwind utilities', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toContain('text-blue-500');
    expect(result).not.toContain('text-red-500');
  });

  it('should handle complex nested structures', () => {
    const result = cn(
      'base-class',
      [
        'array-class-1',
        'array-class-2',
        {
          'conditional-class': true,
          'false-class': false,
        },
      ],
      'string-class',
      {
        'object-class': true,
      }
    );
    expect(result).toContain('base-class');
    expect(result).toContain('array-class-1');
    expect(result).toContain('array-class-2');
    expect(result).toContain('conditional-class');
    expect(result).toContain('string-class');
    expect(result).toContain('object-class');
    expect(result).not.toContain('false-class');
  });
});

