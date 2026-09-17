/**
 * Escape a value for interpolation into a single-quoted NXQL literal.
 *
 * Returns the escaped body **without** the surrounding quotes, so a caller composes
 * `'${escapeNxqlLiteral(term)}'` and stays in control of wildcards.
 *
 * ## Backslash, not a doubled quote
 *
 * This used to return `''` for a quote. Nuxeo does not accept that — checked against
 * the local server rather than inferred from the grammar:
 *
 * ```
 * dc:title = 'O''Brien'  → HTTP 400  Syntax error: Invalid token <Brien> at offset 49
 * dc:title = 'O\'Brien'  → HTTP 200
 * ```
 *
 * A doubled quote still contained an injected payload, because the payload ends up
 * inside a string token rather than becoming operators — but it turned every
 * legitimate apostrophe into a failed search. Backslash is the escape the parser
 * implements, and it matches `escapeHxqlLiteral` in the adf-hx bridge, which faces
 * the same query language.
 *
 * ## Order matters
 *
 * The backslash is escaped **first**. Doing it the other way round — `'` → `\'` then
 * `\` → `\\` — double-escapes the backslash just introduced, turning `\'` into `\\'`:
 * a literal backslash followed by an *unescaped* quote, which reopens the hole this
 * function exists to close.
 */
export function escapeNxqlLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
