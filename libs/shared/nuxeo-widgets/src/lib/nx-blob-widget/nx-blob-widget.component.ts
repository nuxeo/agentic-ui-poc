import { Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { NxWidgetBase } from '../base/nx-widget-base';

interface BlobValue {
  name?: string;
  'mime-type'?: string;
  length?: number;
  data?: string;
  digest?: string;
}

/**
 * Blob / file widget for uploading and displaying file attachments.
 */
@Component({
  selector: 'nx-blob-widget',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="nx-blob-container">
      <span class="nx-widget-label">{{ label() }}</span>

      @if (blobInfo()) {
        <div class="nx-blob-file">
          <mat-icon class="nx-blob-icon">description</mat-icon>
          <div class="nx-blob-details">
            <span class="nx-blob-name">{{ blobInfo()!.name || 'Unnamed file' }}</span>
            <span class="nx-blob-meta">
              {{ blobInfo()!['mime-type'] || 'Unknown type' }}
              @if (blobInfo()!.length) {
                · {{ formatBytes(blobInfo()!.length!) }}
              }
            </span>
          </div>
          @if (isEditable()) {
            <button mat-icon-button (click)="clearFile()" aria-label="Remove file">
              <mat-icon>close</mat-icon>
            </button>
          }
        </div>
      }

      @if (isEditable()) {
        <label class="nx-blob-upload">
          <input
            type="file"
            hidden
            [accept]="accept() || ''"
            [disabled]="disabled()"
            (change)="onFileSelected($event)"
          />
          <button
            mat-stroked-button
            type="button"
            [disabled]="disabled()"
            (click)="triggerInput($event)"
          >
            <mat-icon>upload_file</mat-icon>
            {{ blobInfo() ? 'Replace file' : 'Choose file' }}
          </button>
        </label>
      }

      @if (!blobInfo() && !isEditable()) {
        <span class="nx-widget-value">No file attached</span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .nx-blob-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 4px 0;
      }
      .nx-widget-label {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant, #666);
      }
      .nx-widget-value {
        font-size: 14px;
        color: #999;
      }
      .nx-blob-file {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid var(--mat-sys-outline-variant, #ccc);
        border-radius: 8px;
      }
      .nx-blob-icon {
        color: var(--mat-sys-primary, #1976d2);
      }
      .nx-blob-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .nx-blob-name {
        font-size: 14px;
        font-weight: 500;
      }
      .nx-blob-meta {
        font-size: 12px;
        color: var(--mat-sys-on-surface-variant, #666);
      }
      .nx-blob-upload {
        display: inline-flex;
      }
    `,
  ],
})
export class NxBlobWidgetComponent extends NxWidgetBase {
  readonly blobInfo = computed(() => {
    const v = this.value();
    if (!v || typeof v !== 'object') return null;
    return v as BlobValue;
  });

  readonly selectedFile = signal<File | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);
    this.emitChange({
      name: file.name,
      'mime-type': file.type,
      length: file.size,
      _file: file,
    });
  }

  clearFile(): void {
    this.selectedFile.set(null);
    this.emitChange(null);
  }

  triggerInput(event: Event): void {
    const button = event.target as HTMLElement;
    const label = button.closest('label');
    const input = label?.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
