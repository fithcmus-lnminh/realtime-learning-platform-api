const express = require("express");
const {
  createResetPasswordToken,
  resetPassword,
} = require("../controllers/token.controller");
const router = express.Router({ mergeParams: true });

router.post("/reset-password/", createResetPasswordToken);
router.post("/reset-password/:token_id", resetPassword);

module.exports = router;
