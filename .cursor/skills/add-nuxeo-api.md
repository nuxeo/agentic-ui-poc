# Skill: Add Nuxeo API Service Method

Use this skill when adding a new Nuxeo API call (new service method).

## Steps

1. **Check if it already exists** — read `AGENTS/01-services.md`
   If the method already exists, use it. Do not duplicate.

2. **Find the right service file**
   - Document operations → `document-detail.service.ts`
   - Folder navigation → `browse.service.ts`
   - Search → `search-aggregation.service.ts`
   - Collections → `collection.service.ts`
   - Users/groups → `user.service.ts`
   - Workflows/tasks → `workflow.service.ts` or `task.service.ts`
   - Tags → `tag.service.ts`
   - New domain → create a new service file

3. **Check the API endpoint** — read `AGENTS/02-nuxeo-apis.md`
   If the endpoint is not listed, add it to `docs/api-integrations.md`.

4. **Add the method following the correct pattern**

   ```typescript
   // Standard GET
   getDocument(uid: string): Observable<NuxeoDocument> {
     return this.api.get<NuxeoDocument>(`/nuxeo/api/v1/id/${uid}`);
   }

   // Automation operation
   createCollection(title: string): Observable<NuxeoDocument> {
     return this.api.post<NuxeoDocument>('/nuxeo/api/v1/automation/Collection.Create', {
       params: { name: title },
       context: {},
     });
   }
   ```

5. **Export from barrel if needed** — `libs/shared/nuxeo-client/src/index.ts`

6. **Update docs**
   - Add method to `AGENTS/01-services.md`
   - Add endpoint to `docs/api-integrations.md`

7. **Write a unit test** — follow `AGENTS/05-test-standards.md`

8. **Run verification**
   ```bash
   npx nx test nuxeo-client
   npx nx affected -t lint
   ```
