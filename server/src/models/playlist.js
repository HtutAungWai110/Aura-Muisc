import mongoose from "mongoose";

const playlistItemSchema = new mongoose.Schema(
  {
    track: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Track",
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const playlistSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trackCount: { type: Number, default: 0 },
    tracks: [playlistItemSchema],
    coverPhotoUrl: { type: String, default: null },
  },
  { timestamps: true },
);

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
