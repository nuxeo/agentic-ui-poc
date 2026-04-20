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

export {
  type ActionConfig,
  type ActionSlot,
  type ButtonType,
  type ElementBinding,
  type ActionAttributes,
  type ActivationFilter,
  createDefaultAction,
} from './lib/models/action.model';

export { type TabConfig, createDefaultTab } from './lib/models/tab.model';

export { TabRegistryService, type TabContext } from './lib/services/tab-registry.service';

export { type DrawerItemConfig, createDefaultDrawerItem } from './lib/models/drawer.model';

export { DrawerRegistryService, type DrawerContext } from './lib/services/drawer-registry.service';

export {
  type SearchConfig,
  type SearchFieldConfig,
  type ResultColumnConfig,
  createDefaultSearch,
} from './lib/models/search.model';

export {
  type ThemeConfig,
  type ThemeDefinition,
  type ThemeCssCategory,
  type ThemeCssVariable,
  type BaseThemeName,
  BASE_THEME_NAMES,
  createDefaultTheme,
  createBaseTheme,
  createCustomThemeFrom,
  getAllBaseThemes,
  themeToCSS,
} from './lib/models/theme.model';

export { type TranslationConfig, createDefaultTranslation } from './lib/models/translation.model';

export {
  type DashboardConfig,
  type DashboardWidgetConfig,
  type DashboardWidgetType,
  createDefaultDashboard,
} from './lib/models/dashboard.model';

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
export { StudioConfigApiService } from './lib/services/studio-config-api.service';
export { ActionRegistryService } from './lib/services/action-registry.service';
export { ThemeEngineService } from './lib/services/theme-engine.service';
export {
  TranslationLoaderService,
  NxTranslatePipe,
} from './lib/services/translation-loader.service';
export { DashboardRuntimeService, type WidgetData } from './lib/services/dashboard-runtime.service';
export {
  SearchRuntimeService,
  type SearchRuntimeResult,
} from './lib/services/search-runtime.service';
export {
  PlatformRegistryService,
  type PlatformDocType,
  type PlatformPageProvider,
  type DeployedLayoutInfo,
} from './lib/services/platform-registry.service';

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
