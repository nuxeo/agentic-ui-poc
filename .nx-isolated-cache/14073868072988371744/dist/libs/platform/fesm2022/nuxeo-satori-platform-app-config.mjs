import * as i0 from '@angular/core';
import { InjectionToken, inject, signal, computed, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { firstValueFrom, timeout, catchError, of, TimeoutError } from 'rxjs';

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
const DEFAULT_APP_THEMES = [
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
const DEFAULT_APP_BOOTSTRAP_CONFIG = {
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
function isRecord$3(value) {
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
    if (!isRecord$3(value))
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
    const preview = isRecord$3(patch['preview']) ? patch['preview'] : {};
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
        if (!isRecord$3(entry))
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
    if (!isRecord$3(value))
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
    if (!isRecord$3(value))
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
            : isRecord$3(arender)
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
    if (!isRecord$3(value))
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
        if (!isRecord$3(entry))
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
    if (!isRecord$3(value))
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
function resolveBrandingLogoUrl(src, configUrl, nuxeoOrigins = []) {
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
function nuxeoOriginsOf(config, baseUri) {
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
    if (!isRecord$3(value))
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
function mergeBootstrapConfig(base, patch) {
    if (!isRecord$3(patch))
        return base;
    const branding = isRecord$3(patch['branding']) ? patch['branding'] : {};
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
function resolveTheme(config, id) {
    return (config.themes.find((theme) => theme.id === id) ??
        config.themes.find((theme) => theme.id === config.defaultThemeId) ??
        config.themes[0] ??
        DEFAULT_APP_THEMES[0]);
}

/**
 * Layer 0/1 runtime manifest.
 *
 * Contributed by Marketplace packages as `manifest` fragments to the server's configuration
 * service and served, in contribution order, at `agentic-ui-config/manifest.json`. The browser
 * folds the fragments over {@link DEFAULT_APP_RUNTIME_MANIFEST} with
 * {@link mergeRuntimeManifest}, so a later package wins key by key.
 */
/** An empty manifest: no overrides, so the packaged behaviour stands unchanged. */
const DEFAULT_APP_RUNTIME_MANIFEST = {
    version: 1,
    navItems: [],
    actions: {},
    rules: {},
    presets: {},
    featureToggles: {},
    labels: {},
    extensionLayers: [],
};
function isRecord$2(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readNavItems(value) {
    if (!Array.isArray(value))
        return DEFAULT_APP_RUNTIME_MANIFEST.navItems;
    const items = [];
    value.forEach((entry, index) => {
        if (!isRecord$2(entry))
            return;
        const id = entry['id'];
        const route = entry['route'];
        // Without an ID there is nothing to address, and without a route nothing to
        // navigate to — an entry missing either is dropped, not defaulted.
        if (typeof id !== 'string' || id.trim() === '')
            return;
        if (typeof route !== 'string' || route.trim() === '')
            return;
        const label = entry['label'];
        const icon = entry['icon'];
        const order = entry['order'];
        const visible = entry['visible'];
        items.push({
            id,
            route,
            label: typeof label === 'string' ? label : id,
            icon: typeof icon === 'string' ? icon : 'folder',
            order: typeof order === 'number' && Number.isFinite(order) ? order : index,
            visible: typeof visible === 'boolean' ? visible : true,
        });
    });
    return items;
}
function readActions(value) {
    if (!isRecord$2(value))
        return DEFAULT_APP_RUNTIME_MANIFEST.actions;
    const actions = {};
    for (const [id, entry] of Object.entries(value)) {
        if (!isRecord$2(entry))
            continue;
        const visible = entry['visible'];
        const rule = entry['rule'];
        const label = entry['label'];
        const order = entry['order'];
        actions[id] = {
            visible: typeof visible === 'boolean' ? visible : true,
            rule: typeof rule === 'string' ? rule : null,
            label: typeof label === 'string' ? label : null,
            order: typeof order === 'number' && Number.isFinite(order) ? order : null,
        };
    }
    return actions;
}
function readBooleanMap(value) {
    if (!isRecord$2(value))
        return {};
    const map = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry === 'boolean')
            map[key] = entry;
    }
    return map;
}
function readStringMap(value) {
    if (!isRecord$2(value))
        return {};
    const map = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry === 'string')
            map[key] = entry;
    }
    return map;
}
/**
 * Overlay one manifest fragment onto the manifest built so far.
 *
 * Total in the same way as {@link mergeBootstrapConfig}: a package that contributes a
 * malformed fragment must get the packaged application back, not a blank screen.
 */
function mergeRuntimeManifest(base, patch) {
    if (!isRecord$2(patch))
        return base;
    const version = patch['version'];
    return {
        version: typeof version === 'number' && Number.isFinite(version) ? version : base.version,
        navItems: patch['navItems'] === undefined ? base.navItems : readNavItems(patch['navItems']),
        actions: { ...base.actions, ...readActions(patch['actions']) },
        rules: { ...base.rules, ...readBooleanMap(patch['rules']) },
        presets: isRecord$2(patch['presets']) ? { ...base.presets, ...patch['presets'] } : base.presets,
        featureToggles: {
            ...base.featureToggles,
            ...readBooleanMap(patch['featureToggles']),
        },
        labels: { ...base.labels, ...readStringMap(patch['labels']) },
        // Appended as a layer rather than merged here. The merge of this subtree has its own
        // semantics, implemented once in `@nuxeo/satori-platform/extensions`; a second, shallower
        // merge at this level would silently disagree with it.
        extensionLayers: isRecord$2(patch['extensions'])
            ? [...base.extensionLayers, patch['extensions']]
            : base.extensionLayers,
    };
}

/** Directory name, relative to the application bundle's parent, the configuration is served from. */
const APP_CONFIG_DIRECTORY = 'agentic-ui-config';
const APP_BOOTSTRAP_CONFIG_FILE = 'bootstrap.json';
const APP_MANIFEST_CONFIG_FILE = 'manifest.json';
/**
 * Resolve the bootstrap configuration URL as a **sibling** of the application bundle rather than
 * a file inside it.
 *
 * Production base href is `/nuxeo/agentic-ui/`, giving `/nuxeo/agentic-ui-config/bootstrap.json`,
 * which the configuration servlet in `nuxeo-agentic-core` answers with the bootstrap fragments
 * every installed package contributed. Nothing on the server's disk is served at that path.
 *
 * Under `nx serve` the base href is `/`, where `../` clamps to the root and gives
 * `/agentic-ui-config/bootstrap.json`, served from the gitignored
 * `apps/nuxeo-ui/public/agentic-ui-config/` when a developer puts a response there.
 *
 * @param baseUri normally `document.baseURI`
 */
function resolveBootstrapConfigUrl(baseUri) {
    const url = new URL(`../${APP_CONFIG_DIRECTORY}/${APP_BOOTSTRAP_CONFIG_FILE}`, baseUri);
    return `${url.pathname}${url.search}`;
}
/** The manifest response, served beside the bootstrap one. */
function resolveManifestConfigUrl(bootstrapUrl) {
    const path = bootstrapUrl.split(/[?#]/, 1)[0] ?? '';
    return `${path.slice(0, path.lastIndexOf('/') + 1)}${APP_MANIFEST_CONFIG_FILE}`;
}
/**
 * Where the bootstrap configuration is fetched from. Overridable so tests and
 * alternative deployment layouts do not have to fake `document.baseURI`.
 */
const APP_BOOTSTRAP_CONFIG_URL = new InjectionToken('APP_BOOTSTRAP_CONFIG_URL', {
    providedIn: 'root',
    factory: () => resolveBootstrapConfigUrl(document.baseURI),
});
/** Where the manifest is fetched from: beside the bootstrap response unless overridden. */
const APP_MANIFEST_CONFIG_URL = new InjectionToken('APP_MANIFEST_CONFIG_URL', {
    providedIn: 'root',
    factory: () => resolveManifestConfigUrl(inject(APP_BOOTSTRAP_CONFIG_URL)),
});

/**
 * The response the server's configuration service sends for one layer.
 *
 * `nuxeo-agentic-core` serves `bootstrap.json` and `manifest.json` as an envelope of ordered
 * fragments, one per contribution, each naming the package component that contributed it. The
 * browser applies them in that order, so a package that depends on another wins over it.
 */
const APP_CONFIG_FORMAT = 'nuxeo-agentic-ui-config/1';
function isRecord$1(value) {
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
function readConfigResponse(raw, layer) {
    if (!isRecord$1(raw) || raw['format'] !== APP_CONFIG_FORMAT) {
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
        fragments: fragments.filter(isRecord$1).flatMap((entry) => {
            const content = entry['content'];
            if (!isRecord$1(content))
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
        diagnostics: diagnostics.filter(isRecord$1).map((entry) => ({
            level: text(entry['level'], 'info'),
            code: text(entry['code'], ''),
            message: text(entry['message'], ''),
            component: typeof entry['component'] === 'string' ? entry['component'] : null,
        })),
    };
}

/**
 * Presales presets: named sets of configuration a demo package ships, so one demo server can be
 * shown to several prospects without redeploying.
 *
 * A bootstrap fragment declares them under `presales`:
 *
 * ```json
 * "presales": {
 *   "presetSwitching": true,
 *   "presets": {
 *     "acme": { "label": "Acme Insurance", "bootstrap": { ... }, "manifest": { ... } }
 *   }
 * }
 * ```
 *
 * A browser chooses one with `?preset=<name>`, which is remembered in `localStorage`;
 * `?preset=` with no name clears it. The chosen preset's `bootstrap` and `manifest` are applied
 * after every package's fragments, so it wins over all of them. **Nothing happens unless a
 * package sets `presetSwitching: true`** — a customer's server ignores the parameter and the
 * stored choice alike. Presets are package content, served anonymously like every fragment, and
 * the parameter only picks among them.
 */
const PRESET_QUERY_PARAM = 'preset';
const PRESET_STORAGE_KEY = 'agentic-ui.preset';
const PRESET_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Collect `presales` across bootstrap fragments in order. A later `presetSwitching` wins, and a
 * later preset with the same name replaces the earlier one whole.
 */
function readPresales(fragments) {
    let presetSwitching = false;
    // Looked up by a name from the URL, so `toString` or `__proto__` must not resolve to a builtin.
    const presets = Object.create(null);
    for (const fragment of fragments) {
        if (!isRecord(fragment) || !isRecord(fragment['presales']))
            continue;
        const presales = fragment['presales'];
        if (typeof presales['presetSwitching'] === 'boolean') {
            presetSwitching = presales['presetSwitching'];
        }
        if (!isRecord(presales['presets']))
            continue;
        for (const [name, entry] of Object.entries(presales['presets'])) {
            if (!PRESET_NAME.test(name) || !isRecord(entry))
                continue;
            const label = entry['label'];
            presets[name] = {
                name,
                label: typeof label === 'string' && label.trim() !== '' ? label : name,
                bootstrap: isRecord(entry['bootstrap']) ? entry['bootstrap'] : null,
                manifest: isRecord(entry['manifest']) ? entry['manifest'] : null,
            };
        }
    }
    return { presetSwitching, presets };
}
/**
 * The preset the URL asks for: a name, `''` to clear the remembered one, or `undefined` when the
 * URL does not mention it. Read from the query and from the hash's query, because the app routes
 * with `withHashLocation()` and a link may put the parameter on either side of the `#`.
 */
function requestedPreset(location) {
    const hashQuery = location.hash.includes('?')
        ? location.hash.slice(location.hash.indexOf('?'))
        : '';
    for (const query of [location.search, hashQuery]) {
        const params = new URLSearchParams(query);
        if (params.has(PRESET_QUERY_PARAM))
            return (params.get(PRESET_QUERY_PARAM) ?? '').trim();
    }
    return undefined;
}

/**
 * How long each half may take before the application starts on the packaged defaults instead.
 * `load()` runs as an `APP_INITIALIZER` and `HttpClient` has no timeout of its own, so a server that
 * accepts the request and never answers would otherwise hold the first render forever.
 */
const CONFIG_LOAD_TIMEOUT_MS = 10_000;
/**
 * Loads the two halves of the Layer 0/1 configuration and exposes them as signals.
 *
 * Both come from the server's configuration service: `bootstrap.json` and `manifest.json`, each an
 * ordered list of fragments contributed by Marketplace packages. Both are anonymous, so they are
 * fetched once, together, before sign-in, and nothing about them changes with the session.
 *
 * Uses an `HttpClient` of its own, built on `HttpBackend`, which the repository otherwise reserves
 * for `NuxeoApiBase`. That is deliberate and confined to this service: these two requests skip
 * every interceptor. An interceptor that reads configuration — the host application's auth
 * interceptor resolves the Nuxeo API origin and the sign-in services — would otherwise resolve it
 * while it is still loading, and Angular keeps a token's first value for the life of the
 * application, so every package-contributed value it read would be replaced by its default. Both
 * halves are anonymous, so skipping the interceptor also keeps the signed-in user's
 * `Authorization` header off them.
 *
 * The load is **tolerant by contract**. An unreachable service, an error status, a malformed
 * response or no answer within {@link CONFIG_LOAD_TIMEOUT_MS} falls back to the packaged defaults
 * and records why. The application must start on a server where nothing is configured.
 */
class AppConfigService {
    http = new HttpClient(inject(HttpBackend));
    bootstrapUrl = inject(APP_BOOTSTRAP_CONFIG_URL);
    manifestUrl = inject(APP_MANIFEST_CONFIG_URL);
    document = inject(DOCUMENT);
    bootstrapConfig = signal(DEFAULT_APP_BOOTSTRAP_CONFIG, ...(ngDevMode ? [{ debugName: "bootstrapConfig" }] : []));
    runtimeManifest = signal(DEFAULT_APP_RUNTIME_MANIFEST, ...(ngDevMode ? [{ debugName: "runtimeManifest" }] : []));
    presetState = signal(null, ...(ngDevMode ? [{ debugName: "presetState" }] : []));
    loading = null;
    diagnosticsState = signal({
        bootstrapSource: 'packaged-default',
        manifestSource: 'packaged-default',
        bootstrapFragments: [],
        manifestFragments: [],
        serverDiagnostics: [],
        messages: [],
    }, ...(ngDevMode ? [{ debugName: "diagnosticsState" }] : []));
    bootstrap = this.bootstrapConfig.asReadonly();
    manifest = this.runtimeManifest.asReadonly();
    diagnostics = this.diagnosticsState.asReadonly();
    /** The presales preset in force, or `null`. Only ever set where a package enables switching. */
    activePreset = this.presetState.asReadonly();
    /** Themes available to the theme picker — packaged ones merged with configured ones. */
    themes = computed(() => this.bootstrapConfig().themes, ...(ngDevMode ? [{ debugName: "themes" }] : []));
    /**
     * The configured logo with its `src` resolved to the URL an `<img>` loads, or `null` to keep the
     * Satori marks. Resolved here because only this service knows where `bootstrap.json` came from.
     */
    brandingLogo = computed(() => {
        const config = this.bootstrapConfig();
        const logo = config.branding.logo;
        if (!logo)
            return null;
        const baseUri = this.document.baseURI;
        const configUrl = new URL(this.bootstrapUrl, baseUri).href;
        const url = resolveBrandingLogoUrl(logo.src, configUrl, nuxeoOriginsOf(config, baseUri));
        return url === null ? null : { url, alt: logo.alt };
    }, ...(ngDevMode ? [{ debugName: "brandingLogo" }] : []));
    /**
     * Fetch both halves, choose the preset, and apply everything in order. Never rejects, so it is
     * safe as an `APP_INITIALIZER`.
     *
     * Runs once: a later call returns the first call's promise. That is what lets another
     * initializer wait for the configuration instead of racing it, since Angular runs
     * `APP_INITIALIZER` functions concurrently.
     */
    load() {
        this.loading ??= this.fetchAndApply();
        return this.loading;
    }
    async fetchAndApply() {
        const [bootstrap, manifest] = await Promise.all([
            this.fetch(this.bootstrapUrl, 'bootstrap'),
            this.fetch(this.manifestUrl, 'manifest'),
        ]);
        const bootstrapFragments = bootstrap?.fragments ?? [];
        const preset = this.choosePreset(bootstrapFragments.map((fragment) => fragment.content));
        let bootstrapConfig = bootstrapFragments.reduce((merged, fragment) => mergeBootstrapConfig(merged, fragment.content), DEFAULT_APP_BOOTSTRAP_CONFIG);
        let runtimeManifest = (manifest?.fragments ?? []).reduce((merged, fragment) => mergeRuntimeManifest(merged, fragment.content), DEFAULT_APP_RUNTIME_MANIFEST);
        if (preset) {
            bootstrapConfig = mergeBootstrapConfig(bootstrapConfig, preset.bootstrap);
            runtimeManifest = mergeRuntimeManifest(runtimeManifest, preset.manifest);
        }
        this.bootstrapConfig.set(bootstrapConfig);
        this.runtimeManifest.set(runtimeManifest);
        this.presetState.set(preset ? { name: preset.name, label: preset.label } : null);
        this.diagnosticsState.update((current) => ({
            ...current,
            bootstrapSource: bootstrap ? 'configuration-service' : 'packaged-default',
            manifestSource: manifest ? 'configuration-service' : 'packaged-default',
            bootstrapFragments: bootstrapFragments.map(info),
            manifestFragments: (manifest?.fragments ?? []).map(info),
            serverDiagnostics: [...(bootstrap?.diagnostics ?? []), ...(manifest?.diagnostics ?? [])],
        }));
        for (const { level, code, message, component } of this.diagnosticsState().serverDiagnostics) {
            console.warn(`[agentic-ui-config] server ${level} ${code}${component ? ` (${component})` : ''}: ${message}`);
        }
    }
    /** The active theme definition for a stored or configured theme id. */
    resolveTheme(id) {
        return resolveTheme(this.bootstrapConfig(), id);
    }
    /** A manifest feature toggle, or `fallback` when no package has set it. */
    featureToggle(id, fallback) {
        const configured = this.runtimeManifest().featureToggles[id];
        return typeof configured === 'boolean' ? configured : fallback;
    }
    async fetch(url, layer) {
        const raw = await firstValueFrom(this.http.get(url, { responseType: 'json' }).pipe(timeout(CONFIG_LOAD_TIMEOUT_MS), catchError((error) => of(new ConfigLoadFailure(describe(error))))));
        if (raw instanceof ConfigLoadFailure) {
            this.note(`${layer} configuration not loaded from ${url}: ${raw.reason}`);
            return null;
        }
        const response = readConfigResponse(raw, layer);
        if ('invalid' in response) {
            this.note(`${layer} configuration from ${url} ignored: ${response.invalid}`);
            return null;
        }
        return response;
    }
    /**
     * The preset to apply, if switching is enabled and one is chosen. The URL wins over the stored
     * choice and replaces it; an unknown name is reported and forgotten.
     */
    choosePreset(bootstrapFragments) {
        const presales = readPresales(bootstrapFragments);
        const view = this.document.defaultView;
        const requested = view ? requestedPreset(view.location) : undefined;
        if (!presales.presetSwitching) {
            const ignored = requested || this.stored();
            if (ignored)
                this.note(`preset "${ignored}" ignored: preset switching is not enabled`);
            return null;
        }
        if (requested !== undefined)
            this.store(requested);
        const name = requested ?? this.stored();
        if (!name)
            return null;
        const preset = presales.presets[name];
        if (!preset) {
            this.note(`preset "${name}" is not defined by any package`);
            this.store('');
            return null;
        }
        return preset;
    }
    stored() {
        try {
            return this.document.defaultView?.localStorage.getItem(PRESET_STORAGE_KEY) ?? null;
        }
        catch {
            return null;
        }
    }
    store(name) {
        try {
            const storage = this.document.defaultView?.localStorage;
            if (name)
                storage?.setItem(PRESET_STORAGE_KEY, name);
            else
                storage?.removeItem(PRESET_STORAGE_KEY);
        }
        catch {
            // Storage refused (private mode, quota): the preset still applies to this load.
        }
    }
    /** Recorded and logged: the product app has no page showing diagnostics, so the console is where support finds them. */
    note(message) {
        console.warn(`[agentic-ui-config] ${message}`);
        this.diagnosticsState.update((current) => ({
            ...current,
            messages: [...current.messages, message],
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AppConfigService, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AppConfigService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "20.3.33", ngImport: i0, type: AppConfigService, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
function info({ name, component, bundle, source }) {
    return { name, component, bundle, source };
}
function describe(error) {
    if (error instanceof TimeoutError)
        return `no response within ${CONFIG_LOAD_TIMEOUT_MS / 1000} s`;
    const status = error?.status;
    const message = error?.message;
    // A 2xx failure is a body that did not parse: its status says nothing, its message says why.
    const ok = typeof status === 'number' && status >= 200 && status < 300;
    if (typeof status === 'number' && status !== 0 && !ok)
        return `HTTP ${status}`;
    return typeof message === 'string' ? message : 'request failed';
}
/**
 * Sentinel returned into the success channel by `catchError`, so a failed load
 * takes the same code path as a successful one and cannot throw past the caller.
 */
class ConfigLoadFailure {
    reason;
    constructor(reason) {
        this.reason = reason;
    }
}

/**
 * Generated bundle index. Do not edit.
 */

export { APP_BOOTSTRAP_CONFIG_FILE, APP_BOOTSTRAP_CONFIG_URL, APP_CONFIG_DIRECTORY, APP_CONFIG_FORMAT, APP_MANIFEST_CONFIG_FILE, APP_MANIFEST_CONFIG_URL, AppConfigService, DEFAULT_APP_BOOTSTRAP_CONFIG, DEFAULT_APP_RUNTIME_MANIFEST, DEFAULT_APP_THEMES, PRESET_QUERY_PARAM, PRESET_STORAGE_KEY, mergeBootstrapConfig, mergeRuntimeManifest, resolveBootstrapConfigUrl, resolveManifestConfigUrl, resolveTheme };
//# sourceMappingURL=nuxeo-satori-platform-app-config.mjs.map
