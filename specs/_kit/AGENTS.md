# Spec-driven development — instructions for coding agents

Copy this section into the product repository's `AGENTS.md` / `CLAUDE.md`.

## Source of truth
- Features are specified in `specs/<NN-feature>/` (copied from the UX/UI prototype repository
  `ntechcolab-prog/customerportal_test`, or fetched from MIRA through its MCP server).
- Only implement a feature whose `spec.md` has `status: ready`. If it is `draft`, stop and say so.
- Read, in this order: `spec.md`, `business-rules.md`, `handoff/` (screens, components, foundations).

## Rules
1. Do not invent behaviour, rules, permissions, fields, endpoints or states that are not in the spec.
   If something is missing, stop and list it as a question for UX/UI (MIRA comment on the related screen).
2. Rules labeled **Assumption** are implemented as written; keep them easy to change.
3. Write `plan.md` first (map every `BR-` id to where it is implemented), then `tasks.md`
   (each task lists the `AC-` ids it closes). Ask for review before coding.
4. Every `AC-` id becomes at least one automated test. Put the id in the test name,
   e.g. `test("AC-SR-004 send is disabled until the form is valid", ...)`.
5. Reference ids in commits and PRs: `CP-XXX AC-SR-004: ...`.
6. If the spec and the prototype disagree, the spec wins; report the conflict.
7. Behaviour changes go back to the spec first. Do not change behaviour in code only.

## MIRA MCP (optional)
With the MIRA MCP server connected, use `get_handoff`, `get_business_rules`, `get_screen_context`
and `get_screen_image` to read the approved screens instead of copying them by hand.
