import { describe, expect, it } from 'vitest';

import {
  optionalBoolean,
  optionalInteger,
  optionalNonNegativeInteger,
  optionalString,
  optionalStringArray,
  requiredRecord,
  requiredString,
  requiredStringArray,
  ToolArgumentError,
} from './args';

/**
 * These readers see model-generated JSON, so the interesting cases are the
 * sloppy ones: a number sent as a string, an empty array, a null where a field
 * was optional. Each has to produce one clear message the model can act on.
 */
describe('argument readers', () => {
  it('requires a non-empty string', () => {
    expect(requiredString({ uid: 'a' }, 'uid')).toBe('a');
    expect(() => requiredString({}, 'uid')).toThrow(ToolArgumentError);
    expect(() => requiredString({ uid: '  ' }, 'uid')).toThrow(/non-empty string/);
    expect(() => requiredString({ uid: 7 }, 'uid')).toThrow(ToolArgumentError);
  });

  it('treats an absent, null or empty optional string as undefined', () => {
    expect(optionalString({}, 'x')).toBeUndefined();
    expect(optionalString({ x: null }, 'x')).toBeUndefined();
    expect(optionalString({ x: '' }, 'x')).toBeUndefined();
    expect(optionalString({ x: 'v' }, 'x')).toBe('v');
    expect(() => optionalString({ x: 1 }, 'x')).toThrow(ToolArgumentError);
  });

  it('requires a non-empty array of non-empty strings', () => {
    expect(requiredStringArray({ tags: ['a', 'b'] }, 'tags')).toEqual(['a', 'b']);
    expect(() => requiredStringArray({ tags: [] }, 'tags')).toThrow(ToolArgumentError);
    expect(() => requiredStringArray({ tags: 'a' }, 'tags')).toThrow(ToolArgumentError);
    expect(() => requiredStringArray({ tags: ['a', 2] }, 'tags')).toThrow(/tags\[1\]/);
  });

  it('passes an absent optional array through as undefined', () => {
    expect(optionalStringArray({}, 'tags')).toBeUndefined();
    expect(optionalStringArray({ tags: ['a'] }, 'tags')).toEqual(['a']);
  });

  it('coerces and caps optional integers', () => {
    expect(optionalInteger({}, 'n', 20)).toBe(20);
    expect(optionalInteger({ n: '30' }, 'n', 20)).toBe(30);
    expect(optionalInteger({ n: 7.9 }, 'n', 20)).toBe(7);
    expect(optionalInteger({ n: 1000 }, 'n', 20, 100)).toBe(100);
    expect(() => optionalInteger({ n: 0 }, 'n', 20)).toThrow(/positive number/);
    expect(() => optionalInteger({ n: 'many' }, 'n', 20)).toThrow(ToolArgumentError);
  });

  // Page indices are zero-based, so the positive-only reader would reject the
  // first page — hence a separate reader rather than an off-by-one workaround.
  it('accepts zero for a non-negative integer', () => {
    expect(optionalNonNegativeInteger({ page: 0 }, 'page', 5)).toBe(0);
    expect(optionalNonNegativeInteger({}, 'page', 5)).toBe(5);
    expect(() => optionalNonNegativeInteger({ page: -1 }, 'page', 5)).toThrow(ToolArgumentError);
  });

  it('requires a plain object, not an array', () => {
    expect(requiredRecord({ p: { a: 1 } }, 'p')).toEqual({ a: 1 });
    expect(() => requiredRecord({ p: [1] }, 'p')).toThrow(ToolArgumentError);
    expect(() => requiredRecord({ p: null }, 'p')).toThrow(ToolArgumentError);
  });

  it('accepts the string forms of booleans that models tend to emit', () => {
    expect(optionalBoolean({}, 'b', true)).toBe(true);
    expect(optionalBoolean({ b: 'false' }, 'b', true)).toBe(false);
    expect(optionalBoolean({ b: 'true' }, 'b', false)).toBe(true);
    expect(optionalBoolean({ b: false }, 'b', true)).toBe(false);
    expect(() => optionalBoolean({ b: 'maybe' }, 'b', true)).toThrow(ToolArgumentError);
  });
});
