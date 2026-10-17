import { InjectionToken } from '@angular/core';
/** Mirrors Nuxeo `nuxeo.session.timeout` default (30 minutes). */
export const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
/** Warning shown this many milliseconds before idle logout. */
export const DEFAULT_WARNING_BEFORE_MS = 2 * 60 * 1000;
export const DEFAULT_SESSION_TIMEOUT_CONFIG = {
    idleTimeoutMs: DEFAULT_IDLE_TIMEOUT_MS,
    warningBeforeMs: DEFAULT_WARNING_BEFORE_MS,
};
/** Dev-only: set in sessionStorage on `:4200` to shorten idle timeout for manual QA. */
export const DEBUG_IDLE_TIMEOUT_STORAGE_KEY = 'agentic_ui_debug_idle_timeout_ms';
export function resolveSessionTimeoutConfig(options) {
    const port = options?.port ?? (typeof window !== 'undefined' ? window.location.port : '');
    const raw = options?.debugIdleTimeoutMs ??
        (typeof window !== 'undefined' ? sessionStorage.getItem(DEBUG_IDLE_TIMEOUT_STORAGE_KEY) : null);
    if (port === '4200' && raw) {
        const idleTimeoutMs = Number(raw);
        if (Number.isFinite(idleTimeoutMs) && idleTimeoutMs >= 5_000) {
            return {
                idleTimeoutMs,
                warningBeforeMs: Math.min(3_000, Math.max(1_000, idleTimeoutMs - 1_000)),
            };
        }
    }
    return DEFAULT_SESSION_TIMEOUT_CONFIG;
}
export const SESSION_TIMEOUT_CONFIG = new InjectionToken('SESSION_TIMEOUT_CONFIG', {
    providedIn: 'root',
    factory: () => resolveSessionTimeoutConfig(),
});
