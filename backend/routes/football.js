const express = require("express");
const router = express.Router();

//import controller functions
const { getFixtures } = require("../controllers/fixturesController");
const { getPlayers } = require("../controllers/playersController");
const { getTopScorers } = require("../controllers/topscorerController");
const { getTopAssisters } = require("../controllers/topassisterController");

const {
  createFantasyTeam,
  updateFantasyTeam,
  deleteFantasyTeam,
  getUserTeam,
} = require("../controllers/fantasyTeamController");

//import middleware for user authentication
const authenticateUser = require("../middlewares/jwtMiddleware");

//defined routes
router.get("/fixtures", authenticateUser, getFixtures);
router.get("/players", authenticateUser, getPlayers);
router.get("/players/topassists", authenticateUser, getPlayers);
router.get("/players/topscorers", authenticateUser, getPlayers);

router.post("/create-team", authenticateUser, createFantasyTeam);
router.get("/my-team", authenticateUser, getUserTeam);
router.put("/update-team", authenticateUser, updateFantasyTeam);
router.delete("/delete-team", authenticateUser, deleteFantasyTeam);

module.exports = router;
