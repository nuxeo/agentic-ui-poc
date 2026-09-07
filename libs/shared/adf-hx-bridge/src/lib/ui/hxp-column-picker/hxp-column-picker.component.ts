import {
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/** One row in the picker: a stable key, a label, and whether it is currently shown. */
export interface HxpPickableColumn {
  readonly key: string;
  readonly label: string;
  readonly visible: boolean;
}

/**
 * The runtime column picker.
 *
 * Extracted from `hxp-document-list` when upstream's `HxpDocumentListComponent` took over
 * the table. Upstream has no picker at all, so without this the swap would silently remove
 * a capability: Layer 1 could still set the columns from a manifest, but a **user** could
 * no longer choose them. Rehomed rather than lost.
 *
 * Purely presentational. It takes the columns to offer and emits the keys the user chose;
 * where those come from and where they are persisted is the host's business, which is what
 * lets the host feed it Layer 1 descriptors instead of a hardcoded list.
 */
/**
 * MISSING(adf-hx): M1 — upstream's document list has no column picker. Driven by the Layer 1
 * descriptors, so `Reset` returns to the manifest rather than a packaged constant.
 */
@Component({
  selector: 'hxp-column-picker',
  standalone: true,
  templateUrl: './hxp-column-picker.component.html',
  styleUrl: './hxp-column-picker.component.scss',
})
export class HxpColumnPickerComponent {
  /** Every column the user may choose from, in display order. */
  readonly columns = input<readonly HxpPickableColumn[]>([]);
  /**
   * Columns that may not be switched off. The identity column would otherwise leave a
   * table of unlabelled rows.
   */
  readonly required = input<readonly string[]>(['title']);
  /** The defaults `Reset` returns to — the host's, not a copy of a packaged const. */
  readonly defaults = input<readonly string[]>([]);

  readonly apply = output<readonly string[]>();
  readonly dismiss = output<void>();

  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** Local edit buffer, so Cancel and Escape genuinely discard. */
  private readonly pending = signal<readonly string[] | null>(null);

  protected readonly chosen = computed<readonly string[]>(
    () =>
      this.pending() ??
      this.columns()
        .filter((c) => c.visible)
        .map((c) => c.key),
  );

  focus(): void {
    queueMicrotask(() => this.panel()?.nativeElement.focus());
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.pending.set(null);
    this.dismiss.emit();
  }

  protected isChosen(key: string): boolean {
    return this.chosen().includes(key);
  }

  protected isRequired(key: string): boolean {
    return this.required().includes(key);
  }

  protected toggle(key: string): void {
    if (this.isRequired(key)) return;
    const current = this.chosen();
    this.pending.set(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
  }

  protected reset(): void {
    this.pending.set([...this.defaults()]);
  }

  protected commit(): void {
    // Emitted in the columns' own order, not click order, so the caller never has to
    // re-sort and a reorder in the manifest is respected.
    const chosen = this.chosen();
    this.apply.emit(
      this.columns()
        .filter((c) => chosen.includes(c.key))
        .map((c) => c.key),
    );
    this.pending.set(null);
  }
}
