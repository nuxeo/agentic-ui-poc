import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLogger, createSilentLogger } from './logger';

afterEach(() => vi.restoreAllMocks());

describe('createLogger', () => {
  it('writes one JSON line per entry', () => {
    const written: string[] = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
      written.push(String(chunk));
      return true;
    });

    createLogger({ service: 'agent-gateway' }).info('listening', { port: 3100 });

    expect(written).toHaveLength(1);
    expect(JSON.parse(written[0] ?? '')).toMatchObject({
      level: 'info',
      message: 'listening',
      service: 'agent-gateway',
      port: 3100,
    });
  });

  it('routes warnings and errors to stderr so they are not lost in a log pipeline', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const logger = createLogger();
    logger.warn('degraded');
    logger.error('failed');

    expect(warn).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledOnce();
  });

  // The run id is what makes a vague user-facing error traceable, so a child
  // logger has to keep carrying the parent's fields.
  it('merges parent fields into a child logger', () => {
    const errors: string[] = [];
    vi.spyOn(console, 'error').mockImplementation((line) => errors.push(String(line)));

    createLogger({ service: 'agent-gateway' })
      .child({ runId: 'run-1' })
      .error('run failed', { code: 'AGENT_ERROR' });

    expect(JSON.parse(errors[0] ?? '')).toMatchObject({
      service: 'agent-gateway',
      runId: 'run-1',
      code: 'AGENT_ERROR',
    });
  });
});

describe('createSilentLogger', () => {
  it('writes nothing and keeps returning itself from child()', () => {
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const logger = createSilentLogger();

    logger.info('x');
    logger.child({ a: 1 }).error('y');

    expect(write).not.toHaveBeenCalled();
  });
});
