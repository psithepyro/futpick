const express = require("express");
const router = express.Router();

//import controller functions
const { getFixtures } = require("../controllers/fixturesController");
const { getPlayers } = require("../controllers/playersController");
//import middleware for user authentication
const authenticateUser = require("../middlewares/jwtMiddleware");
//defined routes
router.get("/fixtures", authenticateUser, getFixtures);
router.get("/players", authenticateUser, getPlayers);

module.exports = router;
