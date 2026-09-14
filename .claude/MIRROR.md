# Generated — do not edit here

Everything in `skills/`, `agents/` and `rules/` in this directory is a **copy**. The source
is `.cursor/` at the repository root.

Edit the file under `.cursor/`, then run:

    npm run mirror:agents

The `agent-mirror` gate in `npm run beta:gate` fails when a mirror has drifted, so an edit
made only here will be caught before it is merged — but it will be caught by being _overwritten_,
because this directory is not a source. Nothing here is read back.

`settings.json` and `settings.local.json`, where present, are **not** mirrored: they are
machine-specific and partly gitignored.
