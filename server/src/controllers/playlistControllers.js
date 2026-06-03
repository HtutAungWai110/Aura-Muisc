import Playlist from "../models/playlist.js";
import AppError from "../lib/appError.js";

async function createPlaylist(req, res, next) {
  try {
    const { playlistTitle } = req.body;

    // Validate input
    if (!playlistTitle || playlistTitle.trim() === "") {
      return res.status(400).json({
        message: "Playlist title is required",
      });
    }

    const playlistExists = await Playlist.findOne({
      title: playlistTitle.trim(),
      userId: req.userId,
    });

    if (playlistExists) {
      return res.status(400).json({
        message: "Playlist already exists with this title!",
      });
    }

    const newPlaylist = new Playlist({
      title: playlistTitle.trim(),
      userId: req.userId,
    });

    await newPlaylist.save();

    return res
      .status(201)
      .json({ message: "Playlist created", playlist: newPlaylist });
  } catch (error) {
    console.error("Error creating playlist:", error);
    next(new AppError("Failed to create playlist. Try again later.", 500));
  }
}

export { createPlaylist };
