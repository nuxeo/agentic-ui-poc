/**
 * NXENG-786 / NXENG-781 — SCSS contract for Additional-formats download focus rings.
 * Rendered cascade is covered in `apps/nuxeo-ui/.../document-viewer-format-download-focus-ring.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentViewer format download — focus SCSS (NXENG-786)', () => {
  it('declares a standalone :focus rule for IBM style_focus_visible (not a comma list)', () => {
    const scss = readFileSync(join(import.meta.dirname, 'document-viewer.component.scss'), 'utf8');
    expect(scss).toMatch(/\.format-download-btn\.mat-mdc-icon-button:focus\s*\{/);
    const block = scss.match(/\.format-download-btn\.mat-mdc-icon-button:focus\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toMatch(/outline-style:\s*solid/);
    expect(block).toMatch(/outline-width:\s*2px/);
    expect(block).toMatch(/outline-color:\s*var\(--mat-sys-primary/);
    expect(scss).not.toMatch(/\.format-download-btn[^}]*&:focus,\s*&/);
  });
});
