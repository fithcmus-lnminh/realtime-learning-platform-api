const express = require("express");
const {
  createPresentation,
  getPresentations,
  getPresentation,
  updatePresentation,
  deletePresentation,
} = require("../controllers/presentation.controller");
const {
  checkGroupIdInBody,
  isPresentationExist,
  isPresentationOwner,
} = require("../middlewares/presentation");
const { isAuth } = require("../middlewares/auth");
const multipleChoiceRouter = require("./multipleChoice.route");

const router = express.Router();

router.use(isAuth);

router.post("/", checkGroupIdInBody, createPresentation);
router.get("/", getPresentations);

router.use("/:presentation_id", isPresentationExist, isPresentationOwner);

router.get("/:presentation_id", getPresentation);
router.put("/:presentation_id", updatePresentation);
router.delete("/:presentation_id", deletePresentation);

router.use("/:presentation_id/multiple-choice", multipleChoiceRouter);

module.exports = router;
