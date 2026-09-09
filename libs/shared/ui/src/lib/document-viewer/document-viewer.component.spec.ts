import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentViewerComponent, type VideoSource } from './document-viewer.component';

describe('DocumentViewerComponent', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;
  let component: DocumentViewerComponent;

  beforeEach(async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  /** Zoneless signal inputs update synchronously; avoid whenStable (can hang on video elements in jsdom). */
  function render(): void {
    fixture.detectChanges();
  }

  it('uses video mode when transcoded sources exist without a blob URL (NXSAT-175)', async () => {
    const sources: VideoSource[] = [
      {
        url: 'blob:mock-video' as VideoSource['url'],
        mimeType: 'video/mp4',
        label: 'MP4 480p',
      },
    ];

    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', null);
    fixture.componentRef.setInput('previewUrl', null);
    fixture.componentRef.setInput('videoSources', sources);
    render();

    expect(component.contentType()).toBe('video');
    expect(component.showVideoInfoCard()).toBe(false);
  });

  it('shows the video info card when metadata is present', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', 'blob:mock-video' as VideoSource['url']);
    fixture.componentRef.setInput('videoInfo', { duration: 12, width: 1920, height: 1080 });
    render();

    expect(component.contentType()).toBe('video');
    expect(component.showVideoInfoCard()).toBe(true);
  });

  it('returns none when no blob, preview, or video sources exist', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', null);
    fixture.componentRef.setInput('previewUrl', null);
    fixture.componentRef.setInput('videoSources', []);
    render();

    expect(component.contentType()).toBe('none');
  });

  it('shows storyboard strip when items exist without a blob URL (NXSAT-175)', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', null);
    fixture.componentRef.setInput('previewUrl', null);
    fixture.componentRef.setInput('videoSources', [
      { url: 'blob:mock-video' as VideoSource['url'], mimeType: 'video/mp4' },
    ]);
    fixture.componentRef.setInput('storyboard', [
      {
        timecode: 2,
        thumbnailUrl: 'blob:mock-thumb' as VideoSource['url'],
        label: '2s',
      },
    ]);
    render();

    expect(component.showVideoStoryboard()).toBe(true);
  });

  it('seeks without auto-playing (Web UI parity)', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', 'blob:mock-video' as VideoSource['url']);
    fixture.componentRef.setInput('loading', false);
    render();

    const videoEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(videoEl).toBeTruthy();
    const playSpy = vi.spyOn(videoEl, 'play').mockImplementation(() => Promise.resolve());

    component.seekTo(42.5);

    expect(videoEl.currentTime).toBe(42.5);
    expect(playSpy).not.toHaveBeenCalled();
  });

  // ---- rendered attributes, with a real sanitizer ---------------------------------------------
  //
  // These use `TestBed.inject(DomSanitizer)` and read the DOM attribute back. Both halves matter.
  //
  // `document-viewer.dispatch.spec.ts` substitutes `{ toString: () => value }` for a safe value,
  // which is a fake that behaves *correctly* in exactly the context where the real one breaks: a
  // `SecurityContext.NONE` binding never unwraps a `Safe*` value, so Angular assigns it and the
  // DOM coerces it with `toString()`. A stand-in whose `toString()` returns the bare URL therefore
  // renders a working `src`, while the genuine article renders
  // `"SafeValue must use [property]=binding: …"`. That is why audio playback and the
  // single-source video fallback were broken with a green test suite.
  describe('media bindings render a usable URL, not a SafeValue placeholder', () => {
    const RAW = 'blob:http://localhost/real-object-url';

    function trusted(): SafeResourceUrl {
      return TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(RAW);
    }

    it('renders the raw object URL into the audio fallback source', () => {
      fixture.componentRef.setInput('mimeType', 'audio/mpeg');
      fixture.componentRef.setInput('blobUrl', trusted());
      fixture.componentRef.setInput('rawBlobUrl', RAW);
      render();

      const audio = fixture.nativeElement.querySelector('audio') as HTMLAudioElement | null;
      expect(audio).not.toBeNull();
      expect(audio!.getAttribute('src')).toBe(RAW);
      expect(audio!.getAttribute('src')).not.toContain('SafeValue must use');
    });

    // `video[poster]` is the sixth NONE-context binding and the only one this suite did not cover.
    // It is also the one most able to regress unnoticed: section 0 of the plan records it as
    // *dormant* — `posterUrl` is only ever set to `null` today — so nothing in the app would
    // demonstrate a regression, and narrowing its type is the whole reason it is safe.
    it('renders the raw poster URL into video[poster], not a SafeValue placeholder', () => {
      const POSTER = 'blob:http://localhost/poster-object-url';
      fixture.componentRef.setInput('mimeType', 'video/mp4');
      fixture.componentRef.setInput('blobUrl', trusted());
      fixture.componentRef.setInput('rawBlobUrl', RAW);
      fixture.componentRef.setInput('videoSources', []);
      fixture.componentRef.setInput('posterUrl', POSTER);
      render();

      const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement | null;
      expect(video).not.toBeNull();
      expect(video!.getAttribute('poster')).toBe(POSTER);
      expect(video!.getAttribute('poster')).not.toContain('SafeValue must use');
    });

    it('renders the raw object URL into the single-source video fallback', () => {
      fixture.componentRef.setInput('mimeType', 'video/mp4');
      fixture.componentRef.setInput('blobUrl', trusted());
      fixture.componentRef.setInput('rawBlobUrl', RAW);
      fixture.componentRef.setInput('videoSources', []);
      render();

      const source = fixture.nativeElement.querySelector(
        'video source',
      ) as HTMLSourceElement | null;
      expect(source).not.toBeNull();
      expect(source!.getAttribute('src')).toBe(RAW);
      expect(source!.getAttribute('src')).not.toContain('SafeValue must use');
    });

    it('renders each transcoded source URL verbatim', () => {
      fixture.componentRef.setInput('mimeType', 'video/mp4');
      fixture.componentRef.setInput('blobUrl', null);
      fixture.componentRef.setInput('previewUrl', null);
      fixture.componentRef.setInput('videoSources', [
        { url: 'blob:http://localhost/mp4-480', mimeType: 'video/mp4', label: 'MP4 480p' },
      ] satisfies VideoSource[]);
      render();

      const source = fixture.nativeElement.querySelector(
        'video source',
      ) as HTMLSourceElement | null;
      expect(source).not.toBeNull();
      expect(source!.getAttribute('src')).toBe('blob:http://localhost/mp4-480');
      expect(source!.getAttribute('src')).not.toContain('SafeValue must use');
    });

    it('keeps the wrapped value on the pdf iframe, which throws on a raw string', () => {
      fixture.componentRef.setInput('mimeType', 'application/pdf');
      fixture.componentRef.setInput('blobUrl', trusted());
      fixture.componentRef.setInput('rawBlobUrl', RAW);
      render();

      // RESOURCE_URL *does* run a sanitizer, which unwraps the marker — so the attribute is the
      // real URL here too. If this ever shows the placeholder, the two inputs have been swapped.
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement | null;
      expect(iframe).not.toBeNull();
      expect(iframe!.getAttribute('src')).toBe(RAW);
      expect(iframe!.getAttribute('src')).not.toContain('SafeValue must use');
    });
  });
});
