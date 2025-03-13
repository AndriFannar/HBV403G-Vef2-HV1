/**
 * @file categoryValidator.test.ts
 * @description Tests for the categoryValidator.ts file.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 6, 2025
 * @dependencies categoryValidator.ts, vitest
 */

import { validateAndSanitizeBaseCategory } from '../../../lib/validation/categoryValidator.js';
import { describe, it, expect } from 'vitest';

describe('validateAndSanitizeBaseCategory', () => {
  it('Should validate and sanitize a valid category', async () => {
    const input = { name: '  Test Category  ' };
    const result = await validateAndSanitizeBaseCategory(input);

    expect(result).toHaveProperty('data');
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe('Test Category');
    expect(result.error).toBeUndefined();
  });

  it('should return an error when category data is invalid', async () => {
    const input = { name: '' };
    const result = await validateAndSanitizeBaseCategory(input);

    expect(result).toHaveProperty('error');
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});
