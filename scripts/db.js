const User = require("../models/user.model");
const Group = require("../models/group.model");
const GroupUser = require("../models/groupUser.model");
const { faker } = require("@faker-js/faker");

exports.generateData = async (user_id) => {
  const numberOfUsers = 100;
  let users = [];

  for (let i = 0; i < numberOfUsers; i++) {
    users.push({
      email: faker.internet.email(),
      password: faker.internet.password(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      activated: true,
      source: "normal",
    });
  }

  users = await User.insertMany(users);

  const numberOfGroups = 10;
  let groups = [];

  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
    });
  }

  groups = await Group.insertMany(groups);

  await Promise.all(
    groups.map(async (group) => {
      return GroupUser.create({
        user_id: user_id,
        group_id: group._id.valueOf(),
        role: "Owner",
      });
    })
  );

  await Promise.all(
    groups.map(async (group) => {
      users = faker.helpers.shuffle(users);
      const numberOfGroupUsers = faker.datatype.number({ min: 30, max: 50 });

      let groupUsers = [];

      for (let i = 0; i < numberOfGroupUsers; i++) {
        groupUsers.push({
          user_id: users[i]._id.valueOf(),
          group_id: group._id.valueOf(),
          role: faker.helpers.arrayElement(["Member", "Co-Owner"]),
        });
      }

      return GroupUser.insertMany(groupUsers);
    })
  );

  groups = [];

  for (let i = 0; i < numberOfGroups; i++) {
    groups.push({
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
    });
  }

  groups = await Group.insertMany(groups);

  await Promise.all(
    groups.map(async (group, index) => {
      return GroupUser.create({
        user_id: users[index]._id.valueOf(),
        group_id: group._id.valueOf(),
        role: "Owner",
      });
    })
  );

  users = users.slice(numberOfGroups);

  await Promise.all(
    groups.map(async (group) => {
      users = faker.helpers.shuffle(users);
      const numberOfGroupUsers = faker.datatype.number({ min: 30, max: 50 });

      let groupUsers = [];

      for (let i = 0; i < numberOfGroupUsers; i++) {
        groupUsers.push({
          user_id: users[i]._id.valueOf(),
          group_id: group._id.valueOf(),
          role: faker.helpers.arrayElement(["Member", "Co-Owner"]),
        });
      }

      groupUsers.push({
        user_id: user_id,
        group_id: group._id.valueOf(),
        role: faker.helpers.arrayElement(["Member", "Co-Owner"]),
      });

      return GroupUser.insertMany(groupUsers);
    })
  );
};
