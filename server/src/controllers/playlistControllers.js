import Playlist from "../models/playlist.js";
import AppError from "../lib/appError.js";
import Track from "../models/track.js";
import { supabase } from "../config/supabase.js";

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
  try {
    const playlists = await Playlist.find({ userId: userId })
      .populate("tracks")
      .sort({ createdAt: -1 });
    return res.status(200).json(playlists);
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
    }).populate("tracks");

    if (!playlist) {
      next(new AppError("Playlist not found.", 404));
    }

    return res.status(200).json(playlist);
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
      const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
          _id: id,
          userId: userId,
        },
        {
          $addToSet: { tracks: trackId },
        },
        {
          new: true,
          runValidators: true,
        },
      ).populate("tracks");
      if (!updatedPlaylist) {
        return next(
          new AppError(
            "Playlist not found or you do not have permission to edit it",
            404,
          ),
        );
      }

      return res.json(updatedPlaylist);
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

async function updateCoverPhoto(req, res, next) {
  const { id } = req.params;
  const userId = req.userId;
  const fileName = `cover-${Date.now()}-${req.file.originalname}`;
  const { data, error } = await supabase.storage
    .from("playlist-cover-assets")
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error("Failed to upload cover photo", error.message);
    return next(
      new AppError("Failed to upload cover photo. Try again later."),
      500,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("playlist-cover-assets").getPublicUrl(fileName);
  try {
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      {
        _id: id,
        userId: userId,
      },
      {
        $set: {
          coverPhotoUrl: publicUrl,
        },
      },
      { new: true, runValidators: true },
    );
    res.json({ message: "Cover photo set successfully", updatedPlaylist });
  } catch (error) {
    console.error("Failed to update cover photo", error.message);
    next(new AppError("Failed to update cover photo. Try again later."), 500);
  }
}

async function removeTrackFromPlaylist(req, res, next) {
  const { id, trackId } = req.params;
  const userId = req.userId;
  try {
    const targetPlaylist = await Playlist.findOne({
      _id: id,
      userId: userId,
    }).populate("tracks");
    if (!targetPlaylist) {
      return next(new AppError("Playlist not found", 404));
    }
    const keyPairs = targetPlaylist.tracks.map((track) => [
      track._id.toString(),
      track,
    ]);
    const tracksMap = new Map(keyPairs);
    tracksMap.delete(trackId);
    const updatedTracks = Array.from(tracksMap.keys());
    const updatedPlaylist = await Playlist.updateOne(
      { _id: id },
      {
        $set: { tracks: updatedTracks },
      },
    );
    res.json({ message: "Track removed successfully", updatedPlaylist });
  } catch (error) {
    console.error("Failed to remove track from playlist: ", error.message);
    next(new AppError("Failed to remove track from playlist", 500));
  }
}

export {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  updateCoverPhoto,
  removeTrackFromPlaylist,
};
