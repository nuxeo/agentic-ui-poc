import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

/** One entry in an action menu. */
export interface NxsMenuAction {
  /** The action's registered ID; rendered as `data-action-id`. */
  readonly id: string;
  /** What the entry says, already translated. */
  readonly label: string;
  /** An optional Material icon ligature. Decorative. */
  readonly icon?: string;
  /** Shown but not selectable — the action's enabled rule said no. */
  readonly disabled?: boolean;
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
@Component({
  selector: 'nxs-action-menu',
  standalone: true,
  templateUrl: './action-menu.component.html',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'nxs-action-menu' },
})
export class NxsActionMenuComponent {
  /** The entries, in display order. */
  readonly actions = input.required<readonly NxsMenuAction[]>();
  /** The trigger's accessible name and tooltip, already translated — "More actions". */
  readonly label = input.required<string>();
  /** The trigger's Material icon ligature. */
  readonly icon = input('more_vert');

  /** The entry the user chose. Never a disabled one. */
  readonly selected = output<NxsMenuAction>();
}
