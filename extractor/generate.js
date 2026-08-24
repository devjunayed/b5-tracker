import { execSync } from "child_process";
import fs from "fs";
import readline from "readline";

const OUTPUT_FILE = "modules.sql";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  let PLAYLIST_URL = process.argv[2];
  let MISSION_ID = process.argv[3];

  if (!PLAYLIST_URL) {
    PLAYLIST_URL = await ask("Enter playlist url: ");
  }
  if (!PLAYLIST_URL) {
    console.log("Invalid url");
    process.exit(1);
  }

  if (!MISSION_ID) {
    MISSION_ID = await ask("Enter Mission ID: ");
  }
  if (!MISSION_ID) {
    console.log("Invalid ID");
    process.exit(1);
  }

  rl.close();

  try {
    console.log("📥 Fetching playlist data...");

    const raw = execSync(
      `yt-dlp --flat-playlist --no-lazy-playlist --playlist-end 500 -J "${PLAYLIST_URL}"`,
      { maxBuffer: 1024 * 1024 * 10 },
    );

    const data = JSON.parse(raw.toString());

    if (!data.entries || data.entries.length === 0) {
      throw new Error("No videos found in playlist");
    }

    console.log(`✅ Found ${data.entries.length} videos`);

    let position = 0;
    const values = data.entries.map((video) => {
      const title = (video.title || "Untitled").replace(/'/g, "''");
      const duration = video.duration || 0;
      const link = `https://www.youtube.com/watch?v=${video.id}`;
      return `( ${MISSION_ID}, '${title}', false, ${position++}, NOW(), ${duration}, '${link}')`;
    });

    const sql = `
INSERT INTO modules 
("missionId", name, done, position, "createdAt", "durationMinutes", link)
VALUES
${values.join(",\n")};
`;

    fs.writeFileSync(OUTPUT_FILE, sql.trim());
    console.log(`\n🎉 SQL file generated: ${OUTPUT_FILE}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
