const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth.js");
const pool = require("./config/database.js");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

//initialize express application
const app = express();

// Use session before auth routes
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
//CORS for frontend communication
app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  })
);

//Serve static files from 'public' directory
app.use(express.static(__dirname + "/../public"));

//Middleware for parsing request bodies
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication routes
app.use("/auth", authRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
