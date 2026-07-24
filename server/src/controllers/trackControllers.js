import Track from "../models/track.js";
import Playlist from "../models/playlist.js";
import AppError from "../lib/appError.js";
import { supabase } from "../config/supabase.js";
import { deleteStorageFile } from "../lib/storage.js";

const BUCKET = "music-assets";

async function createSignedUrlForFile(userId, bucket, filename) {
  const path = `user-${userId}/${Date.now()}-${filename}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true });
  if (error) throw error;
  return { uploadUrl: data.signedUrl, storagePath: path };
}

async function getUploadUrls(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { files } = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res
        .status(400)
        .json({ message: "files array is required" });
    }

    const urls = await Promise.all(
      files.map(async ({ audioFilename, imageFilename }) => {
        if (!audioFilename) {
          throw new Error("Audio filename is required for each file");
        }

        const audio = await createSignedUrlForFile(userId, BUCKET, audioFilename);

        let image = null;
        if (imageFilename) {
          image = await createSignedUrlForFile(userId, "thumbnail-assets", imageFilename);
        }

        return { audio, image };
      }),
    );

    return res.status(200).json({ urls });
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

    const { tracks } = req.body;

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return res
        .status(400)
        .json({ message: "tracks array is required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");

    const docs = tracks.map(({ title, artist, audioStoragePath, imageStoragePath, duration }) => {
      if (!audioStoragePath) {
        throw new Error("Audio storage path is required for each track");
      }

      const fileUrl = `${supabaseUrl}/storage/v1/object/public/music-assets/${audioStoragePath}`;
      const thumbnailUrl = imageStoragePath
        ? `${supabaseUrl}/storage/v1/object/public/thumbnail-assets/${imageStoragePath}`
        : null;

      return {
        title: title || "Unknown Title",
        artist: artist || "Unknown Artist",
        fileUrl,
        thumbnailUrl,
        userId,
        duration: duration || 0,
      };
    });

    const savedTracks = await Track.insertMany(docs);
    return res.status(201).json({ tracks: savedTracks });
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

    const tracks = await Track.find({ userId: userId }).sort({ createdAt: -1 });
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
      await deleteStorageFile(target.fileUrl);
    }

    if (target.thumbnailUrl) {
      await deleteStorageFile(target.thumbnailUrl);
    }

    await Track.findOneAndDelete({ _id: id, userId });

    return res.status(200).json({
      status: "success",
      message: "Track and matching media successfully deleted.",
    });
  } catch (error) {
    console.error("Failed to delete track execution error:", error.message);
    return next(new AppError(error.message, 500));
  }
}

async function deleteTracks(req, res, next) {
  const userId = req.userId;
  const { ids } = req.body;

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return next(new AppError("ids array is required", 400));
    }

    const tracks = await Track.find({ userId, _id: { $in: ids } });

    if (tracks.length === 0) {
      return next(new AppError("No matching tracks found", 404));
    }

    const deletePromises = tracks.flatMap((track) => {
      const ops = [];
      if (track.fileUrl) ops.push(deleteStorageFile(track.fileUrl));
      if (track.thumbnailUrl) ops.push(deleteStorageFile(track.thumbnailUrl));
      return ops;
    });
    await Promise.allSettled(deletePromises);

    await Track.deleteMany({ userId, _id: { $in: ids } });

    await Playlist.updateMany(
      { "tracks.track": { $in: ids } },
      {
        $pull: { tracks: { track: { $in: ids } } },
        $inc: { trackCount: -ids.length },
      },
    );

    return res.status(200).json({
      status: "success",
      message: `${tracks.length} track(s) deleted successfully.`,
      deletedCount: tracks.length,
    });
  } catch (error) {
    console.error("Failed to batch delete tracks:", error.message);
    return next(new AppError("Failed to delete tracks", 500));
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
  deleteTracks,
  getTracksCount,
};
