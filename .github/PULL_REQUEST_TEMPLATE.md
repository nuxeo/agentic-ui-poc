## What changed and why

<!-- Describe the change in 2-3 sentences. Focus on WHY, not just what. -->

## JIRA ticket

<!-- Link if applicable: Implements NCO-XXXX -->

## Files modified

<!-- List the key files changed -->

## How to test

<!-- Step-by-step test plan -->

- [ ] Navigate to ...
- [ ] Verify that ...
- [ ] Check that ...

## Checklist

- [ ] `npx nx affected -t lint` passes
- [ ] `npx nx affected -t build` passes
- [ ] `npx nx affected -t test` passes
- [ ] Unit tests written for any new service method
- [ ] `docs/api-integrations.md` updated (if new Nuxeo endpoint used)
- [ ] `docs/ai-features.md` updated (if AI backend changed)
- [ ] `AGENTS/01-services.md` updated (if new service method added)
- [ ] `AGENTS/00-architecture.md` updated (if architecture changed)
- [ ] No hardcoded credentials
- [ ] No direct `<img [src]>` binding to Nuxeo authenticated content
- [ ] All new subscriptions use `takeUntilDestroyed()`
- [ ] All new `URL.createObjectURL()` calls have cleanup in `ngOnDestroy`
