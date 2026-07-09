import Playlist from "../models/playlist.js";
import AppError from "../lib/appError.js";
import Track from "../models/track.js";
import { supabase, uploadFile, deleteFileByUrl } from "../config/supabase.js";

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

  // First, find the playlist to get the current cover photo (if any)
  const existingPlaylist = await Playlist.findOne({
    _id: id,
    userId: userId,
  });

  if (!existingPlaylist) {
    return next(new AppError("Playlist not found", 404));
  }
  try {
    if (existingPlaylist.coverPhotoUrl) {
      await deleteFileByUrl("playlist-cover-assets", existingPlaylist.coverPhotoUrl);
    }

    const fileName = `cover-${Date.now()}-${req.file.originalname}`;
    const { data, publicUrl } = await uploadFile("playlist-cover-assets", fileName, req.file.buffer, req.file.mimetype);
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
    return next(
      new AppError("Failed to update cover photo. Try uploading later.", 500),
    );
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

    // Delete cover photo from Supabase storage if it exists
    if (targetPlaylist.coverPhotoUrl) {
      await deleteFileByUrl("playlist-cover-assets", targetPlaylist.coverPhotoUrl);
    }

    await Playlist.deleteOne({ _id: id });

    return res.status(200).json({
      status: "success",
      message: "Playlist successfully deleted.",
    });
  } catch (error) {
    console.error("Failed to delete playlist execution error:", error.message);
    return next(new AppError(error.message, 500));
  }
}

async function updatePlaylist(req, res, next) {
  const { id } = req.params;
  const userId = req.userId;
  const { title } = req.body;

  try {
    // Find the playlist by id and userId
    const playlist = await Playlist.findOne({
      _id: id,
      userId: userId,
    });

    if (!playlist) {
      return next(new AppError("Playlist not found", 404));
    }

    // Prepare update data
    const updateData = {};

    // Handle cover photo upload if req.file exists
    if (req.file) {
      // If there's an existing cover photo, delete it
      if (playlist.coverPhotoUrl) {
        await deleteFileByUrl("playlist-cover-assets", playlist.coverPhotoUrl);
      }

      // Prepare the file name and upload
      const fileName = `cover-${Date.now()}-${req.file.originalname}`;
      const { data, publicUrl } = await uploadFile(
        "playlist-cover-assets",
        fileName,
        req.file.buffer,
        req.file.mimetype
      );

      updateData.coverPhotoUrl = publicUrl;
    }

    // Handle title update if provided
    if (title !== undefined && title !== null && title.trim() !== "") {
      updateData.title = title.trim();
    }

    // If there's nothing to update, return the existing playlist
    if (Object.keys(updateData).length === 0) {
      return res.status(200).json({ message: "Playlist updated successfully" });
    }

    // Update the playlist
    const updatedPlaylist = await Playlist.findOneAndUpdate(
      { _id: id, userId: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Playlist updated successfully" });
  } catch (error) {
    console.error("Failed to update playlist: ", error.message);
    return next(new AppError("Failed to update playlist. Try again later.", 500));
  }
}

export {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
  addTrackToPlaylist,
  updateCoverPhoto,
  removeTrackFromPlaylist,
  deletePlaylist,
  updatePlaylist
};
