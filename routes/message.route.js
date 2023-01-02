const express = require("express");
const { getMessages } = require("../controllers/message.controller");
const { isAuth } = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

router.get("/", isAuth, getMessages);

module.exports = router;
