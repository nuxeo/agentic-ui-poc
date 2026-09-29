import { describe, expect, it } from 'vitest';

import { taskDueDistance } from './task-due-distance';

describe('taskDueDistance', () => {
  const now = Date.UTC(2026, 8, 29, 12, 0, 0);
  const at = (ms: number): string => new Date(now + ms).toISOString();
  const HOUR = 3_600_000;
  const DAY = 24 * HOUR;

  it('counts whole days ahead and behind, with one day as its own case', () => {
    expect(taskDueDistance(at(DAY), now)).toEqual({ due: true, unit: 'days', count: 1 });
    expect(taskDueDistance(at(3 * DAY + 5 * HOUR), now)).toEqual({
      due: true,
      unit: 'days',
      count: 3,
    });
    expect(taskDueDistance(at(-DAY), now)).toEqual({ due: false, unit: 'days', count: 1 });
    expect(taskDueDistance(at(-165 * DAY), now)).toEqual({ due: false, unit: 'days', count: 165 });
  });

  it('falls back to whole hours under a day', () => {
    expect(taskDueDistance(at(5 * HOUR), now)).toEqual({ due: true, unit: 'hours', count: 5 });
    expect(taskDueDistance(at(-23 * HOUR), now)).toEqual({ due: false, unit: 'hours', count: 23 });
  });

  it('reports anything under two hours as one bucket, ahead or behind', () => {
    expect(taskDueDistance(at(HOUR + 59 * 60_000), now).unit).toBe('under-two-hours');
    expect(taskDueDistance(at(-30 * 60_000), now)).toEqual({
      due: false,
      unit: 'under-two-hours',
      count: 0,
    });
  });
});
