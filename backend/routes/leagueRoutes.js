const express = require("express");
const router = express.Router();
const leagueController = require("../controllers/leagueController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, leagueController.getUserLeagues);
router.post("/join", authenticate, leagueController.joinLeague);
router.delete("/:leagueId", authenticate, leagueController.leaveLeague);
router.get("/:leagueId", authenticate, leagueController.getLeagueDetails);

module.exports = router;