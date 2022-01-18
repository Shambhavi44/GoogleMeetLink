const express = require("express");
const {
  getlink,
  authorizeUrl,
  getMeetingLink,
} = require("../controller/index.js");
const router = express.Router();

router.get("/getlink", getlink);
router.post("/auth", authorizeUrl);
router.get("/getgooglemeetlink", getMeetingLink);

module.exports = router;
