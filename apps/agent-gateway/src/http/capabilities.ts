/**
 * The capability probe, `GET /agent/capabilities`.
 *
 * Unauthenticated by design: the frontend has to decide whether an agent runtime
 * exists before it knows who the user is, and a 401 here would be
 * indistinguishable from "not deployed" — which is the case the whole fallback
 * story turns on. It returns no user data and no configuration.
 *
 * `AiFeatureFlagService` treats a network error, a timeout, a non-200, an
 * unparseable body, or `agentRuntime !== true` as "no agent runtime" and falls
 * back to the Automation path (ADR 001, plan A9).
 *
 * Named `AgentRuntimeCapabilities` rather than `AgentCapabilities` on purpose:
 * `@ag-ui/core` exports an unrelated `AgentCapabilities` describing what an agent
 * supports (identity, reasoning, multimodal, …). This is a deployment probe, and
 * the two would be silently interchangeable at an import site.
 */
/**
 * How the runtime is answering. `live` runs a real model; `demo-scripted` replays
 * a fixed transcript with no model at all (see `src/demo`).
 *
 * This is on the probe because "which mode is this gateway in" must be answerable
 * from outside the process, by anyone, without shell access. A demo gateway that
 * looked identical to a live one on the wire would be indistinguishable in a
 * screenshot, a bug report, or a customer environment.
 */
export type AgentRuntimeMode = 'live' | 'demo-scripted';

/** Describes one replayable transcript, so the probe documents the demo it is serving. */
export interface AgentRuntimeDemoScript {
  readonly id: string;
  readonly prompt: string;
  readonly demonstrates: string;
  /** Per-tool data provenance: which calls hit real Nuxeo and which are canned. */
  readonly data: Readonly<Record<string, string>>;
}

export interface AgentRuntimeDemoDisclosure {
  readonly scripted: true;
  /** Rendered verbatim by anything surfacing the probe. Deliberately blunt. */
  readonly warning: string;
  readonly scripts: readonly AgentRuntimeDemoScript[];
}

export interface AgentRuntimeCapabilities {
  readonly agentRuntime: true;
  readonly protocol: 'ag-ui';
  readonly protocolVersion: string;
  readonly mode: AgentRuntimeMode;
  readonly transports: readonly string[];
  readonly endpoints: Readonly<Record<string, string>>;
  /**
   * What this build can actually do, not what the roadmap says it will.
   *
   * ADR 001 makes the probe normative and tells the client to gate UI
   * affordances on these flags, so a `true` here is a promise the browser has no
   * way to verify — it can only offer the affordance and wait. Every flag is
   * therefore pinned to observable behaviour by `capabilities.spec.ts`, which
   * fails in both directions: advertising something unimplemented, and
   * implementing something still advertised as absent.
   */
  readonly features: Readonly<Record<string, boolean>>;
  /** Present if and only if `mode` is `demo-scripted`. */
  readonly demo?: AgentRuntimeDemoDisclosure;
}

/**
 * Tracks the `@ag-ui/*` package version the gateway is built against. Pinned
 * exactly, per ADR 001 — the protocol is pre-1.0 and the event enum already
 * carries deprecations slated for removal in 1.0.0.
 */
export const AG_UI_PROTOCOL_VERSION = '0.0.57';

export const AGENT_CAPABILITIES: AgentRuntimeCapabilities = {
  agentRuntime: true,
  protocol: 'ag-ui',
  protocolVersion: AG_UI_PROTOCOL_VERSION,
  mode: 'live',
  transports: ['sse'],
  endpoints: { run: '/agent/run' },
  features: {
    streaming: true,
    toolCalls: true,
    humanInTheLoop: true,
    // True since A7 stage 2. Read it narrowly: the channel carries a state
    // slice only when a `selectDocuments` call gives the gateway something to
    // say — never unconditionally, once per run.
    //
    // The distinction is the whole flag. A run is not a turn: a frontend tool
    // hands the turn back and the continuation arrives as a second run, so
    // opening every run with an empty `selection.proposed` meant the run
    // carrying the suggestion proposed it and the next run of the same turn
    // retracted it before anything rendered. Every run was correct on its own,
    // which is why only a live run caught it. The absence is deliberate and is
    // recorded where the code used to be (`render-events.ts`); the negative is
    // pinned by `run-agent.spec.ts` — a text-only run emits neither state
    // event. `capabilities.spec.ts` holds the flag to the wire in both
    // directions, and asserts it against a `selectDocuments` run rather than
    // any run, for exactly this reason.
    //
    // Scope: shared state carries agent *proposals* only. The user's own
    // selection is not in it, deliberately — see `render-events.ts`.
    sharedState: true,
    // Phase 2 (plan A6). Advertised honestly as false so the chat surface does
    // not offer history it cannot load — ADR 001 requires the surface to work
    // with every optional feature off.
    threadPersistence: false,
    cancel: true,
  },
};

export const DEMO_MODE_WARNING =
  'THIS GATEWAY IS IN SCRIPTED DEMO MODE. No language model is called. Assistant text is a ' +
  'fixed transcript. Per-tool data provenance is listed under demo.scripts[].data — anything ' +
  'not marked real-nuxeo is not a fact about this repository.';

/**
 * The demo variant of the probe.
 *
 * `agentRuntime` stays `true` on purpose: the point of demo mode is that the
 * browser behaves exactly as it would against a live gateway, and flipping this
 * would send the client down the Automation fallback instead. The disclosure sits
 * alongside it rather than in place of it.
 */
export function demoCapabilities(
  scripts: readonly AgentRuntimeDemoScript[],
): AgentRuntimeCapabilities {
  return {
    ...AGENT_CAPABILITIES,
    mode: 'demo-scripted',
    demo: { scripted: true, warning: DEMO_MODE_WARNING, scripts },
  };
}
