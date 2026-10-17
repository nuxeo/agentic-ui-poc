import { type NxsAvatarColor, type NxsAvatarInputs, type NxsAvatarSize } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
/**
 * `nxs.primitives.avatar` on Satori's `sat-avatar`, with the same accessible name as Material's.
 *
 * `sat-avatar` is itself `role="img"` and takes no name, so this host is the one image and
 * `sat-avatar` is presentational inside it.
 */
export declare class NxsSatoriAvatarComponent implements NxsAvatarInputs {
    readonly initials: import("@angular/core").InputSignal<string>;
    readonly color: import("@angular/core").InputSignal<NxsAvatarColor>;
    readonly size: import("@angular/core").InputSignal<NxsAvatarSize>;
    readonly label: import("@angular/core").InputSignal<string>;
    /** Material's rule: the label as a reader gets it, and blank means decorative. */
    protected readonly name: import("@angular/core").Signal<string>;
    /**
     * Material's display value, never empty: at size 24 `sat-avatar` reads `initials()[0]`, which
     * throws on an empty string inside change detection, and would split an emoji there. So size 24
     * gets one whole initial, as Material's does, and a space renders the blank circle Material
     * renders for blank initials.
     */
    protected readonly shownInitials: import("@angular/core").Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSatoriAvatarComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSatoriAvatarComponent, "nxs-satori-avatar", never, { "initials": { "alias": "initials"; "required": true; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=satori-avatar.component.d.ts.map