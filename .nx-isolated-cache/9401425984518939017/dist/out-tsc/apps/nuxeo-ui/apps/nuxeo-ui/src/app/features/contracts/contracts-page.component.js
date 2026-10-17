import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
// Import from @nuxeo/satori-platform/ui - what customers have access to
import { WidgetContainerComponent, WidgetGridComponent, ConfirmDialogComponent, ShareDialogComponent, ExportDialogComponent, SavedSearchDialogComponent, SelectionTopbarComponent, } from '@nuxeo/satori-platform/ui';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/card";
import * as i3 from "@angular/material/icon";
function ContractsPageComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-selection-topbar", 33);
    i0.ɵɵlistener("cleared", function ContractsPageComponent_Conditional_34_Template_lib_selection_topbar_cleared_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.clearSelection()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("selectedCount", ctx_r1.mockSelectedItems().length)("selectedItems", ctx_r1.mockSelectedItems());
} }
export class ContractsPageComponent {
    dialog = inject(MatDialog);
    translate = inject(TranslateService);
    // Selection topbar demo state
    showSelection = signal(false, ...(ngDevMode ? [{ debugName: "showSelection" }] : []));
    mockSelectedItems = signal([
        { id: '1', name: 'Contract ABC-123.pdf', preview: null },
        { id: '2', name: 'Contract XYZ-789.pdf', preview: null },
        { id: '3', name: 'Contract DEF-456.pdf', preview: null },
    ], ...(ngDevMode ? [{ debugName: "mockSelectedItems" }] : []));
    openConfirmDialog() {
        const data = {
            title: this.translate.instant('contracts.showcase-dialog-title'),
            message: this.translate.instant('contracts.showcase-dialog-message'),
            confirmLabel: this.translate.instant('confirm.got-it'),
        };
        this.dialog.open(ConfirmDialogComponent, {
            data,
            width: '500px',
        });
    }
    openShareDialog() {
        const data = {
            title: this.translate.instant('contracts.sample-document-title'),
            url: 'https://example.com/nuxeo/ui/#/doc/contract-abc-123',
        };
        this.dialog.open(ShareDialogComponent, {
            data,
            width: '500px',
        });
    }
    openExportDialog() {
        const data = {
            documentUid: 'contract-abc-123',
            documentTitle: 'Contract ABC-123.pdf',
            exportFn: (type, uid) => {
                // Mock export function - returns a fake blob
                console.log(`Exporting ${uid} as ${type}`);
                return of(new Blob(['Mock export data'], { type: 'application/octet-stream' }));
            },
        };
        this.dialog.open(ExportDialogComponent, {
            data,
            width: '400px',
        });
    }
    openSavedSearchDialog() {
        const data = {
            title: this.translate.instant('ui.save-current-search'),
            placeholder: this.translate.instant('contracts.saved-search-placeholder'),
            initialValue: '',
        };
        this.dialog.open(SavedSearchDialogComponent, {
            data,
            width: '450px',
        });
    }
    toggleSelection() {
        this.showSelection.update((v) => !v);
    }
    clearSelection() {
        this.showSelection.set(false);
    }
    static ɵfac = function ContractsPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ContractsPageComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ContractsPageComponent, selectors: [["app-contracts-page"]], decls: 215, vars: 123, consts: [[1, "contracts-page"], [1, "page-header"], [1, "page-subtitle"], [1, "header-actions"], ["mat-raised-button", "", "color", "primary", 3, "click"], [1, "selection-demo", 3, "selectedCount", "selectedItems"], [1, "section-title"], [1, "section-note"], [3, "columns"], [3, "headingLevel", "title"], [1, "stat"], [1, "stat-icon", "info"], [1, "stat-value"], [1, "stat-caption"], [1, "stat-icon", "warning"], [1, "stat-value", "warning"], [1, "stat-icon", "success"], [1, "activity"], [1, "activity-list"], [1, "activity-item"], [1, "activity-icon", "success"], [1, "activity-details"], [1, "activity-time"], [1, "activity-icon", "warning"], [1, "activity-icon", "info"], [1, "demo-panel"], [1, "component-list"], [1, "demo-status"], [1, "demo-note"], [1, "code-card"], [1, "code-block"], [1, "info-banner"], [1, "banner-icon", "info"], [1, "selection-demo", 3, "cleared", "selectedCount", "selectedItems"]], template: function ContractsPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "h1");
            i0.ɵɵtext(4, "@nuxeo/satori-platform/ui Component Showcase");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p", 2);
            i0.ɵɵtext(6);
            i0.ɵɵpipe(7, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "div", 3)(9, "button", 4);
            i0.ɵɵlistener("click", function ContractsPageComponent_Template_button_click_9_listener() { return ctx.openConfirmDialog(); });
            i0.ɵɵelementStart(10, "mat-icon");
            i0.ɵɵtext(11, "help_outline");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "button", 4);
            i0.ɵɵlistener("click", function ContractsPageComponent_Template_button_click_14_listener() { return ctx.openShareDialog(); });
            i0.ɵɵelementStart(15, "mat-icon");
            i0.ɵɵtext(16, "share");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(17);
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "button", 4);
            i0.ɵɵlistener("click", function ContractsPageComponent_Template_button_click_19_listener() { return ctx.openExportDialog(); });
            i0.ɵɵelementStart(20, "mat-icon");
            i0.ɵɵtext(21, "download");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(22);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "button", 4);
            i0.ɵɵlistener("click", function ContractsPageComponent_Template_button_click_24_listener() { return ctx.openSavedSearchDialog(); });
            i0.ɵɵelementStart(25, "mat-icon");
            i0.ɵɵtext(26, "save");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(27);
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(29, "button", 4);
            i0.ɵɵlistener("click", function ContractsPageComponent_Template_button_click_29_listener() { return ctx.toggleSelection(); });
            i0.ɵɵelementStart(30, "mat-icon");
            i0.ɵɵtext(31, "check_box");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(34, ContractsPageComponent_Conditional_34_Template, 1, 2, "lib-selection-topbar", 5);
            i0.ɵɵelementStart(35, "h2", 6)(36, "mat-icon");
            i0.ɵɵtext(37, "widgets");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "p", 7)(41, "code");
            i0.ɵɵtext(42);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(43, "lib-widget-grid", 8)(44, "lib-widget-container", 9);
            i0.ɵɵpipe(45, "translate");
            i0.ɵɵelementStart(46, "div", 10)(47, "mat-icon", 11);
            i0.ɵɵtext(48, "description");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(49, "p", 12);
            i0.ɵɵtext(50, "24");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(51, "p", 13);
            i0.ɵɵtext(52);
            i0.ɵɵpipe(53, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(54, "lib-widget-container", 9);
            i0.ɵɵpipe(55, "translate");
            i0.ɵɵelementStart(56, "div", 10)(57, "mat-icon", 14);
            i0.ɵɵtext(58, "warning");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(59, "p", 15);
            i0.ɵɵtext(60, "3");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(61, "p", 13);
            i0.ɵɵtext(62);
            i0.ɵɵpipe(63, "translate");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(64, "lib-widget-container", 9);
            i0.ɵɵpipe(65, "translate");
            i0.ɵɵelementStart(66, "div", 10)(67, "mat-icon", 16);
            i0.ɵɵtext(68, "attach_money");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(69, "p", 12);
            i0.ɵɵtext(70, "$2.4M");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(71, "p", 13);
            i0.ɵɵtext(72);
            i0.ɵɵpipe(73, "translate");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(74, "h2", 6)(75, "mat-icon");
            i0.ɵɵtext(76, "view_agenda");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(77);
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(79, "p", 7)(80, "code");
            i0.ɵɵtext(81);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(82, "lib-widget-container", 9);
            i0.ɵɵpipe(83, "translate");
            i0.ɵɵelementStart(84, "div", 17)(85, "div", 18)(86, "div", 19)(87, "mat-icon", 20);
            i0.ɵɵtext(88, "check_circle");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(89, "div", 21)(90, "strong");
            i0.ɵɵtext(91);
            i0.ɵɵpipe(92, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(93, "p", 22);
            i0.ɵɵtext(94, "2 days ago");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(95, "div", 19)(96, "mat-icon", 23);
            i0.ɵɵtext(97, "schedule");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(98, "div", 21)(99, "strong");
            i0.ɵɵtext(100);
            i0.ɵɵpipe(101, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(102, "p", 22);
            i0.ɵɵtext(103, "3 days ago");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(104, "div", 19)(105, "mat-icon", 24);
            i0.ɵɵtext(106, "edit");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(107, "div", 21)(108, "strong");
            i0.ɵɵtext(109);
            i0.ɵɵpipe(110, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(111, "p", 22);
            i0.ɵɵtext(112, "1 week ago");
            i0.ɵɵelementEnd()()()()()();
            i0.ɵɵelementStart(113, "h2", 6)(114, "mat-icon");
            i0.ɵɵtext(115, "touch_app");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(116);
            i0.ɵɵpipe(117, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(118, "p", 7);
            i0.ɵɵtext(119);
            i0.ɵɵpipe(120, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(121, "lib-widget-grid", 8)(122, "lib-widget-container", 9);
            i0.ɵɵpipe(123, "translate");
            i0.ɵɵelementStart(124, "div", 25)(125, "ul", 26)(126, "li")(127, "code");
            i0.ɵɵtext(128, "ConfirmDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(129);
            i0.ɵɵpipe(130, "translate");
            i0.ɵɵelementStart(131, "span", 27);
            i0.ɵɵtext(132, " \u2713 Live demo");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(133, "li")(134, "code");
            i0.ɵɵtext(135, "ShareDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(136);
            i0.ɵɵpipe(137, "translate");
            i0.ɵɵelementStart(138, "span", 27);
            i0.ɵɵtext(139, " \u2713 Live demo");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(140, "li")(141, "code");
            i0.ɵɵtext(142, "ExportDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(143);
            i0.ɵɵpipe(144, "translate");
            i0.ɵɵelementStart(145, "span", 27);
            i0.ɵɵtext(146, " \u2713 Live demo");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(147, "li")(148, "code");
            i0.ɵɵtext(149, "SavedSearchDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(150);
            i0.ɵɵpipe(151, "translate");
            i0.ɵɵelementStart(152, "span", 27);
            i0.ɵɵtext(153, " \u2713 Live demo");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(154, "li")(155, "code");
            i0.ɵɵtext(156, "DocumentCompareDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(157);
            i0.ɵɵpipe(158, "translate");
            i0.ɵɵelementStart(159, "span", 28);
            i0.ɵɵtext(160, " (requires 2 documents)");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(161, "lib-widget-container", 9);
            i0.ɵɵpipe(162, "translate");
            i0.ɵɵelementStart(163, "div", 25)(164, "ul", 26)(165, "li")(166, "code");
            i0.ɵɵtext(167, "SelectionTopbarComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(168);
            i0.ɵɵpipe(169, "translate");
            i0.ɵɵelementStart(170, "span", 27);
            i0.ɵɵtext(171, " \u2713 Live demo");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(172, "li")(173, "code");
            i0.ɵɵtext(174, "WidgetGridComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(175);
            i0.ɵɵpipe(176, "translate");
            i0.ɵɵelementStart(177, "span", 27);
            i0.ɵɵtext(178, " \u2713 In use above");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(179, "li")(180, "code");
            i0.ɵɵtext(181, "WidgetContainerComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(182);
            i0.ɵɵpipe(183, "translate");
            i0.ɵɵelementStart(184, "span", 27);
            i0.ɵɵtext(185, " \u2713 In use above");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(186, "li")(187, "code");
            i0.ɵɵtext(188, "DocumentViewerComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(189);
            i0.ɵɵpipe(190, "translate");
            i0.ɵɵelementStart(191, "span", 28);
            i0.ɵɵtext(192, " (requires document)");
            i0.ɵɵelementEnd()()()()()();
            i0.ɵɵelementStart(193, "h2", 6)(194, "mat-icon");
            i0.ɵɵtext(195, "code");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(196);
            i0.ɵɵpipe(197, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(198, "mat-card", 29)(199, "mat-card-content")(200, "pre", 30);
            i0.ɵɵtext(201);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(202, "div", 31)(203, "p")(204, "mat-icon", 32);
            i0.ɵɵtext(205, "info");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(206, "span")(207, "strong");
            i0.ɵɵtext(208);
            i0.ɵɵpipe(209, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(210);
            i0.ɵɵpipe(211, "translate");
            i0.ɵɵelementStart(212, "code");
            i0.ɵɵtext(213, "@nuxeo/satori-platform/ui");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(214, ". Import them directly into your extension libraries to build custom pages and features. ");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 55, "app.contracts-page.all-components-below-are-imported-from"), " ");
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 57, "app.contracts-page.confirm-dialog"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 59, "app.contracts-page.share-dialog"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(23, 61, "app.contracts-page.export-dialog"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(28, 63, "app.contracts-page.saved-search"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(33, 65, "app.contracts-page.toggle-selection-bar"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.showSelection() ? 34 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(39, 67, "app.contracts-page.widgetgridcomponent"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate2("import ", "{", " WidgetGridComponent ", "}", " from '@nuxeo/satori-platform/ui'");
            i0.ɵɵadvance();
            i0.ɵɵproperty("columns", 3);
            i0.ɵɵadvance();
            i0.ɵɵproperty("headingLevel", 3)("title", i0.ɵɵpipeBind1(45, 69, "app.contracts-page.active-contracts"));
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(53, 71, "app.contracts-page.updated-2-hours-ago"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("headingLevel", 3)("title", i0.ɵɵpipeBind1(55, 73, "app.contracts-page.expiring-soon"));
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(63, 75, "app.contracts-page.next-30-days"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("headingLevel", 3)("title", i0.ɵɵpipeBind1(65, 77, "app.contracts-page.total-value"));
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(73, 79, "app.contracts-page.current-quarter"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(78, 81, "app.contracts-page.widgetcontainercomponent"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate2("import ", "{", " WidgetContainerComponent ", "}", " from '@nuxeo/satori-platform/ui'");
            i0.ɵɵadvance();
            i0.ɵɵproperty("headingLevel", 3)("title", i0.ɵɵpipeBind1(83, 83, "app.contracts-page.recent-activity"));
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(92, 85, "app.contracts-page.contract-abc-123-renewed"));
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(101, 87, "app.contracts-page.contract-xyz-789-pending-review"));
            i0.ɵɵadvance(9);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(110, 89, "app.contracts-page.contract-def-456-signed"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(117, 91, "app.contracts-page.interactive-component-demos"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(120, 93, "app.contracts-page.click-the-buttons-at-the-top"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("columns", 2);
            i0.ɵɵadvance();
            i0.ɵɵproperty("headingLevel", 3)("title", i0.ɵɵpipeBind1(123, 95, "app.contracts-page.dialogs-overlays"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(130, 97, "app.contracts-page.confirm-dialog-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(137, 99, "app.contracts-page.share-dialog-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(144, 101, "app.contracts-page.export-dialog-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(151, 103, "app.contracts-page.saved-search-dialog-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(158, 105, "app.contracts-page.document-compare-desc"), " ");
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("headingLevel", 3)("title", i0.ɵɵpipeBind1(162, 107, "app.contracts-page.viewers-display"));
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(169, 109, "app.contracts-page.selection-topbar-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(176, 111, "app.contracts-page.widget-grid-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(183, 113, "app.contracts-page.widget-container-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" \u2014 ", i0.ɵɵpipeBind1(190, 115, "app.contracts-page.document-viewer-desc"), " ");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(197, 117, "app.contracts-page.usage-example"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate8("import ", "{", " Component ", "}", " from '@angular/core';\n\n// Import from the published customer package\nimport ", "{", "\n  WidgetContainerComponent,\n  WidgetGridComponent,\n", "}", " from '@nuxeo/satori-platform/ui';\n\n@Component(", "{", "\n  selector: 'app-my-page',\n  standalone: true,\n  imports: [WidgetContainerComponent, WidgetGridComponent],\n  template: `\n    <lib-widget-grid [columns]=\"3\">\n      <lib-widget-container [title]=\"'app.contracts-page.my-widget' | translate\">\n        <!-- Your content here -->\n      </lib-widget-container>\n    </lib-widget-grid>\n  `\n", "}", ")\nexport class MyPageComponent ", "{", " ", "}");
            i0.ɵɵadvance(7);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(209, 119, "app.contracts-page.for-customers"));
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(211, 121, "app.contracts-page.all-components-shown-are-available-from"), " ");
        } }, dependencies: [CommonModule,
            MatButtonModule, i1.MatButton, MatCardModule, i2.MatCard, i2.MatCardContent, MatIconModule, i3.MatIcon, WidgetContainerComponent,
            WidgetGridComponent,
            SelectionTopbarComponent,
            TranslatePipe], styles: ["//[_ngcontent-%COMP%]   This[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   in-app[_ngcontent-%COMP%]   worked[_ngcontent-%COMP%]   example[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   `@nuxeo/satori-platform/ui`[_ngcontent-%COMP%], so[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   has[_ngcontent-%COMP%]   to\n//[_ngcontent-%COMP%]   obey[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   rule[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   advertises[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   describing[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]:   every[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   resolves\n//[_ngcontent-%COMP%]   through[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   theme[_ngcontent-%COMP%]   token[_ngcontent-%COMP%], with[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   literal[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   replaced[_ngcontent-%COMP%]   kept[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   fallback.[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   Layer[_ngcontent-%COMP%]   0\n//[_ngcontent-%COMP%]   rebrand[_ngcontent-%COMP%]   therefore[_ngcontent-%COMP%]   restyles[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   too[_ngcontent-%COMP%], instead   of   stranding   it   in   the   old   palette.\n//\n//   `--mat-sys-*`   is   genuinely   live   in   this   app   \u2014   `apps/nuxeo-ui/src/styles.scss`   includes\n//   Satori's   `mat.theme`,   which   emits   the   whole   M3   system   set   \u2014   so   the   fallbacks   below   are\n//   a   safety   net,   not   the   value   that   actually   renders.   That   is   the   difference   between   this\n//   and   a   token   whose   fallback   does   all   the   work.\n[_nghost-%COMP%] {\n  --showcase-text-muted: var(--mat-sys-on-surface-variant, #666);\n  --showcase-surface-subtle: var(--mat-sys-surface-container, #f5f5f5);\n  --showcase-status-info: var(--mat-sys-primary, #1976d2);\n  // Not `--mat-sys-error`. M3 has no warning role, but borrowing the error one makes a\n  // warning inherit the error colour for good \u2014 under the packaged Nuxeo theme this\n  // rendered \"3 contracts expiring in 30 days\" in error red, and a customer rebrand would\n  // keep them fused. `--shell-warn-*` is the existing amber family for exactly this\n  // meaning, so this completes it with a foreground rather than aliasing the wrong role.\n  --showcase-status-warning: var(--shell-warn-fg, #f57c00);\n  --showcase-status-success: var(--mat-sys-tertiary, #388e3c);\n  --showcase-code-bg: var(--mat-sys-inverse-surface, #263238);\n  --showcase-code-fg: var(--mat-sys-inverse-primary, #aed581);\n  --showcase-banner-bg: var(--mat-sys-primary-container, #e3f2fd);\n}\n\n$code-font:[_ngcontent-%COMP%]   'Monaco',[_ngcontent-%COMP%]   'Courier[_ngcontent-%COMP%]   New',[_ngcontent-%COMP%]   monospace;\n\n//[_ngcontent-%COMP%]   Everything[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   nested[_ngcontent-%COMP%]   under[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   root[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   specificity,[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   tidiness.[_ngcontent-%COMP%]   The\n//[_ngcontent-%COMP%]   generated[_ngcontent-%COMP%]   Material[_ngcontent-%COMP%]   theme[_ngcontent-%COMP%]   styles[_ngcontent-%COMP%]   headings[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   paragraphs[_ngcontent-%COMP%]   by[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   at\n//[_ngcontent-%COMP%]   `html[data-app-theme=\"nuxeo\"][_ngcontent-%COMP%]   .mat-typography[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] { margin: 0 0 0.75em }`[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   (0,2,2).[_ngcontent-%COMP%]   A\n//[_ngcontent-%COMP%]   bare[_ngcontent-%COMP%]   `.section-note`[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   component[_ngcontent-%COMP%]   stylesheet[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   (0,2,0)[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   loses[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   it,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   lifting\n//[_ngcontent-%COMP%]   these[_ngcontent-%COMP%]   declarations[_ngcontent-%COMP%]   out[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   `style=`[_ngcontent-%COMP%]   attributes[_ngcontent-%COMP%]   silently[_ngcontent-%COMP%]   handed[_ngcontent-%COMP%]   spacing[_ngcontent-%COMP%]   back[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   theme:[_ngcontent-%COMP%]   measured[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   70px[_ngcontent-%COMP%]   shorter[_ngcontent-%COMP%]   page,[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   every[_ngcontent-%COMP%]   `<p[_ngcontent-%COMP%] > `[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   `<h2[_ngcontent-%COMP%] > `[_ngcontent-%COMP%]   margin[_ngcontent-%COMP%]   wrong.\n//[_ngcontent-%COMP%]   Inline[_ngcontent-%COMP%]   styles[_ngcontent-%COMP%]   outranked[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   theme;[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   single[_ngcontent-%COMP%]   class[_ngcontent-%COMP%]   does[_ngcontent-%COMP%]   not.[_ngcontent-%COMP%]   Nesting[_ngcontent-%COMP%]   makes[_ngcontent-%COMP%]   them[_ngcontent-%COMP%]   (0,4,x).\n.contracts-page[_ngcontent-%COMP%] {\n  padding: 2rem;\n  max-width: 1400px;\n  margin: 0 auto;\n\n  .page-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 2rem;\n\n    h1 {\n      margin: 0 0 0.5rem 0;\n    }\n  }\n\n  .page-subtitle {\n    color: var(--showcase-text-muted);\n    margin: 0;\n  }\n\n  .header-actions {\n    display: flex;\n    gap: 0.5rem;\n    flex-wrap: wrap;\n  }\n\n  .selection-demo {\n    margin-bottom: 1rem;\n  }\n\n  .section-title {\n    margin: 2rem 0 1rem 0;\n\n    mat-icon {\n      vertical-align: middle;\n      margin-right: 0.5rem;\n    }\n  }\n\n  .section-note {\n    color: var(--showcase-text-muted);\n    margin-bottom: 1rem;\n  }\n\n  .stat {\n    text-align: center;\n    padding: 1.5rem;\n  }\n\n  .stat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  .stat-value {\n    font-size: 2rem;\n    margin: 1rem 0;\n    font-weight: 500;\n  }\n\n  .stat-caption {\n    color: var(--showcase-text-muted);\n    font-size: 0.875rem;\n    margin: 0;\n  }\n\n  .activity {\n    padding: 1.5rem;\n  }\n\n  .activity-list {\n    display: flex;\n    flex-direction: column;\n    gap: 1rem;\n  }\n\n  .activity-item {\n    display: flex;\n    align-items: start;\n    gap: 1rem;\n    padding: 1rem;\n    background: var(--showcase-surface-subtle);\n    border-radius: 8px;\n  }\n\n  .activity-details {\n    flex: 1;\n  }\n\n  .activity-time {\n    margin: 0.25rem 0 0 0;\n    color: var(--showcase-text-muted);\n    font-size: 0.875rem;\n  }\n\n  .demo-panel {\n    padding: 1.5rem;\n  }\n\n  .component-list {\n    margin: 0;\n    padding-left: 1.5rem;\n    line-height: 1.8;\n  }\n\n  .demo-status {\n    color: var(--showcase-status-success);\n    font-weight: 500;\n  }\n\n  .demo-note {\n    color: var(--showcase-text-muted);\n    font-size: 0.875rem;\n  }\n\n  .code-card {\n    margin-bottom: 2rem;\n  }\n\n  .code-block {\n    margin: 0;\n    padding: 1rem;\n    background: var(--showcase-code-bg);\n    color: var(--showcase-code-fg);\n    border-radius: 4px;\n    overflow-x: auto;\n    font-family: $code-font;\n    font-size: 0.875rem;\n    line-height: 1.6;\n  }\n\n  .info-banner {\n    margin-top: 2rem;\n    padding: 1rem;\n    background: var(--showcase-banner-bg);\n    border-left: 4px solid var(--showcase-status-info);\n    border-radius: 4px;\n\n    p {\n      margin: 0;\n      display: flex;\n      align-items: start;\n      gap: 0.5rem;\n    }\n  }\n\n  // The three status meanings carried by this page \u2014 informational, warning, success \u2014\n  // as modifiers rather than per-element rules, because the same meaning appears on a\n  // stat icon, a stat value, an activity icon and the banner icon.\n  .stat-icon,\n  .stat-value,\n  .activity-icon,\n  .banner-icon {\n    &.info {\n      color: var(--showcase-status-info);\n    }\n\n    &.warning {\n      color: var(--showcase-status-warning);\n    }\n\n    &.success {\n      color: var(--showcase-status-success);\n    }\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ContractsPageComponent, [{
        type: Component,
        args: [{ selector: 'app-contracts-page', standalone: true, imports: [
                    TranslatePipe,
                    CommonModule,
                    MatButtonModule,
                    MatCardModule,
                    MatIconModule,
                    WidgetContainerComponent,
                    WidgetGridComponent,
                    SelectionTopbarComponent,
                ], template: "<div class=\"contracts-page\">\n  <div class=\"page-header\">\n    <div>\n      <h1>&#64;nuxeo/satori-platform/ui Component Showcase</h1>\n      <p class=\"page-subtitle\">\n        {{ 'app.contracts-page.all-components-below-are-imported-from' | translate }}\n      </p>\n    </div>\n    <div class=\"header-actions\">\n      <button mat-raised-button color=\"primary\" (click)=\"openConfirmDialog()\">\n        <mat-icon>help_outline</mat-icon>\n        {{ 'app.contracts-page.confirm-dialog' | translate }}\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"openShareDialog()\">\n        <mat-icon>share</mat-icon>\n        {{ 'app.contracts-page.share-dialog' | translate }}\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"openExportDialog()\">\n        <mat-icon>download</mat-icon>\n        {{ 'app.contracts-page.export-dialog' | translate }}\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"openSavedSearchDialog()\">\n        <mat-icon>save</mat-icon>\n        {{ 'app.contracts-page.saved-search' | translate }}\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"toggleSelection()\">\n        <mat-icon>check_box</mat-icon>\n        {{ 'app.contracts-page.toggle-selection-bar' | translate }}\n      </button>\n    </div>\n  </div>\n\n  <!-- Selection Topbar Demo -->\n  @if (showSelection()) {\n    <lib-selection-topbar\n      [selectedCount]=\"mockSelectedItems().length\"\n      [selectedItems]=\"mockSelectedItems()\"\n      (cleared)=\"clearSelection()\"\n      class=\"selection-demo\"\n    />\n  }\n\n  <!-- Stats using WidgetGrid -->\n  <h2 class=\"section-title\">\n    <mat-icon>widgets</mat-icon>\n    {{ 'app.contracts-page.widgetgridcomponent' | translate }}\n  </h2>\n  <p class=\"section-note\">\n    <code>import {{ '{' }} WidgetGridComponent {{ '}' }} from '&#64;nuxeo/satori-platform/ui'</code>\n  </p>\n\n  <lib-widget-grid [columns]=\"3\">\n    <lib-widget-container\n      [headingLevel]=\"3\"\n      [title]=\"'app.contracts-page.active-contracts' | translate\"\n    >\n      <div class=\"stat\">\n        <mat-icon class=\"stat-icon info\">description</mat-icon>\n        <p class=\"stat-value\">24</p>\n        <p class=\"stat-caption\">{{ 'app.contracts-page.updated-2-hours-ago' | translate }}</p>\n      </div>\n    </lib-widget-container>\n\n    <lib-widget-container\n      [headingLevel]=\"3\"\n      [title]=\"'app.contracts-page.expiring-soon' | translate\"\n    >\n      <div class=\"stat\">\n        <mat-icon class=\"stat-icon warning\">warning</mat-icon>\n        <p class=\"stat-value warning\">3</p>\n        <p class=\"stat-caption\">{{ 'app.contracts-page.next-30-days' | translate }}</p>\n      </div>\n    </lib-widget-container>\n\n    <lib-widget-container [headingLevel]=\"3\" [title]=\"'app.contracts-page.total-value' | translate\">\n      <div class=\"stat\">\n        <mat-icon class=\"stat-icon success\">attach_money</mat-icon>\n        <p class=\"stat-value\">$2.4M</p>\n        <p class=\"stat-caption\">{{ 'app.contracts-page.current-quarter' | translate }}</p>\n      </div>\n    </lib-widget-container>\n  </lib-widget-grid>\n\n  <!-- Recent Activity using WidgetContainer -->\n  <h2 class=\"section-title\">\n    <mat-icon>view_agenda</mat-icon>\n    {{ 'app.contracts-page.widgetcontainercomponent' | translate }}\n  </h2>\n  <p class=\"section-note\">\n    <code\n      >import {{ '{' }} WidgetContainerComponent {{ '}' }} from\n      '&#64;nuxeo/satori-platform/ui'</code\n    >\n  </p>\n\n  <lib-widget-container\n    [headingLevel]=\"3\"\n    [title]=\"'app.contracts-page.recent-activity' | translate\"\n  >\n    <div class=\"activity\">\n      <div class=\"activity-list\">\n        <div class=\"activity-item\">\n          <mat-icon class=\"activity-icon success\">check_circle</mat-icon>\n          <div class=\"activity-details\">\n            <strong>{{ 'app.contracts-page.contract-abc-123-renewed' | translate }}</strong>\n            <p class=\"activity-time\">2 days ago</p>\n          </div>\n        </div>\n        <div class=\"activity-item\">\n          <mat-icon class=\"activity-icon warning\">schedule</mat-icon>\n          <div class=\"activity-details\">\n            <strong>{{ 'app.contracts-page.contract-xyz-789-pending-review' | translate }}</strong>\n            <p class=\"activity-time\">3 days ago</p>\n          </div>\n        </div>\n        <div class=\"activity-item\">\n          <mat-icon class=\"activity-icon info\">edit</mat-icon>\n          <div class=\"activity-details\">\n            <strong>{{ 'app.contracts-page.contract-def-456-signed' | translate }}</strong>\n            <p class=\"activity-time\">1 week ago</p>\n          </div>\n        </div>\n      </div>\n    </div>\n  </lib-widget-container>\n\n  <!-- Interactive Component Demos -->\n  <h2 class=\"section-title\">\n    <mat-icon>touch_app</mat-icon>\n    {{ 'app.contracts-page.interactive-component-demos' | translate }}\n  </h2>\n  <p class=\"section-note\">{{ 'app.contracts-page.click-the-buttons-at-the-top' | translate }}</p>\n\n  <lib-widget-grid [columns]=\"2\">\n    <lib-widget-container\n      [headingLevel]=\"3\"\n      [title]=\"'app.contracts-page.dialogs-overlays' | translate\"\n    >\n      <div class=\"demo-panel\">\n        <ul class=\"component-list\">\n          <li>\n            <code>ConfirmDialogComponent</code> \u2014\n            {{ 'app.contracts-page.confirm-dialog-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 Live demo</span>\n          </li>\n          <li>\n            <code>ShareDialogComponent</code> \u2014\n            {{ 'app.contracts-page.share-dialog-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 Live demo</span>\n          </li>\n          <li>\n            <code>ExportDialogComponent</code> \u2014\n            {{ 'app.contracts-page.export-dialog-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 Live demo</span>\n          </li>\n          <li>\n            <code>SavedSearchDialogComponent</code> \u2014\n            {{ 'app.contracts-page.saved-search-dialog-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 Live demo</span>\n          </li>\n          <li>\n            <code>DocumentCompareDialogComponent</code> \u2014\n            {{ 'app.contracts-page.document-compare-desc' | translate }}\n            <span class=\"demo-note\"> (requires 2 documents)</span>\n          </li>\n        </ul>\n      </div>\n    </lib-widget-container>\n\n    <lib-widget-container\n      [headingLevel]=\"3\"\n      [title]=\"'app.contracts-page.viewers-display' | translate\"\n    >\n      <div class=\"demo-panel\">\n        <ul class=\"component-list\">\n          <li>\n            <code>SelectionTopbarComponent</code> \u2014\n            {{ 'app.contracts-page.selection-topbar-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 Live demo</span>\n          </li>\n          <li>\n            <code>WidgetGridComponent</code> \u2014\n            {{ 'app.contracts-page.widget-grid-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 In use above</span>\n          </li>\n          <li>\n            <code>WidgetContainerComponent</code> \u2014\n            {{ 'app.contracts-page.widget-container-desc' | translate }}\n            <span class=\"demo-status\"> \u2713 In use above</span>\n          </li>\n          <li>\n            <code>DocumentViewerComponent</code> \u2014\n            {{ 'app.contracts-page.document-viewer-desc' | translate }}\n            <span class=\"demo-note\"> (requires document)</span>\n          </li>\n        </ul>\n      </div>\n    </lib-widget-container>\n  </lib-widget-grid>\n\n  <!-- Code Example -->\n  <h2 class=\"section-title\">\n    <mat-icon>code</mat-icon>\n    {{ 'app.contracts-page.usage-example' | translate }}\n  </h2>\n\n  <mat-card class=\"code-card\">\n    <mat-card-content>\n      <pre class=\"code-block\">\nimport {{ '{' }} Component {{ '}' }} from '&#64;angular/core';\n\n// Import from the published customer package\nimport {{ '{' }}\n  WidgetContainerComponent,\n  WidgetGridComponent,\n{{ '}' }} from '&#64;nuxeo/satori-platform/ui';\n\n&#64;Component({{ '{' }}\n  selector: 'app-my-page',\n  standalone: true,\n  imports: [WidgetContainerComponent, WidgetGridComponent],\n  template: `\n    &lt;lib-widget-grid [columns]=\"3\"&gt;\n      &lt;lib-widget-container [title]=\"'app.contracts-page.my-widget' | translate\"&gt;\n        &lt;!-- Your content here --&gt;\n      &lt;/lib-widget-container&gt;\n    &lt;/lib-widget-grid&gt;\n  `\n{{ '}' }})\nexport class MyPageComponent {{ '{' }} {{ '}' }}</pre>\n    </mat-card-content>\n  </mat-card>\n\n  <div class=\"info-banner\">\n    <p>\n      <mat-icon class=\"banner-icon info\">info</mat-icon>\n      <span>\n        <strong>{{ 'app.contracts-page.for-customers' | translate }}</strong>\n        {{ 'app.contracts-page.all-components-shown-are-available-from' | translate }}\n        <code>&#64;nuxeo/satori-platform/ui</code>. Import them directly into your extension\n        libraries to build custom pages and features.\n      </span>\n    </p>\n  </div>\n</div>\n", styles: ["// This page is the in-app worked example of `@nuxeo/satori-platform/ui`, so it has to\n// obey the rule it advertises rather than only describing it: every colour resolves\n// through a theme token, with the literal it replaced kept as the fallback. A Layer 0\n// rebrand therefore restyles this page too, instead of stranding it in the old palette.\n//\n// `--mat-sys-*` is genuinely live in this app \u2014 `apps/nuxeo-ui/src/styles.scss` includes\n// Satori's `mat.theme`, which emits the whole M3 system set \u2014 so the fallbacks below are\n// a safety net, not the value that actually renders. That is the difference between this\n// and a token whose fallback does all the work.\n:host {\n  --showcase-text-muted: var(--mat-sys-on-surface-variant, #666);\n  --showcase-surface-subtle: var(--mat-sys-surface-container, #f5f5f5);\n  --showcase-status-info: var(--mat-sys-primary, #1976d2);\n  // Not `--mat-sys-error`. M3 has no warning role, but borrowing the error one makes a\n  // warning inherit the error colour for good \u2014 under the packaged Nuxeo theme this\n  // rendered \"3 contracts expiring in 30 days\" in error red, and a customer rebrand would\n  // keep them fused. `--shell-warn-*` is the existing amber family for exactly this\n  // meaning, so this completes it with a foreground rather than aliasing the wrong role.\n  --showcase-status-warning: var(--shell-warn-fg, #f57c00);\n  --showcase-status-success: var(--mat-sys-tertiary, #388e3c);\n  --showcase-code-bg: var(--mat-sys-inverse-surface, #263238);\n  --showcase-code-fg: var(--mat-sys-inverse-primary, #aed581);\n  --showcase-banner-bg: var(--mat-sys-primary-container, #e3f2fd);\n}\n\n$code-font: 'Monaco', 'Courier New', monospace;\n\n// Everything is nested under the page root for specificity, not for tidiness. The\n// generated Material theme styles headings and paragraphs by element at\n// `html[data-app-theme=\"nuxeo\"] .mat-typography p { margin: 0 0 0.75em }` \u2014 (0,2,2). A\n// bare `.section-note` in a component stylesheet is (0,2,0) and loses to it, so lifting\n// these declarations out of `style=` attributes silently handed spacing back to the\n// theme: measured as a 70px shorter page, with every `<p>` and `<h2>` margin wrong.\n// Inline styles outranked the theme; a single class does not. Nesting makes them (0,4,x).\n.contracts-page {\n  padding: 2rem;\n  max-width: 1400px;\n  margin: 0 auto;\n\n  .page-header {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 2rem;\n\n    h1 {\n      margin: 0 0 0.5rem 0;\n    }\n  }\n\n  .page-subtitle {\n    color: var(--showcase-text-muted);\n    margin: 0;\n  }\n\n  .header-actions {\n    display: flex;\n    gap: 0.5rem;\n    flex-wrap: wrap;\n  }\n\n  .selection-demo {\n    margin-bottom: 1rem;\n  }\n\n  .section-title {\n    margin: 2rem 0 1rem 0;\n\n    mat-icon {\n      vertical-align: middle;\n      margin-right: 0.5rem;\n    }\n  }\n\n  .section-note {\n    color: var(--showcase-text-muted);\n    margin-bottom: 1rem;\n  }\n\n  .stat {\n    text-align: center;\n    padding: 1.5rem;\n  }\n\n  .stat-icon {\n    font-size: 48px;\n    width: 48px;\n    height: 48px;\n  }\n\n  .stat-value {\n    font-size: 2rem;\n    margin: 1rem 0;\n    font-weight: 500;\n  }\n\n  .stat-caption {\n    color: var(--showcase-text-muted);\n    font-size: 0.875rem;\n    margin: 0;\n  }\n\n  .activity {\n    padding: 1.5rem;\n  }\n\n  .activity-list {\n    display: flex;\n    flex-direction: column;\n    gap: 1rem;\n  }\n\n  .activity-item {\n    display: flex;\n    align-items: start;\n    gap: 1rem;\n    padding: 1rem;\n    background: var(--showcase-surface-subtle);\n    border-radius: 8px;\n  }\n\n  .activity-details {\n    flex: 1;\n  }\n\n  .activity-time {\n    margin: 0.25rem 0 0 0;\n    color: var(--showcase-text-muted);\n    font-size: 0.875rem;\n  }\n\n  .demo-panel {\n    padding: 1.5rem;\n  }\n\n  .component-list {\n    margin: 0;\n    padding-left: 1.5rem;\n    line-height: 1.8;\n  }\n\n  .demo-status {\n    color: var(--showcase-status-success);\n    font-weight: 500;\n  }\n\n  .demo-note {\n    color: var(--showcase-text-muted);\n    font-size: 0.875rem;\n  }\n\n  .code-card {\n    margin-bottom: 2rem;\n  }\n\n  .code-block {\n    margin: 0;\n    padding: 1rem;\n    background: var(--showcase-code-bg);\n    color: var(--showcase-code-fg);\n    border-radius: 4px;\n    overflow-x: auto;\n    font-family: $code-font;\n    font-size: 0.875rem;\n    line-height: 1.6;\n  }\n\n  .info-banner {\n    margin-top: 2rem;\n    padding: 1rem;\n    background: var(--showcase-banner-bg);\n    border-left: 4px solid var(--showcase-status-info);\n    border-radius: 4px;\n\n    p {\n      margin: 0;\n      display: flex;\n      align-items: start;\n      gap: 0.5rem;\n    }\n  }\n\n  // The three status meanings carried by this page \u2014 informational, warning, success \u2014\n  // as modifiers rather than per-element rules, because the same meaning appears on a\n  // stat icon, a stat value, an activity icon and the banner icon.\n  .stat-icon,\n  .stat-value,\n  .activity-icon,\n  .banner-icon {\n    &.info {\n      color: var(--showcase-status-info);\n    }\n\n    &.warning {\n      color: var(--showcase-status-warning);\n    }\n\n    &.success {\n      color: var(--showcase-status-success);\n    }\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ContractsPageComponent, { className: "ContractsPageComponent", filePath: "apps/nuxeo-ui/src/app/features/contracts/contracts-page.component.ts", lineNumber: 41 }); })();
