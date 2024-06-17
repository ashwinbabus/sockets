const db = require("./models");
const Users = db.users;
const Communities = db.communities;
const PostComments = db.postcomments;

exports.sendResponse = function sendResponse(
  res,
  status,
  message,
  data,
  error,
) {
  return res.status(status).send({
    status,
    message,
    ...(data && { data }),
    ...(error && { error }),
  });
};

// update or create a user when a community is created
exports.updateCommunityUsers = async (users, communityId, role) => {
  try {
    const roleUpdates = {
      member: ["member_communities"],
      admin: ["admin_communities"],
      creator: ["communities_created"],
    };

    // Process each user
    for (const user of users) {
      const condition = { userId: user.userId };
      const update = {
        $addToSet: {
          communities_partof: communityId,
          ...(roleUpdates[role] || []).reduce((acc, field) => {
            acc[field] = communityId;
            return acc;
          }, {}),
        },
      };

      // Check if user exists and update or create accordingly
      const existingUser = await Users.findOne(condition);
      if (existingUser) {
        await Users.updateOne(condition, update);
      } else {
        const newUserFields = {
          crId: user.crId,
          userId: user.userId,
          communities_partof: [communityId],
          communities_created: role === "creator" ? [communityId] : [],
          admin_communities: role === "admin" ? [communityId] : [],
          member_communities: role === "member" ? [communityId] : [],
          fullName: user.fullName,
          country_code: user.country_code,
          phoneNumber: user.phoneNumber,
          email: user.email,
          role: user.role,
          position: user.position,
          brandId: user.brandId,
          brandName: user.brandName,
          campusId: user.campusId,
          campusName: user.campusName,
          userTypeId: user.userTypeId,
          userTypeName: user.userTypeName,
          curriculumName: user.curriculumName,
          gradeNames: user.gradeNames,
        };
        const newUser = new Users(newUserFields);
        await newUser.save();
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

// TO POPULATE USERS IN COMMUNITIES
const userSelectString =
  "crId userId fullName userTypeId position email phoneNumber imageURL campusName campusId brandId brandName userTypeName subjectNames parentOff -_id";
// populate
const populateAdmins = {
  path: "admins",
  model: "users",
  localField: "admins",
  foreignField: "userId",
  select: userSelectString,
};
exports.populateAdmins = populateAdmins;

const populateMembers = {
  path: "members",
  model: "users",
  localField: "members",
  foreignField: "userId",
  select: userSelectString,
};
exports.populateMembers = populateMembers;

const popuplateFromUserId = {
  path: "from_user_id",
  model: "users",
  localField: "from_user_id",
  foreignField: "userId",
  select: userSelectString,
};
exports.populateFromUserId = popuplateFromUserId;

const populateCoordinators = {
  path: "coordinators",
  model: "users",
  localField: "coordinators",
  foreignField: "userId",
  select: userSelectString,
};
exports.populateCoordinators = populateCoordinators;

const populatePendingCoordinators = {
  path: "pending_coordinators",
  model: "users",
  localField: "pending_coordinators",
  foreignField: "userId",
  select: userSelectString,
};
exports.populatePendingCoordinators = populatePendingCoordinators;

const populatePendingMembers = {
  path: "pending_members",
  model: "users",
  localField: "pending_members",
  foreignField: "userId",
  select: userSelectString,
};
exports.populatePendingMembers = populatePendingMembers;

const populateSuspendedMembers = {
  path: "suspended_members",
  model: "users",
  localField: "suspended_members",
  foreignField: "userId",
  select: userSelectString,
};
const populateSuspendedAdmins = {
  path: "suspended_admins",
  model: "users",
  localField: "suspended_admins",
  foreignField: "userId",
  select: userSelectString,
};
const populateSuspendedCoordinators = {
  path: "suspended_coordinators",
  model: "users",
  localField: "suspended_coordinators",
  foreignField: "userId",
  select: userSelectString,
};

const populateMentionUsers = {
  ...populateAdmins,
  path: "mentioned_users_id",
  localField: "mentioned_users_id",
};

exports.populateMentionUsers = populateMentionUsers;

const populateUsers = {
  populateAdmins,
  populateMembers,
  populateCoordinators,
  populatePendingCoordinators,
  populatePendingMembers,
  populateSuspendedMembers,
  populateSuspendedAdmins,
  populateSuspendedCoordinators,
};

exports.populateUsers = populateUsers;

const reactionPopulations = {
  like: {
    path: "like",
    model: "users",
    localField: "like",
    foreignField: "userId",
    select: userSelectString,
  },
  love: {
    path: "love",
    model: "users",
    localField: "love",
    foreignField: "userId",
    select: userSelectString,
  },
  celebrate: {
    path: "celebrate",
    model: "users",
    localField: "celebrate",
    foreignField: "userId",
    select: userSelectString,
  },
  funny: {
    path: "funny",
    model: "users",
    localField: "funny",
    foreignField: "userId",
    select: userSelectString,
  },
};
exports.reactionPopulations = reactionPopulations;

// UPDATE AND FETCH COMMUNITIES
exports.updateAndFetchCommunity = async function updateAndFetchCommunity(
  community_id,
  newMembers,
  userDetails,
  role,
) {
  return Communities.findOneAndUpdate(
    { community_id },
    {
      $addToSet: { 
        [role]: { $each: newMembers }, 
        unvisited_members : { $each : newMembers }
      },
      $set: {
        updated_by_id: userDetails.Id,
        updated_by_name: userDetails.NameOfPerson,
      },
    },
    { new: true },
  ).populate([populateAdmins, populateMembers]);
};

// CLASSIFY MEMBERS
exports.classifyMembers = function classifyMembers(
  members,
  community,
  checkAdmins = true,
  checkMembers = true,
  checkCoordinators = true
) {
  const newMembers = [];
  const alreadyMembers = [];

  members.forEach(member => {
    let isAlreadyMember = false;

    if (checkMembers && community.members.includes(member.userId)) {
      isAlreadyMember = true;
    }

    if (checkAdmins && community.admins.includes(member.userId)) {
      isAlreadyMember = true;
    }

    if (checkCoordinators && community.coordinators.includes(member.userId)) {
      isAlreadyMember = true;
    }

    if (isAlreadyMember) {
      alreadyMembers.push(member.userId);
    } else {
      newMembers.push(member.userId);
    }
  });

  return { newMembers, alreadyMembers };
};

// CHECK AND INSERT USERS IF THEY ARE NOT IN THE DATABASE
exports.checkAndInsertUsers = async function checkAndInsertUsers(
  users,
  loggedInUserDetails,
) {
  const userIds = users.map(user => user.userId);

  // Fetch all existing users in one query
  const existingUsers = await Users.find({ userId: { $in: userIds } });
  const existingUserIds = new Set(existingUsers.map(u => u.userId));

  // Filter users that don't exist in the database
  const usersToInsert = users
    .filter(user => !existingUserIds.has(user.userId))
    .map(user => ({
      insertOne: {
        document: {
          ...user,
          created_by_id: loggedInUserDetails.Id,
          created_by_name: loggedInUserDetails.NameOfPerson,
          updated_by_id: loggedInUserDetails.Id,
          updated_by_name: loggedInUserDetails.NameOfPerson,
        },
      },
    }));
  // Insert new users in bulk
  if (usersToInsert.length) {
    await Users.bulkWrite(usersToInsert, { ordered: false });
  }
};

// UPDATE USER ACTIVE COMMUNITIES
exports.updateUserActiveCommunities =
  async function updateUserActiveCommunities(
    community_data,
    users,
    loggedInUserDetails,
    role,
    action,
  ) {
    const { community_id } = community_data;

    const actionObj = {};

    if (role === "member") {
      actionObj[action] = {
        communities_partof: community_id,
        member_communities: community_id,
      };
    }

    if (role === "admin" && action === "$addToSet") {
      actionObj[action] = {
        communities_partof: community_id,
        admin_communities: community_id,
      };
      actionObj["$pull"] = {
        member_communities: community_id,
      };
    }

    if (role === "admin" && action === "$pull") {
      actionObj[action] = {
        admin_communities: community_id,
      };
      actionObj["$addToSet"] = {
        member_communities: community_id,
      };
    }

    const operations = users.map(user => ({
      updateOne: {
        filter: { userId: user },
        update: {
          ...actionObj,
          $set: {
            updated_by_id: loggedInUserDetails.Id,
            updated_by_name: loggedInUserDetails.NameOfPerson,
          },
        },
      },
    }));

    await Users.bulkWrite(operations, { ordered: false });
    return;
  };

// GET SUSPENDED AND UNSUSPENDED USERS
exports.getSuspendedAndUnsuspendedMembers =
  function getSuspendedAndUnsuspendedMembers(
    suspendedMembersArray,
    arrayToCheck,
  ) {
    let suspendedMembers = [];
    let unsuspendedMembers = [];
    arrayToCheck.forEach(member => {
      if (suspendedMembersArray.includes(member)) suspendedMembers.push(member);
      else unsuspendedMembers.push(member);
    });
    return { suspendedMembers, unsuspendedMembers };
  };

// GENERATE MESSAGE FOR RESPONSE
exports.generateMessage = function generateMessage(
  newMembers,
  alreadyMembers,
  role,
) {
  const addedMessage = newMembers.length
    ? `${newMembers.length} ${role}${
        newMembers.length > 1 ? "s" : ""
      } have been added.`
    : "";
  const existingMessage = alreadyMembers.length
    ? `${alreadyMembers.join(", ")} ${
        alreadyMembers.length === 1 ? "is" : "are"
      } already a ${role}.`
    : "";

  return `${addedMessage} ${existingMessage}`;
};

// Function to recursively populate replies
exports.populateReplies = async function populateReplies(comment) {
  try {
    await PostComments.populate(comment, {
      path: "replies",
      populate: popuplateFromUserId,
    });
    for (let reply of comment.replies) {
      await exports.populateReplies(reply);
    }
  } catch (error) {
    console.error("Error populating replies:", error);
  }
};

// For reaction api
exports.findUserInReactions = function findUserInReactions(userId, reactions) {
  for (const [key, array] of Object.entries(reactions)) {
    if (array && array.length > 0) {
      const index = array.indexOf(userId);
      if (index !== -1) {
        return { key, index };
      }
    }
  }
  return null;
};

exports.findUserInReactions = function findUserInReactions(userId, post) {
  const isLike = post.like.some(usr => usr === userId);
  const isLove = post.love.some(usr => usr === userId);
  const isCelebrate = post.celebrate.some(usr => usr === userId);
  const isFunny = post.funny.some(usr => usr === userId);
  if(isLike) return "like";
  if(isLove) return "love";
  if (isCelebrate) return "celebrate";
  if (isFunny) return "funny";
  return null;
}

exports.fileExtensions = [
  ".pdf",
  ".xls",
  ".xlsx",
  ".cvs",
  ".zip",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
];

exports.imageExtensions = [".jpg", ".jpeg", ".png"];

exports.videoExtensions = [".mp4", ".avi"];