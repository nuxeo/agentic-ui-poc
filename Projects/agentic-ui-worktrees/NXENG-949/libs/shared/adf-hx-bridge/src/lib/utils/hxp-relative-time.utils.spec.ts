import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hxpRelativeTime } from './hxp-relative-time.utils';

const NOW = new Date('2026-02-10T12:00:00.000Z');

/** Minutes/hours/days before `NOW`, as the ISO string Nuxeo would have sent. */
function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

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

  it('reports anything under two minutes as just now', () => {
    expect(hxpRelativeTime(ago(0))).toBe('just now');
    expect(hxpRelativeTime(ago(59_000))).toBe('just now');
    expect(hxpRelativeTime(ago(60_000))).toBe('just now');
  });

  it('switches to minutes at the two-minute mark', () => {
    expect(hxpRelativeTime(ago(2 * 60_000))).toBe('2 minutes ago');
    expect(hxpRelativeTime(ago(59 * 60_000))).toBe('59 minutes ago');
  });

  it('uses the singular article for exactly one hour', () => {
    expect(hxpRelativeTime(ago(3_600_000))).toBe('an hour ago');
  });

  it('reports whole hours below a day', () => {
    expect(hxpRelativeTime(ago(5 * 3_600_000))).toBe('5 hours ago');
    expect(hxpRelativeTime(ago(23 * 3_600_000))).toBe('23 hours ago');
  });

  it('uses the singular article for exactly one day', () => {
    expect(hxpRelativeTime(ago(86_400_000))).toBe('a day ago');
  });

  it('reports whole days beyond that, without ever rolling over to weeks', () => {
    // There is no week/month bucket, so an old document reads "400 days ago". Asserted so
    // the limitation is recorded rather than discovered in a screenshot.
    expect(hxpRelativeTime(ago(3 * 86_400_000))).toBe('3 days ago');
    expect(hxpRelativeTime(ago(400 * 86_400_000))).toBe('400 days ago');
  });

  it('reports a future timestamp as just now instead of a negative age', () => {
    // Clock skew between the browser and the Nuxeo server puts a freshly written document
    // slightly in the future. "-1 minutes ago" would be worse than "just now".
    expect(hxpRelativeTime(new Date(NOW.getTime() + 5 * 60_000).toISOString())).toBe('just now');
  });

  it('renders an unparseable date as NaN minutes ago', () => {
    // Not desirable, and asserted so the defect is recorded rather than found in a
    // screenshot: `NaN` fails every comparison in the chain, including `minutes <= 1`, so
    // the final template literal interpolates it verbatim.
    expect(hxpRelativeTime('not-a-date')).toBe('NaN minutes ago');
  });
});
