import Playlist from "../models/playlist.js";
import AppError from "../lib/appError.js";
import Track from "../models/track.js";
import path from "path";

async function createPlaylist(req, res, next) {
  try {
    const { playlistTitle } = req.body;
    let title = playlistTitle;

    // Validate input
    if (!playlistTitle || playlistTitle.trim() === "") {
      return res.status(400).json({
        message: "Playlist title is required",
      });
    }

    const playlistExists = await Playlist.find({
      title: playlistTitle.trim(),
      userId: req.userId,
    });

    if (playlistExists.length > 0) {
      title = (title.trim() + playlistExists.length).toString();
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

    return res.json(playlist);
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
  await Playlist.updateOne(
    {
      _id: id,
      userId: userId,
    },
    {
      $set: {
        coverPhotoUrl: req.file.path.replace(/\\/g, "/"),
      },
    },
  );
  res.json({ message: "Cover photo set successfully" });
}

export {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  updateCoverPhoto,
};
