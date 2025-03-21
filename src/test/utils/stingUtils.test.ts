import * as stringUtils from '../../lib/utils/stringUtils.js';
import { expect, test } from 'vitest';

test('Escape HTML special characters', () => {
  const input = '<script>alert("Hello")</script>';
  const expected = '&lt;script&gt;alert(&quot;Hello&quot;)&lt;/script&gt;';
  expect(stringUtils.escapeHtml(input)).toBe(expected);
});
