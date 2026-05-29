import mongoose from "mongoose";

const Track = mongoose.model(
  "Track",
  new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, default: "unkown" },
    fileUrl: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    thumbnailUrl: { type: String, default: null },
    addedAt: { type: Date, default: Date.now },
    duration: { type: Number, default: null },
  }),
);

export default Track;
