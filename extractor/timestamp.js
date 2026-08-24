import ytdlp from "yt-dlp-exec";
import fs from "fs";

const PLAYLIST_URL = process.argv[2];
const MISSION_ID = 25;

const data = await ytdlp(PLAYLIST_URL, {
  dumpSingleJson: true,
  yesPlaylist: true,
  playlistEnd: 500,
});

const videos = data.entries ? data.entries : [data];

const safeTitle = (text) =>
  text.replace(/'/g, "''").replace(/\n/g, " ");

let sql = `
SELECT setval(
  'modules_id_seq',
  (SELECT MAX(id) FROM modules)
);
-
INSERT INTO modules 
( "missionId", name, done, position, "createdAt", "durationMinutes", link)
VALUES\n`;

let index = 0;


for (const video of videos) {
  if (!video) continue;

  const durationMinutes = Math.max(
    1,
    Math.ceil((video.duration || 0) / 60)
  );

  if (video.chapters?.length) {
    for (const chapter of video.chapters) {
      const link = `https://www.youtube.com/watch?v=${video.id}&t=${chapter.start_time}s`;

      const chapterDuration = Math.max(
        1,
        Math.ceil((chapter.end_time - chapter.start_time) / 60)
      );

      sql += `( ${MISSION_ID}, '${safeTitle(
        chapter.title
      )}', false, ${index++}, NOW(), ${chapterDuration}, '${link}'),\n`;
    }
  } else {
    const link = `https://www.youtube.com/watch?v=${video.id}`;

    sql += `( ${MISSION_ID}, '${safeTitle(
      video.title
    )}', false, ${index++}, NOW(), ${durationMinutes}, '${link}'),\n`;
  }
}

sql = sql.slice(0, -2) + ";";

fs.writeFileSync("modules.sql", sql);
console.log("✅ SQL file generated");