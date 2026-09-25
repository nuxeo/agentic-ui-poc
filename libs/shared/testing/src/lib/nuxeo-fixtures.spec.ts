/**
 * The fixtures other specs build their test data from, so a defect here is invisible where it
 * lands: a wrong default does not fail this library, it fails — or worse, silently passes —
 * somewhere downstream, and the spec that breaks is the one that trusted the fixture.
 *
 * Imported through `../index` rather than `./nuxeo-fixtures`. The barrel is the surface every
 * consumer uses, and a re-export that stops naming one of these is a break no direct import
 * would notice.
 */
import { nuxeoAce, nuxeoDocument } from '../index';

describe('nuxeoDocument', () => {
  it('fills exactly the six required fields, and sets no optional one', () => {
    // Design principle 1 is "every *required* field filled, no `Partial<>` escape hatch", and
    // the compiler holds the factory to the model's required fields only. An exact key set is
    // what holds the rest of it, in both directions.
    //
    // Downwards: a field dropped from the factory still compiles, and reads as `undefined` in
    // whichever downstream spec trusted the fixture to be complete.
    //
    // Upwards, which is why the name says "and sets no optional one": `NuxeoDocument` has
    // thirteen optional fields the factory deliberately omits, because a live Nuxeo omits them
    // too unless the enricher that supplies them was requested. Defaulting one here would make
    // downstream specs pass against data the server would not have sent. This test used to be
    // called "fills every field of the model", which asserted the opposite of what the key set
    // below checks and reintroduced, in the test report, the contract the factory
    // documentation had just corrected.
    const doc = nuxeoDocument();

    expect(Object.keys(doc).sort()).toEqual([
      'lastModified',
      'path',
      'properties',
      'title',
      'type',
      'uid',
    ]);
    expect(Object.values(doc).some((v) => v === undefined)).toBe(false);
  });

  it('defaults to a File in a workspace, as its docblock claims', () => {
    expect(nuxeoDocument()).toEqual({
      uid: 'doc-1',
      title: 'Invoice',
      type: 'File',
      path: '/default-domain/workspaces/ws/Invoice',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    });
  });

  it('lets an override win over the default it replaces', () => {
    // The decisive ordering assertion. `...over` has to come last; spread the other way
    // round the parameter is accepted, ignored, and every caller silently gets `doc-1`.
    const doc = nuxeoDocument({ uid: 'other-uid', type: 'Folder' });

    expect(doc.uid).toBe('other-uid');
    expect(doc.type).toBe('Folder');
  });

  it('leaves the fields an override did not name at their defaults', () => {
    const doc = nuxeoDocument({ title: 'Reports' });

    expect(doc.title).toBe('Reports');
    expect(doc.uid).toBe('doc-1');
    expect(doc.path).toBe('/default-domain/workspaces/ws/Invoice');
  });

  it('replaces `properties` wholesale rather than merging into the default', () => {
    // Worth pinning because the opposite is the intuitive reading. A caller who overrides
    // `properties` gets exactly what they passed, so a spec cannot rely on a default key
    // surviving underneath it.
    const doc = nuxeoDocument({ properties: { 'dc:title': 'Invoice 42' } });

    expect(doc.properties).toEqual({ 'dc:title': 'Invoice 42' });
  });

  it('gives every call its own `properties` object', () => {
    // A hoisted `const DEFAULTS` would share one object across every fixture in the run, so
    // one spec mutating `doc.properties` would change another spec's data. The factory
    // builds the literal per call; this is what says so.
    const first = nuxeoDocument();
    const second = nuxeoDocument();

    expect(first.properties).not.toBe(second.properties);
    expect(first).not.toBe(second);
  });
});

describe('nuxeoAce', () => {
  it('fills every field of the model, with no field left undefined', () => {
    const ace = nuxeoAce();

    expect(Object.keys(ace).sort()).toEqual([
      'begin',
      'creator',
      'end',
      'externalUser',
      'granted',
      'id',
      'permission',
      'status',
      'username',
    ]);
    expect(Object.values(ace).some((v) => v === undefined)).toBe(false);
  });

  it('defaults to an effective Read grant for jdoe with no time bounds', () => {
    expect(nuxeoAce()).toEqual({
      id: '1',
      username: 'jdoe',
      externalUser: false,
      permission: 'Read',
      granted: true,
      creator: null,
      begin: null,
      end: null,
      status: 'effective',
    });
  });

  it('spells the absent fields `null` rather than omitting them', () => {
    // Design principle 1: "if a field is logically optional on the model, make it `null`
    // explicitly". `toEqual` above would pass either way — it treats an absent key and an
    // `undefined` one alike — so the presence of the key is asserted separately.
    const ace = nuxeoAce();

    for (const field of ['creator', 'begin', 'end'] as const) {
      expect(Object.hasOwn(ace, field)).toBe(true);
      expect(ace[field]).toBeNull();
    }
  });

  it('keeps a falsy override instead of falling back to the default', () => {
    // The trap this guards. `granted: over.granted ?? true` reads correctly and loses
    // `false` — which inverts the meaning of every deny-ACE fixture in the repository,
    // and the specs using them would still pass while asserting the opposite of the case
    // they were written for.
    const deny = nuxeoAce({ granted: false, externalUser: false });

    expect(deny.granted).toBe(false);
    expect(deny.externalUser).toBe(false);
  });

  it('accepts a value for a field whose default is null', () => {
    const timed = nuxeoAce({ begin: '2026-01-01', end: '2026-12-31', status: 'pending' });

    expect(timed.begin).toBe('2026-01-01');
    expect(timed.end).toBe('2026-12-31');
    expect(timed.status).toBe('pending');
    expect(timed.permission).toBe('Read');
  });

  it('gives every call its own object', () => {
    expect(nuxeoAce()).not.toBe(nuxeoAce());
  });
});

// `Partial<T>` permits an explicit `undefined` for every key unless
// `exactOptionalPropertyTypes` is on, and it is not set anywhere in this workspace. So these
// calls compile, and before `withoutUndefined` they returned a "complete" fixture with a
// required field missing — the one thing these factories exist to make impossible.
describe('an explicit undefined override', () => {
  it('cannot blank a required field on a document', () => {
    const doc = nuxeoDocument({ uid: undefined, title: undefined });

    expect(doc.uid).toBe('doc-1');
    expect(doc.title).toBe('Invoice');
  });

  it('cannot blank a required field on an ACE', () => {
    const ace = nuxeoAce({ permission: undefined, granted: undefined });

    expect(ace.permission).toBe('Read');
    expect(ace.granted).toBe(true);
  });

  it('still allows null, which these models use as a real value', () => {
    // Only `undefined` is filtered. Overriding a field *to* null has to keep working, or the
    // fix would have replaced one silent wrong answer with another.
    const ace = nuxeoAce({ creator: null, begin: null, end: null });

    expect(ace.creator).toBeNull();
    expect(ace.begin).toBeNull();
    expect(ace.end).toBeNull();
  });
});
