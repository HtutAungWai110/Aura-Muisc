import express from "express";
import { config } from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import { generateToken } from "../lib/generateToken.js";

const router = express.Router();
config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.HOST_URL}/auth/google/callback`,
    },

    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await User.findOne({
          providerId: profile.id,
          provider: "google",
        });

        if (user) {
          // User exists, pass them to the next middleware step
          return done(null, user);
        }

        user = new User({
          displayName: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0]?.value,
          provider: "google",
          providerId: profile.id,
        });

        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);

router.get("/me", (req, res) => {
  // If the browser sent a valid session cookie, passport deserialized it and populated req.user
  if (req.isAuthenticated()) {
    res.json({ message: "Authenticated", user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated", user: null });
  }
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login?error=failed'",
  }),
  function (req, res) {
    // Successful authentication, redirect home.
    const { accessToken, refreshToken } = generateToken(req.user);
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 1, // 1hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.redirect(`${process.env.REACT_URL}/`);
  },
);

passport.serializeUser((user, done) => {
  // Use user._id or user.id depending on your Mongoose setup
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default router;
