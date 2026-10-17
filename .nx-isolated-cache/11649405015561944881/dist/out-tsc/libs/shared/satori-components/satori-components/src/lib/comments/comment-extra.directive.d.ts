import { TemplateRef } from '@angular/core';
import type { NuxeoComment } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/** What a projected `[nxsCommentExtra]` template receives: the comment or reply it sits under. */
export interface NxsCommentContext {
    readonly $implicit: NuxeoComment;
}
/**
 * Content rendered under each comment's and reply's text — a sentiment badge, a translation:
 * `<ng-template nxsCommentExtra let-comment>…</ng-template>`.
 */
export declare class NxsCommentExtraDirective {
    readonly template: TemplateRef<NxsCommentContext>;
    static ngTemplateContextGuard(_directive: NxsCommentExtraDirective, _context: unknown): _context is NxsCommentContext;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsCommentExtraDirective, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NxsCommentExtraDirective, "ng-template[nxsCommentExtra]", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=comment-extra.directive.d.ts.map