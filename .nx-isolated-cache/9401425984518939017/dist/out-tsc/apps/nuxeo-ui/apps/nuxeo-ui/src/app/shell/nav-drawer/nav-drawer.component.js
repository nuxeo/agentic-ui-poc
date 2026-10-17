import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, input, output, signal, effect, computed, DestroyRef, untracked, LOCALE_ID, viewChild, } from '@angular/core';
import { NgTemplateOutlet, DatePipe, formatDate } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { BrowseService, BrowseContextService, ClipboardTargetService, CollectionService, AssetService, AssetAggregationService, DocumentService, DocumentDetailService, TaskService, CURRENT_USERNAME, docTypeIcon, isFolderishDocument, isBrowsableNavNode, normalizeNuxeoPath, nuxeoPathsEqualFlexible, nuxeoPathSegments, documentNavigationUrl, isCollectionDocument, canPasteClipboard, readClipboardDocs, writeClipboardDocs, formatRelativeTime, DocTypeLabelPipe, taskDueDistance, } from '@nuxeo/satori-platform/nuxeo-client';
import { AppExtensionsService, DescriptorLabelPipe, EXTENSION_SLOTS, ExtensionComponentRegistry, ExtensionOutletComponent, ExtensionRuleContextService, } from '@nuxeo/satori-platform/extensions';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { visibleSettingsDrawerItems, ADMINISTRATION_DRAWER_ITEMS, POWERUSER_ADMINISTRATION_DRAWER_ITEMS, } from '../../platform-nav-items';
import { ThemingFeatureFlagService } from '../../theme/theming-feature-flag.service';
import { drawerDueKey } from './nav-drawer-due';
import { NxsDocumentTreeComponent } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/progress-spinner";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/tooltip";
const _c0 = a0 => ({ $implicit: a0, depth: 0 });
const _c1 = a0 => ({ date: a0 });
const _c2 = () => ({ exact: true });
const _c3 = a0 => ({ name: a0 });
const _c4 = (a0, a1) => ({ $implicit: a0, depth: a1 });
const _forTrack0 = ($index, $item) => $item.doc.uid;
const _forTrack1 = ($index, $item) => $item.uid;
const _forTrack2 = ($index, $item) => $item.id;
const _forTrack3 = ($index, $item) => $item.path;
function NavDrawerComponent_Conditional_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.loadTasks()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "nav.refresh"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "nav.refresh"));
} }
function NavDrawerComponent_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.refreshRecentlyViewed()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "nav.refresh"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "nav.refresh"));
} }
function NavDrawerComponent_Conditional_0_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.refreshExpired()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "nav.refresh"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "nav.refresh"));
} }
function NavDrawerComponent_Conditional_0_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.refreshBrowseTree()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "nav.refresh"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "nav.refresh"));
} }
function NavDrawerComponent_Conditional_0_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 15);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.refreshPersonalSpaceTree()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "refresh");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "nav.refresh"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "nav.refresh"));
} }
function NavDrawerComponent_Conditional_0_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "nxs-document-tree", 16);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("navigate", function NavDrawerComponent_Conditional_0_Conditional_9_Template_nxs_document_tree_navigate_1_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onBrowseTreeNavigate($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 2, "nav.tree.label"))("currentPath", ctx_r1.browseTreePath());
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 18)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 22);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_2_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.refreshPersonalSpaceTree()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.personalSpaceError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 2, "nav.tree.retry"), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "nav.folders.empty"));
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_4_For_2_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_4_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, NavDrawerComponent_Conditional_0_Conditional_10_Conditional_4_For_2_ng_container_0_Template, 1, 0, "ng-container", 23);
} if (rf & 2) {
    const node_r9 = ctx.$implicit;
    i0.ɵɵnextContext(4);
    const folderTpl_r10 = i0.ɵɵreference(2);
    i0.ɵɵproperty("ngTemplateOutlet", folderTpl_r10)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c0, node_r9));
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_10_Conditional_4_For_2_Template, 1, 4, "ng-container", null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.personalSpaceNodes());
} }
function NavDrawerComponent_Conditional_0_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_10_Conditional_1_Template, 3, 3, "div", 17)(2, NavDrawerComponent_Conditional_0_Conditional_10_Conditional_2_Template, 6, 4, "div", 18)(3, NavDrawerComponent_Conditional_0_Conditional_10_Conditional_3_Template, 3, 3, "div", 19)(4, NavDrawerComponent_Conditional_0_Conditional_10_Conditional_4_Template, 3, 0, "div", 20);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.personalSpaceLoading() ? 1 : ctx_r1.personalSpaceError() ? 2 : ctx_r1.personalSpaceNodes().length === 0 ? 3 : 4);
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.recentlyViewedError());
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "mat-icon", 25);
    i0.ɵɵtext(2, "visibility_off");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "nav.recent.empty"));
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 29);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 30);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r12 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.docIcon(doc_r12));
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 27);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Template_button_click_0_listener() { const doc_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openRecentlyViewedDoc(doc_r12)); });
    i0.ɵɵelementStart(1, "div", 28);
    i0.ɵɵconditionalCreate(2, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Conditional_2_Template, 1, 1, "img", 29)(3, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Conditional_3_Template, 2, 1, "mat-icon", 30);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 31)(5, "span", 32);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 33)(8, "span", 34);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "docTypeLabel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 35);
    i0.ɵɵtext(12, "\u00B7");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span", 36);
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    let tmp_15_0;
    const doc_r12 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.thumbnailMap()[doc_r12.uid]) ? 2 : 3, tmp_15_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(doc_r12.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 4, doc_r12.type));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.relativeTime(doc_r12.lastModified));
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_For_2_Template, 15, 6, "button", 26, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.recentlyViewed());
} }
function NavDrawerComponent_Conditional_0_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_0_Template, 3, 3, "div", 17)(1, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_1_Template, 2, 1, "div", 18)(2, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_2_Template, 6, 3, "div", 19)(3, NavDrawerComponent_Conditional_0_Conditional_11_Conditional_3_Template, 3, 0, "div", 24);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.recentlyViewedLoading() ? 0 : ctx_r1.recentlyViewedError() ? 1 : ctx_r1.recentlyViewed().length === 0 ? 2 : 3);
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 18);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.expiredError());
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "mat-icon", 25);
    i0.ɵɵtext(2, "timer_off");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "nav.expired.empty"));
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 41);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 42);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r14 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.docIcon(doc_r14));
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 39);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Template_button_click_0_listener() { const doc_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openExpiredDoc(doc_r14)); });
    i0.ɵɵelementStart(1, "div", 40);
    i0.ɵɵconditionalCreate(2, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Conditional_2_Template, 1, 1, "img", 41)(3, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Conditional_3_Template, 2, 1, "mat-icon", 42);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 43)(5, "span", 44);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 45)(8, "span", 46);
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "docTypeLabel");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "span", 47);
    i0.ɵɵtext(12, "\u00B7");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "span", 48);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "mat-icon", 49);
    i0.ɵɵtext(17, "warning");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_15_0;
    const doc_r14 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.thumbnailMap()[doc_r14.uid]) ? 2 : 3, tmp_15_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(doc_r14.title);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(10, 4, doc_r14.type));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(15, 6, "shell.expired-on", i0.ɵɵpureFunction1(9, _c1, ctx_r1.expiredDate(doc_r14))));
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 37);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_For_2_Template, 18, 11, "button", 38, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.expiredDocs());
} }
function NavDrawerComponent_Conditional_0_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_0_Template, 3, 3, "div", 17)(1, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_1_Template, 2, 1, "div", 18)(2, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_2_Template, 6, 3, "div", 19)(3, NavDrawerComponent_Conditional_0_Conditional_12_Conditional_3_Template, 3, 0, "div", 37);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.expiredLoading() ? 0 : ctx_r1.expiredError() ? 1 : ctx_r1.expiredDocs().length === 0 ? 2 : 3);
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "nav.collections.empty"));
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 53);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 54)(1, "mat-icon");
    i0.ɵɵtext(2, "collections_bookmark");
    i0.ɵɵelementEnd()();
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 52);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Template_button_click_0_listener() { const col_r16 = i0.ɵɵrestoreView(_r15).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openCollection(col_r16)); });
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Conditional_1_Template, 1, 1, "img", 53)(2, NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Conditional_2_Template, 3, 0, "div", 54);
    i0.ɵɵelementStart(3, "div", 55)(4, "span", 56);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 57);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "date");
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span", 58)(11, "span", 59);
    i0.ɵɵtext(12);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_15_0;
    const col_r16 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.thumbnailMap()[col_r16.uid]) ? 1 : 2, tmp_15_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(col_r16.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(9, 8, "shell.last-modified-on", i0.ɵɵpureFunction1(11, _c1, i0.ɵɵpipeBind2(8, 5, col_r16.lastModified, "mediumDate"))));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.collectionOwnerInitial(col_r16));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.collectionOwner(col_r16), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 50);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_For_2_Template, 14, 13, "button", 51, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.collections());
} }
function NavDrawerComponent_Conditional_0_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_13_Conditional_1_Template, 3, 3, "div", 17)(2, NavDrawerComponent_Conditional_0_Conditional_13_Conditional_2_Template, 3, 3, "div", 19)(3, NavDrawerComponent_Conditional_0_Conditional_13_Conditional_3_Template, 3, 0, "div", 50);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.collectionsLoading() ? 1 : ctx_r1.collections().length === 0 ? 2 : 3);
} }
function NavDrawerComponent_Conditional_0_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 6);
} }
function NavDrawerComponent_Conditional_0_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 7);
} }
function NavDrawerComponent_Conditional_0_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 8);
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 18)(1, "span");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 60);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_2_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r17); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.loadTasks()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.tasksError());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 2, "nav.tasks.retry"), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "mat-icon", 25);
    i0.ɵɵtext(2, "task_alt");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "nav.tasks.empty"));
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 69);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const task_r19 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(task_r19.targetDocTitle);
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 70)(1, "span", 72);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "span", 73);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const task_r19 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.isOverdue(task_r19) ? i0.ɵɵpipeBind1(3, 6, "shell.overdue") : i0.ɵɵpipeBind1(4, 8, "shell.due"));
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("task-due-value--soon", !ctx_r1.isOverdue(task_r19))("task-due-value--overdue", ctx_r1.isOverdue(task_r19));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.dueRelativeOnly(task_r19), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 71);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx);
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 66);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Template_button_click_0_listener() { const task_r19 = i0.ɵɵrestoreView(_r18).$implicit; const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.selectTask(task_r19)); });
    i0.ɵɵelementStart(1, "div", 67)(2, "div", 68);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Conditional_4_Template, 2, 1, "div", 69);
    i0.ɵɵconditionalCreate(5, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Conditional_5_Template, 7, 10, "div", 70);
    i0.ɵɵconditionalCreate(6, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Conditional_6_Template, 2, 1, "div", 71);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    let tmp_20_0;
    const task_r19 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵclassProp("active", ctx_r1.isTaskSelected(task_r19));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.taskPrimaryTitle(task_r19));
    i0.ɵɵadvance();
    i0.ɵɵconditional(task_r19.targetDocTitle ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(task_r19.dueDate ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_20_0 = ctx_r1.taskWorkflowSentence(task_r19)) ? 6 : -1, tmp_20_0);
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 62);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_For_2_Template, 7, 6, "button", 65, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.tasks());
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 61);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_1_Template, 6, 3, "div", 19)(2, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Conditional_2_Template, 3, 0, "div", 62);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 63)(4, "a", 64);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.tasks().length === 0 ? 1 : 2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 2, "nav.tasks.dashboard"));
} }
function NavDrawerComponent_Conditional_0_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_1_Template, 3, 3, "div", 17)(2, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_2_Template, 6, 4, "div", 18)(3, NavDrawerComponent_Conditional_0_Conditional_17_Conditional_3_Template, 7, 4);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.tasksLoading() ? 1 : ctx_r1.tasksError() ? 2 : 3);
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "mat-icon", 75);
    i0.ɵɵtext(2, "star_border");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 76);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "nav.favorites.empty"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "nav.favorites.hint"));
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 79);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 80)(1, "mat-icon");
    i0.ɵɵtext(2, "insert_drive_file");
    i0.ɵɵelementEnd()();
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 77)(1, "button", 78);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Template_button_click_1_listener() { const doc_r21 = i0.ɵɵrestoreView(_r20).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openFavoriteDoc(doc_r21)); });
    i0.ɵɵconditionalCreate(2, NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Conditional_2_Template, 1, 1, "img", 79)(3, NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Conditional_3_Template, 3, 0, "div", 80);
    i0.ɵɵelementStart(4, "span", 81);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 82);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Template_button_click_6_listener() { const doc_r21 = i0.ɵɵrestoreView(_r20).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.removeFromFavorites(doc_r21)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_15_0;
    const doc_r21 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.thumbnailMap()[doc_r21.uid]) ? 2 : 3, tmp_15_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r21.title);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 4, "nav.favorites.remove"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 6, "nav.favorites.remove"));
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_For_2_Template, 11, 8, "div", 77, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.favorites());
} }
function NavDrawerComponent_Conditional_0_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_18_Conditional_1_Template, 3, 3, "div", 17)(2, NavDrawerComponent_Conditional_0_Conditional_18_Conditional_2_Template, 9, 6, "div", 19)(3, NavDrawerComponent_Conditional_0_Conditional_18_Conditional_3_Template, 3, 0, "div", 74);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.favoritesLoading() ? 1 : ctx_r1.favorites().length === 0 ? 2 : 3);
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19)(1, "mat-icon", 75);
    i0.ɵɵtext(2, "content_paste");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 76);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "nav.clipboard.empty"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "nav.clipboard.hint"));
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 91);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 92)(1, "mat-icon");
    i0.ɵɵtext(2, "description");
    i0.ɵɵelementEnd()();
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 84)(1, "button", 90);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Template_button_click_1_listener() { const doc_r24 = i0.ɵɵrestoreView(_r23).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.openClipboardDoc(doc_r24)); });
    i0.ɵɵconditionalCreate(2, NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Conditional_2_Template, 1, 1, "img", 91)(3, NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Conditional_3_Template, 3, 0, "div", 92);
    i0.ɵɵelementStart(4, "span", 93);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 94);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Template_button_click_6_listener() { const doc_r24 = i0.ɵɵrestoreView(_r23).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.removeFromClipboard(doc_r24)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_15_0;
    const doc_r24 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_15_0 = ctx_r1.thumbnailMap()[doc_r24.uid]) ? 2 : 3, tmp_15_0);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(doc_r24.title);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(7, 4, "nav.clipboard.remove"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 6, "nav.clipboard.remove"));
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 87);
    i0.ɵɵelement(1, "mat-spinner", 21);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "nav.loading"));
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 83);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_For_2_Template, 11, 8, "div", 84, _forTrack1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 85)(4, "p", 86);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_Conditional_7_Template, 3, 3, "div", 87);
    i0.ɵɵelementStart(8, "div", 88)(9, "button", 89);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.copyClipboard()); });
    i0.ɵɵelementStart(10, "mat-icon");
    i0.ɵɵtext(11, "content_copy");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "button", 89);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.moveClipboard()); });
    i0.ɵɵelementStart(15, "mat-icon");
    i0.ɵɵtext(16, "drive_file_move");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.clipboardDocs());
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, "nav.clipboard.tip"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.clipboardActionLoading() ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.clipboardCanPaste() || ctx_r1.clipboardActionLoading());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 8, "nav.clipboard.copy"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.clipboardCanPaste() || ctx_r1.clipboardActionLoading());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 10, "nav.clipboard.move"), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 11);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_Conditional_0_Conditional_19_Conditional_1_Template, 9, 6, "div", 19)(2, NavDrawerComponent_Conditional_0_Conditional_19_Conditional_2_Template, 19, 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.clipboardEmpty() ? 1 : 2);
} }
function NavDrawerComponent_Conditional_0_Conditional_20_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 95);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const settingsItem_r26 = ctx.$implicit;
    i0.ɵɵproperty("routerLink", settingsItem_r26.path)("routerLinkActiveOptions", i0.ɵɵpureFunction0(5, _c2));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, settingsItem_r26), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_20_For_2_Template, 3, 6, "button", 95, _forTrack3);
    i0.ɵɵelementStart(3, "button", 96);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_20_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onSettingsSignOut()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.settingsItems());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "nav.sign-out"), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_21_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 96);
    i0.ɵɵlistener("click", function NavDrawerComponent_Conditional_0_Conditional_21_For_2_Template_button_click_0_listener() { const adminItem_r28 = i0.ɵɵrestoreView(_r27).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onAdministrationItemClick(adminItem_r28.path)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const adminItem_r28 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("settings-item--active", ctx_r1.isAdminDrawerPathActive(adminItem_r28.path));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, adminItem_r28), " ");
} }
function NavDrawerComponent_Conditional_0_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵrepeaterCreate(1, NavDrawerComponent_Conditional_0_Conditional_21_For_2_Template, 3, 5, "button", 97, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.administrationItems());
} }
function NavDrawerComponent_Conditional_0_Conditional_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "lib-extension-outlet", 13);
} if (rf & 2) {
    i0.ɵɵproperty("componentId", ctx);
} }
function NavDrawerComponent_Conditional_0_Conditional_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 14)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "descriptorLabel");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r29 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(4, 3, "shell.slot-empty", i0.ɵɵpureFunction1(6, _c3, i0.ɵɵpipeBind1(3, 1, item_r29))));
} }
function NavDrawerComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "div", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "descriptorLabel");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, NavDrawerComponent_Conditional_0_Conditional_4_Template, 5, 6, "button", 3);
    i0.ɵɵconditionalCreate(5, NavDrawerComponent_Conditional_0_Conditional_5_Template, 5, 6, "button", 3);
    i0.ɵɵconditionalCreate(6, NavDrawerComponent_Conditional_0_Conditional_6_Template, 5, 6, "button", 3);
    i0.ɵɵconditionalCreate(7, NavDrawerComponent_Conditional_0_Conditional_7_Template, 5, 6, "button", 3);
    i0.ɵɵconditionalCreate(8, NavDrawerComponent_Conditional_0_Conditional_8_Template, 5, 6, "button", 3);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, NavDrawerComponent_Conditional_0_Conditional_9_Template, 3, 4, "div", 4)(10, NavDrawerComponent_Conditional_0_Conditional_10_Template, 5, 1, "div", 4)(11, NavDrawerComponent_Conditional_0_Conditional_11_Template, 4, 1)(12, NavDrawerComponent_Conditional_0_Conditional_12_Template, 4, 1)(13, NavDrawerComponent_Conditional_0_Conditional_13_Template, 4, 1, "div", 5)(14, NavDrawerComponent_Conditional_0_Conditional_14_Template, 1, 0, "lib-extension-outlet", 6)(15, NavDrawerComponent_Conditional_0_Conditional_15_Template, 1, 0, "lib-extension-outlet", 7)(16, NavDrawerComponent_Conditional_0_Conditional_16_Template, 1, 0, "lib-extension-outlet", 8)(17, NavDrawerComponent_Conditional_0_Conditional_17_Template, 4, 1, "div", 9)(18, NavDrawerComponent_Conditional_0_Conditional_18_Template, 4, 1, "div", 10)(19, NavDrawerComponent_Conditional_0_Conditional_19_Template, 3, 1, "div", 11)(20, NavDrawerComponent_Conditional_0_Conditional_20_Template, 6, 3, "div", 12)(21, NavDrawerComponent_Conditional_0_Conditional_21_Template, 3, 0, "div", 12)(22, NavDrawerComponent_Conditional_0_Conditional_22_Template, 1, 1, "lib-extension-outlet", 13)(23, NavDrawerComponent_Conditional_0_Conditional_23_Template, 5, 8, "div", 14);
} if (rf & 2) {
    let tmp_11_0;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("drawer-header--tasks", ctx_r1.isTasksPanel);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("drawer-title--tasks", ctx_r1.isTasksPanel);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 11, ctx), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.isTasksPanel ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isRecentlyViewed ? 5 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isExpiredQueue ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isBrowse ? 7 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isPersonalSpace ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isBrowse ? 9 : ctx_r1.isPersonalSpace ? 10 : ctx_r1.isRecentlyViewed ? 11 : ctx_r1.isExpiredQueue ? 12 : ctx_r1.isCollections ? 13 : ctx_r1.isAssets ? 14 : ctx_r1.isSearchFilters ? 15 : ctx_r1.isTrash ? 16 : ctx_r1.isTasksPanel ? 17 : ctx_r1.isFavorites ? 18 : ctx_r1.isClipboard ? 19 : ctx_r1.isSettings ? 20 : ctx_r1.isAdministration ? 21 : (tmp_11_0 = ctx_r1.sidebarComponentId()) ? 22 : 23, tmp_11_0);
} }
function NavDrawerComponent_ng_template_1_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 103);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "nav.loading"));
} }
function NavDrawerComponent_ng_template_1_Conditional_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 105);
    i0.ɵɵtext(1, " chevron_right ");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r32 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵclassProp("tree-arrow--expanded", node_r32.expanded);
} }
function NavDrawerComponent_ng_template_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r31 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 102);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NavDrawerComponent_ng_template_1_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r31); const node_r32 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleNode(node_r32)); });
    i0.ɵɵconditionalCreate(2, NavDrawerComponent_ng_template_1_Conditional_1_Conditional_2_Template, 2, 3, "mat-spinner", 103)(3, NavDrawerComponent_ng_template_1_Conditional_1_Conditional_3_Template, 2, 2, "mat-icon", 104);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r32 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(1, 3, "nav.tree.toggle", i0.ɵɵpureFunction1(6, _c3, ctx_r1.nodeLabel(node_r32))))("aria-expanded", node_r32.expanded);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(node_r32.loading ? 2 : 3);
} }
function NavDrawerComponent_ng_template_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 100);
} }
function NavDrawerComponent_ng_template_1_Conditional_5_For_1_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NavDrawerComponent_ng_template_1_Conditional_5_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, NavDrawerComponent_ng_template_1_Conditional_5_For_1_ng_container_0_Template, 1, 0, "ng-container", 23);
} if (rf & 2) {
    const child_r33 = ctx.$implicit;
    const depth_r34 = i0.ɵɵnextContext(2).depth;
    i0.ɵɵnextContext();
    const folderTpl_r10 = i0.ɵɵreference(2);
    i0.ɵɵproperty("ngTemplateOutlet", folderTpl_r10)("ngTemplateOutletContext", i0.ɵɵpureFunction2(2, _c4, child_r33, depth_r34 + 1));
} }
function NavDrawerComponent_ng_template_1_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NavDrawerComponent_ng_template_1_Conditional_5_For_1_Template, 1, 5, "ng-container", null, _forTrack0);
} if (rf & 2) {
    const node_r32 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵrepeater(node_r32.children);
} }
function NavDrawerComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    const _r30 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 98);
    i0.ɵɵconditionalCreate(1, NavDrawerComponent_ng_template_1_Conditional_1_Template, 4, 8, "button", 99)(2, NavDrawerComponent_ng_template_1_Conditional_2_Template, 1, 0, "span", 100);
    i0.ɵɵelementStart(3, "button", 101);
    i0.ɵɵlistener("click", function NavDrawerComponent_ng_template_1_Template_button_click_3_listener() { const node_r32 = i0.ɵɵrestoreView(_r30).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.navigateToFolder(node_r32)); });
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(5, NavDrawerComponent_ng_template_1_Conditional_5_Template, 2, 0);
} if (rf & 2) {
    const node_r32 = ctx.$implicit;
    const depth_r34 = ctx.depth;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("padding-left", 12 + depth_r34 * 20, "px");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.hasChildren(node_r32) ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("tree-label--active", ctx_r1.isNodeActive(node_r32));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.nodeLabel(node_r32), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r32.expanded && node_r32.children.length > 0 ? 5 : -1);
} }
export class NavDrawerComponent {
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    browseService = inject(BrowseService);
    browseContext = inject(BrowseContextService);
    clipboardTargetService = inject(ClipboardTargetService);
    snackBar = inject(MatSnackBar);
    collectionService = inject(CollectionService);
    assetService = inject(AssetService);
    assetAggregationService = inject(AssetAggregationService);
    detailService = inject(DocumentDetailService);
    docService = inject(DocumentService);
    authService = inject(AuthService);
    router = inject(Router);
    extensions = inject(AppExtensionsService);
    componentRegistry = inject(ExtensionComponentRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    activeItem = input(null, ...(ngDevMode ? [{ debugName: "activeItem" }] : []));
    itemSelected = output();
    navigateKeepDrawer = output();
    signOutSelected = output();
    themingFlags = inject(ThemingFeatureFlagService);
    settingsItems = computed(() => visibleSettingsDrawerItems(this.themingFlags.themingEnabled()), ...(ngDevMode ? [{ debugName: "settingsItems" }] : []));
    administrationItems = computed(() => this.authService.isAdministrator()
        ? ADMINISTRATION_DRAWER_ITEMS
        : POWERUSER_ADMINISTRATION_DRAWER_ITEMS, ...(ngDevMode ? [{ debugName: "administrationItems" }] : []));
    /** The browse tree, which loads and follows the browsed folder itself. */
    browseTree = viewChild(NxsDocumentTreeComponent, ...(ngDevMode ? [{ debugName: "browseTree" }] : []));
    /** The folder browse shows, which the tree expands to and marks. */
    browseTreePath = computed(() => this.browseContext.contextPath(), ...(ngDevMode ? [{ debugName: "browseTreePath" }] : []));
    personalSpaceNodes = signal([], ...(ngDevMode ? [{ debugName: "personalSpaceNodes" }] : []));
    personalSpaceLoading = signal(false, ...(ngDevMode ? [{ debugName: "personalSpaceLoading" }] : []));
    personalSpaceError = signal(null, ...(ngDevMode ? [{ debugName: "personalSpaceError" }] : []));
    personalSpaceLoaded = false;
    collections = signal([], ...(ngDevMode ? [{ debugName: "collections" }] : []));
    collectionsLoading = signal(false, ...(ngDevMode ? [{ debugName: "collectionsLoading" }] : []));
    collectionsLoaded = false;
    /**
     * The `sidebar` slot entry for the active nav item, if any.
     *
     * By convention a nav item `app.navbar.<name>` is served by the sidebar
     * component `app.sidebar.<name>`, so a manifest that adds a nav item and
     * registers a component for it gets drawer content with no code change. The
     * packaged entries that have bespoke markup above never reach this.
     */
    sidebarComponentId = computed(() => {
        const id = this.activeItem()?.id;
        if (!id)
            return null;
        const sidebar = this.extensions
            .resolve(EXTENSION_SLOTS.sidebar, this.ruleContext.context())
            .find((entry) => entry.id === id || entry.id === id.replace('.navbar.', '.sidebar.'));
        if (sidebar)
            return sidebar.componentId ?? sidebar.id;
        const byConvention = id.replace('.navbar.', '.sidebar.');
        return this.componentRegistry.has(byConvention) ? byConvention : null;
    }, ...(ngDevMode ? [{ debugName: "sidebarComponentId" }] : []));
    // Tasks
    taskService = inject(TaskService);
    currentUsername = inject(CURRENT_USERNAME);
    tasks = signal([], ...(ngDevMode ? [{ debugName: "tasks" }] : []));
    tasksLoading = signal(false, ...(ngDevMode ? [{ debugName: "tasksLoading" }] : []));
    tasksError = signal(null, ...(ngDevMode ? [{ debugName: "tasksError" }] : []));
    clipboardDocs = signal(readClipboardDocs(), ...(ngDevMode ? [{ debugName: "clipboardDocs" }] : []));
    clipboardEmpty = computed(() => this.clipboardDocs().length === 0, ...(ngDevMode ? [{ debugName: "clipboardEmpty" }] : []));
    clipboardCanPaste = computed(() => canPasteClipboard(this.clipboardDocs(), this.clipboardTargetService.target()), ...(ngDevMode ? [{ debugName: "clipboardCanPaste" }] : []));
    clipboardActionLoading = signal(false, ...(ngDevMode ? [{ debugName: "clipboardActionLoading" }] : []));
    favorites = signal([], ...(ngDevMode ? [{ debugName: "favorites" }] : []));
    favoritesLoading = signal(false, ...(ngDevMode ? [{ debugName: "favoritesLoading" }] : []));
    thumbnailMap = signal({}, ...(ngDevMode ? [{ debugName: "thumbnailMap" }] : []));
    // Recently Viewed
    recentlyViewed = signal([], ...(ngDevMode ? [{ debugName: "recentlyViewed" }] : []));
    recentlyViewedLoading = signal(false, ...(ngDevMode ? [{ debugName: "recentlyViewedLoading" }] : []));
    recentlyViewedError = signal(null, ...(ngDevMode ? [{ debugName: "recentlyViewedError" }] : []));
    recentlyViewedLoaded = false;
    // Expired Queue
    expiredDocs = signal([], ...(ngDevMode ? [{ debugName: "expiredDocs" }] : []));
    expiredLoading = signal(false, ...(ngDevMode ? [{ debugName: "expiredLoading" }] : []));
    expiredError = signal(null, ...(ngDevMode ? [{ debugName: "expiredError" }] : []));
    expiredLoaded = false;
    destroyRef = inject(DestroyRef);
    /** Tracks which user the drawer caches belong to — cleared on sign-out or user switch. */
    drawerSessionUser = null;
    constructor() {
        this.taskService.tasksChanged$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.loadTasks());
        effect(() => {
            const username = this.authService.username() ?? null;
            if (username !== this.drawerSessionUser) {
                this.clearUserScopedDrawerCaches();
                this.drawerSessionUser = username;
            }
        });
        effect(() => {
            const refreshTick = this.browseContext.treeRefreshTick();
            if (refreshTick > 0) {
                untracked(() => {
                    const item = this.activeItem();
                    if (item?.id === 'app.navbar.browse') {
                        this.refreshBrowseTree();
                    }
                    if (item?.path === '/personal-space') {
                        this.refreshPersonalSpaceTree();
                    }
                });
            }
        });
        effect(() => {
            const item = this.activeItem();
            if (item?.id === 'app.navbar.collections' && !this.collectionsLoaded) {
                this.loadCollections();
            }
            if (item?.id === 'app.navbar.assets') {
                this.loadAssetAggregations();
            }
            if (item?.id === 'app.navbar.tasks') {
                this.loadTasks();
            }
            if (item?.id === 'app.navbar.clipboard') {
                this.refreshClipboard();
            }
            if (item?.id === 'app.navbar.favorites') {
                this.loadFavorites();
            }
            if (item?.id === 'app.navbar.recentlyViewed' && !this.recentlyViewedLoaded) {
                this.loadRecentlyViewed();
            }
            if (item?.id === 'app.navbar.expiredQueue' && !this.expiredLoaded) {
                this.loadExpiredDocuments();
            }
            if (item?.id === 'app.navbar.personalSpace' && !this.personalSpaceLoaded) {
                this.loadPersonalSpaceTree();
            }
        });
        const onClipboardChanged = () => this.refreshClipboard();
        window.addEventListener('clipboard-changed', onClipboardChanged);
        const onFavoritesChanged = () => this.loadFavorites();
        window.addEventListener('favorites-changed', onFavoritesChanged);
        this.destroyRef.onDestroy(() => {
            window.removeEventListener('clipboard-changed', onClipboardChanged);
            window.removeEventListener('favorites-changed', onFavoritesChanged);
            this.revokeThumbnails();
        });
    }
    computeAssetAggregationsFromEntries(entries) {
        const aggregations = {};
        const typeMap = new Map();
        const mimeMap = new Map();
        for (const doc of entries) {
            typeMap.set(doc.type, (typeMap.get(doc.type) ?? 0) + 1);
            const fileContent = doc.properties['file:content'];
            const mime = fileContent?.['mime-type'];
            if (mime) {
                mimeMap.set(mime, (mimeMap.get(mime) ?? 0) + 1);
            }
        }
        if (typeMap.size > 0) {
            aggregations.system_primaryType_agg = {
                buckets: Array.from(typeMap.entries()).map(([key, docCount]) => ({ key, docCount })),
            };
        }
        if (mimeMap.size > 0) {
            aggregations.system_mimetype_agg = {
                buckets: Array.from(mimeMap.entries()).map(([key, docCount]) => ({ key, docCount })),
            };
        }
        return aggregations;
    }
    loadAssetAggregations() {
        this.assetService.searchAssets({ pageSize: 200 }).subscribe({
            next: (res) => {
                const aggregations = res.aggregations ?? this.computeAssetAggregationsFromEntries(res.entries ?? []);
                this.assetAggregationService.aggregations.set(aggregations);
                this.assetAggregationService.items.set((res.entries ?? []).map((entry) => ({
                    id: entry.uid,
                    title: entry.title,
                    type: entry.type,
                    icon: docTypeIcon(entry.type),
                })));
            },
            error: () => {
                this.assetAggregationService.aggregations.set({});
                this.assetAggregationService.items.set([]);
            },
        });
    }
    get isBrowse() {
        return this.activeItem()?.id === 'app.navbar.browse';
    }
    get isPersonalSpace() {
        return this.activeItem()?.id === 'app.navbar.personalSpace';
    }
    get isCollections() {
        return this.activeItem()?.id === 'app.navbar.collections';
    }
    get isAssets() {
        return this.activeItem()?.id === 'app.navbar.assets';
    }
    get isSearchFilters() {
        return this.activeItem()?.id === 'app.navbar.search';
    }
    get isClipboard() {
        return this.activeItem()?.id === 'app.navbar.clipboard';
    }
    get isSettings() {
        return this.activeItem()?.id === 'app.navbar.settings';
    }
    get isAdministration() {
        return this.activeItem()?.id === 'app.navbar.administration';
    }
    isAdminDrawerPathActive(path) {
        const url = this.router.url.split('?')[0];
        if (path === '/administration/users-groups') {
            return url === path || url.startsWith(`${path}/`);
        }
        return url === path;
    }
    onAdministrationItemClick(path) {
        this.navigateKeepDrawer.emit(path);
    }
    get isFavorites() {
        return this.activeItem()?.id === 'app.navbar.favorites';
    }
    get isRecentlyViewed() {
        return this.activeItem()?.id === 'app.navbar.recentlyViewed';
    }
    get isExpiredQueue() {
        return this.activeItem()?.id === 'app.navbar.expiredQueue';
    }
    onSettingsSignOut() {
        this.signOutSelected.emit();
    }
    get isTrash() {
        return this.activeItem()?.id === 'app.navbar.trash';
    }
    // ── Expired Queue ──
    loadExpiredDocuments() {
        this.expiredLoaded = true;
        this.expiredLoading.set(true);
        this.expiredError.set(null);
        this.docService.getExpiredDocuments(20).subscribe({
            next: (res) => {
                this.expiredDocs.set(res.entries);
                this.expiredLoading.set(false);
                this.loadThumbnails(res.entries);
            },
            error: () => {
                this.expiredError.set(this.translate.instant('app.message.failed-to-load-expired-documents'));
                this.expiredLoading.set(false);
                this.expiredLoaded = false;
            },
        });
    }
    refreshExpired() {
        this.expiredLoaded = false;
        this.loadExpiredDocuments();
    }
    openExpiredDoc(doc) {
        this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
    }
    expiredDate(doc) {
        const expired = doc.properties?.['dc:expired'];
        if (!expired)
            return '';
        // `formatDate`, not `inject(DatePipe)`. Listing `DatePipe` in `imports` makes it usable as
        // `| date` in the template; it does NOT provide it for injection, so injecting it threw
        // NG0201 in this component's constructor and took the app-shell header specs down with it.
        // `providers: [DatePipe]` would also work, but this needs no DI at all — `formatDate` is the
        // function `DatePipe.transform` delegates to, and it takes the locale as an argument.
        return formatDate(new Date(expired), 'mediumDate', this.locale);
    }
    // ── Recently Viewed ──
    loadRecentlyViewed() {
        this.recentlyViewedLoaded = true;
        this.recentlyViewedLoading.set(true);
        this.recentlyViewedError.set(null);
        const userId = this.authService.username() ?? 'Administrator';
        this.docService.getRecentlyViewed(userId, 20).subscribe({
            next: (res) => {
                this.recentlyViewed.set(res.entries);
                this.recentlyViewedLoading.set(false);
                this.loadThumbnails(res.entries);
            },
            error: () => {
                this.recentlyViewedError.set(this.translate.instant('app.message.failed-to-load-recently-viewed-documents'));
                this.recentlyViewedLoading.set(false);
                this.recentlyViewedLoaded = false;
            },
        });
    }
    refreshRecentlyViewed() {
        this.recentlyViewedLoaded = false;
        this.loadRecentlyViewed();
    }
    openRecentlyViewedDoc(doc) {
        if (isCollectionDocument(doc)) {
            this.navigateKeepDrawer.emit(documentNavigationUrl(doc));
            return;
        }
        if (isFolderishDocument(doc)) {
            this.navigateKeepDrawer.emit(`/browse${doc.path}`);
            return;
        }
        this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
    }
    docIcon(doc) {
        return docTypeIcon(doc.type);
    }
    /**
     * Localised by `Intl.RelativeTimeFormat`, which also covers the future case this used to
     * spell as `in ${label}` — a positive offset produces "in 3 days" in each language's own
     * word order. See `formatRelativeTime`.
     */
    relativeTime(dateStr) {
        return formatRelativeTime(dateStr, this.translate.currentLang);
    }
    // ── Collections ──
    loadCollections() {
        this.collectionsLoading.set(true);
        this.collectionService.getAll().subscribe({
            next: (res) => {
                this.collections.set(res.entries);
                this.collectionsLoading.set(false);
                this.collectionsLoaded = true;
                this.loadThumbnailsForIds(res.entries.map((d) => d.uid));
            },
            error: () => {
                this.collectionsLoading.set(false);
            },
        });
    }
    openCollection(col) {
        this.navigateKeepDrawer.emit(`/collections/${col.uid}`);
    }
    collectionOwner(doc) {
        return doc.properties?.['dc:creator'] ?? '';
    }
    collectionOwnerInitial(doc) {
        const owner = this.collectionOwner(doc);
        return owner ? owner.charAt(0).toUpperCase() : '?';
    }
    // ── Browse tree ──
    /** Reads the browse tree again, as after a paste, a create or a delete. */
    refreshBrowseTree() {
        this.browseTree()?.reload();
    }
    onBrowseTreeNavigate(doc) {
        const path = doc.path || '/';
        this.browseContext.setFromNuxeoPath(path);
        this.navigateKeepDrawer.emit(path === '/' ? '/browse' : documentNavigationUrl(doc));
    }
    isNodeActive(node) {
        const activePath = normalizeNuxeoPath(this.browseContext.contextPath());
        const nodePath = node.doc.path;
        if (nuxeoPathsEqualFlexible(nodePath, activePath)) {
            return true;
        }
        const activeSegments = nuxeoPathSegments(activePath);
        const nodeSegments = nuxeoPathSegments(nodePath);
        if (activeSegments.length <= nodeSegments.length) {
            return false;
        }
        const isAncestor = nodeSegments.every((segment, index) => segment === activeSegments[index]);
        if (!isAncestor) {
            return false;
        }
        if (!node.expanded || node.children.length === 0) {
            return true;
        }
        const hasVisibleDeeperMatch = node.children.some((child) => this.isNodeOrAncestorOfActivePath(child, activeSegments));
        return !hasVisibleDeeperMatch;
    }
    isNodeOrAncestorOfActivePath(node, activeSegments) {
        const nodeSegments = nuxeoPathSegments(node.doc.path);
        if (nodeSegments.length > activeSegments.length) {
            return false;
        }
        return nodeSegments.every((segment, index) => segment === activeSegments[index]);
    }
    clearUserScopedDrawerCaches() {
        this.browseTree()?.reload();
        this.collectionsLoaded = false;
        this.collections.set([]);
        this.collectionsLoading.set(false);
        this.recentlyViewedLoaded = false;
        this.recentlyViewed.set([]);
        this.recentlyViewedLoading.set(false);
        this.recentlyViewedError.set(null);
        this.expiredLoaded = false;
        this.expiredDocs.set([]);
        this.expiredLoading.set(false);
        this.expiredError.set(null);
        this.personalSpaceLoaded = false;
        this.personalSpaceNodes.set([]);
        this.personalSpaceLoading.set(false);
        this.personalSpaceError.set(null);
        this.favorites.set([]);
        this.favoritesLoading.set(false);
        this.tasks.set([]);
        this.tasksLoading.set(false);
        this.tasksError.set(null);
    }
    refreshPersonalSpaceTree() {
        this.personalSpaceLoaded = false;
        this.loadPersonalSpaceTree();
    }
    loadPersonalSpaceTree() {
        this.personalSpaceLoaded = true;
        this.personalSpaceLoading.set(true);
        this.personalSpaceError.set(null);
        this.browseService
            .getUserWorkspace()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (workspace) => {
                const rootNode = {
                    doc: workspace,
                    children: [],
                    expanded: true,
                    loaded: false,
                    loading: true,
                };
                this.personalSpaceNodes.set([rootNode]);
                this.personalSpaceLoading.set(false);
                this.browseService
                    .getNavTreeChildren(workspace)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: (res) => {
                        rootNode.children = this.toFolderNodes(res.entries ?? []);
                        rootNode.loaded = true;
                        rootNode.loading = false;
                        this.personalSpaceNodes.update((nodes) => [...nodes]);
                        this.prefetchChildStatus(rootNode.children);
                    },
                    error: () => {
                        rootNode.loading = false;
                        rootNode.loaded = true;
                        rootNode.children = [];
                        this.personalSpaceNodes.update((nodes) => [...nodes]);
                        this.personalSpaceError.set(this.translate.instant('app.message.failed-to-load-workspace-folders'));
                    },
                });
            },
            error: () => {
                this.personalSpaceError.set(this.translate.instant('app.message.failed-to-load-personal-workspace'));
                this.personalSpaceLoading.set(false);
                this.personalSpaceLoaded = false;
            },
        });
    }
    notifyActiveTreeChanged() {
        this.personalSpaceNodes.update((nodes) => [...nodes]);
    }
    toFolderNodes(entries) {
        return (entries ?? [])
            .filter((e) => isBrowsableNavNode(e))
            .map((doc) => ({
            doc,
            children: [],
            expanded: false,
            loaded: false,
            loading: false,
        }));
    }
    toggleNode(node) {
        if (node.expanded) {
            node.expanded = false;
            this.notifyActiveTreeChanged();
            return;
        }
        if (!node.loaded) {
            node.loading = true;
            this.notifyActiveTreeChanged();
            this.browseService
                .getNavTreeChildren(node.doc)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe({
                next: (res) => {
                    node.children = this.toFolderNodes(res.entries);
                    node.loaded = true;
                    node.loading = false;
                    node.expanded = true;
                    this.notifyActiveTreeChanged();
                    this.prefetchChildStatus(node.children);
                },
                error: () => {
                    node.loading = false;
                    node.loaded = true;
                    node.children = [];
                    this.notifyActiveTreeChanged();
                },
            });
        }
        else {
            node.expanded = true;
            this.notifyActiveTreeChanged();
        }
    }
    prefetchChildStatus(nodes) {
        const unloaded = nodes.filter((n) => !n.loaded);
        if (unloaded.length === 0)
            return;
        const checks$ = unloaded.map((n) => this.browseService.getNavTreeChildren(n.doc).pipe(catchError(() => of(null))));
        forkJoin(checks$)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((results) => {
            results.forEach((res, i) => {
                const node = unloaded[i];
                if (res) {
                    node.loaded = true;
                    node.children = this.toFolderNodes(res.entries ?? []);
                }
            });
            this.notifyActiveTreeChanged();
        });
    }
    navigateToFolder(node) {
        const nuxeoPath = node.doc.path;
        this.browseContext.setFromNuxeoPath(nuxeoPath);
        this.navigateKeepDrawer.emit(documentNavigationUrl(node.doc));
    }
    nodeLabel(node) {
        return node.doc.title;
    }
    hasChildren(node) {
        if (node.loading) {
            return true;
        }
        if (!node.loaded) {
            return true;
        }
        if (node.children.length > 0) {
            return true;
        }
        // Nuxeo Web UI keeps disclosure triangles on folderish nodes even when empty.
        return isFolderishDocument(node.doc);
    }
    // ── Tasks panel ──
    get isTasksPanel() {
        return this.activeItem()?.id === 'app.navbar.tasks';
    }
    loadTasks() {
        this.tasksLoading.set(true);
        this.tasksError.set(null);
        const userId = this.currentUsername() ?? 'Administrator';
        this.taskService.getUserTasks(userId, 50).subscribe({
            next: (entries) => {
                this.tasks.set(entries);
                this.tasksLoading.set(false);
            },
            error: () => {
                this.tasksError.set(this.translate.instant('tasks.message.failed-to-load-tasks'));
                this.tasksLoading.set(false);
            },
        });
    }
    selectTask(task) {
        this.itemSelected.emit('/tasks/' + task.id);
    }
    /** Highlights the row that matches the current /tasks/:taskId route. */
    isTaskSelected(task) {
        const path = this.router.url.split('?')[0];
        const m = /^\/tasks\/([^/]+)/.exec(path);
        return m ? m[1] === task.id : false;
    }
    /** Title row: directive when present (e.g. "Consolidate Review"), else task name. */
    taskPrimaryTitle(task) {
        if (task.directive) {
            const d = task.directive.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
            return d
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/\./g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
        }
        return this.taskLabel(task);
    }
    /** Relative due fragment only (pairs with the "Due"/"Overdue" prefix in the template). */
    dueRelativeOnly(task) {
        if (!task.dueDate)
            return '';
        const distance = taskDueDistance(task.dueDate);
        return this.translate.instant(drawerDueKey(distance), { count: distance.count });
    }
    /** Workflow as a single sentence-style line (e.g. "Parallel document review"). */
    taskWorkflowSentence(task) {
        const raw = (task.workflowTitle || task.workflowModelName || '').trim();
        if (!raw)
            return '';
        const key = raw.replace(/^wf\.\w+\./, '');
        const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\./g, ' ');
        const lower = spaced.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
    }
    taskLabel(task) {
        const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\./g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    isOverdue(task) {
        return !!task.dueDate && new Date(task.dueDate) < new Date();
    }
    // ── Clipboard ──
    refreshClipboard() {
        const docs = readClipboardDocs();
        this.clipboardDocs.set(docs);
        this.loadThumbnailsForIds(docs.map((d) => d.uid));
    }
    /**
     * Every document id currently displayed in any drawer panel.
     *
     * Computed on demand rather than cached, because the loaders' callbacks need the *current* answer: an
     * effect-maintained cache is written after change detection, so a response arriving in between would
     * be judged against a stale set and a legitimate thumbnail dropped.
     *
     * Five panels share one `thumbnailMap`, which is why this is a union rather than a per-panel ledger.
     * A sixth panel that forgets to appear here would reintroduce the leak, so it is listed in one place
     * with the loaders reading from it.
     */
    liveThumbnailIds() {
        return new Set([
            ...this.expiredDocs().map((d) => d.uid),
            ...this.recentlyViewed().map((d) => d.uid),
            ...this.collections().map((d) => d.uid),
            ...this.clipboardDocs().map((d) => d.uid),
            ...this.favorites().map((d) => d.uid),
        ]);
    }
    /**
     * Revokes and forgets thumbnails for documents no longer shown in any panel.
     *
     * `thumbnailMap` only ever grew. This drawer lives in the app shell for the whole session, so every
     * clipboard entry removed, every favourites or recently-viewed refresh, left its blob alive until the
     * tab closed — unbounded growth from ordinary use, not a leak that needed anything to go wrong. The
     * per-id revoke-before-replace already present only covers re-fetching the SAME id.
     */
    reconcileThumbnails() {
        const live = this.liveThumbnailIds();
        const map = this.thumbnailMap();
        const stale = Object.keys(map).filter((id) => !live.has(id));
        if (stale.length === 0)
            return;
        for (const id of stale) {
            const url = map[id];
            if (url)
                URL.revokeObjectURL(url);
        }
        this.thumbnailMap.update((current) => {
            const next = { ...current };
            for (const id of stale)
                delete next[id];
            return next;
        });
    }
    loadThumbnailsForIds(uids) {
        this.reconcileThumbnails();
        for (const uid of uids) {
            if (this.thumbnailMap()[uid])
                continue;
            this.detailService
                .fetchThumbnail(uid)
                .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
                .subscribe((blob) => {
                if (!blob)
                    return;
                // Dropped if this document left every panel while the request was in flight: minting here
                // would add a URL nothing renders and nothing revokes until the tab closes.
                if (!this.liveThumbnailIds().has(uid))
                    return;
                const url = URL.createObjectURL(blob);
                this.thumbnailMap.update((m) => {
                    const previous = m[uid];
                    if (previous && previous !== url)
                        URL.revokeObjectURL(previous);
                    return {
                        ...m,
                        [uid]: url,
                    };
                });
            });
        }
    }
    openClipboardDoc(doc) {
        this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
    }
    removeFromClipboard(doc) {
        const updated = this.clipboardDocs().filter((d) => d.uid !== doc.uid);
        this.clipboardDocs.set(updated);
        writeClipboardDocs(updated);
        window.dispatchEvent(new Event('clipboard-changed'));
    }
    clearClipboard() {
        this.clipboardDocs.set([]);
        writeClipboardDocs([]);
        window.dispatchEvent(new Event('clipboard-changed'));
    }
    copyClipboard() {
        this.executeClipboardAction('copy');
    }
    moveClipboard() {
        this.executeClipboardAction('move');
    }
    executeClipboardAction(action) {
        const target = this.clipboardTargetService.target();
        const uids = this.clipboardDocs().map((doc) => doc.uid);
        if (!target ||
            uids.length === 0 ||
            !this.clipboardCanPaste() ||
            this.clipboardActionLoading()) {
            return;
        }
        this.clipboardActionLoading.set(true);
        const request$ = action === 'copy'
            ? this.browseService.copyDocuments(uids, target.uid)
            : this.browseService.moveDocuments(uids, target.uid);
        request$
            .pipe(finalize(() => this.clipboardActionLoading.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (results) => {
                if (results.length === 0) {
                    this.snackBar.open(action === 'copy'
                        ? this.translate.instant('app.message.failed-to-copy-clipboard-items')
                        : this.translate.instant('app.message.failed-to-move-clipboard-items'), this.translate.instant('common.dismiss'), { duration: 4000 });
                    return;
                }
                const count = results.length;
                this.clearClipboard();
                this.browseContext.notifyClipboardPasteComplete({
                    targetUid: target.uid,
                    documents: results,
                    action,
                });
                this.browseContext.requestTreeRefresh();
                const verb = action === 'copy' ? 'Copied' : 'Moved';
                this.snackBar.open(`${verb} ${count} item${count === 1 ? '' : 's'} to ${target.title ?? 'folder'}.`, this.translate.instant('common.dismiss'), { duration: 4000 });
            },
            error: () => {
                this.snackBar.open(action === 'copy'
                    ? this.translate.instant('app.message.failed-to-copy-clipboard-items')
                    : this.translate.instant('app.message.failed-to-move-clipboard-items'), this.translate.instant('common.dismiss'), { duration: 4000 });
            },
        });
    }
    // ── Favorites ──
    loadFavorites() {
        const user = this.authService.username();
        if (!user)
            return;
        this.favoritesLoading.set(true);
        this.collectionService.getFavorites(user, 50).subscribe({
            next: (res) => {
                this.favorites.set(res.entries);
                this.favoritesLoading.set(false);
                this.loadThumbnails(res.entries);
            },
            error: () => this.favoritesLoading.set(false),
        });
    }
    /**
     * Blob URLs currently owned by the drawer.
     *
     * Both loaders (`loadThumbnailsForIds` for clipboard and `loadThumbnails` for favourites) write
     * raw object-URL strings into `thumbnailMap`, so teardown can revoke the map's current values
     * directly on destroy.
     */
    revokeThumbnails() {
        for (const url of Object.values(this.thumbnailMap()))
            if (url)
                URL.revokeObjectURL(url);
    }
    loadThumbnails(docs) {
        this.reconcileThumbnails();
        for (const doc of docs) {
            if (this.thumbnailMap()[doc.uid])
                continue;
            this.detailService
                .fetchThumbnail(doc.uid)
                .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
                .subscribe((blob) => {
                if (!blob)
                    return;
                // Same guard as the id-based loader above.
                if (!this.liveThumbnailIds().has(doc.uid))
                    return;
                const url = URL.createObjectURL(blob);
                this.thumbnailMap.update((m) => {
                    const previous = m[doc.uid];
                    if (previous && previous !== url)
                        URL.revokeObjectURL(previous);
                    return {
                        ...m,
                        [doc.uid]: url,
                    };
                });
            });
        }
    }
    openFavoriteDoc(doc) {
        this.navigateKeepDrawer.emit(`/doc/${doc.uid}`);
    }
    removeFromFavorites(doc) {
        this.detailService.removeFromFavorites(doc.uid).subscribe({
            next: () => {
                this.favorites.update((list) => list.filter((d) => d.uid !== doc.uid));
                window.dispatchEvent(new Event('favorites-changed'));
            },
        });
    }
    favoriteContributor(doc) {
        return doc.properties?.['dc:lastContributor'] ?? '';
    }
    favoriteContributorInitial(doc) {
        const c = this.favoriteContributor(doc);
        return c ? c.charAt(0).toUpperCase() : '?';
    }
    static ɵfac = function NavDrawerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NavDrawerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NavDrawerComponent, selectors: [["app-nav-drawer"]], viewQuery: function NavDrawerComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.browseTree, NxsDocumentTreeComponent, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, inputs: { activeItem: [1, "activeItem"] }, outputs: { itemSelected: "itemSelected", navigateKeepDrawer: "navigateKeepDrawer", signOutSelected: "signOutSelected" }, decls: 3, vars: 1, consts: [["folderTpl", ""], [1, "drawer-header"], ["role", "heading", "aria-level", "2", 1, "drawer-title"], ["mat-icon-button", "", 1, "refresh-btn", 3, "matTooltip"], [1, "folder-tree"], [1, "collections-panel"], ["componentId", "app.sidebar.assets"], ["componentId", "app.sidebar.searchFilters", 1, "search-filters-outlet"], ["componentId", "app.sidebar.trashFilters"], [1, "tasks-panel-wrap"], [1, "favorites-panel"], [1, "clipboard-panel"], [1, "settings-panel"], [3, "componentId"], [1, "drawer-empty"], ["mat-icon-button", "", 1, "refresh-btn", 3, "click", "matTooltip"], [3, "navigate", "label", "currentPath"], [1, "tree-loading"], [1, "tree-empty", "error"], [1, "tree-empty"], [1, "tree-list"], ["diameter", "24"], ["mat-stroked-button", "", "type", "button", 3, "click"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "rv-list"], [1, "empty-icon"], ["type", "button", 1, "rv-card"], ["type", "button", 1, "rv-card", 3, "click"], [1, "rv-thumb"], ["alt", "", 1, "rv-thumb-img", 3, "src"], [1, "rv-thumb-icon"], [1, "rv-info"], [1, "rv-title"], [1, "rv-meta"], [1, "rv-type"], [1, "rv-sep"], [1, "rv-time"], [1, "expired-list"], ["type", "button", 1, "expired-card"], ["type", "button", 1, "expired-card", 3, "click"], [1, "expired-thumb"], ["alt", "", 1, "expired-thumb-img", 3, "src"], [1, "expired-thumb-icon"], [1, "expired-info"], [1, "expired-title"], [1, "expired-meta"], [1, "expired-type"], [1, "expired-sep"], [1, "expired-date"], [1, "expired-warning-icon"], [1, "collections-list"], ["type", "button", 1, "collection-card"], ["type", "button", 1, "collection-card", 3, "click"], ["alt", "", 1, "collection-thumb", 3, "src"], [1, "collection-thumb-placeholder"], [1, "collection-card-body"], [1, "collection-card-title"], [1, "collection-card-date"], [1, "collection-card-owner"], [1, "owner-avatar"], ["mat-stroked-button", "", 3, "click"], [1, "tasks-panel-body"], [1, "task-list", "task-list--inbox"], [1, "tasks-drawer-footer"], ["routerLink", "/dashboard", 1, "tasks-dashboard-link"], ["type", "button", 1, "task-item", 3, "active"], ["type", "button", 1, "task-item", 3, "click"], [1, "task-body"], [1, "task-title-line"], [1, "task-doc-line"], [1, "task-due-line"], [1, "task-workflow-line"], [1, "task-due-prefix"], [1, "task-due-value"], [1, "favorites-list"], [1, "clipboard-empty-icon"], [1, "clipboard-hint"], [1, "favorite-card"], ["type", "button", 1, "favorite-card-main", 3, "click"], ["alt", "", 1, "favorite-thumb", 3, "src"], [1, "favorite-thumb-placeholder"], [1, "favorite-card-title"], ["mat-icon-button", "", 1, "favorite-card-remove", 3, "click", "matTooltip"], [1, "clipboard-list"], [1, "clipboard-card"], [1, "clipboard-footer"], [1, "clipboard-tip"], [1, "clipboard-loading"], [1, "clipboard-primary-actions"], ["mat-stroked-button", "", "type", "button", 1, "clipboard-action-btn", 3, "click", "disabled"], ["type", "button", 1, "clipboard-card-main", 3, "click"], ["alt", "", 1, "clipboard-thumb", 3, "src"], [1, "clipboard-thumb-placeholder"], [1, "clipboard-card-title"], ["mat-icon-button", "", 1, "clipboard-card-remove", 3, "click", "matTooltip"], ["type", "button", "routerLinkActive", "settings-item--active", 1, "settings-item", 3, "routerLink", "routerLinkActiveOptions"], ["type", "button", 1, "settings-item", 3, "click"], ["type", "button", 1, "settings-item", 3, "settings-item--active"], [1, "tree-node"], ["type", "button", 1, "tree-toggle"], [1, "tree-toggle-spacer"], ["type", "button", 1, "tree-label", 3, "click"], ["type", "button", 1, "tree-toggle", 3, "click"], ["diameter", "14"], [1, "tree-arrow", 3, "tree-arrow--expanded"], [1, "tree-arrow"]], template: function NavDrawerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NavDrawerComponent_Conditional_0_Template, 24, 13);
            i0.ɵɵtemplate(1, NavDrawerComponent_ng_template_1_Template, 6, 7, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            let tmp_1_0;
            i0.ɵɵconditional((tmp_1_0 = ctx.activeItem()) ? 0 : -1, tmp_1_0);
        } }, dependencies: [NgTemplateOutlet,
            RouterLink,
            RouterLinkActive,
            MatIconModule, i1.MatIcon, MatProgressSpinnerModule, i2.MatProgressSpinner, MatButtonModule, i3.MatButton, i3.MatIconButton, MatTooltipModule, i4.MatTooltip, MatSnackBarModule,
            ExtensionOutletComponent,
            NxsDocumentTreeComponent,
            DocTypeLabelPipe,
            DescriptorLabelPipe,
            DatePipe,
            TranslatePipe], styles: ["@mixin hide-scrollbar {\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  width: 280px;\n  max-width: 100%;\n  overflow: hidden;\n  \n\n  background: var(--mat-sys-surface);\n  border-right: 1px solid var(--mat-sys-outline-variant);\n  color: var(--mat-sys-on-surface);\n}\n\n  {\n  .mat-mdc-tooltip {\n    pointer-events: auto !important;\n  }\n\n  .mdc-tooltip {\n    z-index: 10000 !important;\n    position: fixed !important;\n  }\n\n  .mdc-tooltip__surface {\n    white-space: nowrap !important;\n  }\n}\n\n.drawer-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 16px 8px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n}\n\n.drawer-title[_ngcontent-%COMP%] {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n}\n\n.drawer-header--tasks[_ngcontent-%COMP%] {\n  padding-bottom: 14px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n}\n\n.drawer-title--tasks[_ngcontent-%COMP%] {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n  letter-spacing: -0.02em;\n}\n\n.refresh-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  border-radius: 50%;\n  background: transparent;\n  cursor: pointer;\n  color: var(--mat-sys-on-surface-variant);\n  transition:\n    background 0.15s,\n    color 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-highest);\n    color: var(--mat-sys-primary);\n  }\n\n  mat-icon {\n    font-size: 20px;\n    width: 20px;\n    height: 20px;\n  }\n}\n\n\n\n.search-filters-outlet[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.drawer-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding-top: 0;\n  @include hide-scrollbar;\n}\n\n.placeholder-text[_ngcontent-%COMP%] {\n  font-size: 14px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.drawer-empty[_ngcontent-%COMP%] {\n  padding: 24px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-size: 13px;\n}\n\n.settings-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  padding: 8px 0;\n}\n\n.settings-item[_ngcontent-%COMP%] {\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  padding: 14px 16px;\n  cursor: pointer;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  color: var(--mat-sys-on-surface);\n  text-decoration: none;\n  display: block;\n  box-sizing: border-box;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-highest);\n    color: var(--mat-sys-on-surface);\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &.settings-item--active {\n    background: var(--mat-sys-primary-container, #e2dfff);\n    color: var(--mat-sys-on-primary-container, #3e3b92);\n    font-weight: 600;\n  }\n}\n\n//[_ngcontent-%COMP%]   Folder[_ngcontent-%COMP%]   tree[_ngcontent-%COMP%]   styles\n.folder-tree[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding-top: 4px;\n  @include hide-scrollbar;\n}\n\n.tree-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 24px 0;\n}\n\n.tree-empty[_ngcontent-%COMP%] {\n  padding: 24px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-size: 13px;\n}\n\n.tree-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 4px 0;\n  padding-top: 0;\n}\n\n.tree-node[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  height: 34px;\n  padding-right: 8px;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.tree-toggle[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  flex-shrink: 0;\n}\n\n.tree-toggle-spacer[_ngcontent-%COMP%] {\n  display: inline-block;\n  width: 22px;\n  flex-shrink: 0;\n}\n\n.tree-arrow[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant);\n  transition: transform 0.15s ease;\n}\n\n.tree-arrow--expanded[_ngcontent-%COMP%] {\n  transform: rotate(90deg);\n}\n\n.tree-label[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  border: none;\n  background: none;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n  cursor: pointer;\n  padding: 2px 4px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-align: left;\n\n  &:hover {\n    color: var(--mat-sys-primary);\n  }\n\n  &--active {\n    color: var(--mat-sys-primary);\n    font-weight: 600;\n    background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);\n    border-radius: 4px;\n  }\n}\n\n//[_ngcontent-%COMP%]   Recently[_ngcontent-%COMP%]   Viewed[_ngcontent-%COMP%]   list\n.rv-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.rv-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.rv-thumb[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.rv-thumb-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.rv-thumb-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-primary);\n}\n\n.rv-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n.rv-title[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  line-height: 1.4;\n}\n\n.rv-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-top: 2px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.rv-type[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n\n\n.rv-sep[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.rv-time[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n//[_ngcontent-%COMP%]   Expired[_ngcontent-%COMP%]   Queue[_ngcontent-%COMP%]   panel\n.expired-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.expired-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: #fff3e0;\n  }\n}\n\n.expired-thumb[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #fff3e0;\n  border: 1px solid #ffe0b2;\n}\n\n.expired-thumb-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.expired-thumb-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #ef6c00;\n}\n\n.expired-info[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n}\n\n.expired-title[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  line-height: 1.4;\n}\n\n.expired-meta[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-top: 2px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.expired-type[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.expired-sep[_ngcontent-%COMP%] {\n  color: var(--mat-sys-outline);\n}\n\n.expired-date[_ngcontent-%COMP%] {\n  color: #ef6c00;\n  font-weight: 500;\n}\n\n.expired-warning-icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #ff9800;\n}\n\n//[_ngcontent-%COMP%]   Collections[_ngcontent-%COMP%]   panel\n.collections-panel[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.collections-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n.collection-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  cursor: pointer;\n  border: none;\n  background: transparent;\n  text-align: left;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.collection-thumb[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.collection-thumb-placeholder[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: var(--mat-sys-on-surface-variant);\n  }\n}\n\n.collection-card-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.collection-card-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.collection-card-date[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.collection-card-owner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n  margin-top: 2px;\n}\n\n.owner-avatar[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: var(--mat-sys-primary);\n  color: var(--mat-sys-on-primary);\n  font-size: 10px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n\n\n\n//[_ngcontent-%COMP%]   Clipboard[_ngcontent-%COMP%]   panel\n.clipboard-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.clipboard-empty-icon[_ngcontent-%COMP%] {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  color: var(--mat-sys-on-surface-variant);\n  margin-bottom: 8px;\n}\n\n.clipboard-hint[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant);\n  margin-top: 4px;\n  max-width: 200px;\n  text-align: center;\n}\n\n.clipboard-footer[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  flex-shrink: 0;\n  width: 100%;\n  box-sizing: border-box;\n  padding: 10px 12px 12px;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n  overflow: hidden;\n}\n\n.clipboard-primary-actions[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n  width: 100%;\n  min-width: 0;\n}\n\n.clipboard-action-btn[_ngcontent-%COMP%] {\n  width: 100%;\n  min-width: 0 !important;\n  max-width: 100%;\n  font-size: 12px !important;\n  min-height: 36px;\n  padding: 0 6px !important;\n  overflow: hidden;\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    margin-right: 4px;\n    flex-shrink: 0;\n  }\n}\n\n.clipboard-tip[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.4;\n  color: var(--mat-sys-on-surface-variant);\n  text-align: center;\n  word-wrap: break-word;\n  overflow-wrap: anywhere;\n}\n\n.clipboard-loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 4px 0;\n}\n\n.clipboard-list[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  min-width: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.clipboard-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  min-width: 0;\n  padding: 0 8px 0 0;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.clipboard-card-main[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 8px 10px 16px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  min-width: 0;\n  text-align: left;\n}\n\n.clipboard-thumb[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.clipboard-thumb-placeholder[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.empty-icon[_ngcontent-%COMP%] {\n  font-size: 32px;\n  width: 32px;\n  height: 32px;\n  color: var(--mat-sys-outline);\n}\n\n.tasks-panel-wrap[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.tasks-panel-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n\n.task-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  @include hide-scrollbar;\n}\n\n\n\n.task-list--inbox[_ngcontent-%COMP%] {\n  padding: 0;\n}\n\n.task-list--inbox[_ngcontent-%COMP%]   .task-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: stretch;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  background: var(--mat-sys-surface);\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n  transition:\n    background 0.15s ease,\n    box-shadow 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n\n  &.active {\n    background: var(--mat-sys-surface);\n    box-shadow: inset 4px 0 0 0 var(--mat-sys-primary);\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n.task-list--inbox[_ngcontent-%COMP%]   .task-body[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  padding: 14px 16px;\n}\n\n.task-title-line[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n  line-height: 1.35;\n  letter-spacing: -0.01em;\n}\n\n.task-doc-line[_ngcontent-%COMP%] {\n  margin-top: 4px;\n  font-size: 12px;\n  font-weight: 400;\n  color: var(--mat-sys-on-surface-variant);\n  line-height: 1.35;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.task-due-line[_ngcontent-%COMP%] {\n  margin-top: 8px;\n  font-size: 12px;\n  line-height: 1.4;\n}\n\n.task-due-prefix[_ngcontent-%COMP%] {\n  color: var(--mat-sys-outline);\n  margin-right: 4px;\n}\n\n.task-due-value[_ngcontent-%COMP%] {\n  font-weight: 600;\n}\n\n.task-due-value--soon[_ngcontent-%COMP%] {\n  color: var(--mat-sys-tertiary);\n}\n\n.task-due-value--overdue[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error);\n}\n\n.task-workflow-line[_ngcontent-%COMP%] {\n  margin-top: 6px;\n  font-size: 12px;\n  font-weight: 400;\n  color: var(--mat-sys-on-surface-variant);\n  line-height: 1.4;\n}\n\n.tasks-drawer-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  padding: 10px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n}\n\n.tasks-dashboard-link[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--mat-sys-primary);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.clipboard-card-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.clipboard-card-remove[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 28px !important;\n  height: 28px !important;\n  line-height: 28px !important;\n  color: var(--mat-sys-on-surface-variant);\n\n  &:hover {\n    color: var(--mat-sys-error);\n  }\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}\n\n//[_ngcontent-%COMP%]   Favorites[_ngcontent-%COMP%]   panel\n.favorites-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.favorites-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.favorite-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  padding: 0 8px 0 0;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.favorite-card-main[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 8px 8px 16px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  min-width: 0;\n  text-align: left;\n}\n\n.favorite-thumb[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.favorite-thumb-placeholder[_ngcontent-%COMP%] {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: var(--mat-sys-on-surface-variant);\n  }\n}\n\n.favorite-card-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.favorite-card-remove[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 28px !important;\n  height: 28px !important;\n  line-height: 28px !important;\n  color: var(--mat-sys-on-surface-variant);\n\n  &:hover {\n    color: var(--mat-sys-error);\n  }\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NavDrawerComponent, [{
        type: Component,
        args: [{ selector: 'app-nav-drawer', standalone: true, imports: [
                    DocTypeLabelPipe,
                    DescriptorLabelPipe,
                    NgTemplateOutlet,
                    DatePipe,
                    RouterLink,
                    RouterLinkActive,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatButtonModule,
                    MatTooltipModule,
                    MatSnackBarModule,
                    TranslatePipe,
                    ExtensionOutletComponent,
                    NxsDocumentTreeComponent,
                ], template: "@if (activeItem(); as item) {\n  <div class=\"drawer-header\" [class.drawer-header--tasks]=\"isTasksPanel\">\n    <div\n      class=\"drawer-title\"\n      [class.drawer-title--tasks]=\"isTasksPanel\"\n      role=\"heading\"\n      aria-level=\"2\"\n    >\n      {{ item | descriptorLabel }}\n    </div>\n    @if (isTasksPanel) {\n      <button\n        mat-icon-button\n        (click)=\"loadTasks()\"\n        [matTooltip]=\"'nav.refresh' | translate\"\n        [attr.aria-label]=\"'nav.refresh' | translate\"\n        class=\"refresh-btn\"\n      >\n        <mat-icon>refresh</mat-icon>\n      </button>\n    }\n    @if (isRecentlyViewed) {\n      <button\n        mat-icon-button\n        (click)=\"refreshRecentlyViewed()\"\n        [matTooltip]=\"'nav.refresh' | translate\"\n        [attr.aria-label]=\"'nav.refresh' | translate\"\n        class=\"refresh-btn\"\n      >\n        <mat-icon>refresh</mat-icon>\n      </button>\n    }\n    @if (isExpiredQueue) {\n      <button\n        mat-icon-button\n        (click)=\"refreshExpired()\"\n        [matTooltip]=\"'nav.refresh' | translate\"\n        [attr.aria-label]=\"'nav.refresh' | translate\"\n        class=\"refresh-btn\"\n      >\n        <mat-icon>refresh</mat-icon>\n      </button>\n    }\n    @if (isBrowse) {\n      <button\n        mat-icon-button\n        (click)=\"refreshBrowseTree()\"\n        [matTooltip]=\"'nav.refresh' | translate\"\n        [attr.aria-label]=\"'nav.refresh' | translate\"\n        class=\"refresh-btn\"\n      >\n        <mat-icon>refresh</mat-icon>\n      </button>\n    }\n    @if (isPersonalSpace) {\n      <button\n        mat-icon-button\n        (click)=\"refreshPersonalSpaceTree()\"\n        [matTooltip]=\"'nav.refresh' | translate\"\n        [attr.aria-label]=\"'nav.refresh' | translate\"\n        class=\"refresh-btn\"\n      >\n        <mat-icon>refresh</mat-icon>\n      </button>\n    }\n  </div>\n\n  @if (isBrowse) {\n    <div class=\"folder-tree\">\n      <nxs-document-tree\n        [label]=\"'nav.tree.label' | translate\"\n        [currentPath]=\"browseTreePath()\"\n        (navigate)=\"onBrowseTreeNavigate($event)\"\n      />\n    </div>\n  } @else if (isPersonalSpace) {\n    <div class=\"folder-tree\">\n      @if (personalSpaceLoading()) {\n        <div class=\"tree-loading\">\n          <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n        </div>\n      } @else if (personalSpaceError()) {\n        <div class=\"tree-empty error\">\n          <span>{{ personalSpaceError() }}</span>\n          <button mat-stroked-button type=\"button\" (click)=\"refreshPersonalSpaceTree()\">\n            {{ 'nav.tree.retry' | translate }}\n          </button>\n        </div>\n      } @else if (personalSpaceNodes().length === 0) {\n        <div class=\"tree-empty\">{{ 'nav.folders.empty' | translate }}</div>\n      } @else {\n        <div class=\"tree-list\">\n          @for (node of personalSpaceNodes(); track node.doc.uid) {\n            <ng-container *ngTemplateOutlet=\"folderTpl; context: { $implicit: node, depth: 0 }\" />\n          }\n        </div>\n      }\n    </div>\n  } @else if (isRecentlyViewed) {\n    <!-- Recently Viewed panel -->\n    @if (recentlyViewedLoading()) {\n      <div class=\"tree-loading\">\n        <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n      </div>\n    } @else if (recentlyViewedError()) {\n      <div class=\"tree-empty error\">{{ recentlyViewedError() }}</div>\n    } @else if (recentlyViewed().length === 0) {\n      <div class=\"tree-empty\">\n        <mat-icon class=\"empty-icon\">visibility_off</mat-icon>\n        <span>{{ 'nav.recent.empty' | translate }}</span>\n      </div>\n    } @else {\n      <div class=\"rv-list\">\n        @for (doc of recentlyViewed(); track doc.uid) {\n          <button class=\"rv-card\" (click)=\"openRecentlyViewedDoc(doc)\" type=\"button\">\n            <div class=\"rv-thumb\">\n              @if (thumbnailMap()[doc.uid]; as thumbUrl) {\n                <img [src]=\"thumbUrl\" alt=\"\" class=\"rv-thumb-img\" />\n              } @else {\n                <mat-icon class=\"rv-thumb-icon\">{{ docIcon(doc) }}</mat-icon>\n              }\n            </div>\n            <div class=\"rv-info\">\n              <span class=\"rv-title\">{{ doc.title }}</span>\n              <div class=\"rv-meta\">\n                <span class=\"rv-type\">{{ doc.type | docTypeLabel }}</span>\n                <span class=\"rv-sep\">&middot;</span>\n                <span class=\"rv-time\">{{ relativeTime(doc.lastModified) }}</span>\n              </div>\n            </div>\n          </button>\n        }\n      </div>\n    }\n  } @else if (isExpiredQueue) {\n    @if (expiredLoading()) {\n      <div class=\"tree-loading\">\n        <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n      </div>\n    } @else if (expiredError()) {\n      <div class=\"tree-empty error\">{{ expiredError() }}</div>\n    } @else if (expiredDocs().length === 0) {\n      <div class=\"tree-empty\">\n        <mat-icon class=\"empty-icon\">timer_off</mat-icon>\n        <span>{{ 'nav.expired.empty' | translate }}</span>\n      </div>\n    } @else {\n      <div class=\"expired-list\">\n        @for (doc of expiredDocs(); track doc.uid) {\n          <button class=\"expired-card\" (click)=\"openExpiredDoc(doc)\" type=\"button\">\n            <div class=\"expired-thumb\">\n              @if (thumbnailMap()[doc.uid]; as thumbUrl) {\n                <img [src]=\"thumbUrl\" alt=\"\" class=\"expired-thumb-img\" />\n              } @else {\n                <mat-icon class=\"expired-thumb-icon\">{{ docIcon(doc) }}</mat-icon>\n              }\n            </div>\n            <div class=\"expired-info\">\n              <span class=\"expired-title\">{{ doc.title }}</span>\n              <div class=\"expired-meta\">\n                <span class=\"expired-type\">{{ doc.type | docTypeLabel }}</span>\n                <span class=\"expired-sep\">&middot;</span>\n                <span class=\"expired-date\">{{\n                  'shell.expired-on' | translate: { date: expiredDate(doc) }\n                }}</span>\n              </div>\n            </div>\n            <mat-icon class=\"expired-warning-icon\">warning</mat-icon>\n          </button>\n        }\n      </div>\n    }\n  } @else if (isCollections) {\n    <div class=\"collections-panel\">\n      @if (collectionsLoading()) {\n        <div class=\"tree-loading\">\n          <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n        </div>\n      } @else if (collections().length === 0) {\n        <div class=\"tree-empty\">{{ 'nav.collections.empty' | translate }}</div>\n      } @else {\n        <div class=\"collections-list\">\n          @for (col of collections(); track col.uid) {\n            <button class=\"collection-card\" (click)=\"openCollection(col)\" type=\"button\">\n              @if (thumbnailMap()[col.uid]; as thumb) {\n                <img [src]=\"thumb\" alt=\"\" class=\"collection-thumb\" />\n              } @else {\n                <div class=\"collection-thumb-placeholder\">\n                  <mat-icon>collections_bookmark</mat-icon>\n                </div>\n              }\n              <div class=\"collection-card-body\">\n                <span class=\"collection-card-title\">{{ col.title }}</span>\n                <span class=\"collection-card-date\">{{\n                  'shell.last-modified-on'\n                    | translate: { date: col.lastModified | date: 'mediumDate' }\n                }}</span>\n                <span class=\"collection-card-owner\">\n                  <span class=\"owner-avatar\">{{ collectionOwnerInitial(col) }}</span>\n                  {{ collectionOwner(col) }}\n                </span>\n              </div>\n            </button>\n          }\n        </div>\n      }\n    </div>\n  } @else if (isAssets) {\n    <lib-extension-outlet componentId=\"app.sidebar.assets\" />\n  } @else if (isSearchFilters) {\n    <lib-extension-outlet class=\"search-filters-outlet\" componentId=\"app.sidebar.searchFilters\" />\n  } @else if (isTrash) {\n    <lib-extension-outlet componentId=\"app.sidebar.trashFilters\" />\n  } @else if (isTasksPanel) {\n    <div class=\"tasks-panel-wrap\">\n      @if (tasksLoading()) {\n        <div class=\"tree-loading\">\n          <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n        </div>\n      } @else if (tasksError()) {\n        <div class=\"tree-empty error\">\n          <span>{{ tasksError() }}</span>\n          <button mat-stroked-button (click)=\"loadTasks()\">\n            {{ 'nav.tasks.retry' | translate }}\n          </button>\n        </div>\n      } @else {\n        <div class=\"tasks-panel-body\">\n          @if (tasks().length === 0) {\n            <div class=\"tree-empty\">\n              <mat-icon class=\"empty-icon\">task_alt</mat-icon>\n              <span>{{ 'nav.tasks.empty' | translate }}</span>\n            </div>\n          } @else {\n            <div class=\"task-list task-list--inbox\">\n              @for (task of tasks(); track task.id) {\n                <button\n                  type=\"button\"\n                  class=\"task-item\"\n                  [class.active]=\"isTaskSelected(task)\"\n                  (click)=\"selectTask(task)\"\n                >\n                  <div class=\"task-body\">\n                    <div class=\"task-title-line\">{{ taskPrimaryTitle(task) }}</div>\n                    @if (task.targetDocTitle) {\n                      <div class=\"task-doc-line\">{{ task.targetDocTitle }}</div>\n                    }\n                    @if (task.dueDate) {\n                      <div class=\"task-due-line\">\n                        <span class=\"task-due-prefix\">{{\n                          isOverdue(task)\n                            ? ('shell.overdue' | translate)\n                            : ('shell.due' | translate)\n                        }}</span>\n                        <span\n                          class=\"task-due-value\"\n                          [class.task-due-value--soon]=\"!isOverdue(task)\"\n                          [class.task-due-value--overdue]=\"isOverdue(task)\"\n                        >\n                          {{ dueRelativeOnly(task) }}\n                        </span>\n                      </div>\n                    }\n                    @if (taskWorkflowSentence(task); as wfLine) {\n                      <div class=\"task-workflow-line\">{{ wfLine }}</div>\n                    }\n                  </div>\n                </button>\n              }\n            </div>\n          }\n        </div>\n        <div class=\"tasks-drawer-footer\">\n          <a routerLink=\"/dashboard\" class=\"tasks-dashboard-link\">{{\n            'nav.tasks.dashboard' | translate\n          }}</a>\n        </div>\n      }\n    </div>\n  } @else if (isFavorites) {\n    <div class=\"favorites-panel\">\n      @if (favoritesLoading()) {\n        <div class=\"tree-loading\">\n          <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n        </div>\n      } @else if (favorites().length === 0) {\n        <div class=\"tree-empty\">\n          <mat-icon class=\"clipboard-empty-icon\">star_border</mat-icon>\n          <p>{{ 'nav.favorites.empty' | translate }}</p>\n          <span class=\"clipboard-hint\">{{ 'nav.favorites.hint' | translate }}</span>\n        </div>\n      } @else {\n        <div class=\"favorites-list\">\n          @for (doc of favorites(); track doc.uid) {\n            <div class=\"favorite-card\">\n              <button class=\"favorite-card-main\" (click)=\"openFavoriteDoc(doc)\" type=\"button\">\n                @if (thumbnailMap()[doc.uid]; as thumb) {\n                  <img [src]=\"thumb\" alt=\"\" class=\"favorite-thumb\" />\n                } @else {\n                  <div class=\"favorite-thumb-placeholder\">\n                    <mat-icon>insert_drive_file</mat-icon>\n                  </div>\n                }\n                <span class=\"favorite-card-title\">{{ doc.title }}</span>\n              </button>\n              <button\n                mat-icon-button\n                class=\"favorite-card-remove\"\n                [matTooltip]=\"'nav.favorites.remove' | translate\"\n                [attr.aria-label]=\"'nav.favorites.remove' | translate\"\n                (click)=\"removeFromFavorites(doc)\"\n              >\n                <mat-icon>close</mat-icon>\n              </button>\n            </div>\n          }\n        </div>\n      }\n    </div>\n  } @else if (isClipboard) {\n    <div class=\"clipboard-panel\">\n      @if (clipboardEmpty()) {\n        <div class=\"tree-empty\">\n          <mat-icon class=\"clipboard-empty-icon\">content_paste</mat-icon>\n          <p>{{ 'nav.clipboard.empty' | translate }}</p>\n          <span class=\"clipboard-hint\">{{ 'nav.clipboard.hint' | translate }}</span>\n        </div>\n      } @else {\n        <div class=\"clipboard-list\">\n          @for (doc of clipboardDocs(); track doc.uid) {\n            <div class=\"clipboard-card\">\n              <button class=\"clipboard-card-main\" (click)=\"openClipboardDoc(doc)\" type=\"button\">\n                @if (thumbnailMap()[doc.uid]; as thumb) {\n                  <img [src]=\"thumb\" alt=\"\" class=\"clipboard-thumb\" />\n                } @else {\n                  <div class=\"clipboard-thumb-placeholder\">\n                    <mat-icon>description</mat-icon>\n                  </div>\n                }\n                <span class=\"clipboard-card-title\">{{ doc.title }}</span>\n              </button>\n              <button\n                mat-icon-button\n                class=\"clipboard-card-remove\"\n                [matTooltip]=\"'nav.clipboard.remove' | translate\"\n                [attr.aria-label]=\"'nav.clipboard.remove' | translate\"\n                (click)=\"removeFromClipboard(doc)\"\n              >\n                <mat-icon>close</mat-icon>\n              </button>\n            </div>\n          }\n        </div>\n        <div class=\"clipboard-footer\">\n          <p class=\"clipboard-tip\">{{ 'nav.clipboard.tip' | translate }}</p>\n          @if (clipboardActionLoading()) {\n            <div class=\"clipboard-loading\">\n              <mat-spinner diameter=\"24\" [attr.aria-label]=\"'nav.loading' | translate\" />\n            </div>\n          }\n          <div class=\"clipboard-primary-actions\">\n            <button\n              mat-stroked-button\n              type=\"button\"\n              class=\"clipboard-action-btn\"\n              [disabled]=\"!clipboardCanPaste() || clipboardActionLoading()\"\n              (click)=\"copyClipboard()\"\n            >\n              <mat-icon>content_copy</mat-icon>\n              {{ 'nav.clipboard.copy' | translate }}\n            </button>\n            <button\n              mat-stroked-button\n              type=\"button\"\n              class=\"clipboard-action-btn\"\n              [disabled]=\"!clipboardCanPaste() || clipboardActionLoading()\"\n              (click)=\"moveClipboard()\"\n            >\n              <mat-icon>drive_file_move</mat-icon>\n              {{ 'nav.clipboard.move' | translate }}\n            </button>\n          </div>\n        </div>\n      }\n    </div>\n  } @else if (isSettings) {\n    <div class=\"settings-panel\">\n      @for (settingsItem of settingsItems(); track settingsItem.path) {\n        <button\n          type=\"button\"\n          class=\"settings-item\"\n          [routerLink]=\"settingsItem.path\"\n          routerLinkActive=\"settings-item--active\"\n          [routerLinkActiveOptions]=\"{ exact: true }\"\n        >\n          {{ settingsItem | descriptorLabel }}\n        </button>\n      }\n      <button type=\"button\" class=\"settings-item\" (click)=\"onSettingsSignOut()\">\n        {{ 'nav.sign-out' | translate }}\n      </button>\n    </div>\n  } @else if (isAdministration) {\n    <div class=\"settings-panel\">\n      @for (adminItem of administrationItems(); track adminItem.path) {\n        <button\n          type=\"button\"\n          class=\"settings-item\"\n          [class.settings-item--active]=\"isAdminDrawerPathActive(adminItem.path)\"\n          (click)=\"onAdministrationItemClick(adminItem.path)\"\n        >\n          {{ adminItem | descriptorLabel }}\n        </button>\n      }\n    </div>\n  } @else if (sidebarComponentId(); as sidebarId) {\n    <!--\n      A nav entry with no packaged drawer renders whatever the `sidebar` slot\n      registers for its id. Before Phase 2 this branch could only show the\n      placeholder below, so a manifest-added nav item was guaranteed an empty\n      drawer and the nav array was decorative.\n    -->\n    <lib-extension-outlet [componentId]=\"sidebarId\" />\n  } @else {\n    <div class=\"drawer-empty\">\n      <p>{{ 'shell.slot-empty' | translate: { name: item | descriptorLabel } }}</p>\n    </div>\n  }\n}\n\n<ng-template #folderTpl let-node let-depth=\"depth\">\n  <div class=\"tree-node\" [style.padding-left.px]=\"12 + depth * 20\">\n    @if (hasChildren(node)) {\n      <!--\n        The name goes through an interpolation PARAMETER, not a `+`. D0c in\n        docs/i18n-localization-plan.md: INFO-144 forbids building a string from concatenated\n        substrings, and upstream's own tree toggle is the cautionary example \u2014 it does\n        `('DOCUMENT_TREE.TOGGLE_ARIA-LABEL ' | translate) + node.name`, which no translator can\n        reorder for a language that needs the noun first.\n      -->\n      <button\n        class=\"tree-toggle\"\n        (click)=\"toggleNode(node)\"\n        type=\"button\"\n        [attr.aria-label]=\"'nav.tree.toggle' | translate: { name: nodeLabel(node) }\"\n        [attr.aria-expanded]=\"node.expanded\"\n      >\n        @if (node.loading) {\n          <mat-spinner diameter=\"14\" [attr.aria-label]=\"'nav.loading' | translate\" />\n        } @else {\n          <mat-icon class=\"tree-arrow\" [class.tree-arrow--expanded]=\"node.expanded\">\n            chevron_right\n          </mat-icon>\n        }\n      </button>\n    } @else {\n      <span class=\"tree-toggle-spacer\"></span>\n    }\n\n    <button\n      class=\"tree-label\"\n      [class.tree-label--active]=\"isNodeActive(node)\"\n      (click)=\"navigateToFolder(node)\"\n      type=\"button\"\n    >\n      {{ nodeLabel(node) }}\n    </button>\n  </div>\n\n  @if (node.expanded && node.children.length > 0) {\n    @for (child of node.children; track child.doc.uid) {\n      <ng-container\n        *ngTemplateOutlet=\"folderTpl; context: { $implicit: child, depth: depth + 1 }\"\n      />\n    }\n  }\n</ng-template>\n", styles: ["@mixin hide-scrollbar {\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n:host {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  width: 280px;\n  max-width: 100%;\n  overflow: hidden;\n  /* Use theme surface + on-surface so dark mode stays readable (avoid light bg + light text). */\n  background: var(--mat-sys-surface);\n  border-right: 1px solid var(--mat-sys-outline-variant);\n  color: var(--mat-sys-on-surface);\n}\n\n::ng-deep {\n  .mat-mdc-tooltip {\n    pointer-events: auto !important;\n  }\n\n  .mdc-tooltip {\n    z-index: 10000 !important;\n    position: fixed !important;\n  }\n\n  .mdc-tooltip__surface {\n    white-space: nowrap !important;\n  }\n}\n\n.drawer-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 16px 8px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n}\n\n.drawer-title {\n  font-size: 16px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n}\n\n.drawer-header--tasks {\n  padding-bottom: 14px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n}\n\n.drawer-title--tasks {\n  font-size: 18px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n  letter-spacing: -0.02em;\n}\n\n.refresh-btn {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  border: none;\n  border-radius: 50%;\n  background: transparent;\n  cursor: pointer;\n  color: var(--mat-sys-on-surface-variant);\n  transition:\n    background 0.15s,\n    color 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-highest);\n    color: var(--mat-sys-primary);\n  }\n\n  mat-icon {\n    font-size: 20px;\n    width: 20px;\n    height: 20px;\n  }\n}\n\n/* The search drawer fills the panel below its header, so its own list can scroll. */\n.search-filters-outlet {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.drawer-list {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding-top: 0;\n  @include hide-scrollbar;\n}\n\n.placeholder-text {\n  font-size: 14px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.drawer-empty {\n  padding: 24px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-size: 13px;\n}\n\n.settings-panel {\n  display: flex;\n  flex: 1;\n  flex-direction: column;\n  padding: 8px 0;\n}\n\n.settings-item {\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  padding: 14px 16px;\n  cursor: pointer;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  color: var(--mat-sys-on-surface);\n  text-decoration: none;\n  display: block;\n  box-sizing: border-box;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-highest);\n    color: var(--mat-sys-on-surface);\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &.settings-item--active {\n    background: var(--mat-sys-primary-container, #e2dfff);\n    color: var(--mat-sys-on-primary-container, #3e3b92);\n    font-weight: 600;\n  }\n}\n\n// Folder tree styles\n.folder-tree {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding-top: 4px;\n  @include hide-scrollbar;\n}\n\n.tree-loading {\n  display: flex;\n  justify-content: center;\n  padding: 24px 0;\n}\n\n.tree-empty {\n  padding: 24px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant);\n  font-size: 13px;\n}\n\n.tree-list {\n  flex: 1;\n  overflow-y: auto;\n  padding: 4px 0;\n  padding-top: 0;\n}\n\n.tree-node {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  height: 34px;\n  padding-right: 8px;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.tree-toggle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  flex-shrink: 0;\n}\n\n.tree-toggle-spacer {\n  display: inline-block;\n  width: 22px;\n  flex-shrink: 0;\n}\n\n.tree-arrow {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant);\n  transition: transform 0.15s ease;\n}\n\n.tree-arrow--expanded {\n  transform: rotate(90deg);\n}\n\n.tree-label {\n  flex: 1;\n  min-width: 0;\n  border: none;\n  background: none;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n  cursor: pointer;\n  padding: 2px 4px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  text-align: left;\n\n  &:hover {\n    color: var(--mat-sys-primary);\n  }\n\n  &--active {\n    color: var(--mat-sys-primary);\n    font-weight: 600;\n    background: color-mix(in srgb, var(--mat-sys-primary) 12%, transparent);\n    border-radius: 4px;\n  }\n}\n\n// Recently Viewed list\n.rv-list {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.rv-card {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.rv-thumb {\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.rv-thumb-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.rv-thumb-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: var(--mat-sys-primary);\n}\n\n.rv-info {\n  flex: 1;\n  min-width: 0;\n}\n\n.rv-title {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  line-height: 1.4;\n}\n\n.rv-meta {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-top: 2px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.rv-type {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n/* Measured at 4.24:1 on the card background with the outline token; on-surface-variant clears 4.5:1. */\n.rv-sep {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.rv-time {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n// Expired Queue panel\n.expired-list {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.expired-card {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: background 0.15s;\n\n  &:hover {\n    background: #fff3e0;\n  }\n}\n\n.expired-thumb {\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  overflow: hidden;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #fff3e0;\n  border: 1px solid #ffe0b2;\n}\n\n.expired-thumb-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.expired-thumb-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #ef6c00;\n}\n\n.expired-info {\n  flex: 1;\n  min-width: 0;\n}\n\n.expired-title {\n  display: block;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  line-height: 1.4;\n}\n\n.expired-meta {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  margin-top: 2px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.expired-type {\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.expired-sep {\n  color: var(--mat-sys-outline);\n}\n\n.expired-date {\n  color: #ef6c00;\n  font-weight: 500;\n}\n\n.expired-warning-icon {\n  flex-shrink: 0;\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #ff9800;\n}\n\n// Collections panel\n.collections-panel {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.collections-list {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n.collection-card {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 16px;\n  cursor: pointer;\n  border: none;\n  background: transparent;\n  text-align: left;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.collection-thumb {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.collection-thumb-placeholder {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: var(--mat-sys-on-surface-variant);\n  }\n}\n\n.collection-card-body {\n  flex: 1;\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.collection-card-title {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.collection-card-date {\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.collection-card-owner {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  color: var(--mat-sys-on-surface-variant);\n  margin-top: 2px;\n}\n\n.owner-avatar {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 18px;\n  height: 18px;\n  border-radius: 50%;\n  background: var(--mat-sys-primary);\n  color: var(--mat-sys-on-primary);\n  font-size: 10px;\n  font-weight: 600;\n  flex-shrink: 0;\n}\n\n/* \u2500\u2500\u2500 Task list inside drawer \u2500\u2500\u2500 */\n\n// Clipboard panel\n.clipboard-panel {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.clipboard-empty-icon {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  color: var(--mat-sys-on-surface-variant);\n  margin-bottom: 8px;\n}\n\n.clipboard-hint {\n  font-size: 12px;\n  color: var(--mat-sys-on-surface-variant);\n  margin-top: 4px;\n  max-width: 200px;\n  text-align: center;\n}\n\n.clipboard-footer {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  flex-shrink: 0;\n  width: 100%;\n  box-sizing: border-box;\n  padding: 10px 12px 12px;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n  overflow: hidden;\n}\n\n.clipboard-primary-actions {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 8px;\n  width: 100%;\n  min-width: 0;\n}\n\n.clipboard-action-btn {\n  width: 100%;\n  min-width: 0 !important;\n  max-width: 100%;\n  font-size: 12px !important;\n  min-height: 36px;\n  padding: 0 6px !important;\n  overflow: hidden;\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    margin-right: 4px;\n    flex-shrink: 0;\n  }\n}\n\n.clipboard-tip {\n  margin: 0;\n  font-size: 12px;\n  line-height: 1.4;\n  color: var(--mat-sys-on-surface-variant);\n  text-align: center;\n  word-wrap: break-word;\n  overflow-wrap: anywhere;\n}\n\n.clipboard-loading {\n  display: flex;\n  justify-content: center;\n  padding: 4px 0;\n}\n\n.clipboard-list {\n  flex: 1;\n  min-height: 0;\n  min-width: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.clipboard-card {\n  display: flex;\n  align-items: center;\n  min-width: 0;\n  padding: 0 8px 0 0;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.clipboard-card-main {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 10px 8px 10px 16px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  min-width: 0;\n  text-align: left;\n}\n\n.clipboard-thumb {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.clipboard-thumb-placeholder {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.empty-icon {\n  font-size: 32px;\n  width: 32px;\n  height: 32px;\n  color: var(--mat-sys-outline);\n}\n\n.tasks-panel-wrap {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.tasks-panel-body {\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n\n.task-list {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  @include hide-scrollbar;\n}\n\n/* Tasks inbox \u2014 master list (title \u2192 doc \u2192 Due + date \u2192 workflow line) */\n.task-list--inbox {\n  padding: 0;\n}\n\n.task-list--inbox .task-item {\n  display: flex;\n  align-items: stretch;\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  background: var(--mat-sys-surface);\n  cursor: pointer;\n  text-align: left;\n  font: inherit;\n  color: inherit;\n  transition:\n    background 0.15s ease,\n    box-shadow 0.15s ease;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n\n  &.active {\n    background: var(--mat-sys-surface);\n    box-shadow: inset 4px 0 0 0 var(--mat-sys-primary);\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n.task-list--inbox .task-body {\n  flex: 1;\n  min-width: 0;\n  padding: 14px 16px;\n}\n\n.task-title-line {\n  font-size: 14px;\n  font-weight: 700;\n  color: var(--mat-sys-on-surface);\n  line-height: 1.35;\n  letter-spacing: -0.01em;\n}\n\n.task-doc-line {\n  margin-top: 4px;\n  font-size: 12px;\n  font-weight: 400;\n  color: var(--mat-sys-on-surface-variant);\n  line-height: 1.35;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.task-due-line {\n  margin-top: 8px;\n  font-size: 12px;\n  line-height: 1.4;\n}\n\n.task-due-prefix {\n  color: var(--mat-sys-outline);\n  margin-right: 4px;\n}\n\n.task-due-value {\n  font-weight: 600;\n}\n\n.task-due-value--soon {\n  color: var(--mat-sys-tertiary);\n}\n\n.task-due-value--overdue {\n  color: var(--mat-sys-error);\n}\n\n.task-workflow-line {\n  margin-top: 6px;\n  font-size: 12px;\n  font-weight: 400;\n  color: var(--mat-sys-on-surface-variant);\n  line-height: 1.4;\n}\n\n.tasks-drawer-footer {\n  flex-shrink: 0;\n  padding: 10px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant);\n}\n\n.tasks-dashboard-link {\n  font-size: 12px;\n  color: var(--mat-sys-primary);\n  text-decoration: underline;\n  text-underline-offset: 0.15em;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n.clipboard-card-title {\n  font-size: 13px;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.clipboard-card-remove {\n  flex-shrink: 0;\n  width: 28px !important;\n  height: 28px !important;\n  line-height: 28px !important;\n  color: var(--mat-sys-on-surface-variant);\n\n  &:hover {\n    color: var(--mat-sys-error);\n  }\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}\n\n// Favorites panel\n.favorites-panel {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.favorites-list {\n  flex: 1;\n  overflow-y: auto;\n  overflow-x: hidden;\n  padding: 4px 0;\n  @include hide-scrollbar;\n}\n\n.favorite-card {\n  display: flex;\n  align-items: center;\n  padding: 0 8px 0 0;\n  transition: background 0.15s;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low);\n  }\n}\n\n.favorite-card-main {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 8px 8px 16px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  min-width: 0;\n  text-align: left;\n}\n\n.favorite-thumb {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  object-fit: cover;\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n}\n\n.favorite-thumb-placeholder {\n  width: 36px;\n  height: 36px;\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--mat-sys-surface-container-highest);\n  flex-shrink: 0;\n  border: 1px solid var(--mat-sys-outline-variant);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: var(--mat-sys-on-surface-variant);\n  }\n}\n\n.favorite-card-title {\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.favorite-card-remove {\n  flex-shrink: 0;\n  width: 28px !important;\n  height: 28px !important;\n  line-height: 28px !important;\n  color: var(--mat-sys-on-surface-variant);\n\n  &:hover {\n    color: var(--mat-sys-error);\n  }\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n  }\n}\n"] }]
    }], () => [], { activeItem: [{ type: i0.Input, args: [{ isSignal: true, alias: "activeItem", required: false }] }], itemSelected: [{ type: i0.Output, args: ["itemSelected"] }], navigateKeepDrawer: [{ type: i0.Output, args: ["navigateKeepDrawer"] }], signOutSelected: [{ type: i0.Output, args: ["signOutSelected"] }], browseTree: [{ type: i0.ViewChild, args: [i0.forwardRef(() => NxsDocumentTreeComponent), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NavDrawerComponent, { className: "NavDrawerComponent", filePath: "apps/nuxeo-ui/src/app/shell/nav-drawer/nav-drawer.component.ts", lineNumber: 107 }); })();
