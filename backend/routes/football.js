const express = require("express");
const router = express.Router();

//import controller functions
const { getFixtures } = require("../controllers/fixturesController");
const { getPlayers } = require("../controllers/playersController");
const { getTopScorers } = require("../controllers/topscorerController");
const { getTopAssisters } = require("../controllers/topassisterController");
//import middleware for user authentication
const authenticateUser = require("../middlewares/jwtMiddleware");
//defined routes
router.get("/fixtures", authenticateUser, getFixtures);
router.get("/players", authenticateUser, getPlayers);
`router.get("/topscorers", authenticateUser, getTopScorers);
router.get("/topassisters", authenticateUser, getTopAssisters);`

module.exports = router;
