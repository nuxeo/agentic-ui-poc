import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * The "nothing here" state for a list, panel or result set.
 *
 * Text arrives already translated — the library ships no catalogue of its own — so a caller
 * binds `[heading]="'browse.empty' | translate"`. Actions are projected, so a "Create" or
 * "Clear filters" button stays the caller's, wired to the caller's action.
 */
@Component({
  selector: 'nxs-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'nxs-empty-state', role: 'status' },
})
export class NxsEmptyStateComponent {
  /** What is empty, in one line. */
  readonly heading = input.required<string>();
  /**
   * The heading's level in the page outline. Set it to fit where the component sits — one below
   * the heading of the section it empties — so heading navigation stays in order.
   */
  readonly headingLevel = input<1 | 2 | 3 | 4 | 5 | 6>(2);
  /** An optional second line — usually what to do next. Not rendered when blank. */
  readonly message = input('');
  /** An optional Material icon ligature. Decorative, so hidden from assistive technology. */
  readonly icon = input('');
}
