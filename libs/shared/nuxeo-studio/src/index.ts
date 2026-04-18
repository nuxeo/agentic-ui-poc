// Models
export {
  type NuxeoFieldType,
  type NuxeoFieldConstraint,
  type NuxeoFieldDef,
  type NuxeoSchemaDefinition,
  type NuxeoTypeDefinition,
  type NuxeoTypeResponse,
  type NuxeoFieldResponseEntry,
  type NuxeoSchemaResponse,
} from './lib/models/schema.model';

export {
  type LayoutMode,
  type WidgetType,
  type ValidatorType,
  type FieldValidator,
  type FieldVisibilityCondition,
  type FieldWidgetConfig,
  type DataTableColumnDef,
  type ExtensionPointConfig,
  type LayoutBlockRef,
  type LayoutBlock,
  type LayoutSection,
  type LayoutConfig,
  layoutKey,
} from './lib/models/layout.model';

export {
  type WidgetDescriptor,
  type NxWidgetContext,
  DEFAULT_WIDGET_MAP,
} from './lib/models/widget.model';

export type { ActionConfig, ActionSlot, ActionFilter } from './lib/models/action.model';

// Services
export { SchemaRegistryService } from './lib/services/schema-registry.service';
export { LayoutRegistryService } from './lib/services/layout-registry.service';
export { WidgetRegistryService } from './lib/services/widget-registry.service';
export {
  ValidationService,
  type ValidationResult,
  type CustomValidatorFn,
} from './lib/services/validation.service';
export { SlotRegistryService, type SlotRegistration } from './lib/services/slot-registry.service';
export { LayoutBlockRegistryService } from './lib/services/layout-block-registry.service';
export { StudioLayoutService } from './lib/services/studio-layout.service';
export { ConfigStorageService } from './lib/services/config-storage.service';
export { ActionRegistryService } from './lib/services/action-registry.service';

// Components
export { LayoutRendererComponent } from './lib/components/layout-renderer/layout-renderer.component';
export { NxWidgetHostDirective } from './lib/components/layout-renderer/nx-widget-host.directive';
export {
  BulkEditRendererComponent,
  type BulkEditResult,
} from './lib/components/bulk-edit/bulk-edit-renderer.component';

// Utils
export {
  getPropertyValue,
  setPropertyValue,
  getSchemaPrefix,
  getFieldName,
  xpathToLabel,
} from './lib/utils/xpath.util';
export { parsePolymerLayout } from './lib/utils/polymer-layout-parser';
