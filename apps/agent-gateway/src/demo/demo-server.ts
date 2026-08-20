import type { Server } from 'node:http';

import { demoCapabilities } from '../http/capabilities';
import { createGatewayServer } from '../http/server';
import { createLogger, type Logger } from '../logging/logger';
import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import type { Env } from '../config';
import { loadDemoConfig, type DemoGatewayConfig } from './demo-config';
import { describeDemoScripts, demoStartupBanner } from './demo-disclosure';
import { createDemoModelClient } from './demo-model-client';
import { DEMO_SCRIPTS } from './demo-scripts';
import { validateDemoScripts, type DemoScript } from './demo-script.types';
import { createDemoToolRegistry, demoToolProvenance } from './demo-tools';

/**
 * Composes the demo gateway — the whole of demo mode's wiring, in one function that
 * returns rather than listens.
 *
 * Separated from `main.demo.ts` for two reasons. It is testable, which a `bootstrap`
 * that calls `process.exit` is not. And it is directly reusable: the Phase 4
 * Playwright work needs a deterministic agent runtime, and a global-setup fixture can
 * call this, `listen(0)`, and hand the port to the SPA under test without shelling
 * out to a build. See the README section "Reusing demo mode as a test fixture".
 *
 * Only two dependencies differ from production: the `ModelClient` replays a
 * transcript instead of calling HAIP, and two of the twenty-nine tools are replaced
 * because the software they need is not installed on the demo instance. The HTTP
 * surface, the AG-UI framing, identity resolution and every other tool are the
 * shipped code, so a defect in any of them still shows up here.
 */

export interface DemoGateway {
  readonly server: Server;
  readonly config: DemoGatewayConfig;
  readonly logger: Logger;
  /** Printed by `main.demo.ts` once the port is bound. */
  readonly banner: readonly string[];
  readonly scripts: readonly DemoScript[];
  readonly toolCount: number;
}

export interface CreateDemoGatewayOptions {
  readonly env?: Env;
  readonly scripts?: readonly DemoScript[];
  readonly logger?: Logger;
}

export function createDemoGateway(options: CreateDemoGatewayOptions = {}): DemoGateway {
  const scripts = options.scripts ?? DEMO_SCRIPTS;
  const logger = options.logger ?? createLogger({ service: 'agent-gateway-demo' });

  const config = loadDemoConfig(options.env);
  // Before anything binds: a script that misdeclares its data would put a false
  // claim about the audience's own repository on a projector, so it is a startup
  // failure rather than something a viewer might notice.
  validateDemoScripts(scripts, demoToolProvenance);

  const registry = createDemoToolRegistry();
  const server = createGatewayServer({
    config,
    logger,
    registry,
    nuxeo: new NuxeoRestClient(config.nuxeoBaseUrl),
    model: createDemoModelClient({ scripts, speed: config.demoSpeed, logger }),
    capabilities: demoCapabilities(describeDemoScripts(scripts)),
  });

  return {
    server,
    config,
    logger,
    banner: demoStartupBanner(scripts, config.port),
    scripts,
    toolCount: registry.names().length,
  };
}
