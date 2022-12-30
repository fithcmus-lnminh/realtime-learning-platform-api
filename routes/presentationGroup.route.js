const express = require("express");
const {
  createPresentationGroup,
  getPresentationGroups,
  deletePresentationGroup
} = require("../controllers/presentationGroup.controller");
const { isPresentationGroupExist } = require("../middlewares/presentation");

const router = express.Router({ mergeParams: true });

router.post("/", createPresentationGroup);
router.get("/", getPresentationGroups);

router.use("/:group_id", isPresentationGroupExist);

router.delete("/:group_id", deletePresentationGroup);

module.exports = router;
