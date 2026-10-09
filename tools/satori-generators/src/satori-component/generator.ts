import {
  formatFiles,
  generateFiles,
  names,
  readProjectConfiguration,
  type Tree,
} from '@nx/devkit';
import { join } from 'node:path';

import { assertIdAbsent, insertAboveMarker } from '../util/splice';

export type SatoriComponentSlot = 'sidebar' | 'tabs' | 'documentView' | 'routes';

export interface SatoriComponentSchema {
  name: string;
  slot: SatoriComponentSlot;
  project?: string;
}

/**
 * Append `row` to the Markdown table that follows `marker`.
 *
 * Not `insertAboveMarker`: a row above a comment that ends a table lands after the blank line
 * Prettier keeps there, outside the table. So the marker precedes the table, and the row goes
 * after its last line. Throws if either is missing, for the same reason the splice does.
 */
function appendRowToTableAfterMarker(tree: Tree, file: string, marker: string, row: string): void {
  const lines = (tree.read(file, 'utf-8') ?? '').split('\n');
  const at = lines.findIndex((line) => line.includes(marker));
  if (at === -1) {
    throw new Error(`${file} has no \`${marker}\` marker, so the ID cannot be documented there.`);
  }
  let start = at + 1;
  while (start < lines.length && lines[start].trim() === '') start += 1;
  let end = start;
  while (end < lines.length && lines[end].trimStart().startsWith('|')) end += 1;
  if (end - start < 2) {
    throw new Error(`${file} has no table after \`${marker}\`, so the ID cannot be documented there.`);
  }
  lines.splice(end, 0, row);
  tree.write(file, lines.join('\n'));
}

/** The slots whose descriptors name a component by `componentId`. */
const SLOTS: readonly SatoriComponentSlot[] = ['sidebar', 'tabs', 'documentView', 'routes'];

const REFERENCE = 'docs/extension-reference.md';

/**
 * Add an `nxs-` component to the platform's own library, registered by ID for one slot.
 *
 * This is the platform's generator, not a customer's: `nxs-` and `nxs.` are our prefixes, so a
 * customer contributes with `extension-component` under their own. It is marked internal in
 * `generators.json` and not shipped in the package.
 *
 * It emits everything the library's gates require of a component, so the output passes them as
 * generated: the component on theme tokens with only translated text inputs, a spec that asserts
 * registry state and renders the component through the slot it names, a story, the barrel export,
 * the registration in `provideNxsComponents()` and the ID's row in the extension reference. Each
 * splice goes through a marker comment and throws if the marker is gone, rather than guessing.
 *
 * It registers; it does not place. Putting the component on a screen is a manifest entry in the
 * slot (Layer 1), which the closing message spells out.
 */
export default async function satoriComponentGenerator(
  tree: Tree,
  options: SatoriComponentSchema,
) {
  if (!SLOTS.includes(options.slot)) {
    throw new Error(
      `--slot must be one of ${SLOTS.join(', ')}: the slots whose descriptors render a component ` +
        `by ID. "${options.slot}" is not one of them.`,
    );
  }
  const projectName = options.project ?? 'satori-components';
  let root: string;
  try {
    root = readProjectConfiguration(tree, projectName).root;
  } catch {
    throw new Error(
      `No project named "${projectName}". This generator adds to the platform's nxs- library; ` +
        'to contribute a component from your own library, use extension-component under your prefix.',
    );
  }
  const provider = `${root}/src/lib/provide-nxs-components.ts`;
  const barrel = `${root}/src/index.ts`;
  for (const file of [provider, barrel, REFERENCE]) {
    if (!tree.exists(file)) {
      throw new Error(
        `${file} does not exist, so "${projectName}" is not the nxs- component library this ` +
          'generator registers into.',
      );
    }
  }

  const name = names(options.name);
  const componentId = `nxs.${options.slot}.${name.propertyName}`;
  const className = `Nxs${name.className}Component`;
  const dir = `${root}/src/lib/${name.fileName}`;

  assertIdAbsent(tree, provider, componentId);
  if (tree.exists(dir)) {
    throw new Error(`${dir} already exists. Choose another name, or delete the directory.`);
  }

  generateFiles(tree, join(__dirname, 'files'), `${root}/src/lib`, {
    ...name,
    className,
    componentId,
    slot: options.slot,
    isDocumentView: options.slot === 'documentView',
    isRoute: options.slot === 'routes',
    title: name.className.replace(/([a-z0-9])([A-Z])/g, '$1 $2'),
    tmpl: '',
  });

  insertAboveMarker(tree, provider, 'satori:import:components', [
    `import { ${className} } from './${name.fileName}/${name.fileName}.component';`,
  ]);
  insertAboveMarker(tree, provider, 'satori:register:components', [
    `'${componentId}': ${className},`,
  ]);
  insertAboveMarker(tree, barrel, 'satori:export:components', [
    `export { ${className} } from './lib/${name.fileName}/${name.fileName}.component';`,
  ]);
  appendRowToTableAfterMarker(
    tree,
    REFERENCE,
    'satori:register:nxs-components',
    `| \`${componentId}\` | \`nxs-${name.fileName}\` | \`${options.slot}\` |`,
  );

  await formatFiles(tree);

  const placement =
    options.slot === 'routes'
      ? `"routes": [{ "id": "${componentId}", "path": "${name.fileName}" }]`
      : `"${options.slot}": [{ "id": "${componentId}", "componentId": "${componentId}" }]`;
  return () => {
    console.log(`
Registered ${componentId}

  component  ${dir}/${name.fileName}.component.ts  (${className})
  spec       asserts the registration, and renders it through the ${options.slot} slot
  story      ${dir}/${name.fileName}.stories.ts
  exported   from ${barrel}
  documented ${REFERENCE}

Registered, not placed. A manifest places it, with no rebuild:
  "slots": { ${placement} }

Next:
  1. npx nx test ${projectName} --coverage.enabled=true && npm run beta:coverage
  2. npx nx run-many -t lint,typecheck -p ${projectName} && npm run review:guardrails
  3. npm run beta:reference
  4. npx nx build platform && npm run beta:api -- --update — and review the new public API
`);
  };
}
