# Extractor

Generates PostgreSQL `INSERT` statements for a `modules` table from a YouTube playlist — pulling video titles, durations, and links via `yt-dlp`, and (when available) splitting videos into their individual chapters as separate module rows.

Part of the [course-tracker] pipeline: this script sits in front of the Next.js/PostgreSQL tracker app, converting a raw YouTube playlist into SQL that can be inserted under a given Mission.

## Requirements

- Node.js (with ES modules support — `"type": "module"` is set in `package.json`)
- `yt-dlp` installed on the machine and available on your `PATH`. Both scripts depend on it — `generate.js` calls the `yt-dlp` binary directly via `execSync`, and `index.js` uses `yt-dlp-exec`, which is a thin Node wrapper around the same binary, not a replacement for it.
  - macOS: `brew install yt-dlp`
  - Linux: `sudo apt install yt-dlp` (or via `pip install -U yt-dlp` for a more current version)
  - Windows: `winget install yt-dlp` (or download the standalone `.exe` from the [yt-dlp releases page](https://github.com/yt-dlp/yt-dlp/releases))
  - Verify with `yt-dlp --version`
- A PostgreSQL database with a `modules` table matching the shape below:

```sql
modules (
  id                serial primary key,
  "missionId"       integer,
  name              text,
  done              boolean,
  position           integer,
  "createdAt"       timestamp,
  "durationMinutes" integer,
  link              text
)
```

## Setup

```bash
npm install
```

This installs `yt-dlp-exec`, the only listed dependency — but it does **not** install `yt-dlp` itself. Make sure `yt-dlp` is installed separately as described above before running either script.

## Usage

### `index.js` — chapter-aware extractor (recommended)

Pulls playlist data via the `yt-dlp-exec` package. If a video has chapters, each chapter becomes its own module row (with a timestamped link and its own duration); otherwise the whole video becomes one row. Also prepends a `setval` call to resync the `modules` sequence before inserting.

```bash
node index.js <playlist_url>
```

- `MISSION_ID` is currently hardcoded to `25` at the top of the file — edit this before running, or refactor it to accept a CLI arg / prompt (see `generate.js` for that pattern).
- Output: `modules.sql` in the project root.

### `generate.js` — interactive extractor

Uses `yt-dlp` directly via `execSync`. Prompts interactively for the playlist URL and Mission ID if they aren't passed as arguments.

```bash
node generate.js <playlist_url> <mission_id>
# or, to be prompted instead:
node generate.js
```

- `npm run dev` is wired to this script (`node generate.js`), so `npm run dev` is equivalent to running it with no arguments and answering the prompts.
- Output: `modules.sql` in the project root.
- Does not split on chapters — one row per video.

## Output

Both scripts write a `modules.sql` file containing an `INSERT INTO modules (...) VALUES (...);` statement, one row per module (or chapter), ready to run against your database:

```bash
psql -d your_database -f modules.sql
```

## Notes / Known Limitations

- Neither script escapes `MISSION_ID` or quotes it — only single quotes in titles are escaped. Treat `modules.sql` as trusted output from a trusted playlist before running it against a real database; don't run it against untrusted playlist input unmodified.
- `generate.js` and `index.js` currently overwrite `modules.sql` on each run — copy or rename the output if you need to keep results from multiple playlists.
- `playlistEnd` / `--playlist-end` is capped at 500 videos per run in both scripts.