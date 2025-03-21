/**
 * @file slug.test.ts
 * @description Tests for the slug.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies slug.ts, vitest
 */

import { SlugSchema } from '../../entities/slug.js';
import { describe, it, expect } from 'vitest';

describe('SlugSchema', () => {
  it('Should parse a valid slug', () => {
    const input = 'valid-slug-123';
    const result = SlugSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(input);
    }
  });

  it('Should fail if the slug is too short', () => {
    const input = 'ab';
    const result = SlugSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 3 letters');
    }
  });

  it('Should fail if the slug is too long', () => {
    // eslint-disable-next-line no-magic-numbers
    const input = 'a'.repeat(551);
    const result = SlugSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at most 550 letters');
    }
  });

  it('Should fail if the slug contains invalid characters', () => {
    const input = 'Invalid_Slug!';
    const result = SlugSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain(
        'Slug must only contain lowercase letters, numbers, and hyphens'
      );
    }
  });
});
