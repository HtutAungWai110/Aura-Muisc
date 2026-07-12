import express from "express";
import { config } from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import { generateToken } from "../lib/generateToken.js";
import jwt from "jsonwebtoken";

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

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth/login?error=failed",
  }),
  function (req, res) {
    const { accessToken, refreshToken } = generateToken(req.user);

    // Redirect with tokens in URL hash so the client can extract and store them
    const clientUrl = process.env.REACT_URL;
    res.redirect(
      `${clientUrl}/auth/callback#accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`,
    );
  },
);

// POST /auth/refresh — exchange refresh token for new access token
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokens = generateToken(user);

    // Set new access token as non-httpOnly cookie
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60, // 1 hour
      path: "/",
    });

    // Set new refresh token as non-httpOnly cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

// GET /auth/me — return current user from token (used after OAuth redirect)
router.get("/me", async (req, res) => {
  let accessToken = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.slice(7);
  }
  if (!accessToken) {
    accessToken = req.cookies?.accessToken;
  }

  if (!accessToken) {
    return res.status(401).json({ message: "Unauthorized!" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-__v");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    return res.json(user);
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});

passport.serializeUser((user, done) => {
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
