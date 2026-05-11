import { Route } from '@angular/router';

import { AgentBuilderShellComponent } from './agent-builder-shell/agent-builder-shell.component';
import { AgentBuilderListPageComponent } from './agent-builder-list-page/agent-builder-list-page.component';
import { AgentBuilderCreatePageComponent } from './agent-builder-create-page/agent-builder-create-page.component';
import { AgentBuilderStatusPageComponent } from './agent-builder-status-page/agent-builder-status-page.component';

export const agentBuilderRoutes: Route[] = [
  {
    path: '',
    component: AgentBuilderShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'agents' },
      { path: 'agents', component: AgentBuilderListPageComponent },
      { path: 'create', component: AgentBuilderCreatePageComponent },
      { path: 'status', component: AgentBuilderStatusPageComponent },
    ],
  },
];
