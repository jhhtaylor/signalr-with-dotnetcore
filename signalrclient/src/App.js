import React, { useState, useEffect } from "react";
import * as signalR from "@microsoft/signalr";

function App() {
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5111/chatHub")
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.onclose(() => {
        console.log("Connection closed");
        setConnectionStatus("Disconnected");
      });

      connection.onreconnecting(() => {
        console.log("Reconnecting...");
        setConnectionStatus("Reconnecting...");
      });

      connection.on("UsersOnline", (users) => {
        setOnlineUsers(users);
      });

      connection
        .start()
        .then(() => {
          console.log("Connected!");
          setConnectionStatus("Connected");

          connection.on("ReceiveMessage", (user, message) => {
            setChat((prev) => [...prev, { user, message }]);
          });
        })
        .catch((e) => console.log("Connection failed: ", e));
    }
  }, [connection]);

  const sendMessage = async () => {
    if (connection && connectionStatus === "Connected") {
      try {
        await connection.send("SendMessage", message);
        setMessage("");
      } catch (e) {
        console.error(e);
      }
    } else {
      console.warn("Connection hasn't been established yet. Please wait...");
    }
  };

  return (
    <div>
      <div>Status: {connectionStatus}</div>
      <div>
        Online Users:
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
      </div>
      <div>
        {chat.map((message, index) => (
          <span key={index}>
            {message.user}: {message.message}
            <br />
          </span>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
