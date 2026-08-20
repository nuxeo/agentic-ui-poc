import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

/**
 * The grip on a side panel's inner edge.
 *
 * Knows nothing about the panel it resizes: it takes the current width and the range,
 * and reports the width the pointer is asking for. That keeps the arithmetic — which is
 * the part with an off-by-a-sign in it — testable without a drawer, and lets the same
 * grip serve any edge-anchored panel.
 *
 * Two outputs rather than one. {@link resized} fires on every pointer move so the panel
 * tracks the pointer; {@link committed} fires once on release, which is what a caller
 * should persist. A single output would either write storage on every frame of the drag
 * or make the drag lag behind the pointer.
 */
@Component({
  selector: 'app-panel-resize-handle',
  standalone: true,
  templateUrl: './panel-resize-handle.component.html',
  styleUrl: './panel-resize-handle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dragging]': 'dragging()',
  },
})
export class PanelResizeHandleComponent {
  /** The panel's width now, in CSS pixels. The drag starts from this. */
  readonly width = input.required<number>();
  readonly min = input.required<number>();
  readonly max = input.required<number>();

  /**
   * Which side of the panel the grip is on, which is what decides the sign.
   *
   * `end` is a panel anchored to the right of the window, so its grip is on its left
   * edge and dragging left — a falling clientX — makes it wider.
   */
  readonly side = input<'start' | 'end'>('end');

  readonly label = input('Resize panel');

  /** Width the pointer is currently asking for. Fires continuously during a drag. */
  readonly resized = output<number>();
  /** The width the user settled on. Fires once, on release or on a key press. */
  readonly committed = output<number>();

  /**
   * Whether a pointer drag is in progress.
   *
   * Reported because the panel's width transition has to be off while the pointer is
   * moving — a 400ms ease cannot keep up with a drag, so the panel would trail the grip
   * and settle after the pointer stopped. A keyboard step is not a drag and does not
   * fire this, which is what keeps arrow-key resizing animated.
   */
  readonly dragChanged = output<boolean>();

  readonly dragging = signal(false);

  /**
   * True when the range has collapsed, which happens in a window too narrow to give the
   * panel and the page behind it both a usable width. The grip is then inert and says so
   * rather than appearing draggable and refusing to move.
   */
  readonly disabled = computed(() => this.max() <= this.min());

  private startX = 0;
  private startWidth = 0;
  private pointerId: number | null = null;

  onPointerDown(event: PointerEvent): void {
    // Left button only. A right-click during a drag would otherwise capture the pointer
    // and never see the matching release.
    if (event.button !== 0 || this.disabled() || this.pointerId !== null) return;

    this.startX = event.clientX;
    this.startWidth = this.width();
    this.pointerId = event.pointerId;
    this.dragging.set(true);
    this.dragChanged.emit(true);

    // Capture rather than document-level listeners: the pointer leaving the 6px grip —
    // which it does immediately — must not end the drag, and a release outside the
    // window must still be delivered.
    (event.target as Element | null)?.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  onPointerMove(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    this.resized.emit(this.widthAt(event.clientX));
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    const width = this.widthAt(event.clientX);
    this.endDrag(event);
    this.committed.emit(width);
  }

  /**
   * A cancelled drag — the OS took the pointer, or Escape was pressed mid-drag.
   *
   * Reverts to the width the drag started from rather than keeping wherever the pointer
   * happened to be, because a cancellation is the user saying they did not mean it.
   */
  onPointerCancel(event: PointerEvent): void {
    if (this.pointerId !== event.pointerId) return;
    const original = this.startWidth;
    this.endDrag(event);
    this.resized.emit(original);
  }

  /**
   * Keyboard resizing, so the panel is adjustable without a pointer.
   *
   * A grip is a `separator` with a value, which is the one widget role that makes arrow
   * keys mean "move me" rather than "move the focus". Each press commits, because there
   * is no release to commit on.
   *
   * An arrow is expressed as the horizontal travel it stands for and put through the same
   * {@link widthFrom} the pointer uses, rather than as its own signed expression. Written
   * the second way it is one `-1` away from a panel that shrinks when you press the arrow
   * pointing at the direction you want it to grow, and nothing about the code looks wrong.
   */
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;

    const step = event.shiftKey ? COARSE_STEP_PX : STEP_PX;
    let next: number;

    switch (event.key) {
      case 'ArrowLeft':
        next = this.widthFrom(this.width(), -step);
        break;
      case 'ArrowRight':
        next = this.widthFrom(this.width(), step);
        break;
      // Widest and narrowest, named by direction rather than by size: Home is the far
      // edge of the range in the direction that grows this panel.
      case 'Home':
        next = this.max();
        break;
      case 'End':
        next = this.min();
        break;
      default:
        return;
    }

    event.preventDefault();
    this.resized.emit(next);
    this.committed.emit(next);
  }

  private widthAt(clientX: number): number {
    return this.widthFrom(this.startWidth, clientX - this.startX);
  }

  /**
   * The one place the side decides a sign.
   *
   * An `end`-anchored panel has its outer edge pinned to the window, so its grip moving
   * left — a negative travel — makes it wider.
   */
  private widthFrom(width: number, travel: number): number {
    return this.clamp(width + (this.side() === 'end' ? -travel : travel));
  }

  private clamp(width: number): number {
    return Math.min(Math.max(Math.round(width), this.min()), this.max());
  }

  private endDrag(event: PointerEvent): void {
    (event.target as Element | null)?.releasePointerCapture?.(event.pointerId);
    this.pointerId = null;
    this.dragging.set(false);
    this.dragChanged.emit(false);
  }
}

/** Pixels per arrow key press, and per press with Shift held. */
const STEP_PX = 16;
const COARSE_STEP_PX = 64;
