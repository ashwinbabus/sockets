module.exports = app => {
  const chats = require("../controllers/chats.controller.js");
  const verifyToken = require("../auth/VerifyToken.js");
  var router = require("express").Router();

  router.post("/startChat", chats.startChat);
  router.get("/getChats", chats.getUserChats);
  app.use("/api/chats", verifyToken, router);
};
