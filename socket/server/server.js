/** @format */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let users = {};
let history = {};
let notification = {};

app.use(cors());

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("set username", (username) => {
    users[socket.id] = username;
    notification[username] = {};
    io.emit("active users", Object.values(users));
  });

  socket.on("join room", ({ room, username }) => {
    socket.join(room);

    const receiver = room.split("-").filter((each) => each !== username)[0];
    if (notification[username]) {
      delete notification[username][receiver];
      io.emit("new message notification", notification);
    }

    if (!history[room]) {
      history[room] = { messages: [] };
    } else {
      const msg_history = history[room].messages;

      io.to(room).emit("recover message history", msg_history);
    }
  });

  socket.on("chat message", ({ room, message, sender }) => {
    const receiver = room.split("-").filter((each) => each !== sender)[0];

    const format = { value: message, sender };
    const msg_history = history[room].messages;
    msg_history.push(format);

    history[room].messages = msg_history;

    io.to(room).emit("chat message", msg_history);

    if (typeof notification[receiver][sender] === "number") {
      notification[receiver][sender] = notification[receiver][sender] + 1;
    } else {
      notification[receiver][sender] = 1;
    }

    io.emit("new message notification", notification);
  });

  socket.on("disconnect", ({ username }) => {
    delete users[socket.id];
    io.emit("active users", Object.values(users));
    console.log("User disconnected", socket.id);
  });
});
server.listen(3232, () => {
  console.log("Server running on port 3232");
});
