import Track from "../models/track.js";
import AppError from "../lib/appError.js";
import { supabase } from "../config/supabase.js";
import { deleteStorageFile } from "../lib/storage.js";

const BUCKET = "music-assets";

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

async function getBatchUploadUrls(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: "Files array is required" });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const audioPath = `user-${userId}/${Date.now()}-${file.audioFilename}`;

        const { data: audioData, error: audioError } = await supabase.storage
          .from(BUCKET)
          .createSignedUploadUrl(audioPath, { upsert: true });

        if (audioError) throw audioError;

        const entry = {
          audio: {
            uploadUrl: audioData.signedUrl,
            storagePath: audioPath,
          },
          image: null,
        };

        if (file.imageFilename) {
          const imagePath = `user-${userId}/${Date.now()}-${file.imageFilename}`;

          const { data: imageData, error: imageError } = await supabase.storage
            .from("thumbnail-assets")
            .createSignedUploadUrl(imagePath, { upsert: true });

          if (imageError) throw imageError;

          entry.image = {
            uploadUrl: imageData.signedUrl,
            storagePath: imagePath,
          };
        }

        return entry;
      }),
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error("Error generating batch upload URLs:", error);
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

async function saveBatchMetadata(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { tracks } = req.body;

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({ message: "Tracks array is required" });
    }

    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");

    const trackDocs = tracks.map((t) => {
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/music-assets/${t.audioStoragePath}`;
      let thumbnailUrl = null;
      if (t.imageStoragePath) {
        thumbnailUrl = `${supabaseUrl}/storage/v1/object/public/thumbnail-assets/${t.imageStoragePath}`;
      }

      return {
        title: t.title || "Unknown Title",
        artist: t.artist || "Unknown Artist",
        fileUrl,
        thumbnailUrl,
        userId,
        duration: t.duration || 0,
      };
    });

    const savedTracks = await Track.insertMany(trackDocs);
    return res.status(201).json(savedTracks);
  } catch (error) {
    console.error("Error saving batch metadata:", error);
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
    const { page } = req.query;
    const limit = 5;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const tracks = await Track.find({ userId: userId }).sort({ addedAt: -1 }).skip((page - 1) * limit).limit(limit);
    const totalPages = Math.ceil(await Track.countDocuments({ userId: userId }) / limit);
    return res.json({ tracks, totalPages, currentPage: Number(page) });
  } catch (error) {
    console.error("Error fetching tracks:", error);
    next(new AppError("Failed to fetch tracks. Please try again."), 500);
  }
}

async function deleteTracks(req, res, next) {
  const { trackIds } = req.body;
  const userId = req.userId;

  if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
    return next(new AppError("trackIds array is required", 400));
  }

  try {
    const targets = await Track.find({ userId: userId, _id: { $in: trackIds } });

    if (targets.length === 0) {
      return next(new AppError("No matching tracks found", 404));
    }

    await Promise.all(
      targets.map(async (target) => {
        if (target.fileUrl) await deleteStorageFile(target.fileUrl);
        if (target.thumbnailUrl) await deleteStorageFile(target.thumbnailUrl);
      }),
    );

    await Track.deleteMany({ _id: { $in: trackIds }, userId: userId });

    return res.status(200).json({
      status: "success",
      message: `${targets.length} track(s) and matching media successfully deleted.`,
    });
  } catch (error) {
    console.error("Failed to delete tracks execution error:", error.message);
    return next(new AppError(error.message, 500));
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
  getBatchUploadUrls,
  saveMetadata,
  saveBatchMetadata,
  getTracks,
  deleteTrack,
  deleteTracks,
  getTracksCount,
};
