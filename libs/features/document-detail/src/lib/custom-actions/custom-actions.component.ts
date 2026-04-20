import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { NuxeoDocument, NuxeoApiBase } from '@agentic-ui/shared/nuxeo-client';
import {
  ActionRegistryService,
  type ActionConfig,
  type ActionSlot,
} from '@agentic-ui/shared/nuxeo-studio';

@Component({
  selector: 'lib-custom-actions',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  template: `
    @for (action of visibleActions(); track action.id) {
      @if (slot() === 'DOCUMENT_ACTIONS') {
        <button
          mat-icon-button
          [matTooltip]="action.binding.tooltip || action.binding.label"
          [matTooltipPosition]="$any(action.binding.tooltipPosition)"
          [attr.aria-label]="action.binding.label"
          (click)="executeAction(action)"
        >
          <mat-icon>{{ action.binding.icon || 'play_arrow' }}</mat-icon>
        </button>
      } @else {
        <button mat-menu-item (click)="executeAction(action)">
          <mat-icon>{{ action.binding.icon || 'play_arrow' }}</mat-icon>
          <span>{{ action.binding.label }}</span>
        </button>
      }
    }
  `,
})
export class CustomActionsComponent {
  private readonly actionRegistry = inject(ActionRegistryService);
  private readonly nuxeoApi = inject(NuxeoApiBase);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly document = input.required<NuxeoDocument>();
  readonly slot = input<ActionSlot>('DOCUMENT_ACTIONS');

  readonly visibleActions = computed(() => {
    const doc = this.document();
    if (!doc) return [];
    return this.actionRegistry.getActionsForDocument(doc, this.slot());
  });

  executeAction(action: ActionConfig): void {
    if (action.attributes.notification && action.binding.operation) {
      this.runOperation(action);
      return;
    }

    this.runOperation(action);
  }

  private runOperation(action: ActionConfig): void {
    const doc = this.document();
    if (!doc || !action.binding.operation) return;

    const url = `/nuxeo/api/v1/id/${doc.uid}/@op/${action.binding.operation}`;
    const params = action.attributes.params ? this.parseParams(action.attributes.params) : {};

    this.nuxeoApi.post(url, { params }).subscribe({
      next: () => {
        const msg = action.attributes.notification || `${action.binding.label} completed`;
        this.snackBar.open(msg, 'OK', { duration: 3000 });
      },
      error: (err) => {
        const msg =
          action.attributes.errorLabel ||
          (err as { error?: { message?: string } })?.error?.message ||
          'Operation failed';
        this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
      },
    });
  }

  private parseParams(paramsStr: string): Record<string, unknown> {
    if (!paramsStr.trim()) return {};
    try {
      return JSON.parse(paramsStr);
    } catch {
      return {};
    }
  }
}
