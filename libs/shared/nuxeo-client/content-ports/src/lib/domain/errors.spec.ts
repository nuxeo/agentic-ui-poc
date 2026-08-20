import { ContentError, TransientError, isContentError } from './errors';

describe('ContentError', () => {
  it('carries the neutral discriminant and preserves the adapter-native cause', () => {
    const cause = new Error('HTTP 404');
    const error = new ContentError('NotFound', 'missing', { cause });

    expect(error.kind).toBe('NotFound');
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('ContentError');
  });

  it('survives instanceof across the subclass boundary', () => {
    // Object.setPrototypeOf in the constructor is what makes this hold when the
    // class is transpiled down; without it `catch (e) { e instanceof ContentError }`
    // silently stops matching.
    const transient = new TransientError('retry me', { retryAfterMs: 500 });

    expect(transient).toBeInstanceOf(TransientError);
    expect(transient).toBeInstanceOf(ContentError);
    expect(transient).toBeInstanceOf(Error);
    expect(transient.kind).toBe('Transient');
    expect(transient.retryAfterMs).toBe(500);
  });

  it('narrows unknown values', () => {
    expect(isContentError(new ContentError('Terminal', 'x'))).toBe(true);
    expect(isContentError(new Error('x'))).toBe(false);
    expect(isContentError('x')).toBe(false);
  });
});
