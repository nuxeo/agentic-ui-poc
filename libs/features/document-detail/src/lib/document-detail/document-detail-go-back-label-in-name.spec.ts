/**
 * NXENG-826 / IBM 1125713158 — header Go back must not expose icon ligature as visible label
 * text competing with aria-label (WCAG 2.5.3 label-in-name). MatIcon adds aria-hidden by default,
 * but IBM still counts ligature text nodes as visible labelling.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatePath = join(dirname(fileURLToPath(import.meta.url)), 'document-detail.html');

describe('Document detail Go back label in name (NXENG-826)', () => {
  it('renders the header back glyph without Material ligature text in the DOM', () => {
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
    const iconMarkup = backButton!.match(/<mat-icon[\s\S]*?<\/mat-icon>/)?.[0];
    expect(iconMarkup, 'header back mat-icon').toBeTruthy();
    expect(iconMarkup).toContain('fontIcon="arrow_back"');
    expect(iconMarkup, 'ligature text must not appear as mat-icon content').not.toMatch(
      />\s*arrow_back\s*</,
    );
  });
});
