/**
 * NXENG-771 — WCAG 2.5.3 / IBM label_name_visible (Issue 133110887).
 * Icon-only replace-main-file control: hover tooltip and aria-label must use the same string.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { providePlatformEnglishFallback } from '../i18n/platform-english-fallback';
import { DocumentViewerComponent } from './document-viewer.component';

const REPLACE_MAIN_FILE = 'Replace main file';

describe('DocumentViewerComponent — replace main file label in name (NXENG-771)', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;

  beforeEach(async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService({ missingTranslationHandler: providePlatformEnglishFallback() }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
  });

  function renderWithMainFileControls(): HTMLButtonElement {
    const raw = 'blob:http://localhost/sample';
    const trusted = TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(raw);
    fixture.componentRef.setInput('mimeType', 'application/pdf');
    fixture.componentRef.setInput('blobUrl', trusted);
    fixture.componentRef.setInput('rawBlobUrl', raw);
    fixture.componentRef.setInput('blobType', 'application/pdf');
    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('showMainFileControls', true);
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector(
      `button[aria-label="${REPLACE_MAIN_FILE}"]`,
    ) as HTMLButtonElement | null;
    expect(btn).withContext('replace main file footer button').toBeTruthy();
    return btn as HTMLButtonElement;
  }

  it('uses the same accessible name and hover label for replace main file (IBM 133110887)', () => {
    const button = renderWithMainFileControls();
    expect(button.getAttribute('aria-label')).toBe(REPLACE_MAIN_FILE);

    const tooltipDe = fixture.debugElement
      .query((de) => de.nativeElement === button)
      ?.injector.get(MatTooltip);
    expect(tooltipDe?.message).toBe(REPLACE_MAIN_FILE);
    expect((tooltipDe?.message ?? '').toLowerCase()).toContain(
      (button.getAttribute('aria-label') ?? '').toLowerCase(),
    );
  });
});
