import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'hidden');
      expect(result).toBe('base conditional');
    });

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, 'class2', null);
      expect(result).toBe('class1 class2');
    });

    it('should handle empty strings', () => {
      const result = cn('class1', '', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should merge tailwind classes correctly', () => {
      // When same property is defined twice, last one wins
      const result = cn('p-4', 'p-8');
      expect(result).toBe('p-8');
    });

    it('should handle array of classes', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toBe('class1 class2');
    });

    it('should handle object with boolean values', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toBe('class1 class3');
    });

    it('should handle mixed inputs', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        { conditional: true, hidden: false },
        undefined,
        'final'
      );
      expect(result).toContain('base');
      expect(result).toContain('array1');
      expect(result).toContain('array2');
      expect(result).toContain('conditional');
      expect(result).not.toContain('hidden');
      expect(result).toContain('final');
    });

    it('should handle no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle complex tailwind merging', () => {
      // Test tailwind-merge functionality
      const result = cn('bg-red-500 bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should handle responsive classes', () => {
      const result = cn('text-sm md:text-base lg:text-lg');
      expect(result).toBe('text-sm md:text-base lg:text-lg');
    });

    it('should handle hover and focus variants', () => {
      const result = cn('hover:bg-blue-500', 'focus:ring-2');
      expect(result).toBe('hover:bg-blue-500 focus:ring-2');
    });

    it('should merge conflicting padding classes', () => {
      const result = cn('px-2 py-4', 'p-6');
      // p-6 should win over both px-2 and py-4
      expect(result).toBe('p-6');
    });

    it('should handle negative margins', () => {
      const result = cn('-mt-4', 'mb-2');
      expect(result).toBe('-mt-4 mb-2');
    });

    it('should preserve important modifier', () => {
      const result = cn('text-sm', '!text-base');
      expect(result).toContain('!text-base');
    });
  });
});
