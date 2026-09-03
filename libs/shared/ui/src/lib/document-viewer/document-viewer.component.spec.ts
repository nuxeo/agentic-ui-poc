import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentViewerComponent, type VideoSource } from './document-viewer.component';

describe('DocumentViewerComponent', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;
  let component: DocumentViewerComponent;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
  });

  function safeUrl(url: string): VideoSource['url'] {
    return sanitizer.bypassSecurityTrustResourceUrl(url);
  }

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
        url: safeUrl('blob:mock-video'),
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
    fixture.componentRef.setInput('blobUrl', safeUrl('blob:mock-video'));
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
      { url: safeUrl('blob:mock-video'), mimeType: 'video/mp4' },
    ]);
    fixture.componentRef.setInput('storyboard', [
      {
        timecode: 2,
        thumbnailUrl: safeUrl('blob:mock-thumb'),
        label: '2s',
      },
    ]);
    render();

    expect(component.showVideoStoryboard()).toBe(true);
  });

  it('gives the player a usable source URL for the main blob', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', safeUrl('blob:http://localhost/main-blob'));
    render();

    const source = fixture.nativeElement.querySelector('video source') as HTMLSourceElement;
    // Angular does not sanitize `source|src`, so binding the SafeResourceUrl itself left the
    // player with "SafeValue must use [property]=binding: …" and NETWORK_NO_SOURCE.
    expect(source.getAttribute('src')).toBe('blob:http://localhost/main-blob');
    expect(source.getAttribute('type')).toBe('video/mp4');
  });

  it('gives the player a usable source URL for each transcoded rendition', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', null);
    fixture.componentRef.setInput('videoSources', [
      { url: safeUrl('blob:http://localhost/mp4-480'), mimeType: 'video/mp4' },
      { url: safeUrl('blob:http://localhost/webm-480'), mimeType: 'video/webm' },
    ]);
    render();

    const sources = [...fixture.nativeElement.querySelectorAll('video source')].map(
      (el: HTMLSourceElement) => [el.getAttribute('src'), el.getAttribute('type')],
    );
    expect(sources).toEqual([
      ['blob:http://localhost/mp4-480', 'video/mp4'],
      ['blob:http://localhost/webm-480', 'video/webm'],
    ]);
  });

  it('omits the type attribute for a container the browser must sniff', async () => {
    // `application/mxf` reaches the video branch, but declaring it makes the browser refuse
    // the source outright instead of trying to decode it.
    fixture.componentRef.setInput('mimeType', 'application/mxf');
    fixture.componentRef.setInput('blobUrl', safeUrl('blob:http://localhost/mxf'));
    render();

    const source = fixture.nativeElement.querySelector('video source') as HTMLSourceElement;
    expect(source.getAttribute('src')).toBe('blob:http://localhost/mxf');
    expect(source.hasAttribute('type')).toBe(false);
  });

  it('seeks without auto-playing (Web UI parity)', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', safeUrl('blob:mock-video'));
    fixture.componentRef.setInput('loading', false);
    render();

    const videoEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    expect(videoEl).toBeTruthy();
    const playSpy = vi.spyOn(videoEl, 'play').mockImplementation(() => Promise.resolve());

    component.seekTo(42.5);

    expect(videoEl.currentTime).toBe(42.5);
    expect(playSpy).not.toHaveBeenCalled();
  });
});
