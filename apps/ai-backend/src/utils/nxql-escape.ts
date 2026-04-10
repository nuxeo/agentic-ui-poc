/**
 * Escapes a string for safe interpolation into NXQL single-quoted literals.
 * NXQL uses doubled single quotes ('') as the escape sequence — NOT backslash.
 */
export function escapeNxql(value: string): string {
  return value.replace(/'/g, "''");
}
