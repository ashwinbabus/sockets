import React from "react";
import { useSelector } from "react-redux";

function Message({ message }) {
  function convertUTCToLocalTime(utcDateString) {
    const date = new Date(utcDateString);

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    const localTimeString = date.toLocaleTimeString("en-US", options);
    return localTimeString;
  }
  const userId = useSelector(state => state.login.userId);
  const isLoggedInUser = userId === message.created_by_id;
  return (
    <div
      className={`max-w-sm flex items-end justify-between  p-2 mb-4 rounded-md ${
        isLoggedInUser ? "ml-auto bg-green-300" : " bg-slate-300"
      } `}>
      <span className="flex-grow">{message.message}</span>
      <span className="text-xs ml-2">
        {convertUTCToLocalTime(message.createdAt)}
      </span>
    </div>
  );
}

export default Message;
