import type { ToolLogger } from '../tools/tool.types';

/**
 * Structured logging.
 *
 * Errors shown to the user are deliberately vague (ADR 001: `RUN_ERROR.message`
 * must not carry stack traces, NXQL, internal hostnames or upstream payloads),
 * so the detail has to land somewhere. It lands here, keyed by `runId`, which is
 * what makes a support report of "it said something went wrong" traceable.
 */
export interface Logger extends ToolLogger {
  child(fields: Record<string, unknown>): Logger;
}

type Level = 'info' | 'warn' | 'error';

function write(level: Level, message: string, fields: Record<string, unknown>): void {
  const line = JSON.stringify({
    level,
    time: new Date().toISOString(),
    message,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else process.stdout.write(`${line}\n`);
}

export function createLogger(base: Record<string, unknown> = {}): Logger {
  return {
    info: (message, fields) => write('info', message, { ...base, ...fields }),
    warn: (message, fields) => write('warn', message, { ...base, ...fields }),
    error: (message, fields) => write('error', message, { ...base, ...fields }),
    child: (fields) => createLogger({ ...base, ...fields }),
  };
}

/** For tests and for the health endpoint, where log noise is not wanted. */
export function createSilentLogger(): Logger {
  const silent: Logger = {
    info: () => undefined,
    warn: () => undefined,
    error: () => undefined,
    child: () => silent,
  };
  return silent;
}
