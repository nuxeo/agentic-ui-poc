/**
 * NXENG-789 — document detail header `.ke-action-btn` keyboard focus indicator.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentDetailComponent — ke-action focus ring (NXENG-789)', () => {
  it('declares a standalone :focus ring on header action buttons', () => {
    const scss = readFileSync(join(import.meta.dirname, 'document-detail.scss'), 'utf8');
    expect(scss).toMatch(/\.ke-action-btn\.mat-mdc-outlined-button:focus\s*\{/);
    expect(scss).not.toMatch(/\.ke-action-btn\.mat-mdc-outlined-button:focus,\s/);
    expect(scss).toMatch(
      /\.ke-action-btn\.mat-mdc-outlined-button:focus[\s\S]*outline-width:\s*2px/,
    );
    expect(scss).toMatch(/\.ke-action-btn\.mat-mdc-outlined-button:focus-visible\s*\{/);
  });
});
