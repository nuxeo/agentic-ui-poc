export {
  EXTENSION_SLOTS,
  type ExtensionElement,
  type ExtensionSlotId,
} from './lib/extension-slots';
export {
  CORE_RULE_EVALUATORS,
  EMPTY_EXTENSION_RULE_CONTEXT,
  ExtensionRuleRegistry,
  SECURITY_RELEVANT_RULE_IDS,
  type ExtensionRule,
  type ExtensionRuleContext,
  type ExtensionRuleEvaluator,
  type ExtensionRuleRef,
  type ExtensionRuleResolver,
} from './lib/extension-rules';
export {
  ExtensionSlotRegistry,
  NO_EXTENSION_SLOT_OVERRIDES,
  type ExtensionOverride,
  type ExtensionSlotOverrides,
} from './lib/extension-slot-registry.service';
export {
  mergeExtensionConfigs,
  readExtensionConfig,
  resolveExtensionConfig,
  type ExtensionConfig,
  type ExtensionLayerResolver,
  type ResolvedExtensionConfig,
} from './lib/extension-config';
export { DOCUMENT_RULE_EVALUATORS } from './lib/document-rules';
export {
  ExtensionActionRegistry,
  type ExtensionActionDescriptor,
  type ExtensionActionHandler,
  type ExtensionColumnDescriptor,
  type ExtensionTabDescriptor,
} from './lib/extension-actions';
export { PACKAGED_BULK_ACTIONS } from './lib/packaged-actions';
export { PACKAGED_BROWSE_COLUMNS } from './lib/packaged-columns';
export { ExtensionRuleContextService } from './lib/extension-rule-context.service';
export {
  ExtensionComponentRegistry,
  type ExtensionComponentSource,
} from './lib/extension-component-registry.service';
export { ExtensionOutletComponent } from './lib/extension-outlet.component';
export { AppExtensionsService } from './lib/app-extensions.service';
export { APP_NAV_ITEMS, PACKAGED_NAV_ITEMS, type NavItemDescriptor } from './lib/nav-items';
