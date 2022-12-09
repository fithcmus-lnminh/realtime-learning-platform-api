const express = require("express");
const {
  createMultipleChoice,
  getMultipleChoices,
  getMultipleChoice,
  updateMultipleChoice,
  deleteMultipleChoice,
} = require("../controllers/multipleChoice.controller.js");
const { isMultipleChoiceExist } = require("../middlewares/multipleChoice.js");
const optionRouter = require("./option.route.js");

const router = express.Router({ mergeParams: true });

router.post("/", createMultipleChoice);
router.get("/", getMultipleChoices);

router.use("/:multiple_choice_id", isMultipleChoiceExist);

router.get("/:multiple_choice_id", getMultipleChoice);
router.put("/:multiple_choice_id", updateMultipleChoice);
router.delete("/:multiple_choice_id", deleteMultipleChoice);

router.use("/:multiple_choice_id/option", optionRouter);

module.exports = router;
