const generate = require("generate-password");
const Presentation = require("../models/presentation.model");
const GroupUser = require("../models/groupUser.model");
const User = require("../models/user.model");
const PresentationGroup = require("../models/presentationGroup.model");
const {
  API_CODE_SUCCESS,
  API_CODE_BY_SERVER,
  API_CODE_NOTFOUND,
  API_CODE_PERMISSION_DENIED
} = require("../constants");
const PresentationUser = require("../models/presentationUser.model");
const jwt = require("jsonwebtoken");

exports.getPresentation = async (req, res) => {
  const { presentationUser } = req;
  const { presentation_id } = req.params;

  try {
    const presentation = await Presentation.findOne({
      _id: presentation_id
    })
      .populate({
        path: "slides.slide_id"
      })
      .populate({
        path: "user",
        select: "first_name last_name email"
      })
      .lean({ autopopulate: true });

    presentation.slides = presentation.slides.map((slide) => {
      if (slide.slide_type == "MultipleChoice")
        return {
          slide_type: slide.slide_type,
          content: {
            ...slide.slide_id,
            options: slide.slide_id.options.map((option) => ({
              ...option,
              numUpvote: option.upvotes.length
            }))
          }
        };
      else {
        return {
          slide_type: slide.slide_type,
          content: slide.slide_id
        };
      }
    });

    presentation.presentation_role = presentationUser.role;

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.getPresentations = async (req, res) => {
  const { user } = req;
  const { page = 1, limit = 10, role } = req.query;

  try {
    const presentationUsers = await PresentationUser.find({
      user_id: user._id
    });

    const presentationIds = presentationUsers.map(
      (presentationUser) => presentationUser.presentation_id
    );

    const presentations = await Presentation.aggregate([
      {
        $match: {
          _id: { $in: presentationIds }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $lookup: {
          from: "presentationusers",
          localField: "_id",
          foreignField: "presentation_id",
          as: "presentationUsers"
        }
      },
      {
        $unwind: "$presentationUsers"
      },
      {
        $lookup: {
          from: "groups",
          localField: "group_id",
          foreignField: "_id",
          as: "group"
        }
      },
      {
        $unwind: {
          path: "$group",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "presentationUsers.user_id": user._id,
          "presentationUsers.role": role
            ? { $in: Array.isArray(role) ? role : [role] }
            : { $ne: null }
        }
      },
      {
        $facet: {
          data: [
            {
              $project: {
                owner: {
                  _id: "$user._id",
                  email: "$user.email",
                  first_name: "$user.first_name",
                  last_name: "$user.last_name"
                },
                presentation_role: "$presentationUsers.role",
                title: 1,
                access_code: 1,
                group: {
                  _id: 1,
                  name: 1,
                  description: 1
                },
                createdAt: 1,
                updatedAt: 1,
                slides: 1
              }
            },
            {
              $skip: (page - 1) * limit
            },
            {
              $limit: limit
            }
          ],
          totalPresentations: [{ $count: "totalPresentations" }]
        }
      }
    ]);

    const { totalPresentations = 0 } =
      presentations[0].totalPresentations[0] ?? {};
    const totalPages = Math.ceil(totalPresentations / limit);

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentations: presentations[0].data,
        total_pages: totalPages
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.createPresentation = async (req, res) => {
  const { title, is_public } = req.body;
  const { user } = req;

  try {
    let access_code = generate.generate({
      length: 6,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: false,
      excludeSimilarCharacters: true,
      strict: true
    });

    while (await Presentation.exists({ access_code })) {
      access_code = generate.generate({
        length: 6,
        numbers: true,
        uppercase: true,
        lowercase: true,
        symbols: false,
        excludeSimilarCharacters: true,
        strict: true
      });
    }

    const presentation = await Presentation.create({
      title,
      access_code,
      user_id: user._id,
      is_public
    });

    await PresentationUser.create({
      user_id: user._id,
      presentation_id: presentation._id,
      role: "Owner"
    });

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.updatePresentation = async (req, res) => {
  const { title, is_public } = req.body;
  const { presentation } = req;

  try {
    presentation.title = title;
    presentation.is_public = is_public;

    await presentation.save();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: {
        presentation
      }
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.deletePresentation = async (req, res) => {
  const { presentation } = req;

  try {
    await presentation.remove();

    res.json({
      code: API_CODE_SUCCESS,
      message: "Success",
      data: null
    });
  } catch (err) {
    res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};

exports.CheckAccessCodeValid = async (req, res, next) => {
  const { access_code } = req.body;

  try {
    const presentation = await Presentation.findOne({ access_code });

    if (!presentation) {
      return res.json({
        code: API_CODE_NOTFOUND,
        message: "Access code not found",
        data: null
      });
    }

    if (!presentation.is_public) {
      let user_id = null;

      if (req.user) {
        user_id = req.user._id;
      } else {
        if (
          req.headers.authorization &&
          req.headers.authorization.startsWith("Bearer")
        ) {
          const token = req.headers.authorization.split(" ")[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select("-password");

          if (user.token === token) user_id = user._id;
        }
      }

      if (!user_id) {
        return res.json({
          code: API_CODE_PERMISSION_DENIED,
          message: "This presentation is private, please login to access",
          data: null
        });
      }

      const groupUsers = await GroupUser.find({
        user_id
      });

      if (
        !(await PresentationGroup.exists({
          presentation_id: presentation._id,
          group_id: { $in: groupUsers.map((groupUser) => groupUser.group_id) }
        }))
      ) {
        return res.json({
          code: API_CODE_PERMISSION_DENIED,
          message: "You don't have permission to access this presentation",
          data: null
        });
      }
    }

    return res.json({
      code: API_CODE_SUCCESS,
      message: "Access code is valid",
      data: null
    });
  } catch (err) {
    return res.json({
      code: API_CODE_BY_SERVER,
      message: err.message,
      data: null
    });
  }
};
