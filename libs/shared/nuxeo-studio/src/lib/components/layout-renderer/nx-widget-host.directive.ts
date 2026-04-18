import {
  ComponentRef,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
  inject,
} from '@angular/core';

import { WidgetRegistryService } from '../../services/widget-registry.service';
import type { WidgetType, FieldWidgetConfig } from '../../models/layout.model';

/**
 * Structural directive that dynamically creates widget components based
 * on the registered widget type. Used inside `LayoutRendererComponent`
 * to instantiate the right widget for each field.
 *
 * The directive sets Angular inputs on the created component using
 * `ComponentRef.setInput()`, which works with signal-based inputs.
 */
@Directive({
  selector: '[nxWidgetHost]',
  standalone: true,
})
export class NxWidgetHostDirective implements OnInit, OnChanges, OnDestroy {
  private readonly vcr = inject(ViewContainerRef);
  private readonly widgetRegistry = inject(WidgetRegistryService);

  @Input() widgetType!: WidgetType;
  @Input() xpath = '';
  @Input() value: unknown;
  @Input() mode: import('../../models/layout.model').LayoutMode = 'edit';
  @Input() label = '';
  @Input() required = false;
  @Input() placeholder = '';
  @Input() readOnly = false;
  @Input() multiple = false;
  @Input() directory?: string;
  @Input() min?: number;
  @Input() max?: number;
  @Input() maxLength?: number;
  @Input() rows?: number;
  @Input() accept?: string;
  @Input() disabled = false;
  @Input() widgetProperties?: Record<string, unknown>;
  @Input() fields?: FieldWidgetConfig[];
  @Input() validationErrors: string[] = [];

  @Output() widgetValueChange = new EventEmitter<unknown>();

  private componentRef: ComponentRef<unknown> | null = null;

  ngOnInit(): void {
    this.createComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.componentRef) return;

    // Update all inputs on the existing component
    if (changes['widgetType'] && !changes['widgetType'].firstChange) {
      this.vcr.clear();
      this.createComponent();
      return;
    }

    this.updateInputs();
  }

  ngOnDestroy(): void {
    this.vcr.clear();
    this.componentRef = null;
  }

  private createComponent(): void {
    const componentClass = this.widgetRegistry.resolveComponent(this.widgetType);
    if (!componentClass) {
      console.warn(
        `[LayoutEngine] No widget registered for type "${this.widgetType}", xpath="${this.xpath}"`,
      );
      return;
    }

    this.vcr.clear();
    this.componentRef = this.vcr.createComponent(componentClass);

    this.updateInputs();

    // Subscribe to the widget's valueChange output
    const instance = this.componentRef.instance as { valueChange?: EventEmitter<unknown> };
    if (instance.valueChange) {
      instance.valueChange.subscribe((newValue: unknown) => {
        this.widgetValueChange.emit(newValue);
      });
    }
  }

  private updateInputs(): void {
    if (!this.componentRef) return;

    this.componentRef.setInput('xpath', this.xpath);
    this.componentRef.setInput('value', this.value);
    this.componentRef.setInput('mode', this.mode);
    this.componentRef.setInput('label', this.label);
    this.componentRef.setInput('required', this.required);
    this.componentRef.setInput('placeholder', this.placeholder);
    this.componentRef.setInput('readOnly', this.readOnly);
    this.componentRef.setInput('multiple', this.multiple);
    this.componentRef.setInput('disabled', this.disabled);

    if (this.directory !== undefined) this.componentRef.setInput('directory', this.directory);
    if (this.min !== undefined) this.componentRef.setInput('min', this.min);
    if (this.max !== undefined) this.componentRef.setInput('max', this.max);
    if (this.maxLength !== undefined) this.componentRef.setInput('maxLength', this.maxLength);
    if (this.rows !== undefined) this.componentRef.setInput('rows', this.rows);
    if (this.accept !== undefined) this.componentRef.setInput('accept', this.accept);
    if (this.widgetProperties !== undefined)
      this.componentRef.setInput('properties', this.widgetProperties);
    if (this.fields !== undefined) this.componentRef.setInput('fields', this.fields);
    this.componentRef.setInput('validationErrors', this.validationErrors);
  }
}
