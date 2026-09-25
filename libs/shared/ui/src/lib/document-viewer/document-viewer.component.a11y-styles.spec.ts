import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * NXENG-901 — `.format-type` used `#999` (2.85:1 on white), below WCAG AA for 11px text.
 * Guard the stylesheet token so the regression cannot silently return.
 */
describe('DocumentViewerComponent a11y styles (NXENG-901)', () => {
  const scss = readFileSync(join(import.meta.dirname, 'document-viewer.component.scss'), 'utf8');

  it('styles format-type with a theme contrast token, not hardcoded #999', () => {
    const block = scss.match(/\.format-type\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('--mat-sys-on-surface-variant');
    expect(block).not.toMatch(/color:\s*#999\b/);
  });
});
