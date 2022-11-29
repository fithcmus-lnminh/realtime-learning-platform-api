const express = require("express");
const {
  login,
  logout,
  register,
  verifyEmail
} = require("../controllers/auth.controller");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.post("/login", login);
router.post("/logout", isAuth, logout);
router.post("/register", register);
router.post("/verify/:token", verifyEmail);

module.exports = router;
