import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'lib-widget-container',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './widget-container.component.html',
  styleUrl: './widget-container.component.scss',
})
export class WidgetContainerComponent {
  readonly title = input.required<string>();
  readonly icon = input<string>();
  readonly iconColor = input<string>('');
}
