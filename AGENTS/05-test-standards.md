# Test Standards

Framework: **Vitest** + **Angular Testing Utilities**
Location: same folder as the implementation file, `*.spec.ts`
Runner: `npx nx test <project-name>`

---

## Automated Guardrails (`scripts/review-guardrails.mjs`)

Unit tests are not the only gate. `npm run review:guardrails` runs in `review:preflight` and as the
first step of the CI lint-build job, and fails the build on:

| Check                    | What fails the build                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `checkThemeTokens`       | A hard-coded colour on an added `.scss`/`.html` line — use `var(--mat-sys-*)` / `var(--kd-*)`                  |
| `checkDocsNumbering`     | A changed `docs/*.md` with a duplicate `## <n>.` section number                                                |
| `checkVitestProjects`    | An `@nx/vitest:test` target with no Vite config, or no specs and no `passWithNoTests: true`                    |
| `checkBlobUrlLifecycle`  | An added `URL.createObjectURL` in a file that never calls `URL.revokeObjectURL`                                |
| `checkSatoriContract`    | A `--sat-*` token or `.sat-*` class Satori no longer declares, or an internal reach outside the overrides file |
| `checkSatoriTagVariants` | A `SatTagStatus`/`SatTagCategory` member whose runtime-interpolated colour token does not exist                |
| `checkTypeSafetyEscapes` | (warning only) an added `as unknown as` / `as never`                                                           |
| `checkServiceMapDocs`    | The service map in `AGENTS.md` section 3 / `AGENTS/01-services.md` disagreeing with the code                   |

### The service map is machine-checked — do not rely on manual review for it

`AGENTS.md` section 3 and `AGENTS/01-services.md` are the first thing every agent and every new
engineer reads, so an error there gets copied into new code rather than just misleading one person.
Three separate hand-review passes each found errors the previous pass had missed, so the
mechanically checkable part is now checked by `checkServiceMapDocs`, which parses the real classes
with the TypeScript compiler and fails on:

- a documented method that the class does not have — the message names the class that _does_ have it
- a documented method **return type** that differs from the source annotation (`Promise` where the
  code returns an `Observable` changes every call site)
- a section heading naming a class the file does not export, or a file that does not exist
- an `@Injectable` service under `libs/shared/{nuxeo-client/src/lib/services,kd-client/src/lib,ke-client/src/lib}`
  with no section in `AGENTS/01-services.md`
- a `ClassName.methodName` reference anywhere in either document that does not resolve
- a section-3 description claiming an operation (`create`, `update`, `delete`, `CRUD`, `export`, …)
  that the class has no method for

What it deliberately does **not** check, so do keep reviewing these by hand:

- whether a prose description is _complete_ or well-chosen — only false operation claims in the
  one-line section-3 cells are checked, and only there. Free prose legitimately names operations to
  say a service does **not** have them, so the same rule over prose would fail constantly.
- whether every public method is documented. Documenting a subset is allowed; the definition of
  done in `AGENTS.md` section 7 still asks you to add new methods to `AGENTS/01-services.md`.
- signal property types. They are declared as `x = signal(...)` with no annotation, so there is
  nothing to compare a documented `Signal<T>` against.

When you add or rename a service or a method, run `npm run review:guardrails` before opening the PR;
it is the cheapest place to find out that the docs drifted.

---

## When to Write Tests

- After writing **any new service method** → write a corresponding spec
- After writing **any component with business logic** → write a spec
- After **fixing a bug** → write a regression test that would have caught it
- Do NOT write tests for trivial getters or pass-through methods

---

## Service Test Template

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentDetailService } from './document-detail.service';

describe('DocumentDetailService', () => {
  let service: DocumentDetailService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DocumentDetailService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify()); // ensures no unexpected requests

  it('should fetch document by uid', () => {
    const mockDoc = { uid: 'abc-123', title: 'Test Doc' };

    service.getFullDocument('abc-123').subscribe((doc) => {
      expect(doc.uid).toBe('abc-123');
    });

    const req = httpMock.expectOne((r) => r.url.includes('/id/abc-123'));
    expect(req.request.method).toBe('GET');
    req.flush(mockDoc);
  });

  it('should handle 404 error gracefully', () => {
    service.getFullDocument('bad-uid').subscribe({
      next: () => fail('should have errored'),
      error: (err) => expect(err.status).toBe(404),
    });

    httpMock
      .expectOne((r) => r.url.includes('/id/bad-uid'))
      .flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should call the correct automation endpoint for createCollection', () => {
    service.createCollection('My Collection', 'desc').subscribe();

    const req = httpMock.expectOne((r) => r.url.includes('/automation/Collection.Create'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.params.name).toBe('My Collection');
    req.flush({ uid: 'col-1', title: 'My Collection' });
  });
});
```

---

## Component Test Template — Test Signal State, Not DOM

```typescript
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MyFeatureComponent } from './my-feature';
import { DocumentDetailService } from '@agentic-ui/shared/nuxeo-client';

describe('MyFeatureComponent', () => {
  let component: MyFeatureComponent;
  let mockService: { getItems: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockService = {
      getItems: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MyFeatureComponent],
      providers: [{ provide: DocumentDetailService, useValue: mockService }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MyFeatureComponent);
    component = fixture.componentInstance;
  });

  it('should set loading to false and populate items after successful fetch', fakeAsync(() => {
    const mockItems = [{ id: '1', title: 'Doc 1' }];
    mockService.getItems.mockReturnValue(of(mockItems));

    component.loadItems();
    expect(component.loading()).toBe(true);

    tick();

    expect(component.loading()).toBe(false);
    expect(component.items().length).toBe(1);
    expect(component.error()).toBeNull();
  }));

  it('should set error signal and reset loading on failure', fakeAsync(() => {
    mockService.getItems.mockReturnValue(throwError(() => new Error('Network error')));

    component.loadItems();
    tick();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeTruthy();
    expect(component.items().length).toBe(0);
  }));
});
```

---

## What to Cover

For every new service method:

- Happy path (successful response)
- Error path (4xx / 5xx)
- Correct URL and HTTP method
- Correct request body (for POST/PUT)

For every component with state:

- Loading state is set correctly
- Error state is set correctly and loading is reset
- State is reset when input changes (for route-bound components)
- Memory cleanup: blob URLs revoked, subscriptions unsubscribed

---

## Coverage Requirements

There are two numbers to keep apart: the **floor** CI enforces today, and the **target** the Beta
is aiming at.

### The enforced floor (a ratchet, not a goal)

`coverage-thresholds.json` records a per-project line and function floor, enforced in CI by
`scripts/check-coverage.mjs`. Each floor is the coverage that project actually had when the gate
was introduced, minus roughly two points. The rules:

- If your change drops a project below its floor, add tests. **Never lower a floor to go green.**
- When a project's real coverage settles well above its floor, raise the floor in the same PR.
  `npm run test:coverage` prints a "Ratchet available" hint when a project is 5+ points clear.
- Projects that cannot be measured yet are listed under `ungated` with the reason (today:
  `nuxeo-ui`, which is Karma/Jasmine rather than Vitest, and `shared-util`, which has no Vitest
  config). They are backfill work, not exemptions. A new project with a `vite.config.mts` needs
  an entry adding — one line in `projects`.

Three things to know about what the numbers mean.

The percentages are **share of source lines exercised**, not executable-line coverage: comments
and blank lines inside a covered region count as covered. That is a consequence of how the
denominator was made honest, and it is uniform across every file, so the ratchet still works —
but do not compare these numbers against a tool that reports executable lines.

Every source file counts, including ones no spec loads. This was not true before 2026-08-06: v8
only instruments files a run loads, so an untested file used to contribute zero lines and vanish
from the denominator rather than counting as uncovered, which inflated every project and meant
the first spec to load a large untested file made coverage _fall_. `check-coverage.mjs` now
enumerates each project's files itself and fails outright if one drops out of measurement. It
excludes only specs, test doubles, barrels, and type-only modules whose TypeScript emit is
empty; see the header of that script for why each exclusion is safe.

Branch coverage is deliberately not gated: some projects instrument too few branch points for
the percentage to carry information. Function coverage is measured and printed but also not
gated, because v8 credits a file no spec loads with exactly one function however large it is, so
that denominator cannot be corrected the way the line one can.

### The target

Aim for:

- 80%+ line coverage on `libs/shared/nuxeo-client/src/lib/services/`
- 60%+ line coverage on feature components with business logic
- 100% coverage on utility functions

The Beta epic (NXENG-615) asks for >90% everywhere, which is not reachable on the existing feature
code. The tiered target under negotiation is 90% on new library services and the agent gateway,
70% on feature components with logic.

---

## Running Tests

```bash
# Run tests for affected projects only (CI mode)
npx nx affected -t test

# Run tests for a specific project
npx nx test nuxeo-client

# Run with coverage report
npx nx test nuxeo-client --coverage

# Check every project against its recorded floor (what CI runs)
npm run test:coverage

# Check only some projects
node scripts/check-coverage.mjs --projects=browse,ui

# Watch mode (development)
npx nx test nuxeo-client --watch
```
