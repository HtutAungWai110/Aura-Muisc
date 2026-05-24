import mongoose from "mongoose";

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatar: { type: String },

    // OAuth Specific fields
    provider: { type: String, required: true }, // e.g., 'google', 'github'
    providerId: { type: String, required: true, unique: true }, // The immutable ID from Google/GitHub
    createdAt: { type: Date, default: Date.now },
  }),
);

export default User;
