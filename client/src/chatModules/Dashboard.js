import React, { useEffect, useRef, useState } from "react";
import Input from "./Input";
import { io } from "socket.io-client";
import { Link, Navigate, useNavigate } from 'react-router-dom';
import "./Dashboard.css"

const Dashboard = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user:data"))
  );
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const messageRef = useRef(null);
  const navigate = useNavigate();
  const server_url = "https://user-post-comment-chat-project-backend.onrender.com";

  useEffect(() => {
    setSocket(io('http://localhost:8080'));
  }, []);

  useEffect(() => {
    socket?.emit("addUser", user?._id);
    socket?.on("getUsers", (users) => {
      console.log("activeUsers :>> ", users);
    });
    socket?.on("getMessage", (data) => {
      setMessages((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { user: data.user, message: data.message },
        ],
      }));
    });
  }, [socket]);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.messages]);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user:data"));
    const fetchConversations = async () => {
      const res = await fetch(
        `${server_url}/api/conversations/${loggedInUser?._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resData = await res.json();
      setConversations(resData);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(
        `${server_url}/api/allusers/${user?._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resData = await res.json();
      setUsers(resData);
    };
    fetchUsers();
  }, []);

  const fetchMessages = async (conversationId, receiver) => {
    const res = await fetch(
      `${server_url}/api/message/${conversationId}?senderId=${user?._id}&&receiverId=${receiver?.receiverId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const resData = await res.json();
    setMessages({ messages: resData, receiver, conversationId });
  };

  const sendMessage = async (e) => {
    setMessage("");
    socket?.emit("sendMessage", {
      senderId: user?._id,
      receiverId: messages?.receiver?.receiverId,
      message,
      conversationId: messages?.conversationId,
    });

    const res = await fetch(`${server_url}/api/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: messages?.conversationId,
        senderId: user?._id,
        message,
        receiverId: messages?.receiver?.receiverId,
      }),
    });
  };
  //
  const handleOnDivClick = async () => {
    navigate('/');
  };

  return (
    <div className="chat-container">
      <div className="home-redirect-div" onClick={handleOnDivClick}>Home</div>
      <div className="sidebar">
        <div className="user-info">
          <div>
            <img
              src={`${server_url}${user?.profilePic}`}
              alt={user?.email}
              className="profile-pic"
            />
          </div>
          <div className="user-details">
            <h3>{user?.username}</h3>
            <p>My Account</p>
          </div>
        </div>
        <hr />
        <div className="conversations">
          <div className="conversations-title">Messages</div>
          <div>
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, user }) => (
                <div className="conversation-item" key={conversationId}>
                  <div
                    onClick={() => fetchMessages(conversationId, user)}
                    className="conversation-user"
                  >
                    <div>
                      <img
                        src={`${server_url}${user?.profilePic}`}
                        alt={user?.email}
                        className="conversation-pic"
                      />
                    </div>
                    <div className="conversation-details">
                      <h3>{user?.username}</h3>
                      <p>{user?.email}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-conversations">No Conversations</div>
            )}
          </div>
        </div>
      </div>
      <div className="chat-section">
        {messages?.receiver?.username && (
          <div className="chat-header">
            <div>
              <img
                src={`${server_url}${messages?.receiver?.profilePic}`}
                alt={messages?.receiver?.profilePic}
                className="chat-header-pic"
              />
            </div>
            <div className="chat-header-details">
              <h3>{messages?.receiver?.username}</h3>
              <p>{messages?.receiver?.email}</p>
            </div>
            <div className="chat-header-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                viewBox="0 0 24 24"
                stroke="black"
                fill="none"
              >
                <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                <line x1="15" y1="9" x2="20" y2="4" />
                <polyline points="16 4 20 4 20 8" />
              </svg>
            </div>
          </div>
        )}
        <div className="chat-messages">
          <div className="messages-content">
            {messages?.messages?.length > 0 ? (
              messages.messages.map(({ message, user: { id } = {} }) => (
                <React.Fragment key={id}>
                  <div
                    className={`message ${
                      id === user?.id ? "sent" : "received"
                    }`}
                  >
                    {message}
                  </div>
                  <div ref={messageRef}></div>
                </React.Fragment>
              ))
            ) : (
              <div className="no-messages">
                No Messages or No Conversation Selected
              </div>
            )}
          </div>
        </div>
        {messages?.receiver?.username && (
          <div className="chat-input">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field"
            />
            <div
              className={`send-icon ${!message && "disabled"}`}
              onClick={() => sendMessage()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                viewBox="0 0 24 24"
                stroke="#2c3e50"
                fill="none"
              >
                <line x1="10" y1="14" x2="21" y2="3" />
                <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
              </svg>
            </div>
            <div className={`add-icon ${!message && "disabled"}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="icon"
                viewBox="0 0 24 24"
                stroke="#2c3e50"
                fill="none"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="12" y1="9" x2="12" y2="15" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="users-section">
        <div className="users-title">Registered Users:</div>
        <div key="">
          {users.length > 0 ? (
            users.map(({ userId, user }) => (
              <div className="user-item" key={user?._id}>
                <div
                  onClick={() => fetchMessages("new", user)}
                  className="user-info"
                >
                  <div>
                    <img
                      src={`${server_url}${user?.profilePic}`}
                      alt={user?.email}
                      className="user-pic"
                    />
                  </div>
                  <div className="user-details">
                    <h3>{user?.username}</h3>
                    <p>{user?.email}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-users">No Conversations</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
