import type { NxsTagColor, NxsTagInputs } from '../primitives';
import * as i0 from "@angular/core";
/**
 * A short static label in a colour — the Material implementation of `nxs.primitives.tag`.
 *
 * Each colour is a hue of its own, tinted as the avatar's are, and `gray` the theme's neutral
 * container; set `--nxs-tag-<colour>-background` and `-foreground` to give a colour another hue. A
 * label longer than the space wraps inside the tag, as Web UI's does, rather than being cut short or
 * spilling out.
 */
export declare class NxsTagComponent implements NxsTagInputs {
    /** The text, already translated. A long label wraps; it is never cut short. */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The colour: `gray` or one of the avatar colours. */
    readonly color: import("@angular/core").InputSignal<NxsTagColor>;
    protected readonly namedColor: import("@angular/core").Signal<Record<string, string> | null>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsTagComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsTagComponent, "nxs-tag", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=tag.component.d.ts.map