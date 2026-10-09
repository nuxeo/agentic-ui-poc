import { addProjectConfiguration, type Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import satoriComponentGenerator from './generator';

const ROOT = 'libs/shared/satori-components';
const PROVIDER = `${ROOT}/src/lib/provide-nxs-components.ts`;
const BARREL = `${ROOT}/src/index.ts`;
const REFERENCE = 'docs/extension-reference.md';

const PROVIDER_SOURCE = `import type { EnvironmentProviders } from '@angular/core';
import { provideSatoriExtensions } from '@nuxeo-satori/platform/extensions';

import { NxsTagComponent } from './tag/tag.component';
// satori:import:components — \`satori-component\` inserts above this line

export function provideNxsComponents(): EnvironmentProviders {
  return provideSatoriExtensions({
    components: {
      'nxs.primitives.tag': NxsTagComponent,
      // satori:register:components — \`satori-component\` inserts above this line
    },
  });
}
`;

const REFERENCE_SOURCE = `# Reference

<!-- satori:register:nxs-components — \`satori-component\` appends a row to the table below -->

| Component ID | Element | For the slot |
| ------------ | ------- | ------------ |

---
`;

function library(tree: Tree): void {
  addProjectConfiguration(tree, 'satori-components', {
    root: ROOT,
    sourceRoot: `${ROOT}/src`,
    projectType: 'library',
  });
  tree.write(PROVIDER, PROVIDER_SOURCE);
  tree.write(
    BARREL,
    "export { NxsTagComponent } from './lib/tag/tag.component';\n// satori:export:components\n",
  );
  tree.write(REFERENCE, REFERENCE_SOURCE);
}

describe('satori-component generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    library(tree);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  it('writes the component, its spec and its story', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-summary', slot: 'sidebar' });
    for (const suffix of [
      'component.ts',
      'component.html',
      'component.scss',
      'component.spec.ts',
      'stories.ts',
    ]) {
      expect(tree.exists(`${ROOT}/src/lib/claim-summary/claim-summary.${suffix}`)).toBe(true);
    }
    const component = tree.read(
      `${ROOT}/src/lib/claim-summary/claim-summary.component.ts`,
      'utf-8',
    );
    expect(component).toContain("selector: 'nxs-claim-summary'");
    expect(component).toContain('standalone: true');
    expect(component).toContain('export class NxsClaimSummaryComponent');
    expect(component).not.toContain('document = input');
  });

  it('registers the ID as live code above the marker, with its import', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-summary', slot: 'tabs' });
    const provider = tree.read(PROVIDER, 'utf-8') ?? '';
    const lines = provider.split('\n').map((line) => line.trim());
    expect(lines).toContain("'nxs.tabs.claimSummary': NxsClaimSummaryComponent,");
    expect(lines).toContain(
      "import { NxsClaimSummaryComponent } from './claim-summary/claim-summary.component';",
    );
    expect(provider.indexOf("'nxs.tabs.claimSummary'")).toBeLessThan(
      provider.indexOf('satori:register:components'),
    );
  });

  it('exports the component from the barrel', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-summary', slot: 'tabs' });
    expect(tree.read(BARREL, 'utf-8')).toContain(
      "export { NxsClaimSummaryComponent } from './lib/claim-summary/claim-summary.component';",
    );
  });

  it('documents the ID as a row of the reference table, not after it', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-summary', slot: 'tabs' });
    const reference = (tree.read(REFERENCE, 'utf-8') ?? '').split('\n');
    const header = reference.findIndex((line) => line.startsWith('| Component ID'));
    const row = reference.findIndex((line) => line.includes('`nxs.tabs.claimSummary`'));
    expect(row).toBe(header + 2);
    expect(reference[row]).toContain('`nxs-claim-summary`');
  });

  it('gives a documentView component the document input that slot passes', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-view', slot: 'documentView' });
    const dir = `${ROOT}/src/lib/claim-view`;
    expect(tree.read(`${dir}/claim-view.component.ts`, 'utf-8')).toContain(
      'readonly document = input<NuxeoDocument | null>(null);',
    );
    expect(tree.read(`${dir}/claim-view.component.html`, 'utf-8')).toContain('doc.title');
    expect(tree.read(`${dir}/claim-view.component.spec.ts`, 'utf-8')).toContain(
      'shows the focused document’s title',
    );
  });

  it('gives a routes entry the path a route descriptor needs', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-page', slot: 'routes' });
    expect(tree.read(`${ROOT}/src/lib/claim-page/claim-page.component.spec.ts`, 'utf-8')).toContain(
      "path: 'claim-page'",
    );
  });

  it('refuses a slot that does not render a component by ID', async () => {
    await expect(
      satoriComponentGenerator(tree, { name: 'x', slot: 'toolbar' as never }),
    ).rejects.toThrow(/--slot must be one of sidebar, tabs, documentView, routes/);
  });

  it('refuses to register an ID twice', async () => {
    await satoriComponentGenerator(tree, { name: 'claim-summary', slot: 'tabs' });
    await expect(
      satoriComponentGenerator(tree, { name: 'claim-summary', slot: 'tabs' }),
    ).rejects.toThrow(/nxs\.tabs\.claimSummary is already registered/);
  });

  it('refuses a workspace without the nxs- library, pointing a customer elsewhere', async () => {
    const empty = createTreeWithEmptyWorkspace();
    await expect(satoriComponentGenerator(empty, { name: 'x', slot: 'tabs' })).rejects.toThrow(
      /use extension-component under your prefix/,
    );
  });

  it('refuses when the registration marker is gone, rather than guessing', async () => {
    tree.write(PROVIDER, PROVIDER_SOURCE.replace(/.*satori:register:components.*\n/, ''));
    await expect(satoriComponentGenerator(tree, { name: 'x', slot: 'tabs' })).rejects.toThrow(
      /has no `satori:register:components` marker/,
    );
  });

  it('refuses when the reference table is gone', async () => {
    tree.write(REFERENCE, REFERENCE_SOURCE.replace(/\| Component ID[\s\S]*?\n\n/, ''));
    await expect(satoriComponentGenerator(tree, { name: 'x', slot: 'tabs' })).rejects.toThrow(
      /has no table after `satori:register:nxs-components`/,
    );
  });
});
