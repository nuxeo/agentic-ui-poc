import { Route } from '@angular/router';
import { TasksPageComponent } from './tasks-page/tasks-page.component';

export const tasksRoutes: Route[] = [
  { path: '', component: TasksPageComponent },
  { path: ':taskId', component: TasksPageComponent },
];
