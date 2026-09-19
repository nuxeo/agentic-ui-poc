import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { hxpRelativeTime } from './hxp-relative-time.utils';

const NOW = new Date('2026-02-10T12:00:00.000Z');

/** Minutes/hours/days before `NOW`, as the ISO string Nuxeo would have sent. */
function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

/**
 * These expectations changed when the hand-rolled formatter was replaced by
 * `Intl.RelativeTimeFormat`, and every change is the new one being right.
 *
 * The old version said "a day ago" where English has the word "yesterday", clamped a FUTURE
 * date to "just now", and rendered an unparseable one as "NaN minutes ago". It also appended
 * " ago" unconditionally, so French would have read "3 jours ago" — the reason for the
 * replacement, and the thing no spec here could have caught, because every case was English.
 */
describe('hxpRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns an empty string for a missing date rather than the epoch', () => {
    expect(hxpRelativeTime(null)).toBe('');
    expect(hxpRelativeTime(undefined)).toBe('');
    expect(hxpRelativeTime('')).toBe('');
  });

  it('returns an empty string for an unparseable date, not "NaN minutes ago"', () => {
    expect(hxpRelativeTime('not a date')).toBe('');
  });

  it('says "now" for anything within the last minute', () => {
    expect(hxpRelativeTime(ago(0))).toBe('now');
    expect(hxpRelativeTime(ago(30_000))).toBe('now');
  });

  it('counts minutes once past the "now" threshold', () => {
    expect(hxpRelativeTime(ago(2 * 60_000))).toBe('2 minutes ago');
    expect(hxpRelativeTime(ago(59 * 60_000))).toBe('59 minutes ago');
  });

  it('reports whole hours below a day', () => {
    expect(hxpRelativeTime(ago(3_600_000))).toBe('1 hour ago');
    expect(hxpRelativeTime(ago(5 * 3_600_000))).toBe('5 hours ago');
    expect(hxpRelativeTime(ago(23 * 3_600_000))).toBe('23 hours ago');
  });

  it('prefers the word a language has over counting units', () => {
    // English has "yesterday"; the hand-rolled version could only produce "a day ago".
    expect(hxpRelativeTime(ago(86_400_000))).toBe('yesterday');
  });

  it('coarsens past a year instead of counting hundreds of days', () => {
    expect(hxpRelativeTime(ago(400 * 86_400_000))).toBe('last year');
  });

  it('handles a future date rather than clamping it to the present', () => {
    expect(hxpRelativeTime(new Date(NOW.getTime() + 5 * 60_000).toISOString())).toBe(
      'in 5 minutes',
    );
  });

  it('follows the locale it is given, which is the point of the change', () => {
    expect(hxpRelativeTime(ago(3 * 86_400_000), 'fr')).toBe('il y a 3 jours');
    expect(hxpRelativeTime(ago(86_400_000), 'fr')).toBe('hier');
  });

  it('defaults to English when no locale is passed', () => {
    expect(hxpRelativeTime(ago(3 * 86_400_000))).toBe('3 days ago');
  });
});
