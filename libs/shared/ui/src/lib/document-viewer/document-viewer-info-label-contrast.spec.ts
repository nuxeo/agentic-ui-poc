/**
 * NXENG-812 — `.info-label` on the fixed light `.picture-cards` strip must meet WCAG 2.1 SC 1.4.3
 * (IBM 716638997). Per-theme Karma coverage:
 * `apps/nuxeo-ui/.../document-viewer-info-label-contrast.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

describe('DocumentViewerComponent — info-label text contrast (NXENG-812)', () => {
  it('pins .info-label to the light-strip muted token per NXENG-812', () => {
    const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const label = scssBlock(scss, 'info-label');
    expect(label).toMatch(/var\(--document-viewer-muted-on-light-surface\)/);
    expect(label).not.toMatch(/color:\s*#777/i);
    expect(label).not.toMatch(/var\(--mat-sys-on-surface-variant/i);
  });
});
