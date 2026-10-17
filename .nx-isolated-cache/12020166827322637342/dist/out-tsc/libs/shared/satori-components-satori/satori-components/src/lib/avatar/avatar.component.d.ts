import type { NxsAvatarColor, NxsAvatarInputs, NxsAvatarSize } from '../primitives';
import * as i0 from "@angular/core";
/**
 * A person's initials in a coloured circle — the Material implementation of
 * `nxs.primitives.avatar`.
 *
 * Material has no eight-hue palette, so each colour is a hue of its own (`named-colors.ts`) tinted
 * toward the theme's surface and text, which keeps it that colour in light and dark themes and under
 * any primary palette. Set `--nxs-avatar-<colour>-background` and `-foreground` to give a colour
 * another hue.
 */
export declare class NxsAvatarComponent implements NxsAvatarInputs {
    /**
     * The person's initials, upper-cased: up to two, or one at size `24`, where two do not fit and
     * Satori's avatar shows one.
     */
    readonly initials: import("@angular/core").InputSignal<string>;
    /** The circle's colour: `purple`, `blue`, `pink`, `teal`, `yellow`, `green`, `red` or `orange`. */
    readonly color: import("@angular/core").InputSignal<NxsAvatarColor>;
    /** The diameter in pixels: `24`, `28`, `36`, `64`, `80` or `128`. */
    readonly size: import("@angular/core").InputSignal<NxsAvatarSize>;
    /**
     * The accessible name, usually the person's name, already translated. Blank, or only whitespace
     * or zero-width characters, makes the avatar decorative.
     */
    readonly label: import("@angular/core").InputSignal<string>;
    protected readonly name: import("@angular/core").Signal<string>;
    protected readonly namedColor: import("@angular/core").Signal<Record<string, string> | null>;
    protected readonly shownInitials: import("@angular/core").Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsAvatarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsAvatarComponent, "nxs-avatar", never, { "initials": { "alias": "initials"; "required": true; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=avatar.component.d.ts.map