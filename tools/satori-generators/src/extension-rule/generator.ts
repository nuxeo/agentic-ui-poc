import { formatFiles, names, type Tree } from '@nx/devkit';

import { libraryContext } from '../util/library-context';
import { assertIdAbsent, insertAboveMarker } from '../util/splice';

export interface ExtensionRuleSchema {
  name: string;
  library: string;
  /** Deny when unregistered instead of permitting. Default true — see below. */
  failClosed?: boolean;
}

/**
 * Add a named rule evaluator to an existing extension library.
 *
 * A rule is a predicate a manifest may reference by ID to decide whether a surface
 * is offered. It is **not** authorisation: Nuxeo evaluates the real permission
 * server-side on every operation, so a hidden control is still reachable over REST.
 * The generated evaluator says so at its own site, because that is the sentence a
 * customer needs to read before they rely on one.
 *
 * `failClosed` defaults to **true**, which inverts the platform's own default, and
 * that is deliberate. An unregistered rule ID normally evaluates to `true` so a
 * manifest typo cannot strip working actions out of the UI — right for the platform,
 * wrong for a rule someone is writing *now* to gate something. If you are adding a
 * rule, you almost certainly want the gate closed while it is missing. Pass
 * `--failClosed=false` for a rule that merely reveals an optional affordance.
 */
export default async function extensionRuleGenerator(tree: Tree, options: ExtensionRuleSchema) {
  const context = libraryContext(tree, options.library);
  const name = names(options.name);
  const ruleId = `${context.owner}.rules.${name.propertyName}`;

  // A rule already named as a predicate keeps its name; anything else gets `can`.
  // Without this, `is-legal-team` produced `canIsLegalTeam()`.
  const method = /^(is|has|can|should|may|was|will)[A-Z]/.test(name.propertyName)
    ? name.propertyName
    : `can${name.className}`;

  assertIdAbsent(tree, context.extensionsFile, ruleId);

  const failClosed = options.failClosed !== false;

  // 1. The ID, so the exported list stays the single source of truth.
  insertAboveMarker(tree, context.extensionsFile, 'satori:ids:rules', [`'${ruleId}',`]);

  // 2. The registration, delegating to the rules service rather than inlining logic
  //    — a predicate with dependencies is the common case, and an inline arrow has
  //    nowhere to inject them.
  insertAboveMarker(tree, context.extensionsFile, 'satori:register:rules', [
    `'${ruleId}': (context) => rules.${method}(context),`,
  ]);

  // 3. The rules service method.
  const servicePath = `${context.root}/src/lib/rules.service.ts`;
  const service = tree.read(servicePath, 'utf-8');
  if (service === null) throw new Error(`Cannot read ${servicePath}.`);

  const closing = service.lastIndexOf('}');
  const body = `
  /**
   * \`${ruleId}\`
   *
   * Reads the supplied context rather than global state, so the same rule answers
   * correctly for a toolbar over one document and a bulk bar over a selection.
   *
   * Replace the body. Returning \`true\` unconditionally makes the rule pointless;
   * returning \`false\` unconditionally makes the surface unreachable — and neither
   * shows up as a failure, so a spec asserting a *specific* answer is what catches it.
   *
   * This is a UI affordance, not a permission. Nuxeo decides what the server allows.
   */
  ${method}(context: ExtensionRuleContext): boolean {
    return context.user.username !== null;
  }
`;
  tree.write(servicePath, `${service.slice(0, closing)}${body}${service.slice(closing)}`);

  // 4. Fail-closed declaration, when asked for. The template already spreads the
  //    whole `rules` list into `failClosedRules`, so a new ID is covered by that
  //    spread — but only if the library still has it. Check rather than assume.
  const source = tree.read(context.extensionsFile, 'utf-8') ?? '';
  const spreadsAll = source.includes(`failClosedRules: [...${context.idsConstant}.rules]`);

  await formatFiles(tree);

  return () => {
    console.log(`
Registered ${ruleId}

  evaluator   ${servicePath} -> ${method}()
  fail-closed ${
    failClosed
      ? spreadsAll
        ? 'yes — covered by `failClosedRules: [...IDS.rules]`'
        : 'REQUESTED BUT NOT APPLIED — see below'
      : 'no (--failClosed=false)'
  }

Next:
  1. Replace the body of ${method}() — it currently returns "is anyone signed in".
  2. Add an expectation to src/lib/extensions.spec.ts. Assert a **specific** answer,
     not \`true\`: an unregistered rule ID also evaluates to \`true\`, so a test
     expecting \`true\` passes whether or not registration happened.
${
  failClosed && !spreadsAll
    ? `
  3. This library does not spread its rule list into \`failClosedRules\`, so the new
     rule fails OPEN while unregistered. Add '${ruleId}' to \`failClosedRules\`
     explicitly, or restore \`failClosedRules: [...${context.idsConstant}.rules]\`.`
    : ''
}
  npx nx test ${context.projectName}
  npx nx typecheck ${context.projectName}
`);
  };
}
