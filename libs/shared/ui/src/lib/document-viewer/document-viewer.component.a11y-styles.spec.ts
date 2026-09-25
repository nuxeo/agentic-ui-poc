import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';

@Component({
  standalone: true,
  styleUrls: ['./document-viewer.component.scss'],
  templateUrl: './document-viewer-format-type-a11y.host.html',
})
class DocumentViewerFormatTypeA11yHostComponent {}

describe('DocumentViewerComponent a11y styles (NXENG-901)', () => {
  let fixture: ComponentFixture<DocumentViewerFormatTypeA11yHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerFormatTypeA11yHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerFormatTypeA11yHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('styles format-type from --mat-sys-on-surface-variant in SCSS', () => {
    const scss = readFileSync(`${import.meta.dirname}/document-viewer.component.scss`, 'utf8');
    const block = scss.match(/\.format-type\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('var(--mat-sys-on-surface-variant, #5c5f6b)');
    expect(block).not.toContain('--document-viewer-muted-on-light-surface');
    expect(scss).not.toMatch(/:host\s*\{[^}]*--document-viewer-muted-on-light-surface/s);
  });
});
