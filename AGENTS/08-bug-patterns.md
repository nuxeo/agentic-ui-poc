# Known Bug Patterns

When reading or modifying any file, scan for these patterns. Fix them proactively —
they are the most common causes of memory leaks, auth failures, and user-visible bugs.

---

## 1. Observable subscription without cleanup (memory leak)

```typescript
// BAD ❌ — subscription never cleaned up, component leaks
ngOnInit(): void {
  this.service.getData().subscribe(data => this.data.set(data));
}

// GOOD ✅ — automatically unsubscribed when component is destroyed
constructor() {
  this.service.getData()
    .pipe(takeUntilDestroyed())
    .subscribe(data => this.data.set(data));
}
```

---

## 2. Blob URL never revoked (memory leak)

```typescript
// BAD ❌ — object URL is never freed
loadThumbnail(uid: string): void {
  this.service.fetchThumbnail(uid).subscribe(blob => {
    this.thumbnailUrl.set(URL.createObjectURL(blob));
  });
}

// GOOD ✅ — tracked and revoked on destroy
private readonly blobUrls: string[] = [];

loadThumbnail(uid: string): void {
  this.service.fetchThumbnail(uid).subscribe(blob => {
    const url = URL.createObjectURL(blob);
    this.blobUrls.push(url);
    this.thumbnailUrl.set(url);
  });
}

ngOnDestroy(): void {
  this.blobUrls.forEach(url => URL.revokeObjectURL(url));
}
```

---

## 3. Direct `<img>` binding to Nuxeo URL (auth failure)

```html
<!-- BAD ❌ — browser fetches directly, no Authorization header → 401 -->
<img [src]="doc.contextParameters['thumbnail']?.url" />
<img [src]="doc.properties['file:content']?.data" />

<!-- GOOD ✅ — fetch via HttpClient, interceptor adds auth, use blob URL -->
<img [src]="thumbnailUrl()" />
```

```typescript
// Fetch via service — interceptor handles auth
this.documentDetailService
  .fetchThumbnail(doc.uid)
  .pipe(takeUntilDestroyed())
  .subscribe((blob) => this.thumbnailUrl.set(URL.createObjectURL(blob)));
```

---

## 4. State not reset on route parameter change

```typescript
// BAD ❌ — if uid changes, old data stays visible while new data loads
readonly docUid = input.required<string>();

ngOnInit(): void {
  this.loadDocument(this.docUid());
}

// GOOD ✅ — effect() reacts to every uid change and resets state first
constructor() {
  effect(() => {
    const uid = this.docUid();
    // Reset all state signals before loading
    this.doc.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.loadDocument(uid);
  });
}
```

---

## 5. Loading flag not reset on error (user cannot retry)

```typescript
// BAD ❌ — loading stays true on error, UI appears stuck
this.service.getData().subscribe({
  next: (data) => {
    this.data.set(data);
    this.loading.set(false);
  },
  error: () => {
    this.error.set('Failed');
  }, // loading still true!
});

// GOOD ✅ — always reset loading in both paths
this.service.getData().subscribe({
  next: (data) => {
    this.data.set(data);
    this.loading.set(false);
  },
  error: () => {
    this.error.set('Failed');
    this.loading.set(false);
  },
});
```

---

## 6. `fetch()` instead of `HttpClient` for Nuxeo URLs

```typescript
// BAD ❌ — bypasses Angular auth interceptor, no Authorization header
const response = await fetch(`/nuxeo/api/v1/id/${uid}`);

// GOOD ✅ — interceptor automatically adds auth header
this.api.get<NuxeoDocument>(`/nuxeo/api/v1/id/${uid}`);
```

---

## 7. Hardcoded credentials

```typescript
// BAD ❌ — will trigger GitHub Secret Scanning alert
const auth = btoa('Administrator:Administrator');
export const config = { nuxeoAuth: 'admin:password123' };

// GOOD ✅
const auth = process.env['NUXEO_AUTH'] ?? '';
```

---

## 8. Cross-feature import (Nx boundary violation)

```typescript
// BAD ❌ — feature importing from sibling feature — Nx lint will fail
import { SearchComponent } from '@agentic-ui/feature-search';

// GOOD ✅ — move shared logic to libs/shared/ first
import { SearchService } from '@agentic-ui/shared/nuxeo-client';
```

---

## 9. Constructor parameter injection

```typescript
// BAD ❌ — old Angular pattern, not consistent with codebase
constructor(private readonly service: DocumentDetailService) {}

// GOOD ✅
private readonly service = inject(DocumentDetailService);
```

---

## 10. Inline template

```typescript
// BAD ❌ — project convention requires external templates
@Component({
  template: `<div>{{ title }}</div>`,  // inline
})

// GOOD ✅
@Component({
  templateUrl: './my-component.html',  // external
})
```

---

## Copilot Flags These on PRs

If you write any of the above, GitHub Copilot will leave a review comment.
Fix proactively to avoid a review cycle:

- "Missing unsubscribe" → add `takeUntilDestroyed()`
- "Potential XSS" → use Angular template binding
- "Hardcoded credential" → move to environment variable
- "Race condition" → add stale-check before setting signal after async operation
