import Track from "../models/track.js";
import jsmediatags from "jsmediatags";
import path from "path";
import fs from "fs/promises";
import * as mm from "music-metadata";

const getTrackMetadata = (filePath) => {
  return new Promise((resolve) => {
    jsmediatags.read(filePath, {
      onSuccess: (tag) => {
        const { title, artist, picture } = tag.tags;
        resolve({
          title: title || null,
          artist: artist || null,
          pictureData: picture || null,
        });
      },
      onError: (error) => {
        console.error("Error reading metadata:", error);
        resolve({ title: null, artist: null, pictureData: null });
      },
    });
  });
};

async function addTracks(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No tracks uploaded" });
    }

    const userId = req.userId;
    const thumbnailDir = path.join(
      ".",
      "uploads",
      "tracks",
      userId,
      "thumbnail",
    );
    await fs.mkdir(thumbnailDir, { recursive: true });

    const trackPromises = req.files.map(async (file, index) => {
      const metadata = await getTrackMetadata(file.path);
      let thumbnailUrl = null;
      const { format } = await mm.parseFile(file.path);
      const duration = format.duration || 0;
      if (metadata.pictureData) {
        const { data, type } = metadata.pictureData;
        const imageBuffer = Buffer.from(data);
        const extension = type.split("/")[1] || "jpg";
        const thumbnailFilename = `thumb-${Date.now()}-${index}.${extension}`;
        const finalThumbnailPath = path.join(thumbnailDir, thumbnailFilename);
        await fs.writeFile(finalThumbnailPath, imageBuffer);
        thumbnailUrl = finalThumbnailPath.replace(/\\/g, "/");
      }

      const newTrack = new Track({
        title: metadata.title || file.originalname.replace(/\.[^/.]+$/, ""),
        artist: metadata.artist || "unknown",
        fileUrl: file.path.replace(/\\/g, "/"),
        thumbnailUrl: thumbnailUrl,
        userId: userId,
        duration: duration,
      });

      return newTrack.save();
    });

    const savedTracks = await Promise.all(trackPromises);

    return res.status(200).json({
      message: `${savedTracks.length} tracks uploaded successfully`,
      tracks: savedTracks,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

async function getTracks(req, res) {
  try {
    const userId = req.userId;
    const tracks = await Track.find({
      userId: userId,
    });
    return res.json({ message: "Fetched tracks successfully", tracks });
  } catch (_) {
    return res.status(500).json({
      message: "Failed to fetch tracks",
    });
  }
}

export { addTracks, getTracks };
