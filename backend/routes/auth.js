const jwtAuth = require("./jwtAuth");
const googleAuth = require("./googleAuth");

const express = require("express");
const router = express.Router();

router.use("/jwt", jwtAuth);
router.use("/google", googleAuth);

module.exports = router;
