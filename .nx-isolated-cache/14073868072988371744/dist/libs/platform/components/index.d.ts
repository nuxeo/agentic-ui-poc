import * as _angular_core from '@angular/core';
import { AfterViewInit, OnDestroy, TemplateRef, DoCheck, InputSignal, InputSignalWithTransform, Signal, Provider, EnvironmentProviders } from '@angular/core';
import { NuxeoComment, avatarColor, NuxeoDocument, AuditLogSortField, AuditEntry, DirectoryEntry, NuxeoAce, DocumentDetailService, l10nEntryLabel, directoryPickerLabel, groupL10nChildrenByParent, UserGroupSuggestion, AggregateResult, SearchQueryParams, SearchAggregations, SearchCollectionOption, SavedSearchOption } from '@nuxeo/satori-platform/nuxeo-client';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ErrorStateMatcher } from '@angular/material/core';
import { ControlValueAccessor, Validator, AbstractControl, ValidationErrors, FormGroup, FormControl, FormArray } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Observable } from 'rxjs';

/** One entry in an action menu. */
interface NxsMenuAction {
    /** The action's registered ID; rendered as `data-action-id`. */
    readonly id: string;
    /** What the entry says, already translated. */
    readonly label: string;
    /** An optional Material icon ligature. Decorative. */
    readonly icon?: string;
    /** Shown but not selectable — the action's enabled rule said no. */
    readonly disabled?: boolean;
}
/**
 * An icon button that opens a menu of actions — the renderer for an action slot such as
 * `contextMenu`.
 *
 * Presentational: the host resolves its slot's descriptors into entries (labels translated, enabled
 * rules evaluated) and runs the action `selected` names, so the library takes no dependency on the
 * extensions barrel. With no entries it renders nothing; a trigger that opens an empty menu is a
 * control that does nothing.
 */
declare class NxsActionMenuComponent {
    /** The entries, in display order. */
    readonly actions: _angular_core.InputSignal<readonly NxsMenuAction[]>;
    /**
     * The trigger's accessible name and tooltip, already translated — "More actions". A blank one is
     * the caller's mistake, and it falls back to the library's own "More actions" rather than hiding
     * the entries or leaving an icon button with no name.
     */
    readonly label: _angular_core.InputSignal<string>;
    /** The trigger's Material icon ligature. */
    readonly icon: _angular_core.InputSignal<string>;
    /** The entry the user chose. Never a disabled one. */
    readonly selected: _angular_core.OutputEmitterRef<NxsMenuAction>;
    /** The label as a reader gets it: whitespace or zero-width characters alone are no name. */
    protected readonly ownLabel: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsActionMenuComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsActionMenuComponent, "nxs-action-menu", never, { "actions": { "alias": "actions"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, { "selected": "selected"; }, never, never, true, never>;
}

/** One column the user may show or hide. */
interface NxsPickableColumn {
    /** The host's key for the column; what `apply` emits. */
    readonly key: string;
    /** The column's name, already translated. */
    readonly label: string;
    /** Whether the column is shown now. */
    readonly visible: boolean;
}
/**
 * The panel a user opens from a table header to choose which columns show.
 *
 * Presentational: it is handed the columns and emits the keys chosen, in the columns' own order so
 * a reorder in the host's column set is respected. Where the columns come from — Layer 1
 * descriptors on browse, a fixed set on search — and where the choice is persisted stay the host's.
 *
 * Changes are buffered until Done, so Escape and the backdrop genuinely discard them. It is a
 * modal dialog while open: it takes focus when it appears, keeps Tab and Shift+Tab inside itself,
 * and hands focus back to whatever had it (the header's "Manage columns" button) when it goes. The panel hangs from the top-right corner
 * of the nearest positioned ancestor, so the host renders it inside the table's wrapper.
 */
declare class NxsColumnPickerComponent implements AfterViewInit, OnDestroy {
    /** Every column the user may choose from, in display order. */
    readonly columns: _angular_core.InputSignal<readonly NxsPickableColumn[]>;
    /** Keys that cannot be switched off — the identity column, so no row is left unlabelled. */
    readonly required: _angular_core.InputSignal<readonly string[]>;
    /** The keys Reset returns to: the host's defaults, not a copy of a packaged list. */
    readonly defaults: _angular_core.InputSignal<readonly string[]>;
    /** Done: the chosen keys, in column order. */
    readonly apply: _angular_core.OutputEmitterRef<readonly string[]>;
    /** Escape or the backdrop: close without applying. */
    readonly dismiss: _angular_core.OutputEmitterRef<void>;
    private readonly panel;
    private readonly opener;
    private readonly pending;
    protected readonly chosen: _angular_core.Signal<readonly string[]>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected isChosen(key: string): boolean;
    protected isRequired(key: string): boolean;
    protected toggle(key: string): void;
    protected reset(): void;
    protected commit(): void;
    protected cancel(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsColumnPickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsColumnPickerComponent, "nxs-column-picker", never, { "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "defaults": { "alias": "defaults"; "required": false; "isSignal": true; }; }, { "apply": "apply"; "dismiss": "dismiss"; }, never, never, true, never>;
}

/** What a projected `[nxsCommentExtra]` template receives: the comment or reply it sits under. */
interface NxsCommentContext {
    readonly $implicit: NuxeoComment;
}
/**
 * Content rendered under each comment's and reply's text — a sentiment badge, a translation:
 * `<ng-template nxsCommentExtra let-comment>…</ng-template>`.
 */
declare class NxsCommentExtraDirective {
    readonly template: TemplateRef<NxsCommentContext>;
    static ngTemplateContextGuard(_directive: NxsCommentExtraDirective, _context: unknown): _context is NxsCommentContext;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsCommentExtraDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NxsCommentExtraDirective, "ng-template[nxsCommentExtra]", never, {}, {}, never, never, true, never>;
}

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
declare class NxsCommentsComponent {
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
    readonly documentUid: _angular_core.InputSignal<string>;
    /** Shows the thread without the comment box, Reply, Edit or Delete. */
    readonly readOnly: _angular_core.InputSignal<boolean>;
    /** How many of the newest comments, and of each comment's newest replies, show at first. */
    readonly pageSize: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Longer comments are cut short behind "Show all". */
    readonly maxChars: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Every loaded comment and reply, after the thread loads and after each change to it. */
    readonly threadChange: _angular_core.OutputEmitterRef<readonly NuxeoComment[]>;
    protected readonly extra: _angular_core.Signal<NxsCommentExtraDirective | undefined>;
    private readonly deleteDialog;
    protected readonly id: string;
    protected readonly loading: _angular_core.WritableSignal<boolean>;
    protected readonly failed: _angular_core.WritableSignal<boolean>;
    protected readonly saving: _angular_core.WritableSignal<boolean>;
    protected readonly comments: _angular_core.WritableSignal<readonly NuxeoComment[]>;
    protected readonly replies: _angular_core.WritableSignal<Readonly<Record<string, readonly NuxeoComment[]>>>;
    protected readonly allShown: _angular_core.WritableSignal<boolean>;
    protected readonly opened: _angular_core.WritableSignal<ReadonlySet<string>>;
    protected readonly allRepliesShown: _angular_core.WritableSignal<ReadonlySet<string>>;
    protected readonly fullText: _angular_core.WritableSignal<ReadonlySet<string>>;
    protected readonly editing: _angular_core.WritableSignal<string | null>;
    protected readonly editText: _angular_core.WritableSignal<string>;
    protected readonly newText: _angular_core.WritableSignal<string>;
    protected readonly replyTexts: _angular_core.WritableSignal<Readonly<Record<string, string>>>;
    protected readonly shown: _angular_core.Signal<readonly NuxeoComment[]>;
    protected readonly hiddenCount: _angular_core.Signal<number>;
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
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsCommentsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsCommentsComponent, "nxs-comments", never, { "documentUid": { "alias": "documentUid"; "required": true; "isSignal": true; }; "readOnly": { "alias": "readOnly"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "maxChars": { "alias": "maxChars"; "required": false; "isSignal": true; }; }, { "threadChange": "threadChange"; }, ["extra"], never, true, never>;
}

/** One entry of the suggestion list: an existing tag, or the typed text as a new one. */
interface NxsTagOption {
    readonly label: string;
    readonly isNew: boolean;
}
/**
 * A document's tags, added and removed in place — Web UI's `nuxeo-tag-suggestion` with
 * `allow-new-tags`, as the document page uses it.
 *
 * It tags the document itself through `TagService`. As in Web UI:
 *
 * - Typing suggests existing tags through the `Tag.Suggestion` operation, and offers the typed text
 *   as a new tag when no tag matches it exactly. Enter adds what is highlighted.
 * - Each change is saved at once; there is no Save button. Nuxeo normalises a label, so the chip
 *   shows the label it stored, and a toast says what changed.
 * - `readOnly` shows the tags without the box or the remove buttons. Web UI's rule for it is
 *   `canTagDocument`: Write on the document itself, not a version or a proxy.
 *
 * Changes are sent one at a time, in order, so an answer can never overwrite a later one.
 * `tagsChange` hands the document's tags to the host after each saved change.
 */
declare class NxsTagEditorComponent {
    private readonly tagService;
    private readonly translate;
    private readonly toast;
    /** The document to tag. */
    readonly documentUid: _angular_core.InputSignal<string>;
    /** The document's tags as loaded — `nxtag:tags`' labels. */
    readonly tags: _angular_core.InputSignal<readonly string[]>;
    /** Shows the tags only, with no box and no remove buttons. */
    readonly readOnly: _angular_core.InputSignal<boolean>;
    /** The document's tags after each saved change, as Nuxeo stored them. */
    readonly tagsChange: _angular_core.OutputEmitterRef<readonly string[]>;
    protected readonly id: string;
    private readonly boxRef;
    private readonly trigger;
    /** The tags as last known: the input, then each answer from the server. */
    protected readonly saved: _angular_core.WritableSignal<readonly string[]>;
    protected readonly adding: _angular_core.WritableSignal<readonly string[]>;
    protected readonly removing: _angular_core.WritableSignal<ReadonlySet<string>>;
    protected readonly term: _angular_core.WritableSignal<string>;
    private readonly suggestions;
    /** The chips: the saved tags less those being removed. Tags being added show after them. */
    protected readonly shown: _angular_core.Signal<string[]>;
    protected readonly options: _angular_core.Signal<readonly NxsTagOption[]>;
    private readonly requests;
    private readonly terms;
    constructor();
    protected typed(value: string): void;
    /** A suggestion picked with the mouse, or highlighted when Enter was pressed. */
    protected picked(event: MatAutocompleteSelectedEvent): void;
    /** Enter in the box. Ignored while a suggestion is highlighted: picking it adds the tag. */
    protected entered(event: MatChipInputEvent): void;
    protected remove(tag: string): void;
    private add;
    private send;
    private settle;
    private failure;
    private clearBox;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsTagEditorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsTagEditorComponent, "nxs-tag-editor", never, { "documentUid": { "alias": "documentUid"; "required": true; "isSignal": true; }; "tags": { "alias": "tags"; "required": false; "isSignal": true; }; "readOnly": { "alias": "readOnly"; "required": false; "isSignal": true; }; }, { "tagsChange": "tagsChange"; }, never, never, true, never>;
}

/**
 * A document's version number as Web UI writes it: `1.2`, and `1.2+` while it is checked out —
 * changed since that version.
 */
declare function nxsVersionLabel(doc: NuxeoDocument): string;
/**
 * A document's versions — Web UI's `nuxeo-document-versions`, as the document's info panel shows
 * it.
 *
 * As in Web UI:
 *
 * - With versions, the number (`1.2`, `1.2+` when checked out) opens the list, newest first, each
 *   with when and by whom it was last changed. Choosing one emits `versionSelected`; the host opens
 *   it read-only. Choosing never restores — restoring is the version page's confirmed action.
 * - On a version, the list leads back to the live document (`latestSelected`), and lists the live
 *   document's versions with the one on screen marked.
 * - Create Version is in the list while the document is checked out, and is the whole control
 *   while it has no version. It is offered only where `canCreateDocumentVersion` holds — the live
 *   document, not a publication or a record, `Versionable`, and `WriteVersion`; otherwise the control reads
 *   "Unversioned". It opens `nxs-create-version-dialog` and emits `versionCreated`.
 *
 * The list is read when it opens, through `Document.GetVersions`, which reads the repository
 * rather than the search index, so a version just created is in it.
 */
declare class NxsManageVersionsComponent {
    private readonly documents;
    private readonly dialog;
    private readonly translate;
    private readonly destroyRef;
    /** The document on screen: the live document or one of its versions. */
    readonly document: _angular_core.InputSignal<NuxeoDocument>;
    /** A version the user chose. Open it read-only; never restore from here. */
    readonly versionSelected: _angular_core.OutputEmitterRef<NuxeoDocument>;
    /** The live document, chosen while one of its versions is on screen. */
    readonly latestSelected: _angular_core.OutputEmitterRef<void>;
    /** A version was created: the document is now checked in at it. Reload the document. */
    readonly versionCreated: _angular_core.OutputEmitterRef<NuxeoDocument>;
    protected readonly label: _angular_core.Signal<string>;
    protected readonly hasVersions: _angular_core.Signal<boolean>;
    protected readonly canCreate: _angular_core.Signal<boolean>;
    /** Create Version in the list: only while there are changes to version, as in Web UI. */
    protected readonly offersCreate: _angular_core.Signal<boolean>;
    /** The document whose versions are listed — this one, or the live one a version belongs to. */
    private readonly liveUid;
    protected readonly versions: _angular_core.WritableSignal<readonly NuxeoDocument[]>;
    protected readonly loading: _angular_core.WritableSignal<boolean>;
    protected readonly failed: _angular_core.WritableSignal<boolean>;
    private readonly opens;
    constructor();
    protected opened(): void;
    protected retry(event: Event): void;
    protected isShown(version: NuxeoDocument): boolean;
    protected numberOf(version: NuxeoDocument): string;
    protected modified(version: NuxeoDocument): string;
    protected choose(version: NuxeoDocument): void;
    protected create(): void;
    private fetch;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsManageVersionsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsManageVersionsComponent, "nxs-manage-versions", never, { "document": { "alias": "document"; "required": true; "isSignal": true; }; }, { "versionSelected": "versionSelected"; "latestSelected": "latestSelected"; "versionCreated": "versionCreated"; }, never, never, true, never>;
}

/** What `nxs-create-version-dialog` versions. */
interface NxsCreateVersionDialogData {
    readonly documentUid: string;
    readonly documentTitle: string;
    /** The document's version now — `uid:major_version` and `uid:minor_version`. */
    readonly major: number;
    readonly minor: number;
}
/** Closes with the version created, or with nothing when cancelled. */
type NxsCreateVersionDialogResult = NuxeoDocument | undefined;
/**
 * Create a version of a document — Web UI's `nuxeo-document-create-version` dialog.
 *
 * As in Web UI: Minor and Major are offered with the number each would give, Major chosen first,
 * and Create runs `Document.CreateVersion`, which checks the document in at the new version. A toast
 * names the version created; a refusal reads as one. It does not decide who may version — open it
 * only where `canCreateDocumentVersion(doc)` holds, as `nxs-manage-versions` does.
 */
declare class NxsCreateVersionDialogComponent {
    protected readonly data: NxsCreateVersionDialogData;
    private readonly dialogRef;
    private readonly documents;
    private readonly translate;
    private readonly toast;
    private readonly destroyRef;
    protected increment: 'Major' | 'Minor';
    protected readonly saving: _angular_core.WritableSignal<boolean>;
    protected readonly current: string;
    protected readonly nextMinor: string;
    protected readonly nextMajor: string;
    protected create(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsCreateVersionDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsCreateVersionDialogComponent, "nxs-create-version-dialog", never, {}, {}, never, never, true, never>;
}

/**
 * The four error variants, by the HTTP status each stands for — Satori 1.0's `sat-401-`,
 * `sat-403-`, `sat-404-` and `sat-500-error-state`.
 */
type NxsErrorStatus = 401 | 403 | 404 | 500;
/**
 * The variant for a failed request.
 *
 * 401, 403 and 404 map to themselves. Anything else — a 5xx, a network failure (status 0), an
 * error thrown with no status at all — is 500: the request did not complete and nothing says the
 * user is the reason.
 */
declare function nxsErrorStatus(error: unknown): NxsErrorStatus;

/**
 * A heading's level in the page outline, `<h1>` to `<h6>`.
 *
 * Named so the published declarations print it by name: TypeScript writes an anonymous literal
 * union in whatever order it first created the members, which moves with unrelated code and made
 * `docs/api/platform.api.md` report the same type as changed.
 */
type NxsHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** The filters, as the user set them. */
interface NxsHistoryFilters {
    readonly user: string;
    readonly from: Date | null;
    readonly to: Date | null;
    readonly eventId: string;
    readonly category: string;
}
/**
 * A document's history — Web UI's `nuxeo-document-history`, which is its audit search for one
 * document.
 *
 * As in Web UI, every filter and the sort go to the server (`@audit`), so they reach every entry
 * rather than the page on screen: the user who acted (an exact username), a From and To day, the
 * performed action and the event category. The table shows the action, when, who, the category,
 * the comment and the lifecycle state, newest first, a page at a time. Action and category read
 * through the `eventTypes` and `eventCategories` vocabularies.
 *
 * It needs a Material `DateAdapter`, as any datepicker does; the host provides it.
 */
declare class NxsDocumentHistoryComponent {
    private readonly documents;
    private readonly directories;
    /** The document whose history this is. */
    readonly documentUid: _angular_core.InputSignal<string>;
    /** Entries per page; the user can change it. */
    readonly pageSize: _angular_core.InputSignal<number>;
    /** The heading level of the empty and error states, one below the section's own. */
    readonly headingLevel: _angular_core.InputSignal<NxsHeadingLevel>;
    protected readonly columns: string[];
    protected readonly filters: _angular_core.WritableSignal<NxsHistoryFilters>;
    /** What is in the Username box; it filters once the user pauses, not per keystroke. */
    protected readonly userText: _angular_core.WritableSignal<string>;
    private readonly typed;
    protected readonly sort: _angular_core.WritableSignal<{
        by: AuditLogSortField;
        order: "asc" | "desc";
    }>;
    protected readonly pageIndex: _angular_core.WritableSignal<number>;
    private readonly chosenPageSize;
    protected readonly size: _angular_core.Signal<number>;
    private readonly retries;
    protected readonly entries: _angular_core.WritableSignal<readonly AuditEntry[]>;
    protected readonly total: _angular_core.WritableSignal<number>;
    protected readonly loading: _angular_core.WritableSignal<boolean>;
    protected readonly failure: _angular_core.WritableSignal<NxsErrorStatus | null>;
    protected readonly filtered: _angular_core.Signal<boolean>;
    protected readonly eventTypes: _angular_core.WritableSignal<readonly DirectoryEntry[]>;
    protected readonly categories: _angular_core.WritableSignal<readonly DirectoryEntry[]>;
    protected readonly eventOptions: _angular_core.Signal<{
        id: string;
        label: string;
    }[]>;
    protected readonly categoryOptions: _angular_core.Signal<{
        id: string;
        label: string;
    }[]>;
    private readonly eventLabels;
    private readonly categoryLabels;
    constructor();
    protected setFilter<K extends keyof NxsHistoryFilters>(key: K, value: NxsHistoryFilters[K]): void;
    protected typeUser(text: string): void;
    protected clearFilters(): void;
    protected sorted(event: Sort): void;
    protected paged(event: PageEvent): void;
    protected retry(): void;
    protected eventLabel(id: string): string;
    protected categoryLabel(id: string): string;
    protected initials(user: string): string;
    private queryOf;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDocumentHistoryComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDocumentHistoryComponent, "nxs-document-history", never, { "documentUid": { "alias": "documentUid"; "required": true; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** What the delete-permission dialog needs from the page that opens it. */
interface NxsDeletePermissionDialogData {
    /** The document the entry is on. */
    readonly documentUid: string;
    /** The entry to delete, as the `acls` enricher returned it. */
    readonly ace: NuxeoAce;
    /** The ACL holding the entry. `local` when absent. */
    readonly acl?: string;
}
/**
 * Confirms, then deletes, one permission entry, as a `MatDialog`:
 * `dialog.open(NxsDeletePermissionDialogComponent, { data, role: 'alertdialog' })`.
 *
 * It deletes the entry by its id, as Web UI does, so the user's other entries on the document stay.
 * It closes with `true` once Nuxeo has deleted it; a failure is reported and the dialog stays open.
 */
declare class NxsDeletePermissionDialogComponent {
    private readonly dialogRef;
    private readonly data;
    private readonly detail;
    private readonly translate;
    private readonly toast;
    private readonly locale;
    private readonly destroyRef;
    protected readonly deleting: _angular_core.WritableSignal<boolean>;
    protected readonly principal: string;
    protected readonly right: string;
    protected readonly timeFrame: string;
    protected readonly grantedBy: string;
    /** The entry's four fields, under the labels of the Permissions tab's columns. */
    protected readonly fields: {
        label: string;
        value: string;
    }[];
    /**
     * Below Material's small-screen breakpoint, where MatDialog narrows to the screen, the four
     * columns do not fit, so the entry shows as one label and value row per field instead.
     * `observe()` answers with the current state as it subscribes, so the first render already has
     * the right layout and a phone never sees the table first.
     */
    protected readonly narrow: _angular_core.Signal<boolean>;
    protected confirm(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDeletePermissionDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDeletePermissionDialogComponent, "nxs-delete-permission-dialog", never, {}, {}, never, never, true, never>;
}

/** What the share-with-external-user dialog needs from the page that opens it. */
interface NxsShareExternalDialogData {
    /** The document to share. */
    readonly documentUid: string;
    /**
     * The document type's `userVisiblePermissions`, the rights the dialog offers. Nuxeo's default
     * three (Read, ReadWrite, Everything) when absent.
     */
    readonly permissions?: readonly string[] | null;
}
/**
 * Shares a document with someone outside the organisation, as a `MatDialog`:
 * `dialog.open(NxsShareExternalDialogComponent, { data })`.
 *
 * As in Web UI, the share needs an end date and always emails the person a link; Nuxeo creates no
 * account for them. **Create and add another** keeps the dialog open for the next person. The
 * dialog closes with `true` when it shared the document with anyone, `false` otherwise.
 */
declare class NxsShareExternalDialogComponent {
    private readonly dialogRef;
    private readonly data;
    private readonly detail;
    private readonly translate;
    private readonly toast;
    private readonly destroyRef;
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    private readonly dateAdapter;
    protected readonly rights: readonly string[];
    protected readonly mailHint = "permissions.notification.mail-hint";
    protected readonly email: _angular_core.WritableSignal<string>;
    protected readonly emailLeft: _angular_core.WritableSignal<boolean>;
    protected readonly right: _angular_core.WritableSignal<string>;
    /** The share's days, at local midnight. */
    protected readonly begin: _angular_core.WritableSignal<Date | null>;
    protected readonly end: _angular_core.WritableSignal<Date | null>;
    /** The same days as the date fields hold them, in their adapter's own representation. */
    protected readonly beginField: _angular_core.Signal<unknown>;
    protected readonly endField: _angular_core.Signal<unknown>;
    protected readonly comment: _angular_core.WritableSignal<string>;
    /** Which button is saving, so only that one shows the spinner. */
    protected readonly saving: _angular_core.WritableSignal<"create" | "another" | null>;
    private shared;
    protected readonly emailValid: _angular_core.Signal<boolean>;
    /**
     * Puts the email box in Material's error state once the user has left it invalid, so the input
     * sets `aria-invalid` and points `aria-describedby` at the `mat-error` itself.
     */
    protected readonly emailError: ErrorStateMatcher;
    private readonly emailBox;
    protected readonly endBeforeBegin: _angular_core.Signal<boolean>;
    protected readonly valid: _angular_core.Signal<boolean>;
    constructor();
    protected label(permission: string): string;
    /** The day a date field holds, whatever its adapter holds dates as. */
    protected fieldDay(value: unknown): Date | null;
    protected cancel(): void;
    protected create(another: boolean): void;
    private reset;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsShareExternalDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsShareExternalDialogComponent, "nxs-share-external-dialog", never, {}, {}, never, never, true, never>;
}

/** What the update-permission dialog needs from the page that opens it. */
interface NxsUpdatePermissionDialogData {
    /** The document the entry is on. */
    readonly documentUid: string;
    /** The entry to change, as the `acls` enricher returned it. */
    readonly ace: NuxeoAce;
    /**
     * The document type's `userVisiblePermissions`, the rights the dialog offers, plus the entry's
     * own. Nuxeo's default three (Read, ReadWrite, Everything) when absent.
     */
    readonly permissions?: readonly string[] | null;
}
/**
 * Changes one permission entry's right, time frame or both, as a `MatDialog`:
 * `dialog.open(NxsUpdatePermissionDialogComponent, { data })`.
 *
 * It replaces the entry in one call, as Web UI does, so a failure leaves the entry as it was. An
 * external user's share keeps its required end date and always emails the person again. A date the
 * user did not change is written back as the instant Nuxeo holds, so editing the right alone never
 * moves an entry written from another time zone. It closes with `true` once Nuxeo has saved it.
 */
declare class NxsUpdatePermissionDialogComponent {
    private readonly dialogRef;
    private readonly data;
    private readonly detail;
    private readonly translate;
    private readonly toast;
    private readonly destroyRef;
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    private readonly dateAdapter;
    private readonly ace;
    protected readonly id: string;
    protected readonly external: boolean;
    protected readonly principal: string;
    protected readonly rights: readonly string[];
    protected readonly mailHint = "permissions.notification.mail-hint";
    protected readonly right: _angular_core.WritableSignal<string>;
    protected readonly dated: _angular_core.WritableSignal<boolean>;
    /** The entry's days, at local midnight. */
    protected readonly begin: _angular_core.WritableSignal<Date | null>;
    protected readonly end: _angular_core.WritableSignal<Date | null>;
    /** The same days as the date fields hold them, in their adapter's own representation. */
    protected readonly beginField: _angular_core.Signal<unknown>;
    protected readonly endField: _angular_core.Signal<unknown>;
    protected readonly notify: _angular_core.WritableSignal<boolean>;
    protected readonly comment: _angular_core.WritableSignal<string>;
    protected readonly saving: _angular_core.WritableSignal<boolean>;
    protected readonly endBeforeBegin: _angular_core.Signal<boolean>;
    protected readonly valid: _angular_core.Signal<boolean>;
    protected label(permission: string): string;
    /** The day a date field holds, whatever its adapter holds dates as. */
    protected fieldDay(value: unknown): Date | null;
    protected update(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsUpdatePermissionDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsUpdatePermissionDialogComponent, "nxs-update-permission-dialog", never, {}, {}, never, never, true, never>;
}

/** One view of a details panel — Properties, Comments, Activity — already resolved by the host. */
interface NxsDetailsPanelTab {
    readonly id: string;
    /** What the tab says, already translated. */
    readonly label: string;
}
/**
 * The side panel of a document page — Web UI's `nuxeo-document-page` side pane, with its
 * Comments and Activity tabs, here with Properties beside them.
 *
 * It owns the frame: a header naming the document with a close button, a strip of ARIA tabs, and
 * one tab panel holding whatever the host projects for the selected view. Which views exist (Web
 * UI offers Comments only on a `Commentable` document) and what each shows are the host's.
 */
declare class NxsDetailsPanelComponent {
    private readonly element;
    private readonly uid;
    private readonly tabButtons;
    /** The header text — usually the document's title or file name. */
    readonly heading: _angular_core.InputSignal<string>;
    /** The panel's accessible name, already translated. Blank falls back to `heading`. */
    readonly label: _angular_core.InputSignal<string>;
    /** The views, in order. */
    readonly tabs: _angular_core.InputSignal<readonly NxsDetailsPanelTab[]>;
    /** The selected view's ID. Two-way; one that is not in `tabs` selects the first. */
    readonly selected: _angular_core.ModelSignal<string>;
    /** The close button's accessible name. Blank falls back to "Close details". */
    readonly closeLabel: _angular_core.InputSignal<string>;
    /** The close button was pressed. The host decides what closing means. */
    readonly closed: _angular_core.OutputEmitterRef<void>;
    protected readonly regionLabel: _angular_core.Signal<string | null>;
    protected readonly ownCloseLabel: _angular_core.Signal<string>;
    protected readonly activeId: _angular_core.Signal<string>;
    protected readonly panelId: string;
    protected tabId(id: string): string;
    protected select(tab: NxsDetailsPanelTab): void;
    /** The ARIA tabs pattern: arrows move and select (automatic activation), Home and End jump. */
    protected onKeydown(event: KeyboardEvent, index: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDetailsPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDetailsPanelComponent, "nxs-details-panel", never, { "heading": { "alias": "heading"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "tabs": { "alias": "tabs"; "required": true; "isSignal": true; }; "selected": { "alias": "selected"; "required": false; "isSignal": true; }; "closeLabel": { "alias": "closeLabel"; "required": false; "isSignal": true; }; }, { "selected": "selectedChange"; "closed": "closed"; }, never, ["*"], true, never>;
}

/** One control on a document toolbar, already resolved by the host. */
interface NxsToolbarAction {
    /** The action's registered ID; rendered as `data-action-id`. */
    readonly id: string;
    /**
     * What the control says, already translated. An icon button's accessible name starts with it
     * and goes on with its tooltip when that says more.
     */
    readonly label: string;
    /** A Material icon ligature. Decorative; an inline control without one shows its label. */
    readonly icon?: string;
    /** Hover and focus text, already translated. Falls back to `label`. */
    readonly tooltip?: string | null;
    /** Shown but not runnable — the action's enabled rule said no. */
    readonly disabled?: boolean;
    /** Drawn in its "on" colour, as the padlock of a locked document is. */
    readonly active?: boolean;
    /** Behind the "More actions" menu rather than inline. */
    readonly overflow?: boolean;
}
/**
 * The action row of a document page — Web UI's `nuxeo-actions-menu` in the document header.
 *
 * Presentational: the host resolves its slot's descriptors (labels translated, rules and enabled
 * rules evaluated, tooltips chosen) and runs the action `selected` names, so the library takes no
 * dependency on the extensions barrel. Inline entries are icon buttons that stay focusable while
 * disabled, so their tooltip — "Locked by Jane on 3 May" — is reachable from the keyboard; the rest
 * sit behind one "More actions" button. Content projected into it renders before the actions.
 */
declare class NxsDocumentToolbarComponent {
    /** Every entry, in display order; `overflow` decides which group each one is in. */
    readonly actions: _angular_core.InputSignal<readonly NxsToolbarAction[]>;
    /**
     * The group's accessible name, already translated. Blank falls back to the library's own
     * "Document actions".
     */
    readonly label: _angular_core.InputSignal<string>;
    /** The menu button's accessible name and tooltip. Blank falls back to "More actions". */
    readonly moreLabel: _angular_core.InputSignal<string>;
    /** The entry the user ran. Never a disabled one. */
    readonly selected: _angular_core.OutputEmitterRef<NxsToolbarAction>;
    protected readonly inline: _angular_core.Signal<NxsToolbarAction[]>;
    protected readonly overflow: _angular_core.Signal<NxsToolbarAction[]>;
    protected readonly ownLabel: _angular_core.Signal<string>;
    protected readonly ownMoreLabel: _angular_core.Signal<string>;
    /** A tooltip only when there is one to show: Material renders an empty one as a blank bubble. */
    protected tooltipOf(action: NxsToolbarAction): string;
    /** What the tooltip adds to the label, if anything — "Locked by Jane on 3 May" on Unlock. */
    protected extraOf(action: NxsToolbarAction): string;
    /**
     * An icon button's accessible name: its label, then what its tooltip adds, so a keyboard or
     * screen-reader user hears the lock owner a mouse user reads.
     */
    protected nameOf(action: NxsToolbarAction): string;
    /**
     * Inline buttons are `disabledInteractive`, so a click on a disabled one still arrives here and
     * is refused here.
     */
    protected run(action: NxsToolbarAction): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDocumentToolbarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDocumentToolbarComponent, "nxs-document-toolbar", never, { "actions": { "alias": "actions"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "moreLabel": { "alias": "moreLabel"; "required": false; "isSignal": true; }; }, { "selected": "selected"; }, never, ["*"], true, never>;
}

/**
 * A date field: typed, or chosen from Material's calendar — the thin wrapper over the Material
 * datepicker the application's date fields share.
 *
 * A typed date is read in the order the user's locale writes dates — `03/04/2026` is 3 April in
 * French and 4 March in American English — where Material's native adapter reads every one as
 * American. A host that provides its own date adapter, other than Material's native one, keeps it.
 * The calendar's labels are translated. Text that is not a date, or a date outside `min` and `max`,
 * shows an error with an example in the locale's format and is an error on the form
 * (`nxsDateParse`, `nxsDateMin`, `nxsDateMax`); the value is then `null`.
 */
declare class NxsDateInputComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: _angular_core.InputSignal<string>;
    /** The earliest date allowed, or `null`. */
    readonly min: _angular_core.InputSignal<Date | null>;
    /** The latest date allowed, or `null`. */
    readonly max: _angular_core.InputSignal<Date | null>;
    /** Help under the field, already translated. */
    readonly hint: _angular_core.InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The date, at local midnight, or `null`. Two-way; a form control carries the same value. */
    readonly value: _angular_core.ModelSignal<Date | null>;
    private readonly adapter;
    private readonly formats;
    private readonly input;
    private readonly dateInput;
    /** The date the field last set itself, so its own changes are not mistaken for a host's. */
    private committed;
    private readonly control;
    /** What the user typed, while it is not a date the field holds. */
    private readonly typed;
    protected readonly isDisabled: _angular_core.Signal<boolean>;
    /** Why the typed text or the date is refused, if it is. */
    protected readonly problem: _angular_core.Signal<"parse" | "min" | "max" | null>;
    /** A date written the way the locale writes dates, with a day above 12 so the order shows. */
    protected readonly example: _angular_core.Signal<string>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    constructor();
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck(): void;
    writeValue(value: Date | null): void;
    registerOnChange(fn: (value: Date | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    protected missing(): boolean;
    protected formatted(date: unknown): string;
    /**
     * The raw text, on each key. The datepicker emits `dateInput` only when its date changes, so text
     * that is not a date, typed into an empty field, reaches the picker only here.
     */
    protected typing(event: Event): void;
    /** Each key typed, and a date chosen from the calendar: the datepicker has parsed the text. */
    protected changed(event: MatDatepickerInputEvent<unknown>): void;
    protected blurred(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDateInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDateInputComponent, "nxs-date-input", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "min": { "alias": "min"; "required": false; "isSignal": true; }; "max": { "alias": "max"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/**
 * The icon for a Nuxeo document type — `Folder`, `File`, `Picture`, `Collection` …
 *
 * The type-to-icon table is `docTypeIcon()` in `nuxeo-client`, so a type added there gets its
 * icon everywhere this is used, and an unknown type gets the generic file icon rather than
 * nothing. Decorative unless given a `label`, because it almost always sits beside the type's
 * name or the document's title.
 */
declare class NxsDocTypeIconComponent {
    /** The document's type, as Nuxeo names it. */
    readonly type: _angular_core.InputSignal<string>;
    /** What the icon means, already translated. Blank makes it decorative. */
    readonly label: _angular_core.InputSignal<string>;
    protected readonly icon: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDocTypeIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDocTypeIconComponent, "nxs-doc-type-icon", never, { "type": { "alias": "type"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * The drag-over state of one drop target that accepts files, and nothing else.
 *
 * `dragenter` and `dragleave` fire for every child the pointer crosses, so a plain flag flickers
 * off over the first child; counting the entries keeps it on until the pointer leaves the target.
 * A drag of text or a link is ignored entirely: no highlight, and the browser keeps its default.
 */
declare class NxsFileDropTracker {
    private readonly accepts;
    /** True while files are dragged over the target. */
    readonly over: _angular_core.WritableSignal<boolean>;
    private depth;
    constructor(accepts: () => boolean);
    enter(event: DragEvent): void;
    overTarget(event: DragEvent): void;
    leave(event: DragEvent): void;
    /** The files dropped, or none when the drop is not one this target takes. */
    drop(event: DragEvent): File[];
    private takes;
}

/**
 * The IDs of the primitives Satori also ships, registered by `provideNxsComponents()`.
 *
 * Each ID resolves to a Material implementation from this entry point, and the first four to a
 * Satori-backed one once `provideNxsSatoriComponents()` from `@nuxeo/satori-platform/components-satori`
 * is provided after it. `errorState` stays on Material there: Satori's error states arrive in
 * Satori 1.0, which needs a newer Angular than this package supports. Both implement the same `Nxs…Inputs` contract below, so whoever renders an ID — a
 * `lib-extension-outlet` with `componentInputs` — gets the same inputs whichever is registered.
 * A customer overriding an ID implements that contract too.
 */
declare const NXS_PRIMITIVE_IDS: Readonly<{
    readonly avatar: "nxs.primitives.avatar";
    readonly breadcrumbs: "nxs.primitives.breadcrumbs";
    readonly tag: "nxs.primitives.tag";
    readonly richTooltip: "nxs.primitives.richTooltip";
    readonly errorState: "nxs.primitives.errorState";
}>;
/** Avatar colours. The values Satori's avatar takes, which `/components-satori` asserts. */
type NxsAvatarColor = 'purple' | 'blue' | 'pink' | 'teal' | 'yellow' | 'green' | 'red' | 'orange';
/** Avatar diameters in pixels. The values Satori's avatar takes, which `/components-satori` asserts. */
type NxsAvatarSize = '24' | '28' | '36' | '64' | '80' | '128';
/** Tag colours: the avatar colours plus `gray`, as Satori's category tag takes them. */
type NxsTagColor = NxsAvatarColor | 'gray';
/**
 * One breadcrumb. With `routerLink` it navigates in the app, with `href` it is a plain link, and
 * with neither it is text — the current page when it is the last item.
 */
interface NxsBreadcrumbItem {
    readonly label: string;
    readonly routerLink?: string | readonly (string | number)[];
    readonly queryParams?: Readonly<Record<string, string | number | boolean>>;
    readonly href?: string;
}
/** `nxs.primitives.avatar`. Text inputs arrive already translated. */
interface NxsAvatarInputs {
    /** Upper-cased: up to two are shown, or one at size `24`. */
    readonly initials: InputSignal<string>;
    readonly color: InputSignal<NxsAvatarColor>;
    readonly size: InputSignal<NxsAvatarSize>;
    /**
     * The accessible name, usually the person's name. Blank, or only whitespace or zero-width
     * characters, makes the avatar decorative.
     */
    readonly label: InputSignal<string>;
}
/** `nxs.primitives.breadcrumbs`. Text inputs arrive already translated. */
interface NxsBreadcrumbsInputs {
    readonly items: InputSignal<readonly NxsBreadcrumbItem[]>;
    /**
     * The accessible name of the navigation landmark. When it is blank, the Satori implementation
     * keeps the name Satori's own catalogue gives it.
     */
    readonly label: InputSignal<string>;
}
/** `nxs.primitives.tag`. Text inputs arrive already translated. */
interface NxsTagInputs {
    readonly label: InputSignal<string>;
    readonly color: InputSignal<NxsTagColor>;
}
/**
 * `nxs.primitives.errorState`: what a region shows in place of content that failed to load. Text
 * inputs arrive already translated.
 */
interface NxsErrorStateInputs {
    /** Which variant: the HTTP status the failure stands for. */
    readonly status: InputSignal<NxsErrorStatus>;
    /** What failed. Blank shows the variant's own heading. */
    readonly heading: InputSignal<string>;
    /** The heading's level in the page outline, 1 to 6. */
    readonly headingLevel: InputSignal<NxsHeadingLevel>;
    /** Offer Retry for a server error. */
    readonly retryable: InputSignalWithTransform<boolean, unknown>;
    /**
     * Called when Retry is pressed. A host rendering the ID through `lib-extension-outlet` passes
     * this, because the outlet sets inputs and binds no outputs.
     */
    readonly retryHandler: InputSignal<(() => void) | null>;
}
/** `nxs.primitives.richTooltip`: a trigger button and a titled panel. Text arrives translated. */
interface NxsRichTooltipInputs {
    readonly heading: InputSignal<string>;
    readonly content: InputSignal<string>;
    /** The trigger button's accessible name; it shows only an icon. */
    readonly triggerLabel: InputSignal<string>;
    /** A Material icon ligature for the trigger. */
    readonly icon: InputSignal<string>;
}

/** One column of a document list. */
interface NxsDocumentListColumn {
    /**
     * What the column shows. `title`, `type`, `modified`, `lastContributor`, `created`, `author`,
     * `state`, `version`, `nature`, `coverage` and `subjects` are the packaged columns; any other key
     * is read as a Nuxeo property of that name, such as `dc:source`.
     */
    readonly key: string;
    /** The header, already translated. */
    readonly label: string;
    /**
     * Whether the header sorts. Only set it for a key the listing's source can sort by on the server:
     * the list never sorts a page itself. A column that cannot sort has a plain header.
     */
    readonly sortable?: boolean;
}
/** The server-side order a list is in: a column's key and a direction. */
interface NxsDocumentListSort {
    readonly key: string;
    readonly direction: 'asc' | 'desc';
}
/** A row's action, chosen from that row's menu. */
interface NxsDocumentListRowAction {
    readonly action: NxsMenuAction;
    readonly document: NuxeoDocument;
}
/**
 * One page of documents as a table: sortable headers, selection, keyboard navigation and a pager,
 * with the loading, empty and error states in place of the rows.
 *
 * The server pages and sorts it. The list never sorts or slices what it is given: it shows the
 * page in `documents`, and asks for another order with `sortChange` and another page with
 * `pageChange`. A Material table with `MatSort`, not virtualised —
 * `docs/satori-components/decision-table-primitive.md`.
 *
 * One row is in the Tab sequence at a time. Arrow keys move between rows, Home and End go to the
 * first and last, Space selects, Shift extends a selection from the last row selected, Ctrl or
 * Cmd+A selects the page, and Enter opens. Inside a row, Right and Left move between its controls,
 * which never take a Tab stop of their own.
 */
declare class NxsDocumentListComponent {
    /** The page on screen, in the server's order. */
    readonly documents: _angular_core.InputSignal<readonly NuxeoDocument[]>;
    /** The columns, in order. The `title` column is the one that names each row. */
    readonly columns: _angular_core.InputSignal<readonly NxsDocumentListColumn[]>;
    /** The table's accessible name, already translated, such as "Contents of Invoices". */
    readonly label: _angular_core.InputSignal<string>;
    /** The order the page is in, or `null` for the source's own order. */
    readonly sort: _angular_core.InputSignal<NxsDocumentListSort | null>;
    /** The selected documents' ids, on every page. Two-way: `[(selectedIds)]`. */
    readonly selectedIds: _angular_core.ModelSignal<readonly string[]>;
    /** Shows the selection checkboxes. Accepts a bare attribute. */
    readonly selectable: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The page on screen, from zero. */
    readonly pageIndex: _angular_core.InputSignalWithTransform<number, unknown>;
    /** How many documents a full page holds. */
    readonly pageSize: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Every document across every page, or negative when the server did not count them. */
    readonly totalSize: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Whether the server has another page. */
    readonly hasNextPage: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Shows the loader in place of the rows. */
    readonly loading: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The status of the request that failed, mapped with `nxsErrorStatus()`, or `null`. */
    readonly error: _angular_core.InputSignal<NxsErrorStatus | null>;
    /**
     * What failed, already translated — "The folder could not be loaded". Shown for a server error
     * only: a 401, 403 or 404 keeps its own heading, so a refusal never reads as a breakage.
     */
    readonly errorHeading: _angular_core.InputSignal<string>;
    /** The empty state's heading, already translated. Blank says "Nothing here yet". */
    readonly emptyHeading: _angular_core.InputSignal<string>;
    /** An optional second line for the empty state, already translated. */
    readonly emptyMessage: _angular_core.InputSignal<string>;
    /** The level of the empty and error states' headings in the page outline. */
    readonly stateHeadingLevel: _angular_core.InputSignal<NxsHeadingLevel>;
    /** Each row's menu entries, by document id. A row with none has no menu. */
    readonly rowActions: _angular_core.InputSignal<Readonly<Record<string, readonly NxsMenuAction[]>>>;
    /** Accepts files dragged onto the list. Accepts a bare attribute. */
    readonly dropEnabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** What the list says while files are dragged over it, already translated. */
    readonly dropLabel: _angular_core.InputSignal<string>;
    /** The order asked for, or `null` when the user cleared it. The host fetches it. */
    readonly sortChange: _angular_core.OutputEmitterRef<NxsDocumentListSort | null>;
    /** The page index asked for. The host fetches it. */
    readonly pageChange: _angular_core.OutputEmitterRef<number>;
    /** A row was opened: clicked, or Enter on it. */
    readonly open: _angular_core.OutputEmitterRef<NuxeoDocument>;
    /** An entry of a row's menu was chosen. */
    readonly rowAction: _angular_core.OutputEmitterRef<NxsDocumentListRowAction>;
    /** Files were dropped on the list. Only while `dropEnabled`. */
    readonly filesDropped: _angular_core.OutputEmitterRef<readonly File[]>;
    /** Retry was pressed on a server error. */
    readonly retry: _angular_core.OutputEmitterRef<void>;
    protected readonly tagId: "nxs.primitives.tag";
    protected readonly avatarId: "nxs.primitives.avatar";
    protected readonly hintId: string;
    protected readonly selectColumn = "__select";
    protected readonly actionsColumn = "__actions";
    protected readonly drop: NxsFileDropTracker;
    private readonly host;
    private readonly announcer;
    private readonly translate;
    private readonly direction;
    private readonly translations;
    /**
     * Each row's accessible name, for the row, its checkbox and its menu: its title, and, where
     * another document on the page has the same title, its place among them — so no two rows on a
     * page share a name. Titles that differ only in case or surrounding space read the same aloud,
     * so they count as the same.
     */
    private readonly accessibleNames;
    /** The row in the Tab sequence. */
    protected readonly activeIndex: _angular_core.WritableSignal<number>;
    /** Where a Shift selection extends from, and what was selected before it began. */
    private anchor;
    private rangeBase;
    /** Whether Shift was held for the checkbox change that follows. */
    private shiftHeld;
    protected readonly selected: _angular_core.Signal<Set<string>>;
    protected readonly sortableColumns: _angular_core.Signal<NxsDocumentListColumn[]>;
    protected readonly plainColumns: _angular_core.Signal<NxsDocumentListColumn[]>;
    protected readonly hasRowActions: _angular_core.Signal<boolean>;
    protected readonly displayedColumns: _angular_core.Signal<string[]>;
    protected readonly pageIds: _angular_core.Signal<string[]>;
    protected readonly allOnPageSelected: _angular_core.Signal<boolean>;
    protected readonly someOnPageSelected: _angular_core.Signal<boolean>;
    /** The header row counts as one. Unknown is `-1`, which ARIA reads as "not known". */
    protected readonly rowCount: _angular_core.Signal<number>;
    protected readonly matSortActive: _angular_core.Signal<string>;
    protected readonly matSortDirection: _angular_core.Signal<"" | "desc" | "asc">;
    constructor();
    protected actionsFor(doc: NuxeoDocument): readonly NxsMenuAction[];
    protected isSelected(doc: NuxeoDocument): boolean;
    protected isFolder(doc: NuxeoDocument): boolean;
    /** A container's rendition is only Nuxeo's generic icon, so it is not fetched; the type icon shows. */
    protected hasThumbnail(doc: NuxeoDocument): boolean;
    protected icon(doc: NuxeoDocument): string;
    protected rowName(doc: NuxeoDocument): string;
    protected accessibleName(doc: NuxeoDocument): string;
    protected rowIndex(index: number): number;
    protected contributor(doc: NuxeoDocument): string;
    /** Never empty: an empty string crashes Satori's avatar inside change detection. */
    protected initials(name: string): string;
    protected avatarColor(name: string): NxsAvatarColor;
    /** The text of a column that is neither the title, the type, a date nor a person. */
    protected cellText(doc: NuxeoDocument, key: string): string;
    protected createdDate(doc: NuxeoDocument): string | null;
    protected onSortChange(sort: Sort): void;
    protected onPageChange(index: number): void;
    protected onRowAction(action: NxsMenuAction, document: NuxeoDocument): void;
    protected onDrop(event: DragEvent): void;
    /** Records Shift for the checkbox change it precedes, from the pointer or the keyboard. */
    protected noteModifiers(event: MouseEvent | KeyboardEvent): void;
    protected onCheckboxChange(change: MatCheckboxChange, index: number): void;
    protected onSelectPage(change: MatCheckboxChange): void;
    protected onRowClick(event: MouseEvent, doc: NuxeoDocument, index: number): void;
    protected onOpenClick(event: MouseEvent, doc: NuxeoDocument, index: number): void;
    protected onRowFocusIn(index: number): void;
    protected onRowKeydown(event: KeyboardEvent, doc: NuxeoDocument, index: number): void;
    private inlineKeys;
    private moveTo;
    private focusRow;
    private toggleAt;
    /** Everything selected before the range began, plus every row from the anchor to `index`. */
    private selectRange;
    private selectPage;
    private deselectPage;
    /** Keeps the order ids were selected in, so the host's own list does not reshuffle. */
    private commit;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDocumentListComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDocumentListComponent, "nxs-document-list", never, { "documents": { "alias": "documents"; "required": true; "isSignal": true; }; "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "sort": { "alias": "sort"; "required": false; "isSignal": true; }; "selectedIds": { "alias": "selectedIds"; "required": false; "isSignal": true; }; "selectable": { "alias": "selectable"; "required": false; "isSignal": true; }; "pageIndex": { "alias": "pageIndex"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "totalSize": { "alias": "totalSize"; "required": false; "isSignal": true; }; "hasNextPage": { "alias": "hasNextPage"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "errorHeading": { "alias": "errorHeading"; "required": false; "isSignal": true; }; "emptyHeading": { "alias": "emptyHeading"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "stateHeadingLevel": { "alias": "stateHeadingLevel"; "required": false; "isSignal": true; }; "rowActions": { "alias": "rowActions"; "required": false; "isSignal": true; }; "dropEnabled": { "alias": "dropEnabled"; "required": false; "isSignal": true; }; "dropLabel": { "alias": "dropLabel"; "required": false; "isSignal": true; }; }, { "selectedIds": "selectedIdsChange"; "sortChange": "sortChange"; "pageChange": "pageChange"; "open": "open"; "rowAction": "rowAction"; "filesDropped": "filesDropped"; "retry": "retry"; }, never, never, true, never>;
}

/**
 * Where a search-as-you-type field is: nothing typed, too few characters, waiting on the server,
 * results, none, or a failed request.
 */
type NxsSearchStatus = 'idle' | 'short' | 'searching' | 'found' | 'none' | 'failed';
interface NxsSearchState<T> {
    readonly status: NxsSearchStatus;
    /** The term the state is for, without its surrounding whitespace. */
    readonly term: string;
    readonly results: readonly T[];
}
interface NxsSearchAsYouType<T> {
    readonly state: Signal<NxsSearchState<T>>;
    /** Search for what the user typed. */
    query(text: string): void;
    /** Forget the term and its results, as after a choice. */
    reset(): void;
}

/** A document the input offered: what it shows, and what `documentChange` reports. */
interface NxsDocumentReference {
    readonly uid: string;
    readonly title: string;
    readonly type: string;
    readonly path: string;
}
/**
 * The query Web UI's `default_document_suggestion` page provider runs, for `term`: a full-text
 * prefix match on documents that are not hidden, not versions and not in the trash — optionally of
 * the given types. Every value is escaped, so a term or a type is text in the query, never NXQL.
 */
declare function nxsDocumentSuggestionQuery(term: string, types?: readonly string[]): string;
/**
 * A field that finds a document as the user types and returns the uid of the one chosen — for a
 * property that points at another document, as Web UI's `nuxeo-document-suggestion` is: its value
 * is what the property stores, the uid, or the path with `idProperty="path"`.
 *
 * It searches the repository's full text from three characters, twenty results at a time, leaving
 * out hidden documents, versions and the trash, as Web UI does; `documentTypes` narrows it further.
 * Each result shows its type icon, title and path. A uid or path the form already holds is looked
 * up to show its title; one the user may not read, or that no longer exists, is kept and shown as it
 * is. Typing after a choice clears it, and text typed and not chosen is an `nxsChooseFromList` error
 * on the form. `documentChange` reports the whole document chosen, for a host that shows more.
 */
declare class NxsDocumentReferenceInputComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: _angular_core.InputSignal<string>;
    /** Offer only documents of these types, such as `['File', 'Note']`. Every type when empty. */
    readonly documentTypes: _angular_core.InputSignal<readonly string[]>;
    /** What the value holds, as Web UI's `idProperty`: the document's uid (the default) or its path. */
    readonly idProperty: _angular_core.InputSignal<"path" | "uid">;
    /** Help under the field, already translated. */
    readonly hint: _angular_core.InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The uid (or path) of the document chosen, or `null`. Two-way; a form control carries it too. */
    readonly value: _angular_core.ModelSignal<string | null>;
    /** The document the user chose, or `null` when the choice was cleared. */
    readonly documentChange: _angular_core.OutputEmitterRef<NxsDocumentReference | null>;
    protected readonly minChars = 3;
    private readonly api;
    private readonly announcer;
    private readonly translate;
    private readonly input;
    private readonly control;
    private readonly lookups;
    /** The value the field last set itself, so its own changes are not mistaken for a host's. */
    private committed;
    /** The document the value names, once known: chosen here, or looked up from a stored uid. */
    protected readonly document: _angular_core.WritableSignal<NxsDocumentReference | null>;
    protected readonly text: _angular_core.WritableSignal<string>;
    protected readonly finder: NxsSearchAsYouType<NxsDocumentReference>;
    protected readonly isDisabled: _angular_core.Signal<boolean>;
    protected readonly unmatched: _angular_core.Signal<boolean>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    protected readonly displayWith: (document: NxsDocumentReference | string | null) => string;
    constructor();
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck(): void;
    writeValue(value: string | null): void;
    registerOnChange(fn: (value: string | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    protected missing(): boolean;
    protected onInput(event: Event): void;
    protected choose(document: NxsDocumentReference | null): void;
    protected clear(): void;
    protected blurred(): void;
    private find;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDocumentReferenceInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDocumentReferenceInputComponent, "nxs-document-reference-input", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "documentTypes": { "alias": "documentTypes"; "required": false; "isSignal": true; }; "idProperty": { "alias": "idProperty"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; "documentChange": "documentChange"; }, never, never, true, never>;
}

/** A folder in the tree. Mutable: the tree redraws on `revision`, not on a new object. */
interface TreeNode {
    readonly key: string;
    readonly doc: NuxeoDocument;
    readonly root: boolean;
    readonly parent: TreeNode | null;
    children: TreeNode[];
    loaded: boolean;
    loading: boolean;
    expanded: boolean;
    /** False once Nuxeo says the folder holds no folder; true until then, so a branch is never hidden. */
    expandable: boolean;
    /** Why its folders could not be loaded, shown as a row under it until a retry succeeds. */
    error: NxsErrorStatus | null;
}
/** One row of the tree as drawn, in reading order. */
interface TreeRow {
    readonly kind: 'node' | 'error';
    readonly key: string;
    readonly node: TreeNode;
    readonly level: number;
    readonly setSize: number;
    readonly position: number;
}
/**
 * The folder tree of the repository, as the browse drawer shows it: domains at the root, the open
 * domain's branch inside one, expanded down to the folder on screen, which is marked as the
 * current page.
 *
 * It reads the repository itself through `BrowseService`, with the application's credentials:
 * a level's folders through `getNavTreeChildren` (the `tree_children` page provider Nuxeo Web UI's
 * tree uses), and in one query per level which of them hold a folder, so a leaf has no expand
 * arrow, as in Web UI. Choosing a folder emits it; the host navigates.
 *
 * A failure is never silent: the tree's own failure is an error state chosen by status, and a
 * folder whose children fail gets a row saying so, which retries, and an announcement.
 *
 * Keyboard, as the ARIA tree pattern: one row in the Tab sequence, Up and Down between rows, Right
 * to expand or step into, Left to collapse or step out, Home and End, Enter to open a folder and
 * Space to expand or collapse it.
 */
declare class NxsDocumentTreeComponent {
    /** The Nuxeo path of the folder on screen: the tree expands down to it and marks it. */
    readonly currentPath: _angular_core.InputSignal<string>;
    /** The tree's accessible name, already translated, such as "Folders". */
    readonly label: _angular_core.InputSignal<string>;
    /** A folder was chosen. The repository root arrives as a document whose path is `/`. */
    readonly navigate: _angular_core.OutputEmitterRef<NuxeoDocument>;
    private readonly browse;
    private readonly announcer;
    private readonly translate;
    private readonly host;
    private readonly destroyRef;
    private readonly direction;
    protected readonly status: _angular_core.WritableSignal<"error" | "loading" | "ready">;
    protected readonly loadError: _angular_core.WritableSignal<NxsErrorStatus>;
    /** The row in the Tab sequence, by key; the current folder's until the user moves. */
    protected readonly focusKey: _angular_core.WritableSignal<string | null>;
    private readonly revision;
    private root;
    private loadGeneration;
    private syncGeneration;
    /** At the repository root, the root with its domains; inside a domain, that domain's branch. */
    protected readonly topNodes: _angular_core.Signal<readonly TreeNode[]>;
    protected readonly showRootBack: _angular_core.Signal<boolean>;
    /** Every visible row, in reading order, which is what the arrow keys walk. */
    protected readonly rows: _angular_core.Signal<readonly TreeRow[]>;
    /** The deepest visible folder on the current path: the folder itself, or its nearest shown ancestor. */
    protected readonly currentKey: _angular_core.Signal<string | null>;
    private readonly rowsByKey;
    protected rowFor(key: string): TreeRow | undefined;
    protected readonly tabStop: _angular_core.Signal<string>;
    constructor();
    /** Reads the tree again from the repository, as after a folder is created, moved or deleted. */
    reload(): void;
    protected nodeLabel(node: TreeNode): string;
    /** A click on a row's arrow expands or collapses it; anywhere else on the row opens it. */
    protected onItemClick(event: MouseEvent, row: TreeRow): void;
    protected onKeydown(event: KeyboardEvent, row: TreeRow): void;
    private focus;
    protected openRoot(): void;
    private open;
    private toggle;
    private retry;
    private load;
    /** Expands every folder on `path`, loading the ones not loaded yet, and folds the rest away. */
    private syncTo;
    /** Loads a folder's folders and which of them hold one; a failure is recorded, not thrown. */
    private loadChildren;
    /** One query for a whole level: which of these folders hold a folder. Unknown keeps the arrow. */
    private probe;
    private toNodes;
    private node;
    private announce;
    private bump;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDocumentTreeComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDocumentTreeComponent, "nxs-document-tree", never, { "currentPath": { "alias": "currentPath"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; }, { "navigate": "navigate"; }, never, never, true, never>;
}

/**
 * The note shown where content cannot be created directly: inside a Domain, or at the
 * repository root. It tells the user to open Sections, Templates or Workspaces instead.
 *
 * Renders nothing anywhere else, so a host places it unconditionally and passes what it is
 * showing. The rule — a `Domain`, or the path `/` — is `nuxeo-client`'s, shared with the
 * Create / Import checks that refuse those locations.
 */
declare class NxsDomainHintComponent {
    /** The type of the document being shown. */
    readonly documentType: _angular_core.InputSignal<string | null | undefined>;
    /** The repository path being shown. */
    readonly path: _angular_core.InputSignal<string | null | undefined>;
    protected readonly guidanceKey = "browse.message.domain-container-guidance";
    protected readonly visible: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDomainHintComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDomainHintComponent, "nxs-domain-hint", never, { "documentType": { "alias": "documentType"; "required": false; "isSignal": true; }; "path": { "alias": "path"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Where files are dropped from the computer, or chosen with a button — the same files either way.
 *
 * The button is the keyboard's way in, since dragging files has none. Only a drag of files is
 * taken: a drag of text or a link is left to the browser, and nothing lights up for it.
 */
declare class NxsDropzoneComponent {
    /** What the zone says, already translated, such as "Drag and drop files here". */
    readonly label: _angular_core.InputSignal<string>;
    /** The button's text, already translated. Blank says "Choose files" or "Choose a file". */
    readonly buttonLabel: _angular_core.InputSignal<string>;
    /** Takes several files at once. Accepts a bare attribute. */
    readonly multiple: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The file types the chooser offers, as the `accept` attribute takes them: `.csv`. */
    readonly accept: _angular_core.InputSignal<string>;
    /** Takes nothing, from the button or a drop. Accepts a bare attribute. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Files chosen or dropped: one when `multiple` is off, however many were dropped. */
    readonly files: _angular_core.OutputEmitterRef<readonly File[]>;
    protected readonly drop: NxsFileDropTracker;
    /**
     * The button's id, which also names the file input behind it. That input is hidden from
     * assistive technology and out of the Tab sequence, so the name is never announced; it states
     * which control the input stands behind, and gives it a label a template check can see.
     */
    protected readonly buttonId: string;
    private readonly input;
    protected choose(): void;
    protected onPicked(event: Event): void;
    protected onDrop(event: DragEvent): void;
    private emit;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDropzoneComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDropzoneComponent, "nxs-dropzone", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "buttonLabel": { "alias": "buttonLabel"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "accept": { "alias": "accept"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "files": "files"; }, never, never, true, never>;
}

/** What the Drive dialog needs from the page that opens it. */
interface NxsDriveDialogData {
    /** The repository folder Drive should open. The repository root when absent. */
    readonly folderPath?: string;
}
interface DrivePackage {
    readonly platform: string;
    readonly name: string;
    readonly url: string;
}
/**
 * "Open with Nuxeo Drive", as a `MatDialog`: `dialog.open(NxsDriveDialogComponent, { data })`.
 *
 * It first asks Nuxeo whether this user has a Drive token. With one, it hands Drive the folder
 * through a `nxdrive://direct-transfer` link and closes itself — direct-transfer matches on the
 * server URL alone, where `nxdrive://edit` also matches the username and fails on some Drive
 * configurations. Without one, including when the check fails, it offers the installers.
 */
declare class NxsDriveDialogComponent {
    private readonly dialogRef;
    private readonly drive;
    private readonly data;
    protected readonly packages: readonly DrivePackage[];
    protected readonly checking: _angular_core.WritableSignal<boolean>;
    constructor();
    protected close(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsDriveDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsDriveDialogComponent, "nxs-drive-dialog", never, {}, {}, never, never, true, never>;
}

/**
 * The "nothing here" state for a list, panel or result set.
 *
 * Text arrives already translated — the library ships no catalogue of its own — so a caller
 * binds `[heading]="'browse.empty' | translate"`. Actions are projected, so a "Create" or
 * "Clear filters" button stays the caller's, wired to the caller's action.
 */
declare class NxsEmptyStateComponent {
    /** What is empty, in one line. */
    readonly heading: InputSignal<string>;
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`. Set it to fit
     * where the component sits — one below the heading of the section it empties — so heading
     * navigation stays in order.
     */
    readonly headingLevel: InputSignal<NxsHeadingLevel>;
    /** An optional second line — usually what to do next. Not rendered when blank. */
    readonly message: InputSignal<string>;
    /** An optional Material icon ligature. Decorative, so hidden from assistive technology. */
    readonly icon: InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsEmptyStateComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsEmptyStateComponent, "nxs-empty-state", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "message": { "alias": "message"; "required": false; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

interface Variant {
    readonly icon: string;
    readonly heading: string;
    readonly message: string;
}
/**
 * What a region shows in place of content that failed to load — a listing, a page, a result set.
 *
 * One of four variants chosen by `status`, each with its own icon, heading and explanation; map a
 * failed request onto one with `nxsErrorStatus(error)`. A host that knows what failed ("Failed to
 * load folder contents.") passes it as `heading`, already translated, and the variant's explanation
 * stays underneath it.
 *
 * It is an alert because it replaces a loader the user was waiting on. Retry is offered only for a
 * server error, and only when the host asks for it: retrying a 401, 403 or 404 gets the same answer.
 * Anything else the host offers — "Go back" — is projected.
 *
 * Registered as `nxs.primitives.errorState`, so a customer can replace it by ID; a host rendering it
 * that way passes `retryHandler`, because the outlet binds no outputs.
 */
declare class NxsErrorStateComponent implements NxsErrorStateInputs {
    /** Which variant: the HTTP status the failure stands for. */
    readonly status: _angular_core.InputSignal<NxsErrorStatus>;
    /** What failed, already translated. Blank, or only whitespace, shows the variant's own heading. */
    readonly heading: _angular_core.InputSignal<string>;
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`: one below the
     * heading of the section it replaces, or 1 when it replaces the whole page.
     */
    readonly headingLevel: _angular_core.InputSignal<NxsHeadingLevel>;
    /** Offer Retry for a server error. Accepts a bare attribute, `retryable`. */
    readonly retryable: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * Called when Retry is pressed, before `retry` is emitted — for a host that renders the component
     * by ID, where no output can be bound.
     */
    readonly retryHandler: _angular_core.InputSignal<(() => void) | null>;
    /** Retry was pressed. */
    readonly retry: _angular_core.OutputEmitterRef<void>;
    protected readonly variant: _angular_core.Signal<Variant>;
    /** The host's heading as a reader gets it: whitespace or zero-width characters alone are none. */
    protected readonly ownHeading: _angular_core.Signal<string>;
    protected readonly canRetry: _angular_core.Signal<boolean>;
    protected pressRetry(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsErrorStateComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsErrorStateComponent, "nxs-error-state", never, { "status": { "alias": "status"; "required": false; "isSignal": true; }; "heading": { "alias": "heading"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "retryable": { "alias": "retryable"; "required": false; "isSignal": true; }; "retryHandler": { "alias": "retryHandler"; "required": false; "isSignal": true; }; }, { "retry": "retry"; }, never, ["*"], true, never>;
}

/**
 * An entry's time frame as the permissions panel shows it: the calendar days its writer picked,
 * from whatever zone, rather than the UTC dates Nuxeo returns them as — "Until 15 July" for an end
 * written at midnight in Paris, which Nuxeo holds as 22:00 UTC on the 14th.
 */
declare function nxsAceTimeFrame(ace: Pick<NuxeoAce, 'begin' | 'end'>, translate: (key: string, params?: Record<string, unknown>) => string, locale: string): string;

/**
 * The star that adds a document to the user's favorites or removes it — Web UI's
 * `nuxeo-favorites-toggle-button`.
 *
 * A toggle button: its accessible name stays "Favorite" and `aria-pressed` carries the state, while
 * the tooltip says what a press will do. It runs the operation itself and reports the outcome, so
 * the host decides what to tell the user — Web UI's application, not its button, shows the toast.
 * A click does not reach the row or card it sits in.
 */
declare class NxsFavoriteToggleComponent {
    /** The document to add or remove. */
    readonly documentId: _angular_core.InputSignal<string>;
    /** Whether it is a favorite now. Two-way: the toggle updates it once the server confirms. */
    readonly favorite: _angular_core.ModelSignal<boolean>;
    /** Shown but not pressable — an enabled rule said no. */
    readonly disabled: _angular_core.InputSignal<boolean>;
    /** The server confirmed the change; carries the new state. */
    readonly changed: _angular_core.OutputEmitterRef<boolean>;
    /** The server refused; `favorite` is unchanged. Carries the error. */
    readonly failed: _angular_core.OutputEmitterRef<unknown>;
    /**
     * A request is in flight for the document shown. The button stays focusable and ignores presses
     * until it answers; bound to another document, it is free again.
     */
    protected readonly busy: _angular_core.Signal<boolean>;
    /** The document a request is in flight for. */
    private readonly pending;
    private readonly documents;
    private readonly destroyRef;
    /** Adds or removes the document. Ignored while disabled or while a request is in flight. */
    protected toggle(): void;
    /** Ends the request for `documentId`, and reports it only if that is still the document bound. */
    private settle;
    protected press(event: Event): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsFavoriteToggleComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsFavoriteToggleComponent, "nxs-favorite-toggle", never, { "documentId": { "alias": "documentId"; "required": true; "isSignal": true; }; "favorite": { "alias": "favorite"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "favorite": "favoriteChange"; "changed": "changed"; "failed": "failed"; }, never, never, true, never>;
}

/** The window event the shell's Favorites views listen for, to re-read the list. */
declare const NXS_FAVORITES_CHANGED_EVENT = "favorites-changed";
/**
 * Adds a document to the user's favorites, or removes it, and emits the state the server now holds.
 *
 * The one implementation of the operation: `nxs-favorite-toggle` runs it, and so does a host that
 * offers the same operation as a menu entry rather than a button — document detail's
 * `app.toolbar.addToFavorites` and `removeFromFavorites`. On success it tells the shell, through
 * `NXS_FAVORITES_CHANGED_EVENT`, so the Favorites drawer and page re-read the list; on failure it
 * errors and tells nobody.
 */
declare function nxsToggleFavorite(documents: Pick<DocumentDetailService, 'addToFavorites' | 'removeFromFavorites'>, documentId: string, favorite: boolean): Observable<boolean>;

/**
 * The header above a container's contents: its type icon, its title as the page heading, an
 * optional second line, and the container's actions on the right.
 *
 * The actions are the host's, projected as they are, so a host keeps its own buttons, menus and
 * their handlers. Anything marked `nxsFolderHeaderDetail` — a breadcrumb trail, say — is
 * projected under the title instead. On a narrow screen the actions drop below the title.
 *
 * The title is the page's level-one heading unless `headingLevel` says otherwise; omit it (blank)
 * while the container is loading rather than announce an empty heading.
 */
declare class NxsFolderHeaderComponent {
    /** The container's title. Blank renders no heading. */
    readonly heading: InputSignal<string>;
    /**
     * The title's level in the page outline, rendered as the native `<h1>`–`<h6>`. The header is
     * usually the page's own heading, so level one; lower it where the header sits inside a section
     * that already has one.
     */
    readonly headingLevel: InputSignal<NxsHeadingLevel>;
    /** A second line under the title — usually the type's name — already translated. */
    readonly subheading: InputSignal<string>;
    /** The container's Nuxeo type, which picks the icon. Blank renders no icon. */
    readonly documentType: InputSignal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsFolderHeaderComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsFolderHeaderComponent, "nxs-folder-header", never, { "heading": { "alias": "heading"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "subheading": { "alias": "subheading"; "required": false; "isSignal": true; }; "documentType": { "alias": "documentType"; "required": false; "isSignal": true; }; }, {}, never, ["[nxsFolderHeaderDetail]", "*"], true, never>;
}

/** What the folder picker needs from the page that opens it. Text arrives already translated. */
interface NxsFolderPickerDialogData {
    /** The dialog's heading — "Copy to", "Move to". */
    readonly heading: string;
    /** The button that chooses the folder on screen — "Copy here", "Move here". */
    readonly confirmLabel: string;
    /** Where the picker opens; `/default-domain` when absent. */
    readonly initialPath?: string;
    /**
     * A folder that cannot be the destination, nor anything inside it: the folder being moved.
     * Nuxeo refuses to move a folder into itself; the picker does not offer it.
     */
    readonly excludePath?: string;
    /** A folder that is not a destination because the document is already there. */
    readonly currentParentPath?: string;
}
/** The folder chosen. */
interface NxsFolderPickerDialogResult {
    readonly uid: string;
    readonly path: string;
    readonly title: string;
}
/**
 * Chooses a destination folder, as a `MatDialog`: `dialog.open(NxsFolderPickerDialogComponent,
 * { data })`, then `afterClosed()` gives the folder, or nothing when cancelled.
 *
 * It opens on a folder and lists the folders in it; the user goes into one, or up a level, and
 * chooses the folder on screen. It reads the repository through `BrowseService` with the
 * application's credentials, and says why when it cannot: no access to a folder, a folder gone,
 * or a failure with Retry. It only chooses; the page copies or moves.
 */
declare class NxsFolderPickerDialogComponent {
    private readonly dialogRef;
    private readonly browse;
    private readonly destroyRef;
    protected readonly data: NxsFolderPickerDialogData;
    protected readonly path: _angular_core.WritableSignal<string>;
    protected readonly folder: _angular_core.WritableSignal<NuxeoDocument | null>;
    protected readonly folders: _angular_core.WritableSignal<readonly NuxeoDocument[]>;
    protected readonly loading: _angular_core.WritableSignal<boolean>;
    protected readonly failure: _angular_core.WritableSignal<NxsErrorStatus | "not-a-folder" | null>;
    protected readonly trail: _angular_core.Signal<string[]>;
    protected readonly canGoUp: _angular_core.Signal<boolean>;
    /** Why the folder on screen cannot be chosen, if it cannot. */
    protected readonly refusal: _angular_core.Signal<"inside" | "already" | null>;
    protected readonly canChoose: _angular_core.Signal<boolean>;
    constructor();
    protected load(): void;
    protected open(doc: NuxeoDocument): void;
    protected up(): void;
    protected choose(): void;
    protected cancel(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsFolderPickerDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsFolderPickerDialogComponent, "nxs-folder-picker-dialog", never, {}, {}, never, never, true, never>;
}

/**
 * One icon, by its Material Icons ligature (`folder`, `description`, `collections_bookmark`).
 *
 * Decorative unless given a `label`: an icon beside text that already says the same thing is
 * hidden from assistive technology, and an icon that stands alone is an image with that name.
 *
 * Sized by `--nxs-icon-size` (24px by default) and coloured by `color`, both inherited, so a host
 * sets them on the element or on any ancestor — including through `nxs-doc-type-icon`.
 */
declare class NxsIconComponent {
    /** The Material Icons ligature. */
    readonly name: _angular_core.InputSignal<string>;
    /** What the icon means, already translated. Blank makes it decorative. */
    readonly label: _angular_core.InputSignal<string>;
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    protected readonly accessibleName: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsIconComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsIconComponent, "nxs-icon", never, { "name": { "alias": "name"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** One tab, already resolved by the host. */
interface NxsTab {
    /** The tab's registered ID; rendered as `data-tab-id` on its label and handed to the body. */
    readonly id: string;
    /** What the tab says, already translated. */
    readonly label: string;
    /** A Material icon ligature shown before the label. Decorative. */
    readonly icon?: string;
}
/** The context a tab body template receives: the tab, as `let-tab`. */
interface NxsTabBodyContext {
    readonly $implicit: NxsTab;
}
/**
 * Marks the template every tab body renders from: `<ng-template nxsTabBody let-tab>`, usually an
 * `@switch (tab.id)` over the packaged bodies with an extension outlet as the default.
 */
declare class NxsTabBodyDirective {
    readonly template: TemplateRef<NxsTabBodyContext>;
    static ngTemplateContextGuard(_directive: NxsTabBodyDirective, _context: unknown): _context is NxsTabBodyContext;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsTabBodyDirective, never>;
    static ɵdir: _angular_core.ɵɵDirectiveDeclaration<NxsTabBodyDirective, "ng-template[nxsTabBody]", never, {}, {}, never, never, true, never>;
}

/**
 * What a schema allows a value to be. Every bound is inclusive unless its `…Inclusive` flag is
 * `false`, as Nuxeo's `NumericIntervalConstraint` reports it.
 */
interface NxsEditorConstraints {
    /** Matched against the whole value, as Nuxeo's `PatternConstraint` is. */
    readonly pattern?: string;
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly minimum?: number;
    readonly maximum?: number;
    readonly minimumInclusive?: boolean;
    readonly maximumInclusive?: boolean;
}
/** A field's type, as Nuxeo's `/config/types` describes it with `fetch-schema: fields`. */
interface NxsEditorFieldType {
    /** `string`, `long`, `integer`, `double`, `date`, `boolean`, `blob` or `complex`, each possibly ending in `[]`. */
    readonly type: string;
    /** The vocabulary the value, or each item of a list, is an entry of. */
    readonly directory?: string;
    /** A complex field's sub-fields, by their bare names. */
    readonly fields?: Readonly<Record<string, NxsEditorFieldType>>;
    readonly required?: boolean;
    readonly constraints?: NxsEditorConstraints;
}
/** One field of the form. */
interface NxsEditorField {
    /** The property key on the document, `<prefix>:<name>`. */
    readonly xpath: string;
    /** What the field is called, already translated. */
    readonly label: string;
    readonly definition: NxsEditorFieldType;
    /** A text field taking several lines. Its value is kept as typed rather than trimmed. */
    readonly multiline?: boolean;
}
/** A group of fields under one heading, or one tab when the editor shows tabs. */
interface NxsEditorSection {
    readonly id: string;
    /** Already translated. `null` renders the section with no heading. */
    readonly heading: string | null;
    readonly fields: readonly NxsEditorField[];
}
type NxsEditorDisplay = 'sections' | 'tabs';
/** Property values by xpath, as a document's `properties` holds them. */
type NxsEditorValues = Readonly<Record<string, unknown>>;

type FieldKind = 'text' | 'number' | 'date' | 'boolean' | 'vocabulary' | 'list' | 'vocabulary-list' | 'complex' | 'complex-list' | 'read-only';
/** One error to show: a message key and what it interpolates, or the server's own message. */
interface FieldError {
    readonly key: string;
    readonly params: Readonly<Record<string, unknown>>;
}

/** A field the editor renders, with its label still a key when the editor owns the field. */
interface EditorField extends NxsEditorField {
    readonly labelKey?: string;
}
/**
 * The form that edits a document's properties — Web UI's `nuxeo-document-edit` and
 * `nuxeo-document-create` layouts, schema-driven.
 *
 * It owns the Dublin Core fields every document has (title, description, nature, subjects,
 * coverage, expiry), then renders the `sections` it is given: one control per field, chosen from
 * the field's type, with the schema's constraints checked as the user types.
 *
 * The host owns the buttons. On Save it calls `validate()`, which shows every error, announces how
 * many fields need a correction and moves focus to the first; when that passes, it sends
 * `dirtyProperties()` for an edit or `properties()` for a create. Errors the server reports go
 * back through `showServerErrors()`.
 */
declare class NxsMetadataEditorComponent {
    /** The type's fields beyond Dublin Core, from its layout. A field Dublin Core already has is skipped. */
    readonly sections: _angular_core.InputSignal<readonly NxsEditorSection[]>;
    /** Show `sections` one after another under headings, or as tabs. */
    readonly display: _angular_core.InputSignal<NxsEditorDisplay>;
    /** The current property values. A new object resets the form and discards what was typed. */
    readonly values: _angular_core.InputSignal<Readonly<Record<string, unknown>>>;
    /** Show the Dublin Core fields. Off for a type that has no `dublincore` schema. */
    readonly dublinCore: _angular_core.InputSignal<boolean>;
    /** While saving: every control is read-only. */
    readonly disabled: _angular_core.InputSignal<boolean>;
    /** The level of the section headings, one below the dialog or page title. */
    readonly headingLevel: _angular_core.InputSignal<NxsHeadingLevel>;
    /** The tab strip's accessible name in tabs display. Empty uses the default. */
    readonly tabsLabel: _angular_core.InputSignal<string>;
    /** Every value passes its field's constraints, or not. Emitted when that changes. */
    readonly validChange: _angular_core.OutputEmitterRef<boolean>;
    private readonly directories;
    private readonly translate;
    private readonly destroyRef;
    private readonly injector;
    private readonly host;
    /** The datepickers' adapter, from `provideNxsDateAdapter()`: date controls hold its dates. */
    private readonly dateAdapter;
    protected readonly id: string;
    protected readonly form: FormGroup<Record<string, AbstractControl<any, any, any>>>;
    /** Bumped whenever controls are added or removed, so the template reads the new set. */
    protected readonly structure: _angular_core.WritableSignal<number>;
    protected readonly submitted: _angular_core.WritableSignal<boolean>;
    protected readonly invalidCount: _angular_core.WritableSignal<number>;
    protected readonly selectedTab: _angular_core.WritableSignal<number>;
    protected readonly panelSearch: _angular_core.WritableSignal<string>;
    private readonly vocabularies;
    private readonly requested;
    private builtFrom;
    /** Never shown: stands in for a control of an unexpected shape so a binding never throws. */
    private readonly detached;
    private readonly detachedList;
    private valid;
    /**
     * The server's message per field, with the value it refused. Held as a validator rather than
     * set once with `setErrors`, because re-enabling the form after a save re-runs every validator
     * and would drop it; it lapses as soon as the value differs from the one refused.
     */
    private readonly serverMessages;
    /** Server messages arrived while the form was disabled: reveal them once it is enabled. */
    private revealOnEnable;
    protected readonly standardFields: _angular_core.Signal<readonly EditorField[]>;
    protected readonly typeSections: _angular_core.Signal<readonly NxsEditorSection[]>;
    protected readonly tabs: _angular_core.Signal<readonly NxsTab[]>;
    private readonly fields;
    protected readonly errorMatcher: ErrorStateMatcher;
    protected readonly l10nEntryLabel: typeof l10nEntryLabel;
    protected readonly directoryPickerLabel: typeof directoryPickerLabel;
    constructor();
    /**
     * Shows every error, announces how many fields need a correction and focuses the first.
     * Answers whether the form can be saved.
     */
    validate(): boolean;
    /** The values the user changed, by xpath, as the document properties take them. */
    dirtyProperties(): Record<string, unknown>;
    /** Every value in the form, by xpath — what a new document is created with. */
    properties(): Record<string, unknown>;
    /**
     * Puts the server's messages on the fields they name, by xpath, until the value changes.
     * Answers the messages for fields the form does not show, for the host to report another way.
     */
    showServerErrors(errors: Readonly<Record<string, string>>): string[];
    protected kindOf(definition: NxsEditorFieldType, depth: number): FieldKind;
    protected controlFor(field: EditorField): AbstractControl | null;
    protected asControl(control: AbstractControl): FormControl;
    protected asArray(control: AbstractControl): FormArray;
    /** A complex field's sub-fields, labelled from their names. */
    protected subFields(definition: NxsEditorFieldType): readonly EditorField[];
    protected subControl(group: AbstractControl, name: string): AbstractControl | null;
    protected showError(control: AbstractControl): boolean;
    protected errorOf(control: AbstractControl): FieldError | null;
    /** The message for an error, naming the field so it reads on its own in the error summary's wake. */
    protected errorText(error: FieldError, label: string): string;
    protected search(event: Event): void;
    protected isRequired(definition: NxsEditorFieldType): boolean;
    protected inputType(definition: NxsEditorFieldType): 'number' | 'text';
    protected step(definition: NxsEditorFieldType): string | null;
    protected readOnlyText(control: AbstractControl): string;
    protected flatOptions(directory: string): readonly DirectoryEntry[];
    protected groupedOptions(directory: string): ReturnType<typeof groupL10nChildrenByParent>;
    protected usesL10n(directory: string): boolean;
    /** A vocabulary value's label, `Parent/Child` for a hierarchical one. The stored ID until loaded. */
    protected vocabularyLabel(directory: string, id: unknown): string;
    protected listValue(control: AbstractControl): readonly unknown[];
    /** Each vocabulary panel opens with an empty search. */
    protected panelToggled(): void;
    protected clearValue(control: AbstractControl, multiple: boolean): void;
    protected removeItem(control: AbstractControl, index: number): void;
    protected addItem(control: AbstractControl, definition: NxsEditorFieldType, event: MatChipInputEvent): void;
    protected addComplexItem(control: AbstractControl, definition: NxsEditorFieldType, depth: number): void;
    protected removeComplexItem(control: AbstractControl, index: number): void;
    protected selectTab(index: number): void;
    private build;
    private applyDisabled;
    private heldServerMessage;
    /** `enable()` reaches every control; a file or an unsupported shape stays read-only. */
    private lockReadOnly;
    private loadVocabularies;
    private collect;
    private statusChanged;
    private countInvalid;
    /** Opens the tab holding the first invalid field, then focuses it once it has rendered. */
    private revealFirstInvalid;
    /** A tab's content attaches a render after the tab is selected, so the field may not exist yet. */
    private focusFirstInvalid;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsMetadataEditorComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsMetadataEditorComponent, "nxs-metadata-editor", never, { "sections": { "alias": "sections"; "required": false; "isSignal": true; }; "display": { "alias": "display"; "required": false; "isSignal": true; }; "values": { "alias": "values"; "required": false; "isSignal": true; }; "dublinCore": { "alias": "dublinCore"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "tabsLabel": { "alias": "tabsLabel"; "required": false; "isSignal": true; }; }, { "validChange": "validChange"; }, never, never, true, never>;
}

/**
 * Previous and Next for a list the server pages, with the range on screen.
 *
 * Next/previous rather than numbered, because Nuxeo knows a listing's total only when it fits on
 * one page: `@children` reports a negative count otherwise, and `isNextPageAvailable` is the only
 * reliable fact. So Next follows `hasNextPage`, Previous follows the page index, and "of N" shows
 * only when `totalSize` is a real, non-negative total.
 *
 * It renders nothing while everything fits on one page — a first page with no next page.
 */
declare class NxsPagerComponent {
    /** The page on screen, from zero. */
    readonly pageIndex: _angular_core.InputSignalWithTransform<number, unknown>;
    /** How many items a full page holds. */
    readonly pageSize: _angular_core.InputSignalWithTransform<number, unknown>;
    /** How many items the page on screen holds. */
    readonly itemCount: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Every item across every page; negative when the server did not count them. */
    readonly totalSize: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Whether the server has another page. */
    readonly hasNextPage: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Disables both buttons while a page loads. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /**
     * The navigation landmark's accessible name, already translated. Blank, or only whitespace or
     * zero-width characters, names it "Pages".
     */
    readonly label: _angular_core.InputSignal<string>;
    /** The page index to load: one less or one more than `pageIndex`. */
    readonly pageChange: _angular_core.OutputEmitterRef<number>;
    protected readonly visible: _angular_core.Signal<boolean>;
    protected readonly first: _angular_core.Signal<number>;
    protected readonly last: _angular_core.Signal<number>;
    protected readonly knownTotal: _angular_core.Signal<number | null>;
    protected readonly canPrevious: _angular_core.Signal<boolean>;
    protected readonly canNext: _angular_core.Signal<boolean>;
    protected readonly ownLabel: _angular_core.Signal<string>;
    previous(): void;
    next(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsPagerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsPagerComponent, "nxs-pager", never, { "pageIndex": { "alias": "pageIndex"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "itemCount": { "alias": "itemCount"; "required": false; "isSignal": true; }; "totalSize": { "alias": "totalSize"; "required": false; "isSignal": true; }; "hasNextPage": { "alias": "hasNextPage"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, { "pageChange": "pageChange"; }, never, never, true, never>;
}

type NxsAceStatus = 'effective' | 'pending' | 'archived';
/** One ACE as the panel renders it. */
interface NxsAceRow {
    /** Nuxeo's ACE id, `user:permission:granted:creator:begin:end`; empty when the server sent none. */
    readonly id: string;
    readonly principal: string;
    /** The principal's display name — a user's full name, a group's label — or empty. */
    readonly principalLabel: string;
    readonly permission: string;
    readonly granted: boolean;
    readonly begin: string | null;
    readonly end: string | null;
    readonly status: NxsAceStatus | null;
    readonly creator: string | null;
    /** The named ACL the entry belongs to — `local`, `inherited`, or one a workflow added. */
    readonly acl: string;
}
/**
 * The permissions the panel can offer, in the order it offers them.
 *
 * Nuxeo exposes two lists and neither is enough alone. `userVisiblePermissions` is the server's
 * curated list for the document type (the `permissionsVisibility` extension point): only `Read`,
 * `ReadWrite` and `Everything` on a stock workspace, plus `CanAskForPublishing` on a section root.
 * The `permissions` enricher lists every permission the server defines **that the caller holds**,
 * so it is the complete set only when the caller holds `Everything` — measured on 2025.26.16: 33
 * of 33 for an `Everything` holder, 9 for a manager holding only `WriteSecurity`.
 */
interface NxsPermissionCatalogue {
    /** The server's suggestions for this document type, in its order. */
    readonly suggested: readonly string[];
    /** {@link NXS_STANDARD_PERMISSIONS} not already suggested, less any the server lacks. */
    readonly standard: readonly string[];
    /** Every other permission the `permissions` enricher reported, by name. */
    readonly other: readonly string[];
    /** Every permission the server defines, or `null` when the caller's read cannot tell. */
    readonly defined: readonly string[] | null;
}
/** What the panel shows for one document. */
interface NxsPermissionsSnapshot {
    readonly uid: string;
    readonly title: string;
    readonly canManage: boolean;
    /**
     * The local ACL, less the inheritance marker (shown as {@link inheritanceBlocked}) and less
     * entries for external users, whose sharing flow the host owns.
     */
    readonly local: readonly NxsAceRow[];
    readonly inherited: readonly NxsAceRow[];
    /** Entries from named ACLs other than `local` and `inherited`. Read-only here. */
    readonly otherAcls: readonly NxsAceRow[];
    readonly inheritanceBlocked: boolean;
    readonly catalogue: NxsPermissionCatalogue;
}
/**
 * A change the user has staged. Dates are calendar days, `YYYY-MM-DD`; a replacement writes an
 * unchanged day as its target's original instant (see {@link dateToWrite}).
 */
type NxsPermissionChange = {
    readonly kind: 'add';
    readonly key: string;
    readonly principal: string;
    readonly permission: string;
    readonly begin: string | null;
    readonly end: string | null;
} | {
    readonly kind: 'replace';
    readonly target: NxsAceRow;
    readonly permission: string;
    readonly begin: string | null;
    readonly end: string | null;
} | {
    readonly kind: 'remove';
    readonly target: NxsAceRow;
};
type NxsRefusalReason = 'changed-on-server' | 'deny-entry' | 'no-id' | 'no-principal' | 'undefined-permission' | 'invalid-time-frame' | 'not-applied';
/** An entry the panel will not write, or that the server did not apply, and why. */
interface NxsPermissionRefusal {
    readonly principal: string;
    readonly permission: string;
    readonly reason: NxsRefusalReason;
}

/** How a save ended. Every outcome that could read it carries the server's ACL afterwards. */
type NxsSaveOutcome = 
/** Nothing was written, because the read before the first write failed. */
{
    readonly kind: 'unread';
    readonly error: unknown;
}
/** Every change was written and the re-read shows each one. */
 | {
    readonly kind: 'saved';
    readonly count: number;
    readonly snapshot: NxsPermissionsSnapshot;
}
/** Nothing was written, because these changes cannot be written faithfully. */
 | {
    readonly kind: 'refused';
    readonly refusals: readonly NxsPermissionRefusal[];
    readonly snapshot: NxsPermissionsSnapshot;
}
/**
 * The server rejected a change. `applied` counts the earlier changes the re-read confirms, and
 * `unconfirmed` names those it answered 200 but does not show. With no re-read neither is known,
 * so `applied` counts the 200s and `unconfirmed` is empty.
 */
 | {
    readonly kind: 'failed';
    readonly applied: number;
    readonly unconfirmed: readonly NxsPermissionRefusal[];
    readonly total: number;
    readonly change: NxsPermissionChange;
    readonly error: unknown;
    readonly snapshot: NxsPermissionsSnapshot | null;
}
/** The server answered 200, but the re-read does not show these changes. */
 | {
    readonly kind: 'unconfirmed';
    readonly refusals: readonly NxsPermissionRefusal[];
    readonly snapshot: NxsPermissionsSnapshot;
}
/** Every write was answered, but the re-read failed, so nothing is confirmed either way. */
 | {
    readonly kind: 'unverified';
    readonly count: number;
    readonly error: unknown;
};

/** The ID the panel is registered under, so a customer library can re-register a replacement. */
declare const NXS_PERMISSIONS_PANEL_ID = "nxs.components.permissionsPanel";
type LoadError = 'denied' | 'not-found' | 'failed';
/** One row of the local table: an ACE the server holds, or one the user is adding. */
interface LocalItem {
    readonly key: string;
    /** The server's entry, absent for a staged addition. */
    readonly row: NxsAceRow | null;
    readonly principal: string;
    /** The principal's display name, or empty when the server sent none. */
    readonly principalLabel: string;
    readonly permission: string;
    readonly begin: string | null;
    readonly end: string | null;
    readonly state: 'unchanged' | 'changed' | 'removed' | 'added';
    readonly granted: boolean;
    /** Why the entry cannot be edited here, as a catalogue key; `null` when it can. */
    readonly lockedReason: string | null;
    /** Permissions this entry holds that the server's lists do not offer, so its select can show them. */
    readonly extraPermissions: readonly string[];
}
interface EditorState {
    readonly mode: 'add' | 'edit';
    readonly item: LocalItem | null;
}
/**
 * A document's permissions: local and inherited ACEs, blocked inheritance, and each ACE's time
 * frame and status, with add, edit and remove over the server's list for the document type, Nuxeo's
 * standard permissions and every other permission the server reports to the user.
 *
 * **Every write addresses one ACE.** Changes are staged and applied on Save as one
 * `Document.AddPermission`, `ReplacePermission` or `RemovePermission`-by-id per change, so an
 * entry the user did not touch is never written. Before writing, the ACL is read again and a
 * change that cannot be written faithfully refuses the whole save, naming each entry and why;
 * afterwards it is read once more and any change the server does not show is reported. See
 * `refusalsFor` and `unconfirmedChanges`.
 *
 * **Hiding a control is not a security control.** The panel offers editing when the read says the
 * user holds `WriteSecurity` or `Everything` and the document is not a version, and Nuxeo checks
 * every write regardless.
 *
 * Its chrome is translated through ngx-translate under `satori-components.permissions-panel.*`,
 * and permission names under `permissions.right.*`, both in the application's catalogue.
 * External-user sharing is not shown here; the host owns that flow.
 */
declare class NxsPermissionsPanelComponent {
    /** The uid of the document whose permissions to show. */
    readonly documentId: _angular_core.InputSignal<string>;
    /**
     * Called after a write that may have changed the document's ACL, so a host showing other
     * ACL-derived content — the external-user shares this panel leaves to it — can read it again.
     */
    readonly permissionsChanged: _angular_core.InputSignal<(() => void) | null>;
    private readonly service;
    private readonly translate;
    private readonly locale;
    private readonly destroyRef;
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    private readonly dateAdapter;
    /** Starts every id the template sets, so two panels on one page never share one. */
    protected readonly idPrefix: string;
    protected readonly localColumns: string[];
    protected readonly inheritedColumns: string[];
    protected readonly otherColumns: string[];
    protected readonly snapshot: _angular_core.WritableSignal<NxsPermissionsSnapshot | null>;
    protected readonly loading: _angular_core.WritableSignal<boolean>;
    protected readonly loadError: _angular_core.WritableSignal<LoadError | null>;
    protected readonly saving: _angular_core.WritableSignal<boolean>;
    protected readonly outcome: _angular_core.WritableSignal<NxsSaveOutcome | null>;
    protected readonly inheritanceBusy: _angular_core.WritableSignal<boolean>;
    protected readonly inheritanceError: _angular_core.WritableSignal<string | null>;
    /** Staged changes: by ACE id for an existing entry, by a generated key for an addition. */
    protected readonly staged: _angular_core.WritableSignal<ReadonlyMap<string, NxsPermissionChange>>;
    private addCounter;
    /** Display names of staged additions, from the search suggestion the user picked. */
    private readonly addedLabels;
    protected readonly editor: _angular_core.WritableSignal<EditorState | null>;
    protected readonly editorPrincipal: _angular_core.WritableSignal<UserGroupSuggestion | null>;
    protected readonly editorQuery: _angular_core.WritableSignal<string>;
    protected readonly editorPermission: _angular_core.WritableSignal<string>;
    protected readonly editorDated: _angular_core.WritableSignal<boolean>;
    /** The time frame's days, at local midnight. */
    protected readonly editorBegin: _angular_core.WritableSignal<Date | null>;
    protected readonly editorEnd: _angular_core.WritableSignal<Date | null>;
    /** The same days as the date fields hold them, in their adapter's own representation. */
    protected readonly editorBeginField: _angular_core.Signal<unknown>;
    protected readonly editorEndField: _angular_core.Signal<unknown>;
    protected readonly editorSubmitted: _angular_core.WritableSignal<boolean>;
    protected readonly suggestions: _angular_core.WritableSignal<UserGroupSuggestion[]>;
    private readonly loads;
    private readonly searches;
    /**
     * Bumped whenever the document changes. A save or inheritance change still in flight finishes on
     * its own document, but its answer is dropped rather than shown on this one.
     */
    private generation;
    protected readonly loadErrorKey: _angular_core.Signal<string>;
    protected readonly canManage: _angular_core.Signal<boolean>;
    /**
     * False while a save or an inheritance change is in flight: a save replaces the staged changes
     * with those it did not send when it answers, so one staged after it started would be lost.
     */
    protected readonly editable: _angular_core.Signal<boolean>;
    protected readonly trackItem: (_index: number, item: LocalItem) => string;
    protected readonly pendingCount: _angular_core.Signal<number>;
    /** The permission groups every select offers, in the server's order. */
    protected readonly permissionGroups: _angular_core.Signal<{
        label: string;
        permissions: readonly string[];
    }[]>;
    private readonly offered;
    protected readonly localItems: _angular_core.Signal<LocalItem[]>;
    /** Permissions the entry being edited holds that the server's lists do not offer. */
    protected readonly editorExtraPermissions: _angular_core.Signal<readonly string[]>;
    protected readonly editorInvalidRange: _angular_core.Signal<boolean>;
    constructor();
    protected reload(): void;
    protected permissionLabel(permission: string): string;
    /** An ACE's time frame, from staged days or the server's instants alike. */
    protected timeFrame(begin: string | null, end: string | null): string;
    /** `principal — permission`, for refusal and failure lines. */
    protected entryLabel(principal: string, permission: string): string;
    protected serverMessage(error: unknown): string;
    protected isDenied(error: unknown): boolean;
    protected setPermission(item: LocalItem, permission: string): void;
    protected toggleRemove(item: LocalItem): void;
    protected dismissOutcome(): void;
    protected discard(): void;
    protected openAdd(): void;
    protected openEdit(item: LocalItem): void;
    protected closeEditor(): void;
    protected onPrincipalInput(value: string): void;
    protected onPrincipalSelected(suggestion: UserGroupSuggestion): void;
    /** The day a date field holds, whatever its adapter holds dates as. */
    protected fieldDay(value: unknown): Date | null;
    protected displaySuggestion(suggestion: UserGroupSuggestion | string | null): string;
    protected applyEditor(): void;
    protected save(): void;
    protected toggleInheritance(): void;
    protected refusalReasonKey(refusal: NxsPermissionRefusal): string;
    protected failedEntry(outcome: Extract<NxsSaveOutcome, {
        kind: 'failed';
    }>): string;
    private clearStaged;
    private notifyChanged;
    private keepStaged;
    private load;
    private fromRow;
    /** Stages a replacement, or drops it when it would write the entry back unchanged. */
    private stageReplace;
    private updateAdd;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsPermissionsPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsPermissionsPanelComponent, "nxs-permissions-panel", never, { "documentId": { "alias": "documentId"; "required": true; "isSignal": true; }; "permissionsChanged": { "alias": "permissionsChanged"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Turns a vocabulary value into its label: `(directory, id) => label`. */
type NxsVocabularyLabel = (directory: string, id: string) => string;
interface NxsPerson {
    readonly name: string;
    readonly initial: string;
    readonly color: ReturnType<typeof avatarColor>;
}
/**
 * The Properties view of a document page's side panel — Web UI's `nuxeo-document-info` and
 * `nuxeo-document-metadata`, with the collections and tags sections beside them.
 *
 * It reads what it shows from the document: lifecycle state, dates, creator and contributors, the
 * Dublin Core properties, and the collections it is in. What needs the page — the version control,
 * the tag editor, the type's own layout and the attachments — is projected:
 *
 * - `[nxsVersion]` replaces the version text with a control.
 * - `[nxsTags]` replaces the read-only tag chips with an editor. Tags show only on a document with
 *   the `NXTag` facet, as in Web UI.
 * - Anything else renders after the Dublin Core properties and before the collections.
 *
 * Every value goes through `nxsPropertyText`, so a directory entry, a user or a blob shows its
 * label or name, never `[object Object]`.
 */
declare class NxsPropertiesPanelComponent {
    /** The document shown. Nothing renders without one. */
    readonly document: _angular_core.InputSignal<NuxeoDocument | null>;
    /** Labels for `dc:nature`, `dc:coverage` and `dc:subjects`. Without it the stored ID shows. */
    readonly vocabularyLabel: _angular_core.InputSignal<NxsVocabularyLabel | null>;
    /** A workflow is running on the document. */
    readonly processRunning: _angular_core.InputSignal<boolean>;
    /** The version text, e.g. `1.2+`; a projected `[nxsVersion]` control replaces it. */
    readonly versionLabel: _angular_core.InputSignal<string>;
    /** How many times the document is published; `null` hides the row. */
    readonly publications: _angular_core.InputSignal<number | null>;
    /** The note's format, e.g. "Markdown". Blank hides the row. */
    readonly format: _angular_core.InputSignal<string>;
    /** The level of the section headings, so they sit under the page's own. */
    readonly headingLevel: _angular_core.InputSignal<NxsHeadingLevel>;
    /** The publication count was pressed. Only offered when there is at least one. */
    readonly publicationsSelected: _angular_core.OutputEmitterRef<void>;
    protected readonly props: _angular_core.Signal<Readonly<Record<string, unknown>>>;
    protected readonly state: _angular_core.Signal<string>;
    protected readonly modified: _angular_core.Signal<string>;
    protected readonly created: _angular_core.Signal<string>;
    protected readonly expires: _angular_core.Signal<string>;
    protected readonly creator: _angular_core.Signal<NxsPerson | null>;
    protected readonly contributors: _angular_core.Signal<NxsPerson[]>;
    protected readonly fileName: _angular_core.Signal<string>;
    protected readonly description: _angular_core.Signal<string>;
    protected readonly nature: _angular_core.Signal<string>;
    protected readonly coverage: _angular_core.Signal<string>;
    protected readonly subjects: _angular_core.Signal<string>;
    protected readonly taggable: _angular_core.Signal<boolean>;
    protected readonly tags: _angular_core.Signal<string[]>;
    /** Web UI's `nuxeo-document-collections`; the Favorites collection is the star, not a collection. */
    protected readonly collections: _angular_core.Signal<{
        uid: string;
        title: string;
    }[]>;
    /** A vocabulary value as its label: a string ID through `vocabularyLabel`, an entry by its own. */
    private vocabulary;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsPropertiesPanelComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsPropertiesPanelComponent, "nxs-properties-panel", never, { "document": { "alias": "document"; "required": true; "isSignal": true; }; "vocabularyLabel": { "alias": "vocabularyLabel"; "required": false; "isSignal": true; }; "processRunning": { "alias": "processRunning"; "required": false; "isSignal": true; }; "versionLabel": { "alias": "versionLabel"; "required": false; "isSignal": true; }; "publications": { "alias": "publications"; "required": false; "isSignal": true; }; "format": { "alias": "format"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; }, { "publicationsSelected": "publicationsSelected"; }, never, ["[nxsVersion]", "[nxsTags]", "*"], true, never>;
}

/**
 * The words a property value shows as, or `''` for a value with nothing to show.
 *
 * A Nuxeo property is not always a string. With resolvers fetched, `dc:nature` arrives as a
 * directory entry and `dc:creator` as a user; a blob is an object, a multi-valued field an array.
 * Interpolating any of those prints `[object Object]` — a defect observed in another document
 * sidebar and listed as a parity target not to copy. So objects are read for the field that names
 * them, and an object with no such field shows nothing rather than its type.
 */
declare function nxsPropertyText(value: unknown): string;

/** What the rename dialog needs from the page that opens it. */
interface NxsRenameDialogData {
    /** The document to rename. */
    readonly documentId: string;
    /** Its title now, which the field starts from. */
    readonly title: string;
}
/**
 * Renames a document, as a `MatDialog`: `dialog.open(NxsRenameDialogComponent, { data })`.
 *
 * Renaming is a change of the document's title, `dc:title`, as in Nuxeo Web UI; the name in its
 * path does not change, so links to it keep working. The dialog writes the title itself and closes
 * with the updated document. A refusal stays in the dialog with the reason — no permission, or the
 * document locked by someone else — so the user can cancel or try again; nothing is lost.
 */
declare class NxsRenameDialogComponent {
    private readonly dialogRef;
    private readonly browse;
    private readonly destroyRef;
    protected readonly data: NxsRenameDialogData;
    protected readonly title: _angular_core.WritableSignal<string>;
    protected readonly saving: _angular_core.WritableSignal<boolean>;
    protected readonly failure: _angular_core.WritableSignal<NxsErrorStatus | 409 | null>;
    protected readonly trimmed: _angular_core.Signal<string>;
    protected readonly unchanged: _angular_core.Signal<boolean>;
    protected readonly canSave: _angular_core.Signal<boolean>;
    protected save(): void;
    protected cancel(): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsRenameDialogComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsRenameDialogComponent, "nxs-rename-dialog", never, {}, {}, never, never, true, never>;
}

/**
 * The indeterminate loader for a region waiting on data — a list, a tab, a panel, a dialog body.
 *
 * It is either named or decorative, never neither. With a `label` it is a progressbar carrying that
 * accessible name. Without one it is hidden from assistive technology, so use it bare only where
 * visible text beside it already says what is loading ("Checking Nuxeo Drive…"). A progressbar with
 * no name fails axe's `aria-progressbar-name`.
 *
 * Not for inside a button: a spinner there reflows the label. Rotate the button's icon instead —
 * `AGENTS/08-bug-patterns.md`, pattern 15.
 */
declare class NxsSpinnerComponent {
    /** Diameter in pixels. Accepts a static attribute, `diameter="36"`. */
    readonly diameter: _angular_core.InputSignalWithTransform<number, unknown>;
    /** What is loading, already translated. Blank makes the spinner decorative. */
    readonly label: _angular_core.InputSignal<string>;
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    protected readonly name: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsSpinnerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsSpinnerComponent, "nxs-spinner", never, { "diameter": { "alias": "diameter"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * The tab strip of a document page — Web UI's `nuxeo-document-page` view tabs.
 *
 * Renders the tabs the host resolved, in order, and every body from the one template the host marks
 * with `nxsTabBody`, so a tab a manifest adds renders through the same template as a packaged one.
 * Selection is by index, two-way (`[(selectedIndex)]`), so the host can switch tabs itself, as the
 * Publications count does; `selectedTabChange` also names the tab by ID, which stays right when a
 * manifest hides or reorders tabs.
 */
declare class NxsTabsComponent {
    /** The tabs, in display order. */
    readonly tabs: _angular_core.InputSignal<readonly NxsTab[]>;
    /** The tab list's accessible name, already translated. Optional. */
    readonly label: _angular_core.InputSignal<string>;
    /** The selected tab's position. Two-way. */
    readonly selectedIndex: _angular_core.ModelSignal<number>;
    /** The tab the user (or the host) selected, by ID. */
    readonly selectedTabChange: _angular_core.OutputEmitterRef<NxsTab>;
    protected readonly body: _angular_core.Signal<NxsTabBodyDirective | undefined>;
    protected readonly ownLabel: _angular_core.Signal<string>;
    private readonly host;
    constructor();
    protected select(index: number): void;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsTabsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsTabsComponent, "nxs-tabs", never, { "tabs": { "alias": "tabs"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; "selectedIndex": { "alias": "selectedIndex"; "required": false; "isSignal": true; }; }, { "selectedIndex": "selectedIndexChange"; "selectedTabChange": "selectedTabChange"; }, ["body"], never, true, never>;
}

/**
 * A field of tags: existing ones suggested as the user types, as Web UI's `nuxeo-tag-suggestion`
 * does, and a new one added with Enter, a comma or its "Add" entry. Each tag is a chip, removed
 * with its button or Backspace.
 *
 * A form control, not an editor of a document's tags: the value is the list of labels, and the host
 * saves it — through `TagService.addTag` and `removeTag`, for a document's tags. A label is trimmed,
 * and one the field already holds, whatever its case, is not added twice.
 */
declare class NxsTagInputComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: _angular_core.InputSignal<string>;
    /** Let the user add a tag no document has yet. On by default, as in Web UI. */
    readonly allowNew: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Help under the field, already translated. */
    readonly hint: _angular_core.InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The tags, in the order they were added. Two-way; a form control carries the same value. */
    readonly value: _angular_core.ModelSignal<readonly string[]>;
    protected readonly separators: readonly [13, 188];
    /** The input's id: the form field's label names the input through it. One per field. */
    protected readonly inputId: string;
    private readonly tags;
    private readonly announcer;
    private readonly translate;
    private readonly grid;
    private readonly trigger;
    private readonly control;
    protected readonly text: _angular_core.WritableSignal<string>;
    protected readonly finder: NxsSearchAsYouType<string>;
    protected readonly isDisabled: _angular_core.Signal<boolean>;
    /** Suggestions the field does not hold yet. */
    protected readonly suggestions: _angular_core.Signal<string[]>;
    /** The typed text as a new tag, when it may be added and is not already there. */
    protected readonly addable: _angular_core.Signal<string | null>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    constructor();
    /** `MatChipGrid` recomputes its error state only with a form control of its own. */
    ngDoCheck(): void;
    writeValue(value: readonly string[] | null): void;
    registerOnChange(fn: (value: readonly string[]) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    /** No errors of its own: a typed tag is added or discarded, never left half-chosen. */
    validate(control: AbstractControl): ValidationErrors | null;
    protected missing(): boolean;
    protected onInput(event: Event): void;
    /** Enter or a comma: add what was typed, unless the user is on a suggestion, which wins. */
    protected tokenEnd(event: MatChipInputEvent): void;
    protected add(tag: string): void;
    protected remove(tag: string): void;
    protected blurred(): void;
    private holds;
    private commit;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsTagInputComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsTagInputComponent, "nxs-tag-input", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "allowNew": { "alias": "allowNew"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/** Lists `NxsThumbnailCache` in a page component's `providers`, for every thumbnail under it. */
declare function provideNxsThumbnailCache(): Provider;

/**
 * A document's thumbnail rendition, fetched through the authenticated client and shown from a blob
 * URL that no caller creates or revokes.
 *
 * Under a page that lists `provideNxsThumbnailCache()`, the page's `NxsThumbnailCache` owns the URL:
 * thumbnails of one document share it, a view switch reuses it, requests are bounded, and it is
 * revoked once nothing shows it and with the page. Without one, this component owns it and revokes
 * it when the document changes and when it is destroyed.
 *
 * Until the image arrives — and when there is none, the request fails or the bytes do not decode —
 * the projected content shows instead, usually the document-type icon. While it shows, the host
 * has no box of its own (`display: contents`), so the fallback lays out exactly as it would without
 * this wrapper. Size the thumbnail with a class on the host; the image fills it and takes the host's
 * `object-fit` and `border-radius`. Do not set `display` on the host.
 *
 * Decorative by default, like Web UI's `nuxeo-document-thumbnail`: a blank `alt` hides it from
 * assistive technology, because the title beside it already names the document.
 */
declare class NxsThumbnailComponent {
    /** The document whose `thumbnail` rendition to show. */
    readonly documentId: _angular_core.InputSignal<string>;
    /** The image's text alternative, already translated. Blank marks it decorative. */
    readonly alt: _angular_core.InputSignal<string>;
    protected readonly url: _angular_core.WritableSignal<string | null>;
    private readonly documents;
    private readonly cache;
    /** Whether `url` is this component's to revoke — it is not when a page cache lent it. */
    private owned;
    constructor();
    private load;
    /** The bytes arrived but are not an image the browser can draw. */
    protected broken(): void;
    private own;
    private clear;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsThumbnailComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsThumbnailComponent, "nxs-thumbnail", never, { "documentId": { "alias": "documentId"; "required": true; "isSignal": true; }; "alt": { "alias": "alt"; "required": false; "isSignal": true; }; }, {}, never, ["*"], true, never>;
}

/** A user or a group, as the picker offers and returns it. */
interface NxsPrincipal {
    /** The username or group name: what Nuxeo's permissions and workflows take. */
    readonly id: string;
    /** What the picker shows: the display name Nuxeo gives, or the id when there is none. */
    readonly label: string;
    readonly kind: 'user' | 'group';
    /** `user:<id>` or `group:<id>`, the form some Nuxeo operations take. */
    readonly prefixedId: string;
    readonly email?: string;
}
/** Whom the picker searches: Web UI's `searchType`. */
type NxsPrincipalSearch = 'users-and-groups' | 'users' | 'groups';
/**
 * A field that finds a user or a group as the user types, and returns the one chosen — the picker
 * Add permission, sharing and workflow assignment use, as Web UI's `nuxeo-user-suggestion` is.
 *
 * It searches from three characters, Web UI's default, so a one-letter term does not list the
 * whole directory; set `minChars` for a smaller one. Typing after a choice clears it, so the value
 * is always a principal the server returned, never free text: text typed and not chosen is an
 * `nxsChooseFromList` error on the form. Use it with `ngModel` or a form control, or bind `value`
 * two-way.
 */
declare class NxsUserGroupPickerComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: _angular_core.InputSignal<string>;
    /** Whom to search: users and groups (the default), users only, or groups only. */
    readonly search: _angular_core.InputSignal<NxsPrincipalSearch>;
    /** Characters typed before the server is asked. Web UI's three by default. */
    readonly minChars: _angular_core.InputSignalWithTransform<number, unknown>;
    /** Help under the field, already translated. */
    readonly hint: _angular_core.InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The principal chosen, or `null`. Two-way; a form control carries the same value. */
    readonly value: _angular_core.ModelSignal<NxsPrincipal | null>;
    private readonly input;
    private readonly documents;
    private readonly users;
    private readonly announcer;
    private readonly translate;
    private readonly control;
    /** What the input shows: the chosen principal's label, or what the user is typing. */
    protected readonly text: _angular_core.WritableSignal<string>;
    protected readonly finder: NxsSearchAsYouType<NxsPrincipal>;
    protected readonly isDisabled: _angular_core.Signal<boolean>;
    /** Text typed and no principal chosen for it. */
    protected readonly unmatched: _angular_core.Signal<boolean>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    protected readonly displayWith: (principal: NxsPrincipal | string | null) => string;
    constructor();
    /**
     * `MatInput` recomputes its error state only when its own input has a form control, and this
     * one has none — the form is on the picker — so the picker asks it to on every check.
     */
    ngDoCheck(): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    protected missing(): boolean;
    writeValue(value: NxsPrincipal | null): void;
    registerOnChange(fn: (value: NxsPrincipal | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    protected onInput(event: Event): void;
    protected choose(principal: NxsPrincipal | null): void;
    protected clear(): void;
    protected blurred(): void;
    private find;
    private announce;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsUserGroupPickerComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsUserGroupPickerComponent, "nxs-user-group-picker", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "search": { "alias": "search"; "required": false; "isSignal": true; }; "minChars": { "alias": "minChars"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/** One entry the select offers: its id, what it shows, and the parent it is listed under. */
interface Entry {
    readonly id: string;
    readonly label: string;
}
interface EntryGroup {
    /** The parent's label; empty for a vocabulary with no hierarchy. */
    readonly label: string;
    readonly entries: readonly Entry[];
}
type Loaded = {
    readonly status: 'loading';
} | {
    readonly status: 'failed';
} | {
    readonly status: 'loaded';
    /** Every selectable entry, by id, with the label the field and its chips show. */
    readonly labels: ReadonlyMap<string, string>;
    readonly filter: (text: string) => readonly EntryGroup[];
};
/**
 * A field that chooses one entry, or several, from a Nuxeo vocabulary — Nature, Subjects, Coverage
 * or any directory — as Web UI's `nuxeo-directory-suggestion` does.
 *
 * It lists the whole vocabulary on focus and narrows it as the user types. A hierarchical one —
 * `l10nsubjects`, `l10ncoverage` — is listed under its parents, and a chosen child is stored and
 * shown as Web UI stores it: `europe/France`, labelled `Europe/France`. A parent with no children,
 * such as `antarctica`, is chosen as itself. With `multiple` each choice is a chip, removed with its button or
 * Backspace. The value is the entry's id, or a list of ids; an id the vocabulary no longer has is
 * kept and shown as it is, so opening a document never drops a value. Text typed and not chosen is
 * an `nxsChooseFromList` error on the form.
 */
declare class NxsVocabularySelectComponent implements ControlValueAccessor, Validator, DoCheck {
    /** The directory to choose from, such as `nature` or `l10ncoverage`. */
    readonly directory: _angular_core.InputSignal<string>;
    /** The field's label, already translated. Required: the input has no other name. */
    readonly label: _angular_core.InputSignal<string>;
    /** Choose several entries; the value is then a list of ids. */
    readonly multiple: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Help under the field, already translated. */
    readonly hint: _angular_core.InputSignal<string>;
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    readonly required: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** Shown but not editable. A form's `disable()` does the same. */
    readonly disabled: _angular_core.InputSignalWithTransform<boolean, unknown>;
    /** The id chosen, or `null`; with `multiple`, the ids chosen, in order. Two-way. */
    readonly value: _angular_core.ModelSignal<string | readonly string[] | null>;
    /** The input's id, in either mode: the form field's label names the input through it. */
    protected readonly inputId: string;
    private readonly directories;
    private readonly destroyRef;
    private readonly input;
    private readonly grid;
    private readonly control;
    private readonly loads;
    /** The value the picker last set itself, so its own changes are not mistaken for a host's. */
    private committed;
    protected readonly loaded: _angular_core.WritableSignal<Loaded>;
    /** What the input shows: the chosen entry's label (single), or what the user is typing. */
    protected readonly text: _angular_core.WritableSignal<string>;
    /** The chosen ids, whichever mode. */
    protected readonly chosen: _angular_core.Signal<readonly string[]>;
    protected readonly isDisabled: _angular_core.Signal<boolean>;
    protected readonly groups: _angular_core.Signal<readonly EntryGroup[]>;
    /** Text typed and no entry chosen for it. */
    protected readonly unmatched: _angular_core.Signal<boolean>;
    protected readonly errorState: {
        isErrorState: () => boolean;
    };
    constructor();
    /** `MatInput` and `MatChipGrid` recompute their error state only with a form control of their own. */
    ngDoCheck(): void;
    writeValue(value: string | readonly string[] | null): void;
    registerOnChange(fn: (value: string | readonly string[] | null) => void): void;
    registerOnTouched(fn: () => void): void;
    setDisabledState(disabled: boolean): void;
    validate(control: AbstractControl): ValidationErrors | null;
    registerOnValidatorChange(fn: () => void): void;
    /** The label the field and its chips show for an id: the entry's, or the id itself. */
    protected labelOf(id: string): string;
    protected missing(): boolean;
    protected onInput(event: Event): void;
    protected opened(): void;
    protected choose(id: string): void;
    protected remove(id: string): void;
    protected clear(): void;
    protected blurred(): void;
    private commit;
    private reload;
    private load;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsVocabularySelectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsVocabularySelectComponent, "nxs-vocabulary-select", never, { "directory": { "alias": "directory"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "hint": { "alias": "hint"; "required": false; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; "value": { "alias": "value"; "required": false; "isSignal": true; }; }, { "value": "valueChange"; }, never, never, true, never>;
}

/** How long a toast stays, in milliseconds, unless the caller asks for longer. Web UI's default. */
declare const NXS_TOAST_DURATION = 4000;
/** A button on a toast besides Dismiss — "Undo", "View". */
interface NxsToastAction {
    /** What the button says, already translated. */
    readonly label: string;
    /** Runs when the button is pressed, just before the toast closes. */
    readonly run: () => void;
}
interface NxsToastOptions {
    /**
     * How long the toast stays, in milliseconds. Anything shorter than `NXS_TOAST_DURATION` is raised
     * to it, and `0` keeps the toast until it is dismissed. Defaults to `NXS_TOAST_DURATION`, or to `0`
     * when the toast carries an action, so a keyboard user has time to reach the button.
     */
    readonly duration?: number;
    /** One button besides Dismiss. */
    readonly action?: NxsToastAction;
}
interface NxsToastErrorOptions extends NxsToastOptions {
    /** Offers a translated "Retry" button that runs this. Takes the place of `action`. */
    readonly retry?: () => void;
}
/**
 * The one way the core slice tells a user that something happened.
 *
 * Every toast has a Dismiss button and closes on Escape. `show` is announced politely; `error` is
 * announced assertively, because the user is waiting on the action that failed. Messages arrive
 * already translated; only the toast's own buttons are translated here.
 *
 * Not a singleton: it holds no state, so each component lists `provideNxsToast()` in its own
 * `providers`, and Material's `MatSnackBar` underneath keeps one toast on screen at a time.
 */
declare class NxsToastService {
    private readonly snackBar;
    private readonly translate;
    private readonly destroyRef;
    /** Something happened: saved, copied, moved to trash. */
    show(message: string, options?: NxsToastOptions): void;
    /** Something the user asked for did not happen. */
    error(message: string, options?: NxsToastErrorOptions): void;
    private open;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsToastService, never>;
    static ɵprov: _angular_core.ɵɵInjectableDeclaration<NxsToastService>;
}
/** Lists `NxsToastService` in a component's `providers`. */
declare function provideNxsToast(): Provider;

/**
 * A person's initials in a coloured circle — the Material implementation of
 * `nxs.primitives.avatar`.
 *
 * Material has no eight-hue palette, so each colour is a hue of its own (`named-colors.ts`) tinted
 * toward the theme's surface and text, which keeps it that colour in light and dark themes and under
 * any primary palette. Set `--nxs-avatar-<colour>-background` and `-foreground` to give a colour
 * another hue.
 */
declare class NxsAvatarComponent implements NxsAvatarInputs {
    /**
     * The person's initials, upper-cased: up to two, or one at size `24`, where two do not fit and
     * Satori's avatar shows one.
     */
    readonly initials: _angular_core.InputSignal<string>;
    /** The circle's colour: `purple`, `blue`, `pink`, `teal`, `yellow`, `green`, `red` or `orange`. */
    readonly color: _angular_core.InputSignal<NxsAvatarColor>;
    /** The diameter in pixels: `24`, `28`, `36`, `64`, `80` or `128`. */
    readonly size: _angular_core.InputSignal<NxsAvatarSize>;
    /**
     * The accessible name, usually the person's name, already translated. Blank, or only whitespace
     * or zero-width characters, makes the avatar decorative.
     */
    readonly label: _angular_core.InputSignal<string>;
    protected readonly name: _angular_core.Signal<string>;
    protected readonly namedColor: _angular_core.Signal<Record<string, string> | null>;
    protected readonly shownInitials: _angular_core.Signal<string>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsAvatarComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsAvatarComponent, "nxs-avatar", never, { "initials": { "alias": "initials"; "required": true; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; "size": { "alias": "size"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** One entry on the trail as drawn: an item, or the "…" button that holds the folded ones. */
type TrailEntry = {
    readonly kind: 'item';
    readonly item: NxsBreadcrumbItem;
    readonly index: number;
} | {
    readonly kind: 'overflow';
};
/**
 * A breadcrumb trail — the Material implementation of `nxs.primitives.breadcrumbs`.
 *
 * It stays on one line. When the trail is wider than its box, the items after the first fold into
 * a "…" menu, furthest from the current page first, as Satori's do. The first stays while it fits
 * beside the "…" and the current page; in a box too narrow for that it folds too. The current page
 * always stays, its label cut short rather than hidden. A router item needs the host to provide
 * the router, as `routerLink` always does.
 */
declare class NxsBreadcrumbsComponent implements NxsBreadcrumbsInputs {
    /**
     * The trail, outermost first. An item with `routerLink` navigates in the app, one with `href` is a
     * plain link, and one with neither is text — the current page, when it is the last.
     */
    readonly items: _angular_core.InputSignal<readonly NxsBreadcrumbItem[]>;
    /**
     * The navigation landmark's accessible name, already translated, such as "Breadcrumbs". Blank, or
     * only whitespace or zero-width characters, leaves the landmark unnamed rather than named " ".
     */
    readonly label: _angular_core.InputSignal<string>;
    protected readonly name: _angular_core.Signal<string>;
    private readonly host;
    private readonly destroyRef;
    /** The items folded into the "…" menu, as last measured. */
    private readonly fold;
    protected readonly hiddenItems: _angular_core.Signal<NxsBreadcrumbItem[]>;
    protected readonly entries: _angular_core.Signal<readonly TrailEntry[]>;
    constructor();
    protected linkKind(item: NxsBreadcrumbItem): 'router' | 'href' | 'text';
    /** The last measurement, kept within a trail that may have shortened since. */
    private foldFor;
    private measure;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsBreadcrumbsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsBreadcrumbsComponent, "nxs-breadcrumbs", never, { "items": { "alias": "items"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * A short static label in a colour — the Material implementation of `nxs.primitives.tag`.
 *
 * Each colour is a hue of its own, tinted as the avatar's are, and `gray` the theme's neutral
 * container; set `--nxs-tag-<colour>-background` and `-foreground` to give a colour another hue. A
 * label longer than the space wraps inside the tag, as Web UI's does, rather than being cut short or
 * spilling out.
 */
declare class NxsTagComponent implements NxsTagInputs {
    /** The text, already translated. A long label wraps; it is never cut short. */
    readonly label: _angular_core.InputSignal<string>;
    /** The colour: `gray` or one of the avatar colours. */
    readonly color: _angular_core.InputSignal<NxsTagColor>;
    protected readonly namedColor: _angular_core.Signal<Record<string, string> | null>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsTagComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsTagComponent, "nxs-tag", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "color": { "alias": "color"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/** Where a file stands: chosen, waiting its turn, on its way, created, or refused. */
type NxsUploadState = 'staged' | 'waiting' | 'uploading' | 'done' | 'failed';
/** One file in an upload queue. */
interface NxsUploadItem {
    readonly id: string;
    readonly file: File;
    readonly state: NxsUploadState;
    /** This file's own progress, 0 to 100. */
    readonly percent: number;
    /** Why it failed, by status, when it did. */
    readonly error: NxsErrorStatus | null;
    /** The document created from it, once done. */
    readonly document: NuxeoDocument | null;
}
/**
 * The progress `DocumentImportService` reports while it uploads a list of files in one batch:
 * the whole list's percent and the index of the file in hand.
 */
interface NxsUploadProgress {
    readonly percent: number;
    readonly fileIndex?: number;
    readonly fileCount?: number;
}
/**
 * The state of one upload queue: the files chosen, then each file's progress and outcome while
 * they upload, in order. `nxs-upload-queue` draws it.
 *
 * It does no request itself. A page stages files, then runs its upload — usually
 * `DocumentImportService.importFiles(path, queue.pending(), { onProgress: (p) => queue.progress(p) })`
 * — and reports the outcome with `complete` or `fail`. So the same queue serves an import dialog
 * and files dropped on a list, with the request each already makes.
 */
declare class NxsUploadQueue {
    private readonly state;
    /** The ids of the files in the run under way, in upload order. */
    private running;
    /** Every file, in the order chosen. */
    readonly items: _angular_core.Signal<readonly NxsUploadItem[]>;
    /** Whether a run is under way. */
    readonly busy: _angular_core.Signal<boolean>;
    readonly done: _angular_core.Signal<NxsUploadItem[]>;
    readonly failed: _angular_core.Signal<NxsUploadItem[]>;
    /** Adds files to the queue, not yet uploading. */
    stage(files: readonly File[]): void;
    /** The files not uploaded yet — chosen, or refused last time — in order: what a run uploads. */
    pending(): File[];
    /** Marks the pending files as this run's, waiting their turn. */
    start(): void;
    /** Moves the run along: files before `fileIndex` are on their way to done, that one is uploading. */
    progress(progress: NxsUploadProgress): void;
    /** The run finished: each file created, its document in the same order. */
    complete(documents: readonly NuxeoDocument[]): void;
    /**
     * The run stopped on a failure. Files that had reached 100% were created, and are done; the first
     * that had not failed, with the error's status; the ones after it never started, and go back to
     * the queue for another run.
     */
    fail(error: unknown): void;
    /** Takes a file out, unless it is part of a run under way. */
    remove(id: string): void;
    /** Drops the files that are done, keeping the rest. */
    clearDone(): void;
    /** Empties the queue, unless a run is under way. */
    clear(): void;
    private update;
}

/**
 * The files of an upload, each with its own state: chosen, waiting, uploading with its progress,
 * uploaded, or refused with the reason and Retry.
 *
 * Presentational: it draws `items` — usually an `NxsUploadQueue`'s — and reports Remove and Retry;
 * the page runs the upload. The count of files uploaded and refused is announced politely as it
 * changes, so a screen reader follows a long upload without watching each bar.
 */
declare class NxsUploadQueueComponent {
    /** The files, in order. */
    readonly items: _angular_core.InputSignal<readonly NxsUploadItem[]>;
    /** The list's accessible name, already translated, such as "Files to upload". */
    readonly label: _angular_core.InputSignal<string>;
    /** Remove was pressed on a file that is not uploading: its id. */
    readonly remove: _angular_core.OutputEmitterRef<string>;
    /** Retry was pressed on a refused file: its id. */
    readonly retry: _angular_core.OutputEmitterRef<string>;
    protected readonly doneCount: _angular_core.Signal<number>;
    protected readonly failedCount: _angular_core.Signal<number>;
    protected readonly started: _angular_core.Signal<boolean>;
    /**
     * Whether the list scrolls. A file waiting or uploading has no button, so a long run can leave
     * nothing in the list to focus; the list then takes focus itself, so the keyboard can scroll it.
     * Measured when the files change and when the list changes size with the same files, as on zoom.
     */
    protected readonly scrolls: _angular_core.WritableSignal<boolean>;
    private readonly list;
    constructor();
    protected size(bytes: number): string;
    protected removable(item: NxsUploadItem): boolean;
    private measure;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsUploadQueueComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsUploadQueueComponent, "nxs-upload-queue", never, { "items": { "alias": "items"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; }, { "remove": "remove"; "retry": "retry"; }, never, never, true, never>;
}

/**
 * An icon button that opens a titled explanation — the Material implementation of
 * `nxs.primitives.richTooltip`.
 *
 * It opens as Satori's does: when the pointer rests on the button or keyboard focus reaches it.
 * Unlike Satori's, a click also opens it, because a touch screen has neither: a tap toggles the
 * panel, and a click keeps open a panel the pointer opened. Escape, wherever focus is, or focus
 * moving out of the component, closes it at once; the pointer leaving closes a panel the pointer
 * opened, after a delay long enough to reach the panel.
 *
 * Focus stays on the button, as it does on Satori's, and the panel opens inside a live region so a
 * screen reader announces it. It is not a dialog: a dialog takes focus when it opens.
 *
 * The panel opens under the button from its inline-start edge, is never wider than the viewport,
 * and moves sideways when it would cross either side of it, in either direction.
 */
declare class NxsRichTooltipComponent implements NxsRichTooltipInputs {
    /** The panel's title, already translated. */
    readonly heading: _angular_core.InputSignal<string>;
    /** The explanation under the title, already translated. Plain text. */
    readonly content: _angular_core.InputSignal<string>;
    /** The trigger button's accessible name, already translated. The button shows only an icon. */
    readonly triggerLabel: _angular_core.InputSignal<string>;
    /** The trigger's Material Icons ligature. */
    readonly icon: _angular_core.InputSignal<string>;
    protected readonly open: _angular_core.WritableSignal<boolean>;
    protected readonly panelId: string;
    /** How far, in px, the open panel is moved sideways to stay inside the viewport. */
    protected readonly shift: _angular_core.WritableSignal<number>;
    private readonly host;
    private readonly trigger;
    private readonly panel;
    /** What opened the panel while it is open; `null` while it is closed. */
    private opener;
    /** What will open the panel once `SHOW_DELAY` has passed. */
    private pending;
    private showTimer;
    private hideTimer;
    /** A pointer is pressing the button, so the focus it gives is the click's to handle. */
    private pressing;
    constructor();
    /** A pointer rests on the button or the panel. A touch has no hover; its tap is a click. */
    protected onPointerEnter(event: PointerEvent): void;
    protected onPointerLeave(event: PointerEvent): void;
    protected onPointerDown(): void;
    /**
     * Any press ends here, anywhere in the document: one that becomes a scroll (`pointercancel`) or is
     * released off the button never clicks, and would otherwise leave the next keyboard focus ignored.
     * A mouse focuses the button when it goes down, so its focus has passed by now; a tap's comes
     * after this, with its click a moment later, which cancels the opening the focus starts.
     */
    protected onPressEnd(): void;
    /** Keyboard focus opens the panel. The focus a press gives is left to its click. */
    protected onFocus(): void;
    /**
     * A click, a tap, Enter or Space. A click on a panel the pointer opened keeps it open once the
     * pointer leaves; otherwise activating the button opens or closes the panel.
     */
    protected onClick(): void;
    /**
     * Escape closes the panel, or stops it opening, wherever focus is: a panel the pointer opened
     * must close while focus is on another control (WCAG 1.4.13). Focus inside the component goes
     * back to the button; focus anywhere else stays where it is.
     */
    protected onEscape(): void;
    protected onFocusOut(event: FocusEvent): void;
    /** Opens after `SHOW_DELAY`, unless it opens or is cancelled first. Focus outranks hover. */
    private openSoon;
    private cancelOpening;
    private show;
    private close;
    /** Measured from the host, so the shift already applied does not feed into the next one. */
    private place;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsRichTooltipComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsRichTooltipComponent, "nxs-rich-tooltip", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "content": { "alias": "content"; "required": true; "isSignal": true; }; "triggerLabel": { "alias": "triggerLabel"; "required": true; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}

/**
 * Register the library's components by ID, on Material. Needs no Satori.
 *
 * Registration goes through `provideSatoriExtensions`, so it layers like every other contribution:
 * in provider order, later wins per ID. List it **before** `provideNxsSatoriComponents()` from
 * `@nuxeo/satori-platform/components-satori`, which re-registers four of the `NXS_PRIMITIVE_IDS` on
 * Satori, and before your own `provideSatoriExtensions(...)` calls, so an override of yours wins:
 *
 * ```ts
 * providers: [
 *   provideNxsComponents(),
 *   provideNxsSatoriComponents(), // only with access to @hylandsoftware/satori-ui
 *   provideSatoriExtensions({ components: { 'nxs.primitives.tag': () => import('./acme-tag').then((m) => m.AcmeTag) } }),
 * ];
 * ```
 */
declare function provideNxsComponents(): EnvironmentProviders;

/**
 * Text as a reader gets it: without the whitespace and zero-width characters around it, and empty
 * when nothing in it would show on screen.
 *
 * `trim()` alone keeps `'\u200B'` — a zero-width space a paste or a CMS can leave in a field — so a
 * label made of one still reads as a name, and assistive technology announces nothing for a control
 * that looks named. Characters inside the text are kept: a zero-width joiner between two emoji, or a
 * non-joiner in Persian, changes what the text says.
 */
declare function nxsVisibleText(text: string | null | undefined): string;
/**
 * The first `count` characters a reader sees in `text`, upper-cased — an avatar's initials. Counted
 * as user-perceived characters, so an accented letter written as a letter and a combining mark, or
 * an emoji written as two code units, is one initial and is never cut in half.
 */
declare function nxsInitials(text: string | null | undefined, count: number): string;

/**
 * The values of the search filters: what `nxs-search-filters` edits and a host turns into a query.
 *
 * Each field is one of `default_search`'s parameters. A multi-value field holds the bucket keys the
 * server's aggregate returns, and an empty string or list means "not filtered".
 */
interface NxsSearchFilters {
    /** Full text, sent as `ecm_fulltext`. */
    readonly fulltext: string;
    /** Modification-date ranges, the `dc_modified_agg` buckets — see {@link NXS_MODIFIED_RANGES}. */
    readonly modified: readonly string[];
    /** Authors' usernames, the `dc_creator_agg` buckets. */
    readonly authors: readonly string[];
    /** Collection ids, sent as `ecm_collections`. */
    readonly collections: readonly string[];
    /** Tag labels, sent as `ecm_tags`. */
    readonly tags: readonly string[];
    /** Nature vocabulary ids, the `dc_nature_agg` buckets. */
    readonly nature: readonly string[];
    /** Subject vocabulary ids, the `dc_subjects_agg` buckets. */
    readonly subjects: readonly string[];
    /** Coverage vocabulary ids, the `dc_coverage_agg` buckets. */
    readonly coverage: readonly string[];
    /** File-size ranges, the `common_size_agg` buckets — see {@link NXS_SIZE_RANGES}. */
    readonly size: readonly string[];
    /**
     * The page provider's `query` parameter. No field edits it; it is kept so a saved search that
     * carries one keeps it when it is loaded and saved again.
     */
    readonly query: string;
}
/** No filter set. */
declare const NXS_EMPTY_SEARCH_FILTERS: NxsSearchFilters;
/** The `dc_modified_agg` buckets `default_search` defines, in the order they are offered. */
declare const NXS_MODIFIED_RANGES: readonly ["last24h", "lastWeek", "lastMonth", "lastYear", "priorToLastYear"];
/** The `common_size_agg` buckets `default_search` defines, in the order they are offered. */
declare const NXS_SIZE_RANGES: readonly ["tiny", "small", "medium", "big", "huge"];
/** One choice in a filter group: a bucket key, and how many results fall in it. */
interface NxsFacetOption {
    readonly value: string;
    /** Results in the bucket, as the server counted them; `null` when the server sent no bucket. */
    readonly count: number | null;
}
/**
 * Display text for facet choices, by checkbox field and bucket key: the vocabulary label of a nature,
 * subject or coverage id. It changes only what is shown; the filter keeps the key.
 */
type NxsFacetLabels = Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>;
/**
 * The filters as the record a host keeps them in — `SearchAggregationService.drawerFilters` — with
 * a multi-value field as a JSON array, so a value containing a comma stays one value, and an empty
 * field left out.
 */
declare function nxsSearchFiltersToRecord(filters: NxsSearchFilters): Record<string, string>;
/**
 * The filters as a saved search's `params`, under `default_search`'s own parameter names — the ones
 * Web UI writes, so either application opens a search the other saved. A multi-value field is a JSON
 * array, which the server stores as a list.
 *
 * Every parameter is written, an empty one as `""` or `[]`, as Web UI writes its whole form: the
 * server merges an update's `params` into the ones it holds, so a filter left out would stay saved.
 * `q`, which no field edits, is written only when set.
 *
 * Not {@link nxsSearchFiltersToRecord}'s names: the server maps a parameter onto the saved search's
 * own fields by name, and refuses `subjects` and `size`, which collide with `dc:subjects` and the
 * removed `common:size`.
 */
declare function nxsSearchFiltersToSavedParams(filters: NxsSearchFilters): Record<string, string>;
/**
 * The params that clear every fallback key a saved search was read with, to send beside
 * {@link nxsSearchFiltersToSavedParams} when it is saved again.
 *
 * The server merges an update into the stored params, so a search saved under an earlier name
 * (`author: "alice"`) kept that key: with its author removed and saved, it read back from the old key
 * and the author returned. Once saved, the page provider's own key holds the value.
 */
declare function nxsSavedParamsToClear(loaded: Readonly<Record<string, unknown>> | null | undefined): Record<string, string>;
/** The filters as `SearchService.search`'s parameters, with the page's quick filters and sort. */
declare function nxsSearchFiltersToQuery(filters: NxsSearchFilters, page?: {
    quickFilters?: string;
    sortBy?: string | null;
    sortOrder?: 'asc' | 'desc' | null;
}): SearchQueryParams;
/**
 * Filters read back from a saved search's parameters, or from the record a host keeps them in.
 *
 * Reads the page-provider keys {@link nxsSearchFiltersToSavedParams} and Web UI write
 * (`dc_modified_agg`, `ecm_collections`, …) and the record keys {@link nxsSearchFiltersToRecord}
 * writes, which earlier saved searches also carry, with or without a `defaults:` prefix. Where both
 * are present the page-provider key wins, as the server applies it. A value may be a string, a
 * comma-separated string, a JSON array in a string, or an array, whose entries may be strings,
 * numbers, or objects with a string `id` or `uid` — the collection entries Web UI keeps; anything else
 * is ignored. The earlier `moreThan1YearAgo` range reads as `priorToLastYear`.
 */
declare function nxsSearchFiltersFromParams(params: Readonly<Record<string, unknown>> | null | undefined): NxsSearchFilters;
/** Whether any filter is set. */
declare function nxsHasSearchFilters(filters: NxsSearchFilters): boolean;
/** Whether two sets of filters ask for the same results: the order within a field does not count. */
declare function nxsSameSearchFilters(a: NxsSearchFilters, b: NxsSearchFilters): boolean;
/**
 * The choices for a range filter: every range, in order, with the server's count for it.
 *
 * Every range is offered whatever the counts, as Web UI's checkbox aggregation does, so a range that
 * is selected but now empty can still be cleared.
 */
declare function nxsRangeOptions(ranges: readonly string[], aggregation: AggregateResult | undefined): NxsFacetOption[];
/**
 * The choices for a terms filter: the server's buckets with results, then any selected value the
 * server no longer returns, so it can be cleared.
 */
declare function nxsTermOptions(aggregation: AggregateResult | undefined, selected: readonly string[]): NxsFacetOption[];

/** A group of checkboxes, and which field of the filters it edits. */
type CheckboxField = 'modified' | 'nature' | 'subjects' | 'coverage' | 'size';
/** A typeahead whose choices collect as chips, as Web UI's multiple-choice fields do. */
type ChoiceField = 'authors' | 'collections' | 'tags';
interface CheckboxGroup {
    readonly field: CheckboxField;
    readonly titleKey: string;
    readonly options: readonly NxsFacetOption[];
    /** Translation keys for range labels; a terms bucket shows its key. */
    readonly labelKeys?: Readonly<Record<string, string>>;
}
/**
 * The search filters — Web UI's default search form: full text, modification date, authors,
 * collections, tags, nature, subjects, coverage and size, with Reset and Save as.
 *
 * It edits `filters` and nothing else: the host turns them into a query and passes the server's
 * `aggregations` for that query back, which give each choice its count, as Web UI's checkbox
 * aggregations do. Full text applies on Enter; a checkbox, or an author, collection or tag added or
 * removed, applies at once. Authors, collections and tags take several values, as in Web UI. It
 * looks up the user's collections and the tag suggestions itself.
 */
declare class NxsSearchFiltersComponent {
    /** The filters shown. Two-way: every change the user makes is written back. */
    readonly filters: _angular_core.ModelSignal<NxsSearchFilters>;
    /** The server's aggregates for the query the filters produce: each choice's count. */
    readonly aggregations: _angular_core.InputSignal<SearchAggregations>;
    /**
     * The text shown for a choice, by field and bucket key: the vocabulary label of a nature, subject
     * or coverage id. A choice with no label shows its key. `filters` always keeps the key, so a
     * label never reaches a query or a saved search.
     */
    readonly optionLabels: _angular_core.InputSignal<Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>>;
    /** Reset was pressed: the filters are now empty. A host clears what it keeps beside them. */
    readonly filtersReset: _angular_core.OutputEmitterRef<void>;
    /** Save as was pressed: the host asks for a name and saves the current filters. */
    readonly saveAs: _angular_core.OutputEmitterRef<void>;
    private readonly searchService;
    private readonly destroyRef;
    protected readonly ids: {
        fulltext: string;
        authors: string;
        collections: string;
        tags: string;
        group: (field: string) => string;
    };
    protected readonly hasFilters: _angular_core.Signal<boolean>;
    /** What the full-text box holds; it reaches `filters` on Enter. */
    protected readonly fulltextDraft: _angular_core.WritableSignal<string>;
    protected readonly authorText: _angular_core.WritableSignal<string>;
    protected readonly collectionText: _angular_core.WritableSignal<string>;
    protected readonly tagText: _angular_core.WritableSignal<string>;
    /** Which collapsible groups are open. Modification date starts open, as in Web UI. */
    private readonly expanded;
    protected readonly groups: _angular_core.Signal<{
        before: CheckboxGroup[];
        after: CheckboxGroup[];
    }>;
    /** The authors the server counted for this query, not yet chosen, narrowed by what is typed. */
    protected readonly authorOptions: _angular_core.Signal<NxsFacetOption[]>;
    protected readonly collections: _angular_core.WritableSignal<readonly SearchCollectionOption[]>;
    protected readonly collectionsState: _angular_core.WritableSignal<"idle" | "failed" | "loading" | "loaded">;
    protected readonly collectionOptions: _angular_core.Signal<SearchCollectionOption[]>;
    /** A choice leaves its box empty: it is shown as a chip below it. */
    protected readonly emptyDisplay: () => string;
    private readonly tagSuggestions;
    protected readonly tagOptions: _angular_core.Signal<string[]>;
    private readonly tagTerms;
    constructor();
    protected isExpanded(field: CheckboxField): boolean;
    protected toggleGroup(field: CheckboxField): void;
    protected isChecked(field: CheckboxField, value: string): boolean;
    protected toggleOption(field: CheckboxField, value: string): void;
    protected optionLabelKey(group: CheckboxGroup, value: string): string | null;
    protected optionText(group: CheckboxGroup, value: string): string;
    protected applyFulltext(): void;
    protected clearFulltext(): void;
    protected addChoice(field: ChoiceField, value: string): void;
    protected removeChoice(field: ChoiceField, value: string): void;
    protected onCollectionsFocus(): void;
    private loadCollections;
    protected onTagInput(value: string): void;
    protected resetFilters(): void;
    /** The title a collection id is shown with, once the user's collections are known. */
    protected collectionTitle(id: string): string;
    private update;
    /** Opens every group that has a selection, so a loaded saved search shows what it filters on. */
    private expandSelected;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsSearchFiltersComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsSearchFiltersComponent, "nxs-search-filters", never, { "filters": { "alias": "filters"; "required": false; "isSignal": true; }; "aggregations": { "alias": "aggregations"; "required": false; "isSignal": true; }; "optionLabels": { "alias": "optionLabels"; "required": false; "isSignal": true; }; }, { "filters": "filtersChange"; "filtersReset": "filtersReset"; "saveAs": "saveAs"; }, never, never, true, never>;
}

/** A saved search the user chose: its id and its title. */
interface NxsSavedSearchChoice {
    readonly id: string;
    readonly title: string;
}
/**
 * The saved searches the user can open — the list at the top of Web UI's search form.
 *
 * Lists the saved searches the server returns for `pageProvider`: the user's own and those shared
 * with them. It reads the list when it is first opened and again when `refresh` changes, narrows it
 * as the user types, and emits the one chosen. Loading that search's filters is the host's job.
 */
declare class NxsSavedSearchSelectComponent {
    /** The saved search open now, or an empty string for none. */
    readonly selectedId: _angular_core.InputSignal<string>;
    /** Its title, shown in the box. */
    readonly selectedTitle: _angular_core.InputSignal<string>;
    /** The page provider whose saved searches are listed. */
    readonly pageProvider: _angular_core.InputSignal<string>;
    /** Change it to read the list again — after a search is saved, renamed or deleted. */
    readonly refresh: _angular_core.InputSignal<number>;
    /** The user chose a saved search. */
    readonly selectedChange: _angular_core.OutputEmitterRef<NxsSavedSearchChoice>;
    private readonly searchService;
    private readonly destroyRef;
    protected readonly inputId: string;
    protected readonly text: _angular_core.WritableSignal<string>;
    protected readonly searches: _angular_core.WritableSignal<readonly SavedSearchOption[]>;
    protected readonly state: _angular_core.WritableSignal<"idle" | "loading" | "loaded">;
    /** The saved searches whose title contains what is typed, unless it is the open one's title. */
    protected readonly options: _angular_core.Signal<readonly SavedSearchOption[]>;
    constructor();
    /** Reads the list, unless it is loading or already read. */
    protected load(): void;
    protected onInput(value: string): void;
    protected choose(id: string): void;
    /** Puts the open search's title back when the box is left without a choice. */
    protected restore(): void;
    protected readonly display: (id: string | null) => string;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsSavedSearchSelectComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsSavedSearchSelectComponent, "nxs-saved-search-select", never, { "selectedId": { "alias": "selectedId"; "required": false; "isSignal": true; }; "selectedTitle": { "alias": "selectedTitle"; "required": false; "isSignal": true; }; "pageProvider": { "alias": "pageProvider"; "required": false; "isSignal": true; }; "refresh": { "alias": "refresh"; "required": false; "isSignal": true; }; }, { "selectedChange": "selectedChange"; }, never, never, true, never>;
}

/**
 * The actions on the search being shown — Web UI's `nuxeo-saved-search-actions`.
 *
 * Offers Save as whenever there is something to save, and, on an open saved search the user may
 * change, Save (once its filters have changed), Rename, Share and Delete. Whether the user may change
 * it is the server's answer: the saved search's `WriteProperties` permission, read when it opens. A
 * search shared read-only can still be saved as a copy. It emits what was chosen; the host asks for
 * names and confirmations and sends the requests.
 */
declare class NxsSavedSearchActionsComponent {
    /** The saved search open now, or an empty string for none. */
    readonly savedSearchId: _angular_core.InputSignal<string>;
    /** Whether the filters differ from the open saved search's. */
    readonly dirty: _angular_core.InputSignal<boolean>;
    /** Whether any filter is set: with no saved search open, the only thing Save as can save. */
    readonly hasFilters: _angular_core.InputSignal<boolean>;
    /** Save the filters as a new saved search. */
    readonly saveAs: _angular_core.OutputEmitterRef<void>;
    /** Save the filters into the open saved search. */
    readonly save: _angular_core.OutputEmitterRef<void>;
    /** Rename the open saved search. */
    readonly rename: _angular_core.OutputEmitterRef<void>;
    /** Share the open saved search. */
    readonly share: _angular_core.OutputEmitterRef<void>;
    /** Delete the open saved search. */
    readonly remove: _angular_core.OutputEmitterRef<void>;
    private readonly documents;
    /**
     * Whether the user may change the open saved search: `true` only once the server has said so, so
     * Save, Rename, Share and Delete stay hidden while it is asked and when it cannot answer.
     */
    protected readonly canEdit: _angular_core.Signal<boolean>;
    protected readonly isSaved: _angular_core.Signal<boolean>;
    protected readonly showSaveAs: _angular_core.Signal<boolean>;
    protected readonly showSave: _angular_core.Signal<boolean>;
    protected readonly showMenu: _angular_core.Signal<boolean>;
    static ɵfac: _angular_core.ɵɵFactoryDeclaration<NxsSavedSearchActionsComponent, never>;
    static ɵcmp: _angular_core.ɵɵComponentDeclaration<NxsSavedSearchActionsComponent, "nxs-saved-search-actions", never, { "savedSearchId": { "alias": "savedSearchId"; "required": false; "isSignal": true; }; "dirty": { "alias": "dirty"; "required": false; "isSignal": true; }; "hasFilters": { "alias": "hasFilters"; "required": false; "isSignal": true; }; }, { "saveAs": "saveAs"; "save": "save"; "rename": "rename"; "share": "share"; "remove": "remove"; }, never, never, true, never>;
}

export { NXS_EMPTY_SEARCH_FILTERS, NXS_FAVORITES_CHANGED_EVENT, NXS_MODIFIED_RANGES, NXS_PERMISSIONS_PANEL_ID, NXS_PRIMITIVE_IDS, NXS_SIZE_RANGES, NXS_TOAST_DURATION, NxsActionMenuComponent, NxsAvatarComponent, NxsBreadcrumbsComponent, NxsColumnPickerComponent, NxsCommentExtraDirective, NxsCommentsComponent, NxsCreateVersionDialogComponent, NxsDateInputComponent, NxsDeletePermissionDialogComponent, NxsDetailsPanelComponent, NxsDocTypeIconComponent, NxsDocumentHistoryComponent, NxsDocumentListComponent, NxsDocumentReferenceInputComponent, NxsDocumentToolbarComponent, NxsDocumentTreeComponent, NxsDomainHintComponent, NxsDriveDialogComponent, NxsDropzoneComponent, NxsEmptyStateComponent, NxsErrorStateComponent, NxsFavoriteToggleComponent, NxsFolderHeaderComponent, NxsFolderPickerDialogComponent, NxsIconComponent, NxsManageVersionsComponent, NxsMetadataEditorComponent, NxsPagerComponent, NxsPermissionsPanelComponent, NxsPropertiesPanelComponent, NxsRenameDialogComponent, NxsRichTooltipComponent, NxsSavedSearchActionsComponent, NxsSavedSearchSelectComponent, NxsSearchFiltersComponent, NxsShareExternalDialogComponent, NxsSpinnerComponent, NxsTabBodyDirective, NxsTabsComponent, NxsTagComponent, NxsTagEditorComponent, NxsTagInputComponent, NxsThumbnailComponent, NxsToastService, NxsUpdatePermissionDialogComponent, NxsUploadQueue, NxsUploadQueueComponent, NxsUserGroupPickerComponent, NxsVocabularySelectComponent, nxsAceTimeFrame, nxsDocumentSuggestionQuery, nxsErrorStatus, nxsHasSearchFilters, nxsInitials, nxsPropertyText, nxsRangeOptions, nxsSameSearchFilters, nxsSavedParamsToClear, nxsSearchFiltersFromParams, nxsSearchFiltersToQuery, nxsSearchFiltersToRecord, nxsSearchFiltersToSavedParams, nxsTermOptions, nxsToggleFavorite, nxsVersionLabel, nxsVisibleText, provideNxsComponents, provideNxsThumbnailCache, provideNxsToast };
export type { NxsAvatarColor, NxsAvatarInputs, NxsAvatarSize, NxsBreadcrumbItem, NxsBreadcrumbsInputs, NxsCommentContext, NxsCreateVersionDialogData, NxsCreateVersionDialogResult, NxsDeletePermissionDialogData, NxsDetailsPanelTab, NxsDocumentListColumn, NxsDocumentListRowAction, NxsDocumentListSort, NxsDocumentReference, NxsDriveDialogData, NxsEditorConstraints, NxsEditorDisplay, NxsEditorField, NxsEditorFieldType, NxsEditorSection, NxsEditorValues, NxsErrorStateInputs, NxsErrorStatus, NxsFacetLabels, NxsFacetOption, NxsFolderPickerDialogData, NxsFolderPickerDialogResult, NxsHeadingLevel, NxsMenuAction, NxsPickableColumn, NxsPrincipal, NxsPrincipalSearch, NxsRenameDialogData, NxsRichTooltipInputs, NxsSavedSearchChoice, NxsSearchFilters, NxsShareExternalDialogData, NxsTab, NxsTabBodyContext, NxsTagColor, NxsTagInputs, NxsToastAction, NxsToastErrorOptions, NxsToastOptions, NxsToolbarAction, NxsUpdatePermissionDialogData, NxsUploadItem, NxsUploadProgress, NxsUploadState, NxsVocabularyLabel };
//# sourceMappingURL=index.d.ts.map
