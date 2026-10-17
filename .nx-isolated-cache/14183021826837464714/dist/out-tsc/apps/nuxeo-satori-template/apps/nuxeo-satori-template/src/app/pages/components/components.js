import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { of } from 'rxjs';
// Import UI components from the published platform package
import { WidgetContainerComponent, WidgetGridComponent, ConfirmDialogComponent, ShareDialogComponent, ExportDialogComponent, SavedSearchDialogComponent, SelectionTopbarComponent, } from '@nuxeo/satori-platform/ui';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/card";
import * as i3 from "@angular/material/icon";
function ComponentsShowcaseComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-selection-topbar", 36);
    i0.ɵɵlistener("cleared", function ComponentsShowcaseComponent_Conditional_32_Template_lib_selection_topbar_cleared_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.clearSelection()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("selectedCount", ctx_r1.mockSelectedItems().length)("selectedItems", ctx_r1.mockSelectedItems());
} }
/**
 * Demonstrates all available UI components from `@nuxeo/satori-platform/ui`.
 *
 * This page serves as both documentation and a working example for customers
 * building their own Layer 2 extensions. Every component shown here is imported
 * from the published package and can be used directly in customer code.
 */
export class ComponentsShowcaseComponent {
    dialog = inject(MatDialog);
    // Selection demo state
    showSelection = signal(false, ...(ngDevMode ? [{ debugName: "showSelection" }] : []));
    mockSelectedItems = signal([
        { id: '1', name: 'Report_Q3_2025.pdf', preview: null },
        { id: '2', name: 'Analysis_Summary.xlsx', preview: null },
    ], ...(ngDevMode ? [{ debugName: "mockSelectedItems" }] : []));
    openConfirmDialog() {
        const data = {
            title: 'Delete Selected Items?',
            message: 'This will permanently delete 2 items. This action cannot be undone.',
            confirmLabel: 'Delete',
        };
        this.dialog.open(ConfirmDialogComponent, {
            data,
            width: '500px',
        });
    }
    openShareDialog() {
        const data = {
            title: 'Report_Q3_2025.pdf',
            url: 'https://example.com/nuxeo/ui/#/doc/report-q3-2025',
        };
        this.dialog.open(ShareDialogComponent, {
            data,
            width: '500px',
        });
    }
    openExportDialog() {
        const data = {
            documentUid: 'report-q3-2025',
            documentTitle: 'Report_Q3_2025.pdf',
            exportFn: (type, uid) => {
                console.log(`[template] Export ${uid} as ${type}`);
                return of(new Blob(['Mock export'], { type: 'application/octet-stream' }));
            },
        };
        this.dialog.open(ExportDialogComponent, {
            data,
            width: '400px',
        });
    }
    openSavedSearchDialog() {
        const data = {
            title: 'Save This Search',
            placeholder: 'e.g., "Contracts awaiting signature"',
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
    static ɵfac = function ComponentsShowcaseComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || ComponentsShowcaseComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: ComponentsShowcaseComponent, selectors: [["app-components"]], decls: 187, vars: 17, consts: [[1, "components-page"], [1, "page-header"], [1, "subtitle"], [1, "description"], [1, "action-buttons"], ["mat-raised-button", "", "color", "primary", 3, "click"], [1, "selection-demo", 3, "selectedCount", "selectedItems"], [1, "section"], [1, "section-description"], [3, "columns"], ["title", "Documents", "icon", "folder", "iconColor", "var(--mat-sys-primary, #1976d2)", 3, "headingLevel"], [1, "widget-content"], [1, "stat-value"], [1, "stat-label"], ["title", "Storage", "icon", "storage", "iconColor", "var(--mat-sys-tertiary, #388e3c)", 3, "headingLevel"], ["title", "Users", "icon", "people", "iconColor", "var(--mat-sys-error, #f57c00)", 3, "headingLevel"], ["title", "Recent Activity", "icon", "notifications", 3, "headingLevel"], [1, "activity-list"], [1, "activity-item"], [1, "activity-icon", "success"], [1, "activity-details"], [1, "activity-title"], [1, "activity-time"], [1, "activity-icon", "warning"], [1, "activity-icon", "info"], ["title", "Dialog Components", 3, "headingLevel"], [1, "component-list"], [1, "component-item"], [1, "badge", "live"], [1, "component-desc"], [1, "badge"], ["title", "Display Components", 3, "headingLevel"], [1, "badge", "active"], [1, "code-card"], [1, "code-block"], [1, "info-banner"], [1, "selection-demo", 3, "cleared", "selectedCount", "selectedItems"]], template: function ComponentsShowcaseComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "header", 1)(2, "div")(3, "h1");
            i0.ɵɵtext(4, "UI Components Library");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "p", 2);
            i0.ɵɵtext(6, " All components are imported from ");
            i0.ɵɵelementStart(7, "code");
            i0.ɵɵtext(8, "@nuxeo/satori-platform/ui");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(9, "p", 3);
            i0.ɵɵtext(10, " This showcase demonstrates every UI component available to customer extensions. Click the buttons below to interact with each component. ");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(11, "div", 4)(12, "button", 5);
            i0.ɵɵlistener("click", function ComponentsShowcaseComponent_Template_button_click_12_listener() { return ctx.openConfirmDialog(); });
            i0.ɵɵelementStart(13, "mat-icon");
            i0.ɵɵtext(14, "help_outline");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(15, " Confirm Dialog ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(16, "button", 5);
            i0.ɵɵlistener("click", function ComponentsShowcaseComponent_Template_button_click_16_listener() { return ctx.openShareDialog(); });
            i0.ɵɵelementStart(17, "mat-icon");
            i0.ɵɵtext(18, "share");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(19, " Share Dialog ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "button", 5);
            i0.ɵɵlistener("click", function ComponentsShowcaseComponent_Template_button_click_20_listener() { return ctx.openExportDialog(); });
            i0.ɵɵelementStart(21, "mat-icon");
            i0.ɵɵtext(22, "download");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(23, " Export Dialog ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "button", 5);
            i0.ɵɵlistener("click", function ComponentsShowcaseComponent_Template_button_click_24_listener() { return ctx.openSavedSearchDialog(); });
            i0.ɵɵelementStart(25, "mat-icon");
            i0.ɵɵtext(26, "save");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(27, " Save Search ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(28, "button", 5);
            i0.ɵɵlistener("click", function ComponentsShowcaseComponent_Template_button_click_28_listener() { return ctx.toggleSelection(); });
            i0.ɵɵelementStart(29, "mat-icon");
            i0.ɵɵtext(30, "check_box");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(31, " Selection Bar ");
            i0.ɵɵelementEnd()()();
            i0.ɵɵconditionalCreate(32, ComponentsShowcaseComponent_Conditional_32_Template, 1, 2, "lib-selection-topbar", 6);
            i0.ɵɵelementStart(33, "section", 7)(34, "h2")(35, "mat-icon");
            i0.ɵɵtext(36, "view_module");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(37, " Layout Components ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(38, "p", 8)(39, "code");
            i0.ɵɵtext(40, "WidgetGridComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(41, " and ");
            i0.ɵɵelementStart(42, "code");
            i0.ɵɵtext(43, "WidgetContainerComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(44, " provide responsive grid layouts and card-style containers for building dashboards. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(45, "lib-widget-grid", 9)(46, "lib-widget-container", 10)(47, "div", 11)(48, "div", 12);
            i0.ɵɵtext(49, "1,247");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(50, "div", 13);
            i0.ɵɵtext(51, "Total documents");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(52, "lib-widget-container", 14)(53, "div", 11)(54, "div", 12);
            i0.ɵɵtext(55, "24.8 GB");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(56, "div", 13);
            i0.ɵɵtext(57, "Used storage");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(58, "lib-widget-container", 15)(59, "div", 11)(60, "div", 12);
            i0.ɵɵtext(61, "42");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(62, "div", 13);
            i0.ɵɵtext(63, "Active users");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(64, "section", 7)(65, "h2")(66, "mat-icon");
            i0.ɵɵtext(67, "history");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(68, " Widget Container Example ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(69, "lib-widget-container", 16)(70, "div", 17)(71, "div", 18)(72, "mat-icon", 19);
            i0.ɵɵtext(73, "check_circle");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(74, "div", 20)(75, "div", 21);
            i0.ɵɵtext(76, "Document uploaded successfully");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(77, "div", 22);
            i0.ɵɵtext(78, "2 minutes ago");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(79, "div", 18)(80, "mat-icon", 23);
            i0.ɵɵtext(81, "schedule");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(82, "div", 20)(83, "div", 21);
            i0.ɵɵtext(84, "Workflow pending approval");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(85, "div", 22);
            i0.ɵɵtext(86, "15 minutes ago");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(87, "div", 18)(88, "mat-icon", 24);
            i0.ɵɵtext(89, "person_add");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(90, "div", 20)(91, "div", 21);
            i0.ɵɵtext(92, "New user added to workspace");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(93, "div", 22);
            i0.ɵɵtext(94, "1 hour ago");
            i0.ɵɵelementEnd()()()()()();
            i0.ɵɵelementStart(95, "section", 7)(96, "h2")(97, "mat-icon");
            i0.ɵɵtext(98, "code");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(99, " Available Components ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(100, "lib-widget-grid", 9)(101, "lib-widget-container", 25)(102, "div", 26)(103, "div", 27)(104, "code");
            i0.ɵɵtext(105, "ConfirmDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(106, "span", 28);
            i0.ɵɵtext(107, "Live demo above");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(108, "p", 29);
            i0.ɵɵtext(109, "Confirmation prompts for destructive actions");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(110, "div", 27)(111, "code");
            i0.ɵɵtext(112, "ShareDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(113, "span", 28);
            i0.ɵɵtext(114, "Live demo above");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(115, "p", 29);
            i0.ɵɵtext(116, "Document sharing with link copying");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(117, "div", 27)(118, "code");
            i0.ɵɵtext(119, "ExportDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(120, "span", 28);
            i0.ɵɵtext(121, "Live demo above");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(122, "p", 29);
            i0.ɵɵtext(123, "Export options (PDF, ZIP, XML, Thumbnail)");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(124, "div", 27)(125, "code");
            i0.ɵɵtext(126, "SavedSearchDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(127, "span", 28);
            i0.ɵɵtext(128, "Live demo above");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(129, "p", 29);
            i0.ɵɵtext(130, "Save and manage search queries");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(131, "div", 27)(132, "code");
            i0.ɵɵtext(133, "DocumentCompareDialogComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(134, "span", 30);
            i0.ɵɵtext(135, "Requires documents");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(136, "p", 29);
            i0.ɵɵtext(137, "Side-by-side document comparison");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(138, "lib-widget-container", 31)(139, "div", 26)(140, "div", 27)(141, "code");
            i0.ɵɵtext(142, "SelectionTopbarComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(143, "span", 28);
            i0.ɵɵtext(144, "Live demo above");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(145, "p", 29);
            i0.ɵɵtext(146, "Bulk action bar for selected items");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(147, "div", 27)(148, "code");
            i0.ɵɵtext(149, "WidgetGridComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(150, "span", 32);
            i0.ɵɵtext(151, "In use on this page");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(152, "p", 29);
            i0.ɵɵtext(153, "Responsive grid layout system");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(154, "div", 27)(155, "code");
            i0.ɵɵtext(156, "WidgetContainerComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(157, "span", 32);
            i0.ɵɵtext(158, "In use on this page");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(159, "p", 29);
            i0.ɵɵtext(160, "Card-style container with header");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(161, "div", 27)(162, "code");
            i0.ɵɵtext(163, "DocumentViewerComponent");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(164, "span", 30);
            i0.ɵɵtext(165, "Requires document");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(166, "p", 29);
            i0.ɵɵtext(167, "Rich document preview component");
            i0.ɵɵelementEnd()()()()()();
            i0.ɵɵelementStart(168, "section", 7)(169, "h2")(170, "mat-icon");
            i0.ɵɵtext(171, "integration_instructions");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(172, " Usage in Your Extension ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(173, "mat-card", 33)(174, "mat-card-content")(175, "pre", 34);
            i0.ɵɵtext(176);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(177, "div", 35)(178, "mat-icon");
            i0.ɵɵtext(179, "info");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(180, "div")(181, "strong");
            i0.ɵɵtext(182, "For customer extensions:");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(183, " All components shown are available in your Layer 2 extension code. Import them from ");
            i0.ɵɵelementStart(184, "code");
            i0.ɵɵtext(185, "@nuxeo/satori-platform/ui");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(186, " and use them in your own pages, dialogs, and dashboards. No forking required. ");
            i0.ɵɵelementEnd()()();
        } if (rf & 2) {
            i0.ɵɵadvance(32);
            i0.ɵɵconditional(ctx.showSelection() ? 32 : -1);
            i0.ɵɵadvance(13);
            i0.ɵɵproperty("columns", 3);
            i0.ɵɵadvance();
            i0.ɵɵproperty("headingLevel", 3);
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("headingLevel", 3);
            i0.ɵɵadvance(6);
            i0.ɵɵproperty("headingLevel", 3);
            i0.ɵɵadvance(11);
            i0.ɵɵproperty("headingLevel", 3);
            i0.ɵɵadvance(31);
            i0.ɵɵproperty("columns", 2);
            i0.ɵɵadvance();
            i0.ɵɵproperty("headingLevel", 3);
            i0.ɵɵadvance(37);
            i0.ɵɵproperty("headingLevel", 3);
            i0.ɵɵadvance(38);
            i0.ɵɵtextInterpolate8("import ", "{", " Component ", "}", " from '@angular/core';\n\n// Import components from the platform package\nimport ", "{", "\n  WidgetContainerComponent,\n  WidgetGridComponent,\n  ConfirmDialogComponent,\n", "}", " from '@nuxeo/satori-platform/ui';\n\n@Component(", "{", "\n  selector: 'app-my-dashboard',\n  standalone: true,\n  imports: [\n    WidgetContainerComponent,\n    WidgetGridComponent,\n  ],\n  template: \\`\n    <lib-widget-grid [columns]=\"3\">\n      <lib-widget-container title=\"My Widget\" icon=\"dashboard\">\n        <!-- Your content -->\n      </lib-widget-container>\n    </lib-widget-grid>\n  \\`\n", "}", ")\nexport class MyDashboardComponent ", "{", " ", "}");
        } }, dependencies: [CommonModule,
            MatButtonModule, i1.MatButton, MatCardModule, i2.MatCard, i2.MatCardContent, MatDialogModule,
            MatIconModule, i3.MatIcon, WidgetContainerComponent,
            WidgetGridComponent,
            SelectionTopbarComponent], styles: ["//[_ngcontent-%COMP%]   This[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   shipped[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   customers[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   worked[_ngcontent-%COMP%]   example[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   template[_ngcontent-%COMP%], so\n//[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   follows[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   rule[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   guardrails[_ngcontent-%COMP%]   enforce[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   describing[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]:\n//   every[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   resolves[_ngcontent-%COMP%]   through[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   theme[_ngcontent-%COMP%]   token[_ngcontent-%COMP%], with[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   previous[_ngcontent-%COMP%]   literal[_ngcontent-%COMP%]   kept\n//[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   fallback.[_ngcontent-%COMP%]   A[_ngcontent-%COMP%]   rebrand[_ngcontent-%COMP%]   via[_ngcontent-%COMP%]   Layer[_ngcontent-%COMP%]   0[_ngcontent-%COMP%]   therefore[_ngcontent-%COMP%]   restyles[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   too[_ngcontent-%COMP%], \n//   instead   of   leaving   it   stranded   in   the   old   palette.\n[_nghost-%COMP%] {\n  --tpl-text-muted: var(--mat-sys-on-surface-variant, #666);\n  --tpl-accent: var(--mat-sys-primary, #1976d2);\n  --tpl-divider: var(--mat-sys-outline-variant, #f0f0f0);\n  --tpl-code-surface: var(--mat-sys-surface-container, #f5f5f5);\n  --tpl-code-bg: var(--mat-sys-inverse-surface, #263238);\n  --tpl-code-fg: var(--mat-sys-inverse-primary, #aed581);\n  --tpl-status-success: var(--mat-sys-tertiary, #388e3c);\n  // See the note in `contracts-page.component.scss`: `--mat-sys-error` fuses warning to\n  // error permanently. `--shell-warn-fg` is declared beside the rest of the warn family\n  // in this app's `styles.scss`.\n  --tpl-status-warning: var(--shell-warn-fg, #f57c00);\n  --tpl-status-info: var(--mat-sys-primary, #1976d2);\n  --tpl-badge-bg: var(--mat-sys-surface-variant, #e0e0e0);\n  --tpl-badge-fg: var(--mat-sys-on-surface-variant, #424242);\n  --tpl-badge-live-bg: var(--mat-sys-tertiary-container, #c8e6c9);\n  --tpl-badge-live-fg: var(--mat-sys-on-tertiary-container, #2e7d32);\n  --tpl-badge-active-bg: var(--mat-sys-primary-container, #bbdefb);\n  --tpl-badge-active-fg: var(--mat-sys-on-primary-container, #1565c0);\n  --tpl-banner-bg: var(--mat-sys-primary-container, #e3f2fd);\n  --tpl-banner-code-bg: var(--mat-sys-surface, rgba(255, 255, 255, 0.7));\n}\n\n$code-font:[_ngcontent-%COMP%]   'Monaco',[_ngcontent-%COMP%]   'Courier[_ngcontent-%COMP%]   New',[_ngcontent-%COMP%]   monospace;\n\n.components-page[_ngcontent-%COMP%] {\n  padding: 2rem;\n  max-width: 1400px;\n  margin: 0 auto;\n}\n\n.page-header[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n\n  h1 {\n    margin: 0 0 0.5rem 0;\n    font-size: 2rem;\n    font-weight: 500;\n  }\n\n  .subtitle {\n    color: var(--tpl-text-muted);\n    margin: 0 0 1rem 0;\n    font-size: 0.875rem;\n\n    code {\n      background: var(--tpl-code-surface);\n      padding: 0.125rem 0.375rem;\n      border-radius: 3px;\n      font-family: $code-font;\n      font-size: 0.875rem;\n    }\n  }\n\n  .description {\n    color: var(--tpl-text-muted);\n    margin: 0 0 1.5rem 0;\n    line-height: 1.6;\n  }\n\n  .action-buttons {\n    display: flex;\n    gap: 0.5rem;\n    flex-wrap: wrap;\n    margin-top: 1rem;\n\n    button {\n      display: inline-flex;\n      align-items: center;\n      gap: 0.5rem;\n    }\n  }\n}\n\n.selection-demo[_ngcontent-%COMP%] {\n  margin-bottom: 2rem;\n}\n\n.section[_ngcontent-%COMP%] {\n  margin-bottom: 3rem;\n\n  h2 {\n    display: flex;\n    align-items: center;\n    gap: 0.5rem;\n    margin: 0 0 0.5rem 0;\n    font-size: 1.5rem;\n    font-weight: 500;\n\n    mat-icon {\n      color: var(--tpl-accent);\n    }\n  }\n\n  .section-description {\n    color: var(--tpl-text-muted);\n    margin: 0 0 1.5rem 0;\n    line-height: 1.6;\n\n    code {\n      background: var(--tpl-code-surface);\n      padding: 0.125rem 0.375rem;\n      border-radius: 3px;\n      font-family: $code-font;\n      font-size: 0.875rem;\n    }\n  }\n}\n\n.widget-content[_ngcontent-%COMP%] {\n  padding: 2rem 1.5rem;\n  text-align: center;\n\n  .stat-value {\n    font-size: 2.5rem;\n    font-weight: 500;\n    margin-bottom: 0.5rem;\n  }\n\n  .stat-label {\n    color: var(--tpl-text-muted);\n    font-size: 0.875rem;\n  }\n}\n\n.activity-list[_ngcontent-%COMP%] {\n  padding: 0.5rem;\n}\n\n.activity-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: start;\n  gap: 1rem;\n  padding: 1rem;\n  border-bottom: 1px solid var(--tpl-divider);\n\n  &:last-child {\n    border-bottom: none;\n  }\n\n  .activity-icon {\n    flex-shrink: 0;\n\n    &.success {\n      color: var(--tpl-status-success);\n    }\n\n    &.warning {\n      color: var(--tpl-status-warning);\n    }\n\n    &.info {\n      color: var(--tpl-status-info);\n    }\n  }\n\n  .activity-details {\n    flex: 1;\n  }\n\n  .activity-title {\n    font-weight: 500;\n    margin-bottom: 0.25rem;\n  }\n\n  .activity-time {\n    color: var(--tpl-text-muted);\n    font-size: 0.875rem;\n  }\n}\n\n.component-list[_ngcontent-%COMP%] {\n  padding: 1rem;\n\n  .component-item {\n    padding: 1rem;\n    border-bottom: 1px solid var(--tpl-divider);\n\n    &:last-child {\n      border-bottom: none;\n    }\n\n    code {\n      display: inline-block;\n      background: var(--tpl-code-bg);\n      color: var(--tpl-code-fg);\n      padding: 0.25rem 0.5rem;\n      border-radius: 4px;\n      font-family: $code-font;\n      font-size: 0.875rem;\n      margin-bottom: 0.5rem;\n    }\n\n    .badge {\n      display: inline-block;\n      margin-left: 0.5rem;\n      padding: 0.125rem 0.5rem;\n      border-radius: 12px;\n      font-size: 0.75rem;\n      font-weight: 500;\n      background: var(--tpl-badge-bg);\n      color: var(--tpl-badge-fg);\n\n      &.live {\n        background: var(--tpl-badge-live-bg);\n        color: var(--tpl-badge-live-fg);\n      }\n\n      &.active {\n        background: var(--tpl-badge-active-bg);\n        color: var(--tpl-badge-active-fg);\n      }\n    }\n\n    .component-desc {\n      color: var(--tpl-text-muted);\n      font-size: 0.875rem;\n      margin: 0.5rem 0 0 0;\n      line-height: 1.5;\n    }\n  }\n}\n\n.code-card[_ngcontent-%COMP%] {\n  margin-bottom: 1rem;\n\n  .code-block {\n    margin: 0;\n    padding: 1.5rem;\n    background: var(--tpl-code-bg);\n    color: var(--tpl-code-fg);\n    border-radius: 4px;\n    overflow-x: auto;\n    font-family: $code-font;\n    font-size: 0.875rem;\n    line-height: 1.6;\n  }\n}\n\n.info-banner[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: start;\n  gap: 1rem;\n  padding: 1.25rem;\n  background: var(--tpl-banner-bg);\n  border-left: 4px solid var(--tpl-accent);\n  border-radius: 4px;\n  margin-top: 2rem;\n\n  mat-icon {\n    color: var(--tpl-accent);\n    flex-shrink: 0;\n  }\n\n  strong {\n    font-weight: 600;\n  }\n\n  code {\n    background: var(--tpl-banner-code-bg);\n    padding: 0.125rem 0.375rem;\n    border-radius: 3px;\n    font-family: $code-font;\n    font-size: 0.875rem;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(ComponentsShowcaseComponent, [{
        type: Component,
        args: [{ selector: 'app-components', standalone: true, imports: [
                    CommonModule,
                    MatButtonModule,
                    MatCardModule,
                    MatDialogModule,
                    MatIconModule,
                    WidgetContainerComponent,
                    WidgetGridComponent,
                    SelectionTopbarComponent,
                ], template: "<div class=\"components-page\">\n  <header class=\"page-header\">\n    <div>\n      <h1>UI Components Library</h1>\n      <p class=\"subtitle\">\n        All components are imported from\n        <code>&#64;nuxeo/satori-platform/ui</code>\n      </p>\n      <p class=\"description\">\n        This showcase demonstrates every UI component available to customer extensions. Click the\n        buttons below to interact with each component.\n      </p>\n    </div>\n\n    <div class=\"action-buttons\">\n      <button mat-raised-button color=\"primary\" (click)=\"openConfirmDialog()\">\n        <mat-icon>help_outline</mat-icon>\n        Confirm Dialog\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"openShareDialog()\">\n        <mat-icon>share</mat-icon>\n        Share Dialog\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"openExportDialog()\">\n        <mat-icon>download</mat-icon>\n        Export Dialog\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"openSavedSearchDialog()\">\n        <mat-icon>save</mat-icon>\n        Save Search\n      </button>\n      <button mat-raised-button color=\"primary\" (click)=\"toggleSelection()\">\n        <mat-icon>check_box</mat-icon>\n        Selection Bar\n      </button>\n    </div>\n  </header>\n\n  <!-- Selection Topbar Demo -->\n  @if (showSelection()) {\n    <lib-selection-topbar\n      [selectedCount]=\"mockSelectedItems().length\"\n      [selectedItems]=\"mockSelectedItems()\"\n      (cleared)=\"clearSelection()\"\n      class=\"selection-demo\"\n    />\n  }\n\n  <!-- Layout Components -->\n  <section class=\"section\">\n    <h2>\n      <mat-icon>view_module</mat-icon>\n      Layout Components\n    </h2>\n    <p class=\"section-description\">\n      <code>WidgetGridComponent</code> and <code>WidgetContainerComponent</code> provide responsive\n      grid layouts and card-style containers for building dashboards.\n    </p>\n\n    <lib-widget-grid [columns]=\"3\">\n      <lib-widget-container\n        [headingLevel]=\"3\"\n        title=\"Documents\"\n        icon=\"folder\"\n        iconColor=\"var(--mat-sys-primary, #1976d2)\"\n      >\n        <div class=\"widget-content\">\n          <div class=\"stat-value\">1,247</div>\n          <div class=\"stat-label\">Total documents</div>\n        </div>\n      </lib-widget-container>\n\n      <lib-widget-container\n        [headingLevel]=\"3\"\n        title=\"Storage\"\n        icon=\"storage\"\n        iconColor=\"var(--mat-sys-tertiary, #388e3c)\"\n      >\n        <div class=\"widget-content\">\n          <div class=\"stat-value\">24.8 GB</div>\n          <div class=\"stat-label\">Used storage</div>\n        </div>\n      </lib-widget-container>\n\n      <lib-widget-container\n        [headingLevel]=\"3\"\n        title=\"Users\"\n        icon=\"people\"\n        iconColor=\"var(--mat-sys-error, #f57c00)\"\n      >\n        <div class=\"widget-content\">\n          <div class=\"stat-value\">42</div>\n          <div class=\"stat-label\">Active users</div>\n        </div>\n      </lib-widget-container>\n    </lib-widget-grid>\n  </section>\n\n  <!-- Recent Activity -->\n  <section class=\"section\">\n    <h2>\n      <mat-icon>history</mat-icon>\n      Widget Container Example\n    </h2>\n\n    <lib-widget-container [headingLevel]=\"3\" title=\"Recent Activity\" icon=\"notifications\">\n      <div class=\"activity-list\">\n        <div class=\"activity-item\">\n          <mat-icon class=\"activity-icon success\">check_circle</mat-icon>\n          <div class=\"activity-details\">\n            <div class=\"activity-title\">Document uploaded successfully</div>\n            <div class=\"activity-time\">2 minutes ago</div>\n          </div>\n        </div>\n        <div class=\"activity-item\">\n          <mat-icon class=\"activity-icon warning\">schedule</mat-icon>\n          <div class=\"activity-details\">\n            <div class=\"activity-title\">Workflow pending approval</div>\n            <div class=\"activity-time\">15 minutes ago</div>\n          </div>\n        </div>\n        <div class=\"activity-item\">\n          <mat-icon class=\"activity-icon info\">person_add</mat-icon>\n          <div class=\"activity-details\">\n            <div class=\"activity-title\">New user added to workspace</div>\n            <div class=\"activity-time\">1 hour ago</div>\n          </div>\n        </div>\n      </div>\n    </lib-widget-container>\n  </section>\n\n  <!-- Component Reference -->\n  <section class=\"section\">\n    <h2>\n      <mat-icon>code</mat-icon>\n      Available Components\n    </h2>\n\n    <lib-widget-grid [columns]=\"2\">\n      <lib-widget-container [headingLevel]=\"3\" title=\"Dialog Components\">\n        <div class=\"component-list\">\n          <div class=\"component-item\">\n            <code>ConfirmDialogComponent</code>\n            <span class=\"badge live\">Live demo above</span>\n            <p class=\"component-desc\">Confirmation prompts for destructive actions</p>\n          </div>\n          <div class=\"component-item\">\n            <code>ShareDialogComponent</code>\n            <span class=\"badge live\">Live demo above</span>\n            <p class=\"component-desc\">Document sharing with link copying</p>\n          </div>\n          <div class=\"component-item\">\n            <code>ExportDialogComponent</code>\n            <span class=\"badge live\">Live demo above</span>\n            <p class=\"component-desc\">Export options (PDF, ZIP, XML, Thumbnail)</p>\n          </div>\n          <div class=\"component-item\">\n            <code>SavedSearchDialogComponent</code>\n            <span class=\"badge live\">Live demo above</span>\n            <p class=\"component-desc\">Save and manage search queries</p>\n          </div>\n          <div class=\"component-item\">\n            <code>DocumentCompareDialogComponent</code>\n            <span class=\"badge\">Requires documents</span>\n            <p class=\"component-desc\">Side-by-side document comparison</p>\n          </div>\n        </div>\n      </lib-widget-container>\n\n      <lib-widget-container [headingLevel]=\"3\" title=\"Display Components\">\n        <div class=\"component-list\">\n          <div class=\"component-item\">\n            <code>SelectionTopbarComponent</code>\n            <span class=\"badge live\">Live demo above</span>\n            <p class=\"component-desc\">Bulk action bar for selected items</p>\n          </div>\n          <div class=\"component-item\">\n            <code>WidgetGridComponent</code>\n            <span class=\"badge active\">In use on this page</span>\n            <p class=\"component-desc\">Responsive grid layout system</p>\n          </div>\n          <div class=\"component-item\">\n            <code>WidgetContainerComponent</code>\n            <span class=\"badge active\">In use on this page</span>\n            <p class=\"component-desc\">Card-style container with header</p>\n          </div>\n          <div class=\"component-item\">\n            <code>DocumentViewerComponent</code>\n            <span class=\"badge\">Requires document</span>\n            <p class=\"component-desc\">Rich document preview component</p>\n          </div>\n        </div>\n      </lib-widget-container>\n    </lib-widget-grid>\n  </section>\n\n  <!-- Code Example -->\n  <section class=\"section\">\n    <h2>\n      <mat-icon>integration_instructions</mat-icon>\n      Usage in Your Extension\n    </h2>\n\n    <mat-card class=\"code-card\">\n      <mat-card-content>\n        <pre class=\"code-block\">\nimport {{ '{' }} Component {{ '}' }} from '&#64;angular/core';\n\n// Import components from the platform package\nimport {{ '{' }}\n  WidgetContainerComponent,\n  WidgetGridComponent,\n  ConfirmDialogComponent,\n{{ '}' }} from '&#64;nuxeo/satori-platform/ui';\n\n&#64;Component({{ '{' }}\n  selector: 'app-my-dashboard',\n  standalone: true,\n  imports: [\n    WidgetContainerComponent,\n    WidgetGridComponent,\n  ],\n  template: \\`\n    &lt;lib-widget-grid [columns]=\"3\"&gt;\n      &lt;lib-widget-container title=\"My Widget\" icon=\"dashboard\"&gt;\n        &lt;!-- Your content --&gt;\n      &lt;/lib-widget-container&gt;\n    &lt;/lib-widget-grid&gt;\n  \\`\n{{ '}' }})\nexport class MyDashboardComponent {{ '{' }} {{ '}' }}</pre>\n      </mat-card-content>\n    </mat-card>\n  </section>\n\n  <!-- Integration Note -->\n  <div class=\"info-banner\">\n    <mat-icon>info</mat-icon>\n    <div>\n      <strong>For customer extensions:</strong>\n      All components shown are available in your Layer 2 extension code. Import them from\n      <code>&#64;nuxeo/satori-platform/ui</code> and use them in your own pages, dialogs, and\n      dashboards. No forking required.\n    </div>\n  </div>\n</div>\n", styles: ["// This page is shipped to customers as the worked example of the template, so\n// it follows the rule the guardrails enforce rather than only describing it:\n// every colour resolves through a theme token, with the previous literal kept\n// as the fallback. A rebrand via Layer 0 therefore restyles this page too,\n// instead of leaving it stranded in the old palette.\n:host {\n  --tpl-text-muted: var(--mat-sys-on-surface-variant, #666);\n  --tpl-accent: var(--mat-sys-primary, #1976d2);\n  --tpl-divider: var(--mat-sys-outline-variant, #f0f0f0);\n  --tpl-code-surface: var(--mat-sys-surface-container, #f5f5f5);\n  --tpl-code-bg: var(--mat-sys-inverse-surface, #263238);\n  --tpl-code-fg: var(--mat-sys-inverse-primary, #aed581);\n  --tpl-status-success: var(--mat-sys-tertiary, #388e3c);\n  // See the note in `contracts-page.component.scss`: `--mat-sys-error` fuses warning to\n  // error permanently. `--shell-warn-fg` is declared beside the rest of the warn family\n  // in this app's `styles.scss`.\n  --tpl-status-warning: var(--shell-warn-fg, #f57c00);\n  --tpl-status-info: var(--mat-sys-primary, #1976d2);\n  --tpl-badge-bg: var(--mat-sys-surface-variant, #e0e0e0);\n  --tpl-badge-fg: var(--mat-sys-on-surface-variant, #424242);\n  --tpl-badge-live-bg: var(--mat-sys-tertiary-container, #c8e6c9);\n  --tpl-badge-live-fg: var(--mat-sys-on-tertiary-container, #2e7d32);\n  --tpl-badge-active-bg: var(--mat-sys-primary-container, #bbdefb);\n  --tpl-badge-active-fg: var(--mat-sys-on-primary-container, #1565c0);\n  --tpl-banner-bg: var(--mat-sys-primary-container, #e3f2fd);\n  --tpl-banner-code-bg: var(--mat-sys-surface, rgba(255, 255, 255, 0.7));\n}\n\n$code-font: 'Monaco', 'Courier New', monospace;\n\n.components-page {\n  padding: 2rem;\n  max-width: 1400px;\n  margin: 0 auto;\n}\n\n.page-header {\n  margin-bottom: 2rem;\n\n  h1 {\n    margin: 0 0 0.5rem 0;\n    font-size: 2rem;\n    font-weight: 500;\n  }\n\n  .subtitle {\n    color: var(--tpl-text-muted);\n    margin: 0 0 1rem 0;\n    font-size: 0.875rem;\n\n    code {\n      background: var(--tpl-code-surface);\n      padding: 0.125rem 0.375rem;\n      border-radius: 3px;\n      font-family: $code-font;\n      font-size: 0.875rem;\n    }\n  }\n\n  .description {\n    color: var(--tpl-text-muted);\n    margin: 0 0 1.5rem 0;\n    line-height: 1.6;\n  }\n\n  .action-buttons {\n    display: flex;\n    gap: 0.5rem;\n    flex-wrap: wrap;\n    margin-top: 1rem;\n\n    button {\n      display: inline-flex;\n      align-items: center;\n      gap: 0.5rem;\n    }\n  }\n}\n\n.selection-demo {\n  margin-bottom: 2rem;\n}\n\n.section {\n  margin-bottom: 3rem;\n\n  h2 {\n    display: flex;\n    align-items: center;\n    gap: 0.5rem;\n    margin: 0 0 0.5rem 0;\n    font-size: 1.5rem;\n    font-weight: 500;\n\n    mat-icon {\n      color: var(--tpl-accent);\n    }\n  }\n\n  .section-description {\n    color: var(--tpl-text-muted);\n    margin: 0 0 1.5rem 0;\n    line-height: 1.6;\n\n    code {\n      background: var(--tpl-code-surface);\n      padding: 0.125rem 0.375rem;\n      border-radius: 3px;\n      font-family: $code-font;\n      font-size: 0.875rem;\n    }\n  }\n}\n\n.widget-content {\n  padding: 2rem 1.5rem;\n  text-align: center;\n\n  .stat-value {\n    font-size: 2.5rem;\n    font-weight: 500;\n    margin-bottom: 0.5rem;\n  }\n\n  .stat-label {\n    color: var(--tpl-text-muted);\n    font-size: 0.875rem;\n  }\n}\n\n.activity-list {\n  padding: 0.5rem;\n}\n\n.activity-item {\n  display: flex;\n  align-items: start;\n  gap: 1rem;\n  padding: 1rem;\n  border-bottom: 1px solid var(--tpl-divider);\n\n  &:last-child {\n    border-bottom: none;\n  }\n\n  .activity-icon {\n    flex-shrink: 0;\n\n    &.success {\n      color: var(--tpl-status-success);\n    }\n\n    &.warning {\n      color: var(--tpl-status-warning);\n    }\n\n    &.info {\n      color: var(--tpl-status-info);\n    }\n  }\n\n  .activity-details {\n    flex: 1;\n  }\n\n  .activity-title {\n    font-weight: 500;\n    margin-bottom: 0.25rem;\n  }\n\n  .activity-time {\n    color: var(--tpl-text-muted);\n    font-size: 0.875rem;\n  }\n}\n\n.component-list {\n  padding: 1rem;\n\n  .component-item {\n    padding: 1rem;\n    border-bottom: 1px solid var(--tpl-divider);\n\n    &:last-child {\n      border-bottom: none;\n    }\n\n    code {\n      display: inline-block;\n      background: var(--tpl-code-bg);\n      color: var(--tpl-code-fg);\n      padding: 0.25rem 0.5rem;\n      border-radius: 4px;\n      font-family: $code-font;\n      font-size: 0.875rem;\n      margin-bottom: 0.5rem;\n    }\n\n    .badge {\n      display: inline-block;\n      margin-left: 0.5rem;\n      padding: 0.125rem 0.5rem;\n      border-radius: 12px;\n      font-size: 0.75rem;\n      font-weight: 500;\n      background: var(--tpl-badge-bg);\n      color: var(--tpl-badge-fg);\n\n      &.live {\n        background: var(--tpl-badge-live-bg);\n        color: var(--tpl-badge-live-fg);\n      }\n\n      &.active {\n        background: var(--tpl-badge-active-bg);\n        color: var(--tpl-badge-active-fg);\n      }\n    }\n\n    .component-desc {\n      color: var(--tpl-text-muted);\n      font-size: 0.875rem;\n      margin: 0.5rem 0 0 0;\n      line-height: 1.5;\n    }\n  }\n}\n\n.code-card {\n  margin-bottom: 1rem;\n\n  .code-block {\n    margin: 0;\n    padding: 1.5rem;\n    background: var(--tpl-code-bg);\n    color: var(--tpl-code-fg);\n    border-radius: 4px;\n    overflow-x: auto;\n    font-family: $code-font;\n    font-size: 0.875rem;\n    line-height: 1.6;\n  }\n}\n\n.info-banner {\n  display: flex;\n  align-items: start;\n  gap: 1rem;\n  padding: 1.25rem;\n  background: var(--tpl-banner-bg);\n  border-left: 4px solid var(--tpl-accent);\n  border-radius: 4px;\n  margin-top: 2rem;\n\n  mat-icon {\n    color: var(--tpl-accent);\n    flex-shrink: 0;\n  }\n\n  strong {\n    font-weight: 600;\n  }\n\n  code {\n    background: var(--tpl-banner-code-bg);\n    padding: 0.125rem 0.375rem;\n    border-radius: 3px;\n    font-family: $code-font;\n    font-size: 0.875rem;\n  }\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(ComponentsShowcaseComponent, { className: "ComponentsShowcaseComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/components/components.ts", lineNumber: 47 }); })();
