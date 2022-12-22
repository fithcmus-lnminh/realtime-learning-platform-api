const express = require("express");
const {
  createResetPasswordToken,
  resetPassword,
  acceptCollaborator
} = require("../controllers/token.controller");
const router = express.Router({ mergeParams: true });

router.post("/reset-password/", createResetPasswordToken);
router.post("/reset-password/:token_id", resetPassword);
router.post("/collaborator/:token_id", acceptCollaborator);

module.exports = router;
