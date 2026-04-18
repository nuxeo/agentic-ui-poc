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

import { ConfirmActionDialogComponent } from './confirm-action-dialog.component';

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
          [matTooltip]="action.tooltip ?? action.label"
          [attr.aria-label]="action.label"
          [disabled]="executing() === action.id"
          (click)="executeAction(action)"
        >
          <mat-icon>{{ action.icon }}</mat-icon>
        </button>
      } @else {
        <button
          mat-menu-item
          (click)="executeAction(action)"
          [disabled]="executing() === action.id"
        >
          <mat-icon>{{ action.icon }}</mat-icon>
          <span>{{ action.label }}</span>
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
  readonly executing = input<string>('');

  readonly visibleActions = computed(() => {
    const doc = this.document();
    if (!doc) return [];
    return this.actionRegistry.getActionsForDocument(doc, this.slot());
  });

  executeAction(action: ActionConfig): void {
    if (action.confirmMessage) {
      const ref = this.dialog.open(ConfirmActionDialogComponent, {
        width: '400px',
        data: { message: action.confirmMessage, label: action.label },
      });
      ref.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) this.runOperation(action);
      });
      return;
    }

    this.runOperation(action);
  }

  private runOperation(action: ActionConfig): void {
    const doc = this.document();
    if (!doc) return;

    const url = `/nuxeo/api/v1/id/${doc.uid}/@op/${action.operationId}`;
    const body = {
      params: action.operationParams ?? {},
    };

    this.nuxeoApi.post(url, body).subscribe({
      next: () => {
        this.snackBar.open(action.successMessage ?? `${action.label} completed`, 'OK', {
          duration: 3000,
        });
      },
      error: (err) => {
        const msg = (err as { error?: { message?: string } })?.error?.message ?? 'Operation failed';
        this.snackBar.open(msg, 'Dismiss', { duration: 5000 });
      },
    });
  }
}
