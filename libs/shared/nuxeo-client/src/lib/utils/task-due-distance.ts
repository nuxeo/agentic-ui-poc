/** How far a task's due date is from now, in the units the task views display. */
export interface TaskDueDistance {
  /** True when the due date is still ahead. */
  readonly due: boolean;
  /** Whole days when at least one; otherwise whole hours; `under-two-hours` below two. */
  readonly unit: 'days' | 'hours' | 'under-two-hours';
  readonly count: number;
}

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/**
 * The distance to a task's due date, floored to whole days, then whole hours.
 *
 * Shared by the Tasks page and the navigation drawer, which word it differently ("Due in 3 days" /
 * "in 3 days") and so each choose their own catalogue key from the result.
 */
export function taskDueDistance(dueDate: string, now: number = Date.now()): TaskDueDistance {
  const diff = new Date(dueDate).getTime() - now;
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / DAY_MS);
  const hours = Math.floor(absDiff / HOUR_MS);
  const due = diff > 0;
  if (days >= 1) return { due, unit: 'days', count: days };
  if (hours <= 1) return { due, unit: 'under-two-hours', count: hours };
  return { due, unit: 'hours', count: hours };
}
