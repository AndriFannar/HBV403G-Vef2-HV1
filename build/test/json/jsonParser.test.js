import { parseJson } from '../../lib/json/jsonParser.js';
import { expect, test } from 'vitest';
const validSchema = {
    type: 'object',
    required: true,
    properties: {
        foo: { type: 'string', required: true },
        bar: { type: 'number', required: false },
    },
};
const validArraySchema = {
    type: 'array',
    required: true,
    items: {
        type: 'object',
        required: true,
        properties: {
            foo: { type: 'string', required: true },
            bar: { type: 'number', required: false },
        },
    },
};
test('Return null if JSON is invalid', () => {
    const result = parseJson('{"foo": "bar"', null, false);
    expect(result).toBeNull();
});
test('Return null if JSON is invalid even with valid schema', () => {
    const result = parseJson('{"foo": "bar"', validSchema, true);
    expect(result).toBeNull();
});
test('Return null if required JSON key does not fit schema', () => {
    const result = parseJson('{"food": "bar"}', validSchema, true);
    expect(result).toBeNull();
});
test('Return null if required JSON value does not fit schema', () => {
    const result = parseJson('{"foo": 123}', validSchema, true);
    expect(result).toBeNull();
});
test('Return JSON if valid without verification', () => {
    const result = parseJson('{"foo": "bar"}', null, false);
    expect(result).toEqual({ foo: 'bar' });
});
test('Return JSON if valid with verification', () => {
    const result = parseJson('{"foo": "bar"}', validSchema, true);
    expect(result).toEqual({ foo: 'bar' });
});
test('Return JSON without invalid entry', () => {
    const result = parseJson('{"foo": "bar", "food": "bars"}', validSchema, true);
    expect(result).toEqual({ foo: 'bar' });
});
test('Return null if JSON contains only optional entry', () => {
    const result = parseJson('{"bar": 123}', validSchema, true);
    expect(result).toBeNull();
});
test('Return JSON with optional entry', () => {
    const result = parseJson('{"foo": "bar", "bar": 123}', validSchema, true);
    expect(result).toEqual({ foo: 'bar', bar: 123 });
});
test('Return JSON array with array schema', () => {
    const result = parseJson('[{"foo": "bar", "bar": 123}, {"foo": "foo", "bar": 456}]', validArraySchema, true);
    expect(result).toEqual([
        {
            bar: 123,
            foo: 'bar',
        },
        {
            bar: 456,
            foo: 'foo',
        },
    ]);
});
