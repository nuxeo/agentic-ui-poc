import { containsHxqlLiteralBreak, escapeHxqlLiteral } from './hxql-literal';

/**
 * The query the search page builds, so the specs assert against the real shape rather
 * than an abstraction of it.
 */
const buildQuery = (term: string) =>
  `SELECT * FROM SysContent WHERE sys_fulltext = '${escapeHxqlLiteral(term)}*' ` +
  `ORDER BY sys_modified DESC`;

/** The translator's own literal-skipping regex, from `nuxeo-query-api.ts`. */
const stripLiterals = (query: string) => query.replace(/'(?:[^'\\]|\\.)*'/g, "''");

describe('escapeHxqlLiteral', () => {
  it('leaves an ordinary term untouched', () => {
    expect(escapeHxqlLiteral('hurricane')).toBe('hurricane');
    expect(escapeHxqlLiteral('CLM-2026-0431')).toBe('CLM-2026-0431');
  });

  it('neutralises the reviewed injection payload', () => {
    // Verbatim from the adversarial review. Un-escaped it returned 155 documents
    // against 0 for the plain term, by escaping the literal and the enclosing
    // parenthesis to reach a top-level OR.
    const payload = "zzznope') OR (ecm:uuid IS NOT NULL) OR (ecm:fulltext = 'q";
    const query = buildQuery(payload);

    // The decisive assertion: after the translator removes every literal, nothing of
    // the payload survives as query structure.
    const structure = stripLiterals(query);
    expect(structure).toBe(
      "SELECT * FROM SysContent WHERE sys_fulltext = '' ORDER BY sys_modified DESC",
    );

    // `not.toContain('OR')` was the first cut and it failed on `ORDER BY` — a substring
    // collision, not a real finding. Assert the injection *shape* instead.
    expect(structure).not.toMatch(/\bOR\s*\(/);
    expect(structure).not.toContain('ecm:uuid');
  });

  it('escapes the backslash BEFORE the quote', () => {
    // The ordering trap. Escaping `'` first and `\` second turns `\'` into `\\'` — a
    // literal backslash followed by an UNESCAPED quote, which reopens the hole.
    expect(escapeHxqlLiteral("\\'")).toBe("\\\\\\'");

    // And the property that matters: a trailing backslash cannot escape the closing
    // quote of the literal it sits in.
    const structure = stripLiterals(buildQuery('ends-with-backslash\\'));
    expect(structure).toBe(
      "SELECT * FROM SysContent WHERE sys_fulltext = '' ORDER BY sys_modified DESC",
    );
  });

  it('survives a payload that tries to escape the escape', () => {
    for (const payload of [
      "a\\' OR 1=1 --",
      "a\\\\' OR 1=1 --",
      "'; DROP",
      '\\',
      "''''",
      "a' AND ecm:isTrashed = 1 AND '",
    ]) {
      const structure = stripLiterals(buildQuery(payload));
      expect(structure).toBe(
        "SELECT * FROM SysContent WHERE sys_fulltext = '' ORDER BY sys_modified DESC",
      );
    }
  });

  it('keeps an apostrophe searchable rather than rejecting it', () => {
    // Escaping rather than blocking is the point: `O'Brien` is ordinary input.
    expect(escapeHxqlLiteral("O'Brien")).toBe("O\\'Brien");
    expect(stripLiterals(buildQuery("O'Brien"))).not.toContain('Brien');
  });
});

describe('containsHxqlLiteralBreak', () => {
  it('is a diagnostic, not the defence', () => {
    expect(containsHxqlLiteralBreak("O'Brien")).toBe(true);
    expect(containsHxqlLiteralBreak('hurricane')).toBe(false);
    // It reports true for legitimate input, which is exactly why it must not be used
    // as a filter — see the note on the export.
  });
});
