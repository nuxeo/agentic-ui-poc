import { avatarColor, type NuxeoComment } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsCommentExtraDirective } from './comment-extra.directive';
import * as i0 from "@angular/core";
/**
 * A document's comments and their replies — Web UI's `nuxeo-document-comment-thread`.
 *
 * It reads and writes the thread itself through `DocumentDetailService`. As in Web UI:
 *
 * - The newest `pageSize` comments show, oldest first, under a "View all" button for the rest.
 * - Anyone who can read the document is offered the comment box; Nuxeo decides whether the comment
 *   is accepted. `readOnly` takes the box and the actions away.
 * - Edit and Delete are offered to the comment's author and to administrators only. Delete asks
 *   first, and says so when the replies go with it.
 * - Only a top-level comment takes replies. Its replies stay folded behind a count until opened.
 * - Ctrl+Enter submits; a comment longer than `maxChars` is cut short behind "Show all".
 *
 * `threadChange` hands the loaded comments and replies to the host, and a projected
 * `[nxsCommentExtra]` template renders under each one.
 */
export declare class NxsCommentsComponent {
    private readonly documents;
    private readonly translate;
    private readonly toast;
    private readonly dialog;
    private readonly username;
    private readonly admin;
    private readonly destroyRef;
    private readonly injector;
    private readonly host;
    /** The commented document. Changing it loads that document's thread. */
    readonly documentUid: import("@angular/core").InputSignal<string>;
    /** Shows the thread without the comment box, Reply, Edit or Delete. */
    readonly readOnly: import("@angular/core").InputSignal<boolean>;
    /** How many of the newest comments, and of each comment's newest replies, show at first. */
    readonly pageSize: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Longer comments are cut short behind "Show all". */
    readonly maxChars: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Every loaded comment and reply, after the thread loads and after each change to it. */
    readonly threadChange: import("@angular/core").OutputEmitterRef<readonly NuxeoComment[]>;
    protected readonly extra: import("@angular/core").Signal<NxsCommentExtraDirective | undefined>;
    private readonly deleteDialog;
    protected readonly id: string;
    protected readonly loading: import("@angular/core").WritableSignal<boolean>;
    protected readonly failed: import("@angular/core").WritableSignal<boolean>;
    protected readonly saving: import("@angular/core").WritableSignal<boolean>;
    protected readonly comments: import("@angular/core").WritableSignal<readonly NuxeoComment[]>;
    protected readonly replies: import("@angular/core").WritableSignal<Readonly<Record<string, readonly NuxeoComment[]>>>;
    protected readonly allShown: import("@angular/core").WritableSignal<boolean>;
    protected readonly opened: import("@angular/core").WritableSignal<ReadonlySet<string>>;
    protected readonly allRepliesShown: import("@angular/core").WritableSignal<ReadonlySet<string>>;
    protected readonly fullText: import("@angular/core").WritableSignal<ReadonlySet<string>>;
    protected readonly editing: import("@angular/core").WritableSignal<string | null>;
    protected readonly editText: import("@angular/core").WritableSignal<string>;
    protected readonly newText: import("@angular/core").WritableSignal<string>;
    protected readonly replyTexts: import("@angular/core").WritableSignal<Readonly<Record<string, string>>>;
    protected readonly shown: import("@angular/core").Signal<readonly NuxeoComment[]>;
    protected readonly hiddenCount: import("@angular/core").Signal<number>;
    private readonly reloads;
    private menuChoice;
    constructor();
    /** Loads the thread again, keeping what is being typed. */
    reload(): void;
    protected repliesOf(id: string): readonly NuxeoComment[];
    protected shownReplies(id: string): readonly NuxeoComment[];
    protected lastReply(id: string): string;
    /** Web UI's rule: the author, by username, or an administrator. */
    protected canModify(comment: NuxeoComment): boolean;
    protected initial(author: string): string;
    protected color(author: string): ReturnType<typeof avatarColor>;
    protected when(date: string | undefined): string;
    /**
     * Nuxeo 2025 stamps `comment:modificationDate` with the creation date when a comment is made, so
     * Web UI's "set at all" test would mark every comment edited; a later date is an edit.
     */
    protected edited(comment: NuxeoComment): boolean;
    protected truncated(comment: NuxeoComment): boolean;
    protected shortText(comment: NuxeoComment): string;
    protected showFullText(comment: NuxeoComment): void;
    protected showAllReplies(id: string): void;
    protected textOf(event: Event): string;
    protected setReplyText(id: string, value: string): void;
    protected replyText(id: string): string;
    /** Opens a comment's replies; from Reply, also puts the cursor in the reply box. */
    protected openReplies(id: string, focusBox?: boolean): void;
    protected submitComment(): void;
    protected submitReply(parent: NuxeoComment): void;
    protected choose(action: 'edit' | 'delete', comment: NuxeoComment, parent: NuxeoComment | null): void;
    /**
     * Runs the chosen item once the menu has closed and handed focus back to its button — otherwise
     * that hand-back takes the cursor out of the edit box, and the delete dialog, opened from an item
     * that no longer exists, has nowhere to return focus on Cancel.
     */
    protected menuClosed(): void;
    private startEdit;
    protected cancelEdit(): void;
    protected saveEdit(comment: NuxeoComment, parent: NuxeoComment | null): void;
    private confirmDelete;
    private remove;
    private save;
    /**
     * A refusal reads as one, and a comment someone else removed reloads the thread — Web UI says
     * "may not be available anymore" and leaves the stale entry on screen.
     */
    private failedTo;
    private fetch;
    private reset;
    private changed;
    private focus;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsCommentsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsCommentsComponent, "nxs-comments", never, { "documentUid": { "alias": "documentUid"; "required": true; "isSignal": true; }; "readOnly": { "alias": "readOnly"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "maxChars": { "alias": "maxChars"; "required": false; "isSignal": true; }; }, { "threadChange": "threadChange"; }, ["extra"], never, true, never>;
}
//# sourceMappingURL=comments.component.d.ts.map