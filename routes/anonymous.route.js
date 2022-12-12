const express = require("express");
const { createAnonymous } = require("../controllers/anonymous.controller");

const router = express.Router();

router.post("/", createAnonymous);

module.exports = router;
