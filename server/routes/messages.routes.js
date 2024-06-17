module.exports = app => {
  const messages = require("../controllers/messages.controller.js");
  const verifyToken = require("../auth/VerifyToken.js");
  var router = require("express").Router();

  router.post("/sendMessage", messages.sendMessages);
  app.use("/api/chats", verifyToken, router);
};
