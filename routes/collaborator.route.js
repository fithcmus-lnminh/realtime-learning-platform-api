const express = require("express");
const {
  createCollaborator,
  getCollaborators,
  updateCollaborator,
  deleteCollaborator
} = require("../controllers/collaborator.controller");
const { isPresentationOwner } = require("../middlewares/presentation");
const { isPresentationMemberExists } = require("../middlewares/collaborator");
const router = express.Router({ mergeParams: true });

router.get("/", getCollaborators);

router.use(isPresentationOwner);

router.post("/", createCollaborator);

router.use(isPresentationMemberExists);

router.put("/", updateCollaborator);
router.put("/delete", deleteCollaborator);

module.exports = router;
