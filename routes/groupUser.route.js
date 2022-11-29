const express = require("express");
const { getGroupUsers } = require("../controllers/groupUser.controller");
const { isInGroup, isGroupOwner } = require("../middlewares/group");

const router = express.Router({ mergeParams: true });

router.use(isInGroup);

router.get("/", getGroupUsers);

module.exports = router;
