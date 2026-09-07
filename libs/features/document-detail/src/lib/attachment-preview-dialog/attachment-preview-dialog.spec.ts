import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import {
  AttachmentPreviewDialogComponent,
  type AttachmentPreviewData,
} from './attachment-preview-dialog';

const mockDialogRef = {
  close: vi.fn(),
};

/**
 * jsdom implements neither `URL.createObjectURL` nor `URL.revokeObjectURL`.
 *
 * Stubbed once for the whole file with counter arrays, never restored in `afterEach`: TestBed's
 * automatic fixture cleanup runs *after* our hooks, so putting `undefined` back made
 * `ngOnDestroy`'s `revokeObjectURL` throw during cleanup. Counters rather than bare no-ops
 * because create/revoke has to be asserted as a *pair* — this dialog owns the revoke for a blob
 * URL minted by its opener, and a missed revoke pins the whole attachment in memory.
 */
const created: string[] = [];
const revoked: string[] = [];
let blobSeq = 0;

(URL as unknown as { createObjectURL: unknown }).createObjectURL = vi.fn(() => {
  const url = `blob:mock/${(blobSeq += 1)}`;
  created.push(url);
  return url;
});
(URL as unknown as { revokeObjectURL: unknown }).revokeObjectURL = vi.fn((u: string) => {
  revoked.push(u);
});

/** Reads the write-only `rotation` field; see the rotation test for why that matters. */
function rotationOf(component: AttachmentPreviewDialogComponent): number {
  return (component as unknown as { rotation: number }).rotation;
}

async function createDialog(
  mimeType: string,
  useRealTemplate = false,
): Promise<{
  component: AttachmentPreviewDialogComponent;
  fixture: ComponentFixture<AttachmentPreviewDialogComponent>;
  rawUrl: string;
}> {
  TestBed.resetTestingModule();
  const rawUrl = URL.createObjectURL(new Blob(['payload']));

  const builder = TestBed.configureTestingModule({
    imports: [AttachmentPreviewDialogComponent, NoopAnimationsModule],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MatDialogRef, useValue: mockDialogRef },
      {
        // A real `SafeResourceUrl` from the real sanitizer, not a hand-rolled stand-in: the
        // template binds it straight into `img[src]`/`iframe[src]`, which is exactly where a
        // fake safe value would behave differently from the one the opener passes.
        provide: MAT_DIALOG_DATA,
        useFactory: (sanitizer: DomSanitizer): AttachmentPreviewData => ({
          name: 'report.bin',
          mimeType,
          blobUrl: sanitizer.bypassSecurityTrustResourceUrl(rawUrl),
          rawUrl,
        }),
        deps: [DomSanitizer],
      },
    ],
  });

  if (!useRealTemplate) {
    builder.overrideComponent(AttachmentPreviewDialogComponent, {
      set: { imports: [], template: '<div></div>' },
    });
  }
  await builder.compileComponents();

  const fixture = TestBed.createComponent(AttachmentPreviewDialogComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { component, fixture, rawUrl };
}

describe('AttachmentPreviewDialogComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    created.length = 0;
    revoked.length = 0;
  });

  describe('media type detection', () => {
    it('recognises any image/* subtype', async () => {
      const { component } = await createDialog('image/png');
      expect(component.isImage).toBe(true);
      expect(component.isPdf).toBe(false);
      expect(component.isVideo).toBe(false);
      expect(component.isAudio).toBe(false);
      expect(component.isText).toBe(false);
    });

    it('recognises PDFs by exact mime type', async () => {
      const { component } = await createDialog('application/pdf');
      expect(component.isPdf).toBe(true);
      expect(component.isImage).toBe(false);
    });

    it('recognises any video/* subtype', async () => {
      const { component } = await createDialog('video/mp4');
      expect(component.isVideo).toBe(true);
      expect(component.isAudio).toBe(false);
    });

    it('recognises any audio/* subtype', async () => {
      const { component } = await createDialog('audio/mpeg');
      expect(component.isAudio).toBe(true);
      expect(component.isVideo).toBe(false);
    });

    it('treats text/*, application/json and application/xml as text', async () => {
      const plain = await createDialog('text/plain');
      expect(plain.component.isText).toBe(true);

      const json = await createDialog('application/json');
      expect(json.component.isText).toBe(true);

      const xml = await createDialog('application/xml');
      expect(xml.component.isText).toBe(true);
    });

    it('classifies an unknown binary type as none of the previewable kinds', async () => {
      const { component } = await createDialog('application/octet-stream');
      expect(component.isImage).toBe(false);
      expect(component.isPdf).toBe(false);
      expect(component.isVideo).toBe(false);
      expect(component.isAudio).toBe(false);
      expect(component.isText).toBe(false);
    });
  });

  describe('zoom', () => {
    it('steps in and out by a quarter', async () => {
      const { component } = await createDialog('image/png');
      expect(component.zoom()).toBe(1);

      component.zoomIn();
      expect(component.zoom()).toBe(1.25);

      component.zoomOut();
      expect(component.zoom()).toBe(1);
    });

    it('clamps zoom-in at 5x', async () => {
      const { component } = await createDialog('image/png');
      for (let i = 0; i < 30; i += 1) component.zoomIn();
      expect(component.zoom()).toBe(5);
    });

    it('clamps zoom-out at 0.25x', async () => {
      const { component } = await createDialog('image/png');
      for (let i = 0; i < 30; i += 1) component.zoomOut();
      expect(component.zoom()).toBe(0.25);
    });

    it('resets zoom and rotation to their defaults', async () => {
      const { component } = await createDialog('image/png');
      component.zoomIn();
      component.rotateRight();

      component.zoomReset();

      expect(component.zoom()).toBe(1);
      expect(rotationOf(component)).toBe(0);
    });
  });

  /**
   * DEFECT (attachment-preview-dialog.ts:216, 255-261): `rotation` is write-only.
   *
   * `rotateLeft()`/`rotateRight()` mutate a private field that nothing reads — the template's
   * only transform is `scale(zoom())` — and `rotation` is not a signal, so even binding it
   * would not mark the view dirty under OnPush/zoneless. Both toolbar buttons are therefore
   * inert. Asserted as it actually behaves rather than fixed: making the image rotate is a
   * change to user-visible behaviour, which is a product decision.
   */
  describe('rotation', () => {
    it('accumulates the rotation angle in 90 degree steps', async () => {
      const { component } = await createDialog('image/png');

      component.rotateRight();
      expect(rotationOf(component)).toBe(90);

      component.rotateRight();
      expect(rotationOf(component)).toBe(180);

      component.rotateLeft();
      expect(rotationOf(component)).toBe(90);

      component.rotateLeft();
      component.rotateLeft();
      expect(rotationOf(component)).toBe(-90);
    });

    it('does not rotate the rendered image, because nothing binds the angle', async () => {
      const { component, fixture } = await createDialog('image/png', true);

      const img = fixture.nativeElement.querySelector('img.viewer-img') as HTMLImageElement;
      // Presence first: the image really is on the page, so the transform assertion below is
      // about the transform and not about a missing element.
      expect(img).toBeTruthy();
      expect(img.style.transform).toBe('scale(1)');

      component.rotateRight();
      component.zoomIn();
      fixture.detectChanges();

      // Zoom took effect; the rotation did not.
      expect(img.style.transform).toBe('scale(1.25)');
      expect(img.style.transform).not.toContain('rotate');
    });
  });

  it('closes on the header close button', async () => {
    const { component } = await createDialog('image/png');
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('revokes exactly the blob URL it was given, when destroyed', async () => {
    const { fixture, rawUrl } = await createDialog('image/png');

    expect(created).toContain(rawUrl);
    expect(revoked).not.toContain(rawUrl);

    fixture.destroy();

    // Create and revoke asserted as a pair: an unrevoked blob keeps the whole attachment
    // resident for the lifetime of the tab. Revoked exactly once — double-revoking is a
    // symptom of two owners, which is how a URL gets revoked while still displayed.
    expect(revoked.filter((u) => u === rawUrl)).toHaveLength(1);
  });
});
