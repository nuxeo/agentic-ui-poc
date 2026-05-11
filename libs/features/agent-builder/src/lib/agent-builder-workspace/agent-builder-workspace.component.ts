import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Route host for Agent Builder child routes (list, create, status).
 * Kept alongside {@link AgentBuilderShellComponent} for imports that reference this path.
 */
@Component({
  selector: 'lib-agent-builder-workspace',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './agent-builder-workspace.component.html',
  styleUrl: './agent-builder-workspace.component.scss',
})
export class AgentBuilderWorkspaceComponent {}
