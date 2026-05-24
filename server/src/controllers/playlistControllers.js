import Playlist from "../models/playlist.js";

async function createPlaylist(req, res) {
  const { playlistTitle } = req.body;

  const playlistExist = await Playlist.findOne({
    title: playlistTitle,
    userId: req.userId,
  });

  if (playlistExist) {
    return res.status(400).json({
      message: "Playlist already exists with this title!",
    });
  }

  const newPlaylist = new Playlist({
    title: playlistTitle,
    userId: req.userId,
  });

  newPlaylist.save();

  return res
    .status(200)
    .json({ message: "Playlist created", id: req.userId, newPlaylist });
}

export { createPlaylist };
