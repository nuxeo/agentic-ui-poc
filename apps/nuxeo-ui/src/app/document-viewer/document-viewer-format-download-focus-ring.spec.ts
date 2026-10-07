/**
 * NXENG-786 / NXENG-781 — Additional-formats download buttons must show a keyboard focus
 * indicator in real Chrome (IBM style_focus_visible / WCAG 2.4.7).
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { testTranslateModule } from '../i18n/translate-testing';

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function rgb(css: string): [number, number, number] {
  const parts = (css.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  // Pull in the real viewer stylesheet under test.
  styleUrls: ['../../../../../libs/shared/ui/src/lib/document-viewer/document-viewer.component.scss'],
  templateUrl: './document-viewer-format-download-focus-ring.spec.html',
})
class DocumentViewerFormatDownloadFocusHostComponent {}

describe('DocumentViewer Download Medium — keyboard focus indicator (NXENG-786)', () => {
  let fixture: ComponentFixture<DocumentViewerFormatDownloadFocusHostComponent>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerFormatDownloadFocusHostComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerFormatDownloadFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    button = fixture.nativeElement.querySelector('.format-download-btn') as HTMLButtonElement;
  });

  afterEach(() => {
    button?.blur();
    fixture.nativeElement.remove();
  });

  it('draws a 2px solid outline on Download Medium when focused', () => {
    button.focus();
    expect(document.activeElement).toBe(button);

    const style = getComputedStyle(button);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(parseFloat(style.outlineOffset)).toBeGreaterThan(0);
  });

  it('meets 3:1 non-text contrast against the light-strip surface', () => {
    button.focus();
    const style = getComputedStyle(button);
    expect(style.outlineStyle).not.toBe('none');

    const cards = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement;
    const surface = getComputedStyle(cards).backgroundColor;
    expect(contrastRatio(rgb(style.outlineColor), rgb(surface))).toBeGreaterThanOrEqual(3);
  });
});
