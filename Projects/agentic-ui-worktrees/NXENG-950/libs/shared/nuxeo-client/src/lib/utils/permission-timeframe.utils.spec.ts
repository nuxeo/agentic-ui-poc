import { describe, expect, it } from 'vitest';

import { formatPermissionTimeFrame } from './permission-timeframe.utils';

describe('formatPermissionTimeFrame', () => {
  it('returns Permanent when begin and end are missing', () => {
    expect(formatPermissionTimeFrame(null, null)).toBe('Permanent');
  });

  it('formats begin and end with localized labels', () => {
    const begin = '2026-01-01T00:00:00.000Z';
    const end = '2026-12-31T23:59:59.000Z';
    const label = formatPermissionTimeFrame(begin, end);
    expect(label).toContain(new Date(begin).toLocaleString());
    expect(label).toContain(new Date(end).toLocaleString());
    expect(label).toContain('–');
  });
});
