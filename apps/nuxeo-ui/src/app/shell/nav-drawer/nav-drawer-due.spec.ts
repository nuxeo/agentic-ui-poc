import { drawerDueKey } from './nav-drawer-due';

describe('drawerDueKey', () => {
  it('picks the singular key for exactly one day, ahead and behind', () => {
    expect(drawerDueKey({ due: true, unit: 'days', count: 1 })).toBe('shell.task-due.in-days-one');
    expect(drawerDueKey({ due: false, unit: 'days', count: 1 })).toBe('shell.task-due.by-days-one');
  });

  it('picks the plural key for more than one day', () => {
    expect(drawerDueKey({ due: true, unit: 'days', count: 3 })).toBe('shell.task-due.in-days-many');
    expect(drawerDueKey({ due: false, unit: 'days', count: 165 })).toBe(
      'shell.task-due.by-days-many',
    );
  });

  it('uses hours under a day, and one bucket under two hours', () => {
    expect(drawerDueKey({ due: true, unit: 'hours', count: 5 })).toBe(
      'shell.task-due.in-hours-many',
    );
    expect(drawerDueKey({ due: false, unit: 'hours', count: 23 })).toBe(
      'shell.task-due.by-hours-many',
    );
    expect(drawerDueKey({ due: true, unit: 'under-two-hours', count: 1 })).toBe(
      'shell.task-due.in-less-than-an-hour',
    );
    expect(drawerDueKey({ due: false, unit: 'under-two-hours', count: 0 })).toBe(
      'shell.task-due.by-less-than-an-hour',
    );
  });
});
