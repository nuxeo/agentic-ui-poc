import { resolveSessionTimeoutConfig } from './session-timeout.config';

describe('resolveSessionTimeoutConfig', () => {
  it('returns the default config in production', () => {
    expect(resolveSessionTimeoutConfig({ port: '' }).idleTimeoutMs).toBe(30 * 60 * 1000);
  });

  it('honors the dev-only sessionStorage override on port 4200', () => {
    const config = resolveSessionTimeoutConfig({
      port: '4200',
      debugIdleTimeoutMs: '8000',
    });
    expect(config.idleTimeoutMs).toBe(8000);
    expect(config.warningBeforeMs).toBe(3000);
  });
});
