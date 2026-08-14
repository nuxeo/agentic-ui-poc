import { Component, input, output } from '@angular/core';
import type { HxpPermissionRow } from '../../utils/hxp-permission.utils';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

@Component({
  selector: 'hxp-browse-permissions',
  standalone: true,
  templateUrl: './hxp-browse-permissions.component.html',
  styleUrl: './hxp-browse-permissions.component.scss',
  imports: [HxpIconComponent, HxpSpinnerComponent],
})
export class HxpBrowsePermissionsComponent {
  readonly loading = input(false);
  readonly canManage = input(false);
  readonly localAces = input<HxpPermissionRow[]>([]);
  readonly inheritedAces = input<HxpPermissionRow[]>([]);
  readonly externalAces = input<HxpPermissionRow[]>([]);
  readonly inheritanceBlocked = input(false);
  readonly actionInProgress = input<string | null>(null);

  readonly addPermission = output<void>();
  readonly editPermission = output<HxpPermissionRow>();
  readonly deletePermission = output<HxpPermissionRow>();
  readonly toggleInheritance = output<void>();
  readonly shareExternal = output<void>();
  readonly editExternal = output<HxpPermissionRow>();
  readonly notifyEmail = output<HxpPermissionRow>();
}
