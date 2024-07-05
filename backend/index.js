import express from "express";
import bodyParser from "body-parser";
import ytdl from "ytdl-core";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Ensure downloads directory exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const downloadsDir = path.resolve(__dirname, "downloads");

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

function sanitizeFilename(filename) {
  return filename.replace(/[\/\\:|?*"<>]/g, "_");
}

app.post("/downloads", async (req, res) => {
  const videoUrl = req.body.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const info = await ytdl.getInfo(videoUrl);
    const videoTitle = sanitizeFilename(info.videoDetails.title);
    const videoPath = path.resolve(downloadsDir, `${videoTitle}.mp4`);

    const videoStream = ytdl(videoUrl, { format: "mp4" });
    const fileStream = fs.createWriteStream(videoPath);

    videoStream.pipe(fileStream);

    fileStream.on("finish", () => {
      const downloadUrl = `http://localhost:3000/downloads/${encodeURIComponent(
        videoTitle
      )}.mp4`;
      res.json({ downloadUrl });
    });

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      res.status(500).json({ error: "Failed to download video" });
    });
  } catch (error) {
    console.error("Video download error:", error);
    res.status(500).json({ error: "Failed to fetch video details" });
  }
});


app.use("/downloads", express.static(downloadsDir));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
