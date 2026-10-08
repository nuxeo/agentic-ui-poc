import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { NxsDocTypeIconComponent } from '../doc-type-icon/doc-type-icon.component';

/**
 * The header above a container's contents: its type icon, its title as the page heading, an
 * optional second line, and the container's actions on the right.
 *
 * The actions are the host's, projected as they are, so a host keeps its own buttons, menus and
 * their handlers. Anything marked `nxsFolderHeaderDetail` — a breadcrumb trail, say — is
 * projected under the title instead. On a narrow screen the actions drop below the title.
 *
 * The title is the page's level-one heading; omit it (blank) while the container is loading
 * rather than announce an empty heading.
 */
@Component({
  selector: 'nxs-folder-header',
  standalone: true,
  templateUrl: './folder-header.component.html',
  styleUrl: './folder-header.component.scss',
  imports: [NxsDocTypeIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'nxs-folder-header' },
})
export class NxsFolderHeaderComponent {
  /** The container's title. Blank renders no heading. */
  readonly heading = input('');
  /** A second line under the title — usually the type's name — already translated. */
  readonly subheading = input('');
  /** The container's Nuxeo type, which picks the icon. Blank renders no icon. */
  readonly documentType = input('');
}
