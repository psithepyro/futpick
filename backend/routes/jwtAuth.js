const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");
const verifyAuthToken = require("../middlewares/jwtMiddleware"); // Import middleware
require("dotenv").config();

const router = express.Router();

//this route registers a new user by hashing their password and saving it in the DB
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" }); // ✅ Stops execution
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into DB
    const newUser = await pool.query(
      `INSERT INTO users (oauth_provider, oauth_id, name, email, password) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email`,
      [null, null, name, email, hashedPassword]
    );

    if (newUser.rows.length > 0) {
      return res.status(201).json({
        message: "User registered successfully!",
        user: newUser.rows[0],
      }); // ✅ Stops execution
    }

    return res
      .status(500)
      .json({ message: "Something went wrong in DB execution" }); // ✅ Stops execution
  } catch (error) {
    console.error("Error in register:", error);
    return res.status(500).json({ message: "Server error" }); // ✅ Stops execution
  }
});

//this route logs in an existing user by checking their credentials and generating a JWT token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Received login request:", { email, password });

  try {
    // Get user from DB
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //Prevent OAuth users from logging in with a password
    if (user.oauth_provider) {
      return res
        .status(400)
        .json({ message: `Please log in using ${user.oauth_provider}.` });
    }

    //Ensure password exists
    if (!user.password) {
      console.error("Stored password: undefined");
      return res
        .status(500)
        .json({ message: "Internal server error: Password missing." });
    }

    //Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    //Generate JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.json({ message: "Logged in successfully!", token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized access!" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden access!" });
    req.user = user;
    next();
  });
}

//protected route: fetch user data
router.get("/protected-route", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; //extract user ID from token
    const result = await pool.query(
      "SELECT id, name, email FROM users where id = $1",
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found!" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error!" });
  }
});

module.exports = router;
