import {
  MutationNotApprovedError,
  requiresApproval,
  UnknownToolError,
  type MutationApproval,
} from './mutation-policy';
import type { AgentTool, JsonSchemaObject, ToolContext } from './tool.types';

/** A tool as the model gateway wants to see it (OpenAI-compatible function schema). */
export interface ModelToolSchema {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly description: string;
    readonly parameters: JsonSchemaObject;
  };
}

export class DuplicateToolError extends Error {
  constructor(name: string) {
    super(`A tool named "${name}" is already registered.`);
    this.name = 'DuplicateToolError';
  }
}

/**
 * Everything a tool needs to run, plus the human decision that permits it to.
 *
 * `approval` is required rather than optional so that a new call site cannot
 * simply omit it and inherit the old, ungated behaviour. Getting a tool to run
 * means naming the call it is running for and stating whether a human said yes.
 */
export interface ToolExecutionContext extends ToolContext {
  readonly approval: MutationApproval;
}

/**
 * The public extension point for server-side tools.
 *
 * This is deliberately a class with a `register` method rather than a module-level
 * array, so that adding a tool never means editing a file that also contains
 * unrelated tools, and so a deployment can compose its own set:
 *
 * ```ts
 * import { createDefaultToolRegistry, type AgentTool } from '@agentic-ui/agent-gateway';
 *
 * const registry = createDefaultToolRegistry({ config });
 * registry.register(myTool);
 * ```
 *
 * Names are unique and registration throws on a collision rather than silently
 * shadowing — two tools answering to one name is the kind of thing that only
 * shows up as the model picking the wrong one, weeks later.
 */
export class ToolRegistry {
  private readonly tools = new Map<string, AgentTool<never>>();

  register<TArgs>(tool: AgentTool<TArgs>): this {
    if (this.tools.has(tool.name)) {
      throw new DuplicateToolError(tool.name);
    }
    this.tools.set(tool.name, tool as unknown as AgentTool<never>);
    return this;
  }

  registerAll(tools: Iterable<AgentTool<never>>): this {
    for (const tool of tools) this.register(tool);
    return this;
  }

  /** Removes a tool. Lets a deployment drop, say, every mutating tool. */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  get(name: string): AgentTool<never> | undefined {
    return this.tools.get(name);
  }

  /**
   * The only way a registered tool is run, and therefore the only place the
   * mutation gate has to sit.
   *
   * It is deliberately here rather than in the agent loop, and rather than in
   * `register`. A check at registration wraps the tools this registry happened to
   * be given and misses every other route to `execute`; a check in the loop is one
   * `if` away from being skipped by the next call path somebody adds. Here, the
   * refusal is on the path the work travels: to run a mutating tool you must
   * present an approval for that specific call, and the only thing that produces
   * one is a human answering an AG-UI interrupt.
   */
  async execute(
    name: string,
    args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new UnknownToolError(name);
    if (requiresApproval(tool) && !context.approval.granted) {
      throw new MutationNotApprovedError(name, context.approval.toolCallId);
    }
    return tool.execute(args as never, context);
  }

  list(): readonly AgentTool<never>[] {
    return [...this.tools.values()];
  }

  names(): readonly string[] {
    return [...this.tools.keys()];
  }

  toModelSchemas(): readonly ModelToolSchema[] {
    return this.list().map((tool) => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }
}
