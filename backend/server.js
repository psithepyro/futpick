const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const axios = require("axios");
require("dotenv").config();
const path = require("path");
const authenticateUser = require("./middlewares/jwtMiddleware");
const logger = require("./middlewares/logger");

// Initialize Express App
const app = express();

app.use(express.static(__dirname + "/../public"));

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"], //allow all orgins for dev only
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// ✅ Initialize Passport for OAuth
app.use(passport.initialize());
app.use(passport.session());

// Import Routes
const authRoutes = require("./routes/auth"); // General authentication routes
const jwtAuthRoutes = require("./routes/jwtAuth"); // ✅ JWT-based auth
const googleAuthRoutes = require("./routes/googleAuth"); // ✅ Google OAuth auth

// Routes
app.use("/auth", authRoutes); // General auth (handles login, register)
app.use("/auth/jwt", jwtAuthRoutes); // JWT authentication
app.use("/auth/", googleAuthRoutes); // Google OAuth authentication

app.get("/api/fixtures", authenticateUser, async (req, res) => {
  try {
    const response = await axios.get(
      "https://v3.football.api-sports.io/fixtures",
      {
        params: {
          league: 262, //liga MX
          season: 2023,
        },
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
          "x-apisports-host": process.env.API_FOOTBALL_HOST,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
//app.use(logger);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
