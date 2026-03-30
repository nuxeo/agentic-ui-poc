import { Component } from '@angular/core';
import {
  WidgetContainerComponent,
  WidgetGridComponent,
} from '@agentic-ui/shared/ui';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [WidgetGridComponent, WidgetContainerComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent {}
