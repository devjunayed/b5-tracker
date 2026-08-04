# Design
<!-- Colors & theme -->
<!-- fonts -->
<!-- typography -->

## Theme

Dark theme only. No light mode exists yet (README lists "Dark/Light mode toggle" under
Future Enhancements — not implemented). All colors are CSS custom properties defined once in
`:root` in `src/app/globals.css` — always use these variables, never hardcode hex values in
components or inline styles.

```css
--bg:        #0f1117;  /* page background */
--surface:   #161b27;  /* cards, panels */
--surface2:  #1e2535;  /* nested/secondary surfaces */
--border:    #2a3347;  /* borders/dividers */
--accent:    #22c57e;  /* primary green — buttons, progress fill, links */
--accent-dim:#16a660;  /* hover/pressed state of accent */
--text:      #e8eaf0;  /* primary text */
--muted:     #8892a4;  /* secondary/label text */
--track:     #2a3347;  /* progress bar track (unfilled) */
--danger:    #e05555;  /* delete/destructive actions */
--radius:    10px;     /* default corner radius */
```

## Fonts / Typography

- `font-family: 'Geist', 'Inter', system-ui, sans-serif;` set once on `html, body`.
- No `@font-face` declarations and no font files/CDN links are present anywhere in the
  project — Geist/Inter are only referenced by name and will silently fall back to
  `system-ui` unless/until they're actually loaded (e.g. via `next/font`). Don't assume the
  named fonts are actually rendering; if pixel-accurate typography ever matters, add
  `next/font` loading first.
- Base font size 16px, line-height 1.6, set on `html, body`.
- Headings and stat numbers use weight ~650 and larger sizes (e.g. `.dashboard-header h1` at
  1.7rem) but there's no formal type scale beyond what's used ad hoc per component class in
  `globals.css`.

## UI Structure & Patterns

- Single dark card-based layout: a top header/dashboard summary (`summary-grid` of 4 cards),
  then a two-column workspace (`course-sidebar` + `course-detail`).
- Buttons follow three variants: `.btn-primary` (accent, filled), `.btn-ghost` (bordered,
  transparent), `.btn-danger` (red, filled) — reuse these classes, don't invent new button
  styles per component.
- Progress bars (`ProgressBar.tsx`) come in two sizes (`sm` = 4px height, `md` = 8px) and are
  the only place bar-fill styling should be defined — don't reimplement progress bars inline.
- Modals (`ConfirmModal`, `ResetModal`) share a `.modal-backdrop` / `.confirm-modal`
  structure — any new modal should reuse these classes rather than adding a new pattern.
- Hover-to-reveal delete buttons (`.delete-btn` with `opacity` toggled via local `hovering`/
  `hovered` state) is the established pattern for destructive row actions — followed in both
  `MissionCard` and `ModuleItem`.
- All styling lives in one file, `src/app/globals.css` (~900 lines) — there is no CSS
  Modules, styled-components, or Tailwind. New styles should be added there as plain classes
  following the existing BEM-ish naming (`.mission-card`, `.mission-header`, etc.), not as
  inline `style={{}}` unless it's a one-off dynamic value (e.g. progress bar width/opacity,
  which the codebase already does inline for exactly that reason).

## Known gaps vs README

`README.md` mentions a light/dark toggle and a `--danger` variable naming that matches, but
does not mention that fonts aren't actually loaded, or the button/modal class conventions
above. Follow this file and the actual CSS over the README's brief "Customization" section.