import mongoose from "mongoose";

const Playlist = mongoose.model(
  "Playlist",
  new mongoose.Schema({
    title: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Track" }],
    createdAt: { type: Date, default: Date.now() },
  }),
);

export default Playlist;
