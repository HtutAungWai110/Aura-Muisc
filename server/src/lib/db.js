import mongoose from "mongoose";
import { config } from "dotenv";
config();

const connnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit process with failure if the DB connection fails
    process.exit(1);
  }
};

export default connnectDB;
