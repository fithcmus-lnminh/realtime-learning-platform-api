const express = require("express");
const {
  createGroup,
  getGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  inviteUser,
  joinGroup,
  leaveGroup,
  kickUser,
  promoteUser
} = require("../controllers/group.controller");
const { isAuth } = require("../middlewares/auth");
const {
  isGroupExist,
  isInGroup,
  isGroupOwner,
  isInGroupUser,
  handleJoinGroup,
  handleLeaveGroup,
  handleKickUser,
  handlePromoteUser
} = require("../middlewares/group");
const GroupUserRouter = require("./groupUser.route");

const router = express.Router();

router.get("/:group_id", isGroupExist, getGroup);

router.use(isAuth);
router.get("/", getGroups);
router.post("/", createGroup);

router.use("/:group_id", isGroupExist);
router.use("/:group_id/user", isInGroup, GroupUserRouter);

router.post("/:group_id/invite", isInGroup, inviteUser);
router.post("/:group_id/join", handleJoinGroup, joinGroup);
router.post("/:group_id/leave", isInGroup, handleLeaveGroup, leaveGroup);
router.post(
  "/:group_id/kick",
  isInGroup,
  isInGroupUser,
  handleKickUser,
  kickUser
);
router.post(
  "/:group_id/promote",
  isInGroup,
  isInGroupUser,
  handlePromoteUser,
  promoteUser
);

router.use("/:group_id", isInGroup, isGroupOwner);

router.put("/:group_id", updateGroup);
router.delete("/:group_id", deleteGroup);

module.exports = router;
