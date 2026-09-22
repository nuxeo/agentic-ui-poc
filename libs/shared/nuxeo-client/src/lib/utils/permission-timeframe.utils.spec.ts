import { describe, expect, it } from 'vitest';

import { formatPermissionTimeFrame } from './permission-timeframe.utils';

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
    expect(formatPermissionTimeFrame(null, null, echoKey)).toBe('permissions.time-frame.permanent');
  });

  it('formats begin and end with localized labels, consulting no key', () => {
    const begin = '2026-01-01T00:00:00.000Z';
    const end = '2026-12-31T23:59:59.000Z';
    const label = formatPermissionTimeFrame(begin, end, echoKey);
    expect(label).toContain(new Date(begin).toLocaleString());
    expect(label).toContain(new Date(end).toLocaleString());
    expect(label).toContain('–');
    // The dated branch localises through `Intl`, so a catalogue lookup here would be a mistake.
    expect(label).not.toContain('permissions.time-frame');
  });
});
