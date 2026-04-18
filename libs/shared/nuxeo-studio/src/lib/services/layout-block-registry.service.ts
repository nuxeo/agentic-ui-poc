import { Injectable } from '@angular/core';
import { LayoutBlock, FieldWidgetConfig } from '../models/layout.model';

/**
 * Registry for reusable layout blocks.
 *
 * A LayoutBlock is a named group of field widget configs that can be
 * referenced from any LayoutSection via `LayoutBlockRef`. This avoids
 * duplicating the same field definitions across multiple layouts
 * (e.g. Dublin Core fields shared between create and edit forms).
 *
 * Usage:
 * ```ts
 * blockRegistry.register({
 *   name: 'dc-common',
 *   label: 'Common Metadata',
 *   fields: [
 *     { xpath: 'dc:title', widget: 'text', label: 'Title', required: true },
 *     { xpath: 'dc:description', widget: 'textarea', label: 'Description' },
 *   ],
 * });
 * ```
 *
 * Then in a layout config:
 * ```ts
 * sections: [{
 *   label: 'General',
 *   fields: [],
 *   blocks: [{ blockName: 'dc-common' }],
 * }]
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LayoutBlockRegistryService {
  private readonly blocks = new Map<string, LayoutBlock>();

  register(block: LayoutBlock): void {
    this.blocks.set(block.name, block);
  }

  registerAll(blocks: LayoutBlock[]): void {
    for (const b of blocks) {
      this.register(b);
    }
  }

  get(name: string): LayoutBlock | undefined {
    return this.blocks.get(name);
  }

  has(name: string): boolean {
    return this.blocks.has(name);
  }

  remove(name: string): void {
    this.blocks.delete(name);
  }

  getAll(): LayoutBlock[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Resolve a block reference to its fields.
   * Returns an empty array if the block is not registered.
   */
  resolveFields(blockName: string): FieldWidgetConfig[] {
    return this.blocks.get(blockName)?.fields ?? [];
  }
}
