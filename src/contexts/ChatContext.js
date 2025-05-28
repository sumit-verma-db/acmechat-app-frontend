import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedMenu, setSelectedMenu] = useState(1); // by default 0 index button is selected
  const [chatList, setChatList] = useState([]);
  const [groupList, setGroupList] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const resetSelectedUser = () => setSelectedUser(null); // ?? helper
  return (
    <ChatContext.Provider
      value={{
        chatList,
        groupList,
        setChatList,
        setGroupList,
        selectedUser,
        setSelectedUser,
        resetSelectedUser,
        chatData,
        setChatData,
        onlineUsers,
        setOnlineUsers,
        selectedMenu,
        setSelectedMenu,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
