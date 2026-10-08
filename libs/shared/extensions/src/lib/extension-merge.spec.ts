import { mergeObjects as upstreamMergeObjects } from '@alfresco/adf-extensions';

import { mergeObjects } from './extension-merge';

/**
 * Parity with `mergeObjects` from `@alfresco/adf-extensions@9.0.0`.
 *
 * Every expected value in {@link PARITY} is the output upstream produced for those layers, and
 * the table runs against upstream and against ours, so a case that fails for upstream is a wrong
 * expectation rather than a divergence. The departures are a separate block that asserts what
 * upstream did and what we do instead.
 *
 * Inputs are deep-frozen, so a merge that writes to a layer throws rather than passing.
 */
const IMPLEMENTATIONS = [
  { source: '@alfresco/adf-extensions', merge: upstreamMergeObjects as typeof mergeObjects },
  { source: 'ours', merge: mergeObjects },
];

type Layers = readonly Record<string, unknown>[];

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Reflect.ownKeys(value))
      deepFreeze((value as Record<PropertyKey, unknown>)[key]);
  }
  return value;
}

/** Keys in iteration order, all the way down — `toStrictEqual` ignores key order. */
function keyOrder(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keyOrder);
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([key, inner]) => [key, keyOrder(inner)]);
  }
  return null;
}

function expectSame(actual: unknown, expected: unknown): void {
  expect(actual).toStrictEqual(expected);
  expect(keyOrder(actual)).toEqual(keyOrder(expected));
}

/** An array with a hole at index 0, which JSON cannot express and a code layer can. */
function holeThen(...values: unknown[]): unknown[] {
  const sparse: unknown[] = [];
  values.forEach((value, index) => (sparse[index + 1] = value));
  return sparse;
}

const PARITY: readonly (readonly [string, Layers, Record<string, unknown>])[] = [
  // Scalars and plain objects
  ['a later scalar wins', [{ a: 1, b: 'x' }, { a: 2 }], { a: 2, b: 'x' }],
  ['keys keep first-seen order', [{ b: 1 }, { a: 1, b: 2 }], { b: 2, a: 1 }],
  ['three layers fold left to right', [{ a: 1 }, { a: 2, b: 1 }, { b: 2 }], { a: 2, b: 2 }],
  [
    'nested objects merge recursively',
    [{ o: { x: 1, y: { p: 1 } } }, { o: { y: { q: 2 }, z: 3 } }],
    { o: { x: 1, y: { p: 1, q: 2 }, z: 3 } },
  ],
  ['no layers', [], {}],
  ['a later undefined replaces a scalar', [{ a: 1 }, { a: undefined }], { a: undefined }],
  ['a later null replaces a scalar', [{ a: 1 }, { a: null }], { a: null }],
  ['a later object replaces a scalar', [{ o: 5 }, { o: { k: 1 } }], { o: { k: 1 } }],
  ['a later array replaces a scalar', [{ a: 'x' }, { a: [1] }], { a: [1] }],

  // `$` keys and `.$replace`
  [
    'one layer loses its top-level $ keys and keeps nested ones',
    [{ $name: 'x', a: { $keep: 1 } }],
    { a: { $keep: 1 } },
  ],
  [
    '$ keys are skipped wherever a merge happens',
    [
      { $name: 'a', o: { $x: 1, k: 1 } },
      { $name: 'b', o: { $y: 2, k: 2 } },
    ],
    { o: { k: 2 } },
  ],
  [
    '.$replace replaces instead of merging',
    [
      { list: [{ id: 'a' }], o: { x: 1 } },
      { 'list.$replace': [{ id: 'b' }], 'o.$replace': { y: 2 } },
    ],
    { list: [{ id: 'b' }], o: { y: 2 } },
  ],
  ['.$replace on a key not yet present', [{}, { 'n.$replace': 1 }], { n: 1 }],
  [
    'a later plain key merges into a replaced value',
    [{ 'o.$replace': { x: 1 } }, { o: { y: 2 } }],
    { o: { x: 1, y: 2 } },
  ],
  [
    '.$replace inside a nested merge replaces an object with a scalar',
    [
      { overrides: { 'app.x': { rule: { type: 'core.every', parameters: ['a'] } } } },
      { overrides: { 'app.x': { 'rule.$replace': 'app.rules.y' } } },
    ],
    { overrides: { 'app.x': { rule: 'app.rules.y' } } },
  ],
  ['a $ key with the suffix is still skipped', [{}, { '$meta.$replace': 1 }], {}],
  [
    'the suffix twice: only the first is removed, so a different source key is read',
    [{}, { 'a.$replace.b.$replace': 1 }],
    { 'a.b.$replace': undefined },
  ],

  // Arrays
  [
    'arrays merge by id: patch one, append a new one',
    [
      {
        list: [
          { id: 'a', v: 1 },
          { id: 'b', v: 1 },
        ],
      },
      {
        list: [
          { id: 'b', v: 2 },
          { id: 'c', v: 1 },
        ],
      },
    ],
    {
      list: [
        { id: 'a', v: 1 },
        { id: 'b', v: 2 },
        { id: 'c', v: 1 },
      ],
    },
  ],
  [
    'entries with an id come first, then the earlier entries without one, then the later unmatched',
    [
      { list: ['x', { id: 'a' }, null, { name: 'n' }] },
      { list: [{ id: 'a', v: 1 }, 'y', { id: 'z' }] },
    ],
    { list: [{ id: 'a', v: 1 }, 'x', null, { name: 'n' }, 'y', { id: 'z' }] },
  ],
  [
    'integer-like ids sort ahead of the rest, ascending',
    [{ list: [{ id: 'b' }, { id: '10' }, { id: '2' }, { id: 'a' }] }, { list: [] }],
    { list: [{ id: '2' }, { id: '10' }, { id: 'b' }, { id: 'a' }] },
  ],
  [
    'a numeric id and its string form are one id',
    [{ list: [{ id: 1, v: 'n' }] }, { list: [{ id: '1', w: 's' }] }],
    { list: [{ id: '1', v: 'n', w: 's' }] },
  ],
  [
    'an undefined id is the id "undefined"',
    [{ list: [{ id: undefined, w: 1 }] }, { list: [{ id: 'undefined', w: 2 }] }],
    { list: [{ id: 'undefined', w: 2 }] },
  ],
  [
    'a null id is still an id, so its entry comes before those without one',
    [{ list: ['plain', { id: null }] }, { list: [] }],
    { list: [{ id: null }, 'plain'] },
  ],
  [
    'duplicate earlier ids collapse to the last, in the first one’s place',
    [{ list: [{ id: 'a', v: 1 }, { id: 'b' }, { id: 'a', v: 2 }] }, { list: [] }],
    { list: [{ id: 'a', v: 2 }, { id: 'b' }] },
  ],
  [
    'duplicate later ids both merge when the earlier array had the id',
    [
      { list: [{ id: 'a', v: 0 }] },
      {
        list: [
          { id: 'a', x: 1 },
          { id: 'a', y: 2 },
        ],
      },
    ],
    { list: [{ id: 'a', v: 0, x: 1, y: 2 }] },
  ],
  [
    'duplicate later ids are both appended when it did not',
    [
      { list: [] },
      {
        list: [
          { id: 'n', x: 1 },
          { id: 'n', y: 2 },
        ],
      },
    ],
    {
      list: [
        { id: 'n', x: 1 },
        { id: 'n', y: 2 },
      ],
    },
  ],
  [
    'an array in one layer only is taken whole, duplicates included',
    [{ list: [{ id: 'a' }, { id: 'a' }] }],
    { list: [{ id: 'a' }, { id: 'a' }] },
  ],
  [
    'merged entries lose their $ keys, untouched ones keep them',
    [
      {
        list: [
          { id: 'a', $k: 1 },
          { id: 'b', $k: 1 },
        ],
      },
      { list: [{ id: 'a', v: 1 }] },
    ],
    {
      list: [
        { id: 'a', v: 1 },
        { id: 'b', $k: 1 },
      ],
    },
  ],
  [
    'a later non-array is appended to an earlier array',
    [{ list: [1] }, { list: 2 }, { list: null }, { list: { id: 'x' } }],
    { list: [1, 2, null, { id: 'x' }] },
  ],
  [
    'holes in a sparse array are skipped',
    [{ list: holeThen({ id: 'a' }) }, { list: holeThen('x') }],
    { list: [{ id: 'a' }, 'x'] },
  ],

  // A scalar or an array over an object
  [
    'a later number or boolean leaves an earlier object as it was',
    [{ o: { k: 1 } }, { o: 5 }, { o: true }],
    { o: { k: 1 } },
  ],
  [
    'a later string is spread into an earlier object by index',
    [{ o: { k: 1 } }, { o: 'ab' }],
    { o: { 0: 'a', 1: 'b', k: 1 } },
  ],
  [
    'a later array is spread into an earlier object by index',
    [{ o: { k: 1 } }, { o: ['x', 'y'] }],
    { o: { 0: 'x', 1: 'y', k: 1 } },
  ],
];

describe.each(IMPLEMENTATIONS)('mergeObjects ($source)', ({ merge }) => {
  it.each(PARITY)('%s', (_label, layers, expected) => {
    expectSame(merge(...deepFreeze(layers)), expected);
  });

  it('returns a new object and takes a value seen in one layer by reference', () => {
    const shared = { k: 1 };
    const layer = deepFreeze({ o: shared });
    const merged = merge(layer);
    expect(merged).not.toBe(layer);
    expect(merged['o']).toBe(shared);
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
  });

  it('treats constructor and prototype as ordinary keys, leaving Object.prototype alone', () => {
    const layers = deepFreeze([
      JSON.parse('{"constructor": {"prototype": {"polluted": 1}}}'),
      JSON.parse('{"constructor": {"prototype": {"more": 1}}}'),
    ]);
    const merged = merge(...layers);

    // `toStrictEqual` compares `.constructor`, which is exactly the key under test.
    expect(JSON.stringify(merged)).toBe('{"constructor":{"prototype":{"polluted":1,"more":1}}}');
    expect(Object.getPrototypeOf(merged)).toBe(Object.prototype);
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    expect(({} as Record<string, unknown>)['more']).toBeUndefined();
  });
});

describe('mergeObjects, where it departs from upstream', () => {
  describe('null or undefined meeting an object: upstream throws, the later value wins', () => {
    it.each([
      ['null over an object', [{ o: { k: 1 } }, { o: null }], { o: null }],
      ['undefined over an object', [{ o: { k: 1 } }, { o: undefined }], { o: undefined }],
      ['an object over null', [{ o: null }, { o: { k: 1 } }], { o: { k: 1 } }],
      ['a scalar over null', [{ o: null }, { o: 5 }], { o: 5 }],
      ['an array over null', [{ o: null }, { o: [1] }], { o: [1] }],
      ['null over null', [{ o: null }, { o: null }], { o: null }],
      [
        '"rule": null after a nested rule, which is documented to ungate',
        [
          { overrides: { 'app.x': { rule: { type: 'core.every', parameters: ['a', 'b'] } } } },
          { overrides: { 'app.x': { rule: null } } },
        ],
        { overrides: { 'app.x': { rule: null } } },
      ],
      [
        'an order after "order": null',
        [{ overrides: { 'app.x': { order: null } } }, { overrides: { 'app.x': { order: 5 } } }],
        { overrides: { 'app.x': { order: 5 } } },
      ],
      [
        'inside an array entry merged by id',
        [{ list: [{ id: 'a', rule: { type: 'x' } }] }, { list: [{ id: 'a', rule: null }] }],
        { list: [{ id: 'a', rule: null }] },
      ],
      [
        'an entry whose id is null, matched by a later "null" id, merges its id field too',
        [{ list: [{ id: null, v: 1 }] }, { list: [{ id: 'null', v: 2 }] }],
        { list: [{ id: 'null', v: 2 }] },
      ],
    ] as const)('%s', (_label, layers, expected) => {
      const frozen = deepFreeze(layers as unknown as Layers);
      expect(() => upstreamMergeObjects(...frozen)).toThrow(TypeError);
      expectSame(mergeObjects(...frozen), expected);
    });
  });

  describe('a __proto__ key: upstream re-prototypes the result, ours skips the key', () => {
    it.each([
      ['at the top level of one layer', [JSON.parse('{"__proto__": {"polluted": true}, "a": 1}')]],
      ['as a .$replace key', [JSON.parse('{"__proto__.$replace": {"polluted": true}, "a": 1}')]],
    ])('%s', (_label, layers) => {
      const frozen = deepFreeze(layers as Layers);

      const theirs = upstreamMergeObjects(...frozen);
      expect(theirs['polluted']).toBe(true);
      expect(Object.hasOwn(theirs, 'polluted')).toBe(false);
      expect(Object.getPrototypeOf(theirs)).not.toBe(Object.prototype);

      const ours = mergeObjects(...frozen);
      expectSame(ours, { a: 1 });
      expect(ours['polluted']).toBeUndefined();
      expect(Object.getPrototypeOf(ours)).toBe(Object.prototype);

      // Neither writes Object.prototype itself.
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });

    it('inside a nested merge', () => {
      const frozen = deepFreeze([
        { o: { k: 1 } },
        JSON.parse('{"o": {"__proto__": {"polluted": true}}}'),
      ] as Layers);

      const theirs = upstreamMergeObjects(...frozen) as { o: Record<string, unknown> };
      expect(theirs.o['polluted']).toBe(true);
      expect(Object.getPrototypeOf(theirs.o)).not.toBe(Object.prototype);

      const ours = mergeObjects(...frozen) as { o: Record<string, unknown> };
      expectSame(ours, { o: { k: 1 } });
      expect(Object.getPrototypeOf(ours.o)).toBe(Object.prototype);
      expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
    });
  });

  describe('an id is only ever data', () => {
    it('keeps an entry whose id is __proto__, which upstream dropped', () => {
      const frozen = deepFreeze([
        { list: [{ id: '__proto__', v: 1 }, { id: 'a' }] },
        { list: [{ id: 'b' }] },
      ] as Layers);

      expectSame(upstreamMergeObjects(...frozen), { list: [{ id: 'a' }, { id: 'b' }] });
      expectSame(mergeObjects(...frozen), {
        list: [{ id: '__proto__', v: 1 }, { id: 'a' }, { id: 'b' }],
      });
    });

    it('appends an unmatched entry whose id names an Object.prototype member', () => {
      const frozen = deepFreeze([
        { list: [{ id: 'a' }, 'x'] },
        { list: [{ id: 'constructor', $k: 1 }] },
      ] as Layers);

      // Upstream found `Object` under `constructor`, merged the entry into it — dropping `$k` —
      // and placed it among the matched entries.
      expectSame(upstreamMergeObjects(...frozen), {
        list: [{ id: 'a' }, { id: 'constructor' }, 'x'],
      });
      expectSame(mergeObjects(...frozen), {
        list: [{ id: 'a' }, 'x', { id: 'constructor', $k: 1 }],
      });
    });
  });
});
