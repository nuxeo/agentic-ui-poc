/**
 * Text as a reader gets it: without the whitespace and zero-width characters around it, and empty
 * when nothing in it would show on screen.
 *
 * `trim()` alone keeps `'\u200B'` — a zero-width space a paste or a CMS can leave in a field — so a
 * label made of one still reads as a name, and assistive technology announces nothing for a control
 * that looks named. Characters inside the text are kept: a zero-width joiner between two emoji, or a
 * non-joiner in Persian, changes what the text says.
 */
export declare function nxsVisibleText(text: string | null | undefined): string;
/**
 * The first `count` characters a reader sees in `text`, upper-cased — an avatar's initials. Counted
 * as user-perceived characters, so an accented letter written as a letter and a combining mark, or
 * an emoji written as two code units, is one initial and is never cut in half.
 */
export declare function nxsInitials(text: string | null | undefined, count: number): string;
//# sourceMappingURL=visible-text.d.ts.map