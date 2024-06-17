const db = require("../models");
const { sendResponse } = require("../utils");
const Messages = db.messages;
const Chats = db.chats;
const jwt = require("jsonwebtoken");

// exports.sendMessages = async (req, res) => {
//   try {
//     const chat_id = req.body.chat_id;
//     const chat = await Chats.findOne({ _id: chat_id });
//     const userDetails = jwt.decode(req.headers.authorization);
//     const loggedInUserId = parseInt(userDetails.Id, 10);
//     if (!chat) return sendResponse(res, 404, "Chat not found");
//     const messageObj = new Messages({
//         chat_id, message: req.body.message,
//         created_by_id: loggedInUserId,
//         created_by_name: userDetails.NameOfPerson,
//         updated_by_id: loggedInUserId,
//         updated_by_name: userDetails.NameOfPerson
//     });
//     const message = await messageObj.save();
//     if (!message)
//       return sendResponse(
//         res,
//         500,
//         "Something went wrong, unable to save message",
//       );
//     return sendResponse(res, 200, "Message sent", message);
//   } catch (error) {
//     return sendResponse(res, 500, "Internal server error", null, error.message);
//   }
// };

exports.sendMessages = async (chat_id, message, token) => {
  try {
    const chat = await Chats.findOne({ _id: chat_id });
    const userDetails = jwt.decode(token);
    const loggedInUserId = parseInt(userDetails.Id, 10);
    if (!chat) return sendResponse(res, 404, "Chat not found");
    const messageObj = new Messages({
      chat_id,
      message,
      created_by_id: loggedInUserId,
      created_by_name: userDetails.NameOfPerson,
      updated_by_id: loggedInUserId,
      updated_by_name: userDetails.NameOfPerson,
    });
    const msg = await messageObj.save();
    if (!msg)
      return sendResponse(
        res,
        500,
        "Something went wrong, unable to save message",
      );
    await Chats.findOneAndUpdate(
      { _id : chat_id },
      {
        $set: {
          latest_message : message,
          latest_message_date : msg.createdAt
        }
      },
      { new : true }
    )
    return msg;
  } catch (error) {
    console.error(error.message);
  }
};

exports.getChatMessages = async (chat_id) => {
  try {
    const messages = await Messages.find({ chat_id });
    return messages;
  } catch (error) {
    console.error(error.message);
  }
};
