import { TemplateRef } from '@angular/core';
import * as i0 from "@angular/core";
/** One tab, already resolved by the host. */
export interface NxsTab {
    /** The tab's registered ID; rendered as `data-tab-id` on its label and handed to the body. */
    readonly id: string;
    /** What the tab says, already translated. */
    readonly label: string;
    /** A Material icon ligature shown before the label. Decorative. */
    readonly icon?: string;
}
/** The context a tab body template receives: the tab, as `let-tab`. */
export interface NxsTabBodyContext {
    readonly $implicit: NxsTab;
}
/**
 * Marks the template every tab body renders from: `<ng-template nxsTabBody let-tab>`, usually an
 * `@switch (tab.id)` over the packaged bodies with an extension outlet as the default.
 */
export declare class NxsTabBodyDirective {
    readonly template: TemplateRef<NxsTabBodyContext>;
    static ngTemplateContextGuard(_directive: NxsTabBodyDirective, _context: unknown): _context is NxsTabBodyContext;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsTabBodyDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NxsTabBodyDirective, "ng-template[nxsTabBody]", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=tab-body.directive.d.ts.map