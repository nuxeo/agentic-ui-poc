import { describe, expect, it } from 'vitest';
import { tasksRoutes } from './lib.routes';
import { TasksPageComponent } from './tasks-page/tasks-page.component';

describe('tasksRoutes', () => {
  it('defines routes array', () => {
    expect(tasksRoutes).toBeDefined();
    expect(Array.isArray(tasksRoutes)).toBe(true);
    expect(tasksRoutes.length).toBe(2);
  });

  it('configures root path to TasksPageComponent', () => {
    const rootRoute = tasksRoutes[0];
    expect(rootRoute.path).toBe('');
    expect(rootRoute.component).toBe(TasksPageComponent);
  });

  it('configures taskId parameter route to TasksPageComponent', () => {
    const taskRoute = tasksRoutes[1];
    expect(taskRoute.path).toBe(':taskId');
    expect(taskRoute.component).toBe(TasksPageComponent);
  });
});
