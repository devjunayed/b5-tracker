# Phases

<!-- Break project into phases -->
<!--
    Ex:
    Phase 1: Login (Completed)
    Phase 2: Dashboard (Working on)

 -->
 <!-- !important update the file regularly -->

Reconstructed from migration history (`prisma/migrations/`) and current code, since no
prior phase log existed.

- **Phase 1: Core Mission/Module tracker (Completed)**
  Initial schema — `Mission` and `Module` only, no `Course` layer, no time tracking.
  (`20260527055311_init`)

- **Phase 2: Mission time tracking (Completed)**
  Added `timeMinutes` to `Mission`. (`20260527083000_add_mission_time`)

- **Phase 3: Module duration tracking (Completed)**
  Added `durationMinutes` to `Module`, enabling per-module time estimates and the
  `formatTime`/`parseTimeInput` UI in `AddModuleForm`. (`20260527090000_add_module_duration`)

- **Phase 4: Multi-course support + module links (Completed)**
  Added the `Course` model as a new top-level layer above `Mission`, and added an optional
  `link` field to `Module`. This is the current schema shape.
  (`20260705000000_add_courses_and_module_links`)

- **Phase 5: Documentation alignment (Completed)**
  Brought `architechture.md`, `design.md`, `memory.md`, `phases.md`, `prd.md`, and `rules.md`
  in line with the actual codebase and documented the current Course → Mission → Module →
  Submodule structure.

- **Phase 6: Submodule-based module completion (Completed)**
  Added nested submodule support so a module can be completed only when all its child
  submodules are done, and time rollups use submodule durations when present.

## Not yet phased / open

- README.md still needs a rewrite pass to match the current Course→Mission→Module model
  (currently describes the Phase 1 shape).
- No phase yet for: reordering UI (drag-and-drop for `position`), auth, analytics/history,
  export, light theme — these remain unscheduled "Future Enhancements" per `prd.md`.

Update this file whenever a phase is completed or a new one is started — add new entries
rather than deleting old ones, so this stays a real history.
