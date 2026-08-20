import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, timeout } from 'rxjs';

import {
  AGENT_CAPABILITY_PROBE_TIMEOUT,
  AGENT_RUNTIME_BASE_URL,
  agentCapabilitiesUrl,
} from './agent.config';

/** Optional feature flags from `GET /nuxeo/agent/capabilities`. All default to false. */
export interface AgentRuntimeFeatures {
  streaming: boolean;
  toolCalls: boolean;
  humanInTheLoop: boolean;
  sharedState: boolean;
  threadPersistence: boolean;
  cancel: boolean;
}

export const NO_AGENT_RUNTIME_FEATURES: AgentRuntimeFeatures = {
  streaming: false,
  toolCalls: false,
  humanInTheLoop: false,
  sharedState: false,
  threadPersistence: false,
  cancel: false,
};

/**
 * Decides whether an agent gateway is deployed at all.
 *
 * A customer who never installs the gateway is a supported configuration, not an error
 * state, so every failure mode collapses to the same answer: no agent runtime, fall back
 * to the Automation-backed AI path.
 */
@Injectable({ providedIn: 'root' })
export class AgentCapabilityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AGENT_RUNTIME_BASE_URL);
  private readonly probeTimeoutMs = inject(AGENT_CAPABILITY_PROBE_TIMEOUT);

  private readonly available = signal(false);
  private readonly features = signal<AgentRuntimeFeatures>(NO_AGENT_RUNTIME_FEATURES);
  private readonly probed = signal(false);

  /** True only when a gateway answered the probe and declared `agentRuntime: true`. */
  readonly agentRuntimeAvailable = this.available.asReadonly();
  readonly agentRuntimeFeatures = this.features.asReadonly();
  /** False until the bootstrap probe has settled, so callers never act on a guess. */
  readonly probeSettled = this.probed.asReadonly();

  /**
   * Cached for the browser session, deliberately never in `localStorage`: a customer who
   * installs the gateway must not have to clear browser storage to see it.
   */
  private probe$?: Observable<boolean>;

  probe(): Observable<boolean> {
    this.probe$ ??= this.http
      .get<unknown>(agentCapabilitiesUrl(this.baseUrl), {
        headers: { Accept: 'application/json' },
      })
      .pipe(
        timeout(this.probeTimeoutMs),
        map((body) => this.applyProbeResult(body)),
        // Network error, timeout, non-200 and unparseable body are all "not deployed".
        catchError(() => of(this.applyProbeResult(null))),
        shareReplay(1),
      );
    return this.probe$;
  }

  private applyProbeResult(body: unknown): boolean {
    const parsed = readCapabilities(body);
    this.available.set(parsed.agentRuntime);
    this.features.set(parsed.features);
    this.probed.set(true);
    return parsed.agentRuntime;
  }
}

function readCapabilities(body: unknown): {
  agentRuntime: boolean;
  features: AgentRuntimeFeatures;
} {
  if (!body || typeof body !== 'object') {
    return { agentRuntime: false, features: NO_AGENT_RUNTIME_FEATURES };
  }
  const record = body as Record<string, unknown>;
  if (record['agentRuntime'] !== true) {
    return { agentRuntime: false, features: NO_AGENT_RUNTIME_FEATURES };
  }
  return { agentRuntime: true, features: readFeatures(record['features']) };
}

function readFeatures(value: unknown): AgentRuntimeFeatures {
  if (!value || typeof value !== 'object') return NO_AGENT_RUNTIME_FEATURES;
  const record = value as Record<string, unknown>;
  const flag = (key: keyof AgentRuntimeFeatures) => record[key] === true;
  return {
    streaming: flag('streaming'),
    toolCalls: flag('toolCalls'),
    humanInTheLoop: flag('humanInTheLoop'),
    sharedState: flag('sharedState'),
    threadPersistence: flag('threadPersistence'),
    cancel: flag('cancel'),
  };
}
