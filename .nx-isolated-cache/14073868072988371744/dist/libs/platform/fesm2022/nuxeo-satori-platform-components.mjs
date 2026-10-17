import * as i0 from '@angular/core';
import { input, output, computed, ChangeDetectionStrategy, Component, viewChild, inject, DOCUMENT, signal, TemplateRef, Directive, numberAttribute, DestroyRef, Injectable, Injector, ElementRef, contentChild, afterNextRender, linkedSignal, booleanAttribute, LOCALE_ID, effect, viewChildren, model, forwardRef, untracked, afterEveryRender, Pipe, afterRenderEffect } from '@angular/core';
import * as i1 from '@angular/material/button';
import { MatButtonModule, MatButton, MatIconButton } from '@angular/material/button';
import * as i2 from '@angular/material/icon';
import { MatIconModule, MatIcon } from '@angular/material/icon';
import * as i3 from '@angular/material/menu';
import { MatMenuModule, MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import * as i4 from '@angular/material/tooltip';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { CdkTrapFocus, CdkAriaLive, LiveAnnouncer } from '@angular/cdk/a11y';
import * as i2$1 from '@angular/material/checkbox';
import { MatCheckboxModule, MatCheckbox } from '@angular/material/checkbox';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NgTemplateOutlet, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import * as i2$2 from '@angular/material/dialog';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import * as i3$1 from '@angular/material/form-field';
import { MatFormField, MatLabel, MatFormFieldModule } from '@angular/material/form-field';
import * as i4$1 from '@angular/material/input';
import { MatInput, MatInputModule } from '@angular/material/input';
import { DocumentDetailService, CURRENT_USERNAME, ADMIN_ACCESS_CHECKS, avatarColor, formatRelativeTime, TagService, isPermissionDeniedError, canCreateDocumentVersion, DirectoryService, resolveAcePrincipal, canManageDocumentPermissions, formatAceDateRange, permissionRightLabel, PERMISSION_NOTIFICATION_MAIL_HINT_KEY, isMailSendError, permissionCreateMailFailureMessage, permissionUpdateMailFailureMessage, docTypeIcon, isFolderishDocument, NON_CONTENT_DOCUMENT_TYPES, DocTypeLabelPipe, escapeNxqlLiteral, NuxeoApiBase, BrowseService, normalizeNuxeoPath, isRepositoryRootPath, topLevelNuxeoFolderPath, nuxeoPathSegments, cumulativeNuxeoPathPrefixes, isBrowsableNavNode, nuxeoPathsEqualFlexible, DOMAIN_CONTAINER_GUIDANCE_KEY, isDomainParentType, NuxeoDriveService, l10nEntryLabel, directoryPickerLabel, filterDirectoryPickerEntries, groupL10nChildrenByParent, directoryUsesL10nLabel, formatHierarchicalL10nLabel, documentHasPersistedMainBlob, UserService, SearchService } from '@nuxeo/satori-platform/nuxeo-client';
import { Subject, tap, switchMap, merge, of, finalize, map, catchError, concatMap, debounceTime, distinctUntilChanged, forkJoin, filter, defer, concat, NEVER, ReplaySubject, takeUntil, timer, from, toArray, startWith } from 'rxjs';
import * as i1$1 from '@angular/material/progress-spinner';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef, MatSnackBarAction, MatSnackBarActions, MatSnackBarLabel, MatSnackBar } from '@angular/material/snack-bar';
import * as i1$4 from '@angular/material/autocomplete';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption, MatAutocompleteModule } from '@angular/material/autocomplete';
import * as i4$2 from '@angular/material/chips';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow, MatChipsModule } from '@angular/material/chips';
import * as i2$3 from '@angular/material/divider';
import { MatDividerModule } from '@angular/material/divider';
import * as i1$2 from '@angular/forms';
import { FormsModule, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import * as i5 from '@angular/material/radio';
import { MatRadioModule, MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import * as i1$3 from '@angular/material/datepicker';
import { MatDatepickerModule, MatDatepickerIntl, MatDatepickerInput } from '@angular/material/datepicker';
import * as i5$1 from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import * as i2$4 from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import * as i7 from '@angular/material/sort';
import { MatSortModule } from '@angular/material/sort';
import * as i8 from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MAT_NATIVE_DATE_FORMATS, NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS, MatOptionModule } from '@angular/material/core';
import { Directionality } from '@angular/cdk/bidi';
import { ExtensionOutletComponent, provideSatoriExtensions } from '@nuxeo/satori-platform/extensions';
import * as i1$5 from '@angular/material/tabs';
import { MatTabsModule } from '@angular/material/tabs';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { RouterLink } from '@angular/router';
import * as i3$2 from '@angular/material/progress-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * Format characters that take no space on screen: zero-width space, non-joiner and joiner, the
 * directional marks and embeddings, the word joiner and invisible operators, the byte-order mark,
 * the soft hyphen, the combining grapheme joiner, the Arabic letter mark, the Mongolian vowel
 * separator, the Khmer inherent vowels and the Hangul fillers.
 */
const ZERO_WIDTH = new Set([
    0x00ad, 0x034f, 0x061c, 0x115f, 0x1160, 0x17b4, 0x17b5, 0x180e, 0x200b, 0x200c, 0x200d, 0x200e,
    0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2060, 0x2061, 0x2062, 0x2063, 0x2064, 0x2066,
    0x2067, 0x2068, 0x2069, 0x3164, 0xfeff, 0xffa0,
].map((code) => String.fromCharCode(code)));
/** Variation selectors change how the character before them is drawn; alone they draw nothing. */
const isVariationSelector = (char) => char >= '\ufe00' && char <= '\ufe0f';
const isBlank = (char) => ZERO_WIDTH.has(char) || /\s/.test(char);
/**
 * Text as a reader gets it: without the whitespace and zero-width characters around it, and empty
 * when nothing in it would show on screen.
 *
 * `trim()` alone keeps `'\u200B'` — a zero-width space a paste or a CMS can leave in a field — so a
 * label made of one still reads as a name, and assistive technology announces nothing for a control
 * that looks named. Characters inside the text are kept: a zero-width joiner between two emoji, or a
 * non-joiner in Persian, changes what the text says.
 */
function nxsVisibleText(text) {
    const value = text ?? '';
    let start = 0;
    let end = value.length;
    while (start < end && isBlank(value[start]))
        start += 1;
    while (end > start && isBlank(value[end - 1]))
        end -= 1;
    for (let at = start; at < end; at += 1) {
        if (!isVariationSelector(value[at]))
            return value.slice(start, end);
    }
    return '';
}
/**
 * The first `count` characters a reader sees in `text`, upper-cased — an avatar's initials. Counted
 * as user-perceived characters, so an accented letter written as a letter and a combining mark, or
 * an emoji written as two code units, is one initial and is never cut in half.
 */
function nxsInitials(text, count) {
    const visible = nxsVisibleText(text);
    if (!visible || count < 1)
        return '';
    const graphemes = typeof Intl.Segmenter === 'function'
        ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(visible), (s) => s.segment.trim())
        : Array.from(visible, (c) => c.trim());
    return graphemes
        .filter((grapheme) => nxsVisibleText(grapheme) !== '')
        .slice(0, count)
        .join('')
        .toUpperCase();
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
class NxsActionMenuComponent {
    /** The entries, in display order. */
    actions = input.required(...(ngDevMode ? [{ debugName: "actions" }] : []));
    /**
     * The trigger's accessible name and tooltip, already translated — "More actions". A blank one is
     * the caller's mistake, and it falls back to the library's own "More actions" rather than hiding
     * the entries or leaving an icon button with no name.
     */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The trigger's Material icon ligature. */
    icon = input('more_vert', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    /** The entry the user chose. Never a disabled one. */
    selected = output();
    /** The label as a reader gets it: whitespace or zero-width characters alone are no name. */
    ownLabel = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsActionMenuComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsActionMenuComponent, isStandalone: true, selector: "nxs-action-menu", inputs: { actions: { classPropertyName: "actions", publicName: "actions", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, icon: { classPropertyName: "icon", publicName: "icon", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selected: "selected" }, host: { classAttribute: "nxs-action-menu" }, ngImport: i0, template: "@if (actions().length > 0) {\n  @let name = ownLabel() || ('satori-components.action-menu.more-actions' | translate);\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-action-menu__trigger\"\n    [matMenuTriggerFor]=\"menu\"\n    [matTooltip]=\"name\"\n    [attr.aria-label]=\"name\"\n  >\n    <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n  </button>\n  <mat-menu #menu=\"matMenu\">\n    @for (action of actions(); track action.id) {\n      <button\n        mat-menu-item\n        type=\"button\"\n        [attr.data-action-id]=\"action.id\"\n        [disabled]=\"action.disabled ?? false\"\n        (click)=\"selected.emit(action)\"\n      >\n        @if (action.icon) {\n          <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n        }\n        <span>{{ action.label }}</span>\n      </button>\n    }\n  </mat-menu>\n}\n", dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatMenuModule }, { kind: "component", type: i3.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "component", type: i3.MatMenuItem, selector: "[mat-menu-item]", inputs: ["role", "disabled", "disableRipple"], exportAs: ["matMenuItem"] }, { kind: "directive", type: i3.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsActionMenuComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-action-menu', standalone: true, imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-action-menu' }, template: "@if (actions().length > 0) {\n  @let name = ownLabel() || ('satori-components.action-menu.more-actions' | translate);\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-action-menu__trigger\"\n    [matMenuTriggerFor]=\"menu\"\n    [matTooltip]=\"name\"\n    [attr.aria-label]=\"name\"\n  >\n    <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n  </button>\n  <mat-menu #menu=\"matMenu\">\n    @for (action of actions(); track action.id) {\n      <button\n        mat-menu-item\n        type=\"button\"\n        [attr.data-action-id]=\"action.id\"\n        [disabled]=\"action.disabled ?? false\"\n        (click)=\"selected.emit(action)\"\n      >\n        @if (action.icon) {\n          <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n        }\n        <span>{{ action.label }}</span>\n      </button>\n    }\n  </mat-menu>\n}\n" }]
        }], propDecorators: { actions: [{ type: i0.Input, args: [{ isSignal: true, alias: "actions", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], selected: [{ type: i0.Output, args: ["selected"] }] } });

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
class NxsColumnPickerComponent {
    /** Every column the user may choose from, in display order. */
    columns = input.required(...(ngDevMode ? [{ debugName: "columns" }] : []));
    /** Keys that cannot be switched off — the identity column, so no row is left unlabelled. */
    required = input([], ...(ngDevMode ? [{ debugName: "required" }] : []));
    /** The keys Reset returns to: the host's defaults, not a copy of a packaged list. */
    defaults = input([], ...(ngDevMode ? [{ debugName: "defaults" }] : []));
    /** Done: the chosen keys, in column order. */
    apply = output();
    /** Escape or the backdrop: close without applying. */
    dismiss = output();
    panel = viewChild.required('panel');
    opener = inject(DOCUMENT).activeElement;
    pending = signal(null, ...(ngDevMode ? [{ debugName: "pending" }] : []));
    chosen = computed(() => this.pending() ??
        this.columns()
            .filter((column) => column.visible)
            .map((column) => column.key), ...(ngDevMode ? [{ debugName: "chosen" }] : []));
    ngAfterViewInit() {
        this.panel().nativeElement.focus();
    }
    ngOnDestroy() {
        if (this.opener?.isConnected)
            this.opener.focus();
    }
    isChosen(key) {
        return this.chosen().includes(key);
    }
    isRequired(key) {
        return this.required().includes(key);
    }
    toggle(key) {
        if (this.isRequired(key))
            return;
        const current = this.chosen();
        this.pending.set(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
    }
    reset() {
        this.pending.set([...this.defaults()]);
    }
    commit() {
        const chosen = this.chosen();
        this.apply.emit(this.columns()
            .filter((column) => chosen.includes(column.key) || this.isRequired(column.key))
            .map((column) => column.key));
        this.pending.set(null);
    }
    cancel() {
        this.pending.set(null);
        this.dismiss.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsColumnPickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsColumnPickerComponent, isStandalone: true, selector: "nxs-column-picker", inputs: { columns: { classPropertyName: "columns", publicName: "columns", isSignal: true, isRequired: true, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, defaults: { classPropertyName: "defaults", publicName: "defaults", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { apply: "apply", dismiss: "dismiss" }, host: { listeners: { "document:keydown.escape": "cancel()" }, classAttribute: "nxs-column-picker" }, viewQueries: [{ propertyName: "panel", first: true, predicate: ["panel"], descendants: true, isSignal: true }], ngImport: i0, template: "<button\n  type=\"button\"\n  class=\"nxs-column-picker__backdrop\"\n  [attr.aria-label]=\"'satori-components.column-picker.close' | translate\"\n  (click)=\"cancel()\"\n></button>\n<div\n  #panel\n  class=\"nxs-column-picker__panel\"\n  role=\"dialog\"\n  aria-modal=\"true\"\n  [attr.aria-label]=\"'satori-components.column-picker.title' | translate\"\n  tabindex=\"-1\"\n  cdkTrapFocus\n>\n  <p class=\"nxs-column-picker__title\">{{ 'satori-components.column-picker.title' | translate }}</p>\n  <div class=\"nxs-column-picker__list\">\n    @for (column of columns(); track column.key) {\n      <mat-checkbox\n        class=\"nxs-column-picker__option\"\n        [checked]=\"isChosen(column.key) || isRequired(column.key)\"\n        [disabled]=\"isRequired(column.key)\"\n        (change)=\"toggle(column.key)\"\n        >{{ column.label }}</mat-checkbox\n      >\n    }\n  </div>\n  <div class=\"nxs-column-picker__actions\">\n    <button mat-button type=\"button\" (click)=\"reset()\">\n      {{ 'satori-components.column-picker.reset' | translate }}\n    </button>\n    <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"commit()\">\n      {{ 'satori-components.column-picker.done' | translate }}\n    </button>\n  </div>\n</div>\n", styles: [":host{display:contents}.nxs-column-picker__backdrop{position:fixed;inset:0;z-index:99;padding:0;border:none;background:transparent;font:inherit;cursor:pointer}.nxs-column-picker__panel{position:absolute;top:43px;right:0;z-index:100;display:flex;flex-direction:column;min-width:200px;max-height:420px;padding:14px 16px;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background:var(--mat-sys-surface-container-lowest);box-shadow:var(--mat-sys-level3)}.nxs-column-picker__title{margin:0 0 10px;font-size:13px;font-weight:600;color:var(--mat-sys-on-surface)}.nxs-column-picker__list{flex:1;overflow-y:auto;margin-bottom:2px;background:linear-gradient(var(--mat-sys-surface-container-lowest) 30%,transparent) top/100% 32px no-repeat local,linear-gradient(transparent,var(--mat-sys-surface-container-lowest) 70%) bottom/100% 32px no-repeat local,radial-gradient(farthest-side at 50% 0,color-mix(in srgb,var(--mat-sys-on-surface) 22%,transparent),transparent) top/100% 12px no-repeat scroll,radial-gradient(farthest-side at 50% 100%,color-mix(in srgb,var(--mat-sys-on-surface) 22%,transparent),transparent) bottom/100% 12px no-repeat scroll,var(--mat-sys-surface-container-lowest)}.nxs-column-picker__option{display:flex;margin-bottom:6px}.nxs-column-picker__actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}\n"], dependencies: [{ kind: "directive", type: CdkTrapFocus, selector: "[cdkTrapFocus]", inputs: ["cdkTrapFocus", "cdkTrapFocusAutoCapture"], exportAs: ["cdkTrapFocus"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i2$1.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsColumnPickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-column-picker', standalone: true, imports: [CdkTrapFocus, MatButtonModule, MatCheckboxModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-column-picker',
                        '(document:keydown.escape)': 'cancel()',
                    }, template: "<button\n  type=\"button\"\n  class=\"nxs-column-picker__backdrop\"\n  [attr.aria-label]=\"'satori-components.column-picker.close' | translate\"\n  (click)=\"cancel()\"\n></button>\n<div\n  #panel\n  class=\"nxs-column-picker__panel\"\n  role=\"dialog\"\n  aria-modal=\"true\"\n  [attr.aria-label]=\"'satori-components.column-picker.title' | translate\"\n  tabindex=\"-1\"\n  cdkTrapFocus\n>\n  <p class=\"nxs-column-picker__title\">{{ 'satori-components.column-picker.title' | translate }}</p>\n  <div class=\"nxs-column-picker__list\">\n    @for (column of columns(); track column.key) {\n      <mat-checkbox\n        class=\"nxs-column-picker__option\"\n        [checked]=\"isChosen(column.key) || isRequired(column.key)\"\n        [disabled]=\"isRequired(column.key)\"\n        (change)=\"toggle(column.key)\"\n        >{{ column.label }}</mat-checkbox\n      >\n    }\n  </div>\n  <div class=\"nxs-column-picker__actions\">\n    <button mat-button type=\"button\" (click)=\"reset()\">\n      {{ 'satori-components.column-picker.reset' | translate }}\n    </button>\n    <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"commit()\">\n      {{ 'satori-components.column-picker.done' | translate }}\n    </button>\n  </div>\n</div>\n", styles: [":host{display:contents}.nxs-column-picker__backdrop{position:fixed;inset:0;z-index:99;padding:0;border:none;background:transparent;font:inherit;cursor:pointer}.nxs-column-picker__panel{position:absolute;top:43px;right:0;z-index:100;display:flex;flex-direction:column;min-width:200px;max-height:420px;padding:14px 16px;border:1px solid var(--mat-sys-outline-variant);border-radius:8px;background:var(--mat-sys-surface-container-lowest);box-shadow:var(--mat-sys-level3)}.nxs-column-picker__title{margin:0 0 10px;font-size:13px;font-weight:600;color:var(--mat-sys-on-surface)}.nxs-column-picker__list{flex:1;overflow-y:auto;margin-bottom:2px;background:linear-gradient(var(--mat-sys-surface-container-lowest) 30%,transparent) top/100% 32px no-repeat local,linear-gradient(transparent,var(--mat-sys-surface-container-lowest) 70%) bottom/100% 32px no-repeat local,radial-gradient(farthest-side at 50% 0,color-mix(in srgb,var(--mat-sys-on-surface) 22%,transparent),transparent) top/100% 12px no-repeat scroll,radial-gradient(farthest-side at 50% 100%,color-mix(in srgb,var(--mat-sys-on-surface) 22%,transparent),transparent) bottom/100% 12px no-repeat scroll,var(--mat-sys-surface-container-lowest)}.nxs-column-picker__option{display:flex;margin-bottom:6px}.nxs-column-picker__actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;padding-top:10px;border-top:1px solid var(--mat-sys-outline-variant)}\n"] }]
        }], propDecorators: { columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], defaults: [{ type: i0.Input, args: [{ isSignal: true, alias: "defaults", required: false }] }], apply: [{ type: i0.Output, args: ["apply"] }], dismiss: [{ type: i0.Output, args: ["dismiss"] }], panel: [{ type: i0.ViewChild, args: ['panel', { isSignal: true }] }] } });

/**
 * Content rendered under each comment's and reply's text — a sentiment badge, a translation:
 * `<ng-template nxsCommentExtra let-comment>…</ng-template>`.
 */
class NxsCommentExtraDirective {
    template = inject(TemplateRef);
    static ngTemplateContextGuard(_directive, _context) {
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsCommentExtraDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.33", type: NxsCommentExtraDirective, isStandalone: true, selector: "ng-template[nxsCommentExtra]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsCommentExtraDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[nxsCommentExtra]', standalone: true }]
        }] });

/**
 * The avatar's and the tag's eight named colours.
 *
 * Material has no named palette, and its container roles follow the theme: under a rose primary
 * a "blue" mapped to `primary-container` turns pink, and no role is teal at all. So each name has
 * its own hue, tinted toward the theme's surface for the background and toward its text colour for
 * the text, which keeps the name's hue in light and dark themes alike. The text share differs per
 * colour because a light hue such as yellow needs more of the dark text colour to stay readable.
 * `named-colors.spec.ts` holds every pair at 4.5:1 or more, and each hue inside its name's range,
 * in the Material themes Storybook and the application compile.
 *
 * A host gives a colour its own hue with `--nxs-avatar-<colour>-background` and `-foreground`, or
 * `--nxs-tag-<colour>-…`; nothing here checks a hue set that way.
 */
const NXS_NAMED_COLORS = Object.freeze({
    purple: { hue: '#8e24aa', background: 16, foreground: 60 },
    blue: { hue: '#1976d2', background: 16, foreground: 75 },
    pink: { hue: '#d81b60', background: 16, foreground: 65 },
    teal: { hue: '#008080', background: 16, foreground: 75 },
    yellow: { hue: '#fdd835', background: 16, foreground: 40 },
    green: { hue: '#2e7d32', background: 16, foreground: 70 },
    red: { hue: '#c62828', background: 16, foreground: 65 },
    orange: { hue: '#ef6c00', background: 16, foreground: 60 },
});
/**
 * The custom properties a component's stylesheet mixes its colour from, bound on its host with
 * `[style]`: `--nxs-named-hue`, `--nxs-named-background-mix` and `--nxs-named-foreground-mix`.
 * `null` for a name with no hue of its own (the tag's `gray`), which removes them.
 */
function nxsNamedColorStyle(color) {
    const named = NXS_NAMED_COLORS[color];
    if (!named)
        return null;
    return {
        '--nxs-named-hue': named.hue,
        '--nxs-named-background-mix': `${named.background}%`,
        '--nxs-named-foreground-mix': `${named.foreground}%`,
    };
}

/**
 * A person's initials in a coloured circle — the Material implementation of
 * `nxs.primitives.avatar`.
 *
 * Material has no eight-hue palette, so each colour is a hue of its own (`named-colors.ts`) tinted
 * toward the theme's surface and text, which keeps it that colour in light and dark themes and under
 * any primary palette. Set `--nxs-avatar-<colour>-background` and `-foreground` to give a colour
 * another hue.
 */
class NxsAvatarComponent {
    /**
     * The person's initials, upper-cased: up to two, or one at size `24`, where two do not fit and
     * Satori's avatar shows one.
     */
    initials = input.required(...(ngDevMode ? [{ debugName: "initials" }] : []));
    /** The circle's colour: `purple`, `blue`, `pink`, `teal`, `yellow`, `green`, `red` or `orange`. */
    color = input('blue', ...(ngDevMode ? [{ debugName: "color" }] : []));
    /** The diameter in pixels: `24`, `28`, `36`, `64`, `80` or `128`. */
    size = input('36', ...(ngDevMode ? [{ debugName: "size" }] : []));
    /**
     * The accessible name, usually the person's name, already translated. Blank, or only whitespace
     * or zero-width characters, makes the avatar decorative.
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    name = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "name" }] : []));
    namedColor = computed(() => nxsNamedColorStyle(this.color()), ...(ngDevMode ? [{ debugName: "namedColor" }] : []));
    shownInitials = computed(() => nxsInitials(this.initials(), this.size() === '24' ? 1 : 2), ...(ngDevMode ? [{ debugName: "shownInitials" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsAvatarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsAvatarComponent, isStandalone: true, selector: "nxs-avatar", inputs: { initials: { classPropertyName: "initials", publicName: "initials", isSignal: true, isRequired: true, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null }, size: { classPropertyName: "size", publicName: "size", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "'nxs-avatar nxs-avatar--' + color() + ' nxs-avatar--size-' + size()", "style": "namedColor()", "attr.role": "name() ? 'img' : null", "attr.aria-label": "name() || null", "attr.aria-hidden": "name() ? null : 'true'" } }, ngImport: i0, template: "<span class=\"nxs-avatar__initials\" aria-hidden=\"true\">{{ shownInitials() }}</span>\n", styles: [":host{--nxs-avatar-size: 36px;--nxs-avatar-named-background: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-background-mix), var(--mat-sys-surface) );--nxs-avatar-named-foreground: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-foreground-mix), var(--mat-sys-on-surface) );display:inline-flex;flex:none;align-items:center;justify-content:center;inline-size:var(--nxs-avatar-size);block-size:var(--nxs-avatar-size);border-radius:50%;overflow:hidden;font:var(--mat-sys-label-large);background:var(--nxs-avatar-background, var(--mat-sys-primary-container));color:var(--nxs-avatar-foreground, var(--mat-sys-on-primary-container));-webkit-user-select:none;user-select:none}:host(.nxs-avatar--size-24){--nxs-avatar-size: 24px;font:var(--mat-sys-label-small)}:host(.nxs-avatar--size-28){--nxs-avatar-size: 28px;font:var(--mat-sys-label-small)}:host(.nxs-avatar--size-64){--nxs-avatar-size: 64px;font:var(--mat-sys-title-large)}:host(.nxs-avatar--size-80){--nxs-avatar-size: 80px;font:var(--mat-sys-headline-small)}:host(.nxs-avatar--size-128){--nxs-avatar-size: 128px;font:var(--mat-sys-display-small)}:host(.nxs-avatar--purple){--nxs-avatar-background: var(--nxs-avatar-purple-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-purple-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--blue){--nxs-avatar-background: var(--nxs-avatar-blue-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-blue-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--pink){--nxs-avatar-background: var(--nxs-avatar-pink-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-pink-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--teal){--nxs-avatar-background: var(--nxs-avatar-teal-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-teal-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--yellow){--nxs-avatar-background: var(--nxs-avatar-yellow-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-yellow-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--green){--nxs-avatar-background: var(--nxs-avatar-green-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-green-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--red){--nxs-avatar-background: var(--nxs-avatar-red-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-red-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--orange){--nxs-avatar-background: var(--nxs-avatar-orange-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-orange-foreground, var(--nxs-avatar-named-foreground))}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsAvatarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-avatar', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        '[class]': "'nxs-avatar nxs-avatar--' + color() + ' nxs-avatar--size-' + size()",
                        '[style]': 'namedColor()',
                        '[attr.role]': "name() ? 'img' : null",
                        '[attr.aria-label]': 'name() || null',
                        '[attr.aria-hidden]': "name() ? null : 'true'",
                    }, template: "<span class=\"nxs-avatar__initials\" aria-hidden=\"true\">{{ shownInitials() }}</span>\n", styles: [":host{--nxs-avatar-size: 36px;--nxs-avatar-named-background: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-background-mix), var(--mat-sys-surface) );--nxs-avatar-named-foreground: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-foreground-mix), var(--mat-sys-on-surface) );display:inline-flex;flex:none;align-items:center;justify-content:center;inline-size:var(--nxs-avatar-size);block-size:var(--nxs-avatar-size);border-radius:50%;overflow:hidden;font:var(--mat-sys-label-large);background:var(--nxs-avatar-background, var(--mat-sys-primary-container));color:var(--nxs-avatar-foreground, var(--mat-sys-on-primary-container));-webkit-user-select:none;user-select:none}:host(.nxs-avatar--size-24){--nxs-avatar-size: 24px;font:var(--mat-sys-label-small)}:host(.nxs-avatar--size-28){--nxs-avatar-size: 28px;font:var(--mat-sys-label-small)}:host(.nxs-avatar--size-64){--nxs-avatar-size: 64px;font:var(--mat-sys-title-large)}:host(.nxs-avatar--size-80){--nxs-avatar-size: 80px;font:var(--mat-sys-headline-small)}:host(.nxs-avatar--size-128){--nxs-avatar-size: 128px;font:var(--mat-sys-display-small)}:host(.nxs-avatar--purple){--nxs-avatar-background: var(--nxs-avatar-purple-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-purple-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--blue){--nxs-avatar-background: var(--nxs-avatar-blue-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-blue-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--pink){--nxs-avatar-background: var(--nxs-avatar-pink-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-pink-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--teal){--nxs-avatar-background: var(--nxs-avatar-teal-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-teal-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--yellow){--nxs-avatar-background: var(--nxs-avatar-yellow-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-yellow-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--green){--nxs-avatar-background: var(--nxs-avatar-green-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-green-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--red){--nxs-avatar-background: var(--nxs-avatar-red-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-red-foreground, var(--nxs-avatar-named-foreground))}:host(.nxs-avatar--orange){--nxs-avatar-background: var(--nxs-avatar-orange-background, var(--nxs-avatar-named-background));--nxs-avatar-foreground: var(--nxs-avatar-orange-foreground, var(--nxs-avatar-named-foreground))}\n"] }]
        }], propDecorators: { initials: [{ type: i0.Input, args: [{ isSignal: true, alias: "initials", required: true }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }], size: [{ type: i0.Input, args: [{ isSignal: true, alias: "size", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/**
 * The words a property value shows as, or `''` for a value with nothing to show.
 *
 * A Nuxeo property is not always a string. With resolvers fetched, `dc:nature` arrives as a
 * directory entry and `dc:creator` as a user; a blob is an object, a multi-valued field an array.
 * Interpolating any of those prints `[object Object]` — a defect observed in another document
 * sidebar and listed as a parity target not to copy. So objects are read for the field that names
 * them, and an object with no such field shows nothing rather than its type.
 */
function nxsPropertyText(value) {
    if (value === null || value === undefined)
        return '';
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value
            .map((item) => nxsPropertyText(item))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof value !== 'object')
        return '';
    const record = value;
    const properties = (typeof record['properties'] === 'object' && record['properties'] !== null
        ? record['properties']
        : {});
    if (record['entity-type'] === 'user') {
        const name = [properties['firstName'], properties['lastName']]
            .filter((part) => typeof part === 'string' && part.trim() !== '')
            .join(' ');
        return name || nxsPropertyText(record['id'] ?? properties['username']);
    }
    for (const candidate of [
        properties['label'],
        properties['label_en'],
        record['title'],
        record['label'],
        record['name'],
        properties['id'],
        record['id'],
    ]) {
        if (typeof candidate === 'string' && candidate.trim() !== '')
            return candidate;
    }
    return '';
}
/** A username's initial for an avatar; `?` when there is no letter to show. */
function nxsInitial(name) {
    const first = name.trim().charAt(0);
    return first ? first.toUpperCase() : '?';
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
class NxsSpinnerComponent {
    /** Diameter in pixels. Accepts a static attribute, `diameter="36"`. */
    diameter = input(32, ...(ngDevMode ? [{ debugName: "diameter", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** What is loading, already translated. Blank makes the spinner decorative. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    name = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "name" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSpinnerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsSpinnerComponent, isStandalone: true, selector: "nxs-spinner", inputs: { diameter: { classPropertyName: "diameter", publicName: "diameter", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-spinner" }, ngImport: i0, template: "<mat-progress-spinner\n  mode=\"indeterminate\"\n  [diameter]=\"diameter()\"\n  [attr.aria-label]=\"name() || null\"\n  [attr.aria-hidden]=\"name() ? null : 'true'\"\n/>\n", styles: [":host{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}\n"], dependencies: [{ kind: "ngmodule", type: MatProgressSpinnerModule }, { kind: "component", type: i1$1.MatProgressSpinner, selector: "mat-progress-spinner, mat-spinner", inputs: ["color", "mode", "value", "diameter", "strokeWidth"], exportAs: ["matProgressSpinner"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSpinnerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-spinner', standalone: true, imports: [MatProgressSpinnerModule], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-spinner' }, template: "<mat-progress-spinner\n  mode=\"indeterminate\"\n  [diameter]=\"diameter()\"\n  [attr.aria-label]=\"name() || null\"\n  [attr.aria-hidden]=\"name() ? null : 'true'\"\n/>\n", styles: [":host{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}\n"] }]
        }], propDecorators: { diameter: [{ type: i0.Input, args: [{ isSignal: true, alias: "diameter", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/**
 * The content of one toast: the message, an optional action and a Dismiss button.
 *
 * Opened by `NxsToastService`, never placed in a template. `MatSnackBar` moves this content into
 * its live region after it opens, so the message is announced with the politeness the service chose.
 */
class NxsToastComponent {
    data = inject(MAT_SNACK_BAR_DATA);
    ref = inject(MatSnackBarRef);
    act() {
        this.ref.dismissWithAction();
    }
    /**
     * Escape stops here: a snack-bar overlay subscribes to no keydown, so the CDK would hand the event
     * on to a dialog underneath and close it too — losing a form the toast was reporting on.
     */
    dismiss(event) {
        event?.stopPropagation();
        this.ref.dismiss();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsToastComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsToastComponent, isStandalone: true, selector: "nxs-toast", host: { listeners: { "keydown.escape": "dismiss($event)" }, properties: { "class.nxs-toast--error": "data.kind === 'error'" }, classAttribute: "nxs-toast" }, ngImport: i0, template: "<div matSnackBarLabel class=\"nxs-toast__message\">{{ data.message }}</div>\n<div matSnackBarActions class=\"nxs-toast__actions\">\n  @if (data.action; as action) {\n    <button mat-button matSnackBarAction type=\"button\" class=\"nxs-toast__action\" (click)=\"act()\">\n      {{ action.label }}\n    </button>\n  }\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-toast__dismiss\"\n    [attr.aria-label]=\"'satori-components.toast.dismiss' | translate\"\n    (click)=\"dismiss()\"\n  >\n    <mat-icon aria-hidden=\"true\">close</mat-icon>\n  </button>\n</div>\n", styles: [":host{display:flex;align-items:center}.nxs-toast__message{flex:1 1 auto}.nxs-toast__actions{display:flex;align-items:center;gap:4px}.nxs-toast__dismiss{color:var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface))}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: MatSnackBarAction, selector: "[matSnackBarAction]" }, { kind: "directive", type: MatSnackBarActions, selector: "[matSnackBarActions]" }, { kind: "directive", type: MatSnackBarLabel, selector: "[matSnackBarLabel]" }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsToastComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-toast', standalone: true, imports: [
                        MatButtonModule,
                        MatIconModule,
                        MatSnackBarAction,
                        MatSnackBarActions,
                        MatSnackBarLabel,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-toast',
                        '[class.nxs-toast--error]': "data.kind === 'error'",
                        '(keydown.escape)': 'dismiss($event)',
                    }, template: "<div matSnackBarLabel class=\"nxs-toast__message\">{{ data.message }}</div>\n<div matSnackBarActions class=\"nxs-toast__actions\">\n  @if (data.action; as action) {\n    <button mat-button matSnackBarAction type=\"button\" class=\"nxs-toast__action\" (click)=\"act()\">\n      {{ action.label }}\n    </button>\n  }\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-toast__dismiss\"\n    [attr.aria-label]=\"'satori-components.toast.dismiss' | translate\"\n    (click)=\"dismiss()\"\n  >\n    <mat-icon aria-hidden=\"true\">close</mat-icon>\n  </button>\n</div>\n", styles: [":host{display:flex;align-items:center}.nxs-toast__message{flex:1 1 auto}.nxs-toast__actions{display:flex;align-items:center;gap:4px}.nxs-toast__dismiss{color:var(--mat-snack-bar-supporting-text-color, var(--mat-sys-inverse-on-surface))}\n"] }]
        }] });

/** How long a toast stays, in milliseconds, unless the caller asks for longer. Web UI's default. */
const NXS_TOAST_DURATION = 4000;
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
class NxsToastService {
    snackBar = inject(MatSnackBar);
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    /** Something happened: saved, copied, moved to trash. */
    show(message, options = {}) {
        this.open({ message, kind: 'info', action: options.action ?? null }, options.duration);
    }
    /** Something the user asked for did not happen. */
    error(message, options = {}) {
        const retry = options.retry;
        const action = retry
            ? { label: this.translate.instant('satori-components.toast.retry'), run: retry }
            : (options.action ?? null);
        this.open({ message, kind: 'error', action }, options.duration);
    }
    open(data, duration) {
        // A blank toast is a caller's bug, and an empty live region announces nothing. Web UI's
        // notifier opens nothing for an empty message either.
        if (!data.message.trim())
            return;
        const ref = this.snackBar.openFromComponent(NxsToastComponent, {
            data,
            duration: toastDuration(duration, data.action !== null),
            politeness: data.kind === 'error' ? 'assertive' : 'polite',
            panelClass: data.kind === 'error' ? ['nxs-toast-panel', 'nxs-toast-panel--error'] : 'nxs-toast-panel',
        });
        const action = data.action;
        if (!action)
            return;
        // A toast with an action stays until dismissed, so it can outlive the component that opened
        // it. It is dismissed with that component rather than left showing a button that would run
        // against a destroyed one.
        const dismissWithOwner = this.destroyRef.onDestroy(() => ref.dismiss());
        ref
            .afterDismissed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => dismissWithOwner());
        ref
            .onAction()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => action.run());
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsToastService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsToastService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsToastService, decorators: [{
            type: Injectable
        }] });
/** Exactly `0` means "until dismissed", which is how `MatSnackBar` reads it too. */
function toastDuration(requested, hasAction) {
    if (requested === undefined)
        return hasAction ? 0 : NXS_TOAST_DURATION;
    if (requested === 0)
        return 0;
    return Math.max(requested, NXS_TOAST_DURATION);
}
/** Lists `NxsToastService` in a component's `providers`. */
function provideNxsToast() {
    return NxsToastService;
}

const text$1 = (properties, key) => {
    const value = properties[key];
    return typeof value === 'string' ? value : '';
};
/** A `Comment` document as a comment, as the `@comment` endpoint would return it. */
const toComment = (entry, documentUid) => {
    const properties = entry.properties ?? {};
    const modified = text$1(properties, 'comment:modificationDate');
    return {
        id: entry.uid,
        parentId: text$1(properties, 'comment:parentId') || documentUid,
        text: text$1(properties, 'comment:text'),
        author: text$1(properties, 'comment:author'),
        creationDate: text$1(properties, 'comment:creationDate') || text$1(properties, 'dc:created'),
        ...(modified ? { modificationDate: modified } : {}),
    };
};
/**
 * Splits a document's comments into top-level comments and their replies. A reply to a reply,
 * which Web UI never writes but the API accepts, is listed under the top-level comment it hangs
 * from; one whose parent is not in the list is left out rather than shown out of place.
 */
const toThread = (list, documentUid) => {
    const all = (list.entries ?? []).map((entry) => toComment(entry, documentUid));
    const byId = new Map(all.map((comment) => [comment.id, comment]));
    const replies = {};
    for (const comment of all) {
        if (comment.parentId === documentUid)
            continue;
        let root = byId.get(comment.parentId);
        const seen = new Set([comment.id]);
        while (root && root.parentId !== documentUid && !seen.has(root.id)) {
            seen.add(root.id);
            root = byId.get(root.parentId);
        }
        if (!root || root.parentId !== documentUid)
            continue;
        (replies[root.id] ??= []).push(comment);
    }
    return { comments: all.filter((comment) => comment.parentId === documentUid), replies };
};
let nextId$d = 0;
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
class NxsCommentsComponent {
    documents = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    dialog = inject(MatDialog);
    username = inject(CURRENT_USERNAME);
    admin = inject(ADMIN_ACCESS_CHECKS);
    destroyRef = inject(DestroyRef);
    injector = inject(Injector);
    host = inject(ElementRef);
    /** The commented document. Changing it loads that document's thread. */
    documentUid = input.required(...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** Shows the thread without the comment box, Reply, Edit or Delete. */
    readOnly = input(false, ...(ngDevMode ? [{ debugName: "readOnly" }] : []));
    /** How many of the newest comments, and of each comment's newest replies, show at first. */
    pageSize = input(10, ...(ngDevMode ? [{ debugName: "pageSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Longer comments are cut short behind "Show all". */
    maxChars = input(256, ...(ngDevMode ? [{ debugName: "maxChars", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Every loaded comment and reply, after the thread loads and after each change to it. */
    threadChange = output();
    extra = contentChild(NxsCommentExtraDirective, ...(ngDevMode ? [{ debugName: "extra" }] : []));
    deleteDialog = viewChild.required('deleteConfirmation');
    id = `nxs-comments-${nextId$d++}`;
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failed = signal(false, ...(ngDevMode ? [{ debugName: "failed" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    comments = signal([], ...(ngDevMode ? [{ debugName: "comments" }] : []));
    replies = signal({}, ...(ngDevMode ? [{ debugName: "replies" }] : []));
    allShown = signal(false, ...(ngDevMode ? [{ debugName: "allShown" }] : []));
    opened = signal(new Set(), ...(ngDevMode ? [{ debugName: "opened" }] : []));
    allRepliesShown = signal(new Set(), ...(ngDevMode ? [{ debugName: "allRepliesShown" }] : []));
    fullText = signal(new Set(), ...(ngDevMode ? [{ debugName: "fullText" }] : []));
    editing = signal(null, ...(ngDevMode ? [{ debugName: "editing" }] : []));
    editText = signal('', ...(ngDevMode ? [{ debugName: "editText" }] : []));
    newText = signal('', ...(ngDevMode ? [{ debugName: "newText" }] : []));
    replyTexts = signal({}, ...(ngDevMode ? [{ debugName: "replyTexts" }] : []));
    shown = computed(() => this.allShown() ? this.comments() : this.comments().slice(-this.pageSize()), ...(ngDevMode ? [{ debugName: "shown" }] : []));
    hiddenCount = computed(() => this.comments().length - this.shown().length, ...(ngDevMode ? [{ debugName: "hiddenCount" }] : []));
    reloads = new Subject();
    menuChoice = null;
    constructor() {
        toObservable(this.documentUid)
            .pipe(tap(() => this.reset()), switchMap((uid) => merge(of(undefined), this.reloads).pipe(switchMap(() => this.fetch(uid)))), takeUntilDestroyed())
            .subscribe((thread) => {
            this.loading.set(false);
            if (!thread) {
                this.failed.set(true);
                return;
            }
            this.comments.set(thread.comments);
            this.replies.set(thread.replies);
            this.changed();
        });
    }
    /** Loads the thread again, keeping what is being typed. */
    reload() {
        this.reloads.next();
    }
    repliesOf(id) {
        return this.replies()[id] ?? [];
    }
    shownReplies(id) {
        const replies = this.repliesOf(id);
        return this.allRepliesShown().has(id) ? replies : replies.slice(-this.pageSize());
    }
    lastReply(id) {
        const replies = this.repliesOf(id);
        return replies.length ? this.when(replies[replies.length - 1].creationDate) : '';
    }
    /** Web UI's rule: the author, by username, or an administrator. */
    canModify(comment) {
        if (this.readOnly())
            return false;
        const user = this.username();
        return (!!user && comment.author === user) || this.admin.isAdministrator();
    }
    initial(author) {
        return nxsInitial(author);
    }
    color(author) {
        return avatarColor(author);
    }
    when(date) {
        return date ? formatRelativeTime(date, this.translate.currentLang) : '';
    }
    /**
     * Nuxeo 2025 stamps `comment:modificationDate` with the creation date when a comment is made, so
     * Web UI's "set at all" test would mark every comment edited; a later date is an edit.
     */
    edited(comment) {
        return !!comment.modificationDate && comment.modificationDate !== comment.creationDate;
    }
    truncated(comment) {
        return !this.fullText().has(comment.id) && comment.text.length > this.maxChars();
    }
    shortText(comment) {
        return `${comment.text.slice(0, this.maxChars() - 1)}…`;
    }
    showFullText(comment) {
        this.fullText.update((ids) => new Set(ids).add(comment.id));
    }
    showAllReplies(id) {
        this.allRepliesShown.update((ids) => new Set(ids).add(id));
    }
    textOf(event) {
        return event.target.value;
    }
    setReplyText(id, value) {
        this.replyTexts.update((texts) => ({ ...texts, [id]: value }));
    }
    replyText(id) {
        return this.replyTexts()[id] ?? '';
    }
    /** Opens a comment's replies; from Reply, also puts the cursor in the reply box. */
    openReplies(id, focusBox = false) {
        this.opened.update((ids) => new Set(ids).add(id));
        if (focusBox)
            this.focus(`${this.id}-reply-${id}`);
    }
    submitComment() {
        const value = this.newText().trim();
        if (!value || this.saving())
            return;
        const uid = this.documentUid();
        this.save(this.documents.createComment(uid, value), 'add', false, (comment) => {
            this.comments.update((list) => [...list, { ...comment, parentId: uid }]);
            this.newText.set('');
        });
    }
    submitReply(parent) {
        const value = this.replyText(parent.id).trim();
        if (!value || this.saving())
            return;
        this.save(this.documents.createReply(this.documentUid(), parent.id, value), 'add', true, (reply) => {
            this.replies.update((map) => ({
                ...map,
                [parent.id]: [...(map[parent.id] ?? []), { ...reply, parentId: parent.id }],
            }));
            this.setReplyText(parent.id, '');
        });
    }
    choose(action, comment, parent) {
        this.menuChoice = { action, comment, parent };
    }
    /**
     * Runs the chosen item once the menu has closed and handed focus back to its button — otherwise
     * that hand-back takes the cursor out of the edit box, and the delete dialog, opened from an item
     * that no longer exists, has nowhere to return focus on Cancel.
     */
    menuClosed() {
        const choice = this.menuChoice;
        this.menuChoice = null;
        if (choice?.action === 'edit')
            this.startEdit(choice.comment);
        else if (choice)
            this.confirmDelete(choice.comment, choice.parent);
    }
    startEdit(comment) {
        this.editing.set(comment.id);
        this.editText.set(comment.text);
        this.focus(`${this.id}-edit-${comment.id}`);
    }
    cancelEdit() {
        this.editing.set(null);
        this.editText.set('');
    }
    saveEdit(comment, parent) {
        const value = this.editText().trim();
        if (!value || this.saving())
            return;
        if (value === comment.text) {
            this.cancelEdit();
            return;
        }
        this.save(this.documents.updateComment(this.documentUid(), comment.id, value), 'edit', parent !== null, (updated) => {
            const merged = { ...comment, ...updated, parentId: comment.parentId };
            if (parent) {
                this.replies.update((map) => ({
                    ...map,
                    [parent.id]: (map[parent.id] ?? []).map((r) => (r.id === comment.id ? merged : r)),
                }));
            }
            else {
                this.comments.update((list) => list.map((c) => (c.id === comment.id ? merged : c)));
            }
            this.cancelEdit();
        });
    }
    confirmDelete(comment, parent) {
        const data = {
            reply: parent !== null,
            replies: parent ? 0 : this.repliesOf(comment.id).length,
        };
        this.dialog
            .open(this.deleteDialog(), { data, role: 'alertdialog', width: '400px', maxWidth: '95vw' })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (confirmed === true)
                this.remove(comment, parent);
        });
    }
    remove(comment, parent) {
        this.save(this.documents.deleteComment(this.documentUid(), comment.id), 'delete', parent !== null, () => {
            if (parent) {
                this.replies.update((map) => ({
                    ...map,
                    [parent.id]: (map[parent.id] ?? []).filter((r) => r.id !== comment.id),
                }));
            }
            else {
                this.comments.update((list) => list.filter((c) => c.id !== comment.id));
                this.replies.update((map) => {
                    const { [comment.id]: _removed, ...rest } = map;
                    return rest;
                });
            }
            // The comment's menu button went with it; the list keeps the focus inside the panel.
            this.focus(`${this.id}-list`);
        });
    }
    save(request, action, reply, done) {
        this.saving.set(true);
        request
            .pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                done(result);
                this.changed();
            },
            error: (failure) => this.failedTo(action, reply, failure),
        });
    }
    /**
     * A refusal reads as one, and a comment someone else removed reloads the thread — Web UI says
     * "may not be available anymore" and leaves the stale entry on screen.
     */
    failedTo(action, reply, failure) {
        const status = failure instanceof HttpErrorResponse ? failure.status : 0;
        const noun = reply ? 'reply' : 'comment';
        if (status === 403 || status === 401) {
            this.toast.error(this.translate.instant(`satori-components.comments.error.forbidden-${action}`));
        }
        else if (status === 404 && (action !== 'add' || reply)) {
            // A 404 on a new top-level comment is the document itself, which this thread cannot fix;
            // on a new reply it is the comment replied to.
            const gone = action === 'add' ? 'comment' : noun;
            this.toast.error(this.translate.instant(`satori-components.comments.error.not-found-${gone}`));
            this.reload();
        }
        else {
            this.toast.error(this.translate.instant(`satori-components.comments.error.${action}-${noun}`));
        }
    }
    fetch(uid) {
        this.loading.set(true);
        this.failed.set(false);
        return this.documents.getAllComments(uid).pipe(map((list) => toThread(list, uid)), catchError(() => of(null)));
    }
    reset() {
        this.loading.set(true);
        this.failed.set(false);
        this.comments.set([]);
        this.replies.set({});
        this.allShown.set(false);
        this.opened.set(new Set());
        this.allRepliesShown.set(new Set());
        this.fullText.set(new Set());
        this.cancelEdit();
        this.newText.set('');
        this.replyTexts.set({});
    }
    changed() {
        this.threadChange.emit([...this.comments(), ...Object.values(this.replies()).flat()]);
    }
    focus(elementId) {
        afterNextRender(() => this.host.nativeElement.querySelector(`[id="${elementId}"]`)?.focus(), { injector: this.injector });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsCommentsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsCommentsComponent, isStandalone: true, selector: "nxs-comments", inputs: { documentUid: { classPropertyName: "documentUid", publicName: "documentUid", isSignal: true, isRequired: true, transformFunction: null }, readOnly: { classPropertyName: "readOnly", publicName: "readOnly", isSignal: true, isRequired: false, transformFunction: null }, pageSize: { classPropertyName: "pageSize", publicName: "pageSize", isSignal: true, isRequired: false, transformFunction: null }, maxChars: { classPropertyName: "maxChars", publicName: "maxChars", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { threadChange: "threadChange" }, host: { classAttribute: "nxs-comments" }, providers: [provideNxsToast()], queries: [{ propertyName: "extra", first: true, predicate: NxsCommentExtraDirective, descendants: true, isSignal: true }], viewQueries: [{ propertyName: "deleteDialog", first: true, predicate: ["deleteConfirmation"], descendants: true, isSignal: true }], ngImport: i0, template: "@if (loading()) {\n  <div class=\"nxs-comments__loading\">\n    <nxs-spinner diameter=\"28\" [label]=\"'satori-components.comments.loading' | translate\" />\n  </div>\n} @else if (failed()) {\n  <div class=\"nxs-comments__failed\" role=\"alert\">\n    <p>{{ 'satori-components.comments.load-failed' | translate }}</p>\n    <button mat-button type=\"button\" (click)=\"reload()\">\n      {{ 'satori-components.comments.retry' | translate }}\n    </button>\n  </div>\n} @else {\n  @if (hiddenCount() > 0) {\n    <button class=\"nxs-comments__more\" type=\"button\" (click)=\"allShown.set(true)\">\n      {{ 'satori-components.comments.view-all-comments' | translate: { count: comments().length } }}\n    </button>\n  }\n  @if (comments().length === 0) {\n    <p class=\"nxs-comments__empty\">{{ 'satori-components.comments.empty' | translate }}</p>\n  }\n  <ul\n    class=\"nxs-comments__list\"\n    tabindex=\"-1\"\n    [id]=\"id + '-list'\"\n    [attr.aria-label]=\"'satori-components.comments.list' | translate\"\n  >\n    @for (comment of shown(); track comment.id) {\n      @let count = repliesOf(comment.id).length;\n      @let open = opened().has(comment.id);\n      <li class=\"nxs-comments__comment\">\n        <ng-container *ngTemplateOutlet=\"entry; context: { $implicit: comment, parent: null }\" />\n        @if (count > 0 && !open) {\n          <button\n            class=\"nxs-comments__summary\"\n            type=\"button\"\n            aria-expanded=\"false\"\n            (click)=\"openReplies(comment.id)\"\n          >\n            {{\n              (count === 1\n                ? 'satori-components.comments.replies-one'\n                : 'satori-components.comments.replies-other'\n              ) | translate: { count }\n            }}\n            \u00B7\n            {{\n              'satori-components.comments.last-reply' | translate: { time: lastReply(comment.id) }\n            }}\n          </button>\n        }\n        @if (open) {\n          <div class=\"nxs-comments__replies\">\n            @if (shownReplies(comment.id).length < count) {\n              <button class=\"nxs-comments__more\" type=\"button\" (click)=\"showAllReplies(comment.id)\">\n                {{ 'satori-components.comments.view-all-replies' | translate: { count } }}\n              </button>\n            }\n            @if (count > 0) {\n              <ul class=\"nxs-comments__list\">\n                @for (reply of shownReplies(comment.id); track reply.id) {\n                  <li class=\"nxs-comments__comment nxs-comments__comment--reply\">\n                    <ng-container\n                      *ngTemplateOutlet=\"entry; context: { $implicit: reply, parent: comment }\"\n                    />\n                  </li>\n                }\n              </ul>\n            }\n            @if (!readOnly()) {\n              <div class=\"nxs-comments__composer\">\n                <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'satori-components.comments.reply-label' | translate }}</mat-label>\n                  <textarea\n                    matInput\n                    cdkTextareaAutosize\n                    cdkAutosizeMinRows=\"1\"\n                    cdkAutosizeMaxRows=\"4\"\n                    aria-keyshortcuts=\"Control+Enter\"\n                    [id]=\"id + '-reply-' + comment.id\"\n                    [placeholder]=\"'satori-components.comments.write-reply' | translate\"\n                    [value]=\"replyText(comment.id)\"\n                    (input)=\"setReplyText(comment.id, textOf($event))\"\n                    (keydown.control.enter)=\"$event.preventDefault(); submitReply(comment)\"\n                    (keydown.meta.enter)=\"$event.preventDefault(); submitReply(comment)\"\n                  ></textarea>\n                </mat-form-field>\n                @if (replyText(comment.id).trim()) {\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [disabled]=\"saving()\"\n                    [attr.aria-label]=\"'satori-components.comments.submit-reply' | translate\"\n                    [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n                    (click)=\"submitReply(comment)\"\n                  >\n                    <mat-icon>check</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"'satori-components.comments.clear' | translate\"\n                    (click)=\"setReplyText(comment.id, '')\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                }\n              </div>\n            }\n          </div>\n        }\n      </li>\n    }\n  </ul>\n  @if (!readOnly()) {\n    <div class=\"nxs-comments__composer\">\n      <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n        <mat-label>{{ 'satori-components.comments.comment-label' | translate }}</mat-label>\n        <textarea\n          matInput\n          cdkTextareaAutosize\n          cdkAutosizeMinRows=\"1\"\n          cdkAutosizeMaxRows=\"4\"\n          aria-keyshortcuts=\"Control+Enter\"\n          [id]=\"id + '-new'\"\n          [placeholder]=\"'satori-components.comments.write-comment' | translate\"\n          [value]=\"newText()\"\n          (input)=\"newText.set(textOf($event))\"\n          (keydown.control.enter)=\"$event.preventDefault(); submitComment()\"\n          (keydown.meta.enter)=\"$event.preventDefault(); submitComment()\"\n        ></textarea>\n      </mat-form-field>\n      @if (newText().trim()) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          [disabled]=\"saving()\"\n          [attr.aria-label]=\"'satori-components.comments.submit-comment' | translate\"\n          [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n          (click)=\"submitComment()\"\n        >\n          <mat-icon>check</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          type=\"button\"\n          [attr.aria-label]=\"'satori-components.comments.clear' | translate\"\n          (click)=\"newText.set('')\"\n        >\n          <mat-icon>close</mat-icon>\n        </button>\n      }\n    </div>\n  }\n}\n\n<ng-template #entry let-comment let-parent=\"parent\">\n  @let isReply = parent !== null;\n  <div class=\"nxs-comments__header\">\n    <nxs-avatar\n      [initials]=\"initial(comment.author)\"\n      [color]=\"color(comment.author)\"\n      [size]=\"isReply ? '24' : '28'\"\n    />\n    <span class=\"nxs-comments__author\">{{ comment.author }}</span>\n    <time class=\"nxs-comments__time\" [attr.datetime]=\"comment.creationDate\">\n      @if (edited(comment)) {\n        {{ 'satori-components.comments.edited' | translate: { time: when(comment.creationDate) } }}\n      } @else {\n        {{ when(comment.creationDate) }}\n      }\n    </time>\n    @if (canModify(comment)) {\n      <button\n        mat-icon-button\n        type=\"button\"\n        class=\"nxs-comments__menu\"\n        [matMenuTriggerFor]=\"menu\"\n        (menuClosed)=\"menuClosed()\"\n        [attr.aria-label]=\"\n          (isReply\n            ? 'satori-components.comments.reply-actions'\n            : 'satori-components.comments.comment-actions'\n          ) | translate: { author: comment.author }\n        \"\n      >\n        <mat-icon>more_vert</mat-icon>\n      </button>\n      <mat-menu #menu=\"matMenu\">\n        <button mat-menu-item type=\"button\" (click)=\"choose('edit', comment, parent)\">\n          <mat-icon>edit</mat-icon>\n          {{ 'satori-components.comments.edit' | translate }}\n        </button>\n        <button mat-menu-item type=\"button\" (click)=\"choose('delete', comment, parent)\">\n          <mat-icon>delete</mat-icon>\n          {{ 'satori-components.comments.delete' | translate }}\n        </button>\n      </mat-menu>\n    }\n  </div>\n  @if (editing() === comment.id) {\n    <div class=\"nxs-comments__composer nxs-comments__composer--edit\">\n      <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n        <mat-label>{{\n          (isReply\n            ? 'satori-components.comments.edit-reply'\n            : 'satori-components.comments.edit-comment'\n          ) | translate\n        }}</mat-label>\n        <textarea\n          matInput\n          cdkTextareaAutosize\n          cdkAutosizeMinRows=\"1\"\n          cdkAutosizeMaxRows=\"4\"\n          aria-keyshortcuts=\"Control+Enter\"\n          [id]=\"id + '-edit-' + comment.id\"\n          [value]=\"editText()\"\n          (input)=\"editText.set(textOf($event))\"\n          (keydown.control.enter)=\"$event.preventDefault(); saveEdit(comment, parent)\"\n          (keydown.meta.enter)=\"$event.preventDefault(); saveEdit(comment, parent)\"\n          (keydown.escape)=\"cancelEdit()\"\n        ></textarea>\n      </mat-form-field>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [disabled]=\"saving() || !editText().trim()\"\n        [attr.aria-label]=\"'satori-components.comments.save' | translate\"\n        [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n        (click)=\"saveEdit(comment, parent)\"\n      >\n        <mat-icon>check</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [attr.aria-label]=\"'satori-components.comments.cancel' | translate\"\n        (click)=\"cancelEdit()\"\n      >\n        <mat-icon>close</mat-icon>\n      </button>\n    </div>\n  } @else {\n    <p class=\"nxs-comments__text\">\n      <span class=\"nxs-comments__body\">{{\n        truncated(comment) ? shortText(comment) : comment.text\n      }}</span>\n      @if (truncated(comment)) {\n        <button class=\"nxs-comments__show-all\" type=\"button\" (click)=\"showFullText(comment)\">\n          {{ 'satori-components.comments.show-all' | translate }}\n        </button>\n      }\n    </p>\n  }\n  @if (extra(); as projected) {\n    <ng-container *ngTemplateOutlet=\"projected.template; context: { $implicit: comment }\" />\n  }\n  @if (!isReply && !readOnly()) {\n    <button\n      class=\"nxs-comments__reply\"\n      type=\"button\"\n      [attr.aria-label]=\"\n        'satori-components.comments.reply-to' | translate: { author: comment.author }\n      \"\n      (click)=\"openReplies(comment.id, true)\"\n    >\n      <mat-icon aria-hidden=\"true\">reply</mat-icon>\n      {{ 'satori-components.comments.reply' | translate }}\n    </button>\n  }\n</ng-template>\n\n<ng-template #deleteConfirmation let-data>\n  <h2 mat-dialog-title>\n    {{\n      (data.reply\n        ? 'satori-components.comments.delete-reply-title'\n        : 'satori-components.comments.delete-comment-title'\n      ) | translate\n    }}\n  </h2>\n  <mat-dialog-content>\n    {{\n      (data.reply\n        ? 'satori-components.comments.delete-reply-message'\n        : data.replies > 0\n          ? 'satori-components.comments.delete-comment-with-replies'\n          : 'satori-components.comments.delete-comment-message'\n      ) | translate\n    }}\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\">\n    <button mat-button type=\"button\" mat-dialog-close>\n      {{ 'satori-components.comments.cancel' | translate }}\n    </button>\n    <button mat-flat-button type=\"button\" [mat-dialog-close]=\"true\">\n      {{ 'satori-components.comments.delete' | translate }}\n    </button>\n  </mat-dialog-actions>\n</ng-template>\n", styles: [":host{--nxs-comments-text: var(--mat-sys-on-surface);--nxs-comments-muted: var(--mat-sys-on-surface-variant);--nxs-comments-link: var(--mat-sys-primary);--nxs-comments-divider: var(--mat-sys-outline-variant);display:block;font-size:13px;color:var(--nxs-comments-text)}.nxs-comments__loading{display:flex;justify-content:center;padding:24px 0}.nxs-comments__failed{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 0}:host .nxs-comments__failed p{margin:0}:host .nxs-comments__empty{margin:12px 0;color:var(--nxs-comments-muted)}.nxs-comments__list{list-style:none;margin:0;padding:0}.nxs-comments__list:focus{outline:none}.nxs-comments__comment{padding:12px 0;border-bottom:1px solid var(--nxs-comments-divider)}.nxs-comments__comment--reply{padding:8px 0;border-bottom:none}.nxs-comments__header{display:flex;align-items:center;gap:8px;min-height:32px}.nxs-comments__author{font-weight:500;overflow-wrap:anywhere}.nxs-comments__time{font-size:12px;color:var(--nxs-comments-muted)}.nxs-comments__menu{margin-inline-start:auto}:host .nxs-comments__text{margin-block:4px 0;margin-inline:36px 0;overflow-wrap:anywhere;line-height:1.5}:host .nxs-comments__comment--reply .nxs-comments__text{margin-inline-start:32px}.nxs-comments__body{white-space:pre-wrap}.nxs-comments__replies{margin-block:8px 0;margin-inline:36px 0;padding-inline-start:12px;border-inline-start:2px solid var(--nxs-comments-divider)}.nxs-comments__more,.nxs-comments__show-all,.nxs-comments__reply,.nxs-comments__summary{display:inline-flex;align-items:center;gap:4px;padding:4px 0;border:none;background:none;font:inherit;font-size:12px;color:var(--nxs-comments-link);cursor:pointer}.nxs-comments__more:hover,.nxs-comments__show-all:hover,.nxs-comments__reply:hover,.nxs-comments__summary:hover{text-decoration:underline}.nxs-comments__more:focus-visible,.nxs-comments__show-all:focus-visible,.nxs-comments__reply:focus-visible,.nxs-comments__summary:focus-visible{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__more:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__show-all:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__reply:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__summary:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__more{margin-block:8px 0}.nxs-comments__reply,.nxs-comments__summary{margin-block:4px 0;margin-inline:36px 0}.nxs-comments__reply mat-icon,.nxs-comments__summary mat-icon{width:16px;height:16px;font-size:16px}.nxs-comments__show-all{padding:0;margin-inline-start:4px}.nxs-comments__composer{display:flex;align-items:flex-start;gap:4px;margin-top:12px}.nxs-comments__composer mat-form-field{flex:1;min-width:0}.nxs-comments__composer--edit{margin-block:4px 0;margin-inline:36px 0}.nxs-comments__replies .nxs-comments__composer{margin-top:8px}\n"], dependencies: [{ kind: "directive", type: CdkTextareaAutosize, selector: "textarea[cdkTextareaAutosize]", inputs: ["cdkAutosizeMinRows", "cdkAutosizeMaxRows", "cdkTextareaAutosize", "placeholder"], exportAs: ["cdkTextareaAutosize"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "directive", type: MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "directive", type: MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "component", type: MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "component", type: MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "directive", type: MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "directive", type: MatLabel, selector: "mat-label" }, { kind: "component", type: MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "component", type: MatMenuItem, selector: "[mat-menu-item]", inputs: ["role", "disabled", "disableRipple"], exportAs: ["matMenuItem"] }, { kind: "directive", type: MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "directive", type: MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "component", type: NxsAvatarComponent, selector: "nxs-avatar", inputs: ["initials", "color", "size", "label"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsCommentsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-comments', standalone: true, imports: [
                        CdkTextareaAutosize,
                        NgTemplateOutlet,
                        MatButton,
                        MatDialogActions,
                        MatDialogClose,
                        MatDialogContent,
                        MatDialogTitle,
                        MatFormField,
                        MatIcon,
                        MatIconButton,
                        MatInput,
                        MatLabel,
                        MatMenu,
                        MatMenuItem,
                        MatMenuTrigger,
                        MatTooltip,
                        TranslatePipe,
                        NxsAvatarComponent,
                        NxsSpinnerComponent,
                    ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-comments' }, template: "@if (loading()) {\n  <div class=\"nxs-comments__loading\">\n    <nxs-spinner diameter=\"28\" [label]=\"'satori-components.comments.loading' | translate\" />\n  </div>\n} @else if (failed()) {\n  <div class=\"nxs-comments__failed\" role=\"alert\">\n    <p>{{ 'satori-components.comments.load-failed' | translate }}</p>\n    <button mat-button type=\"button\" (click)=\"reload()\">\n      {{ 'satori-components.comments.retry' | translate }}\n    </button>\n  </div>\n} @else {\n  @if (hiddenCount() > 0) {\n    <button class=\"nxs-comments__more\" type=\"button\" (click)=\"allShown.set(true)\">\n      {{ 'satori-components.comments.view-all-comments' | translate: { count: comments().length } }}\n    </button>\n  }\n  @if (comments().length === 0) {\n    <p class=\"nxs-comments__empty\">{{ 'satori-components.comments.empty' | translate }}</p>\n  }\n  <ul\n    class=\"nxs-comments__list\"\n    tabindex=\"-1\"\n    [id]=\"id + '-list'\"\n    [attr.aria-label]=\"'satori-components.comments.list' | translate\"\n  >\n    @for (comment of shown(); track comment.id) {\n      @let count = repliesOf(comment.id).length;\n      @let open = opened().has(comment.id);\n      <li class=\"nxs-comments__comment\">\n        <ng-container *ngTemplateOutlet=\"entry; context: { $implicit: comment, parent: null }\" />\n        @if (count > 0 && !open) {\n          <button\n            class=\"nxs-comments__summary\"\n            type=\"button\"\n            aria-expanded=\"false\"\n            (click)=\"openReplies(comment.id)\"\n          >\n            {{\n              (count === 1\n                ? 'satori-components.comments.replies-one'\n                : 'satori-components.comments.replies-other'\n              ) | translate: { count }\n            }}\n            \u00B7\n            {{\n              'satori-components.comments.last-reply' | translate: { time: lastReply(comment.id) }\n            }}\n          </button>\n        }\n        @if (open) {\n          <div class=\"nxs-comments__replies\">\n            @if (shownReplies(comment.id).length < count) {\n              <button class=\"nxs-comments__more\" type=\"button\" (click)=\"showAllReplies(comment.id)\">\n                {{ 'satori-components.comments.view-all-replies' | translate: { count } }}\n              </button>\n            }\n            @if (count > 0) {\n              <ul class=\"nxs-comments__list\">\n                @for (reply of shownReplies(comment.id); track reply.id) {\n                  <li class=\"nxs-comments__comment nxs-comments__comment--reply\">\n                    <ng-container\n                      *ngTemplateOutlet=\"entry; context: { $implicit: reply, parent: comment }\"\n                    />\n                  </li>\n                }\n              </ul>\n            }\n            @if (!readOnly()) {\n              <div class=\"nxs-comments__composer\">\n                <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'satori-components.comments.reply-label' | translate }}</mat-label>\n                  <textarea\n                    matInput\n                    cdkTextareaAutosize\n                    cdkAutosizeMinRows=\"1\"\n                    cdkAutosizeMaxRows=\"4\"\n                    aria-keyshortcuts=\"Control+Enter\"\n                    [id]=\"id + '-reply-' + comment.id\"\n                    [placeholder]=\"'satori-components.comments.write-reply' | translate\"\n                    [value]=\"replyText(comment.id)\"\n                    (input)=\"setReplyText(comment.id, textOf($event))\"\n                    (keydown.control.enter)=\"$event.preventDefault(); submitReply(comment)\"\n                    (keydown.meta.enter)=\"$event.preventDefault(); submitReply(comment)\"\n                  ></textarea>\n                </mat-form-field>\n                @if (replyText(comment.id).trim()) {\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [disabled]=\"saving()\"\n                    [attr.aria-label]=\"'satori-components.comments.submit-reply' | translate\"\n                    [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n                    (click)=\"submitReply(comment)\"\n                  >\n                    <mat-icon>check</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"'satori-components.comments.clear' | translate\"\n                    (click)=\"setReplyText(comment.id, '')\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                }\n              </div>\n            }\n          </div>\n        }\n      </li>\n    }\n  </ul>\n  @if (!readOnly()) {\n    <div class=\"nxs-comments__composer\">\n      <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n        <mat-label>{{ 'satori-components.comments.comment-label' | translate }}</mat-label>\n        <textarea\n          matInput\n          cdkTextareaAutosize\n          cdkAutosizeMinRows=\"1\"\n          cdkAutosizeMaxRows=\"4\"\n          aria-keyshortcuts=\"Control+Enter\"\n          [id]=\"id + '-new'\"\n          [placeholder]=\"'satori-components.comments.write-comment' | translate\"\n          [value]=\"newText()\"\n          (input)=\"newText.set(textOf($event))\"\n          (keydown.control.enter)=\"$event.preventDefault(); submitComment()\"\n          (keydown.meta.enter)=\"$event.preventDefault(); submitComment()\"\n        ></textarea>\n      </mat-form-field>\n      @if (newText().trim()) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          [disabled]=\"saving()\"\n          [attr.aria-label]=\"'satori-components.comments.submit-comment' | translate\"\n          [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n          (click)=\"submitComment()\"\n        >\n          <mat-icon>check</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          type=\"button\"\n          [attr.aria-label]=\"'satori-components.comments.clear' | translate\"\n          (click)=\"newText.set('')\"\n        >\n          <mat-icon>close</mat-icon>\n        </button>\n      }\n    </div>\n  }\n}\n\n<ng-template #entry let-comment let-parent=\"parent\">\n  @let isReply = parent !== null;\n  <div class=\"nxs-comments__header\">\n    <nxs-avatar\n      [initials]=\"initial(comment.author)\"\n      [color]=\"color(comment.author)\"\n      [size]=\"isReply ? '24' : '28'\"\n    />\n    <span class=\"nxs-comments__author\">{{ comment.author }}</span>\n    <time class=\"nxs-comments__time\" [attr.datetime]=\"comment.creationDate\">\n      @if (edited(comment)) {\n        {{ 'satori-components.comments.edited' | translate: { time: when(comment.creationDate) } }}\n      } @else {\n        {{ when(comment.creationDate) }}\n      }\n    </time>\n    @if (canModify(comment)) {\n      <button\n        mat-icon-button\n        type=\"button\"\n        class=\"nxs-comments__menu\"\n        [matMenuTriggerFor]=\"menu\"\n        (menuClosed)=\"menuClosed()\"\n        [attr.aria-label]=\"\n          (isReply\n            ? 'satori-components.comments.reply-actions'\n            : 'satori-components.comments.comment-actions'\n          ) | translate: { author: comment.author }\n        \"\n      >\n        <mat-icon>more_vert</mat-icon>\n      </button>\n      <mat-menu #menu=\"matMenu\">\n        <button mat-menu-item type=\"button\" (click)=\"choose('edit', comment, parent)\">\n          <mat-icon>edit</mat-icon>\n          {{ 'satori-components.comments.edit' | translate }}\n        </button>\n        <button mat-menu-item type=\"button\" (click)=\"choose('delete', comment, parent)\">\n          <mat-icon>delete</mat-icon>\n          {{ 'satori-components.comments.delete' | translate }}\n        </button>\n      </mat-menu>\n    }\n  </div>\n  @if (editing() === comment.id) {\n    <div class=\"nxs-comments__composer nxs-comments__composer--edit\">\n      <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n        <mat-label>{{\n          (isReply\n            ? 'satori-components.comments.edit-reply'\n            : 'satori-components.comments.edit-comment'\n          ) | translate\n        }}</mat-label>\n        <textarea\n          matInput\n          cdkTextareaAutosize\n          cdkAutosizeMinRows=\"1\"\n          cdkAutosizeMaxRows=\"4\"\n          aria-keyshortcuts=\"Control+Enter\"\n          [id]=\"id + '-edit-' + comment.id\"\n          [value]=\"editText()\"\n          (input)=\"editText.set(textOf($event))\"\n          (keydown.control.enter)=\"$event.preventDefault(); saveEdit(comment, parent)\"\n          (keydown.meta.enter)=\"$event.preventDefault(); saveEdit(comment, parent)\"\n          (keydown.escape)=\"cancelEdit()\"\n        ></textarea>\n      </mat-form-field>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [disabled]=\"saving() || !editText().trim()\"\n        [attr.aria-label]=\"'satori-components.comments.save' | translate\"\n        [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n        (click)=\"saveEdit(comment, parent)\"\n      >\n        <mat-icon>check</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [attr.aria-label]=\"'satori-components.comments.cancel' | translate\"\n        (click)=\"cancelEdit()\"\n      >\n        <mat-icon>close</mat-icon>\n      </button>\n    </div>\n  } @else {\n    <p class=\"nxs-comments__text\">\n      <span class=\"nxs-comments__body\">{{\n        truncated(comment) ? shortText(comment) : comment.text\n      }}</span>\n      @if (truncated(comment)) {\n        <button class=\"nxs-comments__show-all\" type=\"button\" (click)=\"showFullText(comment)\">\n          {{ 'satori-components.comments.show-all' | translate }}\n        </button>\n      }\n    </p>\n  }\n  @if (extra(); as projected) {\n    <ng-container *ngTemplateOutlet=\"projected.template; context: { $implicit: comment }\" />\n  }\n  @if (!isReply && !readOnly()) {\n    <button\n      class=\"nxs-comments__reply\"\n      type=\"button\"\n      [attr.aria-label]=\"\n        'satori-components.comments.reply-to' | translate: { author: comment.author }\n      \"\n      (click)=\"openReplies(comment.id, true)\"\n    >\n      <mat-icon aria-hidden=\"true\">reply</mat-icon>\n      {{ 'satori-components.comments.reply' | translate }}\n    </button>\n  }\n</ng-template>\n\n<ng-template #deleteConfirmation let-data>\n  <h2 mat-dialog-title>\n    {{\n      (data.reply\n        ? 'satori-components.comments.delete-reply-title'\n        : 'satori-components.comments.delete-comment-title'\n      ) | translate\n    }}\n  </h2>\n  <mat-dialog-content>\n    {{\n      (data.reply\n        ? 'satori-components.comments.delete-reply-message'\n        : data.replies > 0\n          ? 'satori-components.comments.delete-comment-with-replies'\n          : 'satori-components.comments.delete-comment-message'\n      ) | translate\n    }}\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\">\n    <button mat-button type=\"button\" mat-dialog-close>\n      {{ 'satori-components.comments.cancel' | translate }}\n    </button>\n    <button mat-flat-button type=\"button\" [mat-dialog-close]=\"true\">\n      {{ 'satori-components.comments.delete' | translate }}\n    </button>\n  </mat-dialog-actions>\n</ng-template>\n", styles: [":host{--nxs-comments-text: var(--mat-sys-on-surface);--nxs-comments-muted: var(--mat-sys-on-surface-variant);--nxs-comments-link: var(--mat-sys-primary);--nxs-comments-divider: var(--mat-sys-outline-variant);display:block;font-size:13px;color:var(--nxs-comments-text)}.nxs-comments__loading{display:flex;justify-content:center;padding:24px 0}.nxs-comments__failed{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 0}:host .nxs-comments__failed p{margin:0}:host .nxs-comments__empty{margin:12px 0;color:var(--nxs-comments-muted)}.nxs-comments__list{list-style:none;margin:0;padding:0}.nxs-comments__list:focus{outline:none}.nxs-comments__comment{padding:12px 0;border-bottom:1px solid var(--nxs-comments-divider)}.nxs-comments__comment--reply{padding:8px 0;border-bottom:none}.nxs-comments__header{display:flex;align-items:center;gap:8px;min-height:32px}.nxs-comments__author{font-weight:500;overflow-wrap:anywhere}.nxs-comments__time{font-size:12px;color:var(--nxs-comments-muted)}.nxs-comments__menu{margin-inline-start:auto}:host .nxs-comments__text{margin-block:4px 0;margin-inline:36px 0;overflow-wrap:anywhere;line-height:1.5}:host .nxs-comments__comment--reply .nxs-comments__text{margin-inline-start:32px}.nxs-comments__body{white-space:pre-wrap}.nxs-comments__replies{margin-block:8px 0;margin-inline:36px 0;padding-inline-start:12px;border-inline-start:2px solid var(--nxs-comments-divider)}.nxs-comments__more,.nxs-comments__show-all,.nxs-comments__reply,.nxs-comments__summary{display:inline-flex;align-items:center;gap:4px;padding:4px 0;border:none;background:none;font:inherit;font-size:12px;color:var(--nxs-comments-link);cursor:pointer}.nxs-comments__more:hover,.nxs-comments__show-all:hover,.nxs-comments__reply:hover,.nxs-comments__summary:hover{text-decoration:underline}.nxs-comments__more:focus-visible,.nxs-comments__show-all:focus-visible,.nxs-comments__reply:focus-visible,.nxs-comments__summary:focus-visible{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__more:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__show-all:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__reply:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__summary:focus{outline:2px solid var(--nxs-comments-link);outline-offset:2px;border-radius:2px}.nxs-comments__more{margin-block:8px 0}.nxs-comments__reply,.nxs-comments__summary{margin-block:4px 0;margin-inline:36px 0}.nxs-comments__reply mat-icon,.nxs-comments__summary mat-icon{width:16px;height:16px;font-size:16px}.nxs-comments__show-all{padding:0;margin-inline-start:4px}.nxs-comments__composer{display:flex;align-items:flex-start;gap:4px;margin-top:12px}.nxs-comments__composer mat-form-field{flex:1;min-width:0}.nxs-comments__composer--edit{margin-block:4px 0;margin-inline:36px 0}.nxs-comments__replies .nxs-comments__composer{margin-top:8px}\n"] }]
        }], ctorParameters: () => [], propDecorators: { documentUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentUid", required: true }] }], readOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "readOnly", required: false }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], maxChars: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxChars", required: false }] }], threadChange: [{ type: i0.Output, args: ["threadChange"] }], extra: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NxsCommentExtraDirective), { isSignal: true }] }], deleteDialog: [{ type: i0.ViewChild, args: ['deleteConfirmation', { isSignal: true }] }] } });

/**
 * A short static label in a colour — the Material implementation of `nxs.primitives.tag`.
 *
 * Each colour is a hue of its own, tinted as the avatar's are, and `gray` the theme's neutral
 * container; set `--nxs-tag-<colour>-background` and `-foreground` to give a colour another hue. A
 * label longer than the space wraps inside the tag, as Web UI's does, rather than being cut short or
 * spilling out.
 */
class NxsTagComponent {
    /** The text, already translated. A long label wraps; it is never cut short. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The colour: `gray` or one of the avatar colours. */
    color = input('gray', ...(ngDevMode ? [{ debugName: "color" }] : []));
    namedColor = computed(() => nxsNamedColorStyle(this.color()), ...(ngDevMode ? [{ debugName: "namedColor" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTagComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsTagComponent, isStandalone: true, selector: "nxs-tag", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, color: { classPropertyName: "color", publicName: "color", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class": "'nxs-tag nxs-tag--' + color()", "style": "namedColor()" } }, ngImport: i0, template: "<span class=\"nxs-tag__label\">{{ label() }}</span>\n", styles: [":host{--nxs-tag-named-background: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-background-mix), var(--mat-sys-surface) );--nxs-tag-named-foreground: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-foreground-mix), var(--mat-sys-on-surface) );display:inline-flex;align-items:center;box-sizing:border-box;max-inline-size:100%;padding:2px 8px;border-radius:4px;font:var(--mat-sys-label-medium);background:var(--nxs-tag-background, var(--mat-sys-surface-container-high));color:var(--nxs-tag-foreground, var(--mat-sys-on-surface-variant))}.nxs-tag__label{min-inline-size:0;overflow-wrap:anywhere}:host(.nxs-tag--gray){--nxs-tag-background: var(--nxs-tag-gray-background, var(--mat-sys-surface-container-high));--nxs-tag-foreground: var(--nxs-tag-gray-foreground, var(--mat-sys-on-surface-variant))}:host(.nxs-tag--purple){--nxs-tag-background: var(--nxs-tag-purple-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-purple-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--blue){--nxs-tag-background: var(--nxs-tag-blue-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-blue-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--pink){--nxs-tag-background: var(--nxs-tag-pink-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-pink-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--teal){--nxs-tag-background: var(--nxs-tag-teal-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-teal-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--yellow){--nxs-tag-background: var(--nxs-tag-yellow-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-yellow-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--green){--nxs-tag-background: var(--nxs-tag-green-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-green-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--red){--nxs-tag-background: var(--nxs-tag-red-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-red-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--orange){--nxs-tag-background: var(--nxs-tag-orange-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-orange-foreground, var(--nxs-tag-named-foreground))}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTagComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-tag', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: { '[class]': "'nxs-tag nxs-tag--' + color()", '[style]': 'namedColor()' }, template: "<span class=\"nxs-tag__label\">{{ label() }}</span>\n", styles: [":host{--nxs-tag-named-background: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-background-mix), var(--mat-sys-surface) );--nxs-tag-named-foreground: color-mix( in srgb, var(--nxs-named-hue) var(--nxs-named-foreground-mix), var(--mat-sys-on-surface) );display:inline-flex;align-items:center;box-sizing:border-box;max-inline-size:100%;padding:2px 8px;border-radius:4px;font:var(--mat-sys-label-medium);background:var(--nxs-tag-background, var(--mat-sys-surface-container-high));color:var(--nxs-tag-foreground, var(--mat-sys-on-surface-variant))}.nxs-tag__label{min-inline-size:0;overflow-wrap:anywhere}:host(.nxs-tag--gray){--nxs-tag-background: var(--nxs-tag-gray-background, var(--mat-sys-surface-container-high));--nxs-tag-foreground: var(--nxs-tag-gray-foreground, var(--mat-sys-on-surface-variant))}:host(.nxs-tag--purple){--nxs-tag-background: var(--nxs-tag-purple-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-purple-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--blue){--nxs-tag-background: var(--nxs-tag-blue-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-blue-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--pink){--nxs-tag-background: var(--nxs-tag-pink-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-pink-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--teal){--nxs-tag-background: var(--nxs-tag-teal-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-teal-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--yellow){--nxs-tag-background: var(--nxs-tag-yellow-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-yellow-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--green){--nxs-tag-background: var(--nxs-tag-green-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-green-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--red){--nxs-tag-background: var(--nxs-tag-red-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-red-foreground, var(--nxs-tag-named-foreground))}:host(.nxs-tag--orange){--nxs-tag-background: var(--nxs-tag-orange-background, var(--nxs-tag-named-background));--nxs-tag-foreground: var(--nxs-tag-orange-foreground, var(--nxs-tag-named-foreground))}\n"] }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], color: [{ type: i0.Input, args: [{ isSignal: true, alias: "color", required: false }] }] } });

const same$1 = (a, b) => a.toLowerCase() === b.toLowerCase();
let nextId$c = 0;
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
class NxsTagEditorComponent {
    tagService = inject(TagService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    /** The document to tag. */
    documentUid = input.required(...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** The document's tags as loaded — `nxtag:tags`' labels. */
    tags = input([], ...(ngDevMode ? [{ debugName: "tags" }] : []));
    /** Shows the tags only, with no box and no remove buttons. */
    readOnly = input(false, ...(ngDevMode ? [{ debugName: "readOnly" }] : []));
    /** The document's tags after each saved change, as Nuxeo stored them. */
    tagsChange = output();
    id = `nxs-tag-editor-${nextId$c++}`;
    boxRef = viewChild('box', ...(ngDevMode ? [{ debugName: "boxRef" }] : []));
    trigger = viewChild(MatAutocompleteTrigger, ...(ngDevMode ? [{ debugName: "trigger" }] : []));
    /** The tags as last known: the input, then each answer from the server. */
    saved = linkedSignal(...(ngDevMode ? [{ debugName: "saved", source: () => ({ uid: this.documentUid(), tags: this.tags() }),
            computation: ({ tags }) => tags }] : [{
            source: () => ({ uid: this.documentUid(), tags: this.tags() }),
            computation: ({ tags }) => tags,
        }]));
    adding = signal([], ...(ngDevMode ? [{ debugName: "adding" }] : []));
    removing = signal(new Set(), ...(ngDevMode ? [{ debugName: "removing" }] : []));
    term = signal('', ...(ngDevMode ? [{ debugName: "term" }] : []));
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    /** The chips: the saved tags less those being removed. Tags being added show after them. */
    shown = computed(() => this.saved().filter((tag) => !this.removing().has(tag)), ...(ngDevMode ? [{ debugName: "shown" }] : []));
    options = computed(() => {
        const term = this.term().trim().toLowerCase();
        if (!term)
            return [];
        const taken = [...this.saved(), ...this.adding()];
        const existing = this.suggestions()
            .filter((tag) => !taken.some((other) => same$1(other, tag)))
            .map((label) => ({ label, isNew: false }));
        const known = [...taken, ...this.suggestions()].some((tag) => same$1(tag, term));
        return known ? existing : [{ label: term, isNew: true }, ...existing];
    }, ...(ngDevMode ? [{ debugName: "options" }] : []));
    requests = new Subject();
    terms = new Subject();
    constructor() {
        toObservable(this.documentUid)
            .pipe(switchMap((uid) => {
            this.adding.set([]);
            this.removing.set(new Set());
            return this.requests.pipe(concatMap((request) => this.send(uid, request)));
        }), takeUntilDestroyed())
            .subscribe((outcome) => this.settle(outcome));
        this.terms
            .pipe(map((term) => term.trim()), debounceTime(250), distinctUntilChanged(), switchMap((term) => term
            ? this.tagService.suggestTags(term).pipe(catchError(() => of([])))
            : of([])), takeUntilDestroyed())
            .subscribe((tags) => this.suggestions.set(tags));
    }
    typed(value) {
        this.term.set(value);
        this.terms.next(value);
    }
    /** A suggestion picked with the mouse, or highlighted when Enter was pressed. */
    picked(event) {
        const option = event.option.value;
        event.option.deselect();
        this.clearBox();
        this.add(option.label);
    }
    /** Enter in the box. Ignored while a suggestion is highlighted: picking it adds the tag. */
    entered(event) {
        const trigger = this.trigger();
        if (trigger?.panelOpen && trigger.activeOption)
            return;
        const label = event.value.trim();
        this.clearBox();
        if (label)
            this.add(label.toLowerCase());
    }
    remove(tag) {
        if (this.removing().has(tag))
            return;
        this.removing.update((labels) => new Set([...labels, tag]));
        this.requests.next({ change: 'remove', label: tag });
    }
    add(label) {
        const taken = [...this.saved(), ...this.adding()];
        if (taken.some((tag) => same$1(tag, label)))
            return;
        this.adding.update((labels) => [...labels, label]);
        this.requests.next({ change: 'add', label });
    }
    send(uid, request) {
        const call = request.change === 'add'
            ? this.tagService.addTag(uid, request.label)
            : this.tagService.removeTag(uid, request.label);
        return call.pipe(map((tags) => ({ ...request, tags })), catchError((error) => of({ ...request, error })));
    }
    settle(outcome) {
        const { change, label } = outcome;
        if (change === 'add') {
            this.adding.update((labels) => labels.filter((tag) => tag !== label));
        }
        else {
            this.removing.update((labels) => new Set([...labels].filter((tag) => tag !== label)));
        }
        if ('error' in outcome) {
            this.toast.error(this.failure(change, outcome.error, label));
            return;
        }
        const before = this.saved();
        this.saved.set(outcome.tags);
        this.tagsChange.emit(outcome.tags);
        // The label Nuxeo stored, which is the one to announce: "Q3 Report" comes back as `q3report`.
        const stored = change === 'add'
            ? (outcome.tags.find((tag) => !before.includes(tag)) ?? label.replace(/\s+/g, ''))
            : label;
        const done = change === 'add' ? 'added' : 'removed';
        this.toast.show(this.translate.instant(`satori-components.tag-editor.${done}`, { tag: stored }));
    }
    failure(change, error, tag) {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const key = status === 401 || status === 403
            ? `satori-components.tag-editor.error.forbidden`
            : `satori-components.tag-editor.error.${change}`;
        return this.translate.instant(key, { tag });
    }
    clearBox() {
        const box = this.boxRef()?.nativeElement;
        if (box)
            box.value = '';
        this.typed('');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTagEditorComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsTagEditorComponent, isStandalone: true, selector: "nxs-tag-editor", inputs: { documentUid: { classPropertyName: "documentUid", publicName: "documentUid", isSignal: true, isRequired: true, transformFunction: null }, tags: { classPropertyName: "tags", publicName: "tags", isSignal: true, isRequired: false, transformFunction: null }, readOnly: { classPropertyName: "readOnly", publicName: "readOnly", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { tagsChange: "tagsChange" }, providers: [provideNxsToast()], viewQueries: [{ propertyName: "boxRef", first: true, predicate: ["box"], descendants: true, isSignal: true }, { propertyName: "trigger", first: true, predicate: MatAutocompleteTrigger, descendants: true, isSignal: true }], ngImport: i0, template: "@if (readOnly()) {\n  <ul\n    class=\"nxs-tag-editor__chips\"\n    [attr.aria-label]=\"'satori-components.tag-editor.tags' | translate\"\n  >\n    @for (tag of saved(); track tag) {\n      <li><nxs-tag color=\"gray\" [label]=\"tag\" /></li>\n    } @empty {\n      <li class=\"nxs-tag-editor__empty\">\n        <span aria-hidden=\"true\">\u2014</span>\n        <span class=\"nxs-tag-editor__sr-only\">{{\n          'satori-components.tag-editor.none' | translate\n        }}</span>\n      </li>\n    }\n  </ul>\n} @else {\n  <mat-form-field class=\"nxs-tag-editor__field\" subscriptSizing=\"dynamic\">\n    <mat-chip-grid #grid [attr.aria-label]=\"'satori-components.tag-editor.tags' | translate\">\n      @for (tag of shown(); track tag) {\n        <mat-chip-row (removed)=\"remove(tag)\">\n          {{ tag }}\n          <button\n            type=\"button\"\n            matChipRemove\n            [attr.aria-label]=\"'satori-components.tag-editor.remove' | translate: { tag }\"\n          >\n            <mat-icon class=\"nxs-tag-editor__remove-icon\" aria-hidden=\"true\"></mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      @for (tag of adding(); track tag) {\n        <mat-chip-row class=\"nxs-tag-editor__pending\" disabled>\n          {{ tag }}\n          <nxs-spinner\n            diameter=\"14\"\n            [label]=\"'satori-components.tag-editor.adding' | translate: { tag }\"\n          />\n        </mat-chip-row>\n      }\n    </mat-chip-grid>\n    <!-- Outside the grid: the autocomplete makes the box a combobox, which a grid may not contain. -->\n    <input\n      #box\n      class=\"nxs-tag-editor__box\"\n      [id]=\"id + '-box'\"\n      [placeholder]=\"'satori-components.tag-editor.add' | translate\"\n      [attr.aria-label]=\"'satori-components.tag-editor.add' | translate\"\n      [matChipInputFor]=\"grid\"\n      [matAutocomplete]=\"suggestionList\"\n      (input)=\"typed(box.value)\"\n      (matChipInputTokenEnd)=\"entered($event)\"\n    />\n    <mat-autocomplete\n      #suggestionList=\"matAutocomplete\"\n      autoActiveFirstOption\n      (optionSelected)=\"picked($event)\"\n    >\n      @for (option of options(); track option.label) {\n        <mat-option\n          [value]=\"option\"\n          [attr.aria-label]=\"\n            option.isNew\n              ? ('satori-components.tag-editor.new-label' | translate: { tag: option.label })\n              : null\n          \"\n        >\n          @if (option.isNew) {\n            <span class=\"nxs-tag-editor__new\">{{\n              'satori-components.tag-editor.new' | translate: { tag: option.label }\n            }}</span>\n          } @else {\n            {{ option.label }}\n          }\n        </mat-option>\n      }\n    </mat-autocomplete>\n  </mat-form-field>\n}\n", styles: [":host{--nxs-tag-editor-muted: var(--mat-sys-on-surface-variant);--nxs-tag-editor-new: var(--mat-sys-primary);--mat-chip-container-height: 24px;--mat-chip-label-text-size: 13px;--mat-chip-elevated-container-color: var(--mat-sys-surface-container-high);--mat-chip-label-text-color: var(--mat-sys-on-surface);--mat-chip-disabled-label-text-color: var(--nxs-tag-editor-muted);--mat-chip-disabled-container-opacity: 1;display:block;font-size:13px}.nxs-tag-editor__field{width:100%}:host .nxs-tag-editor__box{width:100%;margin:4px 0 0;font-size:13px}:host .nxs-tag-editor__chips{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}.nxs-tag-editor__empty{color:var(--nxs-tag-editor-muted)}.nxs-tag-editor__remove-icon:before{content:\"\\e5c9\";font:14px/1 Material Icons,sans-serif}.nxs-tag-editor__pending nxs-spinner{display:inline-flex;margin-inline-start:6px;vertical-align:middle}.nxs-tag-editor__new{font-weight:500;color:var(--nxs-tag-editor-new)}.nxs-tag-editor__sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n"], dependencies: [{ kind: "component", type: MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "directive", type: MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "component", type: MatChipGrid, selector: "mat-chip-grid", inputs: ["disabled", "placeholder", "required", "value", "errorStateMatcher"], outputs: ["change", "valueChange"] }, { kind: "directive", type: MatChipInput, selector: "input[matChipInputFor]", inputs: ["matChipInputFor", "matChipInputAddOnBlur", "matChipInputSeparatorKeyCodes", "placeholder", "id", "disabled", "readonly", "matChipInputDisabledInteractive"], outputs: ["matChipInputTokenEnd"], exportAs: ["matChipInput", "matChipInputFor"] }, { kind: "directive", type: MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: MatChipRow, selector: "mat-chip-row, [mat-chip-row], mat-basic-chip-row, [mat-basic-chip-row]", inputs: ["editable"], outputs: ["edited"] }, { kind: "component", type: MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "component", type: MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "component", type: NxsTagComponent, selector: "nxs-tag", inputs: ["label", "color"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTagEditorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-tag-editor', standalone: true, imports: [
                        MatAutocomplete,
                        MatAutocompleteTrigger,
                        MatChipGrid,
                        MatChipInput,
                        MatChipRemove,
                        MatChipRow,
                        MatFormField,
                        MatIcon,
                        MatOption,
                        TranslatePipe,
                        NxsSpinnerComponent,
                        NxsTagComponent,
                    ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (readOnly()) {\n  <ul\n    class=\"nxs-tag-editor__chips\"\n    [attr.aria-label]=\"'satori-components.tag-editor.tags' | translate\"\n  >\n    @for (tag of saved(); track tag) {\n      <li><nxs-tag color=\"gray\" [label]=\"tag\" /></li>\n    } @empty {\n      <li class=\"nxs-tag-editor__empty\">\n        <span aria-hidden=\"true\">\u2014</span>\n        <span class=\"nxs-tag-editor__sr-only\">{{\n          'satori-components.tag-editor.none' | translate\n        }}</span>\n      </li>\n    }\n  </ul>\n} @else {\n  <mat-form-field class=\"nxs-tag-editor__field\" subscriptSizing=\"dynamic\">\n    <mat-chip-grid #grid [attr.aria-label]=\"'satori-components.tag-editor.tags' | translate\">\n      @for (tag of shown(); track tag) {\n        <mat-chip-row (removed)=\"remove(tag)\">\n          {{ tag }}\n          <button\n            type=\"button\"\n            matChipRemove\n            [attr.aria-label]=\"'satori-components.tag-editor.remove' | translate: { tag }\"\n          >\n            <mat-icon class=\"nxs-tag-editor__remove-icon\" aria-hidden=\"true\"></mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      @for (tag of adding(); track tag) {\n        <mat-chip-row class=\"nxs-tag-editor__pending\" disabled>\n          {{ tag }}\n          <nxs-spinner\n            diameter=\"14\"\n            [label]=\"'satori-components.tag-editor.adding' | translate: { tag }\"\n          />\n        </mat-chip-row>\n      }\n    </mat-chip-grid>\n    <!-- Outside the grid: the autocomplete makes the box a combobox, which a grid may not contain. -->\n    <input\n      #box\n      class=\"nxs-tag-editor__box\"\n      [id]=\"id + '-box'\"\n      [placeholder]=\"'satori-components.tag-editor.add' | translate\"\n      [attr.aria-label]=\"'satori-components.tag-editor.add' | translate\"\n      [matChipInputFor]=\"grid\"\n      [matAutocomplete]=\"suggestionList\"\n      (input)=\"typed(box.value)\"\n      (matChipInputTokenEnd)=\"entered($event)\"\n    />\n    <mat-autocomplete\n      #suggestionList=\"matAutocomplete\"\n      autoActiveFirstOption\n      (optionSelected)=\"picked($event)\"\n    >\n      @for (option of options(); track option.label) {\n        <mat-option\n          [value]=\"option\"\n          [attr.aria-label]=\"\n            option.isNew\n              ? ('satori-components.tag-editor.new-label' | translate: { tag: option.label })\n              : null\n          \"\n        >\n          @if (option.isNew) {\n            <span class=\"nxs-tag-editor__new\">{{\n              'satori-components.tag-editor.new' | translate: { tag: option.label }\n            }}</span>\n          } @else {\n            {{ option.label }}\n          }\n        </mat-option>\n      }\n    </mat-autocomplete>\n  </mat-form-field>\n}\n", styles: [":host{--nxs-tag-editor-muted: var(--mat-sys-on-surface-variant);--nxs-tag-editor-new: var(--mat-sys-primary);--mat-chip-container-height: 24px;--mat-chip-label-text-size: 13px;--mat-chip-elevated-container-color: var(--mat-sys-surface-container-high);--mat-chip-label-text-color: var(--mat-sys-on-surface);--mat-chip-disabled-label-text-color: var(--nxs-tag-editor-muted);--mat-chip-disabled-container-opacity: 1;display:block;font-size:13px}.nxs-tag-editor__field{width:100%}:host .nxs-tag-editor__box{width:100%;margin:4px 0 0;font-size:13px}:host .nxs-tag-editor__chips{display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0;list-style:none}.nxs-tag-editor__empty{color:var(--nxs-tag-editor-muted)}.nxs-tag-editor__remove-icon:before{content:\"\\e5c9\";font:14px/1 Material Icons,sans-serif}.nxs-tag-editor__pending nxs-spinner{display:inline-flex;margin-inline-start:6px;vertical-align:middle}.nxs-tag-editor__new{font-weight:500;color:var(--nxs-tag-editor-new)}.nxs-tag-editor__sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n"] }]
        }], ctorParameters: () => [], propDecorators: { documentUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentUid", required: true }] }], tags: [{ type: i0.Input, args: [{ isSignal: true, alias: "tags", required: false }] }], readOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "readOnly", required: false }] }], tagsChange: [{ type: i0.Output, args: ["tagsChange"] }], boxRef: [{ type: i0.ViewChild, args: ['box', { isSignal: true }] }], trigger: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatAutocompleteTrigger), { isSignal: true }] }] } });

/**
 * Create a version of a document — Web UI's `nuxeo-document-create-version` dialog.
 *
 * As in Web UI: Minor and Major are offered with the number each would give, Major chosen first,
 * and Create runs `Document.CreateVersion`, which checks the document in at the new version. A toast
 * names the version created; a refusal reads as one. It does not decide who may version — open it
 * only where `canCreateDocumentVersion(doc)` holds, as `nxs-manage-versions` does.
 */
class NxsCreateVersionDialogComponent {
    data = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef);
    documents = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    increment = 'Major';
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    current = `${this.data.major}.${this.data.minor}`;
    nextMinor = `${this.data.major}.${this.data.minor + 1}`;
    nextMajor = `${this.data.major + 1}.0`;
    create() {
        if (this.saving())
            return;
        this.saving.set(true);
        const label = this.increment === 'Major' ? this.nextMajor : this.nextMinor;
        this.documents
            .createVersion(this.data.documentUid, this.increment)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (version) => {
                this.saving.set(false);
                this.toast.show(this.translate.instant('satori-components.create-version-dialog.created', {
                    version: label,
                }));
                this.dialogRef.close(version);
            },
            error: (err) => {
                this.saving.set(false);
                this.toast.error(this.translate.instant(isPermissionDeniedError(err)
                    ? 'satori-components.create-version-dialog.forbidden'
                    : 'satori-components.create-version-dialog.failed'));
            },
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsCreateVersionDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsCreateVersionDialogComponent, isStandalone: true, selector: "nxs-create-version-dialog", providers: [provideNxsToast()], ngImport: i0, template: "<h2 mat-dialog-title>\n  {{\n    'satori-components.create-version-dialog.title'\n      | translate: { document: data.documentTitle, version: current }\n  }}\n</h2>\n\n<mat-dialog-content>\n  <mat-radio-group\n    class=\"nxs-create-version-dialog__options\"\n    [(ngModel)]=\"increment\"\n    [attr.aria-label]=\"'satori-components.create-version-dialog.kind' | translate\"\n  >\n    <mat-radio-button value=\"Minor\" class=\"nxs-create-version-dialog__option\">\n      <span class=\"nxs-create-version-dialog__number\">{{ nextMinor }}</span>\n      {{ 'satori-components.create-version-dialog.minor' | translate }}\n    </mat-radio-button>\n    <mat-radio-button value=\"Major\" class=\"nxs-create-version-dialog__option\">\n      <span class=\"nxs-create-version-dialog__number\">{{ nextMajor }}</span>\n      {{ 'satori-components.create-version-dialog.major' | translate }}\n    </mat-radio-button>\n  </mat-radio-group>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" mat-dialog-close>\n    {{ 'satori-components.create-version-dialog.cancel' | translate }}\n  </button>\n  <span class=\"nxs-create-version-dialog__spacer\"></span>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-create-version-dialog__create\"\n    [disabled]=\"saving()\"\n    (click)=\"create()\"\n  >\n    @if (saving()) {\n      <mat-icon class=\"nxs-spinning\" aria-hidden=\"true\">autorenew</mat-icon>\n      {{ 'satori-components.create-version-dialog.creating' | translate }}\n    } @else {\n      {{ 'satori-components.create-version-dialog.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block}h2[mat-dialog-title]{overflow-wrap:anywhere}.nxs-create-version-dialog__options{display:flex;flex-direction:column;gap:16px}.nxs-create-version-dialog__option{min-height:48px}.nxs-create-version-dialog__number{display:inline-flex;justify-content:center;min-width:40px;margin-inline-end:12px;padding:4px 10px;border-radius:4px;background:var(--mat-sys-primary);color:var(--mat-sys-on-primary);font-weight:600}mat-dialog-actions{gap:12px}.nxs-create-version-dialog__spacer{flex:1}.nxs-spinning{animation:nxs-spin 1s linear infinite}@keyframes nxs-spin{to{transform:rotate(360deg)}}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i2$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i2$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatRadioModule }, { kind: "directive", type: i5.MatRadioGroup, selector: "mat-radio-group", inputs: ["color", "name", "labelPosition", "value", "selected", "disabled", "required", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioGroup"] }, { kind: "component", type: i5.MatRadioButton, selector: "mat-radio-button", inputs: ["id", "name", "aria-label", "aria-labelledby", "aria-describedby", "disableRipple", "tabIndex", "checked", "value", "labelPosition", "disabled", "required", "color", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioButton"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsCreateVersionDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-create-version-dialog', standalone: true, imports: [
                        FormsModule,
                        MatButtonModule,
                        MatDialogModule,
                        MatIconModule,
                        MatRadioModule,
                        TranslatePipe,
                    ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, template: "<h2 mat-dialog-title>\n  {{\n    'satori-components.create-version-dialog.title'\n      | translate: { document: data.documentTitle, version: current }\n  }}\n</h2>\n\n<mat-dialog-content>\n  <mat-radio-group\n    class=\"nxs-create-version-dialog__options\"\n    [(ngModel)]=\"increment\"\n    [attr.aria-label]=\"'satori-components.create-version-dialog.kind' | translate\"\n  >\n    <mat-radio-button value=\"Minor\" class=\"nxs-create-version-dialog__option\">\n      <span class=\"nxs-create-version-dialog__number\">{{ nextMinor }}</span>\n      {{ 'satori-components.create-version-dialog.minor' | translate }}\n    </mat-radio-button>\n    <mat-radio-button value=\"Major\" class=\"nxs-create-version-dialog__option\">\n      <span class=\"nxs-create-version-dialog__number\">{{ nextMajor }}</span>\n      {{ 'satori-components.create-version-dialog.major' | translate }}\n    </mat-radio-button>\n  </mat-radio-group>\n</mat-dialog-content>\n\n<mat-dialog-actions>\n  <button mat-stroked-button type=\"button\" mat-dialog-close>\n    {{ 'satori-components.create-version-dialog.cancel' | translate }}\n  </button>\n  <span class=\"nxs-create-version-dialog__spacer\"></span>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-create-version-dialog__create\"\n    [disabled]=\"saving()\"\n    (click)=\"create()\"\n  >\n    @if (saving()) {\n      <mat-icon class=\"nxs-spinning\" aria-hidden=\"true\">autorenew</mat-icon>\n      {{ 'satori-components.create-version-dialog.creating' | translate }}\n    } @else {\n      {{ 'satori-components.create-version-dialog.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block}h2[mat-dialog-title]{overflow-wrap:anywhere}.nxs-create-version-dialog__options{display:flex;flex-direction:column;gap:16px}.nxs-create-version-dialog__option{min-height:48px}.nxs-create-version-dialog__number{display:inline-flex;justify-content:center;min-width:40px;margin-inline-end:12px;padding:4px 10px;border-radius:4px;background:var(--mat-sys-primary);color:var(--mat-sys-on-primary);font-weight:600}mat-dialog-actions{gap:12px}.nxs-create-version-dialog__spacer{flex:1}.nxs-spinning{animation:nxs-spin 1s linear infinite}@keyframes nxs-spin{to{transform:rotate(360deg)}}\n"] }]
        }] });

const major = (doc) => Number(doc.properties?.['uid:major_version'] ?? 0);
const minor = (doc) => Number(doc.properties?.['uid:minor_version'] ?? 0);
/**
 * A document's version number as Web UI writes it: `1.2`, and `1.2+` while it is checked out —
 * changed since that version.
 */
function nxsVersionLabel(doc) {
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
class NxsManageVersionsComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsManageVersionsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsManageVersionsComponent, isStandalone: true, selector: "nxs-manage-versions", inputs: { document: { classPropertyName: "document", publicName: "document", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { versionSelected: "versionSelected", latestSelected: "latestSelected", versionCreated: "versionCreated" }, host: { classAttribute: "nxs-manage-versions" }, ngImport: i0, template: "@if (hasVersions()) {\n  <button\n    mat-button\n    type=\"button\"\n    class=\"nxs-manage-versions__trigger\"\n    [matMenuTriggerFor]=\"list\"\n    (menuOpened)=\"opened()\"\n  >\n    <span class=\"cdk-visually-hidden\">{{\n      'satori-components.manage-versions.version' | translate\n    }}</span>\n    {{ label() }}\n    <mat-icon aria-hidden=\"true\" iconPositionEnd>arrow_drop_down</mat-icon>\n  </button>\n\n  <mat-menu #list=\"matMenu\" class=\"nxs-manage-versions__menu\" xPosition=\"after\">\n    @if (offersCreate()) {\n      <button mat-menu-item type=\"button\" class=\"nxs-manage-versions__create\" (click)=\"create()\">\n        <mat-icon aria-hidden=\"true\">add_circle_outline</mat-icon>\n        <span>{{ 'satori-components.manage-versions.create' | translate }}</span>\n      </button>\n      <mat-divider />\n    }\n    @if (document().isVersion) {\n      <button\n        mat-menu-item\n        type=\"button\"\n        class=\"nxs-manage-versions__latest\"\n        (click)=\"latestSelected.emit()\"\n      >\n        <span>{{ 'satori-components.manage-versions.latest' | translate }}</span>\n      </button>\n    }\n    @if (failed()) {\n      <p class=\"nxs-manage-versions__note\" role=\"alert\">\n        {{ 'satori-components.manage-versions.failed' | translate }}\n      </p>\n      <button mat-menu-item type=\"button\" (click)=\"retry($event)\">\n        <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n        <span>{{ 'satori-components.manage-versions.retry' | translate }}</span>\n      </button>\n    } @else if (loading() && versions().length === 0) {\n      <div class=\"nxs-manage-versions__note\">\n        <nxs-spinner\n          diameter=\"20\"\n          [label]=\"'satori-components.manage-versions.loading' | translate\"\n        />\n      </div>\n    } @else {\n      @for (version of versions(); track version.uid) {\n        <button\n          mat-menu-item\n          type=\"button\"\n          role=\"menuitemradio\"\n          class=\"nxs-manage-versions__version\"\n          [attr.aria-checked]=\"isShown(version)\"\n          [class.nxs-manage-versions__version--shown]=\"isShown(version)\"\n          (click)=\"choose(version)\"\n        >\n          <span class=\"nxs-manage-versions__number\">{{ numberOf(version) }}</span\n          >&ngsp;\n          <span class=\"nxs-manage-versions__modified\">{{ modified(version) }}</span>\n        </button>\n      } @empty {\n        <p class=\"nxs-manage-versions__note\">\n          {{ 'satori-components.manage-versions.none' | translate }}\n        </p>\n      }\n    }\n  </mat-menu>\n} @else if (canCreate()) {\n  <button mat-stroked-button type=\"button\" class=\"nxs-manage-versions__create\" (click)=\"create()\">\n    {{ 'satori-components.manage-versions.create' | translate }}\n  </button>\n} @else {\n  <span class=\"nxs-manage-versions__unversioned\">{{\n    'satori-components.manage-versions.unversioned' | translate\n  }}</span>\n}\n", styles: [":host{display:inline-block}.nxs-manage-versions__trigger{min-width:0;padding-inline:8px 4px}.nxs-manage-versions__unversioned{color:var(--mat-sys-on-surface-variant)}.nxs-manage-versions__version{height:auto;min-height:56px;padding-block:6px}.nxs-manage-versions__number,.nxs-manage-versions__modified{display:block}.nxs-manage-versions__number{font-weight:500}.nxs-manage-versions__modified{font-size:12px;color:var(--mat-sys-on-surface-variant)}.nxs-manage-versions__version--shown .nxs-manage-versions__number{color:var(--mat-sys-primary)}.nxs-manage-versions__note{margin:0;padding:8px 16px;color:var(--mat-sys-on-surface-variant)}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDividerModule }, { kind: "component", type: i2$3.MatDivider, selector: "mat-divider", inputs: ["vertical", "inset"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatMenuModule }, { kind: "component", type: i3.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "component", type: i3.MatMenuItem, selector: "[mat-menu-item]", inputs: ["role", "disabled", "disableRipple"], exportAs: ["matMenuItem"] }, { kind: "directive", type: i3.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsManageVersionsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-manage-versions', standalone: true, imports: [
                        MatButtonModule,
                        MatDividerModule,
                        MatIconModule,
                        MatMenuModule,
                        TranslatePipe,
                        NxsSpinnerComponent,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-manage-versions' }, template: "@if (hasVersions()) {\n  <button\n    mat-button\n    type=\"button\"\n    class=\"nxs-manage-versions__trigger\"\n    [matMenuTriggerFor]=\"list\"\n    (menuOpened)=\"opened()\"\n  >\n    <span class=\"cdk-visually-hidden\">{{\n      'satori-components.manage-versions.version' | translate\n    }}</span>\n    {{ label() }}\n    <mat-icon aria-hidden=\"true\" iconPositionEnd>arrow_drop_down</mat-icon>\n  </button>\n\n  <mat-menu #list=\"matMenu\" class=\"nxs-manage-versions__menu\" xPosition=\"after\">\n    @if (offersCreate()) {\n      <button mat-menu-item type=\"button\" class=\"nxs-manage-versions__create\" (click)=\"create()\">\n        <mat-icon aria-hidden=\"true\">add_circle_outline</mat-icon>\n        <span>{{ 'satori-components.manage-versions.create' | translate }}</span>\n      </button>\n      <mat-divider />\n    }\n    @if (document().isVersion) {\n      <button\n        mat-menu-item\n        type=\"button\"\n        class=\"nxs-manage-versions__latest\"\n        (click)=\"latestSelected.emit()\"\n      >\n        <span>{{ 'satori-components.manage-versions.latest' | translate }}</span>\n      </button>\n    }\n    @if (failed()) {\n      <p class=\"nxs-manage-versions__note\" role=\"alert\">\n        {{ 'satori-components.manage-versions.failed' | translate }}\n      </p>\n      <button mat-menu-item type=\"button\" (click)=\"retry($event)\">\n        <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n        <span>{{ 'satori-components.manage-versions.retry' | translate }}</span>\n      </button>\n    } @else if (loading() && versions().length === 0) {\n      <div class=\"nxs-manage-versions__note\">\n        <nxs-spinner\n          diameter=\"20\"\n          [label]=\"'satori-components.manage-versions.loading' | translate\"\n        />\n      </div>\n    } @else {\n      @for (version of versions(); track version.uid) {\n        <button\n          mat-menu-item\n          type=\"button\"\n          role=\"menuitemradio\"\n          class=\"nxs-manage-versions__version\"\n          [attr.aria-checked]=\"isShown(version)\"\n          [class.nxs-manage-versions__version--shown]=\"isShown(version)\"\n          (click)=\"choose(version)\"\n        >\n          <span class=\"nxs-manage-versions__number\">{{ numberOf(version) }}</span\n          >&ngsp;\n          <span class=\"nxs-manage-versions__modified\">{{ modified(version) }}</span>\n        </button>\n      } @empty {\n        <p class=\"nxs-manage-versions__note\">\n          {{ 'satori-components.manage-versions.none' | translate }}\n        </p>\n      }\n    }\n  </mat-menu>\n} @else if (canCreate()) {\n  <button mat-stroked-button type=\"button\" class=\"nxs-manage-versions__create\" (click)=\"create()\">\n    {{ 'satori-components.manage-versions.create' | translate }}\n  </button>\n} @else {\n  <span class=\"nxs-manage-versions__unversioned\">{{\n    'satori-components.manage-versions.unversioned' | translate\n  }}</span>\n}\n", styles: [":host{display:inline-block}.nxs-manage-versions__trigger{min-width:0;padding-inline:8px 4px}.nxs-manage-versions__unversioned{color:var(--mat-sys-on-surface-variant)}.nxs-manage-versions__version{height:auto;min-height:56px;padding-block:6px}.nxs-manage-versions__number,.nxs-manage-versions__modified{display:block}.nxs-manage-versions__number{font-weight:500}.nxs-manage-versions__modified{font-size:12px;color:var(--mat-sys-on-surface-variant)}.nxs-manage-versions__version--shown .nxs-manage-versions__number{color:var(--mat-sys-primary)}.nxs-manage-versions__note{margin:0;padding:8px 16px;color:var(--mat-sys-on-surface-variant)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { document: [{ type: i0.Input, args: [{ isSignal: true, alias: "document", required: true }] }], versionSelected: [{ type: i0.Output, args: ["versionSelected"] }], latestSelected: [{ type: i0.Output, args: ["latestSelected"] }], versionCreated: [{ type: i0.Output, args: ["versionCreated"] }] } });

/**
 * The "nothing here" state for a list, panel or result set.
 *
 * Text arrives already translated — the library ships no catalogue of its own — so a caller
 * binds `[heading]="'browse.empty' | translate"`. Actions are projected, so a "Create" or
 * "Clear filters" button stays the caller's, wired to the caller's action.
 */
class NxsEmptyStateComponent {
    /** What is empty, in one line. */
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`. Set it to fit
     * where the component sits — one below the heading of the section it empties — so heading
     * navigation stays in order.
     */
    // Annotated rather than inferred: an inferred union is declared in the compiler's type order,
    // which moves with unrelated code and would change the published API snapshot each time.
    headingLevel = input(2, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** An optional second line — usually what to do next. Not rendered when blank. */
    message = input('', ...(ngDevMode ? [{ debugName: "message" }] : []));
    /** An optional Material icon ligature. Decorative, so hidden from assistive technology. */
    icon = input('', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsEmptyStateComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsEmptyStateComponent, isStandalone: true, selector: "nxs-empty-state", inputs: { heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: true, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null }, message: { classPropertyName: "message", publicName: "message", isSignal: true, isRequired: false, transformFunction: null }, icon: { classPropertyName: "icon", publicName: "icon", isSignal: true, isRequired: false, transformFunction: null } }, host: { attributes: { "role": "status" }, classAttribute: "nxs-empty-state" }, ngImport: i0, template: "@if (icon()) {\n  <mat-icon class=\"nxs-empty-state__icon\" aria-hidden=\"true\">{{ icon() }}</mat-icon>\n}\n@switch (headingLevel()) {\n  @case (1) {\n    <h1 class=\"nxs-empty-state__heading\">{{ heading() }}</h1>\n  }\n  @case (3) {\n    <h3 class=\"nxs-empty-state__heading\">{{ heading() }}</h3>\n  }\n  @case (4) {\n    <h4 class=\"nxs-empty-state__heading\">{{ heading() }}</h4>\n  }\n  @case (5) {\n    <h5 class=\"nxs-empty-state__heading\">{{ heading() }}</h5>\n  }\n  @case (6) {\n    <h6 class=\"nxs-empty-state__heading\">{{ heading() }}</h6>\n  }\n  @default {\n    <h2 class=\"nxs-empty-state__heading\">{{ heading() }}</h2>\n  }\n}\n@if (message()) {\n  <p class=\"nxs-empty-state__message\">{{ message() }}</p>\n}\n<div class=\"nxs-empty-state__actions\">\n  <ng-content />\n</div>\n", styles: [":host{display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px 16px;text-align:center;color:var(--mat-sys-on-surface-variant)}.nxs-empty-state__icon{width:48px;height:48px;font-size:48px;color:var(--mat-sys-outline)}.nxs-empty-state__heading.nxs-empty-state__heading{margin:0;font:var(--mat-sys-title-medium);letter-spacing:normal;color:var(--mat-sys-on-surface)}.nxs-empty-state__message{margin:0;font:var(--mat-sys-body-medium)}.nxs-empty-state__actions{display:flex;gap:8px;margin-top:8px}.nxs-empty-state__actions:empty{display:none}\n"], dependencies: [{ kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsEmptyStateComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-empty-state', standalone: true, imports: [MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-empty-state', role: 'status' }, template: "@if (icon()) {\n  <mat-icon class=\"nxs-empty-state__icon\" aria-hidden=\"true\">{{ icon() }}</mat-icon>\n}\n@switch (headingLevel()) {\n  @case (1) {\n    <h1 class=\"nxs-empty-state__heading\">{{ heading() }}</h1>\n  }\n  @case (3) {\n    <h3 class=\"nxs-empty-state__heading\">{{ heading() }}</h3>\n  }\n  @case (4) {\n    <h4 class=\"nxs-empty-state__heading\">{{ heading() }}</h4>\n  }\n  @case (5) {\n    <h5 class=\"nxs-empty-state__heading\">{{ heading() }}</h5>\n  }\n  @case (6) {\n    <h6 class=\"nxs-empty-state__heading\">{{ heading() }}</h6>\n  }\n  @default {\n    <h2 class=\"nxs-empty-state__heading\">{{ heading() }}</h2>\n  }\n}\n@if (message()) {\n  <p class=\"nxs-empty-state__message\">{{ message() }}</p>\n}\n<div class=\"nxs-empty-state__actions\">\n  <ng-content />\n</div>\n", styles: [":host{display:flex;flex-direction:column;align-items:center;gap:8px;padding:32px 16px;text-align:center;color:var(--mat-sys-on-surface-variant)}.nxs-empty-state__icon{width:48px;height:48px;font-size:48px;color:var(--mat-sys-outline)}.nxs-empty-state__heading.nxs-empty-state__heading{margin:0;font:var(--mat-sys-title-medium);letter-spacing:normal;color:var(--mat-sys-on-surface)}.nxs-empty-state__message{margin:0;font:var(--mat-sys-body-medium)}.nxs-empty-state__actions{display:flex;gap:8px;margin-top:8px}.nxs-empty-state__actions:empty{display:none}\n"] }]
        }], propDecorators: { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], message: [{ type: i0.Input, args: [{ isSignal: true, alias: "message", required: false }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }] } });

const VARIANTS = {
    401: {
        icon: 'lock',
        heading: 'satori-components.error-state.unauthorized.heading',
        message: 'satori-components.error-state.unauthorized.message',
    },
    403: {
        icon: 'block',
        heading: 'satori-components.error-state.forbidden.heading',
        message: 'satori-components.error-state.forbidden.message',
    },
    404: {
        icon: 'search_off',
        heading: 'satori-components.error-state.not-found.heading',
        message: 'satori-components.error-state.not-found.message',
    },
    500: {
        icon: 'error_outline',
        heading: 'satori-components.error-state.server.heading',
        message: 'satori-components.error-state.server.message',
    },
};
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
class NxsErrorStateComponent {
    /** Which variant: the HTTP status the failure stands for. */
    status = input(500, ...(ngDevMode ? [{ debugName: "status" }] : []));
    /** What failed, already translated. Blank, or only whitespace, shows the variant's own heading. */
    heading = input('', ...(ngDevMode ? [{ debugName: "heading" }] : []));
    /**
     * The heading's level in the page outline, rendered as the native `<h1>`–`<h6>`: one below the
     * heading of the section it replaces, or 1 when it replaces the whole page.
     */
    headingLevel = input(2, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** Offer Retry for a server error. Accepts a bare attribute, `retryable`. */
    retryable = input(false, ...(ngDevMode ? [{ debugName: "retryable", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /**
     * Called when Retry is pressed, before `retry` is emitted — for a host that renders the component
     * by ID, where no output can be bound.
     */
    retryHandler = input(null, ...(ngDevMode ? [{ debugName: "retryHandler" }] : []));
    /** Retry was pressed. */
    retry = output();
    variant = computed(() => VARIANTS[this.status()], ...(ngDevMode ? [{ debugName: "variant" }] : []));
    /** The host's heading as a reader gets it: whitespace or zero-width characters alone are none. */
    ownHeading = computed(() => nxsVisibleText(this.heading()), ...(ngDevMode ? [{ debugName: "ownHeading" }] : []));
    canRetry = computed(() => this.retryable() && this.status() === 500, ...(ngDevMode ? [{ debugName: "canRetry" }] : []));
    pressRetry() {
        this.retryHandler()?.();
        this.retry.emit();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsErrorStateComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsErrorStateComponent, isStandalone: true, selector: "nxs-error-state", inputs: { status: { classPropertyName: "status", publicName: "status", isSignal: true, isRequired: false, transformFunction: null }, heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: false, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null }, retryable: { classPropertyName: "retryable", publicName: "retryable", isSignal: true, isRequired: false, transformFunction: null }, retryHandler: { classPropertyName: "retryHandler", publicName: "retryHandler", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { retry: "retry" }, host: { attributes: { "role": "alert" }, properties: { "attr.data-status": "status()" }, classAttribute: "nxs-error-state" }, ngImport: i0, template: "<mat-icon class=\"nxs-error-state__icon\" aria-hidden=\"true\">{{ variant().icon }}</mat-icon>\n@let title = ownHeading() || (variant().heading | translate);\n@switch (headingLevel()) {\n  @case (1) {\n    <h1 class=\"nxs-error-state__heading\">{{ title }}</h1>\n  }\n  @case (3) {\n    <h3 class=\"nxs-error-state__heading\">{{ title }}</h3>\n  }\n  @case (4) {\n    <h4 class=\"nxs-error-state__heading\">{{ title }}</h4>\n  }\n  @case (5) {\n    <h5 class=\"nxs-error-state__heading\">{{ title }}</h5>\n  }\n  @case (6) {\n    <h6 class=\"nxs-error-state__heading\">{{ title }}</h6>\n  }\n  @default {\n    <h2 class=\"nxs-error-state__heading\">{{ title }}</h2>\n  }\n}\n<p class=\"nxs-error-state__message\">{{ variant().message | translate }}</p>\n<div class=\"nxs-error-state__actions\">\n  @if (canRetry()) {\n    <button mat-stroked-button type=\"button\" (click)=\"pressRetry()\">\n      <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n      {{ 'satori-components.error-state.retry' | translate }}\n    </button>\n  }\n  <ng-content />\n</div>\n", styles: [":host{display:flex;flex-direction:column;align-items:center;gap:8px;padding:48px 16px;text-align:center;color:var(--mat-sys-on-surface-variant)}.nxs-error-state__icon{width:48px;height:48px;font-size:48px;color:var(--mat-sys-error)}.nxs-error-state__heading.nxs-error-state__heading{margin:0;font:var(--mat-sys-title-medium);letter-spacing:normal;color:var(--mat-sys-on-surface)}.nxs-error-state__message{max-width:48ch;margin:0;font:var(--mat-sys-body-medium)}.nxs-error-state__actions{display:flex;gap:8px;margin-top:8px}.nxs-error-state__actions:empty{display:none}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsErrorStateComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-error-state', standalone: true, imports: [MatButtonModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-error-state', role: 'alert', '[attr.data-status]': 'status()' }, template: "<mat-icon class=\"nxs-error-state__icon\" aria-hidden=\"true\">{{ variant().icon }}</mat-icon>\n@let title = ownHeading() || (variant().heading | translate);\n@switch (headingLevel()) {\n  @case (1) {\n    <h1 class=\"nxs-error-state__heading\">{{ title }}</h1>\n  }\n  @case (3) {\n    <h3 class=\"nxs-error-state__heading\">{{ title }}</h3>\n  }\n  @case (4) {\n    <h4 class=\"nxs-error-state__heading\">{{ title }}</h4>\n  }\n  @case (5) {\n    <h5 class=\"nxs-error-state__heading\">{{ title }}</h5>\n  }\n  @case (6) {\n    <h6 class=\"nxs-error-state__heading\">{{ title }}</h6>\n  }\n  @default {\n    <h2 class=\"nxs-error-state__heading\">{{ title }}</h2>\n  }\n}\n<p class=\"nxs-error-state__message\">{{ variant().message | translate }}</p>\n<div class=\"nxs-error-state__actions\">\n  @if (canRetry()) {\n    <button mat-stroked-button type=\"button\" (click)=\"pressRetry()\">\n      <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n      {{ 'satori-components.error-state.retry' | translate }}\n    </button>\n  }\n  <ng-content />\n</div>\n", styles: [":host{display:flex;flex-direction:column;align-items:center;gap:8px;padding:48px 16px;text-align:center;color:var(--mat-sys-on-surface-variant)}.nxs-error-state__icon{width:48px;height:48px;font-size:48px;color:var(--mat-sys-error)}.nxs-error-state__heading.nxs-error-state__heading{margin:0;font:var(--mat-sys-title-medium);letter-spacing:normal;color:var(--mat-sys-on-surface)}.nxs-error-state__message{max-width:48ch;margin:0;font:var(--mat-sys-body-medium)}.nxs-error-state__actions{display:flex;gap:8px;margin-top:8px}.nxs-error-state__actions:empty{display:none}\n"] }]
        }], propDecorators: { status: [{ type: i0.Input, args: [{ isSignal: true, alias: "status", required: false }] }], heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], retryable: [{ type: i0.Input, args: [{ isSignal: true, alias: "retryable", required: false }] }], retryHandler: [{ type: i0.Input, args: [{ isSignal: true, alias: "retryHandler", required: false }] }], retry: [{ type: i0.Output, args: ["retry"] }] } });

/**
 * The variant for a failed request.
 *
 * 401, 403 and 404 map to themselves. Anything else — a 5xx, a network failure (status 0), an
 * error thrown with no status at all — is 500: the request did not complete and nothing says the
 * user is the reason.
 */
function nxsErrorStatus(error) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined;
    return status === 401 || status === 403 || status === 404 ? status : 500;
}

const SORTABLE = [
    'eventId',
    'eventDate',
    'principalName',
    'category',
];
const NO_FILTERS = { user: '', from: null, to: null, eventId: '', category: '' };
/** Start of the day after `day`, local time: the adapter's end is exclusive, the user's "To" is not. */
function dayAfter(day) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
}
function startOf(day) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}
/** "documentModified" → "Document Modified", for an event the directory does not name. */
function humanise(id) {
    return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}
/** "eventDocumentCategory" → "Document". */
function humaniseCategory(id) {
    return humanise(id)
        .replace(/^Event /, '')
        .replace(/ Category$/, '');
}
/**
 * A vocabulary's label, or the id made readable when the vocabulary only repeats it — the stock
 * `eventTypes` entries are labelled with their own ids, which Web UI translates as `eventType.*`.
 */
function readable(entry, fallback) {
    const label = entry.displayLabel?.trim();
    return label && label !== entry.id ? label : fallback(entry.id);
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
class NxsDocumentHistoryComponent {
    documents = inject(DocumentDetailService);
    directories = inject(DirectoryService);
    /** The document whose history this is. */
    documentUid = input.required(...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** Entries per page; the user can change it. */
    pageSize = input(20, ...(ngDevMode ? [{ debugName: "pageSize" }] : []));
    /** The heading level of the empty and error states, one below the section's own. */
    headingLevel = input(3, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    columns = [
        'eventId',
        'eventDate',
        'principalName',
        'category',
        'comment',
        'docLifeCycle',
    ];
    filters = signal(NO_FILTERS, ...(ngDevMode ? [{ debugName: "filters" }] : []));
    /** What is in the Username box; it filters once the user pauses, not per keystroke. */
    userText = signal('', ...(ngDevMode ? [{ debugName: "userText" }] : []));
    typed = new Subject();
    sort = signal({
        by: 'eventDate',
        order: 'desc',
    }, ...(ngDevMode ? [{ debugName: "sort" }] : []));
    pageIndex = signal(0, ...(ngDevMode ? [{ debugName: "pageIndex" }] : []));
    chosenPageSize = signal(null, ...(ngDevMode ? [{ debugName: "chosenPageSize" }] : []));
    size = computed(() => this.chosenPageSize() ?? this.pageSize(), ...(ngDevMode ? [{ debugName: "size" }] : []));
    retries = signal(0, ...(ngDevMode ? [{ debugName: "retries" }] : []));
    entries = signal([], ...(ngDevMode ? [{ debugName: "entries" }] : []));
    total = signal(0, ...(ngDevMode ? [{ debugName: "total" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failure = signal(null, ...(ngDevMode ? [{ debugName: "failure" }] : []));
    filtered = computed(() => {
        const f = this.filters();
        return !!(f.user.trim() || f.from || f.to || f.eventId || f.category);
    }, ...(ngDevMode ? [{ debugName: "filtered" }] : []));
    eventTypes = signal([], ...(ngDevMode ? [{ debugName: "eventTypes" }] : []));
    categories = signal([], ...(ngDevMode ? [{ debugName: "categories" }] : []));
    eventOptions = computed(() => this.eventTypes().map((e) => ({ id: e.id, label: readable(e, humanise) })), ...(ngDevMode ? [{ debugName: "eventOptions" }] : []));
    categoryOptions = computed(() => this.categories().map((e) => ({ id: e.id, label: readable(e, humaniseCategory) })), ...(ngDevMode ? [{ debugName: "categoryOptions" }] : []));
    eventLabels = computed(() => new Map(this.eventOptions().map((o) => [o.id, o.label])), ...(ngDevMode ? [{ debugName: "eventLabels" }] : []));
    categoryLabels = computed(() => new Map(this.categoryOptions().map((o) => [o.id, o.label])), ...(ngDevMode ? [{ debugName: "categoryLabels" }] : []));
    constructor() {
        forkJoin({
            types: this.directories.getEventTypes().pipe(catchError(() => of([]))),
            categories: this.directories.getEventCategories().pipe(catchError(() => of([]))),
        })
            .pipe(takeUntilDestroyed())
            .subscribe(({ types, categories }) => {
            this.eventTypes.set(types);
            this.categories.set(categories);
        });
        const request = computed(() => ({
            uid: this.documentUid(),
            filters: this.filters(),
            sort: this.sort(),
            pageIndex: this.pageIndex(),
            size: this.size(),
            retry: this.retries(),
        }), ...(ngDevMode ? [{ debugName: "request" }] : []));
        this.typed
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((user) => this.setFilter('user', user));
        // A document change resets the filters and the page before anything is asked.
        toObservable(this.documentUid)
            .pipe(distinctUntilChanged(), takeUntilDestroyed())
            .subscribe(() => this.clearFilters());
        toObservable(request)
            .pipe(tap(() => {
            this.loading.set(true);
            this.failure.set(null);
        }), switchMap((r) => this.documents
            .getAuditLog(r.uid, r.size, r.pageIndex, this.queryOf(r.filters, r.sort))
            .pipe(map((list) => ({
            entries: list.entries ?? [],
            total: list.resultsCount ?? list.totalSize ?? list.entries?.length ?? 0,
        })), catchError((err) => of({ failure: nxsErrorStatus(err) })))), takeUntilDestroyed())
            .subscribe((page) => {
            this.loading.set(false);
            if ('failure' in page) {
                this.failure.set(page.failure);
                this.entries.set([]);
                this.total.set(0);
                return;
            }
            this.entries.set(page.entries);
            this.total.set(page.total);
        });
    }
    setFilter(key, value) {
        this.filters.update((f) => ({ ...f, [key]: value }));
        this.pageIndex.set(0);
    }
    typeUser(text) {
        this.userText.set(text);
        this.typed.next(text);
    }
    clearFilters() {
        this.userText.set('');
        this.filters.set(NO_FILTERS);
        this.pageIndex.set(0);
    }
    sorted(event) {
        const by = SORTABLE.find((field) => field === event.active);
        this.sort.set(by && event.direction ? { by, order: event.direction } : { by: 'eventDate', order: 'desc' });
        this.pageIndex.set(0);
    }
    paged(event) {
        this.chosenPageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
    }
    retry() {
        this.retries.update((n) => n + 1);
    }
    eventLabel(id) {
        return this.eventLabels().get(id) ?? humanise(id);
    }
    categoryLabel(id) {
        return this.categoryLabels().get(id) ?? humaniseCategory(id);
    }
    initials(user) {
        return user.charAt(0).toUpperCase();
    }
    queryOf(f, sort) {
        return {
            principalName: f.user.trim() || undefined,
            eventIds: f.eventId ? [f.eventId] : undefined,
            eventCategory: f.category || undefined,
            startDate: f.from ? startOf(f.from) : undefined,
            endDate: f.to ? dayAfter(f.to) : undefined,
            sortBy: sort.by,
            sortOrder: sort.order,
        };
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentHistoryComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDocumentHistoryComponent, isStandalone: true, selector: "nxs-document-history", inputs: { documentUid: { classPropertyName: "documentUid", publicName: "documentUid", isSignal: true, isRequired: true, transformFunction: null }, pageSize: { classPropertyName: "pageSize", publicName: "pageSize", isSignal: true, isRequired: false, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-document-history" }, ngImport: i0, template: "<form\n  class=\"nxs-document-history__filters\"\n  role=\"search\"\n  [attr.aria-label]=\"'satori-components.document-history.filters' | translate\"\n  (submit)=\"$event.preventDefault()\"\n>\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"nxs-document-history__user\">\n    <mat-label>{{ 'satori-components.document-history.user' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"user\"\n      autocomplete=\"off\"\n      [ngModel]=\"userText()\"\n      (ngModelChange)=\"typeUser($event)\"\n    />\n    <mat-hint>{{ 'satori-components.document-history.user-hint' | translate }}</mat-hint>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.from' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"from\"\n      [matDatepicker]=\"fromPicker\"\n      [ngModel]=\"filters().from\"\n      (ngModelChange)=\"setFilter('from', $event)\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n    <mat-datepicker #fromPicker />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.to' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"to\"\n      [matDatepicker]=\"toPicker\"\n      [ngModel]=\"filters().to\"\n      (ngModelChange)=\"setFilter('to', $event)\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n    <mat-datepicker #toPicker />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.action' | translate }}</mat-label>\n    <mat-select\n      name=\"eventId\"\n      [ngModel]=\"filters().eventId\"\n      (ngModelChange)=\"setFilter('eventId', $event)\"\n    >\n      <mat-option value=\"\">{{ 'satori-components.document-history.any' | translate }}</mat-option>\n      @for (type of eventOptions(); track type.id) {\n        <mat-option [value]=\"type.id\">{{ type.label }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.category' | translate }}</mat-label>\n    <mat-select\n      name=\"category\"\n      [ngModel]=\"filters().category\"\n      (ngModelChange)=\"setFilter('category', $event)\"\n    >\n      <mat-option value=\"\">{{ 'satori-components.document-history.any' | translate }}</mat-option>\n      @for (category of categoryOptions(); track category.id) {\n        <mat-option [value]=\"category.id\">{{ category.label }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n</form>\n\n<div class=\"nxs-document-history__results\" [attr.aria-busy]=\"loading()\">\n  @if (failure(); as status) {\n    <nxs-error-state\n      [status]=\"status\"\n      [heading]=\"'satori-components.document-history.failed' | translate\"\n      [headingLevel]=\"headingLevel()\"\n      [retryable]=\"status === 500\"\n      (retry)=\"retry()\"\n    />\n  } @else if (loading() && entries().length === 0) {\n    <div class=\"nxs-document-history__loading\">\n      <nxs-spinner\n        diameter=\"32\"\n        [label]=\"'satori-components.document-history.loading' | translate\"\n      />\n    </div>\n  } @else if (entries().length === 0) {\n    <nxs-empty-state\n      icon=\"event_busy\"\n      [heading]=\"\n        (filtered()\n          ? 'satori-components.document-history.no-match'\n          : 'satori-components.document-history.empty'\n        ) | translate\n      \"\n      [headingLevel]=\"headingLevel()\"\n    />\n  } @else {\n    <div\n      class=\"nxs-document-history__table\"\n      role=\"region\"\n      tabindex=\"0\"\n      [attr.aria-label]=\"'satori-components.document-history.caption' | translate\"\n    >\n      <table\n        mat-table\n        matSort\n        [dataSource]=\"entries()\"\n        [matSortActive]=\"sort().by\"\n        [matSortDirection]=\"sort().order\"\n        matSortDisableClear\n        (matSortChange)=\"sorted($event)\"\n      >\n        <caption class=\"cdk-visually-hidden\">\n          {{\n            'satori-components.document-history.caption' | translate\n          }}\n        </caption>\n\n        <ng-container matColumnDef=\"eventId\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.action' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ eventLabel(entry.eventId) }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"eventDate\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.date' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ entry.eventDate | date: 'medium' }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"principalName\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.user' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">\n            <span class=\"nxs-document-history__user-cell\">\n              <nxs-avatar [initials]=\"initials(entry.principalName)\" size=\"24\" aria-hidden=\"true\" />\n              {{ entry.principalName }}\n            </span>\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"category\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.category' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ categoryLabel(entry.category) }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"comment\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.document-history.comment' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\" class=\"nxs-document-history__comment\">\n            {{ entry.comment }}\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"docLifeCycle\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.document-history.state' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">\n            @if (entry.docLifeCycle) {\n              <nxs-tag [label]=\"entry.docLifeCycle\" />\n            }\n          </td>\n        </ng-container>\n\n        <tr mat-header-row *matHeaderRowDef=\"columns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: columns\"></tr>\n      </table>\n    </div>\n  }\n\n  @if (total() > 0) {\n    <mat-paginator\n      [length]=\"total()\"\n      [pageSize]=\"size()\"\n      [pageIndex]=\"pageIndex()\"\n      [pageSizeOptions]=\"[10, 20, 50]\"\n      showFirstLastButtons\n      (page)=\"paged($event)\"\n    />\n  }\n</div>\n", styles: [":host{display:block}.nxs-document-history__filters{display:flex;flex-wrap:wrap;gap:12px 16px;margin-block-end:16px}.nxs-document-history__filters mat-form-field{flex:1 1 12rem;min-width:0}.nxs-document-history__user{flex-basis:16rem}.nxs-document-history__loading{display:flex;justify-content:center;padding:32px 0}.nxs-document-history__table{overflow-x:auto}.nxs-document-history__table table{width:100%}.nxs-document-history__user-cell{display:inline-flex;align-items:center;gap:8px}.nxs-document-history__comment{overflow-wrap:anywhere}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$2.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i1$2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$2.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i1$2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1$2.NgForm, selector: "form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]", inputs: ["ngFormOptions"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i1$3.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i1$3.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i1$3.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatPaginatorModule }, { kind: "component", type: i5$1.MatPaginator, selector: "mat-paginator", inputs: ["color", "pageIndex", "length", "pageSize", "pageSizeOptions", "hidePageSize", "showFirstLastButtons", "selectConfig", "disabled"], outputs: ["page"], exportAs: ["matPaginator"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i2$4.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "ngmodule", type: MatSortModule }, { kind: "directive", type: i7.MatSort, selector: "[matSort]", inputs: ["matSortActive", "matSortStart", "matSortDirection", "matSortDisableClear", "matSortDisabled"], outputs: ["matSortChange"], exportAs: ["matSort"] }, { kind: "component", type: i7.MatSortHeader, selector: "[mat-sort-header]", inputs: ["mat-sort-header", "arrowPosition", "start", "disabled", "sortActionDescription", "disableClear"], exportAs: ["matSortHeader"] }, { kind: "ngmodule", type: MatTableModule }, { kind: "component", type: i8.MatTable, selector: "mat-table, table[mat-table]", exportAs: ["matTable"] }, { kind: "directive", type: i8.MatHeaderCellDef, selector: "[matHeaderCellDef]" }, { kind: "directive", type: i8.MatHeaderRowDef, selector: "[matHeaderRowDef]", inputs: ["matHeaderRowDef", "matHeaderRowDefSticky"] }, { kind: "directive", type: i8.MatColumnDef, selector: "[matColumnDef]", inputs: ["matColumnDef"] }, { kind: "directive", type: i8.MatCellDef, selector: "[matCellDef]" }, { kind: "directive", type: i8.MatRowDef, selector: "[matRowDef]", inputs: ["matRowDefColumns", "matRowDefWhen"] }, { kind: "directive", type: i8.MatHeaderCell, selector: "mat-header-cell, th[mat-header-cell]" }, { kind: "directive", type: i8.MatCell, selector: "mat-cell, td[mat-cell]" }, { kind: "component", type: i8.MatHeaderRow, selector: "mat-header-row, tr[mat-header-row]", exportAs: ["matHeaderRow"] }, { kind: "component", type: i8.MatRow, selector: "mat-row, tr[mat-row]", exportAs: ["matRow"] }, { kind: "component", type: NxsAvatarComponent, selector: "nxs-avatar", inputs: ["initials", "color", "size", "label"] }, { kind: "component", type: NxsEmptyStateComponent, selector: "nxs-empty-state", inputs: ["heading", "headingLevel", "message", "icon"] }, { kind: "component", type: NxsErrorStateComponent, selector: "nxs-error-state", inputs: ["status", "heading", "headingLevel", "retryable", "retryHandler"], outputs: ["retry"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "component", type: NxsTagComponent, selector: "nxs-tag", inputs: ["label", "color"] }, { kind: "pipe", type: DatePipe, name: "date" }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentHistoryComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-document-history', standalone: true, imports: [
                        DatePipe,
                        FormsModule,
                        MatDatepickerModule,
                        MatFormFieldModule,
                        MatInputModule,
                        MatPaginatorModule,
                        MatSelectModule,
                        MatSortModule,
                        MatTableModule,
                        TranslatePipe,
                        NxsAvatarComponent,
                        NxsEmptyStateComponent,
                        NxsErrorStateComponent,
                        NxsSpinnerComponent,
                        NxsTagComponent,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-document-history' }, template: "<form\n  class=\"nxs-document-history__filters\"\n  role=\"search\"\n  [attr.aria-label]=\"'satori-components.document-history.filters' | translate\"\n  (submit)=\"$event.preventDefault()\"\n>\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"nxs-document-history__user\">\n    <mat-label>{{ 'satori-components.document-history.user' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"user\"\n      autocomplete=\"off\"\n      [ngModel]=\"userText()\"\n      (ngModelChange)=\"typeUser($event)\"\n    />\n    <mat-hint>{{ 'satori-components.document-history.user-hint' | translate }}</mat-hint>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.from' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"from\"\n      [matDatepicker]=\"fromPicker\"\n      [ngModel]=\"filters().from\"\n      (ngModelChange)=\"setFilter('from', $event)\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n    <mat-datepicker #fromPicker />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.to' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"to\"\n      [matDatepicker]=\"toPicker\"\n      [ngModel]=\"filters().to\"\n      (ngModelChange)=\"setFilter('to', $event)\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n    <mat-datepicker #toPicker />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.action' | translate }}</mat-label>\n    <mat-select\n      name=\"eventId\"\n      [ngModel]=\"filters().eventId\"\n      (ngModelChange)=\"setFilter('eventId', $event)\"\n    >\n      <mat-option value=\"\">{{ 'satori-components.document-history.any' | translate }}</mat-option>\n      @for (type of eventOptions(); track type.id) {\n        <mat-option [value]=\"type.id\">{{ type.label }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.category' | translate }}</mat-label>\n    <mat-select\n      name=\"category\"\n      [ngModel]=\"filters().category\"\n      (ngModelChange)=\"setFilter('category', $event)\"\n    >\n      <mat-option value=\"\">{{ 'satori-components.document-history.any' | translate }}</mat-option>\n      @for (category of categoryOptions(); track category.id) {\n        <mat-option [value]=\"category.id\">{{ category.label }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n</form>\n\n<div class=\"nxs-document-history__results\" [attr.aria-busy]=\"loading()\">\n  @if (failure(); as status) {\n    <nxs-error-state\n      [status]=\"status\"\n      [heading]=\"'satori-components.document-history.failed' | translate\"\n      [headingLevel]=\"headingLevel()\"\n      [retryable]=\"status === 500\"\n      (retry)=\"retry()\"\n    />\n  } @else if (loading() && entries().length === 0) {\n    <div class=\"nxs-document-history__loading\">\n      <nxs-spinner\n        diameter=\"32\"\n        [label]=\"'satori-components.document-history.loading' | translate\"\n      />\n    </div>\n  } @else if (entries().length === 0) {\n    <nxs-empty-state\n      icon=\"event_busy\"\n      [heading]=\"\n        (filtered()\n          ? 'satori-components.document-history.no-match'\n          : 'satori-components.document-history.empty'\n        ) | translate\n      \"\n      [headingLevel]=\"headingLevel()\"\n    />\n  } @else {\n    <div\n      class=\"nxs-document-history__table\"\n      role=\"region\"\n      tabindex=\"0\"\n      [attr.aria-label]=\"'satori-components.document-history.caption' | translate\"\n    >\n      <table\n        mat-table\n        matSort\n        [dataSource]=\"entries()\"\n        [matSortActive]=\"sort().by\"\n        [matSortDirection]=\"sort().order\"\n        matSortDisableClear\n        (matSortChange)=\"sorted($event)\"\n      >\n        <caption class=\"cdk-visually-hidden\">\n          {{\n            'satori-components.document-history.caption' | translate\n          }}\n        </caption>\n\n        <ng-container matColumnDef=\"eventId\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.action' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ eventLabel(entry.eventId) }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"eventDate\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.date' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ entry.eventDate | date: 'medium' }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"principalName\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.user' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">\n            <span class=\"nxs-document-history__user-cell\">\n              <nxs-avatar [initials]=\"initials(entry.principalName)\" size=\"24\" aria-hidden=\"true\" />\n              {{ entry.principalName }}\n            </span>\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"category\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.category' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ categoryLabel(entry.category) }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"comment\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.document-history.comment' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\" class=\"nxs-document-history__comment\">\n            {{ entry.comment }}\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"docLifeCycle\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.document-history.state' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">\n            @if (entry.docLifeCycle) {\n              <nxs-tag [label]=\"entry.docLifeCycle\" />\n            }\n          </td>\n        </ng-container>\n\n        <tr mat-header-row *matHeaderRowDef=\"columns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: columns\"></tr>\n      </table>\n    </div>\n  }\n\n  @if (total() > 0) {\n    <mat-paginator\n      [length]=\"total()\"\n      [pageSize]=\"size()\"\n      [pageIndex]=\"pageIndex()\"\n      [pageSizeOptions]=\"[10, 20, 50]\"\n      showFirstLastButtons\n      (page)=\"paged($event)\"\n    />\n  }\n</div>\n", styles: [":host{display:block}.nxs-document-history__filters{display:flex;flex-wrap:wrap;gap:12px 16px;margin-block-end:16px}.nxs-document-history__filters mat-form-field{flex:1 1 12rem;min-width:0}.nxs-document-history__user{flex-basis:16rem}.nxs-document-history__loading{display:flex;justify-content:center;padding:32px 0}.nxs-document-history__table{overflow-x:auto}.nxs-document-history__table table{width:100%}.nxs-document-history__user-cell{display:inline-flex;align-items:center;gap:8px}.nxs-document-history__comment{overflow-wrap:anywhere}\n"] }]
        }], ctorParameters: () => [], propDecorators: { documentUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentUid", required: true }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }] } });

/**
 * The grants the external review asked for (NXSAT-300): Nuxeo's twelve permission levels and the
 * retention pair. Offered after the server's own suggestions for the document type, and checked
 * against the permissions the server defines whenever the read can establish that set.
 */
const NXS_STANDARD_PERMISSIONS = [
    'Read',
    'ReadWrite',
    'Everything',
    'Write',
    'ReadVersion',
    'WriteVersion',
    'AddChildren',
    'RemoveChildren',
    'Remove',
    'Version',
    'WriteSecurity',
    'Unlock',
    'SetRetention',
    'UnsetRetention',
];
/** Nuxeo's pseudo-principal for "everyone", which the inheritance-blocking deny names. */
const EVERYONE = 'Everyone';
/** The inheritance marker: Nuxeo blocks inheritance with a deny-`Everything` ACE for `Everyone`. */
function isInheritanceMarker(ace) {
    return ace.principal === EVERYONE && ace.permission === 'Everything' && !ace.granted;
}
/** The ACE list of one named ACL. The enricher sends `aces`; the `@acl` adapter sends `ace`. */
function acesOf(acl) {
    return acl.aces ?? acl.ace ?? [];
}
function toRow(ace, acl) {
    const status = ace.status;
    return {
        id: typeof ace.id === 'string' ? ace.id : '',
        principal: resolveAcePrincipal(ace.username),
        principalLabel: typeof ace.usernameLabel === 'string' ? ace.usernameLabel : '',
        permission: typeof ace.permission === 'string' ? ace.permission : '',
        granted: ace.granted !== false,
        begin: ace.begin ?? null,
        end: ace.end ?? null,
        status: status === 'effective' || status === 'pending' || status === 'archived' ? status : null,
        creator: ace.creator ? resolveAcePrincipal(ace.creator) || null : null,
        acl,
    };
}
function strings(value) {
    return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && !!v) : [];
}
function unique(values) {
    return [...new Set(values)];
}
/** Builds the offered permissions from the two server lists. See {@link NxsPermissionCatalogue}. */
function permissionCatalogue(doc) {
    const held = unique(strings(doc.contextParameters?.['permissions']));
    const defined = held.includes('Everything') ? held : null;
    const isDefined = (p) => defined === null || defined.includes(p);
    const suggested = unique(strings(doc.contextParameters?.['userVisiblePermissions'])).filter(isDefined);
    const standard = NXS_STANDARD_PERMISSIONS.filter((p) => !suggested.includes(p) && isDefined(p));
    const other = held
        .filter((p) => !suggested.includes(p) && !standard.includes(p))
        .sort((a, b) => a.localeCompare(b));
    return { suggested, standard, other, defined };
}
/**
 * Reads a document fetched with the `acls`, `permissions` and `userVisiblePermissions` enrichers.
 *
 * Throws when the `acls` context parameter is absent: a read without the enricher cannot know the
 * ACL, and rendering an empty one would tell the user the document has no permissions.
 */
function readSnapshot(doc) {
    const acls = doc.contextParameters?.['acls'];
    if (!Array.isArray(acls)) {
        throw new Error(`The read of ${doc.uid} carried no ACLs`);
    }
    const local = [];
    const inherited = [];
    const otherAcls = [];
    let inheritanceBlocked = false;
    for (const acl of acls) {
        const name = acl?.name ?? '';
        for (const ace of acesOf(acl ?? {})) {
            // External sharing is listed by the host tab, from every ACL.
            if (ace.externalUser)
                continue;
            const row = toRow(ace, name);
            if (name === 'local') {
                // Blocked inheritance is not a flag in Nuxeo: it is this deny, which
                // `Document.BlockPermissionInheritance` writes and `Unblock…` removes. A document with no
                // `inherited` ACL is not necessarily blocked — the repository root has none.
                if (isInheritanceMarker(row))
                    inheritanceBlocked = true;
                else
                    local.push(row);
            }
            else if (name === 'inherited') {
                inherited.push(row);
            }
            else {
                otherAcls.push(row);
            }
        }
    }
    return {
        uid: doc.uid,
        title: doc.title ?? '',
        // A version's `permissions` enricher repeats the live document's while the server refuses to
        // modify it, so the enricher alone would offer editing on every version.
        canManage: doc.isVersion !== true && canManageDocumentPermissions(doc),
        local,
        inherited,
        otherAcls,
        inheritanceBlocked,
        catalogue: permissionCatalogue(doc),
    };
}
/** `[...suggested, ...standard, ...other]`, plus `current` when the catalogue does not hold it. */
function offeredPermissions(catalogue, current) {
    const all = [...catalogue.suggested, ...catalogue.standard, ...catalogue.other];
    return current && !all.includes(current) ? [...all, current] : all;
}
function invalidTimeFrame(begin, end) {
    return !!begin && !!end && begin > end;
}
/**
 * The staged changes the panel must not write, read against a **fresh** snapshot.
 *
 * Each change addresses one ACE, so an entry the user did not touch is never written and cannot
 * be lost. What remains to refuse is a change that cannot be written faithfully:
 *
 * - `changed-on-server`: its target is no longer in the ACL. Nuxeo answers 200 and changes nothing
 *   for an unknown id, so without this check a save over a stale view reported success.
 * - `deny-entry`: `Document.ReplacePermission` writes a grant, so editing a deny would invert it.
 * - `no-id`, `no-principal`: nothing Nuxeo could address.
 * - `undefined-permission`: a permission this server does not define, known only when the
 *   catalogue is complete; otherwise the server's own 400 decides.
 * - `invalid-time-frame`: an end before its beginning.
 *
 * Refusing is all-or-nothing on purpose: a half-applied batch is harder to reason about than one
 * that did not start.
 */
function refusalsFor(fresh, changes) {
    const refusals = [];
    const present = new Set(fresh.local.map((row) => row.id).filter(Boolean));
    const defined = fresh.catalogue.defined;
    const refuse = (principal, permission, reason) => refusals.push({ principal, permission, reason });
    for (const change of changes) {
        if (change.kind === 'add') {
            if (!change.principal.trim())
                refuse('', change.permission, 'no-principal');
            else if (defined && !defined.includes(change.permission)) {
                refuse(change.principal, change.permission, 'undefined-permission');
            }
            else if (invalidTimeFrame(change.begin, change.end)) {
                refuse(change.principal, change.permission, 'invalid-time-frame');
            }
            continue;
        }
        const { target } = change;
        if (!target.id)
            refuse(target.principal, target.permission, 'no-id');
        else if (!target.principal)
            refuse('', target.permission, 'no-principal');
        else if (!present.has(target.id)) {
            refuse(target.principal, target.permission, 'changed-on-server');
        }
        else if (change.kind === 'replace') {
            if (!target.granted)
                refuse(target.principal, target.permission, 'deny-entry');
            else if (defined && !defined.includes(change.permission)) {
                refuse(target.principal, change.permission, 'undefined-permission');
            }
            else if (invalidTimeFrame(change.begin, change.end)) {
                refuse(target.principal, change.permission, 'invalid-time-frame');
            }
        }
    }
    return refusals;
}
/**
 * Whether an ACE date and a calendar day name the same day, by the reading the table shows.
 *
 * Nuxeo stores the day as midnight in the server's zone, so a server east or west of UTC returns
 * an instant hours either side of UTC midnight, and comparing the ISO prefix would call a correctly
 * applied change unconfirmed on such a server. A tolerance either side would confirm a change to
 * the next day that the table still shows as the old one.
 */
function sameDay(instant, day) {
    if (!instant || !day)
        return !instant && !day;
    return instantToDay(instant) === day;
}
function holds(rows, principal, permission, begin, end) {
    return rows.some((row) => row.granted &&
        row.principal === principal &&
        row.permission === permission &&
        sameDay(row.begin, begin) &&
        sameDay(row.end, end));
}
/**
 * The applied changes the server's ACL does not show, read after the save.
 *
 * The postflight half of the guarantee: a 200 from Nuxeo is not evidence of a change, because an
 * unknown ACE id is answered with 200 and nothing done.
 */
function unconfirmedChanges(after, applied) {
    const ids = new Set(after.local.map((row) => row.id));
    const missing = [];
    for (const change of applied) {
        const confirmed = change.kind === 'add'
            ? holds(after.local, change.principal, change.permission, change.begin, change.end)
            : change.kind === 'remove'
                ? !ids.has(change.target.id)
                : !ids.has(change.target.id) &&
                    holds(after.local, change.target.principal, change.permission, change.begin, change.end);
        if (!confirmed) {
            const principal = change.kind === 'add' ? change.principal : change.target.principal;
            const permission = change.kind === 'remove' ? change.target.permission : change.permission;
            missing.push({ principal, permission, reason: 'not-applied' });
        }
    }
    return missing;
}
/** A calendar day, `YYYY-MM-DD`, from a date the user picked in their own zone. */
function toDay(date) {
    if (!date || Number.isNaN(date.getTime()))
        return null;
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
}
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
/**
 * The calendar day an ACE date names, as a local `Date` for a date picker.
 *
 * An ACE date is midnight in some zone — the browser's when Nuxeo Web UI wrote it, the server's for
 * a day-only write — and Nuxeo returns it in UTC, so a CET midnight reads as 23:00 the day before.
 * The zone is not stored. An instant at midnight in the user's own zone is read as that day, which
 * recovers every entry written from the user's zone, UTC+13 and UTC+14 included. Any other is
 * rounded to the nearest UTC midnight, which recovers the day for a writer anywhere from UTC−11 to
 * UTC+12. Reading the UTC date alone gives the day before east of UTC; `new Date(iso)` alone would
 * be wrong west of UTC instead. Two zones 24 hours apart share their midnights, so between them the
 * day is genuinely ambiguous and the user's own is chosen.
 */
function dayToDate(instant) {
    if (!instant)
        return null;
    const parsed = Date.parse(instant);
    if (Number.isNaN(parsed))
        return null;
    const wallClock = parsed - new Date(parsed).getTimezoneOffset() * MINUTE;
    const day = new Date(wallClock % DAY === 0 ? wallClock : parsed + DAY / 2);
    return new Date(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
}
/** `instant` as a calendar day, the inverse of {@link dayToDate} for an unchanged date. */
function instantToDay(instant) {
    return toDay(dayToDate(instant));
}
/**
 * The value to write for an ACE date the user may not have changed: the server's own instant when
 * `day` is still the day it names, otherwise `day`.
 *
 * Writing the day back instead re-anchors it at the server's midnight, which for an entry written
 * from another zone moves it — measured, a CET entry's start moved 23 hours on a permission-only edit.
 */
function dateToWrite(day, original) {
    return day && original && instantToDay(original) === day ? original : day;
}

/**
 * Nuxeo's `userVisiblePermissions` for a type with no list of its own, for a document read without
 * that enricher.
 */
const NXS_DEFAULT_VISIBLE_PERMISSIONS = [
    'Read',
    'ReadWrite',
    'Everything',
];
/**
 * The permissions a dialog offers, as Web UI's: the document type's `userVisiblePermissions`, plus
 * `current` when an entry being edited holds one outside that list, so editing never changes it
 * silently.
 */
function offeredRights(visible, current) {
    const list = visible?.length ? [...visible] : [...NXS_DEFAULT_VISIBLE_PERMISSIONS];
    return current && !list.includes(current) ? [...list, current] : list;
}
/** Who an entry names, as a person reads it: the display name, or an external user's email. */
function principalLabel(ace) {
    return ace.usernameLabel || resolveAcePrincipal(ace.username).replace(/^transient\//, '');
}
/**
 * An entry's time frame as the permissions panel shows it: the calendar days its writer picked,
 * from whatever zone, rather than the UTC dates Nuxeo returns them as — "Until 15 July" for an end
 * written at midnight in Paris, which Nuxeo holds as 22:00 UTC on the 14th.
 */
function nxsAceTimeFrame(ace, translate, locale) {
    return formatAceDateRange(instantToDay(ace.begin), instantToDay(ace.end), translate, locale);
}
/** The key for a failed write: a refusal (401/403) reads as one rather than as a fault. */
function failureKey(error, fallback) {
    return isPermissionDeniedError(error)
        ? 'satori-components.permission-dialogs.error.forbidden'
        : fallback;
}

/**
 * Confirms, then deletes, one permission entry, as a `MatDialog`:
 * `dialog.open(NxsDeletePermissionDialogComponent, { data, role: 'alertdialog' })`.
 *
 * It deletes the entry by its id, as Web UI does, so the user's other entries on the document stay.
 * It closes with `true` once Nuxeo has deleted it; a failure is reported and the dialog stays open.
 */
class NxsDeletePermissionDialogComponent {
    dialogRef = inject(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    detail = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    deleting = signal(false, ...(ngDevMode ? [{ debugName: "deleting" }] : []));
    principal = principalLabel(this.data.ace);
    right = permissionRightLabel(this.data.ace.permission, (key) => this.translate.instant(key));
    timeFrame = nxsAceTimeFrame(this.data.ace, (key, params) => this.translate.instant(key, params), this.locale);
    grantedBy = this.data.ace.creator
        ? resolveAcePrincipal(this.data.ace.creator)
        : '—';
    /** The entry's four fields, under the labels of the Permissions tab's columns. */
    fields = [
        { label: 'satori-components.permission-dialogs.user-group', value: this.principal },
        { label: 'satori-components.permission-dialogs.right', value: this.right },
        { label: 'satori-components.permission-dialogs.time-frame', value: this.timeFrame },
        { label: 'satori-components.permission-dialogs.granted-by', value: this.grantedBy },
    ];
    /**
     * Below Material's small-screen breakpoint, where MatDialog narrows to the screen, the four
     * columns do not fit, so the entry shows as one label and value row per field instead.
     * `observe()` answers with the current state as it subscribes, so the first render already has
     * the right layout and a phone never sees the table first.
     */
    narrow = toSignal(inject(BreakpointObserver)
        .observe(Breakpoints.XSmall)
        .pipe(map((state) => state.matches)), { requireSync: true });
    confirm() {
        if (this.deleting())
            return;
        this.deleting.set(true);
        this.detail
            .removePermissionById(this.data.documentUid, this.data.ace.id, this.data.acl ?? 'local')
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => this.dialogRef.close(true),
            error: (error) => {
                this.deleting.set(false);
                this.toast.error(this.translate.instant(failureKey(error, 'satori-components.permission-dialogs.error.delete')));
            },
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDeletePermissionDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDeletePermissionDialogComponent, isStandalone: true, selector: "nxs-delete-permission-dialog", host: { classAttribute: "nxs-delete-permission-dialog" }, providers: [provideNxsToast()], ngImport: i0, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.delete.title' | translate }}</h2>\n\n<mat-dialog-content>\n  @if (narrow()) {\n    <dl class=\"nxs-delete-permission-dialog__rows\">\n      @for (field of fields; track field.label) {\n        <div>\n          <dt>{{ field.label | translate }}</dt>\n          <dd>{{ field.value }}</dd>\n        </div>\n      }\n    </dl>\n  } @else {\n    <table class=\"nxs-delete-permission-dialog__entry\">\n      <thead>\n        <tr>\n          @for (field of fields; track field.label) {\n            <th scope=\"col\">{{ field.label | translate }}</th>\n          }\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          @for (field of fields; track field.label) {\n            <td>{{ field.value }}</td>\n          }\n        </tr>\n      </tbody>\n    </table>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" mat-dialog-close [disabled]=\"deleting()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-delete-permission-dialog__delete\"\n    [disabled]=\"deleting()\"\n    (click)=\"confirm()\"\n  >\n    @if (deleting()) {\n      <mat-icon class=\"nxs-spinning\" aria-hidden=\"true\">autorenew</mat-icon>\n      {{ 'satori-components.permission-dialogs.delete.deleting' | translate }}\n    } @else {\n      {{ 'satori-components.permission-dialogs.delete.delete' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;--nxs-delete-permission-dialog-border: var(--mat-sys-outline-variant);--nxs-delete-permission-dialog-header: var(--mat-sys-surface-container)}.nxs-delete-permission-dialog__entry{width:100%;border:1px solid var(--nxs-delete-permission-dialog-border);border-collapse:collapse;font-size:13px;color:var(--mat-sys-on-surface)}.nxs-delete-permission-dialog__entry th,.nxs-delete-permission-dialog__entry td{padding:10px 16px;text-align:start}.nxs-delete-permission-dialog__entry th{font-size:12px;font-weight:600;background:var(--nxs-delete-permission-dialog-header);border-bottom:1px solid var(--nxs-delete-permission-dialog-border)}.nxs-delete-permission-dialog__rows{display:grid;grid-template-columns:max-content minmax(0,1fr);margin:0;border:1px solid var(--nxs-delete-permission-dialog-border);font-size:13px;color:var(--mat-sys-on-surface)}.nxs-delete-permission-dialog__rows div{display:contents}.nxs-delete-permission-dialog__rows dt,.nxs-delete-permission-dialog__rows dd{margin:0;padding:10px 16px}.nxs-delete-permission-dialog__rows dt{font-size:12px;font-weight:600;background:var(--nxs-delete-permission-dialog-header)}.nxs-delete-permission-dialog__rows dd{overflow-wrap:anywhere}.nxs-delete-permission-dialog__rows div+div>*{border-top:1px solid var(--nxs-delete-permission-dialog-border)}.nxs-spinning{animation:nxs-spin 1s linear infinite}@keyframes nxs-spin{to{transform:rotate(360deg)}}\n"], dependencies: [{ kind: "component", type: MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i2$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i2$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "component", type: MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDeletePermissionDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-delete-permission-dialog', standalone: true, imports: [MatButton, MatDialogModule, MatIcon, TranslatePipe], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-delete-permission-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.delete.title' | translate }}</h2>\n\n<mat-dialog-content>\n  @if (narrow()) {\n    <dl class=\"nxs-delete-permission-dialog__rows\">\n      @for (field of fields; track field.label) {\n        <div>\n          <dt>{{ field.label | translate }}</dt>\n          <dd>{{ field.value }}</dd>\n        </div>\n      }\n    </dl>\n  } @else {\n    <table class=\"nxs-delete-permission-dialog__entry\">\n      <thead>\n        <tr>\n          @for (field of fields; track field.label) {\n            <th scope=\"col\">{{ field.label | translate }}</th>\n          }\n        </tr>\n      </thead>\n      <tbody>\n        <tr>\n          @for (field of fields; track field.label) {\n            <td>{{ field.value }}</td>\n          }\n        </tr>\n      </tbody>\n    </table>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" mat-dialog-close [disabled]=\"deleting()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-delete-permission-dialog__delete\"\n    [disabled]=\"deleting()\"\n    (click)=\"confirm()\"\n  >\n    @if (deleting()) {\n      <mat-icon class=\"nxs-spinning\" aria-hidden=\"true\">autorenew</mat-icon>\n      {{ 'satori-components.permission-dialogs.delete.deleting' | translate }}\n    } @else {\n      {{ 'satori-components.permission-dialogs.delete.delete' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;--nxs-delete-permission-dialog-border: var(--mat-sys-outline-variant);--nxs-delete-permission-dialog-header: var(--mat-sys-surface-container)}.nxs-delete-permission-dialog__entry{width:100%;border:1px solid var(--nxs-delete-permission-dialog-border);border-collapse:collapse;font-size:13px;color:var(--mat-sys-on-surface)}.nxs-delete-permission-dialog__entry th,.nxs-delete-permission-dialog__entry td{padding:10px 16px;text-align:start}.nxs-delete-permission-dialog__entry th{font-size:12px;font-weight:600;background:var(--nxs-delete-permission-dialog-header);border-bottom:1px solid var(--nxs-delete-permission-dialog-border)}.nxs-delete-permission-dialog__rows{display:grid;grid-template-columns:max-content minmax(0,1fr);margin:0;border:1px solid var(--nxs-delete-permission-dialog-border);font-size:13px;color:var(--mat-sys-on-surface)}.nxs-delete-permission-dialog__rows div{display:contents}.nxs-delete-permission-dialog__rows dt,.nxs-delete-permission-dialog__rows dd{margin:0;padding:10px 16px}.nxs-delete-permission-dialog__rows dt{font-size:12px;font-weight:600;background:var(--nxs-delete-permission-dialog-header)}.nxs-delete-permission-dialog__rows dd{overflow-wrap:anywhere}.nxs-delete-permission-dialog__rows div+div>*{border-top:1px solid var(--nxs-delete-permission-dialog-border)}.nxs-spinning{animation:nxs-spin 1s linear infinite}@keyframes nxs-spin{to{transform:rotate(360deg)}}\n"] }]
        }] });

/**
 * The two crossings between a date field's own dates and the JS `Date`s the rest of the library
 * computes with. A field holds dates as its adapter does: `NxsLocaleDateAdapter`, Material's native
 * adapter and date-fns hold JS `Date`s, but a host's Luxon adapter holds a `DateTime`, Moment a
 * `Moment`, and another library something else again. `provideNxsDateAdapter()` keeps a host's
 * adapter, so a field's value is whatever that adapter holds, and code that calls `getTime()` on
 * it throws.
 *
 * Kept off the library's index: they are how its own components meet an adapter, not an API.
 */
/**
 * The calendar day a date field's value names, as a JS `Date` at local midnight; `null` when there
 * is none or it is not a valid date.
 *
 * A JS `Date` is returned as it is, time of day included, so a field whose adapter holds JS dates
 * reads exactly as it did before adapters were kept. Any other date is read through the adapter's
 * `isValid`, `getYear`, `getMonth` and `getDate`.
 */
function nxsDateFromAdapter(adapter, value) {
    if (value instanceof Date)
        return Number.isNaN(value.getTime()) ? null : value;
    if (value === null || value === undefined)
        return null;
    if (!adapter.isDateInstance(value) || !adapter.isValid(value))
        return null;
    const year = adapter.getYear(value);
    const month = adapter.getMonth(value);
    const day = adapter.getDate(value);
    const date = new Date(year, month, day);
    // `new Date` reads a year below 100 as 19xx.
    date.setFullYear(year, month, day);
    return date;
}
/**
 * A JS `Date`'s calendar day as the date field's adapter holds a date, for the field's value: the
 * inverse of {@link nxsDateFromAdapter}. `null` for no date or an invalid one.
 *
 * An adapter that holds JS dates gets `date` itself, time of day included, as it did before
 * adapters were kept. Any other gets its own date for the same local day, from its `createDate`.
 */
function nxsDateToAdapter(adapter, date) {
    if (!date || Number.isNaN(date.getTime()))
        return null;
    if (adapter.isDateInstance(date))
        return date;
    return adapter.createDate(date.getFullYear(), date.getMonth(), date.getDate());
}

const DECIMAL_DIGIT = /\p{Nd}/u;
/**
 * Each decimal digit typed in another script, as its ASCII digit: `２０２６`, `٢٠٢٦` and Tibetan
 * `༢༠༢༦` read `2026`. Unicode encodes every script's decimal digits as runs of ten, zero first, and
 * never splits one, so a digit is its distance from the start of its run of digits, modulo ten.
 * Some locales write their dates in their own digits — Dzongkha, Burmese, Chakma, Santali — and a
 * field reads back what it writes.
 */
function asciiDigits(text) {
    // `\d` is ASCII 0-9 alone, even with the `u` flag: every other script's digits are converted.
    return text.replace(/(?!\d)\p{Nd}/gu, (digit) => {
        const code = digit.codePointAt(0) ?? 0;
        let start = code;
        while (DECIMAL_DIGIT.test(String.fromCodePoint(start - 1)))
            start -= 1;
        return String((code - start) % 10);
    });
}
/** A locale id from what `MAT_DATE_LOCALE` holds: an id, or a date library's locale with a `code`. */
function nxsLocaleId(locale, fallback = 'en-US') {
    if (typeof locale === 'string' && locale.trim())
        return locale.trim();
    if (locale && typeof locale === 'object' && 'code' in locale && typeof locale.code === 'string') {
        return locale.code;
    }
    return fallback;
}
/**
 * The locale with the Gregorian calendar. `Intl` gives Thai the Buddhist calendar, 543 years ahead,
 * and every other date in the application is Gregorian; a year the field shows and the parser reads
 * differently would also not survive being typed back.
 *
 * ngx-translate setups and POSIX name languages `fr_FR`, which `Intl` rejects; read as `en-US`, a
 * French field's hint would be lined up month first while its parser reads day first. So an
 * underscore is read as a hyphen, and a tag `Intl` still rejects, such as `fr_FR.UTF-8`, is read
 * as its language alone.
 */
function gregorian(locale) {
    const tag = locale.trim().replaceAll('_', '-');
    for (const candidate of [tag, tag.split('-')[0]]) {
        try {
            return new Intl.Locale(candidate, { calendar: 'gregory' }).toString();
        }
        catch {
            // Not a tag `Intl` reads: try the next.
        }
    }
    return 'en-US';
}
/** The options Material's native adapter, and so `NxsLocaleDateAdapter`, writes a field's date in. */
const WRITTEN_DATE = MAT_NATIVE_DATE_FORMATS.display.dateInput;
/** 31 December 2026 in parts, as `locale` writes a date into a field. */
function writtenParts(locale) {
    return new Intl.DateTimeFormat(gregorian(locale), {
        ...WRITTEN_DATE,
        timeZone: 'UTC',
    }).formatToParts(new Date(Date.UTC(2026, 11, 31)));
}
/**
 * The order the locale writes a date's numeric fields in, such as `['day', 'month', 'year']`: the
 * order of the date the field itself writes. For some locales `Intl` orders a two-digit day and
 * month differently from the plain numbers the field shows — Maltese `31/12/2026` but `12/31/2026`
 * — and a parser reading the first would swap the day and month of every date the field wrote.
 */
function nxsDateFieldOrder(locale) {
    const order = writtenParts(locale)
        .map((part) => part.type)
        .filter((type) => ['year', 'month', 'day'].includes(type));
    return order.length === 3 ? order : ['month', 'day', 'year'];
}
/**
 * The words `locale` itself writes around a date's numeric fields, in lower case: `г`, for
 * `година`, in Bulgarian and Macedonian `31.12.2026 г.`. The parser reads past them, so a field
 * reads back the dates it writes.
 */
function writtenWords(locale) {
    return new Set(writtenParts(locale)
        .filter((part) => part.type === 'literal')
        .flatMap((part) => part.value.match(/\p{L}+/gu) ?? [])
        .map((word) => word.toLowerCase()));
}
/** The month a word names, 1 to 12, in the locale or in English, by its first three letters. */
function monthNamed(word, locale) {
    const fold = (text) => text.normalize('NFD').replace(/\p{M}/gu, '').replace(/\.$/, '').toLowerCase();
    const typed = fold(word);
    if (typed.length < 3)
        return null;
    for (const lang of [gregorian(locale), 'en-US']) {
        for (const style of ['long', 'short']) {
            const names = Array.from({ length: 12 }, (_, month) => fold(new Intl.DateTimeFormat(lang, { month: style, timeZone: 'UTC' }).format(new Date(Date.UTC(2026, month, 1)))));
            const found = names.findIndex((name) => name.startsWith(typed) || typed.startsWith(name));
            if (found >= 0)
                return found + 1;
        }
    }
    return null;
}
/** A two-digit year: 00–49 is this century, 50–99 the last, as `Date.parse` reads them. */
const fullYear = (year) => year.length <= 2 ? Number(year) + (Number(year) < 50 ? 2000 : 1900) : Number(year);
/**
 * The date `text` means in `locale`, at local midnight; an invalid date when it is not one; `null`
 * when it is blank.
 *
 * The fields are read in the order the locale writes them, so `03/04/2026` is 3 April in French and
 * 4 March in American English, whatever the separators. A four-digit number, or one above 31, is the
 * year wherever it is, and a year first is followed by the month, so `2026-04-03` reads the same
 * everywhere but in the two locales that write the year first and then the day. A month may be written as a word in
 * the locale or in English, and a word the locale writes around a date, such as Bulgarian `г.`, is
 * read past. Without a year, the current one is meant. Digits typed in any script — full-width,
 * Arabic-Indic, Devanagari, Thai, Tibetan — are read as digits.
 */
function nxsParseLocaleDate(text, locale, today = new Date()) {
    const typed = asciiDigits(text).trim();
    if (!typed)
        return null;
    const invalid = new Date(Number.NaN);
    const numbers = typed.match(/\d+/g) ?? [];
    const written = writtenWords(locale);
    const words = (typed.match(/\p{L}+/gu) ?? []).filter((word) => !written.has(word.toLowerCase()));
    const order = nxsDateFieldOrder(locale);
    let year;
    let month;
    let day;
    const months = words.map((word) => monthNamed(word, locale));
    const named = months.find((found) => found !== null);
    // A word is a month, or one of the markers Chinese, Japanese and Korean put after each field.
    if (words.some((word, i) => months[i] === null && !/^[年月日년월일]$/u.test(word)))
        return invalid;
    if (named) {
        if (numbers.length < 1 || numbers.length > 2)
            return invalid;
        month = named;
        const yearIndex = numbers.findIndex((n) => n.length >= 3 || Number(n) > 31);
        if (numbers.length === 2) {
            const yi = yearIndex >= 0 ? yearIndex : order.indexOf('year') < order.indexOf('day') ? 0 : 1;
            year = fullYear(numbers[yi]);
            day = Number(numbers[1 - yi]);
        }
        else {
            if (yearIndex === 0)
                return invalid;
            day = Number(numbers[0]);
        }
    }
    else if (numbers.length === 1 && (numbers[0].length === 8 || numbers[0].length === 6)) {
        // Digits typed without separators, in the locale's order: 31122026 or 311226.
        const yearLength = numbers[0].length - 4;
        let at = 0;
        const parts = {};
        for (const field of order) {
            const length = field === 'year' ? yearLength : 2;
            parts[field] = numbers[0].slice(at, at + length);
            at += length;
        }
        year = fullYear(parts['year']);
        month = Number(parts['month']);
        day = Number(parts['day']);
    }
    else if (numbers.length === 3) {
        const yearIndex = numbers.findIndex((n) => n.length >= 3 || Number(n) > 31);
        if (yearIndex >= 0) {
            year = fullYear(numbers[yearIndex]);
            const rest = numbers.filter((_, i) => i !== yearIndex);
            // Year first is year-month-day in ISO 8601 and in every locale that writes the year first
            // but Kyrgyz and Uyghur, which write `2026-31-12`, and are read as they write.
            const monthFirst = order.indexOf('month') < order.indexOf('day') || (yearIndex === 0 && order[0] !== 'year');
            [month, day] = (monthFirst ? rest : [rest[1], rest[0]]).map(Number);
        }
        else {
            const fields = Object.fromEntries(order.map((field, i) => [field, numbers[i]]));
            year = fullYear(fields['year']);
            month = Number(fields['month']);
            day = Number(fields['day']);
        }
    }
    else if (numbers.length === 2) {
        const dayMonth = order.filter((field) => field !== 'year');
        const fields = Object.fromEntries(dayMonth.map((field, i) => [field, numbers[i]]));
        month = Number(fields['month']);
        day = Number(fields['day']);
    }
    else {
        return invalid;
    }
    const resolvedYear = year ?? today.getFullYear();
    if (!month || month < 1 || month > 12 || !day || day < 1)
        return invalid;
    const date = new Date(resolvedYear, month - 1, day);
    date.setFullYear(resolvedYear, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day ? date : invalid;
}
/**
 * Material's native adapter, reading a typed date in the locale's order.
 *
 * `NativeDateAdapter.parse` is `Date.parse`, which reads `nn/nn/yyyy` as an American date in every
 * locale: `03/04/2026` typed in French became 4 March. This keeps everything else the native adapter
 * does and replaces that, with the Gregorian calendar throughout.
 */
class NxsLocaleDateAdapter extends NativeDateAdapter {
    constructor() {
        super();
        // `NativeDateAdapter`'s constructor sets its locale through `DateAdapter`, past this override.
        this.setLocale(this.locale);
    }
    setLocale(locale) {
        super.setLocale(gregorian(nxsLocaleId(locale)));
    }
    parse(value) {
        if (typeof value === 'number')
            return new Date(value);
        if (value instanceof Date)
            return value;
        return typeof value === 'string' ? nxsParseLocaleDate(value, this.locale) : null;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsLocaleDateAdapter, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsLocaleDateAdapter });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsLocaleDateAdapter, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
/**
 * The date adapter a host provides, unless it reads typed text as Material's native one does, with
 * `Date.parse`, which cannot read a localized date; then this library's. So a host that chose a date
 * library — date-fns, Luxon — keeps it, and its formats with it, and every other host gets typed
 * dates read in its locale.
 *
 * Reading as the native one is Material's own class, or a subclass that keeps its `parse`, such as
 * one that only starts the week on Monday. Kept, it would store `03/04/2026` typed in French as
 * 4 March under a hint, lined up from the dates it writes, that says day first. Its other changes
 * then do not reach the field; a host that wants both overrides `parse`.
 */
function hostDateAdapter() {
    const host = inject(DateAdapter, { skipSelf: true, optional: true });
    const readsAsNative = host instanceof NativeDateAdapter && host.parse === NativeDateAdapter.prototype.parse;
    return host && !readsAsNative ? host : null;
}
/**
 * Providers for a date field: the date adapter and formats `hostDateAdapter` decides on.
 *
 * The adapter kept may not hold JS `Date`s — Luxon's holds `DateTime`s — so a component using
 * these providers gives its fields, and reads from them, the adapter's own dates, crossing to and
 * from the JS dates it computes with through `nxsDateToAdapter` and `nxsDateFromAdapter`.
 */
function provideNxsDateAdapter() {
    return [
        {
            provide: DateAdapter,
            useFactory: () => hostDateAdapter() ?? new NxsLocaleDateAdapter(),
        },
        {
            provide: MAT_DATE_FORMATS,
            useFactory: () => hostDateAdapter()
                ? (inject(MAT_DATE_FORMATS, { skipSelf: true, optional: true }) ??
                    MAT_NATIVE_DATE_FORMATS)
                : MAT_NATIVE_DATE_FORMATS,
        },
    ];
}
/**
 * The English `common.date-mask`. It is the one mask whose letters are known to be in English order
 * whatever the active language, because it is what answers for a language whose catalogue has no
 * mask of its own. A spec holds it to the English catalogue, so the two cannot drift apart.
 */
const NXS_ENGLISH_DATE_MASK = 'mm/dd/yyyy';
/** 31 December 2026, as `DateAdapter.createDate` takes it: its day, month and year differ. */
const NXS_DATE_MASK_SAMPLE = { year: 2026, month: 11, day: 31 };
/** Punctuation and spaces: what may sit between, before or after a date's numeric fields. */
const FIELD_PUNCTUATION = /^[\p{P}\p{Zs}]+$/u;
/** The field a number in the written sample date is: 31 the day, 12 the month, the rest the year. */
function sampleField(value) {
    if (value === NXS_DATE_MASK_SAMPLE.day)
        return 'day';
    if (value === NXS_DATE_MASK_SAMPLE.month + 1)
        return 'month';
    return 'year';
}
/**
 * The fields of the sample date as a field writes it, in order, with the text between them:
 * `31/12/2026` is day, `/`, month, `/`, year. `null` when it is not three numeric fields with only
 * punctuation around them, such as a month written as a word or a literal like `年`.
 */
function writtenSegments(written) {
    const text = asciiDigits(written).replace(/[\u200e\u200f\u061c]/g, '');
    const segments = [];
    const seen = new Set();
    for (const run of text.match(/\d+|\D+/g) ?? []) {
        if (!/\d/.test(run)) {
            if (!FIELD_PUNCTUATION.test(run))
                return null;
            segments.push(run);
            continue;
        }
        const field = sampleField(Number(run));
        if (seen.has(field))
            return null;
        seen.add(field);
        segments.push({ field, width: run.length });
    }
    return seen.size === 3 ? segments : null;
}
/**
 * The letter runs of a translated mask — `jj/mm/aaaa` is `jj`, `mm`, `aaaa` — or `null` when it is
 * not three runs, each one letter repeated, with only punctuation between them.
 */
function maskLetters(mask) {
    const trimmed = mask.trim();
    if (!/^\p{L}+(?:[\p{P}\p{Zs}]+\p{L}+){2}$/u.test(trimmed))
        return null;
    const runs = trimmed.match(/\p{L}+/gu) ?? [];
    return runs.every((run) => [...run].every((letter) => letter === run[0])) ? runs : null;
}
/**
 * The fields a translated mask's letter runs stand for, in order: the order `language` writes a
 * date in, the language the catalogue answered in. A catalogue is named by the whole code, so
 * `en_GB`'s `dd/mm/yyyy` is read in British order, day first. But a regional catalogue may copy
 * its language's mask: `fr_CA` with French `jj/mm/aaaa` would give `jj`, written first, to the
 * year Canadian French writes first. A year's run is never shorter than another field's, so an
 * order that would give the year a shorter run is the wrong one: then the mask is read in the
 * language's order, and failing that it is not read at all (`null`).
 */
function maskOrder(letters, language) {
    const longest = Math.max(...letters.map((run) => [...run].length));
    return ([language, language.trim().split(/[-_]/)[0]]
        .map(nxsDateFieldOrder)
        .find((order) => [...letters[order.indexOf('year')]].length === longest) ?? null);
}
/**
 * The hint for a date field — `jj/mm/aaaa` — in the order, and with the separators, of `written`:
 * the sample date (31 December 2026) as the field's own date adapter writes it. The letters are the
 * translated mask's, read in the order of `maskLanguage`, the language the catalogue answered in,
 * as `maskOrder` decides it — `fr_FR` is French; the English mask is read in English order whatever the language, because it is what answers for a
 * catalogue without one.
 *
 * So the hint follows the parser rather than the catalogue: a French catalogue's `jj/mm/aaaa` reads
 * `mm/jj/aaaa` where the adapter writes month first, and the English `mm/dd/yyyy` reads
 * `dd/mm/yyyy` where it writes day first. A year the adapter writes with two digits gets two
 * letters, one with four gets four. Anything that cannot be lined up — a mask with a literal such
 * as `年`, an adapter that writes the month as a word or a word such as Bulgarian `г.` — gives
 * `written` itself rather than a mask that might not agree with the parser.
 *
 * Either way the hint is only as good as the adapter reading back what it writes: the field's
 * order comes from what the adapter writes, and the parse from what it reads. `NxsLocaleDateAdapter`
 * does, which its spec checks in every language `Intl` formats a date in. A host's adapter is trusted to; one that writes
 * with `display.dateInput` and reads with a different `parse.dateInput` may not.
 */
function nxsDateMask(written, mask, maskLanguage) {
    const target = writtenSegments(written);
    const letters = maskLetters(mask);
    if (!target || !letters)
        return written;
    const order = maskOrder(letters, mask.trim() === NXS_ENGLISH_DATE_MASK ? 'en' : maskLanguage);
    if (!order)
        return written;
    const lettersOf = new Map(order.map((field, index) => [field, letters[index]]));
    return target
        .map((segment) => {
        if (typeof segment === 'string')
            return segment;
        const word = lettersOf.get(segment.field) ?? '';
        if (segment.field !== 'year')
            return word;
        // A year written with two digits gets two letters, one written with four gets four.
        const yearLetters = segment.width <= 2 ? 2 : 4;
        return ([...word][0] ?? '').repeat(yearLetters);
    })
        .join('');
}
/** The keys the application's other date pickers use, so the calendar is translated once. */
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
 * The calendar's labels from the catalogue, re-read when the language or catalogue changes. A key
 * the catalogue lacks keeps Material's English rather than showing the key. Provided by the date
 * field itself: `MatDatepickerModule` provides its own English one, which shadows a host's.
 */
class NxsDatepickerIntl extends MatDatepickerIntl {
    translate = inject(TranslateService);
    english = Object.fromEntries(Object.keys(LABEL_KEYS).map((field) => [field, this[field]]));
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
        return this.resolve('shared-ui.datepicker.year-range-label', super.formatYearRangeLabel(start, end), { start, end });
    }
    refresh() {
        for (const field of Object.keys(LABEL_KEYS)) {
            this[field] = this.resolve(LABEL_KEYS[field], this.english[field]);
        }
        this.changes.next();
    }
    resolve(key, fallback, params) {
        const value = this.translate.instant(key, params);
        return typeof value === 'string' && value !== key ? value : fallback;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDatepickerIntl, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDatepickerIntl });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDatepickerIntl, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * A local part, then dot-separated domain labels that hold no dot. A domain splits into labels
 * only one way, so a failed match ends in linear time.
 */
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
/**
 * Shares a document with someone outside the organisation, as a `MatDialog`:
 * `dialog.open(NxsShareExternalDialogComponent, { data })`.
 *
 * As in Web UI, the share needs an end date and always emails the person a link; Nuxeo creates no
 * account for them. **Create and add another** keeps the dialog open for the next person. The
 * dialog closes with `true` when it shared the document with anyone, `false` otherwise.
 */
class NxsShareExternalDialogComponent {
    dialogRef = inject(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    detail = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    dateAdapter = inject(DateAdapter);
    rights = offeredRights(this.data.permissions);
    mailHint = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    email = signal('', ...(ngDevMode ? [{ debugName: "email" }] : []));
    emailLeft = signal(false, ...(ngDevMode ? [{ debugName: "emailLeft" }] : []));
    right = signal(this.rights[0], ...(ngDevMode ? [{ debugName: "right" }] : []));
    /** The share's days, at local midnight. */
    begin = signal(null, ...(ngDevMode ? [{ debugName: "begin" }] : []));
    end = signal(null, ...(ngDevMode ? [{ debugName: "end" }] : []));
    /** The same days as the date fields hold them, in their adapter's own representation. */
    beginField = computed(() => nxsDateToAdapter(this.dateAdapter, this.begin()), ...(ngDevMode ? [{ debugName: "beginField" }] : []));
    endField = computed(() => nxsDateToAdapter(this.dateAdapter, this.end()), ...(ngDevMode ? [{ debugName: "endField" }] : []));
    comment = signal('', ...(ngDevMode ? [{ debugName: "comment" }] : []));
    /** Which button is saving, so only that one shows the spinner. */
    saving = signal(null, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    shared = false;
    emailValid = computed(() => EMAIL.test(this.email().trim()), ...(ngDevMode ? [{ debugName: "emailValid" }] : []));
    /**
     * Puts the email box in Material's error state once the user has left it invalid, so the input
     * sets `aria-invalid` and points `aria-describedby` at the `mat-error` itself.
     */
    emailError = {
        isErrorState: () => this.emailLeft() && !this.emailValid(),
    };
    emailBox = viewChild.required('emailBox', { read: MatInput });
    endBeforeBegin = computed(() => {
        const begin = toDay(this.begin());
        const end = toDay(this.end());
        return !!begin && !!end && end < begin;
    }, ...(ngDevMode ? [{ debugName: "endBeforeBegin" }] : []));
    valid = computed(() => this.emailValid() && !!this.end() && !this.endBeforeBegin(), ...(ngDevMode ? [{ debugName: "valid" }] : []));
    constructor() {
        // MatInput consults its matcher only for a form control's input; this one has none.
        effect(() => {
            this.emailError.isErrorState(null, null);
            this.emailBox().updateErrorState();
        });
        // Escape and the backdrop must report a share made with "Create and add another" too.
        this.dialogRef.disableClose = true;
        merge(this.dialogRef.backdropClick(), this.dialogRef.keydownEvents().pipe(filter((event) => event.key === 'Escape')))
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
            if (!this.saving())
                this.cancel();
        });
    }
    label(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** The day a date field holds, whatever its adapter holds dates as. */
    fieldDay(value) {
        return nxsDateFromAdapter(this.dateAdapter, value);
    }
    cancel() {
        this.dialogRef.close(this.shared);
    }
    create(another) {
        if (!this.valid() || this.saving())
            return;
        this.saving.set(another ? 'another' : 'create');
        const email = this.email().trim();
        this.detail
            .addExternalPermissionWithNotification(this.data.documentUid, {
            email,
            permission: this.right(),
            begin: toDay(this.begin()),
            end: toDay(this.end()),
            notify: true,
            comment: this.comment().trim() || undefined,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.saving.set(null);
                this.shared = true;
                this.toast.show(this.translate.instant(result.notificationErrorKey ?? 'satori-components.permission-dialogs.share.shared', { email }), { duration: 7000 });
                if (another) {
                    this.reset();
                }
                else {
                    this.dialogRef.close(true);
                }
            },
            error: (error) => {
                this.saving.set(null);
                this.toast.error(isMailSendError(error)
                    ? permissionCreateMailFailureMessage((key) => this.translate.instant(key))
                    : this.translate.instant(failureKey(error, 'satori-components.permission-dialogs.error.share')), { duration: 7000 });
            },
        });
    }
    reset() {
        this.email.set('');
        this.emailLeft.set(false);
        this.right.set(this.rights[0]);
        this.begin.set(null);
        this.end.set(null);
        this.comment.set('');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsShareExternalDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsShareExternalDialogComponent, isStandalone: true, selector: "nxs-share-external-dialog", host: { classAttribute: "nxs-share-external-dialog" }, providers: [provideNxsDateAdapter(), provideNxsToast()], viewQueries: [{ propertyName: "emailBox", first: true, predicate: ["emailBox"], descendants: true, read: MatInput, isSignal: true }], ngImport: i0, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.share.title' | translate }}</h2>\n\n<mat-dialog-content class=\"nxs-share-external-dialog__content\">\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.share.email' | translate }}</mat-label>\n    <input\n      #emailBox\n      matInput\n      type=\"email\"\n      autocomplete=\"off\"\n      required\n      [placeholder]=\"'satori-components.permission-dialogs.share.email-placeholder' | translate\"\n      [value]=\"email()\"\n      [errorStateMatcher]=\"emailError\"\n      (input)=\"email.set(emailBox.value)\"\n      (blur)=\"emailLeft.set(true)\"\n    />\n    <mat-error>{{\n      'satori-components.permission-dialogs.share.email-invalid' | translate\n    }}</mat-error>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.right' | translate }}</mat-label>\n    <mat-select [value]=\"right()\" (valueChange)=\"right.set($event)\">\n      @for (permission of rights; track permission) {\n        <mat-option [value]=\"permission\">{{ label(permission) }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"nxs-share-external-dialog__dates\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"beginPicker\"\n        [value]=\"beginField()\"\n        (dateChange)=\"begin.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n      <mat-datepicker #beginPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.to' | translate }}</mat-label>\n      <input\n        matInput\n        required\n        [matDatepicker]=\"endPicker\"\n        [value]=\"endField()\"\n        (dateChange)=\"end.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n      <mat-datepicker #endPicker />\n    </mat-form-field>\n  </div>\n  @if (endBeforeBegin()) {\n    <p class=\"nxs-share-external-dialog__error\" role=\"alert\">\n      {{ 'satori-components.permission-dialogs.end-before-begin' | translate }}\n    </p>\n  }\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.comment' | translate }}</mat-label>\n    <textarea\n      #commentBox\n      matInput\n      rows=\"2\"\n      [placeholder]=\"'satori-components.permission-dialogs.comment-placeholder' | translate\"\n      [value]=\"comment()\"\n      (input)=\"comment.set(commentBox.value)\"\n    ></textarea>\n    <mat-hint>{{ mailHint | translate }}</mat-hint>\n  </mat-form-field>\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" [disabled]=\"!!saving()\" (click)=\"cancel()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-stroked-button\n    type=\"button\"\n    class=\"nxs-share-external-dialog__another\"\n    [disabled]=\"!valid() || !!saving()\"\n    (click)=\"create(true)\"\n  >\n    @if (saving() === 'another') {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.share.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.share.create-another' | translate }}\n    }\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-share-external-dialog__create\"\n    [disabled]=\"!valid() || !!saving()\"\n    (click)=\"create(false)\"\n  >\n    @if (saving() === 'create') {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.share.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.share.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;--nxs-share-external-dialog-error: var(--mat-sys-error)}.nxs-share-external-dialog__content{display:flex;flex-direction:column;gap:4px;width:min(480px,80vw)}.nxs-share-external-dialog__dates{display:flex;flex-wrap:wrap;gap:0 16px}.nxs-share-external-dialog__dates mat-form-field{flex:1 1 11rem}:host .nxs-share-external-dialog__content{padding-top:8px}:host .nxs-share-external-dialog__error{margin:-4px 0 8px;font-size:12px;color:var(--nxs-share-external-dialog-error)}\n"], dependencies: [{ kind: "component", type: MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i1$3.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i1$3.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i1$3.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i2$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i2$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i2$4.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsShareExternalDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-share-external-dialog', standalone: true, imports: [
                        MatButton,
                        MatDatepickerModule,
                        MatDialogModule,
                        MatFormFieldModule,
                        MatInputModule,
                        MatSelectModule,
                        NxsSpinnerComponent,
                        TranslatePipe,
                    ], providers: [provideNxsDateAdapter(), provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-share-external-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.share.title' | translate }}</h2>\n\n<mat-dialog-content class=\"nxs-share-external-dialog__content\">\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.share.email' | translate }}</mat-label>\n    <input\n      #emailBox\n      matInput\n      type=\"email\"\n      autocomplete=\"off\"\n      required\n      [placeholder]=\"'satori-components.permission-dialogs.share.email-placeholder' | translate\"\n      [value]=\"email()\"\n      [errorStateMatcher]=\"emailError\"\n      (input)=\"email.set(emailBox.value)\"\n      (blur)=\"emailLeft.set(true)\"\n    />\n    <mat-error>{{\n      'satori-components.permission-dialogs.share.email-invalid' | translate\n    }}</mat-error>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.right' | translate }}</mat-label>\n    <mat-select [value]=\"right()\" (valueChange)=\"right.set($event)\">\n      @for (permission of rights; track permission) {\n        <mat-option [value]=\"permission\">{{ label(permission) }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <div class=\"nxs-share-external-dialog__dates\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"beginPicker\"\n        [value]=\"beginField()\"\n        (dateChange)=\"begin.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n      <mat-datepicker #beginPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.to' | translate }}</mat-label>\n      <input\n        matInput\n        required\n        [matDatepicker]=\"endPicker\"\n        [value]=\"endField()\"\n        (dateChange)=\"end.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n      <mat-datepicker #endPicker />\n    </mat-form-field>\n  </div>\n  @if (endBeforeBegin()) {\n    <p class=\"nxs-share-external-dialog__error\" role=\"alert\">\n      {{ 'satori-components.permission-dialogs.end-before-begin' | translate }}\n    </p>\n  }\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.comment' | translate }}</mat-label>\n    <textarea\n      #commentBox\n      matInput\n      rows=\"2\"\n      [placeholder]=\"'satori-components.permission-dialogs.comment-placeholder' | translate\"\n      [value]=\"comment()\"\n      (input)=\"comment.set(commentBox.value)\"\n    ></textarea>\n    <mat-hint>{{ mailHint | translate }}</mat-hint>\n  </mat-form-field>\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" [disabled]=\"!!saving()\" (click)=\"cancel()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-stroked-button\n    type=\"button\"\n    class=\"nxs-share-external-dialog__another\"\n    [disabled]=\"!valid() || !!saving()\"\n    (click)=\"create(true)\"\n  >\n    @if (saving() === 'another') {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.share.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.share.create-another' | translate }}\n    }\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-share-external-dialog__create\"\n    [disabled]=\"!valid() || !!saving()\"\n    (click)=\"create(false)\"\n  >\n    @if (saving() === 'create') {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.share.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.share.create' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;--nxs-share-external-dialog-error: var(--mat-sys-error)}.nxs-share-external-dialog__content{display:flex;flex-direction:column;gap:4px;width:min(480px,80vw)}.nxs-share-external-dialog__dates{display:flex;flex-wrap:wrap;gap:0 16px}.nxs-share-external-dialog__dates mat-form-field{flex:1 1 11rem}:host .nxs-share-external-dialog__content{padding-top:8px}:host .nxs-share-external-dialog__error{margin:-4px 0 8px;font-size:12px;color:var(--nxs-share-external-dialog-error)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { emailBox: [{ type: i0.ViewChild, args: ['emailBox', { ...{ read: MatInput }, isSignal: true }] }] } });

let nextId$b = 0;
/**
 * Changes one permission entry's right, time frame or both, as a `MatDialog`:
 * `dialog.open(NxsUpdatePermissionDialogComponent, { data })`.
 *
 * It replaces the entry in one call, as Web UI does, so a failure leaves the entry as it was. An
 * external user's share keeps its required end date and always emails the person again. A date the
 * user did not change is written back as the instant Nuxeo holds, so editing the right alone never
 * moves an entry written from another time zone. It closes with `true` once Nuxeo has saved it.
 */
class NxsUpdatePermissionDialogComponent {
    dialogRef = inject(MatDialogRef);
    data = inject(MAT_DIALOG_DATA);
    detail = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    destroyRef = inject(DestroyRef);
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    dateAdapter = inject(DateAdapter);
    ace = this.data.ace;
    id = `nxs-update-permission-dialog-${nextId$b++}`;
    external = this.ace.externalUser;
    principal = principalLabel(this.ace);
    rights = offeredRights(this.data.permissions, this.ace.permission);
    mailHint = PERMISSION_NOTIFICATION_MAIL_HINT_KEY;
    right = signal(this.ace.permission, ...(ngDevMode ? [{ debugName: "right" }] : []));
    dated = signal(this.external || !!this.ace.begin || !!this.ace.end, ...(ngDevMode ? [{ debugName: "dated" }] : []));
    /** The entry's days, at local midnight. */
    begin = signal(dayToDate(this.ace.begin), ...(ngDevMode ? [{ debugName: "begin" }] : []));
    end = signal(dayToDate(this.ace.end), ...(ngDevMode ? [{ debugName: "end" }] : []));
    /** The same days as the date fields hold them, in their adapter's own representation. */
    beginField = computed(() => nxsDateToAdapter(this.dateAdapter, this.begin()), ...(ngDevMode ? [{ debugName: "beginField" }] : []));
    endField = computed(() => nxsDateToAdapter(this.dateAdapter, this.end()), ...(ngDevMode ? [{ debugName: "endField" }] : []));
    notify = signal(this.external, ...(ngDevMode ? [{ debugName: "notify" }] : []));
    comment = signal('', ...(ngDevMode ? [{ debugName: "comment" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    endBeforeBegin = computed(() => {
        if (!this.dated())
            return false;
        const begin = toDay(this.begin());
        const end = toDay(this.end());
        return !!begin && !!end && end < begin;
    }, ...(ngDevMode ? [{ debugName: "endBeforeBegin" }] : []));
    valid = computed(() => !this.endBeforeBegin() && (!this.external || !!this.end()), ...(ngDevMode ? [{ debugName: "valid" }] : []));
    label(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** The day a date field holds, whatever its adapter holds dates as. */
    fieldDay(value) {
        return nxsDateFromAdapter(this.dateAdapter, value);
    }
    update() {
        if (!this.valid() || this.saving())
            return;
        this.saving.set(true);
        const notify = this.notify();
        this.detail
            .replacePermissionWithNotification(this.data.documentUid, {
            id: this.ace.id,
            username: this.ace.username,
            permission: this.right(),
            begin: this.dated() ? dateToWrite(toDay(this.begin()), this.ace.begin) : null,
            end: this.dated() ? dateToWrite(toDay(this.end()), this.ace.end) : null,
            notify,
            comment: notify ? this.comment().trim() || null : null,
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                this.toast.show(this.translate.instant(result.notificationErrorKey ??
                    (result.notificationSent
                        ? 'satori-components.permission-dialogs.update.updated-notified'
                        : 'satori-components.permission-dialogs.update.updated')), { duration: 7000 });
                this.dialogRef.close(true);
            },
            error: (error) => {
                this.saving.set(false);
                this.toast.error(isMailSendError(error)
                    ? permissionUpdateMailFailureMessage((key) => this.translate.instant(key))
                    : this.translate.instant(failureKey(error, 'satori-components.permission-dialogs.error.update')), { duration: 7000 });
            },
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsUpdatePermissionDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsUpdatePermissionDialogComponent, isStandalone: true, selector: "nxs-update-permission-dialog", host: { classAttribute: "nxs-update-permission-dialog" }, providers: [provideNxsDateAdapter(), provideNxsToast()], ngImport: i0, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.update.title' | translate }}</h2>\n\n<mat-dialog-content class=\"nxs-update-permission-dialog__content\">\n  <p class=\"nxs-update-permission-dialog__principal\">\n    {{ 'satori-components.permission-dialogs.update.for' | translate: { principal } }}\n  </p>\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.right' | translate }}</mat-label>\n    <mat-select [value]=\"right()\" (valueChange)=\"right.set($event)\">\n      @for (permission of rights; track permission) {\n        <mat-option [value]=\"permission\">{{ label(permission) }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  @if (!external) {\n    <span class=\"nxs-update-permission-dialog__label\" [id]=\"id + '-time-frame'\">{{\n      'satori-components.permission-dialogs.time-frame' | translate\n    }}</span>\n    <mat-radio-group\n      class=\"nxs-update-permission-dialog__time-frame\"\n      [attr.aria-labelledby]=\"id + '-time-frame'\"\n      [value]=\"dated() ? 'dated' : 'permanent'\"\n      (change)=\"dated.set($event.value === 'dated')\"\n    >\n      <mat-radio-button value=\"permanent\">{{\n        'satori-components.permission-dialogs.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"dated\">{{\n        'satori-components.permission-dialogs.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  }\n\n  <div class=\"nxs-update-permission-dialog__dates\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"beginPicker\"\n        [disabled]=\"!dated()\"\n        [value]=\"beginField()\"\n        (dateChange)=\"begin.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n      <mat-datepicker #beginPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.to' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"endPicker\"\n        [required]=\"external\"\n        [disabled]=\"!dated()\"\n        [value]=\"endField()\"\n        (dateChange)=\"end.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n      <mat-datepicker #endPicker />\n    </mat-form-field>\n  </div>\n  @if (endBeforeBegin()) {\n    <p class=\"nxs-update-permission-dialog__error\" role=\"alert\">\n      {{ 'satori-components.permission-dialogs.end-before-begin' | translate }}\n    </p>\n  }\n\n  @if (!external) {\n    <mat-checkbox [checked]=\"notify()\" (change)=\"notify.set($event.checked)\">\n      {{ 'satori-components.permission-dialogs.update.notify' | translate }}\n    </mat-checkbox>\n  }\n  @if (notify()) {\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.comment' | translate }}</mat-label>\n      <textarea\n        #commentBox\n        matInput\n        rows=\"2\"\n        [placeholder]=\"'satori-components.permission-dialogs.comment-placeholder' | translate\"\n        [value]=\"comment()\"\n        (input)=\"comment.set(commentBox.value)\"\n      ></textarea>\n      <mat-hint>{{ mailHint | translate }}</mat-hint>\n    </mat-form-field>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" mat-dialog-close [disabled]=\"saving()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-update-permission-dialog__update\"\n    [disabled]=\"!valid() || saving()\"\n    (click)=\"update()\"\n  >\n    @if (saving()) {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.update.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.update.update' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;--nxs-update-permission-dialog-muted: var(--mat-sys-on-surface-variant);--nxs-update-permission-dialog-error: var(--mat-sys-error)}.nxs-update-permission-dialog__content{display:flex;flex-direction:column;gap:4px;width:min(460px,80vw)}:host .nxs-update-permission-dialog__principal{margin:0 0 12px;font-size:14px;color:var(--nxs-update-permission-dialog-muted)}.nxs-update-permission-dialog__label{font-size:13px;font-weight:500}.nxs-update-permission-dialog__time-frame{display:flex;gap:24px;margin-bottom:8px}.nxs-update-permission-dialog__dates{display:flex;flex-wrap:wrap;gap:0 16px}.nxs-update-permission-dialog__dates mat-form-field{flex:1 1 11rem}:host .nxs-update-permission-dialog__error{margin:-4px 0 8px;font-size:12px;color:var(--nxs-update-permission-dialog-error)}\n"], dependencies: [{ kind: "component", type: MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i1$3.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i1$3.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i1$3.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i2$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i2$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "component", type: MatRadioButton, selector: "mat-radio-button", inputs: ["id", "name", "aria-label", "aria-labelledby", "aria-describedby", "disableRipple", "tabIndex", "checked", "value", "labelPosition", "disabled", "required", "color", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioButton"] }, { kind: "directive", type: MatRadioGroup, selector: "mat-radio-group", inputs: ["color", "name", "labelPosition", "value", "selected", "disabled", "required", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioGroup"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i2$4.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsUpdatePermissionDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-update-permission-dialog', standalone: true, imports: [
                        MatButton,
                        MatCheckbox,
                        MatDatepickerModule,
                        MatDialogModule,
                        MatFormFieldModule,
                        MatInputModule,
                        MatRadioButton,
                        MatRadioGroup,
                        MatSelectModule,
                        NxsSpinnerComponent,
                        TranslatePipe,
                    ], providers: [provideNxsDateAdapter(), provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-update-permission-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.permission-dialogs.update.title' | translate }}</h2>\n\n<mat-dialog-content class=\"nxs-update-permission-dialog__content\">\n  <p class=\"nxs-update-permission-dialog__principal\">\n    {{ 'satori-components.permission-dialogs.update.for' | translate: { principal } }}\n  </p>\n\n  <mat-form-field appearance=\"outline\">\n    <mat-label>{{ 'satori-components.permission-dialogs.right' | translate }}</mat-label>\n    <mat-select [value]=\"right()\" (valueChange)=\"right.set($event)\">\n      @for (permission of rights; track permission) {\n        <mat-option [value]=\"permission\">{{ label(permission) }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  @if (!external) {\n    <span class=\"nxs-update-permission-dialog__label\" [id]=\"id + '-time-frame'\">{{\n      'satori-components.permission-dialogs.time-frame' | translate\n    }}</span>\n    <mat-radio-group\n      class=\"nxs-update-permission-dialog__time-frame\"\n      [attr.aria-labelledby]=\"id + '-time-frame'\"\n      [value]=\"dated() ? 'dated' : 'permanent'\"\n      (change)=\"dated.set($event.value === 'dated')\"\n    >\n      <mat-radio-button value=\"permanent\">{{\n        'satori-components.permission-dialogs.permanent' | translate\n      }}</mat-radio-button>\n      <mat-radio-button value=\"dated\">{{\n        'satori-components.permission-dialogs.date-based' | translate\n      }}</mat-radio-button>\n    </mat-radio-group>\n  }\n\n  <div class=\"nxs-update-permission-dialog__dates\">\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.from' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"beginPicker\"\n        [disabled]=\"!dated()\"\n        [value]=\"beginField()\"\n        (dateChange)=\"begin.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n      <mat-datepicker #beginPicker />\n    </mat-form-field>\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.to' | translate }}</mat-label>\n      <input\n        matInput\n        [matDatepicker]=\"endPicker\"\n        [required]=\"external\"\n        [disabled]=\"!dated()\"\n        [value]=\"endField()\"\n        (dateChange)=\"end.set(fieldDay($event.value))\"\n      />\n      <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n      <mat-datepicker #endPicker />\n    </mat-form-field>\n  </div>\n  @if (endBeforeBegin()) {\n    <p class=\"nxs-update-permission-dialog__error\" role=\"alert\">\n      {{ 'satori-components.permission-dialogs.end-before-begin' | translate }}\n    </p>\n  }\n\n  @if (!external) {\n    <mat-checkbox [checked]=\"notify()\" (change)=\"notify.set($event.checked)\">\n      {{ 'satori-components.permission-dialogs.update.notify' | translate }}\n    </mat-checkbox>\n  }\n  @if (notify()) {\n    <mat-form-field appearance=\"outline\">\n      <mat-label>{{ 'satori-components.permission-dialogs.comment' | translate }}</mat-label>\n      <textarea\n        #commentBox\n        matInput\n        rows=\"2\"\n        [placeholder]=\"'satori-components.permission-dialogs.comment-placeholder' | translate\"\n        [value]=\"comment()\"\n        (input)=\"comment.set(commentBox.value)\"\n      ></textarea>\n      <mat-hint>{{ mailHint | translate }}</mat-hint>\n    </mat-form-field>\n  }\n</mat-dialog-content>\n\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" mat-dialog-close [disabled]=\"saving()\">\n    {{ 'satori-components.permission-dialogs.cancel' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    type=\"button\"\n    class=\"nxs-update-permission-dialog__update\"\n    [disabled]=\"!valid() || saving()\"\n    (click)=\"update()\"\n  >\n    @if (saving()) {\n      <nxs-spinner\n        diameter=\"18\"\n        [label]=\"'satori-components.permission-dialogs.update.saving' | translate\"\n      />\n    } @else {\n      {{ 'satori-components.permission-dialogs.update.update' | translate }}\n    }\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;--nxs-update-permission-dialog-muted: var(--mat-sys-on-surface-variant);--nxs-update-permission-dialog-error: var(--mat-sys-error)}.nxs-update-permission-dialog__content{display:flex;flex-direction:column;gap:4px;width:min(460px,80vw)}:host .nxs-update-permission-dialog__principal{margin:0 0 12px;font-size:14px;color:var(--nxs-update-permission-dialog-muted)}.nxs-update-permission-dialog__label{font-size:13px;font-weight:500}.nxs-update-permission-dialog__time-frame{display:flex;gap:24px;margin-bottom:8px}.nxs-update-permission-dialog__dates{display:flex;flex-wrap:wrap;gap:0 16px}.nxs-update-permission-dialog__dates mat-form-field{flex:1 1 11rem}:host .nxs-update-permission-dialog__error{margin:-4px 0 8px;font-size:12px;color:var(--nxs-update-permission-dialog-error)}\n"] }]
        }] });

let nextId$a = 0;
/**
 * The side panel of a document page — Web UI's `nuxeo-document-page` side pane, with its
 * Comments and Activity tabs, here with Properties beside them.
 *
 * It owns the frame: a header naming the document with a close button, a strip of ARIA tabs, and
 * one tab panel holding whatever the host projects for the selected view. Which views exist (Web
 * UI offers Comments only on a `Commentable` document) and what each shows are the host's.
 */
class NxsDetailsPanelComponent {
    element = inject(ElementRef);
    uid = `nxs-details-panel-${nextId$a++}`;
    tabButtons = viewChildren('tabButton', ...(ngDevMode ? [{ debugName: "tabButtons" }] : []));
    /** The header text — usually the document's title or file name. */
    heading = input('', ...(ngDevMode ? [{ debugName: "heading" }] : []));
    /** The panel's accessible name, already translated. Blank falls back to `heading`. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The views, in order. */
    tabs = input.required(...(ngDevMode ? [{ debugName: "tabs" }] : []));
    /** The selected view's ID. Two-way; one that is not in `tabs` selects the first. */
    selected = model('', ...(ngDevMode ? [{ debugName: "selected" }] : []));
    /** The close button's accessible name. Blank falls back to "Close details". */
    closeLabel = input('', ...(ngDevMode ? [{ debugName: "closeLabel" }] : []));
    /** The close button was pressed. The host decides what closing means. */
    closed = output();
    regionLabel = computed(() => this.label().trim() || this.heading().trim() || null, ...(ngDevMode ? [{ debugName: "regionLabel" }] : []));
    ownCloseLabel = computed(() => this.closeLabel().trim(), ...(ngDevMode ? [{ debugName: "ownCloseLabel" }] : []));
    activeId = computed(() => {
        const tabs = this.tabs();
        return tabs.some((tab) => tab.id === this.selected()) ? this.selected() : (tabs[0]?.id ?? '');
    }, ...(ngDevMode ? [{ debugName: "activeId" }] : []));
    panelId = `${this.uid}-panel`;
    tabId(id) {
        return `${this.uid}-tab-${id}`;
    }
    select(tab) {
        this.selected.set(tab.id);
    }
    /** The ARIA tabs pattern: arrows move and select (automatic activation), Home and End jump. */
    onKeydown(event, index) {
        const tabs = this.tabs();
        const last = tabs.length - 1;
        const rtl = getComputedStyle(this.element.nativeElement).direction === 'rtl';
        const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const back = rtl ? 'ArrowRight' : 'ArrowLeft';
        const target = event.key === forward
            ? index === last
                ? 0
                : index + 1
            : event.key === back
                ? index === 0
                    ? last
                    : index - 1
                : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                        ? last
                        : null;
        if (target === null || !tabs[target])
            return;
        event.preventDefault();
        this.select(tabs[target]);
        this.tabButtons()[target]?.nativeElement.focus();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDetailsPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDetailsPanelComponent, isStandalone: true, selector: "nxs-details-panel", inputs: { heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, tabs: { classPropertyName: "tabs", publicName: "tabs", isSignal: true, isRequired: true, transformFunction: null }, selected: { classPropertyName: "selected", publicName: "selected", isSignal: true, isRequired: false, transformFunction: null }, closeLabel: { classPropertyName: "closeLabel", publicName: "closeLabel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selected: "selectedChange", closed: "closed" }, host: { attributes: { "role": "complementary" }, properties: { "attr.aria-label": "regionLabel()" }, classAttribute: "nxs-details-panel" }, viewQueries: [{ propertyName: "tabButtons", predicate: ["tabButton"], descendants: true, isSignal: true }], ngImport: i0, template: "<div class=\"nxs-details-panel__header\">\n  <span class=\"nxs-details-panel__title\">{{ heading() }}</span>\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-details-panel__close\"\n    [attr.aria-label]=\"ownCloseLabel() || ('satori-components.details-panel.close' | translate)\"\n    (click)=\"closed.emit()\"\n  >\n    <mat-icon aria-hidden=\"true\">close</mat-icon>\n  </button>\n</div>\n\n<div class=\"nxs-details-panel__tabs\" role=\"tablist\">\n  @for (tab of tabs(); track tab.id; let i = $index) {\n    <button\n      #tabButton\n      type=\"button\"\n      role=\"tab\"\n      class=\"nxs-details-panel__tab\"\n      [class.nxs-details-panel__tab--active]=\"tab.id === activeId()\"\n      [id]=\"tabId(tab.id)\"\n      [attr.data-tab-id]=\"tab.id\"\n      [attr.aria-selected]=\"tab.id === activeId()\"\n      [attr.aria-controls]=\"panelId\"\n      [tabIndex]=\"tab.id === activeId() ? 0 : -1\"\n      (click)=\"select(tab)\"\n      (keydown)=\"onKeydown($event, i)\"\n    >\n      {{ tab.label }}\n    </button>\n  }\n</div>\n\n<div\n  class=\"nxs-details-panel__body\"\n  role=\"tabpanel\"\n  tabindex=\"0\"\n  [id]=\"panelId\"\n  [attr.aria-labelledby]=\"activeId() ? tabId(activeId()) : null\"\n>\n  <ng-content />\n</div>\n", styles: [":host{--nxs-details-panel-surface: var(--mat-sys-surface);--nxs-details-panel-text: var(--mat-sys-on-surface);--nxs-details-panel-divider: var(--mat-sys-outline-variant);--nxs-details-panel-muted: var(--mat-sys-on-surface-variant);--nxs-details-panel-accent: var(--mat-sys-primary);display:flex;flex-direction:column;min-height:0;overflow:hidden;background:var(--nxs-details-panel-surface)}.nxs-details-panel__header{display:flex;align-items:center;padding:12px 8px 12px 16px;border-bottom:1px solid var(--nxs-details-panel-divider);flex-shrink:0}.nxs-details-panel__title{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--nxs-details-panel-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nxs-details-panel__close:focus{outline:2px solid var(--nxs-details-panel-muted);outline-offset:-2px}.nxs-details-panel__tabs{display:flex;border-bottom:1px solid var(--nxs-details-panel-divider);flex-shrink:0}.nxs-details-panel__tab{flex:1;padding:10px 16px;border:none;background:none;font:inherit;font-size:13px;font-weight:500;color:var(--nxs-details-panel-muted);cursor:pointer;text-align:center;position:relative}.nxs-details-panel__tab:hover{color:var(--nxs-details-panel-text)}.nxs-details-panel__tab--active{color:var(--nxs-details-panel-accent)}.nxs-details-panel__tab--active:after{content:\"\";position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--nxs-details-panel-accent)}.nxs-details-panel__tab:focus{outline:2px solid var(--nxs-details-panel-muted);outline-offset:-2px}.nxs-details-panel__body{flex:1;min-height:0;overflow-y:auto;padding:16px}.nxs-details-panel__body:focus{outline:2px solid var(--nxs-details-panel-muted);outline-offset:-2px}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDetailsPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-details-panel', standalone: true, imports: [MatButtonModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-details-panel', '[attr.aria-label]': 'regionLabel()', role: 'complementary' }, template: "<div class=\"nxs-details-panel__header\">\n  <span class=\"nxs-details-panel__title\">{{ heading() }}</span>\n  <button\n    mat-icon-button\n    type=\"button\"\n    class=\"nxs-details-panel__close\"\n    [attr.aria-label]=\"ownCloseLabel() || ('satori-components.details-panel.close' | translate)\"\n    (click)=\"closed.emit()\"\n  >\n    <mat-icon aria-hidden=\"true\">close</mat-icon>\n  </button>\n</div>\n\n<div class=\"nxs-details-panel__tabs\" role=\"tablist\">\n  @for (tab of tabs(); track tab.id; let i = $index) {\n    <button\n      #tabButton\n      type=\"button\"\n      role=\"tab\"\n      class=\"nxs-details-panel__tab\"\n      [class.nxs-details-panel__tab--active]=\"tab.id === activeId()\"\n      [id]=\"tabId(tab.id)\"\n      [attr.data-tab-id]=\"tab.id\"\n      [attr.aria-selected]=\"tab.id === activeId()\"\n      [attr.aria-controls]=\"panelId\"\n      [tabIndex]=\"tab.id === activeId() ? 0 : -1\"\n      (click)=\"select(tab)\"\n      (keydown)=\"onKeydown($event, i)\"\n    >\n      {{ tab.label }}\n    </button>\n  }\n</div>\n\n<div\n  class=\"nxs-details-panel__body\"\n  role=\"tabpanel\"\n  tabindex=\"0\"\n  [id]=\"panelId\"\n  [attr.aria-labelledby]=\"activeId() ? tabId(activeId()) : null\"\n>\n  <ng-content />\n</div>\n", styles: [":host{--nxs-details-panel-surface: var(--mat-sys-surface);--nxs-details-panel-text: var(--mat-sys-on-surface);--nxs-details-panel-divider: var(--mat-sys-outline-variant);--nxs-details-panel-muted: var(--mat-sys-on-surface-variant);--nxs-details-panel-accent: var(--mat-sys-primary);display:flex;flex-direction:column;min-height:0;overflow:hidden;background:var(--nxs-details-panel-surface)}.nxs-details-panel__header{display:flex;align-items:center;padding:12px 8px 12px 16px;border-bottom:1px solid var(--nxs-details-panel-divider);flex-shrink:0}.nxs-details-panel__title{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--nxs-details-panel-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nxs-details-panel__close:focus{outline:2px solid var(--nxs-details-panel-muted);outline-offset:-2px}.nxs-details-panel__tabs{display:flex;border-bottom:1px solid var(--nxs-details-panel-divider);flex-shrink:0}.nxs-details-panel__tab{flex:1;padding:10px 16px;border:none;background:none;font:inherit;font-size:13px;font-weight:500;color:var(--nxs-details-panel-muted);cursor:pointer;text-align:center;position:relative}.nxs-details-panel__tab:hover{color:var(--nxs-details-panel-text)}.nxs-details-panel__tab--active{color:var(--nxs-details-panel-accent)}.nxs-details-panel__tab--active:after{content:\"\";position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--nxs-details-panel-accent)}.nxs-details-panel__tab:focus{outline:2px solid var(--nxs-details-panel-muted);outline-offset:-2px}.nxs-details-panel__body{flex:1;min-height:0;overflow-y:auto;padding:16px}.nxs-details-panel__body:focus{outline:2px solid var(--nxs-details-panel-muted);outline-offset:-2px}\n"] }]
        }], propDecorators: { tabButtons: [{ type: i0.ViewChildren, args: ['tabButton', { isSignal: true }] }], heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], tabs: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabs", required: true }] }], selected: [{ type: i0.Input, args: [{ isSignal: true, alias: "selected", required: false }] }, { type: i0.Output, args: ["selectedChange"] }], closeLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "closeLabel", required: false }] }], closed: [{ type: i0.Output, args: ["closed"] }] } });

/**
 * The action row of a document page — Web UI's `nuxeo-actions-menu` in the document header.
 *
 * Presentational: the host resolves its slot's descriptors (labels translated, rules and enabled
 * rules evaluated, tooltips chosen) and runs the action `selected` names, so the library takes no
 * dependency on the extensions barrel. Inline entries are icon buttons that stay focusable while
 * disabled, so their tooltip — "Locked by Jane on 3 May" — is reachable from the keyboard; the rest
 * sit behind one "More actions" button. Content projected into it renders before the actions.
 */
class NxsDocumentToolbarComponent {
    /** Every entry, in display order; `overflow` decides which group each one is in. */
    actions = input.required(...(ngDevMode ? [{ debugName: "actions" }] : []));
    /**
     * The group's accessible name, already translated. Blank falls back to the library's own
     * "Document actions".
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The menu button's accessible name and tooltip. Blank falls back to "More actions". */
    moreLabel = input('', ...(ngDevMode ? [{ debugName: "moreLabel" }] : []));
    /** The entry the user ran. Never a disabled one. */
    selected = output();
    inline = computed(() => this.actions().filter((action) => !action.overflow), ...(ngDevMode ? [{ debugName: "inline" }] : []));
    overflow = computed(() => this.actions().filter((action) => action.overflow), ...(ngDevMode ? [{ debugName: "overflow" }] : []));
    ownLabel = computed(() => this.label().trim(), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    ownMoreLabel = computed(() => this.moreLabel().trim(), ...(ngDevMode ? [{ debugName: "ownMoreLabel" }] : []));
    /** A tooltip only when there is one to show: Material renders an empty one as a blank bubble. */
    tooltipOf(action) {
        return (action.tooltip ?? '').trim() || action.label;
    }
    /** What the tooltip adds to the label, if anything — "Locked by Jane on 3 May" on Unlock. */
    extraOf(action) {
        const tip = (action.tooltip ?? '').trim();
        return tip && tip !== action.label ? tip : '';
    }
    /**
     * An icon button's accessible name: its label, then what its tooltip adds, so a keyboard or
     * screen-reader user hears the lock owner a mouse user reads.
     */
    nameOf(action) {
        const extra = this.extraOf(action);
        return extra ? `${action.label}. ${extra}` : action.label;
    }
    /**
     * Inline buttons are `disabledInteractive`, so a click on a disabled one still arrives here and
     * is refused here.
     */
    run(action) {
        if (action.disabled)
            return;
        this.selected.emit(action);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentToolbarComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDocumentToolbarComponent, isStandalone: true, selector: "nxs-document-toolbar", inputs: { actions: { classPropertyName: "actions", publicName: "actions", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, moreLabel: { classPropertyName: "moreLabel", publicName: "moreLabel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selected: "selected" }, host: { classAttribute: "nxs-document-toolbar" }, ngImport: i0, template: "<div\n  class=\"nxs-document-toolbar__group\"\n  role=\"group\"\n  [attr.aria-label]=\"ownLabel() || ('satori-components.document-toolbar.label' | translate)\"\n>\n  <ng-content />\n\n  @for (action of inline(); track action.id) {\n    <!-- The name is text, not aria-label: an icon ligature beside an aria-label reads as a\n         visible label the name does not contain (WCAG 2.5.3, IBM label_name_visible). -->\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-document-toolbar__action\"\n      [class.nxs-document-toolbar__action--active]=\"action.active\"\n      [attr.data-action-id]=\"action.id\"\n      [matTooltip]=\"tooltipOf(action)\"\n      [disabled]=\"!!action.disabled\"\n      disabledInteractive\n      (click)=\"run(action)\"\n    >\n      @if (action.icon) {\n        <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{ nameOf(action) }}</span>\n        <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n      } @else {\n        <span class=\"nxs-document-toolbar__text\">{{ action.label }}</span>\n        @if (extraOf(action); as extra) {\n          <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">. {{ extra }}</span>\n        }\n      }\n    </button>\n  }\n\n  @if (overflow().length > 0) {\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-document-toolbar__more\"\n      [matMenuTriggerFor]=\"moreMenu\"\n      [matTooltip]=\"\n        ownMoreLabel() || ('satori-components.document-toolbar.more-actions' | translate)\n      \"\n    >\n      <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n        ownMoreLabel() || ('satori-components.document-toolbar.more-actions' | translate)\n      }}</span>\n      <mat-icon aria-hidden=\"true\">more_vert</mat-icon>\n    </button>\n  }\n</div>\n\n<mat-menu #moreMenu=\"matMenu\" class=\"nxs-document-toolbar__menu\">\n  @for (action of overflow(); track action.id) {\n    <button\n      mat-menu-item\n      type=\"button\"\n      [attr.data-action-id]=\"action.id\"\n      [disabled]=\"!!action.disabled\"\n      [matTooltip]=\"action.tooltip ?? ''\"\n      [matTooltipDisabled]=\"!action.tooltip\"\n      matTooltipPosition=\"left\"\n      (click)=\"run(action)\"\n    >\n      @if (action.icon) {\n        <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n      }\n      <span>{{ action.label }}</span>\n    </button>\n  }\n</mat-menu>\n", styles: [":host{--nxs-document-toolbar-active: var(--mat-sys-primary);display:inline-flex;flex-shrink:0}.nxs-document-toolbar__group{display:flex;align-items:center;gap:8px}.nxs-document-toolbar__action,.nxs-document-toolbar__more{color:var(--mat-sys-on-surface-variant)}.nxs-document-toolbar__action--active:not(.mat-mdc-button-disabled){color:var(--nxs-document-toolbar-active)}.nxs-document-toolbar__text{font-size:12px;font-weight:500}\n"], dependencies: [{ kind: "directive", type: CdkAriaLive, selector: "[cdkAriaLive]", inputs: ["cdkAriaLive", "cdkAriaLiveDuration"], exportAs: ["cdkAriaLive"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatMenuModule }, { kind: "component", type: i3.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "component", type: i3.MatMenuItem, selector: "[mat-menu-item]", inputs: ["role", "disabled", "disableRipple"], exportAs: ["matMenuItem"] }, { kind: "directive", type: i3.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentToolbarComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-document-toolbar', standalone: true, imports: [
                        CdkAriaLive,
                        MatButtonModule,
                        MatIconModule,
                        MatMenuModule,
                        MatTooltipModule,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-document-toolbar' }, template: "<div\n  class=\"nxs-document-toolbar__group\"\n  role=\"group\"\n  [attr.aria-label]=\"ownLabel() || ('satori-components.document-toolbar.label' | translate)\"\n>\n  <ng-content />\n\n  @for (action of inline(); track action.id) {\n    <!-- The name is text, not aria-label: an icon ligature beside an aria-label reads as a\n         visible label the name does not contain (WCAG 2.5.3, IBM label_name_visible). -->\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-document-toolbar__action\"\n      [class.nxs-document-toolbar__action--active]=\"action.active\"\n      [attr.data-action-id]=\"action.id\"\n      [matTooltip]=\"tooltipOf(action)\"\n      [disabled]=\"!!action.disabled\"\n      disabledInteractive\n      (click)=\"run(action)\"\n    >\n      @if (action.icon) {\n        <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{ nameOf(action) }}</span>\n        <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n      } @else {\n        <span class=\"nxs-document-toolbar__text\">{{ action.label }}</span>\n        @if (extraOf(action); as extra) {\n          <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">. {{ extra }}</span>\n        }\n      }\n    </button>\n  }\n\n  @if (overflow().length > 0) {\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-document-toolbar__more\"\n      [matMenuTriggerFor]=\"moreMenu\"\n      [matTooltip]=\"\n        ownMoreLabel() || ('satori-components.document-toolbar.more-actions' | translate)\n      \"\n    >\n      <span class=\"cdk-visually-hidden\" cdkAriaLive=\"off\">{{\n        ownMoreLabel() || ('satori-components.document-toolbar.more-actions' | translate)\n      }}</span>\n      <mat-icon aria-hidden=\"true\">more_vert</mat-icon>\n    </button>\n  }\n</div>\n\n<mat-menu #moreMenu=\"matMenu\" class=\"nxs-document-toolbar__menu\">\n  @for (action of overflow(); track action.id) {\n    <button\n      mat-menu-item\n      type=\"button\"\n      [attr.data-action-id]=\"action.id\"\n      [disabled]=\"!!action.disabled\"\n      [matTooltip]=\"action.tooltip ?? ''\"\n      [matTooltipDisabled]=\"!action.tooltip\"\n      matTooltipPosition=\"left\"\n      (click)=\"run(action)\"\n    >\n      @if (action.icon) {\n        <mat-icon aria-hidden=\"true\">{{ action.icon }}</mat-icon>\n      }\n      <span>{{ action.label }}</span>\n    </button>\n  }\n</mat-menu>\n", styles: [":host{--nxs-document-toolbar-active: var(--mat-sys-primary);display:inline-flex;flex-shrink:0}.nxs-document-toolbar__group{display:flex;align-items:center;gap:8px}.nxs-document-toolbar__action,.nxs-document-toolbar__more{color:var(--mat-sys-on-surface-variant)}.nxs-document-toolbar__action--active:not(.mat-mdc-button-disabled){color:var(--nxs-document-toolbar-active)}.nxs-document-toolbar__text{font-size:12px;font-weight:500}\n"] }]
        }], propDecorators: { actions: [{ type: i0.Input, args: [{ isSignal: true, alias: "actions", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], moreLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "moreLabel", required: false }] }], selected: [{ type: i0.Output, args: ["selected"] }] } });

/**
 * Provides a picker as the value accessor and a validator of the form control on its element —
 * `ngModel`, `formControl` or `formControlName` — so the form gets the picker's value and also
 * its own errors, such as text typed and never chosen.
 */
function nxsPickerProviders(picker) {
    return [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(picker), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(picker), multi: true },
    ];
}
/**
 * The part of a picker that talks to a form. Without a form every call here is a no-op and the
 * picker's `value` model carries the value; with one, it keeps the callbacks the form registers
 * and the control the form validates, so the picker can show the form's `required` error too.
 */
class NxsPickerControl {
    /** The user has left the field at least once. */
    touched = signal(false, ...(ngDevMode ? [{ debugName: "touched" }] : []));
    /** The form disabled the control. */
    formDisabled = signal(false, ...(ngDevMode ? [{ debugName: "formDisabled" }] : []));
    control = null;
    onChange = () => undefined;
    onTouched = () => undefined;
    onValidatorChange = () => undefined;
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    registerOnValidatorChange(fn) {
        this.onValidatorChange = fn;
    }
    setDisabledState(disabled) {
        this.formDisabled.set(disabled);
    }
    /** The picker's `validate`: remembers the control, and answers with the picker's own errors. */
    validate(control, own) {
        this.control = control;
        return own;
    }
    /** The picker's own errors changed: the form validates again. */
    revalidate() {
        this.onValidatorChange();
    }
    /** The user changed the value. */
    changed(value) {
        this.onChange(value);
    }
    /** The user left the field. */
    blurred() {
        this.touched.set(true);
        this.onTouched();
    }
    /** Touched here or in the form — `markAllAsTouched()` on submit, for example. */
    wasTouched() {
        return this.touched() || Boolean(this.control?.touched);
    }
    /** The form's validators, or the picker's own, reject the value. */
    formInvalid() {
        return Boolean(this.control?.invalid);
    }
    /** The form's `required` error, or `required` given to the picker, on an empty value. */
    missing(required, empty) {
        return Boolean(this.control?.hasError('required')) || (required && empty);
    }
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
class NxsDateInputComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The earliest date allowed, or `null`. */
    min = input(null, ...(ngDevMode ? [{ debugName: "min" }] : []));
    /** The latest date allowed, or `null`. */
    max = input(null, ...(ngDevMode ? [{ debugName: "max" }] : []));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The date, at local midnight, or `null`. Two-way; a form control carries the same value. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    adapter = inject(DateAdapter);
    formats = inject(MAT_DATE_FORMATS);
    input = viewChild.required(MatInput);
    dateInput = viewChild.required(MatDatepickerInput);
    /** The date the field last set itself, so its own changes are not mistaken for a host's. */
    committed = null;
    control = new NxsPickerControl();
    /** What the user typed, while it is not a date the field holds. */
    typed = signal('', ...(ngDevMode ? [{ debugName: "typed" }] : []));
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    /** Why the typed text or the date is refused, if it is. */
    problem = computed(() => {
        if (this.typed().trim() && !this.value())
            return 'parse';
        const value = this.value();
        if (!value)
            return null;
        const min = this.min();
        const max = this.max();
        if (min && this.adapter.compareDate(value, min) < 0)
            return 'min';
        if (max && this.adapter.compareDate(value, max) > 0)
            return 'max';
        return null;
    }, ...(ngDevMode ? [{ debugName: "problem" }] : []));
    /** A date written the way the locale writes dates, with a day above 12 so the order shows. */
    example = computed(() => this.formatted(this.adapter.createDate(new Date().getFullYear(), 11, 31)), ...(ngDevMode ? [{ debugName: "example" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.problem() !== null || this.missing() || this.control.formInvalid()),
    };
    constructor() {
        effect(() => {
            this.problem();
            untracked(() => this.control.revalidate());
        });
        // A date set from outside is written into the input. The field's own changes are not: writing
        // `null` while the user types text that is not a date yet would erase what they typed.
        effect(() => {
            const value = this.value();
            untracked(() => {
                if (value === this.committed)
                    return;
                this.committed = value;
                this.typed.set('');
                this.dateInput().value = value;
            });
        });
    }
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck() {
        this.input().updateErrorState();
    }
    writeValue(value) {
        this.value.set(value && this.adapter.isValid(value) ? value : null);
    }
    registerOnChange(fn) {
        this.control.registerOnChange(fn);
    }
    registerOnTouched(fn) {
        this.control.registerOnTouched(fn);
    }
    setDisabledState(disabled) {
        this.control.setDisabledState(disabled);
    }
    validate(control) {
        const problem = this.problem();
        const errors = problem === 'parse'
            ? { nxsDateParse: { text: this.typed() } }
            : problem === 'min'
                ? { nxsDateMin: { min: this.min() } }
                : problem === 'max'
                    ? { nxsDateMax: { max: this.max() } }
                    : null;
        return this.control.validate(control, errors);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    missing() {
        return this.control.missing(this.required(), this.value() === null && !this.typed().trim());
    }
    formatted(date) {
        return date && this.adapter.isValid(date)
            ? this.adapter.format(date, this.formats.display.dateInput)
            : '';
    }
    /**
     * The raw text, on each key. The datepicker emits `dateInput` only when its date changes, so text
     * that is not a date, typed into an empty field, reaches the picker only here.
     */
    typing(event) {
        this.typed.set(event.target.value);
    }
    /** Each key typed, and a date chosen from the calendar: the datepicker has parsed the text. */
    changed(event) {
        const text = event.targetElement instanceof HTMLInputElement ? event.targetElement.value : '';
        const date = event.value && this.adapter.isValid(event.value) ? event.value : null;
        this.typed.set(date ? '' : text);
        this.committed = date;
        this.value.set(date);
        this.control.changed(date);
    }
    blurred() {
        this.control.blurred();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDateInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDateInputComponent, isStandalone: true, selector: "nxs-date-input", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, min: { classPropertyName: "min", publicName: "min", isSignal: true, isRequired: false, transformFunction: null }, max: { classPropertyName: "max", publicName: "max", isSignal: true, isRequired: false, transformFunction: null }, hint: { classPropertyName: "hint", publicName: "hint", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { classAttribute: "nxs-date-input" }, providers: [
            nxsPickerProviders(() => NxsDateInputComponent),
            provideNxsDateAdapter(),
            { provide: MatDatepickerIntl, useClass: NxsDatepickerIntl },
        ], viewQueries: [{ propertyName: "input", first: true, predicate: MatInput, descendants: true, isSignal: true }, { propertyName: "dateInput", first: true, predicate: MatDatepickerInput, descendants: true, isSignal: true }], ngImport: i0, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    autocomplete=\"off\"\n    [matDatepicker]=\"picker\"\n    [min]=\"min()\"\n    [max]=\"max()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"typing($event)\"\n    (dateInput)=\"changed($event)\"\n    (blur)=\"blurred()\"\n  />\n  <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n  <mat-datepicker #picker />\n  @switch (problem()) {\n    @case ('parse') {\n      <mat-error>{{\n        'satori-components.date-input.invalid' | translate: { example: example() }\n      }}</mat-error>\n    }\n    @case ('min') {\n      <mat-error>{{\n        'satori-components.date-input.too-early' | translate: { date: formatted(min()) }\n      }}</mat-error>\n    }\n    @case ('max') {\n      <mat-error>{{\n        'satori-components.date-input.too-late' | translate: { date: formatted(max()) }\n      }}</mat-error>\n    }\n    @default {\n      @if (missing()) {\n        <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n      }\n    }\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}\n"], dependencies: [{ kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i1$3.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i1$3.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i1$3.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDateInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-date-input', standalone: true, imports: [MatDatepickerModule, MatInputModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, providers: [
                        nxsPickerProviders(() => NxsDateInputComponent),
                        provideNxsDateAdapter(),
                        { provide: MatDatepickerIntl, useClass: NxsDatepickerIntl },
                    ], host: { class: 'nxs-date-input' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    autocomplete=\"off\"\n    [matDatepicker]=\"picker\"\n    [min]=\"min()\"\n    [max]=\"max()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"typing($event)\"\n    (dateInput)=\"changed($event)\"\n    (blur)=\"blurred()\"\n  />\n  <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n  <mat-datepicker #picker />\n  @switch (problem()) {\n    @case ('parse') {\n      <mat-error>{{\n        'satori-components.date-input.invalid' | translate: { example: example() }\n      }}</mat-error>\n    }\n    @case ('min') {\n      <mat-error>{{\n        'satori-components.date-input.too-early' | translate: { date: formatted(min()) }\n      }}</mat-error>\n    }\n    @case ('max') {\n      <mat-error>{{\n        'satori-components.date-input.too-late' | translate: { date: formatted(max()) }\n      }}</mat-error>\n    }\n    @default {\n      @if (missing()) {\n        <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n      }\n    }\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}\n"] }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], min: [{ type: i0.Input, args: [{ isSignal: true, alias: "min", required: false }] }], max: [{ type: i0.Input, args: [{ isSignal: true, alias: "max", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }], dateInput: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatDatepickerInput), { isSignal: true }] }] } });

/**
 * One icon, by its Material Icons ligature (`folder`, `description`, `collections_bookmark`).
 *
 * Decorative unless given a `label`: an icon beside text that already says the same thing is
 * hidden from assistive technology, and an icon that stands alone is an image with that name.
 *
 * Sized by `--nxs-icon-size` (24px by default) and coloured by `color`, both inherited, so a host
 * sets them on the element or on any ancestor — including through `nxs-doc-type-icon`.
 */
class NxsIconComponent {
    /** The Material Icons ligature. */
    name = input.required(...(ngDevMode ? [{ debugName: "name" }] : []));
    /** What the icon means, already translated. Blank makes it decorative. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The accessible name as a reader gets it: whitespace or zero-width characters alone are no name. */
    accessibleName = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "accessibleName" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsIconComponent, isStandalone: true, selector: "nxs-icon", inputs: { name: { classPropertyName: "name", publicName: "name", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-icon" }, ngImport: i0, template: "<mat-icon\n  [attr.aria-hidden]=\"accessibleName() ? null : 'true'\"\n  [attr.aria-label]=\"accessibleName() || null\"\n  [attr.role]=\"accessibleName() ? 'img' : null\"\n  >{{ name() }}</mat-icon\n>\n", styles: [":host{display:inline-flex;flex-shrink:0;width:var(--nxs-icon-size, 24px);height:var(--nxs-icon-size, 24px)}mat-icon{width:100%;height:100%;font-size:var(--nxs-icon-size, 24px);line-height:1}\n"], dependencies: [{ kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsIconComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-icon', standalone: true, imports: [MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-icon' }, template: "<mat-icon\n  [attr.aria-hidden]=\"accessibleName() ? null : 'true'\"\n  [attr.aria-label]=\"accessibleName() || null\"\n  [attr.role]=\"accessibleName() ? 'img' : null\"\n  >{{ name() }}</mat-icon\n>\n", styles: [":host{display:inline-flex;flex-shrink:0;width:var(--nxs-icon-size, 24px);height:var(--nxs-icon-size, 24px)}mat-icon{width:100%;height:100%;font-size:var(--nxs-icon-size, 24px);line-height:1}\n"] }]
        }], propDecorators: { name: [{ type: i0.Input, args: [{ isSignal: true, alias: "name", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/**
 * The icon for a Nuxeo document type — `Folder`, `File`, `Picture`, `Collection` …
 *
 * The type-to-icon table is `docTypeIcon()` in `nuxeo-client`, so a type added there gets its
 * icon everywhere this is used, and an unknown type gets the generic file icon rather than
 * nothing. Decorative unless given a `label`, because it almost always sits beside the type's
 * name or the document's title.
 */
class NxsDocTypeIconComponent {
    /** The document's type, as Nuxeo names it. */
    type = input.required(...(ngDevMode ? [{ debugName: "type" }] : []));
    /** What the icon means, already translated. Blank makes it decorative. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    icon = computed(() => docTypeIcon(this.type()), ...(ngDevMode ? [{ debugName: "icon" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocTypeIconComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsDocTypeIconComponent, isStandalone: true, selector: "nxs-doc-type-icon", inputs: { type: { classPropertyName: "type", publicName: "type", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-doc-type-icon" }, ngImport: i0, template: "<nxs-icon [name]=\"icon()\" [label]=\"label()\" />\n", styles: [":host{display:inline-flex;flex-shrink:0}\n"], dependencies: [{ kind: "component", type: NxsIconComponent, selector: "nxs-icon", inputs: ["name", "label"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocTypeIconComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-doc-type-icon', standalone: true, imports: [NxsIconComponent], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-doc-type-icon' }, template: "<nxs-icon [name]=\"icon()\" [label]=\"label()\" />\n", styles: [":host{display:inline-flex;flex-shrink:0}\n"] }]
        }], propDecorators: { type: [{ type: i0.Input, args: [{ isSignal: true, alias: "type", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

/** Whether a drag carries files from the user's computer, rather than text or a link. */
function dragHasFiles(event) {
    return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}
/**
 * The drag-over state of one drop target that accepts files, and nothing else.
 *
 * `dragenter` and `dragleave` fire for every child the pointer crosses, so a plain flag flickers
 * off over the first child; counting the entries keeps it on until the pointer leaves the target.
 * A drag of text or a link is ignored entirely: no highlight, and the browser keeps its default.
 */
class NxsFileDropTracker {
    accepts;
    /** True while files are dragged over the target. */
    over = signal(false, ...(ngDevMode ? [{ debugName: "over" }] : []));
    depth = 0;
    constructor(accepts) {
        this.accepts = accepts;
    }
    enter(event) {
        if (!this.takes(event))
            return;
        event.preventDefault();
        this.depth += 1;
        this.over.set(true);
    }
    overTarget(event) {
        if (!this.takes(event))
            return;
        event.preventDefault();
        if (event.dataTransfer)
            event.dataTransfer.dropEffect = 'copy';
    }
    leave(event) {
        if (!this.takes(event))
            return;
        this.depth = Math.max(0, this.depth - 1);
        if (this.depth === 0)
            this.over.set(false);
    }
    /** The files dropped, or none when the drop is not one this target takes. */
    drop(event) {
        if (!this.takes(event))
            return [];
        event.preventDefault();
        this.depth = 0;
        this.over.set(false);
        return Array.from(event.dataTransfer?.files ?? []);
    }
    takes(event) {
        return this.accepts() && dragHasFiles(event);
    }
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
class NxsPagerComponent {
    /** The page on screen, from zero. */
    pageIndex = input(0, ...(ngDevMode ? [{ debugName: "pageIndex", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** How many items a full page holds. */
    pageSize = input(50, ...(ngDevMode ? [{ debugName: "pageSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** How many items the page on screen holds. */
    itemCount = input(0, ...(ngDevMode ? [{ debugName: "itemCount", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Every item across every page; negative when the server did not count them. */
    totalSize = input(-1, ...(ngDevMode ? [{ debugName: "totalSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Whether the server has another page. */
    hasNextPage = input(false, ...(ngDevMode ? [{ debugName: "hasNextPage", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Disables both buttons while a page loads. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /**
     * The navigation landmark's accessible name, already translated. Blank, or only whitespace or
     * zero-width characters, names it "Pages".
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The page index to load: one less or one more than `pageIndex`. */
    pageChange = output();
    visible = computed(() => this.pageIndex() > 0 || this.hasNextPage(), ...(ngDevMode ? [{ debugName: "visible" }] : []));
    first = computed(() => this.itemCount() > 0 ? this.pageIndex() * this.pageSize() + 1 : 0, ...(ngDevMode ? [{ debugName: "first" }] : []));
    last = computed(() => this.pageIndex() * this.pageSize() + this.itemCount(), ...(ngDevMode ? [{ debugName: "last" }] : []));
    knownTotal = computed(() => {
        const total = this.totalSize();
        return Number.isFinite(total) && total >= 0 ? total : null;
    }, ...(ngDevMode ? [{ debugName: "knownTotal" }] : []));
    canPrevious = computed(() => !this.disabled() && this.pageIndex() > 0, ...(ngDevMode ? [{ debugName: "canPrevious" }] : []));
    canNext = computed(() => !this.disabled() && this.hasNextPage(), ...(ngDevMode ? [{ debugName: "canNext" }] : []));
    ownLabel = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    previous() {
        if (this.canPrevious())
            this.pageChange.emit(this.pageIndex() - 1);
    }
    next() {
        if (this.canNext())
            this.pageChange.emit(this.pageIndex() + 1);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPagerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsPagerComponent, isStandalone: true, selector: "nxs-pager", inputs: { pageIndex: { classPropertyName: "pageIndex", publicName: "pageIndex", isSignal: true, isRequired: false, transformFunction: null }, pageSize: { classPropertyName: "pageSize", publicName: "pageSize", isSignal: true, isRequired: false, transformFunction: null }, itemCount: { classPropertyName: "itemCount", publicName: "itemCount", isSignal: true, isRequired: false, transformFunction: null }, totalSize: { classPropertyName: "totalSize", publicName: "totalSize", isSignal: true, isRequired: false, transformFunction: null }, hasNextPage: { classPropertyName: "hasNextPage", publicName: "hasNextPage", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { pageChange: "pageChange" }, host: { classAttribute: "nxs-pager" }, ngImport: i0, template: "@if (visible()) {\n  @let name = ownLabel() || ('satori-components.pager.label' | translate);\n  @let previousLabel = 'satori-components.pager.previous' | translate;\n  @let nextLabel = 'satori-components.pager.next' | translate;\n  <nav class=\"nxs-pager__nav\" [attr.aria-label]=\"name\">\n    <span class=\"nxs-pager__range\" aria-live=\"polite\" aria-atomic=\"true\">\n      @if (itemCount() === 0) {\n        {{ 'satori-components.pager.past-end' | translate }}\n      } @else if (knownTotal() !== null) {\n        {{\n          'satori-components.pager.range-of'\n            | translate: { first: first(), last: last(), total: knownTotal() }\n        }}\n      } @else {\n        {{ 'satori-components.pager.range' | translate: { first: first(), last: last() } }}\n      }\n    </span>\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-pager__previous\"\n      [disabled]=\"!canPrevious()\"\n      [matTooltip]=\"previousLabel\"\n      [attr.aria-label]=\"previousLabel\"\n      (click)=\"previous()\"\n    >\n      <mat-icon class=\"nxs-pager__chevron\" aria-hidden=\"true\">chevron_left</mat-icon>\n    </button>\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-pager__next\"\n      [disabled]=\"!canNext()\"\n      [matTooltip]=\"nextLabel\"\n      [attr.aria-label]=\"nextLabel\"\n      (click)=\"next()\"\n    >\n      <mat-icon class=\"nxs-pager__chevron\" aria-hidden=\"true\">chevron_right</mat-icon>\n    </button>\n  </nav>\n}\n", styles: [":host{display:block;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant)}.nxs-pager__nav{display:flex;align-items:center;justify-content:flex-end;gap:4px;padding:4px 8px}.nxs-pager__range{margin-inline-end:8px}:host-context([dir=rtl]) .nxs-pager__chevron{transform:scaleX(-1)}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPagerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-pager', standalone: true, imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-pager' }, template: "@if (visible()) {\n  @let name = ownLabel() || ('satori-components.pager.label' | translate);\n  @let previousLabel = 'satori-components.pager.previous' | translate;\n  @let nextLabel = 'satori-components.pager.next' | translate;\n  <nav class=\"nxs-pager__nav\" [attr.aria-label]=\"name\">\n    <span class=\"nxs-pager__range\" aria-live=\"polite\" aria-atomic=\"true\">\n      @if (itemCount() === 0) {\n        {{ 'satori-components.pager.past-end' | translate }}\n      } @else if (knownTotal() !== null) {\n        {{\n          'satori-components.pager.range-of'\n            | translate: { first: first(), last: last(), total: knownTotal() }\n        }}\n      } @else {\n        {{ 'satori-components.pager.range' | translate: { first: first(), last: last() } }}\n      }\n    </span>\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-pager__previous\"\n      [disabled]=\"!canPrevious()\"\n      [matTooltip]=\"previousLabel\"\n      [attr.aria-label]=\"previousLabel\"\n      (click)=\"previous()\"\n    >\n      <mat-icon class=\"nxs-pager__chevron\" aria-hidden=\"true\">chevron_left</mat-icon>\n    </button>\n    <button\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-pager__next\"\n      [disabled]=\"!canNext()\"\n      [matTooltip]=\"nextLabel\"\n      [attr.aria-label]=\"nextLabel\"\n      (click)=\"next()\"\n    >\n      <mat-icon class=\"nxs-pager__chevron\" aria-hidden=\"true\">chevron_right</mat-icon>\n    </button>\n  </nav>\n}\n", styles: [":host{display:block;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant)}.nxs-pager__nav{display:flex;align-items:center;justify-content:flex-end;gap:4px;padding:4px 8px}.nxs-pager__range{margin-inline-end:8px}:host-context([dir=rtl]) .nxs-pager__chevron{transform:scaleX(-1)}\n"] }]
        }], propDecorators: { pageIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageIndex", required: false }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], itemCount: [{ type: i0.Input, args: [{ isSignal: true, alias: "itemCount", required: false }] }], totalSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "totalSize", required: false }] }], hasNextPage: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasNextPage", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], pageChange: [{ type: i0.Output, args: ["pageChange"] }] } });

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
const NXS_PRIMITIVE_IDS = Object.freeze({
    avatar: 'nxs.primitives.avatar',
    breadcrumbs: 'nxs.primitives.breadcrumbs',
    tag: 'nxs.primitives.tag',
    richTooltip: 'nxs.primitives.richTooltip',
    errorState: 'nxs.primitives.errorState',
});

/** How many thumbnail requests one cache keeps in flight at once. */
const NXS_THUMBNAIL_CONCURRENCY = 4;
/**
 * How long a thumbnail nothing shows is kept, in milliseconds, before its URL is revoked — long
 * enough for a view switch to show it again, short enough that a revisited page fetches afresh.
 */
const NXS_THUMBNAIL_GRACE = 2000;
/**
 * The thumbnails of one page, shared by every `nxs-thumbnail` under the component that provides it.
 *
 * Three things a per-thumbnail fetch cannot do. Two thumbnails of the same document share one
 * request and one blob URL. A view switch — list to cards — that destroys a thumbnail and creates
 * another for the same document reuses the URL instead of fetching again. And at most
 * `NXS_THUMBNAIL_CONCURRENCY` requests run at once, however many results the page renders.
 *
 * A URL nothing shows is revoked `NXS_THUMBNAIL_GRACE` after its last thumbnail goes, and every URL
 * when the providing component is destroyed. So nothing outlives the page, and a document shown
 * again later is fetched again, as it was before this cache existed.
 */
class NxsThumbnailCache {
    documents = inject(DocumentDetailService);
    destroyRef = inject(DestroyRef);
    entries = new Map();
    waiting = [];
    running = 0;
    constructor() {
        this.destroyRef.onDestroy(() => {
            // Emptied first: dropping a running request frees its slot, which would start a queued one.
            this.waiting.length = 0;
            for (const id of this.entries.keys())
                this.drop(id);
        });
    }
    /**
     * The blob URL of a document's thumbnail — `null` when there is none — held for as long as it is
     * subscribed. The stream stays open once it has answered: unsubscribing is what lets the URL go.
     */
    lend(documentId) {
        return defer(() => {
            const entry = this.hold(documentId);
            return concat(entry.url, NEVER).pipe(finalize(() => this.letGo(documentId, entry)));
        });
    }
    /** The bytes behind `url` did not decode: forget the document, so the URL is not handed out again. */
    discard(documentId, url) {
        if (this.entries.get(documentId)?.minted === url)
            this.drop(documentId);
    }
    hold(documentId) {
        let entry = this.entries.get(documentId);
        if (!entry) {
            entry = {
                url: new ReplaySubject(1),
                cancel: new Subject(),
                minted: null,
                holders: 0,
                expiry: null,
            };
            this.entries.set(documentId, entry);
            this.waiting.push(documentId);
            this.next();
        }
        if (entry.expiry)
            clearTimeout(entry.expiry);
        entry.expiry = null;
        entry.holders += 1;
        return entry;
    }
    letGo(documentId, entry) {
        // A dropped document may since have been fetched again; that entry is not this holder's.
        if (this.entries.get(documentId) !== entry)
            return;
        entry.holders -= 1;
        if (entry.holders === 0) {
            entry.expiry = setTimeout(() => this.drop(documentId), NXS_THUMBNAIL_GRACE);
        }
    }
    next() {
        while (this.running < NXS_THUMBNAIL_CONCURRENCY && this.waiting.length > 0) {
            const documentId = this.waiting.shift();
            const entry = this.entries.get(documentId);
            if (!entry)
                continue;
            this.running += 1;
            this.documents
                .fetchThumbnail(documentId)
                .pipe(catchError(() => of(null)), takeUntil(entry.cancel), takeUntilDestroyed(this.destroyRef), 
            // Finished however it ends — answered, failed or cancelled by `drop`.
            finalize(() => {
                this.running -= 1;
                this.next();
            }))
                .subscribe((blob) => {
                if (blob && blob.size > 0)
                    entry.minted = URL.createObjectURL(blob);
                entry.url.next(entry.minted);
                entry.url.complete();
            });
        }
    }
    drop(documentId) {
        const entry = this.entries.get(documentId);
        if (!entry)
            return;
        this.entries.delete(documentId);
        const queued = this.waiting.indexOf(documentId);
        if (queued >= 0)
            this.waiting.splice(queued, 1);
        if (entry.expiry)
            clearTimeout(entry.expiry);
        entry.cancel.next();
        entry.cancel.complete();
        if (entry.minted)
            URL.revokeObjectURL(entry.minted);
        entry.url.complete();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsThumbnailCache, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsThumbnailCache });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsThumbnailCache, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
/** Lists `NxsThumbnailCache` in a page component's `providers`, for every thumbnail under it. */
function provideNxsThumbnailCache() {
    return NxsThumbnailCache;
}

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
class NxsThumbnailComponent {
    /** The document whose `thumbnail` rendition to show. */
    documentId = input.required(...(ngDevMode ? [{ debugName: "documentId" }] : []));
    /** The image's text alternative, already translated. Blank marks it decorative. */
    alt = input('', ...(ngDevMode ? [{ debugName: "alt" }] : []));
    url = signal(null, ...(ngDevMode ? [{ debugName: "url" }] : []));
    documents = inject(DocumentDetailService);
    cache = inject(NxsThumbnailCache, { optional: true });
    /** Whether `url` is this component's to revoke — it is not when a page cache lent it. */
    owned = false;
    constructor() {
        toObservable(this.documentId)
            .pipe(
        // Cleared before the next request rather than when it answers, so a changed document never
        // shows the previous one's image, even for the length of a request.
        tap(() => this.clear()), switchMap((id) => this.load(id)), takeUntilDestroyed())
            .subscribe((url) => this.url.set(url));
        inject(DestroyRef).onDestroy(() => this.clear());
    }
    load(documentId) {
        if (!documentId)
            return of(null);
        return this.cache ? this.cache.lend(documentId) : this.own(documentId);
    }
    /** The bytes arrived but are not an image the browser can draw. */
    broken() {
        const url = this.url();
        if (url && !this.owned)
            this.cache?.discard(this.documentId(), url);
        this.clear();
    }
    own(documentId) {
        return this.documents.fetchThumbnail(documentId).pipe(catchError(() => of(null)), map((blob) => {
            if (!blob || blob.size === 0)
                return null;
            this.owned = true;
            return URL.createObjectURL(blob);
        }));
    }
    clear() {
        const url = this.url();
        if (url && this.owned)
            URL.revokeObjectURL(url);
        this.owned = false;
        this.url.set(null);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsThumbnailComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsThumbnailComponent, isStandalone: true, selector: "nxs-thumbnail", inputs: { documentId: { classPropertyName: "documentId", publicName: "documentId", isSignal: true, isRequired: true, transformFunction: null }, alt: { classPropertyName: "alt", publicName: "alt", isSignal: true, isRequired: false, transformFunction: null } }, host: { properties: { "class.nxs-thumbnail--empty": "url() === null" }, classAttribute: "nxs-thumbnail" }, ngImport: i0, template: "@if (url(); as src) {\n  <img class=\"nxs-thumbnail__image\" [src]=\"src\" [alt]=\"alt()\" (error)=\"broken()\" />\n} @else {\n  <ng-content />\n}\n", styles: [":host{display:block;overflow:hidden}:host(.nxs-thumbnail--empty){display:contents}.nxs-thumbnail__image{display:block;width:100%;height:100%;object-fit:inherit;border-radius:inherit}\n"], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsThumbnailComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-thumbnail', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-thumbnail',
                        '[class.nxs-thumbnail--empty]': 'url() === null',
                    }, template: "@if (url(); as src) {\n  <img class=\"nxs-thumbnail__image\" [src]=\"src\" [alt]=\"alt()\" (error)=\"broken()\" />\n} @else {\n  <ng-content />\n}\n", styles: [":host{display:block;overflow:hidden}:host(.nxs-thumbnail--empty){display:contents}.nxs-thumbnail__image{display:block;width:100%;height:100%;object-fit:inherit;border-radius:inherit}\n"] }]
        }], ctorParameters: () => [], propDecorators: { documentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentId", required: true }] }], alt: [{ type: i0.Input, args: [{ isSignal: true, alias: "alt", required: false }] }] } });

const SELECT_COLUMN = '__select';
const ACTIONS_COLUMN = '__actions';
/** What a row's controls are found by, to keep them out of the Tab sequence. */
const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';
/** The same, scoped to the body rows: each alternative on its own, or the header is caught too. */
const ROW_CONTROLS = FOCUSABLE.split(',')
    .map((selector) => `tr.nxs-document-list__row ${selector.trim()}`)
    .join(', ');
let nextId$9 = 0;
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
class NxsDocumentListComponent {
    /** The page on screen, in the server's order. */
    documents = input.required(...(ngDevMode ? [{ debugName: "documents" }] : []));
    /** The columns, in order. The `title` column is the one that names each row. */
    columns = input.required(...(ngDevMode ? [{ debugName: "columns" }] : []));
    /** The table's accessible name, already translated, such as "Contents of Invoices". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The order the page is in, or `null` for the source's own order. */
    sort = input(null, ...(ngDevMode ? [{ debugName: "sort" }] : []));
    /** The selected documents' ids, on every page. Two-way: `[(selectedIds)]`. */
    selectedIds = model([], ...(ngDevMode ? [{ debugName: "selectedIds" }] : []));
    /** Shows the selection checkboxes. Accepts a bare attribute. */
    selectable = input(true, ...(ngDevMode ? [{ debugName: "selectable", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The page on screen, from zero. */
    pageIndex = input(0, ...(ngDevMode ? [{ debugName: "pageIndex", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** How many documents a full page holds. */
    pageSize = input(50, ...(ngDevMode ? [{ debugName: "pageSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Every document across every page, or negative when the server did not count them. */
    totalSize = input(-1, ...(ngDevMode ? [{ debugName: "totalSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Whether the server has another page. */
    hasNextPage = input(false, ...(ngDevMode ? [{ debugName: "hasNextPage", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shows the loader in place of the rows. */
    loading = input(false, ...(ngDevMode ? [{ debugName: "loading", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The status of the request that failed, mapped with `nxsErrorStatus()`, or `null`. */
    error = input(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    /**
     * What failed, already translated — "The folder could not be loaded". Shown for a server error
     * only: a 401, 403 or 404 keeps its own heading, so a refusal never reads as a breakage.
     */
    errorHeading = input('', ...(ngDevMode ? [{ debugName: "errorHeading" }] : []));
    /** The empty state's heading, already translated. Blank says "Nothing here yet". */
    emptyHeading = input('', ...(ngDevMode ? [{ debugName: "emptyHeading" }] : []));
    /** An optional second line for the empty state, already translated. */
    emptyMessage = input('', ...(ngDevMode ? [{ debugName: "emptyMessage" }] : []));
    /** The level of the empty and error states' headings in the page outline. */
    stateHeadingLevel = input(2, ...(ngDevMode ? [{ debugName: "stateHeadingLevel" }] : []));
    /** Each row's menu entries, by document id. A row with none has no menu. */
    rowActions = input({}, ...(ngDevMode ? [{ debugName: "rowActions" }] : []));
    /** Accepts files dragged onto the list. Accepts a bare attribute. */
    dropEnabled = input(false, ...(ngDevMode ? [{ debugName: "dropEnabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** What the list says while files are dragged over it, already translated. */
    dropLabel = input('', ...(ngDevMode ? [{ debugName: "dropLabel" }] : []));
    /** The order asked for, or `null` when the user cleared it. The host fetches it. */
    sortChange = output();
    /** The page index asked for. The host fetches it. */
    pageChange = output();
    /** A row was opened: clicked, or Enter on it. */
    open = output();
    /** An entry of a row's menu was chosen. */
    rowAction = output();
    /** Files were dropped on the list. Only while `dropEnabled`. */
    filesDropped = output();
    /** Retry was pressed on a server error. */
    retry = output();
    tagId = NXS_PRIMITIVE_IDS.tag;
    avatarId = NXS_PRIMITIVE_IDS.avatar;
    hintId = `nxs-document-list-hint-${nextId$9++}`;
    selectColumn = SELECT_COLUMN;
    actionsColumn = ACTIONS_COLUMN;
    drop = new NxsFileDropTracker(() => this.dropEnabled());
    host = inject(ElementRef);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    direction = inject(Directionality, { optional: true });
    translations = toSignal(merge(this.translate.onLangChange, this.translate.onTranslationChange), { initialValue: null });
    /**
     * Each row's accessible name, for the row, its checkbox and its menu: its title, and, where
     * another document on the page has the same title, its place among them — so no two rows on a
     * page share a name. Titles that differ only in case or surrounding space read the same aloud,
     * so they count as the same.
     */
    accessibleNames = computed(() => {
        this.translations();
        const documents = this.documents();
        const same = (doc) => this.rowName(doc).toLocaleLowerCase();
        const counts = new Map();
        for (const doc of documents)
            counts.set(same(doc), (counts.get(same(doc)) ?? 0) + 1);
        const seen = new Map();
        const names = new Map();
        for (const doc of documents) {
            const name = this.rowName(doc);
            const count = counts.get(same(doc)) ?? 1;
            if (count === 1) {
                names.set(doc.uid, name);
                continue;
            }
            const index = (seen.get(same(doc)) ?? 0) + 1;
            seen.set(same(doc), index);
            names.set(doc.uid, this.translate.instant('satori-components.document-list.row-name-repeated', {
                name,
                index,
                count,
            }));
        }
        return names;
    }, ...(ngDevMode ? [{ debugName: "accessibleNames" }] : []));
    /** The row in the Tab sequence. */
    activeIndex = signal(0, ...(ngDevMode ? [{ debugName: "activeIndex" }] : []));
    /** Where a Shift selection extends from, and what was selected before it began. */
    anchor = 0;
    rangeBase = new Set();
    /** Whether Shift was held for the checkbox change that follows. */
    shiftHeld = false;
    selected = computed(() => new Set(this.selectedIds()), ...(ngDevMode ? [{ debugName: "selected" }] : []));
    sortableColumns = computed(() => this.columns().filter((c) => c.sortable), ...(ngDevMode ? [{ debugName: "sortableColumns" }] : []));
    plainColumns = computed(() => this.columns().filter((c) => !c.sortable), ...(ngDevMode ? [{ debugName: "plainColumns" }] : []));
    hasRowActions = computed(() => this.documents().some((doc) => this.actionsFor(doc).length > 0), ...(ngDevMode ? [{ debugName: "hasRowActions" }] : []));
    displayedColumns = computed(() => [
        ...(this.selectable() ? [SELECT_COLUMN] : []),
        ...this.columns().map((column) => column.key),
        ...(this.hasRowActions() ? [ACTIONS_COLUMN] : []),
    ], ...(ngDevMode ? [{ debugName: "displayedColumns" }] : []));
    pageIds = computed(() => this.documents().map((doc) => doc.uid), ...(ngDevMode ? [{ debugName: "pageIds" }] : []));
    allOnPageSelected = computed(() => {
        const ids = this.pageIds();
        const selected = this.selected();
        return ids.length > 0 && ids.every((id) => selected.has(id));
    }, ...(ngDevMode ? [{ debugName: "allOnPageSelected" }] : []));
    someOnPageSelected = computed(() => !this.allOnPageSelected() && this.pageIds().some((id) => this.selected().has(id)), ...(ngDevMode ? [{ debugName: "someOnPageSelected" }] : []));
    /** The header row counts as one. Unknown is `-1`, which ARIA reads as "not known". */
    rowCount = computed(() => {
        const total = this.totalSize();
        return total >= 0 ? total + 1 : -1;
    }, ...(ngDevMode ? [{ debugName: "rowCount" }] : []));
    matSortActive = computed(() => this.sort()?.key ?? '', ...(ngDevMode ? [{ debugName: "matSortActive" }] : []));
    matSortDirection = computed(() => this.sort()?.direction ?? '', ...(ngDevMode ? [{ debugName: "matSortDirection" }] : []));
    constructor() {
        // A new page starts at its first row, so the Tab stop is never left past the end of a shorter
        // one, and a Shift selection never extends from a row of the previous page.
        effect(() => {
            this.documents();
            untracked(() => {
                this.activeIndex.set(0);
                this.anchor = 0;
                this.rangeBase = new Set(this.selectedIds());
            });
        });
        // Every control inside a row leaves the Tab sequence, including the ones a resolved component
        // or a menu renders, so a page of fifty rows is one Tab stop, not a hundred and fifty. After
        // every render, because a component resolved by ID can arrive in a later one than its row.
        afterEveryRender({
            write: () => {
                for (const control of this.host.nativeElement.querySelectorAll(ROW_CONTROLS)) {
                    if (control.getAttribute('tabindex') !== '-1')
                        control.setAttribute('tabindex', '-1');
                }
            },
        });
    }
    actionsFor(doc) {
        const actions = this.rowActions();
        return actions[doc.uid] ?? [];
    }
    isSelected(doc) {
        return this.selected().has(doc.uid);
    }
    isFolder(doc) {
        return doc.type === 'Favorites' || isFolderishDocument(doc);
    }
    /** A container's rendition is only Nuxeo's generic icon, so it is not fetched; the type icon shows. */
    hasThumbnail(doc) {
        const type = doc.type?.trim().toLowerCase() ?? '';
        return type.length > 0 && !NON_CONTENT_DOCUMENT_TYPES.has(type);
    }
    icon(doc) {
        return docTypeIcon(doc.type);
    }
    rowName(doc) {
        return nxsVisibleText(doc.title) || doc.path || doc.uid;
    }
    accessibleName(doc) {
        return this.accessibleNames().get(doc.uid) ?? this.rowName(doc);
    }
    rowIndex(index) {
        return this.pageIndex() * this.pageSize() + index + 2;
    }
    contributor(doc) {
        return text(doc.properties?.['dc:lastContributor']);
    }
    /** Never empty: an empty string crashes Satori's avatar inside change detection. */
    initials(name) {
        return nxsVisibleText(name) || '?';
    }
    avatarColor(name) {
        return avatarColor(name);
    }
    /** The text of a column that is neither the title, the type, a date nor a person. */
    cellText(doc, key) {
        const properties = doc.properties ?? {};
        switch (key) {
            case 'author':
                return text(properties['dc:creator']);
            case 'state':
            case 'nature':
                return text(properties['dc:nature']);
            case 'coverage':
                return text(properties['dc:coverage']);
            case 'subjects':
                return text(properties['dc:subjects']);
            case 'version': {
                const major = properties['uid:major_version'];
                return major === undefined || major === null
                    ? ''
                    : `${major}.${properties['uid:minor_version'] ?? 0}`;
            }
            default:
                return key.includes(':') ? text(properties[key]) : '';
        }
    }
    createdDate(doc) {
        const value = doc.properties?.['dc:created'];
        return typeof value === 'string' && value ? value : null;
    }
    onSortChange(sort) {
        const next = sort.direction === 'asc' || sort.direction === 'desc'
            ? { key: sort.active, direction: sort.direction }
            : null;
        this.sortChange.emit(next);
        const column = this.columns().find((candidate) => candidate.key === sort.active)?.label ?? '';
        const key = !next
            ? 'satori-components.document-list.sort-cleared'
            : next.direction === 'asc'
                ? 'satori-components.document-list.sorted-ascending'
                : 'satori-components.document-list.sorted-descending';
        void this.announcer.announce(this.translate.instant(key, { column }), 'polite');
    }
    onPageChange(index) {
        this.pageChange.emit(index);
    }
    onRowAction(action, document) {
        this.rowAction.emit({ action, document });
    }
    onDrop(event) {
        const files = this.drop.drop(event);
        if (files.length > 0)
            this.filesDropped.emit(files);
    }
    /** Records Shift for the checkbox change it precedes, from the pointer or the keyboard. */
    noteModifiers(event) {
        this.shiftHeld = event.shiftKey;
    }
    onCheckboxChange(change, index) {
        const shift = this.shiftHeld;
        this.shiftHeld = false;
        this.activeIndex.set(index);
        if (shift)
            this.selectRange(index);
        else
            this.toggleAt(index);
        // The checkbox flips itself; put it back to what the selection says, which a range may not be.
        change.source.checked = this.selected().has(this.pageIds()[index]);
    }
    onSelectPage(change) {
        if (this.allOnPageSelected())
            this.deselectPage();
        else
            this.selectPage();
        change.source.checked = this.allOnPageSelected();
    }
    onRowClick(event, doc, index) {
        this.activeIndex.set(index);
        if (isInsideControl(event.target, event.currentTarget))
            return;
        if (this.selectable() && event.shiftKey) {
            this.selectRange(index);
            return;
        }
        if (this.selectable() && (event.ctrlKey || event.metaKey)) {
            this.toggleAt(index);
            return;
        }
        this.open.emit(doc);
    }
    onOpenClick(event, doc, index) {
        event.stopPropagation();
        this.activeIndex.set(index);
        this.open.emit(doc);
    }
    onRowFocusIn(index) {
        this.activeIndex.set(index);
    }
    onRowKeydown(event, doc, index) {
        const row = event.currentTarget;
        const onRow = event.target === row;
        const last = this.documents().length - 1;
        const { forward, backward } = this.inlineKeys();
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                const next = clamp(index + (event.key === 'ArrowDown' ? 1 : -1), 0, last);
                this.moveTo(next, event.shiftKey);
                return;
            }
            case 'Home':
            case 'End': {
                if (!onRow)
                    return;
                event.preventDefault();
                this.moveTo(event.key === 'Home' ? 0 : last, event.shiftKey);
                return;
            }
            case ' ':
                if (!onRow || !this.selectable())
                    return;
                event.preventDefault();
                if (event.shiftKey)
                    this.selectRange(index);
                else
                    this.toggleAt(index);
                return;
            case 'Enter':
                if (!onRow)
                    return;
                event.preventDefault();
                this.open.emit(doc);
                return;
            case 'a':
            case 'A':
                if (!onRow || !this.selectable() || !(event.ctrlKey || event.metaKey))
                    return;
                event.preventDefault();
                this.selectPage();
                return;
            case 'Escape':
                if (onRow)
                    return;
                event.preventDefault();
                row.focus();
                return;
        }
        if (event.key === forward || event.key === backward) {
            const controls = Array.from(row.querySelectorAll(FOCUSABLE)).filter((control) => !control.hasAttribute('disabled'));
            if (controls.length === 0)
                return;
            event.preventDefault();
            const at = onRow
                ? -1
                : controls.findIndex((control) => control.contains(event.target));
            const target = event.key === forward ? at + 1 : at - 1;
            if (target < 0)
                row.focus();
            else
                controls[Math.min(target, controls.length - 1)].focus();
        }
    }
    inlineKeys() {
        return this.direction?.value === 'rtl'
            ? { forward: 'ArrowLeft', backward: 'ArrowRight' }
            : { forward: 'ArrowRight', backward: 'ArrowLeft' };
    }
    moveTo(index, extend) {
        if (index < 0)
            return;
        this.activeIndex.set(index);
        if (extend && this.selectable())
            this.selectRange(index);
        this.focusRow(index);
    }
    focusRow(index) {
        this.host.nativeElement
            .querySelector(`tr.nxs-document-list__row[data-row="${index}"]`)
            ?.focus();
    }
    toggleAt(index) {
        const id = this.pageIds()[index];
        if (id === undefined)
            return;
        const next = new Set(this.selected());
        if (next.has(id))
            next.delete(id);
        else
            next.add(id);
        this.anchor = index;
        this.rangeBase = next;
        this.commit(next);
    }
    /** Everything selected before the range began, plus every row from the anchor to `index`. */
    selectRange(index) {
        const ids = this.pageIds();
        const [from, to] = this.anchor <= index ? [this.anchor, index] : [index, this.anchor];
        const next = new Set(this.rangeBase);
        for (const id of ids.slice(from, to + 1))
            next.add(id);
        this.commit(next);
    }
    selectPage() {
        const next = new Set(this.selected());
        for (const id of this.pageIds())
            next.add(id);
        this.rangeBase = next;
        this.commit(next);
    }
    deselectPage() {
        const next = new Set(this.selected());
        for (const id of this.pageIds())
            next.delete(id);
        this.rangeBase = next;
        this.commit(next);
    }
    /** Keeps the order ids were selected in, so the host's own list does not reshuffle. */
    commit(next) {
        const current = this.selectedIds();
        const kept = current.filter((id) => next.has(id));
        const added = [...next].filter((id) => !current.includes(id));
        this.selectedIds.set([...kept, ...added]);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentListComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDocumentListComponent, isStandalone: true, selector: "nxs-document-list", inputs: { documents: { classPropertyName: "documents", publicName: "documents", isSignal: true, isRequired: true, transformFunction: null }, columns: { classPropertyName: "columns", publicName: "columns", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, sort: { classPropertyName: "sort", publicName: "sort", isSignal: true, isRequired: false, transformFunction: null }, selectedIds: { classPropertyName: "selectedIds", publicName: "selectedIds", isSignal: true, isRequired: false, transformFunction: null }, selectable: { classPropertyName: "selectable", publicName: "selectable", isSignal: true, isRequired: false, transformFunction: null }, pageIndex: { classPropertyName: "pageIndex", publicName: "pageIndex", isSignal: true, isRequired: false, transformFunction: null }, pageSize: { classPropertyName: "pageSize", publicName: "pageSize", isSignal: true, isRequired: false, transformFunction: null }, totalSize: { classPropertyName: "totalSize", publicName: "totalSize", isSignal: true, isRequired: false, transformFunction: null }, hasNextPage: { classPropertyName: "hasNextPage", publicName: "hasNextPage", isSignal: true, isRequired: false, transformFunction: null }, loading: { classPropertyName: "loading", publicName: "loading", isSignal: true, isRequired: false, transformFunction: null }, error: { classPropertyName: "error", publicName: "error", isSignal: true, isRequired: false, transformFunction: null }, errorHeading: { classPropertyName: "errorHeading", publicName: "errorHeading", isSignal: true, isRequired: false, transformFunction: null }, emptyHeading: { classPropertyName: "emptyHeading", publicName: "emptyHeading", isSignal: true, isRequired: false, transformFunction: null }, emptyMessage: { classPropertyName: "emptyMessage", publicName: "emptyMessage", isSignal: true, isRequired: false, transformFunction: null }, stateHeadingLevel: { classPropertyName: "stateHeadingLevel", publicName: "stateHeadingLevel", isSignal: true, isRequired: false, transformFunction: null }, rowActions: { classPropertyName: "rowActions", publicName: "rowActions", isSignal: true, isRequired: false, transformFunction: null }, dropEnabled: { classPropertyName: "dropEnabled", publicName: "dropEnabled", isSignal: true, isRequired: false, transformFunction: null }, dropLabel: { classPropertyName: "dropLabel", publicName: "dropLabel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selectedIds: "selectedIdsChange", sortChange: "sortChange", pageChange: "pageChange", open: "open", rowAction: "rowAction", filesDropped: "filesDropped", retry: "retry" }, host: { listeners: { "dragenter": "drop.enter($event)", "dragover": "drop.overTarget($event)", "dragleave": "drop.leave($event)", "drop": "onDrop($event)" }, properties: { "class.nxs-document-list--drag-over": "drop.over()" }, classAttribute: "nxs-document-list" }, ngImport: i0, template: "@if (loading()) {\n  <div class=\"nxs-document-list__state\">\n    <nxs-spinner diameter=\"36\" [label]=\"'satori-components.document-list.loading' | translate\" />\n  </div>\n} @else if (error(); as status) {\n  <nxs-error-state\n    [status]=\"status\"\n    [heading]=\"status === 500 ? errorHeading() : ''\"\n    [headingLevel]=\"stateHeadingLevel()\"\n    retryable\n    (retry)=\"retry.emit()\"\n  />\n} @else if (documents().length === 0) {\n  <!-- An empty page past the first is not an empty folder: the pager says there is nothing more. -->\n  @if (pageIndex() === 0) {\n    <nxs-empty-state\n      icon=\"folder_open\"\n      [heading]=\"emptyHeading().trim() || ('satori-components.document-list.empty' | translate)\"\n      [message]=\"emptyMessage()\"\n      [headingLevel]=\"stateHeadingLevel()\"\n    />\n  }\n} @else {\n  <span class=\"cdk-visually-hidden\" [id]=\"hintId\">{{\n    (selectable()\n      ? 'satori-components.document-list.keyboard-hint'\n      : 'satori-components.document-list.keyboard-hint-no-selection'\n    ) | translate\n  }}</span>\n  <div class=\"nxs-document-list__scroller\">\n    <table\n      mat-table\n      class=\"nxs-document-list__table\"\n      [dataSource]=\"documents()\"\n      matSort\n      [matSortActive]=\"matSortActive()\"\n      [matSortDirection]=\"matSortDirection()\"\n      (matSortChange)=\"onSortChange($event)\"\n      [attr.aria-label]=\"label()\"\n      [attr.aria-rowcount]=\"rowCount()\"\n    >\n      <ng-container [matColumnDef]=\"selectColumn\">\n        <th mat-header-cell *matHeaderCellDef class=\"nxs-document-list__select\">\n          <span class=\"cdk-visually-hidden\">{{\n            'satori-components.document-list.selection' | translate\n          }}</span>\n          <mat-checkbox\n            [checked]=\"allOnPageSelected()\"\n            [indeterminate]=\"someOnPageSelected()\"\n            [aria-label]=\"'satori-components.document-list.select-page' | translate\"\n            (change)=\"onSelectPage($event)\"\n          />\n        </th>\n        <td mat-cell *matCellDef=\"let doc; let i = index\" class=\"nxs-document-list__select\">\n          <mat-checkbox\n            [checked]=\"isSelected(doc)\"\n            [tabIndex]=\"-1\"\n            [aria-label]=\"\n              'satori-components.document-list.select' | translate: { name: accessibleName(doc) }\n            \"\n            (mousedown)=\"noteModifiers($event)\"\n            (keydown)=\"noteModifiers($event)\"\n            (change)=\"onCheckboxChange($event, i)\"\n          />\n        </td>\n      </ng-container>\n\n      @for (column of sortableColumns(); track column.key) {\n        <ng-container [matColumnDef]=\"column.key\">\n          <th\n            mat-header-cell\n            *matHeaderCellDef\n            mat-sort-header\n            [sortActionDescription]=\"\n              'satori-components.document-list.sort-by' | translate: { column: column.label }\n            \"\n          >\n            {{ column.label }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc; let i = index\">\n            <ng-container\n              *ngTemplateOutlet=\"cell; context: { $implicit: doc, key: column.key, index: i }\"\n            />\n          </td>\n        </ng-container>\n      }\n\n      @for (column of plainColumns(); track column.key) {\n        <ng-container [matColumnDef]=\"column.key\">\n          <th mat-header-cell *matHeaderCellDef>{{ column.label }}</th>\n          <td mat-cell *matCellDef=\"let doc; let i = index\">\n            <ng-container\n              *ngTemplateOutlet=\"cell; context: { $implicit: doc, key: column.key, index: i }\"\n            />\n          </td>\n        </ng-container>\n      }\n\n      <ng-container [matColumnDef]=\"actionsColumn\">\n        <th mat-header-cell *matHeaderCellDef class=\"nxs-document-list__actions\">\n          <span class=\"cdk-visually-hidden\">{{\n            'satori-components.document-list.actions' | translate\n          }}</span>\n        </th>\n        <td mat-cell *matCellDef=\"let doc\" class=\"nxs-document-list__actions\">\n          @let entries = actionsFor(doc);\n          @if (entries.length > 0) {\n            <nxs-action-menu\n              [actions]=\"entries\"\n              [label]=\"\n                'satori-components.document-list.row-actions'\n                  | translate: { name: accessibleName(doc) }\n              \"\n              (selected)=\"onRowAction($event, doc)\"\n            />\n          }\n        </td>\n      </ng-container>\n\n      <tr mat-header-row *matHeaderRowDef=\"displayedColumns()\" aria-rowindex=\"1\"></tr>\n      <tr\n        mat-row\n        *matRowDef=\"let doc; columns: displayedColumns(); let i = index\"\n        class=\"nxs-document-list__row\"\n        [class.nxs-document-list__row--selected]=\"isSelected(doc)\"\n        [class.nxs-document-list__row--folder]=\"isFolder(doc)\"\n        [attr.data-row]=\"i\"\n        [attr.data-uid]=\"doc.uid\"\n        [attr.tabindex]=\"i === activeIndex() ? 0 : -1\"\n        [attr.aria-label]=\"accessibleName(doc)\"\n        [attr.aria-selected]=\"selectable() ? isSelected(doc) : null\"\n        [attr.aria-rowindex]=\"rowIndex(i)\"\n        [attr.aria-describedby]=\"hintId\"\n        (focusin)=\"onRowFocusIn(i)\"\n        (click)=\"onRowClick($event, doc, i)\"\n        (keydown)=\"onRowKeydown($event, doc, i)\"\n      ></tr>\n    </table>\n  </div>\n}\n\n@if (!error()) {\n  <nxs-pager\n    [pageIndex]=\"pageIndex()\"\n    [pageSize]=\"pageSize()\"\n    [itemCount]=\"documents().length\"\n    [totalSize]=\"totalSize()\"\n    [hasNextPage]=\"hasNextPage()\"\n    [disabled]=\"loading()\"\n    (pageChange)=\"onPageChange($event)\"\n  />\n}\n\n@if (drop.over()) {\n  <div class=\"nxs-document-list__drop\" aria-hidden=\"true\">\n    <span class=\"nxs-document-list__drop-label\">\n      {{ dropLabel().trim() || ('satori-components.document-list.drop' | translate) }}\n    </span>\n  </div>\n}\n\n<ng-template #cell let-doc let-key=\"key\" let-i=\"index\">\n  @switch (key) {\n    @case ('title') {\n      <span class=\"nxs-document-list__title\">\n        <ng-template #typeIcon>\n          <mat-icon\n            class=\"nxs-document-list__icon\"\n            [class.nxs-document-list__icon--folder]=\"isFolder(doc)\"\n            aria-hidden=\"true\"\n            >{{ icon(doc) }}</mat-icon\n          >\n        </ng-template>\n        @if (hasThumbnail(doc)) {\n          <nxs-thumbnail class=\"nxs-document-list__thumb\" [documentId]=\"doc.uid\">\n            <ng-container *ngTemplateOutlet=\"typeIcon\" />\n          </nxs-thumbnail>\n        } @else {\n          <ng-container *ngTemplateOutlet=\"typeIcon\" />\n        }\n        <button\n          type=\"button\"\n          class=\"nxs-document-list__open\"\n          tabindex=\"-1\"\n          [attr.title]=\"doc.path\"\n          (click)=\"onOpenClick($event, doc, i)\"\n        >\n          {{ rowName(doc) }}\n        </button>\n      </span>\n    }\n    @case ('type') {\n      @let typeLabel = doc.type | docTypeLabel;\n      <lib-extension-outlet\n        #tagOutlet\n        [componentId]=\"tagId\"\n        [componentInputs]=\"{ label: typeLabel, color: 'blue' }\"\n      />\n      @if (tagOutlet.unresolved()) {\n        <nxs-tag [label]=\"typeLabel\" color=\"blue\" />\n      }\n    }\n    @case ('modified') {\n      {{ doc.lastModified | date: 'mediumDate' }}\n    }\n    @case ('created') {\n      {{ createdDate(doc) | date: 'mediumDate' }}\n    }\n    @case ('lastContributor') {\n      @let person = contributor(doc);\n      <span class=\"nxs-document-list__person\">\n        <lib-extension-outlet\n          #avatarOutlet\n          [componentId]=\"avatarId\"\n          [componentInputs]=\"{ initials: initials(person), color: avatarColor(person), size: '24' }\"\n        />\n        @if (avatarOutlet.unresolved()) {\n          <nxs-avatar [initials]=\"initials(person)\" [color]=\"avatarColor(person)\" size=\"24\" />\n        }\n        <span>{{ person }}</span>\n      </span>\n    }\n    @default {\n      {{ cellText(doc, key) }}\n    }\n  }\n</ng-template>\n", styles: [":host{--nxs-document-list-folder-color: #ffa726;position:relative;display:flex;flex-direction:column;min-height:0;color:var(--mat-sys-on-surface)}.nxs-document-list__state{display:flex;justify-content:center;align-items:center;padding:40px 0}.nxs-document-list__scroller{flex:1;min-height:0;overflow:auto;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-document-list__table{width:100%}.nxs-document-list__table th.mat-mdc-header-cell{position:sticky;top:0;z-index:1;font:var(--mat-sys-label-large);color:var(--mat-sys-on-surface-variant);background:var(--mat-sys-surface-container-low);white-space:nowrap}.nxs-document-list__table td.mat-mdc-cell{font:var(--mat-sys-body-medium)}.nxs-document-list__select{width:48px;padding-inline:4px}.nxs-document-list__actions{width:48px;padding-inline:0;text-align:center}.nxs-document-list__row{cursor:pointer}.nxs-document-list__row:hover{background:var(--mat-sys-surface-container)}.nxs-document-list__row:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-list__row:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-list__row--selected,.nxs-document-list__row--selected:hover{background:var(--mat-sys-primary-container)}.nxs-document-list__title{display:flex;align-items:center;gap:8px;min-width:0}.nxs-document-list__thumb{width:24px;height:24px;flex-shrink:0;border-radius:3px;object-fit:cover}.nxs-document-list__icon{width:20px;height:20px;font-size:20px;flex-shrink:0;color:var(--mat-sys-on-surface-variant)}.nxs-document-list__icon--folder{color:var(--nxs-document-list-folder-color)}.nxs-document-list__open{overflow:hidden;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:start;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.nxs-document-list__open:focus{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-document-list__open:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-document-list__person{display:inline-flex;align-items:center;gap:6px}.nxs-document-list__drop{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;border:2px dashed var(--mat-sys-primary);border-radius:8px;background:color-mix(in srgb,var(--mat-sys-primary-container) 85%,transparent);pointer-events:none}.nxs-document-list__drop-label{font:var(--mat-sys-title-medium);color:var(--mat-sys-on-primary-container)}\n"], dependencies: [{ kind: "component", type: ExtensionOutletComponent, selector: "lib-extension-outlet", inputs: ["componentId", "componentType", "componentInputs"] }, { kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i2$1.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatSortModule }, { kind: "directive", type: i7.MatSort, selector: "[matSort]", inputs: ["matSortActive", "matSortStart", "matSortDirection", "matSortDisableClear", "matSortDisabled"], outputs: ["matSortChange"], exportAs: ["matSort"] }, { kind: "component", type: i7.MatSortHeader, selector: "[mat-sort-header]", inputs: ["mat-sort-header", "arrowPosition", "start", "disabled", "sortActionDescription", "disableClear"], exportAs: ["matSortHeader"] }, { kind: "ngmodule", type: MatTableModule }, { kind: "component", type: i8.MatTable, selector: "mat-table, table[mat-table]", exportAs: ["matTable"] }, { kind: "directive", type: i8.MatHeaderCellDef, selector: "[matHeaderCellDef]" }, { kind: "directive", type: i8.MatHeaderRowDef, selector: "[matHeaderRowDef]", inputs: ["matHeaderRowDef", "matHeaderRowDefSticky"] }, { kind: "directive", type: i8.MatColumnDef, selector: "[matColumnDef]", inputs: ["matColumnDef"] }, { kind: "directive", type: i8.MatCellDef, selector: "[matCellDef]" }, { kind: "directive", type: i8.MatRowDef, selector: "[matRowDef]", inputs: ["matRowDefColumns", "matRowDefWhen"] }, { kind: "directive", type: i8.MatHeaderCell, selector: "mat-header-cell, th[mat-header-cell]" }, { kind: "directive", type: i8.MatCell, selector: "mat-cell, td[mat-cell]" }, { kind: "component", type: i8.MatHeaderRow, selector: "mat-header-row, tr[mat-header-row]", exportAs: ["matHeaderRow"] }, { kind: "component", type: i8.MatRow, selector: "mat-row, tr[mat-row]", exportAs: ["matRow"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NxsActionMenuComponent, selector: "nxs-action-menu", inputs: ["actions", "label", "icon"], outputs: ["selected"] }, { kind: "component", type: NxsAvatarComponent, selector: "nxs-avatar", inputs: ["initials", "color", "size", "label"] }, { kind: "component", type: NxsEmptyStateComponent, selector: "nxs-empty-state", inputs: ["heading", "headingLevel", "message", "icon"] }, { kind: "component", type: NxsErrorStateComponent, selector: "nxs-error-state", inputs: ["status", "heading", "headingLevel", "retryable", "retryHandler"], outputs: ["retry"] }, { kind: "component", type: NxsPagerComponent, selector: "nxs-pager", inputs: ["pageIndex", "pageSize", "itemCount", "totalSize", "hasNextPage", "disabled", "label"], outputs: ["pageChange"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "component", type: NxsTagComponent, selector: "nxs-tag", inputs: ["label", "color"] }, { kind: "component", type: NxsThumbnailComponent, selector: "nxs-thumbnail", inputs: ["documentId", "alt"] }, { kind: "pipe", type: DatePipe, name: "date" }, { kind: "pipe", type: DocTypeLabelPipe, name: "docTypeLabel" }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentListComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-document-list', standalone: true, imports: [
                        DatePipe,
                        DocTypeLabelPipe,
                        ExtensionOutletComponent,
                        MatCheckboxModule,
                        MatIconModule,
                        MatSortModule,
                        MatTableModule,
                        NgTemplateOutlet,
                        NxsActionMenuComponent,
                        NxsAvatarComponent,
                        NxsEmptyStateComponent,
                        NxsErrorStateComponent,
                        NxsPagerComponent,
                        NxsSpinnerComponent,
                        NxsTagComponent,
                        NxsThumbnailComponent,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-document-list',
                        '[class.nxs-document-list--drag-over]': 'drop.over()',
                        '(dragenter)': 'drop.enter($event)',
                        '(dragover)': 'drop.overTarget($event)',
                        '(dragleave)': 'drop.leave($event)',
                        '(drop)': 'onDrop($event)',
                    }, template: "@if (loading()) {\n  <div class=\"nxs-document-list__state\">\n    <nxs-spinner diameter=\"36\" [label]=\"'satori-components.document-list.loading' | translate\" />\n  </div>\n} @else if (error(); as status) {\n  <nxs-error-state\n    [status]=\"status\"\n    [heading]=\"status === 500 ? errorHeading() : ''\"\n    [headingLevel]=\"stateHeadingLevel()\"\n    retryable\n    (retry)=\"retry.emit()\"\n  />\n} @else if (documents().length === 0) {\n  <!-- An empty page past the first is not an empty folder: the pager says there is nothing more. -->\n  @if (pageIndex() === 0) {\n    <nxs-empty-state\n      icon=\"folder_open\"\n      [heading]=\"emptyHeading().trim() || ('satori-components.document-list.empty' | translate)\"\n      [message]=\"emptyMessage()\"\n      [headingLevel]=\"stateHeadingLevel()\"\n    />\n  }\n} @else {\n  <span class=\"cdk-visually-hidden\" [id]=\"hintId\">{{\n    (selectable()\n      ? 'satori-components.document-list.keyboard-hint'\n      : 'satori-components.document-list.keyboard-hint-no-selection'\n    ) | translate\n  }}</span>\n  <div class=\"nxs-document-list__scroller\">\n    <table\n      mat-table\n      class=\"nxs-document-list__table\"\n      [dataSource]=\"documents()\"\n      matSort\n      [matSortActive]=\"matSortActive()\"\n      [matSortDirection]=\"matSortDirection()\"\n      (matSortChange)=\"onSortChange($event)\"\n      [attr.aria-label]=\"label()\"\n      [attr.aria-rowcount]=\"rowCount()\"\n    >\n      <ng-container [matColumnDef]=\"selectColumn\">\n        <th mat-header-cell *matHeaderCellDef class=\"nxs-document-list__select\">\n          <span class=\"cdk-visually-hidden\">{{\n            'satori-components.document-list.selection' | translate\n          }}</span>\n          <mat-checkbox\n            [checked]=\"allOnPageSelected()\"\n            [indeterminate]=\"someOnPageSelected()\"\n            [aria-label]=\"'satori-components.document-list.select-page' | translate\"\n            (change)=\"onSelectPage($event)\"\n          />\n        </th>\n        <td mat-cell *matCellDef=\"let doc; let i = index\" class=\"nxs-document-list__select\">\n          <mat-checkbox\n            [checked]=\"isSelected(doc)\"\n            [tabIndex]=\"-1\"\n            [aria-label]=\"\n              'satori-components.document-list.select' | translate: { name: accessibleName(doc) }\n            \"\n            (mousedown)=\"noteModifiers($event)\"\n            (keydown)=\"noteModifiers($event)\"\n            (change)=\"onCheckboxChange($event, i)\"\n          />\n        </td>\n      </ng-container>\n\n      @for (column of sortableColumns(); track column.key) {\n        <ng-container [matColumnDef]=\"column.key\">\n          <th\n            mat-header-cell\n            *matHeaderCellDef\n            mat-sort-header\n            [sortActionDescription]=\"\n              'satori-components.document-list.sort-by' | translate: { column: column.label }\n            \"\n          >\n            {{ column.label }}\n          </th>\n          <td mat-cell *matCellDef=\"let doc; let i = index\">\n            <ng-container\n              *ngTemplateOutlet=\"cell; context: { $implicit: doc, key: column.key, index: i }\"\n            />\n          </td>\n        </ng-container>\n      }\n\n      @for (column of plainColumns(); track column.key) {\n        <ng-container [matColumnDef]=\"column.key\">\n          <th mat-header-cell *matHeaderCellDef>{{ column.label }}</th>\n          <td mat-cell *matCellDef=\"let doc; let i = index\">\n            <ng-container\n              *ngTemplateOutlet=\"cell; context: { $implicit: doc, key: column.key, index: i }\"\n            />\n          </td>\n        </ng-container>\n      }\n\n      <ng-container [matColumnDef]=\"actionsColumn\">\n        <th mat-header-cell *matHeaderCellDef class=\"nxs-document-list__actions\">\n          <span class=\"cdk-visually-hidden\">{{\n            'satori-components.document-list.actions' | translate\n          }}</span>\n        </th>\n        <td mat-cell *matCellDef=\"let doc\" class=\"nxs-document-list__actions\">\n          @let entries = actionsFor(doc);\n          @if (entries.length > 0) {\n            <nxs-action-menu\n              [actions]=\"entries\"\n              [label]=\"\n                'satori-components.document-list.row-actions'\n                  | translate: { name: accessibleName(doc) }\n              \"\n              (selected)=\"onRowAction($event, doc)\"\n            />\n          }\n        </td>\n      </ng-container>\n\n      <tr mat-header-row *matHeaderRowDef=\"displayedColumns()\" aria-rowindex=\"1\"></tr>\n      <tr\n        mat-row\n        *matRowDef=\"let doc; columns: displayedColumns(); let i = index\"\n        class=\"nxs-document-list__row\"\n        [class.nxs-document-list__row--selected]=\"isSelected(doc)\"\n        [class.nxs-document-list__row--folder]=\"isFolder(doc)\"\n        [attr.data-row]=\"i\"\n        [attr.data-uid]=\"doc.uid\"\n        [attr.tabindex]=\"i === activeIndex() ? 0 : -1\"\n        [attr.aria-label]=\"accessibleName(doc)\"\n        [attr.aria-selected]=\"selectable() ? isSelected(doc) : null\"\n        [attr.aria-rowindex]=\"rowIndex(i)\"\n        [attr.aria-describedby]=\"hintId\"\n        (focusin)=\"onRowFocusIn(i)\"\n        (click)=\"onRowClick($event, doc, i)\"\n        (keydown)=\"onRowKeydown($event, doc, i)\"\n      ></tr>\n    </table>\n  </div>\n}\n\n@if (!error()) {\n  <nxs-pager\n    [pageIndex]=\"pageIndex()\"\n    [pageSize]=\"pageSize()\"\n    [itemCount]=\"documents().length\"\n    [totalSize]=\"totalSize()\"\n    [hasNextPage]=\"hasNextPage()\"\n    [disabled]=\"loading()\"\n    (pageChange)=\"onPageChange($event)\"\n  />\n}\n\n@if (drop.over()) {\n  <div class=\"nxs-document-list__drop\" aria-hidden=\"true\">\n    <span class=\"nxs-document-list__drop-label\">\n      {{ dropLabel().trim() || ('satori-components.document-list.drop' | translate) }}\n    </span>\n  </div>\n}\n\n<ng-template #cell let-doc let-key=\"key\" let-i=\"index\">\n  @switch (key) {\n    @case ('title') {\n      <span class=\"nxs-document-list__title\">\n        <ng-template #typeIcon>\n          <mat-icon\n            class=\"nxs-document-list__icon\"\n            [class.nxs-document-list__icon--folder]=\"isFolder(doc)\"\n            aria-hidden=\"true\"\n            >{{ icon(doc) }}</mat-icon\n          >\n        </ng-template>\n        @if (hasThumbnail(doc)) {\n          <nxs-thumbnail class=\"nxs-document-list__thumb\" [documentId]=\"doc.uid\">\n            <ng-container *ngTemplateOutlet=\"typeIcon\" />\n          </nxs-thumbnail>\n        } @else {\n          <ng-container *ngTemplateOutlet=\"typeIcon\" />\n        }\n        <button\n          type=\"button\"\n          class=\"nxs-document-list__open\"\n          tabindex=\"-1\"\n          [attr.title]=\"doc.path\"\n          (click)=\"onOpenClick($event, doc, i)\"\n        >\n          {{ rowName(doc) }}\n        </button>\n      </span>\n    }\n    @case ('type') {\n      @let typeLabel = doc.type | docTypeLabel;\n      <lib-extension-outlet\n        #tagOutlet\n        [componentId]=\"tagId\"\n        [componentInputs]=\"{ label: typeLabel, color: 'blue' }\"\n      />\n      @if (tagOutlet.unresolved()) {\n        <nxs-tag [label]=\"typeLabel\" color=\"blue\" />\n      }\n    }\n    @case ('modified') {\n      {{ doc.lastModified | date: 'mediumDate' }}\n    }\n    @case ('created') {\n      {{ createdDate(doc) | date: 'mediumDate' }}\n    }\n    @case ('lastContributor') {\n      @let person = contributor(doc);\n      <span class=\"nxs-document-list__person\">\n        <lib-extension-outlet\n          #avatarOutlet\n          [componentId]=\"avatarId\"\n          [componentInputs]=\"{ initials: initials(person), color: avatarColor(person), size: '24' }\"\n        />\n        @if (avatarOutlet.unresolved()) {\n          <nxs-avatar [initials]=\"initials(person)\" [color]=\"avatarColor(person)\" size=\"24\" />\n        }\n        <span>{{ person }}</span>\n      </span>\n    }\n    @default {\n      {{ cellText(doc, key) }}\n    }\n  }\n</ng-template>\n", styles: [":host{--nxs-document-list-folder-color: #ffa726;position:relative;display:flex;flex-direction:column;min-height:0;color:var(--mat-sys-on-surface)}.nxs-document-list__state{display:flex;justify-content:center;align-items:center;padding:40px 0}.nxs-document-list__scroller{flex:1;min-height:0;overflow:auto;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-document-list__table{width:100%}.nxs-document-list__table th.mat-mdc-header-cell{position:sticky;top:0;z-index:1;font:var(--mat-sys-label-large);color:var(--mat-sys-on-surface-variant);background:var(--mat-sys-surface-container-low);white-space:nowrap}.nxs-document-list__table td.mat-mdc-cell{font:var(--mat-sys-body-medium)}.nxs-document-list__select{width:48px;padding-inline:4px}.nxs-document-list__actions{width:48px;padding-inline:0;text-align:center}.nxs-document-list__row{cursor:pointer}.nxs-document-list__row:hover{background:var(--mat-sys-surface-container)}.nxs-document-list__row:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-list__row:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-list__row--selected,.nxs-document-list__row--selected:hover{background:var(--mat-sys-primary-container)}.nxs-document-list__title{display:flex;align-items:center;gap:8px;min-width:0}.nxs-document-list__thumb{width:24px;height:24px;flex-shrink:0;border-radius:3px;object-fit:cover}.nxs-document-list__icon{width:20px;height:20px;font-size:20px;flex-shrink:0;color:var(--mat-sys-on-surface-variant)}.nxs-document-list__icon--folder{color:var(--nxs-document-list-folder-color)}.nxs-document-list__open{overflow:hidden;padding:0;border:0;background:none;font:inherit;color:inherit;text-align:start;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.nxs-document-list__open:focus{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-document-list__open:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-document-list__person{display:inline-flex;align-items:center;gap:6px}.nxs-document-list__drop{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;border:2px dashed var(--mat-sys-primary);border-radius:8px;background:color-mix(in srgb,var(--mat-sys-primary-container) 85%,transparent);pointer-events:none}.nxs-document-list__drop-label{font:var(--mat-sys-title-medium);color:var(--mat-sys-on-primary-container)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { documents: [{ type: i0.Input, args: [{ isSignal: true, alias: "documents", required: true }] }], columns: [{ type: i0.Input, args: [{ isSignal: true, alias: "columns", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], sort: [{ type: i0.Input, args: [{ isSignal: true, alias: "sort", required: false }] }], selectedIds: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedIds", required: false }] }, { type: i0.Output, args: ["selectedIdsChange"] }], selectable: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectable", required: false }] }], pageIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageIndex", required: false }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], totalSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "totalSize", required: false }] }], hasNextPage: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasNextPage", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], error: [{ type: i0.Input, args: [{ isSignal: true, alias: "error", required: false }] }], errorHeading: [{ type: i0.Input, args: [{ isSignal: true, alias: "errorHeading", required: false }] }], emptyHeading: [{ type: i0.Input, args: [{ isSignal: true, alias: "emptyHeading", required: false }] }], emptyMessage: [{ type: i0.Input, args: [{ isSignal: true, alias: "emptyMessage", required: false }] }], stateHeadingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "stateHeadingLevel", required: false }] }], rowActions: [{ type: i0.Input, args: [{ isSignal: true, alias: "rowActions", required: false }] }], dropEnabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "dropEnabled", required: false }] }], dropLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "dropLabel", required: false }] }], sortChange: [{ type: i0.Output, args: ["sortChange"] }], pageChange: [{ type: i0.Output, args: ["pageChange"] }], open: [{ type: i0.Output, args: ["open"] }], rowAction: [{ type: i0.Output, args: ["rowAction"] }], filesDropped: [{ type: i0.Output, args: ["filesDropped"] }], retry: [{ type: i0.Output, args: ["retry"] }] } });
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
/** A cell value as text: a list joined, anything not a string or a number left blank. */
function text(value) {
    if (typeof value === 'string')
        return value;
    if (typeof value === 'number')
        return String(value);
    if (Array.isArray(value)) {
        return value.filter((item) => typeof item === 'string' || typeof item === 'number').join(', ');
    }
    return '';
}
/** Whether a click landed on a control inside the row, which handles it itself. */
function isInsideControl(target, row) {
    if (!(target instanceof Element) || !(row instanceof Element))
        return false;
    const control = target.closest('a, button, input, label, mat-checkbox, [role="menuitem"]');
    return control !== null && row.contains(control);
}

/** Web UI's selectivity waits 300 ms after the last key before it asks the server. */
const NXS_SEARCH_DEBOUNCE_MS = 300;
/**
 * A search that follows what the user types: `short` below `minChars`, `searching` at once, and the
 * server asked once the user has paused for `NXS_SEARCH_DEBOUNCE_MS`. A newer term cancels an older
 * request, so a late answer never replaces the results for what is typed now, and a failed request
 * is a state rather than an error, so the field keeps working. Call it in an injection context; the
 * subscription ends with the component.
 */
function nxsSearchAsYouType(search, minChars) {
    const idle = { status: 'idle', term: '', results: [] };
    const state = signal(idle, ...(ngDevMode ? [{ debugName: "state" }] : []));
    const terms = new Subject();
    terms
        .pipe(switchMap((text) => {
        const term = (text ?? '').trim();
        if (!term)
            return of(idle);
        if (term.length < Math.max(1, minChars()))
            return of({ status: 'short', term, results: [] });
        return concat(of({ status: 'searching', term, results: [] }), timer(NXS_SEARCH_DEBOUNCE_MS).pipe(switchMap(() => defer(() => search(term))), map((results) => ({
            status: results.length ? 'found' : 'none',
            term,
            results,
        })), catchError(() => of({ status: 'failed', term, results: [] }))));
    }), takeUntilDestroyed(inject(DestroyRef)))
        .subscribe((next) => state.set(next));
    return {
        state: state.asReadonly(),
        query: (text) => terms.next(text),
        reset: () => terms.next(null),
    };
}

/** Web UI's document suggestion: three characters, twenty results. */
const WEB_UI_MIN_CHARS$2 = 3;
const WEB_UI_PAGE_SIZE = 20;
/**
 * The query Web UI's `default_document_suggestion` page provider runs, for `term`: a full-text
 * prefix match on documents that are not hidden, not versions and not in the trash — optionally of
 * the given types. Every value is escaped, so a term or a type is text in the query, never NXQL.
 */
function nxsDocumentSuggestionQuery(term, types = []) {
    let query = `SELECT * FROM Document WHERE ecm:fulltext LIKE '${escapeNxqlLiteral(term)}*'` +
        " AND ecm:mixinType != 'HiddenInNavigation' AND ecm:isVersion = 0 AND ecm:isTrashed = 0";
    const named = types.map((type) => type.trim()).filter(Boolean);
    if (named.length) {
        query += ` AND ecm:primaryType IN (${named.map((type) => `'${escapeNxqlLiteral(type)}'`).join(', ')})`;
    }
    return query;
}
/** The query that finds the one document a stored uid or path names. Escaped, as above. */
function lookupQuery(id, idProperty) {
    const field = idProperty === 'path' ? 'ecm:path' : 'ecm:uuid';
    return `SELECT * FROM Document WHERE ${field} = '${escapeNxqlLiteral(id)}'`;
}
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
class NxsDocumentReferenceInputComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Offer only documents of these types, such as `['File', 'Note']`. Every type when empty. */
    documentTypes = input([], ...(ngDevMode ? [{ debugName: "documentTypes" }] : []));
    /** What the value holds, as Web UI's `idProperty`: the document's uid (the default) or its path. */
    idProperty = input('uid', ...(ngDevMode ? [{ debugName: "idProperty" }] : []));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The uid (or path) of the document chosen, or `null`. Two-way; a form control carries it too. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The document the user chose, or `null` when the choice was cleared. */
    documentChange = output();
    minChars = WEB_UI_MIN_CHARS$2;
    api = inject(NuxeoApiBase);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    input = viewChild.required(MatInput);
    control = new NxsPickerControl();
    lookups = new Subject();
    /** The value the field last set itself, so its own changes are not mistaken for a host's. */
    committed = null;
    /** The document the value names, once known: chosen here, or looked up from a stored uid. */
    document = signal(null, ...(ngDevMode ? [{ debugName: "document" }] : []));
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    finder = nxsSearchAsYouType((term) => this.find(term), () => WEB_UI_MIN_CHARS$2);
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    unmatched = computed(() => !this.value() && this.text().trim() !== '', ...(ngDevMode ? [{ debugName: "unmatched" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.unmatched() || this.missing() || this.control.formInvalid()),
    };
    displayWith = (document) => typeof document === 'string' ? document : (document?.title ?? '');
    constructor() {
        this.lookups
            .pipe(switchMap((id) => this.api.nxqlSearch(lookupQuery(id, this.idProperty()), 1).pipe(map((list) => ({ id, found: list.entries?.[0] ? toReference(list.entries[0]) : null })), catchError(() => of({ id, found: null })))), takeUntilDestroyed())
            .subscribe(({ id, found }) => {
            if (this.value() !== id || !found)
                return;
            this.document.set(found);
            this.text.set(found.title);
        });
        // A value set from outside is shown by its id at once, then by its title once looked up.
        effect(() => {
            const value = this.value();
            untracked(() => {
                if (value === this.committed)
                    return;
                this.committed = value;
                this.document.set(null);
                this.text.set(value ?? '');
                if (value)
                    this.lookups.next(value);
            });
        });
        effect(() => {
            const { status, results } = this.finder.state();
            untracked(() => {
                const key = status === 'found'
                    ? results.length === 1
                        ? 'satori-components.pickers.results-one'
                        : 'satori-components.pickers.results-many'
                    : status === 'none'
                        ? 'satori-components.pickers.no-results'
                        : status === 'failed'
                            ? 'satori-components.pickers.failed'
                            : null;
                if (key) {
                    void this.announcer.announce(this.translate.instant(key, { count: results.length }), 'polite');
                }
            });
        });
        effect(() => {
            this.unmatched();
            untracked(() => this.control.revalidate());
        });
    }
    /** `MatInput` recomputes its error state only with a form control of its own. */
    ngDoCheck() {
        this.input().updateErrorState();
    }
    writeValue(value) {
        this.value.set(value || null);
    }
    registerOnChange(fn) {
        this.control.registerOnChange(fn);
    }
    registerOnTouched(fn) {
        this.control.registerOnTouched(fn);
    }
    setDisabledState(disabled) {
        this.control.setDisabledState(disabled);
    }
    validate(control) {
        return this.control.validate(control, this.unmatched() ? { nxsChooseFromList: true } : null);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    missing() {
        return this.control.missing(this.required(), this.value() === null);
    }
    onInput(event) {
        const typed = event.target.value;
        const shown = this.document()?.title ?? this.value();
        this.text.set(typed);
        if (this.value() && typed !== shown)
            this.choose(null);
        this.finder.query(typed);
    }
    choose(document) {
        const id = document ? (this.idProperty() === 'path' ? document.path : document.uid) : null;
        this.committed = id;
        this.value.set(id);
        this.document.set(document);
        if (document) {
            this.text.set(document.title);
            this.finder.reset();
        }
        this.control.changed(id);
        this.documentChange.emit(document);
    }
    clear() {
        this.text.set('');
        this.finder.reset();
        this.choose(null);
    }
    blurred() {
        this.control.blurred();
    }
    find(term) {
        return this.api
            .nxqlSearch(nxsDocumentSuggestionQuery(term, this.documentTypes()), WEB_UI_PAGE_SIZE)
            .pipe(map((list) => (list.entries ?? []).map(toReference)));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentReferenceInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDocumentReferenceInputComponent, isStandalone: true, selector: "nxs-document-reference-input", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, documentTypes: { classPropertyName: "documentTypes", publicName: "documentTypes", isSignal: true, isRequired: false, transformFunction: null }, idProperty: { classPropertyName: "idProperty", publicName: "idProperty", isSignal: true, isRequired: false, transformFunction: null }, hint: { classPropertyName: "hint", publicName: "hint", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange", documentChange: "documentChange" }, host: { classAttribute: "nxs-document-reference-input" }, providers: nxsPickerProviders(() => NxsDocumentReferenceInputComponent), viewQueries: [{ propertyName: "input", first: true, predicate: MatInput, descendants: true, isSignal: true }], ngImport: i0, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    type=\"text\"\n    autocomplete=\"off\"\n    [matAutocomplete]=\"auto\"\n    [value]=\"text()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"onInput($event)\"\n    (blur)=\"blurred()\"\n  />\n  @if (value() && !isDisabled()) {\n    <button\n      matIconSuffix\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-picker__clear\"\n      [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n      (click)=\"clear()\"\n    >\n      <mat-icon aria-hidden=\"true\">close</mat-icon>\n    </button>\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (finder.state().status === 'short') {\n    <mat-hint>{{\n      'satori-components.pickers.min-chars-many' | translate: { count: minChars }\n    }}</mat-hint>\n  } @else if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete\n    #auto=\"matAutocomplete\"\n    [displayWith]=\"displayWith\"\n    (optionSelected)=\"choose($event.option.value)\"\n  >\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.no-results' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('found') {\n        @for (document of finder.state().results; track document.uid) {\n          <mat-option [value]=\"document\" [attr.data-uid]=\"document.uid\">\n            <nxs-doc-type-icon class=\"nxs-document-reference-input__icon\" [type]=\"document.type\" />\n            <span class=\"nxs-picker__option\">\n              <span class=\"nxs-picker__option-label\">{{ document.title }}</span\n              >&ngsp;\n              <span class=\"nxs-picker__option-detail\">{{ document.path }}</span>\n            </span>\n          </mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}.nxs-document-reference-input__icon{margin-inline-end:12px}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "component", type: NxsDocTypeIconComponent, selector: "nxs-doc-type-icon", inputs: ["type", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentReferenceInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-document-reference-input', standalone: true, imports: [
                        MatAutocompleteModule,
                        MatButtonModule,
                        MatIconModule,
                        MatInputModule,
                        NxsDocTypeIconComponent,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsDocumentReferenceInputComponent), host: { class: 'nxs-document-reference-input' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    type=\"text\"\n    autocomplete=\"off\"\n    [matAutocomplete]=\"auto\"\n    [value]=\"text()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"onInput($event)\"\n    (blur)=\"blurred()\"\n  />\n  @if (value() && !isDisabled()) {\n    <button\n      matIconSuffix\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-picker__clear\"\n      [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n      (click)=\"clear()\"\n    >\n      <mat-icon aria-hidden=\"true\">close</mat-icon>\n    </button>\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (finder.state().status === 'short') {\n    <mat-hint>{{\n      'satori-components.pickers.min-chars-many' | translate: { count: minChars }\n    }}</mat-hint>\n  } @else if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete\n    #auto=\"matAutocomplete\"\n    [displayWith]=\"displayWith\"\n    (optionSelected)=\"choose($event.option.value)\"\n  >\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.no-results' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('found') {\n        @for (document of finder.state().results; track document.uid) {\n          <mat-option [value]=\"document\" [attr.data-uid]=\"document.uid\">\n            <nxs-doc-type-icon class=\"nxs-document-reference-input__icon\" [type]=\"document.type\" />\n            <span class=\"nxs-picker__option\">\n              <span class=\"nxs-picker__option-label\">{{ document.title }}</span\n              >&ngsp;\n              <span class=\"nxs-picker__option-detail\">{{ document.path }}</span>\n            </span>\n          </mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}.nxs-document-reference-input__icon{margin-inline-end:12px}\n"] }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], documentTypes: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentTypes", required: false }] }], idProperty: [{ type: i0.Input, args: [{ isSignal: true, alias: "idProperty", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], documentChange: [{ type: i0.Output, args: ["documentChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }] } });
function toReference(document) {
    return {
        uid: document.uid,
        title: document.title?.trim() || document.uid,
        type: document.type,
        path: document.path,
    };
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
class NxsDocumentTreeComponent {
    /** The Nuxeo path of the folder on screen: the tree expands down to it and marks it. */
    currentPath = input('/', ...(ngDevMode ? [{ debugName: "currentPath" }] : []));
    /** The tree's accessible name, already translated, such as "Folders". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** A folder was chosen. The repository root arrives as a document whose path is `/`. */
    navigate = output();
    browse = inject(BrowseService);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    host = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    direction = inject(Directionality, { optional: true });
    status = signal('loading', ...(ngDevMode ? [{ debugName: "status" }] : []));
    loadError = signal(500, ...(ngDevMode ? [{ debugName: "loadError" }] : []));
    /** The row in the Tab sequence, by key; the current folder's until the user moves. */
    focusKey = signal(null, ...(ngDevMode ? [{ debugName: "focusKey" }] : []));
    revision = signal(0, ...(ngDevMode ? [{ debugName: "revision" }] : []));
    root = null;
    loadGeneration = 0;
    syncGeneration = 0;
    /** At the repository root, the root with its domains; inside a domain, that domain's branch. */
    topNodes = computed(() => {
        this.revision();
        const root = this.root;
        if (!root)
            return [];
        const path = normalizeNuxeoPath(this.currentPath());
        if (isRepositoryRootPath(path))
            return [root];
        const domainPath = topLevelNuxeoFolderPath(path);
        const domain = domainPath ? nodeAt(root.children, domainPath) : undefined;
        return domain ? [domain] : [root];
    }, ...(ngDevMode ? [{ debugName: "topNodes" }] : []));
    showRootBack = computed(() => this.status() === 'ready' && this.topNodes()[0]?.root === false, ...(ngDevMode ? [{ debugName: "showRootBack" }] : []));
    /** Every visible row, in reading order, which is what the arrow keys walk. */
    rows = computed(() => {
        const rows = [];
        const walk = (nodes, level) => {
            nodes.forEach((node, index) => {
                rows.push({
                    kind: 'node',
                    key: node.key,
                    node,
                    level,
                    setSize: nodes.length,
                    position: index + 1,
                });
                if (!node.expanded)
                    return;
                if (node.error) {
                    rows.push({
                        kind: 'error',
                        key: `${node.key}#error`,
                        node,
                        level: level + 1,
                        setSize: 1,
                        position: 1,
                    });
                }
                else {
                    walk(node.children, level + 1);
                }
            });
        };
        walk(this.topNodes(), 1);
        return rows;
    }, ...(ngDevMode ? [{ debugName: "rows" }] : []));
    /** The deepest visible folder on the current path: the folder itself, or its nearest shown ancestor. */
    currentKey = computed(() => {
        this.revision();
        const path = normalizeNuxeoPath(this.currentPath());
        const target = nuxeoPathSegments(path);
        let best = null;
        // Deeper wins; at the same depth a folder whose path matches exactly wins over one that
        // matches only ignoring case and spacing, so of `Folder` and `folder` the right one is marked.
        let bestRank = -1;
        for (const row of this.rows()) {
            if (row.kind !== 'node')
                continue;
            const node = row.node;
            if (node.root) {
                if (bestRank < 0) {
                    best = node;
                    bestRank = 0;
                }
                continue;
            }
            const own = normalizeNuxeoPath(node.doc.path ?? '');
            const segments = nuxeoPathSegments(own);
            const onPath = segments.length <= target.length && segments.every((segment, i) => segment === target[i]);
            if (!onPath)
                continue;
            const exact = path === own || path.startsWith(`${own}/`);
            const rank = segments.length * 2 + (exact ? 1 : 0);
            if (rank > bestRank) {
                best = node;
                bestRank = rank;
            }
        }
        return best?.key ?? null;
    }, ...(ngDevMode ? [{ debugName: "currentKey" }] : []));
    rowsByKey = computed(() => new Map(this.rows().map((row) => [row.key, row])), ...(ngDevMode ? [{ debugName: "rowsByKey" }] : []));
    rowFor(key) {
        return this.rowsByKey().get(key);
    }
    tabStop = computed(() => {
        const keys = new Set(this.rows().map((row) => row.key));
        const focus = this.focusKey();
        if (focus && keys.has(focus))
            return focus;
        return this.currentKey() ?? this.rows()[0]?.key ?? null;
    }, ...(ngDevMode ? [{ debugName: "tabStop" }] : []));
    constructor() {
        this.load();
        effect(() => {
            const path = this.currentPath();
            untracked(() => this.syncTo(path));
        });
    }
    /** Reads the tree again from the repository, as after a folder is created, moved or deleted. */
    reload() {
        this.root = null;
        this.focusKey.set(null);
        this.bump();
        this.load();
    }
    nodeLabel(node) {
        return node.root
            ? this.translate.instant('satori-components.document-tree.root')
            : node.doc.title;
    }
    /** A click on a row's arrow expands or collapses it; anywhere else on the row opens it. */
    onItemClick(event, row) {
        event.stopPropagation();
        this.focusKey.set(row.key);
        if (row.kind === 'error') {
            this.retry(row.node);
            return;
        }
        const onArrow = event.target?.closest('.nxs-document-tree__arrow');
        if (onArrow)
            this.toggle(row.node);
        else
            this.open(row.node);
    }
    onKeydown(event, row) {
        if (event.target !== event.currentTarget)
            return;
        const rows = this.rows();
        const at = rows.findIndex((candidate) => candidate.key === row.key);
        const rtl = this.direction?.value === 'rtl';
        const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const outward = rtl ? 'ArrowRight' : 'ArrowLeft';
        const node = row.node;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.focus(rows[Math.min(at + 1, rows.length - 1)]);
                return;
            case 'ArrowUp':
                event.preventDefault();
                this.focus(rows[Math.max(at - 1, 0)]);
                return;
            case 'Home':
                event.preventDefault();
                this.focus(rows[0]);
                return;
            case 'End':
                event.preventDefault();
                this.focus(rows[rows.length - 1]);
                return;
            case 'Enter':
                event.preventDefault();
                if (row.kind === 'error')
                    this.retry(node);
                else
                    this.open(node);
                return;
            case ' ':
                event.preventDefault();
                if (row.kind === 'error')
                    this.retry(node);
                else
                    this.toggle(node);
                return;
        }
        if (event.key === inward) {
            event.preventDefault();
            if (row.kind === 'error')
                return;
            if (!node.expanded && node.expandable)
                this.toggle(node);
            else if (node.expanded)
                this.focus(rows[at + 1]?.level > row.level ? rows[at + 1] : row);
        }
        else if (event.key === outward) {
            event.preventDefault();
            if (row.kind === 'node' && node.expanded) {
                node.expanded = false;
                this.bump();
                return;
            }
            const parentKey = row.kind === 'error' ? node.key : node.parent?.key;
            const parent = rows.find((candidate) => candidate.key === parentKey);
            if (parent)
                this.focus(parent);
        }
    }
    focus(row) {
        if (!row)
            return;
        this.focusKey.set(row.key);
        queueMicrotask(() => [...this.host.nativeElement.querySelectorAll('[data-row-key]')]
            .find((element) => element.dataset['rowKey'] === row.key)
            ?.focus());
    }
    openRoot() {
        if (this.root)
            this.open(this.root);
    }
    open(node) {
        if (node.root) {
            // Web UI's shortcut: a repository with one domain opens that domain, not an empty root.
            const only = node.children.length === 1 ? node.children[0] : null;
            this.navigate.emit(only ? only.doc : { ...node.doc, path: '/' });
            return;
        }
        this.navigate.emit(node.doc);
    }
    toggle(node) {
        if (node.loading)
            return;
        if (node.expanded) {
            node.expanded = false;
            this.bump();
            return;
        }
        if (node.loaded && !node.error) {
            node.expanded = node.children.length > 0;
            this.bump();
            return;
        }
        this.loadChildren(node)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
            node.expanded = node.error !== null || node.children.length > 0;
            this.bump();
        });
    }
    retry(node) {
        node.error = null;
        node.loaded = false;
        node.expanded = false;
        this.focusKey.set(node.key);
        this.toggle(node);
    }
    load() {
        const generation = ++this.loadGeneration;
        this.status.set('loading');
        this.browse
            .getNavTreeBootstrap()
            .pipe(switchMap(({ root, entries }) => {
            const node = this.node(root, null, true);
            node.children = this.toNodes(entries, node);
            node.loaded = true;
            node.expanded = true;
            return this.probe(node.children).pipe(map(() => node));
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (root) => {
                if (generation !== this.loadGeneration)
                    return;
                this.root = root;
                this.status.set('ready');
                this.bump();
                this.syncTo(this.currentPath());
            },
            error: (error) => {
                if (generation !== this.loadGeneration)
                    return;
                const status = nxsErrorStatus(error);
                this.loadError.set(status);
                this.status.set('error');
                this.announce(status, null);
            },
        });
    }
    /** Expands every folder on `path`, loading the ones not loaded yet, and folds the rest away. */
    syncTo(path) {
        const root = this.root;
        if (!root)
            return;
        const generation = ++this.syncGeneration;
        const prefixes = cumulativeNuxeoPathPrefixes(normalizeNuxeoPath(path));
        root.expanded = true;
        const step = (nodes, index) => {
            if (generation !== this.syncGeneration)
                return;
            const next = index < prefixes.length ? nodeAt(nodes, prefixes[index]) : undefined;
            for (const node of nodes) {
                if (node !== next)
                    collapse(node);
            }
            if (!next) {
                this.bump();
                return;
            }
            if (next.loaded) {
                next.expanded = next.error !== null || next.children.length > 0;
                step(next.children, index + 1);
                return;
            }
            next.loading = true;
            this.bump();
            this.loadChildren(next)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                if (generation !== this.syncGeneration)
                    return;
                next.expanded = next.error !== null || next.children.length > 0;
                step(next.children, index + 1);
            });
        };
        step(root.children, 0);
    }
    /** Loads a folder's folders and which of them hold one; a failure is recorded, not thrown. */
    loadChildren(node) {
        node.loading = true;
        node.error = null;
        this.bump();
        return this.browse.getNavTreeChildren(node.doc).pipe(switchMap((list) => {
            const children = this.toNodes(list.entries ?? [], node);
            return this.probe(children).pipe(map(() => children));
        }), map((children) => {
            node.children = children;
            node.loaded = true;
            node.loading = false;
            node.expandable = children.length > 0;
        }), catchError((error) => {
            const status = nxsErrorStatus(error);
            node.loading = false;
            node.loaded = false;
            node.error = status;
            this.announce(status, node);
            return of(undefined);
        }));
    }
    /** One query for a whole level: which of these folders hold a folder. Unknown keeps the arrow. */
    probe(nodes) {
        if (nodes.length === 0)
            return of(undefined);
        return this.browse.getFolderIdsWithSubfolders(nodes.map((node) => node.doc.uid)).pipe(map((withFolders) => {
            if (!withFolders)
                return;
            for (const node of nodes)
                node.expandable = withFolders.has(node.doc.uid);
        }), catchError(() => of(undefined)));
    }
    toNodes(entries, parent) {
        return entries
            .filter((doc) => isBrowsableNavNode(doc))
            .map((doc) => this.node(doc, parent, false));
    }
    node(doc, parent, root) {
        return {
            key: root ? 'root' : doc.uid,
            doc,
            root,
            parent,
            children: [],
            loaded: false,
            loading: false,
            expanded: false,
            expandable: true,
            error: null,
        };
    }
    announce(status, node) {
        const name = node ? this.nodeLabel(node) : '';
        const key = node
            ? status === 403
                ? 'satori-components.document-tree.children-forbidden'
                : 'satori-components.document-tree.children-failed'
            : 'satori-components.document-tree.load-failed';
        void this.announcer.announce(this.translate.instant(key, { name }), 'assertive');
    }
    bump() {
        this.revision.update((value) => value + 1);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentTreeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDocumentTreeComponent, isStandalone: true, selector: "nxs-document-tree", inputs: { currentPath: { classPropertyName: "currentPath", publicName: "currentPath", isSignal: true, isRequired: false, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { navigate: "navigate" }, host: { classAttribute: "nxs-document-tree" }, ngImport: i0, template: "@if (status() === 'loading') {\n  <div class=\"nxs-document-tree__state\">\n    <nxs-spinner diameter=\"24\" [label]=\"'satori-components.document-tree.loading' | translate\" />\n  </div>\n} @else if (status() === 'error') {\n  <nxs-error-state\n    class=\"nxs-document-tree__error\"\n    [status]=\"loadError()\"\n    [heading]=\"\n      loadError() === 500 ? ('satori-components.document-tree.load-failed' | translate) : ''\n    \"\n    [headingLevel]=\"3\"\n    retryable\n    (retry)=\"reload()\"\n  />\n} @else {\n  @if (showRootBack()) {\n    <button type=\"button\" class=\"nxs-document-tree__back\" (click)=\"openRoot()\">\n      <mat-icon class=\"nxs-document-tree__back-icon\" aria-hidden=\"true\">chevron_left</mat-icon>\n      {{ 'satori-components.document-tree.root' | translate }}\n    </button>\n  }\n  @if (rows().length === 0) {\n    <p class=\"nxs-document-tree__empty\">\n      {{ 'satori-components.document-tree.empty' | translate }}\n    </p>\n  } @else {\n    <ul class=\"nxs-document-tree__tree\" role=\"tree\" [attr.aria-label]=\"label()\">\n      <ng-container *ngTemplateOutlet=\"level; context: { $implicit: topNodes(), depth: 1 }\" />\n    </ul>\n  }\n}\n\n<ng-template #level let-nodes let-depth=\"depth\">\n  @for (node of nodes; track node.key) {\n    @let row = rowFor(node.key);\n    @if (row) {\n      <li\n        class=\"nxs-document-tree__item\"\n        role=\"treeitem\"\n        [attr.data-row-key]=\"row.key\"\n        [attr.aria-level]=\"row.level\"\n        [attr.aria-setsize]=\"row.setSize\"\n        [attr.aria-posinset]=\"row.position\"\n        [attr.aria-expanded]=\"node.expandable || node.expanded ? node.expanded : null\"\n        [attr.aria-selected]=\"row.key === currentKey()\"\n        [attr.aria-current]=\"row.key === currentKey() ? 'page' : null\"\n        [attr.aria-busy]=\"node.loading ? true : null\"\n        [attr.tabindex]=\"row.key === tabStop() ? 0 : -1\"\n        (keydown)=\"onKeydown($event, row)\"\n        (click)=\"onItemClick($event, row)\"\n        (focus)=\"focusKey.set(row.key)\"\n      >\n        <div\n          class=\"nxs-document-tree__row\"\n          [class.nxs-document-tree__row--current]=\"row.key === currentKey()\"\n          [style.padding-inline-start.px]=\"8 + (depth - 1) * 16\"\n        >\n          @if (node.loading) {\n            <nxs-spinner class=\"nxs-document-tree__toggle\" diameter=\"14\" />\n          } @else if (node.expandable || node.expanded) {\n            <mat-icon\n              class=\"nxs-document-tree__toggle nxs-document-tree__arrow\"\n              [class.nxs-document-tree__arrow--open]=\"node.expanded\"\n              aria-hidden=\"true\"\n              >chevron_right</mat-icon\n            >\n          } @else {\n            <span class=\"nxs-document-tree__toggle\" aria-hidden=\"true\"></span>\n          }\n          <span class=\"nxs-document-tree__label\">{{ nodeLabel(node) }}</span>\n        </div>\n        @if (node.expanded) {\n          <ul class=\"nxs-document-tree__group\" role=\"group\">\n            @if (node.error) {\n              @let errorRow = rowFor(node.key + '#error');\n              @if (errorRow) {\n                <li\n                  class=\"nxs-document-tree__item nxs-document-tree__item--error\"\n                  role=\"treeitem\"\n                  [attr.data-row-key]=\"errorRow.key\"\n                  [attr.aria-level]=\"errorRow.level\"\n                  aria-setsize=\"1\"\n                  aria-posinset=\"1\"\n                  aria-selected=\"false\"\n                  [attr.tabindex]=\"errorRow.key === tabStop() ? 0 : -1\"\n                  (keydown)=\"onKeydown($event, errorRow)\"\n                  (click)=\"onItemClick($event, errorRow)\"\n                  (focus)=\"focusKey.set(errorRow.key)\"\n                >\n                  <div\n                    class=\"nxs-document-tree__row nxs-document-tree__row--error\"\n                    [style.padding-inline-start.px]=\"8 + depth * 16\"\n                  >\n                    <mat-icon class=\"nxs-document-tree__toggle\" aria-hidden=\"true\"\n                      >error_outline</mat-icon\n                    >\n                    <span class=\"nxs-document-tree__label\">{{\n                      (node.error === 403\n                        ? 'satori-components.document-tree.children-forbidden-row'\n                        : 'satori-components.document-tree.children-failed-row'\n                      ) | translate\n                    }}</span>\n                  </div>\n                </li>\n              }\n            } @else {\n              <ng-container\n                *ngTemplateOutlet=\"level; context: { $implicit: node.children, depth: depth + 1 }\"\n              />\n            }\n          </ul>\n        }\n      </li>\n    }\n  }\n</ng-template>\n", styles: [":host{display:block;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface)}.nxs-document-tree__state{display:flex;justify-content:center;padding:16px 0}.nxs-document-tree__empty{margin:0;padding:12px 16px;color:var(--mat-sys-on-surface-variant)}.nxs-document-tree__back{display:flex;align-items:center;gap:4px;width:100%;padding:6px 8px;border:0;border-bottom:1px solid var(--mat-sys-outline-variant);background:none;font:inherit;color:inherit;text-align:start;cursor:pointer}.nxs-document-tree__back:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-tree__back:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}:host-context([dir=rtl]) .nxs-document-tree__back-icon{transform:scaleX(-1)}.nxs-document-tree__tree,.nxs-document-tree__group{margin:0;padding:0;list-style:none}.nxs-document-tree__item{outline:none}.nxs-document-tree__item:focus>.nxs-document-tree__row{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-tree__item:focus-visible>.nxs-document-tree__row{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-tree__row{display:flex;align-items:center;gap:4px;min-height:32px;padding-inline-end:8px;border-radius:4px;cursor:pointer}.nxs-document-tree__row:hover{background:var(--mat-sys-surface-container-high)}.nxs-document-tree__row--current{background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container);font-weight:500}.nxs-document-tree__row--current:hover{background:var(--mat-sys-secondary-container)}.nxs-document-tree__row--error{color:var(--mat-sys-error)}.nxs-document-tree__toggle{display:inline-flex;flex:0 0 20px;justify-content:center;width:20px;height:20px;font-size:20px}.nxs-document-tree__arrow{transition:transform .15s}.nxs-document-tree__arrow--open{transform:rotate(90deg)}:host-context([dir=rtl]) .nxs-document-tree__arrow:not(.nxs-document-tree__arrow--open){transform:scaleX(-1)}.nxs-document-tree__label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n"], dependencies: [{ kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "component", type: NxsErrorStateComponent, selector: "nxs-error-state", inputs: ["status", "heading", "headingLevel", "retryable", "retryHandler"], outputs: ["retry"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDocumentTreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-document-tree', standalone: true, imports: [
                        MatIconModule,
                        NgTemplateOutlet,
                        NxsErrorStateComponent,
                        NxsSpinnerComponent,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-document-tree' }, template: "@if (status() === 'loading') {\n  <div class=\"nxs-document-tree__state\">\n    <nxs-spinner diameter=\"24\" [label]=\"'satori-components.document-tree.loading' | translate\" />\n  </div>\n} @else if (status() === 'error') {\n  <nxs-error-state\n    class=\"nxs-document-tree__error\"\n    [status]=\"loadError()\"\n    [heading]=\"\n      loadError() === 500 ? ('satori-components.document-tree.load-failed' | translate) : ''\n    \"\n    [headingLevel]=\"3\"\n    retryable\n    (retry)=\"reload()\"\n  />\n} @else {\n  @if (showRootBack()) {\n    <button type=\"button\" class=\"nxs-document-tree__back\" (click)=\"openRoot()\">\n      <mat-icon class=\"nxs-document-tree__back-icon\" aria-hidden=\"true\">chevron_left</mat-icon>\n      {{ 'satori-components.document-tree.root' | translate }}\n    </button>\n  }\n  @if (rows().length === 0) {\n    <p class=\"nxs-document-tree__empty\">\n      {{ 'satori-components.document-tree.empty' | translate }}\n    </p>\n  } @else {\n    <ul class=\"nxs-document-tree__tree\" role=\"tree\" [attr.aria-label]=\"label()\">\n      <ng-container *ngTemplateOutlet=\"level; context: { $implicit: topNodes(), depth: 1 }\" />\n    </ul>\n  }\n}\n\n<ng-template #level let-nodes let-depth=\"depth\">\n  @for (node of nodes; track node.key) {\n    @let row = rowFor(node.key);\n    @if (row) {\n      <li\n        class=\"nxs-document-tree__item\"\n        role=\"treeitem\"\n        [attr.data-row-key]=\"row.key\"\n        [attr.aria-level]=\"row.level\"\n        [attr.aria-setsize]=\"row.setSize\"\n        [attr.aria-posinset]=\"row.position\"\n        [attr.aria-expanded]=\"node.expandable || node.expanded ? node.expanded : null\"\n        [attr.aria-selected]=\"row.key === currentKey()\"\n        [attr.aria-current]=\"row.key === currentKey() ? 'page' : null\"\n        [attr.aria-busy]=\"node.loading ? true : null\"\n        [attr.tabindex]=\"row.key === tabStop() ? 0 : -1\"\n        (keydown)=\"onKeydown($event, row)\"\n        (click)=\"onItemClick($event, row)\"\n        (focus)=\"focusKey.set(row.key)\"\n      >\n        <div\n          class=\"nxs-document-tree__row\"\n          [class.nxs-document-tree__row--current]=\"row.key === currentKey()\"\n          [style.padding-inline-start.px]=\"8 + (depth - 1) * 16\"\n        >\n          @if (node.loading) {\n            <nxs-spinner class=\"nxs-document-tree__toggle\" diameter=\"14\" />\n          } @else if (node.expandable || node.expanded) {\n            <mat-icon\n              class=\"nxs-document-tree__toggle nxs-document-tree__arrow\"\n              [class.nxs-document-tree__arrow--open]=\"node.expanded\"\n              aria-hidden=\"true\"\n              >chevron_right</mat-icon\n            >\n          } @else {\n            <span class=\"nxs-document-tree__toggle\" aria-hidden=\"true\"></span>\n          }\n          <span class=\"nxs-document-tree__label\">{{ nodeLabel(node) }}</span>\n        </div>\n        @if (node.expanded) {\n          <ul class=\"nxs-document-tree__group\" role=\"group\">\n            @if (node.error) {\n              @let errorRow = rowFor(node.key + '#error');\n              @if (errorRow) {\n                <li\n                  class=\"nxs-document-tree__item nxs-document-tree__item--error\"\n                  role=\"treeitem\"\n                  [attr.data-row-key]=\"errorRow.key\"\n                  [attr.aria-level]=\"errorRow.level\"\n                  aria-setsize=\"1\"\n                  aria-posinset=\"1\"\n                  aria-selected=\"false\"\n                  [attr.tabindex]=\"errorRow.key === tabStop() ? 0 : -1\"\n                  (keydown)=\"onKeydown($event, errorRow)\"\n                  (click)=\"onItemClick($event, errorRow)\"\n                  (focus)=\"focusKey.set(errorRow.key)\"\n                >\n                  <div\n                    class=\"nxs-document-tree__row nxs-document-tree__row--error\"\n                    [style.padding-inline-start.px]=\"8 + depth * 16\"\n                  >\n                    <mat-icon class=\"nxs-document-tree__toggle\" aria-hidden=\"true\"\n                      >error_outline</mat-icon\n                    >\n                    <span class=\"nxs-document-tree__label\">{{\n                      (node.error === 403\n                        ? 'satori-components.document-tree.children-forbidden-row'\n                        : 'satori-components.document-tree.children-failed-row'\n                      ) | translate\n                    }}</span>\n                  </div>\n                </li>\n              }\n            } @else {\n              <ng-container\n                *ngTemplateOutlet=\"level; context: { $implicit: node.children, depth: depth + 1 }\"\n              />\n            }\n          </ul>\n        }\n      </li>\n    }\n  }\n</ng-template>\n", styles: [":host{display:block;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface)}.nxs-document-tree__state{display:flex;justify-content:center;padding:16px 0}.nxs-document-tree__empty{margin:0;padding:12px 16px;color:var(--mat-sys-on-surface-variant)}.nxs-document-tree__back{display:flex;align-items:center;gap:4px;width:100%;padding:6px 8px;border:0;border-bottom:1px solid var(--mat-sys-outline-variant);background:none;font:inherit;color:inherit;text-align:start;cursor:pointer}.nxs-document-tree__back:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-tree__back:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}:host-context([dir=rtl]) .nxs-document-tree__back-icon{transform:scaleX(-1)}.nxs-document-tree__tree,.nxs-document-tree__group{margin:0;padding:0;list-style:none}.nxs-document-tree__item{outline:none}.nxs-document-tree__item:focus>.nxs-document-tree__row{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-tree__item:focus-visible>.nxs-document-tree__row{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-document-tree__row{display:flex;align-items:center;gap:4px;min-height:32px;padding-inline-end:8px;border-radius:4px;cursor:pointer}.nxs-document-tree__row:hover{background:var(--mat-sys-surface-container-high)}.nxs-document-tree__row--current{background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container);font-weight:500}.nxs-document-tree__row--current:hover{background:var(--mat-sys-secondary-container)}.nxs-document-tree__row--error{color:var(--mat-sys-error)}.nxs-document-tree__toggle{display:inline-flex;flex:0 0 20px;justify-content:center;width:20px;height:20px;font-size:20px}.nxs-document-tree__arrow{transition:transform .15s}.nxs-document-tree__arrow--open{transform:rotate(90deg)}:host-context([dir=rtl]) .nxs-document-tree__arrow:not(.nxs-document-tree__arrow--open){transform:scaleX(-1)}.nxs-document-tree__label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n"] }]
        }], ctorParameters: () => [], propDecorators: { currentPath: [{ type: i0.Input, args: [{ isSignal: true, alias: "currentPath", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], navigate: [{ type: i0.Output, args: ["navigate"] }] } });
function collapse(node) {
    node.expanded = false;
    for (const child of node.children)
        collapse(child);
}
/**
 * The folder at `path` among siblings: the one whose path is exactly `path`, else one that differs
 * only in case or spacing, since the path in the address may not match Nuxeo's casing.
 */
function nodeAt(nodes, path) {
    const exact = normalizeNuxeoPath(path);
    return (nodes.find((node) => normalizeNuxeoPath(node.doc.path ?? '') === exact) ??
        nodes.find((node) => nuxeoPathsEqualFlexible(node.doc.path ?? '', path)));
}

/**
 * The note shown where content cannot be created directly: inside a Domain, or at the
 * repository root. It tells the user to open Sections, Templates or Workspaces instead.
 *
 * Renders nothing anywhere else, so a host places it unconditionally and passes what it is
 * showing. The rule — a `Domain`, or the path `/` — is `nuxeo-client`'s, shared with the
 * Create / Import checks that refuse those locations.
 */
class NxsDomainHintComponent {
    /** The type of the document being shown. */
    documentType = input(null, ...(ngDevMode ? [{ debugName: "documentType" }] : []));
    /** The repository path being shown. */
    path = input(null, ...(ngDevMode ? [{ debugName: "path" }] : []));
    guidanceKey = DOMAIN_CONTAINER_GUIDANCE_KEY;
    visible = computed(() => isDomainParentType(this.documentType()) || isRepositoryRootPath(this.path()), ...(ngDevMode ? [{ debugName: "visible" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDomainHintComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDomainHintComponent, isStandalone: true, selector: "nxs-domain-hint", inputs: { documentType: { classPropertyName: "documentType", publicName: "documentType", isSignal: true, isRequired: false, transformFunction: null }, path: { classPropertyName: "path", publicName: "path", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-domain-hint" }, ngImport: i0, template: "@if (visible()) {\n  <p class=\"nxs-domain-hint__note\" role=\"note\">{{ guidanceKey | translate }}</p>\n}\n", styles: [":host{display:block}.nxs-domain-hint__note{margin:0 0 12px;padding:10px 12px;border-radius:6px;background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);font-size:13px;line-height:1.45}\n"], dependencies: [{ kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDomainHintComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-domain-hint', standalone: true, imports: [TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-domain-hint' }, template: "@if (visible()) {\n  <p class=\"nxs-domain-hint__note\" role=\"note\">{{ guidanceKey | translate }}</p>\n}\n", styles: [":host{display:block}.nxs-domain-hint__note{margin:0 0 12px;padding:10px 12px;border-radius:6px;background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);font-size:13px;line-height:1.45}\n"] }]
        }], propDecorators: { documentType: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentType", required: false }] }], path: [{ type: i0.Input, args: [{ isSignal: true, alias: "path", required: false }] }] } });

let nextId$8 = 0;
/**
 * Where files are dropped from the computer, or chosen with a button — the same files either way.
 *
 * The button is the keyboard's way in, since dragging files has none. Only a drag of files is
 * taken: a drag of text or a link is left to the browser, and nothing lights up for it.
 */
class NxsDropzoneComponent {
    /** What the zone says, already translated, such as "Drag and drop files here". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The button's text, already translated. Blank says "Choose files" or "Choose a file". */
    buttonLabel = input('', ...(ngDevMode ? [{ debugName: "buttonLabel" }] : []));
    /** Takes several files at once. Accepts a bare attribute. */
    multiple = input(false, ...(ngDevMode ? [{ debugName: "multiple", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The file types the chooser offers, as the `accept` attribute takes them: `.csv`. */
    accept = input('', ...(ngDevMode ? [{ debugName: "accept" }] : []));
    /** Takes nothing, from the button or a drop. Accepts a bare attribute. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Files chosen or dropped: one when `multiple` is off, however many were dropped. */
    files = output();
    drop = new NxsFileDropTracker(() => !this.disabled());
    /**
     * The button's id, which also names the file input behind it. That input is hidden from
     * assistive technology and out of the Tab sequence, so the name is never announced; it states
     * which control the input stands behind, and gives it a label a template check can see.
     */
    buttonId = `nxs-dropzone-${nextId$8++}-button`;
    input = viewChild.required('picker');
    choose() {
        if (!this.disabled())
            this.input().nativeElement.click();
    }
    onPicked(event) {
        const picker = event.target;
        const files = Array.from(picker.files ?? []);
        picker.value = '';
        this.emit(files);
    }
    onDrop(event) {
        this.emit(this.drop.drop(event));
    }
    emit(files) {
        if (files.length === 0 || this.disabled())
            return;
        this.files.emit(this.multiple() ? files : files.slice(0, 1));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDropzoneComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.2.0", version: "20.3.33", type: NxsDropzoneComponent, isStandalone: true, selector: "nxs-dropzone", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, buttonLabel: { classPropertyName: "buttonLabel", publicName: "buttonLabel", isSignal: true, isRequired: false, transformFunction: null }, multiple: { classPropertyName: "multiple", publicName: "multiple", isSignal: true, isRequired: false, transformFunction: null }, accept: { classPropertyName: "accept", publicName: "accept", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { files: "files" }, host: { listeners: { "dragenter": "drop.enter($event)", "dragover": "drop.overTarget($event)", "dragleave": "drop.leave($event)", "drop": "onDrop($event)" }, properties: { "class.nxs-dropzone--over": "drop.over()", "class.nxs-dropzone--disabled": "disabled()" }, classAttribute: "nxs-dropzone" }, viewQueries: [{ propertyName: "input", first: true, predicate: ["picker"], descendants: true, isSignal: true }], ngImport: i0, template: "<mat-icon class=\"nxs-dropzone__icon\" aria-hidden=\"true\">upload_file</mat-icon>\n<span class=\"nxs-dropzone__label\">{{ label() }}</span>\n<button\n  mat-stroked-button\n  type=\"button\"\n  class=\"nxs-dropzone__button\"\n  [id]=\"buttonId\"\n  [disabled]=\"disabled()\"\n  (click)=\"choose()\"\n>\n  {{\n    buttonLabel().trim() ||\n      ((multiple()\n        ? 'satori-components.dropzone.choose-files'\n        : 'satori-components.dropzone.choose-file'\n      ) | translate)\n  }}\n</button>\n<input\n  #picker\n  type=\"file\"\n  class=\"nxs-dropzone__input\"\n  tabindex=\"-1\"\n  aria-hidden=\"true\"\n  [attr.aria-labelledby]=\"buttonId\"\n  [multiple]=\"multiple()\"\n  [attr.accept]=\"accept() || null\"\n  [disabled]=\"disabled()\"\n  (change)=\"onPicked($event)\"\n/>\n", styles: [":host{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px 16px;border:2px dashed var(--mat-sys-outline-variant);border-radius:12px;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant);text-align:center;transition:border-color .15s,background-color .15s}:host(.nxs-dropzone--over){border-color:var(--mat-sys-primary);background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container)}:host(.nxs-dropzone--disabled){opacity:.6}.nxs-dropzone__icon{width:32px;height:32px;font-size:32px}.nxs-dropzone__input{display:none}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDropzoneComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-dropzone', standalone: true, imports: [MatButtonModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-dropzone',
                        '[class.nxs-dropzone--over]': 'drop.over()',
                        '[class.nxs-dropzone--disabled]': 'disabled()',
                        '(dragenter)': 'drop.enter($event)',
                        '(dragover)': 'drop.overTarget($event)',
                        '(dragleave)': 'drop.leave($event)',
                        '(drop)': 'onDrop($event)',
                    }, template: "<mat-icon class=\"nxs-dropzone__icon\" aria-hidden=\"true\">upload_file</mat-icon>\n<span class=\"nxs-dropzone__label\">{{ label() }}</span>\n<button\n  mat-stroked-button\n  type=\"button\"\n  class=\"nxs-dropzone__button\"\n  [id]=\"buttonId\"\n  [disabled]=\"disabled()\"\n  (click)=\"choose()\"\n>\n  {{\n    buttonLabel().trim() ||\n      ((multiple()\n        ? 'satori-components.dropzone.choose-files'\n        : 'satori-components.dropzone.choose-file'\n      ) | translate)\n  }}\n</button>\n<input\n  #picker\n  type=\"file\"\n  class=\"nxs-dropzone__input\"\n  tabindex=\"-1\"\n  aria-hidden=\"true\"\n  [attr.aria-labelledby]=\"buttonId\"\n  [multiple]=\"multiple()\"\n  [attr.accept]=\"accept() || null\"\n  [disabled]=\"disabled()\"\n  (change)=\"onPicked($event)\"\n/>\n", styles: [":host{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:24px 16px;border:2px dashed var(--mat-sys-outline-variant);border-radius:12px;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant);text-align:center;transition:border-color .15s,background-color .15s}:host(.nxs-dropzone--over){border-color:var(--mat-sys-primary);background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container)}:host(.nxs-dropzone--disabled){opacity:.6}.nxs-dropzone__icon{width:32px;height:32px;font-size:32px}.nxs-dropzone__input{display:none}\n"] }]
        }], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], buttonLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "buttonLabel", required: false }] }], multiple: [{ type: i0.Input, args: [{ isSignal: true, alias: "multiple", required: false }] }], accept: [{ type: i0.Input, args: [{ isSignal: true, alias: "accept", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], files: [{ type: i0.Output, args: ["files"] }], input: [{ type: i0.ViewChild, args: ['picker', { isSignal: true }] }] } });

const DRIVE_PACKAGES = [
    {
        platform: 'Linux',
        name: 'Nuxeo-Drive-X86_64.AppImage',
        url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive-x86_64.AppImage',
    },
    {
        platform: 'macOS',
        name: 'Nuxeo-Drive.Dmg',
        url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.dmg',
    },
    {
        platform: 'Windows',
        name: 'Nuxeo-Drive.Exe',
        url: 'https://community.nuxeo.com/static/drive-updates/release/nuxeo-drive.exe',
    },
];
/**
 * "Open with Nuxeo Drive", as a `MatDialog`: `dialog.open(NxsDriveDialogComponent, { data })`.
 *
 * It first asks Nuxeo whether this user has a Drive token. With one, it hands Drive the folder
 * through a `nxdrive://direct-transfer` link and closes itself — direct-transfer matches on the
 * server URL alone, where `nxdrive://edit` also matches the username and fails on some Drive
 * configurations. Without one, including when the check fails, it offers the installers.
 */
class NxsDriveDialogComponent {
    dialogRef = inject(MatDialogRef);
    drive = inject(NuxeoDriveService);
    data = inject(MAT_DIALOG_DATA, { optional: true });
    packages = DRIVE_PACKAGES;
    checking = signal(true, ...(ngDevMode ? [{ debugName: "checking" }] : []));
    constructor() {
        this.drive
            .hasDriveToken()
            .pipe(takeUntilDestroyed())
            .subscribe((hasToken) => {
            if (!hasToken) {
                this.checking.set(false);
                return;
            }
            this.drive.openDriveUrl(this.drive.buildDirectTransferUrl(this.data?.folderPath || '/'));
            this.dialogRef.close();
        });
    }
    close() {
        this.dialogRef.close();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDriveDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsDriveDialogComponent, isStandalone: true, selector: "nxs-drive-dialog", host: { classAttribute: "nxs-drive-dialog" }, ngImport: i0, template: "<div class=\"nxs-drive-dialog__body\">\n  @if (checking()) {\n    <h2 mat-dialog-title class=\"nxs-drive-dialog__name\">\n      {{ 'satori-components.drive-dialog.name' | translate }}\n    </h2>\n    <output class=\"nxs-drive-dialog__checking\">\n      <nxs-spinner diameter=\"32\" />\n      <span class=\"nxs-drive-dialog__checking-text\">\n        {{ 'satori-components.drive-dialog.checking' | translate }}\n      </span>\n    </output>\n  } @else {\n    <h2 mat-dialog-title class=\"nxs-drive-dialog__title\">\n      {{ 'satori-components.drive-dialog.title' | translate }}\n    </h2>\n    <table class=\"nxs-drive-dialog__table\">\n      <thead>\n        <tr>\n          <th scope=\"col\">{{ 'satori-components.drive-dialog.platform' | translate }}</th>\n          <th scope=\"col\">{{ 'satori-components.drive-dialog.package' | translate }}</th>\n        </tr>\n      </thead>\n      <tbody>\n        @for (pkg of packages; track pkg.platform) {\n          <tr>\n            <td>\n              <span class=\"nxs-drive-dialog__platform\">{{ pkg.platform }}</span>\n            </td>\n            <td>\n              <a\n                class=\"nxs-drive-dialog__package\"\n                [href]=\"pkg.url\"\n                target=\"_blank\"\n                rel=\"noopener\"\n                >{{ pkg.name }}</a\n              >\n            </td>\n          </tr>\n        }\n      </tbody>\n    </table>\n    <button type=\"button\" class=\"nxs-drive-dialog__close\" (click)=\"close()\">\n      {{ 'satori-components.drive-dialog.close' | translate }}\n    </button>\n  }\n</div>\n", styles: [":host{display:block}.nxs-drive-dialog__body{box-sizing:border-box;width:460px;max-width:100%;padding:28px 32px}.nxs-drive-dialog__title.nxs-drive-dialog__title{margin:0 0 24px;padding:0;font-size:22px;font-weight:600;line-height:normal;color:var(--mat-sys-on-surface)}.nxs-drive-dialog__title.nxs-drive-dialog__title:before{display:none}.nxs-drive-dialog__name.nxs-drive-dialog__name{position:absolute;width:1px;height:1px;margin:0;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.nxs-drive-dialog__checking{display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px 0}.nxs-drive-dialog__checking-text{margin:0;font-size:15px;font-weight:500;color:var(--mat-sys-on-surface)}.nxs-drive-dialog__table{width:100%;margin-bottom:24px;border-collapse:collapse}.nxs-drive-dialog__table th{padding:0 16px 12px 0;font-size:13px;font-weight:500;color:var(--mat-sys-on-surface-variant);text-align:left}.nxs-drive-dialog__table td{padding:12px 16px 12px 0;border-top:1px solid var(--mat-sys-outline-variant);vertical-align:middle}.nxs-drive-dialog__platform{display:inline-block;padding:3px 10px;border-radius:3px;background:var(--mat-sys-inverse-surface);color:var(--mat-sys-inverse-on-surface);font-size:12px;font-weight:600}.nxs-drive-dialog__package{font-size:14px;color:var(--mat-sys-on-surface);text-decoration:none}.nxs-drive-dialog__package:hover,.nxs-drive-dialog__package:focus-visible{color:var(--mat-sys-primary);text-decoration:underline}.nxs-drive-dialog__close{padding:0;border:none;background:none;font:inherit;font-size:14px;color:var(--mat-sys-primary);cursor:pointer}.nxs-drive-dialog__close:hover,.nxs-drive-dialog__close:focus-visible{text-decoration:underline}\n"], dependencies: [{ kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDriveDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-drive-dialog', standalone: true, imports: [MatDialogModule, NxsSpinnerComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-drive-dialog' }, template: "<div class=\"nxs-drive-dialog__body\">\n  @if (checking()) {\n    <h2 mat-dialog-title class=\"nxs-drive-dialog__name\">\n      {{ 'satori-components.drive-dialog.name' | translate }}\n    </h2>\n    <output class=\"nxs-drive-dialog__checking\">\n      <nxs-spinner diameter=\"32\" />\n      <span class=\"nxs-drive-dialog__checking-text\">\n        {{ 'satori-components.drive-dialog.checking' | translate }}\n      </span>\n    </output>\n  } @else {\n    <h2 mat-dialog-title class=\"nxs-drive-dialog__title\">\n      {{ 'satori-components.drive-dialog.title' | translate }}\n    </h2>\n    <table class=\"nxs-drive-dialog__table\">\n      <thead>\n        <tr>\n          <th scope=\"col\">{{ 'satori-components.drive-dialog.platform' | translate }}</th>\n          <th scope=\"col\">{{ 'satori-components.drive-dialog.package' | translate }}</th>\n        </tr>\n      </thead>\n      <tbody>\n        @for (pkg of packages; track pkg.platform) {\n          <tr>\n            <td>\n              <span class=\"nxs-drive-dialog__platform\">{{ pkg.platform }}</span>\n            </td>\n            <td>\n              <a\n                class=\"nxs-drive-dialog__package\"\n                [href]=\"pkg.url\"\n                target=\"_blank\"\n                rel=\"noopener\"\n                >{{ pkg.name }}</a\n              >\n            </td>\n          </tr>\n        }\n      </tbody>\n    </table>\n    <button type=\"button\" class=\"nxs-drive-dialog__close\" (click)=\"close()\">\n      {{ 'satori-components.drive-dialog.close' | translate }}\n    </button>\n  }\n</div>\n", styles: [":host{display:block}.nxs-drive-dialog__body{box-sizing:border-box;width:460px;max-width:100%;padding:28px 32px}.nxs-drive-dialog__title.nxs-drive-dialog__title{margin:0 0 24px;padding:0;font-size:22px;font-weight:600;line-height:normal;color:var(--mat-sys-on-surface)}.nxs-drive-dialog__title.nxs-drive-dialog__title:before{display:none}.nxs-drive-dialog__name.nxs-drive-dialog__name{position:absolute;width:1px;height:1px;margin:0;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.nxs-drive-dialog__checking{display:flex;flex-direction:column;align-items:center;gap:12px;padding:32px 0}.nxs-drive-dialog__checking-text{margin:0;font-size:15px;font-weight:500;color:var(--mat-sys-on-surface)}.nxs-drive-dialog__table{width:100%;margin-bottom:24px;border-collapse:collapse}.nxs-drive-dialog__table th{padding:0 16px 12px 0;font-size:13px;font-weight:500;color:var(--mat-sys-on-surface-variant);text-align:left}.nxs-drive-dialog__table td{padding:12px 16px 12px 0;border-top:1px solid var(--mat-sys-outline-variant);vertical-align:middle}.nxs-drive-dialog__platform{display:inline-block;padding:3px 10px;border-radius:3px;background:var(--mat-sys-inverse-surface);color:var(--mat-sys-inverse-on-surface);font-size:12px;font-weight:600}.nxs-drive-dialog__package{font-size:14px;color:var(--mat-sys-on-surface);text-decoration:none}.nxs-drive-dialog__package:hover,.nxs-drive-dialog__package:focus-visible{color:var(--mat-sys-primary);text-decoration:underline}.nxs-drive-dialog__close{padding:0;border:none;background:none;font:inherit;font-size:14px;color:var(--mat-sys-primary);cursor:pointer}.nxs-drive-dialog__close:hover,.nxs-drive-dialog__close:focus-visible{text-decoration:underline}\n"] }]
        }], ctorParameters: () => [] });

/** The window event the shell's Favorites views listen for, to re-read the list. */
const NXS_FAVORITES_CHANGED_EVENT = 'favorites-changed';
/**
 * Adds a document to the user's favorites, or removes it, and emits the state the server now holds.
 *
 * The one implementation of the operation: `nxs-favorite-toggle` runs it, and so does a host that
 * offers the same operation as a menu entry rather than a button — document detail's
 * `app.toolbar.addToFavorites` and `removeFromFavorites`. On success it tells the shell, through
 * `NXS_FAVORITES_CHANGED_EVENT`, so the Favorites drawer and page re-read the list; on failure it
 * errors and tells nobody.
 */
function nxsToggleFavorite(documents, documentId, favorite) {
    const request = favorite
        ? documents.removeFromFavorites(documentId)
        : documents.addToFavorites(documentId);
    return request.pipe(map(() => !favorite), tap(() => window.dispatchEvent(new Event(NXS_FAVORITES_CHANGED_EVENT))));
}

/**
 * The star that adds a document to the user's favorites or removes it — Web UI's
 * `nuxeo-favorites-toggle-button`.
 *
 * A toggle button: its accessible name stays "Favorite" and `aria-pressed` carries the state, while
 * the tooltip says what a press will do. It runs the operation itself and reports the outcome, so
 * the host decides what to tell the user — Web UI's application, not its button, shows the toast.
 * A click does not reach the row or card it sits in.
 */
class NxsFavoriteToggleComponent {
    /** The document to add or remove. */
    documentId = input.required(...(ngDevMode ? [{ debugName: "documentId" }] : []));
    /** Whether it is a favorite now. Two-way: the toggle updates it once the server confirms. */
    favorite = model(false, ...(ngDevMode ? [{ debugName: "favorite" }] : []));
    /** Shown but not pressable — an enabled rule said no. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : []));
    /** The server confirmed the change; carries the new state. */
    changed = output();
    /** The server refused; `favorite` is unchanged. Carries the error. */
    failed = output();
    /**
     * A request is in flight for the document shown. The button stays focusable and ignores presses
     * until it answers; bound to another document, it is free again.
     */
    busy = computed(() => this.pending() === this.documentId(), ...(ngDevMode ? [{ debugName: "busy" }] : []));
    /** The document a request is in flight for. */
    pending = signal(null, ...(ngDevMode ? [{ debugName: "pending" }] : []));
    documents = inject(DocumentDetailService);
    destroyRef = inject(DestroyRef);
    /** Adds or removes the document. Ignored while disabled or while a request is in flight. */
    toggle() {
        const documentId = this.documentId();
        if (!documentId || this.disabled() || this.busy())
            return;
        this.pending.set(documentId);
        nxsToggleFavorite(this.documents, documentId, this.favorite())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (favorite) => this.settle(documentId, () => {
                this.favorite.set(favorite);
                this.changed.emit(favorite);
            }),
            error: (error) => this.settle(documentId, () => this.failed.emit(error)),
        });
    }
    /** Ends the request for `documentId`, and reports it only if that is still the document bound. */
    settle(documentId, report) {
        if (this.pending() === documentId)
            this.pending.set(null);
        if (documentId === this.documentId())
            report();
    }
    press(event) {
        event.stopPropagation();
        this.toggle();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsFavoriteToggleComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.1.0", version: "20.3.33", type: NxsFavoriteToggleComponent, isStandalone: true, selector: "nxs-favorite-toggle", inputs: { documentId: { classPropertyName: "documentId", publicName: "documentId", isSignal: true, isRequired: true, transformFunction: null }, favorite: { classPropertyName: "favorite", publicName: "favorite", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { favorite: "favoriteChange", changed: "changed", failed: "failed" }, host: { classAttribute: "nxs-favorite-toggle" }, ngImport: i0, template: "<button\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-favorite-toggle__button\"\n  [class.nxs-favorite-toggle__button--on]=\"favorite()\"\n  [attr.aria-label]=\"'satori-components.favorite-toggle.label' | translate\"\n  [attr.aria-pressed]=\"favorite()\"\n  [attr.aria-busy]=\"busy() || null\"\n  [matTooltip]=\"\n    (favorite()\n      ? 'satori-components.favorite-toggle.remove'\n      : 'satori-components.favorite-toggle.add'\n    ) | translate\n  \"\n  [disabled]=\"disabled()\"\n  (click)=\"press($event)\"\n>\n  <mat-icon aria-hidden=\"true\">{{ favorite() ? 'star' : 'star_border' }}</mat-icon>\n</button>\n", styles: [":host{display:inline-flex}.nxs-favorite-toggle__button{--mat-icon-button-state-layer-size: 32px;width:32px;height:32px;padding:0;color:var(--mat-sys-on-surface-variant)}.nxs-favorite-toggle__button .mat-icon{width:18px;height:18px;font-size:18px}.nxs-favorite-toggle__button--on{color:var(--nxs-favorite-toggle-active-color, var(--mat-sys-primary))}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsFavoriteToggleComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-favorite-toggle', standalone: true, imports: [MatButtonModule, MatIconModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-favorite-toggle' }, template: "<button\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-favorite-toggle__button\"\n  [class.nxs-favorite-toggle__button--on]=\"favorite()\"\n  [attr.aria-label]=\"'satori-components.favorite-toggle.label' | translate\"\n  [attr.aria-pressed]=\"favorite()\"\n  [attr.aria-busy]=\"busy() || null\"\n  [matTooltip]=\"\n    (favorite()\n      ? 'satori-components.favorite-toggle.remove'\n      : 'satori-components.favorite-toggle.add'\n    ) | translate\n  \"\n  [disabled]=\"disabled()\"\n  (click)=\"press($event)\"\n>\n  <mat-icon aria-hidden=\"true\">{{ favorite() ? 'star' : 'star_border' }}</mat-icon>\n</button>\n", styles: [":host{display:inline-flex}.nxs-favorite-toggle__button{--mat-icon-button-state-layer-size: 32px;width:32px;height:32px;padding:0;color:var(--mat-sys-on-surface-variant)}.nxs-favorite-toggle__button .mat-icon{width:18px;height:18px;font-size:18px}.nxs-favorite-toggle__button--on{color:var(--nxs-favorite-toggle-active-color, var(--mat-sys-primary))}\n"] }]
        }], propDecorators: { documentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentId", required: true }] }], favorite: [{ type: i0.Input, args: [{ isSignal: true, alias: "favorite", required: false }] }, { type: i0.Output, args: ["favoriteChange"] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], changed: [{ type: i0.Output, args: ["changed"] }], failed: [{ type: i0.Output, args: ["failed"] }] } });

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
class NxsFolderHeaderComponent {
    /** The container's title. Blank renders no heading. */
    heading = input('', ...(ngDevMode ? [{ debugName: "heading" }] : []));
    /**
     * The title's level in the page outline, rendered as the native `<h1>`–`<h6>`. The header is
     * usually the page's own heading, so level one; lower it where the header sits inside a section
     * that already has one.
     */
    // Annotated rather than inferred, as `nxs-empty-state`'s is, to keep the published API snapshot
    // stable.
    headingLevel = input(1, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** A second line under the title — usually the type's name — already translated. */
    subheading = input('', ...(ngDevMode ? [{ debugName: "subheading" }] : []));
    /** The container's Nuxeo type, which picks the icon. Blank renders no icon. */
    documentType = input('', ...(ngDevMode ? [{ debugName: "documentType" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsFolderHeaderComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsFolderHeaderComponent, isStandalone: true, selector: "nxs-folder-header", inputs: { heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: false, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null }, subheading: { classPropertyName: "subheading", publicName: "subheading", isSignal: true, isRequired: false, transformFunction: null }, documentType: { classPropertyName: "documentType", publicName: "documentType", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-folder-header" }, ngImport: i0, template: "<div class=\"nxs-folder-header__lead\">\n  @if (documentType()) {\n    <nxs-doc-type-icon class=\"nxs-folder-header__icon\" [type]=\"documentType()\" />\n  }\n  <div class=\"nxs-folder-header__text\">\n    @if (heading()) {\n      @switch (headingLevel()) {\n        @case (2) {\n          <h2 class=\"nxs-folder-header__heading\">{{ heading() }}</h2>\n        }\n        @case (3) {\n          <h3 class=\"nxs-folder-header__heading\">{{ heading() }}</h3>\n        }\n        @case (4) {\n          <h4 class=\"nxs-folder-header__heading\">{{ heading() }}</h4>\n        }\n        @case (5) {\n          <h5 class=\"nxs-folder-header__heading\">{{ heading() }}</h5>\n        }\n        @case (6) {\n          <h6 class=\"nxs-folder-header__heading\">{{ heading() }}</h6>\n        }\n        @default {\n          <h1 class=\"nxs-folder-header__heading\">{{ heading() }}</h1>\n        }\n      }\n    }\n    @if (subheading()) {\n      <span class=\"nxs-folder-header__subheading\">{{ subheading() }}</span>\n    }\n    <ng-content select=\"[nxsFolderHeaderDetail]\" />\n  </div>\n</div>\n<div class=\"nxs-folder-header__actions\">\n  <ng-content />\n</div>\n", styles: [":host{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}.nxs-folder-header__lead{display:flex;flex:1;align-items:center;gap:12px;min-width:0}.nxs-folder-header__icon{--nxs-icon-size: 28px;color:var(--mat-sys-primary)}.nxs-folder-header__text{display:flex;flex:1;flex-direction:column;min-width:0}.nxs-folder-header__heading.nxs-folder-header__heading{margin:0;overflow:hidden;font:inherit;font-size:var(--nxs-folder-header-heading-size, 18px);font-weight:600;letter-spacing:inherit;color:var(--mat-sys-on-surface);text-overflow:ellipsis;white-space:nowrap}.nxs-folder-header__subheading{font-size:12px;color:var(--mat-sys-on-surface-variant)}.nxs-folder-header__actions{display:flex;flex-shrink:0;align-items:center}@media(max-width:600px){:host{flex-direction:column;align-items:flex-start;gap:8px}.nxs-folder-header__actions{align-self:flex-end}}\n"], dependencies: [{ kind: "component", type: NxsDocTypeIconComponent, selector: "nxs-doc-type-icon", inputs: ["type", "label"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsFolderHeaderComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-folder-header', standalone: true, imports: [NxsDocTypeIconComponent], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-folder-header' }, template: "<div class=\"nxs-folder-header__lead\">\n  @if (documentType()) {\n    <nxs-doc-type-icon class=\"nxs-folder-header__icon\" [type]=\"documentType()\" />\n  }\n  <div class=\"nxs-folder-header__text\">\n    @if (heading()) {\n      @switch (headingLevel()) {\n        @case (2) {\n          <h2 class=\"nxs-folder-header__heading\">{{ heading() }}</h2>\n        }\n        @case (3) {\n          <h3 class=\"nxs-folder-header__heading\">{{ heading() }}</h3>\n        }\n        @case (4) {\n          <h4 class=\"nxs-folder-header__heading\">{{ heading() }}</h4>\n        }\n        @case (5) {\n          <h5 class=\"nxs-folder-header__heading\">{{ heading() }}</h5>\n        }\n        @case (6) {\n          <h6 class=\"nxs-folder-header__heading\">{{ heading() }}</h6>\n        }\n        @default {\n          <h1 class=\"nxs-folder-header__heading\">{{ heading() }}</h1>\n        }\n      }\n    }\n    @if (subheading()) {\n      <span class=\"nxs-folder-header__subheading\">{{ subheading() }}</span>\n    }\n    <ng-content select=\"[nxsFolderHeaderDetail]\" />\n  </div>\n</div>\n<div class=\"nxs-folder-header__actions\">\n  <ng-content />\n</div>\n", styles: [":host{display:flex;align-items:center;justify-content:space-between;gap:12px;min-width:0}.nxs-folder-header__lead{display:flex;flex:1;align-items:center;gap:12px;min-width:0}.nxs-folder-header__icon{--nxs-icon-size: 28px;color:var(--mat-sys-primary)}.nxs-folder-header__text{display:flex;flex:1;flex-direction:column;min-width:0}.nxs-folder-header__heading.nxs-folder-header__heading{margin:0;overflow:hidden;font:inherit;font-size:var(--nxs-folder-header-heading-size, 18px);font-weight:600;letter-spacing:inherit;color:var(--mat-sys-on-surface);text-overflow:ellipsis;white-space:nowrap}.nxs-folder-header__subheading{font-size:12px;color:var(--mat-sys-on-surface-variant)}.nxs-folder-header__actions{display:flex;flex-shrink:0;align-items:center}@media(max-width:600px){:host{flex-direction:column;align-items:flex-start;gap:8px}.nxs-folder-header__actions{align-self:flex-end}}\n"] }]
        }], propDecorators: { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], subheading: [{ type: i0.Input, args: [{ isSignal: true, alias: "subheading", required: false }] }], documentType: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentType", required: false }] }] } });

/**
 * Chooses a destination folder, as a `MatDialog`: `dialog.open(NxsFolderPickerDialogComponent,
 * { data })`, then `afterClosed()` gives the folder, or nothing when cancelled.
 *
 * It opens on a folder and lists the folders in it; the user goes into one, or up a level, and
 * chooses the folder on screen. It reads the repository through `BrowseService` with the
 * application's credentials, and says why when it cannot: no access to a folder, a folder gone,
 * or a failure with Retry. It only chooses; the page copies or moves.
 */
class NxsFolderPickerDialogComponent {
    dialogRef = inject(MatDialogRef);
    browse = inject(BrowseService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    path = signal(normalizeNuxeoPath(this.data.initialPath || '/default-domain'), ...(ngDevMode ? [{ debugName: "path" }] : []));
    folder = signal(null, ...(ngDevMode ? [{ debugName: "folder" }] : []));
    folders = signal([], ...(ngDevMode ? [{ debugName: "folders" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failure = signal(null, ...(ngDevMode ? [{ debugName: "failure" }] : []));
    trail = computed(() => segmentsOf(this.path()), ...(ngDevMode ? [{ debugName: "trail" }] : []));
    canGoUp = computed(() => segmentsOf(this.path()).length > 1, ...(ngDevMode ? [{ debugName: "canGoUp" }] : []));
    /** Why the folder on screen cannot be chosen, if it cannot. */
    refusal = computed(() => {
        const path = this.path();
        const exclude = this.data.excludePath;
        if (exclude && isSameOrInside(path, exclude))
            return 'inside';
        const parent = this.data.currentParentPath;
        if (parent && normalizeNuxeoPath(parent) === path)
            return 'already';
        return null;
    }, ...(ngDevMode ? [{ debugName: "refusal" }] : []));
    canChoose = computed(() => !this.loading() && this.failure() === null && this.folder() !== null && !this.refusal(), ...(ngDevMode ? [{ debugName: "canChoose" }] : []));
    constructor() {
        this.load();
    }
    load() {
        const path = this.path();
        this.loading.set(true);
        this.failure.set(null);
        forkJoin({
            folder: this.browse.getByPath(path),
            children: this.browse.getChildren(path, 200, 0),
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: ({ folder, children }) => {
                if (path !== this.path())
                    return;
                this.loading.set(false);
                if (!isFolderishDocument(folder)) {
                    this.folder.set(null);
                    this.folders.set([]);
                    this.failure.set('not-a-folder');
                    return;
                }
                this.folder.set(folder);
                this.folders.set((children.entries ?? [])
                    .filter((doc) => isFolderishDocument(doc))
                    .sort((a, b) => (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })));
            },
            error: (error) => {
                if (path !== this.path())
                    return;
                this.loading.set(false);
                this.folder.set(null);
                this.folders.set([]);
                this.failure.set(nxsErrorStatus(error));
            },
        });
    }
    open(doc) {
        if (!doc.path)
            return;
        this.path.set(normalizeNuxeoPath(doc.path));
        this.load();
    }
    up() {
        if (!this.canGoUp())
            return;
        this.path.set(`/${segmentsOf(this.path()).slice(0, -1).join('/')}`);
        this.load();
    }
    choose() {
        const folder = this.folder();
        if (!this.canChoose() || !folder)
            return;
        this.dialogRef.close({ uid: folder.uid, path: this.path(), title: folder.title ?? '' });
    }
    cancel() {
        this.dialogRef.close();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsFolderPickerDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsFolderPickerDialogComponent, isStandalone: true, selector: "nxs-folder-picker-dialog", host: { classAttribute: "nxs-folder-picker-dialog" }, ngImport: i0, template: "<h2 mat-dialog-title>{{ data.heading }}</h2>\n<mat-dialog-content class=\"nxs-folder-picker-dialog__body\">\n  <nav\n    class=\"nxs-folder-picker-dialog__location\"\n    [attr.aria-label]=\"'satori-components.folder-picker.location' | translate\"\n  >\n    <button\n      mat-icon-button\n      type=\"button\"\n      [disabled]=\"!canGoUp() || loading()\"\n      [attr.aria-label]=\"'satori-components.folder-picker.up' | translate\"\n      (click)=\"up()\"\n    >\n      <mat-icon aria-hidden=\"true\">arrow_upward</mat-icon>\n    </button>\n    <span class=\"nxs-folder-picker-dialog__trail\" aria-live=\"polite\">{{\n      trail().join(' \u203A ')\n    }}</span>\n  </nav>\n\n  @if (loading()) {\n    <div class=\"nxs-folder-picker-dialog__state\">\n      <nxs-spinner diameter=\"28\" [label]=\"'satori-components.folder-picker.loading' | translate\" />\n    </div>\n  } @else if (failure(); as reason) {\n    <div class=\"nxs-folder-picker-dialog__failure\" role=\"alert\">\n      @switch (reason) {\n        @case (403) {\n          {{ 'satori-components.folder-picker.forbidden' | translate }}\n        }\n        @case (404) {\n          {{ 'satori-components.folder-picker.not-found' | translate }}\n        }\n        @case ('not-a-folder') {\n          {{ 'satori-components.folder-picker.not-a-folder' | translate }}\n        }\n        @default {\n          {{ 'satori-components.folder-picker.failed' | translate }}\n          <button mat-stroked-button type=\"button\" (click)=\"load()\">\n            {{ 'satori-components.folder-picker.retry' | translate }}\n          </button>\n        }\n      }\n    </div>\n  } @else if (folders().length === 0) {\n    <p class=\"nxs-folder-picker-dialog__empty\">\n      {{ 'satori-components.folder-picker.empty' | translate }}\n    </p>\n  } @else {\n    <ul\n      class=\"nxs-folder-picker-dialog__list\"\n      [attr.aria-label]=\"'satori-components.folder-picker.folders' | translate\"\n    >\n      @for (doc of folders(); track doc.uid) {\n        <li>\n          <button type=\"button\" class=\"nxs-folder-picker-dialog__folder\" (click)=\"open(doc)\">\n            <mat-icon class=\"nxs-folder-picker-dialog__folder-icon\" aria-hidden=\"true\"\n              >folder</mat-icon\n            >\n            <span class=\"nxs-folder-picker-dialog__folder-title\">{{ doc.title }}</span>\n            <mat-icon class=\"nxs-folder-picker-dialog__chevron\" aria-hidden=\"true\"\n              >chevron_right</mat-icon\n            >\n          </button>\n        </li>\n      }\n    </ul>\n  }\n  @if (refusal(); as why) {\n    <p class=\"nxs-folder-picker-dialog__refusal\">\n      {{\n        (why === 'inside'\n          ? 'satori-components.folder-picker.inside-itself'\n          : 'satori-components.folder-picker.already-here'\n        ) | translate\n      }}\n    </p>\n  }\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" (click)=\"cancel()\">\n    {{ 'satori-components.folder-picker.cancel' | translate }}\n  </button>\n  <button mat-flat-button type=\"button\" [disabled]=\"!canChoose()\" (click)=\"choose()\">\n    {{ data.confirmLabel }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;width:520px;max-width:100%}.nxs-folder-picker-dialog__location{display:flex;align-items:center;gap:8px;margin-bottom:12px}.nxs-folder-picker-dialog__trail{font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface);overflow-wrap:anywhere}.nxs-folder-picker-dialog__state{display:flex;justify-content:center;padding:24px 0}.nxs-folder-picker-dialog__failure,.nxs-folder-picker-dialog__refusal{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:8px 0;font:var(--mat-sys-body-medium);color:var(--mat-sys-error)}.nxs-folder-picker-dialog__refusal{color:var(--mat-sys-on-surface-variant)}.nxs-folder-picker-dialog__empty{margin:8px 0;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant)}.nxs-folder-picker-dialog__list{max-height:280px;margin:0;padding:0;overflow-y:auto;list-style:none;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-folder-picker-dialog__folder{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:0;border-bottom:1px solid var(--mat-sys-outline-variant);background:none;font:inherit;color:var(--mat-sys-on-surface);text-align:start;cursor:pointer}.nxs-folder-picker-dialog__folder:hover{background:var(--mat-sys-surface-container)}.nxs-folder-picker-dialog__folder:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-folder-picker-dialog__folder:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}li:last-child .nxs-folder-picker-dialog__folder{border-bottom:0}.nxs-folder-picker-dialog__folder-icon{flex-shrink:0;color:var(--mat-sys-primary)}.nxs-folder-picker-dialog__folder-title{flex:1}.nxs-folder-picker-dialog__chevron{flex-shrink:0;color:var(--mat-sys-on-surface-variant)}:host-context([dir=rtl]) .nxs-folder-picker-dialog__chevron{transform:scaleX(-1)}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i2$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i2$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "component", type: NxsSpinnerComponent, selector: "nxs-spinner", inputs: ["diameter", "label"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsFolderPickerDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-folder-picker-dialog', standalone: true, imports: [MatButtonModule, MatDialogModule, MatIconModule, NxsSpinnerComponent, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-folder-picker-dialog' }, template: "<h2 mat-dialog-title>{{ data.heading }}</h2>\n<mat-dialog-content class=\"nxs-folder-picker-dialog__body\">\n  <nav\n    class=\"nxs-folder-picker-dialog__location\"\n    [attr.aria-label]=\"'satori-components.folder-picker.location' | translate\"\n  >\n    <button\n      mat-icon-button\n      type=\"button\"\n      [disabled]=\"!canGoUp() || loading()\"\n      [attr.aria-label]=\"'satori-components.folder-picker.up' | translate\"\n      (click)=\"up()\"\n    >\n      <mat-icon aria-hidden=\"true\">arrow_upward</mat-icon>\n    </button>\n    <span class=\"nxs-folder-picker-dialog__trail\" aria-live=\"polite\">{{\n      trail().join(' \u203A ')\n    }}</span>\n  </nav>\n\n  @if (loading()) {\n    <div class=\"nxs-folder-picker-dialog__state\">\n      <nxs-spinner diameter=\"28\" [label]=\"'satori-components.folder-picker.loading' | translate\" />\n    </div>\n  } @else if (failure(); as reason) {\n    <div class=\"nxs-folder-picker-dialog__failure\" role=\"alert\">\n      @switch (reason) {\n        @case (403) {\n          {{ 'satori-components.folder-picker.forbidden' | translate }}\n        }\n        @case (404) {\n          {{ 'satori-components.folder-picker.not-found' | translate }}\n        }\n        @case ('not-a-folder') {\n          {{ 'satori-components.folder-picker.not-a-folder' | translate }}\n        }\n        @default {\n          {{ 'satori-components.folder-picker.failed' | translate }}\n          <button mat-stroked-button type=\"button\" (click)=\"load()\">\n            {{ 'satori-components.folder-picker.retry' | translate }}\n          </button>\n        }\n      }\n    </div>\n  } @else if (folders().length === 0) {\n    <p class=\"nxs-folder-picker-dialog__empty\">\n      {{ 'satori-components.folder-picker.empty' | translate }}\n    </p>\n  } @else {\n    <ul\n      class=\"nxs-folder-picker-dialog__list\"\n      [attr.aria-label]=\"'satori-components.folder-picker.folders' | translate\"\n    >\n      @for (doc of folders(); track doc.uid) {\n        <li>\n          <button type=\"button\" class=\"nxs-folder-picker-dialog__folder\" (click)=\"open(doc)\">\n            <mat-icon class=\"nxs-folder-picker-dialog__folder-icon\" aria-hidden=\"true\"\n              >folder</mat-icon\n            >\n            <span class=\"nxs-folder-picker-dialog__folder-title\">{{ doc.title }}</span>\n            <mat-icon class=\"nxs-folder-picker-dialog__chevron\" aria-hidden=\"true\"\n              >chevron_right</mat-icon\n            >\n          </button>\n        </li>\n      }\n    </ul>\n  }\n  @if (refusal(); as why) {\n    <p class=\"nxs-folder-picker-dialog__refusal\">\n      {{\n        (why === 'inside'\n          ? 'satori-components.folder-picker.inside-itself'\n          : 'satori-components.folder-picker.already-here'\n        ) | translate\n      }}\n    </p>\n  }\n</mat-dialog-content>\n<mat-dialog-actions align=\"end\">\n  <button mat-button type=\"button\" (click)=\"cancel()\">\n    {{ 'satori-components.folder-picker.cancel' | translate }}\n  </button>\n  <button mat-flat-button type=\"button\" [disabled]=\"!canChoose()\" (click)=\"choose()\">\n    {{ data.confirmLabel }}\n  </button>\n</mat-dialog-actions>\n", styles: [":host{display:block;width:520px;max-width:100%}.nxs-folder-picker-dialog__location{display:flex;align-items:center;gap:8px;margin-bottom:12px}.nxs-folder-picker-dialog__trail{font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface);overflow-wrap:anywhere}.nxs-folder-picker-dialog__state{display:flex;justify-content:center;padding:24px 0}.nxs-folder-picker-dialog__failure,.nxs-folder-picker-dialog__refusal{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:8px 0;font:var(--mat-sys-body-medium);color:var(--mat-sys-error)}.nxs-folder-picker-dialog__refusal{color:var(--mat-sys-on-surface-variant)}.nxs-folder-picker-dialog__empty{margin:8px 0;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant)}.nxs-folder-picker-dialog__list{max-height:280px;margin:0;padding:0;overflow-y:auto;list-style:none;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-folder-picker-dialog__folder{display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border:0;border-bottom:1px solid var(--mat-sys-outline-variant);background:none;font:inherit;color:var(--mat-sys-on-surface);text-align:start;cursor:pointer}.nxs-folder-picker-dialog__folder:hover{background:var(--mat-sys-surface-container)}.nxs-folder-picker-dialog__folder:focus{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}.nxs-folder-picker-dialog__folder:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:-2px}li:last-child .nxs-folder-picker-dialog__folder{border-bottom:0}.nxs-folder-picker-dialog__folder-icon{flex-shrink:0;color:var(--mat-sys-primary)}.nxs-folder-picker-dialog__folder-title{flex:1}.nxs-folder-picker-dialog__chevron{flex-shrink:0;color:var(--mat-sys-on-surface-variant)}:host-context([dir=rtl]) .nxs-folder-picker-dialog__chevron{transform:scaleX(-1)}\n"] }]
        }], ctorParameters: () => [] });
/**
 * A path's names, exactly as Nuxeo gave them. Every path here comes from the server, and Nuxeo's
 * names are case-sensitive: `/ws/Folder` and `/ws/folder` are two folders.
 */
function segmentsOf(path) {
    return normalizeNuxeoPath(path).split('/').filter(Boolean);
}
function isSameOrInside(path, container) {
    const inner = segmentsOf(path);
    const outer = segmentsOf(container);
    return (outer.length > 0 &&
        outer.length <= inner.length &&
        outer.every((segment, i) => segment === inner[i]));
}

/**
 * `{{ 'common.date-mask' | translate | nxsDateMask }}`: the translated date hint, in the order and
 * with the separators the field's own date adapter writes a date in, so the hint reads what the
 * field parses wherever the adapter reads back the dates it writes. See `nxsDateMask`.
 *
 * The adapter is the one the component using the pipe injects: `provideNxsDateAdapter()`'s, or the
 * host's own when it has one. The translate pipe upstream owns the words and the language.
 *
 * Impure, because a host can switch the adapter's locale while the translated text stays the same,
 * and the parser follows that at once; the hint then follows it on the next check.
 */
class NxsDateMaskPipe {
    adapter = inject(DateAdapter);
    formats = inject(MAT_DATE_FORMATS);
    translate = inject(TranslateService);
    transform(translatedMask) {
        const { year, month, day } = NXS_DATE_MASK_SAMPLE;
        const written = this.adapter.format(this.adapter.createDate(year, month, day), this.formats.display.dateInput);
        return nxsDateMask(written, translatedMask ?? '', this.translate.getCurrentLang() ?? '');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDateMaskPipe, deps: [], target: i0.ɵɵFactoryTarget.Pipe });
    static ɵpipe = i0.ɵɵngDeclarePipe({ minVersion: "14.0.0", version: "20.3.33", ngImport: i0, type: NxsDateMaskPipe, isStandalone: true, name: "nxsDateMask", pure: false });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsDateMaskPipe, decorators: [{
            type: Pipe,
            args: [{ name: 'nxsDateMask', standalone: true, pure: false }]
        }] });

/**
 * Marks the template every tab body renders from: `<ng-template nxsTabBody let-tab>`, usually an
 * `@switch (tab.id)` over the packaged bodies with an extension outlet as the default.
 */
class NxsTabBodyDirective {
    template = inject(TemplateRef);
    static ngTemplateContextGuard(_directive, _context) {
        return true;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTabBodyDirective, deps: [], target: i0.ɵɵFactoryTarget.Directive });
    static ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "20.3.33", type: NxsTabBodyDirective, isStandalone: true, selector: "ng-template[nxsTabBody]", ngImport: i0 });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTabBodyDirective, decorators: [{
            type: Directive,
            args: [{ selector: 'ng-template[nxsTabBody]', standalone: true }]
        }] });

/**
 * IBM Equal Access `aria_keyboard_handler_exists` only counts an inline key handler on the
 * `role="tablist"` node, and Material binds its arrow keys on the label container instead. An inert
 * inline handler satisfies the static rule; Material still does the navigation.
 */
const TABLIST_KEYDOWN_ATTR = 'data-satori-tablist-keydown';
const TABLIST_INERT_ONKEYDOWN = 'void(0)';
/**
 * The tab strip of a document page — Web UI's `nuxeo-document-page` view tabs.
 *
 * Renders the tabs the host resolved, in order, and every body from the one template the host marks
 * with `nxsTabBody`, so a tab a manifest adds renders through the same template as a packaged one.
 * Selection is by index, two-way (`[(selectedIndex)]`), so the host can switch tabs itself, as the
 * Publications count does; `selectedTabChange` also names the tab by ID, which stays right when a
 * manifest hides or reorders tabs.
 */
class NxsTabsComponent {
    /** The tabs, in display order. */
    tabs = input.required(...(ngDevMode ? [{ debugName: "tabs" }] : []));
    /** The tab list's accessible name, already translated. Optional. */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    /** The selected tab's position. Two-way. */
    selectedIndex = model(0, ...(ngDevMode ? [{ debugName: "selectedIndex" }] : []));
    /** The tab the user (or the host) selected, by ID. */
    selectedTabChange = output();
    body = contentChild(NxsTabBodyDirective, ...(ngDevMode ? [{ debugName: "body" }] : []));
    ownLabel = computed(() => this.label().trim(), ...(ngDevMode ? [{ debugName: "ownLabel" }] : []));
    host = inject(ElementRef);
    constructor() {
        afterRenderEffect(() => {
            this.tabs();
            const tabList = this.host.nativeElement.querySelector('.mat-mdc-tab-list[role="tablist"]');
            if (!tabList || tabList.hasAttribute(TABLIST_KEYDOWN_ATTR))
                return;
            if (!tabList.hasAttribute('onkeydown')) {
                tabList.setAttribute('onkeydown', TABLIST_INERT_ONKEYDOWN);
            }
            tabList.setAttribute(TABLIST_KEYDOWN_ATTR, 'true');
        });
    }
    select(index) {
        this.selectedIndex.set(index);
        const tab = this.tabs()[index];
        if (tab)
            this.selectedTabChange.emit(tab);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTabsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsTabsComponent, isStandalone: true, selector: "nxs-tabs", inputs: { tabs: { classPropertyName: "tabs", publicName: "tabs", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null }, selectedIndex: { classPropertyName: "selectedIndex", publicName: "selectedIndex", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selectedIndex: "selectedIndexChange", selectedTabChange: "selectedTabChange" }, host: { classAttribute: "nxs-tabs" }, queries: [{ propertyName: "body", first: true, predicate: NxsTabBodyDirective, descendants: true, isSignal: true }], ngImport: i0, template: "<mat-tab-group\n  class=\"nxs-tabs__group\"\n  animationDuration=\"0ms\"\n  [aria-label]=\"ownLabel()\"\n  [selectedIndex]=\"selectedIndex()\"\n  (selectedIndexChange)=\"select($event)\"\n>\n  @for (tab of tabs(); track tab.id) {\n    <mat-tab>\n      <ng-template mat-tab-label>\n        <span class=\"nxs-tabs__label\" [attr.data-tab-id]=\"tab.id\">\n          @if (tab.icon) {\n            <mat-icon class=\"nxs-tabs__icon\" aria-hidden=\"true\">{{ tab.icon }}</mat-icon>\n          }\n          {{ tab.label }}\n        </span>\n      </ng-template>\n      @if (body(); as bodyTemplate) {\n        <ng-container\n          [ngTemplateOutlet]=\"bodyTemplate.template\"\n          [ngTemplateOutletContext]=\"{ $implicit: tab }\"\n        />\n      }\n    </mat-tab>\n  }\n</mat-tab-group>\n", styles: [":host{--nxs-tabs-header-surface: var(--mat-sys-surface);--nxs-tabs-header-border: var(--mat-sys-outline-variant);--nxs-tabs-focus-outline: var(--mat-sys-primary);--nxs-tabs-icon-color: var(--mat-sys-primary);display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.nxs-tabs__group{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}.nxs-tabs__group ::ng-deep .mat-mdc-tab-header{background:var(--nxs-tabs-header-surface);border-bottom:1px solid var(--nxs-tabs-header-border);flex-shrink:0}.nxs-tabs__group ::ng-deep .mat-mdc-tab-labels{gap:0;justify-content:flex-start}.nxs-tabs__group ::ng-deep .mat-mdc-tab{flex-grow:0!important;min-width:0;padding:0 20px;font-size:13px;letter-spacing:0}.nxs-tabs__group ::ng-deep .mat-mdc-tab:focus{outline:2px solid var(--nxs-tabs-focus-outline);outline-offset:-2px}.nxs-tabs__group ::ng-deep .mat-mdc-tab-body-wrapper{flex:1;min-height:0;overflow:hidden}.nxs-tabs__group ::ng-deep .mat-mdc-tab-body{height:100%}.nxs-tabs__group ::ng-deep .mat-mdc-tab-body-content{height:100%;overflow:hidden;display:flex;flex-direction:column}.nxs-tabs__label{display:inline-flex;align-items:center;gap:6px}.nxs-tabs__icon{font-size:18px;width:18px;height:18px;color:var(--nxs-tabs-icon-color)}\n"], dependencies: [{ kind: "ngmodule", type: MatTabsModule }, { kind: "directive", type: i1$5.MatTabLabel, selector: "[mat-tab-label], [matTabLabel]" }, { kind: "component", type: i1$5.MatTab, selector: "mat-tab", inputs: ["disabled", "label", "aria-label", "aria-labelledby", "labelClass", "bodyClass", "id"], exportAs: ["matTab"] }, { kind: "component", type: i1$5.MatTabGroup, selector: "mat-tab-group", inputs: ["color", "fitInkBarToContent", "mat-stretch-tabs", "mat-align-tabs", "dynamicHeight", "selectedIndex", "headerPosition", "animationDuration", "contentTabIndex", "disablePagination", "disableRipple", "preserveContent", "backgroundColor", "aria-label", "aria-labelledby"], outputs: ["selectedIndexChange", "focusChange", "animationDone", "selectedTabChange"], exportAs: ["matTabGroup"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTabsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-tabs', standalone: true, imports: [MatTabsModule, MatIconModule, NgTemplateOutlet], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-tabs' }, template: "<mat-tab-group\n  class=\"nxs-tabs__group\"\n  animationDuration=\"0ms\"\n  [aria-label]=\"ownLabel()\"\n  [selectedIndex]=\"selectedIndex()\"\n  (selectedIndexChange)=\"select($event)\"\n>\n  @for (tab of tabs(); track tab.id) {\n    <mat-tab>\n      <ng-template mat-tab-label>\n        <span class=\"nxs-tabs__label\" [attr.data-tab-id]=\"tab.id\">\n          @if (tab.icon) {\n            <mat-icon class=\"nxs-tabs__icon\" aria-hidden=\"true\">{{ tab.icon }}</mat-icon>\n          }\n          {{ tab.label }}\n        </span>\n      </ng-template>\n      @if (body(); as bodyTemplate) {\n        <ng-container\n          [ngTemplateOutlet]=\"bodyTemplate.template\"\n          [ngTemplateOutletContext]=\"{ $implicit: tab }\"\n        />\n      }\n    </mat-tab>\n  }\n</mat-tab-group>\n", styles: [":host{--nxs-tabs-header-surface: var(--mat-sys-surface);--nxs-tabs-header-border: var(--mat-sys-outline-variant);--nxs-tabs-focus-outline: var(--mat-sys-primary);--nxs-tabs-icon-color: var(--mat-sys-primary);display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}.nxs-tabs__group{flex:1;display:flex;flex-direction:column;min-height:0;overflow:hidden}.nxs-tabs__group ::ng-deep .mat-mdc-tab-header{background:var(--nxs-tabs-header-surface);border-bottom:1px solid var(--nxs-tabs-header-border);flex-shrink:0}.nxs-tabs__group ::ng-deep .mat-mdc-tab-labels{gap:0;justify-content:flex-start}.nxs-tabs__group ::ng-deep .mat-mdc-tab{flex-grow:0!important;min-width:0;padding:0 20px;font-size:13px;letter-spacing:0}.nxs-tabs__group ::ng-deep .mat-mdc-tab:focus{outline:2px solid var(--nxs-tabs-focus-outline);outline-offset:-2px}.nxs-tabs__group ::ng-deep .mat-mdc-tab-body-wrapper{flex:1;min-height:0;overflow:hidden}.nxs-tabs__group ::ng-deep .mat-mdc-tab-body{height:100%}.nxs-tabs__group ::ng-deep .mat-mdc-tab-body-content{height:100%;overflow:hidden;display:flex;flex-direction:column}.nxs-tabs__label{display:inline-flex;align-items:center;gap:6px}.nxs-tabs__icon{font-size:18px;width:18px;height:18px;color:var(--nxs-tabs-icon-color)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { tabs: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabs", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }], selectedIndex: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedIndex", required: false }] }, { type: i0.Output, args: ["selectedIndexChange"] }], selectedTabChange: [{ type: i0.Output, args: ["selectedTabChange"] }], body: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NxsTabBodyDirective), { isSignal: true }] }] } });

/** Deeper complex fields are shown read-only: no schema shipped with Nuxeo nests further. */
const MAX_COMPLEX_DEPTH = 4;
const NUMBER_TYPES = new Set(['long', 'integer', 'double']);
const INTEGER_TYPES = new Set(['long', 'integer']);
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const baseType = (definition) => definition.type.endsWith('[]') ? definition.type.slice(0, -2) : definition.type;
const isList = (definition) => definition.type.endsWith('[]');
function fieldKind(definition, depth = 0) {
    const base = baseType(definition);
    if (base === 'complex') {
        const editable = depth < MAX_COMPLEX_DEPTH && Object.keys(definition.fields ?? {}).length > 0;
        if (!editable)
            return 'read-only';
        return isList(definition) ? 'complex-list' : 'complex';
    }
    if (base === 'blob')
        return 'read-only';
    if (isList(definition))
        return definition.directory ? 'vocabulary-list' : 'list';
    if (definition.directory)
        return 'vocabulary';
    if (NUMBER_TYPES.has(base))
        return 'number';
    if (base === 'date')
        return 'date';
    if (base === 'boolean')
        return 'boolean';
    return 'text';
}
const isEmpty = (value) => value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);
/** Nuxeo matches a pattern against the whole value; an expression JavaScript cannot compile is not checked. */
function wholeMatch(pattern) {
    try {
        return new RegExp(`^(?:${pattern})$`, 'u');
    }
    catch {
        return null;
    }
}
/** The errors one scalar value has against its constraints. An empty value has none. */
function scalarErrors(value, base, constraints) {
    if (isEmpty(value))
        return null;
    if (NUMBER_TYPES.has(base)) {
        if (typeof value !== 'number' || !Number.isFinite(value))
            return { number: true };
        if (INTEGER_TYPES.has(base) && !Number.isInteger(value))
            return { integer: true };
        const { minimum, maximum, minimumInclusive = true, maximumInclusive = true } = constraints;
        if (minimum !== undefined && (minimumInclusive ? value < minimum : value <= minimum)) {
            return { minimum: { bound: minimum, inclusive: minimumInclusive } };
        }
        if (maximum !== undefined && (maximumInclusive ? value > maximum : value >= maximum)) {
            return { maximum: { bound: maximum, inclusive: maximumInclusive } };
        }
        return null;
    }
    if (typeof value !== 'string')
        return null;
    const text = value.trim();
    if (constraints.minLength !== undefined && text.length < constraints.minLength) {
        return { minLength: { count: constraints.minLength } };
    }
    if (constraints.maxLength !== undefined && text.length > constraints.maxLength) {
        return { maxLength: { count: constraints.maxLength } };
    }
    const pattern = constraints.pattern === undefined ? null : wholeMatch(constraints.pattern);
    if (pattern && !pattern.test(text))
        return { pattern: true };
    return null;
}
function validatorFor(definition) {
    const base = baseType(definition);
    const constraints = definition.constraints ?? {};
    const list = isList(definition);
    return (control) => {
        const value = control.value;
        if (definition.required && isEmpty(value))
            return { required: true };
        if (!list)
            return scalarErrors(value, base, constraints);
        const items = Array.isArray(value) ? value : [];
        return items.some((item) => scalarErrors(item, base, constraints) !== null)
            ? { item: true }
            : null;
    };
}
function toDate(value) {
    if (value instanceof Date)
        return value;
    if (typeof value !== 'string' || value === '')
        return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}
/**
 * The instant each date control was built from, for a date adapter that does not hold JS dates. A
 * Nuxeo date property is an instant, and the datepicker edits only its day; an adapter holding JS
 * dates keeps the instant in the control's value itself, but one holding calendar days does not.
 * So the instant is written back while the control still names its day, as it is for JS dates.
 */
const builtInstants = new WeakMap();
/** A date field's control, holding the property's date as `adapter` holds dates. */
function dateControl(definition, value, adapter) {
    const instant = toDate(value);
    const control = new FormControl(nxsDateToAdapter(adapter, instant), validatorFor(definition));
    if (instant)
        builtInstants.set(control, instant);
    return control;
}
/**
 * A date field's value as the property takes it, an ISO 8601 instant: the instant it was built
 * from while it names the same local day, otherwise that day's local midnight — what a JS date
 * picked in the field is. `null` when it holds no valid date.
 */
function dateProperty(control, adapter) {
    const day = nxsDateFromAdapter(adapter, control.value);
    if (!day)
        return null;
    const instant = builtInstants.get(control);
    const sameDay = !!instant &&
        instant.getFullYear() === day.getFullYear() &&
        instant.getMonth() === day.getMonth() &&
        instant.getDate() === day.getDate();
    return (sameDay ? instant : day).toISOString();
}
function toNumber(value) {
    if (typeof value === 'number')
        return value;
    if (typeof value !== 'string' || value.trim() === '')
        return null;
    return Number(value);
}
function scalarValue(base, value) {
    if (NUMBER_TYPES.has(base))
        return toNumber(value);
    if (base === 'date')
        return toDate(value);
    if (base === 'boolean')
        return value === true || value === 'true';
    if (typeof value === 'string')
        return value;
    return value === null || value === undefined ? '' : String(value);
}
function complexGroup(definition, value, adapter, depth) {
    const record = isRecord(value) ? value : {};
    const fields = definition.fields ?? {};
    const controls = {};
    for (const name of Object.keys(fields)) {
        controls[name] = buildControl(fields[name], record[name], adapter, depth + 1);
    }
    return new FormGroup(controls);
}
/** One complex list item, empty, for the "Add" button. */
function newComplexItem(definition, adapter, depth) {
    return complexGroup(definition, {}, adapter, depth);
}
/**
 * The control for one field, holding its current value in the shape its form control edits. A
 * date field's value is a date as `adapter`, the datepicker's, holds dates: a JS `Date` for
 * Material's native adapter and date-fns, a Luxon `DateTime` for Luxon's.
 */
function buildControl(definition, value, adapter, depth = 0) {
    const kind = fieldKind(definition, depth);
    if (kind === 'read-only')
        return new FormControl({ value, disabled: true });
    if (kind === 'complex')
        return complexGroup(definition, value, adapter, depth);
    if (kind === 'complex-list') {
        const items = Array.isArray(value) ? value : [];
        const required = (control) => definition.required && control.length === 0 ? { required: true } : null;
        return new FormArray(items.map((item) => complexGroup(definition, item, adapter, depth)), required);
    }
    if (kind === 'date')
        return dateControl(definition, value, adapter);
    const base = baseType(definition);
    const initial = kind === 'list' || kind === 'vocabulary-list'
        ? (Array.isArray(value) ? value : []).map((item) => scalarValue(base, item))
        : scalarValue(base, value);
    return new FormControl(initial, validatorFor(definition));
}
/**
 * A control's value as the document property takes it. A date is an ISO 8601 instant whatever
 * `adapter`, the one the control was built with, holds dates as.
 */
function propertyValue(definition, control, adapter, depth = 0, multiline = false) {
    const kind = fieldKind(definition, depth);
    if (kind === 'complex' && control instanceof FormGroup) {
        const fields = definition.fields ?? {};
        const out = {};
        for (const name of Object.keys(fields)) {
            const child = control.controls[name];
            if (child)
                out[name] = propertyValue(fields[name], child, adapter, depth + 1);
        }
        return out;
    }
    if (kind === 'complex-list' && control instanceof FormArray) {
        return control.controls.map((item) => propertyValue({ ...definition, type: 'complex' }, item, adapter, depth));
    }
    const value = control.value;
    if (value instanceof Date)
        return value.toISOString();
    if (kind === 'date')
        return dateProperty(control, adapter);
    if (typeof value === 'string') {
        if (value.trim() === '')
            return null;
        return multiline ? value : value.trim();
    }
    return value ?? null;
}
/** The error to show for a control, most fundamental first: one message at a time. */
function firstError(control) {
    const errors = control.errors;
    if (!errors)
        return null;
    if (typeof errors['server'] === 'string')
        return { key: 'server', params: { message: errors['server'] } };
    if (errors['required'])
        return { key: 'required', params: {} };
    if (errors['matDatepickerParse'])
        return { key: 'date', params: {} };
    for (const key of ['number', 'integer', 'pattern', 'item']) {
        if (errors[key])
            return { key, params: {} };
    }
    for (const key of ['minLength', 'maxLength']) {
        if (isRecord(errors[key]))
            return { key, params: errors[key] };
    }
    for (const key of ['minimum', 'maximum']) {
        const error = errors[key];
        if (isRecord(error)) {
            return { key: `${key}${error['inclusive'] === false ? '-exclusive' : ''}`, params: error };
        }
    }
    return { key: 'invalid', params: {} };
}

/** Web UI's `nuxeo-dublincore-edit-layout`, the fields every editable document has. */
const DUBLIN_CORE = [
    {
        xpath: 'dc:title',
        label: '',
        labelKey: 'satori-components.metadata-editor.title',
        definition: { type: 'string', required: true },
    },
    {
        xpath: 'dc:description',
        label: '',
        labelKey: 'satori-components.metadata-editor.description',
        definition: { type: 'string' },
        multiline: true,
    },
    {
        xpath: 'dc:nature',
        label: '',
        labelKey: 'satori-components.metadata-editor.nature',
        definition: { type: 'string', directory: 'nature' },
    },
    {
        xpath: 'dc:subjects',
        label: '',
        labelKey: 'satori-components.metadata-editor.subjects',
        definition: { type: 'string[]', directory: 'l10nsubjects' },
    },
    {
        xpath: 'dc:coverage',
        label: '',
        labelKey: 'satori-components.metadata-editor.coverage',
        definition: { type: 'string', directory: 'l10ncoverage' },
    },
    {
        xpath: 'dc:expired',
        label: '',
        labelKey: 'satori-components.metadata-editor.expires',
        definition: { type: 'date' },
    },
];
const ERROR_KEYS = {
    required: 'satori-components.metadata-editor.error.required',
    date: 'satori-components.metadata-editor.error.date',
    number: 'satori-components.metadata-editor.error.number',
    integer: 'satori-components.metadata-editor.error.integer',
    pattern: 'satori-components.metadata-editor.error.pattern',
    item: 'satori-components.metadata-editor.error.item',
    minLength: 'satori-components.metadata-editor.error.min-length',
    maxLength: 'satori-components.metadata-editor.error.max-length',
    minimum: 'satori-components.metadata-editor.error.minimum',
    'minimum-exclusive': 'satori-components.metadata-editor.error.minimum-exclusive',
    maximum: 'satori-components.metadata-editor.error.maximum',
    'maximum-exclusive': 'satori-components.metadata-editor.error.maximum-exclusive',
    invalid: 'satori-components.metadata-editor.error.invalid',
};
const DUBLIN_CORE_XPATHS = new Set(DUBLIN_CORE.map((field) => field.xpath));
/** `billedAmount` → "Billed amount": a complex field's sub-fields carry no label of their own. */
function humanize(name) {
    const words = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
}
function directoriesOf(definition, into) {
    if (definition.directory)
        into.add(definition.directory);
    for (const child of Object.values(definition.fields ?? {}))
        directoriesOf(child, into);
}
let nextId$7 = 0;
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
class NxsMetadataEditorComponent {
    /** The type's fields beyond Dublin Core, from its layout. A field Dublin Core already has is skipped. */
    sections = input([], ...(ngDevMode ? [{ debugName: "sections" }] : []));
    /** Show `sections` one after another under headings, or as tabs. */
    display = input('sections', ...(ngDevMode ? [{ debugName: "display" }] : []));
    /** The current property values. A new object resets the form and discards what was typed. */
    values = input({}, ...(ngDevMode ? [{ debugName: "values" }] : []));
    /** Show the Dublin Core fields. Off for a type that has no `dublincore` schema. */
    dublinCore = input(true, ...(ngDevMode ? [{ debugName: "dublinCore" }] : []));
    /** While saving: every control is read-only. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : []));
    /** The level of the section headings, one below the dialog or page title. */
    headingLevel = input(3, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** The tab strip's accessible name in tabs display. Empty uses the default. */
    tabsLabel = input('', ...(ngDevMode ? [{ debugName: "tabsLabel" }] : []));
    /** Every value passes its field's constraints, or not. Emitted when that changes. */
    validChange = output();
    directories = inject(DirectoryService);
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    injector = inject(Injector);
    host = inject(ElementRef);
    /** The datepickers' adapter, from `provideNxsDateAdapter()`: date controls hold its dates. */
    dateAdapter = inject(DateAdapter);
    id = `nxs-metadata-editor-${nextId$7++}`;
    form = new FormGroup({});
    /** Bumped whenever controls are added or removed, so the template reads the new set. */
    structure = signal(0, ...(ngDevMode ? [{ debugName: "structure" }] : []));
    submitted = signal(false, ...(ngDevMode ? [{ debugName: "submitted" }] : []));
    invalidCount = signal(0, ...(ngDevMode ? [{ debugName: "invalidCount" }] : []));
    selectedTab = signal(0, ...(ngDevMode ? [{ debugName: "selectedTab" }] : []));
    panelSearch = signal('', ...(ngDevMode ? [{ debugName: "panelSearch" }] : []));
    vocabularies = signal(new Map(), ...(ngDevMode ? [{ debugName: "vocabularies" }] : []));
    requested = new Set();
    builtFrom = null;
    /** Never shown: stands in for a control of an unexpected shape so a binding never throws. */
    detached = new FormControl();
    detachedList = new FormArray([]);
    valid = true;
    /**
     * The server's message per field, with the value it refused. Held as a validator rather than
     * set once with `setErrors`, because re-enabling the form after a save re-runs every validator
     * and would drop it; it lapses as soon as the value differs from the one refused.
     */
    serverMessages = new Map();
    /** Server messages arrived while the form was disabled: reveal them once it is enabled. */
    revealOnEnable = false;
    standardFields = computed(() => this.dublinCore() ? DUBLIN_CORE : [], ...(ngDevMode ? [{ debugName: "standardFields" }] : []));
    typeSections = computed(() => {
        const skip = this.dublinCore() ? DUBLIN_CORE_XPATHS : new Set();
        return this.sections()
            .map((section) => ({
            ...section,
            fields: section.fields.filter((field) => !skip.has(field.xpath)),
        }))
            .filter((section) => section.fields.length > 0);
    }, ...(ngDevMode ? [{ debugName: "typeSections" }] : []));
    tabs = computed(() => this.typeSections().map((section) => ({
        id: section.id,
        label: section.heading ?? section.id,
    })), ...(ngDevMode ? [{ debugName: "tabs" }] : []));
    fields = computed(() => [
        ...this.standardFields(),
        ...this.typeSections().flatMap((section) => section.fields),
    ], ...(ngDevMode ? [{ debugName: "fields" }] : []));
    errorMatcher = {
        isErrorState: (control) => !!control && control.invalid && (control.touched || this.submitted()),
    };
    l10nEntryLabel = l10nEntryLabel;
    directoryPickerLabel = directoryPickerLabel;
    constructor() {
        effect(() => {
            const fields = this.fields();
            const values = this.values();
            untracked(() => this.build(fields, values));
        });
        effect(() => {
            const disabled = this.disabled();
            untracked(() => this.applyDisabled(disabled));
        });
        this.form.statusChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.statusChanged());
    }
    /**
     * Shows every error, announces how many fields need a correction and focuses the first.
     * Answers whether the form can be saved.
     */
    validate() {
        this.form.markAllAsTouched();
        this.form.updateValueAndValidity();
        this.submitted.set(true);
        this.invalidCount.set(this.countInvalid());
        if (this.form.valid)
            return true;
        this.revealFirstInvalid();
        return false;
    }
    /** The values the user changed, by xpath, as the document properties take them. */
    dirtyProperties() {
        return this.collect((control) => control.dirty);
    }
    /** Every value in the form, by xpath — what a new document is created with. */
    properties() {
        return this.collect(() => true);
    }
    /**
     * Puts the server's messages on the fields they name, by xpath, until the value changes.
     * Answers the messages for fields the form does not show, for the host to report another way.
     */
    showServerErrors(errors) {
        const unplaced = [];
        for (const [xpath, message] of Object.entries(errors)) {
            const control = this.form.controls[xpath];
            if (!control) {
                unplaced.push(message);
                continue;
            }
            this.serverMessages.set(xpath, { message, refused: JSON.stringify(control.getRawValue()) });
            control.markAsTouched();
            control.updateValueAndValidity({ emitEvent: false });
        }
        this.submitted.set(true);
        this.form.updateValueAndValidity();
        this.invalidCount.set(this.countInvalid());
        if (this.form.disabled)
            this.revealOnEnable = true;
        else if (this.form.invalid)
            this.revealFirstInvalid();
        return unplaced;
    }
    kindOf(definition, depth) {
        return fieldKind(definition, depth);
    }
    controlFor(field) {
        this.structure();
        return this.form.controls[field.xpath] ?? null;
    }
    asControl(control) {
        return control instanceof FormControl ? control : this.detached;
    }
    asArray(control) {
        return control instanceof FormArray ? control : this.detachedList;
    }
    /** A complex field's sub-fields, labelled from their names. */
    subFields(definition) {
        return Object.entries(definition.fields ?? {}).map(([name, child]) => ({
            xpath: name,
            label: humanize(name),
            definition: child,
        }));
    }
    subControl(group, name) {
        return group instanceof FormGroup ? (group.controls[name] ?? null) : null;
    }
    showError(control) {
        return control.invalid && (control.touched || this.submitted());
    }
    errorOf(control) {
        return firstError(control);
    }
    /** The message for an error, naming the field so it reads on its own in the error summary's wake. */
    errorText(error, label) {
        if (error.key === 'server') {
            const message = error.params['message'];
            return typeof message === 'string' ? message : '';
        }
        const key = ERROR_KEYS[error.key] ?? ERROR_KEYS['invalid'];
        return this.translate.instant(key, { ...error.params, label });
    }
    search(event) {
        if (event.target instanceof HTMLInputElement)
            this.panelSearch.set(event.target.value);
    }
    isRequired(definition) {
        return definition.required === true;
    }
    inputType(definition) {
        return fieldKind(definition) === 'number' ? 'number' : 'text';
    }
    step(definition) {
        return baseType(definition) === 'double'
            ? 'any'
            : fieldKind(definition) === 'number'
                ? '1'
                : null;
    }
    readOnlyText(control) {
        const value = control.value;
        const items = Array.isArray(value) ? value : [value];
        return items
            .map((item) => nxsPropertyText(item))
            .filter((text) => text !== '')
            .join(', ');
    }
    flatOptions(directory) {
        const vocabulary = this.vocabularies().get(directory);
        if (!vocabulary || vocabulary.l10n)
            return [];
        return filterDirectoryPickerEntries([...vocabulary.entries], this.panelSearch());
    }
    groupedOptions(directory) {
        const vocabulary = this.vocabularies().get(directory);
        if (!vocabulary?.l10n)
            return [];
        return groupL10nChildrenByParent([...vocabulary.entries], this.panelSearch());
    }
    usesL10n(directory) {
        return directoryUsesL10nLabel(directory);
    }
    /** A vocabulary value's label, `Parent/Child` for a hierarchical one. The stored ID until loaded. */
    vocabularyLabel(directory, id) {
        if (typeof id !== 'string')
            return '';
        const vocabulary = this.vocabularies().get(directory);
        if (!vocabulary)
            return id;
        if (vocabulary.l10n)
            return formatHierarchicalL10nLabel(id, [...vocabulary.entries]);
        const entry = vocabulary.entries.find((candidate) => candidate.id === id);
        return entry ? directoryPickerLabel(entry) : id;
    }
    listValue(control) {
        return Array.isArray(control.value) ? control.value : [];
    }
    /** Each vocabulary panel opens with an empty search. */
    panelToggled() {
        this.panelSearch.set('');
    }
    clearValue(control, multiple) {
        control.setValue(multiple ? [] : null);
        control.markAsDirty();
        control.markAsTouched();
    }
    removeItem(control, index) {
        control.setValue(this.listValue(control).filter((_, at) => at !== index));
        control.markAsDirty();
        control.markAsTouched();
    }
    addItem(control, definition, event) {
        const text = event.value.trim();
        event.chipInput.clear();
        if (text === '')
            return;
        const item = fieldKind({ type: baseType(definition) }) === 'number' ? Number(text) : text;
        control.setValue([...this.listValue(control), item]);
        control.markAsDirty();
        control.markAsTouched();
    }
    addComplexItem(control, definition, depth) {
        if (!(control instanceof FormArray))
            return;
        control.push(newComplexItem(definition, this.dateAdapter, depth));
        control.markAsDirty();
        this.structure.update((value) => value + 1);
    }
    removeComplexItem(control, index) {
        if (!(control instanceof FormArray))
            return;
        control.removeAt(index);
        control.markAsDirty();
        control.markAsTouched();
        this.structure.update((value) => value + 1);
    }
    selectTab(index) {
        this.selectedTab.set(index);
    }
    build(fields, values) {
        if (values !== this.builtFrom) {
            for (const xpath of Object.keys(this.form.controls))
                this.form.removeControl(xpath, { emitEvent: false });
            this.builtFrom = values;
            this.serverMessages.clear();
            this.submitted.set(false);
            this.invalidCount.set(0);
        }
        const wanted = new Set(fields.map((field) => field.xpath));
        for (const xpath of Object.keys(this.form.controls)) {
            if (wanted.has(xpath))
                continue;
            this.form.removeControl(xpath, { emitEvent: false });
            this.serverMessages.delete(xpath);
        }
        const directories = new Set();
        for (const field of fields) {
            directoriesOf(field.definition, directories);
            if (this.form.controls[field.xpath])
                continue;
            const control = buildControl(field.definition, values[field.xpath], this.dateAdapter);
            control.addValidators(this.heldServerMessage(field.xpath));
            control.updateValueAndValidity({ emitEvent: false });
            this.form.addControl(field.xpath, control, { emitEvent: false });
        }
        this.applyDisabled(untracked(this.disabled));
        this.loadVocabularies(directories);
        this.structure.update((value) => value + 1);
        this.statusChanged();
    }
    applyDisabled(disabled) {
        if (disabled) {
            this.form.disable({ emitEvent: false });
            return;
        }
        this.form.enable({ emitEvent: false });
        for (const field of untracked(this.fields)) {
            const control = this.form.controls[field.xpath];
            if (control)
                this.lockReadOnly(field.definition, control, 0);
        }
        this.statusChanged();
        if (this.revealOnEnable) {
            this.revealOnEnable = false;
            if (this.form.invalid)
                this.revealFirstInvalid();
        }
    }
    heldServerMessage(xpath) {
        return (control) => {
            const held = this.serverMessages.get(xpath);
            return held && JSON.stringify(control.getRawValue()) === held.refused
                ? { server: held.message }
                : null;
        };
    }
    /** `enable()` reaches every control; a file or an unsupported shape stays read-only. */
    lockReadOnly(definition, control, depth) {
        const kind = fieldKind(definition, depth);
        if (kind === 'read-only') {
            control.disable({ emitEvent: false });
            return;
        }
        const children = definition.fields ?? {};
        const groups = kind === 'complex'
            ? [control]
            : kind === 'complex-list' && control instanceof FormArray
                ? control.controls
                : [];
        for (const group of groups) {
            if (!(group instanceof FormGroup))
                continue;
            for (const [name, child] of Object.entries(children)) {
                const sub = group.controls[name];
                if (sub)
                    this.lockReadOnly(child, sub, depth + 1);
            }
        }
    }
    loadVocabularies(directories) {
        for (const directory of directories) {
            if (this.requested.has(directory))
                continue;
            this.requested.add(directory);
            const store = (vocabulary) => this.vocabularies.update((current) => new Map(current).set(directory, vocabulary));
            if (directoryUsesL10nLabel(directory)) {
                this.directories
                    .getAllL10nEntries(directory)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: (entries) => store({ l10n: true, entries }),
                    error: () => this.requested.delete(directory),
                });
            }
            else {
                this.directories
                    .getEntries(directory)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: (entries) => store({ l10n: false, entries }),
                    error: () => this.requested.delete(directory),
                });
            }
        }
    }
    collect(include) {
        const out = {};
        for (const field of untracked(this.fields)) {
            const control = this.form.controls[field.xpath];
            if (!control || fieldKind(field.definition) === 'read-only' || !include(control))
                continue;
            out[field.xpath] = propertyValue(field.definition, control, this.dateAdapter, 0, field.multiline === true);
        }
        return out;
    }
    statusChanged() {
        if (this.submitted())
            this.invalidCount.set(this.countInvalid());
        const valid = this.form.valid || this.form.disabled;
        if (valid === this.valid)
            return;
        this.valid = valid;
        this.validChange.emit(valid);
    }
    countInvalid() {
        const count = (control) => {
            if (control instanceof FormGroup || control instanceof FormArray) {
                const own = control.errors ? 1 : 0;
                return own + Object.values(control.controls).reduce((sum, child) => sum + count(child), 0);
            }
            return control.invalid ? 1 : 0;
        };
        return Object.values(this.form.controls).reduce((sum, control) => sum + count(control), 0);
    }
    /** Opens the tab holding the first invalid field, then focuses it once it has rendered. */
    revealFirstInvalid() {
        const standardInvalid = untracked(this.standardFields).some((field) => this.form.controls[field.xpath]?.invalid);
        if (!standardInvalid && untracked(this.display) === 'tabs') {
            const index = untracked(this.typeSections).findIndex((section) => section.fields.some((field) => this.form.controls[field.xpath]?.invalid));
            if (index >= 0)
                this.selectedTab.set(index);
        }
        this.focusFirstInvalid(3);
    }
    /** A tab's content attaches a render after the tab is selected, so the field may not exist yet. */
    focusFirstInvalid(attempts) {
        afterNextRender(() => {
            const target = this.host.nativeElement.querySelector('[data-nxs-invalid="true"]');
            if (target)
                target.focus();
            else if (attempts > 1)
                this.focusFirstInvalid(attempts - 1);
        }, { injector: this.injector });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsMetadataEditorComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsMetadataEditorComponent, isStandalone: true, selector: "nxs-metadata-editor", inputs: { sections: { classPropertyName: "sections", publicName: "sections", isSignal: true, isRequired: false, transformFunction: null }, display: { classPropertyName: "display", publicName: "display", isSignal: true, isRequired: false, transformFunction: null }, values: { classPropertyName: "values", publicName: "values", isSignal: true, isRequired: false, transformFunction: null }, dublinCore: { classPropertyName: "dublinCore", publicName: "dublinCore", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null }, tabsLabel: { classPropertyName: "tabsLabel", publicName: "tabsLabel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { validChange: "validChange" }, host: { classAttribute: "nxs-metadata-editor" }, providers: [provideNxsDateAdapter()], ngImport: i0, template: "@if (submitted() && invalidCount() > 0) {\n  <div class=\"nxs-metadata-editor__summary\" role=\"alert\" [id]=\"id + '-summary'\">\n    <mat-icon aria-hidden=\"true\">error_outline</mat-icon>\n    <span class=\"nxs-metadata-editor__summary-text\">\n      @if (invalidCount() === 1) {\n        {{ 'satori-components.metadata-editor.summary-one' | translate }}\n      } @else {\n        {{\n          'satori-components.metadata-editor.summary-other' | translate: { count: invalidCount() }\n        }}\n      }\n    </span>\n  </div>\n}\n\n@if (standardFields().length) {\n  <div class=\"nxs-metadata-editor__fields\">\n    @for (field of standardFields(); track field.xpath) {\n      @if (controlFor(field); as control) {\n        <ng-container\n          [ngTemplateOutlet]=\"fieldTemplate\"\n          [ngTemplateOutletContext]=\"{\n            $implicit: field,\n            control: control,\n            depth: 0,\n            path: field.xpath,\n          }\"\n        />\n      }\n    }\n  </div>\n}\n\n@if (display() === 'tabs' && typeSections().length) {\n  <nxs-tabs\n    class=\"nxs-metadata-editor__tabs\"\n    [tabs]=\"tabs()\"\n    [label]=\"tabsLabel() || ('satori-components.metadata-editor.sections' | translate)\"\n    [selectedIndex]=\"selectedTab()\"\n    (selectedIndexChange)=\"selectTab($event)\"\n  >\n    <ng-template nxsTabBody let-tab>\n      @for (section of typeSections(); track section.id) {\n        @if (section.id === tab.id) {\n          <div class=\"nxs-metadata-editor__fields\">\n            @for (field of section.fields; track field.xpath) {\n              @if (controlFor(field); as control) {\n                <ng-container\n                  [ngTemplateOutlet]=\"fieldTemplate\"\n                  [ngTemplateOutletContext]=\"{\n                    $implicit: field,\n                    control: control,\n                    depth: 0,\n                    path: field.xpath,\n                  }\"\n                />\n              }\n            }\n          </div>\n        }\n      }\n    </ng-template>\n  </nxs-tabs>\n} @else {\n  @for (section of typeSections(); track section.id) {\n    <section\n      class=\"nxs-metadata-editor__section\"\n      [attr.aria-labelledby]=\"section.heading ? id + '-' + section.id : null\"\n    >\n      @if (section.heading) {\n        <div\n          class=\"nxs-metadata-editor__heading\"\n          role=\"heading\"\n          [attr.aria-level]=\"headingLevel()\"\n          [id]=\"id + '-' + section.id\"\n        >\n          {{ section.heading }}\n        </div>\n      }\n      <div class=\"nxs-metadata-editor__fields\">\n        @for (field of section.fields; track field.xpath) {\n          @if (controlFor(field); as control) {\n            <ng-container\n              [ngTemplateOutlet]=\"fieldTemplate\"\n              [ngTemplateOutletContext]=\"{\n                $implicit: field,\n                control: control,\n                depth: 0,\n                path: field.xpath,\n              }\"\n            />\n          }\n        }\n      </div>\n    </section>\n  }\n}\n\n<ng-template #fieldTemplate let-field let-control=\"control\" let-depth=\"depth\" let-path=\"path\">\n  @let label = field.labelKey ? (field.labelKey | translate) : field.label;\n  @let definition = field.definition;\n  @let error = errorOf(control);\n  @switch (kindOf(definition, depth)) {\n    @case ('text') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        @if (field.multiline) {\n          <textarea\n            matInput\n            rows=\"2\"\n            [formControl]=\"asControl(control)\"\n            [required]=\"isRequired(definition)\"\n            [errorStateMatcher]=\"errorMatcher\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n            [attr.data-xpath]=\"path\"\n          ></textarea>\n        } @else {\n          <input\n            matInput\n            type=\"text\"\n            [formControl]=\"asControl(control)\"\n            [required]=\"isRequired(definition)\"\n            [errorStateMatcher]=\"errorMatcher\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n            [attr.data-xpath]=\"path\"\n          />\n        }\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('number') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <input\n          matInput\n          type=\"number\"\n          [attr.step]=\"step(definition)\"\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n          [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          [attr.data-xpath]=\"path\"\n        />\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('date') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <input\n          matInput\n          [matDatepicker]=\"picker\"\n          [placeholder]=\"'common.date-mask' | translate | nxsDateMask\"\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n          [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          [attr.data-xpath]=\"path\"\n        />\n        <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n        <mat-datepicker #picker />\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('boolean') {\n      <mat-checkbox\n        class=\"nxs-metadata-editor__checkbox\"\n        [formControl]=\"asControl(control)\"\n        [attr.data-xpath]=\"path\"\n        >{{ label }}</mat-checkbox\n      >\n    }\n    @case ('vocabulary') {\n      <ng-container\n        [ngTemplateOutlet]=\"vocabularyTemplate\"\n        [ngTemplateOutletContext]=\"{ definition, control, label, error, path, multiple: false }\"\n      />\n    }\n    @case ('vocabulary-list') {\n      <ng-container\n        [ngTemplateOutlet]=\"vocabularyTemplate\"\n        [ngTemplateOutletContext]=\"{ definition, control, label, error, path, multiple: true }\"\n      />\n    }\n    @case ('list') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <mat-chip-grid\n          #grid\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n        >\n          @for (item of listValue(control); track $index) {\n            <mat-chip-row [value]=\"item\" (removed)=\"removeItem(control, $index)\">\n              {{ item }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'satori-components.metadata-editor.remove-value' | translate: { name: item }\n                \"\n              >\n                <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n              </button>\n            </mat-chip-row>\n          }\n          <input\n            [id]=\"id + '-' + path + '-input'\"\n            [type]=\"inputType(definition)\"\n            [matChipInputFor]=\"grid\"\n            [matChipInputAddOnBlur]=\"true\"\n            (matChipInputTokenEnd)=\"addItem(control, definition, $event)\"\n            [attr.data-xpath]=\"path\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          />\n        </mat-chip-grid>\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('complex') {\n      @let groupInvalid = showError(control) && !!error;\n      <fieldset\n        class=\"nxs-metadata-editor__group\"\n        [attr.data-xpath]=\"path\"\n        [attr.aria-describedby]=\"groupInvalid ? id + '-' + path + '-error' : null\"\n      >\n        <legend>{{ label }}</legend>\n        @if (groupInvalid) {\n          <p\n            class=\"nxs-metadata-editor__error\"\n            tabindex=\"-1\"\n            data-nxs-invalid=\"true\"\n            [id]=\"id + '-' + path + '-error'\"\n          >\n            {{ errorText(error, label) }}\n          </p>\n        }\n        @for (sub of subFields(definition); track sub.xpath) {\n          @if (subControl(control, sub.xpath); as child) {\n            <ng-container\n              [ngTemplateOutlet]=\"fieldTemplate\"\n              [ngTemplateOutletContext]=\"{\n                $implicit: sub,\n                control: child,\n                depth: depth + 1,\n                path: path + '/' + sub.xpath,\n              }\"\n            />\n          }\n        }\n      </fieldset>\n    }\n    @case ('complex-list') {\n      <fieldset class=\"nxs-metadata-editor__group\" [attr.data-xpath]=\"path\">\n        <legend>{{ label }}</legend>\n        @for (item of asArray(control).controls; track item; let index = $index) {\n          <fieldset class=\"nxs-metadata-editor__item\">\n            <legend>\n              {{\n                'satori-components.metadata-editor.item' | translate: { label, index: index + 1 }\n              }}\n            </legend>\n            @for (sub of subFields(definition); track sub.xpath) {\n              @if (subControl(item, sub.xpath); as child) {\n                <ng-container\n                  [ngTemplateOutlet]=\"fieldTemplate\"\n                  [ngTemplateOutletContext]=\"{\n                    $implicit: sub,\n                    control: child,\n                    depth: depth + 1,\n                    path: path + '/' + index + '/' + sub.xpath,\n                  }\"\n                />\n              }\n            }\n            <button\n              mat-button\n              type=\"button\"\n              class=\"nxs-metadata-editor__remove\"\n              [disabled]=\"control.disabled\"\n              [attr.aria-label]=\"\n                'satori-components.metadata-editor.remove-item'\n                  | translate: { label, index: index + 1 }\n              \"\n              (click)=\"removeComplexItem(control, index)\"\n            >\n              <mat-icon aria-hidden=\"true\">delete_outline</mat-icon>\n              {{ 'satori-components.metadata-editor.remove' | translate }}\n            </button>\n          </fieldset>\n        }\n        @let listInvalid = showError(control);\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"nxs-metadata-editor__add\"\n          [disabled]=\"control.disabled\"\n          [attr.data-nxs-invalid]=\"listInvalid ? 'true' : null\"\n          [attr.aria-describedby]=\"listInvalid ? id + '-' + path + '-error' : null\"\n          (click)=\"addComplexItem(control, definition, depth)\"\n        >\n          <mat-icon aria-hidden=\"true\">add</mat-icon>\n          {{ 'satori-components.metadata-editor.add-item' | translate: { label } }}\n        </button>\n        @if (listInvalid && error) {\n          <p class=\"nxs-metadata-editor__error\" [id]=\"id + '-' + path + '-error'\">\n            {{ errorText(error, label) }}\n          </p>\n        }\n      </fieldset>\n    }\n    @default {\n      <div class=\"nxs-metadata-editor__read-only\" [attr.data-xpath]=\"path\">\n        <span class=\"nxs-metadata-editor__read-only-label\">{{ label }}</span>\n        <span class=\"nxs-metadata-editor__read-only-value\">\n          {{ readOnlyText(control) || ('satori-components.metadata-editor.no-value' | translate) }}\n        </span>\n      </div>\n    }\n  }\n</ng-template>\n\n<ng-template\n  #vocabularyTemplate\n  let-definition=\"definition\"\n  let-control=\"control\"\n  let-label=\"label\"\n  let-error=\"error\"\n  let-path=\"path\"\n  let-multiple=\"multiple\"\n>\n  <mat-form-field\n    appearance=\"outline\"\n    subscriptSizing=\"dynamic\"\n    class=\"nxs-metadata-editor__field nxs-metadata-editor__vocabulary\"\n  >\n    <mat-label>{{ label }}</mat-label>\n    <mat-select\n      [formControl]=\"asControl(control)\"\n      [multiple]=\"multiple\"\n      [required]=\"isRequired(definition)\"\n      [errorStateMatcher]=\"errorMatcher\"\n      [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n      [panelClass]=\"\n        usesL10n(definition.directory)\n          ? 'nxs-vocabulary-panel nxs-vocabulary-panel--grouped'\n          : 'nxs-vocabulary-panel'\n      \"\n      [attr.data-xpath]=\"path\"\n      (openedChange)=\"panelToggled()\"\n    >\n      <mat-select-trigger>\n        <mat-chip-set class=\"nxs-metadata-editor__trigger-chips\">\n          @for (id of multiple ? listValue(control) : [control.value]; track $index) {\n            @if (id) {\n              <mat-chip\n                (removed)=\"multiple ? removeItem(control, $index) : clearValue(control, false)\"\n              >\n                {{ vocabularyLabel(definition.directory, id) }}\n                <button\n                  type=\"button\"\n                  matChipRemove\n                  [disabled]=\"control.disabled\"\n                  [attr.aria-label]=\"\n                    'satori-components.metadata-editor.remove-value'\n                      | translate: { name: vocabularyLabel(definition.directory, id) }\n                  \"\n                  (click)=\"$event.stopPropagation()\"\n                >\n                  <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n                </button>\n              </mat-chip>\n            }\n          }\n        </mat-chip-set>\n      </mat-select-trigger>\n      <div class=\"nxs-vocabulary-panel__search\">\n        <input\n          type=\"text\"\n          [value]=\"panelSearch()\"\n          [placeholder]=\"'satori-components.metadata-editor.search' | translate\"\n          [attr.aria-label]=\"'satori-components.metadata-editor.search-in' | translate: { label }\"\n          (input)=\"search($event)\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"nxs-vocabulary-panel__list\">\n        @if (usesL10n(definition.directory)) {\n          @for (group of groupedOptions(definition.directory); track group.parentLabel) {\n            <mat-optgroup [label]=\"group.parentLabel\">\n              @for (entry of group.entries; track entry.id) {\n                <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n              }\n            </mat-optgroup>\n          }\n        } @else {\n          @for (entry of flatOptions(definition.directory); track entry.id) {\n            <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n          }\n        }\n      </div>\n    </mat-select>\n    @if (error) {\n      <mat-error>{{ errorText(error, label) }}</mat-error>\n    }\n  </mat-form-field>\n</ng-template>\n", styles: [":host{--nxs-metadata-editor-heading: var(--mat-sys-on-surface);--nxs-metadata-editor-label: var(--mat-sys-on-surface-variant);--nxs-metadata-editor-divider: var(--mat-sys-outline-variant);--nxs-metadata-editor-error: var(--mat-sys-error);--nxs-metadata-editor-error-surface: var(--mat-sys-error-container);--nxs-metadata-editor-on-error-surface: var(--mat-sys-on-error-container);display:flex;flex-direction:column;gap:20px}.nxs-metadata-editor__summary{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:4px;background:var(--nxs-metadata-editor-error-surface);color:var(--nxs-metadata-editor-on-error-surface);font-size:.875rem}.nxs-metadata-editor__fields{display:flex;flex-direction:column;gap:16px}.nxs-metadata-editor__tabs .nxs-metadata-editor__fields{padding-top:16px}.nxs-metadata-editor__section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:1px solid var(--nxs-metadata-editor-divider)}.nxs-metadata-editor__heading{margin:0;font-size:.9375rem;font-weight:600;color:var(--nxs-metadata-editor-heading)}.nxs-metadata-editor__field{width:100%}.nxs-metadata-editor__group,.nxs-metadata-editor__item{display:flex;flex-direction:column;gap:12px;min-width:0;margin:0;padding:12px;border:1px solid var(--nxs-metadata-editor-divider);border-radius:4px}.nxs-metadata-editor__group>legend,.nxs-metadata-editor__item>legend{padding:0 4px;font-size:.8125rem;color:var(--nxs-metadata-editor-label)}.nxs-metadata-editor__remove,.nxs-metadata-editor__add{align-self:flex-start}:host .nxs-metadata-editor__error{margin:0;font-size:.75rem;color:var(--nxs-metadata-editor-error)}.nxs-metadata-editor__read-only{display:flex;flex-direction:column;gap:2px}.nxs-metadata-editor__read-only-label{font-size:.75rem;color:var(--nxs-metadata-editor-label)}.nxs-metadata-editor__trigger-chips{display:flex;flex-wrap:wrap;gap:4px}.nxs-metadata-editor__vocabulary ::ng-deep .mat-mdc-select-trigger{height:auto;min-height:24px}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel{display:flex;flex-direction:column;max-height:320px;overflow:hidden;padding-top:0}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__search{flex:0 0 auto;padding:8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant)}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__search input{box-sizing:border-box;width:100%;padding:8px 12px;border:1px solid var(--mat-sys-outline);border-radius:4px;font:inherit;font-size:.875rem;color:var(--mat-sys-on-surface);background:var(--mat-sys-surface)}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__search input:focus{outline:2px solid var(--mat-sys-primary);outline-offset:1px}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__list{flex:1 1 auto;min-height:0;overflow-y:auto}::ng-deep .nxs-vocabulary-panel--grouped .mat-mdc-optgroup-label{padding:10px 16px 6px;font-size:.8125rem;font-weight:700}\n"], dependencies: [{ kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "ngmodule", type: ReactiveFormsModule }, { kind: "directive", type: i1$2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$2.NumberValueAccessor, selector: "input[type=number][formControlName],input[type=number][formControl],input[type=number][ngModel]" }, { kind: "directive", type: i1$2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$2.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1$2.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i2$1.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "ngmodule", type: MatChipsModule }, { kind: "component", type: i4$2.MatChip, selector: "mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]", inputs: ["role", "id", "aria-label", "aria-description", "value", "color", "removable", "highlighted", "disableRipple", "disabled"], outputs: ["removed", "destroyed"], exportAs: ["matChip"] }, { kind: "component", type: i4$2.MatChipGrid, selector: "mat-chip-grid", inputs: ["disabled", "placeholder", "required", "value", "errorStateMatcher"], outputs: ["change", "valueChange"] }, { kind: "directive", type: i4$2.MatChipInput, selector: "input[matChipInputFor]", inputs: ["matChipInputFor", "matChipInputAddOnBlur", "matChipInputSeparatorKeyCodes", "placeholder", "id", "disabled", "readonly", "matChipInputDisabledInteractive"], outputs: ["matChipInputTokenEnd"], exportAs: ["matChipInput", "matChipInputFor"] }, { kind: "directive", type: i4$2.MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: i4$2.MatChipRow, selector: "mat-chip-row, [mat-chip-row], mat-basic-chip-row, [mat-basic-chip-row]", inputs: ["editable"], outputs: ["edited"] }, { kind: "component", type: i4$2.MatChipSet, selector: "mat-chip-set", inputs: ["disabled", "role", "tabIndex"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i1$3.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i1$3.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i1$3.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatOptionModule }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i2$4.MatOptgroup, selector: "mat-optgroup", inputs: ["label", "disabled"], exportAs: ["matOptgroup"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i2$4.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "directive", type: i2$4.MatSelectTrigger, selector: "mat-select-trigger" }, { kind: "component", type: NxsTabsComponent, selector: "nxs-tabs", inputs: ["tabs", "label", "selectedIndex"], outputs: ["selectedIndexChange", "selectedTabChange"] }, { kind: "directive", type: NxsTabBodyDirective, selector: "ng-template[nxsTabBody]" }, { kind: "pipe", type: TranslatePipe, name: "translate" }, { kind: "pipe", type: NxsDateMaskPipe, name: "nxsDateMask" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsMetadataEditorComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-metadata-editor', standalone: true, imports: [
                        NgTemplateOutlet,
                        ReactiveFormsModule,
                        TranslatePipe,
                        MatButtonModule,
                        MatCheckboxModule,
                        MatChipsModule,
                        MatDatepickerModule,
                        MatFormFieldModule,
                        MatIconModule,
                        MatInputModule,
                        MatOptionModule,
                        MatSelectModule,
                        NxsTabsComponent,
                        NxsTabBodyDirective,
                        NxsDateMaskPipe,
                    ], providers: [provideNxsDateAdapter()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-metadata-editor' }, template: "@if (submitted() && invalidCount() > 0) {\n  <div class=\"nxs-metadata-editor__summary\" role=\"alert\" [id]=\"id + '-summary'\">\n    <mat-icon aria-hidden=\"true\">error_outline</mat-icon>\n    <span class=\"nxs-metadata-editor__summary-text\">\n      @if (invalidCount() === 1) {\n        {{ 'satori-components.metadata-editor.summary-one' | translate }}\n      } @else {\n        {{\n          'satori-components.metadata-editor.summary-other' | translate: { count: invalidCount() }\n        }}\n      }\n    </span>\n  </div>\n}\n\n@if (standardFields().length) {\n  <div class=\"nxs-metadata-editor__fields\">\n    @for (field of standardFields(); track field.xpath) {\n      @if (controlFor(field); as control) {\n        <ng-container\n          [ngTemplateOutlet]=\"fieldTemplate\"\n          [ngTemplateOutletContext]=\"{\n            $implicit: field,\n            control: control,\n            depth: 0,\n            path: field.xpath,\n          }\"\n        />\n      }\n    }\n  </div>\n}\n\n@if (display() === 'tabs' && typeSections().length) {\n  <nxs-tabs\n    class=\"nxs-metadata-editor__tabs\"\n    [tabs]=\"tabs()\"\n    [label]=\"tabsLabel() || ('satori-components.metadata-editor.sections' | translate)\"\n    [selectedIndex]=\"selectedTab()\"\n    (selectedIndexChange)=\"selectTab($event)\"\n  >\n    <ng-template nxsTabBody let-tab>\n      @for (section of typeSections(); track section.id) {\n        @if (section.id === tab.id) {\n          <div class=\"nxs-metadata-editor__fields\">\n            @for (field of section.fields; track field.xpath) {\n              @if (controlFor(field); as control) {\n                <ng-container\n                  [ngTemplateOutlet]=\"fieldTemplate\"\n                  [ngTemplateOutletContext]=\"{\n                    $implicit: field,\n                    control: control,\n                    depth: 0,\n                    path: field.xpath,\n                  }\"\n                />\n              }\n            }\n          </div>\n        }\n      }\n    </ng-template>\n  </nxs-tabs>\n} @else {\n  @for (section of typeSections(); track section.id) {\n    <section\n      class=\"nxs-metadata-editor__section\"\n      [attr.aria-labelledby]=\"section.heading ? id + '-' + section.id : null\"\n    >\n      @if (section.heading) {\n        <div\n          class=\"nxs-metadata-editor__heading\"\n          role=\"heading\"\n          [attr.aria-level]=\"headingLevel()\"\n          [id]=\"id + '-' + section.id\"\n        >\n          {{ section.heading }}\n        </div>\n      }\n      <div class=\"nxs-metadata-editor__fields\">\n        @for (field of section.fields; track field.xpath) {\n          @if (controlFor(field); as control) {\n            <ng-container\n              [ngTemplateOutlet]=\"fieldTemplate\"\n              [ngTemplateOutletContext]=\"{\n                $implicit: field,\n                control: control,\n                depth: 0,\n                path: field.xpath,\n              }\"\n            />\n          }\n        }\n      </div>\n    </section>\n  }\n}\n\n<ng-template #fieldTemplate let-field let-control=\"control\" let-depth=\"depth\" let-path=\"path\">\n  @let label = field.labelKey ? (field.labelKey | translate) : field.label;\n  @let definition = field.definition;\n  @let error = errorOf(control);\n  @switch (kindOf(definition, depth)) {\n    @case ('text') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        @if (field.multiline) {\n          <textarea\n            matInput\n            rows=\"2\"\n            [formControl]=\"asControl(control)\"\n            [required]=\"isRequired(definition)\"\n            [errorStateMatcher]=\"errorMatcher\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n            [attr.data-xpath]=\"path\"\n          ></textarea>\n        } @else {\n          <input\n            matInput\n            type=\"text\"\n            [formControl]=\"asControl(control)\"\n            [required]=\"isRequired(definition)\"\n            [errorStateMatcher]=\"errorMatcher\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n            [attr.data-xpath]=\"path\"\n          />\n        }\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('number') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <input\n          matInput\n          type=\"number\"\n          [attr.step]=\"step(definition)\"\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n          [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          [attr.data-xpath]=\"path\"\n        />\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('date') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <input\n          matInput\n          [matDatepicker]=\"picker\"\n          [placeholder]=\"'common.date-mask' | translate | nxsDateMask\"\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n          [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          [attr.data-xpath]=\"path\"\n        />\n        <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n        <mat-datepicker #picker />\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('boolean') {\n      <mat-checkbox\n        class=\"nxs-metadata-editor__checkbox\"\n        [formControl]=\"asControl(control)\"\n        [attr.data-xpath]=\"path\"\n        >{{ label }}</mat-checkbox\n      >\n    }\n    @case ('vocabulary') {\n      <ng-container\n        [ngTemplateOutlet]=\"vocabularyTemplate\"\n        [ngTemplateOutletContext]=\"{ definition, control, label, error, path, multiple: false }\"\n      />\n    }\n    @case ('vocabulary-list') {\n      <ng-container\n        [ngTemplateOutlet]=\"vocabularyTemplate\"\n        [ngTemplateOutletContext]=\"{ definition, control, label, error, path, multiple: true }\"\n      />\n    }\n    @case ('list') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <mat-chip-grid\n          #grid\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n        >\n          @for (item of listValue(control); track $index) {\n            <mat-chip-row [value]=\"item\" (removed)=\"removeItem(control, $index)\">\n              {{ item }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'satori-components.metadata-editor.remove-value' | translate: { name: item }\n                \"\n              >\n                <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n              </button>\n            </mat-chip-row>\n          }\n          <input\n            [id]=\"id + '-' + path + '-input'\"\n            [type]=\"inputType(definition)\"\n            [matChipInputFor]=\"grid\"\n            [matChipInputAddOnBlur]=\"true\"\n            (matChipInputTokenEnd)=\"addItem(control, definition, $event)\"\n            [attr.data-xpath]=\"path\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          />\n        </mat-chip-grid>\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('complex') {\n      @let groupInvalid = showError(control) && !!error;\n      <fieldset\n        class=\"nxs-metadata-editor__group\"\n        [attr.data-xpath]=\"path\"\n        [attr.aria-describedby]=\"groupInvalid ? id + '-' + path + '-error' : null\"\n      >\n        <legend>{{ label }}</legend>\n        @if (groupInvalid) {\n          <p\n            class=\"nxs-metadata-editor__error\"\n            tabindex=\"-1\"\n            data-nxs-invalid=\"true\"\n            [id]=\"id + '-' + path + '-error'\"\n          >\n            {{ errorText(error, label) }}\n          </p>\n        }\n        @for (sub of subFields(definition); track sub.xpath) {\n          @if (subControl(control, sub.xpath); as child) {\n            <ng-container\n              [ngTemplateOutlet]=\"fieldTemplate\"\n              [ngTemplateOutletContext]=\"{\n                $implicit: sub,\n                control: child,\n                depth: depth + 1,\n                path: path + '/' + sub.xpath,\n              }\"\n            />\n          }\n        }\n      </fieldset>\n    }\n    @case ('complex-list') {\n      <fieldset class=\"nxs-metadata-editor__group\" [attr.data-xpath]=\"path\">\n        <legend>{{ label }}</legend>\n        @for (item of asArray(control).controls; track item; let index = $index) {\n          <fieldset class=\"nxs-metadata-editor__item\">\n            <legend>\n              {{\n                'satori-components.metadata-editor.item' | translate: { label, index: index + 1 }\n              }}\n            </legend>\n            @for (sub of subFields(definition); track sub.xpath) {\n              @if (subControl(item, sub.xpath); as child) {\n                <ng-container\n                  [ngTemplateOutlet]=\"fieldTemplate\"\n                  [ngTemplateOutletContext]=\"{\n                    $implicit: sub,\n                    control: child,\n                    depth: depth + 1,\n                    path: path + '/' + index + '/' + sub.xpath,\n                  }\"\n                />\n              }\n            }\n            <button\n              mat-button\n              type=\"button\"\n              class=\"nxs-metadata-editor__remove\"\n              [disabled]=\"control.disabled\"\n              [attr.aria-label]=\"\n                'satori-components.metadata-editor.remove-item'\n                  | translate: { label, index: index + 1 }\n              \"\n              (click)=\"removeComplexItem(control, index)\"\n            >\n              <mat-icon aria-hidden=\"true\">delete_outline</mat-icon>\n              {{ 'satori-components.metadata-editor.remove' | translate }}\n            </button>\n          </fieldset>\n        }\n        @let listInvalid = showError(control);\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"nxs-metadata-editor__add\"\n          [disabled]=\"control.disabled\"\n          [attr.data-nxs-invalid]=\"listInvalid ? 'true' : null\"\n          [attr.aria-describedby]=\"listInvalid ? id + '-' + path + '-error' : null\"\n          (click)=\"addComplexItem(control, definition, depth)\"\n        >\n          <mat-icon aria-hidden=\"true\">add</mat-icon>\n          {{ 'satori-components.metadata-editor.add-item' | translate: { label } }}\n        </button>\n        @if (listInvalid && error) {\n          <p class=\"nxs-metadata-editor__error\" [id]=\"id + '-' + path + '-error'\">\n            {{ errorText(error, label) }}\n          </p>\n        }\n      </fieldset>\n    }\n    @default {\n      <div class=\"nxs-metadata-editor__read-only\" [attr.data-xpath]=\"path\">\n        <span class=\"nxs-metadata-editor__read-only-label\">{{ label }}</span>\n        <span class=\"nxs-metadata-editor__read-only-value\">\n          {{ readOnlyText(control) || ('satori-components.metadata-editor.no-value' | translate) }}\n        </span>\n      </div>\n    }\n  }\n</ng-template>\n\n<ng-template\n  #vocabularyTemplate\n  let-definition=\"definition\"\n  let-control=\"control\"\n  let-label=\"label\"\n  let-error=\"error\"\n  let-path=\"path\"\n  let-multiple=\"multiple\"\n>\n  <mat-form-field\n    appearance=\"outline\"\n    subscriptSizing=\"dynamic\"\n    class=\"nxs-metadata-editor__field nxs-metadata-editor__vocabulary\"\n  >\n    <mat-label>{{ label }}</mat-label>\n    <mat-select\n      [formControl]=\"asControl(control)\"\n      [multiple]=\"multiple\"\n      [required]=\"isRequired(definition)\"\n      [errorStateMatcher]=\"errorMatcher\"\n      [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n      [panelClass]=\"\n        usesL10n(definition.directory)\n          ? 'nxs-vocabulary-panel nxs-vocabulary-panel--grouped'\n          : 'nxs-vocabulary-panel'\n      \"\n      [attr.data-xpath]=\"path\"\n      (openedChange)=\"panelToggled()\"\n    >\n      <mat-select-trigger>\n        <mat-chip-set class=\"nxs-metadata-editor__trigger-chips\">\n          @for (id of multiple ? listValue(control) : [control.value]; track $index) {\n            @if (id) {\n              <mat-chip\n                (removed)=\"multiple ? removeItem(control, $index) : clearValue(control, false)\"\n              >\n                {{ vocabularyLabel(definition.directory, id) }}\n                <button\n                  type=\"button\"\n                  matChipRemove\n                  [disabled]=\"control.disabled\"\n                  [attr.aria-label]=\"\n                    'satori-components.metadata-editor.remove-value'\n                      | translate: { name: vocabularyLabel(definition.directory, id) }\n                  \"\n                  (click)=\"$event.stopPropagation()\"\n                >\n                  <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n                </button>\n              </mat-chip>\n            }\n          }\n        </mat-chip-set>\n      </mat-select-trigger>\n      <div class=\"nxs-vocabulary-panel__search\">\n        <input\n          type=\"text\"\n          [value]=\"panelSearch()\"\n          [placeholder]=\"'satori-components.metadata-editor.search' | translate\"\n          [attr.aria-label]=\"'satori-components.metadata-editor.search-in' | translate: { label }\"\n          (input)=\"search($event)\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"nxs-vocabulary-panel__list\">\n        @if (usesL10n(definition.directory)) {\n          @for (group of groupedOptions(definition.directory); track group.parentLabel) {\n            <mat-optgroup [label]=\"group.parentLabel\">\n              @for (entry of group.entries; track entry.id) {\n                <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n              }\n            </mat-optgroup>\n          }\n        } @else {\n          @for (entry of flatOptions(definition.directory); track entry.id) {\n            <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n          }\n        }\n      </div>\n    </mat-select>\n    @if (error) {\n      <mat-error>{{ errorText(error, label) }}</mat-error>\n    }\n  </mat-form-field>\n</ng-template>\n", styles: [":host{--nxs-metadata-editor-heading: var(--mat-sys-on-surface);--nxs-metadata-editor-label: var(--mat-sys-on-surface-variant);--nxs-metadata-editor-divider: var(--mat-sys-outline-variant);--nxs-metadata-editor-error: var(--mat-sys-error);--nxs-metadata-editor-error-surface: var(--mat-sys-error-container);--nxs-metadata-editor-on-error-surface: var(--mat-sys-on-error-container);display:flex;flex-direction:column;gap:20px}.nxs-metadata-editor__summary{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:4px;background:var(--nxs-metadata-editor-error-surface);color:var(--nxs-metadata-editor-on-error-surface);font-size:.875rem}.nxs-metadata-editor__fields{display:flex;flex-direction:column;gap:16px}.nxs-metadata-editor__tabs .nxs-metadata-editor__fields{padding-top:16px}.nxs-metadata-editor__section{display:flex;flex-direction:column;gap:12px;padding-top:16px;border-top:1px solid var(--nxs-metadata-editor-divider)}.nxs-metadata-editor__heading{margin:0;font-size:.9375rem;font-weight:600;color:var(--nxs-metadata-editor-heading)}.nxs-metadata-editor__field{width:100%}.nxs-metadata-editor__group,.nxs-metadata-editor__item{display:flex;flex-direction:column;gap:12px;min-width:0;margin:0;padding:12px;border:1px solid var(--nxs-metadata-editor-divider);border-radius:4px}.nxs-metadata-editor__group>legend,.nxs-metadata-editor__item>legend{padding:0 4px;font-size:.8125rem;color:var(--nxs-metadata-editor-label)}.nxs-metadata-editor__remove,.nxs-metadata-editor__add{align-self:flex-start}:host .nxs-metadata-editor__error{margin:0;font-size:.75rem;color:var(--nxs-metadata-editor-error)}.nxs-metadata-editor__read-only{display:flex;flex-direction:column;gap:2px}.nxs-metadata-editor__read-only-label{font-size:.75rem;color:var(--nxs-metadata-editor-label)}.nxs-metadata-editor__trigger-chips{display:flex;flex-wrap:wrap;gap:4px}.nxs-metadata-editor__vocabulary ::ng-deep .mat-mdc-select-trigger{height:auto;min-height:24px}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel{display:flex;flex-direction:column;max-height:320px;overflow:hidden;padding-top:0}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__search{flex:0 0 auto;padding:8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant)}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__search input{box-sizing:border-box;width:100%;padding:8px 12px;border:1px solid var(--mat-sys-outline);border-radius:4px;font:inherit;font-size:.875rem;color:var(--mat-sys-on-surface);background:var(--mat-sys-surface)}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__search input:focus{outline:2px solid var(--mat-sys-primary);outline-offset:1px}::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel .nxs-vocabulary-panel__list{flex:1 1 auto;min-height:0;overflow-y:auto}::ng-deep .nxs-vocabulary-panel--grouped .mat-mdc-optgroup-label{padding:10px 16px 6px;font-size:.8125rem;font-weight:700}\n"] }]
        }], ctorParameters: () => [], propDecorators: { sections: [{ type: i0.Input, args: [{ isSignal: true, alias: "sections", required: false }] }], display: [{ type: i0.Input, args: [{ isSignal: true, alias: "display", required: false }] }], values: [{ type: i0.Input, args: [{ isSignal: true, alias: "values", required: false }] }], dublinCore: [{ type: i0.Input, args: [{ isSignal: true, alias: "dublinCore", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], tabsLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabsLabel", required: false }] }], validChange: [{ type: i0.Output, args: ["validChange"] }] } });

/**
 * Reads and writes one document's local ACL for `nxs-permissions-panel`, one ACE at a time.
 *
 * Provided by the panel, not by root, so each panel owns its instance. Every call goes through
 * `DocumentDetailService`, which carries authentication through the interceptor.
 */
class NxsPermissionsService {
    documents = inject(DocumentDetailService);
    load(uid) {
        return this.documents
            .getDocumentPermissions(uid)
            .pipe(map((doc) => readSnapshot(doc)));
    }
    /**
     * Writes `changes`, refusing the whole batch first if any of them cannot be written faithfully.
     *
     * The ACL is read again before the first write rather than trusted from the panel's view, so a
     * target someone else changed meanwhile is refused instead of silently skipped by Nuxeo; if that
     * read fails, nothing is sent. Writes run in order and stop at the first server refusal. The ACL
     * is re-read afterwards, both to show the user what the server now holds and to confirm each
     * write actually took.
     */
    save(uid, changes) {
        return this.load(uid).pipe(map((fresh) => ({ fresh, error: null })), catchError((error) => of({ fresh: null, error })), switchMap(({ fresh, error }) => {
            if (!fresh)
                return of({ kind: 'unread', error });
            const refusals = refusalsFor(fresh, changes);
            if (refusals.length > 0) {
                return of({ kind: 'refused', refusals, snapshot: fresh });
            }
            return this.apply(uid, changes);
        }));
    }
    /**
     * Blocks or unblocks inheritance, then re-reads. Emits `null` when the write succeeded and only
     * the re-read failed, so a caller does not report a change that happened as one that did not.
     */
    setInheritanceBlocked(uid, blocked) {
        const write = blocked
            ? this.documents.blockPermissionInheritance(uid)
            : this.documents.unblockPermissionInheritance(uid);
        return write.pipe(switchMap(() => this.load(uid).pipe(catchError(() => of(null)))));
    }
    searchPrincipals(term) {
        return this.documents.searchUsersGroups(term);
    }
    apply(uid, changes) {
        let applied = 0;
        return from(changes).pipe(concatMap((change) => this.write(uid, change).pipe(map(() => {
            applied += 1;
            return change;
        }), catchError((error) => {
            throw new WriteFailure(change, error);
        }))), toArray(), switchMap(() => this.load(uid).pipe(map((after) => ({ after, error: null })), catchError((error) => of({ after: null, error })))), map(({ after, error }) => {
            if (!after)
                return { kind: 'unverified', count: changes.length, error };
            const missing = unconfirmedChanges(after, changes);
            return missing.length > 0
                ? { kind: 'unconfirmed', refusals: missing, snapshot: after }
                : { kind: 'saved', count: changes.length, snapshot: after };
        }), catchError((caught) => {
            if (!(caught instanceof WriteFailure))
                throw caught;
            // Re-read so the table shows what the server holds after a partial save. A failed re-read
            // is reported as an unknown state rather than masking the write failure that caused it.
            return this.load(uid).pipe(catchError(() => of(null)), map((snapshot) => {
                const unconfirmed = snapshot
                    ? unconfirmedChanges(snapshot, changes.slice(0, applied))
                    : [];
                return {
                    kind: 'failed',
                    applied: applied - unconfirmed.length,
                    unconfirmed,
                    total: changes.length,
                    change: caught.change,
                    error: caught.cause,
                    snapshot,
                };
            }));
        }));
    }
    write(uid, change) {
        switch (change.kind) {
            case 'add':
                return this.documents.addPermission(uid, {
                    username: change.principal,
                    permission: change.permission,
                    begin: change.begin,
                    end: change.end,
                    notify: false,
                });
            case 'replace':
                return this.documents.replacePermission(uid, {
                    id: change.target.id,
                    username: change.target.principal,
                    permission: change.permission,
                    begin: dateToWrite(change.begin, change.target.begin),
                    end: dateToWrite(change.end, change.target.end),
                    notify: false,
                });
            case 'remove':
                return this.documents.removePermissionById(uid, change.target.id);
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPermissionsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPermissionsService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPermissionsService, decorators: [{
            type: Injectable
        }] });
/** A write the server rejected, carrying the change so the outcome can name it. */
class WriteFailure extends Error {
    change;
    cause;
    constructor(change, cause) {
        super('A permission write was rejected');
        this.change = change;
        this.cause = cause;
    }
}

/** The ID the panel is registered under, so a customer library can re-register a replacement. */
const NXS_PERMISSIONS_PANEL_ID = 'nxs.components.permissionsPanel';
let nextId$6 = 0;
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
class NxsPermissionsPanelComponent {
    /** The uid of the document whose permissions to show. */
    documentId = input.required(...(ngDevMode ? [{ debugName: "documentId" }] : []));
    /**
     * Called after a write that may have changed the document's ACL, so a host showing other
     * ACL-derived content — the external-user shares this panel leaves to it — can read it again.
     */
    permissionsChanged = input(null, ...(ngDevMode ? [{ debugName: "permissionsChanged" }] : []));
    service = inject(NxsPermissionsService);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    dateAdapter = inject(DateAdapter);
    /** Starts every id the template sets, so two panels on one page never share one. */
    idPrefix = `nxs-permissions-${nextId$6++}`;
    localColumns = [
        'principal',
        'permission',
        'timeFrame',
        'grantedBy',
        'actions',
    ];
    inheritedColumns = ['principal', 'permission', 'timeFrame', 'grantedBy'];
    otherColumns = ['principal', 'permission', 'timeFrame', 'acl'];
    snapshot = signal(null, ...(ngDevMode ? [{ debugName: "snapshot" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    loadError = signal(null, ...(ngDevMode ? [{ debugName: "loadError" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    outcome = signal(null, ...(ngDevMode ? [{ debugName: "outcome" }] : []));
    inheritanceBusy = signal(false, ...(ngDevMode ? [{ debugName: "inheritanceBusy" }] : []));
    inheritanceError = signal(null, ...(ngDevMode ? [{ debugName: "inheritanceError" }] : []));
    /** Staged changes: by ACE id for an existing entry, by a generated key for an addition. */
    staged = signal(new Map(), ...(ngDevMode ? [{ debugName: "staged" }] : []));
    addCounter = 0;
    /** Display names of staged additions, from the search suggestion the user picked. */
    addedLabels = new Map();
    editor = signal(null, ...(ngDevMode ? [{ debugName: "editor" }] : []));
    editorPrincipal = signal(null, ...(ngDevMode ? [{ debugName: "editorPrincipal" }] : []));
    editorQuery = signal('', ...(ngDevMode ? [{ debugName: "editorQuery" }] : []));
    editorPermission = signal('Read', ...(ngDevMode ? [{ debugName: "editorPermission" }] : []));
    editorDated = signal(false, ...(ngDevMode ? [{ debugName: "editorDated" }] : []));
    /** The time frame's days, at local midnight. */
    editorBegin = signal(null, ...(ngDevMode ? [{ debugName: "editorBegin" }] : []));
    editorEnd = signal(null, ...(ngDevMode ? [{ debugName: "editorEnd" }] : []));
    /** The same days as the date fields hold them, in their adapter's own representation. */
    editorBeginField = computed(() => nxsDateToAdapter(this.dateAdapter, this.editorBegin()), ...(ngDevMode ? [{ debugName: "editorBeginField" }] : []));
    editorEndField = computed(() => nxsDateToAdapter(this.dateAdapter, this.editorEnd()), ...(ngDevMode ? [{ debugName: "editorEndField" }] : []));
    editorSubmitted = signal(false, ...(ngDevMode ? [{ debugName: "editorSubmitted" }] : []));
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    loads = new Subject();
    searches = new Subject();
    /**
     * Bumped whenever the document changes. A save or inheritance change still in flight finishes on
     * its own document, but its answer is dropped rather than shown on this one.
     */
    generation = 0;
    loadErrorKey = computed(() => `satori-components.permissions-panel.load-error.${this.loadError() ?? 'failed'}`, ...(ngDevMode ? [{ debugName: "loadErrorKey" }] : []));
    canManage = computed(() => this.snapshot()?.canManage ?? false, ...(ngDevMode ? [{ debugName: "canManage" }] : []));
    /**
     * False while a save or an inheritance change is in flight: a save replaces the staged changes
     * with those it did not send when it answers, so one staged after it started would be lost.
     */
    editable = computed(() => this.canManage() && !this.saving() && !this.inheritanceBusy(), ...(ngDevMode ? [{ debugName: "editable" }] : []));
    trackItem = (_index, item) => item.key;
    pendingCount = computed(() => this.staged().size, ...(ngDevMode ? [{ debugName: "pendingCount" }] : []));
    /** The permission groups every select offers, in the server's order. */
    permissionGroups = computed(() => {
        const catalogue = this.snapshot()?.catalogue;
        if (!catalogue)
            return [];
        return [
            {
                label: 'satori-components.permissions-panel.group.suggested',
                permissions: catalogue.suggested,
            },
            {
                label: 'satori-components.permissions-panel.group.standard',
                permissions: catalogue.standard,
            },
            { label: 'satori-components.permissions-panel.group.other', permissions: catalogue.other },
        ].filter((group) => group.permissions.length > 0);
    }, ...(ngDevMode ? [{ debugName: "permissionGroups" }] : []));
    offered = computed(() => {
        const catalogue = this.snapshot()?.catalogue;
        return new Set(catalogue ? offeredPermissions(catalogue) : []);
    }, ...(ngDevMode ? [{ debugName: "offered" }] : []));
    localItems = computed(() => {
        const snapshot = this.snapshot();
        if (!snapshot)
            return [];
        const staged = this.staged();
        const extras = (...permissions) => [...new Set(permissions)].filter((p) => !!p && !this.offered().has(p));
        const items = snapshot.local.map((row, index) => {
            const key = row.id || `no-id-${index}`;
            const change = staged.get(key);
            const lockedReason = !row.id ? 'satori-components.permissions-panel.locked.no-id' : null;
            const base = {
                ...this.fromRow(key, row, lockedReason),
                extraPermissions: extras(row.permission),
            };
            if (change?.kind === 'remove') {
                return { ...base, state: 'removed' };
            }
            if (change?.kind === 'replace') {
                return {
                    ...base,
                    permission: change.permission,
                    begin: change.begin,
                    end: change.end,
                    state: 'changed',
                };
            }
            return base;
        });
        for (const [key, change] of staged) {
            if (change.kind !== 'add')
                continue;
            items.push({
                key,
                row: null,
                principal: change.principal,
                principalLabel: this.addedLabels.get(key) ?? '',
                permission: change.permission,
                begin: change.begin,
                end: change.end,
                state: 'added',
                granted: true,
                lockedReason: null,
                extraPermissions: extras(change.permission),
            });
        }
        return items;
    }, ...(ngDevMode ? [{ debugName: "localItems" }] : []));
    /** Permissions the entry being edited holds that the server's lists do not offer. */
    editorExtraPermissions = computed(() => this.editor()?.item?.extraPermissions ?? [], ...(ngDevMode ? [{ debugName: "editorExtraPermissions" }] : []));
    editorInvalidRange = computed(() => {
        const begin = toDay(this.editorBegin());
        const end = toDay(this.editorEnd());
        return this.editorDated() && !!begin && !!end && begin > end;
    }, ...(ngDevMode ? [{ debugName: "editorInvalidRange" }] : []));
    constructor() {
        this.loads
            .pipe(
        // `defer`, so even a synchronous throw ends this load rather than the whole stream —
        // after which no later document, reload or retry would ever load again.
        switchMap((uid) => defer(() => this.service.load(uid)).pipe(catchError((error) => {
            this.loadError.set(classifyLoadError(error));
            return of(null);
        }))), takeUntilDestroyed())
            .subscribe((snapshot) => {
            if (snapshot)
                this.snapshot.set(snapshot);
            this.loading.set(false);
        });
        // No `distinctUntilChanged`: the panel outlives a form, so the same term typed into the next
        // Add would be swallowed and its suggestions, cleared when the form opened, never come back.
        this.searches
            .pipe(debounceTime(300), map((term) => term.trim()), switchMap((term) => (term.length >= 1
            ? defer(() => this.service.searchPrincipals(term)).pipe(catchError(() => of([])))
            : of([])).pipe(map((results) => ({ term, results })))), takeUntilDestroyed())
            // A search can answer after its form closed or its term changed, and must not offer its
            // principals to whatever the editor holds now.
            .subscribe(({ term, results }) => {
            if (this.editor()?.mode === 'add' && this.editorQuery().trim() === term) {
                this.suggestions.set(results);
            }
        });
        // A new document is a new panel: nothing staged, shown or half-edited may carry over.
        effect(() => {
            const uid = this.documentId();
            untracked(() => {
                this.generation += 1;
                this.snapshot.set(null);
                this.clearStaged();
                this.outcome.set(null);
                this.editor.set(null);
                this.saving.set(false);
                this.inheritanceBusy.set(false);
                this.inheritanceError.set(null);
                this.load(uid);
            });
        });
    }
    reload() {
        this.clearStaged();
        this.outcome.set(null);
        this.editor.set(null);
        this.load(this.documentId());
    }
    // ── Labels ──────────────────────────────────────────────────────────────────────────────────
    permissionLabel(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** An ACE's time frame, from staged days or the server's instants alike. */
    timeFrame(begin, end) {
        return formatAceDateRange(instantToDay(begin), instantToDay(end), (key, params) => this.translate.instant(key, params), this.locale);
    }
    /** `principal — permission`, for refusal and failure lines. */
    entryLabel(principal, permission) {
        const who = principal || this.translate.instant('satori-components.permissions-panel.unnamed-principal');
        return `${who} — ${this.permissionLabel(permission)} (${permission})`;
    }
    serverMessage(error) {
        const body = error?.error;
        const message = typeof body?.message === 'string' ? body.message.trim() : '';
        if (message)
            return message;
        const status = error?.status;
        return typeof status === 'number' && status > 0
            ? `HTTP ${status}`
            : this.translate.instant('satori-components.permissions-panel.failed.unknown');
    }
    isDenied(error) {
        return isPermissionDeniedError(error);
    }
    // ── Staging ─────────────────────────────────────────────────────────────────────────────────
    setPermission(item, permission) {
        if (!this.editable())
            return;
        this.outcome.set(null);
        if (item.row) {
            this.stageReplace(item.key, item.row, permission, item.begin, item.end);
        }
        else {
            this.updateAdd(item.key, { permission });
        }
    }
    toggleRemove(item) {
        if (!this.editable())
            return;
        this.outcome.set(null);
        const next = new Map(this.staged());
        if (!item.row || next.get(item.key)?.kind === 'remove') {
            next.delete(item.key);
        }
        else {
            next.set(item.key, { kind: 'remove', target: item.row });
        }
        this.staged.set(next);
    }
    dismissOutcome() {
        this.outcome.set(null);
    }
    discard() {
        this.clearStaged();
        this.outcome.set(null);
        this.editor.set(null);
    }
    // ── Editor ──────────────────────────────────────────────────────────────────────────────────
    openAdd() {
        if (!this.editable())
            return;
        this.outcome.set(null);
        this.editor.set({ mode: 'add', item: null });
        this.editorPrincipal.set(null);
        this.editorQuery.set('');
        this.editorPermission.set(this.snapshot()?.catalogue.suggested[0] ?? 'Read');
        this.editorDated.set(false);
        this.editorBegin.set(null);
        this.editorEnd.set(null);
        this.editorSubmitted.set(false);
        this.suggestions.set([]);
    }
    openEdit(item) {
        if (!this.editable())
            return;
        this.outcome.set(null);
        this.editor.set({ mode: 'edit', item });
        this.editorPermission.set(item.permission);
        this.editorDated.set(!!item.begin || !!item.end);
        this.editorBegin.set(dateOf(item.begin));
        this.editorEnd.set(dateOf(item.end));
        this.editorSubmitted.set(false);
    }
    closeEditor() {
        this.editor.set(null);
    }
    onPrincipalInput(value) {
        this.editorQuery.set(value);
        this.editorPrincipal.set(null);
        this.searches.next(value);
    }
    onPrincipalSelected(suggestion) {
        this.editorPrincipal.set(suggestion);
        this.editorQuery.set(suggestion.displayLabel);
    }
    /** The day a date field holds, whatever its adapter holds dates as. */
    fieldDay(value) {
        return nxsDateFromAdapter(this.dateAdapter, value);
    }
    displaySuggestion(suggestion) {
        if (!suggestion)
            return '';
        return typeof suggestion === 'string' ? suggestion : suggestion.displayLabel;
    }
    applyEditor() {
        const editor = this.editor();
        if (!editor || !this.editable())
            return;
        this.editorSubmitted.set(true);
        if (this.editorInvalidRange())
            return;
        const begin = this.editorDated() ? toDay(this.editorBegin()) : null;
        const end = this.editorDated() ? toDay(this.editorEnd()) : null;
        const permission = this.editorPermission();
        if (editor.mode === 'add') {
            const principal = this.editorPrincipal();
            if (!principal)
                return;
            const key = `add-${++this.addCounter}`;
            const next = new Map(this.staged());
            next.set(key, { kind: 'add', key, principal: principal.id, permission, begin, end });
            if (principal.displayLabel !== principal.id)
                this.addedLabels.set(key, principal.displayLabel);
            this.staged.set(next);
        }
        else if (editor.item?.row) {
            this.stageReplace(editor.item.key, editor.item.row, permission, begin, end);
        }
        else if (editor.item) {
            this.updateAdd(editor.item.key, { permission, begin, end });
        }
        this.editor.set(null);
    }
    // ── Writes ──────────────────────────────────────────────────────────────────────────────────
    save() {
        const entries = [...this.staged().entries()];
        const changes = entries.map(([, change]) => change);
        if (changes.length === 0 || this.saving())
            return;
        this.saving.set(true);
        this.outcome.set(null);
        this.editor.set(null);
        const generation = this.generation;
        this.service
            .save(this.documentId(), changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (outcome) => {
                if (generation !== this.generation)
                    return;
                this.saving.set(false);
                this.outcome.set(outcome);
                // Neither wrote anything, so the user's staged changes stay for them to adjust.
                if (outcome.kind === 'refused' || outcome.kind === 'unread')
                    return;
                if (outcome.kind !== 'unverified' && outcome.snapshot)
                    this.snapshot.set(outcome.snapshot);
                // Writes stop at the refused change, so it and every change after it were never sent.
                if (outcome.kind === 'failed') {
                    this.keepStaged(entries.slice(changes.indexOf(outcome.change)));
                    if (outcome.applied + outcome.unconfirmed.length > 0)
                        this.notifyChanged();
                }
                else {
                    this.clearStaged();
                    this.notifyChanged();
                }
            },
            error: (error) => {
                if (generation !== this.generation)
                    return;
                // Every failure the service expects is an outcome. Anything else may have struck
                // mid-batch, so what the server holds is unknown.
                this.saving.set(false);
                this.outcome.set({ kind: 'unverified', count: changes.length, error });
                this.clearStaged();
                this.notifyChanged();
            },
        });
    }
    toggleInheritance() {
        const snapshot = this.snapshot();
        if (!snapshot || this.inheritanceBusy() || this.pendingCount() > 0)
            return;
        this.inheritanceBusy.set(true);
        this.inheritanceError.set(null);
        this.outcome.set(null);
        const generation = this.generation;
        this.service
            .setInheritanceBlocked(this.documentId(), !snapshot.inheritanceBlocked)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                if (generation !== this.generation)
                    return;
                this.inheritanceBusy.set(false);
                if (updated)
                    this.snapshot.set(updated);
                else
                    this.load(this.documentId());
                this.notifyChanged();
            },
            error: (error) => {
                if (generation !== this.generation)
                    return;
                this.inheritanceBusy.set(false);
                this.inheritanceError.set(this.serverMessage(error));
            },
        });
    }
    refusalReasonKey(refusal) {
        return `satori-components.permissions-panel.refusal.${refusal.reason}`;
    }
    failedEntry(outcome) {
        const change = outcome.change;
        return change.kind === 'add'
            ? this.entryLabel(change.principal, change.permission)
            : this.entryLabel(change.target.principal, change.kind === 'remove' ? change.target.permission : change.permission);
    }
    // ── Internals ───────────────────────────────────────────────────────────────────────────────
    clearStaged() {
        this.staged.set(new Map());
        this.addedLabels.clear();
    }
    notifyChanged() {
        this.permissionsChanged()?.();
    }
    keepStaged(entries) {
        const kept = new Map(entries);
        for (const key of [...this.addedLabels.keys()]) {
            if (!kept.has(key))
                this.addedLabels.delete(key);
        }
        this.staged.set(kept);
    }
    load(uid) {
        this.loading.set(true);
        this.loadError.set(null);
        this.loads.next(uid);
    }
    fromRow(key, row, lockedReason) {
        return {
            key,
            row,
            principal: row.principal,
            principalLabel: row.principalLabel,
            permission: row.permission,
            begin: instantToDay(row.begin),
            end: instantToDay(row.end),
            state: 'unchanged',
            granted: row.granted,
            lockedReason: lockedReason ?? (row.granted ? null : 'satori-components.permissions-panel.locked.deny'),
        };
    }
    /** Stages a replacement, or drops it when it would write the entry back unchanged. */
    stageReplace(key, row, permission, begin, end) {
        const next = new Map(this.staged());
        const unchanged = permission === row.permission &&
            begin === instantToDay(row.begin) &&
            end === instantToDay(row.end);
        if (unchanged)
            next.delete(key);
        else
            next.set(key, { kind: 'replace', target: row, permission, begin, end });
        this.staged.set(next);
    }
    updateAdd(key, patch) {
        const change = this.staged().get(key);
        if (change?.kind !== 'add')
            return;
        const next = new Map(this.staged());
        next.set(key, { ...change, ...patch });
        this.staged.set(next);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPermissionsPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsPermissionsPanelComponent, isStandalone: true, selector: "nxs-permissions-panel", inputs: { documentId: { classPropertyName: "documentId", publicName: "documentId", isSignal: true, isRequired: true, transformFunction: null }, permissionsChanged: { classPropertyName: "permissionsChanged", publicName: "permissionsChanged", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-permissions-panel" }, providers: [NxsPermissionsService, provideNxsDateAdapter()], ngImport: i0, template: "<div class=\"nxs-permissions-panel__header\">\n  <div class=\"nxs-permissions-panel__title\" role=\"heading\" aria-level=\"2\">\n    {{ 'satori-components.permissions-panel.title' | translate }}\n  </div>\n  @if (snapshot(); as current) {\n    <p class=\"nxs-permissions-panel__document\">{{ current.title }}</p>\n  }\n</div>\n\n@if (loading() && !snapshot()) {\n  <div class=\"nxs-permissions-panel__loading\" role=\"status\">\n    <mat-progress-spinner\n      mode=\"indeterminate\"\n      diameter=\"28\"\n      [attr.aria-label]=\"'satori-components.permissions-panel.loading' | translate\"\n    />\n  </div>\n} @else if (loadError(); as error) {\n  <div class=\"nxs-permissions-panel__error\" role=\"alert\">\n    <p>{{ loadErrorKey() | translate }}</p>\n    @if (error === 'failed') {\n      <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n        {{ 'satori-components.permissions-panel.retry' | translate }}\n      </button>\n    }\n  </div>\n} @else if (snapshot(); as current) {\n  @if (outcome(); as result) {\n    @switch (result.kind) {\n      @case ('saved') {\n        <p class=\"nxs-permissions-panel__status\" role=\"status\">\n          {{\n            (result.count === 1\n              ? 'satori-components.permissions-panel.saved.one'\n              : 'satori-components.permissions-panel.saved.many'\n            ) | translate: { count: result.count }\n          }}\n        </p>\n      }\n      @case ('refused') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.refused.heading' | translate }}\n          </p>\n          <ul class=\"nxs-permissions-panel__refusals\">\n            @for (refusal of result.refusals; track $index) {\n              <li>\n                <span class=\"nxs-permissions-panel__entry\">{{\n                  entryLabel(refusal.principal, refusal.permission)\n                }}</span\n                >: {{ refusalReasonKey(refusal) | translate }}\n              </li>\n            }\n          </ul>\n          <div class=\"nxs-permissions-panel__alert-actions\">\n            <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n              {{ 'satori-components.permissions-panel.reload' | translate }}\n            </button>\n            <button mat-button type=\"button\" (click)=\"dismissOutcome()\">\n              {{ 'satori-components.permissions-panel.dismiss' | translate }}\n            </button>\n          </div>\n        </div>\n      }\n      @case ('unconfirmed') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unconfirmed.heading' | translate }}\n          </p>\n          <ul class=\"nxs-permissions-panel__refusals\">\n            @for (refusal of result.refusals; track $index) {\n              <li>\n                <span class=\"nxs-permissions-panel__entry\">{{\n                  entryLabel(refusal.principal, refusal.permission)\n                }}</span\n                >: {{ refusalReasonKey(refusal) | translate }}\n              </li>\n            }\n          </ul>\n        </div>\n      }\n      @case ('unread') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unread.heading' | translate }}\n          </p>\n          <p class=\"nxs-permissions-panel__server-message\">{{ serverMessage(result.error) }}</p>\n          <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n            {{ 'satori-components.permissions-panel.reload' | translate }}\n          </button>\n        </div>\n      }\n      @case ('unverified') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unverified.heading' | translate }}\n          </p>\n          <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n            {{ 'satori-components.permissions-panel.reload' | translate }}\n          </button>\n        </div>\n      }\n      @case ('failed') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{\n              'satori-components.permissions-panel.failed.heading'\n                | translate: { applied: result.applied, total: result.total }\n            }}\n          </p>\n          <p>\n            <span class=\"nxs-permissions-panel__entry\">{{ failedEntry(result) }}</span>\n            @if (isDenied(result.error)) {\n              {{ 'satori-components.permissions-panel.failed.denied' | translate }}\n            }\n            <span class=\"nxs-permissions-panel__server-message\">{{\n              serverMessage(result.error)\n            }}</span>\n          </p>\n          @if (result.unconfirmed.length > 0) {\n            <p class=\"nxs-permissions-panel__alert-heading\">\n              {{ 'satori-components.permissions-panel.unconfirmed.heading' | translate }}\n            </p>\n            <ul class=\"nxs-permissions-panel__refusals\">\n              @for (refusal of result.unconfirmed; track $index) {\n                <li>\n                  <span class=\"nxs-permissions-panel__entry\">{{\n                    entryLabel(refusal.principal, refusal.permission)\n                  }}</span\n                  >: {{ refusalReasonKey(refusal) | translate }}\n                </li>\n              }\n            </ul>\n          }\n          @if (!result.snapshot) {\n            <p>{{ 'satori-components.permissions-panel.unverified.heading' | translate }}</p>\n            <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n              {{ 'satori-components.permissions-panel.reload' | translate }}\n            </button>\n          }\n        </div>\n      }\n    }\n  }\n\n  <!-- Local -->\n  <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-local'\">\n    <div class=\"nxs-permissions-panel__section-header\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-local'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.local.heading' | translate }}\n      </div>\n      @if (canManage() && !editor()) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          color=\"primary\"\n          [disabled]=\"!editable()\"\n          (click)=\"openAdd()\"\n        >\n          <mat-icon aria-hidden=\"true\">add</mat-icon>\n          {{ 'satori-components.permissions-panel.add' | translate }}\n        </button>\n      }\n    </div>\n\n    @if (editor(); as edit) {\n      <form\n        class=\"nxs-permissions-panel__editor\"\n        [attr.aria-labelledby]=\"idPrefix + '-editor-heading'\"\n        (submit)=\"$event.preventDefault(); applyEditor()\"\n      >\n        <div\n          class=\"nxs-permissions-panel__editor-heading\"\n          [id]=\"idPrefix + '-editor-heading'\"\n          role=\"heading\"\n          aria-level=\"4\"\n        >\n          @if (edit.mode === 'add') {\n            {{ 'satori-components.permissions-panel.editor.add-heading' | translate }}\n          } @else {\n            {{\n              'satori-components.permissions-panel.editor.edit-heading'\n                | translate: { principal: edit.item?.principal }\n            }}\n          }\n        </div>\n        @if (edit.mode === 'add') {\n          <mat-form-field appearance=\"outline\" class=\"nxs-permissions-panel__field--wide\">\n            <mat-label>{{\n              'satori-components.permissions-panel.editor.principal' | translate\n            }}</mat-label>\n            <input\n              #principalInput\n              matInput\n              type=\"text\"\n              autocomplete=\"off\"\n              [value]=\"editorQuery()\"\n              [matAutocomplete]=\"principalAuto\"\n              (input)=\"onPrincipalInput(principalInput.value)\"\n            />\n            <mat-autocomplete\n              #principalAuto=\"matAutocomplete\"\n              [displayWith]=\"displaySuggestion\"\n              (optionSelected)=\"onPrincipalSelected($event.option.value)\"\n            >\n              @for (suggestion of suggestions(); track suggestion.id) {\n                <mat-option [value]=\"suggestion\">\n                  <mat-icon aria-hidden=\"true\">{{\n                    suggestion.type === 'GROUP_TYPE' ? 'group' : 'person'\n                  }}</mat-icon>\n                  {{ suggestion.displayLabel }}\n                  <span class=\"nxs-permissions-panel__id\">{{ suggestion.id }}</span>\n                </mat-option>\n              }\n            </mat-autocomplete>\n          </mat-form-field>\n          @if (editorSubmitted() && !editorPrincipal()) {\n            <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n              {{ 'satori-components.permissions-panel.editor.no-principal' | translate }}\n            </p>\n          }\n        }\n        <mat-form-field appearance=\"outline\" class=\"nxs-permissions-panel__field--wide\">\n          <mat-label>{{\n            'satori-components.permissions-panel.editor.permission' | translate\n          }}</mat-label>\n          <mat-select\n            [value]=\"editorPermission()\"\n            (selectionChange)=\"editorPermission.set($event.value)\"\n          >\n            <mat-select-trigger>\n              {{ permissionLabel(editorPermission()) }}\n              @if (permissionLabel(editorPermission()) !== editorPermission()) {\n                <span class=\"nxs-permissions-panel__id\">{{ editorPermission() }}</span>\n              }\n            </mat-select-trigger>\n            @for (extra of editorExtraPermissions(); track extra) {\n              <mat-option [value]=\"extra\" [attr.data-permission]=\"extra\">\n                {{ permissionLabel(extra) }}\n                <span class=\"nxs-permissions-panel__id\">{{ extra }}</span>\n              </mat-option>\n            }\n            @for (group of permissionGroups(); track group.label) {\n              <mat-optgroup [label]=\"group.label | translate\">\n                @for (permission of group.permissions; track permission) {\n                  <mat-option [value]=\"permission\" [attr.data-permission]=\"permission\">\n                    {{ permissionLabel(permission) }}\n                    @if (permissionLabel(permission) !== permission) {\n                      <span class=\"nxs-permissions-panel__id\">{{ permission }}</span>\n                    }\n                  </mat-option>\n                }\n              </mat-optgroup>\n            }\n          </mat-select>\n        </mat-form-field>\n        <mat-radio-group\n          class=\"nxs-permissions-panel__time-frame\"\n          [attr.aria-label]=\"'satori-components.permissions-panel.column.time-frame' | translate\"\n          [value]=\"editorDated() ? 'dated' : 'permanent'\"\n          (change)=\"editorDated.set($event.value === 'dated')\"\n        >\n          <mat-radio-button value=\"permanent\">{{\n            'satori-components.permissions-panel.editor.permanent' | translate\n          }}</mat-radio-button>\n          <mat-radio-button value=\"dated\">{{\n            'satori-components.permissions-panel.editor.date-based' | translate\n          }}</mat-radio-button>\n        </mat-radio-group>\n        @if (editorDated()) {\n          <div class=\"nxs-permissions-panel__dates\">\n            <mat-form-field appearance=\"outline\">\n              <mat-label>{{\n                'satori-components.permissions-panel.editor.from' | translate\n              }}</mat-label>\n              <input\n                matInput\n                [matDatepicker]=\"beginPicker\"\n                [value]=\"editorBeginField()\"\n                (dateChange)=\"editorBegin.set(fieldDay($event.value))\"\n              />\n              <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n              <mat-datepicker #beginPicker />\n            </mat-form-field>\n            <mat-form-field appearance=\"outline\">\n              <mat-label>{{\n                'satori-components.permissions-panel.editor.to' | translate\n              }}</mat-label>\n              <input\n                matInput\n                [matDatepicker]=\"endPicker\"\n                [value]=\"editorEndField()\"\n                (dateChange)=\"editorEnd.set(fieldDay($event.value))\"\n              />\n              <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n              <mat-datepicker #endPicker />\n            </mat-form-field>\n          </div>\n          @if (editorInvalidRange()) {\n            <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n              {{ 'satori-components.permissions-panel.editor.end-before-begin' | translate }}\n            </p>\n          }\n        }\n        <div class=\"nxs-permissions-panel__editor-actions\">\n          <button mat-button type=\"button\" (click)=\"closeEditor()\">\n            {{ 'satori-components.permissions-panel.editor.cancel' | translate }}\n          </button>\n          <button mat-flat-button color=\"primary\" type=\"submit\" [disabled]=\"!editable()\">\n            {{\n              (edit.mode === 'add'\n                ? 'satori-components.permissions-panel.editor.add'\n                : 'satori-components.permissions-panel.editor.apply'\n              ) | translate\n            }}\n          </button>\n        </div>\n      </form>\n    }\n\n    @if (localItems().length === 0) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.local.empty' | translate }}\n      </p>\n    } @else {\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-local'\"\n        [dataSource]=\"localItems()\"\n        [trackBy]=\"trackItem\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            @if (item.principalLabel && item.principalLabel !== item.principal) {\n              {{ item.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ item.principal }}</span>\n            } @else {\n              {{ item.principal }}\n            }\n            @switch (item.state) {\n              @case ('added') {\n                <span class=\"nxs-permissions-panel__badge\">{{\n                  'satori-components.permissions-panel.state.added' | translate\n                }}</span>\n              }\n              @case ('changed') {\n                <span class=\"nxs-permissions-panel__badge\">{{\n                  'satori-components.permissions-panel.state.changed' | translate\n                }}</span>\n              }\n              @case ('removed') {\n                <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                  'satori-components.permissions-panel.state.removed' | translate\n                }}</span>\n              }\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            @if (canManage() && !item.lockedReason && item.state !== 'removed') {\n              <mat-select\n                class=\"nxs-permissions-panel__select\"\n                [value]=\"item.permission\"\n                [disabled]=\"!editable()\"\n                [aria-label]=\"\n                  'satori-components.permissions-panel.permission-for'\n                    | translate: { principal: item.principal }\n                \"\n                (selectionChange)=\"setPermission(item, $event.value)\"\n              >\n                <mat-select-trigger>\n                  {{ permissionLabel(item.permission) }}\n                  @if (permissionLabel(item.permission) !== item.permission) {\n                    <span class=\"nxs-permissions-panel__id\">{{ item.permission }}</span>\n                  }\n                </mat-select-trigger>\n                @for (extra of item.extraPermissions; track extra) {\n                  <mat-option [value]=\"extra\" [attr.data-permission]=\"extra\">\n                    {{ permissionLabel(extra) }}\n                    <span class=\"nxs-permissions-panel__id\">{{ extra }}</span>\n                  </mat-option>\n                }\n                @for (group of permissionGroups(); track group.label) {\n                  <mat-optgroup [label]=\"group.label | translate\">\n                    @for (permission of group.permissions; track permission) {\n                      <mat-option [value]=\"permission\" [attr.data-permission]=\"permission\">\n                        {{ permissionLabel(permission) }}\n                        @if (permissionLabel(permission) !== permission) {\n                          <span class=\"nxs-permissions-panel__id\">{{ permission }}</span>\n                        }\n                      </mat-option>\n                    }\n                  </mat-optgroup>\n                }\n              </mat-select>\n            } @else {\n              {{ permissionLabel(item.permission) }}\n              @if (permissionLabel(item.permission) !== item.permission) {\n                <span class=\"nxs-permissions-panel__id\">{{ item.permission }}</span>\n              }\n              @if (!item.granted) {\n                <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                  'satori-components.permissions-panel.denied' | translate\n                }}</span>\n              }\n            }\n            @if (item.lockedReason && canManage()) {\n              <span class=\"nxs-permissions-panel__hint\">{{ item.lockedReason | translate }}</span>\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            {{ timeFrame(item.begin, item.end) }}\n            @if (item.state === 'unchanged' && item.row?.status === 'pending') {\n              <span class=\"nxs-permissions-panel__badge\">{{\n                'satori-components.permissions-panel.status.pending' | translate\n              }}</span>\n            }\n            @if (item.state === 'unchanged' && item.row?.status === 'archived') {\n              <span class=\"nxs-permissions-panel__badge\">{{\n                'satori-components.permissions-panel.status.archived' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"grantedBy\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.granted-by' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">{{ item.row?.creator || '\u2014' }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"actions\">\n          <th mat-header-cell *matHeaderCellDef>\n            <span class=\"nxs-permissions-panel__visually-hidden\">{{\n              'satori-components.permissions-panel.column.actions' | translate\n            }}</span>\n          </th>\n          <td mat-cell *matCellDef=\"let item\" class=\"nxs-permissions-panel__actions\">\n            @if (canManage()) {\n              @if (!item.lockedReason && item.state !== 'removed') {\n                <button\n                  mat-icon-button\n                  type=\"button\"\n                  [matTooltip]=\"'satori-components.permissions-panel.edit' | translate\"\n                  [attr.aria-label]=\"\n                    'satori-components.permissions-panel.edit-entry'\n                      | translate: { principal: item.principal }\n                  \"\n                  [disabled]=\"!editable()\"\n                  (click)=\"openEdit(item)\"\n                >\n                  <mat-icon aria-hidden=\"true\">edit</mat-icon>\n                </button>\n              }\n              @if (item.state === 'removed') {\n                <button\n                  mat-button\n                  type=\"button\"\n                  [disabled]=\"!editable()\"\n                  (click)=\"toggleRemove(item)\"\n                >\n                  {{ 'satori-components.permissions-panel.undo' | translate }}\n                </button>\n              } @else if (\n                item.lockedReason !== 'satori-components.permissions-panel.locked.no-id'\n              ) {\n                <button\n                  mat-icon-button\n                  type=\"button\"\n                  [matTooltip]=\"'satori-components.permissions-panel.remove' | translate\"\n                  [attr.aria-label]=\"\n                    'satori-components.permissions-panel.remove-entry'\n                      | translate\n                        : {\n                            principal: item.principal,\n                            permission: permissionLabel(item.permission),\n                          }\n                  \"\n                  [disabled]=\"!editable()\"\n                  (click)=\"toggleRemove(item)\"\n                >\n                  <mat-icon aria-hidden=\"true\">delete</mat-icon>\n                </button>\n              }\n            }\n          </td>\n        </ng-container>\n\n        <tr mat-header-row *matHeaderRowDef=\"localColumns\"></tr>\n        <tr\n          mat-row\n          *matRowDef=\"let item; columns: localColumns\"\n          [class.nxs-permissions-panel__row--removed]=\"item.state === 'removed'\"\n          [class.nxs-permissions-panel__row--pending]=\"item.state !== 'unchanged'\"\n        ></tr>\n      </table>\n    }\n\n    @if (pendingCount() > 0) {\n      <div class=\"nxs-permissions-panel__pending\">\n        <span role=\"status\">{{\n          (pendingCount() === 1\n            ? 'satori-components.permissions-panel.pending.one'\n            : 'satori-components.permissions-panel.pending.many'\n          ) | translate: { count: pendingCount() }\n        }}</span>\n        <span class=\"nxs-permissions-panel__spacer\"></span>\n        <button mat-button type=\"button\" [disabled]=\"saving()\" (click)=\"discard()\">\n          {{ 'satori-components.permissions-panel.discard' | translate }}\n        </button>\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"saving()\"\n          (click)=\"save()\"\n        >\n          {{ 'satori-components.permissions-panel.save' | translate }}\n        </button>\n      </div>\n    }\n  </section>\n\n  <!-- Inherited -->\n  <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-inherited'\">\n    <div class=\"nxs-permissions-panel__section-header\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-inherited'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.inherited.heading' | translate }}\n      </div>\n      @if (canManage()) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          [disabled]=\"inheritanceBusy() || pendingCount() > 0\"\n          [matTooltip]=\"\n            pendingCount() > 0\n              ? ('satori-components.permissions-panel.inherited.save-first' | translate)\n              : ''\n          \"\n          (click)=\"toggleInheritance()\"\n        >\n          {{\n            (current.inheritanceBlocked\n              ? 'satori-components.permissions-panel.inherited.unblock'\n              : 'satori-components.permissions-panel.inherited.block'\n            ) | translate\n          }}\n        </button>\n      }\n    </div>\n    @if (inheritanceError(); as message) {\n      <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n        {{ 'satori-components.permissions-panel.inherited.toggle-failed' | translate }}\n        <span class=\"nxs-permissions-panel__server-message\">{{ message }}</span>\n      </p>\n    }\n    @if (current.inheritanceBlocked) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.inherited.blocked' | translate }}\n      </p>\n    } @else if (current.inherited.length === 0) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.inherited.empty' | translate }}\n      </p>\n    } @else {\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-inherited'\"\n        [dataSource]=\"current.inherited\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            @if (row.principalLabel && row.principalLabel !== row.principal) {\n              {{ row.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ row.principal }}</span>\n            } @else {\n              {{ row.principal }}\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            {{ permissionLabel(row.permission) }}\n            @if (permissionLabel(row.permission) !== row.permission) {\n              <span class=\"nxs-permissions-panel__id\">{{ row.permission }}</span>\n            }\n            @if (!row.granted) {\n              <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                'satori-components.permissions-panel.denied' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ timeFrame(row.begin, row.end) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"grantedBy\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.granted-by' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ row.creator || '\u2014' }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"inheritedColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: inheritedColumns\"></tr>\n      </table>\n    }\n  </section>\n\n  @if (current.otherAcls.length > 0) {\n    <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-other'\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-other'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.other.heading' | translate }}\n      </div>\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-other'\"\n        [dataSource]=\"current.otherAcls\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            @if (row.principalLabel && row.principalLabel !== row.principal) {\n              {{ row.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ row.principal }}</span>\n            } @else {\n              {{ row.principal }}\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            {{ permissionLabel(row.permission) }}\n            @if (permissionLabel(row.permission) !== row.permission) {\n              <span class=\"nxs-permissions-panel__id\">{{ row.permission }}</span>\n            }\n            @if (!row.granted) {\n              <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                'satori-components.permissions-panel.denied' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ timeFrame(row.begin, row.end) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"acl\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.acl' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ row.acl }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"otherColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: otherColumns\"></tr>\n      </table>\n    </section>\n  }\n}\n", styles: [":host{display:flex;flex-direction:column;gap:16px;padding:16px 0;color:var(--mat-sys-on-surface)}.nxs-permissions-panel__header{display:flex;flex-direction:column;gap:2px}.nxs-permissions-panel__title{font-size:1rem;font-weight:500;line-height:1.5rem}.nxs-permissions-panel__document{margin:0;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__loading{display:flex;justify-content:center;padding:24px}.nxs-permissions-panel__error,.nxs-permissions-panel__alert{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:12px 16px;border-radius:8px;background:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}.nxs-permissions-panel__error p,.nxs-permissions-panel__alert p{margin:0}.nxs-permissions-panel__alert-heading{font-weight:500}.nxs-permissions-panel__alert-actions{display:flex;gap:8px}.nxs-permissions-panel__refusals{margin:0;padding-inline-start:20px}.nxs-permissions-panel__entry{font-weight:500}.nxs-permissions-panel__server-message{display:block;font-size:.75rem}.nxs-permissions-panel__status{margin:0;padding:8px 16px;border-radius:8px;background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}.nxs-permissions-panel__section{display:flex;flex-direction:column;gap:8px}.nxs-permissions-panel__section-header{display:flex;align-items:center;justify-content:space-between;gap:8px}.nxs-permissions-panel__section-title{font-size:.875rem;font-weight:600}.nxs-permissions-panel__empty{margin:0;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__table{width:100%}.nxs-permissions-panel__select{min-width:200px}.nxs-permissions-panel__id{margin-inline-start:6px;font-size:.75rem;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__badge{display:inline-block;margin-inline-start:8px;padding:0 8px;border-radius:999px;font-size:.6875rem;font-weight:500;line-height:1.25rem;background:var(--mat-sys-surface-container-highest);color:var(--mat-sys-on-surface)}.nxs-permissions-panel__badge--removed{background:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}.nxs-permissions-panel__hint{display:block;font-size:.75rem;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__row--pending{background:var(--mat-sys-surface-container-low)}.nxs-permissions-panel__row--removed td{text-decoration:line-through}.nxs-permissions-panel__actions{white-space:nowrap;text-align:end}.nxs-permissions-panel__pending{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:var(--mat-sys-surface-container)}.nxs-permissions-panel__spacer{flex:1}.nxs-permissions-panel__editor{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-permissions-panel__editor-heading{font-size:.875rem;font-weight:500}.nxs-permissions-panel__field--wide{width:100%}.nxs-permissions-panel__time-frame{display:flex;gap:24px}.nxs-permissions-panel__dates{display:flex;flex-wrap:wrap;gap:16px}.nxs-permissions-panel__dates mat-form-field{flex:1;min-width:160px}.nxs-permissions-panel__field-error{margin:0;color:var(--mat-sys-error)}.nxs-permissions-panel__editor-actions{display:flex;justify-content:flex-end;gap:8px}.nxs-permissions-panel__visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i2$4.MatOptgroup, selector: "mat-optgroup", inputs: ["label", "disabled"], exportAs: ["matOptgroup"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDatepickerModule }, { kind: "component", type: i1$3.MatDatepicker, selector: "mat-datepicker", exportAs: ["matDatepicker"] }, { kind: "directive", type: i1$3.MatDatepickerInput, selector: "input[matDatepicker]", inputs: ["matDatepicker", "min", "max", "matDatepickerFilter"], exportAs: ["matDatepickerInput"] }, { kind: "component", type: i1$3.MatDatepickerToggle, selector: "mat-datepicker-toggle", inputs: ["for", "tabIndex", "aria-label", "disabled", "disableRipple"], exportAs: ["matDatepickerToggle"] }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "ngmodule", type: MatProgressSpinnerModule }, { kind: "component", type: i1$1.MatProgressSpinner, selector: "mat-progress-spinner, mat-spinner", inputs: ["color", "mode", "value", "diameter", "strokeWidth"], exportAs: ["matProgressSpinner"] }, { kind: "ngmodule", type: MatRadioModule }, { kind: "directive", type: i5.MatRadioGroup, selector: "mat-radio-group", inputs: ["color", "name", "labelPosition", "value", "selected", "disabled", "required", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioGroup"] }, { kind: "component", type: i5.MatRadioButton, selector: "mat-radio-button", inputs: ["id", "name", "aria-label", "aria-labelledby", "aria-describedby", "disableRipple", "tabIndex", "checked", "value", "labelPosition", "disabled", "required", "color", "disabledInteractive"], outputs: ["change"], exportAs: ["matRadioButton"] }, { kind: "ngmodule", type: MatSelectModule }, { kind: "component", type: i2$4.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth", "canSelectNullableOptions"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "directive", type: i2$4.MatSelectTrigger, selector: "mat-select-trigger" }, { kind: "ngmodule", type: MatTableModule }, { kind: "component", type: i8.MatTable, selector: "mat-table, table[mat-table]", exportAs: ["matTable"] }, { kind: "directive", type: i8.MatHeaderCellDef, selector: "[matHeaderCellDef]" }, { kind: "directive", type: i8.MatHeaderRowDef, selector: "[matHeaderRowDef]", inputs: ["matHeaderRowDef", "matHeaderRowDefSticky"] }, { kind: "directive", type: i8.MatColumnDef, selector: "[matColumnDef]", inputs: ["matColumnDef"] }, { kind: "directive", type: i8.MatCellDef, selector: "[matCellDef]" }, { kind: "directive", type: i8.MatRowDef, selector: "[matRowDef]", inputs: ["matRowDefColumns", "matRowDefWhen"] }, { kind: "directive", type: i8.MatHeaderCell, selector: "mat-header-cell, th[mat-header-cell]" }, { kind: "directive", type: i8.MatCell, selector: "mat-cell, td[mat-cell]" }, { kind: "component", type: i8.MatHeaderRow, selector: "mat-header-row, tr[mat-header-row]", exportAs: ["matHeaderRow"] }, { kind: "component", type: i8.MatRow, selector: "mat-row, tr[mat-row]", exportAs: ["matRow"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPermissionsPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-permissions-panel', standalone: true, imports: [
                        TranslatePipe,
                        MatAutocompleteModule,
                        MatButtonModule,
                        MatDatepickerModule,
                        MatFormFieldModule,
                        MatIconModule,
                        MatInputModule,
                        MatProgressSpinnerModule,
                        MatRadioModule,
                        MatSelectModule,
                        MatTableModule,
                        MatTooltipModule,
                    ], providers: [NxsPermissionsService, provideNxsDateAdapter()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-permissions-panel' }, template: "<div class=\"nxs-permissions-panel__header\">\n  <div class=\"nxs-permissions-panel__title\" role=\"heading\" aria-level=\"2\">\n    {{ 'satori-components.permissions-panel.title' | translate }}\n  </div>\n  @if (snapshot(); as current) {\n    <p class=\"nxs-permissions-panel__document\">{{ current.title }}</p>\n  }\n</div>\n\n@if (loading() && !snapshot()) {\n  <div class=\"nxs-permissions-panel__loading\" role=\"status\">\n    <mat-progress-spinner\n      mode=\"indeterminate\"\n      diameter=\"28\"\n      [attr.aria-label]=\"'satori-components.permissions-panel.loading' | translate\"\n    />\n  </div>\n} @else if (loadError(); as error) {\n  <div class=\"nxs-permissions-panel__error\" role=\"alert\">\n    <p>{{ loadErrorKey() | translate }}</p>\n    @if (error === 'failed') {\n      <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n        {{ 'satori-components.permissions-panel.retry' | translate }}\n      </button>\n    }\n  </div>\n} @else if (snapshot(); as current) {\n  @if (outcome(); as result) {\n    @switch (result.kind) {\n      @case ('saved') {\n        <p class=\"nxs-permissions-panel__status\" role=\"status\">\n          {{\n            (result.count === 1\n              ? 'satori-components.permissions-panel.saved.one'\n              : 'satori-components.permissions-panel.saved.many'\n            ) | translate: { count: result.count }\n          }}\n        </p>\n      }\n      @case ('refused') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.refused.heading' | translate }}\n          </p>\n          <ul class=\"nxs-permissions-panel__refusals\">\n            @for (refusal of result.refusals; track $index) {\n              <li>\n                <span class=\"nxs-permissions-panel__entry\">{{\n                  entryLabel(refusal.principal, refusal.permission)\n                }}</span\n                >: {{ refusalReasonKey(refusal) | translate }}\n              </li>\n            }\n          </ul>\n          <div class=\"nxs-permissions-panel__alert-actions\">\n            <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n              {{ 'satori-components.permissions-panel.reload' | translate }}\n            </button>\n            <button mat-button type=\"button\" (click)=\"dismissOutcome()\">\n              {{ 'satori-components.permissions-panel.dismiss' | translate }}\n            </button>\n          </div>\n        </div>\n      }\n      @case ('unconfirmed') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unconfirmed.heading' | translate }}\n          </p>\n          <ul class=\"nxs-permissions-panel__refusals\">\n            @for (refusal of result.refusals; track $index) {\n              <li>\n                <span class=\"nxs-permissions-panel__entry\">{{\n                  entryLabel(refusal.principal, refusal.permission)\n                }}</span\n                >: {{ refusalReasonKey(refusal) | translate }}\n              </li>\n            }\n          </ul>\n        </div>\n      }\n      @case ('unread') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unread.heading' | translate }}\n          </p>\n          <p class=\"nxs-permissions-panel__server-message\">{{ serverMessage(result.error) }}</p>\n          <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n            {{ 'satori-components.permissions-panel.reload' | translate }}\n          </button>\n        </div>\n      }\n      @case ('unverified') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unverified.heading' | translate }}\n          </p>\n          <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n            {{ 'satori-components.permissions-panel.reload' | translate }}\n          </button>\n        </div>\n      }\n      @case ('failed') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{\n              'satori-components.permissions-panel.failed.heading'\n                | translate: { applied: result.applied, total: result.total }\n            }}\n          </p>\n          <p>\n            <span class=\"nxs-permissions-panel__entry\">{{ failedEntry(result) }}</span>\n            @if (isDenied(result.error)) {\n              {{ 'satori-components.permissions-panel.failed.denied' | translate }}\n            }\n            <span class=\"nxs-permissions-panel__server-message\">{{\n              serverMessage(result.error)\n            }}</span>\n          </p>\n          @if (result.unconfirmed.length > 0) {\n            <p class=\"nxs-permissions-panel__alert-heading\">\n              {{ 'satori-components.permissions-panel.unconfirmed.heading' | translate }}\n            </p>\n            <ul class=\"nxs-permissions-panel__refusals\">\n              @for (refusal of result.unconfirmed; track $index) {\n                <li>\n                  <span class=\"nxs-permissions-panel__entry\">{{\n                    entryLabel(refusal.principal, refusal.permission)\n                  }}</span\n                  >: {{ refusalReasonKey(refusal) | translate }}\n                </li>\n              }\n            </ul>\n          }\n          @if (!result.snapshot) {\n            <p>{{ 'satori-components.permissions-panel.unverified.heading' | translate }}</p>\n            <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n              {{ 'satori-components.permissions-panel.reload' | translate }}\n            </button>\n          }\n        </div>\n      }\n    }\n  }\n\n  <!-- Local -->\n  <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-local'\">\n    <div class=\"nxs-permissions-panel__section-header\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-local'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.local.heading' | translate }}\n      </div>\n      @if (canManage() && !editor()) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          color=\"primary\"\n          [disabled]=\"!editable()\"\n          (click)=\"openAdd()\"\n        >\n          <mat-icon aria-hidden=\"true\">add</mat-icon>\n          {{ 'satori-components.permissions-panel.add' | translate }}\n        </button>\n      }\n    </div>\n\n    @if (editor(); as edit) {\n      <form\n        class=\"nxs-permissions-panel__editor\"\n        [attr.aria-labelledby]=\"idPrefix + '-editor-heading'\"\n        (submit)=\"$event.preventDefault(); applyEditor()\"\n      >\n        <div\n          class=\"nxs-permissions-panel__editor-heading\"\n          [id]=\"idPrefix + '-editor-heading'\"\n          role=\"heading\"\n          aria-level=\"4\"\n        >\n          @if (edit.mode === 'add') {\n            {{ 'satori-components.permissions-panel.editor.add-heading' | translate }}\n          } @else {\n            {{\n              'satori-components.permissions-panel.editor.edit-heading'\n                | translate: { principal: edit.item?.principal }\n            }}\n          }\n        </div>\n        @if (edit.mode === 'add') {\n          <mat-form-field appearance=\"outline\" class=\"nxs-permissions-panel__field--wide\">\n            <mat-label>{{\n              'satori-components.permissions-panel.editor.principal' | translate\n            }}</mat-label>\n            <input\n              #principalInput\n              matInput\n              type=\"text\"\n              autocomplete=\"off\"\n              [value]=\"editorQuery()\"\n              [matAutocomplete]=\"principalAuto\"\n              (input)=\"onPrincipalInput(principalInput.value)\"\n            />\n            <mat-autocomplete\n              #principalAuto=\"matAutocomplete\"\n              [displayWith]=\"displaySuggestion\"\n              (optionSelected)=\"onPrincipalSelected($event.option.value)\"\n            >\n              @for (suggestion of suggestions(); track suggestion.id) {\n                <mat-option [value]=\"suggestion\">\n                  <mat-icon aria-hidden=\"true\">{{\n                    suggestion.type === 'GROUP_TYPE' ? 'group' : 'person'\n                  }}</mat-icon>\n                  {{ suggestion.displayLabel }}\n                  <span class=\"nxs-permissions-panel__id\">{{ suggestion.id }}</span>\n                </mat-option>\n              }\n            </mat-autocomplete>\n          </mat-form-field>\n          @if (editorSubmitted() && !editorPrincipal()) {\n            <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n              {{ 'satori-components.permissions-panel.editor.no-principal' | translate }}\n            </p>\n          }\n        }\n        <mat-form-field appearance=\"outline\" class=\"nxs-permissions-panel__field--wide\">\n          <mat-label>{{\n            'satori-components.permissions-panel.editor.permission' | translate\n          }}</mat-label>\n          <mat-select\n            [value]=\"editorPermission()\"\n            (selectionChange)=\"editorPermission.set($event.value)\"\n          >\n            <mat-select-trigger>\n              {{ permissionLabel(editorPermission()) }}\n              @if (permissionLabel(editorPermission()) !== editorPermission()) {\n                <span class=\"nxs-permissions-panel__id\">{{ editorPermission() }}</span>\n              }\n            </mat-select-trigger>\n            @for (extra of editorExtraPermissions(); track extra) {\n              <mat-option [value]=\"extra\" [attr.data-permission]=\"extra\">\n                {{ permissionLabel(extra) }}\n                <span class=\"nxs-permissions-panel__id\">{{ extra }}</span>\n              </mat-option>\n            }\n            @for (group of permissionGroups(); track group.label) {\n              <mat-optgroup [label]=\"group.label | translate\">\n                @for (permission of group.permissions; track permission) {\n                  <mat-option [value]=\"permission\" [attr.data-permission]=\"permission\">\n                    {{ permissionLabel(permission) }}\n                    @if (permissionLabel(permission) !== permission) {\n                      <span class=\"nxs-permissions-panel__id\">{{ permission }}</span>\n                    }\n                  </mat-option>\n                }\n              </mat-optgroup>\n            }\n          </mat-select>\n        </mat-form-field>\n        <mat-radio-group\n          class=\"nxs-permissions-panel__time-frame\"\n          [attr.aria-label]=\"'satori-components.permissions-panel.column.time-frame' | translate\"\n          [value]=\"editorDated() ? 'dated' : 'permanent'\"\n          (change)=\"editorDated.set($event.value === 'dated')\"\n        >\n          <mat-radio-button value=\"permanent\">{{\n            'satori-components.permissions-panel.editor.permanent' | translate\n          }}</mat-radio-button>\n          <mat-radio-button value=\"dated\">{{\n            'satori-components.permissions-panel.editor.date-based' | translate\n          }}</mat-radio-button>\n        </mat-radio-group>\n        @if (editorDated()) {\n          <div class=\"nxs-permissions-panel__dates\">\n            <mat-form-field appearance=\"outline\">\n              <mat-label>{{\n                'satori-components.permissions-panel.editor.from' | translate\n              }}</mat-label>\n              <input\n                matInput\n                [matDatepicker]=\"beginPicker\"\n                [value]=\"editorBeginField()\"\n                (dateChange)=\"editorBegin.set(fieldDay($event.value))\"\n              />\n              <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n              <mat-datepicker #beginPicker />\n            </mat-form-field>\n            <mat-form-field appearance=\"outline\">\n              <mat-label>{{\n                'satori-components.permissions-panel.editor.to' | translate\n              }}</mat-label>\n              <input\n                matInput\n                [matDatepicker]=\"endPicker\"\n                [value]=\"editorEndField()\"\n                (dateChange)=\"editorEnd.set(fieldDay($event.value))\"\n              />\n              <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n              <mat-datepicker #endPicker />\n            </mat-form-field>\n          </div>\n          @if (editorInvalidRange()) {\n            <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n              {{ 'satori-components.permissions-panel.editor.end-before-begin' | translate }}\n            </p>\n          }\n        }\n        <div class=\"nxs-permissions-panel__editor-actions\">\n          <button mat-button type=\"button\" (click)=\"closeEditor()\">\n            {{ 'satori-components.permissions-panel.editor.cancel' | translate }}\n          </button>\n          <button mat-flat-button color=\"primary\" type=\"submit\" [disabled]=\"!editable()\">\n            {{\n              (edit.mode === 'add'\n                ? 'satori-components.permissions-panel.editor.add'\n                : 'satori-components.permissions-panel.editor.apply'\n              ) | translate\n            }}\n          </button>\n        </div>\n      </form>\n    }\n\n    @if (localItems().length === 0) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.local.empty' | translate }}\n      </p>\n    } @else {\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-local'\"\n        [dataSource]=\"localItems()\"\n        [trackBy]=\"trackItem\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            @if (item.principalLabel && item.principalLabel !== item.principal) {\n              {{ item.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ item.principal }}</span>\n            } @else {\n              {{ item.principal }}\n            }\n            @switch (item.state) {\n              @case ('added') {\n                <span class=\"nxs-permissions-panel__badge\">{{\n                  'satori-components.permissions-panel.state.added' | translate\n                }}</span>\n              }\n              @case ('changed') {\n                <span class=\"nxs-permissions-panel__badge\">{{\n                  'satori-components.permissions-panel.state.changed' | translate\n                }}</span>\n              }\n              @case ('removed') {\n                <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                  'satori-components.permissions-panel.state.removed' | translate\n                }}</span>\n              }\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            @if (canManage() && !item.lockedReason && item.state !== 'removed') {\n              <mat-select\n                class=\"nxs-permissions-panel__select\"\n                [value]=\"item.permission\"\n                [disabled]=\"!editable()\"\n                [aria-label]=\"\n                  'satori-components.permissions-panel.permission-for'\n                    | translate: { principal: item.principal }\n                \"\n                (selectionChange)=\"setPermission(item, $event.value)\"\n              >\n                <mat-select-trigger>\n                  {{ permissionLabel(item.permission) }}\n                  @if (permissionLabel(item.permission) !== item.permission) {\n                    <span class=\"nxs-permissions-panel__id\">{{ item.permission }}</span>\n                  }\n                </mat-select-trigger>\n                @for (extra of item.extraPermissions; track extra) {\n                  <mat-option [value]=\"extra\" [attr.data-permission]=\"extra\">\n                    {{ permissionLabel(extra) }}\n                    <span class=\"nxs-permissions-panel__id\">{{ extra }}</span>\n                  </mat-option>\n                }\n                @for (group of permissionGroups(); track group.label) {\n                  <mat-optgroup [label]=\"group.label | translate\">\n                    @for (permission of group.permissions; track permission) {\n                      <mat-option [value]=\"permission\" [attr.data-permission]=\"permission\">\n                        {{ permissionLabel(permission) }}\n                        @if (permissionLabel(permission) !== permission) {\n                          <span class=\"nxs-permissions-panel__id\">{{ permission }}</span>\n                        }\n                      </mat-option>\n                    }\n                  </mat-optgroup>\n                }\n              </mat-select>\n            } @else {\n              {{ permissionLabel(item.permission) }}\n              @if (permissionLabel(item.permission) !== item.permission) {\n                <span class=\"nxs-permissions-panel__id\">{{ item.permission }}</span>\n              }\n              @if (!item.granted) {\n                <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                  'satori-components.permissions-panel.denied' | translate\n                }}</span>\n              }\n            }\n            @if (item.lockedReason && canManage()) {\n              <span class=\"nxs-permissions-panel__hint\">{{ item.lockedReason | translate }}</span>\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            {{ timeFrame(item.begin, item.end) }}\n            @if (item.state === 'unchanged' && item.row?.status === 'pending') {\n              <span class=\"nxs-permissions-panel__badge\">{{\n                'satori-components.permissions-panel.status.pending' | translate\n              }}</span>\n            }\n            @if (item.state === 'unchanged' && item.row?.status === 'archived') {\n              <span class=\"nxs-permissions-panel__badge\">{{\n                'satori-components.permissions-panel.status.archived' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"grantedBy\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.granted-by' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">{{ item.row?.creator || '\u2014' }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"actions\">\n          <th mat-header-cell *matHeaderCellDef>\n            <span class=\"nxs-permissions-panel__visually-hidden\">{{\n              'satori-components.permissions-panel.column.actions' | translate\n            }}</span>\n          </th>\n          <td mat-cell *matCellDef=\"let item\" class=\"nxs-permissions-panel__actions\">\n            @if (canManage()) {\n              @if (!item.lockedReason && item.state !== 'removed') {\n                <button\n                  mat-icon-button\n                  type=\"button\"\n                  [matTooltip]=\"'satori-components.permissions-panel.edit' | translate\"\n                  [attr.aria-label]=\"\n                    'satori-components.permissions-panel.edit-entry'\n                      | translate: { principal: item.principal }\n                  \"\n                  [disabled]=\"!editable()\"\n                  (click)=\"openEdit(item)\"\n                >\n                  <mat-icon aria-hidden=\"true\">edit</mat-icon>\n                </button>\n              }\n              @if (item.state === 'removed') {\n                <button\n                  mat-button\n                  type=\"button\"\n                  [disabled]=\"!editable()\"\n                  (click)=\"toggleRemove(item)\"\n                >\n                  {{ 'satori-components.permissions-panel.undo' | translate }}\n                </button>\n              } @else if (\n                item.lockedReason !== 'satori-components.permissions-panel.locked.no-id'\n              ) {\n                <button\n                  mat-icon-button\n                  type=\"button\"\n                  [matTooltip]=\"'satori-components.permissions-panel.remove' | translate\"\n                  [attr.aria-label]=\"\n                    'satori-components.permissions-panel.remove-entry'\n                      | translate\n                        : {\n                            principal: item.principal,\n                            permission: permissionLabel(item.permission),\n                          }\n                  \"\n                  [disabled]=\"!editable()\"\n                  (click)=\"toggleRemove(item)\"\n                >\n                  <mat-icon aria-hidden=\"true\">delete</mat-icon>\n                </button>\n              }\n            }\n          </td>\n        </ng-container>\n\n        <tr mat-header-row *matHeaderRowDef=\"localColumns\"></tr>\n        <tr\n          mat-row\n          *matRowDef=\"let item; columns: localColumns\"\n          [class.nxs-permissions-panel__row--removed]=\"item.state === 'removed'\"\n          [class.nxs-permissions-panel__row--pending]=\"item.state !== 'unchanged'\"\n        ></tr>\n      </table>\n    }\n\n    @if (pendingCount() > 0) {\n      <div class=\"nxs-permissions-panel__pending\">\n        <span role=\"status\">{{\n          (pendingCount() === 1\n            ? 'satori-components.permissions-panel.pending.one'\n            : 'satori-components.permissions-panel.pending.many'\n          ) | translate: { count: pendingCount() }\n        }}</span>\n        <span class=\"nxs-permissions-panel__spacer\"></span>\n        <button mat-button type=\"button\" [disabled]=\"saving()\" (click)=\"discard()\">\n          {{ 'satori-components.permissions-panel.discard' | translate }}\n        </button>\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"saving()\"\n          (click)=\"save()\"\n        >\n          {{ 'satori-components.permissions-panel.save' | translate }}\n        </button>\n      </div>\n    }\n  </section>\n\n  <!-- Inherited -->\n  <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-inherited'\">\n    <div class=\"nxs-permissions-panel__section-header\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-inherited'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.inherited.heading' | translate }}\n      </div>\n      @if (canManage()) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          [disabled]=\"inheritanceBusy() || pendingCount() > 0\"\n          [matTooltip]=\"\n            pendingCount() > 0\n              ? ('satori-components.permissions-panel.inherited.save-first' | translate)\n              : ''\n          \"\n          (click)=\"toggleInheritance()\"\n        >\n          {{\n            (current.inheritanceBlocked\n              ? 'satori-components.permissions-panel.inherited.unblock'\n              : 'satori-components.permissions-panel.inherited.block'\n            ) | translate\n          }}\n        </button>\n      }\n    </div>\n    @if (inheritanceError(); as message) {\n      <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n        {{ 'satori-components.permissions-panel.inherited.toggle-failed' | translate }}\n        <span class=\"nxs-permissions-panel__server-message\">{{ message }}</span>\n      </p>\n    }\n    @if (current.inheritanceBlocked) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.inherited.blocked' | translate }}\n      </p>\n    } @else if (current.inherited.length === 0) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.inherited.empty' | translate }}\n      </p>\n    } @else {\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-inherited'\"\n        [dataSource]=\"current.inherited\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            @if (row.principalLabel && row.principalLabel !== row.principal) {\n              {{ row.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ row.principal }}</span>\n            } @else {\n              {{ row.principal }}\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            {{ permissionLabel(row.permission) }}\n            @if (permissionLabel(row.permission) !== row.permission) {\n              <span class=\"nxs-permissions-panel__id\">{{ row.permission }}</span>\n            }\n            @if (!row.granted) {\n              <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                'satori-components.permissions-panel.denied' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ timeFrame(row.begin, row.end) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"grantedBy\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.granted-by' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ row.creator || '\u2014' }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"inheritedColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: inheritedColumns\"></tr>\n      </table>\n    }\n  </section>\n\n  @if (current.otherAcls.length > 0) {\n    <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-other'\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-other'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.other.heading' | translate }}\n      </div>\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-other'\"\n        [dataSource]=\"current.otherAcls\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            @if (row.principalLabel && row.principalLabel !== row.principal) {\n              {{ row.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ row.principal }}</span>\n            } @else {\n              {{ row.principal }}\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            {{ permissionLabel(row.permission) }}\n            @if (permissionLabel(row.permission) !== row.permission) {\n              <span class=\"nxs-permissions-panel__id\">{{ row.permission }}</span>\n            }\n            @if (!row.granted) {\n              <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                'satori-components.permissions-panel.denied' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ timeFrame(row.begin, row.end) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"acl\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.acl' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ row.acl }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"otherColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: otherColumns\"></tr>\n      </table>\n    </section>\n  }\n}\n", styles: [":host{display:flex;flex-direction:column;gap:16px;padding:16px 0;color:var(--mat-sys-on-surface)}.nxs-permissions-panel__header{display:flex;flex-direction:column;gap:2px}.nxs-permissions-panel__title{font-size:1rem;font-weight:500;line-height:1.5rem}.nxs-permissions-panel__document{margin:0;font-size:.875rem;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__loading{display:flex;justify-content:center;padding:24px}.nxs-permissions-panel__error,.nxs-permissions-panel__alert{display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:12px 16px;border-radius:8px;background:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}.nxs-permissions-panel__error p,.nxs-permissions-panel__alert p{margin:0}.nxs-permissions-panel__alert-heading{font-weight:500}.nxs-permissions-panel__alert-actions{display:flex;gap:8px}.nxs-permissions-panel__refusals{margin:0;padding-inline-start:20px}.nxs-permissions-panel__entry{font-weight:500}.nxs-permissions-panel__server-message{display:block;font-size:.75rem}.nxs-permissions-panel__status{margin:0;padding:8px 16px;border-radius:8px;background:var(--mat-sys-secondary-container);color:var(--mat-sys-on-secondary-container)}.nxs-permissions-panel__section{display:flex;flex-direction:column;gap:8px}.nxs-permissions-panel__section-header{display:flex;align-items:center;justify-content:space-between;gap:8px}.nxs-permissions-panel__section-title{font-size:.875rem;font-weight:600}.nxs-permissions-panel__empty{margin:0;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__table{width:100%}.nxs-permissions-panel__select{min-width:200px}.nxs-permissions-panel__id{margin-inline-start:6px;font-size:.75rem;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__badge{display:inline-block;margin-inline-start:8px;padding:0 8px;border-radius:999px;font-size:.6875rem;font-weight:500;line-height:1.25rem;background:var(--mat-sys-surface-container-highest);color:var(--mat-sys-on-surface)}.nxs-permissions-panel__badge--removed{background:var(--mat-sys-error-container);color:var(--mat-sys-on-error-container)}.nxs-permissions-panel__hint{display:block;font-size:.75rem;color:var(--mat-sys-on-surface-variant)}.nxs-permissions-panel__row--pending{background:var(--mat-sys-surface-container-low)}.nxs-permissions-panel__row--removed td{text-decoration:line-through}.nxs-permissions-panel__actions{white-space:nowrap;text-align:end}.nxs-permissions-panel__pending{display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;background:var(--mat-sys-surface-container)}.nxs-permissions-panel__spacer{flex:1}.nxs-permissions-panel__editor{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-permissions-panel__editor-heading{font-size:.875rem;font-weight:500}.nxs-permissions-panel__field--wide{width:100%}.nxs-permissions-panel__time-frame{display:flex;gap:24px}.nxs-permissions-panel__dates{display:flex;flex-wrap:wrap;gap:16px}.nxs-permissions-panel__dates mat-form-field{flex:1;min-width:160px}.nxs-permissions-panel__field-error{margin:0;color:var(--mat-sys-error)}.nxs-permissions-panel__editor-actions{display:flex;justify-content:flex-end;gap:8px}.nxs-permissions-panel__visually-hidden{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}\n"] }]
        }], ctorParameters: () => [], propDecorators: { documentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentId", required: true }] }], permissionsChanged: [{ type: i0.Input, args: [{ isSignal: true, alias: "permissionsChanged", required: false }] }] } });
function dateOf(day) {
    return day ? dayToDate(`${day}T00:00:00.000Z`) : null;
}
function classifyLoadError(error) {
    if (isPermissionDeniedError(error))
        return 'denied';
    return error?.status === 404 ? 'not-found' : 'failed';
}

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
class NxsPropertiesPanelComponent {
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
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPropertiesPanelComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsPropertiesPanelComponent, isStandalone: true, selector: "nxs-properties-panel", inputs: { document: { classPropertyName: "document", publicName: "document", isSignal: true, isRequired: true, transformFunction: null }, vocabularyLabel: { classPropertyName: "vocabularyLabel", publicName: "vocabularyLabel", isSignal: true, isRequired: false, transformFunction: null }, processRunning: { classPropertyName: "processRunning", publicName: "processRunning", isSignal: true, isRequired: false, transformFunction: null }, versionLabel: { classPropertyName: "versionLabel", publicName: "versionLabel", isSignal: true, isRequired: false, transformFunction: null }, publications: { classPropertyName: "publications", publicName: "publications", isSignal: true, isRequired: false, transformFunction: null }, format: { classPropertyName: "format", publicName: "format", isSignal: true, isRequired: false, transformFunction: null }, headingLevel: { classPropertyName: "headingLevel", publicName: "headingLevel", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { publicationsSelected: "publicationsSelected" }, host: { classAttribute: "nxs-properties-panel" }, ngImport: i0, template: "@if (document(); as doc) {\n  <dl class=\"nxs-properties-panel__info\">\n    @if (processRunning()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.process' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          <nxs-tag\n            color=\"orange\"\n            [label]=\"'satori-components.properties-panel.running' | translate\"\n          />\n        </dd>\n      </div>\n    }\n\n    @if (state()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.state' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          <span class=\"nxs-properties-panel__state\">{{ state() }}</span>\n        </dd>\n      </div>\n    }\n\n    <div class=\"nxs-properties-panel__row\">\n      <dt class=\"nxs-properties-panel__label\">\n        {{ 'satori-components.properties-panel.version' | translate }}\n      </dt>\n      <dd class=\"nxs-properties-panel__value\">\n        <ng-content select=\"[nxsVersion]\">\n          <span [class.nxs-properties-panel__empty]=\"!versionLabel()\">{{\n            versionLabel() || '\u2014'\n          }}</span>\n        </ng-content>\n      </dd>\n    </div>\n\n    @if (publications() !== null) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.publications' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          @if (publications()! > 0) {\n            <button\n              type=\"button\"\n              class=\"nxs-properties-panel__link\"\n              (click)=\"publicationsSelected.emit()\"\n            >\n              {{ publications() }}\n            </button>\n          } @else {\n            <span class=\"nxs-properties-panel__empty\">0</span>\n          }\n        </dd>\n      </div>\n    }\n\n    @if (modified()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.last-modified' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">{{ modified() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (created()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.created' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">{{ created() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (creator(); as by) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.by' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value nxs-properties-panel__person\">\n          <nxs-avatar [initials]=\"by.initial\" [color]=\"by.color\" size=\"24\" />\n          <span>{{ by.name }}</span>\n        </dd>\n      </div>\n    }\n\n    @if (contributors().length > 0) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.contributors' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value nxs-properties-panel__people\">\n          @for (contributor of contributors(); track $index) {\n            <span class=\"nxs-properties-panel__person\">\n              <nxs-avatar [initials]=\"contributor.initial\" [color]=\"contributor.color\" size=\"24\" />\n              <span>{{ contributor.name }}</span>\n            </span>\n          }\n        </dd>\n      </div>\n    }\n  </dl>\n\n  <div class=\"nxs-properties-panel__heading\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n    {{ 'satori-components.properties-panel.indexing-properties' | translate }}\n  </div>\n\n  <dl class=\"nxs-properties-panel__fields\">\n    <div class=\"nxs-properties-panel__field\">\n      <dt class=\"nxs-properties-panel__label\">\n        {{ 'satori-components.properties-panel.title' | translate }}\n      </dt>\n      <dd class=\"nxs-properties-panel__text\">{{ doc.title }}</dd>\n    </div>\n\n    @if (format()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.format' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ format() }}</dd>\n      </div>\n    }\n\n    @if (fileName()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.file-name' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ fileName() }}</dd>\n      </div>\n    }\n\n    @if (expires()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.expires' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ expires() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (taggable()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.tags' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">\n          <ng-content select=\"[nxsTags]\">\n            <div class=\"nxs-properties-panel__chips\">\n              @for (tag of tags(); track tag) {\n                <nxs-tag color=\"gray\" [label]=\"tag\" />\n              } @empty {\n                <span class=\"nxs-properties-panel__empty\">\u2014</span>\n              }\n            </div>\n          </ng-content>\n        </dd>\n      </div>\n    }\n\n    @if (description()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.description' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text nxs-properties-panel__description\">\n          {{ description() }}\n        </dd>\n      </div>\n    }\n\n    @if (nature()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.nature' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ nature() }}</dd>\n      </div>\n    }\n\n    @if (coverage()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.coverage' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text nxs-properties-panel__chips\">\n          <nxs-tag color=\"gray\" [label]=\"coverage()\" />\n        </dd>\n      </div>\n    }\n\n    @if (subjects()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.subjects' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ subjects() }}</dd>\n      </div>\n    }\n  </dl>\n\n  <ng-content />\n\n  @if (collections().length > 0) {\n    <div class=\"nxs-properties-panel__divider\"></div>\n    <div class=\"nxs-properties-panel__heading\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n      {{ 'satori-components.properties-panel.collections' | translate }}\n    </div>\n    <div class=\"nxs-properties-panel__chips\">\n      @for (collection of collections(); track collection.uid || collection.title) {\n        <nxs-tag color=\"blue\" [label]=\"collection.title\" />\n      }\n    </div>\n  }\n}\n", styles: [":host{--nxs-properties-panel-label: var(--mat-sys-on-surface-variant);--nxs-properties-panel-value: var(--mat-sys-on-surface);--nxs-properties-panel-divider: var(--mat-sys-outline-variant);--nxs-properties-panel-link: var(--mat-sys-primary);--nxs-properties-panel-state-surface: var(--mat-sys-primary-container);--nxs-properties-panel-state-text: var(--mat-sys-on-primary-container);display:block;font-size:13px}.nxs-properties-panel__info{display:flex;flex-direction:column;margin:0 0 20px;padding:12px 0;border-bottom:1px solid var(--nxs-properties-panel-divider)}.nxs-properties-panel__row{display:flex;align-items:flex-start;gap:12px;padding:6px 0}.nxs-properties-panel__label{font-size:12px;color:var(--nxs-properties-panel-label)}.nxs-properties-panel__row .nxs-properties-panel__label{min-width:100px;flex-shrink:0;padding-top:2px}.nxs-properties-panel__field .nxs-properties-panel__label{font-size:11px;font-weight:500}.nxs-properties-panel__value{margin:0;flex:1;display:flex;align-items:center;flex-wrap:wrap;gap:6px;color:var(--nxs-properties-panel-value)}.nxs-properties-panel__state{display:inline-flex;padding:2px 12px;border-radius:4px;font-size:12px;font-weight:500;line-height:1.2;background:var(--nxs-properties-panel-state-surface);color:var(--nxs-properties-panel-state-text);text-transform:capitalize}.nxs-properties-panel__link{padding:0;border:none;background:none;font:inherit;font-weight:600;color:var(--nxs-properties-panel-link);cursor:pointer}.nxs-properties-panel__link:hover{text-decoration:underline}.nxs-properties-panel__link:focus{outline:2px solid var(--nxs-properties-panel-link);outline-offset:2px}.nxs-properties-panel__empty{color:var(--nxs-properties-panel-label)}.nxs-properties-panel__people{gap:8px 16px}.nxs-properties-panel__person{display:inline-flex;align-items:center;gap:6px;min-width:0;line-height:1.3}.nxs-properties-panel__heading{margin-bottom:12px;font-size:14px;font-weight:600;color:var(--nxs-properties-panel-value)}.nxs-properties-panel__fields{margin:0}.nxs-properties-panel__field{display:flex;flex-direction:column;gap:2px;margin-bottom:14px}.nxs-properties-panel__text{margin:0;color:var(--nxs-properties-panel-value);word-break:break-word}.nxs-properties-panel__description{margin:0;white-space:pre-wrap}.nxs-properties-panel__chips{display:flex;flex-wrap:wrap;gap:6px}.nxs-properties-panel__divider{height:1px;margin:16px 0;background:var(--nxs-properties-panel-divider)}\n"], dependencies: [{ kind: "component", type: NxsAvatarComponent, selector: "nxs-avatar", inputs: ["initials", "color", "size", "label"] }, { kind: "component", type: NxsTagComponent, selector: "nxs-tag", inputs: ["label", "color"] }, { kind: "pipe", type: DatePipe, name: "date" }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsPropertiesPanelComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-properties-panel', standalone: true, imports: [DatePipe, TranslatePipe, NxsAvatarComponent, NxsTagComponent], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-properties-panel' }, template: "@if (document(); as doc) {\n  <dl class=\"nxs-properties-panel__info\">\n    @if (processRunning()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.process' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          <nxs-tag\n            color=\"orange\"\n            [label]=\"'satori-components.properties-panel.running' | translate\"\n          />\n        </dd>\n      </div>\n    }\n\n    @if (state()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.state' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          <span class=\"nxs-properties-panel__state\">{{ state() }}</span>\n        </dd>\n      </div>\n    }\n\n    <div class=\"nxs-properties-panel__row\">\n      <dt class=\"nxs-properties-panel__label\">\n        {{ 'satori-components.properties-panel.version' | translate }}\n      </dt>\n      <dd class=\"nxs-properties-panel__value\">\n        <ng-content select=\"[nxsVersion]\">\n          <span [class.nxs-properties-panel__empty]=\"!versionLabel()\">{{\n            versionLabel() || '\u2014'\n          }}</span>\n        </ng-content>\n      </dd>\n    </div>\n\n    @if (publications() !== null) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.publications' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">\n          @if (publications()! > 0) {\n            <button\n              type=\"button\"\n              class=\"nxs-properties-panel__link\"\n              (click)=\"publicationsSelected.emit()\"\n            >\n              {{ publications() }}\n            </button>\n          } @else {\n            <span class=\"nxs-properties-panel__empty\">0</span>\n          }\n        </dd>\n      </div>\n    }\n\n    @if (modified()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.last-modified' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">{{ modified() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (created()) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.created' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value\">{{ created() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (creator(); as by) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.by' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value nxs-properties-panel__person\">\n          <nxs-avatar [initials]=\"by.initial\" [color]=\"by.color\" size=\"24\" />\n          <span>{{ by.name }}</span>\n        </dd>\n      </div>\n    }\n\n    @if (contributors().length > 0) {\n      <div class=\"nxs-properties-panel__row\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.contributors' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__value nxs-properties-panel__people\">\n          @for (contributor of contributors(); track $index) {\n            <span class=\"nxs-properties-panel__person\">\n              <nxs-avatar [initials]=\"contributor.initial\" [color]=\"contributor.color\" size=\"24\" />\n              <span>{{ contributor.name }}</span>\n            </span>\n          }\n        </dd>\n      </div>\n    }\n  </dl>\n\n  <div class=\"nxs-properties-panel__heading\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n    {{ 'satori-components.properties-panel.indexing-properties' | translate }}\n  </div>\n\n  <dl class=\"nxs-properties-panel__fields\">\n    <div class=\"nxs-properties-panel__field\">\n      <dt class=\"nxs-properties-panel__label\">\n        {{ 'satori-components.properties-panel.title' | translate }}\n      </dt>\n      <dd class=\"nxs-properties-panel__text\">{{ doc.title }}</dd>\n    </div>\n\n    @if (format()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.format' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ format() }}</dd>\n      </div>\n    }\n\n    @if (fileName()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.file-name' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ fileName() }}</dd>\n      </div>\n    }\n\n    @if (expires()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.expires' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ expires() | date: 'longDate' }}</dd>\n      </div>\n    }\n\n    @if (taggable()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.tags' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">\n          <ng-content select=\"[nxsTags]\">\n            <div class=\"nxs-properties-panel__chips\">\n              @for (tag of tags(); track tag) {\n                <nxs-tag color=\"gray\" [label]=\"tag\" />\n              } @empty {\n                <span class=\"nxs-properties-panel__empty\">\u2014</span>\n              }\n            </div>\n          </ng-content>\n        </dd>\n      </div>\n    }\n\n    @if (description()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.description' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text nxs-properties-panel__description\">\n          {{ description() }}\n        </dd>\n      </div>\n    }\n\n    @if (nature()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.nature' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ nature() }}</dd>\n      </div>\n    }\n\n    @if (coverage()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.coverage' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text nxs-properties-panel__chips\">\n          <nxs-tag color=\"gray\" [label]=\"coverage()\" />\n        </dd>\n      </div>\n    }\n\n    @if (subjects()) {\n      <div class=\"nxs-properties-panel__field\">\n        <dt class=\"nxs-properties-panel__label\">\n          {{ 'satori-components.properties-panel.subjects' | translate }}\n        </dt>\n        <dd class=\"nxs-properties-panel__text\">{{ subjects() }}</dd>\n      </div>\n    }\n  </dl>\n\n  <ng-content />\n\n  @if (collections().length > 0) {\n    <div class=\"nxs-properties-panel__divider\"></div>\n    <div class=\"nxs-properties-panel__heading\" role=\"heading\" [attr.aria-level]=\"headingLevel()\">\n      {{ 'satori-components.properties-panel.collections' | translate }}\n    </div>\n    <div class=\"nxs-properties-panel__chips\">\n      @for (collection of collections(); track collection.uid || collection.title) {\n        <nxs-tag color=\"blue\" [label]=\"collection.title\" />\n      }\n    </div>\n  }\n}\n", styles: [":host{--nxs-properties-panel-label: var(--mat-sys-on-surface-variant);--nxs-properties-panel-value: var(--mat-sys-on-surface);--nxs-properties-panel-divider: var(--mat-sys-outline-variant);--nxs-properties-panel-link: var(--mat-sys-primary);--nxs-properties-panel-state-surface: var(--mat-sys-primary-container);--nxs-properties-panel-state-text: var(--mat-sys-on-primary-container);display:block;font-size:13px}.nxs-properties-panel__info{display:flex;flex-direction:column;margin:0 0 20px;padding:12px 0;border-bottom:1px solid var(--nxs-properties-panel-divider)}.nxs-properties-panel__row{display:flex;align-items:flex-start;gap:12px;padding:6px 0}.nxs-properties-panel__label{font-size:12px;color:var(--nxs-properties-panel-label)}.nxs-properties-panel__row .nxs-properties-panel__label{min-width:100px;flex-shrink:0;padding-top:2px}.nxs-properties-panel__field .nxs-properties-panel__label{font-size:11px;font-weight:500}.nxs-properties-panel__value{margin:0;flex:1;display:flex;align-items:center;flex-wrap:wrap;gap:6px;color:var(--nxs-properties-panel-value)}.nxs-properties-panel__state{display:inline-flex;padding:2px 12px;border-radius:4px;font-size:12px;font-weight:500;line-height:1.2;background:var(--nxs-properties-panel-state-surface);color:var(--nxs-properties-panel-state-text);text-transform:capitalize}.nxs-properties-panel__link{padding:0;border:none;background:none;font:inherit;font-weight:600;color:var(--nxs-properties-panel-link);cursor:pointer}.nxs-properties-panel__link:hover{text-decoration:underline}.nxs-properties-panel__link:focus{outline:2px solid var(--nxs-properties-panel-link);outline-offset:2px}.nxs-properties-panel__empty{color:var(--nxs-properties-panel-label)}.nxs-properties-panel__people{gap:8px 16px}.nxs-properties-panel__person{display:inline-flex;align-items:center;gap:6px;min-width:0;line-height:1.3}.nxs-properties-panel__heading{margin-bottom:12px;font-size:14px;font-weight:600;color:var(--nxs-properties-panel-value)}.nxs-properties-panel__fields{margin:0}.nxs-properties-panel__field{display:flex;flex-direction:column;gap:2px;margin-bottom:14px}.nxs-properties-panel__text{margin:0;color:var(--nxs-properties-panel-value);word-break:break-word}.nxs-properties-panel__description{margin:0;white-space:pre-wrap}.nxs-properties-panel__chips{display:flex;flex-wrap:wrap;gap:6px}.nxs-properties-panel__divider{height:1px;margin:16px 0;background:var(--nxs-properties-panel-divider)}\n"] }]
        }], propDecorators: { document: [{ type: i0.Input, args: [{ isSignal: true, alias: "document", required: true }] }], vocabularyLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "vocabularyLabel", required: false }] }], processRunning: [{ type: i0.Input, args: [{ isSignal: true, alias: "processRunning", required: false }] }], versionLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "versionLabel", required: false }] }], publications: [{ type: i0.Input, args: [{ isSignal: true, alias: "publications", required: false }] }], format: [{ type: i0.Input, args: [{ isSignal: true, alias: "format", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], publicationsSelected: [{ type: i0.Output, args: ["publicationsSelected"] }] } });

/**
 * Renames a document, as a `MatDialog`: `dialog.open(NxsRenameDialogComponent, { data })`.
 *
 * Renaming is a change of the document's title, `dc:title`, as in Nuxeo Web UI; the name in its
 * path does not change, so links to it keep working. The dialog writes the title itself and closes
 * with the updated document. A refusal stays in the dialog with the reason — no permission, or the
 * document locked by someone else — so the user can cancel or try again; nothing is lost.
 */
class NxsRenameDialogComponent {
    dialogRef = inject(MatDialogRef);
    browse = inject(BrowseService);
    destroyRef = inject(DestroyRef);
    data = inject(MAT_DIALOG_DATA);
    title = signal(this.data.title ?? '', ...(ngDevMode ? [{ debugName: "title" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    failure = signal(null, ...(ngDevMode ? [{ debugName: "failure" }] : []));
    trimmed = computed(() => this.title().trim(), ...(ngDevMode ? [{ debugName: "trimmed" }] : []));
    unchanged = computed(() => this.trimmed() === (this.data.title ?? '').trim(), ...(ngDevMode ? [{ debugName: "unchanged" }] : []));
    canSave = computed(() => !this.saving() && this.trimmed().length > 0 && !this.unchanged(), ...(ngDevMode ? [{ debugName: "canSave" }] : []));
    save() {
        if (!this.canSave())
            return;
        this.saving.set(true);
        this.failure.set(null);
        this.browse
            .updateDocument(this.data.documentId, { 'dc:title': this.trimmed() })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (doc) => this.dialogRef.close(doc),
            error: (error) => {
                this.saving.set(false);
                const status = error?.status;
                this.failure.set(status === 409 ? 409 : nxsErrorStatus(error));
            },
        });
    }
    cancel() {
        this.dialogRef.close();
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsRenameDialogComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsRenameDialogComponent, isStandalone: true, selector: "nxs-rename-dialog", host: { classAttribute: "nxs-rename-dialog" }, ngImport: i0, template: "<h2 mat-dialog-title>{{ 'satori-components.rename-dialog.title' | translate }}</h2>\n<form class=\"nxs-rename-dialog__form\" (ngSubmit)=\"save()\">\n  <mat-dialog-content>\n    <mat-form-field class=\"nxs-rename-dialog__field\" appearance=\"outline\">\n      <mat-label>{{ 'satori-components.rename-dialog.label' | translate }}</mat-label>\n      <input\n        matInput\n        name=\"title\"\n        required\n        cdkFocusInitial\n        [ngModel]=\"title()\"\n        (ngModelChange)=\"title.set($event)\"\n        [disabled]=\"saving()\"\n      />\n      @if (trimmed().length === 0) {\n        <mat-error>{{ 'satori-components.rename-dialog.required' | translate }}</mat-error>\n      }\n    </mat-form-field>\n    @if (failure(); as status) {\n      <p class=\"nxs-rename-dialog__failure\" role=\"alert\">\n        @switch (status) {\n          @case (403) {\n            {{ 'satori-components.rename-dialog.forbidden' | translate }}\n          }\n          @case (409) {\n            {{ 'satori-components.rename-dialog.locked' | translate }}\n          }\n          @case (404) {\n            {{ 'satori-components.rename-dialog.not-found' | translate }}\n          }\n          @default {\n            {{ 'satori-components.rename-dialog.failed' | translate }}\n          }\n        }\n      </p>\n    }\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\">\n    <button mat-button type=\"button\" (click)=\"cancel()\">\n      {{ 'satori-components.rename-dialog.cancel' | translate }}\n    </button>\n    <button mat-flat-button type=\"submit\" [disabled]=\"!canSave()\">\n      {{ 'satori-components.rename-dialog.save' | translate }}\n    </button>\n  </mat-dialog-actions>\n</form>\n", styles: [":host{display:block;width:440px;max-width:100%}.nxs-rename-dialog__field{width:100%}.nxs-rename-dialog__failure{margin:0;font:var(--mat-sys-body-medium);color:var(--mat-sys-error)}\n"], dependencies: [{ kind: "ngmodule", type: FormsModule }, { kind: "directive", type: i1$2.ɵNgNoValidate, selector: "form:not([ngNoForm]):not([ngNativeValidate])" }, { kind: "directive", type: i1$2.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i1$2.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i1$2.NgControlStatusGroup, selector: "[formGroupName],[formArrayName],[ngModelGroup],[formGroup],form:not([ngNoForm]),[ngForm]" }, { kind: "directive", type: i1$2.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i1$2.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1$2.NgForm, selector: "form:not([ngNoForm]):not([formGroup]),ng-form,[ngForm]", inputs: ["ngFormOptions"], outputs: ["ngSubmit"], exportAs: ["ngForm"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatDialogModule }, { kind: "directive", type: i2$2.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i2$2.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i2$2.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "ngmodule", type: MatFormFieldModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsRenameDialogComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-rename-dialog', standalone: true, imports: [
                        FormsModule,
                        MatButtonModule,
                        MatDialogModule,
                        MatFormFieldModule,
                        MatInputModule,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-rename-dialog' }, template: "<h2 mat-dialog-title>{{ 'satori-components.rename-dialog.title' | translate }}</h2>\n<form class=\"nxs-rename-dialog__form\" (ngSubmit)=\"save()\">\n  <mat-dialog-content>\n    <mat-form-field class=\"nxs-rename-dialog__field\" appearance=\"outline\">\n      <mat-label>{{ 'satori-components.rename-dialog.label' | translate }}</mat-label>\n      <input\n        matInput\n        name=\"title\"\n        required\n        cdkFocusInitial\n        [ngModel]=\"title()\"\n        (ngModelChange)=\"title.set($event)\"\n        [disabled]=\"saving()\"\n      />\n      @if (trimmed().length === 0) {\n        <mat-error>{{ 'satori-components.rename-dialog.required' | translate }}</mat-error>\n      }\n    </mat-form-field>\n    @if (failure(); as status) {\n      <p class=\"nxs-rename-dialog__failure\" role=\"alert\">\n        @switch (status) {\n          @case (403) {\n            {{ 'satori-components.rename-dialog.forbidden' | translate }}\n          }\n          @case (409) {\n            {{ 'satori-components.rename-dialog.locked' | translate }}\n          }\n          @case (404) {\n            {{ 'satori-components.rename-dialog.not-found' | translate }}\n          }\n          @default {\n            {{ 'satori-components.rename-dialog.failed' | translate }}\n          }\n        }\n      </p>\n    }\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\">\n    <button mat-button type=\"button\" (click)=\"cancel()\">\n      {{ 'satori-components.rename-dialog.cancel' | translate }}\n    </button>\n    <button mat-flat-button type=\"submit\" [disabled]=\"!canSave()\">\n      {{ 'satori-components.rename-dialog.save' | translate }}\n    </button>\n  </mat-dialog-actions>\n</form>\n", styles: [":host{display:block;width:440px;max-width:100%}.nxs-rename-dialog__field{width:100%}.nxs-rename-dialog__failure{margin:0;font:var(--mat-sys-body-medium);color:var(--mat-sys-error)}\n"] }]
        }] });

/** Web UI's tag suggestion searches from the first character. */
const WEB_UI_MIN_CHARS$1 = 1;
let nextId$5 = 0;
/**
 * A field of tags: existing ones suggested as the user types, as Web UI's `nuxeo-tag-suggestion`
 * does, and a new one added with Enter, a comma or its "Add" entry. Each tag is a chip, removed
 * with its button or Backspace.
 *
 * A form control, not an editor of a document's tags: the value is the list of labels, and the host
 * saves it — through `TagService.addTag` and `removeTag`, for a document's tags. A label is trimmed,
 * and one the field already holds, whatever its case, is not added twice.
 */
class NxsTagInputComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Let the user add a tag no document has yet. On by default, as in Web UI. */
    allowNew = input(true, ...(ngDevMode ? [{ debugName: "allowNew", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The tags, in the order they were added. Two-way; a form control carries the same value. */
    value = model([], ...(ngDevMode ? [{ debugName: "value" }] : []));
    separators = [ENTER, COMMA];
    /** The input's id: the form field's label names the input through it. One per field. */
    inputId = `nxs-tag-input-${nextId$5++}`;
    tags = inject(TagService);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    grid = viewChild.required(MatChipGrid);
    trigger = viewChild.required(MatAutocompleteTrigger);
    control = new NxsPickerControl();
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    finder = nxsSearchAsYouType((term) => this.tags.suggestTags(term), () => WEB_UI_MIN_CHARS$1);
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    /** Suggestions the field does not hold yet. */
    suggestions = computed(() => this.finder.state().results.filter((tag) => !this.holds(tag)), ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    /** The typed text as a new tag, when it may be added and is not already there. */
    addable = computed(() => {
        const typed = this.text().trim();
        if (!this.allowNew() || !typed || this.holds(typed))
            return null;
        const known = this.finder.state().results.some((tag) => same(tag, typed));
        return known ? null : typed;
    }, ...(ngDevMode ? [{ debugName: "addable" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() && (this.missing() || this.control.formInvalid()),
    };
    constructor() {
        effect(() => {
            const { status, results } = this.finder.state();
            untracked(() => {
                const key = status === 'found'
                    ? results.length === 1
                        ? 'satori-components.pickers.results-one'
                        : 'satori-components.pickers.results-many'
                    : status === 'none'
                        ? 'satori-components.pickers.no-results'
                        : status === 'failed'
                            ? 'satori-components.pickers.failed'
                            : null;
                if (key) {
                    void this.announcer.announce(this.translate.instant(key, { count: results.length }), 'polite');
                }
            });
        });
    }
    /** `MatChipGrid` recomputes its error state only with a form control of its own. */
    ngDoCheck() {
        this.grid().updateErrorState();
    }
    writeValue(value) {
        this.value.set(value ?? []);
    }
    registerOnChange(fn) {
        this.control.registerOnChange(fn);
    }
    registerOnTouched(fn) {
        this.control.registerOnTouched(fn);
    }
    setDisabledState(disabled) {
        this.control.setDisabledState(disabled);
    }
    /** No errors of its own: a typed tag is added or discarded, never left half-chosen. */
    validate(control) {
        return this.control.validate(control, null);
    }
    missing() {
        return this.control.missing(this.required(), this.value().length === 0);
    }
    onInput(event) {
        const typed = event.target.value;
        this.text.set(typed);
        this.finder.query(typed);
    }
    /** Enter or a comma: add what was typed, unless the user is on a suggestion, which wins. */
    tokenEnd(event) {
        if (this.trigger().activeOption)
            return;
        const typed = event.value.trim();
        if (typed && this.allowNew())
            this.add(typed);
        event.chipInput.clear();
    }
    add(tag) {
        const label = tag.trim();
        if (label && !this.holds(label))
            this.commit([...this.value(), label]);
        this.text.set('');
        this.finder.reset();
    }
    remove(tag) {
        this.commit(this.value().filter((held) => held !== tag));
    }
    blurred() {
        this.control.blurred();
    }
    holds(tag) {
        return this.value().some((held) => same(held, tag));
    }
    commit(value) {
        this.value.set(value);
        this.control.changed(value);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTagInputComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsTagInputComponent, isStandalone: true, selector: "nxs-tag-input", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, allowNew: { classPropertyName: "allowNew", publicName: "allowNew", isSignal: true, isRequired: false, transformFunction: null }, hint: { classPropertyName: "hint", publicName: "hint", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { classAttribute: "nxs-tag-input" }, providers: nxsPickerProviders(() => NxsTagInputComponent), viewQueries: [{ propertyName: "grid", first: true, predicate: MatChipGrid, descendants: true, isSignal: true }, { propertyName: "trigger", first: true, predicate: MatAutocompleteTrigger, descendants: true, isSignal: true }], ngImport: i0, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <mat-chip-grid\n    #grid\n    [disabled]=\"isDisabled()\"\n    [required]=\"required()\"\n    [errorStateMatcher]=\"errorState\"\n  >\n    @for (tag of value(); track tag) {\n      <mat-chip-row [attr.data-tag]=\"tag\" (removed)=\"remove(tag)\">\n        {{ tag }}\n        <button\n          matChipRemove\n          type=\"button\"\n          [attr.aria-label]=\"'satori-components.pickers.remove' | translate: { name: tag }\"\n        >\n          <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n        </button>\n      </mat-chip-row>\n    }\n    <input\n      autocomplete=\"off\"\n      [id]=\"inputId\"\n      [matChipInputFor]=\"grid\"\n      [matChipInputSeparatorKeyCodes]=\"separators\"\n      [matAutocomplete]=\"auto\"\n      [value]=\"text()\"\n      (matChipInputTokenEnd)=\"tokenEnd($event)\"\n      (input)=\"onInput($event)\"\n      (blur)=\"blurred()\"\n    />\n  </mat-chip-grid>\n  @if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete #auto=\"matAutocomplete\" (optionSelected)=\"add($event.option.value)\">\n    @if (addable(); as typed) {\n      <mat-option [value]=\"typed\" class=\"nxs-tag-input__new\">{{\n        'satori-components.tag-input.add' | translate: { tag: typed }\n      }}</mat-option>\n    }\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        @if (!addable()) {\n          <mat-option disabled class=\"nxs-picker__status\">{{\n            'satori-components.pickers.no-results' | translate\n          }}</mat-option>\n        }\n      }\n      @case ('found') {\n        @for (tag of suggestions(); track tag) {\n          <mat-option [value]=\"tag\" [attr.data-tag]=\"tag\">{{ tag }}</mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatChipsModule }, { kind: "component", type: i4$2.MatChipGrid, selector: "mat-chip-grid", inputs: ["disabled", "placeholder", "required", "value", "errorStateMatcher"], outputs: ["change", "valueChange"] }, { kind: "directive", type: i4$2.MatChipInput, selector: "input[matChipInputFor]", inputs: ["matChipInputFor", "matChipInputAddOnBlur", "matChipInputSeparatorKeyCodes", "placeholder", "id", "disabled", "readonly", "matChipInputDisabledInteractive"], outputs: ["matChipInputTokenEnd"], exportAs: ["matChipInput", "matChipInputFor"] }, { kind: "directive", type: i4$2.MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: i4$2.MatChipRow, selector: "mat-chip-row, [mat-chip-row], mat-basic-chip-row, [mat-basic-chip-row]", inputs: ["editable"], outputs: ["edited"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsTagInputComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-tag-input', standalone: true, imports: [MatAutocompleteModule, MatChipsModule, MatIconModule, MatInputModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsTagInputComponent), host: { class: 'nxs-tag-input' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <mat-chip-grid\n    #grid\n    [disabled]=\"isDisabled()\"\n    [required]=\"required()\"\n    [errorStateMatcher]=\"errorState\"\n  >\n    @for (tag of value(); track tag) {\n      <mat-chip-row [attr.data-tag]=\"tag\" (removed)=\"remove(tag)\">\n        {{ tag }}\n        <button\n          matChipRemove\n          type=\"button\"\n          [attr.aria-label]=\"'satori-components.pickers.remove' | translate: { name: tag }\"\n        >\n          <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n        </button>\n      </mat-chip-row>\n    }\n    <input\n      autocomplete=\"off\"\n      [id]=\"inputId\"\n      [matChipInputFor]=\"grid\"\n      [matChipInputSeparatorKeyCodes]=\"separators\"\n      [matAutocomplete]=\"auto\"\n      [value]=\"text()\"\n      (matChipInputTokenEnd)=\"tokenEnd($event)\"\n      (input)=\"onInput($event)\"\n      (blur)=\"blurred()\"\n    />\n  </mat-chip-grid>\n  @if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete #auto=\"matAutocomplete\" (optionSelected)=\"add($event.option.value)\">\n    @if (addable(); as typed) {\n      <mat-option [value]=\"typed\" class=\"nxs-tag-input__new\">{{\n        'satori-components.tag-input.add' | translate: { tag: typed }\n      }}</mat-option>\n    }\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        @if (!addable()) {\n          <mat-option disabled class=\"nxs-picker__status\">{{\n            'satori-components.pickers.no-results' | translate\n          }}</mat-option>\n        }\n      }\n      @case ('found') {\n        @for (tag of suggestions(); track tag) {\n          <mat-option [value]=\"tag\" [attr.data-tag]=\"tag\">{{ tag }}</mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}\n"] }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], allowNew: [{ type: i0.Input, args: [{ isSignal: true, alias: "allowNew", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], grid: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatChipGrid), { isSignal: true }] }], trigger: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatAutocompleteTrigger), { isSignal: true }] }] } });
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Web UI's user suggestion starts searching at three characters. */
const WEB_UI_MIN_CHARS = 3;
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
class NxsUserGroupPickerComponent {
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Whom to search: users and groups (the default), users only, or groups only. */
    search = input('users-and-groups', ...(ngDevMode ? [{ debugName: "search" }] : []));
    /** Characters typed before the server is asked. Web UI's three by default. */
    minChars = input(WEB_UI_MIN_CHARS, ...(ngDevMode ? [{ debugName: "minChars", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The principal chosen, or `null`. Two-way; a form control carries the same value. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    input = viewChild.required(MatInput);
    documents = inject(DocumentDetailService);
    users = inject(UserService);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    control = new NxsPickerControl();
    /** What the input shows: the chosen principal's label, or what the user is typing. */
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    finder = nxsSearchAsYouType((term) => this.find(term), () => this.minChars());
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    /** Text typed and no principal chosen for it. */
    unmatched = computed(() => !this.value() && this.text().trim() !== '', ...(ngDevMode ? [{ debugName: "unmatched" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.unmatched() || this.missing() || this.control.formInvalid()),
    };
    displayWith = (principal) => typeof principal === 'string' ? principal : (principal?.label ?? '');
    constructor() {
        effect(() => {
            const chosen = this.value();
            untracked(() => {
                if (chosen)
                    this.text.set(chosen.label);
            });
        });
        effect(() => {
            const { status, results } = this.finder.state();
            untracked(() => this.announce(status, results.length));
        });
        effect(() => {
            this.unmatched();
            untracked(() => this.control.revalidate());
        });
    }
    /**
     * `MatInput` recomputes its error state only when its own input has a form control, and this
     * one has none — the form is on the picker — so the picker asks it to on every check.
     */
    ngDoCheck() {
        this.input().updateErrorState();
    }
    validate(control) {
        return this.control.validate(control, this.unmatched() ? { nxsChooseFromList: true } : null);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    missing() {
        return this.control.missing(this.required(), this.value() === null);
    }
    writeValue(value) {
        this.value.set(value ?? null);
        this.text.set(value?.label ?? '');
    }
    registerOnChange(fn) {
        this.control.registerOnChange(fn);
    }
    registerOnTouched(fn) {
        this.control.registerOnTouched(fn);
    }
    setDisabledState(disabled) {
        this.control.setDisabledState(disabled);
    }
    onInput(event) {
        const typed = event.target.value;
        this.text.set(typed);
        if (this.value() && typed !== this.value()?.label)
            this.choose(null);
        this.finder.query(typed);
    }
    choose(principal) {
        this.value.set(principal);
        if (principal) {
            this.text.set(principal.label);
            this.finder.reset();
        }
        this.control.changed(principal);
    }
    clear() {
        this.text.set('');
        this.finder.reset();
        this.choose(null);
    }
    blurred() {
        this.control.blurred();
    }
    find(term) {
        switch (this.search()) {
            case 'users':
                return this.users.searchUsers(term).pipe(map((found) => found.map(fromUser)));
            case 'groups':
                return this.users.searchGroups(term).pipe(map((found) => found.map(fromGroup)));
            default:
                return this.documents
                    .searchUsersGroups(term)
                    .pipe(map((found) => found.map(fromSuggestion)));
        }
    }
    announce(status, count) {
        const key = status === 'found'
            ? count === 1
                ? 'satori-components.pickers.results-one'
                : 'satori-components.pickers.results-many'
            : status === 'none'
                ? 'satori-components.pickers.no-results'
                : status === 'failed'
                    ? 'satori-components.pickers.failed'
                    : null;
        if (key)
            void this.announcer.announce(this.translate.instant(key, { count }), 'polite');
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsUserGroupPickerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsUserGroupPickerComponent, isStandalone: true, selector: "nxs-user-group-picker", inputs: { label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, search: { classPropertyName: "search", publicName: "search", isSignal: true, isRequired: false, transformFunction: null }, minChars: { classPropertyName: "minChars", publicName: "minChars", isSignal: true, isRequired: false, transformFunction: null }, hint: { classPropertyName: "hint", publicName: "hint", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { classAttribute: "nxs-user-group-picker" }, providers: nxsPickerProviders(() => NxsUserGroupPickerComponent), viewQueries: [{ propertyName: "input", first: true, predicate: MatInput, descendants: true, isSignal: true }], ngImport: i0, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    type=\"text\"\n    autocomplete=\"off\"\n    [matAutocomplete]=\"auto\"\n    [value]=\"text()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"onInput($event)\"\n    (blur)=\"blurred()\"\n  />\n  @if (value() && !isDisabled()) {\n    <button\n      matIconSuffix\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-picker__clear\"\n      [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n      (click)=\"clear()\"\n    >\n      <mat-icon aria-hidden=\"true\">close</mat-icon>\n    </button>\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (finder.state().status === 'short') {\n    <mat-hint>{{\n      (minChars() === 1\n        ? 'satori-components.pickers.min-chars-one'\n        : 'satori-components.pickers.min-chars-many'\n      ) | translate: { count: minChars() }\n    }}</mat-hint>\n  } @else if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete\n    #auto=\"matAutocomplete\"\n    class=\"nxs-picker__panel\"\n    [displayWith]=\"displayWith\"\n    (optionSelected)=\"choose($event.option.value)\"\n  >\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.no-results' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('found') {\n        @for (principal of finder.state().results; track principal.prefixedId) {\n          <mat-option [value]=\"principal\" [attr.data-principal]=\"principal.prefixedId\">\n            <mat-icon aria-hidden=\"true\">{{\n              principal.kind === 'group' ? 'group' : 'person'\n            }}</mat-icon>\n            <span class=\"nxs-picker__option\">\n              <span class=\"nxs-picker__option-label\">{{ principal.label }}</span\n              >&ngsp;\n              <span class=\"nxs-picker__option-detail\"\n                >{{\n                  (principal.kind === 'group'\n                    ? 'satori-components.user-group-picker.group'\n                    : 'satori-components.user-group-picker.user'\n                  ) | translate\n                }}{{ principal.email ? ' \u00B7 ' + principal.email : '' }}</span\n              >\n            </span>\n          </mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsUserGroupPickerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-user-group-picker', standalone: true, imports: [MatAutocompleteModule, MatButtonModule, MatIconModule, MatInputModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsUserGroupPickerComponent), host: { class: 'nxs-user-group-picker' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  <input\n    matInput\n    type=\"text\"\n    autocomplete=\"off\"\n    [matAutocomplete]=\"auto\"\n    [value]=\"text()\"\n    [required]=\"required()\"\n    [disabled]=\"isDisabled()\"\n    [errorStateMatcher]=\"errorState\"\n    (input)=\"onInput($event)\"\n    (blur)=\"blurred()\"\n  />\n  @if (value() && !isDisabled()) {\n    <button\n      matIconSuffix\n      mat-icon-button\n      type=\"button\"\n      class=\"nxs-picker__clear\"\n      [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n      (click)=\"clear()\"\n    >\n      <mat-icon aria-hidden=\"true\">close</mat-icon>\n    </button>\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (finder.state().status === 'short') {\n    <mat-hint>{{\n      (minChars() === 1\n        ? 'satori-components.pickers.min-chars-one'\n        : 'satori-components.pickers.min-chars-many'\n      ) | translate: { count: minChars() }\n    }}</mat-hint>\n  } @else if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete\n    #auto=\"matAutocomplete\"\n    class=\"nxs-picker__panel\"\n    [displayWith]=\"displayWith\"\n    (optionSelected)=\"choose($event.option.value)\"\n  >\n    @switch (finder.state().status) {\n      @case ('searching') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.searching' | translate\n        }}</mat-option>\n      }\n      @case ('none') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.no-results' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.failed' | translate\n        }}</mat-option>\n      }\n      @case ('found') {\n        @for (principal of finder.state().results; track principal.prefixedId) {\n          <mat-option [value]=\"principal\" [attr.data-principal]=\"principal.prefixedId\">\n            <mat-icon aria-hidden=\"true\">{{\n              principal.kind === 'group' ? 'group' : 'person'\n            }}</mat-icon>\n            <span class=\"nxs-picker__option\">\n              <span class=\"nxs-picker__option-label\">{{ principal.label }}</span\n              >&ngsp;\n              <span class=\"nxs-picker__option-detail\"\n                >{{\n                  (principal.kind === 'group'\n                    ? 'satori-components.user-group-picker.group'\n                    : 'satori-components.user-group-picker.user'\n                  ) | translate\n                }}{{ principal.email ? ' \u00B7 ' + principal.email : '' }}</span\n              >\n            </span>\n          </mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}\n"] }]
        }], ctorParameters: () => [], propDecorators: { label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], search: [{ type: i0.Input, args: [{ isSignal: true, alias: "search", required: false }] }], minChars: [{ type: i0.Input, args: [{ isSignal: true, alias: "minChars", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }] } });
function fromSuggestion(entry) {
    const kind = entry.type === 'GROUP_TYPE' ? 'group' : 'user';
    return {
        id: entry.id,
        label: entry.displayLabel?.trim() || entry.id,
        kind,
        prefixedId: entry.prefixed_id || `${kind}:${entry.id}`,
        ...(entry.email ? { email: entry.email } : {}),
    };
}
function fromUser(user) {
    const id = user.id;
    const first = user.properties?.firstName?.trim() ?? '';
    const last = user.properties?.lastName?.trim() ?? '';
    const email = user.properties?.email?.trim();
    return {
        id,
        label: `${first} ${last}`.trim() || id,
        kind: 'user',
        prefixedId: `user:${id}`,
        ...(email ? { email } : {}),
    };
}
function fromGroup(group) {
    const id = group.groupname;
    return {
        id,
        label: group.grouplabel?.trim() || id,
        kind: 'group',
        prefixedId: `group:${id}`,
    };
}

let nextId$4 = 0;
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
class NxsVocabularySelectComponent {
    /** The directory to choose from, such as `nature` or `l10ncoverage`. */
    directory = input.required(...(ngDevMode ? [{ debugName: "directory" }] : []));
    /** The field's label, already translated. Required: the input has no other name. */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Choose several entries; the value is then a list of ids. */
    multiple = input(false, ...(ngDevMode ? [{ debugName: "multiple", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Help under the field, already translated. */
    hint = input('', ...(ngDevMode ? [{ debugName: "hint" }] : []));
    /** Marks the field required. With a form, its `Validators.required` does the same. */
    required = input(false, ...(ngDevMode ? [{ debugName: "required", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** Shown but not editable. A form's `disable()` does the same. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled", transform: booleanAttribute }] : [{ transform: booleanAttribute }]));
    /** The id chosen, or `null`; with `multiple`, the ids chosen, in order. Two-way. */
    value = model(null, ...(ngDevMode ? [{ debugName: "value" }] : []));
    /** The input's id, in either mode: the form field's label names the input through it. */
    inputId = `nxs-vocabulary-select-${nextId$4++}`;
    directories = inject(DirectoryService);
    destroyRef = inject(DestroyRef);
    input = viewChild(MatInput, ...(ngDevMode ? [{ debugName: "input" }] : []));
    grid = viewChild(MatChipGrid, ...(ngDevMode ? [{ debugName: "grid" }] : []));
    control = new NxsPickerControl();
    loads = new Subject();
    /** The value the picker last set itself, so its own changes are not mistaken for a host's. */
    committed = null;
    loaded = signal({ status: 'loading' }, ...(ngDevMode ? [{ debugName: "loaded" }] : []));
    /** What the input shows: the chosen entry's label (single), or what the user is typing. */
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    /** The chosen ids, whichever mode. */
    chosen = computed(() => {
        const value = this.value();
        if (Array.isArray(value))
            return value;
        return typeof value === 'string' && value !== '' ? [value] : [];
    }, ...(ngDevMode ? [{ debugName: "chosen" }] : []));
    isDisabled = computed(() => this.disabled() || this.control.formDisabled(), ...(ngDevMode ? [{ debugName: "isDisabled" }] : []));
    groups = computed(() => {
        const loaded = this.loaded();
        if (loaded.status !== 'loaded')
            return [];
        // In single mode the input shows the chosen label, which is not a filter.
        const typed = this.text();
        const query = !this.multiple() && typed === this.labelOf(this.chosen()[0] ?? '') ? '' : typed;
        const taken = new Set(this.multiple() ? this.chosen() : []);
        return loaded
            .filter(query)
            .map((group) => ({
            ...group,
            entries: group.entries.filter((entry) => !taken.has(entry.id)),
        }))
            .filter((group) => group.entries.length > 0);
    }, ...(ngDevMode ? [{ debugName: "groups" }] : []));
    /** Text typed and no entry chosen for it. */
    unmatched = computed(() => {
        const typed = this.text().trim();
        if (!typed)
            return false;
        return this.multiple() || typed !== this.labelOf(this.chosen()[0] ?? '');
    }, ...(ngDevMode ? [{ debugName: "unmatched" }] : []));
    errorState = {
        isErrorState: () => this.control.wasTouched() &&
            (this.unmatched() || this.missing() || this.control.formInvalid()),
    };
    constructor() {
        this.loads
            .pipe(switchMap((directory) => this.load(directory)), takeUntilDestroyed(this.destroyRef))
            .subscribe((loaded) => this.loaded.set(loaded));
        effect(() => {
            const directory = this.directory();
            untracked(() => this.reload(directory));
        });
        // The input shows the chosen entry's label: once the labels arrive, and when the value changes
        // from outside — never while the user is typing, which is what clears the value.
        effect(() => {
            const loaded = this.loaded();
            untracked(() => {
                const first = this.chosen()[0];
                if (!this.multiple() && loaded.status === 'loaded' && first)
                    this.text.set(this.labelOf(first));
            });
        });
        effect(() => {
            const value = this.value();
            untracked(() => {
                if (value === this.committed)
                    return;
                this.committed = value;
                if (!this.multiple())
                    this.text.set(typeof value === 'string' ? this.labelOf(value) : '');
            });
        });
        effect(() => {
            this.unmatched();
            untracked(() => this.control.revalidate());
        });
    }
    /** `MatInput` and `MatChipGrid` recompute their error state only with a form control of their own. */
    ngDoCheck() {
        this.input()?.updateErrorState();
        this.grid()?.updateErrorState();
    }
    writeValue(value) {
        this.value.set(this.multiple() ? (Array.isArray(value) ? value : value ? [value] : []) : (value ?? null));
    }
    registerOnChange(fn) {
        this.control.registerOnChange(fn);
    }
    registerOnTouched(fn) {
        this.control.registerOnTouched(fn);
    }
    setDisabledState(disabled) {
        this.control.setDisabledState(disabled);
    }
    validate(control) {
        return this.control.validate(control, this.unmatched() ? { nxsChooseFromList: true } : null);
    }
    registerOnValidatorChange(fn) {
        this.control.registerOnValidatorChange(fn);
    }
    /** The label the field and its chips show for an id: the entry's, or the id itself. */
    labelOf(id) {
        const loaded = this.loaded();
        return (loaded.status === 'loaded' ? loaded.labels.get(id) : undefined) ?? id;
    }
    missing() {
        return this.control.missing(this.required(), this.chosen().length === 0);
    }
    onInput(event) {
        const typed = event.target.value;
        this.text.set(typed);
        if (!this.multiple() && this.chosen().length && typed !== this.labelOf(this.chosen()[0])) {
            this.commit(null);
        }
    }
    opened() {
        if (this.loaded().status === 'failed')
            this.reload(this.directory());
    }
    choose(id) {
        if (this.multiple()) {
            this.commit([...this.chosen(), id]);
            this.text.set('');
        }
        else {
            this.text.set(this.labelOf(id));
            this.commit(id);
        }
    }
    remove(id) {
        this.commit(this.chosen().filter((chosen) => chosen !== id));
    }
    clear() {
        this.text.set('');
        this.commit(null);
    }
    blurred() {
        this.control.blurred();
    }
    commit(value) {
        const next = this.multiple() ? (Array.isArray(value) ? value : []) : value;
        this.committed = next;
        this.value.set(next);
        this.control.changed(next);
    }
    reload(directory) {
        this.loaded.set({ status: 'loading' });
        this.loads.next(directory);
    }
    load(directory) {
        const loaded = directoryUsesL10nLabel(directory)
            ? this.directories.getAllL10nEntries(directory).pipe(map(hierarchical))
            : this.directories.getEntries(directory).pipe(map((entries) => {
                const labels = new Map(entries.map((entry) => [entry.id, directoryPickerLabel(entry)]));
                return {
                    status: 'loaded',
                    labels,
                    filter: (text) => [
                        {
                            label: '',
                            entries: filterDirectoryPickerEntries(entries, text).map((entry) => ({
                                id: entry.id,
                                label: labels.get(entry.id) ?? entry.id,
                            })),
                        },
                    ],
                };
            }));
        return loaded.pipe(catchError(() => of({ status: 'failed' })));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsVocabularySelectComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsVocabularySelectComponent, isStandalone: true, selector: "nxs-vocabulary-select", inputs: { directory: { classPropertyName: "directory", publicName: "directory", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null }, multiple: { classPropertyName: "multiple", publicName: "multiple", isSignal: true, isRequired: false, transformFunction: null }, hint: { classPropertyName: "hint", publicName: "hint", isSignal: true, isRequired: false, transformFunction: null }, required: { classPropertyName: "required", publicName: "required", isSignal: true, isRequired: false, transformFunction: null }, disabled: { classPropertyName: "disabled", publicName: "disabled", isSignal: true, isRequired: false, transformFunction: null }, value: { classPropertyName: "value", publicName: "value", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { value: "valueChange" }, host: { classAttribute: "nxs-vocabulary-select" }, providers: nxsPickerProviders(() => NxsVocabularySelectComponent), viewQueries: [{ propertyName: "input", first: true, predicate: MatInput, descendants: true, isSignal: true }, { propertyName: "grid", first: true, predicate: MatChipGrid, descendants: true, isSignal: true }], ngImport: i0, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  @if (multiple()) {\n    <mat-chip-grid\n      #grid\n      [disabled]=\"isDisabled()\"\n      [required]=\"required()\"\n      [errorStateMatcher]=\"errorState\"\n    >\n      @for (id of chosen(); track id) {\n        <mat-chip-row [attr.data-entry]=\"id\" (removed)=\"remove(id)\">\n          {{ labelOf(id) }}\n          <button\n            matChipRemove\n            type=\"button\"\n            [attr.aria-label]=\"\n              'satori-components.pickers.remove' | translate: { name: labelOf(id) }\n            \"\n          >\n            <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      <input\n        autocomplete=\"off\"\n        [id]=\"inputId\"\n        [matChipInputFor]=\"grid\"\n        [matAutocomplete]=\"auto\"\n        [value]=\"text()\"\n        (input)=\"onInput($event)\"\n        (focus)=\"opened()\"\n        (blur)=\"blurred()\"\n      />\n    </mat-chip-grid>\n  } @else {\n    <input\n      matInput\n      type=\"text\"\n      autocomplete=\"off\"\n      [id]=\"inputId\"\n      [matAutocomplete]=\"auto\"\n      [value]=\"text()\"\n      [required]=\"required()\"\n      [disabled]=\"isDisabled()\"\n      [errorStateMatcher]=\"errorState\"\n      (input)=\"onInput($event)\"\n      (focus)=\"opened()\"\n      (blur)=\"blurred()\"\n    />\n    @if (chosen().length && !isDisabled()) {\n      <button\n        matIconSuffix\n        mat-icon-button\n        type=\"button\"\n        class=\"nxs-picker__clear\"\n        [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n        (click)=\"clear()\"\n      >\n        <mat-icon aria-hidden=\"true\">close</mat-icon>\n      </button>\n    }\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete #auto=\"matAutocomplete\" (optionSelected)=\"choose($event.option.value)\">\n    @switch (loaded().status) {\n      @case ('loading') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.loading' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.vocabulary-select.failed' | translate\n        }}</mat-option>\n      }\n      @default {\n        @for (group of groups(); track group.label) {\n          @if (group.label) {\n            <mat-optgroup [label]=\"group.label\">\n              @for (entry of group.entries; track entry.id) {\n                <mat-option [value]=\"entry.id\" [attr.data-entry]=\"entry.id\">{{\n                  entry.label\n                }}</mat-option>\n              }\n            </mat-optgroup>\n          } @else {\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\" [attr.data-entry]=\"entry.id\">{{\n                entry.label\n              }}</mat-option>\n            }\n          }\n        } @empty {\n          <mat-option disabled class=\"nxs-picker__status\">{{\n            'satori-components.pickers.no-results' | translate\n          }}</mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i2$4.MatOptgroup, selector: "mat-optgroup", inputs: ["label", "disabled"], exportAs: ["matOptgroup"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatChipsModule }, { kind: "component", type: i4$2.MatChipGrid, selector: "mat-chip-grid", inputs: ["disabled", "placeholder", "required", "value", "errorStateMatcher"], outputs: ["change", "valueChange"] }, { kind: "directive", type: i4$2.MatChipInput, selector: "input[matChipInputFor]", inputs: ["matChipInputFor", "matChipInputAddOnBlur", "matChipInputSeparatorKeyCodes", "placeholder", "id", "disabled", "readonly", "matChipInputDisabledInteractive"], outputs: ["matChipInputTokenEnd"], exportAs: ["matChipInput", "matChipInputFor"] }, { kind: "directive", type: i4$2.MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: i4$2.MatChipRow, selector: "mat-chip-row, [mat-chip-row], mat-basic-chip-row, [mat-basic-chip-row]", inputs: ["editable"], outputs: ["edited"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatInputModule }, { kind: "directive", type: i4$1.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly", "disabledInteractive"], exportAs: ["matInput"] }, { kind: "component", type: i3$1.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i3$1.MatLabel, selector: "mat-label" }, { kind: "directive", type: i3$1.MatHint, selector: "mat-hint", inputs: ["align", "id"] }, { kind: "directive", type: i3$1.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i3$1.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsVocabularySelectComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-vocabulary-select', standalone: true, imports: [
                        MatAutocompleteModule,
                        MatButtonModule,
                        MatChipsModule,
                        MatIconModule,
                        MatInputModule,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, providers: nxsPickerProviders(() => NxsVocabularySelectComponent), host: { class: 'nxs-vocabulary-select' }, template: "<mat-form-field appearance=\"outline\" class=\"nxs-picker__field\" subscriptSizing=\"dynamic\">\n  <mat-label>{{ label() }}</mat-label>\n  @if (multiple()) {\n    <mat-chip-grid\n      #grid\n      [disabled]=\"isDisabled()\"\n      [required]=\"required()\"\n      [errorStateMatcher]=\"errorState\"\n    >\n      @for (id of chosen(); track id) {\n        <mat-chip-row [attr.data-entry]=\"id\" (removed)=\"remove(id)\">\n          {{ labelOf(id) }}\n          <button\n            matChipRemove\n            type=\"button\"\n            [attr.aria-label]=\"\n              'satori-components.pickers.remove' | translate: { name: labelOf(id) }\n            \"\n          >\n            <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      <input\n        autocomplete=\"off\"\n        [id]=\"inputId\"\n        [matChipInputFor]=\"grid\"\n        [matAutocomplete]=\"auto\"\n        [value]=\"text()\"\n        (input)=\"onInput($event)\"\n        (focus)=\"opened()\"\n        (blur)=\"blurred()\"\n      />\n    </mat-chip-grid>\n  } @else {\n    <input\n      matInput\n      type=\"text\"\n      autocomplete=\"off\"\n      [id]=\"inputId\"\n      [matAutocomplete]=\"auto\"\n      [value]=\"text()\"\n      [required]=\"required()\"\n      [disabled]=\"isDisabled()\"\n      [errorStateMatcher]=\"errorState\"\n      (input)=\"onInput($event)\"\n      (focus)=\"opened()\"\n      (blur)=\"blurred()\"\n    />\n    @if (chosen().length && !isDisabled()) {\n      <button\n        matIconSuffix\n        mat-icon-button\n        type=\"button\"\n        class=\"nxs-picker__clear\"\n        [attr.aria-label]=\"'satori-components.pickers.clear' | translate\"\n        (click)=\"clear()\"\n      >\n        <mat-icon aria-hidden=\"true\">close</mat-icon>\n      </button>\n    }\n  }\n  @if (unmatched()) {\n    <mat-error>{{ 'satori-components.pickers.choose-from-list' | translate }}</mat-error>\n  } @else if (missing()) {\n    <mat-error>{{ 'satori-components.pickers.required' | translate }}</mat-error>\n  }\n  @if (hint()) {\n    <mat-hint>{{ hint() }}</mat-hint>\n  }\n  <mat-autocomplete #auto=\"matAutocomplete\" (optionSelected)=\"choose($event.option.value)\">\n    @switch (loaded().status) {\n      @case ('loading') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.pickers.loading' | translate\n        }}</mat-option>\n      }\n      @case ('failed') {\n        <mat-option disabled class=\"nxs-picker__status\">{{\n          'satori-components.vocabulary-select.failed' | translate\n        }}</mat-option>\n      }\n      @default {\n        @for (group of groups(); track group.label) {\n          @if (group.label) {\n            <mat-optgroup [label]=\"group.label\">\n              @for (entry of group.entries; track entry.id) {\n                <mat-option [value]=\"entry.id\" [attr.data-entry]=\"entry.id\">{{\n                  entry.label\n                }}</mat-option>\n              }\n            </mat-optgroup>\n          } @else {\n            @for (entry of group.entries; track entry.id) {\n              <mat-option [value]=\"entry.id\" [attr.data-entry]=\"entry.id\">{{\n                entry.label\n              }}</mat-option>\n            }\n          }\n        } @empty {\n          <mat-option disabled class=\"nxs-picker__status\">{{\n            'satori-components.pickers.no-results' | translate\n          }}</mat-option>\n        }\n      }\n    }\n  </mat-autocomplete>\n</mat-form-field>\n", styles: [":host{display:block;min-inline-size:12rem}:host .nxs-picker__field{inline-size:100%}.nxs-picker__option{display:flex;flex-direction:column;min-inline-size:0}.nxs-picker__option-label{overflow-wrap:anywhere}.nxs-picker__option-detail{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);overflow-wrap:anywhere}\n"] }]
        }], ctorParameters: () => [], propDecorators: { directory: [{ type: i0.Input, args: [{ isSignal: true, alias: "directory", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], multiple: [{ type: i0.Input, args: [{ isSignal: true, alias: "multiple", required: false }] }], hint: [{ type: i0.Input, args: [{ isSignal: true, alias: "hint", required: false }] }], required: [{ type: i0.Input, args: [{ isSignal: true, alias: "required", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], value: [{ type: i0.Input, args: [{ isSignal: true, alias: "value", required: false }] }, { type: i0.Output, args: ["valueChange"] }], input: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatInput), { isSignal: true }] }], grid: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatChipGrid), { isSignal: true }] }] } });
/**
 * An l10n vocabulary, as Web UI's directory suggestion offers it: each child under its parent, with
 * the value `<parent>/<id>` (`_idFunction` in `nuxeo-directory-suggestion`), and a parent that has no
 * children as an entry of its own. The entries' ids are bare (`France`, parent `europe`), so the
 * parent is what keeps two children of one name apart.
 */
function hierarchical(entries) {
    const byId = new Map(entries.map((entry) => [entry.id, entry]));
    const parentIds = new Set(entries.map((entry) => entry.properties.parent).filter(Boolean));
    const parentLabel = (id) => {
        const parent = byId.get(id);
        return parent ? l10nEntryLabel(parent) : id;
    };
    const valueOf = (entry) => entry.properties.parent ? `${entry.properties.parent}/${entry.id}` : entry.id;
    const selectable = entries.filter((entry) => entry.properties.parent || !parentIds.has(entry.id));
    const labels = new Map(selectable.map((entry) => [
        valueOf(entry),
        entry.properties.parent
            ? `${parentLabel(entry.properties.parent)}/${l10nEntryLabel(entry)}`
            : l10nEntryLabel(entry),
    ]));
    return {
        status: 'loaded',
        labels,
        filter: (text) => {
            const query = text.trim().toLowerCase();
            const matches = (entry) => !query ||
                [
                    l10nEntryLabel(entry),
                    entry.id,
                    entry.properties.parent ? parentLabel(entry.properties.parent) : '',
                ].some((candidate) => candidate.toLowerCase().includes(query));
            const groups = new Map();
            const leaves = [];
            for (const entry of selectable.filter(matches)) {
                const option = { id: valueOf(entry), label: l10nEntryLabel(entry) };
                const parent = entry.properties.parent;
                if (!parent)
                    leaves.push(option);
                else
                    groups.set(parent, [...(groups.get(parent) ?? []), option]);
            }
            return [
                ...(leaves.length ? [{ label: '', entries: leaves }] : []),
                ...[...groups]
                    .map(([parent, children]) => ({ label: parentLabel(parent), entries: children }))
                    .sort((a, b) => a.label.localeCompare(b.label)),
            ];
        },
    };
}

const NOTHING_FOLDED = { start: 1, count: 0 };
/**
 * Which breadcrumbs to fold into the "…" menu so the trail fits on one line.
 *
 * The last item always stays: it is where the user is. Items fold from the second onwards, the ones
 * furthest from the current page first, as Satori's breadcrumbs fold them, so the first — where
 * the trail starts — stays while it fits. When only the first, the "…" and the last are left and
 * they still do not fit with the last cut short to its minimum, the first folds too, rather than
 * shrink to nothing while still being a link. The last item is never hidden, which is what Satori's
 * does at 110 px or narrower.
 *
 * @param widths  each item's rendered width, separator included, in trail order
 * @param overflowWidth  the "…" button's width, separator included
 * @param available  the width the trail may use
 * @param lastMinimum  the narrowest the last item is cut short to; its full width when unknown
 */
function breadcrumbsToFold(widths, overflowWidth, available, lastMinimum = Number.NaN) {
    const count = widths.length;
    if (count <= 2 || !(available > 0))
        return NOTHING_FOLDED;
    const total = widths.reduce((sum, width) => sum + width, 0);
    if (total <= available)
        return NOTHING_FOLDED;
    let shown = total + overflowWidth;
    for (let folded = 1; folded <= count - 2; folded += 1) {
        shown -= widths[folded];
        if (shown <= available)
            return { start: 1, count: folded };
    }
    const last = widths[count - 1];
    const shortest = Number.isFinite(lastMinimum) ? Math.min(last, lastMinimum) : last;
    return widths[0] + overflowWidth + shortest > available
        ? { start: 0, count: count - 1 }
        : { start: 1, count: count - 2 };
}

/**
 * A breadcrumb trail — the Material implementation of `nxs.primitives.breadcrumbs`.
 *
 * It stays on one line. When the trail is wider than its box, the items after the first fold into
 * a "…" menu, furthest from the current page first, as Satori's do. The first stays while it fits
 * beside the "…" and the current page; in a box too narrow for that it folds too. The current page
 * always stays, its label cut short rather than hidden. A router item needs the host to provide
 * the router, as `routerLink` always does.
 */
class NxsBreadcrumbsComponent {
    /**
     * The trail, outermost first. An item with `routerLink` navigates in the app, one with `href` is a
     * plain link, and one with neither is text — the current page, when it is the last.
     */
    items = input.required(...(ngDevMode ? [{ debugName: "items" }] : []));
    /**
     * The navigation landmark's accessible name, already translated, such as "Breadcrumbs". Blank, or
     * only whitespace or zero-width characters, leaves the landmark unnamed rather than named " ".
     */
    label = input('', ...(ngDevMode ? [{ debugName: "label" }] : []));
    name = computed(() => nxsVisibleText(this.label()), ...(ngDevMode ? [{ debugName: "name" }] : []));
    host = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    /** The items folded into the "…" menu, as last measured. */
    fold = signal({ start: 1, count: 0 }, ...(ngDevMode ? [{ debugName: "fold", equal: (a, b) => a.start === b.start && a.count === b.count }] : [{ equal: (a, b) => a.start === b.start && a.count === b.count }]));
    hiddenItems = computed(() => {
        const items = this.items();
        const { start, count } = this.foldFor(items.length);
        return items.slice(start, start + count);
    }, ...(ngDevMode ? [{ debugName: "hiddenItems" }] : []));
    entries = computed(() => {
        const items = this.items();
        const { start, count } = this.foldFor(items.length);
        const entries = items.map((item, index) => ({ kind: 'item', item, index }));
        if (count === 0)
            return entries;
        return [...entries.slice(0, start), { kind: 'overflow' }, ...entries.slice(start + count)];
    }, ...(ngDevMode ? [{ debugName: "entries" }] : []));
    constructor() {
        // Measured from a hidden copy of the whole trail, so a width that grows back unfolds items
        // without first having to show them to find out whether they fit.
        afterRenderEffect({
            earlyRead: () => {
                this.items();
                return this.measure();
            },
            write: (fold) => this.fold.set(fold()),
        });
        // The box changing width, and the trail's own width changing once a web font arrives.
        afterNextRender(() => {
            const remeasure = () => this.fold.set(this.measure());
            const fonts = this.host.nativeElement.ownerDocument.fonts;
            fonts?.addEventListener('loadingdone', remeasure);
            this.destroyRef.onDestroy(() => fonts?.removeEventListener('loadingdone', remeasure));
            if (typeof ResizeObserver === 'undefined')
                return;
            const observer = new ResizeObserver(remeasure);
            observer.observe(this.host.nativeElement);
            this.destroyRef.onDestroy(() => observer.disconnect());
        });
    }
    linkKind(item) {
        if (item.routerLink !== undefined)
            return 'router';
        if (item.href !== undefined)
            return 'href';
        return 'text';
    }
    /** The last measurement, kept within a trail that may have shortened since. */
    foldFor(length) {
        const { start, count } = this.fold();
        if (length <= 2)
            return { start: 1, count: 0 };
        return { start, count: Math.min(count, length - 1 - start) };
    }
    measure() {
        const host = this.host.nativeElement;
        const measured = host.querySelector('.nxs-breadcrumbs__measure');
        if (!measured)
            return { start: 1, count: 0 };
        // The gap between items is part of what each one costs, except after the last.
        const gap = parseFloat(getComputedStyle(measured).columnGap) || 0;
        const width = (element) => element?.getBoundingClientRect().width ?? 0;
        const elements = [
            ...measured.querySelectorAll(':scope > .nxs-breadcrumbs__item:not(.nxs-breadcrumbs__overflow-item)'),
        ];
        const items = elements.map((item, index) => width(item) + (index < elements.length - 1 ? gap : 0));
        const overflow = width(measured.querySelector(':scope > .nxs-breadcrumbs__overflow-item')) + gap;
        // The stylesheet cuts the last label no shorter than 4em.
        const last = elements.at(-1);
        const lastMinimum = last ? 4 * parseFloat(getComputedStyle(last).fontSize) : Number.NaN;
        return breadcrumbsToFold(items, overflow, host.clientWidth, lastMinimum);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsBreadcrumbsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsBreadcrumbsComponent, isStandalone: true, selector: "nxs-breadcrumbs", inputs: { items: { classPropertyName: "items", publicName: "items", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: false, transformFunction: null } }, host: { classAttribute: "nxs-breadcrumbs" }, ngImport: i0, template: "<nav class=\"nxs-breadcrumbs__nav\" [attr.aria-label]=\"name() || null\">\n  <ol class=\"nxs-breadcrumbs__list\">\n    @for (entry of entries(); track entry.kind === 'item' ? entry.index : -1; let last = $last) {\n      @if (entry.kind === 'overflow') {\n        @let more = 'satori-components.breadcrumbs.show-more' | translate;\n        <li class=\"nxs-breadcrumbs__item nxs-breadcrumbs__overflow-item\">\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-breadcrumbs__overflow\"\n            [matMenuTriggerFor]=\"hiddenMenu\"\n            [matTooltip]=\"more\"\n            [attr.aria-label]=\"more\"\n          >\n            <mat-icon aria-hidden=\"true\">more_horiz</mat-icon>\n          </button>\n          <mat-icon class=\"nxs-breadcrumbs__separator\" aria-hidden=\"true\">chevron_right</mat-icon>\n        </li>\n      } @else {\n        <li\n          class=\"nxs-breadcrumbs__item\"\n          [class.nxs-breadcrumbs__item--first]=\"entry.index === 0 && !last\"\n          [class.nxs-breadcrumbs__item--last]=\"last\"\n        >\n          @switch (linkKind(entry.item)) {\n            @case ('router') {\n              <a\n                class=\"nxs-breadcrumbs__link\"\n                [routerLink]=\"entry.item.routerLink\"\n                [queryParams]=\"entry.item.queryParams\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</a\n              >\n            }\n            @case ('href') {\n              <a\n                class=\"nxs-breadcrumbs__link\"\n                [href]=\"entry.item.href\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</a\n              >\n            }\n            @default {\n              <span\n                class=\"nxs-breadcrumbs__text\"\n                [attr.aria-current]=\"last ? 'page' : null\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</span\n              >\n            }\n          }\n          @if (!last) {\n            <mat-icon class=\"nxs-breadcrumbs__separator\" aria-hidden=\"true\">chevron_right</mat-icon>\n          }\n        </li>\n      }\n    }\n  </ol>\n  <mat-menu #hiddenMenu=\"matMenu\">\n    @for (item of hiddenItems(); track $index) {\n      @switch (linkKind(item)) {\n        @case ('router') {\n          <a mat-menu-item [routerLink]=\"item.routerLink\" [queryParams]=\"item.queryParams\">{{\n            item.label\n          }}</a>\n        }\n        @case ('href') {\n          <a mat-menu-item [href]=\"item.href\">{{ item.label }}</a>\n        }\n        @default {\n          <button mat-menu-item type=\"button\" disabled>{{ item.label }}</button>\n        }\n      }\n    }\n  </mat-menu>\n</nav>\n<!-- The whole trail at its natural width, for measuring only. -->\n<ol class=\"nxs-breadcrumbs__list nxs-breadcrumbs__measure\" aria-hidden=\"true\">\n  @for (item of items(); track $index; let last = $last) {\n    <li class=\"nxs-breadcrumbs__item\">\n      <span class=\"nxs-breadcrumbs__text\">{{ item.label }}</span>\n      @if (!last) {\n        <mat-icon class=\"nxs-breadcrumbs__separator\">chevron_right</mat-icon>\n      }\n    </li>\n  }\n  <li class=\"nxs-breadcrumbs__item nxs-breadcrumbs__overflow-item\">\n    <span class=\"nxs-breadcrumbs__overflow-measure\"></span>\n    <mat-icon class=\"nxs-breadcrumbs__separator\">chevron_right</mat-icon>\n  </li>\n</ol>\n", styles: [":host{position:relative;display:block;min-width:0;overflow:hidden;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant)}.nxs-breadcrumbs__list{display:flex;flex-wrap:nowrap;align-items:center;gap:4px;min-width:0;margin:0;padding:0;list-style:none}.nxs-breadcrumbs__item{display:inline-flex;flex:0 0 auto;align-items:center;gap:4px;min-width:0;white-space:nowrap}.nxs-breadcrumbs__item--first,.nxs-breadcrumbs__item--last{flex:0 1 auto;overflow:hidden}.nxs-breadcrumbs__item--first .nxs-breadcrumbs__link,.nxs-breadcrumbs__item--first .nxs-breadcrumbs__text,.nxs-breadcrumbs__item--last .nxs-breadcrumbs__link,.nxs-breadcrumbs__item--last .nxs-breadcrumbs__text{min-width:0;overflow:hidden;text-overflow:ellipsis}.nxs-breadcrumbs__item--last{min-width:min(100%,4em)}.nxs-breadcrumbs__link{color:var(--mat-sys-primary);text-decoration:underline}.nxs-breadcrumbs__text[aria-current=page]{color:var(--mat-sys-on-surface)}.nxs-breadcrumbs__separator{flex:0 0 auto;width:18px;height:18px;font-size:18px;color:var(--mat-sys-outline)}:host-context([dir=rtl]) .nxs-breadcrumbs__separator{transform:scaleX(-1)}.nxs-breadcrumbs__overflow{--mat-icon-button-state-layer-size: 28px;width:28px;height:28px;padding:2px}.nxs-breadcrumbs__overflow-measure{display:inline-block;width:28px}.nxs-breadcrumbs__measure{flex-wrap:wrap;height:0;overflow:hidden;visibility:hidden;pointer-events:none}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatMenuModule }, { kind: "component", type: i3.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "component", type: i3.MatMenuItem, selector: "[mat-menu-item]", inputs: ["role", "disabled", "disableRipple"], exportAs: ["matMenuItem"] }, { kind: "directive", type: i3.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "directive", type: RouterLink, selector: "[routerLink]", inputs: ["target", "queryParams", "fragment", "queryParamsHandling", "state", "info", "relativeTo", "preserveFragment", "skipLocationChange", "replaceUrl", "routerLink"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsBreadcrumbsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-breadcrumbs', standalone: true, imports: [
                        MatButtonModule,
                        MatIconModule,
                        MatMenuModule,
                        MatTooltipModule,
                        RouterLink,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-breadcrumbs' }, template: "<nav class=\"nxs-breadcrumbs__nav\" [attr.aria-label]=\"name() || null\">\n  <ol class=\"nxs-breadcrumbs__list\">\n    @for (entry of entries(); track entry.kind === 'item' ? entry.index : -1; let last = $last) {\n      @if (entry.kind === 'overflow') {\n        @let more = 'satori-components.breadcrumbs.show-more' | translate;\n        <li class=\"nxs-breadcrumbs__item nxs-breadcrumbs__overflow-item\">\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-breadcrumbs__overflow\"\n            [matMenuTriggerFor]=\"hiddenMenu\"\n            [matTooltip]=\"more\"\n            [attr.aria-label]=\"more\"\n          >\n            <mat-icon aria-hidden=\"true\">more_horiz</mat-icon>\n          </button>\n          <mat-icon class=\"nxs-breadcrumbs__separator\" aria-hidden=\"true\">chevron_right</mat-icon>\n        </li>\n      } @else {\n        <li\n          class=\"nxs-breadcrumbs__item\"\n          [class.nxs-breadcrumbs__item--first]=\"entry.index === 0 && !last\"\n          [class.nxs-breadcrumbs__item--last]=\"last\"\n        >\n          @switch (linkKind(entry.item)) {\n            @case ('router') {\n              <a\n                class=\"nxs-breadcrumbs__link\"\n                [routerLink]=\"entry.item.routerLink\"\n                [queryParams]=\"entry.item.queryParams\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</a\n              >\n            }\n            @case ('href') {\n              <a\n                class=\"nxs-breadcrumbs__link\"\n                [href]=\"entry.item.href\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</a\n              >\n            }\n            @default {\n              <span\n                class=\"nxs-breadcrumbs__text\"\n                [attr.aria-current]=\"last ? 'page' : null\"\n                [attr.title]=\"last || entry.index === 0 ? entry.item.label : null\"\n                >{{ entry.item.label }}</span\n              >\n            }\n          }\n          @if (!last) {\n            <mat-icon class=\"nxs-breadcrumbs__separator\" aria-hidden=\"true\">chevron_right</mat-icon>\n          }\n        </li>\n      }\n    }\n  </ol>\n  <mat-menu #hiddenMenu=\"matMenu\">\n    @for (item of hiddenItems(); track $index) {\n      @switch (linkKind(item)) {\n        @case ('router') {\n          <a mat-menu-item [routerLink]=\"item.routerLink\" [queryParams]=\"item.queryParams\">{{\n            item.label\n          }}</a>\n        }\n        @case ('href') {\n          <a mat-menu-item [href]=\"item.href\">{{ item.label }}</a>\n        }\n        @default {\n          <button mat-menu-item type=\"button\" disabled>{{ item.label }}</button>\n        }\n      }\n    }\n  </mat-menu>\n</nav>\n<!-- The whole trail at its natural width, for measuring only. -->\n<ol class=\"nxs-breadcrumbs__list nxs-breadcrumbs__measure\" aria-hidden=\"true\">\n  @for (item of items(); track $index; let last = $last) {\n    <li class=\"nxs-breadcrumbs__item\">\n      <span class=\"nxs-breadcrumbs__text\">{{ item.label }}</span>\n      @if (!last) {\n        <mat-icon class=\"nxs-breadcrumbs__separator\">chevron_right</mat-icon>\n      }\n    </li>\n  }\n  <li class=\"nxs-breadcrumbs__item nxs-breadcrumbs__overflow-item\">\n    <span class=\"nxs-breadcrumbs__overflow-measure\"></span>\n    <mat-icon class=\"nxs-breadcrumbs__separator\">chevron_right</mat-icon>\n  </li>\n</ol>\n", styles: [":host{position:relative;display:block;min-width:0;overflow:hidden;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant)}.nxs-breadcrumbs__list{display:flex;flex-wrap:nowrap;align-items:center;gap:4px;min-width:0;margin:0;padding:0;list-style:none}.nxs-breadcrumbs__item{display:inline-flex;flex:0 0 auto;align-items:center;gap:4px;min-width:0;white-space:nowrap}.nxs-breadcrumbs__item--first,.nxs-breadcrumbs__item--last{flex:0 1 auto;overflow:hidden}.nxs-breadcrumbs__item--first .nxs-breadcrumbs__link,.nxs-breadcrumbs__item--first .nxs-breadcrumbs__text,.nxs-breadcrumbs__item--last .nxs-breadcrumbs__link,.nxs-breadcrumbs__item--last .nxs-breadcrumbs__text{min-width:0;overflow:hidden;text-overflow:ellipsis}.nxs-breadcrumbs__item--last{min-width:min(100%,4em)}.nxs-breadcrumbs__link{color:var(--mat-sys-primary);text-decoration:underline}.nxs-breadcrumbs__text[aria-current=page]{color:var(--mat-sys-on-surface)}.nxs-breadcrumbs__separator{flex:0 0 auto;width:18px;height:18px;font-size:18px;color:var(--mat-sys-outline)}:host-context([dir=rtl]) .nxs-breadcrumbs__separator{transform:scaleX(-1)}.nxs-breadcrumbs__overflow{--mat-icon-button-state-layer-size: 28px;width:28px;height:28px;padding:2px}.nxs-breadcrumbs__overflow-measure{display:inline-block;width:28px}.nxs-breadcrumbs__measure{flex-wrap:wrap;height:0;overflow:hidden;visibility:hidden;pointer-events:none}\n"] }]
        }], ctorParameters: () => [], propDecorators: { items: [{ type: i0.Input, args: [{ isSignal: true, alias: "items", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: false }] }] } });

let nextId$3 = 0;
/**
 * The state of one upload queue: the files chosen, then each file's progress and outcome while
 * they upload, in order. `nxs-upload-queue` draws it.
 *
 * It does no request itself. A page stages files, then runs its upload — usually
 * `DocumentImportService.importFiles(path, queue.pending(), { onProgress: (p) => queue.progress(p) })`
 * — and reports the outcome with `complete` or `fail`. So the same queue serves an import dialog
 * and files dropped on a list, with the request each already makes.
 */
class NxsUploadQueue {
    state = signal([], ...(ngDevMode ? [{ debugName: "state" }] : []));
    /** The ids of the files in the run under way, in upload order. */
    running = [];
    /** Every file, in the order chosen. */
    items = this.state.asReadonly();
    /** Whether a run is under way. */
    busy = computed(() => this.items().some((item) => item.state === 'waiting' || item.state === 'uploading'), ...(ngDevMode ? [{ debugName: "busy" }] : []));
    done = computed(() => this.items().filter((item) => item.state === 'done'), ...(ngDevMode ? [{ debugName: "done" }] : []));
    failed = computed(() => this.items().filter((item) => item.state === 'failed'), ...(ngDevMode ? [{ debugName: "failed" }] : []));
    /** Adds files to the queue, not yet uploading. */
    stage(files) {
        const added = files.map((file) => item(file));
        this.state.update((items) => [...items, ...added]);
    }
    /** The files not uploaded yet — chosen, or refused last time — in order: what a run uploads. */
    pending() {
        return this.items()
            .filter((item) => item.state === 'staged' || item.state === 'failed')
            .map((item) => item.file);
    }
    /** Marks the pending files as this run's, waiting their turn. */
    start() {
        const pending = this.items().filter((item) => item.state === 'staged' || item.state === 'failed');
        this.running = pending.map((item) => item.id);
        const ids = new Set(this.running);
        this.update((item) => ids.has(item.id) ? { ...item, state: 'waiting', percent: 0, error: null } : item);
    }
    /** Moves the run along: files before `fileIndex` are on their way to done, that one is uploading. */
    progress(progress) {
        const count = progress.fileCount ?? this.running.length;
        const index = Math.min(Math.max(progress.fileIndex ?? 0, 0), this.running.length - 1);
        if (count <= 0 || index < 0)
            return;
        const segment = 100 / count;
        const own = Math.round(Math.min(Math.max((progress.percent - index * segment) / segment, 0), 1) * 100);
        this.update((item) => {
            const at = this.running.indexOf(item.id);
            if (at < 0 || item.state === 'done')
                return item;
            if (at < index)
                return { ...item, state: 'uploading', percent: 100 };
            if (at === index)
                return { ...item, state: 'uploading', percent: own };
            return item;
        });
    }
    /** The run finished: each file created, its document in the same order. */
    complete(documents) {
        const running = this.running;
        this.update((item) => {
            const at = running.indexOf(item.id);
            return at < 0
                ? item
                : { ...item, state: 'done', percent: 100, document: documents[at] ?? null };
        });
        this.running = [];
    }
    /**
     * The run stopped on a failure. Files that had reached 100% were created, and are done; the first
     * that had not failed, with the error's status; the ones after it never started, and go back to
     * the queue for another run.
     */
    fail(error) {
        const status = nxsErrorStatus(error);
        const running = this.running;
        const percents = new Map(this.items().map((item) => [item.id, item.percent]));
        const first = running.findIndex((id) => (percents.get(id) ?? 0) < 100);
        const failedAt = first < 0 ? running.length - 1 : first;
        this.update((item) => {
            const at = running.indexOf(item.id);
            if (at < 0)
                return item;
            if (at < failedAt)
                return { ...item, state: 'done', percent: 100 };
            if (at === failedAt)
                return { ...item, state: 'failed', error: status };
            return { ...item, state: 'staged', percent: 0 };
        });
        this.running = [];
    }
    /** Takes a file out, unless it is part of a run under way. */
    remove(id) {
        this.state.update((items) => items.filter((item) => item.id !== id || item.state === 'waiting' || item.state === 'uploading'));
    }
    /** Drops the files that are done, keeping the rest. */
    clearDone() {
        this.state.update((items) => items.filter((item) => item.state !== 'done'));
    }
    /** Empties the queue, unless a run is under way. */
    clear() {
        if (!this.busy())
            this.state.set([]);
    }
    update(change) {
        this.state.update((items) => items.map(change));
    }
}
function item(file) {
    return {
        id: `nxs-upload-${nextId$3++}`,
        file,
        state: 'staged',
        percent: 0,
        error: null,
        document: null,
    };
}

/**
 * The files of an upload, each with its own state: chosen, waiting, uploading with its progress,
 * uploaded, or refused with the reason and Retry.
 *
 * Presentational: it draws `items` — usually an `NxsUploadQueue`'s — and reports Remove and Retry;
 * the page runs the upload. The count of files uploaded and refused is announced politely as it
 * changes, so a screen reader follows a long upload without watching each bar.
 */
class NxsUploadQueueComponent {
    /** The files, in order. */
    items = input.required(...(ngDevMode ? [{ debugName: "items" }] : []));
    /** The list's accessible name, already translated, such as "Files to upload". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** Remove was pressed on a file that is not uploading: its id. */
    remove = output();
    /** Retry was pressed on a refused file: its id. */
    retry = output();
    doneCount = computed(() => this.items().filter((item) => item.state === 'done').length, ...(ngDevMode ? [{ debugName: "doneCount" }] : []));
    failedCount = computed(() => this.items().filter((item) => item.state === 'failed').length, ...(ngDevMode ? [{ debugName: "failedCount" }] : []));
    started = computed(() => this.items().some((item) => item.state !== 'staged'), ...(ngDevMode ? [{ debugName: "started" }] : []));
    /**
     * Whether the list scrolls. A file waiting or uploading has no button, so a long run can leave
     * nothing in the list to focus; the list then takes focus itself, so the keyboard can scroll it.
     * Measured when the files change and when the list changes size with the same files, as on zoom.
     */
    scrolls = signal(false, ...(ngDevMode ? [{ debugName: "scrolls" }] : []));
    list = viewChild('list', ...(ngDevMode ? [{ debugName: "list" }] : []));
    constructor() {
        afterRenderEffect(() => {
            this.items();
            this.measure();
        });
        afterRenderEffect((onCleanup) => {
            const list = this.list()?.nativeElement;
            if (!list || typeof ResizeObserver === 'undefined')
                return;
            const observer = new ResizeObserver(() => this.measure());
            observer.observe(list);
            onCleanup(() => observer.disconnect());
        });
    }
    size(bytes) {
        if (!Number.isFinite(bytes) || bytes < 0)
            return '';
        if (bytes < 1024)
            return `${bytes} B`;
        const units = ['KB', 'MB', 'GB'];
        let value = bytes / 1024;
        let unit = 0;
        while (value >= 1024 && unit < units.length - 1) {
            value /= 1024;
            unit += 1;
        }
        return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
    }
    removable(item) {
        return item.state === 'staged' || item.state === 'failed' || item.state === 'done';
    }
    measure() {
        const list = this.list()?.nativeElement;
        this.scrolls.set(!!list && list.scrollHeight > list.clientHeight);
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsUploadQueueComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsUploadQueueComponent, isStandalone: true, selector: "nxs-upload-queue", inputs: { items: { classPropertyName: "items", publicName: "items", isSignal: true, isRequired: true, transformFunction: null }, label: { classPropertyName: "label", publicName: "label", isSignal: true, isRequired: true, transformFunction: null } }, outputs: { remove: "remove", retry: "retry" }, host: { classAttribute: "nxs-upload-queue" }, viewQueries: [{ propertyName: "list", first: true, predicate: ["list"], descendants: true, isSignal: true }], ngImport: i0, template: "@if (items().length > 0) {\n  @if (started()) {\n    <p class=\"nxs-upload-queue__summary\" aria-live=\"polite\" aria-atomic=\"true\">\n      {{\n        'satori-components.upload-queue.summary'\n          | translate: { done: doneCount(), total: items().length }\n      }}\n      @if (failedCount() > 0) {\n        {{ 'satori-components.upload-queue.summary-failed' | translate: { count: failedCount() } }}\n      }\n    </p>\n  }\n  <ul\n    #list\n    class=\"nxs-upload-queue__list\"\n    [attr.aria-label]=\"label()\"\n    [attr.tabindex]=\"scrolls() ? 0 : null\"\n  >\n    @for (item of items(); track item.id) {\n      <li class=\"nxs-upload-queue__item\" [attr.data-state]=\"item.state\">\n        <mat-icon class=\"nxs-upload-queue__icon\" aria-hidden=\"true\">\n          @switch (item.state) {\n            @case ('done') {\n              check_circle\n            }\n            @case ('failed') {\n              error_outline\n            }\n            @default {\n              description\n            }\n          }\n        </mat-icon>\n        <div class=\"nxs-upload-queue__body\">\n          <span class=\"nxs-upload-queue__name\">{{ item.file.name }}</span>\n          <span class=\"nxs-upload-queue__status\">\n            @switch (item.state) {\n              @case ('staged') {\n                {{ size(item.file.size) }}\n              }\n              @case ('waiting') {\n                {{ 'satori-components.upload-queue.waiting' | translate }}\n              }\n              @case ('uploading') {\n                {{\n                  'satori-components.upload-queue.uploading' | translate: { percent: item.percent }\n                }}\n              }\n              @case ('done') {\n                {{ 'satori-components.upload-queue.done' | translate }}\n              }\n              @case ('failed') {\n                @switch (item.error) {\n                  @case (403) {\n                    {{ 'satori-components.upload-queue.forbidden' | translate }}\n                  }\n                  @case (404) {\n                    {{ 'satori-components.upload-queue.not-found' | translate }}\n                  }\n                  @default {\n                    {{ 'satori-components.upload-queue.failed' | translate }}\n                  }\n                }\n              }\n            }\n          </span>\n          @if (item.state === 'uploading') {\n            <mat-progress-bar\n              class=\"nxs-upload-queue__bar\"\n              mode=\"determinate\"\n              [value]=\"item.percent\"\n              [attr.aria-label]=\"\n                'satori-components.upload-queue.progress' | translate: { name: item.file.name }\n              \"\n            />\n          }\n        </div>\n        @if (item.state === 'failed') {\n          @let retryLabel =\n            'satori-components.upload-queue.retry' | translate: { name: item.file.name };\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-upload-queue__retry\"\n            [matTooltip]=\"retryLabel\"\n            [attr.aria-label]=\"retryLabel\"\n            (click)=\"retry.emit(item.id)\"\n          >\n            <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n          </button>\n        }\n        @if (removable(item)) {\n          @let removeLabel =\n            'satori-components.upload-queue.remove' | translate: { name: item.file.name };\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-upload-queue__remove\"\n            [matTooltip]=\"removeLabel\"\n            [attr.aria-label]=\"removeLabel\"\n            (click)=\"remove.emit(item.id)\"\n          >\n            <mat-icon aria-hidden=\"true\">close</mat-icon>\n          </button>\n        }\n      </li>\n    }\n  </ul>\n}\n", styles: [":host{display:block;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface)}.nxs-upload-queue__summary{margin:0 0 8px;color:var(--mat-sys-on-surface-variant)}.nxs-upload-queue__list{max-height:280px;margin:0;padding:0;overflow-y:auto;list-style:none;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-upload-queue__list:focus{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-upload-queue__list:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-upload-queue__item{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant)}.nxs-upload-queue__item:last-child{border-bottom:0}.nxs-upload-queue__icon{flex-shrink:0;color:var(--mat-sys-on-surface-variant)}[data-state=done] .nxs-upload-queue__icon{color:var(--mat-sys-primary)}[data-state=failed] .nxs-upload-queue__icon,[data-state=failed] .nxs-upload-queue__status{color:var(--mat-sys-error)}.nxs-upload-queue__body{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}.nxs-upload-queue__name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nxs-upload-queue__status{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant)}.nxs-upload-queue__bar{margin-top:4px}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatProgressBarModule }, { kind: "component", type: i3$2.MatProgressBar, selector: "mat-progress-bar", inputs: ["color", "value", "bufferValue", "mode"], outputs: ["animationEnd"], exportAs: ["matProgressBar"] }, { kind: "ngmodule", type: MatTooltipModule }, { kind: "directive", type: i4.MatTooltip, selector: "[matTooltip]", inputs: ["matTooltipPosition", "matTooltipPositionAtOrigin", "matTooltipDisabled", "matTooltipShowDelay", "matTooltipHideDelay", "matTooltipTouchGestures", "matTooltip", "matTooltipClass"], exportAs: ["matTooltip"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsUploadQueueComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-upload-queue', standalone: true, imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatTooltipModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-upload-queue' }, template: "@if (items().length > 0) {\n  @if (started()) {\n    <p class=\"nxs-upload-queue__summary\" aria-live=\"polite\" aria-atomic=\"true\">\n      {{\n        'satori-components.upload-queue.summary'\n          | translate: { done: doneCount(), total: items().length }\n      }}\n      @if (failedCount() > 0) {\n        {{ 'satori-components.upload-queue.summary-failed' | translate: { count: failedCount() } }}\n      }\n    </p>\n  }\n  <ul\n    #list\n    class=\"nxs-upload-queue__list\"\n    [attr.aria-label]=\"label()\"\n    [attr.tabindex]=\"scrolls() ? 0 : null\"\n  >\n    @for (item of items(); track item.id) {\n      <li class=\"nxs-upload-queue__item\" [attr.data-state]=\"item.state\">\n        <mat-icon class=\"nxs-upload-queue__icon\" aria-hidden=\"true\">\n          @switch (item.state) {\n            @case ('done') {\n              check_circle\n            }\n            @case ('failed') {\n              error_outline\n            }\n            @default {\n              description\n            }\n          }\n        </mat-icon>\n        <div class=\"nxs-upload-queue__body\">\n          <span class=\"nxs-upload-queue__name\">{{ item.file.name }}</span>\n          <span class=\"nxs-upload-queue__status\">\n            @switch (item.state) {\n              @case ('staged') {\n                {{ size(item.file.size) }}\n              }\n              @case ('waiting') {\n                {{ 'satori-components.upload-queue.waiting' | translate }}\n              }\n              @case ('uploading') {\n                {{\n                  'satori-components.upload-queue.uploading' | translate: { percent: item.percent }\n                }}\n              }\n              @case ('done') {\n                {{ 'satori-components.upload-queue.done' | translate }}\n              }\n              @case ('failed') {\n                @switch (item.error) {\n                  @case (403) {\n                    {{ 'satori-components.upload-queue.forbidden' | translate }}\n                  }\n                  @case (404) {\n                    {{ 'satori-components.upload-queue.not-found' | translate }}\n                  }\n                  @default {\n                    {{ 'satori-components.upload-queue.failed' | translate }}\n                  }\n                }\n              }\n            }\n          </span>\n          @if (item.state === 'uploading') {\n            <mat-progress-bar\n              class=\"nxs-upload-queue__bar\"\n              mode=\"determinate\"\n              [value]=\"item.percent\"\n              [attr.aria-label]=\"\n                'satori-components.upload-queue.progress' | translate: { name: item.file.name }\n              \"\n            />\n          }\n        </div>\n        @if (item.state === 'failed') {\n          @let retryLabel =\n            'satori-components.upload-queue.retry' | translate: { name: item.file.name };\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-upload-queue__retry\"\n            [matTooltip]=\"retryLabel\"\n            [attr.aria-label]=\"retryLabel\"\n            (click)=\"retry.emit(item.id)\"\n          >\n            <mat-icon aria-hidden=\"true\">refresh</mat-icon>\n          </button>\n        }\n        @if (removable(item)) {\n          @let removeLabel =\n            'satori-components.upload-queue.remove' | translate: { name: item.file.name };\n          <button\n            mat-icon-button\n            type=\"button\"\n            class=\"nxs-upload-queue__remove\"\n            [matTooltip]=\"removeLabel\"\n            [attr.aria-label]=\"removeLabel\"\n            (click)=\"remove.emit(item.id)\"\n          >\n            <mat-icon aria-hidden=\"true\">close</mat-icon>\n          </button>\n        }\n      </li>\n    }\n  </ul>\n}\n", styles: [":host{display:block;font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface)}.nxs-upload-queue__summary{margin:0 0 8px;color:var(--mat-sys-on-surface-variant)}.nxs-upload-queue__list{max-height:280px;margin:0;padding:0;overflow-y:auto;list-style:none;border:1px solid var(--mat-sys-outline-variant);border-radius:8px}.nxs-upload-queue__list:focus{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-upload-queue__list:focus-visible{outline:2px solid var(--mat-sys-primary);outline-offset:2px}.nxs-upload-queue__item{display:flex;align-items:center;gap:10px;padding:8px 8px 8px 12px;border-bottom:1px solid var(--mat-sys-outline-variant)}.nxs-upload-queue__item:last-child{border-bottom:0}.nxs-upload-queue__icon{flex-shrink:0;color:var(--mat-sys-on-surface-variant)}[data-state=done] .nxs-upload-queue__icon{color:var(--mat-sys-primary)}[data-state=failed] .nxs-upload-queue__icon,[data-state=failed] .nxs-upload-queue__status{color:var(--mat-sys-error)}.nxs-upload-queue__body{display:flex;flex:1;flex-direction:column;gap:2px;min-width:0}.nxs-upload-queue__name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nxs-upload-queue__status{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant)}.nxs-upload-queue__bar{margin-top:4px}\n"] }]
        }], ctorParameters: () => [], propDecorators: { items: [{ type: i0.Input, args: [{ isSignal: true, alias: "items", required: true }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], remove: [{ type: i0.Output, args: ["remove"] }], retry: [{ type: i0.Output, args: ["retry"] }], list: [{ type: i0.ViewChild, args: ['list', { isSignal: true }] }] } });

let nextId$2 = 0;
/** The least gap, in px, the open panel keeps from either side of the viewport. */
const VIEWPORT_MARGIN = 8;
/** How long, in ms, the pointer rests or focus stays on the button before the panel opens: Satori's `showDelay`. */
const SHOW_DELAY = 200;
/** How long, in ms, the panel stays after the pointer leaves, so it can come back: Satori's `hideDelay`. */
const HIDE_DELAY = 1500;
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
class NxsRichTooltipComponent {
    /** The panel's title, already translated. */
    heading = input.required(...(ngDevMode ? [{ debugName: "heading" }] : []));
    /** The explanation under the title, already translated. Plain text. */
    content = input.required(...(ngDevMode ? [{ debugName: "content" }] : []));
    /** The trigger button's accessible name, already translated. The button shows only an icon. */
    triggerLabel = input.required(...(ngDevMode ? [{ debugName: "triggerLabel" }] : []));
    /** The trigger's Material Icons ligature. */
    icon = input('info', ...(ngDevMode ? [{ debugName: "icon" }] : []));
    open = signal(false, ...(ngDevMode ? [{ debugName: "open" }] : []));
    panelId = `nxs-rich-tooltip-${nextId$2++}`;
    /** How far, in px, the open panel is moved sideways to stay inside the viewport. */
    shift = signal(0, ...(ngDevMode ? [{ debugName: "shift" }] : []));
    host = inject(ElementRef);
    trigger = viewChild.required('trigger', {
        read: (ElementRef),
    });
    panel = viewChild('panel', ...(ngDevMode ? [{ debugName: "panel", read: (ElementRef) }] : [{ read: (ElementRef) }]));
    /** What opened the panel while it is open; `null` while it is closed. */
    opener = null;
    /** What will open the panel once `SHOW_DELAY` has passed. */
    pending = null;
    showTimer;
    hideTimer;
    /** A pointer is pressing the button, so the focus it gives is the click's to handle. */
    pressing = false;
    constructor() {
        afterRenderEffect((onCleanup) => {
            if (!this.open())
                return;
            this.place();
            const view = this.host.nativeElement.ownerDocument.defaultView;
            const replace = () => this.place();
            view?.addEventListener('resize', replace);
            onCleanup(() => view?.removeEventListener('resize', replace));
        });
        inject(DestroyRef).onDestroy(() => {
            clearTimeout(this.showTimer);
            clearTimeout(this.hideTimer);
        });
    }
    /** A pointer rests on the button or the panel. A touch has no hover; its tap is a click. */
    onPointerEnter(event) {
        if (event.pointerType === 'touch')
            return;
        clearTimeout(this.hideTimer);
        if (!this.open())
            this.openSoon('hover');
    }
    onPointerLeave(event) {
        if (event.pointerType === 'touch')
            return;
        if (this.pending === 'hover')
            this.cancelOpening();
        if (this.opener !== 'hover')
            return;
        clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => this.close(), HIDE_DELAY);
    }
    onPointerDown() {
        this.pressing = true;
    }
    /**
     * Any press ends here, anywhere in the document: one that becomes a scroll (`pointercancel`) or is
     * released off the button never clicks, and would otherwise leave the next keyboard focus ignored.
     * A mouse focuses the button when it goes down, so its focus has passed by now; a tap's comes
     * after this, with its click a moment later, which cancels the opening the focus starts.
     */
    onPressEnd() {
        this.pressing = false;
    }
    /** Keyboard focus opens the panel. The focus a press gives is left to its click. */
    onFocus() {
        if (this.pressing)
            return;
        if (!this.open()) {
            this.openSoon('focus');
        }
        else if (this.opener === 'hover') {
            clearTimeout(this.hideTimer);
            this.opener = 'focus';
        }
    }
    /**
     * A click, a tap, Enter or Space. A click on a panel the pointer opened keeps it open once the
     * pointer leaves; otherwise activating the button opens or closes the panel.
     */
    onClick() {
        this.pressing = false;
        this.cancelOpening();
        if (this.open() && this.opener !== 'hover')
            this.close();
        else
            this.show('click');
    }
    /**
     * Escape closes the panel, or stops it opening, wherever focus is: a panel the pointer opened
     * must close while focus is on another control (WCAG 1.4.13). Focus inside the component goes
     * back to the button; focus anywhere else stays where it is.
     */
    onEscape() {
        this.cancelOpening();
        if (!this.open())
            return;
        const host = this.host.nativeElement;
        const focusInside = host.contains(host.ownerDocument.activeElement);
        this.close();
        if (focusInside)
            this.trigger().nativeElement.focus();
    }
    onFocusOut(event) {
        const next = event.relatedTarget;
        if (next instanceof Node && this.host.nativeElement.contains(next))
            return;
        this.pressing = false;
        this.cancelOpening();
        this.close();
    }
    /** Opens after `SHOW_DELAY`, unless it opens or is cancelled first. Focus outranks hover. */
    openSoon(opener) {
        if (this.pending) {
            if (opener === 'focus')
                this.pending = opener;
            return;
        }
        this.pending = opener;
        this.showTimer = setTimeout(() => {
            const pending = this.pending;
            this.pending = null;
            if (pending)
                this.show(pending);
        }, SHOW_DELAY);
    }
    cancelOpening() {
        clearTimeout(this.showTimer);
        this.pending = null;
    }
    show(opener) {
        clearTimeout(this.hideTimer);
        this.opener = opener;
        this.open.set(true);
    }
    close() {
        clearTimeout(this.hideTimer);
        this.opener = null;
        this.open.set(false);
    }
    /** Measured from the host, so the shift already applied does not feed into the next one. */
    place() {
        const panel = this.panel()?.nativeElement;
        if (!panel)
            return;
        const host = this.host.nativeElement;
        const anchor = host.getBoundingClientRect();
        const width = panel.offsetWidth;
        const viewport = host.ownerDocument.documentElement.clientWidth;
        const rtl = getComputedStyle(host).direction === 'rtl';
        const left = rtl ? anchor.right - width : anchor.left;
        const furthest = Math.max(VIEWPORT_MARGIN, viewport - VIEWPORT_MARGIN - width);
        const placed = Math.min(Math.max(left, VIEWPORT_MARGIN), furthest);
        this.shift.set(Math.round(placed - left));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsRichTooltipComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsRichTooltipComponent, isStandalone: true, selector: "nxs-rich-tooltip", inputs: { heading: { classPropertyName: "heading", publicName: "heading", isSignal: true, isRequired: true, transformFunction: null }, content: { classPropertyName: "content", publicName: "content", isSignal: true, isRequired: true, transformFunction: null }, triggerLabel: { classPropertyName: "triggerLabel", publicName: "triggerLabel", isSignal: true, isRequired: true, transformFunction: null }, icon: { classPropertyName: "icon", publicName: "icon", isSignal: true, isRequired: false, transformFunction: null } }, host: { listeners: { "document:keydown.escape": "onEscape()", "document:pointerup": "onPressEnd()", "document:pointercancel": "onPressEnd()", "focusout": "onFocusOut($event)", "pointerenter": "onPointerEnter($event)", "pointerleave": "onPointerLeave($event)" }, classAttribute: "nxs-rich-tooltip" }, viewQueries: [{ propertyName: "trigger", first: true, predicate: ["trigger"], descendants: true, read: ElementRef, isSignal: true }, { propertyName: "panel", first: true, predicate: ["panel"], descendants: true, read: ElementRef, isSignal: true }], ngImport: i0, template: "<button\n  #trigger\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-rich-tooltip__trigger\"\n  [attr.aria-label]=\"triggerLabel()\"\n  [attr.aria-expanded]=\"open()\"\n  [attr.aria-controls]=\"panelId\"\n  (pointerdown)=\"onPointerDown()\"\n  (focus)=\"onFocus()\"\n  (click)=\"onClick()\"\n>\n  <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n</button>\n<div class=\"nxs-rich-tooltip__live\" role=\"status\">\n  @if (open()) {\n    <div\n      #panel\n      class=\"nxs-rich-tooltip__panel\"\n      [id]=\"panelId\"\n      [style.translate.px]=\"shift() || null\"\n    >\n      <p class=\"nxs-rich-tooltip__heading\">{{ heading() }}</p>\n      <p class=\"nxs-rich-tooltip__content\">{{ content() }}</p>\n    </div>\n  }\n</div>\n", styles: [":host{position:relative;display:inline-block}.nxs-rich-tooltip__panel{position:absolute;inset-block-start:100%;inset-inline-start:0;z-index:10;box-sizing:border-box;inline-size:max-content;max-inline-size:min(320px,100vw - 16px);padding:12px 16px;overflow-wrap:anywhere;border-radius:8px;background:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface-variant);box-shadow:var(--mat-sys-level2)}.nxs-rich-tooltip__heading{margin:0 0 4px;font:var(--mat-sys-title-small);color:var(--mat-sys-on-surface)}.nxs-rich-tooltip__content{margin:0;font:var(--mat-sys-body-medium)}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsRichTooltipComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-rich-tooltip', standalone: true, imports: [MatButtonModule, MatIconModule], changeDetection: ChangeDetectionStrategy.OnPush, host: {
                        class: 'nxs-rich-tooltip',
                        '(document:keydown.escape)': 'onEscape()',
                        '(document:pointerup)': 'onPressEnd()',
                        '(document:pointercancel)': 'onPressEnd()',
                        '(focusout)': 'onFocusOut($event)',
                        '(pointerenter)': 'onPointerEnter($event)',
                        '(pointerleave)': 'onPointerLeave($event)',
                    }, template: "<button\n  #trigger\n  mat-icon-button\n  type=\"button\"\n  class=\"nxs-rich-tooltip__trigger\"\n  [attr.aria-label]=\"triggerLabel()\"\n  [attr.aria-expanded]=\"open()\"\n  [attr.aria-controls]=\"panelId\"\n  (pointerdown)=\"onPointerDown()\"\n  (focus)=\"onFocus()\"\n  (click)=\"onClick()\"\n>\n  <mat-icon aria-hidden=\"true\">{{ icon() }}</mat-icon>\n</button>\n<div class=\"nxs-rich-tooltip__live\" role=\"status\">\n  @if (open()) {\n    <div\n      #panel\n      class=\"nxs-rich-tooltip__panel\"\n      [id]=\"panelId\"\n      [style.translate.px]=\"shift() || null\"\n    >\n      <p class=\"nxs-rich-tooltip__heading\">{{ heading() }}</p>\n      <p class=\"nxs-rich-tooltip__content\">{{ content() }}</p>\n    </div>\n  }\n</div>\n", styles: [":host{position:relative;display:inline-block}.nxs-rich-tooltip__panel{position:absolute;inset-block-start:100%;inset-inline-start:0;z-index:10;box-sizing:border-box;inline-size:max-content;max-inline-size:min(320px,100vw - 16px);padding:12px 16px;overflow-wrap:anywhere;border-radius:8px;background:var(--mat-sys-surface-container);color:var(--mat-sys-on-surface-variant);box-shadow:var(--mat-sys-level2)}.nxs-rich-tooltip__heading{margin:0 0 4px;font:var(--mat-sys-title-small);color:var(--mat-sys-on-surface)}.nxs-rich-tooltip__content{margin:0;font:var(--mat-sys-body-medium)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { heading: [{ type: i0.Input, args: [{ isSignal: true, alias: "heading", required: true }] }], content: [{ type: i0.Input, args: [{ isSignal: true, alias: "content", required: true }] }], triggerLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "triggerLabel", required: true }] }], icon: [{ type: i0.Input, args: [{ isSignal: true, alias: "icon", required: false }] }], trigger: [{ type: i0.ViewChild, args: ['trigger', { ...{
                            read: (ElementRef),
                        }, isSignal: true }] }], panel: [{ type: i0.ViewChild, args: ['panel', { ...{ read: (ElementRef) }, isSignal: true }] }] } });

// satori:import:components — `satori-component` inserts above this line
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
function provideNxsComponents() {
    return provideSatoriExtensions({
        components: {
            [NXS_PRIMITIVE_IDS.avatar]: NxsAvatarComponent,
            [NXS_PRIMITIVE_IDS.breadcrumbs]: NxsBreadcrumbsComponent,
            [NXS_PRIMITIVE_IDS.tag]: NxsTagComponent,
            [NXS_PRIMITIVE_IDS.richTooltip]: NxsRichTooltipComponent,
            [NXS_PRIMITIVE_IDS.errorState]: NxsErrorStateComponent,
            // satori:register:components — `satori-component` inserts above this line
        },
    });
}

/** No filter set. */
const NXS_EMPTY_SEARCH_FILTERS = Object.freeze({
    fulltext: '',
    modified: [],
    authors: [],
    collections: [],
    tags: [],
    nature: [],
    subjects: [],
    coverage: [],
    size: [],
    query: '',
});
/** The `dc_modified_agg` buckets `default_search` defines, in the order they are offered. */
const NXS_MODIFIED_RANGES = [
    'last24h',
    'lastWeek',
    'lastMonth',
    'lastYear',
    'priorToLastYear',
];
/** The `common_size_agg` buckets `default_search` defines, in the order they are offered. */
const NXS_SIZE_RANGES = ['tiny', 'small', 'medium', 'big', 'huge'];
/**
 * The filters as the record a host keeps them in — `SearchAggregationService.drawerFilters` — with
 * a multi-value field as a JSON array, so a value containing a comma stays one value, and an empty
 * field left out.
 */
function nxsSearchFiltersToRecord(filters) {
    const record = {};
    const put = (key, value) => {
        if (typeof value === 'string') {
            if (value.trim())
                record[key] = value.trim();
            return;
        }
        const list = uniqueValues(value);
        if (list.length > 0)
            record[key] = JSON.stringify(list);
    };
    put('q', filters.query);
    put('ecm_fulltext', filters.fulltext);
    put('modifiedDate', filters.modified);
    put('nature', filters.nature);
    put('subjects', filters.subjects);
    put('coverage', filters.coverage);
    put('size', filters.size);
    put('author', filters.authors);
    put('collection', filters.collections);
    put('tag', filters.tags);
    return record;
}
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
function nxsSearchFiltersToSavedParams(filters) {
    const params = {};
    const values = (key, value) => {
        params[key] = JSON.stringify(uniqueValues(value));
    };
    if (filters.query.trim())
        params['q'] = filters.query.trim();
    params['ecm_fulltext'] = filters.fulltext.trim();
    values('dc_modified_agg', filters.modified);
    values('dc_creator_agg', filters.authors);
    values('ecm_collections', filters.collections);
    values('ecm_tags', filters.tags);
    values('dc_nature_agg', filters.nature);
    values('dc_subjects_agg', filters.subjects);
    values('dc_coverage_agg', filters.coverage);
    values('common_size_agg', filters.size);
    return params;
}
/**
 * The keys {@link nxsSearchFiltersFromParams} falls back to when the page provider's own is empty —
 * the names earlier saved searches were written under, and `default_search`'s other parameters for
 * the same fields — each with the value that clears it.
 */
const FALLBACK_PARAMS = {
    ecmFulltext: '',
    modifiedDate: '',
    dc_modified: '[]',
    author: '',
    dc_creator: '[]',
    collection: '',
    collection_agg: '[]',
    tag: '',
    nature: '',
    dc_nature: '[]',
    dc_subjects: '[]',
    coverage: '',
    dc_coverage: '[]',
    common_size: '[]',
};
/**
 * The params that clear every fallback key a saved search was read with, to send beside
 * {@link nxsSearchFiltersToSavedParams} when it is saved again.
 *
 * The server merges an update into the stored params, so a search saved under an earlier name
 * (`author: "alice"`) kept that key: with its author removed and saved, it read back from the old key
 * and the author returned. Once saved, the page provider's own key holds the value.
 */
function nxsSavedParamsToClear(loaded) {
    const clear = {};
    for (const [key, cleared] of Object.entries(FALLBACK_PARAMS)) {
        for (const candidate of [key, `defaults:${key}`]) {
            const value = loaded?.[candidate];
            const empty = value === undefined ||
                value === null ||
                value === '' ||
                value === '[]' ||
                (Array.isArray(value) && value.length === 0);
            if (!empty)
                clear[candidate] = cleared;
        }
    }
    return clear;
}
/** The filters as `SearchService.search`'s parameters, with the page's quick filters and sort. */
function nxsSearchFiltersToQuery(filters, page = {}) {
    const query = {};
    const record = nxsSearchFiltersToRecord(filters);
    if (record['q'])
        query.q = record['q'];
    if (record['ecm_fulltext'])
        query.ecmFulltext = record['ecm_fulltext'];
    if (record['modifiedDate'])
        query.modifiedDate = record['modifiedDate'];
    if (record['author'])
        query.author = record['author'];
    if (record['collection'])
        query.collection = record['collection'];
    if (record['tag'])
        query.tag = record['tag'];
    if (record['nature'])
        query.nature = record['nature'];
    if (record['subjects'])
        query.subjects = record['subjects'];
    if (record['coverage'])
        query.coverage = record['coverage'];
    if (record['size'])
        query.size = record['size'];
    if (page.quickFilters?.trim())
        query.quickFilters = page.quickFilters.trim();
    if (page.sortBy)
        query.sortBy = page.sortBy;
    if (page.sortOrder)
        query.sortOrder = page.sortOrder;
    return query;
}
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
function nxsSearchFiltersFromParams(params) {
    const source = params ?? {};
    const raw = (key) => {
        for (const candidate of [key, `defaults:${key}`]) {
            const value = source[candidate];
            if (value !== undefined && value !== null)
                return value;
        }
        return undefined;
    };
    const list = (...keys) => {
        for (const key of keys) {
            const values = toValues(raw(key));
            if (values.length > 0)
                return uniqueValues(values);
        }
        return [];
    };
    const text = (...keys) => {
        for (const key of keys) {
            const value = raw(key);
            if (typeof value === 'string' && value.trim())
                return value.trim();
        }
        return '';
    };
    return {
        query: text('q', 'query'),
        fulltext: text('ecm_fulltext', 'ecmFulltext'),
        modified: uniqueValues(list('dc_modified_agg', 'modifiedDate', 'dc_modified').map((value) => MODIFIED_ALIASES[value] ?? value)),
        authors: list('dc_creator_agg', 'dc_creator', 'author'),
        collections: list('ecm_collections', 'collection_agg', 'collection'),
        tags: list('ecm_tags', 'tag'),
        nature: list('dc_nature_agg', 'nature', 'dc_nature'),
        subjects: list('dc_subjects_agg', 'subjects', 'dc_subjects'),
        coverage: list('dc_coverage_agg', 'coverage', 'dc_coverage'),
        size: list('common_size_agg', 'common_size', 'size'),
    };
}
/** Whether any filter is set. */
function nxsHasSearchFilters(filters) {
    return Object.keys(nxsSearchFiltersToRecord(filters)).length > 0;
}
/**
 * Code-unit order, for a key that compares two sets of values rather than an order anyone reads.
 * A locale's collation ties different values (`é` as one character, or as `e` and a combining
 * accent), and a tie keeps the input order, so one set given in two orders would not match.
 */
const byCodeUnit = (a, b) => (a < b ? -1 : Number(a > b));
/** Whether two sets of filters ask for the same results: the order within a field does not count. */
function nxsSameSearchFilters(a, b) {
    const sorted = (values) => uniqueValues(values).sort(byCodeUnit);
    const canonical = (filters) => JSON.stringify([
        filters.query.trim(),
        filters.fulltext.trim(),
        sorted(filters.authors),
        sorted(filters.collections),
        sorted(filters.tags),
        sorted(filters.modified),
        sorted(filters.nature),
        sorted(filters.subjects),
        sorted(filters.coverage),
        sorted(filters.size),
    ]);
    return canonical(a) === canonical(b);
}
/**
 * The choices for a range filter: every range, in order, with the server's count for it.
 *
 * Every range is offered whatever the counts, as Web UI's checkbox aggregation does, so a range that
 * is selected but now empty can still be cleared.
 */
function nxsRangeOptions(ranges, aggregation) {
    const counts = bucketCounts(aggregation);
    return ranges.map((value) => ({ value, count: counts.get(value) ?? null }));
}
/**
 * The choices for a terms filter: the server's buckets with results, then any selected value the
 * server no longer returns, so it can be cleared.
 */
function nxsTermOptions(aggregation, selected) {
    const options = [];
    const seen = new Set();
    for (const bucket of aggregation?.buckets ?? []) {
        if (!bucket.key || seen.has(bucket.key) || bucket.docCount <= 0)
            continue;
        seen.add(bucket.key);
        options.push({ value: bucket.key, count: bucket.docCount });
    }
    for (const value of selected) {
        if (seen.has(value))
            continue;
        seen.add(value);
        options.push({ value, count: null });
    }
    return options;
}
const MODIFIED_ALIASES = { moreThan1YearAgo: 'priorToLastYear' };
function bucketCounts(aggregation) {
    const counts = new Map();
    for (const bucket of aggregation?.buckets ?? [])
        counts.set(bucket.key, bucket.docCount);
    return counts;
}
function uniqueValues(values) {
    return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
/** The values in a saved parameter: an array, a JSON array in a string, or a comma-separated string. */
function toValues(value) {
    if (Array.isArray(value)) {
        return value.flatMap((entry) => {
            if (typeof entry === 'string' || typeof entry === 'number')
                return [String(entry)];
            if (entry && typeof entry === 'object') {
                const record = entry;
                const id = typeof record['id'] === 'string' ? record['id'] : record['uid'];
                if (typeof id === 'string')
                    return [id];
            }
            return [];
        });
    }
    if (typeof value !== 'string')
        return [];
    const text = value.trim();
    if (!text)
        return [];
    if (text.startsWith('[')) {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed))
                return toValues(parsed);
        }
        catch {
            // Not JSON: read it as a comma-separated list below.
        }
    }
    return text.split(',');
}

const MODIFIED_LABEL_KEYS = {
    last24h: 'satori-components.search-filters.modified.last24h',
    lastWeek: 'satori-components.search-filters.modified.last-week',
    lastMonth: 'satori-components.search-filters.modified.last-month',
    lastYear: 'satori-components.search-filters.modified.last-year',
    priorToLastYear: 'satori-components.search-filters.modified.prior-to-last-year',
};
const SIZE_LABEL_KEYS = {
    tiny: 'satori-components.search-filters.size.tiny',
    small: 'satori-components.search-filters.size.small',
    medium: 'satori-components.search-filters.size.medium',
    big: 'satori-components.search-filters.size.big',
    huge: 'satori-components.search-filters.size.huge',
};
let nextId$1 = 0;
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
class NxsSearchFiltersComponent {
    /** The filters shown. Two-way: every change the user makes is written back. */
    filters = model(NXS_EMPTY_SEARCH_FILTERS, ...(ngDevMode ? [{ debugName: "filters" }] : []));
    /** The server's aggregates for the query the filters produce: each choice's count. */
    aggregations = input({}, ...(ngDevMode ? [{ debugName: "aggregations" }] : []));
    /**
     * The text shown for a choice, by field and bucket key: the vocabulary label of a nature, subject
     * or coverage id. A choice with no label shows its key. `filters` always keeps the key, so a
     * label never reaches a query or a saved search.
     */
    optionLabels = input({}, ...(ngDevMode ? [{ debugName: "optionLabels" }] : []));
    /** Reset was pressed: the filters are now empty. A host clears what it keeps beside them. */
    filtersReset = output();
    /** Save as was pressed: the host asks for a name and saves the current filters. */
    saveAs = output();
    searchService = inject(SearchService);
    destroyRef = inject(DestroyRef);
    ids = (() => {
        const base = `nxs-search-filters-${nextId$1++}`;
        return {
            fulltext: `${base}-fulltext`,
            authors: `${base}-authors`,
            collections: `${base}-collections`,
            tags: `${base}-tags`,
            group: (field) => `${base}-${field}`,
        };
    })();
    hasFilters = computed(() => nxsHasSearchFilters(this.filters()), ...(ngDevMode ? [{ debugName: "hasFilters" }] : []));
    /** What the full-text box holds; it reaches `filters` on Enter. */
    fulltextDraft = signal('', ...(ngDevMode ? [{ debugName: "fulltextDraft" }] : []));
    authorText = signal('', ...(ngDevMode ? [{ debugName: "authorText" }] : []));
    collectionText = signal('', ...(ngDevMode ? [{ debugName: "collectionText" }] : []));
    tagText = signal('', ...(ngDevMode ? [{ debugName: "tagText" }] : []));
    /** Which collapsible groups are open. Modification date starts open, as in Web UI. */
    expanded = signal(new Set(['modified']), ...(ngDevMode ? [{ debugName: "expanded" }] : []));
    groups = computed(() => {
        const filters = this.filters();
        const aggregations = this.aggregations();
        return {
            before: [
                {
                    field: 'modified',
                    titleKey: 'satori-components.search-filters.modified.title',
                    options: nxsRangeOptions(NXS_MODIFIED_RANGES, aggregations.dc_modified_agg),
                    labelKeys: MODIFIED_LABEL_KEYS,
                },
            ],
            after: [
                {
                    field: 'nature',
                    titleKey: 'satori-components.search-filters.nature',
                    options: nxsTermOptions(aggregations.dc_nature_agg, filters.nature),
                },
                {
                    field: 'subjects',
                    titleKey: 'satori-components.search-filters.subjects',
                    options: nxsTermOptions(aggregations.dc_subjects_agg, filters.subjects),
                },
                {
                    field: 'coverage',
                    titleKey: 'satori-components.search-filters.coverage',
                    options: nxsTermOptions(aggregations.dc_coverage_agg, filters.coverage),
                },
                {
                    field: 'size',
                    titleKey: 'satori-components.search-filters.size.title',
                    options: nxsRangeOptions(NXS_SIZE_RANGES, aggregations.common_size_agg),
                    labelKeys: SIZE_LABEL_KEYS,
                },
            ],
        };
    }, ...(ngDevMode ? [{ debugName: "groups" }] : []));
    /** The authors the server counted for this query, not yet chosen, narrowed by what is typed. */
    authorOptions = computed(() => {
        const term = this.authorText().trim().toLowerCase();
        const chosen = this.filters().authors;
        return nxsTermOptions(this.aggregations().dc_creator_agg, []).filter((option) => !chosen.includes(option.value) && (!term || option.value.toLowerCase().includes(term)));
    }, ...(ngDevMode ? [{ debugName: "authorOptions" }] : []));
    collections = signal([], ...(ngDevMode ? [{ debugName: "collections" }] : []));
    collectionsState = signal('idle', ...(ngDevMode ? [{ debugName: "collectionsState" }] : []));
    collectionOptions = computed(() => {
        const term = this.collectionText().trim().toLowerCase();
        const chosen = this.filters().collections;
        return this.collections().filter((option) => !chosen.includes(option.id) && (!term || option.title.toLowerCase().includes(term)));
    }, ...(ngDevMode ? [{ debugName: "collectionOptions" }] : []));
    /** A choice leaves its box empty: it is shown as a chip below it. */
    emptyDisplay = () => '';
    tagSuggestions = signal([], ...(ngDevMode ? [{ debugName: "tagSuggestions" }] : []));
    tagOptions = computed(() => this.tagSuggestions().filter((label) => !this.filters().tags.includes(label)), ...(ngDevMode ? [{ debugName: "tagOptions" }] : []));
    tagTerms = new Subject();
    constructor() {
        // What the boxes show follows the filters whenever they change, from here or from the host.
        effect(() => {
            const filters = this.filters();
            untracked(() => {
                this.fulltextDraft.set(filters.fulltext);
                this.expandSelected(filters);
                // Chosen collections are shown by title, which needs the user's collections.
                if (filters.collections.length > 0 && this.collectionsState() === 'idle') {
                    this.loadCollections();
                }
            });
        });
        this.tagTerms
            .pipe(debounceTime(200), distinctUntilChanged(), switchMap((term) => this.searchService.getTagSuggestions(term)), takeUntilDestroyed())
            .subscribe((labels) => this.tagSuggestions.set(labels));
    }
    isExpanded(field) {
        return this.expanded().has(field);
    }
    toggleGroup(field) {
        this.expanded.update((current) => {
            const next = new Set(current);
            if (next.has(field))
                next.delete(field);
            else
                next.add(field);
            return next;
        });
    }
    isChecked(field, value) {
        return this.filters()[field].includes(value);
    }
    toggleOption(field, value) {
        const current = this.filters()[field];
        const next = current.includes(value)
            ? current.filter((entry) => entry !== value)
            : [...current, value];
        this.update({ [field]: next });
    }
    optionLabelKey(group, value) {
        return group.labelKeys?.[value] ?? null;
    }
    optionText(group, value) {
        // An own key only: `constructor` or `__proto__` is a bucket key too, not an inherited property.
        const labels = this.optionLabels()[group.field];
        return labels && Object.prototype.hasOwnProperty.call(labels, value) ? labels[value] : value;
    }
    applyFulltext() {
        this.update({ fulltext: this.fulltextDraft().trim() });
    }
    clearFulltext() {
        this.fulltextDraft.set('');
        this.update({ fulltext: '' });
    }
    addChoice(field, value) {
        const text = { authors: this.authorText, collections: this.collectionText, tags: this.tagText };
        text[field].set('');
        if (field === 'tags')
            this.tagSuggestions.set([]);
        if (!value || this.filters()[field].includes(value))
            return;
        this.update({ [field]: [...this.filters()[field], value] });
    }
    removeChoice(field, value) {
        this.update({ [field]: this.filters()[field].filter((entry) => entry !== value) });
    }
    onCollectionsFocus() {
        if (this.collectionsState() === 'loading' || this.collectionsState() === 'loaded')
            return;
        this.loadCollections();
    }
    loadCollections() {
        this.collectionsState.set('loading');
        this.searchService
            .getUserCollections()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (collections) => {
                this.collections.set(collections);
                this.collectionsState.set('loaded');
            },
            error: () => this.collectionsState.set('failed'),
        });
    }
    onTagInput(value) {
        this.tagText.set(value);
        this.tagTerms.next(value.trim());
        if (!value.trim())
            this.tagSuggestions.set([]);
    }
    resetFilters() {
        this.filters.set(NXS_EMPTY_SEARCH_FILTERS);
        this.filtersReset.emit();
    }
    /** The title a collection id is shown with, once the user's collections are known. */
    collectionTitle(id) {
        return this.collections().find((option) => option.id === id)?.title ?? id;
    }
    update(change) {
        this.filters.set({ ...this.filters(), ...change });
    }
    /** Opens every group that has a selection, so a loaded saved search shows what it filters on. */
    expandSelected(filters) {
        const selected = ['modified', 'nature', 'subjects', 'coverage', 'size'].filter((field) => filters[field].length > 0);
        if (selected.every((field) => this.expanded().has(field)))
            return;
        this.expanded.update((current) => new Set([...current, ...selected]));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSearchFiltersComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsSearchFiltersComponent, isStandalone: true, selector: "nxs-search-filters", inputs: { filters: { classPropertyName: "filters", publicName: "filters", isSignal: true, isRequired: false, transformFunction: null }, aggregations: { classPropertyName: "aggregations", publicName: "aggregations", isSignal: true, isRequired: false, transformFunction: null }, optionLabels: { classPropertyName: "optionLabels", publicName: "optionLabels", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { filters: "filtersChange", filtersReset: "filtersReset", saveAs: "saveAs" }, host: { classAttribute: "nxs-search-filters" }, ngImport: i0, template: "<div class=\"nxs-search-filters__fields\">\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.fulltext\">{{\n      'satori-components.search-filters.fulltext' | translate\n    }}</label>\n    <div class=\"nxs-search-filters__input-wrap\">\n      <input\n        class=\"nxs-search-filters__input\"\n        type=\"search\"\n        [id]=\"ids.fulltext\"\n        [placeholder]=\"'satori-components.search-filters.fulltext-placeholder' | translate\"\n        [value]=\"fulltextDraft()\"\n        (input)=\"fulltextDraft.set($any($event.target).value)\"\n        (keydown.enter)=\"applyFulltext()\"\n      />\n      @if (fulltextDraft().trim()) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          class=\"nxs-search-filters__clear\"\n          [attr.aria-label]=\"'satori-components.search-filters.clear-fulltext' | translate\"\n          (click)=\"clearFulltext()\"\n        >\n          <mat-icon aria-hidden=\"true\">close</mat-icon>\n        </button>\n      }\n    </div>\n  </div>\n\n  @for (group of groups().before; track group.field) {\n    <ng-container\n      [ngTemplateOutlet]=\"checkboxGroup\"\n      [ngTemplateOutletContext]=\"{ $implicit: group }\"\n    />\n  }\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.authors\">{{\n      'satori-components.search-filters.authors' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.authors\"\n      [placeholder]=\"'satori-components.search-filters.authors-placeholder' | translate\"\n      [value]=\"authorText()\"\n      [matAutocomplete]=\"authorsPanel\"\n      (input)=\"authorText.set($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #authorsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('authors', $event.option.value)\"\n    >\n      @for (option of authorOptions(); track option.value) {\n        <mat-option [value]=\"option.value\">{{ option.value }} ({{ option.count }})</mat-option>\n      } @empty {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.no-results' | translate\n        }}</mat-option>\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'authors',\n        values: filters().authors,\n        titleKey: 'satori-components.search-filters.chosen-authors',\n      }\"\n    />\n  </div>\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.collections\">{{\n      'satori-components.search-filters.collections' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.collections\"\n      [placeholder]=\"'satori-components.search-filters.collections-placeholder' | translate\"\n      [value]=\"collectionText()\"\n      [matAutocomplete]=\"collectionsPanel\"\n      (focus)=\"onCollectionsFocus()\"\n      (input)=\"collectionText.set($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #collectionsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('collections', $event.option.value)\"\n    >\n      @if (collectionsState() === 'loading') {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.loading-collections' | translate\n        }}</mat-option>\n      } @else if (collectionsState() === 'failed') {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.collections-failed' | translate\n        }}</mat-option>\n      } @else {\n        @for (option of collectionOptions(); track option.id) {\n          <mat-option [value]=\"option.id\">{{ option.title }} ({{ option.itemCount }})</mat-option>\n        } @empty {\n          <mat-option disabled class=\"nxs-search-filters__hint\">{{\n            'satori-components.search-filters.no-results' | translate\n          }}</mat-option>\n        }\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'collections',\n        values: filters().collections,\n        titleKey: 'satori-components.search-filters.chosen-collections',\n      }\"\n    />\n  </div>\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.tags\">{{\n      'satori-components.search-filters.tags' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.tags\"\n      [placeholder]=\"'satori-components.search-filters.tags-placeholder' | translate\"\n      [value]=\"tagText()\"\n      [matAutocomplete]=\"tagsPanel\"\n      (input)=\"onTagInput($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #tagsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('tags', $event.option.value)\"\n    >\n      @if (!tagText().trim()) {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.tags-hint' | translate\n        }}</mat-option>\n      } @else {\n        @for (label of tagOptions(); track label) {\n          <mat-option [value]=\"label\">{{ label }}</mat-option>\n        } @empty {\n          <mat-option disabled class=\"nxs-search-filters__hint\">{{\n            'satori-components.search-filters.no-results-for'\n              | translate: { term: tagText().trim() }\n          }}</mat-option>\n        }\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'tags',\n        values: filters().tags,\n        titleKey: 'satori-components.search-filters.chosen-tags',\n      }\"\n    />\n  </div>\n\n  @for (group of groups().after; track group.field) {\n    <ng-container\n      [ngTemplateOutlet]=\"checkboxGroup\"\n      [ngTemplateOutletContext]=\"{ $implicit: group }\"\n    />\n  }\n</div>\n\n<div class=\"nxs-search-filters__footer\">\n  <button mat-stroked-button type=\"button\" [disabled]=\"!hasFilters()\" (click)=\"resetFilters()\">\n    {{ 'satori-components.search-filters.reset' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    type=\"button\"\n    [disabled]=\"!hasFilters()\"\n    (click)=\"saveAs.emit()\"\n  >\n    {{ 'satori-components.search-filters.save-as' | translate }}\n  </button>\n</div>\n\n<ng-template #chips let-field=\"field\" let-values=\"values\" let-titleKey=\"titleKey\">\n  @if (values.length > 0) {\n    <mat-chip-set class=\"nxs-search-filters__chips\" [attr.aria-label]=\"titleKey | translate\">\n      @for (value of values; track value) {\n        <mat-chip (removed)=\"removeChoice(field, value)\">\n          {{ field === 'collections' ? collectionTitle(value) : value }}\n          <button\n            matChipRemove\n            type=\"button\"\n            [attr.aria-label]=\"\n              'satori-components.search-filters.remove'\n                | translate: { value: field === 'collections' ? collectionTitle(value) : value }\n            \"\n          >\n            <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n          </button>\n        </mat-chip>\n      }\n    </mat-chip-set>\n  }\n</ng-template>\n\n<ng-template #checkboxGroup let-group>\n  <div class=\"nxs-search-filters__field\">\n    <button\n      type=\"button\"\n      class=\"nxs-search-filters__toggle\"\n      [id]=\"ids.group(group.field) + '-toggle'\"\n      [attr.aria-expanded]=\"isExpanded(group.field)\"\n      [attr.aria-controls]=\"ids.group(group.field)\"\n      (click)=\"toggleGroup(group.field)\"\n    >\n      <span>{{ group.titleKey | translate }}</span>\n      <mat-icon aria-hidden=\"true\">{{\n        isExpanded(group.field) ? 'expand_less' : 'expand_more'\n      }}</mat-icon>\n    </button>\n    @if (isExpanded(group.field)) {\n      <div\n        class=\"nxs-search-filters__options\"\n        role=\"group\"\n        [id]=\"ids.group(group.field)\"\n        [attr.aria-labelledby]=\"ids.group(group.field) + '-toggle'\"\n      >\n        @for (option of group.options; track option.value) {\n          <mat-checkbox\n            class=\"nxs-search-filters__checkbox\"\n            [checked]=\"isChecked(group.field, option.value)\"\n            (change)=\"toggleOption(group.field, option.value)\"\n          >\n            @if (optionLabelKey(group, option.value); as key) {\n              {{ key | translate }}\n            } @else {\n              {{ optionText(group, option.value) }}\n            }\n            @if (option.count !== null) {\n              <span class=\"nxs-search-filters__count\">({{ option.count }})</span>\n            }\n          </mat-checkbox>\n        } @empty {\n          <p class=\"nxs-search-filters__empty\">\n            {{ 'satori-components.search-filters.no-available-results' | translate }}\n          </p>\n        }\n      </div>\n    }\n  </div>\n</ng-template>\n", styles: [":host{display:flex;flex-direction:column;min-height:0}.nxs-search-filters__fields{flex:1;overflow-y:auto;padding:8px 0}.nxs-search-filters__field{padding:10px 16px 12px;border-bottom:1px solid var(--mat-sys-outline-variant, currentColor)}.nxs-search-filters__title{display:block;margin:0 0 6px;font:var(--mat-sys-label-large, inherit);color:var(--mat-sys-on-surface, inherit)}.nxs-search-filters__input-wrap{position:relative;display:flex;align-items:center}.nxs-search-filters__input{box-sizing:border-box;width:100%;padding:6px 8px;border:1px solid var(--mat-sys-outline, currentColor);border-radius:4px;background:var(--mat-sys-surface, transparent);color:var(--mat-sys-on-surface, inherit);font:var(--mat-sys-body-medium, inherit)}.nxs-search-filters__input:focus{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-search-filters__input:focus-visible{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-search-filters__input::placeholder{color:var(--mat-sys-on-surface-variant, inherit)}.nxs-search-filters__input::-webkit-search-cancel-button{appearance:none}.nxs-search-filters__clear{position:absolute;right:0}.nxs-search-filters__toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0;border:none;background:none;color:var(--mat-sys-on-surface, inherit);font:var(--mat-sys-label-large, inherit);text-align:left;cursor:pointer}.nxs-search-filters__toggle:focus{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:2px}.nxs-search-filters__toggle:focus-visible{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:2px}.nxs-search-filters__options{display:flex;flex-direction:column;padding-top:4px}.nxs-search-filters__count{margin-left:4px;color:var(--mat-sys-on-surface-variant, inherit)}.nxs-search-filters__empty{margin:4px 0 0;font:var(--mat-sys-body-small, inherit);color:var(--mat-sys-on-surface-variant, inherit)}.nxs-search-filters__footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--mat-sys-outline-variant, currentColor)}.nxs-search-filters__chips{display:block;margin-top:6px}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatCheckboxModule }, { kind: "component", type: i2$1.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "aria-expanded", "aria-controls", "aria-owns", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "disabledInteractive", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "ngmodule", type: MatChipsModule }, { kind: "component", type: i4$2.MatChip, selector: "mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]", inputs: ["role", "id", "aria-label", "aria-description", "value", "color", "removable", "highlighted", "disableRipple", "disabled"], outputs: ["removed", "destroyed"], exportAs: ["matChip"] }, { kind: "directive", type: i4$2.MatChipRemove, selector: "[matChipRemove]" }, { kind: "component", type: i4$2.MatChipSet, selector: "mat-chip-set", inputs: ["disabled", "role", "tabIndex"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: NgTemplateOutlet, selector: "[ngTemplateOutlet]", inputs: ["ngTemplateOutletContext", "ngTemplateOutlet", "ngTemplateOutletInjector"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSearchFiltersComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-search-filters', standalone: true, imports: [
                        MatAutocompleteModule,
                        MatButtonModule,
                        MatCheckboxModule,
                        MatChipsModule,
                        MatIconModule,
                        NgTemplateOutlet,
                        TranslatePipe,
                    ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-search-filters' }, template: "<div class=\"nxs-search-filters__fields\">\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.fulltext\">{{\n      'satori-components.search-filters.fulltext' | translate\n    }}</label>\n    <div class=\"nxs-search-filters__input-wrap\">\n      <input\n        class=\"nxs-search-filters__input\"\n        type=\"search\"\n        [id]=\"ids.fulltext\"\n        [placeholder]=\"'satori-components.search-filters.fulltext-placeholder' | translate\"\n        [value]=\"fulltextDraft()\"\n        (input)=\"fulltextDraft.set($any($event.target).value)\"\n        (keydown.enter)=\"applyFulltext()\"\n      />\n      @if (fulltextDraft().trim()) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          class=\"nxs-search-filters__clear\"\n          [attr.aria-label]=\"'satori-components.search-filters.clear-fulltext' | translate\"\n          (click)=\"clearFulltext()\"\n        >\n          <mat-icon aria-hidden=\"true\">close</mat-icon>\n        </button>\n      }\n    </div>\n  </div>\n\n  @for (group of groups().before; track group.field) {\n    <ng-container\n      [ngTemplateOutlet]=\"checkboxGroup\"\n      [ngTemplateOutletContext]=\"{ $implicit: group }\"\n    />\n  }\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.authors\">{{\n      'satori-components.search-filters.authors' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.authors\"\n      [placeholder]=\"'satori-components.search-filters.authors-placeholder' | translate\"\n      [value]=\"authorText()\"\n      [matAutocomplete]=\"authorsPanel\"\n      (input)=\"authorText.set($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #authorsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('authors', $event.option.value)\"\n    >\n      @for (option of authorOptions(); track option.value) {\n        <mat-option [value]=\"option.value\">{{ option.value }} ({{ option.count }})</mat-option>\n      } @empty {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.no-results' | translate\n        }}</mat-option>\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'authors',\n        values: filters().authors,\n        titleKey: 'satori-components.search-filters.chosen-authors',\n      }\"\n    />\n  </div>\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.collections\">{{\n      'satori-components.search-filters.collections' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.collections\"\n      [placeholder]=\"'satori-components.search-filters.collections-placeholder' | translate\"\n      [value]=\"collectionText()\"\n      [matAutocomplete]=\"collectionsPanel\"\n      (focus)=\"onCollectionsFocus()\"\n      (input)=\"collectionText.set($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #collectionsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('collections', $event.option.value)\"\n    >\n      @if (collectionsState() === 'loading') {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.loading-collections' | translate\n        }}</mat-option>\n      } @else if (collectionsState() === 'failed') {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.collections-failed' | translate\n        }}</mat-option>\n      } @else {\n        @for (option of collectionOptions(); track option.id) {\n          <mat-option [value]=\"option.id\">{{ option.title }} ({{ option.itemCount }})</mat-option>\n        } @empty {\n          <mat-option disabled class=\"nxs-search-filters__hint\">{{\n            'satori-components.search-filters.no-results' | translate\n          }}</mat-option>\n        }\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'collections',\n        values: filters().collections,\n        titleKey: 'satori-components.search-filters.chosen-collections',\n      }\"\n    />\n  </div>\n\n  <div class=\"nxs-search-filters__field\">\n    <label class=\"nxs-search-filters__title\" [for]=\"ids.tags\">{{\n      'satori-components.search-filters.tags' | translate\n    }}</label>\n    <input\n      class=\"nxs-search-filters__input\"\n      type=\"text\"\n      [id]=\"ids.tags\"\n      [placeholder]=\"'satori-components.search-filters.tags-placeholder' | translate\"\n      [value]=\"tagText()\"\n      [matAutocomplete]=\"tagsPanel\"\n      (input)=\"onTagInput($any($event.target).value)\"\n    />\n    <mat-autocomplete\n      #tagsPanel=\"matAutocomplete\"\n      class=\"nxs-search-filters__panel\"\n      [displayWith]=\"emptyDisplay\"\n      (optionSelected)=\"addChoice('tags', $event.option.value)\"\n    >\n      @if (!tagText().trim()) {\n        <mat-option disabled class=\"nxs-search-filters__hint\">{{\n          'satori-components.search-filters.tags-hint' | translate\n        }}</mat-option>\n      } @else {\n        @for (label of tagOptions(); track label) {\n          <mat-option [value]=\"label\">{{ label }}</mat-option>\n        } @empty {\n          <mat-option disabled class=\"nxs-search-filters__hint\">{{\n            'satori-components.search-filters.no-results-for'\n              | translate: { term: tagText().trim() }\n          }}</mat-option>\n        }\n      }\n    </mat-autocomplete>\n    <ng-container\n      [ngTemplateOutlet]=\"chips\"\n      [ngTemplateOutletContext]=\"{\n        field: 'tags',\n        values: filters().tags,\n        titleKey: 'satori-components.search-filters.chosen-tags',\n      }\"\n    />\n  </div>\n\n  @for (group of groups().after; track group.field) {\n    <ng-container\n      [ngTemplateOutlet]=\"checkboxGroup\"\n      [ngTemplateOutletContext]=\"{ $implicit: group }\"\n    />\n  }\n</div>\n\n<div class=\"nxs-search-filters__footer\">\n  <button mat-stroked-button type=\"button\" [disabled]=\"!hasFilters()\" (click)=\"resetFilters()\">\n    {{ 'satori-components.search-filters.reset' | translate }}\n  </button>\n  <button\n    mat-flat-button\n    color=\"primary\"\n    type=\"button\"\n    [disabled]=\"!hasFilters()\"\n    (click)=\"saveAs.emit()\"\n  >\n    {{ 'satori-components.search-filters.save-as' | translate }}\n  </button>\n</div>\n\n<ng-template #chips let-field=\"field\" let-values=\"values\" let-titleKey=\"titleKey\">\n  @if (values.length > 0) {\n    <mat-chip-set class=\"nxs-search-filters__chips\" [attr.aria-label]=\"titleKey | translate\">\n      @for (value of values; track value) {\n        <mat-chip (removed)=\"removeChoice(field, value)\">\n          {{ field === 'collections' ? collectionTitle(value) : value }}\n          <button\n            matChipRemove\n            type=\"button\"\n            [attr.aria-label]=\"\n              'satori-components.search-filters.remove'\n                | translate: { value: field === 'collections' ? collectionTitle(value) : value }\n            \"\n          >\n            <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n          </button>\n        </mat-chip>\n      }\n    </mat-chip-set>\n  }\n</ng-template>\n\n<ng-template #checkboxGroup let-group>\n  <div class=\"nxs-search-filters__field\">\n    <button\n      type=\"button\"\n      class=\"nxs-search-filters__toggle\"\n      [id]=\"ids.group(group.field) + '-toggle'\"\n      [attr.aria-expanded]=\"isExpanded(group.field)\"\n      [attr.aria-controls]=\"ids.group(group.field)\"\n      (click)=\"toggleGroup(group.field)\"\n    >\n      <span>{{ group.titleKey | translate }}</span>\n      <mat-icon aria-hidden=\"true\">{{\n        isExpanded(group.field) ? 'expand_less' : 'expand_more'\n      }}</mat-icon>\n    </button>\n    @if (isExpanded(group.field)) {\n      <div\n        class=\"nxs-search-filters__options\"\n        role=\"group\"\n        [id]=\"ids.group(group.field)\"\n        [attr.aria-labelledby]=\"ids.group(group.field) + '-toggle'\"\n      >\n        @for (option of group.options; track option.value) {\n          <mat-checkbox\n            class=\"nxs-search-filters__checkbox\"\n            [checked]=\"isChecked(group.field, option.value)\"\n            (change)=\"toggleOption(group.field, option.value)\"\n          >\n            @if (optionLabelKey(group, option.value); as key) {\n              {{ key | translate }}\n            } @else {\n              {{ optionText(group, option.value) }}\n            }\n            @if (option.count !== null) {\n              <span class=\"nxs-search-filters__count\">({{ option.count }})</span>\n            }\n          </mat-checkbox>\n        } @empty {\n          <p class=\"nxs-search-filters__empty\">\n            {{ 'satori-components.search-filters.no-available-results' | translate }}\n          </p>\n        }\n      </div>\n    }\n  </div>\n</ng-template>\n", styles: [":host{display:flex;flex-direction:column;min-height:0}.nxs-search-filters__fields{flex:1;overflow-y:auto;padding:8px 0}.nxs-search-filters__field{padding:10px 16px 12px;border-bottom:1px solid var(--mat-sys-outline-variant, currentColor)}.nxs-search-filters__title{display:block;margin:0 0 6px;font:var(--mat-sys-label-large, inherit);color:var(--mat-sys-on-surface, inherit)}.nxs-search-filters__input-wrap{position:relative;display:flex;align-items:center}.nxs-search-filters__input{box-sizing:border-box;width:100%;padding:6px 8px;border:1px solid var(--mat-sys-outline, currentColor);border-radius:4px;background:var(--mat-sys-surface, transparent);color:var(--mat-sys-on-surface, inherit);font:var(--mat-sys-body-medium, inherit)}.nxs-search-filters__input:focus{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-search-filters__input:focus-visible{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-search-filters__input::placeholder{color:var(--mat-sys-on-surface-variant, inherit)}.nxs-search-filters__input::-webkit-search-cancel-button{appearance:none}.nxs-search-filters__clear{position:absolute;right:0}.nxs-search-filters__toggle{display:flex;align-items:center;justify-content:space-between;width:100%;padding:0;border:none;background:none;color:var(--mat-sys-on-surface, inherit);font:var(--mat-sys-label-large, inherit);text-align:left;cursor:pointer}.nxs-search-filters__toggle:focus{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:2px}.nxs-search-filters__toggle:focus-visible{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:2px}.nxs-search-filters__options{display:flex;flex-direction:column;padding-top:4px}.nxs-search-filters__count{margin-left:4px;color:var(--mat-sys-on-surface-variant, inherit)}.nxs-search-filters__empty{margin:4px 0 0;font:var(--mat-sys-body-small, inherit);color:var(--mat-sys-on-surface-variant, inherit)}.nxs-search-filters__footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--mat-sys-outline-variant, currentColor)}.nxs-search-filters__chips{display:block;margin-top:6px}\n"] }]
        }], ctorParameters: () => [], propDecorators: { filters: [{ type: i0.Input, args: [{ isSignal: true, alias: "filters", required: false }] }, { type: i0.Output, args: ["filtersChange"] }], aggregations: [{ type: i0.Input, args: [{ isSignal: true, alias: "aggregations", required: false }] }], optionLabels: [{ type: i0.Input, args: [{ isSignal: true, alias: "optionLabels", required: false }] }], filtersReset: [{ type: i0.Output, args: ["filtersReset"] }], saveAs: [{ type: i0.Output, args: ["saveAs"] }] } });

let nextId = 0;
/**
 * The saved searches the user can open — the list at the top of Web UI's search form.
 *
 * Lists the saved searches the server returns for `pageProvider`: the user's own and those shared
 * with them. It reads the list when it is first opened and again when `refresh` changes, narrows it
 * as the user types, and emits the one chosen. Loading that search's filters is the host's job.
 */
class NxsSavedSearchSelectComponent {
    /** The saved search open now, or an empty string for none. */
    selectedId = input('', ...(ngDevMode ? [{ debugName: "selectedId" }] : []));
    /** Its title, shown in the box. */
    selectedTitle = input('', ...(ngDevMode ? [{ debugName: "selectedTitle" }] : []));
    /** The page provider whose saved searches are listed. */
    pageProvider = input('default_search', ...(ngDevMode ? [{ debugName: "pageProvider" }] : []));
    /** Change it to read the list again — after a search is saved, renamed or deleted. */
    refresh = input(0, ...(ngDevMode ? [{ debugName: "refresh" }] : []));
    /** The user chose a saved search. */
    selectedChange = output();
    searchService = inject(SearchService);
    destroyRef = inject(DestroyRef);
    inputId = `nxs-saved-search-select-${nextId++}`;
    text = signal('', ...(ngDevMode ? [{ debugName: "text" }] : []));
    searches = signal([], ...(ngDevMode ? [{ debugName: "searches" }] : []));
    state = signal('idle', ...(ngDevMode ? [{ debugName: "state" }] : []));
    /** The saved searches whose title contains what is typed, unless it is the open one's title. */
    options = computed(() => {
        const term = this.text().trim().toLowerCase();
        const all = this.searches();
        if (!term || term === this.selectedTitle().trim().toLowerCase())
            return all;
        return all.filter((search) => search.title.toLowerCase().includes(term));
    }, ...(ngDevMode ? [{ debugName: "options" }] : []));
    constructor() {
        effect(() => {
            const title = this.selectedTitle();
            untracked(() => this.text.set(title));
        });
        // A new `refresh` drops the list, so the next opening reads it again; an open panel reads now.
        let first = true;
        effect(() => {
            this.refresh();
            this.pageProvider();
            if (first) {
                first = false;
                return;
            }
            untracked(() => {
                const wasLoaded = this.state() !== 'idle';
                this.state.set('idle');
                if (wasLoaded)
                    this.load();
            });
        });
    }
    /** Reads the list, unless it is loading or already read. */
    load() {
        if (this.state() !== 'idle')
            return;
        this.state.set('loading');
        this.searchService
            .getSavedSearches(this.pageProvider())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((searches) => {
            this.searches.set(searches);
            this.state.set('loaded');
        });
    }
    onInput(value) {
        this.text.set(value);
    }
    choose(id) {
        const search = this.searches().find((entry) => entry.id === id);
        if (!search)
            return;
        this.text.set(search.title);
        this.selectedChange.emit({ id: search.id, title: search.title });
    }
    /** Puts the open search's title back when the box is left without a choice. */
    restore() {
        this.text.set(this.selectedTitle());
    }
    display = (id) => this.searches().find((entry) => entry.id === id)?.title ?? this.selectedTitle();
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSavedSearchSelectComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsSavedSearchSelectComponent, isStandalone: true, selector: "nxs-saved-search-select", inputs: { selectedId: { classPropertyName: "selectedId", publicName: "selectedId", isSignal: true, isRequired: false, transformFunction: null }, selectedTitle: { classPropertyName: "selectedTitle", publicName: "selectedTitle", isSignal: true, isRequired: false, transformFunction: null }, pageProvider: { classPropertyName: "pageProvider", publicName: "pageProvider", isSignal: true, isRequired: false, transformFunction: null }, refresh: { classPropertyName: "refresh", publicName: "refresh", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { selectedChange: "selectedChange" }, host: { classAttribute: "nxs-saved-search-select" }, ngImport: i0, template: "<label class=\"nxs-saved-search-select__label\" [for]=\"inputId\">{{\n  'satori-components.saved-search-select.label' | translate\n}}</label>\n<div class=\"nxs-saved-search-select__wrap\">\n  <input\n    class=\"nxs-saved-search-select__input\"\n    type=\"text\"\n    [id]=\"inputId\"\n    [placeholder]=\"'satori-components.saved-search-select.placeholder' | translate\"\n    [value]=\"text()\"\n    [matAutocomplete]=\"panel\"\n    (focus)=\"load()\"\n    (input)=\"onInput($any($event.target).value)\"\n  />\n  <mat-icon class=\"nxs-saved-search-select__arrow\" aria-hidden=\"true\">arrow_drop_down</mat-icon>\n</div>\n<mat-autocomplete\n  #panel=\"matAutocomplete\"\n  class=\"nxs-saved-search-select__panel\"\n  [displayWith]=\"display\"\n  (optionSelected)=\"choose($event.option.value)\"\n  (closed)=\"restore()\"\n>\n  @if (state() !== 'loaded') {\n    <mat-option disabled>{{\n      'satori-components.saved-search-select.loading' | translate\n    }}</mat-option>\n  } @else if (searches().length === 0) {\n    <mat-option disabled>{{ 'satori-components.saved-search-select.none' | translate }}</mat-option>\n  } @else {\n    @for (search of options(); track search.id) {\n      <mat-option\n        [value]=\"search.id\"\n        [class.nxs-saved-search-select__current]=\"search.id === selectedId()\"\n      >\n        <mat-icon aria-hidden=\"true\">bookmark</mat-icon>{{ search.title }}\n      </mat-option>\n    } @empty {\n      <mat-option disabled>{{\n        'satori-components.saved-search-select.no-match' | translate\n      }}</mat-option>\n    }\n  }\n</mat-autocomplete>\n", styles: [":host{display:block;min-width:0}.nxs-saved-search-select__label{display:block;margin-bottom:4px;font:var(--mat-sys-label-medium, inherit);color:var(--mat-sys-on-surface-variant, inherit)}.nxs-saved-search-select__wrap{position:relative;display:flex;align-items:center}.nxs-saved-search-select__input{box-sizing:border-box;width:100%;padding:6px 28px 6px 8px;border:1px solid var(--mat-sys-outline, currentColor);border-radius:4px;background:var(--mat-sys-surface, transparent);color:var(--mat-sys-on-surface, inherit);font:var(--mat-sys-body-medium, inherit);text-overflow:ellipsis}.nxs-saved-search-select__input:focus{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-saved-search-select__input:focus-visible{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-saved-search-select__input::placeholder{color:var(--mat-sys-on-surface-variant, inherit)}.nxs-saved-search-select__arrow{position:absolute;right:4px;pointer-events:none;color:var(--mat-sys-on-surface-variant, inherit)}\n"], dependencies: [{ kind: "ngmodule", type: MatAutocompleteModule }, { kind: "component", type: i1$4.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "component", type: i2$4.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "directive", type: i1$4.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSavedSearchSelectComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-saved-search-select', standalone: true, imports: [MatAutocompleteModule, MatIconModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-saved-search-select' }, template: "<label class=\"nxs-saved-search-select__label\" [for]=\"inputId\">{{\n  'satori-components.saved-search-select.label' | translate\n}}</label>\n<div class=\"nxs-saved-search-select__wrap\">\n  <input\n    class=\"nxs-saved-search-select__input\"\n    type=\"text\"\n    [id]=\"inputId\"\n    [placeholder]=\"'satori-components.saved-search-select.placeholder' | translate\"\n    [value]=\"text()\"\n    [matAutocomplete]=\"panel\"\n    (focus)=\"load()\"\n    (input)=\"onInput($any($event.target).value)\"\n  />\n  <mat-icon class=\"nxs-saved-search-select__arrow\" aria-hidden=\"true\">arrow_drop_down</mat-icon>\n</div>\n<mat-autocomplete\n  #panel=\"matAutocomplete\"\n  class=\"nxs-saved-search-select__panel\"\n  [displayWith]=\"display\"\n  (optionSelected)=\"choose($event.option.value)\"\n  (closed)=\"restore()\"\n>\n  @if (state() !== 'loaded') {\n    <mat-option disabled>{{\n      'satori-components.saved-search-select.loading' | translate\n    }}</mat-option>\n  } @else if (searches().length === 0) {\n    <mat-option disabled>{{ 'satori-components.saved-search-select.none' | translate }}</mat-option>\n  } @else {\n    @for (search of options(); track search.id) {\n      <mat-option\n        [value]=\"search.id\"\n        [class.nxs-saved-search-select__current]=\"search.id === selectedId()\"\n      >\n        <mat-icon aria-hidden=\"true\">bookmark</mat-icon>{{ search.title }}\n      </mat-option>\n    } @empty {\n      <mat-option disabled>{{\n        'satori-components.saved-search-select.no-match' | translate\n      }}</mat-option>\n    }\n  }\n</mat-autocomplete>\n", styles: [":host{display:block;min-width:0}.nxs-saved-search-select__label{display:block;margin-bottom:4px;font:var(--mat-sys-label-medium, inherit);color:var(--mat-sys-on-surface-variant, inherit)}.nxs-saved-search-select__wrap{position:relative;display:flex;align-items:center}.nxs-saved-search-select__input{box-sizing:border-box;width:100%;padding:6px 28px 6px 8px;border:1px solid var(--mat-sys-outline, currentColor);border-radius:4px;background:var(--mat-sys-surface, transparent);color:var(--mat-sys-on-surface, inherit);font:var(--mat-sys-body-medium, inherit);text-overflow:ellipsis}.nxs-saved-search-select__input:focus{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-saved-search-select__input:focus-visible{outline:2px solid var(--mat-sys-primary, currentColor);outline-offset:1px}.nxs-saved-search-select__input::placeholder{color:var(--mat-sys-on-surface-variant, inherit)}.nxs-saved-search-select__arrow{position:absolute;right:4px;pointer-events:none;color:var(--mat-sys-on-surface-variant, inherit)}\n"] }]
        }], ctorParameters: () => [], propDecorators: { selectedId: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedId", required: false }] }], selectedTitle: [{ type: i0.Input, args: [{ isSignal: true, alias: "selectedTitle", required: false }] }], pageProvider: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageProvider", required: false }] }], refresh: [{ type: i0.Input, args: [{ isSignal: true, alias: "refresh", required: false }] }], selectedChange: [{ type: i0.Output, args: ["selectedChange"] }] } });

/** The permission Web UI requires on a saved search before it offers to change it. */
const EDIT_PERMISSION = 'WriteProperties';
/**
 * The actions on the search being shown — Web UI's `nuxeo-saved-search-actions`.
 *
 * Offers Save as whenever there is something to save, and, on an open saved search the user may
 * change, Save (once its filters have changed), Rename, Share and Delete. Whether the user may change
 * it is the server's answer: the saved search's `WriteProperties` permission, read when it opens. A
 * search shared read-only can still be saved as a copy. It emits what was chosen; the host asks for
 * names and confirmations and sends the requests.
 */
class NxsSavedSearchActionsComponent {
    /** The saved search open now, or an empty string for none. */
    savedSearchId = input('', ...(ngDevMode ? [{ debugName: "savedSearchId" }] : []));
    /** Whether the filters differ from the open saved search's. */
    dirty = input(false, ...(ngDevMode ? [{ debugName: "dirty" }] : []));
    /** Whether any filter is set: with no saved search open, the only thing Save as can save. */
    hasFilters = input(false, ...(ngDevMode ? [{ debugName: "hasFilters" }] : []));
    /** Save the filters as a new saved search. */
    saveAs = output();
    /** Save the filters into the open saved search. */
    save = output();
    /** Rename the open saved search. */
    rename = output();
    /** Share the open saved search. */
    share = output();
    /** Delete the open saved search. */
    remove = output();
    documents = inject(DocumentDetailService);
    /**
     * Whether the user may change the open saved search: `true` only once the server has said so, so
     * Save, Rename, Share and Delete stay hidden while it is asked and when it cannot answer.
     */
    canEdit = toSignal(toObservable(this.savedSearchId).pipe(switchMap((id) => id.trim()
        ? this.documents.getDocumentPermissions(id).pipe(map((doc) => {
            const permissions = doc.contextParameters?.['permissions'];
            return Array.isArray(permissions) && permissions.includes(EDIT_PERMISSION);
        }), catchError(() => of(false)), startWith(false))
        : of(false))), { initialValue: false });
    isSaved = computed(() => this.savedSearchId().trim().length > 0, ...(ngDevMode ? [{ debugName: "isSaved" }] : []));
    showSaveAs = computed(() => this.isSaved() || this.hasFilters(), ...(ngDevMode ? [{ debugName: "showSaveAs" }] : []));
    showSave = computed(() => this.isSaved() && this.dirty() && this.canEdit(), ...(ngDevMode ? [{ debugName: "showSave" }] : []));
    showMenu = computed(() => this.isSaved() && this.canEdit(), ...(ngDevMode ? [{ debugName: "showMenu" }] : []));
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSavedSearchActionsComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
    static ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "20.3.33", type: NxsSavedSearchActionsComponent, isStandalone: true, selector: "nxs-saved-search-actions", inputs: { savedSearchId: { classPropertyName: "savedSearchId", publicName: "savedSearchId", isSignal: true, isRequired: false, transformFunction: null }, dirty: { classPropertyName: "dirty", publicName: "dirty", isSignal: true, isRequired: false, transformFunction: null }, hasFilters: { classPropertyName: "hasFilters", publicName: "hasFilters", isSignal: true, isRequired: false, transformFunction: null } }, outputs: { saveAs: "saveAs", save: "save", rename: "rename", share: "share", remove: "remove" }, host: { classAttribute: "nxs-saved-search-actions" }, ngImport: i0, template: "@if (showSaveAs()) {\n  <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"saveAs.emit()\">\n    <mat-icon aria-hidden=\"true\">bookmark_add</mat-icon>\n    {{ 'satori-components.saved-search-actions.save-as' | translate }}\n  </button>\n}\n@if (showSave()) {\n  <button mat-stroked-button type=\"button\" (click)=\"save.emit()\">\n    {{ 'satori-components.saved-search-actions.save' | translate }}\n  </button>\n}\n@if (showMenu()) {\n  <button\n    mat-icon-button\n    type=\"button\"\n    [matMenuTriggerFor]=\"menu\"\n    [attr.aria-label]=\"'satori-components.saved-search-actions.more' | translate\"\n  >\n    <mat-icon aria-hidden=\"true\">more_vert</mat-icon>\n  </button>\n  <mat-menu #menu=\"matMenu\">\n    <button mat-menu-item type=\"button\" (click)=\"rename.emit()\">\n      <mat-icon aria-hidden=\"true\">edit</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.rename' | translate }}</span>\n    </button>\n    <button mat-menu-item type=\"button\" (click)=\"share.emit()\">\n      <mat-icon aria-hidden=\"true\">share</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.share' | translate }}</span>\n    </button>\n    <button mat-menu-item type=\"button\" (click)=\"remove.emit()\">\n      <mat-icon aria-hidden=\"true\">delete</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.delete' | translate }}</span>\n    </button>\n  </mat-menu>\n}\n", styles: [":host{display:inline-flex;align-items:center;gap:8px}\n"], dependencies: [{ kind: "ngmodule", type: MatButtonModule }, { kind: "component", type: i1.MatButton, selector: "    button[matButton], a[matButton], button[mat-button], button[mat-raised-button],    button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],    a[mat-flat-button], a[mat-stroked-button]  ", inputs: ["matButton"], exportAs: ["matButton", "matAnchor"] }, { kind: "component", type: i1.MatIconButton, selector: "button[mat-icon-button], a[mat-icon-button], button[matIconButton], a[matIconButton]", exportAs: ["matButton", "matAnchor"] }, { kind: "ngmodule", type: MatIconModule }, { kind: "component", type: i2.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "ngmodule", type: MatMenuModule }, { kind: "component", type: i3.MatMenu, selector: "mat-menu", inputs: ["backdropClass", "aria-label", "aria-labelledby", "aria-describedby", "xPosition", "yPosition", "overlapTrigger", "hasBackdrop", "class", "classList"], outputs: ["closed", "close"], exportAs: ["matMenu"] }, { kind: "component", type: i3.MatMenuItem, selector: "[mat-menu-item]", inputs: ["role", "disabled", "disableRipple"], exportAs: ["matMenuItem"] }, { kind: "directive", type: i3.MatMenuTrigger, selector: "[mat-menu-trigger-for], [matMenuTriggerFor]", inputs: ["mat-menu-trigger-for", "matMenuTriggerFor", "matMenuTriggerData", "matMenuTriggerRestoreFocus"], outputs: ["menuOpened", "onMenuOpen", "menuClosed", "onMenuClose"], exportAs: ["matMenuTrigger"] }, { kind: "pipe", type: TranslatePipe, name: "translate" }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: NxsSavedSearchActionsComponent, decorators: [{
            type: Component,
            args: [{ selector: 'nxs-saved-search-actions', standalone: true, imports: [MatButtonModule, MatIconModule, MatMenuModule, TranslatePipe], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-saved-search-actions' }, template: "@if (showSaveAs()) {\n  <button mat-flat-button color=\"primary\" type=\"button\" (click)=\"saveAs.emit()\">\n    <mat-icon aria-hidden=\"true\">bookmark_add</mat-icon>\n    {{ 'satori-components.saved-search-actions.save-as' | translate }}\n  </button>\n}\n@if (showSave()) {\n  <button mat-stroked-button type=\"button\" (click)=\"save.emit()\">\n    {{ 'satori-components.saved-search-actions.save' | translate }}\n  </button>\n}\n@if (showMenu()) {\n  <button\n    mat-icon-button\n    type=\"button\"\n    [matMenuTriggerFor]=\"menu\"\n    [attr.aria-label]=\"'satori-components.saved-search-actions.more' | translate\"\n  >\n    <mat-icon aria-hidden=\"true\">more_vert</mat-icon>\n  </button>\n  <mat-menu #menu=\"matMenu\">\n    <button mat-menu-item type=\"button\" (click)=\"rename.emit()\">\n      <mat-icon aria-hidden=\"true\">edit</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.rename' | translate }}</span>\n    </button>\n    <button mat-menu-item type=\"button\" (click)=\"share.emit()\">\n      <mat-icon aria-hidden=\"true\">share</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.share' | translate }}</span>\n    </button>\n    <button mat-menu-item type=\"button\" (click)=\"remove.emit()\">\n      <mat-icon aria-hidden=\"true\">delete</mat-icon>\n      <span>{{ 'satori-components.saved-search-actions.delete' | translate }}</span>\n    </button>\n  </mat-menu>\n}\n", styles: [":host{display:inline-flex;align-items:center;gap:8px}\n"] }]
        }], propDecorators: { savedSearchId: [{ type: i0.Input, args: [{ isSignal: true, alias: "savedSearchId", required: false }] }], dirty: [{ type: i0.Input, args: [{ isSignal: true, alias: "dirty", required: false }] }], hasFilters: [{ type: i0.Input, args: [{ isSignal: true, alias: "hasFilters", required: false }] }], saveAs: [{ type: i0.Output, args: ["saveAs"] }], save: [{ type: i0.Output, args: ["save"] }], rename: [{ type: i0.Output, args: ["rename"] }], share: [{ type: i0.Output, args: ["share"] }], remove: [{ type: i0.Output, args: ["remove"] }] } });

// satori:export:components — `satori-component` inserts above this line

/**
 * Generated bundle index. Do not edit.
 */

export { NXS_EMPTY_SEARCH_FILTERS, NXS_FAVORITES_CHANGED_EVENT, NXS_MODIFIED_RANGES, NXS_PERMISSIONS_PANEL_ID, NXS_PRIMITIVE_IDS, NXS_SIZE_RANGES, NXS_TOAST_DURATION, NxsActionMenuComponent, NxsAvatarComponent, NxsBreadcrumbsComponent, NxsColumnPickerComponent, NxsCommentExtraDirective, NxsCommentsComponent, NxsCreateVersionDialogComponent, NxsDateInputComponent, NxsDeletePermissionDialogComponent, NxsDetailsPanelComponent, NxsDocTypeIconComponent, NxsDocumentHistoryComponent, NxsDocumentListComponent, NxsDocumentReferenceInputComponent, NxsDocumentToolbarComponent, NxsDocumentTreeComponent, NxsDomainHintComponent, NxsDriveDialogComponent, NxsDropzoneComponent, NxsEmptyStateComponent, NxsErrorStateComponent, NxsFavoriteToggleComponent, NxsFolderHeaderComponent, NxsFolderPickerDialogComponent, NxsIconComponent, NxsManageVersionsComponent, NxsMetadataEditorComponent, NxsPagerComponent, NxsPermissionsPanelComponent, NxsPropertiesPanelComponent, NxsRenameDialogComponent, NxsRichTooltipComponent, NxsSavedSearchActionsComponent, NxsSavedSearchSelectComponent, NxsSearchFiltersComponent, NxsShareExternalDialogComponent, NxsSpinnerComponent, NxsTabBodyDirective, NxsTabsComponent, NxsTagComponent, NxsTagEditorComponent, NxsTagInputComponent, NxsThumbnailComponent, NxsToastService, NxsUpdatePermissionDialogComponent, NxsUploadQueue, NxsUploadQueueComponent, NxsUserGroupPickerComponent, NxsVocabularySelectComponent, nxsAceTimeFrame, nxsDocumentSuggestionQuery, nxsErrorStatus, nxsHasSearchFilters, nxsInitials, nxsPropertyText, nxsRangeOptions, nxsSameSearchFilters, nxsSavedParamsToClear, nxsSearchFiltersFromParams, nxsSearchFiltersToQuery, nxsSearchFiltersToRecord, nxsSearchFiltersToSavedParams, nxsTermOptions, nxsToggleFavorite, nxsVersionLabel, nxsVisibleText, provideNxsComponents, provideNxsThumbnailCache, provideNxsToast };
//# sourceMappingURL=nuxeo-satori-platform-components.mjs.map
