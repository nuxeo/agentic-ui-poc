/**
 * Public API of the agent gateway.
 *
 * The tool layer is the part meant to be extended: `ToolRegistry`,
 * `AgentTool`, `ToolContext` and `createDefaultToolRegistry` are the documented
 * extension point (see README, "Registering a tool"). Everything else is
 * exported so a host process can compose its own server.
 */
export * from './config';
export * from './identity/caller-identity';
export * from './logging/logger';
export * from './nuxeo/nuxeo-rest-client';
export * from './agent/model-client';
export * from './agent/approval-gate';
export * from './agent/run-agent';
export * from './agent/write-preflight';
export * from './http/capabilities';
export * from './http/server';
export * from './http/sse';
export * from './tools';
