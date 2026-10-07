/**
 * NXENG-781 / NXENG-786 — additional-format download icon buttons must show a keyboard focus
 * indicator (IBM `style_focus_visible`, WCAG 2.4.7). Material suppresses the default ring.
 *
 * Vitest/jsdom does not paint outlines reliably; pin the stylesheet contract (standalone
 * `:focus` selector, 2px ring) the same way as `document-viewer-format-type-contrast.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentViewerComponent — format download focus ring (NXENG-781 / NXENG-786)', () => {
  it('declares a standalone :focus ring on .format-download-btn.mat-mdc-icon-button', () => {
    const scss = readFileSync(join(import.meta.dirname, 'document-viewer.component.scss'), 'utf8');
    expect(scss).toMatch(/\.format-download-btn\.mat-mdc-icon-button:focus\s*\{/);
    expect(scss).not.toMatch(/\.format-download-btn\.mat-mdc-icon-button:focus,\s/);
    expect(scss).toMatch(
      /\.format-download-btn\.mat-mdc-icon-button:focus[\s\S]*outline:\s*2px\s+solid/,
    );
    expect(scss).toMatch(/\.format-download-btn\.mat-mdc-icon-button:focus[\s\S]*outline-offset:\s*2px/);
  });
});
