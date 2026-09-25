/**
 * NXENG-763 — `.file-size` in the viewer footer must meet WCAG 2.1 SC 1.4.3 (IBM 56037090).
 * Per-theme contrast is covered in `apps/nuxeo-ui/.../document-viewer-file-size-contrast.spec.ts`.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentViewerComponent } from './document-viewer.component';

const WCAG_AA_NORMAL_TEXT = 4.5;

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function parseRgb(css: string): [number, number, number] | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function luminance([r, g, b]: readonly number[]): number {
  const s = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrastRatio(fg: readonly number[], bg: readonly number[]): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function opaqueBackground(element: HTMLElement): [number, number, number] {
  const own = parseRgb(getComputedStyle(element).backgroundColor);
  if (own && getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)') {
    return own;
  }
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const bg = parseRgb(getComputedStyle(node).backgroundColor);
    if (bg && getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
  }
  return [255, 255, 255];
}

describe('DocumentViewerComponent — file-size text contrast (NXENG-763)', () => {
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

  it('themes .viewer-footer and .file-size as a matched surface/foreground pair', () => {
    const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const footer = scssBlock(scss, 'viewer-footer');
    const label = scssBlock(scss, 'file-size');
    expect(footer).toMatch(/var\(--mat-sys-surface/);
    expect(label).toMatch(/var\(--mat-sys-on-surface-variant/);
    expect(label).not.toMatch(/#888/i);
  });

  it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the footer surface fallback`, () => {
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

    const fileSize = fixture.nativeElement.querySelector('.file-size') as HTMLElement | null;
    const footer = fixture.nativeElement.querySelector('.viewer-footer') as HTMLElement | null;
    expect(fileSize).not.toBeNull();
    expect(footer).not.toBeNull();
    if (!fileSize || !footer) return;

    const fg = parseRgb(getComputedStyle(fileSize).color);
    expect(fg).not.toBeNull();
    if (!fg) return;

    const bg = opaqueBackground(footer);
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
