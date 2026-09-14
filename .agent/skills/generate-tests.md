# Skill: Generate Tests

Use this skill when asked to "write tests", "add tests", or "generate unit tests" for existing code.

## Steps

1. **Identify what needs testing**
   - Service methods: all public methods need happy + error path tests
   - Components: signal state changes, loading/error states, input changes
   - Utilities: all code paths

2. **Read the implementation** — understand the method's behavior before writing tests

3. **Read the test standards** — `AGENTS/05-test-standards.md`

4. **Generate the spec file** — same folder as the implementation, `*.spec.ts`

   For a service:

   ```typescript
   import { TestBed } from '@angular/core/testing';
   import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

   describe('ServiceName', () => {
     let service: ServiceName;
     let httpMock: HttpTestingController;

     beforeEach(() => {
       TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
       service = TestBed.inject(ServiceName);
       httpMock = TestBed.inject(HttpTestingController);
     });

     afterEach(() => httpMock.verify());

     // Test each public method:
     // 1. Happy path
     // 2. Error path (404, 500, network error)
     // 3. Correct URL and HTTP method
     // 4. Correct request body (for POST/PUT)
   });
   ```

5. **Run the tests**

   ```bash
   npx nx test <project-name>
   ```

6. **Fix failures** — fix implementation or test, do not skip or comment out

7. **Check coverage** (optional)
   ```bash
   npx nx test <project-name> --coverage
   ```
   Target: 80%+ for service files, 60%+ for components with business logic
