import mongoose from "mongoose";
import User from "../models/user.js";

async function seedTestUser() {
  try {
    // 1. Connect to your database
    await mongoose.connect("mongodb://localhost:27017/AuraMusic");
    console.log("Connected to MongoDB successfully!");

    // 2. Instantiate a test user using your OAuth model structure
    const testUser = new User({
      displayName: "Alex MusicLover",
      email: "alex@example.com",
      avatar: "https://via.placeholder.com/150",
      provider: "google",
      providerId: "google-oauth-unique-id-12345",
    });

    // 3. Save it! This step triggers the actual creation in Mongo Compass
    const savedUser = await testUser.save();
    console.log("Success! Test user inserted with ID:", savedUser._id);
  } catch (error) {
    console.error("Error inserting test user:", error);
  } finally {
    // Clean up connection
    await mongoose.disconnect();
  }
}

seedTestUser();
