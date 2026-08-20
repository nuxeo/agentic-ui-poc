/**
 * Reading arbitrary tool arguments and payload values as text.
 *
 * Shared by the tool cards and the approval rows. Both render values a model chose the
 * shape of, so both need the same rule — a value is described, never serialised — and
 * keeping one implementation is what stops one of them regressing to `{"dc:title":"New"}`
 * while the other reads correctly.
 */

/** How much of one argument value a line shows. */
export const ARG_VALUE_MAX = 120;

/** `key: value · key: value`, for a whole argument set. Rendered as text, never markup. */
export function formatArgLine(args: Record<string, unknown>): string {
  const entries = Object.entries(args);
  if (entries.length === 0) return '';
  return entries.map(([key, value]) => `${key}: ${stringifyArg(value)}`).join(' · ');
}

/** One argument value as text. Clipped, so a large argument cannot become a blob either. */
export function stringifyArg(value: unknown): string {
  return truncate(describeValue(value), ARG_VALUE_MAX);
}

/**
 * A value as a person would read it: `dc:title=New`, not `{"dc:title":"New"}`.
 *
 * Uncapped, because callers compare the result against a headline they are already
 * showing and a clipped comparison would stop matching a long one.
 */
export function describeValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(describeValue).filter(Boolean).join(', ');
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, nested]) => `${key}=${describeValue(nested)}`)
      .join(', ');
  }
  return String(value);
}

/** `key: value · key: value`, skipping the keys that carry nothing. */
export function describeEntries(entries: readonly [string, unknown][]): string {
  return entries
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${describeValue(value)}`)
    .join(' · ');
}

/** Collapses the newlines that made a pretty-printed payload 866px tall, then clips. */
export function truncate(text: string, max: number): string {
  const flattened = text.replace(/\s+/g, ' ').trim();
  return flattened.length <= max ? flattened : `${flattened.slice(0, max - 1).trimEnd()}…`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
