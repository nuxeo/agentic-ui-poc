import { Component, DestroyRef, HostListener, ViewChild, computed, effect, inject, signal, } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, filter, finalize, map, of, switchMap, } from 'rxjs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import { SatPlatformNavModule, SatPlatformNavStateService, } from '@hylandsoftware/satori-ui/platform-nav';
import { CollectionService, DocumentDetailService, BrowseContextService, SearchService, SelectionService, readClipboardDocs, isBrowseRouterUrl, parseBrowseNuxeoPathFromRouterUrl, toBrowseRouterUrl, docTypeIcon, } from '@nuxeo/satori-platform/nuxeo-client';
import { SelectionTopbarComponent } from '@nuxeo/satori-platform/ui';
import { AiChatService, AiFeatureFlagService } from '@agentic-ui/shared/ai-client';
import { AppConfigService } from '@nuxeo/satori-platform/app-config';
import { APP_NAV_ITEMS, PACKAGED_NAV_ITEMS } from '@nuxeo/satori-platform/extensions';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { SessionTimeoutService } from '../auth/session-timeout.service';
import { SETTINGS_DRAWER_ITEMS, toAppNavItem } from '../platform-nav-items';
import { ThemingFeatureFlagService } from '../theme/theming-feature-flag.service';
import { drawerItemForPath } from './drawer-route-match';
import { NavDrawerComponent } from './nav-drawer/nav-drawer.component';
import { PresetBadgeComponent } from './preset-badge/preset-badge.component';
import { AiMarkdownPipe } from '../pipes/ai-markdown.pipe';
import * as i0 from "@angular/core";
import * as i1 from "@hylandsoftware/satori-ui/platform-nav";
import * as i2 from "@hylandsoftware/satori-ui/app-header";
import * as i3 from "@hylandsoftware/satori-ui/logo";
import * as i4 from "@angular/material/menu";
import * as i5 from "@angular/material/button";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/sidenav";
import * as i8 from "@angular/forms";
const _c0 = ["globalSearchContainer"];
const _forTrack0 = ($index, $item) => $item.id;
const _forTrack1 = ($index, $item) => $item.timestamp;
const _forTrack2 = ($index, $item) => $item.kind + ":" + $item.id;
const _forTrack3 = ($index, $item) => $item.uid;
function AppShellComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "lib-selection-topbar", 39);
    i0.ɵɵlistener("cleared", function AppShellComponent_Conditional_0_Template_lib_selection_topbar_cleared_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.selectionService.clear()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("selectedCount", ctx_r2.selectionService.selectedCount())("selectedItems", ctx_r2.selectionService.selectedItems())("clearOnly", ctx_r2.selectionService.clearOnlyMode());
} }
function AppShellComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "sat-platform-nav-list-item", 40);
    i0.ɵɵlistener("click", function AppShellComponent_For_4_Template_sat_platform_nav_list_item_click_0_listener($event) { const item_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onNavClick(item_r5, $event)); });
    i0.ɵɵelement(1, "sat-platform-nav-avatar", 41);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵstyleProp("--nav-clipboard-count", item_r5.path === "/clipboard" ? ctx_r2.clipboardBadgeCssContent() : null);
    i0.ɵɵclassProp("nav-item--clipboard-badge", item_r5.path === "/clipboard" && ctx_r2.clipboardCount() > 0);
    i0.ɵɵproperty("active", ctx_r2.isActive(item_r5.path));
    i0.ɵɵattribute("data-nav-id", item_r5.id)("aria-label", ctx_r2.clipboardNavAriaLabel(item_r5));
    i0.ɵɵadvance();
    i0.ɵɵproperty("item", item_r5);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.navText(item_r5), " ");
} }
function AppShellComponent_Conditional_27_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "shell.search.searching"));
} }
function AppShellComponent_Conditional_27_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r2.globalSearchError());
} }
function AppShellComponent_Conditional_27_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "shell.search.no-results"));
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 49);
} if (rf & 2) {
    const result_r7 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl)("alt", result_r7.displayLabel);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 50)(1, "mat-icon");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const result_r7 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.docTypeIcon(result_r7.kind));
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_1_Conditional_0_Template, 1, 2, "img", 49)(1, AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_1_Conditional_1_Template, 3, 1, "span", 50);
} if (rf & 2) {
    let tmp_15_0;
    const result_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional((tmp_15_0 = ctx_r2.thumbnailUrl(result_r7)) ? 0 : 1, tmp_15_0);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 45)(1, "mat-icon");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const result_r7 = i0.ɵɵnextContext().$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.userGroupIcon(result_r7));
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_For_6_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mark", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const part_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(part_r8.text);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_For_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const part_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(part_r8.text);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AppShellComponent_Conditional_27_Conditional_4_For_1_For_6_Conditional_0_Template, 2, 1, "mark", 51)(1, AppShellComponent_Conditional_27_Conditional_4_For_1_For_6_Conditional_1_Template, 2, 1, "span");
} if (rf & 2) {
    const part_r8 = ctx.$implicit;
    i0.ɵɵconditional(part_r8.matched ? 0 : 1);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_For_9_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mark", 51);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const part_r9 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(part_r9.text);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_For_9_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const part_r9 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(part_r9.text);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, AppShellComponent_Conditional_27_Conditional_4_For_1_For_9_Conditional_0_Template, 2, 1, "mark", 51)(1, AppShellComponent_Conditional_27_Conditional_4_For_1_For_9_Conditional_1_Template, 2, 1, "span");
} if (rf & 2) {
    const part_r9 = ctx.$implicit;
    i0.ɵɵconditional(part_r9.matched ? 0 : 1);
} }
function AppShellComponent_Conditional_27_Conditional_4_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 44);
    i0.ɵɵlistener("click", function AppShellComponent_Conditional_27_Conditional_4_For_1_Template_button_click_0_listener() { const result_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.onGlobalSearchSelect(result_r7)); });
    i0.ɵɵconditionalCreate(1, AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_1_Template, 2, 1)(2, AppShellComponent_Conditional_27_Conditional_4_For_1_Conditional_2_Template, 3, 1, "span", 45);
    i0.ɵɵelementStart(3, "span", 46)(4, "span", 47);
    i0.ɵɵrepeaterCreate(5, AppShellComponent_Conditional_27_Conditional_4_For_1_For_6_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 48);
    i0.ɵɵrepeaterCreate(8, AppShellComponent_Conditional_27_Conditional_4_For_1_For_9_Template, 2, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const result_r7 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(result_r7.kind === "document" ? 1 : 2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", result_r7.displayLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r2.labelHighlightParts(result_r7));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r2.subtextHighlightParts(result_r7));
} }
function AppShellComponent_Conditional_27_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, AppShellComponent_Conditional_27_Conditional_4_For_1_Template, 10, 2, "button", 43, _forTrack2);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r2.globalSearchResults());
} }
function AppShellComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵconditionalCreate(1, AppShellComponent_Conditional_27_Conditional_1_Template, 3, 3, "div", 42)(2, AppShellComponent_Conditional_27_Conditional_2_Template, 2, 1, "div", 42)(3, AppShellComponent_Conditional_27_Conditional_3_Template, 3, 3, "div", 42)(4, AppShellComponent_Conditional_27_Conditional_4_Template, 2, 0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r2.globalSearchLoading() ? 1 : ctx_r2.globalSearchError() ? 2 : ctx_r2.globalSearchResults().length === 0 ? 3 : 4);
} }
function AppShellComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 14);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx.url, i0.ɵɵsanitizeUrl);
} }
function AppShellComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "sat-word-mark-logo", 15);
} }
function AppShellComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 52);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function AppShellComponent_Conditional_31_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.toggleAiChat()); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "auto_awesome");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r2.aiChatOpen());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 3, "shell.ai.open"));
} }
function AppShellComponent_Conditional_38_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "a", 19)(1, "mat-icon");
    i0.ɵɵtext(2, "palette");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "shell.menu.themes"), " ");
} }
function AppShellComponent_Conditional_69_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 32)(1, "mat-icon", 53);
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "h3");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "p");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 54)(10, "button", 55);
    i0.ɵɵlistener("click", function AppShellComponent_Conditional_69_Template_button_click_10_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.sendAiSuggestion("shell.ai.suggestion.modified-today")); });
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "button", 55);
    i0.ɵɵlistener("click", function AppShellComponent_Conditional_69_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.sendAiSuggestion("shell.ai.suggestion.summarize-tasks")); });
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "button", 55);
    i0.ɵɵlistener("click", function AppShellComponent_Conditional_69_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r11); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.sendAiSuggestion("shell.ai.suggestion.recent-uploads")); });
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 5, "shell.ai.heading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 7, "shell.ai.empty-state"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 9, "shell.ai.suggestion.modified-today"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 11, "shell.ai.suggestion.summarize-tasks"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 13, "shell.ai.suggestion.recent-uploads"), " ");
} }
function AppShellComponent_For_71_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 57)(1, "mat-icon", 62);
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd()();
} }
function AppShellComponent_For_71_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 59);
    i0.ɵɵpipe(1, "aiMarkdown");
} if (rf & 2) {
    const msg_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("innerHTML", i0.ɵɵpipeBind1(1, 1, msg_r12.content), i0.ɵɵsanitizeHtml);
} }
function AppShellComponent_For_71_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 60);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const msg_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(msg_r12.content);
} }
function AppShellComponent_For_71_Conditional_5_For_7_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 65);
    i0.ɵɵlistener("click", function AppShellComponent_For_71_Conditional_5_For_7_Template_button_click_0_listener() { const source_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.openAiSource(source_r14.uid, source_r14.type, source_r14.path)); });
    i0.ɵɵelementStart(1, "mat-icon", 66);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 67)(4, "span", 68);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 69);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "mat-icon", 70);
    i0.ɵɵtext(9, "open_in_new");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const source_r14 = ctx.$implicit;
    const ctx_r2 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r2.docTypeIcon(source_r14.type ?? "File"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(source_r14.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(source_r14.path);
} }
function AppShellComponent_For_71_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 61)(1, "div", 63)(2, "mat-icon");
    i0.ɵɵtext(3, "link");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(6, AppShellComponent_For_71_Conditional_5_For_7_Template, 10, 3, "button", 64, _forTrack3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const msg_r12 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 1, "shell.ai.sources"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(msg_r12.sources);
} }
function AppShellComponent_For_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 56);
    i0.ɵɵconditionalCreate(1, AppShellComponent_For_71_Conditional_1_Template, 3, 0, "div", 57);
    i0.ɵɵelementStart(2, "div", 58);
    i0.ɵɵconditionalCreate(3, AppShellComponent_For_71_Conditional_3_Template, 2, 3, "div", 59)(4, AppShellComponent_For_71_Conditional_4_Template, 2, 1, "div", 60);
    i0.ɵɵconditionalCreate(5, AppShellComponent_For_71_Conditional_5_Template, 8, 3, "div", 61);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const msg_r12 = ctx.$implicit;
    i0.ɵɵclassProp("user", msg_r12.role === "user")("assistant", msg_r12.role === "assistant");
    i0.ɵɵadvance();
    i0.ɵɵconditional(msg_r12.role === "assistant" ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(msg_r12.role === "assistant" ? 3 : 4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((msg_r12.sources == null ? null : msg_r12.sources.length) ? 5 : -1);
} }
function AppShellComponent_Conditional_72_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 34)(1, "mat-icon", 62);
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 71);
    i0.ɵɵelement(4, "span", 72)(5, "span", 72)(6, "span", 72);
    i0.ɵɵelementEnd()();
} }
function AppShellComponent_Conditional_73_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 35)(1, "mat-icon");
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r2.aiChat.error(), " ");
} }
export class AppShellComponent {
    globalSearchContainer;
    settingsDrawerItem = {
        id: 'app.navbar.settings',
        labelKey: 'nav.item.settings',
        label: 'Settings',
        path: '/settings',
        icon: 'settings',
        hasDrawer: true,
    };
    router = inject(Router);
    platformNavState = inject(SatPlatformNavStateService);
    auth = inject(AuthService);
    sessionTimeout = inject(SessionTimeoutService);
    snackBar = inject(MatSnackBar);
    selectionService = inject(SelectionService);
    collectionService = inject(CollectionService);
    detailService = inject(DocumentDetailService);
    searchService = inject(SearchService);
    browseContext = inject(BrowseContextService);
    destroyRef = inject(DestroyRef);
    appConfig = inject(AppConfigService);
    /** Layer 0 `branding.logo`; `null` keeps the Satori word mark. */
    brandLogo = this.appConfig.brandingLogo;
    translate = inject(TranslateService);
    /**
     * The active language, as a signal.
     *
     * `TranslateService.currentLang` is a plain getter and `instant()` is not reactive, so a
     * `computed()` that reads either would never recompute on a language change. `onLangChange`
     * is the only reactive surface ngx-translate offers for this.
     */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.currentLang });
    aiChat = inject(AiChatService);
    featureFlags = inject(AiFeatureFlagService);
    themingFlags = inject(ThemingFeatureFlagService);
    aiChatOpen = this.aiChat.panelOpen;
    aiChatInput = signal('', ...(ngDevMode ? [{ debugName: "aiChatInput" }] : []));
    searchInput$ = new Subject();
    /**
     * The navigation, resolved from the extension registry.
     *
     * Nothing is filtered here any more. Administration is hidden by the
     * `app.rules.hasAdministrationAccess` rule on its descriptor, which a manifest
     * can see, override or replace — the previous hardcoded `path === '/administration'`
     * test could do none of those.
     */
    navDescriptors = inject(APP_NAV_ITEMS);
    navItems = computed(() => this.navDescriptors().map(toAppNavItem), ...(ngDevMode ? [{ debugName: "navItems" }] : []));
    displayName = computed(() => this.auth.username() ?? 'User', ...(ngDevMode ? [{ debugName: "displayName" }] : []));
    drawerOpen = signal(false, ...(ngDevMode ? [{ debugName: "drawerOpen" }] : []));
    activeDrawerItem = signal(null, ...(ngDevMode ? [{ debugName: "activeDrawerItem" }] : []));
    clipboardCount = signal(this.readClipboardCount(), ...(ngDevMode ? [{ debugName: "clipboardCount" }] : []));
    clipboardBadgeLabel = computed(() => {
        const count = this.clipboardCount();
        return count > 99 ? '99+' : String(count);
    }, ...(ngDevMode ? [{ debugName: "clipboardBadgeLabel" }] : []));
    clipboardBadgeCssContent = computed(() => {
        const label = this.clipboardBadgeLabel();
        return this.clipboardCount() > 0 ? `"${label}"` : null;
    }, ...(ngDevMode ? [{ debugName: "clipboardBadgeCssContent" }] : []));
    favoritesCount = signal(0, ...(ngDevMode ? [{ debugName: "favoritesCount" }] : []));
    globalSearchTerm = signal('', ...(ngDevMode ? [{ debugName: "globalSearchTerm" }] : []));
    globalSearchLoading = signal(false, ...(ngDevMode ? [{ debugName: "globalSearchLoading" }] : []));
    globalSearchError = signal(null, ...(ngDevMode ? [{ debugName: "globalSearchError" }] : []));
    globalSearchResults = signal([], ...(ngDevMode ? [{ debugName: "globalSearchResults" }] : []));
    globalSearchOpen = signal(false, ...(ngDevMode ? [{ debugName: "globalSearchOpen" }] : []));
    thumbnailMap = signal({}, ...(ngDevMode ? [{ debugName: "thumbnailMap" }] : []));
    thumbnailSubs = [];
    highlightedSearchTerm = computed(() => this.globalSearchTerm().trim(), ...(ngDevMode ? [{ debugName: "highlightedSearchTerm" }] : []));
    currentUrl = signal(this.router.url.split('?')[0], ...(ngDevMode ? [{ debugName: "currentUrl" }] : []));
    pageTitle = computed(() => {
        const url = this.currentUrl();
        const parts = url.split('/').filter(Boolean);
        // Administration returns BEFORE the descriptor lookup below, so none of these titles ever
        // reached `navText` and all of them stayed English in every locale. The route is guarded by
        // `adminGuard`, so the pseudo-locale audit was redirected away from it and could not see them
        // either — which is how they survived being reported as fixed. Keyed here, at the only place
        // they are produced.
        if (parts[0] === 'administration') {
            const seg = parts[1] ?? 'analytics';
            if (seg === 'users-groups' && parts[2] === 'user' && parts[3]) {
                return this.translate.instant('admin.page-title.user-named', { name: parts[3] });
            }
            if (seg === 'users-groups' && parts[2] === 'group' && parts[3]) {
                return this.translate.instant('admin.page-title.group-named', { name: parts[3] });
            }
            // The drawer already owns a key for each of these pages, so they are reused rather than
            // duplicated: the same concept in the same product, which INFO-144 permits. Only the two
            // titles with no drawer entry need keys of their own.
            const titles = {
                analytics: 'drawer.administration-analytics',
                'users-groups': 'drawer.administration-users-groups',
                vocabularies: 'drawer.administration-vocabularies',
                audit: 'drawer.administration-audit',
                'cloud-services': 'admin.page-title.cloud-services',
                'nxql-search': 'drawer.administration-nxql-search',
            };
            return this.translate.instant(titles[seg] ?? 'admin.page-title.administration');
        }
        // Resolved entries first so a manifest relabel wins, then the packaged list
        // as a fallback. Matching only against `navItems()` — which is filtered —
        // meant hiding an entry by manifest or rule also stripped its page title,
        // and a user who reached the route directly saw the brand name instead of
        // "Trash". Hiding an entry is a navigation decision, not a route decision:
        // the route still exists and is still reachable. That is also why the
        // unfiltered settings list is used here while the drawer uses
        // `visibleSettingsDrawerItems` — the theming flag hides the *link*, and
        // `themingGuard` closes the *route*; neither should blank the title.
        const candidates = [
            ...this.navItems(),
            ...PACKAGED_NAV_ITEMS.map(toAppNavItem),
            ...SETTINGS_DRAWER_ITEMS,
        ];
        const match = candidates.find((item) => url === item.path || url.startsWith(item.path + '/'));
        // Layer 0: the product name on an unmatched route is branding, not a literal.
        return match ? this.navText(match) : this.appConfig.bootstrap().branding.applicationTitle;
    }, ...(ngDevMode ? [{ debugName: "pageTitle" }] : []));
    /**
     * The text of a nav entry, preferring its translation key over its literal label.
     *
     * ## Why this exists instead of a pipe
     *
     * The nav descriptor's text reaches the user through three paths, and only one of them is a
     * template binding. This heading is built in TypeScript, so is the clipboard entry's composed
     * accessible name below, and so is the adf-core `DataColumn.title` in the browse feature —
     * that last one is rendered by upstream's own DataTable, where we have no template at all.
     * "Apply the pipe at the render site" has no render site in any of the three.
     *
     * `instant()` is a synchronous read of the already-loaded catalogue, which is correct here
     * because `APP_INITIALIZER` awaits `translate.use(...)` before the shell renders.
     *
     * ## Why it depends on `currentLang`
     *
     * `instant()` is not reactive. Read inside a `computed()` with nothing else changing, the
     * heading would keep the language it was first evaluated in. Touching the language signal
     * makes the dependency explicit, so a language change recomputes the heading rather than
     * leaving one stale string in the middle of a translated page.
     */
    navText(item) {
        this.currentLang();
        if (!item.labelKey)
            return item.label;
        const translated = this.translate.instant(item.labelKey);
        // ngx-translate passes an unresolved key straight through. Rendering `nav.browse` as a
        // page heading would be worse than the English it replaced, so fall back deliberately.
        return translated === item.labelKey ? item.label : translated;
    }
    storageListener = (e) => {
        if (e.key === 'nuxeo_clipboard') {
            this.clipboardCount.set(this.readClipboardCount());
        }
    };
    clipboardChangedListener = () => this.refreshClipboardCount();
    favoritesChangedListener = () => this.refreshFavoritesCount();
    constructor() {
        this.sessionTimeout.start();
        // The browser tab is branding too, and it was previously fixed in index.html
        // where no customer could reach it. An effect rather than a one-off call
        // because the configuration load is asynchronous.
        effect(() => {
            document.title = this.appConfig.bootstrap().branding.documentTitle;
        });
        if (!this.platformNavState.collapsed()) {
            this.platformNavState.toggleCollapsed();
        }
        this.router.events
            .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
            .subscribe((e) => {
            const nextPath = e.urlAfterRedirects.split('?')[0];
            const previousPath = this.currentUrl();
            if (previousPath !== nextPath) {
                this.selectionService.clear();
            }
            this.currentUrl.set(nextPath);
            this.refreshClipboardCount();
            this.clearGlobalSearch();
            this.syncDrawerToRoute(nextPath);
        });
        window.addEventListener('storage', this.storageListener);
        window.addEventListener('clipboard-changed', this.clipboardChangedListener);
        window.addEventListener('favorites-changed', this.favoritesChangedListener);
        this.refreshFavoritesCount();
        // The subscription above only fires on subsequent navigations, so a deep link or a
        // reload needs the current route applied once here.
        this.syncDrawerToRoute(this.router.url.split('?')[0]);
        this.searchInput$
            .pipe(debounceTime(250), distinctUntilChanged(), switchMap((value) => {
            const term = value.trim();
            if (term.length < 2) {
                this.globalSearchLoading.set(false);
                this.globalSearchError.set(null);
                return of([]);
            }
            this.globalSearchLoading.set(true);
            this.globalSearchError.set(null);
            return this.searchService
                .suggestFromSuggestersLauncher(term)
                .pipe(finalize(() => this.globalSearchLoading.set(false)));
        }), takeUntilDestroyed())
            .subscribe((results) => {
            this.globalSearchResults.set(results);
            this.globalSearchOpen.set(this.globalSearchTerm().trim().length >= 2);
            this.loadThumbnailsForResults(results);
        });
    }
    ngOnDestroy() {
        this.sessionTimeout.stop();
        window.removeEventListener('storage', this.storageListener);
        window.removeEventListener('clipboard-changed', this.clipboardChangedListener);
        window.removeEventListener('favorites-changed', this.favoritesChangedListener);
        this.revokeThumbnails();
    }
    onDocumentClick(event) {
        const searchContainer = this.globalSearchContainer?.nativeElement;
        const clickPath = event.composedPath?.() ?? [];
        if (searchContainer &&
            (clickPath.includes(searchContainer) || searchContainer.contains(event.target))) {
            return;
        }
        this.globalSearchOpen.set(false);
    }
    readClipboardCount() {
        return readClipboardDocs().length;
    }
    clipboardNavAriaLabel(item) {
        if (item.path !== '/clipboard' || this.clipboardCount() <= 0) {
            return null;
        }
        const count = this.clipboardCount();
        // The catalogue's established two-key pluralisation, as used by every `common.count.*` pair.
        //
        // This maps `1` to the singular and EVERY other count to the plural. That is not the same
        // thing as "these locales have two plural forms", which an earlier version of this comment
        // claimed. Measured with `Intl.PluralRules`:
        //
        //   en -> one, other          (0 -> other)
        //   de -> one, other          (0 -> other)
        //   fr -> one, many, other    (0 -> ONE, 1_000_000 -> many)
        //
        // So French has three categories and treats zero as singular. This call site is unaffected on
        // both counts: it returns `null` above when the count is not positive, so zero never reaches a
        // key, and a clipboard cannot hold a million items. The narrowing is what makes two keys
        // correct HERE, not a property of the languages.
        //
        // `docs/i18n-status.md` records the ICU decision and the same measurement, including the
        // `common.count.*` pairs where the zero case is NOT narrowed away and French is therefore
        // wrong today.
        const key = count === 1 ? 'nav.clipboard.aria-label-one' : 'nav.clipboard.aria-label-many';
        return this.translate.instant(key, { name: this.navText(item), count });
    }
    isActive(path) {
        const activeDrawer = this.activeDrawerItem();
        if (activeDrawer && this.drawerOpen()) {
            return activeDrawer.path === path;
        }
        const url = this.router.url.split('?')[0];
        return url === path || url.startsWith(path + '/');
    }
    onNavClick(item, event) {
        this.refreshClipboardCount();
        this.clearGlobalSearch();
        if (!this.platformNavState.collapsed()) {
            this.platformNavState.toggleCollapsed();
        }
        if (item.hasDrawer) {
            event.preventDefault();
            event.stopPropagation();
            if (this.activeDrawerItem()?.path === item.path && this.drawerOpen()) {
                this.drawerOpen.set(false);
                this.activeDrawerItem.set(null);
            }
            else {
                this.activeDrawerItem.set(item);
                this.drawerOpen.set(true);
                if (item.path === '/administration') {
                    const target = this.auth.isAdministrator()
                        ? '/administration/analytics'
                        : '/administration/users-groups';
                    void this.router.navigateByUrl(target);
                }
                else if (item.path === '/personal-space') {
                    void this.router.navigateByUrl('/personal-space');
                }
                else if (item.path === '/browse') {
                    this.navigateToBrowse();
                }
            }
        }
        else {
            this.drawerOpen.set(false);
            this.activeDrawerItem.set(null);
            void this.router.navigateByUrl(item.path);
        }
    }
    onDrawerItemSelected(path) {
        this.clearGlobalSearch();
        const base = path.split('?')[0];
        if (base === '/browse' || base.startsWith('/browse/')) {
            this.browseContext.setFromRouterUrl(path);
        }
        const keepTasksDrawer = /^\/tasks\/[^/]+$/.test(base);
        if (!keepTasksDrawer) {
            this.drawerOpen.set(false);
            this.activeDrawerItem.set(null);
        }
        void this.router.navigateByUrl(path);
    }
    /**
     * Open the drawer belonging to the route being shown, if it has one.
     *
     * Driven from the route rather than from the nav click, so a deep link and a browser
     * back both arrive with the tree already open — which is how the section is meant to
     * look, and previously only happened if the user clicked the nav item themselves.
     */
    syncDrawerToRoute(currentPath) {
        const matchingItem = drawerItemForPath(this.navItems(), currentPath);
        // Re-setting the same item would reopen a drawer the user has just closed, so a
        // navigation within one section leaves their choice alone.
        if (matchingItem && this.activeDrawerItem()?.path !== matchingItem.path) {
            this.activeDrawerItem.set(matchingItem);
            this.drawerOpen.set(true);
        }
        // Navigating away deliberately does not close it: the drawer is the browse tree, and
        // opening a document from it would otherwise dismiss the tree the user is working in.
    }
    toggleSettingsDrawer() {
        if (this.activeDrawerItem()?.path === this.settingsDrawerItem.path && this.drawerOpen()) {
            this.drawerOpen.set(false);
            this.activeDrawerItem.set(null);
            return;
        }
        if (!this.platformNavState.collapsed()) {
            this.platformNavState.toggleCollapsed();
        }
        this.activeDrawerItem.set(this.settingsDrawerItem);
        this.drawerOpen.set(true);
    }
    onNavigateKeepDrawer(path) {
        this.clearGlobalSearch();
        const base = path.split('?')[0];
        if (base === '/browse' || base.startsWith('/browse/')) {
            this.browseContext.setFromRouterUrl(path);
        }
        void this.router.navigateByUrl(path, { onSameUrlNavigation: 'reload' });
    }
    onDrawerClose() {
        this.drawerOpen.set(false);
        this.activeDrawerItem.set(null);
        this.refreshClipboardCount();
    }
    onGlobalSearchInput(value) {
        this.globalSearchTerm.set(value);
        const hasEnoughChars = value.trim().length >= 2;
        this.globalSearchOpen.set(hasEnoughChars);
        this.searchInput$.next(value);
    }
    onGlobalSearchFocus() {
        this.globalSearchOpen.set(this.globalSearchTerm().trim().length >= 2);
    }
    onGlobalSearchFocusOut(event) {
        const container = this.globalSearchContainer?.nativeElement;
        const nextTarget = event.relatedTarget;
        if (container && nextTarget && container.contains(nextTarget)) {
            return;
        }
        this.clearGlobalSearch();
    }
    onGlobalSearchSelect(result) {
        this.clearGlobalSearch();
        if (result.kind === 'user') {
            void this.router.navigate(['/administration/users-groups/user', result.id]);
        }
        else if (result.kind === 'group') {
            void this.router.navigate(['/administration/users-groups/group', result.id]);
        }
        else {
            const documentUid = result.documentUid ?? result.id;
            void this.router.navigate(['/doc', documentUid]);
        }
    }
    clearGlobalSearch() {
        this.globalSearchTerm.set('');
        this.globalSearchLoading.set(false);
        this.globalSearchError.set(null);
        this.globalSearchResults.set([]);
        this.globalSearchOpen.set(false);
        this.revokeThumbnails();
    }
    thumbnailUrl(result) {
        const uid = result.documentUid ?? result.id;
        return this.thumbnailMap()[uid] ?? null;
    }
    loadThumbnailsForResults(results) {
        this.revokeThumbnails();
        const docResults = results.filter((r) => r.kind === 'document');
        for (const result of docResults) {
            const uid = result.documentUid ?? result.id;
            const sub = this.detailService
                .fetchThumbnail(uid)
                .pipe(catchError(() => of(null)))
                .subscribe((blob) => {
                if (!blob)
                    return;
                const url = URL.createObjectURL(blob);
                this.thumbnailMap.update((map) => ({ ...map, [uid]: url }));
            });
            this.thumbnailSubs.push(sub);
        }
    }
    revokeThumbnails() {
        for (const sub of this.thumbnailSubs)
            sub.unsubscribe();
        this.thumbnailSubs = [];
        const map = this.thumbnailMap();
        for (const url of Object.values(map)) {
            URL.revokeObjectURL(url);
        }
        this.thumbnailMap.set({});
    }
    userGroupIcon(result) {
        if (result.kind === 'group')
            return 'group';
        if (result.kind === 'user')
            return 'person';
        return 'insert_drive_file';
    }
    userGroupSubtext(result) {
        return result.kind === 'group' ? 'Group' : 'User';
    }
    highlightText(value) {
        const text = value ?? '';
        const term = this.highlightedSearchTerm();
        if (!text || term.length < 2) {
            return [{ text, matched: false }];
        }
        const loweredText = text.toLowerCase();
        const loweredTerm = term.toLowerCase();
        const parts = [];
        let from = 0;
        while (from < text.length) {
            const matchStart = loweredText.indexOf(loweredTerm, from);
            if (matchStart === -1) {
                parts.push({ text: text.slice(from), matched: false });
                break;
            }
            if (matchStart > from) {
                parts.push({ text: text.slice(from, matchStart), matched: false });
            }
            const matchEnd = matchStart + loweredTerm.length;
            parts.push({ text: text.slice(matchStart, matchEnd), matched: true });
            from = matchEnd;
        }
        return parts.length > 0 ? parts : [{ text, matched: false }];
    }
    labelHighlightParts(result) {
        return result.displayLabelHighlights?.length
            ? result.displayLabelHighlights
            : this.highlightText(result.displayLabel);
    }
    subtextHighlightParts(result) {
        if (result.kind === 'document') {
            if (result.pathHighlights?.length)
                return result.pathHighlights;
            return this.highlightText(result.path || '/');
        }
        return this.highlightText(this.userGroupSubtext(result));
    }
    refreshClipboardCount() {
        this.clipboardCount.set(this.readClipboardCount());
    }
    refreshFavoritesCount() {
        const user = this.auth.username();
        if (!user)
            return;
        this.collectionService.getFavorites(user, 1).subscribe({
            next: (res) => this.favoritesCount.set(res.totalSize ?? res.entries?.length ?? 0),
            error: () => this.favoritesCount.set(0),
        });
    }
    togglePlatformNav() {
        this.platformNavState.toggleCollapsed();
    }
    signOut() {
        this.drawerOpen.set(false);
        this.activeDrawerItem.set(null);
        this.auth.logout();
        void this.router.navigateByUrl('/login');
    }
    toggleAiChat() {
        this.aiChat.togglePanel();
        const url = this.router.url;
        const docMatch = url.match(/\/doc\/([a-f0-9-]+)/i);
        this.aiChat.setContext({
            docId: docMatch?.[1],
            page: url,
        });
    }
    sendAiMessage() {
        const msg = this.aiChatInput().trim();
        if (!msg)
            return;
        this.aiChat.send(msg);
        this.aiChatInput.set('');
    }
    /**
     * Send one of the empty-state suggestions, in the user's language.
     *
     * The template used to set `aiChatInput` to the English sentence and call `sendAiMessage()`,
     * so the button's visible label was translated but the message sent — and echoed back as the
     * user's own turn — was always English. Resolving the key here keeps the two the same string.
     */
    sendAiSuggestion(key) {
        this.aiChatInput.set(this.translate.instant(key));
        this.sendAiMessage();
    }
    clearAiChat() {
        this.aiChat.clear();
    }
    openAiSource(uid, type, path) {
        this.aiChatOpen.set(false);
        if (type === 'Collection') {
            void this.router.navigate(['/collections', uid]);
        }
        else if ((type === 'Folder' || type === 'OrderedFolder' || type === 'Workspace') && path) {
            void this.router.navigateByUrl(`/browse${path}`);
        }
        else {
            void this.router.navigate(['/doc', uid]);
        }
    }
    docTypeIcon(type) {
        return docTypeIcon(type);
    }
    /** Open browse at the folder being viewed, or else the one browse last showed. */
    navigateToBrowse() {
        const url = this.router.url;
        const nuxeoPath = isBrowseRouterUrl(url)
            ? parseBrowseNuxeoPathFromRouterUrl(url)
            : this.browseContext.contextPath();
        this.browseContext.setFromNuxeoPath(nuxeoPath);
        void this.router.navigateByUrl(toBrowseRouterUrl(nuxeoPath));
    }
    static ɵfac = function AppShellComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AppShellComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AppShellComponent, selectors: [["app-shell"]], viewQuery: function AppShellComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.globalSearchContainer = _t.first);
        } }, hostBindings: function AppShellComponent_HostBindings(rf, ctx) { if (rf & 1) {
            i0.ɵɵlistener("click", function AppShellComponent_click_HostBindingHandler($event) { return ctx.onDocumentClick($event); }, i0.ɵɵresolveDocument);
        } }, decls: 83, vars: 54, consts: [["globalSearchContainer", ""], ["headerSettingsMenu", "matMenu"], [1, "selection-topbar--sticky", 3, "selectedCount", "selectedItems", "clearOnly"], [3, "active", "nav-item--clipboard-badge", "--nav-clipboard-count"], [3, "click"], ["aria-hidden", "true", 1, "app-shell-user-profile-icon"], ["type", "button", "mat-icon-button", "", "satAppHeaderPlatformNavMobileTrigger", "", 3, "click"], ["satAppHeaderTitle", ""], ["satAppHeaderLogo", "", 1, "header-search", 3, "click", "focusout"], [1, "header-search-input-wrap"], ["aria-hidden", "true", 1, "header-search-icon"], ["id", "global-header-search-input", "type", "text", "placeholder", " ", 1, "header-search-input", 3, "focus", "input", "value"], ["for", "global-header-search-input", 1, "header-search-label"], [1, "header-search-dropdown"], ["satAppHeaderLogo", "", "alt", "", "crossorigin", "anonymous", 1, "app-brand-logo", 3, "src"], ["satAppHeaderLogo", "", "aria-hidden", "true"], ["satAppHeaderActions", ""], ["type", "button", "mat-icon-button", "", 1, "ai-chat-toggle", 3, "active"], ["type", "button", "mat-icon-button", "", 1, "header-settings-menu-button", 3, "matMenuTriggerFor"], ["mat-menu-item", "", "routerLink", "/settings/themes"], ["mat-menu-item", "", "type", "button"], [1, "shell-content"], ["mode", "side", "position", "start", 1, "nav-drawer-sidenav", 3, "closed", "opened"], [3, "itemSelected", "navigateKeepDrawer", "signOutSelected", "activeItem"], ["mode", "side", "position", "end", 1, "ai-chat-sidenav", 3, "closed", "opened"], [1, "ai-chat-panel"], [1, "ai-chat-header"], [1, "ai-chat-header-icon"], [1, "ai-chat-header-title"], ["mat-icon-button", "", 1, "ai-chat-clear", 3, "click"], ["mat-icon-button", "", 3, "click"], [1, "ai-chat-messages"], [1, "ai-chat-welcome"], [1, "ai-chat-msg", 3, "user", "assistant"], [1, "ai-chat-msg", "assistant"], [1, "ai-chat-error"], [1, "ai-chat-input-bar"], ["type", "text", 1, "ai-chat-input", 3, "ngModelChange", "keydown.enter", "placeholder", "ngModel", "disabled"], ["mat-icon-button", "", 1, "ai-chat-send", 3, "click", "disabled"], [1, "selection-topbar--sticky", 3, "cleared", "selectedCount", "selectedItems", "clearOnly"], [3, "click", "active"], [3, "item"], [1, "header-search-state"], ["type", "button", 1, "header-search-option"], ["type", "button", 1, "header-search-option", 3, "click"], [1, "header-search-option-avatar"], [1, "header-search-option-meta"], [1, "header-search-option-text", 3, "title"], [1, "header-search-option-path"], [1, "header-search-option-preview", 3, "src", "alt"], [1, "header-search-option-preview", "header-search-option-preview--icon"], [1, "header-search-highlight"], ["type", "button", "mat-icon-button", "", 1, "ai-chat-toggle", 3, "click"], [1, "ai-chat-welcome-icon"], [1, "ai-chat-suggestions"], [1, "ai-chat-suggestion", 3, "click"], [1, "ai-chat-msg"], [1, "ai-msg-avatar-wrap"], [1, "ai-msg-bubble"], [1, "ai-msg-content", 3, "innerHTML"], [1, "ai-msg-content"], [1, "ai-msg-sources"], [1, "ai-msg-avatar"], [1, "ai-sources-label"], ["type", "button", "matTooltipPosition", "above", 1, "ai-source-card"], ["type", "button", "matTooltipPosition", "above", 1, "ai-source-card", 3, "click"], [1, "ai-source-card-icon"], [1, "ai-source-card-info"], [1, "ai-source-card-title"], [1, "ai-source-card-path"], [1, "ai-source-card-arrow"], [1, "ai-msg-bubble", "ai-msg-typing"], [1, "typing-dot"]], template: function AppShellComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵconditionalCreate(0, AppShellComponent_Conditional_0_Template, 1, 3, "lib-selection-topbar", 2);
            i0.ɵɵelementStart(1, "sat-platform-nav-container")(2, "sat-platform-nav");
            i0.ɵɵrepeaterCreate(3, AppShellComponent_For_4_Template, 3, 9, "sat-platform-nav-list-item", 3, _forTrack0);
            i0.ɵɵelementStart(5, "sat-platform-nav-user")(6, "sat-platform-nav-user-profile", 4);
            i0.ɵɵlistener("click", function AppShellComponent_Template_sat_platform_nav_user_profile_click_6_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.toggleSettingsDrawer()); });
            i0.ɵɵelement(7, "mat-icon", 5);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(9, "sat-platform-nav-main-content")(10, "sat-app-header")(11, "button", 6);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵlistener("click", function AppShellComponent_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.togglePlatformNav()); });
            i0.ɵɵelementStart(13, "mat-icon");
            i0.ɵɵtext(14, "menu");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(15, "h1", 7);
            i0.ɵɵtext(16);
            i0.ɵɵelementEnd();
            i0.ɵɵelement(17, "app-preset-badge", 7);
            i0.ɵɵelementStart(18, "div", 8, 0);
            i0.ɵɵlistener("click", function AppShellComponent_Template_div_click_18_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.stopPropagation()); })("focusout", function AppShellComponent_Template_div_focusout_18_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGlobalSearchFocusOut($event)); });
            i0.ɵɵelementStart(20, "div", 9)(21, "mat-icon", 10);
            i0.ɵɵtext(22, "search");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(23, "input", 11);
            i0.ɵɵlistener("focus", function AppShellComponent_Template_input_focus_23_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGlobalSearchFocus()); })("input", function AppShellComponent_Template_input_input_23_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onGlobalSearchInput($event.target.value)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "label", 12);
            i0.ɵɵtext(25);
            i0.ɵɵpipe(26, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(27, AppShellComponent_Conditional_27_Template, 5, 1, "div", 13);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(28, AppShellComponent_Conditional_28_Template, 1, 1, "img", 14)(29, AppShellComponent_Conditional_29_Template, 1, 0, "sat-word-mark-logo", 15);
            i0.ɵɵelementStart(30, "div", 16);
            i0.ɵɵconditionalCreate(31, AppShellComponent_Conditional_31_Template, 4, 5, "button", 17);
            i0.ɵɵelementStart(32, "button", 18);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵelementStart(34, "mat-icon");
            i0.ɵɵtext(35, "settings");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(36, "mat-menu", null, 1);
            i0.ɵɵconditionalCreate(38, AppShellComponent_Conditional_38_Template, 5, 3, "a", 19);
            i0.ɵɵelementStart(39, "button", 20)(40, "mat-icon");
            i0.ɵɵtext(41, "help_outline");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(44, "button", 20)(45, "mat-icon");
            i0.ɵɵtext(46, "info_outline");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(47);
            i0.ɵɵpipe(48, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(49, "mat-sidenav-container", 21)(50, "mat-sidenav", 22);
            i0.ɵɵlistener("closed", function AppShellComponent_Template_mat_sidenav_closed_50_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onDrawerClose()); });
            i0.ɵɵelementStart(51, "app-nav-drawer", 23);
            i0.ɵɵlistener("itemSelected", function AppShellComponent_Template_app_nav_drawer_itemSelected_51_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onDrawerItemSelected($event)); })("navigateKeepDrawer", function AppShellComponent_Template_app_nav_drawer_navigateKeepDrawer_51_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.onNavigateKeepDrawer($event)); })("signOutSelected", function AppShellComponent_Template_app_nav_drawer_signOutSelected_51_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.signOut()); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(52, "mat-sidenav", 24);
            i0.ɵɵlistener("closed", function AppShellComponent_Template_mat_sidenav_closed_52_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.aiChatOpen.set(false)); });
            i0.ɵɵelementStart(53, "div", 25)(54, "div", 26)(55, "mat-icon", 27);
            i0.ɵɵtext(56, "auto_awesome");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(57, "span", 28);
            i0.ɵɵtext(58);
            i0.ɵɵpipe(59, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(60, "button", 29);
            i0.ɵɵpipe(61, "translate");
            i0.ɵɵlistener("click", function AppShellComponent_Template_button_click_60_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.clearAiChat()); });
            i0.ɵɵelementStart(62, "mat-icon");
            i0.ɵɵtext(63, "delete_sweep");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(64, "button", 30);
            i0.ɵɵpipe(65, "translate");
            i0.ɵɵlistener("click", function AppShellComponent_Template_button_click_64_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.aiChatOpen.set(false)); });
            i0.ɵɵelementStart(66, "mat-icon");
            i0.ɵɵtext(67, "close");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(68, "div", 31);
            i0.ɵɵconditionalCreate(69, AppShellComponent_Conditional_69_Template, 19, 15, "div", 32);
            i0.ɵɵrepeaterCreate(70, AppShellComponent_For_71_Template, 6, 7, "div", 33, _forTrack1);
            i0.ɵɵconditionalCreate(72, AppShellComponent_Conditional_72_Template, 7, 0, "div", 34);
            i0.ɵɵconditionalCreate(73, AppShellComponent_Conditional_73_Template, 4, 1, "div", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(74, "div", 36)(75, "input", 37);
            i0.ɵɵpipe(76, "translate");
            i0.ɵɵlistener("ngModelChange", function AppShellComponent_Template_input_ngModelChange_75_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.aiChatInput.set($event)); })("keydown.enter", function AppShellComponent_Template_input_keydown_enter_75_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.sendAiMessage()); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(77, "button", 38);
            i0.ɵɵpipe(78, "translate");
            i0.ɵɵlistener("click", function AppShellComponent_Template_button_click_77_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.sendAiMessage()); });
            i0.ɵɵelementStart(79, "mat-icon");
            i0.ɵɵtext(80, "send");
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(81, "mat-sidenav-content");
            i0.ɵɵelement(82, "router-outlet");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            let tmp_13_0;
            const headerSettingsMenu_r15 = i0.ɵɵreference(37);
            i0.ɵɵconditional(ctx.selectionService.selectedCount() > 0 ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("has-selection-topbar", ctx.selectionService.selectedCount() > 0);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.navItems());
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", ctx.displayName(), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 34, "app.nav.toggle"));
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(ctx.pageTitle());
            i0.ɵɵadvance(4);
            i0.ɵɵclassProp("header-search-filled", ctx.globalSearchTerm().trim().length > 0);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("value", ctx.globalSearchTerm());
            i0.ɵɵadvance();
            i0.ɵɵclassProp("header-search-label--caption", ctx.globalSearchTerm().trim().length > 0);
            i0.ɵɵadvance();
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(26, 36, "shell.search.placeholder"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.globalSearchOpen() ? 27 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_13_0 = ctx.brandLogo()) ? 28 : 29, tmp_13_0);
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() ? 31 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("matMenuTriggerFor", headerSettingsMenu_r15);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(33, 38, "shell.settings.menu"));
            i0.ɵɵadvance(6);
            i0.ɵɵconditional(ctx.themingFlags.themingEnabled() ? 38 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(43, 40, "shell.menu.help"), " ");
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(48, 42, "shell.menu.about"), " ");
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("opened", ctx.drawerOpen());
            i0.ɵɵadvance();
            i0.ɵɵproperty("activeItem", ctx.activeDrawerItem());
            i0.ɵɵadvance();
            i0.ɵɵproperty("opened", ctx.featureFlags.aiEnabled() && ctx.aiChatOpen());
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(59, 44, "shell.ai.title"));
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(61, 46, "shell.ai.clear"));
            i0.ɵɵadvance(4);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(65, 48, "shell.ai.close"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(!ctx.aiChat.hasMessages() ? 69 : -1);
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.aiChat.messages());
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.aiChat.loading() ? 72 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.aiChat.error() ? 73 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(76, 50, "shell.ai.input-placeholder"))("ngModel", ctx.aiChatInput())("disabled", ctx.aiChat.loading());
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("disabled", !ctx.aiChatInput().trim() || ctx.aiChat.loading());
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(78, 52, "shell.ai.send"));
        } }, dependencies: [RouterOutlet,
            RouterLink,
            SatPlatformNavModule, i1.SatPlatformNav, i1.SatPlatformNavContainer, i1.SatPlatformNavMainContent, i1.SatPlatformNavListItem, i1.SatPlatformNavUserProfile, i1.SatPlatformNavUser, i1.SatPlatformNavAvatar, SatAppHeaderModule, i2.AppHeader, i2.AppHeaderTitle, i2.AppHeaderActions, i2.AppHeaderLogo, i2.AppHeaderPlatformNavMobileTrigger, SatLogoModule, i3.SatWordMarkLogo, MatDialogModule,
            MatMenuModule, i4.MatMenu, i4.MatMenuItem, i4.MatMenuTrigger, MatButtonModule, i5.MatIconButton, MatIconModule, i6.MatIcon, MatSnackBarModule,
            MatSidenavModule, i7.MatSidenav, i7.MatSidenavContainer, i7.MatSidenavContent, MatTooltipModule,
            NavDrawerComponent,
            PresetBadgeComponent,
            SelectionTopbarComponent,
            FormsModule, i8.DefaultValueAccessor, i8.NgControlStatus, i8.NgModel, AiMarkdownPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n  --selection-topbar-height: 48px;\n}\n\n.selection-topbar--sticky[_ngcontent-%COMP%] {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  z-index: 1200;\n}\n\nsat-platform-nav-container.has-selection-topbar[_ngcontent-%COMP%] {\n  padding-top: var(--selection-topbar-height);\n  height: calc(100% - var(--selection-topbar-height));\n}\n\n[_nghost-%COMP%]     sat-platform-nav-list-item.nav-item--clipboard-badge .sat-platform-nav-icon {\n  position: relative;\n  overflow: visible;\n}\n\n[_nghost-%COMP%]     sat-platform-nav-list-item.nav-item--clipboard-badge .sat-platform-nav-icon::after {\n  content: var(--nav-clipboard-count);\n  position: absolute;\n  top: -4px;\n  right: -6px;\n  z-index: 2;\n  min-width: 16px;\n  height: 16px;\n  padding: 0 4px;\n  border-radius: 999px;\n  background: var(--mat-sys-error, #b3261e);\n  color: var(--mat-sys-on-error, #fff);\n  font-size: 10px;\n  font-weight: 600;\n  line-height: 16px;\n  text-align: center;\n  pointer-events: none;\n  box-sizing: border-box;\n}\n\n.shell-content[_ngcontent-%COMP%] {\n  height: calc(100% - var(--selection-topbar-height));\n}\n\n.nav-drawer-sidenav[_ngcontent-%COMP%] {\n  width: 280px;\n  border-right: none;\n  box-shadow: 2px 0 8px rgb(0 0 0 / 8%);\n  background: var(--mat-sys-surface);\n  overflow: hidden;\n}\n\n[_nghost-%COMP%]     .nav-drawer-sidenav .mat-drawer-inner-container {\n  overflow: hidden !important;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n[_nghost-%COMP%]     sat-app-header .sat-app-header-leading-container {\n  width: 30%;\n  max-width: 30%;\n  min-width: 0;\n}\n\n[_nghost-%COMP%]     sat-app-header, \n[_nghost-%COMP%]     sat-app-header header, \n[_nghost-%COMP%]     sat-app-header .sat-app-header-content-container, \n[_nghost-%COMP%]     sat-app-header .sat-app-header-content {\n  overflow: visible;\n}\n\n[_nghost-%COMP%]     sat-app-header .sat-app-header-trailing-container {\n  position: relative;\n  width: 70%;\n  max-width: 70%;\n  min-width: 0;\n  justify-content: flex-end;\n  overflow: visible;\n  z-index: 5;\n}\n\n.header-search[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 0;\n  top: 50%;\n  transform: translateY(-50%);\n  width: clamp(340px, 42vw, 680px);\n  max-width: min(680px, calc(100vw - 360px));\n  min-width: 280px;\n  margin: 0;\n  z-index: 20;\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   pill[_ngcontent-%COMP%]   border[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   magnifier[_ngcontent-%COMP%]   used[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   live[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   wrapper[_ngcontent-%COMP%], with[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]   sitting\n//[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   padding.[_ngcontent-%COMP%]   That[_ngcontent-%COMP%]   left[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   focusable[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   control[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   box[_ngcontent-%COMP%]   of\n//[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   draw[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   focus[_ngcontent-%COMP%]   ring[_ngcontent-%COMP%]   around[_ngcontent-%COMP%], and[_ngcontent-%COMP%]   `outline[_ngcontent-%COMP%]:   none`[_ngcontent-%COMP%]   below[_ngcontent-%COMP%]   removed[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   browser's.\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   border[_ngcontent-%COMP%]   now[_ngcontent-%COMP%]   belongs[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   input;[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   just[_ngcontent-%COMP%]   positions[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   magnifier[_ngcontent-%COMP%]   over[_ngcontent-%COMP%]   it.\n.header-search-input-wrap[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  position: relative;\n  height: 42px;\n  border-radius: 20px;\n  background: #fff;\n  // Pill is always light; foreground tokens stay on the wrapper so label, icon and input\n  // share one scheme regardless of page theme (NXENG-798).\n  --shell-header-search-muted-foreground: #667085;\n  --shell-header-search-foreground: #101828;\n}\n\n.header-search-icon[_ngcontent-%COMP%] {\n  position: absolute;\n  // 13px is the wrapper's old 12px padding plus the 1px border that moved onto the input.\n  // The input's 40px left padding below is that, plus this 20px icon and the 8px gap that\n  // used to separate them \u2014 measured at 39.94px before the change.\n  left: 13px;\n  top: 50%;\n  transform: translateY(-50%);\n  z-index: 1;\n  pointer-events: none;\n  color: var(--shell-header-search-muted-foreground);\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.header-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  padding: 0 13px 0 40px;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 20px;\n  outline: none;\n  background: transparent;\n  font-size: 14px;\n  color: var(--shell-header-search-foreground);\n}\n\n//[_ngcontent-%COMP%]   Visible[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   for[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   global[_ngcontent-%COMP%]   search[_ngcontent-%COMP%]   field[_ngcontent-%COMP%]   (NXENG-798).[_ngcontent-%COMP%]   Overlays[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   empty[_ngcontent-%COMP%]   field[_ngcontent-%COMP%]   like[_ngcontent-%COMP%]   a\n//[_ngcontent-%COMP%]   placeholder,[_ngcontent-%COMP%]   then[_ngcontent-%COMP%]   shrinks[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   persistent[_ngcontent-%COMP%]   caption[_ngcontent-%COMP%]   above[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   typed[_ngcontent-%COMP%]   query[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   control\n//[_ngcontent-%COMP%]   keeps[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   visible[_ngcontent-%COMP%]   name[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   every[_ngcontent-%COMP%]   state[_ngcontent-%COMP%]   (IBM input_label_visible / WCAG 2.5.3).\n//\n.header-search-label[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 40px;\n  right: 13px;\n  pointer-events: none;\n  color: var(--shell-header-search-muted-foreground);\n  line-height: 1;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  transition:\n    top 0.15s ease,\n    transform 0.15s ease,\n    font-size 0.15s ease;\n}\n\n//[_ngcontent-%COMP%]   Empty-field[_ngcontent-%COMP%]   overlay[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   filled[_ngcontent-%COMP%]   caption[_ngcontent-%COMP%]   geometry[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   global[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   `styles.scss`.\n.header-search-label:not(.header-search-label--caption)[_ngcontent-%COMP%] {\n  top: 50%;\n  transform: translateY(-50%);\n  font-size: 14px;\n}\n\n//[_ngcontent-%COMP%]   Filled-state[_ngcontent-%COMP%]   caption[_ngcontent-%COMP%]   geometry[_ngcontent-%COMP%]   lives[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   `styles.scss`[_ngcontent-%COMP%]   (single declaration for app + Karma).\n\n.header-search-input:focus[_ngcontent-%COMP%]    + .header-search-label[_ngcontent-%COMP%] {\n  top: 6px;\n  transform: none;\n  font-size: 11px;\n  opacity: 1;\n}\n\n.header-search-input-wrap.header-search-filled[_ngcontent-%COMP%]   .header-search-input,\n.header-search-input:focus[_ngcontent-%COMP%] {\n  padding-top: 15px;\n  padding-bottom: 5px;\n}\n\n//[_ngcontent-%COMP%]   `outline-offset`[_ngcontent-%COMP%]   puts[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   ring[_ngcontent-%COMP%]   entirely[_ngcontent-%COMP%]   outside[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   field,[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   gap[_ngcontent-%COMP%]   showing[_ngcontent-%COMP%]   what[_ngcontent-%COMP%]   is\n//[_ngcontent-%COMP%]   behind[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   has[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   contrast[_ngcontent-%COMP%]   with[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   header's[_ngcontent-%COMP%], not[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   field's[_ngcontent-%COMP%]   white.\n//[_ngcontent-%COMP%]   That[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   why[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   ring[_ngcontent-%COMP%]   tracks[_ngcontent-%COMP%]   `--mat-sys-primary`[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   deliberately[_ngcontent-%COMP%]   NOT[_ngcontent-%COMP%]   pinned[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   light[_ngcontent-%COMP%]   scheme:[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   follows[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   scheme,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   ring[_ngcontent-%COMP%]   must[_ngcontent-%COMP%]   too.[_ngcontent-%COMP%]   Measured\n//[_ngcontent-%COMP%]   against[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   header[_ngcontent-%COMP%]   across[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   four[_ngcontent-%COMP%]   packaged[_ngcontent-%COMP%]   themes[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   both[_ngcontent-%COMP%]   OS[_ngcontent-%COMP%]   schemes:[_ngcontent-%COMP%]   lowest[_ngcontent-%COMP%]   5.80:1\n//[_ngcontent-%COMP%]   (light theme),[_ngcontent-%COMP%]   highest[_ngcontent-%COMP%]   10.11:1[_ngcontent-%COMP%]   (dark theme).[_ngcontent-%COMP%]   Forcing[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   light[_ngcontent-%COMP%]   dropped[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   2.65:1.\n//\n//[_ngcontent-%COMP%]   NXENG-909[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   issue[_ngcontent-%COMP%]   3350142295[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   same[_ngcontent-%COMP%]   control[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   NXENG-775.\n//[_ngcontent-%COMP%]   Keep[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   selector.[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   Equal[_ngcontent-%COMP%]   Access's[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   the\n//[_ngcontent-%COMP%]   element's[_ngcontent-%COMP%]   `:focus`[_ngcontent-%COMP%]   styles[_ngcontent-%COMP%]   only[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   collects[_ngcontent-%COMP%]   `:focus-visible`[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   `:focus-within`[_ngcontent-%COMP%]   and\n//[_ngcontent-%COMP%]   then[_ngcontent-%COMP%]   never[_ngcontent-%COMP%]   looks[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   them[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   lookup[_ngcontent-%COMP%]   does[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   resolve[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%]   lists,[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   writing\n//[_ngcontent-%COMP%]   `&:focus,[_ngcontent-%COMP%]   &:focus-visible`[_ngcontent-%COMP%]   here[_ngcontent-%COMP%]   reports[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   having[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   focus[_ngcontent-%COMP%]   indicator[_ngcontent-%COMP%]   again.\n//[_ngcontent-%COMP%]   `:focus`[_ngcontent-%COMP%]   loses[_ngcontent-%COMP%]   nothing:[_ngcontent-%COMP%]   an[_ngcontent-%COMP%]   element[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   accepts[_ngcontent-%COMP%]   keyboard[_ngcontent-%COMP%]   input[_ngcontent-%COMP%]   matches[_ngcontent-%COMP%]   `:focus-visible`\n//[_ngcontent-%COMP%]   whenever[_ngcontent-%COMP%]   it[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   focused,[_ngcontent-%COMP%]   mouse[_ngcontent-%COMP%]   included.\n.header-search-input:focus[_ngcontent-%COMP%] {\n  outline: 2px solid var(--mat-sys-primary);\n  outline-offset: 2px;\n}\n\n//[_ngcontent-%COMP%]   Same[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   constraints[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   `.header-search-input:focus`[_ngcontent-%COMP%]   above.\n//[_ngcontent-%COMP%]   Chain[_ngcontent-%COMP%]   Material's[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   classes[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   wins[_ngcontent-%COMP%]   over[_ngcontent-%COMP%]   MDC's[_ngcontent-%COMP%]   `outline-style:[_ngcontent-%COMP%]   none`[_ngcontent-%COMP%]   on[_ngcontent-%COMP%]   icon[_ngcontent-%COMP%]   buttons.\n.header-settings-menu-button.mat-mdc-icon-button:focus[_ngcontent-%COMP%] {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--mat-sys-primary);\n  outline-offset: 2px;\n}\n\n.header-search-dropdown[_ngcontent-%COMP%] {\n  position: absolute;\n  top: calc(100% + 8px);\n  left: 0;\n  right: 0;\n  max-height: 360px;\n  overflow-y: auto;\n  background: #fff;\n  border: 1px solid #e4e7ec;\n  border-radius: 12px;\n  box-shadow: 0 12px 24px rgb(16 24 40 / 12%);\n  z-index: 30;\n  padding: 6px;\n}\n\n.header-search-state[_ngcontent-%COMP%] {\n  padding: 12px;\n  color: #475467;\n  font-size: 13px;\n}\n\n.header-search-option[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  width: 100%;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  padding: 10px;\n  border-radius: 8px;\n  cursor: pointer;\n\n  &:hover {\n    background: #f2f4f7;\n  }\n}\n\n.header-search-option-preview[_ngcontent-%COMP%] {\n  width: 48px;\n  height: 48px;\n  border-radius: 6px;\n  object-fit: cover;\n  border: 1px solid #eaecf0;\n  flex-shrink: 0;\n\n  &--icon {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: #f4f6f8;\n    color: #8a94a0;\n\n    mat-icon {\n      font-size: 24px;\n      width: 24px;\n      height: 24px;\n    }\n  }\n}\n\n.header-search-option-avatar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: #f2f4f7;\n  border: 1px solid #eaecf0;\n  flex-shrink: 0;\n  color: #475467;\n}\n\n.header-search-option-meta[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  flex: 1;\n  min-width: 0;\n}\n\n.header-search-option-text[_ngcontent-%COMP%] {\n  font-weight: 500;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.header-search-option-path[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: #667085;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.header-search-highlight[_ngcontent-%COMP%] {\n  background: #fff3bf;\n  color: inherit;\n  font-weight: 700;\n  border-radius: 2px;\n  padding: 0;\n}\n\n@media (max-width: 1024px) {\n  .header-search[_ngcontent-%COMP%] {\n    width: clamp(280px, 48vw, 560px);\n    max-width: calc(100vw - 280px);\n  }\n}\n\n@media (max-width: 768px) {\n  .header-search[_ngcontent-%COMP%] {\n    width: min(540px, calc(100vw - 96px));\n    max-width: calc(100vw - 96px);\n    min-width: 220px;\n  }\n}\n\n//[_ngcontent-%COMP%]   AI[_ngcontent-%COMP%]   Chat[_ngcontent-%COMP%]   Drawer\n$ai-accent:[_ngcontent-%COMP%]   #7c4dff;\n$ai-accent-light:[_ngcontent-%COMP%]   #ede7ff;\n$ai-accent-gradient:[_ngcontent-%COMP%]   linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n$ai-surface:[_ngcontent-%COMP%]   #fafbfe;\n$ai-border:[_ngcontent-%COMP%]   #e8eaef;\n$ai-text:[_ngcontent-%COMP%]   #1a1c1e;\n$ai-text-secondary:[_ngcontent-%COMP%]   #5f6368;\n$ai-radius:[_ngcontent-%COMP%]   14px;\n\n.ai-chat-toggle[_ngcontent-%COMP%] {\n  &.active {\n    color: $ai-accent;\n  }\n}\n\n.ai-chat-sidenav[_ngcontent-%COMP%] {\n  width: 400px;\n  border-left: none;\n  box-shadow: -4px 0 24px rgb(0 0 0 / 8%);\n}\n\n.ai-chat-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: $ai-surface;\n}\n\n.ai-chat-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 14px 16px;\n  background: #fff;\n  border-bottom: 1px solid $ai-border;\n  flex-shrink: 0;\n}\n\n.ai-chat-header-icon[_ngcontent-%COMP%] {\n  color: $ai-accent;\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n}\n\n.ai-chat-header-title[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: $ai-text;\n  flex: 1;\n  letter-spacing: -0.01em;\n}\n\n.ai-chat-clear[_ngcontent-%COMP%] {\n  color: $ai-text-secondary;\n}\n\n//[_ngcontent-%COMP%]   Messages[_ngcontent-%COMP%]   area\n.ai-chat-messages[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  scroll-behavior: smooth;\n}\n\n//[_ngcontent-%COMP%]   Welcome[_ngcontent-%COMP%]   state\n.ai-chat-welcome[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  padding: 40px 20px 24px;\n  gap: 8px;\n  animation: ai-fade-in 0.4s ease;\n\n  h3 {\n    margin: 0;\n    font-size: 17px;\n    font-weight: 700;\n    color: $ai-text;\n    letter-spacing: -0.02em;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: $ai-text-secondary;\n    line-height: 1.6;\n    max-width: 280px;\n  }\n}\n\n.ai-chat-welcome-icon[_ngcontent-%COMP%] {\n  font-size: 48px;\n  width: 48px;\n  height: 48px;\n  color: $ai-accent;\n  filter: drop-shadow(0 4px 12px rgba(124, 77, 255, 0.25));\n}\n\n.ai-chat-suggestions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 16px;\n  width: 100%;\n}\n\n.ai-chat-suggestion[_ngcontent-%COMP%] {\n  padding: 11px 16px;\n  border-radius: 12px;\n  border: 1px solid $ai-border;\n  background: #fff;\n  font: inherit;\n  font-size: 13px;\n  text-align: left;\n  color: $ai-text;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);\n\n  &:hover {\n    border-color: $ai-accent;\n    background: $ai-accent-light;\n    box-shadow: 0 2px 8px rgba(124, 77, 255, 0.1);\n    transform: translateY(-1px);\n  }\n}\n\n//[_ngcontent-%COMP%]   Message[_ngcontent-%COMP%]   rows\n.ai-chat-msg[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  animation: ai-fade-up 0.3s ease;\n\n  &.user {\n    justify-content: flex-end;\n\n    .ai-msg-bubble {\n      background: $ai-accent-gradient;\n      color: #fff;\n      border-radius: 18px 18px 4px 18px;\n      box-shadow: 0 2px 8px rgba(124, 77, 255, 0.2);\n    }\n  }\n\n  &.assistant {\n    .ai-msg-bubble {\n      background: #fff;\n      color: $ai-text;\n      border-radius: 18px 18px 18px 4px;\n      border: 1px solid $ai-border;\n      box-shadow: 0 1px 4px rgb(0 0 0 / 4%);\n    }\n  }\n}\n\n.ai-msg-avatar-wrap[_ngcontent-%COMP%] {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  background: $ai-accent-light;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  margin-top: 2px;\n}\n\n.ai-msg-avatar[_ngcontent-%COMP%] {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: $ai-accent;\n}\n\n.ai-msg-bubble[_ngcontent-%COMP%] {\n  max-width: 85%;\n  padding: 12px 16px;\n  font-size: 13.5px;\n  line-height: 1.6;\n}\n\n.ai-msg-content[_ngcontent-%COMP%] {\n  word-break: break-word;\n\n  -shadowcsshost-no-combinator ::ng-deep {\n    strong {\n      font-weight: 600;\n      color: inherit;\n    }\n\n    .ai-list {\n      margin: 6px 0;\n      padding-left: 20px;\n\n      li {\n        margin-bottom: 4px;\n        padding-left: 2px;\n      }\n    }\n\n    br + br {\n      display: none;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   Source[_ngcontent-%COMP%]   cards\n.ai-msg-sources[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid $ai-border;\n}\n\n.ai-sources-label[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  color: $ai-text-secondary;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 2px;\n\n  mat-icon {\n    font-size: 13px;\n    width: 13px;\n    height: 13px;\n  }\n}\n\n.ai-source-card[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 10px;\n  border-radius: 10px;\n  border: 1px solid $ai-border;\n  background: $ai-surface;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  width: 100%;\n\n  &:hover {\n    border-color: rgba(124, 77, 255, 0.3);\n    background: $ai-accent-light;\n    box-shadow: 0 2px 8px rgba(124, 77, 255, 0.08);\n\n    .ai-source-card-arrow {\n      opacity: 1;\n      color: $ai-accent;\n    }\n  }\n}\n\n.ai-source-card-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: $ai-accent;\n  flex-shrink: 0;\n}\n\n.ai-source-card-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n  flex: 1;\n  min-width: 0;\n}\n\n.ai-source-card-title[_ngcontent-%COMP%] {\n  font-size: 12.5px;\n  font-weight: 500;\n  color: $ai-text;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-source-card-path[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: $ai-text-secondary;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-source-card-arrow[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  color: #ccc;\n  flex-shrink: 0;\n  opacity: 0;\n  transition: all 0.2s ease;\n}\n\n//[_ngcontent-%COMP%]   Typing[_ngcontent-%COMP%]   indicator\n.ai-msg-typing[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 5px;\n  padding: 14px 18px;\n}\n\n.typing-dot[_ngcontent-%COMP%] {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: $ai-accent;\n  animation: typing-bounce 1.4s infinite ease-in-out;\n\n  &:nth-child(2) {\n    animation-delay: 0.2s;\n  }\n  &:nth-child(3) {\n    animation-delay: 0.4s;\n  }\n}\n\n@keyframes _ngcontent-%COMP%_typing-bounce {\n  0%,\n  80%,\n  100% {\n    transform: scale(0.6);\n    opacity: 0.3;\n  }\n  40% {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n\n//[_ngcontent-%COMP%]   Error\n.ai-chat-error[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 14px;\n  border-radius: 10px;\n  background: #fef2f2;\n  border: 1px solid #fecaca;\n  color: #dc2626;\n  font-size: 12.5px;\n  animation: ai-fade-in 0.3s ease;\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    flex-shrink: 0;\n  }\n}\n\n//[_ngcontent-%COMP%]   Input[_ngcontent-%COMP%]   bar\n.ai-chat-input-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 16px;\n  background: #fff;\n  border-top: 1px solid $ai-border;\n  flex-shrink: 0;\n}\n\n.ai-chat-input[_ngcontent-%COMP%] {\n  flex: 1;\n  border: 1.5px solid $ai-border;\n  border-radius: 22px;\n  padding: 10px 16px;\n  font-size: 13.5px;\n  font-family: inherit;\n  outline: none;\n  background: $ai-surface;\n  color: $ai-text;\n  transition: all 0.2s ease;\n\n  &:focus {\n    border-color: $ai-accent;\n    background: #fff;\n    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);\n  }\n\n  &::placeholder {\n    color: #9aa0a9;\n  }\n}\n\n.ai-chat-send[_ngcontent-%COMP%] {\n  color: $ai-accent;\n  flex-shrink: 0;\n  transition: transform 0.15s ease;\n\n  &:hover:not(:disabled) {\n    transform: scale(1.1);\n  }\n}\n\n//[_ngcontent-%COMP%]   Animations\n@keyframes[_ngcontent-%COMP%]   ai-fade-in[_ngcontent-%COMP%] {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes _ngcontent-%COMP%_ai-fade-up {\n  from {\n    opacity: 0;\n    transform: translateY(8px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n[_nghost-%COMP%]   ::ng-deep[_ngcontent-%COMP%]   sat-platform-nav-user-profile[_ngcontent-%COMP%]   mat-icon.app-shell-user-profile-icon[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n\n  &::before {\n    content: '\\e853';\n    font-family: 'Material Icons';\n    font-size: 24px;\n    line-height: 1;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AppShellComponent, [{
        type: Component,
        args: [{ selector: 'app-shell', imports: [
                    RouterOutlet,
                    RouterLink,
                    SatPlatformNavModule,
                    SatAppHeaderModule,
                    SatLogoModule,
                    MatDialogModule,
                    MatMenuModule,
                    MatButtonModule,
                    MatIconModule,
                    MatSnackBarModule,
                    MatSidenavModule,
                    MatTooltipModule,
                    NavDrawerComponent,
                    PresetBadgeComponent,
                    SelectionTopbarComponent,
                    FormsModule,
                    AiMarkdownPipe,
                    TranslatePipe,
                ], template: "@if (selectionService.selectedCount() > 0) {\n  <lib-selection-topbar\n    class=\"selection-topbar--sticky\"\n    [selectedCount]=\"selectionService.selectedCount()\"\n    [selectedItems]=\"selectionService.selectedItems()\"\n    [clearOnly]=\"selectionService.clearOnlyMode()\"\n    (cleared)=\"selectionService.clear()\"\n  />\n}\n\n<sat-platform-nav-container [class.has-selection-topbar]=\"selectionService.selectedCount() > 0\">\n  <!-- NXENG-927 (product): icon-only rail expand/collapse \u2014 Satori aria-label + matTooltip only.\n       Host visible-label workaround from PR 246 removed per product request. IBM input_label_visible\n       (4056183850) is expected to recur; track closure via documented a11y exception or upstream\n       Satori fix, not by re-adding persistent visible text here. -->\n  <sat-platform-nav>\n    @for (item of navItems(); track item.id) {\n      <sat-platform-nav-list-item\n        [attr.data-nav-id]=\"item.id\"\n        [active]=\"isActive(item.path)\"\n        (click)=\"onNavClick(item, $event)\"\n        [class.nav-item--clipboard-badge]=\"item.path === '/clipboard' && clipboardCount() > 0\"\n        [style.--nav-clipboard-count]=\"\n          item.path === '/clipboard' ? clipboardBadgeCssContent() : null\n        \"\n        [attr.aria-label]=\"clipboardNavAriaLabel(item)\"\n      >\n        <sat-platform-nav-avatar [item]=\"item\" />\n        {{ navText(item) }}\n      </sat-platform-nav-list-item>\n    }\n\n    <sat-platform-nav-user>\n      <sat-platform-nav-user-profile (click)=\"toggleSettingsDrawer()\">\n        <!-- NXENG-894: projected mat-icon/img skips vendor avatar initials. Empty mat-icon +\n             codepoint glyph (not ligature text) \u2014 IBM label_name_visible counted \"account_circle\"\n             as visible label text outside aria-label; fontIcon needs a class-based icon set. -->\n        <mat-icon aria-hidden=\"true\" class=\"app-shell-user-profile-icon\"></mat-icon>\n        {{ displayName() }}\n      </sat-platform-nav-user-profile>\n    </sat-platform-nav-user>\n  </sat-platform-nav>\n\n  <sat-platform-nav-main-content>\n    <sat-app-header>\n      <button\n        type=\"button\"\n        mat-icon-button\n        satAppHeaderPlatformNavMobileTrigger\n        (click)=\"togglePlatformNav()\"\n        [attr.aria-label]=\"'app.nav.toggle' | translate\"\n      >\n        <mat-icon>menu</mat-icon>\n      </button>\n\n      <h1 satAppHeaderTitle>{{ pageTitle() }}</h1>\n      <!--\n        In the title slot, not the trailing one: the global search below is absolutely\n        positioned from the trailing container's left edge, so anything widening that\n        container slides under it.\n      -->\n      <app-preset-badge satAppHeaderTitle />\n\n      <div\n        #globalSearchContainer\n        class=\"header-search\"\n        satAppHeaderLogo\n        (click)=\"$event.stopPropagation()\"\n        (focusout)=\"onGlobalSearchFocusOut($event)\"\n      >\n        <div\n          class=\"header-search-input-wrap\"\n          [class.header-search-filled]=\"globalSearchTerm().trim().length > 0\"\n        >\n          <mat-icon class=\"header-search-icon\" aria-hidden=\"true\">search</mat-icon>\n          <input\n            id=\"global-header-search-input\"\n            type=\"text\"\n            class=\"header-search-input\"\n            placeholder=\" \"\n            [value]=\"globalSearchTerm()\"\n            (focus)=\"onGlobalSearchFocus()\"\n            (input)=\"onGlobalSearchInput($any($event.target).value)\"\n          />\n          <label\n            class=\"header-search-label\"\n            [class.header-search-label--caption]=\"globalSearchTerm().trim().length > 0\"\n            for=\"global-header-search-input\"\n          >\n            {{ 'shell.search.placeholder' | translate }}\n          </label>\n        </div>\n\n        @if (globalSearchOpen()) {\n          <div class=\"header-search-dropdown\">\n            @if (globalSearchLoading()) {\n              <div class=\"header-search-state\">{{ 'shell.search.searching' | translate }}</div>\n            } @else if (globalSearchError()) {\n              <div class=\"header-search-state\">{{ globalSearchError() }}</div>\n            } @else if (globalSearchResults().length === 0) {\n              <div class=\"header-search-state\">{{ 'shell.search.no-results' | translate }}</div>\n            } @else {\n              @for (result of globalSearchResults(); track result.kind + ':' + result.id) {\n                <button\n                  type=\"button\"\n                  class=\"header-search-option\"\n                  (click)=\"onGlobalSearchSelect(result)\"\n                >\n                  @if (result.kind === 'document') {\n                    @if (thumbnailUrl(result); as thumb) {\n                      <img\n                        class=\"header-search-option-preview\"\n                        [src]=\"thumb\"\n                        [alt]=\"result.displayLabel\"\n                      />\n                    } @else {\n                      <span class=\"header-search-option-preview header-search-option-preview--icon\">\n                        <mat-icon>{{ docTypeIcon(result.kind) }}</mat-icon>\n                      </span>\n                    }\n                  } @else {\n                    <span class=\"header-search-option-avatar\">\n                      <mat-icon>{{ userGroupIcon(result) }}</mat-icon>\n                    </span>\n                  }\n                  <span class=\"header-search-option-meta\">\n                    <span class=\"header-search-option-text\" [title]=\"result.displayLabel\">\n                      @for (part of labelHighlightParts(result); track $index) {\n                        @if (part.matched) {\n                          <mark class=\"header-search-highlight\">{{ part.text }}</mark>\n                        } @else {\n                          <span>{{ part.text }}</span>\n                        }\n                      }\n                    </span>\n                    <span class=\"header-search-option-path\">\n                      @for (part of subtextHighlightParts(result); track $index) {\n                        @if (part.matched) {\n                          <mark class=\"header-search-highlight\">{{ part.text }}</mark>\n                        } @else {\n                          <span>{{ part.text }}</span>\n                        }\n                      }\n                    </span>\n                  </span>\n                </button>\n              }\n            }\n          </div>\n        }\n      </div>\n\n      <!--\n        The word mark is decorative here: it is not a link or a control, the header's name\n        comes from the level-1 heading above, and the vendor's own stylesheet drops it\n        entirely below 619px. It is a vendor component whose <svg> carries no <title> and\n        which we cannot label from this template, so the graphic is hidden from assistive\n        technology instead \u2014 otherwise it is announced as an unnamed image (WCAG 1.1.1,\n        NXENG-767 / NXENG-759). aria-hidden is not display:none: it still renders.\n        A configured logo is decorative for the same reason, hence its empty alt.\n        crossorigin=\"anonymous\": a remote logo that redirects to a Nuxeo URL must not carry the\n        session cookie there.\n      -->\n      @if (brandLogo(); as logo) {\n        <img\n          satAppHeaderLogo\n          class=\"app-brand-logo\"\n          [src]=\"logo.url\"\n          alt=\"\"\n          crossorigin=\"anonymous\"\n        />\n      } @else {\n        <sat-word-mark-logo satAppHeaderLogo aria-hidden=\"true\" />\n      }\n\n      <div satAppHeaderActions>\n        @if (featureFlags.aiEnabled()) {\n          <button\n            type=\"button\"\n            mat-icon-button\n            [attr.aria-label]=\"'shell.ai.open' | translate\"\n            (click)=\"toggleAiChat()\"\n            class=\"ai-chat-toggle\"\n            [class.active]=\"aiChatOpen()\"\n          >\n            <mat-icon>auto_awesome</mat-icon>\n          </button>\n        }\n        <button\n          type=\"button\"\n          mat-icon-button\n          class=\"header-settings-menu-button\"\n          [attr.aria-label]=\"'shell.settings.menu' | translate\"\n          [matMenuTriggerFor]=\"headerSettingsMenu\"\n        >\n          <mat-icon>settings</mat-icon>\n        </button>\n      </div>\n    </sat-app-header>\n\n    <mat-menu #headerSettingsMenu=\"matMenu\">\n      @if (themingFlags.themingEnabled()) {\n        <a mat-menu-item routerLink=\"/settings/themes\">\n          <mat-icon>palette</mat-icon>\n          {{ 'shell.menu.themes' | translate }}\n        </a>\n      }\n      <!--\n        AI features are switched off for every user in `AiFeatureFlagService`, so this toggle is\n        commented out rather than deleted: it is the only UI path that could contradict the kill\n        switch. Restore it together with `AI_FEATURES_ENABLED`.\n\n      <button mat-menu-item type=\"button\" (click)=\"featureFlags.toggle()\">\n        <mat-icon [style.color]=\"featureFlags.aiEnabled() ? '#4caf50' : '#9e9e9e'\">{{\n          featureFlags.aiEnabled() ? 'toggle_on' : 'toggle_off'\n        }}</mat-icon>\n        {{\n          'shell.menu.ai-features'\n            | translate\n              : {\n                  state:\n                    (featureFlags.aiEnabled() ? 'shell.menu.state-on' : 'shell.menu.state-off')\n                    | translate,\n                }\n        }}\n      </button>\n      -->\n      <button mat-menu-item type=\"button\">\n        <mat-icon>help_outline</mat-icon>\n        {{ 'shell.menu.help' | translate }}\n      </button>\n      <button mat-menu-item type=\"button\">\n        <mat-icon>info_outline</mat-icon>\n        {{ 'shell.menu.about' | translate }}\n      </button>\n    </mat-menu>\n\n    <mat-sidenav-container class=\"shell-content\">\n      <mat-sidenav\n        mode=\"side\"\n        position=\"start\"\n        [opened]=\"drawerOpen()\"\n        (closed)=\"onDrawerClose()\"\n        class=\"nav-drawer-sidenav\"\n      >\n        <app-nav-drawer\n          [activeItem]=\"activeDrawerItem()\"\n          (itemSelected)=\"onDrawerItemSelected($event)\"\n          (navigateKeepDrawer)=\"onNavigateKeepDrawer($event)\"\n          (signOutSelected)=\"signOut()\"\n        />\n      </mat-sidenav>\n\n      <mat-sidenav\n        mode=\"side\"\n        position=\"end\"\n        [opened]=\"featureFlags.aiEnabled() && aiChatOpen()\"\n        (closed)=\"aiChatOpen.set(false)\"\n        class=\"ai-chat-sidenav\"\n      >\n        <div class=\"ai-chat-panel\">\n          <div class=\"ai-chat-header\">\n            <mat-icon class=\"ai-chat-header-icon\">auto_awesome</mat-icon>\n            <span class=\"ai-chat-header-title\">{{ 'shell.ai.title' | translate }}</span>\n            <button\n              mat-icon-button\n              class=\"ai-chat-clear\"\n              (click)=\"clearAiChat()\"\n              [attr.aria-label]=\"'shell.ai.clear' | translate\"\n            >\n              <mat-icon>delete_sweep</mat-icon>\n            </button>\n            <button\n              mat-icon-button\n              (click)=\"aiChatOpen.set(false)\"\n              [attr.aria-label]=\"'shell.ai.close' | translate\"\n            >\n              <mat-icon>close</mat-icon>\n            </button>\n          </div>\n\n          <div class=\"ai-chat-messages\">\n            @if (!aiChat.hasMessages()) {\n              <div class=\"ai-chat-welcome\">\n                <mat-icon class=\"ai-chat-welcome-icon\">auto_awesome</mat-icon>\n                <h3>{{ 'shell.ai.heading' | translate }}</h3>\n                <p>{{ 'shell.ai.empty-state' | translate }}</p>\n                <div class=\"ai-chat-suggestions\">\n                  <button\n                    class=\"ai-chat-suggestion\"\n                    (click)=\"sendAiSuggestion('shell.ai.suggestion.modified-today')\"\n                  >\n                    {{ 'shell.ai.suggestion.modified-today' | translate }}\n                  </button>\n                  <button\n                    class=\"ai-chat-suggestion\"\n                    (click)=\"sendAiSuggestion('shell.ai.suggestion.summarize-tasks')\"\n                  >\n                    {{ 'shell.ai.suggestion.summarize-tasks' | translate }}\n                  </button>\n                  <button\n                    class=\"ai-chat-suggestion\"\n                    (click)=\"sendAiSuggestion('shell.ai.suggestion.recent-uploads')\"\n                  >\n                    {{ 'shell.ai.suggestion.recent-uploads' | translate }}\n                  </button>\n                </div>\n              </div>\n            }\n            @for (msg of aiChat.messages(); track msg.timestamp) {\n              <div\n                class=\"ai-chat-msg\"\n                [class.user]=\"msg.role === 'user'\"\n                [class.assistant]=\"msg.role === 'assistant'\"\n              >\n                @if (msg.role === 'assistant') {\n                  <div class=\"ai-msg-avatar-wrap\">\n                    <mat-icon class=\"ai-msg-avatar\">auto_awesome</mat-icon>\n                  </div>\n                }\n                <div class=\"ai-msg-bubble\">\n                  @if (msg.role === 'assistant') {\n                    <div class=\"ai-msg-content\" [innerHTML]=\"msg.content | aiMarkdown\"></div>\n                  } @else {\n                    <div class=\"ai-msg-content\">{{ msg.content }}</div>\n                  }\n                  @if (msg.sources?.length) {\n                    <div class=\"ai-msg-sources\">\n                      <div class=\"ai-sources-label\">\n                        <mat-icon>link</mat-icon>\n                        {{ 'shell.ai.sources' | translate }}\n                      </div>\n                      @for (source of msg.sources!; track source.uid) {\n                        <button\n                          type=\"button\"\n                          class=\"ai-source-card\"\n                          matTooltipPosition=\"above\"\n                          (click)=\"openAiSource(source.uid, source.type, source.path)\"\n                        >\n                          <!--\n                            `'File'` is a Nuxeo SCHEMA TYPE, not display text: `docTypeIcon` keys\n                            its map on `File`, `Folder`, `Workspace`. The extraction codemod keyed\n                            this fallback, so in French it became `Fichier`, the lookup missed and\n                            every untyped AI source fell back to the generic icon. Domain values\n                            must not be translated.\n                          -->\n                          <mat-icon class=\"ai-source-card-icon\">{{\n                            docTypeIcon(source.type ?? 'File')\n                          }}</mat-icon>\n                          <span class=\"ai-source-card-info\">\n                            <span class=\"ai-source-card-title\">{{ source.title }}</span>\n                            <span class=\"ai-source-card-path\">{{ source.path }}</span>\n                          </span>\n                          <mat-icon class=\"ai-source-card-arrow\">open_in_new</mat-icon>\n                        </button>\n                      }\n                    </div>\n                  }\n                </div>\n              </div>\n            }\n            @if (aiChat.loading()) {\n              <div class=\"ai-chat-msg assistant\">\n                <mat-icon class=\"ai-msg-avatar\">auto_awesome</mat-icon>\n                <div class=\"ai-msg-bubble ai-msg-typing\">\n                  <span class=\"typing-dot\"></span>\n                  <span class=\"typing-dot\"></span>\n                  <span class=\"typing-dot\"></span>\n                </div>\n              </div>\n            }\n            @if (aiChat.error()) {\n              <div class=\"ai-chat-error\">\n                <mat-icon>error_outline</mat-icon>\n                {{ aiChat.error() }}\n              </div>\n            }\n          </div>\n\n          <div class=\"ai-chat-input-bar\">\n            <input\n              class=\"ai-chat-input\"\n              type=\"text\"\n              [placeholder]=\"'shell.ai.input-placeholder' | translate\"\n              [ngModel]=\"aiChatInput()\"\n              (ngModelChange)=\"aiChatInput.set($event)\"\n              (keydown.enter)=\"sendAiMessage()\"\n              [disabled]=\"aiChat.loading()\"\n            />\n            <button\n              mat-icon-button\n              class=\"ai-chat-send\"\n              [attr.aria-label]=\"'shell.ai.send' | translate\"\n              (click)=\"sendAiMessage()\"\n              [disabled]=\"!aiChatInput().trim() || aiChat.loading()\"\n            >\n              <mat-icon>send</mat-icon>\n            </button>\n          </div>\n        </div>\n      </mat-sidenav>\n\n      <mat-sidenav-content>\n        <router-outlet />\n      </mat-sidenav-content>\n    </mat-sidenav-container>\n  </sat-platform-nav-main-content>\n</sat-platform-nav-container>\n", styles: [":host {\n  display: block;\n  height: 100%;\n  --selection-topbar-height: 48px;\n}\n\n.selection-topbar--sticky {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;\n  z-index: 1200;\n}\n\nsat-platform-nav-container.has-selection-topbar {\n  padding-top: var(--selection-topbar-height);\n  height: calc(100% - var(--selection-topbar-height));\n}\n\n:host ::ng-deep sat-platform-nav-list-item.nav-item--clipboard-badge .sat-platform-nav-icon {\n  position: relative;\n  overflow: visible;\n}\n\n:host ::ng-deep sat-platform-nav-list-item.nav-item--clipboard-badge .sat-platform-nav-icon::after {\n  content: var(--nav-clipboard-count);\n  position: absolute;\n  top: -4px;\n  right: -6px;\n  z-index: 2;\n  min-width: 16px;\n  height: 16px;\n  padding: 0 4px;\n  border-radius: 999px;\n  background: var(--mat-sys-error, #b3261e);\n  color: var(--mat-sys-on-error, #fff);\n  font-size: 10px;\n  font-weight: 600;\n  line-height: 16px;\n  text-align: center;\n  pointer-events: none;\n  box-sizing: border-box;\n}\n\n.shell-content {\n  height: calc(100% - var(--selection-topbar-height));\n}\n\n.nav-drawer-sidenav {\n  width: 280px;\n  border-right: none;\n  box-shadow: 2px 0 8px rgb(0 0 0 / 8%);\n  background: var(--mat-sys-surface);\n  overflow: hidden;\n}\n\n:host ::ng-deep .nav-drawer-sidenav .mat-drawer-inner-container {\n  overflow: hidden !important;\n  scrollbar-width: none;\n  -ms-overflow-style: none;\n\n  &::-webkit-scrollbar {\n    display: none;\n  }\n}\n\n:host ::ng-deep sat-app-header .sat-app-header-leading-container {\n  width: 30%;\n  max-width: 30%;\n  min-width: 0;\n}\n\n:host ::ng-deep sat-app-header,\n:host ::ng-deep sat-app-header header,\n:host ::ng-deep sat-app-header .sat-app-header-content-container,\n:host ::ng-deep sat-app-header .sat-app-header-content {\n  overflow: visible;\n}\n\n:host ::ng-deep sat-app-header .sat-app-header-trailing-container {\n  position: relative;\n  width: 70%;\n  max-width: 70%;\n  min-width: 0;\n  justify-content: flex-end;\n  overflow: visible;\n  z-index: 5;\n}\n\n.header-search {\n  position: absolute;\n  left: 0;\n  top: 50%;\n  transform: translateY(-50%);\n  width: clamp(340px, 42vw, 680px);\n  max-width: min(680px, calc(100vw - 360px));\n  min-width: 280px;\n  margin: 0;\n  z-index: 20;\n}\n\n// The pill border and the magnifier used to live on this wrapper, with the input sitting\n// inside its padding. That left the only focusable element in the control with no box of\n// its own to draw a focus ring around, and `outline: none` below removed the browser's.\n// The border now belongs to the input; this element just positions the magnifier over it.\n.header-search-input-wrap {\n  display: flex;\n  align-items: center;\n  position: relative;\n  height: 42px;\n  border-radius: 20px;\n  background: #fff;\n  // Pill is always light; foreground tokens stay on the wrapper so label, icon and input\n  // share one scheme regardless of page theme (NXENG-798).\n  --shell-header-search-muted-foreground: #667085;\n  --shell-header-search-foreground: #101828;\n}\n\n.header-search-icon {\n  position: absolute;\n  // 13px is the wrapper's old 12px padding plus the 1px border that moved onto the input.\n  // The input's 40px left padding below is that, plus this 20px icon and the 8px gap that\n  // used to separate them \u2014 measured at 39.94px before the change.\n  left: 13px;\n  top: 50%;\n  transform: translateY(-50%);\n  z-index: 1;\n  pointer-events: none;\n  color: var(--shell-header-search-muted-foreground);\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n}\n\n.header-search-input {\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  padding: 0 13px 0 40px;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 20px;\n  outline: none;\n  background: transparent;\n  font-size: 14px;\n  color: var(--shell-header-search-foreground);\n}\n\n// Visible label for the global search field (NXENG-798). Overlays the empty field like a\n// placeholder, then shrinks to a persistent caption above the typed query so the control\n// keeps a visible name in every state (IBM input_label_visible / WCAG 2.5.3).\n//\n.header-search-label {\n  position: absolute;\n  left: 40px;\n  right: 13px;\n  pointer-events: none;\n  color: var(--shell-header-search-muted-foreground);\n  line-height: 1;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  transition:\n    top 0.15s ease,\n    transform 0.15s ease,\n    font-size 0.15s ease;\n}\n\n// Empty-field overlay only \u2014 filled caption geometry is global in `styles.scss`.\n.header-search-label:not(.header-search-label--caption) {\n  top: 50%;\n  transform: translateY(-50%);\n  font-size: 14px;\n}\n\n// Filled-state caption geometry lives in `styles.scss` (single declaration for app + Karma).\n\n.header-search-input:focus + .header-search-label {\n  top: 6px;\n  transform: none;\n  font-size: 11px;\n  opacity: 1;\n}\n\n.header-search-input-wrap.header-search-filled .header-search-input,\n.header-search-input:focus {\n  padding-top: 15px;\n  padding-bottom: 5px;\n}\n\n// `outline-offset` puts the ring entirely outside the field, with the gap showing what is\n// behind it \u2014 so the colour it has to contrast with is the header's, not the field's white.\n// That is why the ring tracks `--mat-sys-primary` and is deliberately NOT pinned to the\n// light scheme: the header follows the colour scheme, so the ring must too. Measured\n// against the header across the four packaged themes and both OS schemes: lowest 5.80:1\n// (light theme), highest 10.11:1 (dark theme). Forcing it light dropped it to 2.65:1.\n//\n// NXENG-909 / IBM issue 3350142295 \u2014 same control as NXENG-775.\n// Keep this as its own selector. IBM Equal Access's `style_focus_visible` reads the\n// element's `:focus` styles only \u2014 it collects `:focus-visible` and `:focus-within` and\n// then never looks at them \u2014 and its lookup does not resolve selector lists, so writing\n// `&:focus, &:focus-visible` here reports the input as having no focus indicator again.\n// `:focus` loses nothing: an element that accepts keyboard input matches `:focus-visible`\n// whenever it is focused, mouse included.\n.header-search-input:focus {\n  outline: 2px solid var(--mat-sys-primary);\n  outline-offset: 2px;\n}\n\n// Same IBM `style_focus_visible` constraints as `.header-search-input:focus` above.\n// Chain Material's own classes so this wins over MDC's `outline-style: none` on icon buttons.\n.header-settings-menu-button.mat-mdc-icon-button:focus {\n  outline-style: solid;\n  outline-width: 2px;\n  outline-color: var(--mat-sys-primary);\n  outline-offset: 2px;\n}\n\n.header-search-dropdown {\n  position: absolute;\n  top: calc(100% + 8px);\n  left: 0;\n  right: 0;\n  max-height: 360px;\n  overflow-y: auto;\n  background: #fff;\n  border: 1px solid #e4e7ec;\n  border-radius: 12px;\n  box-shadow: 0 12px 24px rgb(16 24 40 / 12%);\n  z-index: 30;\n  padding: 6px;\n}\n\n.header-search-state {\n  padding: 12px;\n  color: #475467;\n  font-size: 13px;\n}\n\n.header-search-option {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  width: 100%;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  padding: 10px;\n  border-radius: 8px;\n  cursor: pointer;\n\n  &:hover {\n    background: #f2f4f7;\n  }\n}\n\n.header-search-option-preview {\n  width: 48px;\n  height: 48px;\n  border-radius: 6px;\n  object-fit: cover;\n  border: 1px solid #eaecf0;\n  flex-shrink: 0;\n\n  &--icon {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    background: #f4f6f8;\n    color: #8a94a0;\n\n    mat-icon {\n      font-size: 24px;\n      width: 24px;\n      height: 24px;\n    }\n  }\n}\n\n.header-search-option-avatar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n  background: #f2f4f7;\n  border: 1px solid #eaecf0;\n  flex-shrink: 0;\n  color: #475467;\n}\n\n.header-search-option-meta {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  flex: 1;\n  min-width: 0;\n}\n\n.header-search-option-text {\n  font-weight: 500;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.header-search-option-path {\n  font-size: 12px;\n  color: #667085;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.header-search-highlight {\n  background: #fff3bf;\n  color: inherit;\n  font-weight: 700;\n  border-radius: 2px;\n  padding: 0;\n}\n\n@media (max-width: 1024px) {\n  .header-search {\n    width: clamp(280px, 48vw, 560px);\n    max-width: calc(100vw - 280px);\n  }\n}\n\n@media (max-width: 768px) {\n  .header-search {\n    width: min(540px, calc(100vw - 96px));\n    max-width: calc(100vw - 96px);\n    min-width: 220px;\n  }\n}\n\n// AI Chat Drawer\n$ai-accent: #7c4dff;\n$ai-accent-light: #ede7ff;\n$ai-accent-gradient: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n$ai-surface: #fafbfe;\n$ai-border: #e8eaef;\n$ai-text: #1a1c1e;\n$ai-text-secondary: #5f6368;\n$ai-radius: 14px;\n\n.ai-chat-toggle {\n  &.active {\n    color: $ai-accent;\n  }\n}\n\n.ai-chat-sidenav {\n  width: 400px;\n  border-left: none;\n  box-shadow: -4px 0 24px rgb(0 0 0 / 8%);\n}\n\n.ai-chat-panel {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  background: $ai-surface;\n}\n\n.ai-chat-header {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 14px 16px;\n  background: #fff;\n  border-bottom: 1px solid $ai-border;\n  flex-shrink: 0;\n}\n\n.ai-chat-header-icon {\n  color: $ai-accent;\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n}\n\n.ai-chat-header-title {\n  font-size: 15px;\n  font-weight: 600;\n  color: $ai-text;\n  flex: 1;\n  letter-spacing: -0.01em;\n}\n\n.ai-chat-clear {\n  color: $ai-text-secondary;\n}\n\n// Messages area\n.ai-chat-messages {\n  flex: 1;\n  overflow-y: auto;\n  padding: 16px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  scroll-behavior: smooth;\n}\n\n// Welcome state\n.ai-chat-welcome {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  text-align: center;\n  padding: 40px 20px 24px;\n  gap: 8px;\n  animation: ai-fade-in 0.4s ease;\n\n  h3 {\n    margin: 0;\n    font-size: 17px;\n    font-weight: 700;\n    color: $ai-text;\n    letter-spacing: -0.02em;\n  }\n\n  p {\n    margin: 0;\n    font-size: 13px;\n    color: $ai-text-secondary;\n    line-height: 1.6;\n    max-width: 280px;\n  }\n}\n\n.ai-chat-welcome-icon {\n  font-size: 48px;\n  width: 48px;\n  height: 48px;\n  color: $ai-accent;\n  filter: drop-shadow(0 4px 12px rgba(124, 77, 255, 0.25));\n}\n\n.ai-chat-suggestions {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  margin-top: 16px;\n  width: 100%;\n}\n\n.ai-chat-suggestion {\n  padding: 11px 16px;\n  border-radius: 12px;\n  border: 1px solid $ai-border;\n  background: #fff;\n  font: inherit;\n  font-size: 13px;\n  text-align: left;\n  color: $ai-text;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  box-shadow: 0 1px 3px rgb(0 0 0 / 4%);\n\n  &:hover {\n    border-color: $ai-accent;\n    background: $ai-accent-light;\n    box-shadow: 0 2px 8px rgba(124, 77, 255, 0.1);\n    transform: translateY(-1px);\n  }\n}\n\n// Message rows\n.ai-chat-msg {\n  display: flex;\n  align-items: flex-start;\n  gap: 10px;\n  animation: ai-fade-up 0.3s ease;\n\n  &.user {\n    justify-content: flex-end;\n\n    .ai-msg-bubble {\n      background: $ai-accent-gradient;\n      color: #fff;\n      border-radius: 18px 18px 4px 18px;\n      box-shadow: 0 2px 8px rgba(124, 77, 255, 0.2);\n    }\n  }\n\n  &.assistant {\n    .ai-msg-bubble {\n      background: #fff;\n      color: $ai-text;\n      border-radius: 18px 18px 18px 4px;\n      border: 1px solid $ai-border;\n      box-shadow: 0 1px 4px rgb(0 0 0 / 4%);\n    }\n  }\n}\n\n.ai-msg-avatar-wrap {\n  width: 28px;\n  height: 28px;\n  border-radius: 50%;\n  background: $ai-accent-light;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n  margin-top: 2px;\n}\n\n.ai-msg-avatar {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: $ai-accent;\n}\n\n.ai-msg-bubble {\n  max-width: 85%;\n  padding: 12px 16px;\n  font-size: 13.5px;\n  line-height: 1.6;\n}\n\n.ai-msg-content {\n  word-break: break-word;\n\n  :host ::ng-deep {\n    strong {\n      font-weight: 600;\n      color: inherit;\n    }\n\n    .ai-list {\n      margin: 6px 0;\n      padding-left: 20px;\n\n      li {\n        margin-bottom: 4px;\n        padding-left: 2px;\n      }\n    }\n\n    br + br {\n      display: none;\n    }\n  }\n}\n\n// Source cards\n.ai-msg-sources {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  margin-top: 12px;\n  padding-top: 10px;\n  border-top: 1px solid $ai-border;\n}\n\n.ai-sources-label {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-size: 11px;\n  font-weight: 600;\n  color: $ai-text-secondary;\n  text-transform: uppercase;\n  letter-spacing: 0.05em;\n  margin-bottom: 2px;\n\n  mat-icon {\n    font-size: 13px;\n    width: 13px;\n    height: 13px;\n  }\n}\n\n.ai-source-card {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  padding: 8px 10px;\n  border-radius: 10px;\n  border: 1px solid $ai-border;\n  background: $ai-surface;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  width: 100%;\n\n  &:hover {\n    border-color: rgba(124, 77, 255, 0.3);\n    background: $ai-accent-light;\n    box-shadow: 0 2px 8px rgba(124, 77, 255, 0.08);\n\n    .ai-source-card-arrow {\n      opacity: 1;\n      color: $ai-accent;\n    }\n  }\n}\n\n.ai-source-card-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: $ai-accent;\n  flex-shrink: 0;\n}\n\n.ai-source-card-info {\n  display: flex;\n  flex-direction: column;\n  gap: 1px;\n  flex: 1;\n  min-width: 0;\n}\n\n.ai-source-card-title {\n  font-size: 12.5px;\n  font-weight: 500;\n  color: $ai-text;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-source-card-path {\n  font-size: 11px;\n  color: $ai-text-secondary;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.ai-source-card-arrow {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  color: #ccc;\n  flex-shrink: 0;\n  opacity: 0;\n  transition: all 0.2s ease;\n}\n\n// Typing indicator\n.ai-msg-typing {\n  display: flex;\n  gap: 5px;\n  padding: 14px 18px;\n}\n\n.typing-dot {\n  width: 7px;\n  height: 7px;\n  border-radius: 50%;\n  background: $ai-accent;\n  animation: typing-bounce 1.4s infinite ease-in-out;\n\n  &:nth-child(2) {\n    animation-delay: 0.2s;\n  }\n  &:nth-child(3) {\n    animation-delay: 0.4s;\n  }\n}\n\n@keyframes typing-bounce {\n  0%,\n  80%,\n  100% {\n    transform: scale(0.6);\n    opacity: 0.3;\n  }\n  40% {\n    transform: scale(1);\n    opacity: 1;\n  }\n}\n\n// Error\n.ai-chat-error {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 14px;\n  border-radius: 10px;\n  background: #fef2f2;\n  border: 1px solid #fecaca;\n  color: #dc2626;\n  font-size: 12.5px;\n  animation: ai-fade-in 0.3s ease;\n\n  mat-icon {\n    font-size: 16px;\n    width: 16px;\n    height: 16px;\n    flex-shrink: 0;\n  }\n}\n\n// Input bar\n.ai-chat-input-bar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 12px 16px;\n  background: #fff;\n  border-top: 1px solid $ai-border;\n  flex-shrink: 0;\n}\n\n.ai-chat-input {\n  flex: 1;\n  border: 1.5px solid $ai-border;\n  border-radius: 22px;\n  padding: 10px 16px;\n  font-size: 13.5px;\n  font-family: inherit;\n  outline: none;\n  background: $ai-surface;\n  color: $ai-text;\n  transition: all 0.2s ease;\n\n  &:focus {\n    border-color: $ai-accent;\n    background: #fff;\n    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.1);\n  }\n\n  &::placeholder {\n    color: #9aa0a9;\n  }\n}\n\n.ai-chat-send {\n  color: $ai-accent;\n  flex-shrink: 0;\n  transition: transform 0.15s ease;\n\n  &:hover:not(:disabled) {\n    transform: scale(1.1);\n  }\n}\n\n// Animations\n@keyframes ai-fade-in {\n  from {\n    opacity: 0;\n  }\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes ai-fade-up {\n  from {\n    opacity: 0;\n    transform: translateY(8px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n\n:host ::ng-deep sat-platform-nav-user-profile mat-icon.app-shell-user-profile-icon {\n  flex-shrink: 0;\n\n  &::before {\n    content: '\\e853';\n    font-family: 'Material Icons';\n    font-size: 24px;\n    line-height: 1;\n  }\n}\n"] }]
    }], () => [], { globalSearchContainer: [{
            type: ViewChild,
            args: ['globalSearchContainer']
        }], onDocumentClick: [{
            type: HostListener,
            args: ['document:click', ['$event']]
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AppShellComponent, { className: "AppShellComponent", filePath: "apps/nuxeo-ui/src/app/shell/app-shell.component.ts", lineNumber: 94 }); })();
