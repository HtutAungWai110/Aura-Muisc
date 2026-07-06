import Track from "../models/track.js";
import jsmediatags from "jsmediatags";
import path from "path";
import fs from "fs/promises";
import * as mm from "music-metadata";
import AppError from "../lib/appError.js";
import { supabase } from "../config/supabase.js";

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
    // 1. Validate files exist in memory storage
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ message: "No tracks uploaded" });
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const trackPromises = req.files.map(async (file, index) => {
      try {
        // 🛡️ REPLACED: Check for file.buffer instead of file.path
        if (!file.buffer) {
          throw new Error(
            `File binary buffer missing for file at index ${index}`,
          );
        }

        let duration = 0;
        let metadata = { title: null, artist: null, pictureData: null };

        try {
          const parsedMeta = await mm.parseBuffer(file.buffer, file.mimetype);
          duration = parsedMeta.format.duration || 0;
          metadata.title = parsedMeta.common.title;
          metadata.artist = parsedMeta.common.artist;
          if (
            parsedMeta.common.picture &&
            parsedMeta.common.picture.length > 0
          ) {
            metadata.pictureData = {
              data: parsedMeta.common.picture[0].data,
              type: parsedMeta.common.picture[0].format,
            };
          }
        } catch (parseError) {
          console.warn(
            `Warning: Could not parse audio buffer at index ${index}:`,
            parseError,
          );
        }
        let thumbnailUrl = null;
        if (metadata.pictureData && metadata.pictureData.data) {
          try {
            const { data: thumbNailData, type } = metadata.pictureData;
            const imageBuffer = Buffer.from(thumbNailData);
            const extension = type.split("/")[1] || "jpg";
            const thumbnailFilename = `thumb-${Date.now()}-${index}.${extension}`;

            const { data: thumbData, error: thumbError } =
              await supabase.storage
                .from("thumbnail-assets")
                .upload(thumbnailFilename, imageBuffer, {
                  contentType: type,
                  upsert: true,
                });

            if (thumbError) throw thumbError;

            if (thumbData) {
              const {
                data: { publicUrl },
              } = supabase.storage
                .from("thumbnail-assets")
                .getPublicUrl(thumbnailFilename);
              thumbnailUrl = publicUrl;
            }
          } catch (thumbnailError) {
            console.warn(
              `Warning: Failed to save thumbnail from buffer:`,
              thumbnailError,
            );
          }
        }

        const audioFileName = `audio-${Date.now()}-${file.originalname}`;

        const { data: audioData, error: audioError } = await supabase.storage
          .from("music-assets")
          .upload(audioFileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (audioError) throw audioError;

        const {
          data: { publicUrl: audioFilePublicUrl },
        } = supabase.storage.from("music-assets").getPublicUrl(audioFileName);

        const newTrack = new Track({
          title:
            metadata.title ??
            file.originalname.replace(/\.[^/.]+$/, "") ??
            "Unknown Title",
          artist: metadata.artist ?? "Unknown Artist",
          fileUrl: audioFilePublicUrl,
          thumbnailUrl: thumbnailUrl,
          userId: userId,
          duration: duration,
        });

        return await newTrack.save();
      } catch (fileError) {
        console.error("Error processing file at index", index, ":", fileError);
        throw fileError;
      }
    });
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
    return next(new AppError(error.message, 500));
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
