import { sanitizeString, sanitizeObject, Sanitize } from './sanitize.util';
import { plainToInstance } from 'class-transformer';

describe('sanitize.util', () => {
  describe('sanitizeString', () => {
    it('should return empty string for null input', () => {
      expect(sanitizeString(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(sanitizeString(undefined)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  test  ')).toBe('test');
    });

    it('should remove < and > characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script',
      );
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeString('javascript:alert("xss")')).toBe('alert("xss")');
    });

    it('should remove javascript: protocol case-insensitively', () => {
      expect(sanitizeString('JAVASCRIPT:alert("xss")')).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      expect(sanitizeString('onclick=alert("xss")')).toBe('alert("xss")');
    });

    it('should remove event handlers case-insensitively', () => {
      expect(sanitizeString('ONCLICK=alert("xss")')).toBe('alert("xss")');
    });

    it('should remove null bytes', () => {
      expect(sanitizeString('test\0string')).toBe('teststring');
    });

    it('should handle multiple dangerous patterns', () => {
      expect(
        sanitizeString('<script>onclick=javascript:alert("xss")</script>'),
      ).toBe('scriptalert("xss")/script');
    });

    it('should preserve safe strings', () => {
      expect(sanitizeString('Hello World')).toBe('Hello World');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize string properties', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
      };
      const result = sanitizeObject(input);

      expect(result.name).toBe('scriptalert("xss")/script');
      expect(result.email).toBe('test@example.com');
    });

    it('should sanitize nested objects', () => {
      const input = {
        user: {
          name: '<script>alert("xss")</script>',
          profile: {
            bio: 'onclick=alert("xss")',
          },
        },
      };
      const result = sanitizeObject(input);

      expect(result.user.name).toBe('scriptalert("xss")/script');
      expect(result.user.profile.bio).toBe('alert("xss")');
    });

    it('should sanitize array of strings', () => {
      const input = {
        tags: ['<script>', 'safe', 'onclick=alert("xss")'],
      };
      const result = sanitizeObject(input);

      expect(result.tags).toEqual(['script', 'safe', 'alert("xss")']);
    });

    it('should preserve non-string values in arrays', () => {
      const input = {
        numbers: [1, 2, 3],
        mixed: ['string', 123, true],
      };
      const result = sanitizeObject(input);

      expect(result.numbers).toEqual([1, 2, 3]);
      expect(result.mixed).toEqual(['string', 123, true]);
    });

    it('should preserve non-string properties', () => {
      const input = {
        name: 'test',
        age: 25,
        active: true,
        data: null,
      };
      const result = sanitizeObject(input);

      expect(result.name).toBe('test');
      expect(result.age).toBe(25);
      expect(result.active).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should not modify original object', () => {
      const input = {
        name: '<script>alert("xss")</script>',
      };
      const originalName = input.name;
      sanitizeObject(input);

      expect(input.name).toBe(originalName);
    });

    it('should handle empty object', () => {
      const input = {};
      const result = sanitizeObject(input);

      expect(result).toEqual({});
    });

    it('should handle object with only non-string properties', () => {
      const input = {
        number: 123,
        boolean: true,
        nullValue: null,
      };
      const result = sanitizeObject(input);

      expect(result).toEqual(input);
    });
  });

  describe('Sanitize decorator', () => {
    it('should return a Transform decorator', () => {
      const decorator = Sanitize();
      expect(decorator).toBeDefined();
      expect(typeof decorator).toBe('function');
    });

    it('should sanitize string values when transforming plain object', () => {
      class TestDto {
        @Sanitize()
        name: string = '';
      }

      const plain = { name: '<script>alert("xss")</script>' };
      const instance = plainToInstance(TestDto, plain);

      expect(instance.name).toBe('scriptalert("xss")/script');
    });

    it('should return non-string values as-is when transforming', () => {
      class TestDto {
        @Sanitize()
        value: unknown;
      }

      // Test with number
      const plain1 = { value: 123 };
      const instance1 = plainToInstance(TestDto, plain1);
      expect(instance1.value).toBe(123);

      // Test with object
      const obj = { test: 'value' };
      const plain2 = { value: obj };
      const instance2 = plainToInstance(TestDto, plain2);
      expect(instance2.value).toEqual(obj);
    });

    it('should be usable as a decorator', () => {
      const decorator = Sanitize();
      expect(decorator).toBeInstanceOf(Function);
    });
  });
});
