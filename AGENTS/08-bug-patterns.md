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
//   Placeholders shown below (<user>, <password>) so this doc file itself
//   does not trip the scanner. In real BAD code these would be literal
//   credential strings inlined into source.
const auth = btoa('<user>:<password>');
export const config = { nuxeoAuth: '<user>:<password>' };

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

## 11. `route.snapshot` for reactive UI state (stale value on reuse)

```typescript
// BAD ❌ — snapshot is read once at construction; if the router reuses this
// component instance and only the query params change (the default reuse
// strategy does exactly that for same-route navigation), the signal never
// updates and the UI is stuck on the initial value.
readonly debugMode = signal(
  this.route.snapshot.queryParamMap.get('debug') === '1',
);

// GOOD ✅ — derive the signal from the observable so query-param changes
// propagate without a full component re-instantiation.
readonly debugMode = toSignal(
  this.route.queryParamMap.pipe(map((qm) => qm.get('debug') === '1')),
  { requireSync: true },
);
```

Use `snapshot` only for values you genuinely want frozen at construction time
(e.g. a one-shot resolver-loaded id you'll never refresh in place).

---

## 12. Always-on data capture behind an opt-in UI gate

```typescript
// BAD ❌ — captures and retains the full HTTP error body on every failure,
// even for users who never opted in via `?debug=1`. The body can be a multi-MB
// JSON payload or an entire HTML login page; keeping it in a signal means
// it lives for the component's lifetime for no benefit to the user.
error: (err) => {
  this.agentsError.set('Failed to load agents.');
  this.agentsErrorDetail.set(this.captureError('listAgents', err));
  this.loading.set(false);
},

// GOOD ✅ — capture only when the rendering branch will actually consume it.
error: (err) => {
  this.agentsError.set('Failed to load agents.');
  if (this.debugMode()) {
    this.agentsErrorDetail.set(this.captureError('listAgents', err));
  }
  this.loading.set(false);
},
```

Rule of thumb: if a piece of data is only rendered behind a feature flag, the
_capture_ should be behind the same flag — not just the render.

---

## 13. Markdown inline code spans split across newlines

```markdown
<!-- BAD ❌ — the backtick span wraps to the next line, the renderer breaks
     the code formatting, and continuation text is under-indented inside a
     list item, so the bullet collapses. -->

- **KE needs its own External App.** The Discovery SA's External App is bound to `Application = Content Intelligence
Connector` and mints tokens with `appkey: "insight"`.

<!-- GOOD ✅ — keep the whole backticked phrase on one line; indent
     continuation lines two spaces under the list bullet. -->

- **KE needs its own External App.** The Discovery SA's External App is bound to
  `Application = Content Intelligence Connector` and mints tokens with
  `appkey: "insight"`.
```

Markdown code spans (single-backtick) cannot contain a newline. Long
backticked phrases must stay on one line even if the surrounding prose wraps.

---

## 14. AI free-form output written to a vocabulary-bound field (HTTP 422)

```typescript
// BAD ❌ — the candidate list is hardcoded and TitleCase, and the LLM's
// reply is written straight to `dc:nature`. Two failure modes:
//   1. The LLM returns the sentinel "not_from_provided_classes" when no
//      candidate matches — Nuxeo rejects it with 422 because it isn't in
//      the `nature` vocabulary.
//   2. Even when the LLM picks a candidate ("Contract"), the actual
//      vocabulary id is camelCase ("contract"), so the PUT still 422s.
const KE_TEXT_CLASSIFICATION_CLASSES = ['Contract', 'Invoice', /* ... */];

runTextClassification(): void {
  this.keClient
    .enrich(blob, { actions: ['text-classification'], classes: KE_TEXT_CLASSIFICATION_CLASSES })
    .subscribe((res) => {
      // Writes "not_from_provided_classes" or "Contract" — both invalid.
      this.browseService.updateDocument(uid, { 'dc:nature': res.textClassification?.result });
    });
}

// GOOD ✅ — source candidates from the live vocabulary, then validate the
// model's response before writing. The vocabulary call is cached by
// DirectoryService, so the cost is paid once per session.
private readonly natureVocabulary = signal<DirectoryEntry[]>([]);

ngOnInit(): void {
  this.directoryService
    .getEntries('nature')
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((entries) => this.natureVocabulary.set(entries));
}

runTextClassification(): void {
  const candidates = this.natureVocabulary().map((e) => e.id);
  if (!candidates.length) { /* surface a UX error, do not call KE */ return; }
  this.keClient
    .enrich(blob, { actions: ['text-classification'], classes: candidates })
    .subscribe((res) => {
      const raw = res.textClassification?.result?.trim();
      if (!raw || raw === 'not_from_provided_classes') {
        this.toast('Knowledge Enrichment could not match this document.');
        return;
      }
      const id = this.natureVocabulary().find(
        (e) => e.id.toLowerCase() === raw.toLowerCase()
            || e.displayLabel.toLowerCase() === raw.toLowerCase(),
      )?.id;
      if (!id) { this.toast(`"${raw}" is not in the nature vocabulary.`); return; }
      this.browseService.updateDocument(uid, { 'dc:nature': id });
    });
}
```

Rule of thumb: any Nuxeo property that is backed by a directory/vocabulary
(`dc:nature`, `dc:coverage`, `dc:language`, ...) MUST be written using a value
sourced from `DirectoryService.getEntries(<vocab>)`. Never trust a string that
came from an LLM, a free-text input, or a hardcoded constant list. Always
guard against the two LLM failure modes: the sentinel ("no match") and the
hallucinated label.

---

## Copilot Flags These on PRs

If you write any of the above, GitHub Copilot will leave a review comment.
Fix proactively to avoid a review cycle:

- "Missing unsubscribe" → add `takeUntilDestroyed()`
- "Potential XSS" → use Angular template binding
- "Hardcoded credential" → move to environment variable
- "Race condition" → add stale-check before setting signal after async operation
- "Snapshot won't reflect changes" → `toSignal(route.queryParamMap.pipe(map(...)))`
- "Captured even when feature is off" → wrap the capture in the feature flag
- "Code span split across newlines" → keep the whole backticked phrase on one line
- "Writing AI output to a vocabulary field without validation" → source candidates from the vocabulary and validate the response
