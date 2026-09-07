import type { Tree } from '@nx/devkit';

/**
 * Insert lines immediately above a marker comment.
 *
 * ## Why markers rather than a TypeScript AST
 *
 * These generators add one entry to two object literals and one array literal. An
 * AST transform is the right tool when you must *understand* the code; here the
 * insertion point is fixed and a marker states it explicitly. The marker is also
 * self-documenting for the customer reading the file — an AST edit leaves nothing
 * behind that explains where the next entry will go.
 *
 * ## Why it throws
 *
 * If the marker is gone, the alternatives are to guess an insertion point or to
 * silently do nothing. Both are worse than stopping: a generator that reports
 * success while registering nothing is exactly the "descriptors nothing renders"
 * failure this whole contract exists to prevent. So a missing marker is a hard
 * error that names the file, the marker and how to restore it.
 */
export function insertAboveMarker(
  tree: Tree,
  file: string,
  marker: string,
  lines: readonly string[],
): void {
  const source = tree.read(file, 'utf-8');
  if (source === null) throw new Error(`Cannot read ${file}.`);

  const index = source.indexOf(marker);
  if (index === -1) {
    throw new Error(
      `${file} has no \`${marker}\` marker, so there is nowhere to register this.\n\n` +
        'That marker is where these generators insert. Restore it inside the matching\n' +
        'block — for example:\n\n' +
        `      // ${marker}\n\n` +
        'It is a comment, so it has no effect at runtime.',
    );
  }

  const lineStart = source.lastIndexOf('\n', index) + 1;

  /**
   * The marker's **leading whitespace**, not everything before it.
   *
   * The marker lives inside a comment, so "everything on the line before the marker"
   * is `    // ` — and using that as the indent prefixed every inserted line with
   * `//`, commenting out the registration. All four generators reported success
   * while registering nothing, and lint, typecheck and the six existing specs all
   * passed, because none of them referenced the new IDs. That is the exact
   * "descriptors nothing renders" failure these generators exist to prevent, so the
   * post-condition below now proves the insertion is live code.
   */
  const lineEnd = source.indexOf('\n', index);
  const markerLine = source.slice(lineStart, lineEnd === -1 ? source.length : lineEnd);
  const indent = /^[ \t]*/.exec(markerLine)?.[0] ?? '';

  const insertion = lines.map((line) => (line ? `${indent}${line}` : '')).join('\n');
  tree.write(file, `${source.slice(0, lineStart)}${insertion}\n${source.slice(lineStart)}`);

  // Post-condition: the first inserted line must now exist as code, not inside a
  // comment. Cheap, and it is the check that would have caught the bug above.
  const written = tree.read(file, 'utf-8') ?? '';
  const first = lines.find(Boolean);
  if (first && !written.split('\n').some((line) => line.trim() === first.trim())) {
    throw new Error(
      `Inserted "${first.trim()}" into ${file} but it is not present as a line of its own ` +
        'afterwards — the insertion was mangled. Refusing to report success.',
    );
  }
}

/** Guard against registering an ID that is already there. */
export function assertIdAbsent(tree: Tree, file: string, id: string): void {
  const source = tree.read(file, 'utf-8') ?? '';
  if (source.includes(`'${id}'`)) {
    throw new Error(
      `${id} is already registered in ${file}.\n\n` +
        'IDs are a public contract — a manifest may already reference this one, so the\n' +
        'generator will not overwrite it. Choose another name, or edit the existing\n' +
        'registration by hand.',
    );
  }
}
