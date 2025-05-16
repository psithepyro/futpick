const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const path = require("path");
//const authenticateUser = require("./middlewares/jwtMiddleware");

// Import routes
const authRoutes = require("./routes/auth");
const jwtAuthRoutes = require("./routes/jwtAuth");
const googleAuthRoutes = require("./routes/googleAuth");
const footballRoutes = require("./routes/football");
const leagueRoutes = require("./routes/league");

//create express application
const app = express();
//static files from public directory
//app.use(express.static(__dirname + "../public"));
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "../public/login.html");
});

// Middlewares
app.use(express.json());
app.use(cookieParser());

//CORS to allow requests from frontend
app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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

// Passport OAuth for Google OAuth
app.use(passport.initialize());
app.use(passport.session());

// authentication routes
app.use("/auth", authRoutes);
app.use("/auth/jwt", jwtAuthRoutes);
app.use("/auth", googleAuthRoutes);

// route for football API
app.use("/api/football", footballRoutes);

// route for football API
app.use("/api/league", leagueRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
