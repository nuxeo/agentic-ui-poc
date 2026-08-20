import { HaipModelClient } from './agent/model-client';
import { ConfigurationError, loadConfig } from './config';
import { createGatewayServer } from './http/server';
import { createLogger } from './logging/logger';
import { NuxeoRestClient } from './nuxeo/nuxeo-rest-client';
import { createDefaultToolRegistry } from './tools/default-registry';

/**
 * Process entry point. Configuration is validated before anything binds a port,
 * so a misconfigured container fails immediately and visibly rather than
 * accepting traffic it cannot serve.
 */
function bootstrap(): void {
  const logger = createLogger({ service: 'agent-gateway' });

  let config;
  try {
    config = loadConfig();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }

  const registry = createDefaultToolRegistry();
  const server = createGatewayServer({
    config,
    logger,
    registry,
    nuxeo: new NuxeoRestClient(config.nuxeoBaseUrl),
    model: new HaipModelClient({ baseUrl: config.haipBaseUrl, apiKey: config.haipApiKey }),
  });

  server.listen(config.port, () => {
    logger.info('agent gateway listening', {
      port: config.port,
      tools: registry.names().length,
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
