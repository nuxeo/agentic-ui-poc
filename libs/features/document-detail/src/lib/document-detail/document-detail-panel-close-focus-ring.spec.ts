/**
 * NXENG-830 — document detail properties panel close button keyboard focus indicator.
 * Source-level IBM `style_focus_visible` contract (standalone `:focus` selector). Runtime
 * contrast: `apps/nuxeo-ui/.../panel-close-focus-ring.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentDetailComponent — panel close focus ring (NXENG-830)', () => {
  it('declares a standalone :focus ring on the properties panel close control', () => {
    const scss = readFileSync(join(import.meta.dirname, 'document-detail.scss'), 'utf8');
    expect(scss).toMatch(/\.panel-close-btn\.mat-mdc-icon-button:focus\s*\{/);
    expect(scss).not.toMatch(/\.panel-close-btn\.mat-mdc-icon-button:focus,\s/);
    expect(scss).toMatch(
      /\.panel-close-btn\.mat-mdc-icon-button:focus[\s\S]*outline:\s*2px\s+solid\s+var\(--document-detail-properties-label-muted\)/,
    );
  });
});
