/**
 * NXENG-763 / IBM 56037090 — the viewer footer file-size label must use a theme token
 * that meets WCAG AA text contrast on the footer surface, not hardcoded #888.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocumentViewerComponent } from './document-viewer.component';

function fileSizeRuleText(): string {
  const chunks: string[] = [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (rule.cssText.includes('.file-size')) {
        chunks.push(rule.cssText);
      }
    }
  }
  return chunks.join('\n');
}

describe('DocumentViewerComponent file-size contrast (NXENG-763)', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;

  beforeEach(async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
  });

  afterEach(() => {
    fixture.destroy();
    vi.restoreAllMocks();
  });

  it('styles the file-size label with on-surface-variant, not low-contrast #888', () => {
    const raw = 'blob:http://localhost/sample';
    const trusted = (): SafeResourceUrl =>
      TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(raw);

    fixture.componentRef.setInput('fileName', 'sample.csv');
    fixture.componentRef.setInput('fileSize', '182 B');
    fixture.componentRef.setInput('mimeType', 'text/csv');
    fixture.componentRef.setInput('blobUrl', trusted());
    fixture.componentRef.setInput('rawBlobUrl', raw);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();

    const rule = fileSizeRuleText();
    expect(rule).toContain('.file-size');
    expect(rule).toContain('var(--mat-sys-on-surface-variant)');
    expect(rule).not.toMatch(/\.file-size[^}]*#888/i);

    const label = fixture.nativeElement.querySelector('.file-size') as HTMLElement;
    expect(label?.textContent?.trim()).toBe('182 B');
  });
});
