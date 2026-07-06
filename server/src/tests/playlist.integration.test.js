import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import globalErrorHandler from "../middleware/globalErrorHandler";
import User from "../models/user";
import Playlist from "../models/playlist";
import validationMiddleware from "../middleware/ValidationMiddleware";
import { playlistTitleSchema } from "../validators/playlistValidator";
import {
  createPlaylist,
  getAllPlaylists,
  getPlaylist,
} from "../controllers/playlistControllers";

import paramValidationMiddleware from "../middleware/paramValidationMiddleware";
import { playlistIdSchema } from "../validators/paramValidators";

let mongoServer;
let app;
let userId = null;

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  app = express();
  app.use(express.json());

  const seedUser = await User.create({
    _id: new mongoose.Types.ObjectId("6a11557f819a3493e4a9efef"),
    email: "test@gmail.com",
    displayName: "TestUser",
    avatar: "",
    provider: "google",
    providerId: "123",
    createdAt: new Date(),
  });

  userId = seedUser._id;

  app.post(
    "/playlist/create",
    async (req, res, next) => {
      req.userId = userId;
      next();
    },
    validationMiddleware(playlistTitleSchema),
    createPlaylist,
  );

  app.get(
    "/playlist/all",
    (req, res, next) => {
      req.userId = userId;
      next();
    },
    getAllPlaylists,
  );

  app.get(
    "/playlist/:id",
    (req, res, next) => {
      req.userId = userId;
      next();
    },
    paramValidationMiddleware(playlistIdSchema),
    getPlaylist,
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

describe("Test playlisst controllers", () => {
  test("Create new playlist ", async () => {
    const res = await request(app)
      .post("/playlist/create")
      .send({ playlistTitle: "Nirvana" });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Nirvana");
    expect(res.body.userId).toBe("6a11557f819a3493e4a9efef");
  });

  test("Create playlist with empty title", async () => {
    const res = await request(app)
      .post("/playlist/create")
      .send({ playlistTitle: "" });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation error");
  });

  test("Get playlist by id", async () => {
    const seedPlaylist = await Playlist.create({
      title: "Nirvana",
      userId: userId,
    });
    const res = await request(app).get(`/playlist/${seedPlaylist._id}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.parse(JSON.stringify(seedPlaylist)));
  });

  test("Get playlist by ivalid ID", async () => {
    const seedPlaylist = await Playlist.create({
      title: "Nirvana",
      userId: userId,
    });
    let isIdenticalId = true;
    let invalidId = new mongoose.Types.ObjectId();
    while (isIdenticalId) {
      if (invalidId.toString() === seedPlaylist._id.toString()) {
        invalidId = new mongoose.Types.ObjectId();
      } else {
        isIdenticalId = false;
      }
    }
    const res = await request(app).get(`/playlist/${invalidId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Playlist not found.");
  });

  test("Get all playlists", async () => {
    await Playlist.insertMany([
      { title: "Nirvana", userId: userId },
      { title: "FooFighter", userId: userId },
      { title: "Radiohead", userId: userId },
    ]);

    const seedPlaylists = await Playlist.find({ userId: userId });

    const res = await request(app).get("/playlist/all");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(JSON.parse(JSON.stringify(seedPlaylists)));
  });

  test("Get empty playlist", async () => {
    await Playlist.deleteMany({ userId: userId });
    const res = await request(app).get("/playlist/all");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
