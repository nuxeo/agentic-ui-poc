import { formatFiles, names, type Tree } from '@nx/devkit';

import { libraryContext } from '../util/library-context';
import { assertIdAbsent, insertAboveMarker } from '../util/splice';

export interface ExtensionActionSchema {
  name: string;
  library: string;
}

/**
 * Add an action handler to an existing extension library.
 *
 * The split this preserves is the whole point of the contract: **where** an action
 * appears is Layer 1 configuration, and **what it does** is this handler. They are
 * registered separately so a manifest can move an action between a toolbar and an
 * overflow menu, or a later release can replace the behaviour, without either side
 * knowing about the other.
 *
 * The handler goes on the rules service rather than into an inline arrow, because a
 * real action needs dependencies — an `HttpClient`, a dialog, the customer's own
 * service — and an inline arrow in a provider factory has nowhere to inject them.
 */
export default async function extensionActionGenerator(tree: Tree, options: ExtensionActionSchema) {
  const context = libraryContext(tree, options.library);
  const name = names(options.name);
  const actionId = `${context.owner}.actions.${name.propertyName}`;
  const method = name.propertyName;

  assertIdAbsent(tree, context.extensionsFile, actionId);

  insertAboveMarker(tree, context.extensionsFile, 'satori:ids:actions', [`'${actionId}',`]);

  // The literal ID as the key, matching how the rules block reads. The scaffolded
  // first entry indexes the ID list positionally (`IDS.actions[0]`), which does not
  // generalise — the second entry's index depends on insertion order, and a
  // reordered list would silently repoint the handler.
  insertAboveMarker(tree, context.extensionsFile, 'satori:register:actions', [
    `'${actionId}': {`,
    `  execute: (context) => rules.${method}(context),`,
    `},`,
  ]);

  const servicePath = `${context.root}/src/lib/rules.service.ts`;
  const service = tree.read(servicePath, 'utf-8');
  if (service === null) throw new Error(`Cannot read ${servicePath}.`);

  const closing = service.lastIndexOf('}');
  const body = `
  /**
   * \`${actionId}\`
   *
   * Receives the same context the rules see — the focused document, the selection,
   * the current URL, the signed-in user.
   *
   * Returning nothing is fine; **throwing is not**. An action that throws surfaces
   * as an unhandled error in the host's shell, and the host has no way to attribute
   * it to this library. Catch, and report through your own channel.
   */
  ${method}(context: ExtensionRuleContext): void {
    // \`warn\`, not \`info\`: this is an unimplemented placeholder, which is genuinely
    // a warning, and it is the level the workspace lint rule allows.
    console.warn('[${context.owner}] ${method} is not implemented yet', {
      url: context.url,
      selectionCount: context.selectionCount,
      document: context.document?.uid ?? null,
    });
  }
`;
  tree.write(servicePath, `${service.slice(0, closing)}${body}${service.slice(closing)}`);

  await formatFiles(tree);

  return () => {
    console.log(`
Registered ${actionId}

  handler  ${servicePath} -> ${method}()

A handler alone renders nothing. Give it somewhere to appear, either from code:

  slots: { toolbar: [{ id: '${context.owner}.toolbar.${name.propertyName}',
                       label: '${name.className}',
                       action: '${actionId}' }] }

...or leave it to a manifest, which can place the same ID in any slot without
touching this library.

Next:
  1. Replace the body of ${method}().
  2. Assert in src/lib/extensions.spec.ts that the ID is in the action registry —
     \`ExtensionActionRegistry.has('${actionId}')\`. A descriptor with no handler
     dispatches inertly rather than failing, so nothing else catches a typo.

  npx nx test ${context.projectName}
  npx nx typecheck ${context.projectName}
`);
  };
}
