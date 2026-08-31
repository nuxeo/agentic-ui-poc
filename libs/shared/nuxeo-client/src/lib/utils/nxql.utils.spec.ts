import { escapeNxqlLiteral } from './nxql.utils';

describe('nxql.utils', () => {
  describe('escapeNxqlLiteral', () => {
    it('escapes single quotes', () => {
      expect(escapeNxqlLiteral("O'Brien")).toBe("O''Brien");
    });

    it('escapes backslashes', () => {
      expect(escapeNxqlLiteral(String.raw`path\to\doc`)).toBe(String.raw`path\\to\\doc`);
    });

    it('escapes backslashes before single quotes', () => {
      expect(escapeNxqlLiteral(String.raw`it's a \path`)).toBe(String.raw`it''s a \\path`);
    });

    it('returns plain strings unchanged', () => {
      expect(escapeNxqlLiteral('abc-123')).toBe('abc-123');
    });
  });
});
