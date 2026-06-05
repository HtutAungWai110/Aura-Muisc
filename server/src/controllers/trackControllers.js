import Track from "../models/track.js";
import jsmediatags from "jsmediatags";
import path from "path";
import fs from "fs/promises";
import * as mm from "music-metadata";
import AppError from "../lib/appError.js";

const getTrackMetadata = async (filePath) => {
  return new Promise((resolve) => {
    jsmediatags.read(filePath, {
      onSuccess: (tag) => {
        const { title, artist, picture } = tag.tags;
        resolve({
          title: title ?? null,
          artist: artist ?? null,
          pictureData: picture ?? null,
        });
      },
      onError: (error) => {
        console.warn(
          "Warning: Could not read metadata for file:",
          filePath,
          error,
        );
        resolve({ title: null, artist: null, pictureData: null });
      },
    });
  });
};

async function addTracks(req, res, next) {
  try {
    // Validate files exist
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "No tracks uploaded" });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const trackPromises = req.files.map(async (file, index) => {
      try {
        // Validate file exists
        if (!file.path) {
          throw new Error(`File path missing for file at index ${index}`);
        }

        // Parse audio metadata for duration
        let duration = 0;
        try {
          const { format } = await mm.parseFile(file.path);
          duration = format.duration || 0;
        } catch (parseError) {
          console.warn(
            "Warning: Could not parse audio format for:",
            file.path,
            parseError,
          );
        }

        const metadata = await getTrackMetadata(file.path);
        let thumbnailUrl = null;

        const thumbnailDir = path.join(
          "uploads",
          userId.toString(),
          "thumbnail",
        );
        await fs.mkdir(thumbnailDir, { recursive: true });

        // Handle thumbnail extraction
        if (metadata.pictureData && metadata.pictureData.data) {
          try {
            const { data, type } = metadata.pictureData;
            const imageBuffer = Buffer.from(data);
            const extension = type.split("/")[1] || "jpg";
            const thumbnailFilename = `thumb-${Date.now()}-${index}.${extension}`;
            const finalThumbnailPath = path.join(
              thumbnailDir,
              thumbnailFilename,
            );
            await fs.writeFile(finalThumbnailPath, imageBuffer);
            // Use forward slashes for URL consistency
            thumbnailUrl = finalThumbnailPath.replace(/\\/g, "/");
          } catch (thumbnailError) {
            console.warn(
              "Warning: Failed to save thumbnail for:",
              file.path,
              thumbnailError,
            );
          }
        }

        // Create track document
        const newTrack = new Track({
          title:
            metadata.title ??
            file.originalname.replace(/\.[^/.]+$/, "") ??
            "Unknown Title",
          artist: metadata.artist ?? "Unknown Artist",
          fileUrl: file.path.split(path.sep).join("/"),
          thumbnailUrl: thumbnailUrl,
          userId: userId,
          duration: duration,
        });

        return await newTrack.save();
      } catch (fileError) {
        console.error("Error processing file at index", index, ":", fileError);
        // Re-throw to be caught by outer try/catch
        throw fileError;
      }
    });

    // Wait for all tracks to be processed
    const savedTracks = await Promise.all(trackPromises);

    return res.status(201).json({
      message: `${savedTracks.length} tracks uploaded successfully`,
      tracks: savedTracks,
    });
  } catch (error) {
    console.error("Error in addTracks:", error);
    next(new AppError("Failed to upload tracks. Please try again.", 500));
  }
}

async function getTracks(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tracks = await Track.find({ userId: userId }).sort({ addedAt: -1 });
    return res.json(tracks);
  } catch (error) {
    console.error("Error fetching tracks:", error);
    next(new AppError("Failed to fetch tracks. Please try again."), 500);
  }
}

async function deleteTrack(req, res, next) {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const target = await Track.findOne({ userId: userId, _id: id });

    if (!target) {
      return next(new AppError("Track trying to delete not found", 404));
    }

    if (target.fileUrl) {
      const audioAbsolutePath = path.resolve(
        process.cwd(),
        decodeURIComponent(target.fileUrl),
      );

      try {
        await fs.stat(audioAbsolutePath);
        await fs.unlink(audioAbsolutePath);
      } catch (err) {
        console.warn(`Audio asset missing on disk at: ${audioAbsolutePath}`);
      }
    }
    if (target.thumbnailUrl) {
      const thumbAbsolutePath = path.resolve(
        process.cwd(),
        decodeURIComponent(target.thumbnailUrl),
      );

      try {
        await fs.stat(thumbAbsolutePath);
        await fs.unlink(thumbAbsolutePath);
      } catch (err) {
        console.warn(
          `Thumbnail asset missing on disk at: ${thumbAbsolutePath}`,
        );
      }
    }
    await Track.deleteOne({ _id: id });

    return res.status(200).json({
      status: "success",
      message: "Track and matching media successfully deleted.",
    });
  } catch (error) {
    console.error("Failed to delete track execution error:", error.message);
    return next(
      new AppError("Failed to delete track. Try deleting again.", 500),
    );
  }
}

async function getTracksCount(req, res, next) {
  const userId = req.userId;
  try {
    const tracksCount = await Track.find({ userId: userId });
    return res.json({ tracksCount: tracksCount.length });
  } catch (error) {
    console.error("Failed to get track counts:", error.message);
    return next(new AppError("Failed to fetch track counts", 500));
  }
}

export { addTracks, getTracks, deleteTrack, getTracksCount };
