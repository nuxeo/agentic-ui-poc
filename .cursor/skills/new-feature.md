# Skill: New Feature — superseded

**Use [`build-feature/SKILL.md`](./build-feature/SKILL.md) instead.**

This file was a seven-step outline: load context, expand the requirement, make a todo list,
implement, test, verify, PR. Everything in it still happens, but it had none of the machinery
the work actually needs — no ticket workspace, no evidence, no layer placement decision, no
extension points, no public API review, no metrics — and a short skill sitting next to a
thorough one gets picked by accident.

`build-feature` extends [`fix-bug`](./fix-bug/SKILL.md), inheriting the workspace, gate, story
capture, PR, CI and metrics phases, and overriding the bug-shaped ones with design and layer
placement, vertical-slice delivery, and docs as deliverables.
