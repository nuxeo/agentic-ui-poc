import { escapeNxqlLiteral } from './nxql.utils';

describe('nxql.utils', () => {
  describe('escapeNxqlLiteral', () => {
    /**
     * A doubled quote is what this used to produce, and Nuxeo answers it with
     * `HTTP 400 Syntax error: Invalid token <Brien>`. The backslash form is what the
     * parser accepts — both checked against the local server.
     */
    it('escapes a single quote with a backslash, not by doubling it', () => {
      expect(escapeNxqlLiteral("O'Brien")).toBe(String.raw`O\'Brien`);
      expect(escapeNxqlLiteral("O'Brien")).not.toBe("O''Brien");
    });

    it('escapes backslashes', () => {
      expect(escapeNxqlLiteral(String.raw`path\to\doc`)).toBe(String.raw`path\\to\\doc`);
    });

    /**
     * The ordering guard. Escaping the quote first would turn `\'` into `\\'` — a
     * literal backslash then an *unescaped* quote, which closes the literal.
     */
    it('escapes a backslash before the quote it precedes', () => {
      expect(escapeNxqlLiteral(String.raw`it's a \path`)).toBe(String.raw`it\'s a \\path`);
      expect(escapeNxqlLiteral(String.raw`\'`)).toBe(String.raw`\\\'`);
    });

    it('returns plain strings unchanged', () => {
      expect(escapeNxqlLiteral('abc-123')).toBe('abc-123');
    });
  });
});
