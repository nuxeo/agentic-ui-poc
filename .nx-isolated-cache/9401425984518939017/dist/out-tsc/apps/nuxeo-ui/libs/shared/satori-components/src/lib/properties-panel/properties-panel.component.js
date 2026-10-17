import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { avatarColor, documentHasPersistedMainBlob, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsAvatarComponent } from '../avatar/avatar.component';
import { NxsTagComponent } from '../tag/tag.component';
import { nxsInitial, nxsPropertyText } from './property-text';
import * as i0 from "@angular/core";
const _c0 = [[["", "nxsVersion", ""]], "*", [["", "nxsTags", ""]]];
const _c1 = ["[nxsVersion]", "*", "[nxsTags]"];
const _forTrack0 = ($index, $item) => $item.uid || $item.title;
function NxsPropertiesPanelComponent_Conditional_0_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 3);
    i0.ɵɵelement(5, "nxs-tag", 8);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.process"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(6, 4, "satori-components.properties-panel.running"));
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 3)(5, "span", 9);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.state"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r0.state());
} }
function NxsPropertiesPanelComponent_Conditional_0_ProjectionFallback_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("nxs-properties-panel__empty", !ctx_r0.versionLabel());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.versionLabel() || "\u2014");
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵlistener("click", function NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Conditional_5_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.publicationsSelected.emit()); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.publications(), " ");
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1, "0");
    i0.ɵɵelementEnd();
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 3);
    i0.ɵɵconditionalCreate(5, NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Conditional_5_Template, 2, 1, "button", 10)(6, NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Conditional_6_Template, 2, 0, "span", 11);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.publications"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.publications() > 0 ? 5 : 6);
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 3);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.last-modified"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, ctx_r0.modified(), "longDate"));
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 3);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.created"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, ctx_r0.created(), "longDate"));
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 13);
    i0.ɵɵelement(5, "nxs-avatar", 14);
    i0.ɵɵelementStart(6, "span");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const by_r3 = ctx;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 4, "satori-components.properties-panel.by"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("initials", by_r3.initial)("color", by_r3.color);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(by_r3.name);
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_14_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 16);
    i0.ɵɵelement(1, "nxs-avatar", 14);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const contributor_r4 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("initials", contributor_r4.initial)("color", contributor_r4.color);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(contributor_r4.name);
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 15);
    i0.ɵɵrepeaterCreate(5, NxsPropertiesPanelComponent_Conditional_0_Conditional_14_For_6_Template, 4, 3, "span", 16, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "satori-components.properties-panel.contributors"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.contributors());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 7);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.format"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.format());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 7);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.file-name"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.fileName());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 7);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "date");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.expires"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(6, 4, ctx_r0.expires(), "longDate"));
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_28_ProjectionFallback_5_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-tag", 18);
} if (rf & 2) {
    const tag_r5 = ctx.$implicit;
    i0.ɵɵproperty("label", tag_r5);
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_28_ProjectionFallback_5_ForEmpty_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 11);
    i0.ɵɵtext(1, "\u2014");
    i0.ɵɵelementEnd();
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_28_ProjectionFallback_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵrepeaterCreate(1, NxsPropertiesPanelComponent_Conditional_0_Conditional_28_ProjectionFallback_5_For_2_Template, 1, 1, "nxs-tag", 18, i0.ɵɵrepeaterTrackByIdentity, false, NxsPropertiesPanelComponent_Conditional_0_Conditional_28_ProjectionFallback_5_ForEmpty_3_Template, 2, 0, "span", 11);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.tags());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 7);
    i0.ɵɵprojection(5, 2, null, NxsPropertiesPanelComponent_Conditional_0_Conditional_28_ProjectionFallback_5_Template, 4, 1);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "satori-components.properties-panel.tags"), " ");
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 19);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.description"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.description(), " ");
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_30_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 7);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.nature"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.nature());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 20);
    i0.ɵɵelement(5, "nxs-tag", 18);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.coverage"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("label", ctx_r0.coverage());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6)(1, "dt", 2);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "dd", 7);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.subjects"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r0.subjects());
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_34_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-tag", 22);
} if (rf & 2) {
    const collection_r6 = ctx.$implicit;
    i0.ɵɵproperty("label", collection_r6.title);
} }
function NxsPropertiesPanelComponent_Conditional_0_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 21);
    i0.ɵɵelementStart(1, "div", 4);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 17);
    i0.ɵɵrepeaterCreate(5, NxsPropertiesPanelComponent_Conditional_0_Conditional_34_For_6_Template, 1, 1, "nxs-tag", 22, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-level", ctx_r0.headingLevel());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.properties-panel.collections"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r0.collections());
} }
function NxsPropertiesPanelComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "dl", 0);
    i0.ɵɵconditionalCreate(1, NxsPropertiesPanelComponent_Conditional_0_Conditional_1_Template, 7, 6, "div", 1);
    i0.ɵɵconditionalCreate(2, NxsPropertiesPanelComponent_Conditional_0_Conditional_2_Template, 7, 4, "div", 1);
    i0.ɵɵelementStart(3, "div", 1)(4, "dt", 2);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "dd", 3);
    i0.ɵɵprojection(8, 0, null, NxsPropertiesPanelComponent_Conditional_0_ProjectionFallback_8_Template, 2, 3);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, NxsPropertiesPanelComponent_Conditional_0_Conditional_10_Template, 7, 4, "div", 1);
    i0.ɵɵconditionalCreate(11, NxsPropertiesPanelComponent_Conditional_0_Conditional_11_Template, 7, 7, "div", 1);
    i0.ɵɵconditionalCreate(12, NxsPropertiesPanelComponent_Conditional_0_Conditional_12_Template, 7, 7, "div", 1);
    i0.ɵɵconditionalCreate(13, NxsPropertiesPanelComponent_Conditional_0_Conditional_13_Template, 8, 6, "div", 1);
    i0.ɵɵconditionalCreate(14, NxsPropertiesPanelComponent_Conditional_0_Conditional_14_Template, 7, 3, "div", 1);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "div", 4);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "dl", 5)(19, "div", 6)(20, "dt", 2);
    i0.ɵɵtext(21);
    i0.ɵɵpipe(22, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "dd", 7);
    i0.ɵɵtext(24);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(25, NxsPropertiesPanelComponent_Conditional_0_Conditional_25_Template, 6, 4, "div", 6);
    i0.ɵɵconditionalCreate(26, NxsPropertiesPanelComponent_Conditional_0_Conditional_26_Template, 6, 4, "div", 6);
    i0.ɵɵconditionalCreate(27, NxsPropertiesPanelComponent_Conditional_0_Conditional_27_Template, 7, 7, "div", 6);
    i0.ɵɵconditionalCreate(28, NxsPropertiesPanelComponent_Conditional_0_Conditional_28_Template, 7, 3, "div", 6);
    i0.ɵɵconditionalCreate(29, NxsPropertiesPanelComponent_Conditional_0_Conditional_29_Template, 6, 4, "div", 6);
    i0.ɵɵconditionalCreate(30, NxsPropertiesPanelComponent_Conditional_0_Conditional_30_Template, 6, 4, "div", 6);
    i0.ɵɵconditionalCreate(31, NxsPropertiesPanelComponent_Conditional_0_Conditional_31_Template, 6, 4, "div", 6);
    i0.ɵɵconditionalCreate(32, NxsPropertiesPanelComponent_Conditional_0_Conditional_32_Template, 6, 4, "div", 6);
    i0.ɵɵelementEnd();
    i0.ɵɵprojection(33, 1);
    i0.ɵɵconditionalCreate(34, NxsPropertiesPanelComponent_Conditional_0_Conditional_34_Template, 7, 4);
} if (rf & 2) {
    let tmp_8_0;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.processRunning() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.state() ? 2 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 21, "satori-components.properties-panel.version"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r0.publications() !== null ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.modified() ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.created() ? 12 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_8_0 = ctx_r0.creator()) ? 13 : -1, tmp_8_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.contributors().length > 0 ? 14 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-level", ctx_r0.headingLevel());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(17, 23, "satori-components.properties-panel.indexing-properties"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(22, 25, "satori-components.properties-panel.title"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx.title);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.format() ? 25 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.fileName() ? 26 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.expires() ? 27 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.taggable() ? 28 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.description() ? 29 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.nature() ? 30 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.coverage() ? 31 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.subjects() ? 32 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r0.collections().length > 0 ? 34 : -1);
} }
const person = (value) => {
    const name = nxsPropertyText(value);
    return name ? { name, initial: nxsInitial(name), color: avatarColor(name) } : null;
};
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
export class NxsPropertiesPanelComponent {
    /** The document shown. Nothing renders without one. */
    document = input.required(...(ngDevMode ? [{ debugName: "document" }] : []));
    /** Labels for `dc:nature`, `dc:coverage` and `dc:subjects`. Without it the stored ID shows. */
    vocabularyLabel = input(null, ...(ngDevMode ? [{ debugName: "vocabularyLabel" }] : []));
    /** A workflow is running on the document. */
    processRunning = input(false, ...(ngDevMode ? [{ debugName: "processRunning" }] : []));
    /** The version text, e.g. `1.2+`; a projected `[nxsVersion]` control replaces it. */
    versionLabel = input('', ...(ngDevMode ? [{ debugName: "versionLabel" }] : []));
    /** How many times the document is published; `null` hides the row. */
    publications = input(null, ...(ngDevMode ? [{ debugName: "publications" }] : []));
    /** The note's format, e.g. "Markdown". Blank hides the row. */
    format = input('', ...(ngDevMode ? [{ debugName: "format" }] : []));
    /** The level of the section headings, so they sit under the page's own. */
    headingLevel = input(4, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** The publication count was pressed. Only offered when there is at least one. */
    publicationsSelected = output();
    props = computed(() => (this.document()?.properties ?? {}), ...(ngDevMode ? [{ debugName: "props" }] : []));
    state = computed(() => this.document()?.state ?? '', ...(ngDevMode ? [{ debugName: "state" }] : []));
    modified = computed(() => nxsPropertyText(this.props()['dc:modified']) || this.document()?.lastModified || '', ...(ngDevMode ? [{ debugName: "modified" }] : []));
    created = computed(() => nxsPropertyText(this.props()['dc:created']), ...(ngDevMode ? [{ debugName: "created" }] : []));
    expires = computed(() => nxsPropertyText(this.props()['dc:expired']), ...(ngDevMode ? [{ debugName: "expires" }] : []));
    creator = computed(() => person(this.props()['dc:creator']), ...(ngDevMode ? [{ debugName: "creator" }] : []));
    contributors = computed(() => {
        const raw = this.props()['dc:contributors'];
        return (Array.isArray(raw) ? raw : [])
            .map(person)
            .filter((entry) => entry !== null);
    }, ...(ngDevMode ? [{ debugName: "contributors" }] : []));
    fileName = computed(() => {
        const doc = this.document();
        if (!doc || !documentHasPersistedMainBlob(doc))
            return '';
        return nxsPropertyText(this.props()['file:content']) || doc.title;
    }, ...(ngDevMode ? [{ debugName: "fileName" }] : []));
    description = computed(() => nxsPropertyText(this.props()['dc:description']), ...(ngDevMode ? [{ debugName: "description" }] : []));
    nature = computed(() => this.vocabulary('nature', this.props()['dc:nature']), ...(ngDevMode ? [{ debugName: "nature" }] : []));
    coverage = computed(() => this.vocabulary('l10ncoverage', this.props()['dc:coverage']), ...(ngDevMode ? [{ debugName: "coverage" }] : []));
    subjects = computed(() => {
        const raw = this.props()['dc:subjects'];
        return (Array.isArray(raw) ? raw : [])
            .map((value) => this.vocabulary('l10nsubjects', value))
            .filter(Boolean)
            .join(', ');
    }, ...(ngDevMode ? [{ debugName: "subjects" }] : []));
    taggable = computed(() => this.document()?.facets?.includes('NXTag') ?? false, ...(ngDevMode ? [{ debugName: "taggable" }] : []));
    tags = computed(() => {
        const raw = this.props()['nxtag:tags'];
        return (Array.isArray(raw) ? raw : []).map(nxsPropertyText).filter(Boolean);
    }, ...(ngDevMode ? [{ debugName: "tags" }] : []));
    /** Web UI's `nuxeo-document-collections`; the Favorites collection is the star, not a collection. */
    collections = computed(() => {
        const raw = this.document()?.contextParameters?.['collections'];
        return (Array.isArray(raw) ? raw : [])
            .filter((entry) => entry?.type !== 'Favorites')
            .map((entry) => ({
            uid: nxsPropertyText(entry.uid),
            title: nxsPropertyText(entry),
        }))
            .filter((entry) => entry.title !== '');
    }, ...(ngDevMode ? [{ debugName: "collections" }] : []));
    /** A vocabulary value as its label: a string ID through `vocabularyLabel`, an entry by its own. */
    vocabulary(directory, value) {
        const label = this.vocabularyLabel();
        return typeof value === 'string' && value && label
            ? label(directory, value) || value
            : nxsPropertyText(value);
    }
    static ɵfac = function NxsPropertiesPanelComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsPropertiesPanelComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsPropertiesPanelComponent, selectors: [["nxs-properties-panel"]], hostAttrs: [1, "nxs-properties-panel"], inputs: { document: [1, "document"], vocabularyLabel: [1, "vocabularyLabel"], processRunning: [1, "processRunning"], versionLabel: [1, "versionLabel"], publications: [1, "publications"], format: [1, "format"], headingLevel: [1, "headingLevel"] }, outputs: { publicationsSelected: "publicationsSelected" }, ngContentSelectors: _c1, decls: 1, vars: 1, consts: [[1, "nxs-properties-panel__info"], [1, "nxs-properties-panel__row"], [1, "nxs-properties-panel__label"], [1, "nxs-properties-panel__value"], ["role", "heading", 1, "nxs-properties-panel__heading"], [1, "nxs-properties-panel__fields"], [1, "nxs-properties-panel__field"], [1, "nxs-properties-panel__text"], ["color", "orange", 3, "label"], [1, "nxs-properties-panel__state"], ["type", "button", 1, "nxs-properties-panel__link"], [1, "nxs-properties-panel__empty"], ["type", "button", 1, "nxs-properties-panel__link", 3, "click"], [1, "nxs-properties-panel__value", "nxs-properties-panel__person"], ["size", "24", 3, "initials", "color"], [1, "nxs-properties-panel__value", "nxs-properties-panel__people"], [1, "nxs-properties-panel__person"], [1, "nxs-properties-panel__chips"], ["color", "gray", 3, "label"], [1, "nxs-properties-panel__text", "nxs-properties-panel__description"], [1, "nxs-properties-panel__text", "nxs-properties-panel__chips"], [1, "nxs-properties-panel__divider"], ["color", "blue", 3, "label"]], template: function NxsPropertiesPanelComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵprojectionDef(_c0);
            i0.ɵɵconditionalCreate(0, NxsPropertiesPanelComponent_Conditional_0_Template, 35, 27);
        } if (rf & 2) {
            let tmp_0_0;
            i0.ɵɵconditional((tmp_0_0 = ctx.document()) ? 0 : -1, tmp_0_0);
        } }, dependencies: [NxsAvatarComponent, NxsTagComponent, DatePipe, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --nxs-properties-panel-label: var(--mat-sys-on-surface-variant);\n  --nxs-properties-panel-value: var(--mat-sys-on-surface);\n  --nxs-properties-panel-divider: var(--mat-sys-outline-variant);\n  --nxs-properties-panel-link: var(--mat-sys-primary);\n  --nxs-properties-panel-state-surface: var(--mat-sys-primary-container);\n  --nxs-properties-panel-state-text: var(--mat-sys-on-primary-container);\n  display: block;\n  font-size: 13px;\n}\n\n.nxs-properties-panel__info[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  margin: 0 0 20px;\n  padding: 12px 0;\n  border-bottom: 1px solid var(--nxs-properties-panel-divider);\n}\n\n.nxs-properties-panel__row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 6px 0;\n}\n\n.nxs-properties-panel__label[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--nxs-properties-panel-label);\n}\n\n.nxs-properties-panel__row[_ngcontent-%COMP%]   .nxs-properties-panel__label[_ngcontent-%COMP%] {\n  min-width: 100px;\n  flex-shrink: 0;\n  padding-top: 2px;\n}\n\n.nxs-properties-panel__field[_ngcontent-%COMP%]   .nxs-properties-panel__label[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 500;\n}\n\n.nxs-properties-panel__value[_ngcontent-%COMP%] {\n  margin: 0;\n  flex: 1;\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n  color: var(--nxs-properties-panel-value);\n}\n\n.nxs-properties-panel__state[_ngcontent-%COMP%] {\n  display: inline-flex;\n  padding: 2px 12px;\n  border-radius: 4px;\n  font-size: 12px;\n  font-weight: 500;\n  line-height: 1.2;\n  background: var(--nxs-properties-panel-state-surface);\n  color: var(--nxs-properties-panel-state-text);\n  text-transform: capitalize;\n}\n\n.nxs-properties-panel__link[_ngcontent-%COMP%] {\n  padding: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  color: var(--nxs-properties-panel-link);\n  cursor: pointer;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n//[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   Equal[_ngcontent-%COMP%]   Access[_ngcontent-%COMP%]   `style_focus_visible`[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only.\n.nxs-properties-panel__link[_ngcontent-%COMP%]:focus {\n  outline: 2px solid var(--nxs-properties-panel-link);\n  outline-offset: 2px;\n}\n\n.nxs-properties-panel__empty[_ngcontent-%COMP%] {\n  color: var(--nxs-properties-panel-label);\n}\n\n.nxs-properties-panel__people[_ngcontent-%COMP%] {\n  gap: 8px 16px;\n}\n\n.nxs-properties-panel__person[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  line-height: 1.3;\n}\n\n.nxs-properties-panel__heading[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--nxs-properties-panel-value);\n}\n\n.nxs-properties-panel__fields[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n.nxs-properties-panel__field[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  margin-bottom: 14px;\n}\n\n.nxs-properties-panel__text[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--nxs-properties-panel-value);\n  word-break: break-word;\n}\n\n.nxs-properties-panel__description[_ngcontent-%COMP%] {\n  margin: 0;\n  white-space: pre-wrap;\n}\n\n.nxs-properties-panel__chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n\n.nxs-properties-panel__divider[_ngcontent-%COMP%] {\n  height: 1px;\n  margin: 16px 0;\n  background: var(--nxs-properties-panel-divider);\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsPropertiesPanelComponent, [{
        type: Component,
        args: [{ selector: 'nxs-properties-panel', standalone: true, imports: [DatePipe, TranslatePipe, NxsAvatarComponent, NxsTagComponent], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-properties-panel' }, template: "@if (document(); as doc) {\n  <dl class=\"nxs-properties-panel__info\">\n    @if (processRunning()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.process' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          <nxs-tag\n            color=\"orange\"\n            [label]=\"'satori-components.properties-panel.running' | translate\"\n          />\n        </dd>\n      </div>\n    }\n\n    @if (state()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.state' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          <span class=\"nxs-properties-panel__state\">{{ state() }}</span>\n        </dd>\n      </div>\n    }\n\n    <div class=\"nxs-properties-panel__row\">\n      <dt class=\"nxs-properties-panel__label\">\n        {{ 'satori-components.properties-panel.version' | translate }}\n      </dt>\n      <dd class=\"nxs-properties-panel__value\">\n        <ng-content select=\"[nxsVersion]\">\n          <span [class.nxs-properties-panel__empty]=\"!versionLabel()\">{{\n            versionLabel() || '\u2014'\n          }}</span>\n        </ng-content>\n      </dd>\n    </div>\n\n    @if (publications() !== null) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.publications' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          @if (publications()! > 0) {\n            <button\n              type=\"button\"\n              class=\"nxs-properties-panel__link\"\n              (click)=\"publicationsSelected.emit()\"\n            >\n              {{ publications() }}\n            </button>\n          } @else {\n            <span class=\"nxs-properties-panel__empty\">0</span>\n          }\n        </dd>\n      </div>\n    }\n\n    @if (modified()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.last-modified' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">{{ modified() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (created()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.created' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">{{ created() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (creator(); as by) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.by' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value nxs-properties-panel__person\">\n          <nxs-avatar [initials]=\"by.initial\" [color]=\"by.color\" size=\"24\" />\n          <span>{{ by.name }}</span>\n        </dd>\n      </div>\n    }\n\n    @if (contributors().length > 0) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.contributors' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value nxs-properties-panel__people\">\n          @for (contributor of contributors(); track $index) {\n            <span class=\"nxs-properties-panel__person\">\n              <nxs-avatar [initials]=\"contributor.initial\" [color]=\"contributor.color\" size=\"24\" />\n              <span>{{ contributor.name }}</span>\n            </span>\n          }\n        </dd>\n      </div>\n    }\n  </dl>\n\n  <div class=\"nxs-properties-panel__heading\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n    {{ 'satori-components.properties-panel.indexing-properties' | translate }}\n  </div>\n\n  <dl class=\"nxs-properties-panel__fields\">\n    <div class=\"nxs-properties-panel__field\">\n      <dt class=\"nxs-properties-panel__label\">\n        {{ 'satori-components.properties-panel.title' | translate }}\n      </dt>\n      <dd class=\"nxs-properties-panel__text\">{{ doc.title }}</dd>\n    </div>\n\n    @if (format()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.format' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ format() }}</dd>\n      </div>\n    }\n\n    @if (fileName()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.file-name' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ fileName() }}</dd>\n      </div>\n    }\n\n    @if (expires()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.expires' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ expires() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (taggable()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.tags' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">\n          <ng-content select=\"[nxsTags]\">\n            <div class=\"nxs-properties-panel__chips\">\n              @for (tag of tags(); track tag) {\n                <nxs-tag color=\"gray\" [label]=\"tag\" />\n              } @empty {\n                <span class=\"nxs-properties-panel__empty\">\u2014</span>\n              }\n            </div>\n          </ng-content>\n        </dd>\n      </div>\n    }\n\n    @if (description()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.description' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text nxs-properties-panel__description\">\n          {{ description() }}\n        </dd>\n      </div>\n    }\n\n    @if (nature()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.nature' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ nature() }}</dd>\n      </div>\n    }\n\n    @if (coverage()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.coverage' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text nxs-properties-panel__chips\">\n          <nxs-tag color=\"gray\" [label]=\"coverage()\" />\n        </dd>\n      </div>\n    }\n\n    @if (subjects()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.subjects' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ subjects() }}</dd>\n      </div>\n    }\n  </dl>\n\n  <ng-content />\n\n  @if (collections().length > 0) {\n    <div class=\"nxs-properties-panel__divider\"></div>\n    <div class=\"nxs-properties-panel__heading\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n      {{ 'satori-components.properties-panel.collections' | translate }}\n    </div>\n    <div class=\"nxs-properties-panel__chips\">\n      @for (collection of collections(); track collection.uid || collection.title) {\n        <nxs-tag color=\"blue\" [label]=\"collection.title\" />\n      }\n    </div>\n  }\n}\n", styles: [":host {\n  --nxs-properties-panel-label: var(--mat-sys-on-surface-variant);\n  --nxs-properties-panel-value: var(--mat-sys-on-surface);\n  --nxs-properties-panel-divider: var(--mat-sys-outline-variant);\n  --nxs-properties-panel-link: var(--mat-sys-primary);\n  --nxs-properties-panel-state-surface: var(--mat-sys-primary-container);\n  --nxs-properties-panel-state-text: var(--mat-sys-on-primary-container);\n  display: block;\n  font-size: 13px;\n}\n\n.nxs-properties-panel__info {\n  display: flex;\n  flex-direction: column;\n  margin: 0 0 20px;\n  padding: 12px 0;\n  border-bottom: 1px solid var(--nxs-properties-panel-divider);\n}\n\n.nxs-properties-panel__row {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 6px 0;\n}\n\n.nxs-properties-panel__label {\n  font-size: 12px;\n  color: var(--nxs-properties-panel-label);\n}\n\n.nxs-properties-panel__row .nxs-properties-panel__label {\n  min-width: 100px;\n  flex-shrink: 0;\n  padding-top: 2px;\n}\n\n.nxs-properties-panel__field .nxs-properties-panel__label {\n  font-size: 11px;\n  font-weight: 500;\n}\n\n.nxs-properties-panel__value {\n  margin: 0;\n  flex: 1;\n  display: flex;\n  align-items: center;\n  flex-wrap: wrap;\n  gap: 6px;\n  color: var(--nxs-properties-panel-value);\n}\n\n.nxs-properties-panel__state {\n  display: inline-flex;\n  padding: 2px 12px;\n  border-radius: 4px;\n  font-size: 12px;\n  font-weight: 500;\n  line-height: 1.2;\n  background: var(--nxs-properties-panel-state-surface);\n  color: var(--nxs-properties-panel-state-text);\n  text-transform: capitalize;\n}\n\n.nxs-properties-panel__link {\n  padding: 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-weight: 600;\n  color: var(--nxs-properties-panel-link);\n  cursor: pointer;\n\n  &:hover {\n    text-decoration: underline;\n  }\n}\n\n// IBM Equal Access `style_focus_visible` reads `:focus` only.\n.nxs-properties-panel__link:focus {\n  outline: 2px solid var(--nxs-properties-panel-link);\n  outline-offset: 2px;\n}\n\n.nxs-properties-panel__empty {\n  color: var(--nxs-properties-panel-label);\n}\n\n.nxs-properties-panel__people {\n  gap: 8px 16px;\n}\n\n.nxs-properties-panel__person {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  min-width: 0;\n  line-height: 1.3;\n}\n\n.nxs-properties-panel__heading {\n  margin-bottom: 12px;\n  font-size: 14px;\n  font-weight: 600;\n  color: var(--nxs-properties-panel-value);\n}\n\n.nxs-properties-panel__fields {\n  margin: 0;\n}\n\n.nxs-properties-panel__field {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  margin-bottom: 14px;\n}\n\n.nxs-properties-panel__text {\n  margin: 0;\n  color: var(--nxs-properties-panel-value);\n  word-break: break-word;\n}\n\n.nxs-properties-panel__description {\n  margin: 0;\n  white-space: pre-wrap;\n}\n\n.nxs-properties-panel__chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n}\n\n.nxs-properties-panel__divider {\n  height: 1px;\n  margin: 16px 0;\n  background: var(--nxs-properties-panel-divider);\n}\n"] }]
    }], null, { document: [{ type: i0.Input, args: [{ isSignal: true, alias: "document", required: true }] }], vocabularyLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "vocabularyLabel", required: false }] }], processRunning: [{ type: i0.Input, args: [{ isSignal: true, alias: "processRunning", required: false }] }], versionLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "versionLabel", required: false }] }], publications: [{ type: i0.Input, args: [{ isSignal: true, alias: "publications", required: false }] }], format: [{ type: i0.Input, args: [{ isSignal: true, alias: "format", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], publicationsSelected: [{ type: i0.Output, args: ["publicationsSelected"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsPropertiesPanelComponent, { className: "NxsPropertiesPanelComponent", filePath: "libs/shared/satori-components/src/lib/properties-panel/properties-panel.component.ts", lineNumber: 54 }); })();
