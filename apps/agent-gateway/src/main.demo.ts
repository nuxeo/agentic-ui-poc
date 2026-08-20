import { ConfigurationError } from './config';
import { createDemoGateway, type DemoGateway } from './demo/demo-server';
import { DemoScriptError } from './demo/demo-script.types';

/**
 * Entry point for scripted demo mode. **Never** imported by `main.ts`.
 *
 * That separation is the control the other three rest on — see
 * `demo/demo-config.ts` for all four, and `demo/production-isolation.spec.ts`, which
 * walks the production import graph and fails if a demo module ever becomes reachable
 * from it. A production image does not contain the scripts, which no environment
 * variable can undo.
 *
 * Everything that composes the gateway lives in `demo/demo-server.ts`, so it can be
 * tested and reused as a Playwright fixture. What is left here is the part that only
 * a process can do: exit non-zero, print to a console, and handle signals.
 */
function bootstrap(): void {
  let gateway: DemoGateway;
  try {
    gateway = createDemoGateway();
  } catch (error) {
    // Both failures are the operator's to fix and both list every problem at once,
    // so the message is the whole output — no stack trace to read past.
    if (error instanceof ConfigurationError || error instanceof DemoScriptError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  const { server, config, logger } = gateway;

  // A busy port five minutes before a demo should produce one actionable line, not
  // an unhandled 'error' event and a stack trace.
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${config.port} is already in use. Stop whatever is using it, or start with ` +
          `PORT=<other> — remembering that apps/nuxeo-ui/proxy.conf.local.json forwards ` +
          `/agent to 3100.`,
      );
      process.exit(1);
    }
    throw error;
  });

  server.listen(config.port, () => {
    for (const line of gateway.banner) console.warn(line);
    logger.warn('agent gateway listening in SCRIPTED DEMO MODE', {
      mode: 'demo-scripted',
      port: config.port,
      scripts: gateway.scripts.length,
      tools: gateway.toolCount,
      demoSpeed: config.demoSpeed,
      // Deliberately no credential of any kind in the startup log.
      nuxeoBaseUrl: config.nuxeoBaseUrl,
    });
  });

  for (const signal of ['SIGTERM', 'SIGINT'] as const) {
    process.on(signal, () => {
      logger.info('shutting down', { signal });
      server.close(() => process.exit(0));
    });
  }
}

bootstrap();
