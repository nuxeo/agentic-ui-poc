import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { vi } from 'vitest';
import { DocumentViewerComponent, type VideoSource } from './document-viewer.component';
describe('DocumentViewerComponent', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;
  let component: DocumentViewerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideExperimentalZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
    component = fixture.componentInstance;
  });

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
    await fixture.whenStable();

    expect(component.contentType()).toBe('video');
    expect(component.showVideoInfoCard()).toBe(false);
  });

  it('shows the video info card when metadata is present', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', 'blob:mock-video' as VideoSource['url']);
    fixture.componentRef.setInput('videoInfo', { duration: 12, width: 1920, height: 1080 });
    await fixture.whenStable();

    expect(component.contentType()).toBe('video');
    expect(component.showVideoInfoCard()).toBe(true);
  });

  it('returns none when no blob, preview, or video sources exist', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', null);
    fixture.componentRef.setInput('previewUrl', null);
    fixture.componentRef.setInput('videoSources', []);
    await fixture.whenStable();

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
    await fixture.whenStable();

    expect(component.showVideoStoryboard()).toBe(true);
  });

  it('seeks without auto-playing (Web UI parity)', async () => {
    fixture.componentRef.setInput('mimeType', 'video/mp4');
    fixture.componentRef.setInput('blobUrl', 'blob:mock-video' as VideoSource['url']);
    fixture.componentRef.setInput('loading', false);
    await fixture.whenStable();
    fixture.detectChanges();

    const videoEl = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const playSpy = vi.spyOn(videoEl, 'play').mockImplementation(() => Promise.resolve());

    component.seekTo(42.5);

    expect(videoEl.currentTime).toBe(42.5);
    expect(playSpy).not.toHaveBeenCalled();
  });
});
