/**
 * The avatar's and the tag's eight named colours.
 *
 * Material has no named palette, and its container roles follow the theme: under a rose primary
 * a "blue" mapped to `primary-container` turns pink, and no role is teal at all. So each name has
 * its own hue, tinted toward the theme's surface for the background and toward its text colour for
 * the text, which keeps the name's hue in light and dark themes alike. The text share differs per
 * colour because a light hue such as yellow needs more of the dark text colour to stay readable.
 * `named-colors.spec.ts` holds every pair at 4.5:1 or more, and each hue inside its name's range,
 * in the Material themes Storybook and the application compile.
 *
 * A host gives a colour its own hue with `--nxs-avatar-<colour>-background` and `-foreground`, or
 * `--nxs-tag-<colour>-…`; nothing here checks a hue set that way.
 */
export const NXS_NAMED_COLORS = Object.freeze({
    purple: { hue: '#8e24aa', background: 16, foreground: 60 },
    blue: { hue: '#1976d2', background: 16, foreground: 75 },
    pink: { hue: '#d81b60', background: 16, foreground: 65 },
    teal: { hue: '#008080', background: 16, foreground: 75 },
    yellow: { hue: '#fdd835', background: 16, foreground: 40 },
    green: { hue: '#2e7d32', background: 16, foreground: 70 },
    red: { hue: '#c62828', background: 16, foreground: 65 },
    orange: { hue: '#ef6c00', background: 16, foreground: 60 },
});
/**
 * The custom properties a component's stylesheet mixes its colour from, bound on its host with
 * `[style]`: `--nxs-named-hue`, `--nxs-named-background-mix` and `--nxs-named-foreground-mix`.
 * `null` for a name with no hue of its own (the tag's `gray`), which removes them.
 */
export function nxsNamedColorStyle(color) {
    const named = NXS_NAMED_COLORS[color];
    if (!named)
        return null;
    return {
        '--nxs-named-hue': named.hue,
        '--nxs-named-background-mix': `${named.background}%`,
        '--nxs-named-foreground-mix': `${named.foreground}%`,
    };
}
//# sourceMappingURL=named-colors.js.map