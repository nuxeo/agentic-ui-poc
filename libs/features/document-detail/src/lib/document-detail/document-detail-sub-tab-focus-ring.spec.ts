/**
 * NXENG-776 / NXENG-792 — document detail sidebar `.sub-tab` keyboard focus indicator.
 * Source-level IBM `style_focus_visible` contract (standalone `:focus` selector). Runtime
 * contrast and inset geometry: `apps/nuxeo-ui/.../sub-tab-focus-ring.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentDetailComponent — sub-tab focus ring (NXENG-792)', () => {
  it('declares a standalone :focus ring on sidebar sub-tabs', () => {
    const scss = readFileSync(join(import.meta.dirname, 'document-detail.scss'), 'utf8');
    expect(scss).toMatch(/\.sub-tab:focus\s*\{/);
    expect(scss).not.toMatch(/\.sub-tab:focus,\s/);
    expect(scss).toMatch(
      /\.sub-tab:focus[\s\S]*outline:\s*2px\s+solid\s+var\(--document-detail-properties-label-muted\)/,
    );
  });
});
