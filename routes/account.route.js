const express = require("express");
const { isAuth } = require("../middlewares/auth");
const {
  updateAccount,
  updatePassword
} = require("../controllers/account.controller");

const router = express.Router();

router.use(isAuth);
router.put("/", updateAccount);
router.put("/password", updatePassword);

module.exports = router;
