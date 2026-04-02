import { Component, inject, signal, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SafeResourceUrl } from '@angular/platform-browser';

export interface AttachmentPreviewData {
  name: string;
  mimeType: string;
  blobUrl: SafeResourceUrl;
  rawUrl: string;
}

@Component({
  selector: 'lib-attachment-preview-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="preview-viewer">
      <div class="viewer-header">
        <span class="viewer-filename">{{ data.name }}</span>
        <button class="viewer-close" (click)="close()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="viewer-body">
        @if (isImage) {
          <img
            [src]="data.blobUrl"
            [alt]="data.name"
            class="viewer-img"
            [style.transform]="'scale(' + zoom() + ')'"
          />
        } @else if (isPdf) {
          <iframe [src]="data.blobUrl" class="viewer-frame"></iframe>
        } @else if (isVideo) {
          <video controls class="viewer-video">
            <source [src]="data.blobUrl" [type]="data.mimeType" />
          </video>
        } @else if (isAudio) {
          <audio controls class="viewer-audio">
            <source [src]="data.blobUrl" [type]="data.mimeType" />
          </audio>
        } @else if (isText) {
          <iframe [src]="data.blobUrl" class="viewer-frame"></iframe>
        } @else {
          <div class="viewer-unsupported">
            <mat-icon class="unsupported-icon">insert_drive_file</mat-icon>
            <p>Preview not available for this file type</p>
            <p class="mime-label">{{ data.mimeType }}</p>
          </div>
        }
      </div>

      @if (isImage) {
        <div class="viewer-toolbar">
          <button mat-icon-button matTooltip="Zoom in" (click)="zoomIn()">
            <mat-icon>zoom_in</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Fit to screen" (click)="zoomReset()">
            <mat-icon>crop_free</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Zoom out" (click)="zoomOut()">
            <mat-icon>zoom_out</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Rotate left" (click)="rotateLeft()">
            <mat-icon>rotate_left</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Rotate right" (click)="rotateRight()">
            <mat-icon>rotate_right</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .preview-viewer {
        display: flex;
        flex-direction: column;
        height: 85vh;
        background: #f5f5f5;
      }

      .viewer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 16px;
        background: #37474f;
        color: #fff;
        min-height: 44px;
      }

      .viewer-filename {
        font-size: 14px;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        margin-right: 12px;
      }

      .viewer-close {
        border: none;
        background: none;
        color: #fff;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        border-radius: 50%;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }

      .viewer-body {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: auto;
        background: #e8e8e8;
        padding: 24px;
      }

      .viewer-img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform 0.2s ease;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
      }

      .viewer-frame {
        width: 100%;
        height: 100%;
        border: none;
        background: #fff;
      }

      .viewer-video {
        max-width: 100%;
        max-height: 100%;
      }

      .viewer-audio {
        width: 80%;
        max-width: 500px;
      }

      .viewer-unsupported {
        text-align: center;
        color: #666;
        padding: 48px 24px;
      }

      .unsupported-icon {
        font-size: 64px !important;
        width: 64px !important;
        height: 64px !important;
        color: #999;
        margin-bottom: 16px;
      }

      .viewer-unsupported p {
        margin: 4px 0;
        font-size: 14px;
      }

      .mime-label {
        color: #aaa;
        font-size: 12px !important;
      }

      .viewer-toolbar {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
        padding: 8px 0;
        background: #37474f;

        button {
          color: #fff;

          &:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        }
      }
    `,
  ],
})
export class AttachmentPreviewDialogComponent implements OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<AttachmentPreviewDialogComponent>);
  readonly data: AttachmentPreviewData = inject(MAT_DIALOG_DATA);

  readonly zoom = signal(1);
  private rotation = 0;

  get isImage(): boolean {
    return this.data.mimeType.startsWith('image/');
  }

  get isPdf(): boolean {
    return this.data.mimeType === 'application/pdf';
  }

  get isVideo(): boolean {
    return this.data.mimeType.startsWith('video/');
  }

  get isAudio(): boolean {
    return this.data.mimeType.startsWith('audio/');
  }

  get isText(): boolean {
    return (
      this.data.mimeType.startsWith('text/') ||
      this.data.mimeType === 'application/json' ||
      this.data.mimeType === 'application/xml'
    );
  }

  zoomIn(): void {
    this.zoom.update((z) => Math.min(z + 0.25, 5));
  }

  zoomOut(): void {
    this.zoom.update((z) => Math.max(z - 0.25, 0.25));
  }

  zoomReset(): void {
    this.zoom.set(1);
    this.rotation = 0;
  }

  rotateLeft(): void {
    this.rotation -= 90;
  }

  rotateRight(): void {
    this.rotation += 90;
  }

  close(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.data.rawUrl);
  }
}
