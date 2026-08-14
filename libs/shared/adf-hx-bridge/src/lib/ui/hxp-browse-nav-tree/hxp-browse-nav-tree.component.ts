import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import type { HxpBrowseFolderNode } from '../../models/hxp-browse-folder-node';
import { HxpBrowseNavTreeService } from '../../services/hxp-browse-nav-tree.service';
import { HxpIconComponent } from '../hxp-icon/hxp-icon.component';
import { HxpSpinnerComponent } from '../hxp-spinner/hxp-spinner.component';

@Component({
  selector: 'hxp-browse-nav-tree',
  standalone: true,
  templateUrl: './hxp-browse-nav-tree.component.html',
  styleUrl: './hxp-browse-nav-tree.component.scss',
  imports: [NgTemplateOutlet, HxpIconComponent, HxpSpinnerComponent],
})
export class HxpBrowseNavTreeComponent {
  protected readonly tree = inject(HxpBrowseNavTreeService);

  readonly navigatePath = output<string>();

  protected toggleNode(node: HxpBrowseFolderNode): void {
    this.tree.toggleNode(node);
  }

  protected navigateToFolder(node: HxpBrowseFolderNode): void {
    this.navigatePath.emit(this.tree.resolveNavigatePath(node));
  }

  protected isNodeActive(node: HxpBrowseFolderNode): boolean {
    return this.tree.isNodeActive(node);
  }

  protected nodeLabel(node: HxpBrowseFolderNode): string {
    return this.tree.nodeLabel(node);
  }

  protected hasChildren(node: HxpBrowseFolderNode): boolean {
    return this.tree.hasChildren(node);
  }
}
