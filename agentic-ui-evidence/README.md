# Ticket evidence

Screenshots, screen recordings, and JSON reports from bug-fix evidence collection.

Each ticket gets its own subfolder: `<TICKET-ID>/` (e.g. `NXSAT-174/`).

## Location

Default: `~/Desktop/agentic-ui-evidence/`

Override with the `AGENTIC_UI_EVIDENCE_DIR` environment variable.

## Collecting evidence

```bash
npx nx serve nuxeo-ui   # in another terminal

NUXEO_DOC_UID=<uid> npm run evidence:collect -- NXSAT-175 scripts/collect-evidence/NXSAT-175.mjs
```

See `scripts/collect-evidence/README.md` for full docs.
