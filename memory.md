# Memory
<!-- What have been completed -->
<!-- which file is currently been worked  -->

 <!-- !important update the file regularly -->

## Current state (as of this update)

All core CRUD for Course → Mission → Module is implemented and working end-to-end:
create/delete courses (+ reset), create/delete missions, create/toggle/delete modules,
full stats rollups, single-page dashboard UI. See `architechture.md` for the full picture,
`prd.md` for what's in/out of scope, `phases.md` for how it got here.

## What was just done in this session

Read the full project (schema, migrations, all API routes, hook, components, CSS, configs)
and rewrote `architechture.md`, `design.md`, `prd.md`, `rules.md`, and `phases.md` from
scratch (they were empty comment-only templates before). Key corrections made relative to
`README.md`, which was found to be stale:

- README describes only a `Mission`/`Module` model; the real schema has a third `Course`
  layer above `Mission` (added in migration `20260705000000_add_courses_and_module_links`).
- README doesn't mention `Module.link`, `Module.durationMinutes`, `Mission.timeMinutes`, or
  the toggle route (`PATCH /api/modules/:id/toggle`).
- README's component list is missing `AddModuleForm`, `ConfirmModal`, `ResetModal`.
- Documented a real naming inconsistency: `durationMinutes`/`timeMinutes` fields actually
  store **seconds**, not minutes (see `architechture.md` for the trace-through). This is
  not fixed — just documented — since fixing it needs a coordinated migration + code change
  Md hasn't asked for yet.

`README.md` itself was **not** rewritten in this pass — per instructions, the project (code)
took priority as the source of truth for the other five docs, and README was only used where
it didn't conflict. It still needs a follow-up pass to match current reality (flagged in
`phases.md` under "Not yet phased / open").

## Currently being worked on

Nothing in-flight — docs are now current as of this session. Next natural step, if Md wants
it, is updating `README.md` itself to match.

## How to keep this file useful

Every session that changes code or docs should append (not replace) a short dated note here:
what changed, which files, and anything a future AI session would need to know that isn't
obvious from reading the code alone (like the seconds/minutes quirk was). Keep entries terse.