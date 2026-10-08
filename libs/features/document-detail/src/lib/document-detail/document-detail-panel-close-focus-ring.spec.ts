/**
 * NXENG-830 — document detail properties panel close button keyboard focus indicator.
 * Source-level IBM `style_focus_visible` contract (standalone `:focus` selector) and production
 * template wiring. Runtime contrast and inset geometry:
 * `apps/nuxeo-ui/.../panel-close-focus-ring.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentDetailComponent — panel close focus ring (NXENG-830)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const templatePath = join(import.meta.dirname, 'document-detail.html');

  it('wires panel-close-btn on the production properties panel close control', () => {
    const html = readFileSync(templatePath, 'utf8');
    const closeBlock = html.match(
      /<button[\s\S]*?class="panel-close-btn"[\s\S]*?closePropertiesPanel\(\)[\s\S]*?<\/button>/,
    )?.[0];
    expect(closeBlock, 'properties panel close button markup').toBeTruthy();
    expect(closeBlock).toContain('mat-icon-button');
    expect(closeBlock).toContain('(click)="closePropertiesPanel()"');
    expect(closeBlock).toContain(
      '[attr.aria-label]="\'document-detail.document-detail.close-panel\' | translate"',
    );
  });

  it('declares a standalone :focus ring on the properties panel close control', () => {
    const scss = readFileSync(scssPath, 'utf8');
    expect(scss).toMatch(/\.panel-close-btn\.mat-mdc-icon-button:focus\s*\{/);
    expect(scss).not.toMatch(/\.panel-close-btn\.mat-mdc-icon-button:focus,\s/);
    expect(scss).toMatch(
      /\.panel-close-btn\.mat-mdc-icon-button:focus[\s\S]*outline:\s*2px\s+solid\s+var\(--document-detail-properties-label-muted\)/,
    );
  });
});
