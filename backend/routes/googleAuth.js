const express = require("express");
const passport = require("passport");
const session = require("express-session");
const pool = require("../config/database");
require("dotenv").config();

const router = express.Router();

//Store user sessions so they remain logged in
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: "none",
      secure: false,
    },
  })
);
//Initilaizes Passport.js
router.use(passport.initialize());
//enables session tracking
router.use(passport.session());

console.log("Passport initialized");

//Google OAuth for authentication
passport.use(
  new (require("passport-google-oauth20").Strategy)(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //insert user into postgre or update if it exists
        const result = await pool.query(
          `INSERT INTO users (oauth_provider, oauth_id, name, email, profile_picture) 
                   VALUES ($1, $2, $3, $4, $5)
                   ON CONFLICT (oauth_id) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
          [
            "google",
            profile.id,
            profile.displayName,
            profile.emails[0].value,
            profile.photos[0].value,
          ]
        );
        done(null, result.rows[0]);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

//stores user id in session
passport.serializeUser((user, done) => done(null, user.id));

//retrieves full user profile from PostgreSQL
passport.deserializeUser(async (id, done) => {
  const result = await pool.query("SELECT * FROM USERS WHERE id = $1", [id]);
  done(null, result.rows[0]);
});

//redirects user to google authentication
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//handle google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/homepage.html",
    failureRedirect: "/auth/failure",
  })
);

//Handle Success
router.get("/success", (req, res) => {
  if (!req.user) return res.redirect("/auth/failure");
  res.json({ success: true, user: req.user });
});
//handle failure
router.get("/failure", (req, res) => res.send("authentication failed"));
//Logout route
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy();
    res.send("Logged Out");
  });
});

module.exports = router;
