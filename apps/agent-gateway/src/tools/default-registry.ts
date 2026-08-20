import { aiTools } from './ai-tools';
import { contentIntelligenceTools } from './content-intelligence-tools';
import { documentTools } from './nuxeo-document-tools';
import { workflowTools } from './nuxeo-workflow-tools';
import { ToolRegistry } from './tool-registry';
import type { AgentTool } from './tool.types';

/**
 * The tool set the gateway ships with.
 *
 * Composed from four groups rather than one flat list so a deployment can take
 * a subset — an installation without the Content Intelligence Connector, for
 * instance, wants `documentTools` and `workflowTools` and nothing else.
 */
export const DEFAULT_TOOLS: readonly AgentTool[] = [
  ...documentTools,
  ...workflowTools,
  ...aiTools,
  ...contentIntelligenceTools,
];

export interface DefaultToolRegistryOptions {
  /** Drop tools by name, e.g. every mutating tool in a read-only deployment. */
  readonly exclude?: readonly string[];
  /** Extra tools registered on top of the defaults. */
  readonly additional?: readonly AgentTool[];
}

export function createDefaultToolRegistry(options: DefaultToolRegistryOptions = {}): ToolRegistry {
  const excluded = new Set(options.exclude ?? []);
  const registry = new ToolRegistry();
  for (const tool of DEFAULT_TOOLS) {
    if (!excluded.has(tool.name)) {
      registry.register(tool);
    }
  }
  for (const tool of options.additional ?? []) {
    registry.register(tool);
  }
  return registry;
}
