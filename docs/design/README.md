# Beta design references

Generated 6 August 2026 to support the Product and leadership review of the Beta plan.
Read alongside `docs/beta-product-overview.md` and `docs/beta-engineering-plan.md`.

**These are AI-generated mockups.** They render plausible-looking data and can differ in
small details from what gets built. They exist to convey capability and control, not to
specify a visual. Anything already implemented should be shown from the running
application instead — see `docs/beta-demo-runbook.md`.

| File                            | Maps to | Status of the underlying work                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `design-agent-chat-panel.png`   | A4 / A5 | **Superseded — use the real screenshots.** The panel has since been driven end to end in a browser against the deterministic demo gateway, so `docs/images/beta-demo/` holds genuine captures of streaming, tool cards, the approval card in both directions, citations and cancellation. Prefer those in any deck. This mockup is retained only as the design intent that preceded them; it does not match the app's real Satori visual language. |
| `design-recipes-launcher.png`   | A8      | Planned, not built. Framework plus the three flagship recipes.                                                                                                                                                                                                                                                                                                                                                                                     |
| `design-generative-ui.png`      | A7      | Planned, not built. Note the "Assembled by assistant" badge and the rearrange/save strip — the app validates what the agent proposes rather than rendering whatever it asks for.                                                                                                                                                                                                                                                                   |
| `design-admin-capabilities.png` | A9      | Planned, not built. Server-side off-switch and per-capability scoping. Deliberately shows a capability disabled because the AI package is absent, and model credentials read-only because they come from the environment.                                                                                                                                                                                                                          |

Treat the last three as proposals to react to. They are drawn in the app's existing idiom so
the discussion stays on capability and governance rather than styling.
