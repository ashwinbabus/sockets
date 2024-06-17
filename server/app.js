const express = require("express");
const { Server } =  require("socket.io");
const { createServer } = require("http");
const db = require("./models/index.js");
const cors = require("cors");
const { sendMessages, getChatMessages } = require("./controllers/messages.controller.js");
const { getUserChats } = require("./controllers/chats.controller.js");

const port = 5005;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
  });

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("send-message", async ({ chat_id, message, token }) => {
    const receivedMessage = await sendMessages(chat_id, message, token);
    console.log("send message");
    io.to(chat_id).emit("receive-message", receivedMessage);
    const updatedChats = await getUserChats(token);
    io.emit("receive-chats", updatedChats);
  });

  socket.on("join-chat", chat_id => {
    socket.join(chat_id);
    console.log(`User joined room ${chat_id}`);
  });

  socket.on("get-chats", async(token) => {
    const chats = await getUserChats(token);
    socket.emit("receive-chats", chats);
  })

  socket.on("get-messages", async(chat_id) => {
    const messages = await getChatMessages(chat_id);
    socket.emit("receive-messages", messages);
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

require("./routes/chats.routes.js")(app);
require("./routes/messages.routes")(app);
// require("./routes/users.routes")(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
