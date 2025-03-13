/** @format */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3232;

app.use(express.json());
app.use(cors());

let webhooks = [];
let users = {}; // Menyimpan username berdasarkan user ID
let history = {}; // Menyimpan pesan di tiap room

app.post("/user/activate", (req, res) => {
  const { username, port } = req.body;

  if (!users[username]) {
    users[username] = {
      status: true,
      port,
    };
  } else {
    users[username] = {
      status: true,
      port,
    };
  }

  if (!webhooks.includes(port)) {
    webhooks.push(port);
  }

  const filter_active = Object.keys(users).filter((user) => users[user].status);

  webhooks.forEach((port) => {
    triggerWebhook("UPDATE_USERS", { user_active: filter_active }, port);
  });

  return res
    .status(200)
    .json({ message: "Success Activate User !", user_active: filter_active });
});

app.post("/user/deactivate", (req, res) => {
  const { username } = req.body;

  if (users[username]) {
    users[username].status = false;
  }

  webhooks.forEach((port) => {
    triggerWebhook("UPDATE_USERS", { user_active: filter_active }, port);
  });

  return res
    .status(200)
    .json({ message: "Success Deactivate User !", user_active: users });
});

app.post("/message/send", (req, res) => {
  const { room, message, sender } = req.body;
  const receiver = room.split("-").filter((u) => u !== sender)[0];

  const format = { value: message, sender };
  history[room].push(format);

  triggerWebhook(
    "UPDATE_HISTORY",
    { room_code: room, messages: history[room] },
    users[receiver].port
  );

  return res
    .status(200)
    .json({ message: "Success Update History", messages: history[room] });
});

app.post("/message/join-room", (req, res) => {
  const { room } = req.body;

  if (!history[room]) {
    history[room] = [];
  }

  return res
    .status(200)
    .json({ message: "Success Get History", messages: history[room] });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

async function triggerWebhook(event, data, port) {
  console.log(event, port);
  try {
    await fetch(port, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
      }),
    });
  } catch (error) {
    console.error(`⚠️ Gagal mengirim webhook ke ${port}`);
  }
}
