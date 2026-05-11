import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-agent-builder-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './agent-builder-shell.component.html',
  styleUrl: './agent-builder-shell.component.scss',
})
export class AgentBuilderShellComponent {}
