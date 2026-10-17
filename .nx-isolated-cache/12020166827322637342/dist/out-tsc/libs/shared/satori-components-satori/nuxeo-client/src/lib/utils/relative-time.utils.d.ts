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
export declare function formatRelativeTime(value: string | number | Date | null | undefined, locale: string, now?: number): string;
//# sourceMappingURL=relative-time.utils.d.ts.map