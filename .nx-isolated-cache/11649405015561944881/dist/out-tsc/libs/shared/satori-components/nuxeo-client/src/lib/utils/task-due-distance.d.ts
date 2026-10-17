/** How far a task's due date is from now, in the units the task views display. */
export interface TaskDueDistance {
    /** True when the due date is still ahead. */
    readonly due: boolean;
    /** Whole days when at least one; otherwise whole hours; `under-two-hours` below two. */
    readonly unit: 'days' | 'hours' | 'under-two-hours';
    readonly count: number;
}
/**
 * The distance to a task's due date, floored to whole days, then whole hours.
 *
 * Shared by the Tasks page and the navigation drawer, which word it differently ("Due in 3 days" /
 * "in 3 days") and so each choose their own catalogue key from the result.
 */
export declare function taskDueDistance(dueDate: string, now?: number): TaskDueDistance;
//# sourceMappingURL=task-due-distance.d.ts.map