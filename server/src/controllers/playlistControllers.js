import Playlist from "../models/playlist.js";
import AppError from "../lib/appError.js";
import Track from "../models/track.js";
import { supabase } from "../config/supabase.js";
import { deleteStorageFile } from "../lib/storage.js";

const BUCKET = "music-assets";

function transformTracks(entries) {
  if (!entries || !Array.isArray(entries)) return [];
  return entries
    .filter((e) => e.track)
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
    .map((e) => ({ ...e.track.toObject(), addedAt: e.addedAt }));
}

async function createPlaylist(req, res, next) {
  try {
    const { playlistTitle } = req.body;
    let title = playlistTitle;

    const playlistExists = await Playlist.findOne({
      title: playlistTitle.trim(),
      userId: req.userId,
    });

    if (playlistExists) {
      playlistExists.existCount = playlistExists.existCount + 1;
      title = (title + playlistExists.existCount).toString();
      playlistExists.save();
    }

    const newPlaylist = new Playlist({
      title: title,
      userId: req.userId,
    });

    await newPlaylist.save();

    return res.status(201).json(newPlaylist);
  } catch (error) {
    console.error("Error creating playlist:", error);
    next(new AppError("Failed to create playlist. Try again later.", 500));
  }
}

async function getAllPlaylists(req, res, next) {
  const userId = req.userId;
  const pageSize = 10;
  const pageNumber = Math.max(1, parseInt(req.query.pageNumber) || 1);

  try {
    const totalPlaylists = await Playlist.countDocuments({ userId });
    const totalPage = Math.ceil(totalPlaylists / pageSize);

    const playlists = await Playlist.find({ userId })
      .populate("tracks.track")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);



    const result = playlists.map((p) => ({
      ...p.toObject(),
      tracksCount: p.tracks.length,
      tracks: transformTracks(p.tracks),
    }));

    return res.status(200).json({ totalPage, playlists: result });
  } catch (error) {
    console.error(
      `Failed to fetch playlists, userId: ${userId}, error: ${error.message}`,
    );
    next(new AppError("Failed to fetch playlists.", 500));
  }
}

async function getPlaylist(req, res, next) {
  const userId = req.userId;
  const { id } = req.params;

  try {
    if (!id) {
      next(new AppError("Playlist ID is missing.", 400));
    }
    const playlist = await Playlist.findOne({
      _id: id,
      userId: userId,
    }).populate("tracks.track");

    if (!playlist) {
      next(new AppError("Playlist not found.", 404));
    }

    const result = {
      ...playlist.toObject(),
      tracks: transformTracks(playlist.tracks),
      tracksCount: playlist.tracks.length,
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to fetch playlist, error: ", error.message);
    next(new AppError("Failed to fetch playlist. Try again later.", 500));
  }
}

async function addTrackToPlaylist(req, res, next) {
  const userId = req.userId;
  const { id, trackId } = req.params;
  {
    try {
      const trackExist = await Track.findOne({
        _id: trackId,
        userId: userId,
      });

      if (!trackExist) {
        next(new AppError("Track trying to add not found.", 404));
      }
      const playlist = await Playlist.findOne({
        _id: id,
        userId: userId,
      });

      if (!playlist) {
        return next(
          new AppError(
            "Playlist not found or you do not have permission to edit it",
            404,
          ),
        );
      }

      const alreadyExists = playlist.tracks.some(
        (entry) => entry.track === trackId,
      );

      if (alreadyExists) {
        return res.json({
          ...playlist.toObject(),
          tracks: transformTracks(playlist.tracks),
        });
      }

      playlist.tracks.push({ track: trackId, addedAt: new Date() });
      await playlist.save();

      const populated = await playlist.populate("tracks.track");

      return res.json({
        ...populated.toObject(),
        tracks: transformTracks(populated.tracks),
      });
    } catch (error) {
      console.error("Failed to add track to playlist: ", error.message);
      next(
        new AppError(
          "Something went wrong while adding track to playlist",
          500,
        ),
      );
    }
  }
}

async function getCoverUploadUrl(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { filename, fileType } = req.body;
    if (!filename || !fileType) {
      return res
        .status(400)
        .json({ message: "File information is required" });
    }

    const storagePath = `user-${userId}/${Date.now()}-${filename}`;

    const { data, error } = await supabase.storage
      .from("playlist-cover-assets")
      .createSignedUploadUrl(storagePath, { upsert: true });

    if (error) {
      console.error("Error creating cover signed URL:", error);
      throw error;
    }

    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/playlist-cover-assets/${storagePath}`;

    return res.status(200).json({
      uploadUrl: data.signedUrl,
      storagePath,
      publicUrl,
    });
  } catch (error) {
    console.error("Error generating cover upload URL:", error);
    next(
      new AppError(
        "Failed to generate upload URL. Please try again.",
        500,
      ),
    );
  }
}

async function updateCoverPhoto(req, res, next) {
  const { id } = req.params;
  const userId = req.userId;
  const { coverPhotoUrl } = req.body;

  try {
    const existingPlaylist = await Playlist.findOne({
      _id: id,
      userId: userId,
    });

    if (!existingPlaylist) {
      return next(new AppError("Playlist not found", 404));
    }

    if (existingPlaylist.coverPhotoUrl) {
      await deleteStorageFile(existingPlaylist.coverPhotoUrl);
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: id, userId: userId },
      { $set: { coverPhotoUrl } },
      { new: true, runValidators: true },
    );

    res.json({ message: "Cover photo set successfully", updatedPlaylist });
  } catch (error) {
    console.error("Failed to update cover photo", error.message);
    return next(
      new AppError(
        "Failed to update cover photo. Try uploading later.",
        500,
      ),
    );
  }
}

async function updatePlaylist(req, res, next) {
  const { id } = req.params;
  const userId = req.userId;
  const { title, coverPhotoUrl } = req.body;

  try {
    const playlist = await Playlist.findOne({ _id: id, userId: userId });

    if (!playlist) {
      return next(new AppError("Playlist not found", 404));
    }

    const updateData = {};

    if (coverPhotoUrl) {
      if (playlist.coverPhotoUrl) {
        await deleteStorageFile(playlist.coverPhotoUrl);
      }
      updateData.coverPhotoUrl = coverPhotoUrl;
    }

    if (title !== undefined && title !== null && title.trim() !== "") {
      updateData.title = title.trim();
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: id, userId: userId },
      { $set: updateData },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      message: "Playlist updated successfully",
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error("Failed to update playlist: ", error.message);
    return next(
      new AppError("Failed to update playlist. Try again later.", 500),
    );
  }
}

async function removeTracksFromPlaylist(req, res, next) {
  const { id } = req.params;
  const { trackIds } = req.body;
  const userId = req.userId;

  if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
    return next(new AppError("trackIds array is required", 400));
  }

  try {
    const targetPlaylist = await Playlist.findOne({
      _id: id,
      userId: userId,
    })

    if (!targetPlaylist) {
      return next(new AppError("Playlist not found", 404));
    }

    targetPlaylist.tracks = targetPlaylist.tracks.filter(
      (entry) => !trackIds.includes(entry.track.toString()),
    );

    await targetPlaylist.save();

    res.json({
      message: `${trackIds.length} track(s) removed successfully`,
    });
  } catch (error) {
    console.error("Failed to remove tracks from playlist: ", error.message);
    next(new AppError("Failed to remove tracks from playlist", 500));
  }
}

async function removeTrackFromPlaylist(req, res, next) {
  const { id, trackId } = req.params;
  const userId = req.userId;
  try {
    const targetPlaylist = await Playlist.findOne({
      _id: id,
      userId: userId,
    })
    if (!targetPlaylist) {
      return next(new AppError("Playlist not found", 404));
    }

    targetPlaylist.tracks = targetPlaylist.tracks.filter(
      (entry) => entry.track.toString() !== trackId,
    );
    await targetPlaylist.save();

    res.json({ message: "Track removed successfully" });
  } catch (error) {
    console.error("Failed to remove track from playlist: ", error.message);
    next(new AppError("Failed to remove track from playlist", 500));
  }
}

async function deletePlaylist(req, res, next) {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const targetPlaylist = await Playlist.findOne({
      _id: id,
      userId: userId,
    });

    if (!targetPlaylist) {
      return next(new AppError("Playlist trying to delete not found", 404));
    }

    if (targetPlaylist.coverPhotoUrl) {
      await deleteStorageFile(targetPlaylist.coverPhotoUrl);
    }

    await Playlist.deleteOne({ _id: id });

    return res.status(200).json({
      status: "success",
      message: "Playlist successfully deleted.",
    });
  } catch (error) {
    console.error(
      "Failed to delete playlist execution error:",
      error.message,
    );
    return next(new AppError(error.message, 500));
  }
}

async function searchPlaylists(req, res, next) {
  const userId = req.userId;
  const { q } = req.query;

  if (!q || !q.trim()) {
    return res.status(200).json([]);
  }

  try {
    const playlists = await Playlist.find({
      userId,
      title: { $regex: q.trim(), $options: "i" },
    })
      .populate("tracks.track")
      .sort({ createdAt: -1 })
      .limit(20);

    const result = playlists.map((p) => ({
      ...p.toObject(),
      tracks: transformTracks(p.tracks),
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      `Failed to search playlists, userId: ${userId}, error: ${error.message}`,
    );
    next(new AppError("Failed to search playlists.", 500));
  }
}

export {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  getCoverUploadUrl,
  updateCoverPhoto,
  removeTrackFromPlaylist,
  removeTracksFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  searchPlaylists,
};
