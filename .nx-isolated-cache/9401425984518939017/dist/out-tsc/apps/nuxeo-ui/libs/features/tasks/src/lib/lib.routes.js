import { TasksPageComponent } from './tasks-page/tasks-page.component';
export const tasksRoutes = [
    { path: '', component: TasksPageComponent },
    { path: ':taskId', component: TasksPageComponent },
];
