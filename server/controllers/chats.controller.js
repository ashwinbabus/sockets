const db = require("../models");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../utils");
const Chats = db.chats;
const Users = db.users;

const createUsers = async (users, loggedInUser) => {
  try {
    for (const user of users) {
      const condition = { userId: user.userId };
      const existingUser = await Users.findOne(condition);
      if (!existingUser) {
        const newUserFields = {
          crId: user.crId,
          userId: user.userId,
          brandId: user.brandId,
          brandName: user.brandName,
          campusId: user.campusId,
          campusName: user.campusName,
          fullName: user.fullName,
          profilePicture: user.profilePicture,
          userTypeId: user.userTypeId,
          userTypeName: user.userTypeName,
          email: user.email,
          role: user.role,
          position: user.position,
          created_by_id: loggedInUser.Id,
          created_by_name: loggedInUser.NameOfPerson,
          updated_by_id: loggedInUser.Id,
          updated_by_name: loggedInUser.NameOfPerson,
        };
        const newUser = new Users(newUserFields);
        await newUser.save();
      }
    }
  } catch (error) {
    console.error(error.message);
  }
};

exports.startChat = async (req, res) => {
  try {
    const userDetails = jwt.decode(req.headers.authorization);
    const loggedInUserId = parseInt(userDetails.Id, 10);
    const loggedInUser = {
      crId: userDetails.CRID,
      userId: loggedInUserId,
      brandId: userDetails.BrandId,
      brandName: userDetails.BrandName,
      campusId: userDetails.CampusId,
      campusName: userDetails.CampusName,
      fullName: userDetails.NameOfPerson,
      profilePicture: userDetails.ProfilePicture,
      userTypeId: userDetails.UserTypeId,
      userTypeName: userDetails.UserTypeName,
      email: userDetails.email,
      role: userDetails.role,
      position: userDetails.position,
    };
    const chatObj = new Chats({
      users: [
        ...req.body.payload.users.map(user => user.userId),
        loggedInUserId,
      ],
      created_by_id: loggedInUserId,
      created_by_name: userDetails.NameOfPerson,
      updated_by_id: loggedInUserId,
      updated_by_name: userDetails.NameOfPerson,
    });
    const chat = await chatObj.save();
    await createUsers([...req.body.payload.users, loggedInUser], loggedInUser);
    return sendResponse(res, 200, "Chat started", chat);
  } catch (error) {
    return sendResponse(res, 500, "Internal server error", null, error.message);
  }
};

exports.getUserChats = async (token) => {
  try {
    const userDetails = jwt.decode(token);
    const loggedInUserId = parseInt(userDetails.Id, 10);
    const chats = await Chats.find({
      users: loggedInUserId,
    }).populate({
      path: "users",
      model: "users",
      select: "fullName -_id",
      localField: "users",
      foreignField: "userId",
    }).sort({ latest_message_date : -1 });
    return chats;
  } catch (error) {
    console.error(error.message);
  }
};
