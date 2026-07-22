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
    existCount: { type: Number, default: 0 },
    tracks: [
      {
        track: { type: mongoose.Schema.Types.ObjectId, ref: "Track" },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    createdAt: { type: Date, default: Date.now() },
    coverPhotoUrl: { type: String, default: null },
  }),
);

export default Playlist;
