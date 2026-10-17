import { Component, input, output, computed, signal, ChangeDetectionStrategy, viewChild, } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkAriaLive } from '@angular/cdk/a11y';
// Shared rather than local: this normalisation guards three separate served-type checks, and a
// divergence between them would be a bypass.
import { mediaTypeEssence } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import { NxsSpinnerComponent } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/tooltip";
const _c0 = ["videoPlayer"];
const _c1 = a0 => [a0];
const _c2 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.url;
const _forTrack1 = ($index, $item) => $item.timecode;
const _forTrack2 = ($index, $item) => $item.title;
const _forTrack3 = ($index, $item) => $item.labelKey;
function DocumentViewerComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "nxs-spinner", 17);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "shared-ui.document-viewer.loading"));
} }
function DocumentViewerComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "mat-icon", 18);
    i0.ɵɵtext(2, "edit_note");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 19);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "shared-ui.document-viewer.annotations-are-not-available-for-this"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 4, "shared-ui.document-viewer.use-the-view-tab-for-the"));
} }
function DocumentViewerComponent_Conditional_4_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 20);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r0.arenderUrl(), i0.ɵɵsanitizeResourceUrl)("title", i0.ɵɵpipeBind2(1, 2, "shared-ui.document-viewer.annotations-frame", i0.ɵɵpureFunction1(5, _c2, ctx_r0.fileName())));
} }
function DocumentViewerComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentViewerComponent_Conditional_4_For_1_Template, 2, 7, "iframe", 20, i0.ɵɵrepeaterTrackByIdentity);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(i0.ɵɵpureFunction1(0, _c1, ctx_r0.arenderReloadId()));
} }
function DocumentViewerComponent_Conditional_5_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 29);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("transform", ctx_r0.transform());
    i0.ɵɵclassProp("fit-real", ctx_r0.fitMode() === "real");
    i0.ɵɵproperty("src", ctx_r0.blobUrl(), i0.ɵɵsanitizeUrl)("alt", ctx_r0.fileName());
} }
function DocumentViewerComponent_Conditional_5_Case_1_Conditional_3_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "source", 32);
} if (rf & 2) {
    const src_r2 = ctx.$implicit;
    i0.ɵɵproperty("src", src_r2.url)("type", src_r2.mimeType);
} }
function DocumentViewerComponent_Conditional_5_Case_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, DocumentViewerComponent_Conditional_5_Case_1_Conditional_3_For_1_Template, 1, 2, "source", 32, _forTrack0);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r0.videoSources());
} }
function DocumentViewerComponent_Conditional_5_Case_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "source", 31);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("src", ctx_r0.rawBlobUrl());
} }
function DocumentViewerComponent_Conditional_5_Case_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 22)(1, "video", 30, 0);
    i0.ɵɵconditionalCreate(3, DocumentViewerComponent_Conditional_5_Case_1_Conditional_3_Template, 2, 0)(4, DocumentViewerComponent_Conditional_5_Case_1_Conditional_4_Template, 1, 1, "source", 31);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("poster", ctx_r0.posterUrl());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.videoSources().length > 0 ? 3 : 4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 3, "ui.document-viewer.your-browser-does-not-support-video"), " ");
} }
function DocumentViewerComponent_Conditional_5_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 23)(1, "mat-icon", 33);
    i0.ɵɵtext(2, "audiotrack");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "audio", 34);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("src", ctx_r0.rawBlobUrl());
} }
function DocumentViewerComponent_Conditional_5_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 24);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("innerHTML", ctx_r0.noteHtml(), i0.ɵɵsanitizeHtml);
} }
function DocumentViewerComponent_Conditional_5_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 25);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("srcdoc", ctx_r0.noteContent(), i0.ɵɵsanitizeHtml)("title", i0.ɵɵpipeBind2(1, 2, "shared-ui.document-viewer.note-frame", i0.ɵɵpureFunction1(5, _c2, ctx_r0.fileName())));
} }
function DocumentViewerComponent_Conditional_5_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "pre", 26);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.noteContent());
} }
function DocumentViewerComponent_Conditional_5_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "pre", 27);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.noteContent());
} }
function DocumentViewerComponent_Conditional_5_Case_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 28);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r0.blobUrl(), i0.ɵɵsanitizeResourceUrl)("title", i0.ɵɵpipeBind2(1, 2, "shared-ui.document-viewer.pdf-frame", i0.ɵɵpureFunction1(5, _c2, ctx_r0.fileName())));
} }
function DocumentViewerComponent_Conditional_5_Case_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 28);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r0.blobUrl(), i0.ɵɵsanitizeResourceUrl)("title", i0.ɵɵpipeBind2(1, 2, "shared-ui.document-viewer.pdf-frame", i0.ɵɵpureFunction1(5, _c2, ctx_r0.fileName())));
} }
function DocumentViewerComponent_Conditional_5_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "iframe", 28);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("src", ctx_r0.previewUrl(), i0.ɵɵsanitizeResourceUrl)("title", i0.ɵɵpipeBind2(1, 2, "shared-ui.document-viewer.preview-frame", i0.ɵɵpureFunction1(5, _c2, ctx_r0.fileName())));
} }
function DocumentViewerComponent_Conditional_5_Case_10_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.mimeType());
} }
function DocumentViewerComponent_Conditional_5_Case_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "mat-icon", 18);
    i0.ɵɵtext(2, "insert_drive_file");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "p");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, DocumentViewerComponent_Conditional_5_Case_10_Conditional_6_Template, 2, 1, "span", 19);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 2, "shared-ui.document-viewer.preview-not-available"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.mimeType() ? 6 : -1);
} }
function DocumentViewerComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentViewerComponent_Conditional_5_Case_0_Template, 1, 6, "img", 21)(1, DocumentViewerComponent_Conditional_5_Case_1_Template, 7, 5, "div", 22)(2, DocumentViewerComponent_Conditional_5_Case_2_Template, 4, 1, "div", 23)(3, DocumentViewerComponent_Conditional_5_Case_3_Template, 1, 1, "div", 24)(4, DocumentViewerComponent_Conditional_5_Case_4_Template, 2, 7, "iframe", 25)(5, DocumentViewerComponent_Conditional_5_Case_5_Template, 2, 1, "pre", 26)(6, DocumentViewerComponent_Conditional_5_Case_6_Template, 2, 1, "pre", 27)(7, DocumentViewerComponent_Conditional_5_Case_7_Template, 2, 7, "iframe", 28)(8, DocumentViewerComponent_Conditional_5_Case_8_Template, 2, 7, "iframe", 28)(9, DocumentViewerComponent_Conditional_5_Case_9_Template, 2, 7, "iframe", 28)(10, DocumentViewerComponent_Conditional_5_Case_10_Template, 7, 4, "div", 4);
} if (rf & 2) {
    let tmp_1_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_1_0 = ctx_r0.contentType()) === "image" ? 0 : tmp_1_0 === "video" ? 1 : tmp_1_0 === "audio" ? 2 : tmp_1_0 === "markdown" ? 3 : tmp_1_0 === "html" ? 4 : tmp_1_0 === "xml" ? 5 : tmp_1_0 === "text" ? 6 : tmp_1_0 === "pdf" ? 7 : tmp_1_0 === "pdfRendition" ? 8 : tmp_1_0 === "preview" ? 9 : 10);
} }
function DocumentViewerComponent_Conditional_6_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_6_For_2_Template_button_click_0_listener() { const item_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.seekTo(item_r4.timecode)); });
    i0.ɵɵelement(1, "img", 37);
    i0.ɵɵelementStart(2, "span", 38);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("matTooltip", item_r4.label || ctx_r0.formatTimecode(item_r4.timecode));
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", item_r4.thumbnailUrl, i0.ɵɵsanitizeUrl)("alt", item_r4.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r0.formatTimecode(item_r4.timecode));
} }
function DocumentViewerComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵrepeaterCreate(1, DocumentViewerComponent_Conditional_6_For_2_Template, 4, 4, "button", 35, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.storyboard());
} }
function DocumentViewerComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "button", 13);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_7_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.zoomIn()); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "zoom_in");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 13);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_7_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.toggleFit()); });
    i0.ɵɵelementStart(10, "mat-icon");
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "button", 13);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_7_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.zoomOut()); });
    i0.ɵɵelementStart(15, "mat-icon");
    i0.ɵɵtext(16, "zoom_out");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "button", 13);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵpipe(19, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_7_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.rotateLeft()); });
    i0.ɵɵelementStart(20, "mat-icon");
    i0.ɵɵtext(21, "rotate_left");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "button", 13);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_7_Template_button_click_22_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.rotateRight()); });
    i0.ɵɵelementStart(25, "mat-icon");
    i0.ɵɵtext(26, "rotate_right");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 11, "shared-ui.document-viewer.zoom-in"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 13, "shared-ui.document-viewer.zoom-in"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", ctx_r0.fitMode() === "width" ? i0.ɵɵpipeBind1(7, 15, "ui.actual-size") : i0.ɵɵpipeBind1(8, 17, "ui.fit-to-viewer"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 19, "shared-ui.document-viewer.toggle-fit"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r0.fitMode() === "width" ? "crop_free" : "fit_screen");
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(13, 21, "shared-ui.document-viewer.zoom-out"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(14, 23, "shared-ui.document-viewer.zoom-out"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(18, 25, "shared-ui.document-viewer.rotate-left"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(19, 27, "shared-ui.document-viewer.rotate-left"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(23, 29, "shared-ui.document-viewer.rotate-right"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(24, 31, "shared-ui.document-viewer.rotate-right"));
} }
function DocumentViewerComponent_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.fileSize());
} }
function DocumentViewerComponent_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 13);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_14_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.openWithDriveClicked.emit()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "cloud_sync");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "shared-ui.document-viewer.open-with-nuxeo-drive"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "shared-ui.document-viewer.open-with-nuxeo-drive"));
} }
function DocumentViewerComponent_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 39);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_27_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.replaceMainFileClicked.emit()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "find_replace");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 40);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_27_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r7); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.removeMainFileClicked.emit()); });
    i0.ɵɵelementStart(7, "span", 14);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "mat-icon", 15);
    i0.ɵɵtext(11, "cancel");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 6, "shared-ui.document-viewer.replace-main-file"))("disabled", ctx_r0.mainFileActionInProgress() === "replace-main");
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 8, "shared-ui.document-viewer.replace-main-file"));
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(6, 10, "shared-ui.document-viewer.remove-main-file"))("disabled", ctx_r0.mainFileActionInProgress() === "remove-main");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 12, "shared-ui.document-viewer.remove-main-file"));
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vi_r8 = i0.ɵɵnextContext();
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.duration"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.formatDuration(vi_r8.duration));
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vi_r8 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 3, "shared-ui.document-viewer.resolution"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", vi_r8.width, " \u00D7 ", vi_r8.height);
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vi_r8 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.format"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(vi_r8.format);
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vi_r8 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.video-codec"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(vi_r8.videoCodec);
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vi_r8 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.audio-codec"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(vi_r8.audioCodec);
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const vi_r8 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.frame-rate"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1("", vi_r8.frameRate, " fps");
} }
function DocumentViewerComponent_Conditional_28_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_0_Template, 6, 4, "div", 44);
    i0.ɵɵconditionalCreate(1, DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_1_Template, 6, 5, "div", 44);
    i0.ɵɵconditionalCreate(2, DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_2_Template, 6, 4, "div", 44);
    i0.ɵɵconditionalCreate(3, DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_3_Template, 6, 4, "div", 44);
    i0.ɵɵconditionalCreate(4, DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_4_Template, 6, 4, "div", 44);
    i0.ɵɵconditionalCreate(5, DocumentViewerComponent_Conditional_28_Conditional_6_Conditional_5_Template, 6, 4, "div", 44);
} if (rf & 2) {
    const vi_r8 = ctx;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r0.isFiniteNumber(vi_r8.duration) ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(vi_r8.width && vi_r8.height ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(vi_r8.format ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(vi_r8.videoCodec ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(vi_r8.audioCodec ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(vi_r8.frameRate ? 5 : -1);
} }
function DocumentViewerComponent_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "div", 41)(2, "h4", 42);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 43);
    i0.ɵɵconditionalCreate(6, DocumentViewerComponent_Conditional_28_Conditional_6_Template, 6, 6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_2_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 2, "shared-ui.document-viewer.video-info"));
    i0.ɵɵadvance(3);
    i0.ɵɵconditional((tmp_2_0 = ctx_r0.videoInfo()) ? 6 : -1, tmp_2_0);
} }
function DocumentViewerComponent_Conditional_29_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.color-profile"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.pictureInfo().colorSpace);
} }
function DocumentViewerComponent_Conditional_29_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "shared-ui.document-viewer.bit-depth-per-channel"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.pictureInfo().depth);
} }
function DocumentViewerComponent_Conditional_29_Conditional_26_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 47)(1, "span", 48);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 49);
    i0.ɵɵtext(4);
    i0.ɵɵelementStart(5, "span", 50);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 51);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 52);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵlistener("click", function DocumentViewerComponent_Conditional_29_Conditional_26_For_6_Template_button_click_9_listener() { const view_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.formatDownload.emit(view_r10.downloadUrl)); });
    i0.ɵɵelementStart(12, "mat-icon");
    i0.ɵɵtext(13, "download");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const view_r10 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(view_r10.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2(" ", view_r10.width, " x ", view_r10.height, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(view_r10.fileSize);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(view_r10.format);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind2(10, 7, "shared-ui.document-viewer.download-named", i0.ɵɵpureFunction1(13, _c2, view_r10.title)));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(11, 10, "shared-ui.document-viewer.download-named", i0.ɵɵpureFunction1(15, _c2, view_r10.title)));
} }
function DocumentViewerComponent_Conditional_29_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "h4", 42);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 43);
    i0.ɵɵrepeaterCreate(5, DocumentViewerComponent_Conditional_29_Conditional_26_For_6_Template, 14, 17, "div", 47, _forTrack2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "shared-ui.document-viewer.additional-formats"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.pictureViews());
} }
function DocumentViewerComponent_Conditional_29_Conditional_27_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const entry_r11 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, entry_r11.labelKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(entry_r11.value);
} }
function DocumentViewerComponent_Conditional_29_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "h4", 42);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 43);
    i0.ɵɵrepeaterCreate(5, DocumentViewerComponent_Conditional_29_Conditional_27_For_6_Template, 6, 4, "div", 44, _forTrack3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "shared-ui.document-viewer.exif"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.exifEntries());
} }
function DocumentViewerComponent_Conditional_29_Conditional_28_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 44)(1, "span", 45);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 46);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const entry_r12 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, entry_r12.labelKey));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(entry_r12.value);
} }
function DocumentViewerComponent_Conditional_29_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41)(1, "h4", 42);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 43);
    i0.ɵɵrepeaterCreate(5, DocumentViewerComponent_Conditional_29_Conditional_28_For_6_Template, 6, 4, "div", 44, _forTrack3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "shared-ui.document-viewer.iptc"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.iptcEntries());
} }
function DocumentViewerComponent_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 16)(1, "div", 41)(2, "h4", 42);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 43)(6, "div", 44)(7, "span", 45);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "span", 46);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 44)(13, "span", 45);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "span", 46);
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(18, DocumentViewerComponent_Conditional_29_Conditional_18_Template, 6, 4, "div", 44);
    i0.ɵɵconditionalCreate(19, DocumentViewerComponent_Conditional_29_Conditional_19_Template, 6, 4, "div", 44);
    i0.ɵɵelementStart(20, "div", 44)(21, "span", 45);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "span", 46);
    i0.ɵɵtext(25);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵconditionalCreate(26, DocumentViewerComponent_Conditional_29_Conditional_26_Template, 7, 3, "div", 41);
    i0.ɵɵconditionalCreate(27, DocumentViewerComponent_Conditional_29_Conditional_27_Template, 7, 3, "div", 41);
    i0.ɵɵconditionalCreate(28, DocumentViewerComponent_Conditional_29_Conditional_28_Template, 7, 3, "div", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 13, "shared-ui.document-viewer.picture-info"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 15, "shared-ui.document-viewer.dimensions"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate2("", ctx_r0.pictureInfo().width, " x ", ctx_r0.pictureInfo().height);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 17, "shared-ui.document-viewer.format"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.pictureInfo().format);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.pictureInfo().colorSpace ? 18 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.pictureInfo().depth ? 19 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 19, "shared-ui.document-viewer.weight"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.pictureInfo().weight);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.pictureViews().length > 0 ? 26 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.exifEntries().length > 0 ? 27 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.iptcEntries().length > 0 ? 28 : -1);
} }
/**
 * Reusable document viewer component following Nuxeo Web UI's nuxeo-document-preview
 * dispatching logic. Renders content based on MIME type priority:
 *
 * 1. image/*           → Image viewer with zoom/rotate/pan
 * 2. video/*           → HTML5 video player with storyboard
 * 3. audio/*           → HTML5 audio player
 * 4. text/markdown     → Rendered markdown (passed as safe HTML)
 * 5. text/html         → Iframe with srcdoc
 * 6. text/xml          → Preformatted text
 * 7. text/plain        → Preformatted text
 * 8. application/pdf   → PDF iframe (browser-native or PDF.js)
 * 9. (pdf rendition)   → PDF iframe using server-rendered PDF of office docs
 * 10. (fallback)       → Generic iframe with preview URL, or "no preview" placeholder
 */
export class DocumentViewerComponent {
    blobUrl = input(null, ...(ngDevMode ? [{ debugName: "blobUrl" }] : []));
    /**
     * The same object URL as `blobUrl`, unwrapped.
     *
     * `source[src]`, `audio[src]` and `video[poster]` are `SecurityContext.NONE` in Angular's DOM
     * security schema, which means no sanitizer runs on them — and a `Safe*` value is only ever
     * unwrapped *by* a sanitizer. Bound into a NONE context it is therefore assigned to the DOM
     * property as-is and coerced by `toString()`, writing the literal string
     * `"SafeValue must use [property]=binding: …"` into `src`. Audio playback and the
     * single-source video fallback were broken exactly that way until this input existed.
     *
     * So: `blobUrl` for `iframe[src]` (which conversely *throws* on a raw string) and `img[src]`,
     * this one for the three NONE bindings. Enforced by `scripts/beta-harness/sanitizer-audit.mjs`
     * check 4, which follows the bound expression to a type declaration and — crucially — reports any
     * NONE-context binding whose type it cannot resolve, rather than assuming it is safe.
     */
    /**
     * Required, not optional with a `null` default — the default is what made this fail silently.
     *
     * `audio[src]` and the single-source `video[src]` fallback are `SecurityContext.NONE`, so they need
     * the raw string; `blobUrl` is a `SafeResourceUrl` and stringifies to
     * `"SafeValue must use [property]=binding: …"` there. A consumer that omits this input keeps
     * compiling and renders a null source, which is exactly the silent breakage this PR exists to fix —
     * so omitting it has to be a compile error, not a runtime shrug.
     *
     * This was made required in `3d6638f` and reverted to optional in `511b22e`; restoring it. All
     * three in-repo consumers already pass it, so the only thing the requirement breaks is an external
     * consumer that would otherwise have shipped broken audio.
     */
    rawBlobUrl = input.required(...(ngDevMode ? [{ debugName: "rawBlobUrl" }] : []));
    /**
     * `Blob.type` of the blob behind {@link blobUrl} — the `Content-Type` the server actually served.
     *
     * Required for the same reason as `rawBlobUrl`: it gates the unsandboxed iframe branches, and a
     * default would let a consumer omit it and silently get either no PDF preview or, worse, the
     * pre-existing behaviour of choosing the iframe from metadata alone.
     *
     * That was a same-origin execution path. `contentType()` picked `'pdf'` from `mimeType`,
     * `hasPdfRendition` and even a filename-extension fallback, none of which the browser consults —
     * it parses a `blob:` document by its `Content-Type`, and a blob URL inherits this origin. A
     * document recorded as PDF but served as `text/html` therefore ran as script here. The attachment
     * dialog closed the same mismatch; this input closes it for the embedded viewer.
     */
    blobType = input.required(...(ngDevMode ? [{ debugName: "blobType" }] : []));
    mimeType = input('', ...(ngDevMode ? [{ debugName: "mimeType" }] : []));
    fileName = input('', ...(ngDevMode ? [{ debugName: "fileName" }] : []));
    fileSize = input('', ...(ngDevMode ? [{ debugName: "fileSize" }] : []));
    loading = input(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    noteContent = input(null, ...(ngDevMode ? [{ debugName: "noteContent" }] : []));
    noteHtml = input(null, ...(ngDevMode ? [{ debugName: "noteHtml" }] : []));
    videoSources = input([], ...(ngDevMode ? [{ debugName: "videoSources" }] : []));
    storyboard = input([], ...(ngDevMode ? [{ debugName: "storyboard" }] : []));
    /** Raw string, not `SafeResourceUrl`: `video[poster]` is `SecurityContext.NONE`. See `rawBlobUrl`. */
    posterUrl = input(null, ...(ngDevMode ? [{ debugName: "posterUrl" }] : []));
    hasPdfRendition = input(false, ...(ngDevMode ? [{ debugName: "hasPdfRendition" }] : []));
    previewUrl = input(null, ...(ngDevMode ? [{ debugName: "previewUrl" }] : []));
    pictureInfo = input(null, ...(ngDevMode ? [{ debugName: "pictureInfo" }] : []));
    pictureViews = input([], ...(ngDevMode ? [{ debugName: "pictureViews" }] : []));
    exifData = input(null, ...(ngDevMode ? [{ debugName: "exifData" }] : []));
    iptcData = input(null, ...(ngDevMode ? [{ debugName: "iptcData" }] : []));
    videoInfo = input(null, ...(ngDevMode ? [{ debugName: "videoInfo" }] : []));
    arenderUrl = input(null, ...(ngDevMode ? [{ debugName: "arenderUrl" }] : []));
    /** When this changes, the ARender iframe is destroyed and recreated. */
    arenderReloadId = input(0, ...(ngDevMode ? [{ debugName: "arenderReloadId" }] : []));
    /** When the open document changes, exit ARender mode so the user does not keep a stale viewer. */
    viewerDocUid = input('', ...(ngDevMode ? [{ debugName: "viewerDocUid" }] : []));
    /**
     * When true (Annotations tab), the main area only shows ARender or a “not available” state,
     * matching Nuxeo Web UI’s Annotations tab.
     */
    annotationsTab = input(false, ...(ngDevMode ? [{ debugName: "annotationsTab" }] : []));
    /** When true, show Replace / Remove actions for the primary blob in the footer toolbar. */
    showMainFileControls = input(false, ...(ngDevMode ? [{ debugName: "showMainFileControls" }] : []));
    mainFileActionInProgress = input(null, ...(ngDevMode ? [{ debugName: "mainFileActionInProgress" }] : []));
    downloadClicked = output();
    openWithDriveClicked = output();
    previewClicked = output();
    replaceMainFileClicked = output();
    removeMainFileClicked = output();
    storyboardSeek = output();
    formatDownload = output();
    contentType = computed(() => {
        const mime = this.mimeType();
        if (this.noteContent() !== null || this.noteHtml() !== null) {
            if (mime === 'text/markdown')
                return 'markdown';
            if (mime === 'text/html')
                return 'html';
            if (mime === 'text/xml' || mime === 'application/xml')
                return 'xml';
            if (mime.startsWith('text/'))
                return 'text';
        }
        if (!this.blobUrl() && !this.previewUrl() && this.videoSources().length === 0) {
            if (this.noteContent() !== null)
                return 'text';
            return 'none';
        }
        // The server-rendered preview has to be reachable BEFORE metadata dispatch.
        //
        // `loadPreviewFallback` is what runs when the local blob could not be fetched: it sets only
        // `previewUrl`, leaving `blobUrl` and `blobType` empty. Every branch below assumes a local blob, so
        // with the branches ordered by MIME first, a recognised type reached its own branch and never got
        // here — a PDF returned 'pdf' and rendered an iframe bound to a null `blobUrl`, and after the
        // served-type gate landed it returned 'none' instead. Both are the fallback being shadowed rather
        // than used; the gate changed the symptom, not the cause.
        //
        // Transcoded video sources still win, because those are usable content rather than a fallback.
        if (!this.blobUrl() && this.videoSources().length === 0 && this.previewUrl())
            return 'preview';
        if (/^image\//.test(mime))
            return 'image';
        if (/^video\//.test(mime) || /^application\/(g|m)xf$/.test(mime))
            return 'video';
        if (/^audio\//.test(mime))
            return 'audio';
        if (mime === 'text/markdown')
            return 'markdown';
        if (mime === 'text/html')
            return 'html';
        if (mime === 'text/xml' || mime === 'application/xml')
            return 'xml';
        if (mime.startsWith('text/') || mime === 'application/json')
            return 'text';
        // The three branches below that put `blobUrl()` in an iframe are gated on the SERVED type, not
        // on `mime`/`hasPdfRendition`/the filename. Those are all metadata, and the browser parses a
        // `blob:` document by its `Content-Type` — see the `blobType` input. Disagreement falls through
        // to 'none' rather than guessing, which is a lost preview instead of an execution path.
        const servedIsPdf = mediaTypeEssence(this.blobType()) === 'application/pdf';
        if (mime === 'application/pdf')
            return servedIsPdf ? 'pdf' : 'none';
        if (this.hasPdfRendition() && this.blobUrl())
            return servedIsPdf ? 'pdfRendition' : 'none';
        // `previewUrl` is not a blob: it is a same-origin Nuxeo endpoint already constrained by
        // `navigableUrlOrNull` and an origin allow-list, so the served-type gate does not apply to it.
        if (this.previewUrl())
            return 'preview';
        if (this.blobUrl()) {
            if (/\.(png|jpe?g|gif|webp|bmp|svg|tiff?)$/i.test(this.fileName()))
                return 'image';
            // The old unconditional `return 'pdf'` here was the widest part of the hole: any unrecognised
            // mime with a blob URL landed in the iframe regardless of what was served.
            return servedIsPdf ? 'pdf' : 'none';
        }
        return 'none';
    }, ...(ngDevMode ? [{ debugName: "contentType" }] : []));
    /** ARender appears only on the Annotations tab (View tab uses the built-in preview). */
    showARenderViewer = computed(() => this.annotationsTab() && this.arenderUrl() !== null, ...(ngDevMode ? [{ debugName: "showARenderViewer" }] : []));
    showImageToolbar = computed(() => !this.annotationsTab() && !this.showARenderViewer() && this.contentType() === 'image', ...(ngDevMode ? [{ debugName: "showImageToolbar" }] : []));
    showVideoStoryboard = computed(() => !this.annotationsTab() &&
        !this.showARenderViewer() &&
        this.contentType() === 'video' &&
        this.storyboard().length > 0, ...(ngDevMode ? [{ debugName: "showVideoStoryboard" }] : []));
    showPictureCards = computed(() => !this.annotationsTab() &&
        !this.showARenderViewer() &&
        this.contentType() === 'image' &&
        this.pictureInfo() !== null, ...(ngDevMode ? [{ debugName: "showPictureCards" }] : []));
    showVideoInfoCard = computed(() => !this.annotationsTab() &&
        !this.showARenderViewer() &&
        this.contentType() === 'video' &&
        this.videoInfo() !== null, ...(ngDevMode ? [{ debugName: "showVideoInfoCard" }] : []));
    arenderAvailable = computed(() => this.arenderUrl() !== null, ...(ngDevMode ? [{ debugName: "arenderAvailable" }] : []));
    exifEntries = computed(() => {
        const data = this.exifData();
        if (!data)
            return [];
        const labelKeys = {
            dateTimeOriginal: 'shared-ui.document-viewer.exif-date',
            orientation: 'shared-ui.document-viewer.exif-orientation',
            fNumber: 'shared-ui.document-viewer.exif-aperture',
            exposureTime: 'shared-ui.document-viewer.exif-exposure',
            isoSpeedRatings: 'shared-ui.document-viewer.exif-iso',
            focalLength: 'shared-ui.document-viewer.exif-focal-length',
        };
        return Object.entries(labelKeys)
            .filter(([key]) => data[key])
            .map(([key, labelKey]) => ({ labelKey, value: data[key] }));
    }, ...(ngDevMode ? [{ debugName: "exifEntries" }] : []));
    iptcEntries = computed(() => {
        const data = this.iptcData();
        if (!data)
            return [];
        const labelKeys = {
            copyright: 'shared-ui.document-viewer.iptc-copyright',
            rights: 'shared-ui.document-viewer.iptc-rights',
            source: 'shared-ui.document-viewer.iptc-source',
            description: 'shared-ui.document-viewer.iptc-description',
        };
        return Object.entries(labelKeys)
            .filter(([key]) => data[key])
            .map(([key, labelKey]) => ({ labelKey, value: data[key] }));
    }, ...(ngDevMode ? [{ debugName: "iptcEntries" }] : []));
    zoom = signal(1, ...(ngDevMode ? [{ debugName: "zoom" }] : []));
    rotation = signal(0, ...(ngDevMode ? [{ debugName: "rotation" }] : []));
    fitMode = signal('width', ...(ngDevMode ? [{ debugName: "fitMode" }] : []));
    transform = computed(() => `scale(${this.zoom()}) rotate(${this.rotation()}deg)`, ...(ngDevMode ? [{ debugName: "transform" }] : []));
    videoRef = viewChild('videoPlayer', ...(ngDevMode ? [{ debugName: "videoRef" }] : []));
    zoomIn() {
        this.zoom.update((z) => Math.min(z + 0.25, 5));
    }
    zoomOut() {
        this.zoom.update((z) => Math.max(z - 0.25, 0.25));
    }
    toggleFit() {
        if (this.fitMode() === 'width') {
            this.fitMode.set('real');
            this.zoom.set(1);
        }
        else {
            this.fitMode.set('width');
            this.zoom.set(1);
        }
        this.rotation.set(0);
    }
    rotateLeft() {
        this.rotation.update((r) => r - 90);
    }
    rotateRight() {
        this.rotation.update((r) => r + 90);
    }
    seekTo(timecode) {
        const video = this.videoRef()?.nativeElement;
        if (video) {
            video.currentTime = timecode;
        }
        this.storyboardSeek.emit(timecode);
    }
    formatTimecode(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    formatDuration(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0)
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
    isFiniteNumber(value) {
        return value !== null && value !== undefined && Number.isFinite(value);
    }
    static ɵfac = function DocumentViewerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DocumentViewerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DocumentViewerComponent, selectors: [["lib-document-viewer"]], viewQuery: function DocumentViewerComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.videoRef, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, inputs: { blobUrl: [1, "blobUrl"], rawBlobUrl: [1, "rawBlobUrl"], blobType: [1, "blobType"], mimeType: [1, "mimeType"], fileName: [1, "fileName"], fileSize: [1, "fileSize"], loading: [1, "loading"], noteContent: [1, "noteContent"], noteHtml: [1, "noteHtml"], videoSources: [1, "videoSources"], storyboard: [1, "storyboard"], posterUrl: [1, "posterUrl"], hasPdfRendition: [1, "hasPdfRendition"], previewUrl: [1, "previewUrl"], pictureInfo: [1, "pictureInfo"], pictureViews: [1, "pictureViews"], exifData: [1, "exifData"], iptcData: [1, "iptcData"], videoInfo: [1, "videoInfo"], arenderUrl: [1, "arenderUrl"], arenderReloadId: [1, "arenderReloadId"], viewerDocUid: [1, "viewerDocUid"], annotationsTab: [1, "annotationsTab"], showMainFileControls: [1, "showMainFileControls"], mainFileActionInProgress: [1, "mainFileActionInProgress"] }, outputs: { downloadClicked: "downloadClicked", openWithDriveClicked: "openWithDriveClicked", previewClicked: "previewClicked", replaceMainFileClicked: "replaceMainFileClicked", removeMainFileClicked: "removeMainFileClicked", storyboardSeek: "storyboardSeek", formatDownload: "formatDownload" }, decls: 30, vars: 23, consts: [["videoPlayer", ""], [1, "viewer-panel"], [1, "viewer-content"], [1, "viewer-loading"], [1, "viewer-placeholder"], [1, "viewer-storyboard"], [1, "viewer-toolbar"], [1, "viewer-footer"], [1, "viewer-footer-info"], [1, "file-name"], [1, "file-size"], [1, "viewer-footer-actions"], ["mat-icon-button", "", 3, "matTooltip"], ["mat-icon-button", "", 3, "click", "matTooltip"], ["cdkAriaLive", "off", 1, "cdk-visually-hidden"], ["aria-hidden", "true"], [1, "picture-cards"], ["diameter", "36", 3, "label"], [1, "placeholder-icon"], [1, "mime-label"], ["allow", "fullscreen", 1, "viewer-iframe", "arender-frame", 3, "src", "title"], [1, "viewer-image", 3, "src", "alt", "fit-real", "transform"], [1, "viewer-video-container"], [1, "viewer-audio-wrapper"], [1, "viewer-markdown-content", 3, "innerHTML"], ["sandbox", "allow-same-origin", 1, "viewer-iframe", "viewer-html-frame", 3, "srcdoc", "title"], [1, "viewer-preformatted", "viewer-xml"], [1, "viewer-preformatted"], [1, "viewer-iframe", 3, "src", "title"], [1, "viewer-image", 3, "src", "alt"], ["controls", "", 1, "viewer-video", 3, "poster"], [3, "src"], [3, "src", "type"], [1, "audio-icon"], ["controls", "", 1, "viewer-audio", 3, "src"], ["type", "button", 1, "storyboard-item", 3, "matTooltip"], ["type", "button", 1, "storyboard-item", 3, "click", "matTooltip"], [1, "storyboard-thumb", 3, "src", "alt"], [1, "storyboard-time"], ["mat-icon-button", "", 3, "click", "matTooltip", "disabled"], ["mat-icon-button", "", 1, "footer-remove-btn", 3, "click", "matTooltip", "disabled"], [1, "picture-card"], [1, "picture-card-title"], [1, "picture-card-body"], [1, "info-row"], [1, "info-label"], [1, "info-value"], [1, "format-row"], [1, "format-name"], [1, "format-details"], [1, "format-size"], [1, "format-type"], ["mat-icon-button", "", 1, "format-download-btn", 3, "click", "matTooltip"]], template: function DocumentViewerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1)(1, "div", 2);
            i0.ɵɵconditionalCreate(2, DocumentViewerComponent_Conditional_2_Template, 3, 3, "div", 3)(3, DocumentViewerComponent_Conditional_3_Template, 9, 6, "div", 4)(4, DocumentViewerComponent_Conditional_4_Template, 2, 2)(5, DocumentViewerComponent_Conditional_5_Template, 11, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(6, DocumentViewerComponent_Conditional_6_Template, 3, 0, "div", 5);
            i0.ɵɵconditionalCreate(7, DocumentViewerComponent_Conditional_7_Template, 27, 33, "div", 6);
            i0.ɵɵelementStart(8, "div", 7)(9, "div", 8)(10, "span", 9);
            i0.ɵɵtext(11);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(12, DocumentViewerComponent_Conditional_12_Template, 2, 1, "span", 10);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "div", 11);
            i0.ɵɵconditionalCreate(14, DocumentViewerComponent_Conditional_14_Template, 5, 6, "button", 12);
            i0.ɵɵelementStart(15, "button", 13);
            i0.ɵɵpipe(16, "translate");
            i0.ɵɵlistener("click", function DocumentViewerComponent_Template_button_click_15_listener() { return ctx.previewClicked.emit(); });
            i0.ɵɵelementStart(17, "span", 14);
            i0.ɵɵtext(18);
            i0.ɵɵpipe(19, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(20, "mat-icon", 15);
            i0.ɵɵtext(21, "visibility");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(22, "button", 13);
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵpipe(24, "translate");
            i0.ɵɵlistener("click", function DocumentViewerComponent_Template_button_click_22_listener() { return ctx.downloadClicked.emit(); });
            i0.ɵɵelementStart(25, "mat-icon");
            i0.ɵɵtext(26, "download");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(27, DocumentViewerComponent_Conditional_27_Template, 12, 14);
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(28, DocumentViewerComponent_Conditional_28_Template, 7, 4, "div", 16);
            i0.ɵɵconditionalCreate(29, DocumentViewerComponent_Conditional_29_Template, 29, 21, "div", 16);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵclassProp("fit-real", ctx.fitMode() === "real" && ctx.contentType() === "image");
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() ? 2 : ctx.annotationsTab() && !ctx.arenderAvailable() ? 3 : ctx.showARenderViewer() ? 4 : 5);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.showVideoStoryboard() ? 6 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showImageToolbar() ? 7 : -1);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.fileName());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.fileSize() ? 12 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.annotationsTab() ? 14 : -1);
            i0.ɵɵadvance();
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(16, 15, "shared-ui.document-viewer.preview"));
            i0.ɵɵadvance(3);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(19, 17, "shared-ui.document-viewer.preview"));
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(23, 19, "shared-ui.document-viewer.download"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(24, 21, "shared-ui.document-viewer.download"));
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.showMainFileControls() ? 27 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showVideoInfoCard() ? 28 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.showPictureCards() ? 29 : -1);
        } }, dependencies: [NxsSpinnerComponent,
            MatIconModule, i1.MatIcon, MatButtonModule, i2.MatIconButton, MatTooltipModule, i3.MatTooltip, CdkAriaLive,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  \n\n  --document-viewer-light-strip-surface: #ffffff;\n  --document-viewer-on-light-strip: #333333;\n  --document-viewer-muted-on-light-surface: #5c5f6b;\n  \n\n  --document-viewer-focus-on-light-surface: #0073e6;\n  \n\n  --document-viewer-error-on-light-surface: #b00020;\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.viewer-panel[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n\n\n.viewer-content[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  overflow: auto;\n  min-height: 0;\n  background: #fafafa;\n\n  &.fit-real {\n    align-items: flex-start;\n    justify-content: flex-start;\n  }\n\n  &:has(.viewer-video-container) {\n    padding: 8px 12px;\n    align-items: stretch;\n    overflow: hidden;\n  }\n}\n\n.viewer-loading[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n}\n\n\n\n.viewer-image[_ngcontent-%COMP%] {\n  max-width: 100%;\n  max-height: 100%;\n  object-fit: contain;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);\n  transition: transform 0.2s ease;\n  transform-origin: center center;\n\n  &.fit-real {\n    max-width: none;\n    max-height: none;\n  }\n}\n\n\n\n.viewer-video-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex: 1;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 0;\n  align-self: stretch;\n}\n\n.viewer-video[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 100%;\n  max-width: 100%;\n  max-height: 100%;\n  object-fit: contain;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);\n  background: #000;\n}\n\n\n\n.viewer-audio-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 24px;\n\n  .audio-icon {\n    font-size: 64px;\n    width: 64px;\n    height: 64px;\n    color: #999;\n  }\n}\n\n.viewer-audio[_ngcontent-%COMP%] {\n  min-width: 320px;\n}\n\n\n\n.viewer-markdown-content[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 800px;\n  padding: 32px;\n  margin: 0 auto;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);\n  font-size: 15px;\n  line-height: 1.7;\n  color: #333;\n  overflow-y: auto;\n  align-self: flex-start;\n}\n\n[_nghost-%COMP%]     .viewer-markdown-content {\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    margin-top: 24px;\n    margin-bottom: 8px;\n    font-weight: 600;\n  }\n\n  h1 {\n    font-size: 1.8em;\n    border-bottom: 1px solid #eee;\n    padding-bottom: 8px;\n  }\n\n  h2 {\n    font-size: 1.5em;\n    border-bottom: 1px solid #eee;\n    padding-bottom: 6px;\n  }\n\n  p {\n    margin: 0 0 16px;\n  }\n\n  code {\n    background: #f0f0f0;\n    padding: 2px 6px;\n    border-radius: 3px;\n    font-size: 0.9em;\n  }\n\n  pre {\n    background: #282c34;\n    color: #abb2bf;\n    padding: 16px;\n    border-radius: 6px;\n    overflow-x: auto;\n    font-size: 0.9em;\n    line-height: 1.5;\n\n    code {\n      background: transparent;\n      padding: 0;\n      color: inherit;\n    }\n  }\n\n  blockquote {\n    border-left: 4px solid #ddd;\n    margin: 0 0 16px;\n    padding: 8px 16px;\n    color: #666;\n    background: #f9f9f9;\n    border-radius: 0 4px 4px 0;\n  }\n\n  ul,\n  ol {\n    padding-left: 24px;\n    margin-bottom: 16px;\n  }\n\n  img {\n    max-width: 100%;\n    border-radius: 4px;\n  }\n\n  table {\n    border-collapse: collapse;\n    width: 100%;\n    margin-bottom: 16px;\n  }\n\n  th,\n  td {\n    border: 1px solid #ddd;\n    padding: 8px 12px;\n    text-align: left;\n  }\n\n  th {\n    background: #f5f5f5;\n    font-weight: 600;\n  }\n\n  a {\n    color: #0073e6;\n    text-decoration: none;\n\n    &:hover {\n      text-decoration: underline;\n    }\n  }\n\n  hr {\n    border: none;\n    border-top: 1px solid #eee;\n    margin: 24px 0;\n  }\n}\n\n\n\n.viewer-preformatted[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 900px;\n  padding: 24px;\n  margin: 0 auto;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);\n  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;\n  font-size: 13px;\n  line-height: 1.6;\n  color: #333;\n  overflow: auto;\n  white-space: pre-wrap;\n  word-wrap: break-word;\n  align-self: flex-start;\n\n  &.viewer-xml {\n    color: #0d47a1;\n  }\n}\n\n\n\n.viewer-iframe[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  border: none;\n  border-radius: 4px;\n}\n\n.viewer-html-frame[_ngcontent-%COMP%] {\n  background: #fff;\n}\n\n.arender-frame[_ngcontent-%COMP%] {\n  border-radius: 0;\n  background: #fff;\n}\n\n\n\n.viewer-placeholder[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  color: #999;\n\n  .placeholder-icon {\n    font-size: 64px;\n    width: 64px;\n    height: 64px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n\n  .mime-label {\n    font-size: 12px;\n    color: #bbb;\n  }\n}\n\n\n\n.viewer-storyboard[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  padding: 8px 12px;\n  overflow-x: auto;\n  background: #1a1a1a;\n  flex-shrink: 0;\n  scrollbar-width: thin;\n  scrollbar-color: #555 #1a1a1a;\n}\n\n.storyboard-item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  border: 2px solid transparent;\n  border-radius: 4px;\n  padding: 4px;\n  background: none;\n  transition: border-color 0.15s;\n  flex-shrink: 0;\n\n  &:hover {\n    border-color: #0073e6;\n  }\n}\n\n.storyboard-thumb[_ngcontent-%COMP%] {\n  width: 120px;\n  height: 68px;\n  object-fit: cover;\n  border-radius: 2px;\n  background: #333;\n}\n\n.storyboard-time[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: #aaa;\n  font-family: monospace;\n}\n\n\n\n.viewer-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 4px 0;\n  background: #f0f0f0;\n  border-top: 1px solid #e0e0e0;\n  flex-shrink: 0;\n  overflow-x: auto;\n\n  button {\n    color: #555;\n    width: 36px;\n    height: 36px;\n    line-height: 36px;\n\n    mat-icon {\n      font-size: 20px;\n      width: 20px;\n      height: 20px;\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   NXENG-799[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXENG-816[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXENG-817[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXSAT-524[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   image[_ngcontent-%COMP%]   toolbar[_ngcontent-%COMP%]   icon[_ngcontent-%COMP%]   buttons[_ngcontent-%COMP%]   (Zoom out, Zoom in,\n// Toggle fit, \u2026)[_ngcontent-%COMP%]; IBM[_ngcontent-%COMP%]   922184956[_ngcontent-%COMP%], 2140832667.[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   keep\n//[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%]   separate[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus-visible`   (comma lists are not resolved by the scanner).\n.viewer-toolbar[_ngcontent-%COMP%]   button.mat-mdc-icon-button[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--document-viewer-focus-on-light-surface) !important;\n  outline-offset: 2px;\n}\n\n\n\n.viewer-footer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #eee);\n  \n\n  background: var(--document-viewer-light-strip-surface);\n  flex-shrink: 0;\n}\n\n.viewer-footer-info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n\n.file-name[_ngcontent-%COMP%] {\n  font-size: 13px;\n  \n\n  color: var(--document-viewer-on-light-strip);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.file-size[_ngcontent-%COMP%] {\n  font-size: 11px;\n  \n\n  color: var(--document-viewer-muted-on-light-surface);\n}\n\n.viewer-footer-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0;\n  flex-shrink: 0;\n\n  button {\n    \n\n    color: var(--document-viewer-muted-on-light-surface);\n\n    &.active-toggle {\n      color: var(--mat-sys-primary, #0073e6);\n    }\n\n    &.footer-remove-btn {\n      color: var(--document-viewer-error-on-light-surface);\n    }\n  }\n}\n\n//[_ngcontent-%COMP%]   NXSAT-496[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXSAT-520[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   1425495611[_ngcontent-%COMP%], 1924385914[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   footer[_ngcontent-%COMP%]   Download[_ngcontent-%COMP%]   (Preview tab)[_ngcontent-%COMP%]   and\n//[_ngcontent-%COMP%]   sibling[_ngcontent-%COMP%]   icon[_ngcontent-%COMP%]   buttons[_ngcontent-%COMP%]:   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only[_ngcontent-%COMP%]; keep[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%]   separate\n//[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus-visible`   (comma lists are not resolved by the scanner).\n.viewer-footer-actions[_ngcontent-%COMP%]   button.mat-mdc-icon-button[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--document-viewer-focus-on-light-surface) !important;\n  outline-offset: 2px;\n}\n\n\n\n.picture-cards[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 0;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  background: var(--document-viewer-light-strip-surface);\n  flex-shrink: 0;\n}\n\n.picture-card[_ngcontent-%COMP%] {\n  padding: 16px 20px;\n  border-right: 1px solid var(--mat-sys-outline-variant, #eee);\n\n  &:last-child {\n    border-right: none;\n  }\n}\n\n.picture-card-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--document-viewer-on-light-strip);\n  margin: 0 0 12px;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n}\n\n.picture-card-body[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.info-row[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 12px;\n  align-items: baseline;\n}\n\n.info-label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  \n\n  color: var(--document-viewer-muted-on-light-surface);\n  min-width: 0;\n  white-space: nowrap;\n}\n\n.info-value[_ngcontent-%COMP%] {\n  font-size: 13px;\n  color: var(--document-viewer-on-light-strip);\n  font-weight: 500;\n}\n\n.format-row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 0;\n}\n\n.format-name[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--document-viewer-on-light-strip);\n  font-weight: 500;\n  min-width: 100px;\n  white-space: nowrap;\n}\n\n.format-details[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--document-viewer-muted-on-light-surface);\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  white-space: nowrap;\n}\n\n\n\n.format-size[_ngcontent-%COMP%] {\n  color: var(--document-viewer-muted-on-light-surface);\n}\n\n.format-type[_ngcontent-%COMP%] {\n  color: var(--document-viewer-muted-on-light-surface);\n  text-transform: uppercase;\n  font-size: 11px;\n}\n\n.format-download-btn[_ngcontent-%COMP%] {\n  width: 28px !important;\n  height: 28px !important;\n  line-height: 28px !important;\n  flex-shrink: 0;\n\n  mat-icon {\n    font-size: 18px !important;\n    width: 18px !important;\n    height: 18px !important;\n    color: var(--document-viewer-muted-on-light-surface);\n  }\n}\n\n//[_ngcontent-%COMP%]   NXENG-781[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXENG-786[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXENG-800[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXSAT-505[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   NXSAT-527[_ngcontent-%COMP%]   /[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   1635062655[_ngcontent-%COMP%], 2294099067\n//[_ngcontent-%COMP%]   (Download Thumbnail, Download OriginalJpeg, \u2026)[_ngcontent-%COMP%]   \u2014[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only[_ngcontent-%COMP%];\n//[_ngcontent-%COMP%]   keep[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%]   separate[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus-visible`   (comma lists are not resolved by the scanner).\n.format-download-btn.mat-mdc-icon-button[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--document-viewer-focus-on-light-surface) !important;\n  outline-offset: 2px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DocumentViewerComponent, [{
        type: Component,
        args: [{ selector: 'lib-document-viewer', standalone: true, imports: [
                    NxsSpinnerComponent,
                    TranslatePipe,
                    MatIconModule,
                    MatButtonModule,
                    MatTooltipModule,
                    CdkAriaLive,
                ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"viewer-panel\">\n  <!-- Content area -->\n  <div class=\"viewer-content\" [class.fit-real]=\"fitMode() === 'real' && contentType() === 'image'\">\n    @if (loading()) {\n      <div class=\"viewer-loading\">\n        <nxs-spinner diameter=\"36\" [label]=\"'shared-ui.document-viewer.loading' | translate\" />\n      </div>\n    } @else if (annotationsTab() && !arenderAvailable()) {\n      <div class=\"viewer-placeholder\">\n        <mat-icon class=\"placeholder-icon\">edit_note</mat-icon>\n        <p>{{ 'shared-ui.document-viewer.annotations-are-not-available-for-this' | translate }}</p>\n        <span class=\"mime-label\">{{\n          'shared-ui.document-viewer.use-the-view-tab-for-the' | translate\n        }}</span>\n      </div>\n    } @else if (showARenderViewer()) {\n      @for (rid of [arenderReloadId()]; track rid) {\n        <iframe\n          [src]=\"arenderUrl()\"\n          [title]=\"'shared-ui.document-viewer.annotations-frame' | translate: { name: fileName() }\"\n          class=\"viewer-iframe arender-frame\"\n          allow=\"fullscreen\"\n        ></iframe>\n      }\n    } @else {\n      @switch (contentType()) {\n        @case ('image') {\n          <img\n            [src]=\"blobUrl()\"\n            [alt]=\"fileName()\"\n            class=\"viewer-image\"\n            [class.fit-real]=\"fitMode() === 'real'\"\n            [style.transform]=\"transform()\"\n          />\n        }\n        @case ('video') {\n          <div class=\"viewer-video-container\">\n            <video #videoPlayer controls class=\"viewer-video\" [poster]=\"posterUrl()\">\n              @if (videoSources().length > 0) {\n                @for (src of videoSources(); track src.url) {\n                  <source [src]=\"src.url\" [type]=\"src.mimeType\" />\n                }\n              } @else {\n                <source [src]=\"rawBlobUrl()\" />\n              }\n              {{ 'ui.document-viewer.your-browser-does-not-support-video' | translate }}\n            </video>\n          </div>\n        }\n        @case ('audio') {\n          <div class=\"viewer-audio-wrapper\">\n            <mat-icon class=\"audio-icon\">audiotrack</mat-icon>\n            <audio [src]=\"rawBlobUrl()\" controls class=\"viewer-audio\"></audio>\n          </div>\n        }\n        @case ('markdown') {\n          <div class=\"viewer-markdown-content\" [innerHTML]=\"noteHtml()\"></div>\n        }\n        @case ('html') {\n          <iframe\n            class=\"viewer-iframe viewer-html-frame\"\n            [srcdoc]=\"noteContent()\"\n            [title]=\"'shared-ui.document-viewer.note-frame' | translate: { name: fileName() }\"\n            sandbox=\"allow-same-origin\"\n          ></iframe>\n        }\n        @case ('xml') {\n          <pre class=\"viewer-preformatted viewer-xml\">{{ noteContent() }}</pre>\n        }\n        @case ('text') {\n          <pre class=\"viewer-preformatted\">{{ noteContent() }}</pre>\n        }\n        @case ('pdf') {\n          <iframe\n            [src]=\"blobUrl()\"\n            [title]=\"'shared-ui.document-viewer.pdf-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @case ('pdfRendition') {\n          <iframe\n            [src]=\"blobUrl()\"\n            [title]=\"'shared-ui.document-viewer.pdf-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @case ('preview') {\n          <iframe\n            [src]=\"previewUrl()\"\n            [title]=\"'shared-ui.document-viewer.preview-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @default {\n          <div class=\"viewer-placeholder\">\n            <mat-icon class=\"placeholder-icon\">insert_drive_file</mat-icon>\n            <p>{{ 'shared-ui.document-viewer.preview-not-available' | translate }}</p>\n            @if (mimeType()) {\n              <span class=\"mime-label\">{{ mimeType() }}</span>\n            }\n          </div>\n        }\n      }\n    }\n  </div>\n\n  <!-- Video storyboard -->\n  @if (showVideoStoryboard()) {\n    <div class=\"viewer-storyboard\">\n      @for (item of storyboard(); track item.timecode) {\n        <button\n          type=\"button\"\n          class=\"storyboard-item\"\n          [matTooltip]=\"item.label || formatTimecode(item.timecode)\"\n          (click)=\"seekTo(item.timecode)\"\n        >\n          <img [src]=\"item.thumbnailUrl\" [alt]=\"item.label\" class=\"storyboard-thumb\" />\n          <span class=\"storyboard-time\">{{ formatTimecode(item.timecode) }}</span>\n        </button>\n      }\n    </div>\n  }\n\n  <!-- Image toolbar (zoom/rotate) -->\n  @if (showImageToolbar()) {\n    <div class=\"viewer-toolbar\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.zoom-in' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.zoom-in' | translate\"\n        (click)=\"zoomIn()\"\n      >\n        <mat-icon>zoom_in</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"\n          fitMode() === 'width' ? ('ui.actual-size' | translate) : ('ui.fit-to-viewer' | translate)\n        \"\n        [attr.aria-label]=\"'shared-ui.document-viewer.toggle-fit' | translate\"\n        (click)=\"toggleFit()\"\n      >\n        <mat-icon>{{ fitMode() === 'width' ? 'crop_free' : 'fit_screen' }}</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.zoom-out' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.zoom-out' | translate\"\n        (click)=\"zoomOut()\"\n      >\n        <mat-icon>zoom_out</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.rotate-left' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.rotate-left' | translate\"\n        (click)=\"rotateLeft()\"\n      >\n        <mat-icon>rotate_left</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.rotate-right' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.rotate-right' | translate\"\n        (click)=\"rotateRight()\"\n      >\n        <mat-icon>rotate_right</mat-icon>\n      </button>\n    </div>\n  }\n\n  <!-- Footer -->\n  <div class=\"viewer-footer\">\n    <div class=\"viewer-footer-info\">\n      <span class=\"file-name\">{{ fileName() }}</span>\n      @if (fileSize()) {\n        <span class=\"file-size\">{{ fileSize() }}</span>\n      }\n    </div>\n    <div class=\"viewer-footer-actions\">\n      @if (!annotationsTab()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.open-with-nuxeo-drive' | translate\"\n          [attr.aria-label]=\"'shared-ui.document-viewer.open-with-nuxeo-drive' | translate\"\n          (click)=\"openWithDriveClicked.emit()\"\n        >\n          <mat-icon>cloud_sync</mat-icon>\n        </button>\n      }\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.preview' | translate\"\n        (click)=\"previewClicked.emit()\"\n      >\n        <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n          'shared-ui.document-viewer.preview' | translate\n        }}</span>\n        <mat-icon aria-hidden=\"true\">visibility</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.download' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.download' | translate\"\n        (click)=\"downloadClicked.emit()\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n      @if (showMainFileControls()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.replace-main-file' | translate\"\n          [attr.aria-label]=\"'shared-ui.document-viewer.replace-main-file' | translate\"\n          [disabled]=\"mainFileActionInProgress() === 'replace-main'\"\n          (click)=\"replaceMainFileClicked.emit()\"\n        >\n          <mat-icon>find_replace</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.remove-main-file' | translate\"\n          class=\"footer-remove-btn\"\n          [disabled]=\"mainFileActionInProgress() === 'remove-main'\"\n          (click)=\"removeMainFileClicked.emit()\"\n        >\n          <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n            'shared-ui.document-viewer.remove-main-file' | translate\n          }}</span>\n          <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n        </button>\n      }\n    </div>\n  </div>\n\n  <!-- Video metadata card -->\n  @if (showVideoInfoCard()) {\n    <div class=\"picture-cards\">\n      <div class=\"picture-card\">\n        <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.video-info' | translate }}</h4>\n        <div class=\"picture-card-body\">\n          @if (videoInfo(); as vi) {\n            @if (isFiniteNumber(vi.duration)) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.duration' | translate\n                }}</span>\n                <span class=\"info-value\">{{ formatDuration(vi.duration) }}</span>\n              </div>\n            }\n            @if (vi.width && vi.height) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.resolution' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.width }} \u00D7 {{ vi.height }}</span>\n              </div>\n            }\n            @if (vi.format) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ 'shared-ui.document-viewer.format' | translate }}</span>\n                <span class=\"info-value\">{{ vi.format }}</span>\n              </div>\n            }\n            @if (vi.videoCodec) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.video-codec' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.videoCodec }}</span>\n              </div>\n            }\n            @if (vi.audioCodec) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.audio-codec' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.audioCodec }}</span>\n              </div>\n            }\n            @if (vi.frameRate) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.frame-rate' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.frameRate }} fps</span>\n              </div>\n            }\n          }\n        </div>\n      </div>\n    </div>\n  }\n\n  <!-- Picture metadata cards -->\n  @if (showPictureCards()) {\n    <div class=\"picture-cards\">\n      <!-- Picture Info -->\n      <div class=\"picture-card\">\n        <h4 class=\"picture-card-title\">\n          {{ 'shared-ui.document-viewer.picture-info' | translate }}\n        </h4>\n        <div class=\"picture-card-body\">\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.dimensions' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.width }} x {{ pictureInfo()!.height }}</span>\n          </div>\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.format' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.format }}</span>\n          </div>\n          @if (pictureInfo()!.colorSpace) {\n            <div class=\"info-row\">\n              <span class=\"info-label\">{{\n                'shared-ui.document-viewer.color-profile' | translate\n              }}</span>\n              <span class=\"info-value\">{{ pictureInfo()!.colorSpace }}</span>\n            </div>\n          }\n          @if (pictureInfo()!.depth) {\n            <div class=\"info-row\">\n              <span class=\"info-label\">{{\n                'shared-ui.document-viewer.bit-depth-per-channel' | translate\n              }}</span>\n              <span class=\"info-value\">{{ pictureInfo()!.depth }}</span>\n            </div>\n          }\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.weight' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.weight }}</span>\n          </div>\n        </div>\n      </div>\n\n      <!-- Additional Formats -->\n      @if (pictureViews().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">\n            {{ 'shared-ui.document-viewer.additional-formats' | translate }}\n          </h4>\n          <div class=\"picture-card-body\">\n            @for (view of pictureViews(); track view.title) {\n              <div class=\"format-row\">\n                <span class=\"format-name\">{{ view.title }}</span>\n                <span class=\"format-details\">\n                  {{ view.width }} x {{ view.height }}\n                  <span class=\"format-size\">{{ view.fileSize }}</span>\n                  <span class=\"format-type\">{{ view.format }}</span>\n                </span>\n                <button\n                  mat-icon-button\n                  class=\"format-download-btn\"\n                  [matTooltip]=\"\n                    'shared-ui.document-viewer.download-named' | translate: { name: view.title }\n                  \"\n                  [attr.aria-label]=\"\n                    'shared-ui.document-viewer.download-named' | translate: { name: view.title }\n                  \"\n                  (click)=\"formatDownload.emit(view.downloadUrl)\"\n                >\n                  <mat-icon>download</mat-icon>\n                </button>\n              </div>\n            }\n          </div>\n        </div>\n      }\n\n      <!-- EXIF -->\n      @if (exifEntries().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.exif' | translate }}</h4>\n          <div class=\"picture-card-body\">\n            @for (entry of exifEntries(); track entry.labelKey) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ entry.labelKey | translate }}</span>\n                <span class=\"info-value\">{{ entry.value }}</span>\n              </div>\n            }\n          </div>\n        </div>\n      }\n\n      <!-- IPTC -->\n      @if (iptcEntries().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.iptc' | translate }}</h4>\n          <div class=\"picture-card-body\">\n            @for (entry of iptcEntries(); track entry.labelKey) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ entry.labelKey | translate }}</span>\n                <span class=\"info-value\">{{ entry.value }}</span>\n              </div>\n            }\n          </div>\n        </div>\n      }\n    </div>\n  }\n</div>\n", styles: [":host {\n  /* NXENG-801 \u2014 metadata strip stays a fixed light panel in every theme (IBM 374303107). */\n  --document-viewer-light-strip-surface: #ffffff;\n  --document-viewer-on-light-strip: #333333;\n  --document-viewer-muted-on-light-surface: #5c5f6b;\n  /* Focus ring on the fixed light strip \u2014 not --mat-sys-primary (pale in dark theme, ~1.7:1 on white). */\n  --document-viewer-focus-on-light-surface: #0073e6;\n  /* Destructive actions on the fixed light strip \u2014 not --mat-sys-error (dark-theme token). */\n  --document-viewer-error-on-light-surface: #b00020;\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.viewer-panel {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n/* \u2500\u2500\u2500 Content area \u2500\u2500\u2500 */\n.viewer-content {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  overflow: auto;\n  min-height: 0;\n  background: #fafafa;\n\n  &.fit-real {\n    align-items: flex-start;\n    justify-content: flex-start;\n  }\n\n  &:has(.viewer-video-container) {\n    padding: 8px 12px;\n    align-items: stretch;\n    overflow: hidden;\n  }\n}\n\n.viewer-loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n}\n\n/* \u2500\u2500\u2500 Image \u2500\u2500\u2500 */\n.viewer-image {\n  max-width: 100%;\n  max-height: 100%;\n  object-fit: contain;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);\n  transition: transform 0.2s ease;\n  transform-origin: center center;\n\n  &.fit-real {\n    max-width: none;\n    max-height: none;\n  }\n}\n\n/* \u2500\u2500\u2500 Video \u2500\u2500\u2500 */\n.viewer-video-container {\n  display: flex;\n  flex: 1;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 0;\n  align-self: stretch;\n}\n\n.viewer-video {\n  display: block;\n  width: 100%;\n  height: 100%;\n  max-width: 100%;\n  max-height: 100%;\n  object-fit: contain;\n  border-radius: 4px;\n  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);\n  background: #000;\n}\n\n/* \u2500\u2500\u2500 Audio \u2500\u2500\u2500 */\n.viewer-audio-wrapper {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 24px;\n\n  .audio-icon {\n    font-size: 64px;\n    width: 64px;\n    height: 64px;\n    color: #999;\n  }\n}\n\n.viewer-audio {\n  min-width: 320px;\n}\n\n/* \u2500\u2500\u2500 Markdown \u2500\u2500\u2500 */\n.viewer-markdown-content {\n  width: 100%;\n  max-width: 800px;\n  padding: 32px;\n  margin: 0 auto;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);\n  font-size: 15px;\n  line-height: 1.7;\n  color: #333;\n  overflow-y: auto;\n  align-self: flex-start;\n}\n\n:host ::ng-deep .viewer-markdown-content {\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    margin-top: 24px;\n    margin-bottom: 8px;\n    font-weight: 600;\n  }\n\n  h1 {\n    font-size: 1.8em;\n    border-bottom: 1px solid #eee;\n    padding-bottom: 8px;\n  }\n\n  h2 {\n    font-size: 1.5em;\n    border-bottom: 1px solid #eee;\n    padding-bottom: 6px;\n  }\n\n  p {\n    margin: 0 0 16px;\n  }\n\n  code {\n    background: #f0f0f0;\n    padding: 2px 6px;\n    border-radius: 3px;\n    font-size: 0.9em;\n  }\n\n  pre {\n    background: #282c34;\n    color: #abb2bf;\n    padding: 16px;\n    border-radius: 6px;\n    overflow-x: auto;\n    font-size: 0.9em;\n    line-height: 1.5;\n\n    code {\n      background: transparent;\n      padding: 0;\n      color: inherit;\n    }\n  }\n\n  blockquote {\n    border-left: 4px solid #ddd;\n    margin: 0 0 16px;\n    padding: 8px 16px;\n    color: #666;\n    background: #f9f9f9;\n    border-radius: 0 4px 4px 0;\n  }\n\n  ul,\n  ol {\n    padding-left: 24px;\n    margin-bottom: 16px;\n  }\n\n  img {\n    max-width: 100%;\n    border-radius: 4px;\n  }\n\n  table {\n    border-collapse: collapse;\n    width: 100%;\n    margin-bottom: 16px;\n  }\n\n  th,\n  td {\n    border: 1px solid #ddd;\n    padding: 8px 12px;\n    text-align: left;\n  }\n\n  th {\n    background: #f5f5f5;\n    font-weight: 600;\n  }\n\n  a {\n    color: #0073e6;\n    text-decoration: none;\n\n    &:hover {\n      text-decoration: underline;\n    }\n  }\n\n  hr {\n    border: none;\n    border-top: 1px solid #eee;\n    margin: 24px 0;\n  }\n}\n\n/* \u2500\u2500\u2500 Preformatted text (plain, xml) \u2500\u2500\u2500 */\n.viewer-preformatted {\n  width: 100%;\n  max-width: 900px;\n  padding: 24px;\n  margin: 0 auto;\n  background: #fff;\n  border-radius: 8px;\n  box-shadow: 0 1px 4px rgb(0 0 0 / 8%);\n  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;\n  font-size: 13px;\n  line-height: 1.6;\n  color: #333;\n  overflow: auto;\n  white-space: pre-wrap;\n  word-wrap: break-word;\n  align-self: flex-start;\n\n  &.viewer-xml {\n    color: #0d47a1;\n  }\n}\n\n/* \u2500\u2500\u2500 Iframe (PDF, HTML, preview, ARender) \u2500\u2500\u2500 */\n.viewer-iframe {\n  width: 100%;\n  height: 100%;\n  border: none;\n  border-radius: 4px;\n}\n\n.viewer-html-frame {\n  background: #fff;\n}\n\n.arender-frame {\n  border-radius: 0;\n  background: #fff;\n}\n\n/* \u2500\u2500\u2500 Placeholder \u2500\u2500\u2500 */\n.viewer-placeholder {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  color: #999;\n\n  .placeholder-icon {\n    font-size: 64px;\n    width: 64px;\n    height: 64px;\n  }\n\n  p {\n    font-size: 14px;\n    margin: 0;\n  }\n\n  .mime-label {\n    font-size: 12px;\n    color: #bbb;\n  }\n}\n\n/* \u2500\u2500\u2500 Storyboard \u2500\u2500\u2500 */\n.viewer-storyboard {\n  display: flex;\n  gap: 8px;\n  padding: 8px 12px;\n  overflow-x: auto;\n  background: #1a1a1a;\n  flex-shrink: 0;\n  scrollbar-width: thin;\n  scrollbar-color: #555 #1a1a1a;\n}\n\n.storyboard-item {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  border: 2px solid transparent;\n  border-radius: 4px;\n  padding: 4px;\n  background: none;\n  transition: border-color 0.15s;\n  flex-shrink: 0;\n\n  &:hover {\n    border-color: #0073e6;\n  }\n}\n\n.storyboard-thumb {\n  width: 120px;\n  height: 68px;\n  object-fit: cover;\n  border-radius: 2px;\n  background: #333;\n}\n\n.storyboard-time {\n  font-size: 11px;\n  color: #aaa;\n  font-family: monospace;\n}\n\n/* \u2500\u2500\u2500 Image toolbar \u2500\u2500\u2500 */\n.viewer-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 2px;\n  padding: 4px 0;\n  background: #f0f0f0;\n  border-top: 1px solid #e0e0e0;\n  flex-shrink: 0;\n  overflow-x: auto;\n\n  button {\n    color: #555;\n    width: 36px;\n    height: 36px;\n    line-height: 36px;\n\n    mat-icon {\n      font-size: 20px;\n      width: 20px;\n      height: 20px;\n    }\n  }\n}\n\n// NXENG-799 / NXENG-816 / NXENG-817 / NXSAT-524 \u2014 image toolbar icon buttons (Zoom out, Zoom in,\n// Toggle fit, \u2026); IBM 922184956, 2140832667. `style_focus_visible` reads `:focus` only \u2014 keep\n// this selector separate from `:focus-visible` (comma lists are not resolved by the scanner).\n.viewer-toolbar button.mat-mdc-icon-button:focus {\n  outline: 2px solid var(--document-viewer-focus-on-light-surface) !important;\n  outline-offset: 2px;\n}\n\n/* \u2500\u2500\u2500 Footer \u2500\u2500\u2500 */\n.viewer-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #eee);\n  /* NXENG-763 \u2014 footer is part of the fixed light strip (IBM 56037090). */\n  background: var(--document-viewer-light-strip-surface);\n  flex-shrink: 0;\n}\n\n.viewer-footer-info {\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n}\n\n.file-name {\n  font-size: 13px;\n  /* NXENG-763 \u2014 pairs with the light-strip footer (IBM 56037090). */\n  color: var(--document-viewer-on-light-strip);\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.file-size {\n  font-size: 11px;\n  /* NXENG-764 \u2014 footer stays on the light strip; mat-sys-on-surface-variant fails AA in dark theme (IBM 67686130). */\n  color: var(--document-viewer-muted-on-light-surface);\n}\n\n.viewer-footer-actions {\n  display: flex;\n  gap: 0;\n  flex-shrink: 0;\n\n  button {\n    /* NXENG-763 \u2014 footer icon buttons on the light strip (IBM 56037090). */\n    color: var(--document-viewer-muted-on-light-surface);\n\n    &.active-toggle {\n      color: var(--mat-sys-primary, #0073e6);\n    }\n\n    &.footer-remove-btn {\n      color: var(--document-viewer-error-on-light-surface);\n    }\n  }\n}\n\n// NXSAT-496 / NXSAT-520 / IBM 1425495611, 1924385914 \u2014 footer Download (Preview tab) and\n// sibling icon buttons: `style_focus_visible` reads `:focus` only; keep this selector separate\n// from `:focus-visible` (comma lists are not resolved by the scanner).\n.viewer-footer-actions button.mat-mdc-icon-button:focus {\n  outline: 2px solid var(--document-viewer-focus-on-light-surface) !important;\n  outline-offset: 2px;\n}\n\n/* \u2500\u2500\u2500 Picture metadata cards \u2500\u2500\u2500 */\n.picture-cards {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 0;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  background: var(--document-viewer-light-strip-surface);\n  flex-shrink: 0;\n}\n\n.picture-card {\n  padding: 16px 20px;\n  border-right: 1px solid var(--mat-sys-outline-variant, #eee);\n\n  &:last-child {\n    border-right: none;\n  }\n}\n\n.picture-card-title {\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--document-viewer-on-light-strip);\n  margin: 0 0 12px;\n  text-transform: uppercase;\n  letter-spacing: 0.3px;\n}\n\n.picture-card-body {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.info-row {\n  display: flex;\n  gap: 12px;\n  align-items: baseline;\n}\n\n.info-label {\n  font-size: 12px;\n  /* NXENG-812 / NXSAT-493 / NXSAT-507 \u2014 #777 was 4.48:1 on the light strip (IBM 716638997, IBM 1390196018, IBM 1668870227); mat-sys-on-surface-variant fails in dark theme. Runtime axe (phase-6-a11y) owns WCAG clearance; this comment is audit trace only. */\n  color: var(--document-viewer-muted-on-light-surface);\n  min-width: 0;\n  white-space: nowrap;\n}\n\n.info-value {\n  font-size: 13px;\n  color: var(--document-viewer-on-light-strip);\n  font-weight: 500;\n}\n\n.format-row {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 4px 0;\n}\n\n.format-name {\n  font-size: 12px;\n  color: var(--document-viewer-on-light-strip);\n  font-weight: 500;\n  min-width: 100px;\n  white-space: nowrap;\n}\n\n.format-details {\n  font-size: 12px;\n  color: var(--document-viewer-muted-on-light-surface);\n  flex: 1;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  white-space: nowrap;\n}\n\n/* NXENG-768 / NXENG-806 / NXENG-825 / NXSAT-494 \u2014 secondary size label in the format row (was #999 ~2.85:1; IBM 626137632, 1088600166, 1406866183 / NXENG-837). */\n.format-size {\n  color: var(--document-viewer-muted-on-light-surface);\n}\n\n.format-type {\n  color: var(--document-viewer-muted-on-light-surface);\n  text-transform: uppercase;\n  font-size: 11px;\n}\n\n.format-download-btn {\n  width: 28px !important;\n  height: 28px !important;\n  line-height: 28px !important;\n  flex-shrink: 0;\n\n  mat-icon {\n    font-size: 18px !important;\n    width: 18px !important;\n    height: 18px !important;\n    color: var(--document-viewer-muted-on-light-surface);\n  }\n}\n\n// NXENG-781 / NXENG-786 / NXENG-800 / NXSAT-505 / NXSAT-527 / IBM 1635062655, 2294099067\n// (Download Thumbnail, Download OriginalJpeg, \u2026) \u2014 IBM `style_focus_visible` reads `:focus` only;\n// keep this selector separate from `:focus-visible` (comma lists are not resolved by the scanner).\n.format-download-btn.mat-mdc-icon-button:focus {\n  outline: 2px solid var(--document-viewer-focus-on-light-surface) !important;\n  outline-offset: 2px;\n}\n"] }]
    }], null, { blobUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "blobUrl", required: false }] }], rawBlobUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "rawBlobUrl", required: true }] }], blobType: [{ type: i0.Input, args: [{ isSignal: true, alias: "blobType", required: true }] }], mimeType: [{ type: i0.Input, args: [{ isSignal: true, alias: "mimeType", required: false }] }], fileName: [{ type: i0.Input, args: [{ isSignal: true, alias: "fileName", required: false }] }], fileSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "fileSize", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], noteContent: [{ type: i0.Input, args: [{ isSignal: true, alias: "noteContent", required: false }] }], noteHtml: [{ type: i0.Input, args: [{ isSignal: true, alias: "noteHtml", required: false }] }], videoSources: [{ type: i0.Input, args: [{ isSignal: true, alias: "videoSources", required: false }] }], storyboard: [{ type: i0.Input, args: [{ isSignal: true, alias: "storyboard", required: false }] }], posterUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "posterUrl", required: false }] }], hasPdfRendition: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasPdfRendition", required: false }] }], previewUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "previewUrl", required: false }] }], pictureInfo: [{ type: i0.Input, args: [{ isSignal: true, alias: "pictureInfo", required: false }] }], pictureViews: [{ type: i0.Input, args: [{ isSignal: true, alias: "pictureViews", required: false }] }], exifData: [{ type: i0.Input, args: [{ isSignal: true, alias: "exifData", required: false }] }], iptcData: [{ type: i0.Input, args: [{ isSignal: true, alias: "iptcData", required: false }] }], videoInfo: [{ type: i0.Input, args: [{ isSignal: true, alias: "videoInfo", required: false }] }], arenderUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "arenderUrl", required: false }] }], arenderReloadId: [{ type: i0.Input, args: [{ isSignal: true, alias: "arenderReloadId", required: false }] }], viewerDocUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "viewerDocUid", required: false }] }], annotationsTab: [{ type: i0.Input, args: [{ isSignal: true, alias: "annotationsTab", required: false }] }], showMainFileControls: [{ type: i0.Input, args: [{ isSignal: true, alias: "showMainFileControls", required: false }] }], mainFileActionInProgress: [{ type: i0.Input, args: [{ isSignal: true, alias: "mainFileActionInProgress", required: false }] }], downloadClicked: [{ type: i0.Output, args: ["downloadClicked"] }], openWithDriveClicked: [{ type: i0.Output, args: ["openWithDriveClicked"] }], previewClicked: [{ type: i0.Output, args: ["previewClicked"] }], replaceMainFileClicked: [{ type: i0.Output, args: ["replaceMainFileClicked"] }], removeMainFileClicked: [{ type: i0.Output, args: ["removeMainFileClicked"] }], storyboardSeek: [{ type: i0.Output, args: ["storyboardSeek"] }], formatDownload: [{ type: i0.Output, args: ["formatDownload"] }], videoRef: [{ type: i0.ViewChild, args: ['videoPlayer', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DocumentViewerComponent, { className: "DocumentViewerComponent", filePath: "libs/shared/ui/src/lib/document-viewer/document-viewer.component.ts", lineNumber: 115 }); })();
