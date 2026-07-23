import mongoose from "mongoose";
import Playlist from "../models/playlist.js"

async function seedTestUser() {
  try {
    // 1. Connect to your database
    await mongoose.connect("mongodb://localhost:27017/AuraMusic");
    console.log("Connected to MongoDB successfully!");

    const playlists = [
      {
        title: "my playlist",
<<<<<<< HEAD
        userId: "6a11557f819a3493e4a9efef",
      },
      {
        title: "my playlist",
        userId: "6a11557f819a3493e4a9efef",
      },
      {
        title: "my playlist",
        userId: "6a11557f819a3493e4a9efef",
      },
      {
        title: "my playlist",
        userId: "6a11557f819a3493e4a9efef",
      },
      {
        title: "my playlist",
        userId: "6a11557f819a3493e4a9efef",
      },
      {
        title: "my playlist",
        userId: "6a11557f819a3493e4a9efef",
      },
      {
        title: "my playlist",
        userId: "6a11557f819a3493e4a9efef",
=======
        userId: "6a5ce1600bf2771b92b7fb9f",
      },
      {
        title: "my playlist",
        userId: "6a5ce1600bf2771b92b7fb9f",
      },
      {
        title: "my playlist",
        userId: "6a5ce1600bf2771b92b7fb9f",
      },
      {
        title: "my playlist",
        userId: "6a5ce1600bf2771b92b7fb9f",
      },
      {
        title: "my playlist",
        userId: "6a5ce1600bf2771b92b7fb9f",
      },
      {
        title: "my playlist",
        userId: "6a5ce1600bf2771b92b7fb9f",
      },
      {
        title: "my playlist",
        userId: "6a5ce1600bf2771b92b7fb9f",
>>>>>>> 7cc2c78cbcc77d697d3106564affe010491712cf
      }
    ]

    for (const playlist in playlists) {
      const newPlaylist = new Playlist({
        title: playlists[playlist].title,
        userId: playlists[playlist].userId,
      });
      await newPlaylist.save();
    }
  } catch (error) {
    console.error("Error inserting test user:", error);
  } finally {
    // Clean up connection
    await mongoose.disconnect();
  }
}

seedTestUser();
