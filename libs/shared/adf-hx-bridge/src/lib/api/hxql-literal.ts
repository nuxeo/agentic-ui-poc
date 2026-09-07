/**
 * Escaping a value for interpolation into an HXQL/NXQL single-quoted literal.
 *
 * ## Why this exists
 *
 * `search-adf-hx.ts` built its query by template literal:
 *
 * ```ts
 * `SELECT * FROM SysContent WHERE sys_fulltext = '${term}*' ORDER BY sys_modified DESC`
 * ```
 *
 * with `term` typed by the user. An adversarial review closed the literal and the
 * surrounding parenthesis and lifted its own clause to a top-level `OR`:
 *
 * ```
 * zzznope') OR (ecm:uuid IS NOT NULL) OR (ecm:fulltext = 'q
 * ```
 *
 * which defeated both hygiene filters the query api adds unconditionally
 * (`ecm:isVersion = 0`, `ecm:isTrashed = 0`) and returned 155 documents where the
 * un-injected term returned 0.
 *
 * Nuxeo's ACL filter bounded the impact — the same payload returns 155 rows as
 * Administrator and 22 as Anonymous, so a user could not read documents they lack
 * `Read` on. What they gained was seeing versions and trashed documents that the
 * filters exist to hide, plus an arbitrary-cost query primitive. That is worth fixing
 * on its own terms, and it is worth fixing *here* rather than at the call site,
 * because the next surface to build a query by interpolation will make the same
 * mistake.
 *
 * ## Why not parameterised queries
 *
 * There is no parameter binding to reach for. `SearchService.getDocumentsByQuery`
 * takes a query **string**, and Nuxeo's `/search/lang/NXQL/execute` takes `query` as a
 * URL parameter. Escaping the literal is the available correct answer, not a shortcut
 * past a better one.
 *
 * ## Order matters
 *
 * The backslash is escaped **first**. Doing it the other way round —
 * `'` → `\'` then `\` → `\\` — would double-escape the backslash just introduced,
 * turning `\'` into `\\'`: a literal backslash followed by an *unescaped* quote, which
 * reopens the hole the function exists to close. There is a spec for exactly that.
 */

/**
 * Escape a user-supplied value for use inside a single-quoted HXQL/NXQL literal.
 *
 * Returns the escaped body **without** surrounding quotes, so a caller composes
 * `'${escapeHxqlLiteral(term)}'` and stays in control of wildcards.
 *
 * The two escapes match what the translator's own literal-skipping regex
 * (`/'(?:[^'\\]|\\.)*'/g` in `nuxeo-query-api.ts`) already understands, so an escaped
 * term reads correctly to the field-refusal check rather than tripping it.
 */
export function escapeHxqlLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Whether a value would change the structure of a query it is interpolated into.
 *
 * Exported for tests and for a caller that wants to reject rather than escape.
 * Deliberately **not** used as a filter by `escapeHxqlLiteral`: rejecting input that
 * merely looks suspicious would refuse legitimate searches — an apostrophe is ordinary
 * in prose — and a blocklist is the weaker of the two mechanisms. Escaping is the
 * defence; this is a diagnostic.
 */
export function containsHxqlLiteralBreak(value: string): boolean {
  return /['\\]/.test(value);
}
