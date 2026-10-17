/**
 * Layer 0 bootstrap configuration — the part of the configuration the shell
 * needs before the user authenticates: where Nuxeo is, what the product is
 * called, which theme to start in, sign-in options and the integrations it
 * reaches. What the interface offers and how it is arranged belongs in the
 * runtime manifest (Layer 1), which is fetched beside this file; the fields a
 * document type shows are per-type layout files, indexed by `layouts.json`.
 *
 * The constants here are the **compiled-in fallback**. The configuration
 * endpoint in `nuxeo-agentic-core` answers `agentic-ui-config/bootstrap.json`
 * with the ordered `bootstrap` fragments of our defaults and of every installed
 * configuration package, and `AppConfigService` folds them, in that order, over
 * these constants. Nothing is read from a file a customer edits on the server.
 * The endpoint serves it before authentication, so a fragment must hold nothing
 * sensitive.
 */
/**
 * The four palettes compiled into `styles.scss`. Their `tokens` maps are empty
 * because the packaged themes are fully described by the Sass mixins; the maps
 * exist so a customer can rebrand any of them, or add a fifth theme, in JSON.
 */
export const DEFAULT_APP_THEMES = [
    {
        id: 'nuxeo',
        labelKey: 'settings.themes.name.nuxeo',
        label: 'Nuxeo',
        base: 'nuxeo',
        preview: {
            sidebar: '#1a237e',
            surface: '#f5f5f5',
            header: '#e8eaf6',
            accent: '#2196f3',
            tile: '#dce3f5',
        },
        tokens: {},
    },
    {
        id: 'dark',
        labelKey: 'settings.themes.name.dark',
        label: 'Dark',
        base: 'dark',
        preview: {
            sidebar: '#1e2a3a',
            surface: '#0d1117',
            header: '#161b22',
            accent: '#3d5afe',
            tile: '#21262d',
        },
        tokens: {},
    },
    {
        id: 'kawaii',
        labelKey: 'settings.themes.name.kawaii',
        label: 'Kawaii',
        base: 'kawaii',
        preview: {
            sidebar: '#880e4f',
            surface: '#fce4ec',
            header: '#f8bbd9',
            accent: '#e91e63',
            tile: '#f5c6d6',
        },
        tokens: {},
    },
    {
        id: 'light',
        labelKey: 'settings.themes.name.light',
        label: 'Light',
        base: 'light',
        preview: {
            sidebar: '#37474f',
            surface: '#eceff1',
            header: '#cfd8dc',
            accent: '#00bcd4',
            tile: '#b0bec5',
        },
        tokens: {},
    },
];
/**
 * Reproduces today's compiled-in behaviour exactly, so a deployment that ships
 * no configuration file at all is indistinguishable from the current release.
 */
export const DEFAULT_APP_BOOTSTRAP_CONFIG = {
    nuxeoApiOrigin: '',
    nuxeoServerUrl: null,
    aiBackendUrl: '/nuxeo',
    branding: {
        // These two differ today: the shell header falls back to "Hyland Nuxeo"
        // while `index.html` sets the browser tab to "Nuxeo Platform". Both are
        // reproduced exactly so that adopting configuration changes nothing.
        applicationTitle: 'Hyland Nuxeo',
        documentTitle: 'Nuxeo Platform',
        logo: null,
    },
    defaultThemeId: 'nuxeo',
    themes: DEFAULT_APP_THEMES,
    defaultLanguage: 'en',
    // The locales a catalogue actually ships for, in `apps/nuxeo-ui/public/i18n/`. Listing a
    // locale here that has no catalogue would advertise a language the application cannot
    // render, which `checkAdvertisedLocalesShip` fails.
    //
    // Six ship besides English — fr, de, ja, nl, th and zh (Simplified Chinese, Crowdin's
    // `zh-CN`) — each pulled from Crowdin once approved. It does NOT mean every key is translated:
    // `setFallbackLang('en')` covers gaps, and a Crowdin pull fills every unapproved string with its
    // English source. `checkTranslationCatalogues` warns on a missing key and fails only on one
    // `en.json` does not have. See D8d in docs/i18n-localization-plan.md.
    //
    // Nothing renders this list yet: there is no language picker (NXSAT-294), and only the config
    // parser reads it. A deployment selects its language through `defaultLanguage`.
    //
    // Adding a language here also means adding it to `download_translations_args` in
    // .github/workflows/crowdin-pull.yaml, which downloads only the languages the app ships.
    availableLanguages: ['en', 'fr', 'de', 'ja', 'nl', 'th', 'zh'],
    integrations: {
        arender: null,
        knowledgeDiscoveryOperations: {},
        knowledgeEnrichmentOperations: {},
    },
    session: {
        idleTimeoutMs: null,
        warningBeforeMs: null,
    },
    sso: {
        // Empty on purpose. `main` commented these same two entries out of
        // `nuxeo-sso.providers.ts` — "hidden until SAML is ready for Satori beta" — because the
        // buttons rendered but no registration existed behind them. Shipping azure and okta as
        // the packaged default would put two non-working buttons back on the login page for
        // every deployment, so the decision is preserved here.
        //
        // The mechanism is the improvement rather than the values: registration IDs must match
        // the Nuxeo OpenID/SAML setup, which is exactly the per-deployment fact that used to
        // require editing our source. A deployment adds its own under `sso.endpoints` in
        // `bootstrap.json`, with no rebuild:
        //
        //   "sso": { "endpoints": [
        //     { "id": "azure", "label": "Log In With Azure SAML",
        //       "path": "/nuxeo/oauth2/authorization/azure" }
        //   ] }
        endpoints: [],
        postLoginPath: '/dashboard',
        returnQueryParam: 'requestedUrl',
    },
};
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readString(source, key, fallback) {
    const value = source[key];
    return typeof value === 'string' ? value : fallback;
}
function readNullableString(source, key, fallback) {
    const value = source[key];
    if (typeof value === 'string')
        return value;
    return value === null ? null : fallback;
}
/** Keeps only string-valued entries: a token map with an object in it would emit `[object Object]` into CSS. */
function readTokens(value) {
    if (!isRecord(value))
        return {};
    const tokens = {};
    for (const [key, raw] of Object.entries(value)) {
        if (typeof raw === 'string')
            tokens[key] = raw;
    }
    return tokens;
}
function readStringArray(source, key, fallback) {
    const value = source[key];
    if (!Array.isArray(value))
        return fallback;
    const entries = value.filter((entry) => typeof entry === 'string');
    return entries.length > 0 ? entries : fallback;
}
function mergeTheme(base, patch) {
    const preview = isRecord(patch['preview']) ? patch['preview'] : {};
    const relabelled = typeof patch['label'] === 'string';
    const labelKey = readString(patch, 'labelKey', relabelled ? '' : (base.labelKey ?? ''));
    return {
        id: readString(patch, 'id', base.id),
        label: readString(patch, 'label', base.label),
        ...(labelKey ? { labelKey } : {}),
        base: readString(patch, 'base', base.base),
        preview: {
            sidebar: readString(preview, 'sidebar', base.preview.sidebar),
            surface: readString(preview, 'surface', base.preview.surface),
            header: readString(preview, 'header', base.preview.header),
            accent: readString(preview, 'accent', base.preview.accent),
            tile: readString(preview, 'tile', base.preview.tile),
        },
        tokens: { ...base.tokens, ...readTokens(patch['tokens']) },
    };
}
/**
 * Merge configured themes over the packaged ones by `id`, so a customer can
 * restyle one theme without having to restate the other three, and can append
 * new ones. An entry without a usable `id` is dropped rather than guessed at.
 */
function mergeThemes(base, value) {
    if (!Array.isArray(value))
        return base;
    const merged = base.map((theme) => ({ ...theme }));
    for (const entry of value) {
        if (!isRecord(entry))
            continue;
        const id = entry['id'];
        if (typeof id !== 'string' || id.trim() === '')
            continue;
        const existing = merged.findIndex((theme) => theme.id === id);
        if (existing >= 0) {
            merged[existing] = mergeTheme(merged[existing], entry);
        }
        else {
            merged.push(mergeTheme({
                id,
                label: id,
                base: DEFAULT_APP_BOOTSTRAP_CONFIG.defaultThemeId,
                preview: { sidebar: '', surface: '', header: '', accent: '', tile: '' },
                tokens: {},
            }, entry));
        }
    }
    return merged;
}
function readPositiveNumber(source, key, fallback) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0)
        return value;
    return value === null ? null : fallback;
}
/** Only string entries survive: an operation ID that is not a string cannot be called. */
function readStringRecord(value) {
    if (!isRecord(value))
        return {};
    const record = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry === 'string' && entry.trim() !== '')
            record[key] = entry;
    }
    return record;
}
/**
 * An ARender configuration only if the manifest supplies a non-blank **`viewerOrigin`**, otherwise
 * `null`. `nuxeoInternalUrl` is carried through but not required — see the note on the check below.
 *
 * Falls back to `base` per field so a partial override still merges over an existing complete
 * configuration; it is the *result* that must be complete, not the patch.
 */
function completeARenderConfig(patch, base) {
    const viewerOrigin = readString(patch, 'viewerOrigin', base?.viewerOrigin ?? '').trim();
    const nuxeoInternalUrl = readString(patch, 'nuxeoInternalUrl', base?.nuxeoInternalUrl ?? '').trim();
    // Only `viewerOrigin` is required. It names the viewer and, since the server now supplies the
    // previewer URL, doubles as the origin allow-list that URL is checked against.
    //
    // `nuxeoInternalUrl` used to be required too, on the reasoning that "half an ARender
    // configuration is worse than none". That stopped being true when the client stopped building
    // nxfile URLs: NEV's connector fetches blobs itself over OAuth2. Requiring it now would force a
    // deployment that retired the sidecar to invent a dummy value, and omitting it would silently
    // disable the integration.
    if (!viewerOrigin)
        return null;
    return { viewerOrigin, nuxeoInternalUrl };
}
function mergeIntegrations(base, value) {
    if (!isRecord(value))
        return base;
    const arender = value['arender'];
    return {
        // `viewerOrigin` is required and enforced by `completeARenderConfig`, because a blank one is
        // not inert: `fetch('')` resolves against the *application's own* origin, so an availability
        // probe would report a viewer that is not deployed, and that origin would end up on the
        // allow-list the server-supplied URL is checked against.
        //
        // `nuxeoInternalUrl` is **not** required. It was, when the client built nxfile URLs for the
        // nginx sidecar; NEV's connector resolves blobs itself over OAuth2, so requiring it would only
        // force deployments that retired the sidecar to invent a value.
        // `null` is handled before the record check, matching `readNullableString`'s
        // `value === null ? null : fallback`. Without it, `{ integrations: { arender: null } }` fell
        // through to `base.arender` and preserved whatever was already configured — so a
        // higher-priority manifest could not turn the integration *off*, only reconfigure it. That
        // contradicts the contract this change introduced, which is that `null` means no annotation
        // viewer.
        arender: arender === null
            ? null
            : isRecord(arender)
                ? completeARenderConfig(arender, base.arender)
                : base.arender,
        knowledgeDiscoveryOperations: {
            ...base.knowledgeDiscoveryOperations,
            ...readStringRecord(value['knowledgeDiscoveryOperations']),
        },
        knowledgeEnrichmentOperations: {
            ...base.knowledgeEnrichmentOperations,
            ...readStringRecord(value['knowledgeEnrichmentOperations']),
        },
    };
}
function mergeSession(base, value) {
    if (!isRecord(value))
        return base;
    return {
        idleTimeoutMs: readPositiveNumber(value, 'idleTimeoutMs', base.idleTimeoutMs),
        warningBeforeMs: readPositiveNumber(value, 'warningBeforeMs', base.warningBeforeMs),
    };
}
function readSsoEndpoints(base, value) {
    if (!Array.isArray(value))
        return base;
    const endpoints = [];
    for (const entry of value) {
        if (!isRecord(entry))
            continue;
        const id = entry['id'];
        const path = entry['path'];
        // A button with no ID or nowhere to send the browser is not a login option.
        if (typeof id !== 'string' || id.trim() === '')
            continue;
        if (typeof path !== 'string' || !path.startsWith('/'))
            continue;
        endpoints.push({ id, path, label: readString(entry, 'label', id) });
    }
    return endpoints;
}
/**
 * Early rejection of a configured logo `src`, on the string as written.
 *
 * Not the security boundary — {@link resolveBrandingLogoUrl} is, because it checks the URL the
 * browser will actually load. This only refuses what is wrong whatever it resolves to: control
 * characters and backslashes (the URL parser deletes or rewrites them, so they disguise a path),
 * a `data:` URI that is not an image or carries no payload, a scheme other than `https:`, and an
 * absolute path, a `..` segment (including `%2e%2e`) or no path at all in a relative one.
 */
function isAcceptedLogoSrc(src) {
    if (src.includes('\\') || [...src].some((char) => char < ' ' || char === '\u007f'))
        return false;
    // `#` starts a fragment, so a payload that begins with it is empty.
    if (/^data:/i.test(src))
        return /^data:image\/[a-z0-9.+-]+(?:;[^,#]*)?,[^#]/i.test(src);
    if (/^[a-z][a-z0-9+.-]*:/i.test(src)) {
        if (!/^https:\/\/[^/]/i.test(src))
            return false;
        try {
            return new URL(src).protocol === 'https:';
        }
        catch {
            return false;
        }
    }
    if (src.startsWith('/'))
        return false;
    const path = src.split(/[?#]/, 1)[0] ?? '';
    // A query or fragment alone resolves to bootstrap.json itself, which no <img> can render.
    if (!path)
        return false;
    return !path.replace(/%2e/gi, '.').split('/').includes('..');
}
/**
 * `null` clears a logo an earlier layer set; anything unusable keeps `base`, so a malformed entry
 * degrades to the packaged marks rather than to a broken image.
 */
function readLogo(value, base) {
    if (value === null)
        return null;
    if (!isRecord(value))
        return base;
    const src = typeof value['src'] === 'string' ? value['src'].trim() : '';
    if (!src || !isAcceptedLogoSrc(src))
        return base;
    const alt = value['alt'];
    return { src, alt: typeof alt === 'string' ? alt.trim() : '' };
}
/**
 * The URL an `<img>` may load for a configured logo, or `null` when it could reach something other
 * than a static asset.
 *
 * A relative `src` resolves against the directory `bootstrap.json` was read from, because the
 * installer replaces the application bundle on every upgrade and leaves that directory alone.
 *
 * The check runs on the **resolved** URL, after the parser has dropped tabs and newlines and
 * collapsed `..` and `%2e%2e` — the forms a check on the raw string can be talked past. On any
 * origin that serves Nuxeo the URL must stay inside the configuration directory: anywhere else
 * there may be a REST endpoint, which an `<img>` requests with the session cookie and without the
 * HTTP interceptor. Elsewhere only `https:` is allowed, so a CDN logo still works.
 *
 * @param nuxeoOrigins origins that serve Nuxeo besides the one `configUrl` is on
 */
export function resolveBrandingLogoUrl(src, configUrl, nuxeoOrigins = []) {
    let url;
    try {
        url = new URL(src, configUrl);
    }
    catch {
        return null;
    }
    if (url.protocol === 'data:')
        return url.href;
    const config = new URL(configUrl);
    if (url.origin === config.origin) {
        return isInsideDirectory(url.pathname, new URL('.', config).pathname) ? url.href : null;
    }
    // Cookies are scoped by host, not by scheme or port, so any origin on a Nuxeo host carries the
    // session.
    const nuxeoHosts = [config.origin, ...nuxeoOrigins].map((origin) => parseUrl(origin)?.hostname);
    if (nuxeoHosts.includes(url.hostname))
        return null;
    return url.protocol === 'https:' ? url.href : null;
}
/**
 * Whether the server, not just the browser, reads `pathname` as lying inside `directory`.
 *
 * Tomcat drops `;` path parameters from each segment before it collapses dot segments, so `..;x`
 * is an ordinary segment to the browser and a parent directory to Nuxeo. A proxy that decodes
 * before forwarding does the same with `%3b`, with `%2f` as a separator, and with `%252e%252e`,
 * which Tomcat then decodes again to `..`. A segment carrying any of those — including an escape
 * left over after decoding once — or one that does not decode, is refused.
 */
function isInsideDirectory(pathname, directory) {
    if (!pathname.startsWith(directory))
        return false;
    return pathname
        .slice(directory.length)
        .split('/')
        .every((segment) => {
        try {
            return !/[;/\\%]/.test(decodeURIComponent(segment));
        }
        catch {
            return false;
        }
    });
}
/**
 * Every origin that serves Nuxeo for this deployment: the application's own, which proxies or is
 * Nuxeo, plus a configured `nuxeoApiOrigin` and `nuxeoServerUrl`. Each is resolved against
 * `baseUri`, as API requests are, so a protocol-relative `//api.example` counts; a relative value
 * resolves to the application's own origin.
 */
export function nuxeoOriginsOf(config, baseUri) {
    const origins = new Set();
    for (const candidate of [baseUri, config.nuxeoApiOrigin, config.nuxeoServerUrl]) {
        if (!candidate)
            continue;
        const origin = parseUrl(candidate, baseUri)?.origin;
        if (origin)
            origins.add(origin);
    }
    return [...origins];
}
/** `new URL` without the throw. `URL.parse` would do, but only browsers from 2024 have it. */
function parseUrl(value, base) {
    try {
        return new URL(value, base);
    }
    catch {
        return null;
    }
}
function mergeSso(base, value) {
    if (!isRecord(value))
        return base;
    return {
        endpoints: readSsoEndpoints(base.endpoints, value['endpoints']),
        postLoginPath: readNullableString(value, 'postLoginPath', base.postLoginPath),
        returnQueryParam: readNullableString(value, 'returnQueryParam', base.returnQueryParam),
    };
}
/**
 * Overlay a parsed configuration document onto the packaged defaults.
 *
 * Deliberately total: any input, including `null`, a string, or an object whose
 * fields have the wrong types, yields a usable configuration. A malformed
 * configuration file must degrade to the packaged behaviour rather than prevent
 * the application from starting.
 */
export function mergeBootstrapConfig(base, patch) {
    if (!isRecord(patch))
        return base;
    const branding = isRecord(patch['branding']) ? patch['branding'] : {};
    return {
        nuxeoApiOrigin: readString(patch, 'nuxeoApiOrigin', base.nuxeoApiOrigin),
        nuxeoServerUrl: readNullableString(patch, 'nuxeoServerUrl', base.nuxeoServerUrl),
        aiBackendUrl: readString(patch, 'aiBackendUrl', base.aiBackendUrl),
        branding: {
            applicationTitle: readString(branding, 'applicationTitle', base.branding.applicationTitle),
            documentTitle: readString(branding, 'documentTitle', base.branding.documentTitle),
            logo: readLogo(branding['logo'], base.branding.logo),
        },
        defaultThemeId: readString(patch, 'defaultThemeId', base.defaultThemeId),
        themes: mergeThemes(base.themes, patch['themes']),
        defaultLanguage: readString(patch, 'defaultLanguage', base.defaultLanguage),
        availableLanguages: readStringArray(patch, 'availableLanguages', base.availableLanguages),
        integrations: mergeIntegrations(base.integrations, patch['integrations']),
        session: mergeSession(base.session, patch['session']),
        sso: mergeSso(base.sso, patch['sso']),
    };
}
/** The configured theme, or the default one, or the first one — never `undefined`. */
export function resolveTheme(config, id) {
    return (config.themes.find((theme) => theme.id === id) ??
        config.themes.find((theme) => theme.id === config.defaultThemeId) ??
        config.themes[0] ??
        DEFAULT_APP_THEMES[0]);
}
//# sourceMappingURL=bootstrap-config.js.map