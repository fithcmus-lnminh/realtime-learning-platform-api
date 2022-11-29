const express = require("express");
const {
  loginWithGoogle,
  loginGoogleCallback
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/", loginWithGoogle);
router.get("/callback", loginGoogleCallback);

module.exports = router;
