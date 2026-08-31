/** Escape a string literal for safe interpolation into NXQL queries. */
export function escapeNxqlLiteral(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "''");
}
