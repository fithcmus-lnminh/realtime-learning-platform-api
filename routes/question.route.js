const express = require("express");
const { getQuestions } = require("../controllers/question.controller");
const { isAuth } = require("../middlewares/auth");

const router = express.Router({ mergeParams: true });

router.use(isAuth);
router.get("/", getQuestions);

module.exports = router;
