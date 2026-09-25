/**
 * NXENG-901 — `.format-type` must consume `--mat-sys-on-surface-variant`, not a detached alias.
 * Karma/jsdom in `ui` does not apply this component SCSS; this host spec does.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  standalone: true,
  styleUrls: [
    '../../../../../libs/shared/ui/src/lib/document-viewer/document-viewer.component.scss',
  ],
  templateUrl: './document-viewer-format-type-mat-token.host.html',
})
class DocumentViewerFormatTypeMatTokenHostComponent {}

describe('document viewer format-type Material token (NXENG-901)', () => {
  let fixture: ComponentFixture<DocumentViewerFormatTypeMatTokenHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerFormatTypeMatTokenHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerFormatTypeMatTokenHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    (fixture.nativeElement as HTMLElement).style.removeProperty('--mat-sys-on-surface-variant');
    fixture.nativeElement.remove();
  });

  it('applies viewer SCSS to format-type (11px label)', () => {
    const label = fixture.nativeElement.querySelector('.format-type') as HTMLElement;
    expect(getComputedStyle(label).fontSize).toBe('11px');
  });

  it('resolves format-type colour through --mat-sys-on-surface-variant on the host', () => {
    const host = fixture.nativeElement as HTMLElement;
    const label = fixture.nativeElement.querySelector('.format-type') as HTMLElement;
    const SENTINEL = 'rgb(1, 2, 3)';
    host.style.setProperty('--mat-sys-on-surface-variant', SENTINEL);
    fixture.detectChanges();

    expect(getComputedStyle(label).color).toBe(SENTINEL);
  });
});
