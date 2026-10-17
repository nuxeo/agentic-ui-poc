import type { NxsRichTooltipInputs } from '../primitives';
import * as i0 from "@angular/core";
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
export declare class NxsRichTooltipComponent implements NxsRichTooltipInputs {
    /** The panel's title, already translated. */
    readonly heading: import("@angular/core").InputSignal<string>;
    /** The explanation under the title, already translated. Plain text. */
    readonly content: import("@angular/core").InputSignal<string>;
    /** The trigger button's accessible name, already translated. The button shows only an icon. */
    readonly triggerLabel: import("@angular/core").InputSignal<string>;
    /** The trigger's Material Icons ligature. */
    readonly icon: import("@angular/core").InputSignal<string>;
    protected readonly open: import("@angular/core").WritableSignal<boolean>;
    protected readonly panelId: string;
    /** How far, in px, the open panel is moved sideways to stay inside the viewport. */
    protected readonly shift: import("@angular/core").WritableSignal<number>;
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
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsRichTooltipComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsRichTooltipComponent, "nxs-rich-tooltip", never, { "heading": { "alias": "heading"; "required": true; "isSignal": true; }; "content": { "alias": "content"; "required": true; "isSignal": true; }; "triggerLabel": { "alias": "triggerLabel"; "required": true; "isSignal": true; }; "icon": { "alias": "icon"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=rich-tooltip.component.d.ts.map