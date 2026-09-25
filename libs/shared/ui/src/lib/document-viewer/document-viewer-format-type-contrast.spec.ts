/**
 * NXENG-760 — `.format-type` pairs with a themed `.picture-cards` surface (not hard-coded #fff).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('document viewer — format-type text contrast (NXENG-760)', () => {
  const scss = readFileSync(
    join(process.cwd(), 'libs/shared/ui/src/lib/document-viewer/document-viewer.component.scss'),
    'utf8',
  );

  it('styles .format-type with the theme secondary text token, not #999', () => {
    const block = scss.match(/\.format-type\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('var(--mat-sys-on-surface-variant');
    expect(block).not.toMatch(/color:\s*#999/);
  });

  it('themes .picture-cards with --mat-sys-surface so foreground tokens stay paired', () => {
    const block = scss.match(/\.picture-cards\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('var(--mat-sys-surface');
    expect(block).not.toMatch(/background:\s*#fff/);
  });
});
