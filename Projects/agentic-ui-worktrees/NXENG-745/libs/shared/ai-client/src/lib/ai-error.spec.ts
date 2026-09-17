import { describe, expect, it } from 'vitest';
import { aiErrorMessage } from './ai-error';

describe('aiErrorMessage', () => {
  it('reads the Nuxeo Automation exception shape', () => {
    // The regression this function exists for. Callers previously read `error.error`, which
    // the Automation API never sets, so a real failure rendered as the bare fallback.
    const err = {
      status: 500,
      error: {
        'entity-type': 'exception',
        status: 500,
        message: 'Failed to invoke operation: AI.Insights',
      },
    };

    expect(aiErrorMessage(err, 'AI insights unavailable.')).toBe(
      'AI insights unavailable. (HTTP 500: Failed to invoke operation: AI.Insights)',
    );
  });

  it('still reads the retired Express backend shape', () => {
    const err = { status: 502, error: { error: 'upstream model timed out' } };

    expect(aiErrorMessage(err, 'Summary generation failed')).toBe(
      'Summary generation failed (HTTP 502: upstream model timed out)',
    );
  });

  it('prefers the Automation message when a body carries both keys', () => {
    const err = { status: 500, error: { message: 'from Nuxeo', error: 'from Express' } };

    expect(aiErrorMessage(err, 'AI failed')).toBe('AI failed (HTTP 500: from Nuxeo)');
  });

  it('names an unreachable server rather than reporting HTTP 0', () => {
    // Angular uses status 0 for a DNS failure, an offline client or a CORS rejection.
    expect(aiErrorMessage({ status: 0, error: null }, 'AI failed')).toBe(
      'AI failed (could not reach the server)',
    );
  });

  it('falls back untouched when the error carries neither status nor detail', () => {
    expect(aiErrorMessage(new Error('boom'), 'AI failed')).toBe('AI failed');
    expect(aiErrorMessage(undefined, 'AI failed')).toBe('AI failed');
    expect(aiErrorMessage(null, 'AI failed')).toBe('AI failed');
  });

  it('still reports the detail when the thrown object carries no status', () => {
    // Interceptors and test doubles throw bare objects. An earlier revision of this function
    // returned the fallback whenever the status was missing, discarding the one useful part.
    expect(aiErrorMessage({ error: { error: 'model unavailable' } }, 'Summary failed')).toBe(
      'Summary failed: model unavailable',
    );
    expect(aiErrorMessage({ error: { message: 'no such operation' } }, 'AI failed')).toBe(
      'AI failed: no such operation',
    );
  });

  it('reports the status alone when the body carries no usable detail', () => {
    expect(aiErrorMessage({ status: 500, error: {} }, 'AI failed')).toBe('AI failed (HTTP 500)');
    expect(aiErrorMessage({ status: 404 }, 'AI failed')).toBe('AI failed (HTTP 404)');
    expect(aiErrorMessage({ status: 500, error: '   ' }, 'AI failed')).toBe('AI failed (HTTP 500)');
  });

  it('discards an HTML login page instead of pasting it into the UI', () => {
    // An expired session redirects to login.jsp; the markup says nothing about the failure
    // and would otherwise be held in a signal for the lifetime of the page.
    const err = { status: 401, error: '<!doctype html><html><head><title>Log in</title>' };

    expect(aiErrorMessage(err, 'AI failed')).toBe('AI failed (HTTP 401)');
  });

  it('accepts a plain-text body', () => {
    expect(aiErrorMessage({ status: 503, error: 'Service Unavailable' }, 'AI failed')).toBe(
      'AI failed (HTTP 503: Service Unavailable)',
    );
  });

  it('clamps a long detail so the signal cannot retain an unbounded body', () => {
    const err = { status: 500, error: { message: 'x'.repeat(5000) } };

    const message = aiErrorMessage(err, 'AI failed');

    expect(message).toBe(`AI failed (HTTP 500: ${'x'.repeat(200)}…)`);
    expect(message.length).toBeLessThan(250);
  });
});
