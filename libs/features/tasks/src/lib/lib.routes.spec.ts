import { TasksPageComponent } from './tasks-page/tasks-page.component';
import { tasksRoutes } from './lib.routes';

describe('tasksRoutes', () => {
  it('serves the same master-detail page with and without a task id', () => {
    expect(tasksRoutes).toEqual([
      { path: '', component: TasksPageComponent },
      { path: ':taskId', component: TasksPageComponent },
    ]);
  });
});
