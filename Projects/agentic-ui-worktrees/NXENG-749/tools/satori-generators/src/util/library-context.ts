import { readProjectConfiguration, names, type ProjectConfiguration, type Tree } from '@nx/devkit';

/**
 * `ProjectConfiguration` plus `prefix`.
 *
 * `prefix` is a real `project.json` field — Nx's own Angular generators write it and every
 * generated library here carries one — but it is absent from the `ProjectConfiguration`
 * type in this Nx version. Declared rather than cast: these files were never typechecked
 * (the project has a `lint` target and no `typecheck`), so both uses of `prefix` were type
 * errors that nothing reported until the generators had to compile in order to ship.
 */
export type SatoriProjectConfiguration = ProjectConfiguration & { prefix?: string };

/**
 * Everything the three "add one contribution" generators need about the library
 * they are adding to.
 *
 * They all resolve the same four things — which project, where its `extensions.ts`
 * is, what its owner prefix is, and what its exported ID constant is called — so
 * resolving them once here keeps three generators from each inventing their own
 * slightly different answer.
 */
export interface LibraryContext {
  readonly projectName: string;
  readonly root: string;
  /** The `<owner>` in every `<owner>.<surface>.<name>` ID this library registers. */
  readonly owner: string;
  /** e.g. `libs/extensions/acme-extensions/src/lib/extensions.ts`. */
  readonly extensionsFile: string;
  /** e.g. `ACME_EXTENSIONS_EXTENSION_IDS`. */
  readonly idsConstant: string;
}

/**
 * Resolve the target library, failing with something actionable rather than a
 * stack trace.
 *
 * The owner prefix comes from the project's `prefix`, because that is what
 * `extension-library` set it to when it scaffolded the library — so the two
 * cannot drift. Reading it back rather than asking for it again also stops a
 * customer accidentally registering `acme.rules.x` in one file and
 * `acmecorp.rules.y` in the next.
 */
export function libraryContext(tree: Tree, projectName: string): LibraryContext {
  let project;
  try {
    project = readProjectConfiguration(tree, projectName);
  } catch {
    throw new Error(
      `No project named "${projectName}" in this workspace.\n\n` +
        'Pass --library=<name>, e.g. --library=acme-extensions. Create one first with:\n' +
        '  nx g ./tools/satori-generators:extension-library <name> --owner=<prefix>',
    );
  }

  const extensionsFile = `${project.root}/src/lib/extensions.ts`;
  if (!tree.exists(extensionsFile)) {
    throw new Error(
      `${extensionsFile} does not exist, so "${projectName}" is not a Satori extension library.\n\n` +
        'These generators add a contribution to a library produced by:\n' +
        '  nx g ./tools/satori-generators:extension-library <name> --owner=<prefix>',
    );
  }

  const owner = (project as SatoriProjectConfiguration).prefix;
  if (!owner) {
    throw new Error(
      `"${projectName}" has no \`prefix\` in its project.json, and that is where the ` +
        'owner segment of every registered ID comes from.\n\n' +
        'Add `"prefix": "<owner>"` to its project.json — it must match the `<owner>.` ' +
        'prefix already used in src/lib/extensions.ts.',
    );
  }

  // `extension-library` strips a trailing `Extensions` from the class name before
  // building this constant, so reproduce that here rather than guessing.
  const baseName = names(projectName).className.replace(/Extensions$/, '');
  const idsConstant = `${names(baseName).constantName}_EXTENSIONS_EXTENSION_IDS`;

  return {
    projectName,
    root: project.root,
    owner,
    extensionsFile,
    idsConstant: resolveIdsConstant(tree, extensionsFile, idsConstant),
  };
}

/**
 * Read the ID constant's real name out of the file instead of trusting the
 * derivation above.
 *
 * The derivation is a guess about how the library was named, and a customer is
 * free to rename the constant. Reading it back means a rename does not silently
 * produce a second, unused constant.
 */
function resolveIdsConstant(tree: Tree, file: string, fallback: string): string {
  const source = tree.read(file, 'utf-8') ?? '';
  const match = /export const ([A-Z0-9_]+_EXTENSION_IDS)\b/.exec(source);
  return match?.[1] ?? fallback;
}
