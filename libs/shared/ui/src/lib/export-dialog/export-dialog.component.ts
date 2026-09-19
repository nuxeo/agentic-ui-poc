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
  templateUrl: './export-dialog.component.html',
  styleUrl: './export-dialog.component.scss',
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
