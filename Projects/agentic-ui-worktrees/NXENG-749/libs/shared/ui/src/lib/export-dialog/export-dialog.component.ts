import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface ExportDialogData {
  documentUid: string;
  documentTitle: string;
  /** Callback that performs the actual download; returns an Observable<Blob>. */
  exportFn: (type: ExportType, uid: string) => import('rxjs').Observable<Blob>;
}

export type ExportType = 'thumbnail' | 'pdf' | 'zip' | 'xml';

interface ExportOption {
  type: ExportType;
  label: string;
  icon: string;
}

@Component({
  selector: 'lib-export-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Export</h2>

    <mat-dialog-content>
      @for (option of options; track option.type) {
        <button class="export-option" [disabled]="exporting()" (click)="onExport(option.type)">
          <mat-icon class="export-option-icon">{{ option.icon }}</mat-icon>
          <span class="export-option-label">{{ option.label }}</span>
          @if (exporting() === option.type) {
            <mat-spinner diameter="18" class="export-spinner" />
          }
        </button>
      }
    </mat-dialog-content>

    <mat-dialog-actions>
      <button mat-stroked-button mat-dialog-close [disabled]="!!exporting()">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 400px;
      }

      mat-dialog-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 16px 24px !important;
      }

      .export-option {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px 16px;
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.15s;
        width: 100%;
        text-align: left;

        &:hover:not(:disabled) {
          background: var(--mat-sys-surface-container-low);
        }

        &:disabled {
          opacity: 0.6;
          cursor: default;
        }
      }

      .export-option-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        color: var(--mat-sys-on-surface-variant);
      }

      .export-option-label {
        font-size: 14px;
        color: var(--mat-sys-primary);
        font-weight: 500;
      }

      .export-spinner {
        margin-left: auto;
      }

      mat-dialog-actions {
        padding: 8px 24px 16px;
      }
    `,
  ],
})
export class ExportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ExportDialogComponent>);
  private readonly data = inject<ExportDialogData>(MAT_DIALOG_DATA);

  readonly exporting = signal<ExportType | null>(null);

  readonly options: ExportOption[] = [
    { type: 'thumbnail', label: 'Thumbnail', icon: 'image' },
    { type: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
    { type: 'zip', label: 'ZIP Export', icon: 'folder_zip' },
    { type: 'xml', label: 'XML Export', icon: 'code' },
  ];

  onExport(type: ExportType): void {
    if (this.exporting()) return;
    this.exporting.set(type);

    const extMap: Record<ExportType, string> = {
      thumbnail: 'png',
      pdf: 'pdf',
      zip: 'zip',
      xml: 'xml',
    };
    const ext = extMap[type];
    const filename = `${this.data.documentTitle}.${ext}`;

    this.data.exportFn(type, this.data.documentUid).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.exporting.set(null);
        this.dialogRef.close(true);
      },
      error: () => {
        this.exporting.set(null);
      },
    });
  }
}
