import { Injectable, computed, inject, signal } from '@angular/core';
import { AgentCapabilityService } from '@agentic-ui/shared/agent-client';
import { Observable, map } from 'rxjs';

const STORAGE_KEY = 'ai-features-enabled';
const MIGRATION_KEY = 'ai-features-default-enabled-v1';

/**
 * Two independent switches decide which AI the user gets.
 *
 * `aiEnabled` is the user's own opt-out and is remembered in `localStorage`.
 * `agentRuntimeAvailable` is a fact about the deployment, discovered once per browser
 * session from `GET /nuxeo/agent/capabilities`, and deliberately never persisted — a
 * customer who installs the gateway must not have to clear browser storage to see it.
 *
 * A probe that cannot reach a gateway is indistinguishable from one that is not deployed,
 * so a misrouted probe silently downgrades a working deployment to the Automation path.
 * `checkAgentGatewayPathAgreement` in `scripts/review-guardrails.mjs` guards the committed
 * proxy tables against that; a stale `ng serve` still needs restarting by hand.
 *
 * Both true means the AG-UI agent path. `aiEnabled` true with no gateway means the
 * Automation path via `AiGatewayService`, which is still AI and is the configuration a
 * meaningful number of OnPrem customers will run. `aiEnabled` false means no AI at all.
 */
@Injectable({ providedIn: 'root' })
export class AiFeatureFlagService {
  private readonly capabilities = inject(AgentCapabilityService);

  readonly aiEnabled = signal<boolean>(this.readFromStorage());

  /** True only when a gateway answered the bootstrap probe. */
  readonly agentRuntimeAvailable = this.capabilities.agentRuntimeAvailable;
  readonly agentRuntimeFeatures = this.capabilities.agentRuntimeFeatures;

  /** Use the streaming agent runtime. */
  readonly agentPathEnabled = computed(() => this.aiEnabled() && this.agentRuntimeAvailable());
  /** Use the single-shot Nuxeo Automation operations instead. */
  readonly automationPathEnabled = computed(
    () => this.aiEnabled() && !this.agentRuntimeAvailable(),
  );

  /** Runs the capability probe once, at app bootstrap. Never rejects. */
  probeAgentRuntime(): Observable<void> {
    return this.capabilities.probe().pipe(map(() => undefined));
  }

  toggle(): void {
    this.setEnabled(!this.aiEnabled());
  }

  setEnabled(value: boolean): void {
    this.aiEnabled.set(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* localStorage unavailable */
    }
  }

  private readFromStorage(): boolean {
    try {
      const migrated = localStorage.getItem(MIGRATION_KEY) === 'true';
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!migrated) {
        // Product decision for the PoC: make AI visible after upgrade even for old local opt-outs.
        // User choices made after this migration are preserved by the migration marker.
        localStorage.setItem(MIGRATION_KEY, 'true');
        localStorage.setItem(STORAGE_KEY, 'true');
        return true;
      }

      return stored === null ? true : stored === 'true';
    } catch {
      // If storage is unavailable, keep the PoC default-on for the current session.
      return true;
    }
  }
}
