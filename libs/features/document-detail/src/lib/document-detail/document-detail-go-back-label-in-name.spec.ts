/**
 * NXENG-826 / IBM 1125713158 — header Go back must not expose icon ligature as visible label
 * text competing with aria-label (WCAG 2.5.3 label-in-name).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatePath = join(dirname(fileURLToPath(import.meta.url)), 'document-detail.html');

describe('Document detail Go back label in name (NXENG-826)', () => {
  it('hides the arrow icon from the accessibility tree on the header back button', () => {
    const html = readFileSync(templatePath, 'utf8');
    const headerBlock = html.match(
      /class="detail-header"[\s\S]*?<\/div>\s*<div class="header-actions">/,
    )?.[0];
    expect(headerBlock, 'detail header markup').toBeTruthy();
    const backButton = headerBlock!.match(/<button[\s\S]*?mat-icon-button[\s\S]*?<\/button>/)?.[0];
    expect(backButton, 'header go back button').toBeTruthy();
    expect(backButton).toContain(
      '[attr.aria-label]="\'document-detail.document-detail.go-back\' | translate"',
    );
    expect(backButton).toMatch(/<mat-icon\s+aria-hidden="true">arrow_back<\/mat-icon>/);
  });
});
