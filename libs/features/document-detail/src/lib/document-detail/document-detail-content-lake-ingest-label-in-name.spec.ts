/**

 * NXENG-793 / IBM 326007366 — Content Lake ingest icon button must expose the same words in

 * matTooltip and the accessible name (WCAG 2.5.3 label-in-name). IBM counts mat-icon ligature

 * text as visible labelling when it is not aria-hidden.

 */

import { readFileSync } from 'node:fs';

import { dirname, join } from 'node:path';

import { fileURLToPath } from 'node:url';

const templatePath = join(dirname(fileURLToPath(import.meta.url)), 'document-detail.html');

const INGEST_KEY = 'document-detail.document-detail.ingest-to-content-lake';

describe('Document detail Content Lake ingest label in name (NXENG-793)', () => {
  it('keeps ingest tooltip text in a cdk-visually-hidden span and hides the icon ligature', () => {
    const html = readFileSync(templatePath, 'utf8');

    const ingestBlock = html.match(/class="content-lake-ingest-btn"[\s\S]*?<\/button>/)?.[0];

    expect(ingestBlock, 'Content Lake ingest button markup').toBeTruthy();

    expect(ingestBlock).toContain(`[matTooltip]="'${INGEST_KEY}' | translate"`);

    expect(ingestBlock).toContain('class="cdk-visually-hidden" cdkAriaLive="off"');

    expect(ingestBlock).toContain(`'${INGEST_KEY}' | translate`);

    expect(ingestBlock).not.toContain('[attr.aria-label]');

    expect(ingestBlock).toContain('<mat-icon aria-hidden="true">cloud_upload</mat-icon>');
  });
});
