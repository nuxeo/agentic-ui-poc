/**
 * "3 days ago", in whatever language the page is in.
 *
 * Five copies of this logic were hand-rolled across the application, each building the phrase
 * by concatenation — `` `${days} days ago` `` — and each therefore untranslatable and wrong
 * outside English twice over.
 *
 * The obvious fix is a catalogue key per unit. It is the wrong one. English has two plural
 * forms, so `1 day` / `2 days` looks like the whole problem; Polish has three and Arabic six,
 * and a translator handed `{{ count }} days ago` cannot express any of them. Getting that
 * right means CLDR plural rules, which is a table nobody should be maintaining here.
 *
 * `Intl.RelativeTimeFormat` is that table, shipped in the browser. It knows the plural rules
 * for every locale, it knows that French writes "il y a 3 jours" with the preposition first,
 * and with `numeric: 'auto'` it produces "yesterday" rather than "1 day ago" where the
 * language has a word for it. Nothing needs translating, so nothing can be mistranslated, and
 * it is correct in locales this product has never shipped.
 *
 * The locale is passed in rather than read from a global: it must follow the app's Layer 0
 * `defaultLanguage`, not the browser's, or the page renders in one language and its timestamps
 * in another.
 */

/** Thresholds in ascending order, so the first match is the coarsest sensible unit. */
const UNITS: ReadonlyArray<
  readonly [limitMs: number, perUnitMs: number, unit: Intl.RelativeTimeFormatUnit]
> = [
  [60_000, 1_000, 'second'],
  [3_600_000, 60_000, 'minute'],
  [86_400_000, 3_600_000, 'hour'],
  [2_592_000_000, 86_400_000, 'day'],
  [31_536_000_000, 2_592_000_000, 'month'],
  [Number.POSITIVE_INFINITY, 31_536_000_000, 'year'],
];

/** The coarsest unit, used when nothing else matches. */
const YEARS = UNITS[UNITS.length - 1];

/** Below this, every language would rather say "now" than "in 4 seconds". */
const JUST_NOW_MS = 45_000;

export function formatRelativeTime(
  value: string | number | Date | null | undefined,
  locale: string,
  now: number = Date.now(),
): string {
  if (value === null || value === undefined || value === '') return '';
  const then = value instanceof Date ? value.getTime() : new Date(value).getTime();
  if (Number.isNaN(then)) return '';

  const elapsed = now - then;
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  // `RelativeTimeFormat` has no "now", so the smallest unit stands in for it. Passing 0 seconds
  // with `numeric: 'auto'` is what produces "now" / "maintenant" rather than "0 seconds ago".
  if (Math.abs(elapsed) < JUST_NOW_MS) return format.format(0, 'second');

  // The last entry's limit is Infinity, so a match is guaranteed — but saying so with `!`
  // would be an assertion where a default is available.
  const [, perUnit, unit] = UNITS.find(([limit]) => Math.abs(elapsed) < limit) ?? YEARS;
  // Rounded on the MAGNITUDE, then signed — not `Math.round(elapsed / perUnit)`.
  //
  // `Math.round` breaks ties towards +∞, so it is asymmetric across zero: `Math.round(1.5)` is 2
  // and `Math.round(-1.5)` is -1. Two instants the same distance either side of now therefore
  // rendered with different magnitudes — 90 seconds ago was "2 minutes ago" while 90 seconds
  // ahead was "in 1 minute". Rounding the absolute value first makes the two symmetric, which is
  // what a reader expects of a relative time.
  const magnitude = Math.round(Math.abs(elapsed) / perUnit);
  // Negative is the past, which is the opposite sign from `elapsed`.
  return format.format(elapsed > 0 ? -magnitude : magnitude, unit);
}
