import {
  Component,
  input,
  output,
  computed,
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
 * blob URL and MIME type. Includes a toolbar (zoom/rotate placeholders) and a
 * footer with file info and action buttons.
 *
 * To replace this viewer with a third-party solution (e.g. ngx-extended-pdf-viewer,
 * PSPDFKit, Apryse), swap the internal template while keeping the same
 * input/output contract so consuming components require zero changes.
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
  /** Sanitized blob URL for the document content. `null` means no preview. */
  readonly blobUrl = input<SafeResourceUrl | null>(null);

  /** MIME type of the document (e.g. "application/pdf", "image/png"). */
  readonly mimeType = input<string>('');

  /** Display name of the file. */
  readonly fileName = input<string>('');

  /** Human-readable file size string (e.g. "2.4 MB"). */
  readonly fileSize = input<string>('');

  /** Whether the viewer is still loading the blob. */
  readonly loading = input<boolean>(false);

  /** Emitted when the user clicks the download button. */
  readonly downloadClicked = output<void>();

  /** Emitted when the user clicks the annotate button. */
  readonly annotateClicked = output<void>();

  /** Emitted when the user clicks the fullscreen/preview button. */
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
}
