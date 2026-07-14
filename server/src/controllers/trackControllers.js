import Track from "../models/track.js";
import AppError from "../lib/appError.js";
import { supabase } from "../config/supabase.js";

const BUCKET = "music-assets";

function extractStorageFromUrl(publicUrl) {
  const marker = "/object/public/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const rest = publicUrl.slice(idx + marker.length);
  const slashIdx = rest.indexOf("/");
  if (slashIdx === -1) return null;
  const bucket = rest.slice(0, slashIdx);
  const path = decodeURIComponent(rest.slice(slashIdx + 1));
  return { bucket, path };
}

async function getUploadUrls(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { audioFilename, imageFilename } = req.body;

    if (!audioFilename) {
      return res
        .status(400)
        .json({ message: "Audio filename is required" });
    }

    const audioPath = `user-${userId}/${Date.now()}-${audioFilename}`;

    const { data: audioData, error: audioError } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(audioPath, { upsert: true });

    if (audioError) {
      console.error("Error creating audio signed URL:", audioError);
      throw audioError;
    }

    const response = {
      audio: {
        uploadUrl: audioData.signedUrl,
        storagePath: audioPath,
      },
      image: null,
    };

    if (imageFilename) {
      const imagePath = `user-${userId}/${Date.now()}-${imageFilename}`;

      const { data: imageData, error: imageError } = await supabase.storage
        .from("thumbnail-assets")
        .createSignedUploadUrl(imagePath, { upsert: true });

      if (imageError) {
        console.error("Error creating image signed URL:", imageError);
        throw imageError;
      }

      response.image = {
        uploadUrl: imageData.signedUrl,
        storagePath: imagePath,
      };
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error generating upload URLs:", error);
    next(
      new AppError("Failed to generate upload URLs. Please try again.", 500),
    );
  }
}

async function saveMetadata(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, artist, audioStoragePath, imageStoragePath, duration } =
      req.body;

    if (!audioStoragePath) {
      return res
        .status(400)
        .json({ message: "Audio storage path is required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/music-assets/${audioStoragePath}`;

    let thumbnailUrl = null;
    if (imageStoragePath) {
      thumbnailUrl = `${supabaseUrl}/storage/v1/object/public/thumbnail-assets/${imageStoragePath}`;
    }

    const newTrack = new Track({
      title: title || "Unknown Title",
      artist: artist || "Unknown Artist",
      fileUrl,
      thumbnailUrl,
      userId,
      duration: duration || 0,
    });

    const savedTrack = await newTrack.save();
    return res.status(201).json(savedTrack);
  } catch (error) {
    console.error("Error saving metadata:", error);
    next(
      new AppError(
        "Failed to save track metadata. Please try again.",
        500,
      ),
    );
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
      try {
        const storage = extractStorageFromUrl(target.fileUrl);
        if (storage) {
          await supabase.storage.from(storage.bucket).remove([storage.path]);
        }
      } catch (err) {
        console.warn("Failed to delete audio from storage:", err.message);
      }
    }

    if (target.thumbnailUrl) {
      try {
        const storage = extractStorageFromUrl(target.thumbnailUrl);
        if (storage) {
          await supabase.storage.from(storage.bucket).remove([storage.path]);
        }
      } catch (err) {
        console.warn("Failed to delete thumbnail from storage:", err.message);
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

export {
  getUploadUrls,
  saveMetadata,
  getTracks,
  deleteTrack,
  getTracksCount,
};
