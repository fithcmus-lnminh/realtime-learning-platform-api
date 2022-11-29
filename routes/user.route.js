const express = require("express");
const { getCurrentUser } = require("../controllers/user.controller");
const { isAuth } = require("../middlewares/auth");

const router = express.Router();

router.get("/current_user", isAuth, getCurrentUser);

module.exports = router;
