const express = require("express");
const {
  createHeading,
  getHeadings,
  getHeading,
  updateHeading,
  deleteHeading
} = require("../controllers/heading.controller");
const { isHeadingExist } = require("../middlewares/heading");

const router = express.Router({ mergeParams: true });

router.get("/", getHeadings);
router.post("/", createHeading);

router.use("/:heading_id", isHeadingExist);

router.get("/:heading_id", getHeading);
router.put("/:heading_id", updateHeading);
router.delete("/:heading_id", deleteHeading);

module.exports = router;
