import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import { getUser } from "../controllers/userControllers";
import User from "../models/user";
import globalErrorHandler from "../middleware/globalErrorHandler";

let mongoServer;
let app;
let userId = null;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
  app = express();
  app.use(express.json());
  app.get(
    "/me",
    (req, res, next) => {
      req.userId = userId;
      next();
    },
    getUser,
  );
  app.use(globalErrorHandler);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("User integration test with real database", () => {
  test("Create new user and get user", async () => {
    userId = "654343924032849203abcdef";
    const seedUser = await User.create({
      _id: new mongoose.Types.ObjectId("654343924032849203abcdef"),
      email: "test@example.com",
      displayName: "Test User",
      avatar: "",
      provider: "google",
      providerId: "124",
      createdAt: new Date(),
    });

    const res = await request(app).get("/me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.parse(JSON.stringify(seedUser)));
  });
  test("Get user by null id", async () => {
    userId = null;
    const res = await request(app).get("/me");
    expect(res.status).toBe(404);
    expect(res.body).toEqual(
      JSON.parse(JSON.stringify({ message: "User not found" })),
    );
  });
});
