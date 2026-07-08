import {
  Component,
  input,
  output,
  computed,
  signal,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
} from '@angular/core';
import { SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface VideoSource {
  url: SafeResourceUrl;
  mimeType: string;
  label?: string;
}

export interface StoryboardItem {
  timecode: number;
  thumbnailUrl: SafeResourceUrl;
  label: string;
}

export interface PictureInfo {
  width: number;
  height: number;
  format: string;
  colorSpace: string;
  depth: number;
  weight: string;
}

export interface PictureView {
  title: string;
  width: number;
  height: number;
  fileSize: string;
  format: string;
  downloadUrl: string;
}

export interface ExifData {
  dateTimeOriginal?: string;
  orientation?: string;
  fNumber?: string;
  exposureTime?: string;
  isoSpeedRatings?: string;
  focalLength?: string;
  [key: string]: string | undefined;
}

export interface IptcData {
  copyright?: string;
  rights?: string;
  source?: string;
  description?: string;
  [key: string]: string | undefined;
}

export interface VideoInfo {
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
  videoCodec?: string;
  audioCodec?: string;
  frameRate?: number;
}

/**
 * Reusable document viewer component following Nuxeo Web UI's nuxeo-document-preview
 * dispatching logic. Renders content based on MIME type priority:
 *
 * 1. image/*           → Image viewer with zoom/rotate/pan
 * 2. video/*           → HTML5 video player with storyboard
 * 3. audio/*           → HTML5 audio player
 * 4. text/markdown     → Rendered markdown (passed as safe HTML)
 * 5. text/html         → Iframe with srcdoc
 * 6. text/xml          → Preformatted text
 * 7. text/plain        → Preformatted text
 * 8. application/pdf   → PDF iframe (browser-native or PDF.js)
 * 9. (pdf rendition)   → PDF iframe using server-rendered PDF of office docs
 * 10. (fallback)       → Generic iframe with preview URL, or "no preview" placeholder
 */
@Component({
  selector: 'lib-document-viewer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTooltipModule, MatProgressSpinnerModule],
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

  readonly noteContent = input<string | null>(null);
  readonly noteHtml = input<SafeHtml | null>(null);
  readonly videoSources = input<VideoSource[]>([]);
  readonly storyboard = input<StoryboardItem[]>([]);
  readonly posterUrl = input<SafeResourceUrl | null>(null);
  readonly hasPdfRendition = input<boolean>(false);
  readonly previewUrl = input<SafeResourceUrl | null>(null);

  readonly pictureInfo = input<PictureInfo | null>(null);
  readonly pictureViews = input<PictureView[]>([]);
  readonly exifData = input<ExifData | null>(null);
  readonly iptcData = input<IptcData | null>(null);
  readonly videoInfo = input<VideoInfo | null>(null);

  readonly arenderUrl = input<SafeResourceUrl | null>(null);
  /** When this changes, the ARender iframe is destroyed and recreated. */
  readonly arenderReloadId = input(0);
  /** When the open document changes, exit ARender mode so the user does not keep a stale viewer. */
  readonly viewerDocUid = input<string>('');
  /**
   * When true (Annotations tab), the main area only shows ARender or a “not available” state,
   * matching Nuxeo Web UI’s Annotations tab.
   */
  readonly annotationsTab = input(false);

  /** When true, show Replace / Remove actions for the primary blob in the footer toolbar. */
  readonly showMainFileControls = input(false);
  readonly mainFileActionInProgress = input<string | null>(null);

  readonly downloadClicked = output<void>();
  readonly openWithDriveClicked = output<void>();
  readonly previewClicked = output<void>();
  readonly replaceMainFileClicked = output<void>();
  readonly removeMainFileClicked = output<void>();
  readonly storyboardSeek = output<number>();
  readonly formatDownload = output<string>();

  readonly contentType = computed<
    | 'image'
    | 'video'
    | 'audio'
    | 'markdown'
    | 'html'
    | 'xml'
    | 'text'
    | 'pdf'
    | 'pdfRendition'
    | 'preview'
    | 'none'
  >(() => {
    const mime = this.mimeType();

    if (this.noteContent() !== null || this.noteHtml() !== null) {
      if (mime === 'text/markdown') return 'markdown';
      if (mime === 'text/html') return 'html';
      if (mime === 'text/xml' || mime === 'application/xml') return 'xml';
      if (mime.startsWith('text/')) return 'text';
    }

    if (!this.blobUrl() && !this.previewUrl()) {
      if (this.noteContent() !== null) return 'text';
      return 'none';
    }

    if (/^image\//.test(mime)) return 'image';
    if (/^video\//.test(mime) || /^application\/(g|m)xf$/.test(mime)) return 'video';
    if (/^audio\//.test(mime)) return 'audio';
    if (mime === 'text/markdown') return 'markdown';
    if (mime === 'text/html') return 'html';
    if (mime === 'text/xml' || mime === 'application/xml') return 'xml';
    if (mime.startsWith('text/') || mime === 'application/json') return 'text';
    if (mime === 'application/pdf') return 'pdf';
    if (this.hasPdfRendition() && this.blobUrl()) return 'pdfRendition';
    if (this.previewUrl()) return 'preview';
    if (this.blobUrl()) {
      if (/\.(png|jpe?g|gif|webp|bmp|svg|tiff?)$/i.test(this.fileName())) return 'image';
      return 'pdf';
    }

    return 'none';
  });

  /** ARender appears only on the Annotations tab (View tab uses the built-in preview). */
  readonly showARenderViewer = computed(() => this.annotationsTab() && this.arenderUrl() !== null);

  readonly showImageToolbar = computed(
    () => !this.annotationsTab() && !this.showARenderViewer() && this.contentType() === 'image',
  );
  readonly showVideoStoryboard = computed(
    () =>
      !this.annotationsTab() &&
      !this.showARenderViewer() &&
      this.contentType() === 'video' &&
      this.storyboard().length > 0,
  );
  readonly showPictureCards = computed(
    () =>
      !this.annotationsTab() &&
      !this.showARenderViewer() &&
      this.contentType() === 'image' &&
      this.pictureInfo() !== null,
  );
  readonly showVideoInfoCard = computed(
    () =>
      !this.annotationsTab() &&
      !this.showARenderViewer() &&
      this.contentType() === 'video' &&
      this.videoInfo() !== null,
  );
  readonly arenderAvailable = computed(() => this.arenderUrl() !== null);

  readonly exifEntries = computed(() => {
    const data = this.exifData();
    if (!data) return [];
    const labels: Record<string, string> = {
      dateTimeOriginal: 'Date',
      orientation: 'Orientation',
      fNumber: 'Aperture',
      exposureTime: 'Exposure',
      isoSpeedRatings: 'ISO',
      focalLength: 'Focal Length',
    };
    return Object.entries(labels)
      .filter(([key]) => data[key])
      .map(([key, label]) => ({ label, value: data[key]! }));
  });

  readonly iptcEntries = computed(() => {
    const data = this.iptcData();
    if (!data) return [];
    const labels: Record<string, string> = {
      copyright: 'Copyright',
      rights: 'Rights',
      source: 'Source',
      description: 'Description',
    };
    return Object.entries(labels)
      .filter(([key]) => data[key])
      .map(([key, label]) => ({ label, value: data[key]! }));
  });

  readonly zoom = signal(1);
  readonly rotation = signal(0);
  readonly fitMode = signal<'width' | 'real'>('width');

  readonly transform = computed(() => `scale(${this.zoom()}) rotate(${this.rotation()}deg)`);

  readonly videoRef = viewChild<ElementRef<HTMLVideoElement>>('videoPlayer');

  zoomIn(): void {
    this.zoom.update((z) => Math.min(z + 0.25, 5));
  }

  zoomOut(): void {
    this.zoom.update((z) => Math.max(z - 0.25, 0.25));
  }

  toggleFit(): void {
    if (this.fitMode() === 'width') {
      this.fitMode.set('real');
      this.zoom.set(1);
    } else {
      this.fitMode.set('width');
      this.zoom.set(1);
    }
    this.rotation.set(0);
  }

  rotateLeft(): void {
    this.rotation.update((r) => r - 90);
  }

  rotateRight(): void {
    this.rotation.update((r) => r + 90);
  }

  seekTo(timecode: number): void {
    const video = this.videoRef()?.nativeElement;
    if (video) {
      video.currentTime = timecode;
      video.play();
    }
    this.storyboardSeek.emit(timecode);
  }

  formatTimecode(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
