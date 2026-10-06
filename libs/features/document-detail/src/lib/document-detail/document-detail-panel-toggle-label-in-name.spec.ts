/**
 * NXENG-766 / IBM 133110887 — details panel toggle must expose the same words in
 * matTooltip and aria-label (WCAG 2.5.3 label-in-name).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const templatePath = join(dirname(fileURLToPath(import.meta.url)), 'document-detail.html');

describe('Document detail panel toggle label in name (NXENG-766)', () => {
  it('binds matTooltip and aria-label to the same show/hide details key', () => {
    const html = readFileSync(templatePath, 'utf8');
    const toggleBlock = html.match(/class="panel-toggle-btn"[\s\S]*?<\/button>/)?.[0];
    expect(toggleBlock).withContext('panel toggle button markup').toBeTruthy();
    expect(toggleBlock).toContain('[matTooltip]="detailsPanelToggleLabelKey() | translate"');
    expect(toggleBlock).toContain('[attr.aria-label]="detailsPanelToggleLabelKey() | translate"');
    expect(toggleBlock).not.toContain('toggle-details-panel');
    expect(toggleBlock).toContain('aria-hidden="true"');
  });
});
