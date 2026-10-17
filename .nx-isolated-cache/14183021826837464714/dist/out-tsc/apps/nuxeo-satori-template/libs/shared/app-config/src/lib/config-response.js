/**
 * The response the server's configuration service sends for one layer.
 *
 * `nuxeo-agentic-core` serves `bootstrap.json` and `manifest.json` as an envelope of ordered
 * fragments, one per contribution, each naming the package component that contributed it. The
 * browser applies them in that order, so a package that depends on another wins over it.
 */
export const APP_CONFIG_FORMAT = 'nuxeo-agentic-ui-config/1';
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value, fallback) {
    return typeof value === 'string' ? value : fallback;
}
/**
 * Read a configuration response, or say why it is not one.
 *
 * Only the envelope is accepted. A bare JSON object — what an edited `bootstrap.json` used to be —
 * is refused rather than applied, because nothing on the server serves one: accepting it would
 * keep a second, unattributed format alive for no deployment that can produce it.
 *
 * A fragment whose `content` is not an object is skipped; the rest still apply.
 */
export function readConfigResponse(raw, layer) {
    if (!isRecord(raw) || raw['format'] !== APP_CONFIG_FORMAT) {
        return { invalid: `not a ${APP_CONFIG_FORMAT} response` };
    }
    if (raw['layer'] !== layer) {
        return { invalid: `expected layer "${layer}", got "${String(raw['layer'])}"` };
    }
    const fragments = raw['fragments'];
    const diagnostics = raw['diagnostics'];
    if (!Array.isArray(fragments) || !Array.isArray(diagnostics)) {
        return { invalid: 'fragments and diagnostics must both be lists' };
    }
    return {
        fragments: fragments.filter(isRecord).flatMap((entry) => {
            const content = entry['content'];
            if (!isRecord(content))
                return [];
            return [
                {
                    name: text(entry['name'], ''),
                    component: text(entry['component'], ''),
                    bundle: text(entry['bundle'], ''),
                    source: text(entry['source'], ''),
                    content,
                },
            ];
        }),
        diagnostics: diagnostics.filter(isRecord).map((entry) => ({
            level: text(entry['level'], 'info'),
            code: text(entry['code'], ''),
            message: text(entry['message'], ''),
            component: typeof entry['component'] === 'string' ? entry['component'] : null,
        })),
    };
}
