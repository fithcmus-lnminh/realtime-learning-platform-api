const express = require("express");
const {
  createPresentation,
  getPresentations,
  getPresentation,
  updatePresentation,
  deletePresentation,
  CheckAccessCodeValid
} = require("../controllers/presentation.controller");
const {
  checkGroupIdInBody,
  isPresentationExist,
  isPresentationUserExist,
  isPresentationOwner
} = require("../middlewares/presentation");
const { isAuth } = require("../middlewares/auth");
const multipleChoiceRouter = require("./multipleChoice.route");
const headingRouter = require("./heading.route");
const paragraphRouter = require("./paragraph.route");
const presentationUserRouter = require("./collaborator.route");

const router = express.Router();

router.post("/access-code", CheckAccessCodeValid);

router.use(isAuth);

router.post("/", checkGroupIdInBody, createPresentation);
router.get("/", getPresentations);

router.use("/:presentation_id", isPresentationExist, isPresentationUserExist);

router.get("/:presentation_id", getPresentation);
router.put("/:presentation_id", isPresentationOwner, updatePresentation);
router.delete("/:presentation_id", isPresentationOwner, deletePresentation);

router.use("/:presentation_id/multiple-choice", multipleChoiceRouter);
router.use("/:presentation_id/heading", headingRouter);
router.use("/:presentation_id/paragraph", paragraphRouter);
router.use("/:presentation_id/collaborator", presentationUserRouter);

module.exports = router;
