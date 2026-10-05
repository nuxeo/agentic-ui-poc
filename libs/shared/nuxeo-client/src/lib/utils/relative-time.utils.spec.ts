import { describe, expect, it } from 'vitest';

import { formatRelativeTime } from './relative-time.utils';

/**
 * The claim being tested is not "it says 3 days ago" — it is that this replaced five
 * hand-rolled English-only formatters with something correct in languages nobody here
 * speaks. So the load-bearing cases are the non-English ones.
 *
 * `now` is injected rather than mocked so each case states its own instant.
 */
describe('formatRelativeTime', () => {
  const NOW = Date.parse('2026-06-15T12:00:00Z');
  const ago = (ms: number) => new Date(NOW - ms).toISOString();

  it('reads as English prose for the usual spans', () => {
    expect(formatRelativeTime(ago(5 * 60_000), 'en', NOW)).toBe('5 minutes ago');
    expect(formatRelativeTime(ago(3 * 86_400_000), 'en', NOW)).toBe('3 days ago');
    expect(formatRelativeTime(ago(2 * 31_536_000_000), 'en', NOW)).toBe('2 years ago');
  });

  it('uses the word a language has instead of counting', () => {
    // `numeric: 'auto'` is the whole reason for this: the old code said "a day ago".
    expect(formatRelativeTime(ago(86_400_000), 'en', NOW)).toBe('yesterday');
    expect(formatRelativeTime(ago(86_400_000), 'fr', NOW)).toBe('hier');
  });

  it('puts the preposition where the language puts it, not where English does', () => {
    // The concatenated version could only ever append " ago", so French read "3 jours ago".
    expect(formatRelativeTime(ago(3 * 86_400_000), 'fr', NOW)).toBe('il y a 3 jours');
  });

  it('picks the right plural form in a language with more than two', () => {
    // Polish has three. A catalogue key with a singular and a plural cannot express this, which
    // is the argument for Intl over translating the phrase.
    expect(formatRelativeTime(ago(3 * 86_400_000), 'pl', NOW)).toBe('3 dni temu');
    expect(formatRelativeTime(ago(5 * 60_000), 'pl', NOW)).toBe('5 minut temu');
    expect(formatRelativeTime(ago(3_600_000), 'pl', NOW)).toBe('1 godzinę temu');
  });

  it('says "now" rather than counting seconds', () => {
    expect(formatRelativeTime(ago(4_000), 'en', NOW)).toBe('now');
    expect(formatRelativeTime(ago(4_000), 'fr', NOW)).toBe('maintenant');
  });

  it('handles a future instant, which two of the five copies spelled by hand', () => {
    expect(formatRelativeTime(new Date(NOW + 3 * 86_400_000).toISOString(), 'en', NOW)).toBe(
      'in 3 days',
    );
  });

  it('returns empty for absent or unparseable input rather than "Invalid Date"', () => {
    expect(formatRelativeTime(null, 'en', NOW)).toBe('');
    expect(formatRelativeTime(undefined, 'en', NOW)).toBe('');
    expect(formatRelativeTime('', 'en', NOW)).toBe('');
    expect(formatRelativeTime('not a date', 'en', NOW)).toBe('');
  });

  it('falls back rather than throwing on a locale with no data', () => {
    // A customer can set `defaultLanguage` to anything. Intl resolves an unknown tag to its
    // default rather than throwing, and this asserts that rather than assuming it.
    expect(() => formatRelativeTime(ago(86_400_000), 'zz', NOW)).not.toThrow();
  });

  it('accepts a Date and an epoch as well as an ISO string', () => {
    expect(formatRelativeTime(new Date(NOW - 3 * 86_400_000), 'en', NOW)).toBe('3 days ago');
    expect(formatRelativeTime(NOW - 3 * 86_400_000, 'en', NOW)).toBe('3 days ago');
  });

  // `Math.round` ties towards +∞, so it is asymmetric across zero: 1.5 rounds to 2 and -1.5 to -1.
  // Ninety seconds either side of now therefore disagreed — "2 minutes ago" against "in 1 minute".
  it('rounds the same distance either side of now to the same magnitude', () => {
    const now = Date.parse('2026-09-20T12:00:00Z');
    const past = formatRelativeTime(new Date(now - 90_000), 'en', now);
    const future = formatRelativeTime(new Date(now + 90_000), 'en', now);
    expect(past).toBe('2 minutes ago');
    expect(future).toBe('in 2 minutes');
  });

  it('keeps the sign: the past is behind, the future is ahead', () => {
    const now = Date.parse('2026-09-20T12:00:00Z');
    expect(formatRelativeTime(new Date(now - 3 * 3_600_000), 'en', now)).toBe('3 hours ago');
    expect(formatRelativeTime(new Date(now + 3 * 3_600_000), 'en', now)).toBe('in 3 hours');
  });
});
