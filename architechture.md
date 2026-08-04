# Architecture

<!-- app flow and architecture -->
<!-- folders and files structure -->
<!-- tech stack -->

> Filename note: this file is spelled `architechture.md` (extra "h") on disk. Keep the
> existing filename unless Md renames it — don't silently "fix" the typo in links/scripts.

## Tech Stack

- **Framework**: Next.js 16 (App Router), React 19
- **Language**: TypeScript, strict mode on
- **Database**: PostgreSQL, accessed via Prisma ORM 7 using the `@prisma/adapter-pg` driver
  adapter (not the default Prisma engine binary)
- **Hosting for DB**: Supabase Postgres (pooled connections)
- **Styling**: Plain CSS3 with CSS custom properties in `src/app/globals.css` — no Tailwind,
  no CSS-in-JS, no component library
- **Client state**: A single hook (`useTracker`) using React `useState`/`useCallback`, no
  Redux/Zustand/React Query
- **`@supabase/supabase-js`** is installed and configured (`src/lib/supabase.ts`) but is not
  currently imported anywhere in `src/app` or `src/components`. Supabase is only used as the
  Postgres host; all reads/writes go through Prisma + API routes, not the Supabase client.

## Data Model

Four-level hierarchy: **Course → Mission → Module → Submodule**.

```
Course (courses)
 ├── id, title, position, createdAt
 └── Mission (missions)
      ├── id, courseId, title, timeMinutes, position, createdAt
      └── Module (modules)
           ├── id, missionId, name, link, durationMinutes, done, position, createdAt
           └── Submodule (submodules)
                ├── id, moduleId, name, durationMinutes, done, position, createdAt
```

- `onDelete: Cascade` is defined on `Mission.course`, `Module.mission`, and
  `Submodule.module` — deleting a Course deletes its Missions, Modules, and Submodules;
  deleting a Mission deletes its Modules and Submodules; deleting a Module deletes its
  Submodules.
- `position` on all three models drives manual ordering (see `orderBy` in API routes);
  it is set to the current sibling `count()` at creation time, so items are appended in
  creation order by default.
- Prisma client is generated to `./generated` (custom `output` in `schema.prisma`), **not**
  `node_modules/.prisma/client`. Imports use `../../generated` / `../generated`, not
  `@prisma/client`.

### ⚠️ Known naming quirk: `durationMinutes` / `timeMinutes` actually store **seconds**

This is a real mismatch between field names and stored values — not a bug to "fix" without
Md's go-ahead, but something every AI/agent touching this code needs to know:

- `AddModuleForm` collects a string like `"1h 2m"` and runs it through
  `parseTimeInput()` (`src/lib/time.ts`), which returns **total seconds**
  (`hours*3600 + minutes*60 + seconds`).
- That value is stored directly in `Module.durationMinutes` and rolled up into
  `Mission.timeMinutes` / stats — despite the field name, the number is seconds.
- Display goes through `formatTime(totalSeconds)`, which also expects seconds.
- Net effect: the read/write path is internally consistent (seconds in, seconds out), so the
  app behaves correctly end-to-end. Only the column/field/prop **names** are misleading.
- **Rule for future work**: treat `durationMinutes` and `timeMinutes` as "duration in
  seconds" wherever you touch them. Do not add new code that treats them as minutes (e.g.
  don't multiply by 60 again). If renaming is ever done, it requires a migration plus
  updates in `types/index.ts`, all API routes, `useTracker.ts`, `time.ts` callers, and every
  component that displays a duration.

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              # Root HTML layout, page metadata
│   ├── page.tsx                # The entire UI — single route, single page
│   ├── globals.css             # All styling (CSS variables + component classes)
│   └── api/
│       ├── missions/
│       │   ├── route.ts        # GET (list courses+missions+modules), POST (create course OR mission)
│       │   └── [id]/route.ts   # DELETE (mission or, with ?kind=course, a course),
│       │                       # PATCH (update mission.timeMinutes, OR reset-course),
│       │                       # POST (create a module under this mission)
│       └── modules/
│           └── [id]/
│               ├── route.ts        # DELETE a module
│               ├── toggle/route.ts # PATCH — flip module.done
│               └── submodules/route.ts # POST — create a submodule under a module
│       └── submodules/
│           └── [id]/
│               └── toggle/route.ts # PATCH — flip submodule.done
├── components/
│   ├── MissionCard.tsx         # Expand/collapse mission, shows modules + add-module form
│   ├── ModuleItem.tsx          # Single module row: checkbox, link, duration, delete
│   ├── AddForm.tsx             # Generic single-text-input add form (course/mission titles)
│   ├── AddModuleForm.tsx       # Module-specific add form (name + duration + optional link)
│   ├── ProgressBar.tsx         # Reusable progress bar (sm/md sizes)
│   ├── ConfirmModal.tsx        # Generic delete confirmation dialog
│   └── ResetModal.tsx          # Type-to-confirm ("reset now") dialog for resetting a course
├── hooks/
│   └── useTracker.ts           # All client-side data fetching + mutations + derived stats
├── lib/
│   ├── prisma.ts               # Prisma client singleton (pg adapter)
│   ├── supabase.ts             # Supabase client (configured, currently unused in UI)
│   └── time.ts                 # formatTime() and parseTimeInput() — see quirk above
└── types/
    └── index.ts                # Course, Mission, Module, MissionStats, TimeStats
```

Note: this differs from the structure documented in `README.md`, which only describes a
two-level Mission/Module model with no `api/modules/[id]/toggle` route, no
`AddModuleForm`/`ConfirmModal`/`ResetModal`, and no `Course` model. The project (code) is the
source of truth; the README is stale on this point — see `memory.md` for the correction note.

## App Flow

1. `page.tsx` mounts → `useTracker()` fires `GET /api/missions` → returns all Courses with
   nested Missions and Modules (ordered by `position`, then `id`).
2. UI keeps one "active course" (`activeCourseId`) selected in local state; the left sidebar
   lists all courses, the right pane shows the active course's missions.
3. All mutations (add/delete/toggle/reset) call the relevant API route, then patch local
   React state directly from the response — there is no re-fetch of the whole tree after
   each mutation (optimistic-ish, but not a true optimistic-update pattern except for
   `toggleModule`, which flips local state immediately and reverts on failure).
4. Derived stats (`overallStats`, `timeStats`, per-course/per-mission stats) are computed
   client-side in `useTracker` from the in-memory `courses` array — nothing is cached or
   memoized beyond `useMemo` in `page.tsx` for the active course's dashboard numbers.
5. Deleting a course or resetting a course requires typed confirmation via `ConfirmModal` /
   `ResetModal` (the latter requires typing "reset now").

## API Contract Summary

| Method | Path                          | Purpose                                                                                                                                 |
| ------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/missions`               | List all courses with nested missions + modules                                                                                         |
| POST   | `/api/missions`               | Create a course (`{ kind: 'course', title }`) or a mission (`{ courseId, title }`)                                                      |
| DELETE | `/api/missions/:id`           | Delete a mission; add `?kind=course` to delete a course instead                                                                         |
| PATCH  | `/api/missions/:id`           | Update `timeMinutes` on a mission, or reset a course (`{ kind: 'reset-course' }`) — sets all modules under that course to `done: false` |
| POST   | `/api/missions/:id`           | Create a module under mission `:id` (`{ name, durationMinutes, link? }`)                                                                |
| POST   | `/api/modules/:id/submodules` | Create a submodule under module `:id` (`{ name, durationMinutes }`)                                                                     |
| DELETE | `/api/modules/:id`            | Delete a module                                                                                                                         |
| PATCH  | `/api/modules/:id/toggle`     | Flip a module's `done` boolean (derived from its submodules when present)                                                               |
| PATCH  | `/api/submodules/:id/toggle`  | Flip a submodule's `done` boolean                                                                                                       |

There is currently no dedicated `DELETE /api/courses/:id` or `POST /api/courses` route —
course creation/deletion is folded into the `missions` routes via the `kind` field. This is
intentional for now (see `rules.md` for whether to keep or split this later).
