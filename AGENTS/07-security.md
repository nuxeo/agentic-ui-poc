# Security Rules

These rules are enforced at code generation time, by the Bug Detection Agent during review,
and by GitHub CodeQL in CI. Violations block PR merge.

---

## Credentials — NEVER hardcode

```typescript
// WRONG ❌
const auth = 'Administrator:Administrator';
const apiKey = 'sk-abc123...';
export const config = { nuxeoAuth: 'admin:admin' };

// CORRECT ✅
const auth = process.env['NUXEO_AUTH'] ?? '';
// Validate at startup — fail fast if missing:
if (!config.nuxeoAuth) {
  console.error('NUXEO_AUTH is required');
  process.exit(1);
}
```

- All sensitive config comes from environment variables
- `.env` files are gitignored — never commit them
- Never use hardcoded fallback credentials (even `'' || 'admin:admin'`)
- If GitHub Secret Scanning flags a commit, rotate the credential immediately

---

## Nuxeo Authentication

```typescript
// CORRECT ✅ — use HttpClient via services (interceptor adds auth header)
this.documentDetailService.fetchThumbnail(uid)
  .pipe(takeUntilDestroyed())
  .subscribe(blob => { ... });

// WRONG ❌ — fetch() bypasses Angular's auth interceptor
fetch(`/nuxeo/api/v1/id/${uid}/@rendition/thumbnail`); // no auth header

// WRONG ❌ — direct img binding bypasses auth interceptor
<img [src]="doc.contextParameters['thumbnail']?.url" />
```

- NEVER call Nuxeo URLs with the native `fetch()` API
- NEVER add `Authorization` headers manually in components — use the interceptor
- NEVER put credentials in query string parameters

---

## XSS Prevention

```typescript
// CORRECT ✅ — Angular template binding auto-escapes
<p>{{ userContent }}</p>

// WRONG ❌ — bypasses sanitization
element.innerHTML = userContent;
this.renderer.setProperty(el, 'innerHTML', content);

// ONLY acceptable use of DomSanitizer — and only when source is fully controlled
this.sanitizer.bypassSecurityTrustResourceUrl(arenderUrl); // ✅ for known-safe iframes
```

- Never use `innerHTML` or `outerHTML` with user-provided content
- Never use `DomSanitizer.bypassSecurityTrust*` unless the source is server-controlled
- Always use Angular's template binding (`{{ }}`, `[attr]`) for user content

---

## Blob URL Lifecycle

```typescript
// CORRECT ✅ — revoke in ngOnDestroy
private readonly blobUrls: string[] = [];

loadBlob(): void {
  this.service.fetchBlob(uid).subscribe(blob => {
    const url = URL.createObjectURL(blob);
    this.blobUrls.push(url);       // track for cleanup
    this.blobUrl.set(url);
  });
}

ngOnDestroy(): void {
  this.blobUrls.forEach(url => URL.revokeObjectURL(url)); // always clean up
}

// WRONG ❌ — memory leak, especially bad for thumbnails in lists
this.blobUrl.set(URL.createObjectURL(blob)); // never revoked
```

---

## Angular Security Checklist for PR Review

- [ ] No hardcoded credentials, tokens, or API keys
- [ ] No `fetch()` calls to `/nuxeo/` URLs
- [ ] No `<img [src]="nuxeoUrl">` direct bindings
- [ ] No `innerHTML` with user content
- [ ] No `DomSanitizer.bypassSecurityTrust*` without documented justification
- [ ] Every `URL.createObjectURL()` has a corresponding `revokeObjectURL()` in cleanup
- [ ] `.env` files are not staged for commit

---

## AI Backend Security (`apps/ai-backend`)

- HAIP API key loaded from `process.env['HAIP_API_KEY']` — validated at startup
- Nuxeo auth loaded from `process.env['NUXEO_AUTH']` — validated at startup
- No credentials in `config.ts` source file
- All user inputs to AI endpoints are passed as content, not as system prompts (prompt injection mitigation)
- Rate limiting should be applied to all `/ai/*` routes in production
