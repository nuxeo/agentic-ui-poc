import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'lib-administration-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './administration-shell.component.html',
  styleUrl: './administration-shell.component.scss',
})
export class AdministrationShellComponent {}
