/**
 * @file jsonUtils.js
 * @description Utility functions for working with JSON data.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date Febuary 2, 2025
 */

/**
 * Finds all values in an object or array with a given key.
 *
 * @param data - JSON data to search.
 * @param key - Key to search for.
 * @returns An array of values found.
 */
export function findValuesByKey(data: unknown, key: string): unknown[] {
  let values: unknown[] = [];

  if (Array.isArray(data)) {
    data.forEach(item => {
      values = values.concat(findValuesByKey(item, key));
    });
  } else if (data !== null && typeof data === 'object') {
    Object.keys(data).forEach(k => {
      if (k === key) {
        values.push((data as { [key: string]: unknown })[k]);
      }
      values = values.concat(
        findValuesByKey((data as { [key: string]: unknown })[k], key)
      );
    });
  }

  return values;
}
