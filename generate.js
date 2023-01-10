const { faker } = require("@faker-js/faker");
const bcrypt = require("bcryptjs");
const shuffle = require("shuffle-array");

const User = require("./models/user.model");
const Anonymous = require("./models/anonymous.model");
const Group = require("./models/group.model");
const GroupUser = require("./models/groupUser.model");
const Presentation = require("./models/presentation.model");
const PresentationUser = require("./models/presentationUser.model");
const Heading = require("./models/heading.model");
const Paragraph = require("./models/paragraph.model");
const MultipleChoice = require("./models/multipleChoice.model");
const Option = require("./models/option.model");
const Message = require("./models/message.model");
const Question = require("./models/question.model");
const shuffleArray = require("shuffle-array");

const default_email = "tester@gmail.com";
const default_password = "abc123456";

const db = {
  db_main_account: {},
  db_secondary_account: {},
  db_users: [],
  db_anonymous: [],
  db_groups: {
    owner: [],
    member: [],
    co_owner: []
  },
  db_presentations: {
    owner: [],
    collaborator: []
  }
};

const USER_COUNT = 100;
const ANONYMOUS_COUNT = 100;
const GROUP_COUNT = {
  OWNER: 10,
  CO_OWNER: 10,
  MEMBER: 10
};
const PRESENTATION_COUNT = {
  OWNER: 5,
  COLLABORATOR: 5
};

const GenerateMainAccount = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(default_password, salt);

  db.db_main_account = await User.create({
    email: default_email,
    password: hashedPassword,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    activated: true,
    source: "normal"
  });

  db.db_secondary_account = await User.create({
    email: "alt_" + default_email,
    password: hashedPassword,
    first_name: faker.name.firstName(),
    last_name: faker.name.lastName(),
    activated: true,
    source: "normal"
  });
};

const GenerateUsers = async () => {
  const users = [];

  for (let i = 0; i < USER_COUNT; i++) {
    users.push({
      email: faker.internet.email(),
      password: faker.internet.password(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      activated: true,
      source: "normal"
    });
  }

  db.db_users = await User.insertMany(users);
};

const GenerateAnonymous = async () => {
  const anonymous = [];

  for (let i = 0; i < ANONYMOUS_COUNT; i++) {
    anonymous.push({
      name: faker.name.firstName()
    });
  }

  db.db_anonymous = await Anonymous.insertMany(anonymous);
};

const GenerateGroup = async () => {
  let users = [];
  let groups = [];
  let groupUsers = [];
  let coOwnerCount = faker.datatype.number({ min: 1, max: 10 });
  let memberCount = faker.datatype.number({ min: 20, max: 50 });

  for (let i = 0; i < GROUP_COUNT.OWNER; i++) {
    groups.push({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      maximum_members: 100
    });
  }

  db.db_groups.owner = await Group.insertMany(groups);

  for (let i = 0; i < GROUP_COUNT.OWNER; i++) {
    groupUsers.push({
      user_id: db.db_main_account._id,
      group_id: db.db_groups.owner[i]._id,
      role: "Owner"
    });

    groupUsers.push({
      user_id: db.db_secondary_account._id,
      group_id: db.db_groups.owner[i]._id,
      role: "Co-Owner"
    });

    coOwnerCount = faker.datatype.number({ min: 1, max: 10 });
    memberCount = faker.datatype.number({ min: 20, max: 50 });
    users = shuffle.pick(db.db_users, { picks: coOwnerCount + memberCount });

    for (let j = 0; j < coOwnerCount; j++) {
      groupUsers.push({
        user_id: users[j]._id,
        group_id: db.db_groups.owner[i]._id,
        role: "Co-Owner"
      });
    }

    for (let j = coOwnerCount; j < coOwnerCount + memberCount; j++) {
      groupUsers.push({
        user_id: users[j]._id,
        group_id: db.db_groups.owner[i]._id,
        role: "Member"
      });
    }
  }

  await GroupUser.insertMany(groupUsers);

  users = [];
  groups = [];
  groupUsers = [];

  for (let i = 0; i < GROUP_COUNT.CO_OWNER; i++) {
    groups.push({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      maximum_members: 100
    });
  }

  db.db_groups.co_owner = await Group.insertMany(groups);

  for (let i = 0; i < GROUP_COUNT.CO_OWNER; i++) {
    groupUsers.push({
      user_id: db.db_main_account._id,
      group_id: db.db_groups.co_owner[i]._id,
      role: "Co-Owner"
    });

    groupUsers.push({
      user_id: db.db_secondary_account._id,
      group_id: db.db_groups.co_owner[i]._id,
      role: "Owner"
    });

    coOwnerCount = faker.datatype.number({ min: 1, max: 10 });
    memberCount = faker.datatype.number({ min: 20, max: 50 });
    users = shuffle.pick(db.db_users, { picks: coOwnerCount + memberCount });

    for (let j = 0; j < coOwnerCount; j++) {
      groupUsers.push({
        user_id: users[j]._id,
        group_id: db.db_groups.co_owner[i]._id,
        role: "Co-Owner"
      });
    }

    for (let j = coOwnerCount; j < coOwnerCount + memberCount; j++) {
      groupUsers.push({
        user_id: users[j]._id,
        group_id: db.db_groups.co_owner[i]._id,
        role: "Member"
      });
    }
  }

  await GroupUser.insertMany(groupUsers);

  users = [];
  groups = [];
  groupUsers = [];

  for (let i = 0; i < GROUP_COUNT.MEMBER; i++) {
    groups.push({
      name: faker.company.name(),
      description: faker.lorem.sentence(),
      maximum_members: 100
    });
  }

  db.db_groups.member = await Group.insertMany(groups);

  for (let i = 0; i < GROUP_COUNT.MEMBER; i++) {
    groupUsers.push({
      user_id: db.db_main_account._id,
      group_id: db.db_groups.member[i]._id,
      role: "Member"
    });

    groupUsers.push({
      user_id: db.db_secondary_account._id,
      group_id: db.db_groups.member[i]._id,
      role: "Owner"
    });

    coOwnerCount = faker.datatype.number({ min: 1, max: 10 });
    memberCount = faker.datatype.number({ min: 20, max: 50 });
    users = shuffle.pick(db.db_users, { picks: coOwnerCount + memberCount });

    for (let j = 0; j < coOwnerCount; j++) {
      groupUsers.push({
        user_id: users[j]._id,
        group_id: db.db_groups.member[i]._id,
        role: "Co-Owner"
      });
    }

    for (let j = coOwnerCount; j < coOwnerCount + memberCount; j++) {
      groupUsers.push({
        user_id: users[j]._id,
        group_id: db.db_groups.member[i]._id,
        role: "Member"
      });
    }
  }

  await GroupUser.insertMany(groupUsers);
};

const GenerateOption = async (start, size) => {
  const upvotes = [];

  for (let i = 0; i < size; i++) {
    upvotes.push({
      user_type: "Anonymous",
      user_id: db.db_anonymous[start + i]._id,
      createdAt: Date.now()
    });

    upvotes.push({
      user_type: "User",
      user_id: db.db_users[start + i]._id,
      createdAt: Date.now()
    });
  }

  const option = await Option.create({
    content: faker.lorem.words(3),
    upvotes: upvotes
  });

  return option;
};

const GenerateMutipleChoice = async () => {
  const options = [];
  const OPTION_1_SIZE = faker.datatype.number({ min: 0, max: 50 });
  const OPTION_2_SIZE = faker.datatype.number({ min: 0, max: 50 });

  options.push(await GenerateOption(0, OPTION_1_SIZE));
  options.push(await GenerateOption(OPTION_1_SIZE, OPTION_2_SIZE));

  const multipleChoice = await MultipleChoice.create({
    question: faker.lorem.sentence(),
    options: options
  });

  return multipleChoice;
};

const GenerateHeading = async () => {
  const heading = await Heading.create({
    heading: faker.lorem.words(5),
    subheading: faker.lorem.sentence()
  });

  return heading;
};

const GenerateParagraph = async () => {
  const paragraph = await Paragraph.create({
    heading: faker.lorem.words(5),
    paragraph: faker.lorem.paragraph()
  });

  return paragraph;
};

const GenerateSlide = async () => {
  const MULTIPLE_CHOICE_COUNT = faker.datatype.number({ min: 1, max: 5 });
  const HEADING_COUNT = faker.datatype.number({ min: 1, max: 5 });
  const PARAGRAPH_COUNT = faker.datatype.number({ min: 1, max: 5 });
  let slides = [];

  for (let i = 0; i < MULTIPLE_CHOICE_COUNT; i++) {
    const multipleChoice = await GenerateMutipleChoice();
    slides.push({
      slide_type: "MultipleChoice",
      slide_id: multipleChoice._id
    });
  }

  for (let i = 0; i < HEADING_COUNT; i++) {
    const heading = await GenerateHeading();
    slides.push({
      slide_type: "Heading",
      slide_id: heading._id
    });
  }

  for (let i = 0; i < PARAGRAPH_COUNT; i++) {
    const paragraph = await GenerateParagraph();
    slides.push({
      slide_type: "Paragraph",
      slide_id: paragraph._id
    });
  }

  return shuffleArray(slides);
};

const GenerateQuestion = async (presentation_id, answerer_id) => {
  const QUESTION_COUNT = faker.datatype.number({ min: 5, max: 20 });
  const questions = [];

  for (let i = 0; i < QUESTION_COUNT; i++) {
    const ANSWER_COUNT = faker.datatype.number({ min: 0, max: 3 });
    const rng = faker.datatype.number({ min: 0, max: 1 });
    const index = faker.datatype.number({ min: 0, max: 99 });
    const answers = [];
    const upvotes = [];

    for (let j = 0; j < ANSWER_COUNT; j++) {
      answers.push({
        answerer_id,
        answer: faker.lorem.sentence()
      });
    }

    const UPVOTE_COUNT = faker.datatype.number({ min: 0, max: 40 });

    for (let j = 0; j < UPVOTE_COUNT; j++) {
      upvotes.push({
        user_type: "User",
        user_id: db.db_users[j]._id,
        createdAt: Date.now()
      });
    }

    if (rng == 0) {
      questions.push({
        questioner_type: "User",
        questioner_id: db.db_users[index]._id,
        presentation_id: presentation_id,
        answers,
        upvotes,
        question: faker.lorem.sentence(),
        is_answered: faker.datatype.boolean()
      });
    }
  }

  await Question.insertMany(questions);
};

const GenerateMessage = async (presentation_id) => {
  const MESSAGE_COUNT = faker.datatype.number({ min: 100, max: 200 });
  const messages = [];

  for (let i = 0; i < MESSAGE_COUNT; i++) {
    const rng = faker.datatype.number({ min: 0, max: 1 });
    const index = faker.datatype.number({ min: 0, max: 99 });

    if (rng == 0) {
      messages.push({
        sender_type: "User",
        sender_id: db.db_users[index]._id,
        presentation_id: presentation_id,
        content: faker.lorem.sentence()
      });
    } else {
      messages.push({
        sender_type: "Anonymous",
        sender_id: db.db_anonymous[index]._id,
        presentation_id: presentation_id,
        content: faker.lorem.sentence()
      });
    }
  }

  await Message.insertMany(messages);
};

const GeneratePresentation = async () => {
  let presentations = [];
  let presentationUsers = [];

  for (let i = 0; i < PRESENTATION_COUNT.OWNER; i++) {
    const slides = await GenerateSlide();

    presentations.push({
      title: faker.lorem.words(3),
      access_code: faker.internet.password(6),
      is_public: true,
      user_id: db.db_main_account._id,
      slides: slides
    });
  }

  db.db_presentations.owner = await Presentation.insertMany(presentations);

  for (let i = 0; i < PRESENTATION_COUNT.OWNER; i++) {
    presentationUsers.push({
      user_id: db.db_main_account._id,
      presentation_id: db.db_presentations.owner[i]._id,
      role: "Owner"
    });

    presentationUsers.push({
      user_id: db.db_secondary_account._id,
      presentation_id: db.db_presentations.owner[i]._id,
      role: "Collaborator"
    });
  }

  await PresentationUser.insertMany(presentationUsers);
  await Promise.all(
    db.db_presentations.owner.map(async (presentation) => {
      await GenerateQuestion(presentation._id, db.db_secondary_account._id);
      await GenerateMessage(presentation._id);
    })
  );

  presentations = [];
  presentationUsers = [];

  for (let i = 0; i < PRESENTATION_COUNT.COLLABORATOR; i++) {
    const slides = await GenerateSlide();

    presentations.push({
      title: faker.lorem.words(3),
      access_code: faker.internet.password(6),
      is_public: true,
      user_id: db.db_secondary_account._id,
      slides: slides
    });
  }

  db.db_presentations.collaborator = await Presentation.insertMany(
    presentations
  );

  for (let i = 0; i < PRESENTATION_COUNT.COLLABORATOR; i++) {
    presentationUsers.push({
      user_id: db.db_main_account._id,
      presentation_id: db.db_presentations.collaborator[i]._id,
      role: "Collaborator"
    });

    presentationUsers.push({
      user_id: db.db_secondary_account._id,
      presentation_id: db.db_presentations.collaborator[i]._id,
      role: "Owner"
    });
  }

  await PresentationUser.insertMany(presentationUsers);
  await Promise.all(
    db.db_presentations.owner.map(async (presentation) => {
      await GenerateQuestion(presentation._id, db.db_secondary_account._id);
      await GenerateMessage(presentation._id);
    })
  );
};

exports.GenerateData = async (
  email = "tester@gmail.com",
  password = "abc123456"
) => {
  await GenerateMainAccount();
  await GenerateUsers();
  await GenerateAnonymous();
  await GenerateGroup();
  await GeneratePresentation();
};
