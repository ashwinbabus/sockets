import React from "react";

function ChatList({ chats, getMessages }) {
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
  return (
    <div className="">
      <h1 className="mb-6">Messages</h1>
      {chats && chats.length > 0
        ? chats.map(chat => (
            <div key={chat.id} className="w-full h-20 bg-stone-200 rounded-md px-3 py-3 mb-2 flex items-center cursor-pointer" onClick={()=>getMessages(chat.id)}>
              <div className="bg-lime-100 rounded-full h-10 w-10 mr-3 " />
              <div className="flex-grow">
                <p className="text-sm mb-1 font-semibold">{chat.users.map(user => user.fullName).toString()}</p>
                <div className="flex justify-between items-center">
                  <p
                    className="truncate text-sm flex-grow"
                    style={{ maxWidth: "155px" }}>
                    { chat.latest_message }
                  </p>
                  <p className="text-xs"> &nbsp;* {convertUTCToLocalTime(chat.latest_message_date)}</p>
                </div>
              </div>
            </div>
          ))
        : null}
    </div>
  );
}

export default ChatList;
