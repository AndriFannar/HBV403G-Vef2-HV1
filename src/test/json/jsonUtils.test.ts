import * as jsonUtils from '../../lib/json/jsonUtils.js';
import { expect, test } from 'vitest';

const data = {
  name: 'Jerry',
  age: 30,
  friends: [
    {
      name: 'George',
      age: 31,
    },
    {
      name: 'Elaine',
      age: 29,
    },
  ],
};

test('Find values by key', () => {
  const values = jsonUtils.findValuesByKey(data, 'name');
  expect(values).toEqual(['Jerry', 'George', 'Elaine']);
});

test('Find values by non-existent key', () => {
  const values = jsonUtils.findValuesByKey(data, 'nonExistent');
  expect(values).toEqual([]);
});
