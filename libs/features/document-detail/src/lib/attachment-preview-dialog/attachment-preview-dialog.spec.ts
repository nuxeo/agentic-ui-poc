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
  overrides: Partial<AttachmentPreviewData> = {},
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
          // Defaults to agreeing with the metadata type, which is the normal case. Tests that care
          // about the metadata/served mismatch override it explicitly.
          blobType: mimeType,
          blobUrl: sanitizer.bypassSecurityTrustResourceUrl(rawUrl),
          rawUrl,
          ownsRawUrl: true,
          ...overrides,
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

    it('treats the inert text types as text', async () => {
      for (const mime of ['text/plain', 'text/csv', 'application/json']) {
        const { component } = await createDialog(mime);
        expect(component.isText, mime).toBe(true);
      }
    });

    it('ignores a charset parameter and letter case when matching', async () => {
      const withCharset = await createDialog('text/plain; charset=utf-8');
      expect(withCharset.component.isText).toBe(true);

      const upper = await createDialog('TEXT/PLAIN');
      expect(upper.component.isText).toBe(true);
    });

    /**
     * The load-bearing half. `isText` used to be `startsWith('text/')`, which matched `text/html`
     * and rendered it in an iframe on a `blob:` URL — and a blob URL inherits the creating page's
     * origin, so an uploaded HTML attachment ran script against our own origin. Every case here is
     * a type that must NOT reach the iframe; the inert types above are the positive control proving
     * the allow-list still admits something.
     *
     * The XML cases are the second round of this: XML is parsed as markup, so namespaced SVG script
     * runs and an `<?xml-stylesheet type="text/xsl">` instruction can pull in XSLT that emits
     * scripted HTML. Rejecting `image/svg+xml` alone left that path open.
     */
    it('refuses to preview executable text types in the iframe', async () => {
      for (const mime of [
        'text/html',
        'text/xsl',
        'application/xhtml+xml',
        'image/svg+xml',
        'text/xml',
        'application/xml',
        'application/rss+xml',
        'text/html; charset=utf-8',
        'TEXT/HTML',
        'Text/XML',
      ]) {
        const { component } = await createDialog(mime);
        expect(component.isText, mime).toBe(false);
      }
    });

    /**
     * The metadata/served-type mismatch. The browser parses the iframe document by the served
     * `Content-Type`, not by what the document record claims, so checking only `mimeType` let an
     * HTML-served blob through under a `text/plain` or `application/pdf` record.
     *
     * The empty-`blobType` cases are the no-`Content-Type` scenario, where the browser would sniff:
     * `''` is not on the allow-list, so the branch is refused rather than guessed at.
     */
    it('refuses the iframe when the served type disagrees with the metadata type', async () => {
      const cases: Array<[string, string]> = [
        ['text/plain', 'text/html'],
        ['application/json', 'text/html'],
        ['text/csv', 'application/xhtml+xml'],
        ['text/plain', ''],
      ];
      for (const [mimeType, blobType] of cases) {
        const { component } = await createDialog(mimeType, false, { blobType });
        expect(component.isText, `${mimeType} served as "${blobType}"`).toBe(false);
      }
    });

    it('refuses a PDF whose served type is not PDF', async () => {
      const served = await createDialog('application/pdf', false, { blobType: 'text/html' });
      expect(served.component.isPdf).toBe(false);

      const absent = await createDialog('application/pdf', false, { blobType: '' });
      expect(absent.component.isPdf).toBe(false);

      // Positive control: agreement still previews, so the gate is discriminating rather than
      // refusing every PDF.
      const agreed = await createDialog('application/pdf', false, { blobType: 'application/pdf' });
      expect(agreed.component.isPdf).toBe(true);
    });

    it('accepts a served type that carries a charset parameter', async () => {
      const { component } = await createDialog('text/plain', false, {
        blobType: 'text/plain; charset=utf-8',
      });
      expect(component.isText).toBe(true);
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

  describe('accessibility', () => {
    /**
     * An iframe with no accessible name is announced as just "frame". Both preview iframes take their
     * name from the attachment, which is the only thing that distinguishes them to a screen reader.
     */
    it('names the pdf preview iframe after the attachment', async () => {
      const { fixture } = await createDialog('application/pdf', true, {
        name: 'quarterly-report.pdf',
        blobType: 'application/pdf',
      });
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement | null;
      expect(iframe).not.toBeNull();
      expect(iframe!.getAttribute('title')).toBe('quarterly-report.pdf');
    });

    it('names the text preview iframe after the attachment', async () => {
      const { fixture } = await createDialog('text/plain', true, {
        name: 'notes.txt',
        blobType: 'text/plain',
      });
      const iframe = fixture.nativeElement.querySelector('iframe') as HTMLIFrameElement | null;
      expect(iframe).not.toBeNull();
      expect(iframe!.getAttribute('title')).toBe('notes.txt');
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

  it('does not revoke a blob URL it does not own', async () => {
    // `previewMainBlob` shares the document viewer's object URL, which is still bound behind the
    // dialog. Revoking it on close would blank the page underneath. That case used to be
    // expressed by passing `rawUrl: ''`, which also silently starved `<source [src]>`.
    const { fixture, rawUrl } = await createDialog('video/mp4', false, { ownsRawUrl: false });
    fixture.destroy();
    expect(revoked).not.toContain(rawUrl);
  });

  // ---- rendered attributes ---------------------------------------------------------------------
  //
  // These read the DOM rather than a component flag, and that distinction is the whole point.
  // `source[src]` is `SecurityContext.NONE` in Angular's DOM security schema, so no sanitizer
  // runs, a `Safe*` value is never unwrapped, and the browser coerces it with `toString()` —
  // writing the literal string `"SafeValue must use [property]=binding: …"` into `src`. Video and
  // audio attachment previews were broken exactly that way, and the `isVideo`/`isAudio`
  // assertions above passed throughout, because a flag being right says nothing about what was
  // rendered.
  describe('media sources render a usable URL', () => {
    it('binds the raw object URL into video source[src], not the SafeValue placeholder', async () => {
      const { fixture, rawUrl } = await createDialog('video/mp4', true);
      const source = fixture.nativeElement.querySelector('video source');

      expect(source).not.toBeNull();
      expect(source!.getAttribute('src')).toBe(rawUrl);
      expect(source!.getAttribute('src')).not.toContain('SafeValue must use');
    });

    it('binds the raw object URL into audio source[src], not the SafeValue placeholder', async () => {
      const { fixture, rawUrl } = await createDialog('audio/mpeg', true);
      const source = fixture.nativeElement.querySelector('audio source');

      expect(source).not.toBeNull();
      expect(source!.getAttribute('src')).toBe(rawUrl);
      expect(source!.getAttribute('src')).not.toContain('SafeValue must use');
    });

    it('keeps the wrapped value on iframe[src], which throws on a raw string', async () => {
      const { fixture, rawUrl } = await createDialog('application/pdf', true);
      const iframe = fixture.nativeElement.querySelector('iframe');

      // Angular unwraps the SafeResourceUrl here because RESOURCE_URL *does* run a sanitizer.
      // If this ever renders the placeholder, the two bindings have been swapped.
      expect(iframe).not.toBeNull();
      expect(iframe!.getAttribute('src')).toBe(rawUrl);
      expect(iframe!.getAttribute('src')).not.toContain('SafeValue must use');
    });
  });
});
