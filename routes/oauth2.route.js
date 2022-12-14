const express = require("express");
const {
  loginWithGoogle,
  loginGoogleCallback,
  getTokenGoogle,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/", loginWithGoogle);
router.get("/callback", loginGoogleCallback);
router.get("/token", getTokenGoogle);

module.exports = router;
