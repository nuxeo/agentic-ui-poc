import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import type { SafeHtml, SafeResourceUrl } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DocumentViewerComponent,
  type ExifData,
  type IptcData,
  type PictureInfo,
  type StoryboardItem,
  type VideoInfo,
  type VideoSource,
} from './document-viewer.component';

/**
 * The MIME dispatch table, the metadata cards and the image-toolbar state.
 *
 * `document-viewer.component.spec.ts` covers the video/storyboard path against the real template;
 * this file covers `contentType()` and the rest of the class. The template is replaced with
 * `<div></div>` here on purpose: none of these assertions read the DOM, and rendering the real
 * template drags in `<video>`/`<iframe>` elements that jsdom only partly implements — which is
 * how a test ends up passing while an unhandled `HTMLMediaElement` error is logged beside it.
 */

/**
 * `SafeResourceUrl` and `SafeHtml` are opaque marker interfaces. Angular's own DomSanitizer
 * returns objects that satisfy them, so a test-local value has to be produced somehow; these two
 * helpers are the only place it happens, rather than an `as never` at every call site.
 *
 * `bypassSecurityTrustResourceUrl` is deliberately NOT used: it needs a sanitizer instance and it
 * is the function whose misuse this repo audits for. These values are never fed to a real DOM
 * binding — the template is stubbed out — so a plain marker object is both sufficient and inert.
 */
function safeUrl(value: string): SafeResourceUrl {
  return { toString: () => value } as SafeResourceUrl;
}

function safeHtml(value: string): SafeHtml {
  return { toString: () => value } as SafeHtml;
}

function videoSource(overrides: Partial<VideoSource> = {}): VideoSource {
  return { url: safeUrl('blob:video'), mimeType: 'video/mp4', label: 'MP4 480p', ...overrides };
}

function storyboardItem(overrides: Partial<StoryboardItem> = {}): StoryboardItem {
  return { timecode: 5, thumbnailUrl: safeUrl('blob:thumb'), label: '0:05', ...overrides };
}

function pictureInfo(overrides: Partial<PictureInfo> = {}): PictureInfo {
  return {
    width: 1920,
    height: 1080,
    format: 'JPEG',
    colorSpace: 'sRGB',
    depth: 8,
    weight: '1.2 MB',
    ...overrides,
  };
}

function videoInfo(overrides: Partial<VideoInfo> = {}): VideoInfo {
  return {
    duration: 3725,
    width: 1920,
    height: 1080,
    format: 'MP4',
    videoCodec: 'h264',
    audioCodec: 'aac',
    frameRate: 25,
    ...overrides,
  };
}

describe('DocumentViewerComponent — MIME dispatch and viewer state', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;
  let component: DocumentViewerComponent;

  /** Every input the dispatch logic reads, so each test states its whole world explicitly. */
  interface ViewerInputs {
    mimeType: string;
    fileName: string;
    blobUrl: SafeResourceUrl | null;
    previewUrl: SafeResourceUrl | null;
    noteContent: string | null;
    noteHtml: SafeHtml | null;
    videoSources: VideoSource[];
    storyboard: StoryboardItem[];
    hasPdfRendition: boolean;
    annotationsTab: boolean;
    arenderUrl: SafeResourceUrl | null;
    pictureInfo: PictureInfo | null;
    videoInfo: VideoInfo | null;
    exifData: ExifData | null;
    iptcData: IptcData | null;
  }

  const defaults: ViewerInputs = {
    mimeType: '',
    fileName: '',
    blobUrl: null,
    previewUrl: null,
    noteContent: null,
    noteHtml: null,
    videoSources: [],
    storyboard: [],
    hasPdfRendition: false,
    annotationsTab: false,
    arenderUrl: null,
    pictureInfo: null,
    videoInfo: null,
    exifData: null,
    iptcData: null,
  };

  /**
   * Sets every input, not only the overridden ones. Setting a subset leaves the previous test's
   * value in place for the rest, and the dispatch order means one stale `blobUrl` silently
   * changes which branch a later case takes.
   */
  function setInputs(overrides: Partial<ViewerInputs> = {}): void {
    const inputs: ViewerInputs = { ...defaults, ...overrides };
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideZonelessChangeDetection()],
    })
      .overrideComponent(DocumentViewerComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  describe('note content takes priority over the blob dispatch', () => {
    it('renders markdown notes as markdown', () => {
      setInputs({ mimeType: 'text/markdown', noteContent: '# Title' });
      expect(component.contentType()).toBe('markdown');
    });

    it('renders html notes as html, from noteHtml alone', () => {
      // `noteContent` stays null: the guard is `noteContent !== null || noteHtml !== null`, and a
      // note whose only representation is sanitised HTML must still reach the html branch.
      setInputs({ mimeType: 'text/html', noteHtml: safeHtml('<p>hi</p>') });
      expect(component.contentType()).toBe('html');
    });

    it('renders xml notes as xml, for both xml MIME spellings', () => {
      setInputs({ mimeType: 'text/xml', noteContent: '<a/>' });
      expect(component.contentType()).toBe('xml');

      setInputs({ mimeType: 'application/xml', noteContent: '<a/>' });
      expect(component.contentType()).toBe('xml');
    });

    it('renders any other text/* note as plain text', () => {
      setInputs({ mimeType: 'text/csv', noteContent: 'a,b' });
      expect(component.contentType()).toBe('text');
    });

    it('falls through to the blob dispatch when a note carries a non-text MIME type', () => {
      // A note with `application/pdf` matches none of the four note branches, so control has to
      // reach the ordinary dispatch below rather than defaulting to text.
      setInputs({
        mimeType: 'application/pdf',
        noteContent: 'not really text',
        blobUrl: safeUrl('blob:doc'),
      });
      expect(component.contentType()).toBe('pdf');
    });

    it('shows a note with no blob at all as text', () => {
      // No blobUrl, no previewUrl, no videoSources: the early "nothing to show" guard is reached,
      // and a note still has content to render, so it must not fall through to 'none'.
      setInputs({ mimeType: 'application/octet-stream', noteContent: 'plain body' });
      expect(component.contentType()).toBe('text');
    });

    it('shows nothing when there is neither a note nor anything to load', () => {
      setInputs({ mimeType: 'application/pdf' });
      expect(component.contentType()).toBe('none');
    });
  });

  describe('MIME dispatch, in the documented priority order', () => {
    const blobUrl = safeUrl('blob:doc');

    it('dispatches image, video and audio by MIME family', () => {
      setInputs({ mimeType: 'image/png', blobUrl });
      expect(component.contentType()).toBe('image');

      setInputs({ mimeType: 'video/quicktime', blobUrl });
      expect(component.contentType()).toBe('video');

      setInputs({ mimeType: 'audio/mpeg', blobUrl });
      expect(component.contentType()).toBe('audio');
    });

    it('treats the broadcast container MIME types as video', () => {
      // `application/gxf` and `application/mxf` are Web UI parity: professional video containers
      // that are not `video/*` and would otherwise land on the pdf/iframe fallback.
      setInputs({ mimeType: 'application/mxf', blobUrl });
      expect(component.contentType()).toBe('video');

      setInputs({ mimeType: 'application/gxf', blobUrl });
      expect(component.contentType()).toBe('video');
    });

    it('dispatches the text family, including json', () => {
      setInputs({ mimeType: 'text/markdown', blobUrl });
      expect(component.contentType()).toBe('markdown');

      setInputs({ mimeType: 'text/html', blobUrl });
      expect(component.contentType()).toBe('html');

      setInputs({ mimeType: 'application/xml', blobUrl });
      expect(component.contentType()).toBe('xml');

      setInputs({ mimeType: 'text/plain', blobUrl });
      expect(component.contentType()).toBe('text');

      setInputs({ mimeType: 'application/json', blobUrl });
      expect(component.contentType()).toBe('text');
    });

    it('dispatches a native pdf', () => {
      setInputs({ mimeType: 'application/pdf', blobUrl });
      expect(component.contentType()).toBe('pdf');
    });

    it('uses the server pdf rendition for an office document that has one', () => {
      setInputs({
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        blobUrl,
        hasPdfRendition: true,
      });
      expect(component.contentType()).toBe('pdfRendition');
    });

    it('prefers the pdf rendition over the preview URL when both are available', () => {
      // Order matters: the rendition is a real PDF of the document, the preview URL is a
      // server-side HTML conversion. Reversing these downgrades every office document.
      setInputs({
        mimeType: 'application/vnd.ms-excel',
        blobUrl,
        hasPdfRendition: true,
        previewUrl: safeUrl('/nuxeo/preview'),
      });
      expect(component.contentType()).toBe('pdfRendition');
    });

    it('falls back to the preview URL when there is no rendition', () => {
      setInputs({
        mimeType: 'application/vnd.ms-excel',
        previewUrl: safeUrl('/nuxeo/preview'),
        hasPdfRendition: true, // ignored: `pdfRendition` also requires a blobUrl, and there is none
      });
      expect(component.contentType()).toBe('preview');
    });

    it('guesses an image from the file extension when the MIME type is unhelpful', () => {
      // Nuxeo stores `application/octet-stream` for blobs uploaded without a detected type.
      for (const fileName of ['photo.PNG', 'scan.jpeg', 'logo.svg', 'plan.tif']) {
        setInputs({ mimeType: 'application/octet-stream', fileName, blobUrl });
        expect(component.contentType(), fileName).toBe('image');
      }
    });

    it('treats an unrecognised blob without an image extension as a pdf', () => {
      setInputs({ mimeType: 'application/octet-stream', fileName: 'archive.bin', blobUrl });
      expect(component.contentType()).toBe('pdf');
    });

    it('shows nothing when only transcoded video sources exist and the MIME type is not video', () => {
      // The early guard passes because `videoSources` is non-empty, but nothing downstream
      // matches and there is no blob or preview to fall back on: the final `return 'none'`.
      setInputs({ mimeType: 'application/zip', videoSources: [videoSource()] });
      expect(component.contentType()).toBe('none');
    });
  });

  describe('ARender and the Annotations tab', () => {
    const blobUrl = safeUrl('blob:doc');
    const arenderUrl = safeUrl('/arender/viewer');

    it('reports ARender as available whenever a URL was supplied, tab or not', () => {
      setInputs({ arenderUrl });
      expect(component.arenderAvailable()).toBe(true);

      setInputs({ arenderUrl: null });
      expect(component.arenderAvailable()).toBe(false);
    });

    it('only shows the ARender viewer on the Annotations tab', () => {
      // Availability and visibility are separate on purpose: the View tab keeps the built-in
      // preview even when ARender is configured.
      setInputs({ arenderUrl, annotationsTab: false });
      expect(component.arenderAvailable()).toBe(true);
      expect(component.showARenderViewer()).toBe(false);

      setInputs({ arenderUrl, annotationsTab: true });
      expect(component.showARenderViewer()).toBe(true);
    });

    it('does not show the ARender viewer on the Annotations tab without a URL', () => {
      setInputs({ arenderUrl: null, annotationsTab: true });
      expect(component.showARenderViewer()).toBe(false);
    });

    it('suppresses the image toolbar and the picture cards on the Annotations tab', () => {
      setInputs({ mimeType: 'image/png', blobUrl, pictureInfo: pictureInfo() });
      expect(component.showImageToolbar()).toBe(true);
      expect(component.showPictureCards()).toBe(true);

      setInputs({
        mimeType: 'image/png',
        blobUrl,
        pictureInfo: pictureInfo(),
        annotationsTab: true,
      });
      expect(component.showImageToolbar()).toBe(false);
      expect(component.showPictureCards()).toBe(false);
    });

    it('suppresses the storyboard and the video card while ARender is showing', () => {
      const videoInputs = {
        mimeType: 'video/mp4' as const,
        blobUrl,
        storyboard: [storyboardItem()],
        videoInfo: videoInfo(),
      };
      setInputs(videoInputs);
      expect(component.showVideoStoryboard()).toBe(true);
      expect(component.showVideoInfoCard()).toBe(true);

      setInputs({ ...videoInputs, annotationsTab: true, arenderUrl });
      expect(component.showVideoStoryboard()).toBe(false);
      expect(component.showVideoInfoCard()).toBe(false);
    });

    it('hides the storyboard for a video with no storyboard items', () => {
      setInputs({ mimeType: 'video/mp4', blobUrl, storyboard: [] });
      expect(component.showVideoStoryboard()).toBe(false);
    });

    it('hides the picture cards for an image with no picture metadata', () => {
      setInputs({ mimeType: 'image/png', blobUrl, pictureInfo: null });
      expect(component.showPictureCards()).toBe(false);
    });

    it('hides the image toolbar for a document that is not an image', () => {
      setInputs({ mimeType: 'application/pdf', blobUrl });
      expect(component.showImageToolbar()).toBe(false);
    });
  });

  describe('exifEntries', () => {
    it('is empty when no EXIF data was supplied', () => {
      setInputs({ exifData: null });
      expect(component.exifEntries()).toEqual([]);
    });

    it('maps the known keys to labels, in the declared order', () => {
      setInputs({
        exifData: {
          dateTimeOriginal: '2026-05-01 10:00:00',
          orientation: 'Top-left',
          fNumber: 'f/2.8',
          exposureTime: '1/125',
          isoSpeedRatings: '200',
          focalLength: '35 mm',
        },
      });

      // The order is the order the labels map declares, not the order of the incoming object;
      // that is what makes the rendered card stable across documents.
      expect(component.exifEntries()).toEqual([
        { label: 'Date', value: '2026-05-01 10:00:00' },
        { label: 'Orientation', value: 'Top-left' },
        { label: 'Aperture', value: 'f/2.8' },
        { label: 'Exposure', value: '1/125' },
        { label: 'ISO', value: '200' },
        { label: 'Focal Length', value: '35 mm' },
      ]);
    });

    it('drops absent, empty and unknown keys', () => {
      setInputs({
        exifData: {
          fNumber: 'f/4',
          // Present but empty: `.filter(([key]) => data[key])` is truthiness, so '' is dropped
          // rather than rendering a labelled row with no value.
          orientation: '',
          // Not in the labels map: extra EXIF tags Nuxeo returns must not leak into the card
          // unlabelled, which is why the map is iterated and not the data.
          make: 'Canon',
        },
      });

      expect(component.exifEntries()).toEqual([{ label: 'Aperture', value: 'f/4' }]);
    });
  });

  describe('iptcEntries', () => {
    it('is empty when no IPTC data was supplied', () => {
      setInputs({ iptcData: null });
      expect(component.iptcEntries()).toEqual([]);
    });

    it('maps the known keys to labels, in the declared order', () => {
      setInputs({
        iptcData: {
          copyright: '(c) 2026 Acme',
          rights: 'All rights reserved',
          source: 'Acme Photo Desk',
          description: 'A photograph',
        },
      });

      expect(component.iptcEntries()).toEqual([
        { label: 'Copyright', value: '(c) 2026 Acme' },
        { label: 'Rights', value: 'All rights reserved' },
        { label: 'Source', value: 'Acme Photo Desk' },
        { label: 'Description', value: 'A photograph' },
      ]);
    });

    it('drops absent, empty and unknown keys', () => {
      setInputs({ iptcData: { source: 'Wire', description: '', credit: 'Reuters' } });
      expect(component.iptcEntries()).toEqual([{ label: 'Source', value: 'Wire' }]);
    });
  });

  describe('image zoom, rotation and fit', () => {
    beforeEach(() => {
      setInputs({ mimeType: 'image/png', blobUrl: safeUrl('blob:image') });
    });

    it('starts fitted to width at 1x with no rotation', () => {
      expect(component.zoom()).toBe(1);
      expect(component.rotation()).toBe(0);
      expect(component.fitMode()).toBe('width');
      expect(component.transform()).toBe('scale(1) rotate(0deg)');
    });

    it('zooms in and out in quarter steps, and reflects both in the transform', () => {
      component.zoomIn();
      expect(component.zoom()).toBe(1.25);
      expect(component.transform()).toBe('scale(1.25) rotate(0deg)');

      component.zoomOut();
      component.zoomOut();
      expect(component.zoom()).toBe(0.75);
    });

    it('clamps zoom at 5x and at 0.25x', () => {
      for (let i = 0; i < 40; i += 1) component.zoomIn();
      expect(component.zoom()).toBe(5);

      for (let i = 0; i < 40; i += 1) component.zoomOut();
      // The floor is 0.25, not 0: a zoom of 0 renders a zero-width image the user cannot
      // recover from with the buttons alone.
      expect(component.zoom()).toBe(0.25);
    });

    it('rotates left and right in 90 degree steps, unbounded in both directions', () => {
      component.rotateRight();
      component.rotateRight();
      expect(component.rotation()).toBe(180);
      expect(component.transform()).toBe('scale(1) rotate(180deg)');

      component.rotateLeft();
      component.rotateLeft();
      component.rotateLeft();
      // Negative rotation is intentional — CSS accepts it and it keeps left/right symmetric.
      expect(component.rotation()).toBe(-90);
    });

    it('toggles fit to real size and back, resetting zoom and rotation each time', () => {
      component.zoomIn();
      component.rotateRight();

      component.toggleFit();
      expect(component.fitMode()).toBe('real');
      expect(component.zoom()).toBe(1);
      expect(component.rotation()).toBe(0);

      component.zoomOut();
      component.rotateLeft();

      component.toggleFit();
      expect(component.fitMode()).toBe('width');
      // Both branches reset, so a toggle is always a return to a known state rather than
      // carrying a 3x zoom from one fit mode into the other.
      expect(component.zoom()).toBe(1);
      expect(component.rotation()).toBe(0);
    });
  });

  describe('seekTo', () => {
    it('emits the timecode even when there is no video element to seek', () => {
      // The template is stubbed here, so `videoRef()` is undefined — the same situation as
      // seeking a storyboard thumbnail before the player has been created. The emit must still
      // happen, because the parent uses it to record the position.
      setInputs({ mimeType: 'video/mp4', blobUrl: safeUrl('blob:video') });
      expect(component.videoRef()).toBeUndefined();

      const emitted: number[] = [];
      component.storyboardSeek.subscribe((value) => emitted.push(value));

      component.seekTo(12.5);

      expect(emitted).toEqual([12.5]);
    });
  });

  describe('formatTimecode', () => {
    it('renders minutes and zero-padded seconds', () => {
      expect(component.formatTimecode(0)).toBe('0:00');
      expect(component.formatTimecode(9)).toBe('0:09');
      expect(component.formatTimecode(65)).toBe('1:05');
      expect(component.formatTimecode(600)).toBe('10:00');
    });

    it('truncates fractional seconds rather than rounding up', () => {
      expect(component.formatTimecode(59.9)).toBe('0:59');
    });

    it('does not roll minutes into hours', () => {
      // Storyboard timecodes are short by nature; a long video therefore reads "125:30", not
      // "2:05:30". Asserted so the difference from `formatDuration` is deliberate and visible.
      expect(component.formatTimecode(7530)).toBe('125:30');
    });
  });

  describe('formatDuration', () => {
    it('omits the hour segment below one hour', () => {
      expect(component.formatDuration(0)).toBe('0:00');
      expect(component.formatDuration(125)).toBe('2:05');
      expect(component.formatDuration(3599)).toBe('59:59');
    });

    it('includes hours, with both lower segments zero-padded, from one hour up', () => {
      expect(component.formatDuration(3600)).toBe('1:00:00');
      expect(component.formatDuration(3725)).toBe('1:02:05');
      expect(component.formatDuration(45296)).toBe('12:34:56');
    });
  });

  describe('isFiniteNumber', () => {
    it('accepts real numbers, including zero and negatives', () => {
      expect(component.isFiniteNumber(0)).toBe(true);
      expect(component.isFiniteNumber(-1.5)).toBe(true);
      expect(component.isFiniteNumber(1920)).toBe(true);
    });

    it('rejects null, undefined, NaN and Infinity', () => {
      // The template guards every metadata row with this. `NaN` in particular arrives from
      // `parseFloat` on a missing Nuxeo property, and without the check the card renders "NaN".
      expect(component.isFiniteNumber(null)).toBe(false);
      expect(component.isFiniteNumber(undefined)).toBe(false);
      expect(component.isFiniteNumber(Number.NaN)).toBe(false);
      expect(component.isFiniteNumber(Number.POSITIVE_INFINITY)).toBe(false);
    });
  });
});
