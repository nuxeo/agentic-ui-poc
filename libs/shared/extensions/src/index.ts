export {
  EXTENSION_SLOTS,
  type ExtensionElement,
  type ExtensionSlotId,
} from './lib/extension-slots';
export {
  CORE_RULE_EVALUATORS,
  EMPTY_EXTENSION_RULE_CONTEXT,
  ExtensionRuleRegistry,
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
export { ExtensionRuleContextService } from './lib/extension-rule-context.service';
export { AppExtensionsService } from './lib/app-extensions.service';
export { APP_NAV_ITEMS, PACKAGED_NAV_ITEMS, type NavItemDescriptor } from './lib/nav-items';
