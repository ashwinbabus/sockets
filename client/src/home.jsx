import React, { useMemo, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import ChatList from "./chatlist";
import Message from "./message";
import { logout } from "./redux/loginSlice";

function Home() {
  const token = useSelector(state => state.login.token);
  const [chats, setChats] = useState([]);
  const [chat_id, setChat_id] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();

  const socket = useMemo(
    () =>
      io("http://localhost:5005", {
        withCredentials: false,
      }),
    [],
  );

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connect", socket.id);
    });

    socket.on("receive-chats", data => {
      setChats(data);
    });

    socket.on("receive-messages", data => {
      setMessages(data);
    });

    socket.on("receive-message", message => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    socket.emit("get-chats", token);

    return () => {
      socket.off("connect");
      socket.off("receive-chats");
      socket.off("receive-messages");
      socket.off("receive-message");
      socket.disconnect();
    };
  }, [socket, token]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleGetMessages = chat_id => {
    socket.emit("get-messages", chat_id);
    setChat_id(chat_id);
    socket.emit("join-chat", chat_id);
  };

  const handleSendMessage = () => {
    if (chat_id && message.trim() !== "") {
      socket.emit("send-message", {
        chat_id,
        message,
        token,
      });
      setMessage("");
    }
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  }

  return (
    <div className="w-screen h-screen flex">
      <div className="w-[25%] border border-[#E3E8EF] flex flex-col justify-between px-4 py-3 ">
        <ChatList chats={chats} getMessages={handleGetMessages} />
        <div
          className="bg-red-400 text-white rounded-md p-3 font-bold text-2xl flex items-center justify-center cursor-pointer "
          onClick={handleLogout}>
          LOGOUT
        </div>
      </div>
      <div className="w-[75%] bg-yellow-50 flex flex-col p-4">
        <div
          className={`flex-grow overflow-y-auto ${
            !chat_id ? "flex items-center justify-center" : ""
          } `}>
          {chat_id && messages && messages.length > 0 ? (
            messages.map(message => (
              <Message key={message.id} message={message} />
            ))
          ) : !chat_id ? (
            <h1 className="text-gray-400">Select A Chat</h1>
          ) : null}
          <div ref={messagesEndRef} />
        </div>
        {chat_id && (
          <input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Enter message here"
            className=" p-4 w-full "
          />
        )}
      </div>
    </div>
  );
}

export default Home;
