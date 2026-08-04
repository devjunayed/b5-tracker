# Project Requirement Document

<!-- What to build -->
<!-- Targeted Users -->
<!-- Features -->

 <!-- !important update the file regularly -->

## What This Is

A personal, single-user progress tracker for Md's "Batch 5" full-stack web development
program (and generally reusable for any self-paced course). Not a multi-tenant SaaS product —
there is no auth/login, no user accounts, and no per-user data isolation. Every course shown
is visible to whoever loads the app.

## Targeted Users

- Primary (only, currently): Md himself, tracking his own learning progress through
  course → mission → module content.
- Not designed for: multiple simultaneous users, instructors, or public/shared dashboards.
  If multi-user support is ever wanted, that's a scope change requiring auth — not assumed
  by the current codebase.

## Core Features (as actually implemented)

- **Courses**: create, delete, and reset (mark all modules under it as not-done). A course
  holds an ordered list of missions.
- **Missions**: create and delete, scoped to a course. A mission holds an ordered list of
  modules and tracks `timeMinutes` (see architecture.md — actually stores seconds).
- **Modules**: create (with name, optional link, and a duration entered as free text like
  `"1h 2m"`), toggle done/not-done, delete. Scoped to a mission. Modules may also own
  submodules; when submodules exist, the parent module is completed only when all child
  submodules are done, and its displayed time is the sum of the submodules' durations.
- **Submodules**: create under a module, toggle done/not-done, and contribute to the
  parent module's completion and duration rollups.
- **Progress stats**: overall stats, per-course stats, per-mission stats — all computed as
  `done / total` module counts and time completed vs. remaining, derived client-side.
- **Multi-course dashboard**: sidebar lists all courses with their own progress bar; one
  course is "active" at a time in the main panel.
- **Destructive-action safeguards**: deleting a course/mission/module requires a confirm
  modal; resetting a course requires typing "reset now" exactly.

## Explicitly NOT built (don't assume these exist)

- No authentication or authorization of any kind.
- No light mode / theme switching.
- No notes/descriptions on modules beyond `name` and an optional `link`.
- No deadline tracking, reminders, or notifications.
- No history/analytics (e.g. "completed 3 modules this week").
- No export (PDF/CSV) of progress.
- No drag-and-drop reordering UI — `position` exists in the schema but nothing in the UI
  currently lets a user change it after creation.
- No dedicated `/api/courses` routes — course operations are folded into `/api/missions`
  via a `kind` field (see architecture.md). Don't build a parallel courses endpoint without
  checking rules.md first.

These match the README's "Future Enhancements" checklist, which is still accurate as a
list of unbuilt ideas — but note the README's _current_ feature list and schema section are
stale (still describes a two-level Mission/Module model without Course). Trust this PRD and
architecture.md over the README's body text for what's currently built.

## Success Criteria

- Md can add a course, break it into missions, break those into modules with time estimates,
  and check things off as he studies — without data loss or broken state — using nothing but
  a Postgres database and this Next.js app.
- Any AI agent reading only this repo's `.md` files (not chat history) should be able to
  correctly describe what the app does, its data model, and its constraints without needing
  to guess from the README.
