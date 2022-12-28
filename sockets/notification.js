const GroupUser = require("../models/groupUser.model");
const PresentationGroup = require("../models/presentationGroup.model");

exports.registerNotificationHandler = async (io, socket) => {
  const user = socket.user;
  const groupUsers = await GroupUser.find({ user_id: user.id });

  const presentationGroups = await PresentationGroup.find({
    group_id: {
      $in: groupUsers.map((groupUser) => groupUser.group_id)
    }
  }).distinct("presentation_id");

  presentationGroups.forEach((presentationGroup) => {
    socket.join(presentationGroup.toString());
  });
};
