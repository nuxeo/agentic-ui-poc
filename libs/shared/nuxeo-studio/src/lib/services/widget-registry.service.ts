import { Injectable, Type } from '@angular/core';

import { NuxeoFieldType } from '../models/schema.model';
import { WidgetType } from '../models/layout.model';
import { WidgetDescriptor, DEFAULT_WIDGET_MAP } from '../models/widget.model';

/**
 * Registry that maps widget type identifiers to concrete Angular component
 * classes. Widget libraries register their components here at app startup;
 * the Layout Engine queries it at render time.
 */
@Injectable({ providedIn: 'root' })
export class WidgetRegistryService {
  private readonly registry = new Map<WidgetType, WidgetDescriptor>();

  // ----- Registration -----

  /** Register a single widget descriptor. */
  register(descriptor: WidgetDescriptor): void {
    this.registry.set(descriptor.type, descriptor);
  }

  /** Register multiple widget descriptors at once. */
  registerAll(descriptors: WidgetDescriptor[]): void {
    for (const d of descriptors) {
      this.register(d);
    }
  }

  // ----- Lookup -----

  /** Get the widget descriptor for a widget type. */
  getDescriptor(widgetType: WidgetType): WidgetDescriptor | undefined {
    return this.registry.get(widgetType);
  }

  /** Get the Angular component class for a widget type. */
  getComponent(widgetType: WidgetType): Type<unknown> | undefined {
    return this.registry.get(widgetType)?.component;
  }

  /**
   * Resolve the best widget component for a field type.
   * Uses the default mapping if no explicit widget type is specified.
   */
  resolveComponent(widgetType?: WidgetType, fieldType?: NuxeoFieldType): Type<unknown> | undefined {
    // Explicit widget type takes priority
    if (widgetType) {
      const comp = this.getComponent(widgetType);
      if (comp) return comp;
    }

    // Fall back to default mapping from field type
    if (fieldType) {
      const defaultWidget = DEFAULT_WIDGET_MAP[fieldType];
      if (defaultWidget) return this.getComponent(defaultWidget);
    }

    // Last resort: text widget
    return this.getComponent('text');
  }

  /** Check if a widget type is registered. */
  has(widgetType: WidgetType): boolean {
    return this.registry.has(widgetType);
  }

  /** Get all registered widget types. */
  getRegisteredTypes(): WidgetType[] {
    return Array.from(this.registry.keys());
  }

  /** Get all registered descriptors. */
  getAll(): WidgetDescriptor[] {
    return Array.from(this.registry.values());
  }

  /**
   * Get all widget types that can handle a given field type.
   * Useful for building widget-type pickers in a future Studio UI.
   */
  getCompatibleWidgets(fieldType: NuxeoFieldType): WidgetDescriptor[] {
    return this.getAll().filter((d) => d.supportedFieldTypes.includes(fieldType));
  }
}
