import Track from "../models/track.js";
import jsmediatags from "jsmediatags";

const getTrackMetadata = (filePath) => {
  return new Promise((resolve) => {
    jsmediatags.read(filePath, {
      onSuccess: (tag) => {
        resolve({
          title: tag.tags.title || null,
          artist: tag.tags.artist || null,
        });
      },
      onError: (error) => {
        console.error("Error reading metadata:", error);
        resolve({ title: null, artist: null });
      },
    });
  });
};

async function addTracks(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No tracks uploaded" });
    }

    const trackPromises = req.files.map(async (file) => {
      const metadata = await getTrackMetadata(file.path);

      const newTrack = new Track({
        title: metadata.title || file.originalname,
        artist: metadata.artist || "unknown",
        fileUrl: file.path.replace(/\\/g, "/"),
        userId: req.userId,
      });
      return newTrack.save();
    });

    const savedTracks = await Promise.all(trackPromises);

    return res.status(200).json({
      message: `${savedTracks.length} tracks uploaded successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Error: ${error.message}`,
    });
  }
}

export { addTracks };
