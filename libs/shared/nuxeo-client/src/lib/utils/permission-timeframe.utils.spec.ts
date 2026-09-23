import { describe, expect, it } from 'vitest';

import { formatAceDateRange, formatPermissionTimeFrame } from './permission-timeframe.utils';

/**
 * Returns the key rather than resolving it.
 *
 * This spec asserted the literal `'Permanent'`, which was the resolver's old default — and that
 * default ignored the key it was handed. So the assertion proved the default existed rather than
 * that the function asked for the right key, and stayed green while three production tables
 * rendered English in every locale.
 */
const echoKey = (key: string) => key;

describe('formatPermissionTimeFrame', () => {
  it('asks for the permanent key when begin and end are missing', () => {
    expect(formatPermissionTimeFrame(null, null, echoKey, 'en-US')).toBe(
      'permissions.time-frame.permanent',
    );
  });

  it('formats begin and end with localized labels, consulting no key', () => {
    // Literals, not values recomputed from the same API the implementation calls. The recomputed
    // form asserted host-zone output and so broke the moment the implementation was corrected to
    // format in UTC — it was measuring the machine, not the function.
    const label = formatPermissionTimeFrame(
      '2026-01-01T00:00:00.000Z',
      '2026-12-31T23:59:59.000Z',
      echoKey,
      'en-US',
    );
    expect(label).toBe('1/1/2026, 12:00:00 AM – 12/31/2026, 11:59:59 PM');
    // The dated branch localises through `Intl`, so a catalogue lookup here would be a mistake.
    expect(label).not.toContain('permissions.time-frame');
  });

  it('renders the calendar date the user picked, whatever the host time zone', () => {
    // The permission dialogs send a date-only `YYYY-MM-DD` built from the picker's LOCAL calendar
    // date, which `new Date()` reads as UTC midnight. Formatting in the host zone therefore shows
    // the day before anywhere west of UTC: pick 1 July in Los Angeles, save, read 30 June.
    // Asserting the literal pins the UTC formatting that prevents it — this test fails in a
    // negative-offset zone if `timeZone: 'UTC'` is dropped.
    expect(formatPermissionTimeFrame('2026-07-01', null, echoKey, 'en-US')).toContain('7/1/2026');
  });

  it('renders the same instant differently per locale', () => {
    // The assertion that matters: that `locale` reaches `Intl` rather than being accepted and
    // dropped. Asserting only "contains a date" passes for a hardcoded `en-US`, which is the bug
    // this parameter exists to fix — German orders the parts day-first.
    const begin = '2026-01-02T00:00:00.000Z';
    const asEnglish = formatPermissionTimeFrame(begin, null, echoKey, 'en-US');
    const asGerman = formatPermissionTimeFrame(begin, null, echoKey, 'de-DE');
    expect(asGerman).not.toBe(asEnglish);
  });
});

describe('formatAceDateRange', () => {
  const echoParams = (key: string, params?: Record<string, unknown>) =>
    params ? `${key}(${Object.entries(params).map(([k, v]) => `${k}=${v}`)})` : key;

  it('picks a distinct key per shape rather than joining fragments', () => {
    // One key per shape is the point. The three component copies this replaced built
    // `from ${x} to ${y}` by interpolation, so no catalogue entry could ever reach the connective
    // and the text was English in every locale.
    expect(formatAceDateRange(null, null, echoParams, 'en-US')).toBe(
      'permissions.time-frame.permanent',
    );
    expect(formatAceDateRange('2026-07-01', null, echoParams, 'en-US')).toContain(
      'permissions.time-frame.from',
    );
    expect(formatAceDateRange(null, '2026-12-31', echoParams, 'en-US')).toContain(
      'permissions.time-frame.until',
    );
    expect(formatAceDateRange('2026-07-01', '2026-12-31', echoParams, 'en-US')).toContain(
      'permissions.time-frame.range',
    );
  });

  it('hands the date to the catalogue as a parameter, not baked into the key', () => {
    // `{{ begin }}`/`{{ end }}` must arrive as params so a language can place them where its
    // grammar needs. A key with the date concatenated in would be unlookupable.
    expect(formatAceDateRange('2026-07-01T00:00:00.000Z', null, echoParams, 'en-US')).toMatch(
      /^permissions\.time-frame\.from\(begin=\w{3} \d{2}, 2026\)$/,
    );
  });

  it('renders the picked calendar date rather than shifting it by the host offset', () => {
    // Same defect as `formatPermissionTimeFrame` above, and the reason both now format in UTC:
    // `2026-07-01` is a calendar date, not an instant. Without `timeZone: 'UTC'` this reads
    // `Jun 30, 2026` in any zone west of UTC.
    expect(formatAceDateRange('2026-07-01', null, echoParams, 'en-US')).toContain('Jul 01, 2026');
    expect(formatAceDateRange(null, '2026-01-01', echoParams, 'en-US')).toContain('Jan 01, 2026');
  });

  it('formats the dates in the locale it is given', () => {
    // The load-bearing assertion for the hardcoded `'en-US'` this replaced: revert `locale` to a
    // literal and these two become equal, failing here. Without it, every other assertion in this
    // file still passes against the bug.
    const params = { begin: '2026-07-01T00:00:00.000Z', end: '2026-12-31T00:00:00.000Z' } as const;
    const asEnglish = formatAceDateRange(params.begin, params.end, echoParams, 'en-US');
    const asGerman = formatAceDateRange(params.begin, params.end, echoParams, 'de-DE');
    expect(asEnglish).toContain('Jul 01, 2026');
    expect(asGerman).toContain('01. Juli 2026');
    expect(asGerman).not.toBe(asEnglish);
  });
});
