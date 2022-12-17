const express = require("express");
const {
  createParagraph,
  getParagraphs,
  getParagraph,
  updateParagraph,
  deleteParagraph
} = require("../controllers/paragraph.controller");
const { isParagraphExist } = require("../middlewares/paragraph");

const router = express.Router({ mergeParams: true });

router.post("/", createParagraph);
router.get("/", getParagraphs);

router.use("/:paragraph_id", isParagraphExist);

router.get("/:paragraph_id", getParagraph);
router.put("/:paragraph_id", updateParagraph);
router.delete("/:paragraph_id", deleteParagraph);

module.exports = router;
