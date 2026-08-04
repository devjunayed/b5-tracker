# Rules
<!-- What to use -->
<!-- What to avoid -->
<!-- !important Means Libraries, error handling, boundaries for AI -->
 <!-- !important update the file regularly -->

## Source of Truth

If anything in `README.md` conflicts with the actual code (schema, routes, components), the
**code wins**. `README.md` is user-facing marketing/setup copy and is known to be stale in
places (e.g. it doesn't mention the `Course` model at all). Update the README opportunistically
when you notice drift, but never let it override what the code actually does when writing or
reasoning about this project.

## What to Use

- **Prisma Client**: import from the local generated output (`@/lib/prisma`, which itself
  imports from `../../generated`), never from `@prisma/client` directly — the generator is
  configured with a custom `output` path.
- **DB access pattern**: use `prisma.<model>.<verb>` inside API routes only. Don't call
  Prisma from client components (`'use client'` files) — all DB access must go through
  `src/app/api/**/route.ts`.
- **State/data fetching**: extend `useTracker.ts` for new client data needs rather than
  introducing a second data-fetching pattern (no SWR/React Query without discussing it —
  the whole app currently uses one hand-rolled hook).
- **Styling**: add classes to `src/app/globals.css` using existing CSS variables (`--bg`,
  `--accent`, etc.) and existing naming conventions. Don't introduce Tailwind, CSS Modules,
  or styled-components into parts of the app that don't already use them.
- **IDs**: all models use autoincrementing `Int` ids, not UUIDs. Keep this consistent for
  any new models.
- **Ordering**: new orderable models should follow the existing `position` (Int, defaulted
  to sibling `count()` at creation) + `orderBy: [{position: 'asc'}, {id: 'asc'}]` pattern.
- **Time values**: read architecture.md's note on `durationMinutes`/`timeMinutes` before
  touching anything time-related — those fields store **seconds**, not minutes, despite the
  name. Use `parseTimeInput()` / `formatTime()` from `src/lib/time.ts` for any new
  time-entry or time-display UI rather than writing new parsing/formatting logic.

## What to Avoid

- Don't add authentication/multi-tenancy speculatively — out of scope per `prd.md` unless
  Md explicitly asks for it.
- Don't rename `durationMinutes`/`timeMinutes` to fix the seconds-vs-minutes naming mismatch
  without an explicit request — it's a real inconsistency but fixing it means a migration
  plus coordinated changes across schema, types, API routes, the hook, and every component
  that displays a duration. Flag it if relevant; don't silently "fix" it mid-task.
- Don't add a parallel `/api/courses` route set without checking with Md first — course
  create/delete is currently folded into `/api/missions` via a `kind` discriminator field,
  and splitting it is a deliberate API-shape decision, not a bug.
- Don't introduce new global state management libraries (Redux, Zustand, Context providers
  for server data, etc.) — the app is intentionally simple, one hook, no caching layer.
- Don't hardcode colors/spacing that duplicate an existing CSS variable in `globals.css`.
- Don't assume Supabase's JS client (`src/lib/supabase.ts`) is wired into the UI — it isn't
  currently imported anywhere outside `lib/`. If a task needs Supabase auth/storage/realtime,
  that's new integration work, not "already there."
- Don't commit real values for `.env` — only `.env` variable *names* should ever appear in
  docs (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

## Error Handling Conventions

- API routes that can fail predictably (bad input, not found) return
  `NextResponse.json({ error: '...' }, { status: <4xx> })`; unexpected failures are caught,
  logged with `console.error('[METHOD /path]', error)`, and returned as a generic 500 with
  a short `error` message. Follow this shape for any new route — don't leak stack traces or
  raw Prisma errors to the client.
- Not every existing route follows this consistently (e.g. `modules/[id]/route.ts` wraps
  everything in try/catch and returns 404 on any delete failure, even non-"not found"
  errors) — new code should use the more precise pattern (validate input → specific status
  codes) rather than copying the loosest existing example.
- Client-side: `useTracker`'s `apiFetch` throws on non-OK responses; components should let
  that propagate to whatever caller can show an error (see the `error` state + banner in
  `page.tsx`) rather than swallowing it silently.

## Boundaries for AI / Agents

- Treat the six root `.md` files (`architechture.md`, `design.md`, `memory.md`, `phases.md`,
  `prd.md`, `rules.md`) as the primary context for understanding this project — read them
  before making non-trivial changes, and update them (especially `memory.md`) after making
  changes, per the "update regularly" reminders already in each file.
- When these `.md` files and `README.md` disagree, follow the `.md` files described here
  (which reflect actual code) and treat the README as due for a fix, not as authoritative.
- Ask before doing large schema changes, renames, or removing the `Course` layer — those are
  structural decisions, not routine edits.