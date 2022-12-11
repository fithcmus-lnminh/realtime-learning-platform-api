const express = require("express");
const {
  createOption,
  getOptions,
  getOption,
  updateOption,
  deleteOption,
} = require("../controllers/option.controller");
const { isOptionExist } = require("../middlewares/option");

const router = express.Router();

router.post("/", createOption);
router.get("/", getOptions);

router.use("/:option_id", isOptionExist);

router.get("/:option_id", getOption);
router.put("/:option_id", updateOption);
router.delete("/:option_id", deleteOption);

module.exports = router;
