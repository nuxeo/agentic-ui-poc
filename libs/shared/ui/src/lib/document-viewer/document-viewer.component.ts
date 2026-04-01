import {
  Component,
  input,
  output,
  computed,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Reusable document viewer component.
 *
 * Renders a preview for images, PDFs, video, and audio based on the provided
 * blob URL and MIME type. Includes a toolbar (zoom/rotate) and a footer with
 * file info and action buttons.
 */
@Component({
  selector: 'lib-document-viewer',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-viewer.component.html',
  styleUrl: './document-viewer.component.scss',
})
export class DocumentViewerComponent {
  readonly blobUrl = input<SafeResourceUrl | null>(null);
  readonly mimeType = input<string>('');
  readonly fileName = input<string>('');
  readonly fileSize = input<string>('');
  readonly loading = input<boolean>(false);

  readonly downloadClicked = output<void>();
  readonly annotateClicked = output<void>();
  readonly previewClicked = output<void>();

  readonly isImage = computed(() => this.mimeType().startsWith('image/'));
  readonly isPdf = computed(() => this.mimeType() === 'application/pdf');
  readonly isVideo = computed(() => this.mimeType().startsWith('video/'));
  readonly isAudio = computed(() => this.mimeType().startsWith('audio/'));

  readonly contentType = computed<'image' | 'pdf' | 'video' | 'audio' | 'iframe' | 'none'>(() => {
    if (!this.blobUrl()) return 'none';
    if (this.isImage()) return 'image';
    if (this.isPdf()) return 'pdf';
    if (this.isVideo()) return 'video';
    if (this.isAudio()) return 'audio';
    return 'iframe';
  });

  readonly zoom = signal(1);
  readonly rotation = signal(0);

  readonly transform = computed(
    () => `scale(${this.zoom()}) rotate(${this.rotation()}deg)`,
  );

  zoomIn(): void {
    this.zoom.update((z) => Math.min(z + 0.25, 5));
  }

  zoomOut(): void {
    this.zoom.update((z) => Math.max(z - 0.25, 0.25));
  }

  fitToWidth(): void {
    this.zoom.set(1);
    this.rotation.set(0);
  }

  rotateLeft(): void {
    this.rotation.update((r) => r - 90);
  }

  rotateRight(): void {
    this.rotation.update((r) => r + 90);
  }
}
