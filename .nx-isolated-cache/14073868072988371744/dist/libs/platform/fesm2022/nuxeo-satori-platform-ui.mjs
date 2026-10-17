import * as i0 from '@angular/core';
import { Component, input, output, signal, effect, inject, computed, HostListener, ViewChild, LOCALE_ID, viewChild, ChangeDetectionStrategy, Injectable, isDevMode, Pipe, DestroyRef, ElementRef, afterNextRender, Directive, InjectionToken } from '@angular/core';
import { TranslatePipe, TranslateService, TranslateParser, provideMissingTranslationHandler } from '@ngx-translate/core';
import * as i2 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i3 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i3$1 from '@angular/material/tooltip';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppExtensionsService, ExtensionActionRegistry, ExtensionRuleContextService, EXTENSION_SLOTS, DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { NxsThumbnailComponent, provideNxsThumbnailCache, NxsSpinnerComponent, NxsToastService, provideNxsToast } from '@nuxeo/satori-platform/components';
import * as i1 from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import * as i3$2 from '@angular/material/checkbox';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as i3$3 from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as i5 from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import * as i7 from '@angular/material/slide-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { catchError, of, forkJoin, merge, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { catchError as catchError$1 } from 'rxjs/operators';
import { NUXEO_API_ORIGIN, resolveNuxeoIconPath, DocumentDetailService, buildDocumentCompareSections, isCompareIconField, mediaTypeEssence, CURRENT_USERNAME, UserService, CollectionService, DirectoryService, l10nEntryLabel, directoryPickerLabel, filterDirectoryPickerEntries, groupL10nChildrenByParent, createExpiresErrorStateMatcher, formatHierarchicalL10nLabel, isExpiresFieldValid, isPermissionDeniedError, PERMISSION_DENIED_KEY } from '@nuxeo/satori-platform/nuxeo-client';
import { HttpClient } from '@angular/common/http';
import { CdkAriaLive } from '@angular/cdk/a11y';
import * as i4 from '@angular/material/progress-spinner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import * as i1$1 from '@angular/forms';
import { FormsModule } from '@angular/forms';
import * as i4$1 from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import * as i7$1 from '@angular/material/radio';
import { MatRadioModule } from '@angular/material/radio';
import * as i7$2 from '@angular/material/datepicker';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import * as i10 from '@angular/material/autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { zhCN, th, nlBE, nl, ja, de, frCH, frCA, fr, enZA, enNZ, enIN, enIE, enGB, enCA, enAU, enUS } from 'date-fns/locale';
import * as i9 from '@angular/material/chips';
import { MatChipsModule } from '@angular/material/chips';

class UiComponent {
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: UiComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.33", type: UiComponent, isStandalone: true, selector: "lib-ui", ngImport: i0, template: "<p>{{ 'shared-ui.ui.ui-works' | translate }}</p>\n", styles: [""], dependencies: [{ kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: UiComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-ui', imports: [TranslatePipe], template: "<p>{{ 'shared-ui.ui.ui-works' | translate }}</p>\n" }]
        }] });

class SelectionTopbarComponent {
    selectionPopupPanel;
    lastFocusedElement = null;
    selectedCount = input.required(...(ngDevMode ? [{ debugName: "selectedCount" }] : []));
    /**
     * The selected documents. The popup draws each preview itself from `id`, so a `preview` URL
     * whose owner has since revoked it cannot break the popup; the field is kept for existing callers.
     */
    selectedItems = input([], ...(ngDevMode ? [{ debugName: "selectedItems" }] : []));
    /** Collapses the bar to its label and Clear button — no bulk actions, no popup. */
    clearOnly = input(false, ...(ngDevMode ? [{ debugName: "clearOnly" }] : []));
    /** Chrome, not an action: clearing the selection dismisses the bar itself. */
    cleared = output();
    selectionPopupOpen = signal(false, ...(ngDevMode ? [{ debugName: "selectionPopupOpen" }] : []));
    closePopupInClearOnlyMode = effect(() => {
        if (this.clearOnly()) {
            this.selectionPopupOpen.set(false);
        }
    }, ...(ngDevMode ? [{ debugName: "closePopupInClearOnlyMode" }] : []));
    extensions = inject(AppExtensionsService);
    actions = inject(ExtensionActionRegistry);
    ruleContext = inject(ExtensionRuleContextService);
    /**
     * The bulk actions to offer, resolved from the registry.
     *
     * There is no `@Output()` per action any more. Each of the six used to be a
     * fixed button here, a named output, and a handler threaded through the app
     * shell — three files across two projects to add one action. A registration
     * now does it, and the shell owns the behaviour as an action service.
     */
    bulkActions = computed(() => this.extensions.resolve(EXTENSION_SLOTS['bulk-actions'], this.ruleContext.context()), ...(ngDevMode ? [{ debugName: "bulkActions" }] : []));
    /** `enabledRule` renders the control disabled rather than hiding it. */
    isEnabled(action) {
        return this.extensions.evaluateRule(action.enabledRule, this.ruleContext.context());
    }
    run(action) {
        this.actions.execute(action, this.ruleContext.context());
    }
    openSelectionPopup() {
        this.lastFocusedElement = document.activeElement;
        this.selectionPopupOpen.set(true);
        queueMicrotask(() => {
            this.selectionPopupPanel?.nativeElement.focus();
        });
    }
    closeSelectionPopup() {
        this.selectionPopupOpen.set(false);
        const elementToFocus = this.lastFocusedElement;
        this.lastFocusedElement = null;
        if (elementToFocus) {
            queueMicrotask(() => elementToFocus.focus());
        }
    }
    onEscape() {
        if (this.selectionPopupOpen()) {
            this.closeSelectionPopup();
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectionTopbarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: SelectionTopbarComponent, isStandalone: true, selector: "lib-selection-topbar", inputs: { selectedCount: { classPropertyName: "selectedCount", publicName: "selectedCount", isSignal: true, isRequired: true, transformFunction: null }, selectedItems: { classPropertyName: "selectedItems", publicName: "selectedItems", isSignal: true, isRequired: false, transformFunction: null }, clearOnly: { classPropertyName: "clearOnly", publicName: "clearOnly", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { cleared: "cleared" }, host: { listeners: { "document:keydown.escape": "onEscape()" } }, providers: [provideNxsThumbnailCache()], viewQueries: [{ propertyName: "selectionPopupPanel", first: true, predicate: ["selectionPopupPanel"], descendants: true }], ngImport: i0, template: "<div class=\"selection-topbar\" [class.selection-topbar--clear-only]=\"clearOnly()\">\n  <div class=\"topbar-left\">\n    <span class=\"selected-label\">{{\n      (selectedCount() === 1 ? 'common.count.all-selected-one' : 'common.count.all-selected-many')\n        | translate: { count: selectedCount() }\n    }}</span>\n    @if (!clearOnly()) {\n      <button mat-button type=\"button\" class=\"clear-btn\" (click)=\"openSelectionPopup()\">\n        {{ 'shared-ui.selection-topbar.display-selection' | translate }}\n      </button>\n    }\n    <button mat-button type=\"button\" class=\"clear-btn\" (click)=\"cleared.emit()\">\n      {{ 'shared-ui.selection-topbar.clear' | translate }}\n    </button>\n  </div>\n\n  @if (!clearOnly()) {\n    <div class=\"topbar-actions\">\n      @for (action of bulkActions(); track action.id) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          class=\"topbar-icon-btn\"\n          [attr.data-action-id]=\"action.id\"\n          [matTooltip]=\"action.tooltip ?? (action | descriptorLabel)\"\n          matTooltipPosition=\"below\"\n          matTooltipClass=\"selection-topbar-tooltip mat-tooltip-multiline\"\n          [attr.aria-label]=\"action | descriptorLabel\"\n          [disabled]=\"!isEnabled(action)\"\n          (click)=\"run(action)\"\n        >\n          <mat-icon>{{ action.icon }}</mat-icon>\n        </button>\n      }\n    </div>\n  }\n</div>\n\n@if (!clearOnly() && selectionPopupOpen()) {\n  <button\n    type=\"button\"\n    class=\"selection-popup-backdrop\"\n    [attr.aria-label]=\"'shared-ui.selection-topbar.close-selected-items-popup' | translate\"\n    (click)=\"closeSelectionPopup()\"\n  ></button>\n  <div\n    #selectionPopupPanel\n    class=\"selection-popup\"\n    role=\"dialog\"\n    aria-modal=\"true\"\n    aria-labelledby=\"selection-popup-title\"\n    tabindex=\"-1\"\n  >\n    <div class=\"selection-popup-header\">\n      <span id=\"selection-popup-title\" class=\"selection-popup-title\">{{\n        'shared-ui.selection-topbar.selected-items' | translate\n      }}</span>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [attr.aria-label]=\"'shared-ui.selection-topbar.close' | translate\"\n        class=\"selection-popup-close\"\n        (click)=\"closeSelectionPopup()\"\n      >\n        <mat-icon>close</mat-icon>\n      </button>\n    </div>\n\n    <div class=\"selection-popup-body\">\n      @for (item of selectedItems(); track item.id) {\n        <div class=\"selection-item\">\n          <nxs-thumbnail class=\"selection-item-preview\" [documentId]=\"item.id\">\n            <span class=\"selection-item-preview selection-item-preview--placeholder\"></span>\n          </nxs-thumbnail>\n          <span class=\"selection-item-name\">{{ item.name }}</span>\n        </div>\n      }\n    </div>\n  </div>\n}\n", styles: [":host{display:block;flex-shrink:0}.selection-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 16px 0 calc(var(--sat-platform-nav-width, 56px) + 16px);height:48px;background:var(--mat-sys-primary, #1a73e8);color:#fff;border-radius:4px 4px 0 0;margin-bottom:0;box-shadow:0 2px 4px #0000002e}.topbar-left{display:flex;align-items:center;gap:16px}.selected-label{font-size:14px;font-weight:600;white-space:nowrap}.clear-btn{color:#fff;font-size:13px;font-weight:500;padding:0 8px;min-width:unset;line-height:32px;height:32px;border-radius:4px;text-decoration:underline}.clear-btn:hover{background:#ffffff26}.topbar-actions{display:flex;align-items:center;gap:8px}.topbar-icon-btn{color:#fff;width:36px;height:36px}.topbar-icon-btn:hover:not(:disabled){background:#ffffff26}.topbar-icon-btn:disabled{color:var(--mat-sys-on-primary, #fff);opacity:.45}.selection-popup-backdrop{position:fixed;inset:0;background:#00000059;z-index:1000;border:none;cursor:pointer;font:inherit;padding:0}.selection-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1001;width:min(560px,100%);max-height:min(70vh,560px);background:#fff;color:var(--mat-sys-on-surface, #1a1c1e);border-radius:10px;box-shadow:0 14px 38px #00000038;display:flex;flex-direction:column}.selection-popup-header{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 12px 16px;border-bottom:1px solid var(--mat-sys-outline-variant, #d8dbe2)}.selection-popup-title{font-size:16px;font-weight:600}.selection-popup-close{color:var(--mat-sys-on-surface-variant, #5c5f6b)}.selection-popup-body{padding:8px 16px 16px;overflow:auto}.selection-item{display:flex;align-items:center;gap:10px;font-size:14px;padding:8px 0;word-break:break-word}.selection-item-preview{width:24px;height:24px;border-radius:4px;object-fit:cover;flex-shrink:0;border:1px solid var(--mat-sys-outline-variant, #d8dbe2);background:#f5f6fa}.selection-item-preview--placeholder{display:inline-block}.selection-item-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n"], dependencies: [{ kind: "component", type: NxsThumbnailComponent, selector: "nxs-thumbnail", inputs: ["documentId", "alt"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i2.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i3$1.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: DescriptorLabelPipe, name: "descriptorLabel" }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SelectionTopbarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-selection-topbar', standalone: true, imports: [
                        DescriptorLabelPipe,
                        NxsThumbnailComponent,
                        TranslatePipe,
                        MatButtonModule,
                        MatIconModule,
                        MatTooltipModule,
                    ], providers: [provideNxsThumbnailCache()], template: "<div class=\"selection-topbar\" [class.selection-topbar--clear-only]=\"clearOnly()\">\n  <div class=\"topbar-left\">\n    <span class=\"selected-label\">{{\n      (selectedCount() === 1 ? 'common.count.all-selected-one' : 'common.count.all-selected-many')\n        | translate: { count: selectedCount() }\n    }}</span>\n    @if (!clearOnly()) {\n      <button mat-button type=\"button\" class=\"clear-btn\" (click)=\"openSelectionPopup()\">\n        {{ 'shared-ui.selection-topbar.display-selection' | translate }}\n      </button>\n    }\n    <button mat-button type=\"button\" class=\"clear-btn\" (click)=\"cleared.emit()\">\n      {{ 'shared-ui.selection-topbar.clear' | translate }}\n    </button>\n  </div>\n\n  @if (!clearOnly()) {\n    <div class=\"topbar-actions\">\n      @for (action of bulkActions(); track action.id) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          class=\"topbar-icon-btn\"\n          [attr.data-action-id]=\"action.id\"\n          [matTooltip]=\"action.tooltip ?? (action | descriptorLabel)\"\n          matTooltipPosition=\"below\"\n          matTooltipClass=\"selection-topbar-tooltip mat-tooltip-multiline\"\n          [attr.aria-label]=\"action | descriptorLabel\"\n          [disabled]=\"!isEnabled(action)\"\n          (click)=\"run(action)\"\n        >\n          <mat-icon>{{ action.icon }}</mat-icon>\n        </button>\n      }\n    </div>\n  }\n</div>\n\n@if (!clearOnly() && selectionPopupOpen()) {\n  <button\n    type=\"button\"\n    class=\"selection-popup-backdrop\"\n    [attr.aria-label]=\"'shared-ui.selection-topbar.close-selected-items-popup' | translate\"\n    (click)=\"closeSelectionPopup()\"\n  ></button>\n  <div\n    #selectionPopupPanel\n    class=\"selection-popup\"\n    role=\"dialog\"\n    aria-modal=\"true\"\n    aria-labelledby=\"selection-popup-title\"\n    tabindex=\"-1\"\n  >\n    <div class=\"selection-popup-header\">\n      <span id=\"selection-popup-title\" class=\"selection-popup-title\">{{\n        'shared-ui.selection-topbar.selected-items' | translate\n      }}</span>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [attr.aria-label]=\"'shared-ui.selection-topbar.close' | translate\"\n        class=\"selection-popup-close\"\n        (click)=\"closeSelectionPopup()\"\n      >\n        <mat-icon>close</mat-icon>\n      </button>\n    </div>\n\n    <div class=\"selection-popup-body\">\n      @for (item of selectedItems(); track item.id) {\n        <div class=\"selection-item\">\n          <nxs-thumbnail class=\"selection-item-preview\" [documentId]=\"item.id\">\n            <span class=\"selection-item-preview selection-item-preview--placeholder\"></span>\n          </nxs-thumbnail>\n          <span class=\"selection-item-name\">{{ item.name }}</span>\n        </div>\n      }\n    </div>\n  </div>\n}\n", styles: [":host{display:block;flex-shrink:0}.selection-topbar{display:flex;align-items:center;justify-content:space-between;padding:0 16px 0 calc(var(--sat-platform-nav-width, 56px) + 16px);height:48px;background:var(--mat-sys-primary, #1a73e8);color:#fff;border-radius:4px 4px 0 0;margin-bottom:0;box-shadow:0 2px 4px #0000002e}.topbar-left{display:flex;align-items:center;gap:16px}.selected-label{font-size:14px;font-weight:600;white-space:nowrap}.clear-btn{color:#fff;font-size:13px;font-weight:500;padding:0 8px;min-width:unset;line-height:32px;height:32px;border-radius:4px;text-decoration:underline}.clear-btn:hover{background:#ffffff26}.topbar-actions{display:flex;align-items:center;gap:8px}.topbar-icon-btn{color:#fff;width:36px;height:36px}.topbar-icon-btn:hover:not(:disabled){background:#ffffff26}.topbar-icon-btn:disabled{color:var(--mat-sys-on-primary, #fff);opacity:.45}.selection-popup-backdrop{position:fixed;inset:0;background:#00000059;z-index:1000;border:none;cursor:pointer;font:inherit;padding:0}.selection-popup{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:1001;width:min(560px,100%);max-height:min(70vh,560px);background:#fff;color:var(--mat-sys-on-surface, #1a1c1e);border-radius:10px;box-shadow:0 14px 38px #00000038;display:flex;flex-direction:column}.selection-popup-header{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 12px 16px;border-bottom:1px solid var(--mat-sys-outline-variant, #d8dbe2)}.selection-popup-title{font-size:16px;font-weight:600}.selection-popup-close{color:var(--mat-sys-on-surface-variant, #5c5f6b)}.selection-popup-body{padding:8px 16px 16px;overflow:auto}.selection-item{display:flex;align-items:center;gap:10px;font-size:14px;padding:8px 0;word-break:break-word}.selection-item-preview{width:24px;height:24px;border-radius:4px;object-fit:cover;flex-shrink:0;border:1px solid var(--mat-sys-outline-variant, #d8dbe2);background:#f5f6fa}.selection-item-preview--placeholder{display:inline-block}.selection-item-name{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n"] }]
        }], propDecorators: { selectionPopupPanel: [{
                type: ViewChild,
                args: ['selectionPopupPanel']
            }], selectedCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedCount", required: true }] }], selectedItems: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedItems", required: false }] }], clearOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "clearOnly", required: false }] }], cleared: [{ type: i0.Output, args: ["cleared"] }], onEscape: [{
                type: HostListener,
                args: ['document:keydown.escape']
            }] } });

class CompareIconImageComponent {
    http = inject(HttpClient);
    apiOrigin = inject(NUXEO_API_ORIGIN);
    path = input('', ...(ngDevMode ? [{ debugName: "path" }] : []));
    alt = input('', ...(ngDevMode ? [{ debugName: "alt" }] : []));
    blobUrl = signal(null, ...(ngDevMode ? [{ debugName: "blobUrl" }] : []));
    activeUrl = null;
    constructor() {
        effect((onCleanup) => {
            const path = this.path();
            this.revokeActiveUrl();
            this.blobUrl.set(null);
            if (!path)
                return;
            const requestUrl = `${this.apiOrigin.replace(/\/$/, '')}${resolveNuxeoIconPath(path)}`;
            const subscription = this.http
                .get(requestUrl, { responseType: 'blob' })
                .pipe(catchError(() => of(null)))
                .subscribe((blob) => {
                if (!blob)
                    return;
                const objectUrl = URL.createObjectURL(blob);
                this.activeUrl = objectUrl;
                this.blobUrl.set(objectUrl);
            });
            onCleanup(() => {
                subscription.unsubscribe();
                this.revokeActiveUrl();
                this.blobUrl.set(null);
            });
        });
    }
    ngOnDestroy() {
        this.revokeActiveUrl();
    }
    revokeActiveUrl() {
        if (!this.activeUrl)
            return;
        URL.revokeObjectURL(this.activeUrl);
        this.activeUrl = null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CompareIconImageComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: CompareIconImageComponent, isStandalone: true, selector: "lib-compare-icon-image", inputs: { path: { classPropertyName: "path", publicName: "path", isSignal: true, isRequired: false, transformFunction: null }, alt: { classPropertyName: "alt", publicName: "alt", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "@if (blobUrl()) {\n  <img\n    [src]=\"blobUrl()!\"\n    [alt]=\"alt() || ('shared-ui.document-compare-dialog.document-type-icon' | translate)\"\n    class=\"compare-icon-image\"\n  />\n} @else if (path()) {\n  <span class=\"compare-icon-fallback\">{{ path() }}</span>\n}\n", styles: [":host{display:inline-flex;align-items:center}.compare-icon-image{width:16px;height:16px;display:block}.compare-icon-fallback{font-size:13px}\n"], dependencies: [{ kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: CompareIconImageComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-compare-icon-image', standalone: true, imports: [TranslatePipe], template: "@if (blobUrl()) {\n  <img\n    [src]=\"blobUrl()!\"\n    [alt]=\"alt() || ('shared-ui.document-compare-dialog.document-type-icon' | translate)\"\n    class=\"compare-icon-image\"\n  />\n} @else if (path()) {\n  <span class=\"compare-icon-fallback\">{{ path() }}</span>\n}\n", styles: [":host{display:inline-flex;align-items:center}.compare-icon-image{width:16px;height:16px;display:block}.compare-icon-fallback{font-size:13px}\n"] }]
        }], ctorParameters: () => [], propDecorators: { path: [{ type: i0.Input, args: [{ isSignal: true, alias: "path", required: false }] }], alt: [{ type: i0.Input, args: [{ isSignal: true, alias: "alt", required: false }] }] } });

class DocumentCompareDialogComponent {
    detailService = inject(DocumentDetailService);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    data = inject(MAT_DIALOG_DATA);
    leftId = signal(this.data.items[0]?.id ?? '', ...(ngDevMode ? [{ debugName: "leftId" }] : []));
    rightId = signal(this.data.items[1]?.id ?? this.data.items[0]?.id ?? '', ...(ngDevMode ? [{ debugName: "rightId" }] : []));
    viewAllData = signal(false, ...(ngDevMode ? [{ debugName: "viewAllData" }] : []));
    unifiedView = signal(false, ...(ngDevMode ? [{ debugName: "unifiedView" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    leftDoc = signal(null, ...(ngDevMode ? [{ debugName: "leftDoc" }] : []));
    rightDoc = signal(null, ...(ngDevMode ? [{ debugName: "rightDoc" }] : []));
    sections = computed(() => {
        const left = this.leftDoc();
        const right = this.rightDoc();
        if (!left || !right)
            return [];
        return buildDocumentCompareSections(left, right, this.viewAllData(), this.locale);
    }, ...(ngDevMode ? [{ debugName: "sections" }] : []));
    isIconRow(row) {
        return isCompareIconField(row.key);
    }
    constructor() {
        effect((onCleanup) => {
            const leftId = this.leftId();
            const rightId = this.rightId();
            if (!leftId || !rightId || leftId === rightId) {
                this.leftDoc.set(null);
                this.rightDoc.set(null);
                this.error.set(this.translate.instant('shared-ui.message.select-two-different-documents-to-compare'));
                this.loading.set(false);
                return;
            }
            this.loading.set(true);
            this.error.set(null);
            let cancelled = false;
            const subscription = forkJoin({
                left: this.detailService.getFullDocument(leftId),
                right: this.detailService.getFullDocument(rightId),
            })
                .pipe(catchError$1(() => {
                if (!cancelled) {
                    this.error.set(this.translate.instant('shared-ui.message.failed-to-load-documents-for-comparison'));
                }
                return of(null);
            }))
                .subscribe((result) => {
                if (cancelled)
                    return;
                this.loading.set(false);
                if (!result)
                    return;
                this.leftDoc.set(result.left);
                this.rightDoc.set(result.right);
            });
            onCleanup(() => {
                cancelled = true;
                subscription.unsubscribe();
            });
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentCompareDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: DocumentCompareDialogComponent, isStandalone: true, selector: "lib-document-compare-dialog", ngImport: i0, template: "<h2 mat-dialog-title>{{ 'shared-ui.document-compare-dialog.compare-documents' | translate }}</h2>\n\n<mat-dialog-content class=\"compare-content\">\n  <div class=\"compare-selectors\">\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"compare-select\">\n      <mat-label>{{ 'shared-ui.document-compare-dialog.document-1' | translate }}</mat-label>\n      <mat-select [value]=\"leftId()\" (selectionChange)=\"leftId.set($event.value)\">\n        @for (item of data.items; track item.id) {\n          <mat-option [value]=\"item.id\">{{ item.name }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <mat-icon class=\"compare-swap-icon\" aria-hidden=\"true\">swap_horiz</mat-icon>\n\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"compare-select\">\n      <mat-label>{{ 'shared-ui.document-compare-dialog.document-2' | translate }}</mat-label>\n      <mat-select [value]=\"rightId()\" (selectionChange)=\"rightId.set($event.value)\">\n        @for (item of data.items; track item.id) {\n          <mat-option [value]=\"item.id\">{{ item.name }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <div class=\"compare-view-controls\">\n      <mat-checkbox [checked]=\"viewAllData()\" (change)=\"viewAllData.set($event.checked)\">\n        {{ 'shared-ui.document-compare-dialog.view-all-data' | translate }}\n      </mat-checkbox>\n      <mat-slide-toggle [checked]=\"unifiedView()\" (change)=\"unifiedView.set($event.checked)\">\n        {{ 'shared-ui.document-compare-dialog.unified-view' | translate }}\n      </mat-slide-toggle>\n    </div>\n  </div>\n\n  @if (loading()) {\n    <div class=\"compare-loading\">\n      <nxs-spinner\n        diameter=\"32\"\n        [label]=\"'shared-ui.document-compare-dialog.loading' | translate\"\n      />\n    </div>\n  } @else if (error()) {\n    <p class=\"compare-error\">{{ error() }}</p>\n  } @else if (sections().length === 0) {\n    <p class=\"compare-empty\">\n      @if (viewAllData()) {\n        {{ 'ui.document-compare-dialog.no-document-data-available-to-compare' | translate }}\n      } @else {\n        {{ 'ui.document-compare-dialog.no-differences-found-between-the-selected' | translate }}\n      }\n    </p>\n  } @else {\n    <div class=\"compare-sections\">\n      @for (section of sections(); track section.id) {\n        <details class=\"compare-section\" open>\n          <summary class=\"compare-section-header\">\n            <span class=\"compare-section-title\">{{ section.label }}</span>\n            <mat-icon class=\"compare-section-chevron\">expand_more</mat-icon>\n          </summary>\n\n          <div class=\"compare-section-body\">\n            @for (row of section.fields; track row.key) {\n              @if (unifiedView()) {\n                <div class=\"compare-field-row compare-field-row--unified\">\n                  <span class=\"compare-field-label\">{{ row.label }}</span>\n                  <div class=\"compare-field-values\">\n                    @if (row.differs) {\n                      @if (row.left) {\n                        <span class=\"compare-field-value compare-field-value--removed\">\n                          @if (isIconRow(row)) {\n                            <lib-compare-icon-image [path]=\"row.left\" [alt]=\"row.label\" />\n                          } @else {\n                            {{ row.left }}\n                          }\n                        </span>\n                      }\n                      @if (row.right) {\n                        <span class=\"compare-field-value compare-field-value--added\">\n                          @if (isIconRow(row)) {\n                            <lib-compare-icon-image [path]=\"row.right\" [alt]=\"row.label\" />\n                          } @else {\n                            {{ row.right }}\n                          }\n                        </span>\n                      }\n                    } @else {\n                      <span class=\"compare-field-value\">\n                        @if (isIconRow(row)) {\n                          <lib-compare-icon-image\n                            [path]=\"row.left || row.right\"\n                            [alt]=\"row.label\"\n                          />\n                        } @else {\n                          {{ row.left || row.right }}\n                        }\n                      </span>\n                    }\n                  </div>\n                </div>\n              } @else {\n                <div class=\"compare-field-row\">\n                  <div class=\"compare-side compare-side--left\">\n                    <span class=\"compare-field-label\">{{ row.label }}</span>\n                    <span\n                      class=\"compare-field-value\"\n                      [class.compare-field-value--changed]=\"row.differs && row.left\"\n                    >\n                      {{ row.left }}\n                    </span>\n                  </div>\n                  <div class=\"compare-side compare-side--right\">\n                    <span class=\"compare-field-label\">{{ row.label }}</span>\n                    <span\n                      class=\"compare-field-value\"\n                      [class.compare-field-value--changed]=\"row.differs && row.right\"\n                    >\n                      {{ row.right }}\n                    </span>\n                  </div>\n                </div>\n              }\n            }\n          </div>\n        </details>\n      }\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button type=\"button\" mat-stroked-button mat-dialog-close>\n    {{ 'shared-ui.document-compare-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [".compare-content{display:flex;flex-direction:column;gap:16px;min-width:min(1280px,94vw);max-height:78vh}.compare-selectors{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}.compare-swap-icon{color:var(--mat-sys-on-surface-variant, #7a7d87);flex-shrink:0}.compare-view-controls{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;margin-left:auto}.compare-select{min-width:280px;flex:1}.compare-loading,.compare-empty,.compare-error{display:flex;align-items:center;justify-content:center;min-height:120px;font-size:14px}.compare-error{color:var(--mat-sys-error, #b3261e)}.compare-sections{display:flex;flex-direction:column;gap:12px;overflow:auto}.compare-section{border:1px solid var(--mat-sys-outline-variant, #d8dbe2);border-radius:4px;background:var(--mat-sys-surface, #fff)}.compare-section-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--mat-sys-outline-variant, #e8eaef);cursor:pointer;list-style:none}.compare-section-header::-webkit-details-marker{display:none}.compare-section-title{font-size:14px;font-weight:700;color:var(--mat-sys-on-surface, #1a1c1e)}.compare-section-chevron{font-size:20px;width:20px;height:20px;color:var(--mat-sys-on-surface-variant, #5c5f6b);transition:transform .15s ease}.compare-section:not([open]) .compare-section-chevron{transform:rotate(-90deg)}.compare-section-body{padding:4px 0 8px}.compare-field-row{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:10px 16px;border-bottom:1px solid var(--mat-sys-outline-variant, #f0f1f4)}.compare-field-row:last-child{border-bottom:none}.compare-field-row--unified{grid-template-columns:minmax(110px,20%) minmax(0,1fr);gap:12px 24px;align-items:start}.compare-field-values{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-width:0}.compare-side{display:grid;grid-template-columns:minmax(110px,28%) minmax(0,1fr);gap:12px 16px;align-items:start;min-width:0}.compare-field-label{font-size:12px;color:var(--mat-sys-on-surface-variant, #7a7d87);word-break:break-word}.compare-field-value{font-size:13px;color:var(--mat-sys-on-surface, #1a1c1e);white-space:pre-wrap;word-break:break-word;min-height:1.25rem}.compare-side--left .compare-field-value--changed{background:var(--mat-sys-error-container, #fde8e7);color:var(--mat-sys-on-error-container, #601410);padding:2px 6px;border-radius:2px}.compare-side--right .compare-field-value--changed{background:var(--mat-sys-tertiary-container, #d7f5e3);color:var(--mat-sys-on-tertiary-container, #0d3b24);padding:2px 6px;border-radius:2px}.compare-field-value--removed{background:var(--mat-sys-error-container, #fde8e7);color:var(--mat-sys-on-error-container, #601410);padding:2px 6px;border-radius:2px}.compare-field-value--added{background:var(--mat-sys-tertiary-container, #d7f5e3);color:var(--mat-sys-on-tertiary-container, #0d3b24);padding:2px 6px;border-radius:2px}\n"], dependencies: [{ kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i3$2.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$3.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$3.MatLabel, selector: "mat-label" }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i5.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i5.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatSlideToggleModule }, { kind: "component", type: i7.MatSlideToggle, selector: "mat-slide-toggle", inputs: ["name", "id", "labelPosition", "aria-label", "aria-labelledby", "aria-describedby", "required", "color", "disabled", "disableRipple", "tabIndex", "checked", "hideIcon", "disabledInteractive"], outputs: ["change", "toggleChange"], exportAs: ["matSlideToggle"] }, { kind: "component", type: CompareIconImageComponent, selector: "lib-compare-icon-image", inputs: ["path", "alt"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentCompareDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-document-compare-dialog', standalone: true, imports: [
                        NxsSpinnerComponent,
                        TranslatePipe,
                        MatDialogModule,
                        MatButtonModule,
                        MatCheckboxModule,
                        MatFormFieldModule,
                        MatSelectModule,
                        MatIconModule,
                        MatSlideToggleModule,
                        CompareIconImageComponent,
                    ], template: "<h2 mat-dialog-title>{{ 'shared-ui.document-compare-dialog.compare-documents' | translate }}</h2>\n\n<mat-dialog-content class=\"compare-content\">\n  <div class=\"compare-selectors\">\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"compare-select\">\n      <mat-label>{{ 'shared-ui.document-compare-dialog.document-1' | translate }}</mat-label>\n      <mat-select [value]=\"leftId()\" (selectionChange)=\"leftId.set($event.value)\">\n        @for (item of data.items; track item.id) {\n          <mat-option [value]=\"item.id\">{{ item.name }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <mat-icon class=\"compare-swap-icon\" aria-hidden=\"true\">swap_horiz</mat-icon>\n\n    <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"compare-select\">\n      <mat-label>{{ 'shared-ui.document-compare-dialog.document-2' | translate }}</mat-label>\n      <mat-select [value]=\"rightId()\" (selectionChange)=\"rightId.set($event.value)\">\n        @for (item of data.items; track item.id) {\n          <mat-option [value]=\"item.id\">{{ item.name }}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n\n    <div class=\"compare-view-controls\">\n      <mat-checkbox [checked]=\"viewAllData()\" (change)=\"viewAllData.set($event.checked)\">\n        {{ 'shared-ui.document-compare-dialog.view-all-data' | translate }}\n      </mat-checkbox>\n      <mat-slide-toggle [checked]=\"unifiedView()\" (change)=\"unifiedView.set($event.checked)\">\n        {{ 'shared-ui.document-compare-dialog.unified-view' | translate }}\n      </mat-slide-toggle>\n    </div>\n  </div>\n\n  @if (loading()) {\n    <div class=\"compare-loading\">\n      <nxs-spinner\n        diameter=\"32\"\n        [label]=\"'shared-ui.document-compare-dialog.loading' | translate\"\n      />\n    </div>\n  } @else if (error()) {\n    <p class=\"compare-error\">{{ error() }}</p>\n  } @else if (sections().length === 0) {\n    <p class=\"compare-empty\">\n      @if (viewAllData()) {\n        {{ 'ui.document-compare-dialog.no-document-data-available-to-compare' | translate }}\n      } @else {\n        {{ 'ui.document-compare-dialog.no-differences-found-between-the-selected' | translate }}\n      }\n    </p>\n  } @else {\n    <div class=\"compare-sections\">\n      @for (section of sections(); track section.id) {\n        <details class=\"compare-section\" open>\n          <summary class=\"compare-section-header\">\n            <span class=\"compare-section-title\">{{ section.label }}</span>\n            <mat-icon class=\"compare-section-chevron\">expand_more</mat-icon>\n          </summary>\n\n          <div class=\"compare-section-body\">\n            @for (row of section.fields; track row.key) {\n              @if (unifiedView()) {\n                <div class=\"compare-field-row compare-field-row--unified\">\n                  <span class=\"compare-field-label\">{{ row.label }}</span>\n                  <div class=\"compare-field-values\">\n                    @if (row.differs) {\n                      @if (row.left) {\n                        <span class=\"compare-field-value compare-field-value--removed\">\n                          @if (isIconRow(row)) {\n                            <lib-compare-icon-image [path]=\"row.left\" [alt]=\"row.label\" />\n                          } @else {\n                            {{ row.left }}\n                          }\n                        </span>\n                      }\n                      @if (row.right) {\n                        <span class=\"compare-field-value compare-field-value--added\">\n                          @if (isIconRow(row)) {\n                            <lib-compare-icon-image [path]=\"row.right\" [alt]=\"row.label\" />\n                          } @else {\n                            {{ row.right }}\n                          }\n                        </span>\n                      }\n                    } @else {\n                      <span class=\"compare-field-value\">\n                        @if (isIconRow(row)) {\n                          <lib-compare-icon-image\n                            [path]=\"row.left || row.right\"\n                            [alt]=\"row.label\"\n                          />\n                        } @else {\n                          {{ row.left || row.right }}\n                        }\n                      </span>\n                    }\n                  </div>\n                </div>\n              } @else {\n                <div class=\"compare-field-row\">\n                  <div class=\"compare-side compare-side--left\">\n                    <span class=\"compare-field-label\">{{ row.label }}</span>\n                    <span\n                      class=\"compare-field-value\"\n                      [class.compare-field-value--changed]=\"row.differs && row.left\"\n                    >\n                      {{ row.left }}\n                    </span>\n                  </div>\n                  <div class=\"compare-side compare-side--right\">\n                    <span class=\"compare-field-label\">{{ row.label }}</span>\n                    <span\n                      class=\"compare-field-value\"\n                      [class.compare-field-value--changed]=\"row.differs && row.right\"\n                    >\n                      {{ row.right }}\n                    </span>\n                  </div>\n                </div>\n              }\n            }\n          </div>\n        </details>\n      }\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button type=\"button\" mat-stroked-button mat-dialog-close>\n    {{ 'shared-ui.document-compare-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [".compare-content{display:flex;flex-direction:column;gap:16px;min-width:min(1280px,94vw);max-height:78vh}.compare-selectors{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}.compare-swap-icon{color:var(--mat-sys-on-surface-variant, #7a7d87);flex-shrink:0}.compare-view-controls{display:flex;flex-wrap:wrap;align-items:center;gap:12px 20px;margin-left:auto}.compare-select{min-width:280px;flex:1}.compare-loading,.compare-empty,.compare-error{display:flex;align-items:center;justify-content:center;min-height:120px;font-size:14px}.compare-error{color:var(--mat-sys-error, #b3261e)}.compare-sections{display:flex;flex-direction:column;gap:12px;overflow:auto}.compare-section{border:1px solid var(--mat-sys-outline-variant, #d8dbe2);border-radius:4px;background:var(--mat-sys-surface, #fff)}.compare-section-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid var(--mat-sys-outline-variant, #e8eaef);cursor:pointer;list-style:none}.compare-section-header::-webkit-details-marker{display:none}.compare-section-title{font-size:14px;font-weight:700;color:var(--mat-sys-on-surface, #1a1c1e)}.compare-section-chevron{font-size:20px;width:20px;height:20px;color:var(--mat-sys-on-surface-variant, #5c5f6b);transition:transform .15s ease}.compare-section:not([open]) .compare-section-chevron{transform:rotate(-90deg)}.compare-section-body{padding:4px 0 8px}.compare-field-row{display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:10px 16px;border-bottom:1px solid var(--mat-sys-outline-variant, #f0f1f4)}.compare-field-row:last-child{border-bottom:none}.compare-field-row--unified{grid-template-columns:minmax(110px,20%) minmax(0,1fr);gap:12px 24px;align-items:start}.compare-field-values{display:flex;flex-wrap:wrap;gap:8px;align-items:center;min-width:0}.compare-side{display:grid;grid-template-columns:minmax(110px,28%) minmax(0,1fr);gap:12px 16px;align-items:start;min-width:0}.compare-field-label{font-size:12px;color:var(--mat-sys-on-surface-variant, #7a7d87);word-break:break-word}.compare-field-value{font-size:13px;color:var(--mat-sys-on-surface, #1a1c1e);white-space:pre-wrap;word-break:break-word;min-height:1.25rem}.compare-side--left .compare-field-value--changed{background:var(--mat-sys-error-container, #fde8e7);color:var(--mat-sys-on-error-container, #601410);padding:2px 6px;border-radius:2px}.compare-side--right .compare-field-value--changed{background:var(--mat-sys-tertiary-container, #d7f5e3);color:var(--mat-sys-on-tertiary-container, #0d3b24);padding:2px 6px;border-radius:2px}.compare-field-value--removed{background:var(--mat-sys-error-container, #fde8e7);color:var(--mat-sys-on-error-container, #601410);padding:2px 6px;border-radius:2px}.compare-field-value--added{background:var(--mat-sys-tertiary-container, #d7f5e3);color:var(--mat-sys-on-tertiary-container, #0d3b24);padding:2px 6px;border-radius:2px}\n"] }]
        }], ctorParameters: () => [] });

function openDocumentCompareDialog(dialog, items) {
    if (items.length < 2)
        return;
    dialog.open(DocumentCompareDialogComponent, {
        width: '1400px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        panelClass: 'document-compare-dialog-panel',
        data: { items },
    });
}

class WidgetContainerComponent {
    title = input.required(...(ngDevMode ? [{ debugName: "title" }] : []));
    icon = input(...(ngDevMode ? [undefined, { debugName: "icon" }] : []));
    iconColor = input('', ...(ngDevMode ? [{ debugName: "iconColor" }] : []));
    /** Level under the shell `<h1>` (2) or under a page section `<h2>` (3). */
    headingLevel = input(2, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WidgetContainerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: WidgetContainerComponent, isStandalone: true, selector: "lib-widget-container", inputs: { title: { classPropertyName: "title", publicName: "title", isSignal: true, isRequired: true, transformFunction: null }, icon: { classPropertyName: "icon", publicName: "icon", isSignal: true, isRequired: false, transformFunction: null }, iconColor: { classPropertyName: "iconColor", publicName: "iconColor", isSignal: true, isRequired: false, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<div class=\"widget\">\n  <div class=\"widget-header\">\n    @if (icon()) {\n      <mat-icon class=\"widget-header-icon\" [style.color]=\"iconColor()\">{{ icon() }}</mat-icon>\n    }\n    <div class=\"widget-header-title\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n      {{ title() }}\n    </div>\n    <ng-content select=\"[widgetActions]\" />\n  </div>\n\n  <!--\n    `tabindex=\"0\"` because `.widget-body` sets `overflow-y: auto`: a mouse user can scroll it\n    and a keyboard user could not reach the content that overflowed. That is WCAG 2.1.1, and\n    axe reports it as `scrollable-region-focusable`.\n\n    It carries `role=\"group\"` and the widget's own title as its name, so the resulting tab stop\n    announces *which* widget it belongs to. A bare focusable div would satisfy the rule while\n    announcing nothing, which is the sort of fix that passes an audit and helps no one.\n  -->\n  <div class=\"widget-body\" tabindex=\"0\" role=\"group\" [attr.aria-label]=\"title()\">\n    <ng-content />\n  </div>\n</div>\n", styles: [".widget{background:#fff;border:1px solid #e8eaef;border-radius:12px;box-shadow:0 1px 4px #0000000f,0 4px 12px #0000000a;display:flex;flex-direction:column;height:360px;overflow:hidden}.widget-header{display:flex;align-items:center;gap:8px;padding:16px 20px 12px;border-bottom:1px solid #e8eaef;background:#fff;flex-shrink:0}.widget-header-icon{font-size:20px;width:20px;height:20px}.widget-header-title{margin:0;font-size:14px;font-weight:600;color:var(--mat-sys-on-surface);flex:1}.widget-body{flex:1;overflow-y:auto;padding:0}\n"], dependencies: [{ kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WidgetContainerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-widget-container', standalone: true, imports: [MatIconModule], template: "<div class=\"widget\">\n  <div class=\"widget-header\">\n    @if (icon()) {\n      <mat-icon class=\"widget-header-icon\" [style.color]=\"iconColor()\">{{ icon() }}</mat-icon>\n    }\n    <div class=\"widget-header-title\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n      {{ title() }}\n    </div>\n    <ng-content select=\"[widgetActions]\" />\n  </div>\n\n  <!--\n    `tabindex=\"0\"` because `.widget-body` sets `overflow-y: auto`: a mouse user can scroll it\n    and a keyboard user could not reach the content that overflowed. That is WCAG 2.1.1, and\n    axe reports it as `scrollable-region-focusable`.\n\n    It carries `role=\"group\"` and the widget's own title as its name, so the resulting tab stop\n    announces *which* widget it belongs to. A bare focusable div would satisfy the rule while\n    announcing nothing, which is the sort of fix that passes an audit and helps no one.\n  -->\n  <div class=\"widget-body\" tabindex=\"0\" role=\"group\" [attr.aria-label]=\"title()\">\n    <ng-content />\n  </div>\n</div>\n", styles: [".widget{background:#fff;border:1px solid #e8eaef;border-radius:12px;box-shadow:0 1px 4px #0000000f,0 4px 12px #0000000a;display:flex;flex-direction:column;height:360px;overflow:hidden}.widget-header{display:flex;align-items:center;gap:8px;padding:16px 20px 12px;border-bottom:1px solid #e8eaef;background:#fff;flex-shrink:0}.widget-header-icon{font-size:20px;width:20px;height:20px}.widget-header-title{margin:0;font-size:14px;font-weight:600;color:var(--mat-sys-on-surface);flex:1}.widget-body{flex:1;overflow-y:auto;padding:0}\n"] }]
        }], propDecorators: { title: [{ type: i0.Input, args: [{ isSignal: true, alias: "title", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], iconColor: [{ type: i0.Input, args: [{ isSignal: true, alias: "iconColor", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }] } });

class WidgetGridComponent {
    /** Number of columns in the grid (default 2 for half-width widgets). */
    columns = input(2, ...(ngDevMode ? [{ debugName: "columns" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WidgetGridComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: WidgetGridComponent, isStandalone: true, selector: "lib-widget-grid", inputs: { columns: { classPropertyName: "columns", publicName: "columns", isSignal: true, isRequired: false, transformFunction: null } }, ngImport: i0, template: "<div class=\"widget-grid\" [style.grid-template-columns]=\"'repeat(' + columns() + ', 1fr)'\">\n  <ng-content />\n</div>\n", styles: [".widget-grid{display:grid;gap:24px;padding:24px 28px}@media(max-width:900px){.widget-grid{grid-template-columns:1fr!important}}\n"] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: WidgetGridComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-widget-grid', standalone: true, template: "<div class=\"widget-grid\" [style.grid-template-columns]=\"'repeat(' + columns() + ', 1fr)'\">\n  <ng-content />\n</div>\n", styles: [".widget-grid{display:grid;gap:24px;padding:24px 28px}@media(max-width:900px){.widget-grid{grid-template-columns:1fr!important}}\n"] }]
        }], propDecorators: { columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: false }] }] } });

class ShareDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    copyLink() {
        navigator.clipboard.writeText(this.data.url).then(() => this.toast.show(this.translate.instant('shared-ui.message.link-copied-to-clipboard')), () => this.toast.error(this.translate.instant('shared-ui.message.failed-to-copy-link')));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.33", type: ShareDialogComponent, isStandalone: true, selector: "lib-share-dialog", providers: [provideNxsToast()], ngImport: i0, template: "<h2 mat-dialog-title>{{ 'shared-ui.share-dialog.share-the-document' | translate }}</h2>\n\n<mat-dialog-content>\n  <p class=\"share-subtitle\">\n    {{ 'shared-ui.share-dialog.internal-access-link-to' | translate: { name: data.title } }}\n  </p>\n  <div class=\"share-link-row\">\n    <input\n      class=\"share-link-input\"\n      readonly\n      [value]=\"data.url\"\n      #linkInput\n      [attr.aria-label]=\"'shared-ui.share-dialog.share-link' | translate\"\n    />\n    <button\n      mat-icon-button\n      class=\"copy-btn\"\n      (click)=\"copyLink()\"\n      [attr.aria-label]=\"'shared-ui.share-dialog.copy-link' | translate\"\n    >\n      <mat-icon>link</mat-icon>\n    </button>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-flat-button color=\"primary\" mat-dialog-close>\n    {{ 'shared-ui.share-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:420px}.share-subtitle{margin:0 0 16px;font-size:14px;color:#555}.share-link-row{display:flex;align-items:center;gap:8px;border:1px solid #e0e0e0;border-radius:6px;padding:4px 4px 4px 12px;background:#fafafa}.share-link-input{flex:1;border:none;background:transparent;font-size:13px;color:var(--mat-sys-on-surface);outline:none;min-width:0;font-family:inherit}.copy-btn{flex-shrink:0;color:var(--mat-sys-primary)}mat-dialog-actions{padding:8px 24px 16px}\n"], dependencies: [{ kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i2.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-share-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule, MatIconModule], providers: [provideNxsToast()], template: "<h2 mat-dialog-title>{{ 'shared-ui.share-dialog.share-the-document' | translate }}</h2>\n\n<mat-dialog-content>\n  <p class=\"share-subtitle\">\n    {{ 'shared-ui.share-dialog.internal-access-link-to' | translate: { name: data.title } }}\n  </p>\n  <div class=\"share-link-row\">\n    <input\n      class=\"share-link-input\"\n      readonly\n      [value]=\"data.url\"\n      #linkInput\n      [attr.aria-label]=\"'shared-ui.share-dialog.share-link' | translate\"\n    />\n    <button\n      mat-icon-button\n      class=\"copy-btn\"\n      (click)=\"copyLink()\"\n      [attr.aria-label]=\"'shared-ui.share-dialog.copy-link' | translate\"\n    >\n      <mat-icon>link</mat-icon>\n    </button>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-flat-button color=\"primary\" mat-dialog-close>\n    {{ 'shared-ui.share-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:420px}.share-subtitle{margin:0 0 16px;font-size:14px;color:#555}.share-link-row{display:flex;align-items:center;gap:8px;border:1px solid #e0e0e0;border-radius:6px;padding:4px 4px 4px 12px;background:#fafafa}.share-link-input{flex:1;border:none;background:transparent;font-size:13px;color:var(--mat-sys-on-surface);outline:none;min-width:0;font-family:inherit}.copy-btn{flex-shrink:0;color:var(--mat-sys-primary)}mat-dialog-actions{padding:8px 24px 16px}\n"] }]
        }] });

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
class DocumentViewerComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: DocumentViewerComponent, isStandalone: true, selector: "lib-document-viewer", inputs: { blobUrl: { classPropertyName: "blobUrl", publicName: "blobUrl", isSignal: true, isRequired: false, transformFunction: null }, rawBlobUrl: { classPropertyName: "rawBlobUrl", publicName: "rawBlobUrl", isSignal: true, isRequired: true, transformFunction: null }, blobType: { classPropertyName: "blobType", publicName: "blobType", isSignal: true, isRequired: true, transformFunction: null }, mimeType: { classPropertyName: "mimeType", publicName: "mimeType", isSignal: true, isRequired: false, transformFunction: null }, fileName: { classPropertyName: "fileName", publicName: "fileName", isSignal: true, isRequired: false, transformFunction: null }, fileSize: { classPropertyName: "fileSize", publicName: "fileSize", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, noteContent: { classPropertyName: "noteContent", publicName: "noteContent", isSignal: true, isRequired: false, transformFunction: null }, noteHtml: { classPropertyName: "noteHtml", publicName: "noteHtml", isSignal: true, isRequired: false, transformFunction: null }, videoSources: { classPropertyName: "videoSources", publicName: "videoSources", isSignal: true, isRequired: false, transformFunction: null }, storyboard: { classPropertyName: "storyboard", publicName: "storyboard", isSignal: true, isRequired: false, transformFunction: null }, posterUrl: { classPropertyName: "posterUrl", publicName: "posterUrl", isSignal: true, isRequired: false, transformFunction: null }, hasPdfRendition: { classPropertyName: "hasPdfRendition", publicName: "hasPdfRendition", isSignal: true, isRequired: false, transformFunction: null }, previewUrl: { classPropertyName: "previewUrl", publicName: "previewUrl", isSignal: true, isRequired: false, transformFunction: null }, pictureInfo: { classPropertyName: "pictureInfo", publicName: "pictureInfo", isSignal: true, isRequired: false, transformFunction: null }, pictureViews: { classPropertyName: "pictureViews", publicName: "pictureViews", isSignal: true, isRequired: false, transformFunction: null }, exifData: { classPropertyName: "exifData", publicName: "exifData", isSignal: true, isRequired: false, transformFunction: null }, iptcData: { classPropertyName: "iptcData", publicName: "iptcData", isSignal: true, isRequired: false, transformFunction: null }, videoInfo: { classPropertyName: "videoInfo", publicName: "videoInfo", isSignal: true, isRequired: false, transformFunction: null }, arenderUrl: { classPropertyName: "arenderUrl", publicName: "arenderUrl", isSignal: true, isRequired: false, transformFunction: null }, arenderReloadId: { classPropertyName: "arenderReloadId", publicName: "arenderReloadId", isSignal: true, isRequired: false, transformFunction: null }, viewerDocUid: { classPropertyName: "viewerDocUid", publicName: "viewerDocUid", isSignal: true, isRequired: false, transformFunction: null }, annotationsTab: { classPropertyName: "annotationsTab", publicName: "annotationsTab", isSignal: true, isRequired: false, transformFunction: null }, showMainFileControls: { classPropertyName: "showMainFileControls", publicName: "showMainFileControls", isSignal: true, isRequired: false, transformFunction: null }, mainFileActionInProgress: { classPropertyName: "mainFileActionInProgress", publicName: "mainFileActionInProgress", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { downloadClicked: "downloadClicked", openWithDriveClicked: "openWithDriveClicked", previewClicked: "previewClicked", replaceMainFileClicked: "replaceMainFileClicked", removeMainFileClicked: "removeMainFileClicked", storyboardSeek: "storyboardSeek", formatDownload: "formatDownload" }, viewQueries: [{ propertyName: "videoRef", first: true, predicate: ["videoPlayer"], descendants: true, isSignal: true }], ngImport: i0, template: "<div class=\"viewer-panel\">\n  <!-- Content area -->\n  <div class=\"viewer-content\" [class.fit-real]=\"fitMode() === 'real' && contentType() === 'image'\">\n    @if (loading()) {\n      <div class=\"viewer-loading\">\n        <nxs-spinner diameter=\"36\" [label]=\"'shared-ui.document-viewer.loading' | translate\" />\n      </div>\n    } @else if (annotationsTab() && !arenderAvailable()) {\n      <div class=\"viewer-placeholder\">\n        <mat-icon class=\"placeholder-icon\">edit_note</mat-icon>\n        <p>{{ 'shared-ui.document-viewer.annotations-are-not-available-for-this' | translate }}</p>\n        <span class=\"mime-label\">{{\n          'shared-ui.document-viewer.use-the-view-tab-for-the' | translate\n        }}</span>\n      </div>\n    } @else if (showARenderViewer()) {\n      @for (rid of [arenderReloadId()]; track rid) {\n        <iframe\n          [src]=\"arenderUrl()\"\n          [title]=\"'shared-ui.document-viewer.annotations-frame' | translate: { name: fileName() }\"\n          class=\"viewer-iframe arender-frame\"\n          allow=\"fullscreen\"\n        ></iframe>\n      }\n    } @else {\n      @switch (contentType()) {\n        @case ('image') {\n          <img\n            [src]=\"blobUrl()\"\n            [alt]=\"fileName()\"\n            class=\"viewer-image\"\n            [class.fit-real]=\"fitMode() === 'real'\"\n            [style.transform]=\"transform()\"\n          />\n        }\n        @case ('video') {\n          <div class=\"viewer-video-container\">\n            <video #videoPlayer controls class=\"viewer-video\" [poster]=\"posterUrl()\">\n              @if (videoSources().length > 0) {\n                @for (src of videoSources(); track src.url) {\n                  <source [src]=\"src.url\" [type]=\"src.mimeType\" />\n                }\n              } @else {\n                <source [src]=\"rawBlobUrl()\" />\n              }\n              {{ 'ui.document-viewer.your-browser-does-not-support-video' | translate }}\n            </video>\n          </div>\n        }\n        @case ('audio') {\n          <div class=\"viewer-audio-wrapper\">\n            <mat-icon class=\"audio-icon\">audiotrack</mat-icon>\n            <audio [src]=\"rawBlobUrl()\" controls class=\"viewer-audio\"></audio>\n          </div>\n        }\n        @case ('markdown') {\n          <div class=\"viewer-markdown-content\" [innerHTML]=\"noteHtml()\"></div>\n        }\n        @case ('html') {\n          <iframe\n            class=\"viewer-iframe viewer-html-frame\"\n            [srcdoc]=\"noteContent()\"\n            [title]=\"'shared-ui.document-viewer.note-frame' | translate: { name: fileName() }\"\n            sandbox=\"allow-same-origin\"\n          ></iframe>\n        }\n        @case ('xml') {\n          <pre class=\"viewer-preformatted viewer-xml\">{{ noteContent() }}</pre>\n        }\n        @case ('text') {\n          <pre class=\"viewer-preformatted\">{{ noteContent() }}</pre>\n        }\n        @case ('pdf') {\n          <iframe\n            [src]=\"blobUrl()\"\n            [title]=\"'shared-ui.document-viewer.pdf-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @case ('pdfRendition') {\n          <iframe\n            [src]=\"blobUrl()\"\n            [title]=\"'shared-ui.document-viewer.pdf-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @case ('preview') {\n          <iframe\n            [src]=\"previewUrl()\"\n            [title]=\"'shared-ui.document-viewer.preview-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @default {\n          <div class=\"viewer-placeholder\">\n            <mat-icon class=\"placeholder-icon\">insert_drive_file</mat-icon>\n            <p>{{ 'shared-ui.document-viewer.preview-not-available' | translate }}</p>\n            @if (mimeType()) {\n              <span class=\"mime-label\">{{ mimeType() }}</span>\n            }\n          </div>\n        }\n      }\n    }\n  </div>\n\n  <!-- Video storyboard -->\n  @if (showVideoStoryboard()) {\n    <div class=\"viewer-storyboard\">\n      @for (item of storyboard(); track item.timecode) {\n        <button\n          type=\"button\"\n          class=\"storyboard-item\"\n          [matTooltip]=\"item.label || formatTimecode(item.timecode)\"\n          (click)=\"seekTo(item.timecode)\"\n        >\n          <img [src]=\"item.thumbnailUrl\" [alt]=\"item.label\" class=\"storyboard-thumb\" />\n          <span class=\"storyboard-time\">{{ formatTimecode(item.timecode) }}</span>\n        </button>\n      }\n    </div>\n  }\n\n  <!-- Image toolbar (zoom/rotate) -->\n  @if (showImageToolbar()) {\n    <div class=\"viewer-toolbar\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.zoom-in' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.zoom-in' | translate\"\n        (click)=\"zoomIn()\"\n      >\n        <mat-icon>zoom_in</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"\n          fitMode() === 'width' ? ('ui.actual-size' | translate) : ('ui.fit-to-viewer' | translate)\n        \"\n        [attr.aria-label]=\"'shared-ui.document-viewer.toggle-fit' | translate\"\n        (click)=\"toggleFit()\"\n      >\n        <mat-icon>{{ fitMode() === 'width' ? 'crop_free' : 'fit_screen' }}</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.zoom-out' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.zoom-out' | translate\"\n        (click)=\"zoomOut()\"\n      >\n        <mat-icon>zoom_out</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.rotate-left' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.rotate-left' | translate\"\n        (click)=\"rotateLeft()\"\n      >\n        <mat-icon>rotate_left</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.rotate-right' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.rotate-right' | translate\"\n        (click)=\"rotateRight()\"\n      >\n        <mat-icon>rotate_right</mat-icon>\n      </button>\n    </div>\n  }\n\n  <!-- Footer -->\n  <div class=\"viewer-footer\">\n    <div class=\"viewer-footer-info\">\n      <span class=\"file-name\">{{ fileName() }}</span>\n      @if (fileSize()) {\n        <span class=\"file-size\">{{ fileSize() }}</span>\n      }\n    </div>\n    <div class=\"viewer-footer-actions\">\n      @if (!annotationsTab()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.open-with-nuxeo-drive' | translate\"\n          [attr.aria-label]=\"'shared-ui.document-viewer.open-with-nuxeo-drive' | translate\"\n          (click)=\"openWithDriveClicked.emit()\"\n        >\n          <mat-icon>cloud_sync</mat-icon>\n        </button>\n      }\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.preview' | translate\"\n        (click)=\"previewClicked.emit()\"\n      >\n        <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n          'shared-ui.document-viewer.preview' | translate\n        }}</span>\n        <mat-icon aria-hidden=\"true\">visibility</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.download' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.download' | translate\"\n        (click)=\"downloadClicked.emit()\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n      @if (showMainFileControls()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.replace-main-file' | translate\"\n          [attr.aria-label]=\"'shared-ui.document-viewer.replace-main-file' | translate\"\n          [disabled]=\"mainFileActionInProgress() === 'replace-main'\"\n          (click)=\"replaceMainFileClicked.emit()\"\n        >\n          <mat-icon>find_replace</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.remove-main-file' | translate\"\n          class=\"footer-remove-btn\"\n          [disabled]=\"mainFileActionInProgress() === 'remove-main'\"\n          (click)=\"removeMainFileClicked.emit()\"\n        >\n          <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n            'shared-ui.document-viewer.remove-main-file' | translate\n          }}</span>\n          <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n        </button>\n      }\n    </div>\n  </div>\n\n  <!-- Video metadata card -->\n  @if (showVideoInfoCard()) {\n    <div class=\"picture-cards\">\n      <div class=\"picture-card\">\n        <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.video-info' | translate }}</h4>\n        <div class=\"picture-card-body\">\n          @if (videoInfo(); as vi) {\n            @if (isFiniteNumber(vi.duration)) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.duration' | translate\n                }}</span>\n                <span class=\"info-value\">{{ formatDuration(vi.duration) }}</span>\n              </div>\n            }\n            @if (vi.width && vi.height) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.resolution' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.width }} \u00D7 {{ vi.height }}</span>\n              </div>\n            }\n            @if (vi.format) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ 'shared-ui.document-viewer.format' | translate }}</span>\n                <span class=\"info-value\">{{ vi.format }}</span>\n              </div>\n            }\n            @if (vi.videoCodec) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.video-codec' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.videoCodec }}</span>\n              </div>\n            }\n            @if (vi.audioCodec) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.audio-codec' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.audioCodec }}</span>\n              </div>\n            }\n            @if (vi.frameRate) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.frame-rate' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.frameRate }} fps</span>\n              </div>\n            }\n          }\n        </div>\n      </div>\n    </div>\n  }\n\n  <!-- Picture metadata cards -->\n  @if (showPictureCards()) {\n    <div class=\"picture-cards\">\n      <!-- Picture Info -->\n      <div class=\"picture-card\">\n        <h4 class=\"picture-card-title\">\n          {{ 'shared-ui.document-viewer.picture-info' | translate }}\n        </h4>\n        <div class=\"picture-card-body\">\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.dimensions' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.width }} x {{ pictureInfo()!.height }}</span>\n          </div>\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.format' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.format }}</span>\n          </div>\n          @if (pictureInfo()!.colorSpace) {\n            <div class=\"info-row\">\n              <span class=\"info-label\">{{\n                'shared-ui.document-viewer.color-profile' | translate\n              }}</span>\n              <span class=\"info-value\">{{ pictureInfo()!.colorSpace }}</span>\n            </div>\n          }\n          @if (pictureInfo()!.depth) {\n            <div class=\"info-row\">\n              <span class=\"info-label\">{{\n                'shared-ui.document-viewer.bit-depth-per-channel' | translate\n              }}</span>\n              <span class=\"info-value\">{{ pictureInfo()!.depth }}</span>\n            </div>\n          }\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.weight' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.weight }}</span>\n          </div>\n        </div>\n      </div>\n\n      <!-- Additional Formats -->\n      @if (pictureViews().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">\n            {{ 'shared-ui.document-viewer.additional-formats' | translate }}\n          </h4>\n          <div class=\"picture-card-body\">\n            @for (view of pictureViews(); track view.title) {\n              <div class=\"format-row\">\n                <span class=\"format-name\">{{ view.title }}</span>\n                <span class=\"format-details\">\n                  {{ view.width }} x {{ view.height }}\n                  <span class=\"format-size\">{{ view.fileSize }}</span>\n                  <span class=\"format-type\">{{ view.format }}</span>\n                </span>\n                <button\n                  mat-icon-button\n                  class=\"format-download-btn\"\n                  [matTooltip]=\"\n                    'shared-ui.document-viewer.download-named' | translate: { name: view.title }\n                  \"\n                  [attr.aria-label]=\"\n                    'shared-ui.document-viewer.download-named' | translate: { name: view.title }\n                  \"\n                  (click)=\"formatDownload.emit(view.downloadUrl)\"\n                >\n                  <mat-icon>download</mat-icon>\n                </button>\n              </div>\n            }\n          </div>\n        </div>\n      }\n\n      <!-- EXIF -->\n      @if (exifEntries().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.exif' | translate }}</h4>\n          <div class=\"picture-card-body\">\n            @for (entry of exifEntries(); track entry.labelKey) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ entry.labelKey | translate }}</span>\n                <span class=\"info-value\">{{ entry.value }}</span>\n              </div>\n            }\n          </div>\n        </div>\n      }\n\n      <!-- IPTC -->\n      @if (iptcEntries().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.iptc' | translate }}</h4>\n          <div class=\"picture-card-body\">\n            @for (entry of iptcEntries(); track entry.labelKey) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ entry.labelKey | translate }}</span>\n                <span class=\"info-value\">{{ entry.value }}</span>\n              </div>\n            }\n          </div>\n        </div>\n      }\n    </div>\n  }\n</div>\n", styles: ["@charset \"UTF-8\";:host{--document-viewer-light-strip-surface: #ffffff;--document-viewer-on-light-strip: #333333;--document-viewer-muted-on-light-surface: #5c5f6b;--document-viewer-focus-on-light-surface: #0073e6;--document-viewer-error-on-light-surface: #b00020;display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.viewer-panel{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.viewer-content{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;min-height:0;background:#fafafa}.viewer-content.fit-real{align-items:flex-start;justify-content:flex-start}.viewer-content:has(.viewer-video-container){padding:8px 12px;align-items:stretch;overflow:hidden}.viewer-loading{display:flex;align-items:center;justify-content:center;flex:1}.viewer-image{max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 2px 12px #0000001a;transition:transform .2s ease;transform-origin:center center}.viewer-image.fit-real{max-width:none;max-height:none}.viewer-video-container{display:flex;flex:1;align-items:center;justify-content:center;width:100%;min-height:0;align-self:stretch}.viewer-video{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 2px 12px #0000001a;background:#000}.viewer-audio-wrapper{display:flex;flex-direction:column;align-items:center;gap:24px}.viewer-audio-wrapper .audio-icon{font-size:64px;width:64px;height:64px;color:#999}.viewer-audio{min-width:320px}.viewer-markdown-content{width:100%;max-width:800px;padding:32px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 1px 4px #00000014;font-size:15px;line-height:1.7;color:#333;overflow-y:auto;align-self:flex-start}:host ::ng-deep .viewer-markdown-content h1,:host ::ng-deep .viewer-markdown-content h2,:host ::ng-deep .viewer-markdown-content h3,:host ::ng-deep .viewer-markdown-content h4,:host ::ng-deep .viewer-markdown-content h5,:host ::ng-deep .viewer-markdown-content h6{margin-top:24px;margin-bottom:8px;font-weight:600}:host ::ng-deep .viewer-markdown-content h1{font-size:1.8em;border-bottom:1px solid #eee;padding-bottom:8px}:host ::ng-deep .viewer-markdown-content h2{font-size:1.5em;border-bottom:1px solid #eee;padding-bottom:6px}:host ::ng-deep .viewer-markdown-content p{margin:0 0 16px}:host ::ng-deep .viewer-markdown-content code{background:#f0f0f0;padding:2px 6px;border-radius:3px;font-size:.9em}:host ::ng-deep .viewer-markdown-content pre{background:#282c34;color:#abb2bf;padding:16px;border-radius:6px;overflow-x:auto;font-size:.9em;line-height:1.5}:host ::ng-deep .viewer-markdown-content pre code{background:transparent;padding:0;color:inherit}:host ::ng-deep .viewer-markdown-content blockquote{border-left:4px solid #ddd;margin:0 0 16px;padding:8px 16px;color:#666;background:#f9f9f9;border-radius:0 4px 4px 0}:host ::ng-deep .viewer-markdown-content ul,:host ::ng-deep .viewer-markdown-content ol{padding-left:24px;margin-bottom:16px}:host ::ng-deep .viewer-markdown-content img{max-width:100%;border-radius:4px}:host ::ng-deep .viewer-markdown-content table{border-collapse:collapse;width:100%;margin-bottom:16px}:host ::ng-deep .viewer-markdown-content th,:host ::ng-deep .viewer-markdown-content td{border:1px solid #ddd;padding:8px 12px;text-align:left}:host ::ng-deep .viewer-markdown-content th{background:#f5f5f5;font-weight:600}:host ::ng-deep .viewer-markdown-content a{color:#0073e6;text-decoration:none}:host ::ng-deep .viewer-markdown-content a:hover{text-decoration:underline}:host ::ng-deep .viewer-markdown-content hr{border:none;border-top:1px solid #eee;margin:24px 0}.viewer-preformatted{width:100%;max-width:900px;padding:24px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 1px 4px #00000014;font-family:SF Mono,Fira Code,Consolas,monospace;font-size:13px;line-height:1.6;color:#333;overflow:auto;white-space:pre-wrap;word-wrap:break-word;align-self:flex-start}.viewer-preformatted.viewer-xml{color:#0d47a1}.viewer-iframe{width:100%;height:100%;border:none;border-radius:4px}.viewer-html-frame{background:#fff}.arender-frame{border-radius:0;background:#fff}.viewer-placeholder{display:flex;flex-direction:column;align-items:center;gap:12px;color:#999}.viewer-placeholder .placeholder-icon{font-size:64px;width:64px;height:64px}.viewer-placeholder p{font-size:14px;margin:0}.viewer-placeholder .mime-label{font-size:12px;color:#bbb}.viewer-storyboard{display:flex;gap:8px;padding:8px 12px;overflow-x:auto;background:#1a1a1a;flex-shrink:0;scrollbar-width:thin;scrollbar-color:#555 #1a1a1a}.storyboard-item{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;border:2px solid transparent;border-radius:4px;padding:4px;background:none;transition:border-color .15s;flex-shrink:0}.storyboard-item:hover{border-color:#0073e6}.storyboard-thumb{width:120px;height:68px;object-fit:cover;border-radius:2px;background:#333}.storyboard-time{font-size:11px;color:#aaa;font-family:monospace}.viewer-toolbar{display:flex;align-items:center;justify-content:center;gap:2px;padding:4px 0;background:#f0f0f0;border-top:1px solid #e0e0e0;flex-shrink:0;overflow-x:auto}.viewer-toolbar button{color:#555;width:36px;height:36px;line-height:36px}.viewer-toolbar button mat-icon{font-size:20px;width:20px;height:20px}.viewer-toolbar button.mat-mdc-icon-button:focus{outline:2px solid var(--document-viewer-focus-on-light-surface)!important;outline-offset:2px}.viewer-footer{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-top:1px solid var(--mat-sys-outline-variant, #eee);background:var(--document-viewer-light-strip-surface);flex-shrink:0}.viewer-footer-info{display:flex;flex-direction:column;min-width:0}.file-name{font-size:13px;color:var(--document-viewer-on-light-strip);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-size{font-size:11px;color:var(--document-viewer-muted-on-light-surface)}.viewer-footer-actions{display:flex;gap:0;flex-shrink:0}.viewer-footer-actions button{color:var(--document-viewer-muted-on-light-surface)}.viewer-footer-actions button.active-toggle{color:var(--mat-sys-primary, #0073e6)}.viewer-footer-actions button.footer-remove-btn{color:var(--document-viewer-error-on-light-surface)}.viewer-footer-actions button.mat-mdc-icon-button:focus{outline:2px solid var(--document-viewer-focus-on-light-surface)!important;outline-offset:2px}.picture-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0;border-top:1px solid var(--mat-sys-outline-variant, #e0e0e0);background:var(--document-viewer-light-strip-surface);flex-shrink:0}.picture-card{padding:16px 20px;border-right:1px solid var(--mat-sys-outline-variant, #eee)}.picture-card:last-child{border-right:none}.picture-card-title{font-size:13px;font-weight:600;color:var(--document-viewer-on-light-strip);margin:0 0 12px;text-transform:uppercase;letter-spacing:.3px}.picture-card-body{display:flex;flex-direction:column;gap:8px}.info-row{display:flex;gap:12px;align-items:baseline}.info-label{font-size:12px;color:var(--document-viewer-muted-on-light-surface);min-width:0;white-space:nowrap}.info-value{font-size:13px;color:var(--document-viewer-on-light-strip);font-weight:500}.format-row{display:flex;align-items:center;gap:8px;padding:4px 0}.format-name{font-size:12px;color:var(--document-viewer-on-light-strip);font-weight:500;min-width:100px;white-space:nowrap}.format-details{font-size:12px;color:var(--document-viewer-muted-on-light-surface);flex:1;display:flex;align-items:center;gap:8px;white-space:nowrap}.format-size{color:var(--document-viewer-muted-on-light-surface)}.format-type{color:var(--document-viewer-muted-on-light-surface);text-transform:uppercase;font-size:11px}.format-download-btn{width:28px!important;height:28px!important;line-height:28px!important;flex-shrink:0}.format-download-btn mat-icon{font-size:18px!important;width:18px!important;height:18px!important;color:var(--document-viewer-muted-on-light-surface)}.format-download-btn.mat-mdc-icon-button:focus{outline:2px solid var(--document-viewer-focus-on-light-surface)!important;outline-offset:2px}\n"], dependencies: [{ kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i3$1.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "directive", type: CdkAriaLive, selector: "[cdkAriaLive]", inputs: ["cdkAriaLive", "cdkAriaLiveDuration"], exportAs: ["cdkAriaLive"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DocumentViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-document-viewer', standalone: true, imports: [
                        NxsSpinnerComponent,
                        TranslatePipe,
                        MatIconModule,
                        MatButtonModule,
                        MatTooltipModule,
                        CdkAriaLive,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"viewer-panel\">\n  <!-- Content area -->\n  <div class=\"viewer-content\" [class.fit-real]=\"fitMode() === 'real' && contentType() === 'image'\">\n    @if (loading()) {\n      <div class=\"viewer-loading\">\n        <nxs-spinner diameter=\"36\" [label]=\"'shared-ui.document-viewer.loading' | translate\" />\n      </div>\n    } @else if (annotationsTab() && !arenderAvailable()) {\n      <div class=\"viewer-placeholder\">\n        <mat-icon class=\"placeholder-icon\">edit_note</mat-icon>\n        <p>{{ 'shared-ui.document-viewer.annotations-are-not-available-for-this' | translate }}</p>\n        <span class=\"mime-label\">{{\n          'shared-ui.document-viewer.use-the-view-tab-for-the' | translate\n        }}</span>\n      </div>\n    } @else if (showARenderViewer()) {\n      @for (rid of [arenderReloadId()]; track rid) {\n        <iframe\n          [src]=\"arenderUrl()\"\n          [title]=\"'shared-ui.document-viewer.annotations-frame' | translate: { name: fileName() }\"\n          class=\"viewer-iframe arender-frame\"\n          allow=\"fullscreen\"\n        ></iframe>\n      }\n    } @else {\n      @switch (contentType()) {\n        @case ('image') {\n          <img\n            [src]=\"blobUrl()\"\n            [alt]=\"fileName()\"\n            class=\"viewer-image\"\n            [class.fit-real]=\"fitMode() === 'real'\"\n            [style.transform]=\"transform()\"\n          />\n        }\n        @case ('video') {\n          <div class=\"viewer-video-container\">\n            <video #videoPlayer controls class=\"viewer-video\" [poster]=\"posterUrl()\">\n              @if (videoSources().length > 0) {\n                @for (src of videoSources(); track src.url) {\n                  <source [src]=\"src.url\" [type]=\"src.mimeType\" />\n                }\n              } @else {\n                <source [src]=\"rawBlobUrl()\" />\n              }\n              {{ 'ui.document-viewer.your-browser-does-not-support-video' | translate }}\n            </video>\n          </div>\n        }\n        @case ('audio') {\n          <div class=\"viewer-audio-wrapper\">\n            <mat-icon class=\"audio-icon\">audiotrack</mat-icon>\n            <audio [src]=\"rawBlobUrl()\" controls class=\"viewer-audio\"></audio>\n          </div>\n        }\n        @case ('markdown') {\n          <div class=\"viewer-markdown-content\" [innerHTML]=\"noteHtml()\"></div>\n        }\n        @case ('html') {\n          <iframe\n            class=\"viewer-iframe viewer-html-frame\"\n            [srcdoc]=\"noteContent()\"\n            [title]=\"'shared-ui.document-viewer.note-frame' | translate: { name: fileName() }\"\n            sandbox=\"allow-same-origin\"\n          ></iframe>\n        }\n        @case ('xml') {\n          <pre class=\"viewer-preformatted viewer-xml\">{{ noteContent() }}</pre>\n        }\n        @case ('text') {\n          <pre class=\"viewer-preformatted\">{{ noteContent() }}</pre>\n        }\n        @case ('pdf') {\n          <iframe\n            [src]=\"blobUrl()\"\n            [title]=\"'shared-ui.document-viewer.pdf-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @case ('pdfRendition') {\n          <iframe\n            [src]=\"blobUrl()\"\n            [title]=\"'shared-ui.document-viewer.pdf-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @case ('preview') {\n          <iframe\n            [src]=\"previewUrl()\"\n            [title]=\"'shared-ui.document-viewer.preview-frame' | translate: { name: fileName() }\"\n            class=\"viewer-iframe\"\n          ></iframe>\n        }\n        @default {\n          <div class=\"viewer-placeholder\">\n            <mat-icon class=\"placeholder-icon\">insert_drive_file</mat-icon>\n            <p>{{ 'shared-ui.document-viewer.preview-not-available' | translate }}</p>\n            @if (mimeType()) {\n              <span class=\"mime-label\">{{ mimeType() }}</span>\n            }\n          </div>\n        }\n      }\n    }\n  </div>\n\n  <!-- Video storyboard -->\n  @if (showVideoStoryboard()) {\n    <div class=\"viewer-storyboard\">\n      @for (item of storyboard(); track item.timecode) {\n        <button\n          type=\"button\"\n          class=\"storyboard-item\"\n          [matTooltip]=\"item.label || formatTimecode(item.timecode)\"\n          (click)=\"seekTo(item.timecode)\"\n        >\n          <img [src]=\"item.thumbnailUrl\" [alt]=\"item.label\" class=\"storyboard-thumb\" />\n          <span class=\"storyboard-time\">{{ formatTimecode(item.timecode) }}</span>\n        </button>\n      }\n    </div>\n  }\n\n  <!-- Image toolbar (zoom/rotate) -->\n  @if (showImageToolbar()) {\n    <div class=\"viewer-toolbar\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.zoom-in' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.zoom-in' | translate\"\n        (click)=\"zoomIn()\"\n      >\n        <mat-icon>zoom_in</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"\n          fitMode() === 'width' ? ('ui.actual-size' | translate) : ('ui.fit-to-viewer' | translate)\n        \"\n        [attr.aria-label]=\"'shared-ui.document-viewer.toggle-fit' | translate\"\n        (click)=\"toggleFit()\"\n      >\n        <mat-icon>{{ fitMode() === 'width' ? 'crop_free' : 'fit_screen' }}</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.zoom-out' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.zoom-out' | translate\"\n        (click)=\"zoomOut()\"\n      >\n        <mat-icon>zoom_out</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.rotate-left' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.rotate-left' | translate\"\n        (click)=\"rotateLeft()\"\n      >\n        <mat-icon>rotate_left</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.rotate-right' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.rotate-right' | translate\"\n        (click)=\"rotateRight()\"\n      >\n        <mat-icon>rotate_right</mat-icon>\n      </button>\n    </div>\n  }\n\n  <!-- Footer -->\n  <div class=\"viewer-footer\">\n    <div class=\"viewer-footer-info\">\n      <span class=\"file-name\">{{ fileName() }}</span>\n      @if (fileSize()) {\n        <span class=\"file-size\">{{ fileSize() }}</span>\n      }\n    </div>\n    <div class=\"viewer-footer-actions\">\n      @if (!annotationsTab()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.open-with-nuxeo-drive' | translate\"\n          [attr.aria-label]=\"'shared-ui.document-viewer.open-with-nuxeo-drive' | translate\"\n          (click)=\"openWithDriveClicked.emit()\"\n        >\n          <mat-icon>cloud_sync</mat-icon>\n        </button>\n      }\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.preview' | translate\"\n        (click)=\"previewClicked.emit()\"\n      >\n        <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n          'shared-ui.document-viewer.preview' | translate\n        }}</span>\n        <mat-icon aria-hidden=\"true\">visibility</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        [matTooltip]=\"'shared-ui.document-viewer.download' | translate\"\n        [attr.aria-label]=\"'shared-ui.document-viewer.download' | translate\"\n        (click)=\"downloadClicked.emit()\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n      @if (showMainFileControls()) {\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.replace-main-file' | translate\"\n          [attr.aria-label]=\"'shared-ui.document-viewer.replace-main-file' | translate\"\n          [disabled]=\"mainFileActionInProgress() === 'replace-main'\"\n          (click)=\"replaceMainFileClicked.emit()\"\n        >\n          <mat-icon>find_replace</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          [matTooltip]=\"'shared-ui.document-viewer.remove-main-file' | translate\"\n          class=\"footer-remove-btn\"\n          [disabled]=\"mainFileActionInProgress() === 'remove-main'\"\n          (click)=\"removeMainFileClicked.emit()\"\n        >\n          <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n            'shared-ui.document-viewer.remove-main-file' | translate\n          }}</span>\n          <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n        </button>\n      }\n    </div>\n  </div>\n\n  <!-- Video metadata card -->\n  @if (showVideoInfoCard()) {\n    <div class=\"picture-cards\">\n      <div class=\"picture-card\">\n        <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.video-info' | translate }}</h4>\n        <div class=\"picture-card-body\">\n          @if (videoInfo(); as vi) {\n            @if (isFiniteNumber(vi.duration)) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.duration' | translate\n                }}</span>\n                <span class=\"info-value\">{{ formatDuration(vi.duration) }}</span>\n              </div>\n            }\n            @if (vi.width && vi.height) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.resolution' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.width }} \u00D7 {{ vi.height }}</span>\n              </div>\n            }\n            @if (vi.format) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ 'shared-ui.document-viewer.format' | translate }}</span>\n                <span class=\"info-value\">{{ vi.format }}</span>\n              </div>\n            }\n            @if (vi.videoCodec) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.video-codec' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.videoCodec }}</span>\n              </div>\n            }\n            @if (vi.audioCodec) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.audio-codec' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.audioCodec }}</span>\n              </div>\n            }\n            @if (vi.frameRate) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{\n                  'shared-ui.document-viewer.frame-rate' | translate\n                }}</span>\n                <span class=\"info-value\">{{ vi.frameRate }} fps</span>\n              </div>\n            }\n          }\n        </div>\n      </div>\n    </div>\n  }\n\n  <!-- Picture metadata cards -->\n  @if (showPictureCards()) {\n    <div class=\"picture-cards\">\n      <!-- Picture Info -->\n      <div class=\"picture-card\">\n        <h4 class=\"picture-card-title\">\n          {{ 'shared-ui.document-viewer.picture-info' | translate }}\n        </h4>\n        <div class=\"picture-card-body\">\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.dimensions' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.width }} x {{ pictureInfo()!.height }}</span>\n          </div>\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.format' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.format }}</span>\n          </div>\n          @if (pictureInfo()!.colorSpace) {\n            <div class=\"info-row\">\n              <span class=\"info-label\">{{\n                'shared-ui.document-viewer.color-profile' | translate\n              }}</span>\n              <span class=\"info-value\">{{ pictureInfo()!.colorSpace }}</span>\n            </div>\n          }\n          @if (pictureInfo()!.depth) {\n            <div class=\"info-row\">\n              <span class=\"info-label\">{{\n                'shared-ui.document-viewer.bit-depth-per-channel' | translate\n              }}</span>\n              <span class=\"info-value\">{{ pictureInfo()!.depth }}</span>\n            </div>\n          }\n          <div class=\"info-row\">\n            <span class=\"info-label\">{{ 'shared-ui.document-viewer.weight' | translate }}</span>\n            <span class=\"info-value\">{{ pictureInfo()!.weight }}</span>\n          </div>\n        </div>\n      </div>\n\n      <!-- Additional Formats -->\n      @if (pictureViews().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">\n            {{ 'shared-ui.document-viewer.additional-formats' | translate }}\n          </h4>\n          <div class=\"picture-card-body\">\n            @for (view of pictureViews(); track view.title) {\n              <div class=\"format-row\">\n                <span class=\"format-name\">{{ view.title }}</span>\n                <span class=\"format-details\">\n                  {{ view.width }} x {{ view.height }}\n                  <span class=\"format-size\">{{ view.fileSize }}</span>\n                  <span class=\"format-type\">{{ view.format }}</span>\n                </span>\n                <button\n                  mat-icon-button\n                  class=\"format-download-btn\"\n                  [matTooltip]=\"\n                    'shared-ui.document-viewer.download-named' | translate: { name: view.title }\n                  \"\n                  [attr.aria-label]=\"\n                    'shared-ui.document-viewer.download-named' | translate: { name: view.title }\n                  \"\n                  (click)=\"formatDownload.emit(view.downloadUrl)\"\n                >\n                  <mat-icon>download</mat-icon>\n                </button>\n              </div>\n            }\n          </div>\n        </div>\n      }\n\n      <!-- EXIF -->\n      @if (exifEntries().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.exif' | translate }}</h4>\n          <div class=\"picture-card-body\">\n            @for (entry of exifEntries(); track entry.labelKey) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ entry.labelKey | translate }}</span>\n                <span class=\"info-value\">{{ entry.value }}</span>\n              </div>\n            }\n          </div>\n        </div>\n      }\n\n      <!-- IPTC -->\n      @if (iptcEntries().length > 0) {\n        <div class=\"picture-card\">\n          <h4 class=\"picture-card-title\">{{ 'shared-ui.document-viewer.iptc' | translate }}</h4>\n          <div class=\"picture-card-body\">\n            @for (entry of iptcEntries(); track entry.labelKey) {\n              <div class=\"info-row\">\n                <span class=\"info-label\">{{ entry.labelKey | translate }}</span>\n                <span class=\"info-value\">{{ entry.value }}</span>\n              </div>\n            }\n          </div>\n        </div>\n      }\n    </div>\n  }\n</div>\n", styles: ["@charset \"UTF-8\";:host{--document-viewer-light-strip-surface: #ffffff;--document-viewer-on-light-strip: #333333;--document-viewer-muted-on-light-surface: #5c5f6b;--document-viewer-focus-on-light-surface: #0073e6;--document-viewer-error-on-light-surface: #b00020;display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.viewer-panel{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.viewer-content{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;overflow:auto;min-height:0;background:#fafafa}.viewer-content.fit-real{align-items:flex-start;justify-content:flex-start}.viewer-content:has(.viewer-video-container){padding:8px 12px;align-items:stretch;overflow:hidden}.viewer-loading{display:flex;align-items:center;justify-content:center;flex:1}.viewer-image{max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 2px 12px #0000001a;transition:transform .2s ease;transform-origin:center center}.viewer-image.fit-real{max-width:none;max-height:none}.viewer-video-container{display:flex;flex:1;align-items:center;justify-content:center;width:100%;min-height:0;align-self:stretch}.viewer-video{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;box-shadow:0 2px 12px #0000001a;background:#000}.viewer-audio-wrapper{display:flex;flex-direction:column;align-items:center;gap:24px}.viewer-audio-wrapper .audio-icon{font-size:64px;width:64px;height:64px;color:#999}.viewer-audio{min-width:320px}.viewer-markdown-content{width:100%;max-width:800px;padding:32px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 1px 4px #00000014;font-size:15px;line-height:1.7;color:#333;overflow-y:auto;align-self:flex-start}:host ::ng-deep .viewer-markdown-content h1,:host ::ng-deep .viewer-markdown-content h2,:host ::ng-deep .viewer-markdown-content h3,:host ::ng-deep .viewer-markdown-content h4,:host ::ng-deep .viewer-markdown-content h5,:host ::ng-deep .viewer-markdown-content h6{margin-top:24px;margin-bottom:8px;font-weight:600}:host ::ng-deep .viewer-markdown-content h1{font-size:1.8em;border-bottom:1px solid #eee;padding-bottom:8px}:host ::ng-deep .viewer-markdown-content h2{font-size:1.5em;border-bottom:1px solid #eee;padding-bottom:6px}:host ::ng-deep .viewer-markdown-content p{margin:0 0 16px}:host ::ng-deep .viewer-markdown-content code{background:#f0f0f0;padding:2px 6px;border-radius:3px;font-size:.9em}:host ::ng-deep .viewer-markdown-content pre{background:#282c34;color:#abb2bf;padding:16px;border-radius:6px;overflow-x:auto;font-size:.9em;line-height:1.5}:host ::ng-deep .viewer-markdown-content pre code{background:transparent;padding:0;color:inherit}:host ::ng-deep .viewer-markdown-content blockquote{border-left:4px solid #ddd;margin:0 0 16px;padding:8px 16px;color:#666;background:#f9f9f9;border-radius:0 4px 4px 0}:host ::ng-deep .viewer-markdown-content ul,:host ::ng-deep .viewer-markdown-content ol{padding-left:24px;margin-bottom:16px}:host ::ng-deep .viewer-markdown-content img{max-width:100%;border-radius:4px}:host ::ng-deep .viewer-markdown-content table{border-collapse:collapse;width:100%;margin-bottom:16px}:host ::ng-deep .viewer-markdown-content th,:host ::ng-deep .viewer-markdown-content td{border:1px solid #ddd;padding:8px 12px;text-align:left}:host ::ng-deep .viewer-markdown-content th{background:#f5f5f5;font-weight:600}:host ::ng-deep .viewer-markdown-content a{color:#0073e6;text-decoration:none}:host ::ng-deep .viewer-markdown-content a:hover{text-decoration:underline}:host ::ng-deep .viewer-markdown-content hr{border:none;border-top:1px solid #eee;margin:24px 0}.viewer-preformatted{width:100%;max-width:900px;padding:24px;margin:0 auto;background:#fff;border-radius:8px;box-shadow:0 1px 4px #00000014;font-family:SF Mono,Fira Code,Consolas,monospace;font-size:13px;line-height:1.6;color:#333;overflow:auto;white-space:pre-wrap;word-wrap:break-word;align-self:flex-start}.viewer-preformatted.viewer-xml{color:#0d47a1}.viewer-iframe{width:100%;height:100%;border:none;border-radius:4px}.viewer-html-frame{background:#fff}.arender-frame{border-radius:0;background:#fff}.viewer-placeholder{display:flex;flex-direction:column;align-items:center;gap:12px;color:#999}.viewer-placeholder .placeholder-icon{font-size:64px;width:64px;height:64px}.viewer-placeholder p{font-size:14px;margin:0}.viewer-placeholder .mime-label{font-size:12px;color:#bbb}.viewer-storyboard{display:flex;gap:8px;padding:8px 12px;overflow-x:auto;background:#1a1a1a;flex-shrink:0;scrollbar-width:thin;scrollbar-color:#555 #1a1a1a}.storyboard-item{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;border:2px solid transparent;border-radius:4px;padding:4px;background:none;transition:border-color .15s;flex-shrink:0}.storyboard-item:hover{border-color:#0073e6}.storyboard-thumb{width:120px;height:68px;object-fit:cover;border-radius:2px;background:#333}.storyboard-time{font-size:11px;color:#aaa;font-family:monospace}.viewer-toolbar{display:flex;align-items:center;justify-content:center;gap:2px;padding:4px 0;background:#f0f0f0;border-top:1px solid #e0e0e0;flex-shrink:0;overflow-x:auto}.viewer-toolbar button{color:#555;width:36px;height:36px;line-height:36px}.viewer-toolbar button mat-icon{font-size:20px;width:20px;height:20px}.viewer-toolbar button.mat-mdc-icon-button:focus{outline:2px solid var(--document-viewer-focus-on-light-surface)!important;outline-offset:2px}.viewer-footer{display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-top:1px solid var(--mat-sys-outline-variant, #eee);background:var(--document-viewer-light-strip-surface);flex-shrink:0}.viewer-footer-info{display:flex;flex-direction:column;min-width:0}.file-name{font-size:13px;color:var(--document-viewer-on-light-strip);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.file-size{font-size:11px;color:var(--document-viewer-muted-on-light-surface)}.viewer-footer-actions{display:flex;gap:0;flex-shrink:0}.viewer-footer-actions button{color:var(--document-viewer-muted-on-light-surface)}.viewer-footer-actions button.active-toggle{color:var(--mat-sys-primary, #0073e6)}.viewer-footer-actions button.footer-remove-btn{color:var(--document-viewer-error-on-light-surface)}.viewer-footer-actions button.mat-mdc-icon-button:focus{outline:2px solid var(--document-viewer-focus-on-light-surface)!important;outline-offset:2px}.picture-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0;border-top:1px solid var(--mat-sys-outline-variant, #e0e0e0);background:var(--document-viewer-light-strip-surface);flex-shrink:0}.picture-card{padding:16px 20px;border-right:1px solid var(--mat-sys-outline-variant, #eee)}.picture-card:last-child{border-right:none}.picture-card-title{font-size:13px;font-weight:600;color:var(--document-viewer-on-light-strip);margin:0 0 12px;text-transform:uppercase;letter-spacing:.3px}.picture-card-body{display:flex;flex-direction:column;gap:8px}.info-row{display:flex;gap:12px;align-items:baseline}.info-label{font-size:12px;color:var(--document-viewer-muted-on-light-surface);min-width:0;white-space:nowrap}.info-value{font-size:13px;color:var(--document-viewer-on-light-strip);font-weight:500}.format-row{display:flex;align-items:center;gap:8px;padding:4px 0}.format-name{font-size:12px;color:var(--document-viewer-on-light-strip);font-weight:500;min-width:100px;white-space:nowrap}.format-details{font-size:12px;color:var(--document-viewer-muted-on-light-surface);flex:1;display:flex;align-items:center;gap:8px;white-space:nowrap}.format-size{color:var(--document-viewer-muted-on-light-surface)}.format-type{color:var(--document-viewer-muted-on-light-surface);text-transform:uppercase;font-size:11px}.format-download-btn{width:28px!important;height:28px!important;line-height:28px!important;flex-shrink:0}.format-download-btn mat-icon{font-size:18px!important;width:18px!important;height:18px!important;color:var(--document-viewer-muted-on-light-surface)}.format-download-btn.mat-mdc-icon-button:focus{outline:2px solid var(--document-viewer-focus-on-light-surface)!important;outline-offset:2px}\n"] }]
        }], propDecorators: { blobUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "blobUrl", required: false }] }], rawBlobUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "rawBlobUrl", required: true }] }], blobType: [{ type: i0.Input, args: [{ isSignal: true, alias: "blobType", required: true }] }], mimeType: [{ type: i0.Input, args: [{ isSignal: true, alias: "mimeType", required: false }] }], fileName: [{ type: i0.Input, args: [{ isSignal: true, alias: "fileName", required: false }] }], fileSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "fileSize", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], noteContent: [{ type: i0.Input, args: [{ isSignal: true, alias: "noteContent", required: false }] }], noteHtml: [{ type: i0.Input, args: [{ isSignal: true, alias: "noteHtml", required: false }] }], videoSources: [{ type: i0.Input, args: [{ isSignal: true, alias: "videoSources", required: false }] }], storyboard: [{ type: i0.Input, args: [{ isSignal: true, alias: "storyboard", required: false }] }], posterUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "posterUrl", required: false }] }], hasPdfRendition: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasPdfRendition", required: false }] }], previewUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "previewUrl", required: false }] }], pictureInfo: [{ type: i0.Input, args: [{ isSignal: true, alias: "pictureInfo", required: false }] }], pictureViews: [{ type: i0.Input, args: [{ isSignal: true, alias: "pictureViews", required: false }] }], exifData: [{ type: i0.Input, args: [{ isSignal: true, alias: "exifData", required: false }] }], iptcData: [{ type: i0.Input, args: [{ isSignal: true, alias: "iptcData", required: false }] }], videoInfo: [{ type: i0.Input, args: [{ isSignal: true, alias: "videoInfo", required: false }] }], arenderUrl: [{ type: i0.Input, args: [{ isSignal: true, alias: "arenderUrl", required: false }] }], arenderReloadId: [{ type: i0.Input, args: [{ isSignal: true, alias: "arenderReloadId", required: false }] }], viewerDocUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "viewerDocUid", required: false }] }], annotationsTab: [{ type: i0.Input, args: [{ isSignal: true, alias: "annotationsTab", required: false }] }], showMainFileControls: [{ type: i0.Input, args: [{ isSignal: true, alias: "showMainFileControls", required: false }] }], mainFileActionInProgress: [{ type: i0.Input, args: [{ isSignal: true, alias: "mainFileActionInProgress", required: false }] }], downloadClicked: [{ type: i0.Output, args: ["downloadClicked"] }], openWithDriveClicked: [{ type: i0.Output, args: ["openWithDriveClicked"] }], previewClicked: [{ type: i0.Output, args: ["previewClicked"] }], replaceMainFileClicked: [{ type: i0.Output, args: ["replaceMainFileClicked"] }], removeMainFileClicked: [{ type: i0.Output, args: ["removeMainFileClicked"] }], storyboardSeek: [{ type: i0.Output, args: ["storyboardSeek"] }], formatDownload: [{ type: i0.Output, args: ["formatDownload"] }], videoRef: [{ type: i0.ViewChild, args: ['videoPlayer', { isSignal: true }] }] } });

class ExportDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    exporting = signal(null, ...(ngDevMode ? [{ debugName: "exporting" }] : []));
    options = [
        { type: 'thumbnail', labelKey: 'rendition.thumbnail', label: 'Thumbnail', icon: 'image' },
        { type: 'pdf', labelKey: 'rendition.pdf', label: 'PDF', icon: 'picture_as_pdf' },
        { type: 'zip', labelKey: 'rendition.zip', label: 'ZIP Export', icon: 'folder_zip' },
        { type: 'xml', labelKey: 'rendition.xml', label: 'XML Export', icon: 'code' },
    ];
    onExport(type) {
        if (this.exporting())
            return;
        this.exporting.set(type);
        const extMap = {
            thumbnail: 'png',
            pdf: 'pdf',
            zip: 'zip',
            xml: 'xml',
        };
        const ext = extMap[type];
        const filename = `${this.data.documentTitle}.${ext}`;
        this.data.exportFn(type, this.data.documentUid).subscribe({
            next: (blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                this.exporting.set(null);
                this.dialogRef.close(true);
            },
            error: () => {
                this.exporting.set(null);
            },
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExportDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: ExportDialogComponent, isStandalone: true, selector: "lib-export-dialog", ngImport: i0, template: "<h2 mat-dialog-title>{{ 'shared-ui.export-dialog.export' | translate }}</h2>\n\n<mat-dialog-content>\n  @for (option of options; track option.type) {\n    <button class=\"export-option\" [disabled]=\"exporting()\" (click)=\"onExport(option.type)\">\n      <mat-icon class=\"export-option-icon\">{{ option.icon }}</mat-icon>\n      <span class=\"export-option-label\">{{ option | descriptorLabel }}</span>\n      @if (exporting() === option.type) {\n        <mat-spinner diameter=\"18\" class=\"export-spinner\" />\n      }\n    </button>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close [disabled]=\"!!exporting()\">\n    {{ 'shared-ui.export-dialog.cancel' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:400px}mat-dialog-content{display:flex;flex-direction:column;gap:4px;padding:16px 24px!important}.export-option{display:flex;align-items:center;gap:16px;padding:14px 16px;border:none;background:none;cursor:pointer;border-radius:6px;transition:background .15s;width:100%;text-align:left}.export-option:hover:not(:disabled){background:var(--mat-sys-surface-container-low)}.export-option:disabled{opacity:.6;cursor:default}.export-option-icon{font-size:22px;width:22px;height:22px;color:var(--mat-sys-on-surface-variant)}.export-option-label{font-size:14px;color:var(--mat-sys-primary);font-weight:500}.export-spinner{margin-left:auto}mat-dialog-actions{padding:8px 24px 16px}\n"], dependencies: [{ kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatProgressSpinnerModule }, { kind: "component", type: i4.MatProgressSpinner, selector: "mat-progress-spinner, mat-spinner", inputs: ["color", "mode", "value", "diameter", "strokeWidth"], exportAs: ["matProgressSpinner"] }, { kind: "pipe", type: DescriptorLabelPipe, name: "descriptorLabel" }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ExportDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-export-dialog', standalone: true, imports: [
                        DescriptorLabelPipe,
                        TranslatePipe,
                        MatDialogModule,
                        MatButtonModule,
                        MatIconModule,
                        MatProgressSpinnerModule,
                    ], template: "<h2 mat-dialog-title>{{ 'shared-ui.export-dialog.export' | translate }}</h2>\n\n<mat-dialog-content>\n  @for (option of options; track option.type) {\n    <button class=\"export-option\" [disabled]=\"exporting()\" (click)=\"onExport(option.type)\">\n      <mat-icon class=\"export-option-icon\">{{ option.icon }}</mat-icon>\n      <span class=\"export-option-label\">{{ option | descriptorLabel }}</span>\n      @if (exporting() === option.type) {\n        <mat-spinner diameter=\"18\" class=\"export-spinner\" />\n      }\n    </button>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close [disabled]=\"!!exporting()\">\n    {{ 'shared-ui.export-dialog.cancel' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:400px}mat-dialog-content{display:flex;flex-direction:column;gap:4px;padding:16px 24px!important}.export-option{display:flex;align-items:center;gap:16px;padding:14px 16px;border:none;background:none;cursor:pointer;border-radius:6px;transition:background .15s;width:100%;text-align:left}.export-option:hover:not(:disabled){background:var(--mat-sys-surface-container-low)}.export-option:disabled{opacity:.6;cursor:default}.export-option-icon{font-size:22px;width:22px;height:22px;color:var(--mat-sys-on-surface-variant)}.export-option-label{font-size:14px;color:var(--mat-sys-primary);font-weight:500}.export-spinner{margin-left:auto}mat-dialog-actions{padding:8px 24px 16px}\n"] }]
        }] });

const SAVED_SEARCH_DIALOG_OPTIONS = {
    autoFocus: true,
};
class SavedSearchDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
    name = signal(this.data.initialValue ?? '', ...(ngDevMode ? [{ debugName: "name" }] : []));
    /**
     * A saved search is a document named after its title, and a document name cannot hold a `/` —
     * the server answers 400. Web UI's save dialog says so the same way (`searchForm.savePopup.error`).
     */
    hasSlash = () => this.name().includes('/');
    canSave = () => this.name().trim().length > 0 && !this.hasSlash();
    onInput(value) {
        this.name.set(value);
    }
    save() {
        if (!this.canSave())
            return;
        this.dialogRef.close(this.name().trim());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SavedSearchDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: SavedSearchDialogComponent, isStandalone: true, selector: "lib-saved-search-dialog", ngImport: i0, template: "<h2 mat-dialog-title>{{ data.title || ('ui.saved-search' | translate) }}</h2>\n\n<mat-dialog-content>\n  <input\n    class=\"saved-search-input\"\n    type=\"text\"\n    [attr.aria-label]=\"data.title || ('ui.saved-search' | translate)\"\n    [value]=\"name()\"\n    [attr.aria-invalid]=\"hasSlash()\"\n    [attr.aria-describedby]=\"hasSlash() ? 'saved-search-dialog-error' : null\"\n    [placeholder]=\"data.placeholder || ('ui.enter-a-name-for-your-saved' | translate)\"\n    (input)=\"onInput($any($event.target).value)\"\n    (keydown.enter)=\"save()\"\n  />\n  @if (hasSlash()) {\n    <p class=\"saved-search-error\" id=\"saved-search-dialog-error\" role=\"alert\">\n      {{ 'shared-ui.saved-search-dialog.no-slash' | translate }}\n    </p>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-stroked-button type=\"button\" (click)=\"dialogRef.close()\">\n    {{ 'shared-ui.saved-search-dialog.cancel' | translate }}\n  </button>\n  <button mat-flat-button color=\"primary\" type=\"button\" [disabled]=\"!canSave()\" (click)=\"save()\">\n    {{ 'shared-ui.saved-search-dialog.save' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;width:min(95vw,clamp(320px,50vw,520px));max-width:95vw}mat-dialog-content{padding:8px clamp(12px,4vw,24px) 16px!important;overflow:visible!important}.saved-search-input{display:block;width:100%;min-width:0;border:1px solid #d0d5dd;border-radius:8px;padding:10px 12px;font:inherit;color:#101828;outline:none;box-sizing:border-box}.saved-search-input:focus{border-color:#5c6bc0}.saved-search-error{margin:6px 0 0;color:var(--mat-sys-error, currentColor);font:var(--mat-sys-body-small, inherit)}mat-dialog-actions{padding:16px 24px 20px;flex-wrap:wrap;row-gap:8px}\n"], dependencies: [{ kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: SavedSearchDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-saved-search-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule], template: "<h2 mat-dialog-title>{{ data.title || ('ui.saved-search' | translate) }}</h2>\n\n<mat-dialog-content>\n  <input\n    class=\"saved-search-input\"\n    type=\"text\"\n    [attr.aria-label]=\"data.title || ('ui.saved-search' | translate)\"\n    [value]=\"name()\"\n    [attr.aria-invalid]=\"hasSlash()\"\n    [attr.aria-describedby]=\"hasSlash() ? 'saved-search-dialog-error' : null\"\n    [placeholder]=\"data.placeholder || ('ui.enter-a-name-for-your-saved' | translate)\"\n    (input)=\"onInput($any($event.target).value)\"\n    (keydown.enter)=\"save()\"\n  />\n  @if (hasSlash()) {\n    <p class=\"saved-search-error\" id=\"saved-search-dialog-error\" role=\"alert\">\n      {{ 'shared-ui.saved-search-dialog.no-slash' | translate }}\n    </p>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-stroked-button type=\"button\" (click)=\"dialogRef.close()\">\n    {{ 'shared-ui.saved-search-dialog.cancel' | translate }}\n  </button>\n  <button mat-flat-button color=\"primary\" type=\"button\" [disabled]=\"!canSave()\" (click)=\"save()\">\n    {{ 'shared-ui.saved-search-dialog.save' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;width:min(95vw,clamp(320px,50vw,520px));max-width:95vw}mat-dialog-content{padding:8px clamp(12px,4vw,24px) 16px!important;overflow:visible!important}.saved-search-input{display:block;width:100%;min-width:0;border:1px solid #d0d5dd;border-radius:8px;padding:10px 12px;font:inherit;color:#101828;outline:none;box-sizing:border-box}.saved-search-input:focus{border-color:#5c6bc0}.saved-search-error{margin:6px 0 0;color:var(--mat-sys-error, currentColor);font:var(--mat-sys-body-small, inherit)}mat-dialog-actions{padding:16px 24px 20px;flex-wrap:wrap;row-gap:8px}\n"] }]
        }] });

const LABEL_KEYS = {
    calendarLabel: 'shared-ui.datepicker.calendar',
    openCalendarLabel: 'shared-ui.datepicker.open-calendar',
    closeCalendarLabel: 'shared-ui.datepicker.close-calendar',
    prevMonthLabel: 'shared-ui.datepicker.previous-month',
    nextMonthLabel: 'shared-ui.datepicker.next-month',
    prevYearLabel: 'shared-ui.datepicker.previous-year',
    nextYearLabel: 'shared-ui.datepicker.next-year',
    prevMultiYearLabel: 'shared-ui.datepicker.previous-24-years',
    nextMultiYearLabel: 'shared-ui.datepicker.next-24-years',
    switchToMonthViewLabel: 'shared-ui.datepicker.choose-date',
    switchToMultiYearViewLabel: 'shared-ui.datepicker.choose-month-and-year',
    startDateLabel: 'shared-ui.datepicker.start-date',
    endDateLabel: 'shared-ui.datepicker.end-date',
    comparisonDateLabel: 'shared-ui.datepicker.comparison-range',
};
/**
 * Angular Material's date picker labels, from our catalogue.
 *
 * Material ships its own English strings — "Open calendar", "Next month" — and they stayed English
 * in every locale. Re-read on every language or catalogue change and announced through `changes`,
 * which is how Material's picker knows to re-render. A key the catalogue does not supply keeps
 * Material's English rather than showing the key.
 *
 * Provide it with `provideTranslatedDatepickerIntl()` on every component that imports
 * `MatDatepickerModule`, not only at the root: that module lists `MatDatepickerIntl` in its own
 * providers, so a standalone component importing it gets a fresh English instance that shadows
 * any root override.
 */
class TranslatedDatepickerIntl extends MatDatepickerIntl {
    translate = inject(TranslateService);
    englishDefaults = Object.fromEntries(Object.keys(LABEL_KEYS).map((field) => [field, this[field]]));
    constructor() {
        super();
        this.refresh();
        merge(this.translate.onLangChange, this.translate.onTranslationChange)
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.refresh());
    }
    formatYearRange(start, end) {
        return this.resolve('shared-ui.datepicker.year-range', super.formatYearRange(start, end), {
            start,
            end,
        });
    }
    formatYearRangeLabel(start, end) {
        return this.resolve('shared-ui.datepicker.year-range-label', super.formatYearRangeLabel(start, end), {
            start,
            end,
        });
    }
    refresh() {
        for (const field of Object.keys(LABEL_KEYS)) {
            this[field] = this.resolve(LABEL_KEYS[field], this.englishDefaults[field]);
        }
        this.changes.next();
    }
    resolve(key, fallback, params) {
        const value = this.translate.instant(key, params);
        return typeof value === 'string' && value !== key ? value : fallback;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TranslatedDatepickerIntl, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TranslatedDatepickerIntl });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: TranslatedDatepickerIntl, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
/** Replaces Material's English `MatDatepickerIntl` for this component and its date pickers. */
function provideTranslatedDatepickerIntl() {
    return { provide: MatDatepickerIntl, useClass: TranslatedDatepickerIntl };
}

/**
 * A date-fns locale for every language the application ships a catalogue for, plus the regional
 * variants date-fns ships for those languages.
 *
 * Keyed by the Angular locale id, lowercased. The seven bare language ids are the ones this
 * application can actually produce — `resolveFormattingLocale` clamps `LOCALE_ID` to
 * `REGISTERED_LOCALES` — and a test asserts they match `availableLanguages`, so adding a
 * language cannot quietly leave its dates being parsed as English.
 *
 * The regional entries are here for the **published** provider rather than for us. These
 * dialogs are exported from `@nuxeo/satori-platform/ui`, so a customer's `LOCALE_ID` reaches
 * this map unclamped, and a region can change the field order outright: all seven non-US
 * English regions date-fns ships are day-first or year-first, so reducing any of them to `en`
 * hands them `enUS` — month-first, the original defect wearing a different locale id.
 *
 * The list is exactly **the regional variants whose date-fns `P` format differs from their base
 * language**, enumerated rather than guessed:
 *
 * | variant | `P` | base `P` |
 * | --- | --- | --- |
 * | `en-AU` `en-GB` `en-IE` `en-IN` `en-NZ` | `dd/MM/yyyy` | `MM/dd/yyyy` |
 * | `en-CA` | `yyyy-MM-dd` | `MM/dd/yyyy` |
 * | `en-ZA` | `yyyy/MM/dd` | `MM/dd/yyyy` |
 * | `fr-CA` | `yy-MM-dd` | `dd/MM/y` |
 * | `fr-CH` | `dd.MM.y` | `dd/MM/y` |
 * | `nl-BE` | `dd.MM.y` | `dd-MM-y` |
 *
 * `de-AT`, `zh-HK` and `zh-TW` are deliberately **absent**: their `P` is identical to their
 * base, so an entry would add a locale to every consumer's bundle and change no behaviour. They
 * resolve correctly through the bare-language fallback.
 *
 * `en` maps to `enUS` and is present here although `register-locale-data.ts` omits it: Angular
 * bundles `en-US` locale data so registering it there would be a no-op, whereas date-fns ships
 * no region-less English and the adapter needs one named.
 */
const DATE_FNS_LOCALES = {
    en: enUS,
    'en-us': enUS,
    'en-au': enAU,
    'en-ca': enCA,
    'en-gb': enGB,
    'en-ie': enIE,
    'en-in': enIN,
    'en-nz': enNZ,
    'en-za': enZA,
    fr,
    'fr-ca': frCA,
    'fr-ch': frCH,
    de,
    ja,
    nl,
    'nl-be': nlBE,
    th,
    zh: zhCN,
};
/** The bare language ids above, for the test that keeps this map and `availableLanguages` in step. */
const DATE_ADAPTER_LANGUAGES = Object.keys(DATE_FNS_LOCALES).filter((id) => !id.includes('-'));
/**
 * The date-fns locale for an Angular locale id.
 *
 * Resolution order is exact tag, then bare language, then English. The exact tag comes first
 * because a region can change the field order outright, not just the separators, and silently
 * parsing one region's dates with another's order is the defect this file exists to remove.
 *
 * A regional tag we have no data for still falls back rather than throwing — an application
 * that will not start is worse than one that formats in the wrong region — but it says so in
 * development, because the fallback is the one case here that can be wrong without any symptom.
 */
function dateFnsLocaleFor(localeId) {
    const tag = (localeId ?? '').toLowerCase().replaceAll('_', '-');
    const exact = DATE_FNS_LOCALES[tag];
    if (exact)
        return exact;
    const language = tag.split('-')[0];
    const base = DATE_FNS_LOCALES[language];
    if (tag !== language && isDevMode()) {
        console.warn(`[satori-date-adapter] No date-fns locale for "${localeId}"; dates will be parsed and ` +
            `formatted as "${base ? language : 'en'}". If that region orders or separates date ` +
            'fields differently, typed dates will be misread. Add it to DATE_FNS_LOCALES.');
    }
    return base ?? enUS;
}
/**
 * Angular Material's date adapter, parsing and formatting in the application's language.
 *
 * ## Why this replaces `provideNativeDateAdapter()`
 *
 * `NativeDateAdapter` cannot parse a localized date, and says so in its own source: `parse()`
 * is `new Date(Date.parse(value))` above a comment explaining that the native `Date` offers no
 * way to apply a format or a locale. `Date.parse` reads `nn/nn/yyyy` as US month/day/year, so
 * in a French, German, Dutch, Japanese, Thai or Chinese deployment typing `03/04/2026` meaning
 * 3 April stored 4 March — with no error, and with the field still showing the text the user
 * typed, because `MatDatepickerInput` does not rewrite it.
 *
 * Only `format()` honoured the locale, via `Intl`. That asymmetry is why this survived seven
 * locales shipping: the calendar overlay renders perfect French while the typed input is
 * misread, so there is nothing on screen to notice.
 *
 * Supplying `MAT_DATE_LOCALE` alone would not have helped — `parse()` ignores it too.
 *
 * ## Why the locale comes from `LOCALE_ID`
 *
 * `MAT_DATE_LOCALE`'s own default factory is `inject(LOCALE_ID)`, so `LOCALE_ID` is already
 * the locale Material formats dates in, and the application provides it from Layer 0's
 * `defaultLanguage`. Deriving the parsing locale from the same token is what makes "the
 * calendar, the selected date and the typed input all agree" true by construction rather than
 * by two settings being kept in step by hand.
 *
 * ## Thai dates become Gregorian here, deliberately
 *
 * `Intl.DateTimeFormat('th')` resolves to the **Buddhist** calendar, so the native adapter
 * showed 3 April 2026 as `03/04/2569`. date-fns' `th` locale is Gregorian and shows
 * `03/04/2026`. That is a real change, and it is the right way round for two reasons.
 *
 * Angular's `DatePipe` never calls `Intl` and `@angular/common/locales/th` carries no calendar
 * system, so every other date in a Thai deployment — the document list, the audit table,
 * document detail — has always rendered the Gregorian year. Only the date picker disagreed.
 *
 * And the Buddhist display was not even round-trippable by the field that produced it:
 * `Date.parse('03/04/2569')` is 4 March 2569, so a Thai user who retyped what the picker had
 * just shown them got the wrong month *and* a year 543 years out. Showing the Gregorian year
 * removes the only thing that invited that. Asserted by the `th` case in the parse table and
 * by the explicit Buddhist-year test.
 *
 * ## Why every component provides it, rather than the app root
 *
 * Same reason as `provideTranslatedDatepickerIntl()` next to it, and one more. Components that
 * import `MatNativeDateModule` get `provideNativeDateAdapter()` from that module's own
 * providers, which an app-root provider cannot override — so a root-only fix silently left
 * six of the fifteen date inputs parsing US dates. And several of these dialogs are exported
 * from `@nuxeo/satori-platform/ui`: a customer who mounts `EditCollectionDialogComponent` in
 * their own application gets our adapter with it, instead of whatever their root happens to
 * provide or a `NullInjectorError`.
 *
 * `MAT_DATE_FORMATS` comes from `provideDateFnsAdapter()`'s default, `MAT_DATE_FNS_FORMATS`,
 * whose `parse.dateInput` and `display.dateInput` are both date-fns' `P` — the locale's own
 * short date format. That is the token this application never set, and the reason a typed date
 * had no format to be parsed against.
 */
function provideSatoriDateAdapter() {
    return [
        ...provideDateFnsAdapter(),
        { provide: MAT_DATE_LOCALE, useFactory: () => dateFnsLocaleFor(inject(LOCALE_ID)) },
    ];
}

const RIGHT_OPTIONS$1 = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
class ShareSavedSearchAddPermissionDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
    detailService = inject(DocumentDetailService);
    searchSubject = new Subject();
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    rightOptions = RIGHT_OPTIONS$1;
    searchText = '';
    selectedPrincipal = null;
    right = 'Read';
    timeFrameMode = 'permanent';
    beginDate = null;
    endDate = null;
    sendNotify = true;
    notifyComment = '';
    createdEntries = [];
    isEditMode = !!this.data.initialData;
    constructor() {
        this.searchSubject
            .pipe(debounceTime(300), distinctUntilChanged(), switchMap((term) => term.trim().length >= 3 ? this.detailService.searchUsersGroups(term.trim()) : of([])), takeUntilDestroyed())
            .subscribe((results) => this.suggestions.set(results));
        if (this.isEditMode && this.data.initialData) {
            this.initializeFormWithData(this.data.initialData);
        }
    }
    initializeFormWithData(data) {
        this.searchText = data.userGroup;
        // Create a mock UserGroupSuggestion from the stored data
        this.selectedPrincipal = {
            id: data.userGroup,
            displayLabel: data.userGroup,
            type: data.grantedBy === 'Group' ? 'GROUP_TYPE' : 'USER_TYPE',
            email: undefined,
            username: undefined,
            groupname: undefined,
        };
        // Normalize the right value to match options
        this.right = this.normalizeRightValue(data.right);
        if (data.timeFrame === 'Permanent') {
            this.timeFrameMode = 'permanent';
            this.beginDate = null;
            this.endDate = null;
        }
        else {
            this.timeFrameMode = 'date-based';
            if (data.timeFrame.startsWith('Until ')) {
                this.beginDate = null;
                this.endDate = this.parseDate(data.timeFrame.slice(6).trim());
            }
            else if (data.timeFrame.startsWith('From ')) {
                this.beginDate = this.parseDate(data.timeFrame.slice(5).trim());
                this.endDate = null;
            }
            else {
                const dateRange = data.timeFrame.split(' - ');
                if (dateRange.length === 2) {
                    this.beginDate = this.parseDate(dateRange[0].trim());
                    this.endDate = this.parseDate(dateRange[1].trim());
                }
            }
        }
        this.sendNotify = false;
    }
    normalizeRightValue(value) {
        // Map various right values to the standardized options
        const normalizedMap = {
            Read: 'Read',
            Write: 'ReadWrite',
            Edit: 'ReadWrite',
            ReadWrite: 'ReadWrite',
            Manage: 'Everything',
            'Manage everything': 'Everything',
            Everything: 'Everything',
            'Can collect': 'ReadCanCollect',
            ReadCanCollect: 'ReadCanCollect',
        };
        return normalizedMap[value] || 'Read'; // Default to 'Read' if no match
    }
    parseDate(dateStr) {
        if (!dateStr)
            return null;
        try {
            // YYYY-MM-DD (ISO date)
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [yyyy, mm, dd] = dateStr.split('-');
                return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            }
            // MM/DD/YYYY (legacy format)
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                const [mm, dd, yyyy] = dateStr.split('/');
                return new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd));
            }
            // ISO or other date-like strings
            const parsed = new Date(dateStr);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
        }
        catch {
            return null;
        }
    }
    onSearchChange(value) {
        this.searchText = value;
        this.selectedPrincipal = null;
        this.searchSubject.next(value);
    }
    onSuggestionSelected(suggestion) {
        this.selectedPrincipal = suggestion;
        this.searchText = suggestion.displayLabel;
    }
    displaySuggestion(suggestion) {
        if (!suggestion)
            return '';
        return typeof suggestion === 'string' ? suggestion : suggestion.displayLabel;
    }
    create(andAddAnother) {
        if (!this.selectedPrincipal || this.saving())
            return;
        this.saving.set(true);
        const entry = this.buildResultEntry();
        if (this.isEditMode) {
            this.dialogRef.close([entry]);
        }
        else {
            this.createdEntries.push(entry);
            this.saving.set(false);
            if (andAddAnother) {
                this.resetForm();
                return;
            }
            this.dialogRef.close(this.createdEntries);
        }
    }
    cancel() {
        this.dialogRef.close(null);
    }
    isSubmitDisabled() {
        return !this.selectedPrincipal || this.saving();
    }
    buildResultEntry() {
        const principal = this.selectedPrincipal;
        const userGroup = principal?.displayLabel || this.searchText.trim();
        const grantedBy = this.isEditMode && this.data.initialData?.grantedBy
            ? this.data.initialData.grantedBy
            : principal?.type === 'GROUP_TYPE'
                ? 'Group'
                : 'User';
        if (this.timeFrameMode === 'permanent') {
            return {
                userGroup,
                right: this.right,
                timeFrame: 'Permanent',
                grantedBy,
            };
        }
        const from = this.beginDate ? this.formatDate(this.beginDate) : null;
        const to = this.endDate ? this.formatDate(this.endDate) : null;
        let timeFrame;
        if (from && to) {
            timeFrame = `${from} - ${to}`;
        }
        else if (from) {
            timeFrame = `From ${from}`;
        }
        else if (to) {
            timeFrame = `Until ${to}`;
        }
        else {
            timeFrame = 'Permanent';
        }
        return {
            userGroup,
            right: this.right,
            timeFrame,
            grantedBy,
        };
    }
    resetForm() {
        this.searchText = '';
        this.selectedPrincipal = null;
        this.right = 'Read';
        this.timeFrameMode = 'permanent';
        this.beginDate = null;
        this.endDate = null;
        this.sendNotify = true;
        this.notifyComment = '';
        this.suggestions.set([]);
    }
    formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareSavedSearchAddPermissionDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: ShareSavedSearchAddPermissionDialogComponent, isStandalone: true, selector: "lib-share-saved-search-add-permission-dialog", providers: [provideTranslatedDatepickerIntl(), provideSatoriDateAdapter()], ngImport: i0, template: "<h2 mat-dialog-title>{{ data.title || ('ui.add-a-permission' | translate) }}</h2>\n\n<mat-dialog-content>\n  @if (!isEditMode) {\n    <label class=\"field-label\" for=\"principal-input\">{{\n      'shared-ui.share-saved-search-add-permission-dialog.user-group' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <input\n        id=\"principal-input\"\n        matInput\n        [placeholder]=\"\n          'shared-ui.share-saved-search-add-permission-dialog.search-for-users-and-groups'\n            | translate\n        \"\n        [ngModel]=\"searchText\"\n        (ngModelChange)=\"onSearchChange($event)\"\n        [matAutocomplete]=\"principalAuto\"\n        required\n      />\n      <mat-autocomplete\n        #principalAuto=\"matAutocomplete\"\n        (optionSelected)=\"onSuggestionSelected($event.option.value)\"\n        [displayWith]=\"displaySuggestion\"\n      >\n        @if (searchText.trim().length < 3) {\n          <mat-option disabled>{{\n            'shared-ui.share-saved-search-add-permission-dialog.please-enter-3-or-more-characters'\n              | translate\n          }}</mat-option>\n        } @else {\n          @for (suggestion of suggestions(); track suggestion.id) {\n            <mat-option [value]=\"suggestion\">\n              <mat-icon class=\"suggestion-icon\">{{\n                suggestion.type === 'USER_TYPE' ? 'person' : 'groups'\n              }}</mat-icon>\n              <span>{{ suggestion.displayLabel }}</span>\n              <span class=\"suggestion-id\">{{ suggestion.id }}</span>\n            </mat-option>\n          } @empty {\n            <mat-option disabled>{{\n              'shared-ui.share-saved-search-add-permission-dialog.no-users-groups-found' | translate\n            }}</mat-option>\n          }\n        }\n      </mat-autocomplete>\n    </mat-form-field>\n  } @else {\n    <div class=\"field-label\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.user-group-2' | translate }}\n    </div>\n    <div class=\"user-group-display\">{{ searchText }}</div>\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{\n      'shared-ui.share-saved-search-add-permission-dialog.right' | translate\n    }}</mat-label>\n    <mat-select [(ngModel)]=\"right\">\n      @for (opt of rightOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"time-frame-row\">\n    <span class=\"field-label no-margin\">{{\n      'shared-ui.share-saved-search-add-permission-dialog.time-frame' | translate\n    }}</span>\n    <mat-radio-group [(ngModel)]=\"timeFrameMode\" class=\"time-frame-radios\">\n      <mat-radio-button value=\"permanent\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"date-based\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  </div>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-add-permission-dialog.from' | translate\n      }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"fromPicker\"\n        [(ngModel)]=\"beginDate\"\n        [disabled]=\"timeFrameMode === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-add-permission-dialog.to' | translate\n      }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"toPicker\"\n        [(ngModel)]=\"endDate\"\n        [disabled]=\"timeFrameMode === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <mat-checkbox [(ngModel)]=\"sendNotify\">{{\n    'shared-ui.share-saved-search-add-permission-dialog.send-an-email-to-notify-user' | translate\n  }}</mat-checkbox>\n\n  @if (sendNotify) {\n    <div class=\"notify-section\">\n      <label class=\"field-label\" for=\"notify\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.notification-email' | translate\n      }}</label>\n      <mat-form-field appearance=\"outline\" class=\"full-width\">\n        <textarea\n          id=\"notify\"\n          matInput\n          rows=\"2\"\n          [(ngModel)]=\"notifyComment\"\n          [placeholder]=\"\n            'shared-ui.share-saved-search-add-permission-dialog.hi-could-you-comment-on-this'\n              | translate\n          \"\n        ></textarea>\n      </mat-form-field>\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'shared-ui.share-saved-search-add-permission-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  @if (isEditMode) {\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(false)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.update' | translate }}\n    </button>\n  } @else {\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(true)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.create-and-add-another' | translate }}\n    </button>\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(false)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.create' | translate }}\n    </button>\n  }\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:500px}mat-dialog-content{display:flex;flex-direction:column;gap:8px;padding-top:8px!important;max-width:500px}.full-width{width:100%;max-width:400px}.field-label{font-size:14px;font-weight:500;color:#475467}.no-margin{margin:0}.user-group-display{padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;color:#101828;margin-bottom:8px}.time-frame-row{display:flex;align-items:center;gap:20px;margin-top:4px}.time-frame-radios{display:flex;gap:24px}.date-fields{display:flex;gap:12px;max-width:400px}.date-fields mat-form-field{flex:1;max-width:190px}.notify-section{margin-top:2px}.suggestion-icon{width:18px;height:18px;font-size:18px;margin-right:8px;vertical-align:middle;color:#667085}.suggestion-id{margin-left:8px;font-size:12px;color:#98a2b3}mat-dialog-actions{display:flex;gap:10px;padding:8px 24px 16px}.spacer{flex:1}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1$1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$3.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$3.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$3.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i5.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i5.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatRadioModule }, { kind: "directive", type: i7$1.MatRadioGroup, selector: "mat-radio-group", inputs: ["color", "name", "labelPosition", "value", "selected", "disabled", "required", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioGroup"] }, { kind: "component", type: i7$1.MatRadioButton, selector: "mat-radio-button", inputs: ["id", "name", "aria-label", "aria-labelledby", "aria-describedby", "disableRipple", "tabIndex", "checked", "value", "labelPosition", "disabled", "required", "color", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioButton"] }, { kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i3$2.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i7$2.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i7$2.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i7$2.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i10.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "directive", type: i10.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: DescriptorLabelPipe, name: "descriptorLabel" }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareSavedSearchAddPermissionDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-share-saved-search-add-permission-dialog', standalone: true, imports: [
                        DescriptorLabelPipe,
                        TranslatePipe,
                        FormsModule,
                        MatDialogModule,
                        MatFormFieldModule,
                        MatInputModule,
                        MatSelectModule,
                        MatButtonModule,
                        MatRadioModule,
                        MatCheckboxModule,
                        MatDatepickerModule,
                        MatAutocompleteModule,
                        MatIconModule,
                    ], providers: [provideTranslatedDatepickerIntl(), provideSatoriDateAdapter()], template: "<h2 mat-dialog-title>{{ data.title || ('ui.add-a-permission' | translate) }}</h2>\n\n<mat-dialog-content>\n  @if (!isEditMode) {\n    <label class=\"field-label\" for=\"principal-input\">{{\n      'shared-ui.share-saved-search-add-permission-dialog.user-group' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <input\n        id=\"principal-input\"\n        matInput\n        [placeholder]=\"\n          'shared-ui.share-saved-search-add-permission-dialog.search-for-users-and-groups'\n            | translate\n        \"\n        [ngModel]=\"searchText\"\n        (ngModelChange)=\"onSearchChange($event)\"\n        [matAutocomplete]=\"principalAuto\"\n        required\n      />\n      <mat-autocomplete\n        #principalAuto=\"matAutocomplete\"\n        (optionSelected)=\"onSuggestionSelected($event.option.value)\"\n        [displayWith]=\"displaySuggestion\"\n      >\n        @if (searchText.trim().length < 3) {\n          <mat-option disabled>{{\n            'shared-ui.share-saved-search-add-permission-dialog.please-enter-3-or-more-characters'\n              | translate\n          }}</mat-option>\n        } @else {\n          @for (suggestion of suggestions(); track suggestion.id) {\n            <mat-option [value]=\"suggestion\">\n              <mat-icon class=\"suggestion-icon\">{{\n                suggestion.type === 'USER_TYPE' ? 'person' : 'groups'\n              }}</mat-icon>\n              <span>{{ suggestion.displayLabel }}</span>\n              <span class=\"suggestion-id\">{{ suggestion.id }}</span>\n            </mat-option>\n          } @empty {\n            <mat-option disabled>{{\n              'shared-ui.share-saved-search-add-permission-dialog.no-users-groups-found' | translate\n            }}</mat-option>\n          }\n        }\n      </mat-autocomplete>\n    </mat-form-field>\n  } @else {\n    <div class=\"field-label\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.user-group-2' | translate }}\n    </div>\n    <div class=\"user-group-display\">{{ searchText }}</div>\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{\n      'shared-ui.share-saved-search-add-permission-dialog.right' | translate\n    }}</mat-label>\n    <mat-select [(ngModel)]=\"right\">\n      @for (opt of rightOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"time-frame-row\">\n    <span class=\"field-label no-margin\">{{\n      'shared-ui.share-saved-search-add-permission-dialog.time-frame' | translate\n    }}</span>\n    <mat-radio-group [(ngModel)]=\"timeFrameMode\" class=\"time-frame-radios\">\n      <mat-radio-button value=\"permanent\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"date-based\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  </div>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-add-permission-dialog.from' | translate\n      }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"fromPicker\"\n        [(ngModel)]=\"beginDate\"\n        [disabled]=\"timeFrameMode === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-add-permission-dialog.to' | translate\n      }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"toPicker\"\n        [(ngModel)]=\"endDate\"\n        [disabled]=\"timeFrameMode === 'permanent'\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <mat-checkbox [(ngModel)]=\"sendNotify\">{{\n    'shared-ui.share-saved-search-add-permission-dialog.send-an-email-to-notify-user' | translate\n  }}</mat-checkbox>\n\n  @if (sendNotify) {\n    <div class=\"notify-section\">\n      <label class=\"field-label\" for=\"notify\">{{\n        'shared-ui.share-saved-search-add-permission-dialog.notification-email' | translate\n      }}</label>\n      <mat-form-field appearance=\"outline\" class=\"full-width\">\n        <textarea\n          id=\"notify\"\n          matInput\n          rows=\"2\"\n          [(ngModel)]=\"notifyComment\"\n          [placeholder]=\"\n            'shared-ui.share-saved-search-add-permission-dialog.hi-could-you-comment-on-this'\n              | translate\n          \"\n        ></textarea>\n      </mat-form-field>\n    </div>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'shared-ui.share-saved-search-add-permission-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  @if (isEditMode) {\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(false)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.update' | translate }}\n    </button>\n  } @else {\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(true)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.create-and-add-another' | translate }}\n    </button>\n    <button mat-flat-button color=\"primary\" [disabled]=\"isSubmitDisabled()\" (click)=\"create(false)\">\n      {{ 'shared-ui.share-saved-search-add-permission-dialog.create' | translate }}\n    </button>\n  }\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:500px}mat-dialog-content{display:flex;flex-direction:column;gap:8px;padding-top:8px!important;max-width:500px}.full-width{width:100%;max-width:400px}.field-label{font-size:14px;font-weight:500;color:#475467}.no-margin{margin:0}.user-group-display{padding:10px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:14px;color:#101828;margin-bottom:8px}.time-frame-row{display:flex;align-items:center;gap:20px;margin-top:4px}.time-frame-radios{display:flex;gap:24px}.date-fields{display:flex;gap:12px;max-width:400px}.date-fields mat-form-field{flex:1;max-width:190px}.notify-section{margin-top:2px}.suggestion-icon{width:18px;height:18px;font-size:18px;margin-right:8px;vertical-align:middle;color:#667085}.suggestion-id{margin-left:8px;font-size:12px;color:#98a2b3}mat-dialog-actions{display:flex;gap:10px;padding:8px 24px 16px}.spacer{flex:1}\n"] }]
        }], ctorParameters: () => [] });

const RIGHT_OPTIONS = [
    { value: 'Read', labelKey: 'permission.read', label: 'Read' },
    { value: 'ReadWrite', labelKey: 'permission.read-write', label: 'Edit' },
    { value: 'Everything', labelKey: 'permission.everything', label: 'Manage everything' },
    { value: 'ReadCanCollect', labelKey: 'permission.read-can-collect', label: 'Can collect' },
];
class ShareSavedSearchExternalDialogComponent {
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    detailService = inject(DocumentDetailService);
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    rightOptions = RIGHT_OPTIONS;
    isEditMode = !!this.data.initialData;
    email = '';
    right = 'Read';
    beginDate = null;
    endDate = null;
    notifyComment = '';
    createdAny = false;
    constructor() {
        if (this.data.initialData) {
            this.email = this.data.initialData.email;
            this.right = this.data.initialData.right || 'Read';
            this.beginDate = this.parseDate(this.data.initialData.begin);
            this.endDate = this.parseDate(this.data.initialData.end);
        }
    }
    cancel() {
        this.dialogRef.close(this.createdAny);
    }
    create(andAddAnother) {
        if (!this.isValid() || this.saving())
            return;
        this.saving.set(true);
        const request = this.isEditMode
            ? this.detailService.replacePermission(this.data.savedSearchId, {
                id: this.data.initialData?.id,
                email: this.email.trim(),
                permission: this.right,
                begin: this.beginDate ? this.formatDate(this.beginDate) : null,
                end: this.endDate ? this.formatDate(this.endDate) : null,
                notify: false,
                comment: this.notifyComment,
            })
            : this.detailService.addPermission(this.data.savedSearchId, {
                email: this.email.trim(),
                permission: this.right,
                begin: this.beginDate ? this.formatDate(this.beginDate) : null,
                end: this.endDate ? this.formatDate(this.endDate) : null,
                notify: false,
                comment: this.notifyComment,
            });
        request
            .pipe(catchError((error) => {
            console.error('Error adding external permission:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe((result) => {
            this.saving.set(false);
            if (!result)
                return;
            this.createdAny = true;
            if (andAddAnother && !this.isEditMode) {
                this.resetForm();
                return;
            }
            this.dialogRef.close(true);
        });
    }
    isValid() {
        const hasEmail = this.isEditMode ? true : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
        const hasToDate = !!this.endDate;
        return hasEmail && hasToDate;
    }
    resetForm() {
        this.email = '';
        this.right = 'Read';
        this.beginDate = null;
        this.endDate = null;
        this.notifyComment = '';
    }
    formatDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
    parseDate(value) {
        if (!value)
            return null;
        // MM/DD/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            const [mm, dd, yyyy] = value.split('/');
            return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
        }
        // ISO or date-like strings
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareSavedSearchExternalDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: ShareSavedSearchExternalDialogComponent, isStandalone: true, selector: "lib-share-saved-search-external-dialog", providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()], ngImport: i0, template: "<h2 mat-dialog-title>\n  {{ 'shared-ui.share-saved-search-external-dialog.share-with-external-user' | translate }}\n</h2>\n\n<mat-dialog-content>\n  @if (isEditMode) {\n    <div class=\"field-label\">\n      {{ 'shared-ui.share-saved-search-external-dialog.email' | translate }}\n    </div>\n    <div class=\"readonly-value\">{{ email }}</div>\n  } @else {\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-external-dialog.email-2' | translate\n      }}</mat-label>\n      <input\n        matInput\n        type=\"email\"\n        [placeholder]=\"'common.email-example' | translate\"\n        [(ngModel)]=\"email\"\n        required\n      />\n    </mat-form-field>\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.right' | translate }}</mat-label>\n    <mat-select [(ngModel)]=\"right\">\n      @for (opt of rightOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.from' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"fromPicker\" [(ngModel)]=\"beginDate\" />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.to' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"toPicker\" [(ngModel)]=\"endDate\" required />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <div class=\"notify-section\">\n    <label class=\"field-label\" for=\"notify\">{{\n      'shared-ui.share-saved-search-external-dialog.notification-email' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <textarea\n        id=\"notify\"\n        matInput\n        rows=\"2\"\n        [(ngModel)]=\"notifyComment\"\n        [placeholder]=\"\n          'shared-ui.share-saved-search-external-dialog.hi-could-you-comment-on-this' | translate\n        \"\n      ></textarea>\n    </mat-form-field>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'shared-ui.share-saved-search-external-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  @if (!isEditMode) {\n    <button\n      mat-flat-button\n      color=\"primary\"\n      [disabled]=\"!isValid() || saving()\"\n      (click)=\"create(true)\"\n    >\n      {{ 'shared-ui.share-saved-search-external-dialog.create-and-add-another' | translate }}\n    </button>\n  }\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!isValid() || saving()\"\n    (click)=\"create(false)\"\n  >\n    {{ isEditMode ? ('ui.update' | translate) : ('ui.create' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:560px}mat-dialog-content{display:flex;flex-direction:column;gap:8px;padding-top:8px!important}.full-width{width:100%}.date-fields{display:flex;gap:12px}.date-fields mat-form-field{flex:1}.notify-section{margin-top:2px}.field-label{display:block;font-size:14px;font-weight:500;color:#475467;margin-bottom:6px}.readonly-value{width:100%;border:1px solid #d0d5dd;border-radius:6px;padding:10px 12px;font-size:14px;color:#101828;background:#f9fafb;box-sizing:border-box}mat-dialog-actions{display:flex;gap:10px;padding:8px 24px 16px}.spacer{flex:1}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1$1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$3.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$3.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$3.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i5.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i5.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i7$2.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i7$2.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i7$2.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "pipe", type: DescriptorLabelPipe, name: "descriptorLabel" }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareSavedSearchExternalDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-share-saved-search-external-dialog', standalone: true, imports: [
                        DescriptorLabelPipe,
                        TranslatePipe,
                        FormsModule,
                        MatDialogModule,
                        MatFormFieldModule,
                        MatInputModule,
                        MatSelectModule,
                        MatButtonModule,
                        MatDatepickerModule,
                    ], providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl()], template: "<h2 mat-dialog-title>\n  {{ 'shared-ui.share-saved-search-external-dialog.share-with-external-user' | translate }}\n</h2>\n\n<mat-dialog-content>\n  @if (isEditMode) {\n    <div class=\"field-label\">\n      {{ 'shared-ui.share-saved-search-external-dialog.email' | translate }}\n    </div>\n    <div class=\"readonly-value\">{{ email }}</div>\n  } @else {\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <mat-label>{{\n        'shared-ui.share-saved-search-external-dialog.email-2' | translate\n      }}</mat-label>\n      <input\n        matInput\n        type=\"email\"\n        [placeholder]=\"'common.email-example' | translate\"\n        [(ngModel)]=\"email\"\n        required\n      />\n    </mat-form-field>\n  }\n\n  <mat-form-field appearance=\"outline\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.right' | translate }}</mat-label>\n    <mat-select [(ngModel)]=\"right\">\n      @for (opt of rightOptions; track opt.value) {\n        <mat-option [value]=\"opt.value\">{{ opt | descriptorLabel }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"date-fields\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.from' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"fromPicker\" [(ngModel)]=\"beginDate\" />\n      <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n      <mat-datepicker #fromPicker />\n    </mat-form-field>\n\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'shared-ui.share-saved-search-external-dialog.to' | translate }}</mat-label>\n      <input matInput [matDatepicker]=\"toPicker\" [(ngModel)]=\"endDate\" required />\n      <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n      <mat-datepicker #toPicker />\n    </mat-form-field>\n  </div>\n\n  <div class=\"notify-section\">\n    <label class=\"field-label\" for=\"notify\">{{\n      'shared-ui.share-saved-search-external-dialog.notification-email' | translate\n    }}</label>\n    <mat-form-field appearance=\"outline\" class=\"full-width\">\n      <textarea\n        id=\"notify\"\n        matInput\n        rows=\"2\"\n        [(ngModel)]=\"notifyComment\"\n        [placeholder]=\"\n          'shared-ui.share-saved-search-external-dialog.hi-could-you-comment-on-this' | translate\n        \"\n      ></textarea>\n    </mat-form-field>\n  </div>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" (click)=\"cancel()\">\n    {{ 'shared-ui.share-saved-search-external-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  @if (!isEditMode) {\n    <button\n      mat-flat-button\n      color=\"primary\"\n      [disabled]=\"!isValid() || saving()\"\n      (click)=\"create(true)\"\n    >\n      {{ 'shared-ui.share-saved-search-external-dialog.create-and-add-another' | translate }}\n    </button>\n  }\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!isValid() || saving()\"\n    (click)=\"create(false)\"\n  >\n    {{ isEditMode ? ('ui.update' | translate) : ('ui.create' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:560px}mat-dialog-content{display:flex;flex-direction:column;gap:8px;padding-top:8px!important}.full-width{width:100%}.date-fields{display:flex;gap:12px}.date-fields mat-form-field{flex:1}.notify-section{margin-top:2px}.field-label{display:block;font-size:14px;font-weight:500;color:#475467;margin-bottom:6px}.readonly-value{width:100%;border:1px solid #d0d5dd;border-radius:6px;padding:10px 12px;font-size:14px;color:#101828;background:#f9fafb;box-sizing:border-box}mat-dialog-actions{display:flex;gap:10px;padding:8px 24px 16px}.spacer{flex:1}\n"] }]
        }], ctorParameters: () => [] });

class ShareSavedSearchDialogComponent {
    translate = inject(TranslateService);
    dialogRef = inject((MatDialogRef));
    data = inject(MAT_DIALOG_DATA);
    dialog = inject(MatDialog);
    currentUsername = inject(CURRENT_USERNAME);
    userService = inject(UserService);
    detailService = inject(DocumentDetailService);
    permissions = signal([], ...(ngDevMode ? [{ debugName: "permissions" }] : []));
    inheritedPermissions = signal([], ...(ngDevMode ? [{ debugName: "inheritedPermissions" }] : []));
    externalPermissions = signal([], ...(ngDevMode ? [{ debugName: "externalPermissions" }] : []));
    isInheritanceBlocked = signal(false, ...(ngDevMode ? [{ debugName: "isInheritanceBlocked" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    nextId = 1;
    ngOnInit() {
        if (this.data.id) {
            this.loadPermissionsFromApi();
        }
        else {
            this.loadPermissionsFromCurrentUser();
        }
    }
    loadPermissionsFromApi() {
        this.loading.set(true);
        this.detailService
            .getDocumentPermissions(this.data.id)
            .pipe(catchError(() => of(null)))
            .subscribe((doc) => {
            this.loading.set(false);
            if (!doc) {
                this.loadPermissionsFromCurrentUser();
                return;
            }
            this.parsePermissionsFromDocument(doc);
        });
    }
    parsePermissionsFromDocument(doc) {
        const allAcls = (doc.contextParameters?.acls ?? []);
        // Find local ACL (usually first or named 'local')
        const localAcl = allAcls.find((acl) => acl.name === 'local') || allAcls[0];
        const localAces = localAcl?.aces ?? [];
        const localRows = localAces
            .filter((ace) => !ace.externalUser)
            .map((ace, index) => ({
            id: String(index),
            userGroup: ace.username || ace.email || 'Unknown',
            right: ace.permission || 'Read',
            timeFrame: this.toTimeFrameLabel(ace.begin, ace.end),
            grantedBy: ace.creator || 'System',
        }));
        const externalRows = localAces
            .filter((ace) => !!ace.externalUser)
            .map((ace, index) => ({
            id: ace.id || `external-${index}`,
            email: ace.email || ace.username || '',
            userGroup: ace.email || ace.username || 'Unknown',
            right: ace.permission || 'Read',
            timeFrame: this.toTimeFrameLabel(ace.begin, ace.end),
            grantedBy: ace.creator || 'System',
            begin: ace.begin,
            end: ace.end,
        }));
        // Find inherited ACLs
        const inheritedAcls = allAcls.filter((acl) => acl.name !== 'local');
        this.isInheritanceBlocked.set(!allAcls.some((acl) => acl.name === 'inherited'));
        const inheritedRows = inheritedAcls
            .flatMap((acl) => acl.aces ?? [])
            .map((ace) => ({
            userGroup: ace.username || ace.email || 'Unknown',
            right: ace.permission || 'Read',
            timeFrame: 'Inherited',
            grantedBy: ace.creator || 'Parent',
        }));
        this.permissions.set(localRows);
        this.externalPermissions.set(externalRows);
        this.inheritedPermissions.set(inheritedRows);
        this.nextId = localRows.length + 1;
    }
    openExternalPermissionDialog() {
        if (!this.data.id || this.saving())
            return;
        this.dialog
            .open(ShareSavedSearchExternalDialogComponent, {
            width: '720px',
            data: { savedSearchId: this.data.id },
        })
            .afterClosed()
            .subscribe((created) => {
            if (!created)
                return;
            this.loadPermissionsFromApi();
        });
    }
    editExternalPermission(row) {
        if (!this.data.id || this.saving())
            return;
        this.dialog
            .open(ShareSavedSearchExternalDialogComponent, {
            width: '720px',
            data: {
                savedSearchId: this.data.id,
                initialData: {
                    id: row.id,
                    email: row.email,
                    right: row.right,
                    begin: row.begin,
                    end: row.end,
                },
            },
        })
            .afterClosed()
            .subscribe((updated) => {
            if (!updated)
                return;
            this.loadPermissionsFromApi();
        });
    }
    sendExternalNotification(row) {
        if (!this.data.id || this.saving() || !row.id)
            return;
        this.saving.set(true);
        this.detailService
            .sendNotificationEmailForPermission(this.data.id, row.id)
            .pipe(catchError((error) => {
            console.error('Error sending permission notification:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe(() => {
            this.saving.set(false);
        });
    }
    removeExternalPermission(row) {
        if (!this.data.id || this.saving())
            return;
        this.saving.set(true);
        this.detailService
            .removePermission(this.data.id, {
            user: row.email || row.userGroup,
            permission: this.normalizePermissionForApi({ right: row.right }).right,
            acl: 'local',
        })
            .pipe(catchError((error) => {
            console.error('Error removing external permission:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe((result) => {
            this.saving.set(false);
            if (!result)
                return;
            this.loadPermissionsFromApi();
        });
    }
    togglePermissionInheritance() {
        if (!this.data.id || this.saving())
            return;
        this.saving.set(true);
        const op = this.isInheritanceBlocked()
            ? this.detailService.unblockPermissionInheritance(this.data.id)
            : this.detailService.blockPermissionInheritance(this.data.id);
        op.pipe(catchError((error) => {
            console.error('Error updating permission inheritance:', error);
            this.saving.set(false);
            return of(null);
        })).subscribe((result) => {
            this.saving.set(false);
            if (!result)
                return;
            this.loadPermissionsFromApi();
        });
    }
    loadPermissionsFromCurrentUser() {
        const username = this.currentUsername()?.trim();
        if (!username) {
            this.permissions.set([]);
            this.inheritedPermissions.set([]);
            return;
        }
        this.userService
            .getUser(username)
            .pipe(catchError(() => of(null)))
            .subscribe((user) => {
            if (!user) {
                this.permissions.set([]);
                this.inheritedPermissions.set([]);
                return;
            }
            this.applyUserPermissions(user);
        });
    }
    applyUserPermissions(user) {
        const localRows = [
            {
                id: String(this.nextId++),
                userGroup: this.toDisplayName(user),
                right: user.isAdministrator ? 'Manage everything' : 'Read',
                timeFrame: 'Permanent',
                grantedBy: 'System',
            },
        ];
        const groups = user.properties.groups ?? [];
        groups.forEach((group) => {
            localRows.push({
                id: String(this.nextId++),
                userGroup: group,
                right: 'Read',
                timeFrame: 'Permanent',
                grantedBy: 'Group',
            });
        });
        this.permissions.set(localRows);
        this.inheritedPermissions.set(groups.map((group) => ({
            userGroup: group,
            right: 'Inherited',
            timeFrame: 'Permanent',
            grantedBy: 'Parent',
        })));
    }
    toDisplayName(user) {
        const firstName = user.properties.firstName?.trim() ?? '';
        const lastName = user.properties.lastName?.trim() ?? '';
        const fullName = `${firstName} ${lastName}`.trim();
        if (fullName)
            return fullName;
        return user.properties.username || user.id;
    }
    openAddPermissionDialog() {
        this.dialog
            .open(ShareSavedSearchAddPermissionDialogComponent, {
            width: '720px',
            data: { title: this.translate.instant('confirm.add-a-permission') },
        })
            .afterClosed()
            .subscribe((result) => {
            if (!result || result.length === 0 || !this.data.id)
                return;
            this.saving.set(true);
            // Call addPermission API for each new permission
            const requests = result.map((entry) => {
                const { right } = this.normalizePermissionForApi({
                    right: entry.right,
                });
                const [begin, end] = this.parseTimeFrame(entry.timeFrame);
                return this.detailService.addPermission(this.data.id, {
                    username: entry.userGroup,
                    permission: right,
                    begin: begin || null,
                    end: end || null,
                    notify: false,
                    comment: '',
                });
            });
            forkJoin(requests)
                .pipe(catchError((error) => {
                console.error('Error adding permissions:', error);
                this.saving.set(false);
                return of(null);
            }))
                .subscribe(() => {
                this.saving.set(false);
                // Refresh permissions from API after adding
                this.loadPermissionsFromApi();
            });
        });
    }
    removeRow(id) {
        const row = this.permissions().find((r) => r.id === id);
        if (!row || !this.data.id)
            return;
        // Remove from local state first
        this.permissions.update((rows) => rows.filter((r) => r.id !== id));
        // Call API to delete the permission
        const username = row.userGroup;
        const permission = this.normalizePermissionForApi({
            right: row.right,
        }).right;
        this.detailService
            .removePermission(this.data.id, {
            user: username,
            permission: permission,
            acl: 'local',
        })
            .pipe(catchError((error) => {
            console.error('Error removing permission:', error);
            // Revert the removal on error
            this.permissions.update((rows) => [...rows, row]);
            return of(null);
        }))
            .subscribe();
    }
    editRow(id) {
        const row = this.permissions().find((r) => r.id === id);
        if (!row)
            return;
        this.dialog
            .open(ShareSavedSearchAddPermissionDialogComponent, {
            width: '720px',
            data: {
                title: this.translate.instant('confirm.update'),
                initialData: row,
            },
        })
            .afterClosed()
            .subscribe((result) => {
            if (!result || result.length === 0)
                return;
            const updatedEntry = result[0];
            this.permissions.update((rows) => rows.map((r) => r.id === id
                ? {
                    ...r,
                    userGroup: updatedEntry.userGroup,
                    right: updatedEntry.right,
                    timeFrame: updatedEntry.timeFrame,
                    grantedBy: updatedEntry.grantedBy,
                }
                : r));
        });
    }
    save() {
        if (this.saving() || !this.data.id)
            return;
        this.saving.set(true);
        const permissions = this.permissions();
        if (permissions.length === 0) {
            this.saving.set(false);
            this.dialogRef.close(permissions);
            return;
        }
        // Create API calls for each permission
        const requests = permissions.map((perm) => {
            const { right, timeFrame } = this.normalizePermissionForApi(perm);
            const [begin, end] = this.parseTimeFrame(timeFrame);
            return this.detailService.replacePermission(this.data.id, {
                username: perm.userGroup,
                email: null,
                permission: right,
                begin: begin || null,
                end: end || null,
                notify: false,
                comment: null,
            });
        });
        forkJoin(requests)
            .pipe(catchError((error) => {
            console.error('Error saving permissions:', error);
            this.saving.set(false);
            return of(null);
        }))
            .subscribe(() => {
            this.saving.set(false);
            // Refresh permissions from API after save
            this.loadPermissionsFromApi();
        });
    }
    normalizePermissionForApi(perm) {
        // Normalize right values to API format
        const rightMap = {
            Read: 'Read',
            Write: 'ReadWrite',
            Edit: 'ReadWrite',
            Manage: 'Everything',
            'Manage everything': 'Everything',
            'Can collect': 'ReadCanCollect',
        };
        return {
            right: rightMap[perm.right] || perm.right,
            timeFrame: perm.timeFrame,
        };
    }
    parseTimeFrame(timeFrame) {
        if (timeFrame === 'Permanent') {
            return [null, null];
        }
        // "Until <end>" — only end date set
        if (timeFrame.startsWith('Until ')) {
            return [null, timeFrame.slice(6).trim()];
        }
        // "From <begin>" — only begin date set
        if (timeFrame.startsWith('From ')) {
            return [timeFrame.slice(5).trim(), null];
        }
        const parts = timeFrame.split(' - ');
        if (parts.length === 2) {
            return [parts[0].trim(), parts[1].trim()];
        }
        return [null, null];
    }
    toTimeFrameLabel(begin, end) {
        if (!begin && !end)
            return this.translate.instant('permissions.time-frame.permanent');
        if (!begin && end)
            return this.translate.instant('permissions.time-frame.until', { end });
        if (begin && !end)
            return this.translate.instant('permissions.time-frame.from', { begin });
        return this.translate.instant('permissions.time-frame.range', { begin, end });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareSavedSearchDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: ShareSavedSearchDialogComponent, isStandalone: true, selector: "lib-share-saved-search-dialog", ngImport: i0, template: "<div class=\"dialog-header\">\n  <h2 mat-dialog-title>\n    {{ 'shared-ui.share-saved-search-dialog.share-saved-search' | translate }}\n  </h2>\n  <button\n    mat-icon-button\n    class=\"close-btn\"\n    type=\"button\"\n    [attr.aria-label]=\"'shared-ui.share-saved-search-dialog.close-dialog' | translate\"\n    (click)=\"dialogRef.close(null)\"\n  >\n    <mat-icon>close</mat-icon>\n  </button>\n</div>\n\n<mat-dialog-content>\n  @if (loading()) {\n    <div class=\"loading-container\">\n      <nxs-spinner\n        diameter=\"40\"\n        [label]=\"'shared-ui.share-saved-search-dialog.loading' | translate\"\n      />\n      <p>{{ 'shared-ui.share-saved-search-dialog.loading-permissions' | translate }}</p>\n    </div>\n  } @else {\n    <section class=\"permissions-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{ 'shared-ui.share-saved-search-dialog.permissions-defined-locally' | translate }}\n        </h3>\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"add-btn\"\n          (click)=\"openAddPermissionDialog()\"\n          [disabled]=\"saving()\"\n        >\n          <mat-icon>add</mat-icon> {{ 'shared-ui.share-saved-search-dialog.new' | translate }}\n        </button>\n      </div>\n\n      <div class=\"table-wrap\">\n        <table class=\"permissions-table\">\n          <thead>\n            <tr>\n              <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.actions' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (row of permissions(); track row.id) {\n              <tr>\n                <td>{{ row.userGroup }}</td>\n                <td>{{ row.right }}</td>\n                <td>{{ row.timeFrame }}</td>\n                <td>{{ row.grantedBy || '-' }}</td>\n                <td class=\"actions-cell\">\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"edit-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.edit-permission' | translate\n                    \"\n                    (click)=\"editRow(row.id)\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"delete-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.remove-permission' | translate\n                    \"\n                    (click)=\"removeRow(row.id)\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </tr>\n            } @empty {\n              <tr>\n                <td colspan=\"5\" class=\"empty-row\">\n                  {{\n                    'shared-ui.share-saved-search-dialog.no-permissions-defined-click-add-to'\n                      | translate\n                  }}\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </section>\n\n    <section class=\"permissions-section muted-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{\n            'shared-ui.share-saved-search-dialog.permissions-inherited-from-upper-levels'\n              | translate\n          }}\n        </h3>\n        <button\n          mat-button\n          type=\"button\"\n          class=\"link-action-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"togglePermissionInheritance()\"\n        >\n          {{ isInheritanceBlocked() ? ('ui.unblock' | translate) : ('ui.block' | translate) }}\n        </button>\n      </div>\n      @if (!isInheritanceBlocked()) {\n        <p class=\"section-note\">\n          {{ 'shared-ui.share-saved-search-dialog.if-you-want-to-explicitly-control' | translate }}\n        </p>\n      } @else {\n        <p class=\"empty-row\">\n          {{\n            'shared-ui.share-saved-search-dialog.only-local-permissions-are-applied-unblock'\n              | translate\n          }}\n        </p>\n      }\n\n      @if (!isInheritanceBlocked()) {\n        <div class=\"table-wrap\">\n          <table class=\"permissions-table readonly-table\">\n            <thead>\n              <tr>\n                <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              </tr>\n            </thead>\n            <tbody>\n              @for (row of inheritedPermissions(); track $index) {\n                <tr>\n                  <td>{{ row.userGroup }}</td>\n                  <td>{{ row.right }}</td>\n                  <td>{{ row.timeFrame }}</td>\n                  <td>{{ row.grantedBy || '-' }}</td>\n                </tr>\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    </section>\n\n    <section class=\"permissions-section muted-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{\n            'shared-ui.share-saved-search-dialog.permissions-assigned-to-external-users' | translate\n          }}\n        </h3>\n        <button\n          mat-button\n          type=\"button\"\n          class=\"link-action-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"openExternalPermissionDialog()\"\n        >\n          {{ 'shared-ui.share-saved-search-dialog.new' | translate }}\n        </button>\n      </div>\n      <p class=\"section-note\">\n        {{ 'shared-ui.share-saved-search-dialog.sharing-with-external-users-does-not' | translate }}\n      </p>\n\n      <div class=\"table-wrap\">\n        <table class=\"permissions-table readonly-table\">\n          <thead>\n            <tr>\n              <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.actions' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (row of externalPermissions(); track row.id) {\n              <tr>\n                <td>{{ row.userGroup }}</td>\n                <td>{{ row.right }}</td>\n                <td>{{ row.timeFrame }}</td>\n                <td>{{ row.grantedBy || '-' }}</td>\n                <td class=\"actions-cell\">\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.edit-external-permission' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"editExternalPermission(row)\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.send-notification' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"sendExternalNotification(row)\"\n                  >\n                    <mat-icon>send</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"delete-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.remove-external-permission' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"removeExternalPermission(row)\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </tr>\n            } @empty {\n              <tr>\n                <td colspan=\"5\" class=\"empty-row\">\n                  {{\n                    'shared-ui.share-saved-search-dialog.the-saved-search-is-not-shared' | translate\n                  }}\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </section>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"start\">\n  <button mat-stroked-button type=\"button\" (click)=\"dialogRef.close(null)\" [disabled]=\"saving()\">\n    {{ 'shared-ui.share-saved-search-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;width:min(95vw,1080px);max-width:95vw;max-height:90vh}.dialog-header{position:relative}.dialog-header h2{margin:0;padding-right:40px}.close-btn{position:absolute;top:8px;right:8px;color:#667085}mat-dialog-content{padding:16px 24px 0!important;overflow:auto;max-height:min(72vh,780px)}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center}.loading-container p{margin-top:16px;color:#667085;font-size:14px}.permissions-section{border:1px solid #eaecf0;border-radius:10px;padding:16px;margin-bottom:16px}.muted-section{background:#fcfcfd}.table-header-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}.table-title{margin:0;font-size:16px;font-weight:600;color:#101828;flex:1;min-width:0}.section-note{margin:0 0 12px;padding:10px 12px;border-left:4px solid #f97066;color:#667085;background:#fff;line-height:1.4;font-size:13px}.table-wrap{overflow-x:hidden;border-radius:8px}.permissions-table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}.permissions-table th{text-align:left;padding:10px 8px;font-weight:600;color:#344054;border-bottom:2px solid #e4e7ec;white-space:normal;word-break:break-word}.permissions-table td{padding:8px;border-bottom:1px solid #f2f4f7;vertical-align:middle;color:#475467;word-break:break-word;overflow-wrap:break-word}.permissions-table td:first-child{width:25%}.permissions-table td:nth-child(2){width:20%}.permissions-table td:nth-child(3){width:25%}.permissions-table td:nth-child(4){width:20%}.actions-cell{width:10%;text-align:center;padding:8px 4px;display:flex;justify-content:center;gap:2px;flex-shrink:0}.edit-btn{color:#175cd3;min-width:32px}.delete-btn{color:#f04438;min-width:32px}.empty-row{text-align:center;color:#667085;padding:24px 8px!important;font-style:italic}.add-btn{font-size:13px;display:flex;align-items:center;gap:4px;flex-shrink:0;white-space:nowrap}.link-action-btn{color:#175cd3;font-weight:600;flex-shrink:0;white-space:nowrap}.readonly-table td{padding:10px 8px}mat-dialog-actions{padding:16px 24px 20px}.spinner{animation:spin 1s linear infinite;margin-right:4px;vertical-align:middle}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"], dependencies: [{ kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i2.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ShareSavedSearchDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-share-saved-search-dialog', standalone: true, imports: [
                        NxsSpinnerComponent,
                        TranslatePipe,
                        MatDialogModule,
                        MatButtonModule,
                        MatIconModule,
                        MatSelectModule,
                    ], template: "<div class=\"dialog-header\">\n  <h2 mat-dialog-title>\n    {{ 'shared-ui.share-saved-search-dialog.share-saved-search' | translate }}\n  </h2>\n  <button\n    mat-icon-button\n    class=\"close-btn\"\n    type=\"button\"\n    [attr.aria-label]=\"'shared-ui.share-saved-search-dialog.close-dialog' | translate\"\n    (click)=\"dialogRef.close(null)\"\n  >\n    <mat-icon>close</mat-icon>\n  </button>\n</div>\n\n<mat-dialog-content>\n  @if (loading()) {\n    <div class=\"loading-container\">\n      <nxs-spinner\n        diameter=\"40\"\n        [label]=\"'shared-ui.share-saved-search-dialog.loading' | translate\"\n      />\n      <p>{{ 'shared-ui.share-saved-search-dialog.loading-permissions' | translate }}</p>\n    </div>\n  } @else {\n    <section class=\"permissions-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{ 'shared-ui.share-saved-search-dialog.permissions-defined-locally' | translate }}\n        </h3>\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"add-btn\"\n          (click)=\"openAddPermissionDialog()\"\n          [disabled]=\"saving()\"\n        >\n          <mat-icon>add</mat-icon> {{ 'shared-ui.share-saved-search-dialog.new' | translate }}\n        </button>\n      </div>\n\n      <div class=\"table-wrap\">\n        <table class=\"permissions-table\">\n          <thead>\n            <tr>\n              <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.actions' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (row of permissions(); track row.id) {\n              <tr>\n                <td>{{ row.userGroup }}</td>\n                <td>{{ row.right }}</td>\n                <td>{{ row.timeFrame }}</td>\n                <td>{{ row.grantedBy || '-' }}</td>\n                <td class=\"actions-cell\">\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"edit-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.edit-permission' | translate\n                    \"\n                    (click)=\"editRow(row.id)\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"delete-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.remove-permission' | translate\n                    \"\n                    (click)=\"removeRow(row.id)\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </tr>\n            } @empty {\n              <tr>\n                <td colspan=\"5\" class=\"empty-row\">\n                  {{\n                    'shared-ui.share-saved-search-dialog.no-permissions-defined-click-add-to'\n                      | translate\n                  }}\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </section>\n\n    <section class=\"permissions-section muted-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{\n            'shared-ui.share-saved-search-dialog.permissions-inherited-from-upper-levels'\n              | translate\n          }}\n        </h3>\n        <button\n          mat-button\n          type=\"button\"\n          class=\"link-action-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"togglePermissionInheritance()\"\n        >\n          {{ isInheritanceBlocked() ? ('ui.unblock' | translate) : ('ui.block' | translate) }}\n        </button>\n      </div>\n      @if (!isInheritanceBlocked()) {\n        <p class=\"section-note\">\n          {{ 'shared-ui.share-saved-search-dialog.if-you-want-to-explicitly-control' | translate }}\n        </p>\n      } @else {\n        <p class=\"empty-row\">\n          {{\n            'shared-ui.share-saved-search-dialog.only-local-permissions-are-applied-unblock'\n              | translate\n          }}\n        </p>\n      }\n\n      @if (!isInheritanceBlocked()) {\n        <div class=\"table-wrap\">\n          <table class=\"permissions-table readonly-table\">\n            <thead>\n              <tr>\n                <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n                <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              </tr>\n            </thead>\n            <tbody>\n              @for (row of inheritedPermissions(); track $index) {\n                <tr>\n                  <td>{{ row.userGroup }}</td>\n                  <td>{{ row.right }}</td>\n                  <td>{{ row.timeFrame }}</td>\n                  <td>{{ row.grantedBy || '-' }}</td>\n                </tr>\n              }\n            </tbody>\n          </table>\n        </div>\n      }\n    </section>\n\n    <section class=\"permissions-section muted-section\">\n      <div class=\"table-header-row\">\n        <h3 class=\"table-title\">\n          {{\n            'shared-ui.share-saved-search-dialog.permissions-assigned-to-external-users' | translate\n          }}\n        </h3>\n        <button\n          mat-button\n          type=\"button\"\n          class=\"link-action-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"openExternalPermissionDialog()\"\n        >\n          {{ 'shared-ui.share-saved-search-dialog.new' | translate }}\n        </button>\n      </div>\n      <p class=\"section-note\">\n        {{ 'shared-ui.share-saved-search-dialog.sharing-with-external-users-does-not' | translate }}\n      </p>\n\n      <div class=\"table-wrap\">\n        <table class=\"permissions-table readonly-table\">\n          <thead>\n            <tr>\n              <th>{{ 'shared-ui.share-saved-search-dialog.user-group' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.right' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.time-frame' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.granted-by' | translate }}</th>\n              <th>{{ 'shared-ui.share-saved-search-dialog.actions' | translate }}</th>\n            </tr>\n          </thead>\n          <tbody>\n            @for (row of externalPermissions(); track row.id) {\n              <tr>\n                <td>{{ row.userGroup }}</td>\n                <td>{{ row.right }}</td>\n                <td>{{ row.timeFrame }}</td>\n                <td>{{ row.grantedBy || '-' }}</td>\n                <td class=\"actions-cell\">\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.edit-external-permission' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"editExternalPermission(row)\"\n                  >\n                    <mat-icon>edit</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.send-notification' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"sendExternalNotification(row)\"\n                  >\n                    <mat-icon>send</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    class=\"delete-btn\"\n                    [attr.aria-label]=\"\n                      'shared-ui.share-saved-search-dialog.remove-external-permission' | translate\n                    \"\n                    [disabled]=\"saving()\"\n                    (click)=\"removeExternalPermission(row)\"\n                  >\n                    <mat-icon>delete_outline</mat-icon>\n                  </button>\n                </td>\n              </tr>\n            } @empty {\n              <tr>\n                <td colspan=\"5\" class=\"empty-row\">\n                  {{\n                    'shared-ui.share-saved-search-dialog.the-saved-search-is-not-shared' | translate\n                  }}\n                </td>\n              </tr>\n            }\n          </tbody>\n        </table>\n      </div>\n    </section>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"start\">\n  <button mat-stroked-button type=\"button\" (click)=\"dialogRef.close(null)\" [disabled]=\"saving()\">\n    {{ 'shared-ui.share-saved-search-dialog.close' | translate }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;width:min(95vw,1080px);max-width:95vw;max-height:90vh}.dialog-header{position:relative}.dialog-header h2{margin:0;padding-right:40px}.close-btn{position:absolute;top:8px;right:8px;color:#667085}mat-dialog-content{padding:16px 24px 0!important;overflow:auto;max-height:min(72vh,780px)}.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;text-align:center}.loading-container p{margin-top:16px;color:#667085;font-size:14px}.permissions-section{border:1px solid #eaecf0;border-radius:10px;padding:16px;margin-bottom:16px}.muted-section{background:#fcfcfd}.table-header-row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;flex-wrap:wrap}.table-title{margin:0;font-size:16px;font-weight:600;color:#101828;flex:1;min-width:0}.section-note{margin:0 0 12px;padding:10px 12px;border-left:4px solid #f97066;color:#667085;background:#fff;line-height:1.4;font-size:13px}.table-wrap{overflow-x:hidden;border-radius:8px}.permissions-table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}.permissions-table th{text-align:left;padding:10px 8px;font-weight:600;color:#344054;border-bottom:2px solid #e4e7ec;white-space:normal;word-break:break-word}.permissions-table td{padding:8px;border-bottom:1px solid #f2f4f7;vertical-align:middle;color:#475467;word-break:break-word;overflow-wrap:break-word}.permissions-table td:first-child{width:25%}.permissions-table td:nth-child(2){width:20%}.permissions-table td:nth-child(3){width:25%}.permissions-table td:nth-child(4){width:20%}.actions-cell{width:10%;text-align:center;padding:8px 4px;display:flex;justify-content:center;gap:2px;flex-shrink:0}.edit-btn{color:#175cd3;min-width:32px}.delete-btn{color:#f04438;min-width:32px}.empty-row{text-align:center;color:#667085;padding:24px 8px!important;font-style:italic}.add-btn{font-size:13px;display:flex;align-items:center;gap:4px;flex-shrink:0;white-space:nowrap}.link-action-btn{color:#175cd3;font-weight:600;flex-shrink:0;white-space:nowrap}.readonly-table td{padding:10px 8px}mat-dialog-actions{padding:16px 24px 20px}.spinner{animation:spin 1s linear infinite;margin-right:4px;vertical-align:middle}@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}\n"] }]
        }] });

class ConfirmDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ConfirmDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "20.3.33", type: ConfirmDialogComponent, isStandalone: true, selector: "lib-confirm-dialog", ngImport: i0, template: "<h2 mat-dialog-title>{{ data.title }}</h2>\n<mat-dialog-content class=\"msg\">{{ data.message }}</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"actions\">\n  <button type=\"button\" mat-button mat-dialog-close>\n    {{ 'shared-ui.confirm-dialog.cancel' | translate }}\n  </button>\n  <button type=\"button\" mat-flat-button color=\"warn\" [mat-dialog-close]=\"true\">\n    {{ data.confirmLabel ?? ('ui.confirm' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: [".msg{padding-top:.35rem;max-width:28rem;line-height:1.5}.actions{gap:.5rem;padding:.75rem 1.5rem 1.25rem}\n"], dependencies: [{ kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: ConfirmDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-confirm-dialog', standalone: true, imports: [TranslatePipe, MatDialogModule, MatButtonModule], template: "<h2 mat-dialog-title>{{ data.title }}</h2>\n<mat-dialog-content class=\"msg\">{{ data.message }}</mat-dialog-content>\n<mat-dialog-actions align=\"end\" class=\"actions\">\n  <button type=\"button\" mat-button mat-dialog-close>\n    {{ 'shared-ui.confirm-dialog.cancel' | translate }}\n  </button>\n  <button type=\"button\" mat-flat-button color=\"warn\" [mat-dialog-close]=\"true\">\n    {{ data.confirmLabel ?? ('ui.confirm' | translate) }}\n  </button>\n</mat-dialog-actions>\n", styles: [".msg{padding-top:.35rem;max-width:28rem;line-height:1.5}.actions{gap:.5rem;padding:.75rem 1.5rem 1.25rem}\n"] }]
        }] });

/**
 * English for every translation key `@nuxeo/satori-platform` uses, so a host application that does
 * not ship the application catalogue renders English rather than raw keys.
 *
 * Generated by `node tools/i18n/platform-english.mjs` from `apps/nuxeo-ui/public/i18n/en.json`; do not edit by
 * hand. `checkPlatformEnglishFallback` fails when it drifts from that catalogue or from the keys the
 * package's code references.
 */
// @generated-begin
// prettier-ignore
const PLATFORM_EN_TRANSLATIONS = {
    "action.bulk-actions-add-to-clipboard": "Add to Clipboard",
    "action.bulk-actions-add-to-collection": "Add to Collection",
    "action.bulk-actions-compare": "Compare",
    "action.bulk-actions-delete": "Delete selected",
    "action.bulk-actions-download-zip": "Download All as Zip",
    "action.bulk-actions-publish": "Publish Document",
    "action.context-menu-export": "Export",
    "action.context-menu-share": "Share",
    "action.context-menu-subscribe": "Notify Me",
    "action.context-menu-unsubscribe": "Unsubscribe",
    "action.row-actions-copy-to": "Copy to…",
    "action.row-actions-delete": "Delete",
    "action.row-actions-download": "Download",
    "action.row-actions-move-to": "Move to…",
    "action.row-actions-rename": "Rename",
    "action.toolbar-add-to-clipboard": "Add to Clipboard",
    "action.toolbar-add-to-collection": "Add to collection",
    "action.toolbar-add-to-favorites": "Add to Favorites",
    "action.toolbar-delete": "Delete",
    "action.toolbar-edit": "Edit",
    "action.toolbar-edit-properties": "Edit properties",
    "action.toolbar-export": "Export",
    "action.toolbar-lock": "Lock",
    "action.toolbar-publish": "Publish document",
    "action.toolbar-remove-from-clipboard": "Remove from Clipboard",
    "action.toolbar-remove-from-favorites": "Remove from Favorites",
    "action.toolbar-share": "Share",
    "action.toolbar-start-process": "Start Process",
    "action.toolbar-subscribe": "Notify Me",
    "action.toolbar-unlock": "Unlock",
    "action.toolbar-unsubscribe": "Unsubscribe",
    "browse.message.domain-container-guidance": "Open Sections, Templates, or Workspaces, then create content inside those folders.",
    "browse.message.restricted-import-location": "Select a different container to create your content.",
    "column.document-list-author": "Author",
    "column.document-list-coverage": "Coverage",
    "column.document-list-created": "Created",
    "column.document-list-flags": "Flags",
    "column.document-list-last-contributor": "Last Contributor",
    "column.document-list-modified": "Modified",
    "column.document-list-nature": "Nature",
    "column.document-list-state": "State",
    "column.document-list-subjects": "Subjects",
    "column.document-list-title": "Title",
    "column.document-list-type": "Type",
    "column.document-list-version": "Version",
    "common.count.all-selected-many": "All {{ count }} items selected",
    "common.count.all-selected-one": "All {{ count }} item selected",
    "common.date-mask": "mm/dd/yyyy",
    "common.email-example": "name@company.com",
    "common.permission-denied": "You do not have permission to perform this action",
    "confirm.add-a-permission": "Add a Permission",
    "confirm.delete": "Delete",
    "confirm.delete-selected-documents": "Delete {{ count }} selected documents?",
    "confirm.delete-the-document": "Delete the document?",
    "confirm.move-named-to-trash": "Move \"{{ name }}\" to trash?",
    "confirm.move-to-trash": "Move to Trash",
    "confirm.update": "Update",
    "doc-type.audio": "Audio",
    "doc-type.collection": "Collection",
    "doc-type.domain": "Domain",
    "doc-type.file": "File",
    "doc-type.folder": "Folder",
    "doc-type.note": "Note",
    "doc-type.ordered-folder": "Ordered Folder",
    "doc-type.picture": "Picture",
    "doc-type.root": "Root",
    "doc-type.section": "Section",
    "doc-type.section-root": "Section Root",
    "doc-type.template-root": "Template Root",
    "doc-type.video": "Video",
    "doc-type.workspace": "Workspace",
    "doc-type.workspace-root": "Workspace Root",
    "extensions.extension-outlet.loading": "Loading…",
    "nav.item.administration": "Administration",
    "nav.item.assets": "Assets",
    "nav.item.browse": "Browse",
    "nav.item.clipboard": "Clipboard",
    "nav.item.collections": "Collections",
    "nav.item.dashboard": "Dashboard",
    "nav.item.expired-queue": "Expired Queue",
    "nav.item.favorites": "Favorites",
    "nav.item.knowledge-discovery": "Knowledge Discovery",
    "nav.item.personal-space": "Personal Space",
    "nav.item.recently-viewed": "Recently viewed",
    "nav.item.search-filters": "Search filters",
    "nav.item.tasks": "Tasks",
    "nav.item.trash": "Trash",
    "note-format.html": "HTML",
    "note-format.markdown": "Markdown",
    "note-format.plain": "Text",
    "note-format.xml": "XML",
    "permission.everything": "Manage everything",
    "permission.read": "Read",
    "permission.read-can-collect": "Can collect",
    "permission.read-write": "Edit",
    "permissions.notification.ace-not-found-add": "Permission was added, but the notification email could not be sent because the new permission entry could not be located. Refresh the page and try resending from the Permissions tab.",
    "permissions.notification.ace-not-found-update": "Permission was updated, but the notification email could not be sent because the permission entry could not be located. Refresh the page and try resending from the Permissions tab.",
    "permissions.notification.create-mail-failed": "Permission could not be created. Configure outbound mail (SMTP) on the Nuxeo server.",
    "permissions.notification.mail-hint": "Requires outbound mail (SMTP) configured on the Nuxeo server.",
    "permissions.notification.mail-send-failed-add": "Permission was added, but the notification email could not be sent. Configure outbound mail (SMTP) on the Nuxeo server.",
    "permissions.notification.mail-send-failed-send": "Notification email could not be sent. Configure outbound mail (SMTP) on the Nuxeo server.",
    "permissions.notification.mail-send-failed-update": "Permission was updated, but the notification email could not be sent. Configure outbound mail (SMTP) on the Nuxeo server.",
    "permissions.notification.update-mail-failed": "Permission could not be updated. Configure outbound mail (SMTP) on the Nuxeo server.",
    "permissions.right.AddChildren": "Add Children",
    "permissions.right.Browse": "Browse",
    "permissions.right.CanAskForPublishing": "Can ask for publishing",
    "permissions.right.Everything": "Manage everything",
    "permissions.right.ManageLegalHold": "Manage legal hold",
    "permissions.right.ManageRecord": "Manage record",
    "permissions.right.ManageWorkflows": "Manage Workflows",
    "permissions.right.Read": "Read",
    "permissions.right.ReadCanCollect": "Can collect",
    "permissions.right.ReadChildren": "Read children",
    "permissions.right.ReadLifeCycle": "Read lifecycle",
    "permissions.right.ReadProperties": "Read properties",
    "permissions.right.ReadRemove": "Read & Remove",
    "permissions.right.ReadSecurity": "Read security",
    "permissions.right.ReadVersion": "Read versions",
    "permissions.right.ReadWrite": "Edit",
    "permissions.right.Remove": "Remove",
    "permissions.right.RemoveChildren": "Remove children",
    "permissions.right.SetRetention": "Set retention",
    "permissions.right.Unlock": "Unlock",
    "permissions.right.UnsetRetention": "Unset retention",
    "permissions.right.Version": "Create versions",
    "permissions.right.Write": "Write",
    "permissions.right.WriteLifeCycle": "Edit lifecycle",
    "permissions.right.WriteProperties": "Edit properties",
    "permissions.right.WriteSecurity": "Manage permissions",
    "permissions.right.WriteVersion": "Write versions",
    "permissions.time-frame.from": "From {{ begin }}",
    "permissions.time-frame.permanent": "Permanent",
    "permissions.time-frame.range": "{{ begin }} - {{ end }}",
    "permissions.time-frame.until": "Until {{ end }}",
    "rendition.pdf": "PDF",
    "rendition.thumbnail": "Thumbnail",
    "rendition.xml": "XML Export",
    "rendition.zip": "ZIP Export",
    "satori-components.action-menu.more-actions": "More actions",
    "satori-components.breadcrumbs.show-more": "Show more breadcrumbs",
    "satori-components.column-picker.close": "Close column picker",
    "satori-components.column-picker.done": "Done",
    "satori-components.column-picker.reset": "Reset",
    "satori-components.column-picker.title": "Column Settings",
    "satori-components.comments.cancel": "Cancel",
    "satori-components.comments.clear": "Clear",
    "satori-components.comments.comment-actions": "Actions for the comment by {{author}}",
    "satori-components.comments.comment-label": "Comment",
    "satori-components.comments.delete": "Delete",
    "satori-components.comments.delete-comment-message": "Are you sure you want to delete this comment?",
    "satori-components.comments.delete-comment-title": "Delete comment",
    "satori-components.comments.delete-comment-with-replies": "Are you sure you want to delete this comment? All replies to this comment will also be deleted.",
    "satori-components.comments.delete-reply-message": "Are you sure you want to delete this reply?",
    "satori-components.comments.delete-reply-title": "Delete reply",
    "satori-components.comments.edit": "Edit",
    "satori-components.comments.edit-comment": "Edit comment",
    "satori-components.comments.edit-reply": "Edit reply",
    "satori-components.comments.edited": "{{time}} (edited)",
    "satori-components.comments.empty": "No comments yet",
    "satori-components.comments.error.add-comment": "The comment could not be added.",
    "satori-components.comments.error.add-reply": "The reply could not be added.",
    "satori-components.comments.error.delete-comment": "The comment could not be deleted.",
    "satori-components.comments.error.delete-reply": "The reply could not be deleted.",
    "satori-components.comments.error.edit-comment": "The comment could not be saved.",
    "satori-components.comments.error.edit-reply": "The reply could not be saved.",
    "satori-components.comments.error.forbidden-add": "You do not have permission to comment on this document.",
    "satori-components.comments.error.forbidden-delete": "You do not have permission to delete this comment.",
    "satori-components.comments.error.forbidden-edit": "You do not have permission to edit this comment.",
    "satori-components.comments.error.not-found-comment": "This comment is no longer available. The comments have been reloaded.",
    "satori-components.comments.error.not-found-reply": "This reply is no longer available. The comments have been reloaded.",
    "satori-components.comments.last-reply": "Last reply {{time}}",
    "satori-components.comments.list": "Comments",
    "satori-components.comments.load-failed": "The comments could not be loaded.",
    "satori-components.comments.loading": "Loading comments",
    "satori-components.comments.replies-one": "1 reply",
    "satori-components.comments.replies-other": "{{count}} replies",
    "satori-components.comments.reply": "Reply",
    "satori-components.comments.reply-actions": "Actions for the reply by {{author}}",
    "satori-components.comments.reply-label": "Reply",
    "satori-components.comments.reply-to": "Reply to {{author}}",
    "satori-components.comments.retry": "Retry",
    "satori-components.comments.save": "Save",
    "satori-components.comments.show-all": "Show all",
    "satori-components.comments.submit-comment": "Add comment",
    "satori-components.comments.submit-hint": "Ctrl + Enter to submit",
    "satori-components.comments.submit-reply": "Add reply",
    "satori-components.comments.view-all-comments": "View all {{count}} comments",
    "satori-components.comments.view-all-replies": "View all {{count}} replies",
    "satori-components.comments.write-comment": "Write a comment here",
    "satori-components.comments.write-reply": "Write a reply here",
    "satori-components.create-version-dialog.cancel": "Cancel",
    "satori-components.create-version-dialog.create": "Create Version",
    "satori-components.create-version-dialog.created": "Version {{version}} created",
    "satori-components.create-version-dialog.creating": "Creating the version",
    "satori-components.create-version-dialog.failed": "The version could not be created.",
    "satori-components.create-version-dialog.forbidden": "You do not have permission to create a version of this document.",
    "satori-components.create-version-dialog.kind": "Version to create",
    "satori-components.create-version-dialog.major": "Major version",
    "satori-components.create-version-dialog.minor": "Minor version",
    "satori-components.create-version-dialog.title": "Create Version for {{document}} - Version {{version}}",
    "satori-components.date-input.invalid": "Enter a date like {{ example }}",
    "satori-components.date-input.too-early": "Enter {{ date }} or later",
    "satori-components.date-input.too-late": "Enter {{ date }} or earlier",
    "satori-components.details-panel.close": "Close details",
    "satori-components.document-history.action": "Performed action",
    "satori-components.document-history.any": "Any",
    "satori-components.document-history.caption": "Document history",
    "satori-components.document-history.category": "Category",
    "satori-components.document-history.comment": "Comment",
    "satori-components.document-history.date": "Date",
    "satori-components.document-history.empty": "No history entries yet",
    "satori-components.document-history.failed": "The history could not be loaded.",
    "satori-components.document-history.filters": "Filter the history",
    "satori-components.document-history.from": "From",
    "satori-components.document-history.loading": "Loading the history",
    "satori-components.document-history.no-match": "No history entries match these filters",
    "satori-components.document-history.state": "State",
    "satori-components.document-history.to": "To",
    "satori-components.document-history.user": "Username",
    "satori-components.document-history.user-hint": "The exact username",
    "satori-components.document-list.actions": "Actions",
    "satori-components.document-list.drop": "Drop files to upload them here",
    "satori-components.document-list.empty": "Nothing here yet",
    "satori-components.document-list.keyboard-hint": "Arrow keys move between documents. Space selects, Shift extends the selection, Enter opens.",
    "satori-components.document-list.keyboard-hint-no-selection": "Arrow keys move between documents. Enter opens.",
    "satori-components.document-list.loading": "Loading documents",
    "satori-components.document-list.row-actions": "Actions for {{ name }}",
    "satori-components.document-list.row-name-repeated": "{{ name }} ({{ index }} of {{ count }})",
    "satori-components.document-list.select": "Select {{ name }}",
    "satori-components.document-list.select-page": "Select all on this page",
    "satori-components.document-list.selection": "Selection",
    "satori-components.document-list.sort-by": "Sort by {{ column }}",
    "satori-components.document-list.sort-cleared": "Sort cleared, showing the default order",
    "satori-components.document-list.sorted-ascending": "Sorted by {{ column }}, ascending",
    "satori-components.document-list.sorted-descending": "Sorted by {{ column }}, descending",
    "satori-components.document-toolbar.label": "Document actions",
    "satori-components.document-toolbar.more-actions": "More actions",
    "satori-components.document-tree.children-failed": "The folders in {{ name }} could not be loaded",
    "satori-components.document-tree.children-failed-row": "Could not load the folders. Retry",
    "satori-components.document-tree.children-forbidden": "You do not have access to the folders in {{ name }}",
    "satori-components.document-tree.children-forbidden-row": "You do not have access to these folders",
    "satori-components.document-tree.empty": "No folders to show",
    "satori-components.document-tree.load-failed": "The folders could not be loaded",
    "satori-components.document-tree.loading": "Loading folders",
    "satori-components.document-tree.root": "Root",
    "satori-components.drive-dialog.checking": "Checking Nuxeo Drive...",
    "satori-components.drive-dialog.close": "Close",
    "satori-components.drive-dialog.name": "Nuxeo Drive",
    "satori-components.drive-dialog.package": "Package to Install",
    "satori-components.drive-dialog.platform": "Platform",
    "satori-components.drive-dialog.title": "Download Nuxeo Drive Client",
    "satori-components.dropzone.choose-file": "Choose a file",
    "satori-components.dropzone.choose-files": "Choose files",
    "satori-components.error-state.forbidden.heading": "You do not have access",
    "satori-components.error-state.forbidden.message": "You do not have permission to see this. Ask its owner or an administrator for access.",
    "satori-components.error-state.not-found.heading": "Not found",
    "satori-components.error-state.not-found.message": "It may have been moved or deleted, or the link may be wrong.",
    "satori-components.error-state.retry": "Retry",
    "satori-components.error-state.server.heading": "Something went wrong",
    "satori-components.error-state.server.message": "The server could not complete the request. Try again in a moment.",
    "satori-components.error-state.unauthorized.heading": "Your session has ended",
    "satori-components.error-state.unauthorized.message": "Sign in again to continue.",
    "satori-components.favorite-toggle.add": "Add to favorites",
    "satori-components.favorite-toggle.label": "Favorite",
    "satori-components.favorite-toggle.remove": "Remove from favorites",
    "satori-components.folder-picker.already-here": "The document is already in this folder.",
    "satori-components.folder-picker.cancel": "Cancel",
    "satori-components.folder-picker.empty": "No folders here. You can choose this folder.",
    "satori-components.folder-picker.failed": "The folder could not be loaded.",
    "satori-components.folder-picker.folders": "Folders",
    "satori-components.folder-picker.forbidden": "You do not have access to this folder.",
    "satori-components.folder-picker.inside-itself": "A folder cannot be moved into itself or into a folder inside it.",
    "satori-components.folder-picker.loading": "Loading folders",
    "satori-components.folder-picker.location": "Location",
    "satori-components.folder-picker.not-a-folder": "This is not a folder. Go up and choose a folder.",
    "satori-components.folder-picker.not-found": "This folder no longer exists.",
    "satori-components.folder-picker.retry": "Retry",
    "satori-components.folder-picker.up": "Up one level",
    "satori-components.manage-versions.create": "Create Version",
    "satori-components.manage-versions.failed": "The versions could not be loaded.",
    "satori-components.manage-versions.latest": "Latest version",
    "satori-components.manage-versions.loading": "Loading versions",
    "satori-components.manage-versions.modified": "Modified {{when}} by {{who}}",
    "satori-components.manage-versions.none": "No previous versions",
    "satori-components.manage-versions.retry": "Retry",
    "satori-components.manage-versions.unknown-user": "Unknown",
    "satori-components.manage-versions.unversioned": "Unversioned",
    "satori-components.manage-versions.version": "Version",
    "satori-components.metadata-editor.add-item": "Add to {{label}}",
    "satori-components.metadata-editor.coverage": "Coverage",
    "satori-components.metadata-editor.description": "Description",
    "satori-components.metadata-editor.error.date": "Enter a valid date for {{label}}.",
    "satori-components.metadata-editor.error.integer": "{{label}} must be a whole number.",
    "satori-components.metadata-editor.error.invalid": "{{label}} is not valid.",
    "satori-components.metadata-editor.error.item": "One of the values of {{label}} is not valid.",
    "satori-components.metadata-editor.error.max-length": "{{label}} must be at most {{count}} characters.",
    "satori-components.metadata-editor.error.maximum": "{{label}} must be {{bound}} or less.",
    "satori-components.metadata-editor.error.maximum-exclusive": "{{label}} must be less than {{bound}}.",
    "satori-components.metadata-editor.error.min-length": "{{label}} must be at least {{count}} characters.",
    "satori-components.metadata-editor.error.minimum": "{{label}} must be {{bound}} or more.",
    "satori-components.metadata-editor.error.minimum-exclusive": "{{label}} must be more than {{bound}}.",
    "satori-components.metadata-editor.error.number": "{{label}} must be a number.",
    "satori-components.metadata-editor.error.pattern": "{{label}} is not in the expected format.",
    "satori-components.metadata-editor.error.required": "{{label}} is required.",
    "satori-components.metadata-editor.expires": "Expires",
    "satori-components.metadata-editor.item": "{{label}} {{index}}",
    "satori-components.metadata-editor.nature": "Nature",
    "satori-components.metadata-editor.no-value": "No value",
    "satori-components.metadata-editor.remove": "Remove",
    "satori-components.metadata-editor.remove-item": "Remove {{label}} {{index}}",
    "satori-components.metadata-editor.remove-value": "Remove {{name}}",
    "satori-components.metadata-editor.search": "Search",
    "satori-components.metadata-editor.search-in": "Search {{label}}",
    "satori-components.metadata-editor.sections": "Metadata sections",
    "satori-components.metadata-editor.subjects": "Subjects",
    "satori-components.metadata-editor.summary-one": "1 field needs a correction before you can save.",
    "satori-components.metadata-editor.summary-other": "{{count}} fields need a correction before you can save.",
    "satori-components.metadata-editor.title": "Title",
    "satori-components.pager.label": "Pages",
    "satori-components.pager.next": "Next page",
    "satori-components.pager.past-end": "No more items",
    "satori-components.pager.previous": "Previous page",
    "satori-components.pager.range": "{{ first }}–{{ last }}",
    "satori-components.pager.range-of": "{{ first }}–{{ last }} of {{ total }}",
    "satori-components.permission-dialogs.cancel": "Cancel",
    "satori-components.permission-dialogs.comment": "Notification email",
    "satori-components.permission-dialogs.comment-placeholder": "Hi! Could you comment on this document and...",
    "satori-components.permission-dialogs.date-based": "Date-based",
    "satori-components.permission-dialogs.delete.delete": "Delete",
    "satori-components.permission-dialogs.delete.deleting": "Deleting the permission",
    "satori-components.permission-dialogs.delete.title": "The following permission will be deleted.",
    "satori-components.permission-dialogs.end-before-begin": "The end date is before the start date.",
    "satori-components.permission-dialogs.error.delete": "The permission could not be deleted.",
    "satori-components.permission-dialogs.error.forbidden": "You don't have permission to change permissions on this document.",
    "satori-components.permission-dialogs.error.share": "The document could not be shared.",
    "satori-components.permission-dialogs.error.update": "The permission could not be updated.",
    "satori-components.permission-dialogs.from": "From",
    "satori-components.permission-dialogs.granted-by": "Granted by",
    "satori-components.permission-dialogs.permanent": "Permanent",
    "satori-components.permission-dialogs.right": "Right",
    "satori-components.permission-dialogs.share.create": "Create",
    "satori-components.permission-dialogs.share.create-another": "Create and add another",
    "satori-components.permission-dialogs.share.email": "Email",
    "satori-components.permission-dialogs.share.email-invalid": "Enter a valid email address.",
    "satori-components.permission-dialogs.share.email-placeholder": "name@company.com",
    "satori-components.permission-dialogs.share.saving": "Sharing the document",
    "satori-components.permission-dialogs.share.shared": "Shared with {{email}}, who has been sent a link to the document.",
    "satori-components.permission-dialogs.share.title": "Share with external user",
    "satori-components.permission-dialogs.time-frame": "Time frame",
    "satori-components.permission-dialogs.to": "To",
    "satori-components.permission-dialogs.update.for": "For {{principal}}",
    "satori-components.permission-dialogs.update.notify": "Send an email to notify user",
    "satori-components.permission-dialogs.update.saving": "Updating the permission",
    "satori-components.permission-dialogs.update.title": "Update permission",
    "satori-components.permission-dialogs.update.update": "Update",
    "satori-components.permission-dialogs.update.updated": "Permission updated",
    "satori-components.permission-dialogs.update.updated-notified": "Permission updated and notification sent",
    "satori-components.permission-dialogs.user-group": "User / Group",
    "satori-components.permissions-panel.add": "Add",
    "satori-components.permissions-panel.column.acl": "Access list",
    "satori-components.permissions-panel.column.actions": "Actions",
    "satori-components.permissions-panel.column.granted-by": "Granted by",
    "satori-components.permissions-panel.column.permission": "Permission",
    "satori-components.permissions-panel.column.principal": "User or group",
    "satori-components.permissions-panel.column.time-frame": "Time frame",
    "satori-components.permissions-panel.denied": "Denied",
    "satori-components.permissions-panel.discard": "Discard",
    "satori-components.permissions-panel.dismiss": "Dismiss",
    "satori-components.permissions-panel.edit": "Edit",
    "satori-components.permissions-panel.edit-entry": "Edit the permission for {{ principal }}",
    "satori-components.permissions-panel.editor.add": "Add",
    "satori-components.permissions-panel.editor.add-heading": "Add a permission",
    "satori-components.permissions-panel.editor.apply": "Apply",
    "satori-components.permissions-panel.editor.cancel": "Cancel",
    "satori-components.permissions-panel.editor.date-based": "Date-based",
    "satori-components.permissions-panel.editor.edit-heading": "Edit the permission for {{ principal }}",
    "satori-components.permissions-panel.editor.end-before-begin": "The end date is before the start date.",
    "satori-components.permissions-panel.editor.from": "From",
    "satori-components.permissions-panel.editor.no-principal": "Choose a user or group from the list.",
    "satori-components.permissions-panel.editor.permanent": "Permanent",
    "satori-components.permissions-panel.editor.permission": "Permission",
    "satori-components.permissions-panel.editor.principal": "User or group",
    "satori-components.permissions-panel.editor.to": "To",
    "satori-components.permissions-panel.failed.denied": "You don't have permission to change permissions on this document.",
    "satori-components.permissions-panel.failed.heading": "Saved {{ applied }} of {{ total }} changes. The server refused the next one:",
    "satori-components.permissions-panel.failed.unknown": "The server gave no reason.",
    "satori-components.permissions-panel.group.other": "Other permissions on this server",
    "satori-components.permissions-panel.group.standard": "Standard permissions",
    "satori-components.permissions-panel.group.suggested": "Suggested for this document type",
    "satori-components.permissions-panel.inherited.block": "Block inheritance",
    "satori-components.permissions-panel.inherited.blocked": "Inheritance is blocked, so only the permissions set on this document apply.",
    "satori-components.permissions-panel.inherited.empty": "No permissions are inherited.",
    "satori-components.permissions-panel.inherited.heading": "Inherited from parent folders",
    "satori-components.permissions-panel.inherited.save-first": "Save or discard your changes first.",
    "satori-components.permissions-panel.inherited.toggle-failed": "Inheritance could not be changed.",
    "satori-components.permissions-panel.inherited.unblock": "Unblock inheritance",
    "satori-components.permissions-panel.load-error.denied": "You don't have access to this document's permissions.",
    "satori-components.permissions-panel.load-error.failed": "The permissions could not be loaded.",
    "satori-components.permissions-panel.load-error.not-found": "This document no longer exists.",
    "satori-components.permissions-panel.loading": "Loading permissions",
    "satori-components.permissions-panel.local.empty": "No permissions are set on this document itself.",
    "satori-components.permissions-panel.local.heading": "Set on this document",
    "satori-components.permissions-panel.locked.deny": "A deny entry can be removed here, but not edited.",
    "satori-components.permissions-panel.locked.no-id": "Can't be changed here: the server sent no identifier for this entry.",
    "satori-components.permissions-panel.other.heading": "Set by other access lists",
    "satori-components.permissions-panel.pending.many": "{{ count }} unsaved changes",
    "satori-components.permissions-panel.pending.one": "{{ count }} unsaved change",
    "satori-components.permissions-panel.permission-for": "Permission for {{ principal }}",
    "satori-components.permissions-panel.refusal.changed-on-server": "it changed on the server after this page loaded. Reload, then make the change again.",
    "satori-components.permissions-panel.refusal.deny-entry": "it denies access, and this panel can only grant: editing it would turn it into a grant.",
    "satori-components.permissions-panel.refusal.invalid-time-frame": "its end date is before its start date.",
    "satori-components.permissions-panel.refusal.no-id": "the server sent no identifier for it, so it can't be changed without risking another entry.",
    "satori-components.permissions-panel.refusal.no-principal": "it names no user or group.",
    "satori-components.permissions-panel.refusal.not-applied": "the server accepted the change, but its permissions don't show it.",
    "satori-components.permissions-panel.refusal.undefined-permission": "this server doesn't define that permission.",
    "satori-components.permissions-panel.refused.heading": "Nothing was saved. These entries can't be saved from this panel:",
    "satori-components.permissions-panel.reload": "Reload",
    "satori-components.permissions-panel.remove": "Remove",
    "satori-components.permissions-panel.remove-entry": "Remove {{ permission }} for {{ principal }}",
    "satori-components.permissions-panel.retry": "Retry",
    "satori-components.permissions-panel.save": "Save",
    "satori-components.permissions-panel.saved.many": "Saved {{ count }} changes.",
    "satori-components.permissions-panel.saved.one": "Saved {{ count }} change.",
    "satori-components.permissions-panel.state.added": "New",
    "satori-components.permissions-panel.state.changed": "Changed",
    "satori-components.permissions-panel.state.removed": "To remove",
    "satori-components.permissions-panel.status.archived": "Expired",
    "satori-components.permissions-panel.status.pending": "Not yet active",
    "satori-components.permissions-panel.title": "Permissions",
    "satori-components.permissions-panel.unconfirmed.heading": "The server did not apply every change. These entries are not as you set them:",
    "satori-components.permissions-panel.undo": "Undo",
    "satori-components.permissions-panel.unnamed-principal": "(no user or group)",
    "satori-components.permissions-panel.unread.heading": "Nothing was saved. The permissions could not be read before saving, so no change was sent:",
    "satori-components.permissions-panel.unverified.heading": "The changes were sent, but reading the permissions back failed, so the panel cannot confirm them. Reload to see what the server holds.",
    "satori-components.pickers.choose-from-list": "Choose an entry from the list",
    "satori-components.pickers.clear": "Clear",
    "satori-components.pickers.failed": "Search failed. Try again.",
    "satori-components.pickers.loading": "Loading…",
    "satori-components.pickers.min-chars-many": "Type at least {{ count }} characters",
    "satori-components.pickers.min-chars-one": "Type at least {{ count }} character",
    "satori-components.pickers.no-results": "No results",
    "satori-components.pickers.remove": "Remove {{ name }}",
    "satori-components.pickers.required": "Required",
    "satori-components.pickers.results-many": "{{ count }} results",
    "satori-components.pickers.results-one": "{{ count }} result",
    "satori-components.pickers.searching": "Searching…",
    "satori-components.properties-panel.by": "By",
    "satori-components.properties-panel.collections": "Collections",
    "satori-components.properties-panel.contributors": "Contributors",
    "satori-components.properties-panel.coverage": "Coverage",
    "satori-components.properties-panel.created": "Created",
    "satori-components.properties-panel.description": "Description",
    "satori-components.properties-panel.expires": "Expires",
    "satori-components.properties-panel.file-name": "File name",
    "satori-components.properties-panel.format": "Format",
    "satori-components.properties-panel.indexing-properties": "Indexing properties",
    "satori-components.properties-panel.last-modified": "Last modified",
    "satori-components.properties-panel.nature": "Nature",
    "satori-components.properties-panel.process": "Process",
    "satori-components.properties-panel.publications": "Publications",
    "satori-components.properties-panel.running": "Running",
    "satori-components.properties-panel.state": "State",
    "satori-components.properties-panel.subjects": "Subjects",
    "satori-components.properties-panel.tags": "Tags",
    "satori-components.properties-panel.title": "Title",
    "satori-components.properties-panel.version": "Version",
    "satori-components.rename-dialog.cancel": "Cancel",
    "satori-components.rename-dialog.failed": "The title could not be changed. Try again in a moment.",
    "satori-components.rename-dialog.forbidden": "You do not have permission to rename this document.",
    "satori-components.rename-dialog.label": "Title",
    "satori-components.rename-dialog.locked": "This document is locked by someone else, so it cannot be renamed now.",
    "satori-components.rename-dialog.not-found": "This document no longer exists.",
    "satori-components.rename-dialog.required": "Enter a title",
    "satori-components.rename-dialog.save": "Rename",
    "satori-components.rename-dialog.title": "Rename",
    "satori-components.saved-search-actions.delete": "Delete",
    "satori-components.saved-search-actions.more": "Saved search actions",
    "satori-components.saved-search-actions.rename": "Rename",
    "satori-components.saved-search-actions.save": "Save",
    "satori-components.saved-search-actions.save-as": "Save As",
    "satori-components.saved-search-actions.share": "Share",
    "satori-components.saved-search-select.label": "Saved Searches",
    "satori-components.saved-search-select.loading": "Loading saved searches...",
    "satori-components.saved-search-select.no-match": "No matching saved searches",
    "satori-components.saved-search-select.none": "No saved searches",
    "satori-components.saved-search-select.placeholder": "Search Filters",
    "satori-components.search-filters.authors": "Authors",
    "satori-components.search-filters.authors-placeholder": "Search for authors...",
    "satori-components.search-filters.chosen-authors": "Chosen authors",
    "satori-components.search-filters.chosen-collections": "Chosen collections",
    "satori-components.search-filters.chosen-tags": "Chosen tags",
    "satori-components.search-filters.clear-fulltext": "Clear full text",
    "satori-components.search-filters.collections": "Collections",
    "satori-components.search-filters.collections-failed": "Could not load your collections.",
    "satori-components.search-filters.collections-placeholder": "Select a value.",
    "satori-components.search-filters.coverage": "Coverage",
    "satori-components.search-filters.fulltext": "Full Text",
    "satori-components.search-filters.fulltext-placeholder": "Search for something...",
    "satori-components.search-filters.loading-collections": "Loading collections...",
    "satori-components.search-filters.modified.last-month": "Last month",
    "satori-components.search-filters.modified.last-week": "Last week",
    "satori-components.search-filters.modified.last-year": "Last year",
    "satori-components.search-filters.modified.last24h": "Last 24h",
    "satori-components.search-filters.modified.prior-to-last-year": "More than a year ago",
    "satori-components.search-filters.modified.title": "Modification Date",
    "satori-components.search-filters.nature": "Nature",
    "satori-components.search-filters.no-available-results": "No available results",
    "satori-components.search-filters.no-results": "No results found",
    "satori-components.search-filters.no-results-for": "No results for {{ term }}",
    "satori-components.search-filters.remove": "Remove {{ value }}",
    "satori-components.search-filters.reset": "Reset",
    "satori-components.search-filters.save-as": "Save As",
    "satori-components.search-filters.size.big": "Between 10 MB and 100 MB",
    "satori-components.search-filters.size.huge": "More than 100 MB",
    "satori-components.search-filters.size.medium": "Between 1 MB and 10 MB",
    "satori-components.search-filters.size.small": "Between 100 KB and 1 MB",
    "satori-components.search-filters.size.tiny": "Less than 100 KB",
    "satori-components.search-filters.size.title": "Size",
    "satori-components.search-filters.subjects": "Subjects",
    "satori-components.search-filters.tags": "Tags",
    "satori-components.search-filters.tags-hint": "Please enter 1 or more characters",
    "satori-components.search-filters.tags-placeholder": "e.g. events, boston",
    "satori-components.tag-editor.add": "Add tags to this document",
    "satori-components.tag-editor.added": "The tag {{tag}} has been added to the document.",
    "satori-components.tag-editor.adding": "Adding tag {{tag}}",
    "satori-components.tag-editor.error.add": "The tag {{tag}} could not be added.",
    "satori-components.tag-editor.error.forbidden": "You do not have permission to change this document's tags.",
    "satori-components.tag-editor.error.remove": "The tag {{tag}} could not be removed.",
    "satori-components.tag-editor.new": "+ {{tag}}",
    "satori-components.tag-editor.new-label": "New tag {{tag}}",
    "satori-components.tag-editor.none": "No tags",
    "satori-components.tag-editor.remove": "Remove tag {{tag}}",
    "satori-components.tag-editor.removed": "The tag {{tag}} has been removed from the document.",
    "satori-components.tag-editor.tags": "Tags",
    "satori-components.tag-input.add": "Add “{{ tag }}”",
    "satori-components.toast.dismiss": "Dismiss",
    "satori-components.toast.retry": "Retry",
    "satori-components.upload-queue.done": "Uploaded",
    "satori-components.upload-queue.failed": "Could not be uploaded",
    "satori-components.upload-queue.forbidden": "You do not have permission to add documents here",
    "satori-components.upload-queue.not-found": "The folder no longer exists",
    "satori-components.upload-queue.progress": "Uploading {{ name }}",
    "satori-components.upload-queue.remove": "Remove {{ name }}",
    "satori-components.upload-queue.retry": "Retry {{ name }}",
    "satori-components.upload-queue.summary": "{{ done }} of {{ total }} uploaded",
    "satori-components.upload-queue.summary-failed": "{{ count }} could not be uploaded",
    "satori-components.upload-queue.uploading": "Uploading, {{ percent }}%",
    "satori-components.upload-queue.waiting": "Waiting",
    "satori-components.user-group-picker.group": "Group",
    "satori-components.user-group-picker.user": "User",
    "satori-components.vocabulary-select.failed": "Could not load the list. Open it again to try again.",
    "settings.themes.name.dark": "Dark",
    "settings.themes.name.kawaii": "Kawaii",
    "settings.themes.name.light": "Light",
    "settings.themes.name.nuxeo": "Nuxeo",
    "shared-ui.confirm-dialog.cancel": "Cancel",
    "shared-ui.datepicker.calendar": "Calendar",
    "shared-ui.datepicker.choose-date": "Choose date",
    "shared-ui.datepicker.choose-month-and-year": "Choose month and year",
    "shared-ui.datepicker.close-calendar": "Close calendar",
    "shared-ui.datepicker.comparison-range": "Comparison range",
    "shared-ui.datepicker.end-date": "End date",
    "shared-ui.datepicker.next-24-years": "Next 24 years",
    "shared-ui.datepicker.next-month": "Next month",
    "shared-ui.datepicker.next-year": "Next year",
    "shared-ui.datepicker.open-calendar": "Open calendar",
    "shared-ui.datepicker.previous-24-years": "Previous 24 years",
    "shared-ui.datepicker.previous-month": "Previous month",
    "shared-ui.datepicker.previous-year": "Previous year",
    "shared-ui.datepicker.start-date": "Start date",
    "shared-ui.datepicker.year-range": "{{ start }} – {{ end }}",
    "shared-ui.datepicker.year-range-label": "{{ start }} to {{ end }}",
    "shared-ui.document-compare-dialog.close": "Close",
    "shared-ui.document-compare-dialog.compare-documents": "Compare documents",
    "shared-ui.document-compare-dialog.document-1": "Document 1",
    "shared-ui.document-compare-dialog.document-2": "Document 2",
    "shared-ui.document-compare-dialog.document-type-icon": "Document type icon",
    "shared-ui.document-compare-dialog.loading": "Loading",
    "shared-ui.document-compare-dialog.unified-view": "Unified view",
    "shared-ui.document-compare-dialog.view-all-data": "View all data",
    "shared-ui.document-viewer.additional-formats": "Additional Formats",
    "shared-ui.document-viewer.annotations-are-not-available-for-this": "Annotations are not available for this document.",
    "shared-ui.document-viewer.annotations-frame": "Annotations for {{ name }}",
    "shared-ui.document-viewer.audio-codec": "Audio Codec",
    "shared-ui.document-viewer.bit-depth-per-channel": "Bit Depth per Channel",
    "shared-ui.document-viewer.color-profile": "Color Profile",
    "shared-ui.document-viewer.dimensions": "Dimensions",
    "shared-ui.document-viewer.download": "Download",
    "shared-ui.document-viewer.download-named": "Download {{ name }}",
    "shared-ui.document-viewer.duration": "Duration",
    "shared-ui.document-viewer.exif": "EXIF",
    "shared-ui.document-viewer.exif-aperture": "Aperture",
    "shared-ui.document-viewer.exif-date": "Date",
    "shared-ui.document-viewer.exif-exposure": "Exposure",
    "shared-ui.document-viewer.exif-focal-length": "Focal Length",
    "shared-ui.document-viewer.exif-iso": "ISO",
    "shared-ui.document-viewer.exif-orientation": "Orientation",
    "shared-ui.document-viewer.format": "Format",
    "shared-ui.document-viewer.frame-rate": "Frame Rate",
    "shared-ui.document-viewer.iptc": "IPTC",
    "shared-ui.document-viewer.iptc-copyright": "Copyright",
    "shared-ui.document-viewer.iptc-description": "Description",
    "shared-ui.document-viewer.iptc-rights": "Rights",
    "shared-ui.document-viewer.iptc-source": "Source",
    "shared-ui.document-viewer.loading": "Loading",
    "shared-ui.document-viewer.note-frame": "Note content for {{ name }}",
    "shared-ui.document-viewer.open-with-nuxeo-drive": "Open with Nuxeo Drive",
    "shared-ui.document-viewer.pdf-frame": "PDF preview of {{ name }}",
    "shared-ui.document-viewer.picture-info": "Picture Info",
    "shared-ui.document-viewer.preview": "Preview",
    "shared-ui.document-viewer.preview-frame": "Preview of {{ name }}",
    "shared-ui.document-viewer.preview-not-available": "Preview not available",
    "shared-ui.document-viewer.remove-main-file": "Remove main file",
    "shared-ui.document-viewer.replace-main-file": "Replace main file",
    "shared-ui.document-viewer.resolution": "Resolution",
    "shared-ui.document-viewer.rotate-left": "Rotate left",
    "shared-ui.document-viewer.rotate-right": "Rotate right",
    "shared-ui.document-viewer.toggle-fit": "Toggle fit",
    "shared-ui.document-viewer.use-the-view-tab-for-the": "Use the View tab for the standard preview.",
    "shared-ui.document-viewer.video-codec": "Video Codec",
    "shared-ui.document-viewer.video-info": "Video Info",
    "shared-ui.document-viewer.weight": "Weight",
    "shared-ui.document-viewer.zoom-in": "Zoom in",
    "shared-ui.document-viewer.zoom-out": "Zoom out",
    "shared-ui.edit-collection-dialog.cancel": "Cancel",
    "shared-ui.edit-collection-dialog.coverage": "Coverage",
    "shared-ui.edit-collection-dialog.description": "Description",
    "shared-ui.edit-collection-dialog.edit-collection": "Edit Collection",
    "shared-ui.edit-collection-dialog.enter-a-valid-date": "Enter a valid date",
    "shared-ui.edit-collection-dialog.expires": "Expires",
    "shared-ui.edit-collection-dialog.nature": "Nature",
    "shared-ui.edit-collection-dialog.search": "Search…",
    "shared-ui.edit-collection-dialog.search-coverage": "Search Coverage",
    "shared-ui.edit-collection-dialog.search-nature": "Search Nature",
    "shared-ui.edit-collection-dialog.search-subjects": "Search Subjects",
    "shared-ui.edit-collection-dialog.subjects": "Subjects",
    "shared-ui.edit-collection-dialog.title": "Title",
    "shared-ui.export-dialog.cancel": "Cancel",
    "shared-ui.export-dialog.export": "Export",
    "shared-ui.message.failed-to-copy-link": "Failed to copy link",
    "shared-ui.message.failed-to-load-documents-for-comparison": "Failed to load documents for comparison.",
    "shared-ui.message.failed-to-load-vocabulary-options": "Failed to load vocabulary options",
    "shared-ui.message.failed-to-update-collection": "Failed to update collection",
    "shared-ui.message.link-copied-to-clipboard": "Link copied to clipboard",
    "shared-ui.message.select-two-different-documents-to-compare": "Select two different documents to compare.",
    "shared-ui.saved-search-dialog.cancel": "Cancel",
    "shared-ui.saved-search-dialog.no-slash": "You cannot use the character '/' in the name",
    "shared-ui.saved-search-dialog.save": "Save",
    "shared-ui.selection-topbar.clear": "Clear",
    "shared-ui.selection-topbar.close": "Close",
    "shared-ui.selection-topbar.close-selected-items-popup": "Close selected items popup",
    "shared-ui.selection-topbar.display-selection": "Display selection",
    "shared-ui.selection-topbar.selected-items": "Selected Items",
    "shared-ui.share-dialog.close": "Close",
    "shared-ui.share-dialog.copy-link": "Copy link",
    "shared-ui.share-dialog.internal-access-link-to": "Internal access link to {{ name }}.",
    "shared-ui.share-dialog.share-link": "Share link",
    "shared-ui.share-dialog.share-the-document": "Share the Document",
    "shared-ui.share-saved-search-add-permission-dialog.cancel": "Cancel",
    "shared-ui.share-saved-search-add-permission-dialog.create": "Create",
    "shared-ui.share-saved-search-add-permission-dialog.create-and-add-another": "Create And Add Another",
    "shared-ui.share-saved-search-add-permission-dialog.date-based": "Date-based",
    "shared-ui.share-saved-search-add-permission-dialog.from": "From",
    "shared-ui.share-saved-search-add-permission-dialog.hi-could-you-comment-on-this": "Hi! Could you comment on this document and...",
    "shared-ui.share-saved-search-add-permission-dialog.no-users-groups-found": "No users/groups found",
    "shared-ui.share-saved-search-add-permission-dialog.notification-email": "Notification email",
    "shared-ui.share-saved-search-add-permission-dialog.permanent": "Permanent",
    "shared-ui.share-saved-search-add-permission-dialog.please-enter-3-or-more-characters": "Please enter 3 or more characters",
    "shared-ui.share-saved-search-add-permission-dialog.right": "Right",
    "shared-ui.share-saved-search-add-permission-dialog.search-for-users-and-groups": "Search for users and groups",
    "shared-ui.share-saved-search-add-permission-dialog.send-an-email-to-notify-user": "Send an email to notify user",
    "shared-ui.share-saved-search-add-permission-dialog.time-frame": "Time Frame",
    "shared-ui.share-saved-search-add-permission-dialog.to": "To",
    "shared-ui.share-saved-search-add-permission-dialog.update": "Update",
    "shared-ui.share-saved-search-add-permission-dialog.user-group": "User / Group *",
    "shared-ui.share-saved-search-add-permission-dialog.user-group-2": "User / Group",
    "shared-ui.share-saved-search-dialog.actions": "Actions",
    "shared-ui.share-saved-search-dialog.close": "Close",
    "shared-ui.share-saved-search-dialog.close-dialog": "Close dialog",
    "shared-ui.share-saved-search-dialog.edit-external-permission": "Edit external permission",
    "shared-ui.share-saved-search-dialog.edit-permission": "Edit permission",
    "shared-ui.share-saved-search-dialog.granted-by": "Granted By",
    "shared-ui.share-saved-search-dialog.if-you-want-to-explicitly-control": "If you want to explicitly control access to this saved search, block permission inheritance. Any change made on parent level permissions will not affect this saved search.",
    "shared-ui.share-saved-search-dialog.loading": "Loading",
    "shared-ui.share-saved-search-dialog.loading-permissions": "Loading permissions...",
    "shared-ui.share-saved-search-dialog.new": "New",
    "shared-ui.share-saved-search-dialog.no-permissions-defined-click-add-to": "No permissions defined. Click \"Add\" to create one.",
    "shared-ui.share-saved-search-dialog.only-local-permissions-are-applied-unblock": "Only local permissions are applied. Unblock to restore the permissions inheritance from upper levels.",
    "shared-ui.share-saved-search-dialog.permissions-assigned-to-external-users": "Permissions Assigned to External Users",
    "shared-ui.share-saved-search-dialog.permissions-defined-locally": "Permissions defined locally",
    "shared-ui.share-saved-search-dialog.permissions-inherited-from-upper-levels": "Permissions inherited from upper levels",
    "shared-ui.share-saved-search-dialog.remove-external-permission": "Remove external permission",
    "shared-ui.share-saved-search-dialog.remove-permission": "Remove permission",
    "shared-ui.share-saved-search-dialog.right": "Right",
    "shared-ui.share-saved-search-dialog.send-notification": "Send notification",
    "shared-ui.share-saved-search-dialog.share-saved-search": "Share Saved Search",
    "shared-ui.share-saved-search-dialog.sharing-with-external-users-does-not": "Sharing with external users does not create new user accounts. External users are provided a link to access this saved search.",
    "shared-ui.share-saved-search-dialog.the-saved-search-is-not-shared": "The saved search is not shared with any external user.",
    "shared-ui.share-saved-search-dialog.time-frame": "Time Frame",
    "shared-ui.share-saved-search-dialog.user-group": "User / Group",
    "shared-ui.share-saved-search-external-dialog.cancel": "Cancel",
    "shared-ui.share-saved-search-external-dialog.create-and-add-another": "Create And Add Another",
    "shared-ui.share-saved-search-external-dialog.email": "Email",
    "shared-ui.share-saved-search-external-dialog.email-2": "Email *",
    "shared-ui.share-saved-search-external-dialog.from": "From",
    "shared-ui.share-saved-search-external-dialog.hi-could-you-comment-on-this": "Hi! Could you comment on this document and...",
    "shared-ui.share-saved-search-external-dialog.notification-email": "Notification email",
    "shared-ui.share-saved-search-external-dialog.right": "Right",
    "shared-ui.share-saved-search-external-dialog.share-with-external-user": "Share With External User",
    "shared-ui.share-saved-search-external-dialog.to": "To *",
    "shared-ui.ui.ui-works": "Ui works!",
    "shared.content-lake.bulk-ingest-failed": "Bulk ingest request failed.",
    "shared.content-lake.ingest-stalled": "Content Lake ingest command {{ commandId }} did not finish. Last Nuxeo bulk state was {{ state }} ({{ processed }}/{{ total }} processed). Check the Nuxeo HxAI connector logs and ingest credentials, then retry.",
    "shared.content-lake.ingest-stalled-unknown-total": "Content Lake ingest command {{ commandId }} did not finish. Last Nuxeo bulk state was {{ state }} ({{ processed }}/unknown processed). Check the Nuxeo HxAI connector logs and ingest credentials, then retry.",
    "shared.content-lake.no-command-id": "Bulk ingest did not return a command id.",
    "shared.remove-item": "Remove {{ name }}",
    "tab.tabs-ai-insights": "AI Insights",
    "tab.tabs-annotations": "Annotations",
    "tab.tabs-history": "History",
    "tab.tabs-permissions": "Permissions",
    "tab.tabs-publishing": "Publishing",
    "tab.tabs-view": "View",
    "ui.actual-size": "Actual size",
    "ui.add-a-permission": "Add a Permission",
    "ui.block": "Block",
    "ui.confirm": "Confirm",
    "ui.create": "Create",
    "ui.document-compare-dialog.no-differences-found-between-the-selected": "No differences found between the selected documents.",
    "ui.document-compare-dialog.no-document-data-available-to-compare": "No document data available to compare.",
    "ui.document-viewer.your-browser-does-not-support-video": "Your browser does not support video playback.",
    "ui.edit-collection-dialog.save": "Save",
    "ui.enter-a-name-for-your-saved": "Enter a name for your saved search",
    "ui.fit-to-viewer": "Fit to viewer",
    "ui.saved-search": "Saved Search",
    "ui.unblock": "Unblock",
    "ui.update": "Update"
};
// @generated-end

/**
 * The placeholder hint for a date input, in the active locale's field order.
 *
 * ## The gap this closes
 *
 * `common.date-mask` is a translation key, so it resolves per **language** — `mm/dd/yyyy` for
 * `en`, `jj/mm/aaaa` for `fr`. The adapter resolves per **locale tag**, region included, and a
 * region can reorder the fields outright: `en-GB` parses `dd/MM/yyyy`. These dialogs are
 * exported from `@nuxeo/satori-platform/ui`, so a host's `LOCALE_ID` reaches the adapter
 * unclamped while the catalogue still answers for the bare language. A host on `en-GB` using
 * the documented English fallback was therefore told to type month-first while its field read
 * day-first — the silent swap this adapter exists to remove, wearing a different locale id.
 *
 * ## Why it composes rather than deriving the whole mask
 *
 * The letters are translated and the order is not. date-fns knows the order and separators for
 * every region; only a translator knows that a German reader expects `tt.mm.jjjj` and a French
 * one `jj/mm/aaaa`. Deriving the whole hint from date-fns would hand every language Latin
 * `dd/MM/yyyy` and throw that work away, so the order and separators come from the adapter's
 * own format and the letters come from the catalogue. Each half keeps one source of truth.
 *
 * `fr-CH` is the separator-only case (`jj.mm.aaaa`), `en-GB` the order-only case
 * (`dd/mm/yyyy`), `fr-CA` both at once (`aa-mm-jj`).
 *
 * ## The letters are not always in `LOCALE_ID`'s order
 *
 * A host using `providePlatformEnglishFallback()` for a language whose catalogue has no
 * `common.date-mask` is handed the **platform's English**, so the letters arrive in English
 * order while `LOCALE_ID` says otherwise. Reading them as that language's own mask is how the
 * first version of this function reintroduced the defect it was written to remove: `fr` kept
 * the month-first `mm/dd/yyyy` because French's own pattern matched itself, and `fr-CA`
 * composed English runs through French field positions and produced `yy-dd-mm`.
 *
 * So the order the letters are *in* is tracked separately from the order they are wanted in —
 * see `sourcePattern`. With it, the English fallback now follows the adapter for every
 * language: `fr` renders `dd/mm/yyyy`, `de` renders `dd.mm.yyyy`, `fr-CA` renders `yy-mm-dd`.
 *
 * ## Why it fails back to the translated value
 *
 * Every exit that cannot line the two up returns `translatedMask` untouched. A hint that
 * disagrees with the parser is worse than an English one, but a hint this function mangled
 * would be worse still, and it has no way to tell a catalogue it cannot parse from one it has
 * misread. Returning the translator's own string is the one outcome that is never a regression.
 */
function dateMaskFor(localeId, translatedMask) {
    const language = (localeId ?? '').toLowerCase().replaceAll('_', '-').split('-')[0];
    const target = shortDatePattern(localeId);
    const source = sourcePattern(translatedMask, language);
    // The mask's letters are already in the order this field parses: every language we ship a
    // catalogue for, and every region whose order and separators match it. Leave it exactly as is.
    if (target === source)
        return translatedMask;
    const sourceFields = patternFields(source);
    const letters = maskLetters(translatedMask);
    if (!letters || letters.length !== sourceFields.length)
        return translatedMask;
    const lettersByField = new Map();
    sourceFields.forEach((field, index) => lettersByField.set(field, letters[index]));
    let composed = '';
    for (const segment of patternSegments(target)) {
        if (typeof segment === 'string') {
            composed += segment;
            continue;
        }
        const word = lettersByField.get(segment.field);
        if (!word)
            return translatedMask;
        // A two-digit year gets two letters; `y`, `yy` and `yyyy` are the only widths date-fns
        // uses here, and the catalogues spell the wide year out in full.
        composed += segment.field === 'year' && segment.width === 2 ? word.slice(0, 2) : word;
    }
    return composed;
}
/** What `providePlatformEnglishFallback()` answers with when a catalogue has no mask. */
const PLATFORM_EN_MASK = PLATFORM_EN_TRANSLATIONS['common.date-mask'];
/**
 * The pattern whose field order the mask's letters are already in.
 *
 * Normally the language in `LOCALE_ID`, because that language's catalogue answered. The
 * exception is the platform's English fallback, which answers for any language whose catalogue
 * lacks the key — then the letters are English and in English order, whatever `LOCALE_ID` says.
 *
 * Recognising it by value is exact for the one case that matters and cannot misfire on a
 * shipped catalogue: no language's own mask is `mm/dd/yyyy` except English's. A host that
 * writes a month-first mask into its own non-English catalogue is read as English and gets its
 * fields reordered to match the parser — which is the right outcome for a mask that was already
 * disagreeing with the field.
 *
 * What this does **not** catch is a host whose own fallback chain answers in some third
 * language. Nothing in the string says which language wrote it, so that case is out of reach
 * here; it stays with the host that configured the chain.
 */
function sourcePattern(translatedMask, language) {
    if ((translatedMask ?? '').trim() === PLATFORM_EN_MASK)
        return shortDatePattern('en');
    return shortDatePattern(language);
}
/**
 * date-fns' own short date format for a locale — `MM/dd/yyyy`, `dd.MM.y`, `yy-MM-dd`.
 *
 * `formatLong` is optional on date-fns' `Locale`, so an empty string stands for "no pattern".
 * Two of those compare equal, which lands on the unchanged-mask path rather than composing from
 * a shape nobody stated.
 */
function shortDatePattern(localeId) {
    return dateFnsLocaleFor(localeId).formatLong?.date({ width: 'short' }) ?? '';
}
const FIELD_FOR_PATTERN_LETTER = {
    d: 'day',
    M: 'month',
    y: 'year',
};
/** The pattern split into field runs and the literal text between them, in order. */
function patternSegments(pattern) {
    const segments = [];
    for (const run of pattern.match(/([dMy])\1*|[^dMy]+/g) ?? []) {
        const field = FIELD_FOR_PATTERN_LETTER[run[0]];
        segments.push(field ? { field, width: run.length } : run);
    }
    return segments;
}
/** Just the fields of a pattern, in order: `MM/dd/yyyy` is month, day, year. */
function patternFields(pattern) {
    return patternSegments(pattern)
        .filter((segment) => typeof segment !== 'string')
        .map((segment) => segment.field);
}
/**
 * The letter runs of a translated mask: `jj/mm/aaaa` is `['jj', 'mm', 'aaaa']`.
 *
 * `null` when the value is not a bare mask — every run one letter repeated, with only
 * punctuation between them. That is the shape `review-guardrails`' date-pattern arm already
 * holds `common.date-mask` to in all seven catalogues, so anything else means the caller handed
 * this function something other than a mask and it must not try to reshape it.
 */
function maskLetters(translatedMask) {
    const mask = (translatedMask ?? '').trim();
    // Letter runs with only field punctuation between them. A literal segment such as Japanese
    // `年` is not rejected because it is wrong, but because reshaping around one needs to know
    // which field each literal belongs to; falling back leaves the translator's value intact.
    if (!/^\p{L}+(?:[/\-.,: ]+\p{L}+)+$/u.test(mask))
        return null;
    const runs = mask.match(/\p{L}+/gu) ?? [];
    if (runs.some((run) => [...run].some((character) => character !== run[0])))
        return null;
    return runs;
}

/**
 * `{{ 'common.date-mask' | translate | dateMask }}` — the translated date hint, reordered into
 * the active region's field order.
 *
 * It takes the translated value rather than the key so that `TranslatePipe` upstream keeps
 * owning the language: that pipe is already impure and re-emits on a language change, so this
 * one can stay pure and reshape whatever it is handed. `LOCALE_ID` cannot change without a
 * reload, so there is nothing else here to react to.
 */
class DateMaskPipe {
    localeId = inject(LOCALE_ID);
    transform(translatedMask) {
        return dateMaskFor(this.localeId, translatedMask ?? '');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DateMaskPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.33", ngImport: i0, type: DateMaskPipe, isStandalone: true, name: "dateMask" });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: DateMaskPipe, decorators: [{
            type: Pipe,
            args: [{
                    name: 'dateMask',
                    standalone: true,
                }]
        }] });

class EditCollectionDialogComponent {
    dialogRef = inject((MatDialogRef));
    translate = inject(TranslateService);
    data = inject(MAT_DIALOG_DATA);
    collectionService = inject(CollectionService);
    directoryService = inject(DirectoryService);
    destroyRef = inject(DestroyRef);
    toast = inject(NxsToastService);
    dateAdapter = inject(DateAdapter);
    dateFormats = inject(MAT_DATE_FORMATS);
    l10nEntryLabel = l10nEntryLabel;
    directoryPickerLabel = directoryPickerLabel;
    expiresNgModel;
    natureEntries = signal([], ...(ngDevMode ? [{ debugName: "natureEntries" }] : []));
    subjectEntries = signal([], ...(ngDevMode ? [{ debugName: "subjectEntries" }] : []));
    coverageEntries = signal([], ...(ngDevMode ? [{ debugName: "coverageEntries" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    naturePanelSearch = '';
    subjectsPanelSearch = '';
    coveragePanelSearch = '';
    filteredNatureOptions() {
        return filterDirectoryPickerEntries(this.natureEntries(), this.naturePanelSearch);
    }
    groupedSubjectOptions() {
        return groupL10nChildrenByParent(this.subjectEntries(), this.subjectsPanelSearch);
    }
    groupedCoverageOptions() {
        return groupL10nChildrenByParent(this.coverageEntries(), this.coveragePanelSearch);
    }
    title = '';
    description = '';
    nature = null;
    subjects = [];
    coverage = null;
    expires = null;
    expiresRawText = '';
    expiresErrorMatcher = createExpiresErrorStateMatcher(() => this.showExpiresError());
    ngOnInit() {
        const doc = this.data.document;
        const props = doc.properties ?? {};
        this.title = props['dc:title'] ?? doc.title ?? '';
        this.description = props['dc:description'] ?? '';
        this.nature = props['dc:nature'] ?? null;
        this.subjects = props['dc:subjects'] ?? [];
        this.coverage = props['dc:coverage'] ?? null;
        const rawExpires = props['dc:expired'];
        this.expires = rawExpires ? new Date(rawExpires) : null;
        forkJoin({
            nature: this.directoryService.getEntries('nature'),
            subjects: this.directoryService.getAllL10nEntries('l10nsubjects'),
            coverage: this.directoryService.getAllL10nEntries('l10ncoverage'),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ nature, subjects, coverage }) => {
                this.natureEntries.set(nature);
                this.subjectEntries.set(subjects);
                this.coverageEntries.set(coverage);
            },
            error: () => {
                this.toast.error(this.translate.instant('shared-ui.message.failed-to-load-vocabulary-options'));
            },
        });
    }
    onNaturePanelOpen(open) {
        if (!open) {
            this.naturePanelSearch = '';
            return;
        }
        this.loadNatureEntries();
    }
    loadNatureEntries() {
        this.directoryService
            .getEntries('nature')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => this.natureEntries.set(entries),
        });
    }
    naturePillLabel(id) {
        const entry = this.natureEntries().find((item) => item.id === id);
        return entry ? directoryPickerLabel(entry) : id;
    }
    subjectPillLabel(id) {
        return formatHierarchicalL10nLabel(id, this.subjectEntries());
    }
    coveragePillLabel(id) {
        return formatHierarchicalL10nLabel(id, this.coverageEntries());
    }
    clearNature() {
        this.nature = null;
    }
    clearCoverage() {
        this.coverage = null;
    }
    removeSubject(id) {
        this.subjects = this.subjects.filter((value) => value !== id);
    }
    onSubjectsPanelOpen(open) {
        if (!open) {
            this.subjectsPanelSearch = '';
            return;
        }
        this.loadL10nEntries('l10nsubjects', this.subjectEntries);
    }
    onCoveragePanelOpen(open) {
        if (!open) {
            this.coveragePanelSearch = '';
            return;
        }
        this.loadL10nEntries('l10ncoverage', this.coverageEntries);
    }
    loadL10nEntries(directoryName, target) {
        this.directoryService
            .getAllL10nEntries(directoryName)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (entries) => target.set(entries),
        });
    }
    isExpiresValid() {
        const parsed = this.expiresRawText.trim()
            ? this.dateAdapter.parse(this.expiresRawText, this.dateFormats.parse.dateInput)
            : this.expires;
        return isExpiresFieldValid(this.expiresRawText, parsed);
    }
    showExpiresError() {
        return !this.isExpiresValid();
    }
    onExpiresInput(event) {
        this.expiresRawText = event.target.value;
        // Parse synchronously so validation and the saved payload agree even before ngModel updates.
        this.expires = this.dateAdapter.parse(this.expiresRawText.trim(), this.dateFormats.parse.dateInput);
        const ctrl = this.expiresNgModel?.control;
        if (ctrl) {
            ctrl.markAsDirty();
            ctrl.markAsTouched();
            ctrl.updateValueAndValidity({ emitEvent: false });
        }
    }
    onExpiresChange(value) {
        this.expires = value;
        if (value && !Number.isNaN(value.getTime())) {
            this.expiresRawText = '';
        }
    }
    save() {
        if (!this.title.trim() || this.saving() || !this.isExpiresValid())
            return;
        this.saving.set(true);
        const properties = {
            'dc:title': this.title.trim(),
            'dc:description': this.description.trim() || null,
            'dc:nature': this.nature || null,
            'dc:subjects': this.subjects,
            'dc:coverage': this.coverage || null,
            'dc:expired': this.expires && !Number.isNaN(this.expires.getTime()) ? this.expires.toISOString() : null,
        };
        this.collectionService
            .updateProperties(this.data.document.uid, properties)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updatedDoc) => {
                this.saving.set(false);
                this.dialogRef.close(updatedDoc);
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(isPermissionDeniedError(err)
                    ? this.translate.instant(PERMISSION_DENIED_KEY)
                    : this.translate.instant('shared-ui.message.failed-to-update-collection'));
            },
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: EditCollectionDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: EditCollectionDialogComponent, isStandalone: true, selector: "lib-edit-collection-dialog", providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()], viewQueries: [{ propertyName: "expiresNgModel", first: true, predicate: ["expiresInput"], descendants: true }], ngImport: i0, template: "<h2 mat-dialog-title>{{ 'shared-ui.edit-collection-dialog.edit-collection' | translate }}</h2>\n\n<mat-dialog-content>\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.title' | translate }}</mat-label>\n    <input matInput [(ngModel)]=\"title\" required />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.description' | translate }}</mat-label>\n    <textarea matInput [(ngModel)]=\"description\" rows=\"2\"></textarea>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.nature' | translate }}</mat-label>\n    <mat-select\n      #natureSelect\n      [(ngModel)]=\"nature\"\n      panelClass=\"vocab-select-panel\"\n      (openedChange)=\"onNaturePanelOpen($event)\"\n      (selectionChange)=\"natureSelect.close()\"\n    >\n      <mat-select-trigger>\n        @if (nature; as natureId) {\n          <mat-chip-set class=\"vocab-trigger-chips\">\n            <mat-chip (removed)=\"clearNature()\">\n              {{ naturePillLabel(natureId) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'shared.remove-item' | translate: { name: naturePillLabel(natureId) }\n                \"\n                (click)=\"$event.stopPropagation(); clearNature()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          </mat-chip-set>\n        }\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'shared-ui.edit-collection-dialog.search' | translate\"\n          [attr.aria-label]=\"'shared-ui.edit-collection-dialog.search-nature' | translate\"\n          [(ngModel)]=\"naturePanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (entry of filteredNatureOptions(); track entry.id) {\n          <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.subjects' | translate }}</mat-label>\n    <mat-select\n      [(ngModel)]=\"subjects\"\n      multiple\n      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n      (openedChange)=\"onSubjectsPanelOpen($event)\"\n    >\n      <mat-select-trigger>\n        <mat-chip-set class=\"vocab-trigger-chips\">\n          @for (id of subjects; track id) {\n            <mat-chip (removed)=\"removeSubject(id)\">\n              {{ subjectPillLabel(id) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"'shared.remove-item' | translate: { name: subjectPillLabel(id) }\"\n                (click)=\"$event.stopPropagation()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          }\n        </mat-chip-set>\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'shared-ui.edit-collection-dialog.search' | translate\"\n          [attr.aria-label]=\"'shared-ui.edit-collection-dialog.search-subjects' | translate\"\n          [(ngModel)]=\"subjectsPanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (group of groupedSubjectOptions(); track group.parentLabel) {\n          <mat-optgroup [label]=\"group.parentLabel\">\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n            }\n          </mat-optgroup>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.coverage' | translate }}</mat-label>\n    <mat-select\n      #coverageSelect\n      [(ngModel)]=\"coverage\"\n      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n      (openedChange)=\"onCoveragePanelOpen($event)\"\n      (selectionChange)=\"coverageSelect.close()\"\n    >\n      <mat-select-trigger>\n        @if (coverage; as coverageId) {\n          <mat-chip-set class=\"vocab-trigger-chips\">\n            <mat-chip (removed)=\"clearCoverage()\">\n              {{ coveragePillLabel(coverageId) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'shared.remove-item' | translate: { name: coveragePillLabel(coverageId) }\n                \"\n                (click)=\"$event.stopPropagation(); clearCoverage()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          </mat-chip-set>\n        }\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'shared-ui.edit-collection-dialog.search' | translate\"\n          [attr.aria-label]=\"'shared-ui.edit-collection-dialog.search-coverage' | translate\"\n          [(ngModel)]=\"coveragePanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (group of groupedCoverageOptions(); track group.parentLabel) {\n          <mat-optgroup [label]=\"group.parentLabel\">\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n            }\n          </mat-optgroup>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field\n    appearance=\"outline\"\n    subscriptSizing=\"dynamic\"\n    class=\"full-width\"\n    [class.expires-field-invalid]=\"showExpiresError()\"\n  >\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.expires' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"expires\"\n      [matDatepicker]=\"picker\"\n      [ngModel]=\"expires\"\n      [errorStateMatcher]=\"expiresErrorMatcher\"\n      (ngModelChange)=\"onExpiresChange($event)\"\n      (input)=\"onExpiresInput($event)\"\n      #expiresInput=\"ngModel\"\n      [placeholder]=\"'common.date-mask' | translate | dateMask\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n    <mat-datepicker #picker />\n    @if (showExpiresError()) {\n      <mat-error>{{ 'shared-ui.edit-collection-dialog.enter-a-valid-date' | translate }}</mat-error>\n    }\n  </mat-form-field>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close>\n    {{ 'shared-ui.edit-collection-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!title.trim() || saving() || !isExpiresValid()\"\n    (click)=\"save()\"\n  >\n    @if (saving()) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'ui.edit-collection-dialog.save' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:480px}mat-dialog-content{display:flex;flex-direction:column;gap:20px;padding-top:12px!important}.full-width{width:100%}mat-dialog-actions{display:flex;padding:8px 24px 16px}.spacer{flex:1}.expires-field-invalid ::ng-deep .mdc-notched-outline__leading,.expires-field-invalid ::ng-deep .mdc-notched-outline__notch,.expires-field-invalid ::ng-deep .mdc-notched-outline__trailing{border-color:var(--mat-sys-error, #b3261e)}::ng-deep .mat-mdc-select-panel.vocab-select-panel{display:flex;flex-direction:column;overflow:hidden;max-height:320px;padding-top:0}::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search{flex:0 0 auto;padding:8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant, #e5e7eb)}::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search input{width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid var(--mat-sys-outline-variant, #d1d5db);border-radius:4px;font:inherit;font-size:.875rem}::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__list{flex:1 1 auto;min-height:0;overflow-y:auto}::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup-label,::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup .mdc-list-group__subheader{font-weight:700;font-size:.8125rem;background:var(--mat-sys-surface-container-low, #fafafa);padding:10px 16px 6px;border-bottom:1px solid var(--mat-sys-outline-variant, #f0f0f0)}::ng-deep .vocab-field .mat-mdc-select-trigger{height:auto;min-height:24px;overflow:visible}.vocab-trigger-chips{display:flex;flex-wrap:wrap;gap:4px;width:100%;padding:6px 8px 6px 12px;box-sizing:border-box}::ng-deep .vocab-trigger-chips .mdc-evolution-chip{margin:2px 4px 2px 0}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$1.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$1.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$1.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1$1.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$3.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$3.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$3.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$3.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i5.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "directive", type: i5.MatSelectTrigger, selector: "mat-select-trigger" }, { kind: "component", type: i5.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i5.MatOptgroup, selector: "mat-optgroup", inputs: ["label", "disabled"], exportAs: ["matOptgroup"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i2.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i7$2.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i7$2.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i7$2.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatProgressSpinnerModule }, { kind: "component", type: i4.MatProgressSpinner, selector: "mat-progress-spinner, mat-spinner", inputs: ["color", "mode", "value", "diameter", "strokeWidth"], exportAs: ["matProgressSpinner"] }, { kind: "ngmodule", type: MatChipsModule }, { kind: "component", type: i9.MatChip, selector: "mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]", inputs: ["role", "id", "aria-label", "aria-description", "value", "color", "removable", "highlighted", "disableRipple", "disabled"], outputs: ["removed", "destroyed"], exportAs: ["matChip"] }, { kind: "directive", type: i9.MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: i9.MatChipSet, selector: "mat-chip-set", inputs: ["disabled", "role", "tabIndex"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i3.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: DateMaskPipe, name: "dateMask" }, { kind: "pipe", type: TranslatePipe, name: "translate" }] });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: EditCollectionDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'lib-edit-collection-dialog', standalone: true, imports: [
                        DateMaskPipe,
                        TranslatePipe,
                        FormsModule,
                        MatDialogModule,
                        MatFormFieldModule,
                        MatInputModule,
                        MatSelectModule,
                        MatButtonModule,
                        MatDatepickerModule,
                        MatProgressSpinnerModule,
                        MatChipsModule,
                        MatIconModule,
                    ], providers: [provideSatoriDateAdapter(), provideTranslatedDatepickerIntl(), provideNxsToast()], template: "<h2 mat-dialog-title>{{ 'shared-ui.edit-collection-dialog.edit-collection' | translate }}</h2>\n\n<mat-dialog-content>\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.title' | translate }}</mat-label>\n    <input matInput [(ngModel)]=\"title\" required />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.description' | translate }}</mat-label>\n    <textarea matInput [(ngModel)]=\"description\" rows=\"2\"></textarea>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.nature' | translate }}</mat-label>\n    <mat-select\n      #natureSelect\n      [(ngModel)]=\"nature\"\n      panelClass=\"vocab-select-panel\"\n      (openedChange)=\"onNaturePanelOpen($event)\"\n      (selectionChange)=\"natureSelect.close()\"\n    >\n      <mat-select-trigger>\n        @if (nature; as natureId) {\n          <mat-chip-set class=\"vocab-trigger-chips\">\n            <mat-chip (removed)=\"clearNature()\">\n              {{ naturePillLabel(natureId) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'shared.remove-item' | translate: { name: naturePillLabel(natureId) }\n                \"\n                (click)=\"$event.stopPropagation(); clearNature()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          </mat-chip-set>\n        }\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'shared-ui.edit-collection-dialog.search' | translate\"\n          [attr.aria-label]=\"'shared-ui.edit-collection-dialog.search-nature' | translate\"\n          [(ngModel)]=\"naturePanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (entry of filteredNatureOptions(); track entry.id) {\n          <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.subjects' | translate }}</mat-label>\n    <mat-select\n      [(ngModel)]=\"subjects\"\n      multiple\n      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n      (openedChange)=\"onSubjectsPanelOpen($event)\"\n    >\n      <mat-select-trigger>\n        <mat-chip-set class=\"vocab-trigger-chips\">\n          @for (id of subjects; track id) {\n            <mat-chip (removed)=\"removeSubject(id)\">\n              {{ subjectPillLabel(id) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"'shared.remove-item' | translate: { name: subjectPillLabel(id) }\"\n                (click)=\"$event.stopPropagation()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          }\n        </mat-chip-set>\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'shared-ui.edit-collection-dialog.search' | translate\"\n          [attr.aria-label]=\"'shared-ui.edit-collection-dialog.search-subjects' | translate\"\n          [(ngModel)]=\"subjectsPanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (group of groupedSubjectOptions(); track group.parentLabel) {\n          <mat-optgroup [label]=\"group.parentLabel\">\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n            }\n          </mat-optgroup>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"full-width vocab-field\">\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.coverage' | translate }}</mat-label>\n    <mat-select\n      #coverageSelect\n      [(ngModel)]=\"coverage\"\n      panelClass=\"vocab-select-panel vocab-grouped-select-panel\"\n      (openedChange)=\"onCoveragePanelOpen($event)\"\n      (selectionChange)=\"coverageSelect.close()\"\n    >\n      <mat-select-trigger>\n        @if (coverage; as coverageId) {\n          <mat-chip-set class=\"vocab-trigger-chips\">\n            <mat-chip (removed)=\"clearCoverage()\">\n              {{ coveragePillLabel(coverageId) }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'shared.remove-item' | translate: { name: coveragePillLabel(coverageId) }\n                \"\n                (click)=\"$event.stopPropagation(); clearCoverage()\"\n              >\n                <mat-icon>cancel</mat-icon>\n              </button>\n            </mat-chip>\n          </mat-chip-set>\n        }\n      </mat-select-trigger>\n      <div class=\"vocab-panel__search\">\n        <input\n          type=\"text\"\n          [placeholder]=\"'shared-ui.edit-collection-dialog.search' | translate\"\n          [attr.aria-label]=\"'shared-ui.edit-collection-dialog.search-coverage' | translate\"\n          [(ngModel)]=\"coveragePanelSearch\"\n          [ngModelOptions]=\"{ standalone: true }\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"vocab-panel__list\">\n        @for (group of groupedCoverageOptions(); track group.parentLabel) {\n          <mat-optgroup [label]=\"group.parentLabel\">\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n            }\n          </mat-optgroup>\n        }\n      </div>\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field\n    appearance=\"outline\"\n    subscriptSizing=\"dynamic\"\n    class=\"full-width\"\n    [class.expires-field-invalid]=\"showExpiresError()\"\n  >\n    <mat-label>{{ 'shared-ui.edit-collection-dialog.expires' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"expires\"\n      [matDatepicker]=\"picker\"\n      [ngModel]=\"expires\"\n      [errorStateMatcher]=\"expiresErrorMatcher\"\n      (ngModelChange)=\"onExpiresChange($event)\"\n      (input)=\"onExpiresInput($event)\"\n      #expiresInput=\"ngModel\"\n      [placeholder]=\"'common.date-mask' | translate | dateMask\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n    <mat-datepicker #picker />\n    @if (showExpiresError()) {\n      <mat-error>{{ 'shared-ui.edit-collection-dialog.enter-a-valid-date' | translate }}</mat-error>\n    }\n  </mat-form-field>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button mat-dialog-close>\n    {{ 'shared-ui.edit-collection-dialog.cancel' | translate }}\n  </button>\n  <span class=\"spacer\"></span>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    [disabled]=\"!title.trim() || saving() || !isExpiresValid()\"\n    (click)=\"save()\"\n  >\n    @if (saving()) {\n      <mat-spinner diameter=\"18\" />\n    } @else {\n      {{ 'ui.edit-collection-dialog.save' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;min-width:480px}mat-dialog-content{display:flex;flex-direction:column;gap:20px;padding-top:12px!important}.full-width{width:100%}mat-dialog-actions{display:flex;padding:8px 24px 16px}.spacer{flex:1}.expires-field-invalid ::ng-deep .mdc-notched-outline__leading,.expires-field-invalid ::ng-deep .mdc-notched-outline__notch,.expires-field-invalid ::ng-deep .mdc-notched-outline__trailing{border-color:var(--mat-sys-error, #b3261e)}::ng-deep .mat-mdc-select-panel.vocab-select-panel{display:flex;flex-direction:column;overflow:hidden;max-height:320px;padding-top:0}::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search{flex:0 0 auto;padding:8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant, #e5e7eb)}::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__search input{width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid var(--mat-sys-outline-variant, #d1d5db);border-radius:4px;font:inherit;font-size:.875rem}::ng-deep .mat-mdc-select-panel.vocab-select-panel .vocab-panel__list{flex:1 1 auto;min-height:0;overflow-y:auto}::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup-label,::ng-deep .vocab-grouped-select-panel .mat-mdc-optgroup .mdc-list-group__subheader{font-weight:700;font-size:.8125rem;background:var(--mat-sys-surface-container-low, #fafafa);padding:10px 16px 6px;border-bottom:1px solid var(--mat-sys-outline-variant, #f0f0f0)}::ng-deep .vocab-field .mat-mdc-select-trigger{height:auto;min-height:24px;overflow:visible}.vocab-trigger-chips{display:flex;flex-wrap:wrap;gap:4px;width:100%;padding:6px 8px 6px 12px;box-sizing:border-box}::ng-deep .vocab-trigger-chips .mdc-evolution-chip{margin:2px 4px 2px 0}\n"] }]
        }], propDecorators: { expiresNgModel: [{
                type: ViewChild,
                args: ['expiresInput']
            }] } });

/** Web UI `deleteButton.confirm` — soft-delete one document (move to trash). */
function trashDocumentConfirmData(title, translate) {
    const trimmed = title.trim();
    return {
        title: translate('confirm.move-to-trash'),
        // One parameterised string per branch, never a concatenation: a translator needs the whole
        // sentence to choose case and word order, and `"{{ name }}"` moves inside the clause in
        // several languages.
        message: trimmed
            ? translate('confirm.move-named-to-trash', { name: trimmed })
            : translate('confirm.delete-the-document'),
        confirmLabel: translate('confirm.delete'),
    };
}
/**
 * Web UI bulk soft-delete (`deleteDocumentsButton.confirm.deleteDocuments` /
 * `label.documents.confirmDeleteDocuments`) — never names a single item when multiple are selected.
 */
function trashSelectedDocumentsConfirmData(count, translate) {
    if (count <= 1) {
        return {
            title: translate('confirm.move-to-trash'),
            message: translate('confirm.delete-the-document'),
            confirmLabel: translate('confirm.delete'),
        };
    }
    return {
        title: translate('confirm.move-to-trash'),
        // The singular case is handled by the branch above rather than by an `(s)` suffix. That
        // suffix is untranslatable: it assumes a language pluralises by appending one letter, and
        // most do not.
        message: translate('confirm.delete-selected-documents', { count }),
        confirmLabel: translate('confirm.delete'),
    };
}

/**
 * MatInput mirrors Validators.required as both native `required` and `aria-required="true"`.
 * IBM Equal Access flags the duplicate (aria_attribute_redundant). Native `required` is enough for AT.
 */
function stripRedundantMatInputAriaRequired(input) {
    if (input?.required && input.getAttribute('aria-required') === 'true') {
        input.removeAttribute('aria-required');
    }
}
/** Strips on setup and whenever MatInput re-applies aria-required. */
function observeStripRedundantMatInputAriaRequired(input) {
    if (!input) {
        return null;
    }
    const strip = () => stripRedundantMatInputAriaRequired(input);
    strip();
    if (typeof MutationObserver === 'undefined') {
        return null;
    }
    const observer = new MutationObserver(strip);
    observer.observe(input, {
        attributes: true,
        attributeFilter: ['aria-required', 'required'],
    });
    return observer;
}

/**
 * IBM Equal Access `aria_keyboard_handler_exists` (NXENG-821, issue 1036659222) inspects the
 * element with `role="tablist"`. The checker-engine rule only treats inline `onkeydown`,
 * `onkeypress`, or `onkeyup` attributes as handlers — not `addEventListener`. Material binds
 * keyboard handling on `.mat-mdc-tab-label-container` instead, so the tablist node fails the
 * static check even though arrow-key navigation works on the tab buttons.
 */
const MAT_TAB_LIST_KEYDOWN_ATTR = 'data-satori-tablist-keydown';
/** Inert inline handler IBM's static rule can detect; Material still owns tab navigation. */
const MAT_TAB_LIST_IBM_ONKEYDOWN = 'void(0)';
/**
 * Attach IBM-detectable keyboard metadata on the Material tablist node inside `root`.
 * Returns cleanup when this call attaches metadata, or `null` when it makes no change.
 */
function wireMatTabListKeyboardA11y(root) {
    const tabList = root.querySelector('.mat-mdc-tab-list[role="tablist"]');
    if (!tabList) {
        return null;
    }
    if (tabList.getAttribute(MAT_TAB_LIST_KEYDOWN_ATTR) === 'true') {
        return null;
    }
    const existingOnKeydown = tabList.getAttribute('onkeydown');
    if (existingOnKeydown !== null && existingOnKeydown !== MAT_TAB_LIST_IBM_ONKEYDOWN) {
        return null;
    }
    const appliedOnKeydown = existingOnKeydown === null;
    if (appliedOnKeydown) {
        tabList.setAttribute('onkeydown', MAT_TAB_LIST_IBM_ONKEYDOWN);
    }
    tabList.setAttribute(MAT_TAB_LIST_KEYDOWN_ATTR, 'true');
    return () => {
        if (appliedOnKeydown && tabList.getAttribute('onkeydown') === MAT_TAB_LIST_IBM_ONKEYDOWN) {
            tabList.removeAttribute('onkeydown');
        }
        tabList.removeAttribute(MAT_TAB_LIST_KEYDOWN_ATTR);
    };
}
/** Re-wire when Material re-renders tab labels (dynamic tab sets). */
function observeMatTabListKeyboardA11y(root) {
    if (typeof MutationObserver === 'undefined') {
        const cleanup = wireMatTabListKeyboardA11y(root);
        return cleanup ?? null;
    }
    let tabListCleanup = null;
    const sync = () => {
        const next = wireMatTabListKeyboardA11y(root);
        if (!next) {
            return;
        }
        tabListCleanup?.();
        tabListCleanup = next;
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { childList: true, subtree: true });
    return () => {
        observer.disconnect();
        tabListCleanup?.();
    };
}

/**
 * Sets IBM-detectable inline `onkeydown` on Material tablists inside `mat-tab-group`.
 * Apply as `libMatTabListKeydown` on the group host.
 */
class MatTabListKeydownDirective {
    host = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    constructor() {
        afterNextRender(() => {
            const cleanup = observeMatTabListKeyboardA11y(this.host.nativeElement);
            if (cleanup) {
                this.destroyRef.onDestroy(cleanup);
            }
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: MatTabListKeydownDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.33", type: MatTabListKeydownDirective, isStandalone: true, selector: "mat-tab-group[libMatTabListKeydown]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: MatTabListKeydownDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'mat-tab-group[libMatTabListKeydown]',
                    standalone: true,
                }]
        }], ctorParameters: () => [] });

/**
 * A host's own missing-translation handler, consulted for keys the platform has no English for.
 *
 * ngx-translate allows one `MissingTranslationHandler` per application, so a host that already has
 * one provides it under this token instead, and keeps its behaviour for every other key.
 */
const PLATFORM_MISSING_TRANSLATION_NEXT = new InjectionToken('PLATFORM_MISSING_TRANSLATION_NEXT');
/**
 * Answers a missing platform key with its English, interpolating parameters as a catalogue value
 * would be; any other key goes to `PLATFORM_MISSING_TRANSLATION_NEXT`, or behaves as ngx-translate's
 * default (the key itself) when there is none.
 *
 * It only runs when the key is missing from the current and the fallback language, so a host
 * catalogue that has the key always wins.
 */
class PlatformEnglishMissingTranslationHandler {
    parser = inject(TranslateParser);
    next = inject(PLATFORM_MISSING_TRANSLATION_NEXT, { optional: true });
    handle(params) {
        const english = PLATFORM_EN_TRANSLATIONS[params.key];
        if (english !== undefined) {
            return (this.parser.interpolate(english, params.interpolateParams) ??
                english);
        }
        return this.next ? this.next.handle(params) : undefined;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PlatformEnglishMissingTranslationHandler, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PlatformEnglishMissingTranslationHandler });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: PlatformEnglishMissingTranslationHandler, decorators: [{
            type: Injectable
        }] });
/**
 * Opt-in English for the platform's own keys, for a host that does not ship the application
 * catalogue:
 *
 *     provideTranslateService({ missingTranslationHandler: providePlatformEnglishFallback() })
 *
 * It is not installed automatically, because it takes the application's single missing-translation
 * slot; see `PLATFORM_MISSING_TRANSLATION_NEXT` to keep a handler you already have.
 */
function providePlatformEnglishFallback() {
    return provideMissingTranslationHandler(PlatformEnglishMissingTranslationHandler);
}

/**
 * Generated bundle index. Do not edit.
 */

export { ConfirmDialogComponent, DateMaskPipe, DocumentCompareDialogComponent, DocumentViewerComponent, EditCollectionDialogComponent, ExportDialogComponent, MAT_TAB_LIST_IBM_ONKEYDOWN, MAT_TAB_LIST_KEYDOWN_ATTR, MatTabListKeydownDirective, PLATFORM_EN_TRANSLATIONS, PLATFORM_MISSING_TRANSLATION_NEXT, PlatformEnglishMissingTranslationHandler, SAVED_SEARCH_DIALOG_OPTIONS, SavedSearchDialogComponent, SelectionTopbarComponent, ShareDialogComponent, ShareSavedSearchDialogComponent, TranslatedDatepickerIntl, UiComponent, WidgetContainerComponent, WidgetGridComponent, dateMaskFor, observeMatTabListKeyboardA11y, observeStripRedundantMatInputAriaRequired, openDocumentCompareDialog, providePlatformEnglishFallback, provideSatoriDateAdapter, provideTranslatedDatepickerIntl, stripRedundantMatInputAriaRequired, trashDocumentConfirmData, trashSelectedDocumentsConfirmData, wireMatTabListKeyboardA11y };
//# sourceMappingURL=nuxeo-satori-platform-ui.mjs.map
