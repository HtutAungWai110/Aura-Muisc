import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import connnectDB from "./lib/db.js";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/authRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import MongoStore from "connect-mongo";
config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Your MongoDB connection string
      collectionName: "sessions", // Name of the collection in your DB
    }),
    secret: "cat",
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 * 7, // Cookie expires in 7 days
      httpOnly: true, // XSS protection: JS cannot read this cookie
      secure: process.env.NODE_ENV === "production", // Requires HTTPS in production
      sameSite: "lax", // CSRF mitigation
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  return res.json("Hello");
});

app.use("/auth", authRoutes);
app.use("/playlist", playlistRoutes);

connnectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
