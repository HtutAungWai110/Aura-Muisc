import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artist: { type: String, default: "Unknown" },
    fileUrl: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    thumbnailUrl: { type: String, default: null },
    duration: { type: Number, default: null },
    addedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
);

trackSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  await mongoose
    .model("Playlist")
    .updateMany(
      { "tracks.track": doc._id },
      { $pull: { tracks: { track: doc._id } }, $inc: { trackCount: -1 } },
    );
});

const Track = mongoose.model("Track", trackSchema);

export default Track;
