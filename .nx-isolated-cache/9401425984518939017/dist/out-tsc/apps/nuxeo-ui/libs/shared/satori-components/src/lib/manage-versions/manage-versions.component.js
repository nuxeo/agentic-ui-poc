import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal, } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { canCreateDocumentVersion, DocumentDetailService, formatRelativeTime, } from '@nuxeo/satori-platform/nuxeo-client';
import { catchError, map, of, Subject, switchMap, tap } from 'rxjs';
import { NxsCreateVersionDialogComponent, } from '../create-version-dialog/create-version-dialog.component';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/divider";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/menu";
const _forTrack0 = ($index, $item) => $item.uid;
function NxsManageVersionsComponent_Conditional_0_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 9);
    i0.ɵɵlistener("click", function NxsManageVersionsComponent_Conditional_0_Conditional_9_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.create()); });
    i0.ɵɵelementStart(1, "mat-icon", 10);
    i0.ɵɵtext(2, "add_circle_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(6, "mat-divider");
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "satori-components.manage-versions.create"));
} }
function NxsManageVersionsComponent_Conditional_0_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵlistener("click", function NxsManageVersionsComponent_Conditional_0_Conditional_10_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.latestSelected.emit()); });
    i0.ɵɵelementStart(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "satori-components.manage-versions.latest"));
} }
function NxsManageVersionsComponent_Conditional_0_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p", 12);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 13);
    i0.ɵɵlistener("click", function NxsManageVersionsComponent_Conditional_0_Conditional_11_Template_button_click_3_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.retry($event)); });
    i0.ɵɵelementStart(4, "mat-icon", 10);
    i0.ɵɵtext(5, "refresh");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "satori-components.manage-versions.failed"), " ");
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "satori-components.manage-versions.retry"));
} }
function NxsManageVersionsComponent_Conditional_0_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵelement(1, "nxs-spinner", 14);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "satori-components.manage-versions.loading"));
} }
function NxsManageVersionsComponent_Conditional_0_Conditional_13_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵlistener("click", function NxsManageVersionsComponent_Conditional_0_Conditional_13_For_1_Template_button_click_0_listener() { const version_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.choose(version_r7)); });
    i0.ɵɵelementStart(1, "span", 17);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3, " ");
    i0.ɵɵelementStart(4, "span", 18);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const version_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("nxs-manage-versions__version--shown", ctx_r1.isShown(version_r7));
    i0.ɵɵattribute("aria-checked", ctx_r1.isShown(version_r7));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.numberOf(version_r7));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.modified(version_r7));
} }
function NxsManageVersionsComponent_Conditional_0_Conditional_13_ForEmpty_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 8);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.manage-versions.none"), " ");
} }
function NxsManageVersionsComponent_Conditional_0_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsManageVersionsComponent_Conditional_0_Conditional_13_For_1_Template, 6, 5, "button", 15, _forTrack0, false, NxsManageVersionsComponent_Conditional_0_Conditional_13_ForEmpty_2_Template, 3, 3, "p", 8);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r1.versions());
} }
function NxsManageVersionsComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 3);
    i0.ɵɵlistener("menuOpened", function NxsManageVersionsComponent_Conditional_0_Template_button_menuOpened_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.opened()); });
    i0.ɵɵelementStart(1, "span", 4);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵelementStart(5, "mat-icon", 5);
    i0.ɵɵtext(6, "arrow_drop_down");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "mat-menu", 6, 0);
    i0.ɵɵconditionalCreate(9, NxsManageVersionsComponent_Conditional_0_Conditional_9_Template, 7, 3);
    i0.ɵɵconditionalCreate(10, NxsManageVersionsComponent_Conditional_0_Conditional_10_Template, 4, 3, "button", 7);
    i0.ɵɵconditionalCreate(11, NxsManageVersionsComponent_Conditional_0_Conditional_11_Template, 9, 6)(12, NxsManageVersionsComponent_Conditional_0_Conditional_12_Template, 3, 3, "div", 8)(13, NxsManageVersionsComponent_Conditional_0_Conditional_13_Template, 3, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const list_r8 = i0.ɵɵreference(8);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("matMenuTriggerFor", list_r8);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 6, "satori-components.manage-versions.version"));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.label(), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r1.offersCreate() ? 9 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.document().isVersion ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.failed() ? 11 : ctx_r1.loading() && ctx_r1.versions().length === 0 ? 12 : 13);
} }
function NxsManageVersionsComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 19);
    i0.ɵɵlistener("click", function NxsManageVersionsComponent_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r9); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.create()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.manage-versions.create"), " ");
} }
function NxsManageVersionsComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 2);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.manage-versions.unversioned"));
} }
const major = (doc) => Number(doc.properties?.['uid:major_version'] ?? 0);
const minor = (doc) => Number(doc.properties?.['uid:minor_version'] ?? 0);
/**
 * A document's version number as Web UI writes it: `1.2`, and `1.2+` while it is checked out —
 * changed since that version.
 */
export function nxsVersionLabel(doc) {
    const label = `${major(doc)}.${minor(doc)}`;
    return doc.isCheckedOut && !doc.isVersion ? `${label}+` : label;
}
/** Newest first, by number, as Web UI sorts its list — not by date, which a restore reorders. */
function newestFirst(a, b) {
    return major(b) - major(a) || minor(b) - minor(a);
}
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
export class NxsManageVersionsComponent {
    documents = inject(DocumentDetailService);
    dialog = inject(MatDialog);
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    /** The document on screen: the live document or one of its versions. */
    document = input.required(...(ngDevMode ? [{ debugName: "document" }] : []));
    /** A version the user chose. Open it read-only; never restore from here. */
    versionSelected = output();
    /** The live document, chosen while one of its versions is on screen. */
    latestSelected = output();
    /** A version was created: the document is now checked in at it. Reload the document. */
    versionCreated = output();
    label = computed(() => nxsVersionLabel(this.document()), ...(ngDevMode ? [{ debugName: "label" }] : []));
    hasVersions = computed(() => {
        const doc = this.document();
        return major(doc) > 0 || minor(doc) > 0;
    }, ...(ngDevMode ? [{ debugName: "hasVersions" }] : []));
    canCreate = computed(() => canCreateDocumentVersion(this.document()), ...(ngDevMode ? [{ debugName: "canCreate" }] : []));
    /** Create Version in the list: only while there are changes to version, as in Web UI. */
    offersCreate = computed(() => this.canCreate() && this.document().isCheckedOut === true, ...(ngDevMode ? [{ debugName: "offersCreate" }] : []));
    /** The document whose versions are listed — this one, or the live one a version belongs to. */
    liveUid = computed(() => {
        const doc = this.document();
        return (doc.isVersion && doc.versionableId) || doc.uid;
    }, ...(ngDevMode ? [{ debugName: "liveUid" }] : []));
    versions = signal([], ...(ngDevMode ? [{ debugName: "versions" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failed = signal(false, ...(ngDevMode ? [{ debugName: "failed" }] : []));
    opens = new Subject();
    constructor() {
        toObservable(this.liveUid)
            .pipe(tap(() => {
            this.versions.set([]);
            this.failed.set(false);
            this.loading.set(false);
        }), switchMap((uid) => this.opens.pipe(switchMap(() => this.fetch(uid)))), takeUntilDestroyed())
            .subscribe((versions) => {
            this.loading.set(false);
            if (versions === null) {
                this.failed.set(true);
                return;
            }
            this.versions.set(versions);
        });
    }
    opened() {
        this.opens.next();
    }
    retry(event) {
        // Keeps the menu open: the retry answers in place.
        event.stopPropagation();
        this.opens.next();
    }
    isShown(version) {
        return version.uid === this.document().uid;
    }
    numberOf(version) {
        return `${major(version)}.${minor(version)}`;
    }
    modified(version) {
        const when = version.properties?.['dc:modified'] ?? version.lastModified;
        const who = version.properties?.['dc:lastContributor'] ??
            this.translate.instant('satori-components.manage-versions.unknown-user');
        return this.translate.instant('satori-components.manage-versions.modified', {
            when: when ? formatRelativeTime(when, this.translate.currentLang) : '',
            who,
        });
    }
    choose(version) {
        if (!this.isShown(version))
            this.versionSelected.emit(version);
    }
    create() {
        if (!this.canCreate())
            return;
        const doc = this.document();
        this.dialog
            .open(NxsCreateVersionDialogComponent, {
            width: '600px',
            maxWidth: '95vw',
            data: {
                documentUid: doc.uid,
                documentTitle: doc.title,
                major: major(doc),
                minor: minor(doc),
            },
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((version) => {
            if (version)
                this.versionCreated.emit(version);
        });
    }
    fetch(uid) {
        this.failed.set(false);
        this.loading.set(true);
        return this.documents.getVersionsDirect(uid).pipe(map((versions) => [...versions].sort(newestFirst)), catchError(() => of(null)));
    }
    static ɵfac = function NxsManageVersionsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsManageVersionsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsManageVersionsComponent, selectors: [["nxs-manage-versions"]], hostAttrs: [1, "nxs-manage-versions"], inputs: { document: [1, "document"] }, outputs: { versionSelected: "versionSelected", latestSelected: "latestSelected", versionCreated: "versionCreated" }, decls: 3, vars: 1, consts: [["list", "matMenu"], ["mat-stroked-button", "", "type", "button", 1, "nxs-manage-versions__create"], [1, "nxs-manage-versions__unversioned"], ["mat-button", "", "type", "button", 1, "nxs-manage-versions__trigger", 3, "menuOpened", "matMenuTriggerFor"], [1, "cdk-visually-hidden"], ["aria-hidden", "true", "iconPositionEnd", ""], ["xPosition", "after", 1, "nxs-manage-versions__menu"], ["mat-menu-item", "", "type", "button", 1, "nxs-manage-versions__latest"], [1, "nxs-manage-versions__note"], ["mat-menu-item", "", "type", "button", 1, "nxs-manage-versions__create", 3, "click"], ["aria-hidden", "true"], ["mat-menu-item", "", "type", "button", 1, "nxs-manage-versions__latest", 3, "click"], ["role", "alert", 1, "nxs-manage-versions__note"], ["mat-menu-item", "", "type", "button", 3, "click"], ["diameter", "20", 3, "label"], ["mat-menu-item", "", "type", "button", "role", "menuitemradio", 1, "nxs-manage-versions__version", 3, "nxs-manage-versions__version--shown"], ["mat-menu-item", "", "type", "button", "role", "menuitemradio", 1, "nxs-manage-versions__version", 3, "click"], [1, "nxs-manage-versions__number"], [1, "nxs-manage-versions__modified"], ["mat-stroked-button", "", "type", "button", 1, "nxs-manage-versions__create", 3, "click"]], template: function NxsManageVersionsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsManageVersionsComponent_Conditional_0_Template, 14, 8)(1, NxsManageVersionsComponent_Conditional_1_Template, 3, 3, "button", 1)(2, NxsManageVersionsComponent_Conditional_2_Template, 3, 3, "span", 2);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.hasVersions() ? 0 : ctx.canCreate() ? 1 : 2);
        } }, dependencies: [MatButtonModule, i1.MatButton, MatDividerModule, i2.MatDivider, MatIconModule, i3.MatIcon, MatMenuModule, i4.MatMenu, i4.MatMenuItem, i4.MatMenuTrigger, NxsSpinnerComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: inline-block;\n}\n\n.nxs-manage-versions__trigger[_ngcontent-%COMP%] {\n  min-width: 0;\n  padding-inline: 8px 4px;\n}\n\n.nxs-manage-versions__unversioned[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-manage-versions__version[_ngcontent-%COMP%] {\n  height: auto;\n  min-height: 56px;\n  padding-block: 6px;\n}\n\n.nxs-manage-versions__number[_ngcontent-%COMP%], \n.nxs-manage-versions__modified[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.nxs-manage-versions__number[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n\n.nxs-manage-versions__modified[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-manage-versions__version--shown[_ngcontent-%COMP%]   .nxs-manage-versions__number[_ngcontent-%COMP%] {\n  color: var(--mat-sys-primary);\n}\n\n.nxs-manage-versions__note[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 8px 16px;\n  color: var(--mat-sys-on-surface-variant);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsManageVersionsComponent, [{
        type: Component,
        args: [{ selector: 'nxs-manage-versions', standalone: true, imports: [
                    MatButtonModule,
                    MatDividerModule,
                    MatIconModule,
                    MatMenuModule,
                    TranslatePipe,
                    NxsSpinnerComponent,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-manage-versions' }, template: "@if (hasVersions()) {\n  <button\n    mat-button\n    type=\"button\"\n    class=\"nxs-manage-versions__trigger\"\n    [matMenuTriggerFor]=\"list\"\n    (menuOpened)=\"opened()\"\n  >\n    <span class=\"cdk-visually-hidden\">{{\n      'satori-components.manage-versions.version' | translate\n    }}</span>\n    {{ label() }}\n    <mat-icon aria-hidden=\"true\" iconPositionEnd>arrow_drop_down</mat-icon>\n  </button>\n\n  <mat-menu #list=\"matMenu\" class=\"nxs-manage-versions__menu\" xPosition=\"after\">\n    @if (offersCreate()) {\n      <button mat-menu-item type=\"button\" class=\"nxs-manage-versions__create\" (click)=\"create()\">\n        <mat-icon aria-hidden=\"true\">add_circle_outline</mat-icon>\n        <span>{{ 'satori-components.manage-versions.create' | translate }}</span>\n      </button>\n      <mat-divider />\n    }\n    @if (document().isVersion) {\n      <button\n        mat-menu-item\n        type=\"button\"\n        class=\"nxs-manage-versions__latest\"\n        (click)=\"latestSelected.emit()\"\n      >\n        <span>{{ 'satori-components.manage-versions.latest' | translate }}</span>\n      </button>\n    }\n    @if (failed()) {\n      <p class=\"nxs-manage-versions__note\" role=\"alert\">\n        {{ 'satori-components.manage-versions.failed' | translate }}\n      </p>\n      <button mat-menu-item type=\"button\" (click)=\"retry($event)\">\n        <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n        <span>{{ 'satori-components.manage-versions.retry' | translate }}</span>\n      </button>\n    } @else if (loading() && versions().length === 0) {\n      <div class=\"nxs-manage-versions__note\">\n        <nxs-spinner\n          diameter=\"20\"\n          [label]=\"'satori-components.manage-versions.loading' | translate\"\n        />\n      </div>\n    } @else {\n      @for (version of versions(); track version.uid) {\n        <button\n          mat-menu-item\n          type=\"button\"\n          role=\"menuitemradio\"\n          class=\"nxs-manage-versions__version\"\n          [attr.aria-checked]=\"isShown(version)\"\n          [class.nxs-manage-versions__version--shown]=\"isShown(version)\"\n          (click)=\"choose(version)\"\n        >\n          <span class=\"nxs-manage-versions__number\">{{ numberOf(version) }}</span\n          >&ngsp;\n          <span class=\"nxs-manage-versions__modified\">{{ modified(version) }}</span>\n        </button>\n      } @empty {\n        <p class=\"nxs-manage-versions__note\">\n          {{ 'satori-components.manage-versions.none' | translate }}\n        </p>\n      }\n    }\n  </mat-menu>\n} @else if (canCreate()) {\n  <button mat-stroked-button type=\"button\" class=\"nxs-manage-versions__create\" (click)=\"create()\">\n    {{ 'satori-components.manage-versions.create' | translate }}\n  </button>\n} @else {\n  <span class=\"nxs-manage-versions__unversioned\">{{\n    'satori-components.manage-versions.unversioned' | translate\n  }}</span>\n}\n", styles: [":host {\n  display: inline-block;\n}\n\n.nxs-manage-versions__trigger {\n  min-width: 0;\n  padding-inline: 8px 4px;\n}\n\n.nxs-manage-versions__unversioned {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-manage-versions__version {\n  height: auto;\n  min-height: 56px;\n  padding-block: 6px;\n}\n\n.nxs-manage-versions__number,\n.nxs-manage-versions__modified {\n  display: block;\n}\n\n.nxs-manage-versions__number {\n  font-weight: 500;\n}\n\n.nxs-manage-versions__modified {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-manage-versions__version--shown .nxs-manage-versions__number {\n  color: var(--mat-sys-primary);\n}\n\n.nxs-manage-versions__note {\n  margin: 0;\n  padding: 8px 16px;\n  color: var(--mat-sys-on-surface-variant);\n}\n"] }]
    }], () => [], { document: [{ type: i0.Input, args: [{ isSignal: true, alias: "document", required: true }] }], versionSelected: [{ type: i0.Output, args: ["versionSelected"] }], latestSelected: [{ type: i0.Output, args: ["latestSelected"] }], versionCreated: [{ type: i0.Output, args: ["versionCreated"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsManageVersionsComponent, { className: "NxsManageVersionsComponent", filePath: "libs/shared/satori-components/src/lib/manage-versions/manage-versions.component.ts", lineNumber: 85 }); })();
