/** @format */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3232;

app.use(express.json());
app.use(cors());

let users = {}; // Menyimpan username berdasarkan user ID
let history = {}; // Menyimpan pesan di tiap room
let notifications = {}; // Menyimpan notifikasi unread
let webhook = "http://localhost:3000/api/webhook";

// 🔹 Pengguna Aktif
app.post("/register", async (req, res) => {
  const { username } = req.body;
  const uid = Math.random().toString(36).substr(2, 9).toUpperCase();

  if (Object.values(users).includes(username)) {
    const selectedUser = Object.entries(users).find(
      ([key, value]) => value === username
    );

    res.status(200).json({
      message: "LOGIN SUCCESS",
      data: { uid: selectedUser[0], username: selectedUser[1] },
    });
  } else {
    users[uid] = username;
    notifications[uid] = {};

    res
      .status(200)
      .json({ message: "REGISTER SUCCESS", data: { uid, username } });
  }

  return await triggerWebhook("UPDATE_USERS", users);
});

// 🔹 Bergabung ke Room
app.post("/join-room", (req, res) => {
  const { room, username } = req.body;

  const receiver = room.split("-").filter((u) => u !== username)[0];

  if (notifications[username]) {
    delete notifications[username][receiver];
  }

  if (!history[room]) {
    history[room] = [];
  }

  res.status(200).json({ message: history[room] });
});

// 🔹 Kirim Pesan
app.post("/chat-message", async (req, res) => {
  const { room, message, sender } = req.body;
  const receiver = room.split("-").filter((u) => u !== sender)[0];

  const format = { value: message, sender };
  history[room].push(format);

  // 🔹 Simpan notifikasi untuk penerima
  if (notifications[receiver]) {
    notifications[receiver][sender] =
      (notifications[receiver][sender] || 0) + 1;
  }

  res
    .status(200)
    .json({ message: "SUCCESS SEND NEW MESSAGE", messages: history[room] });

  return await triggerWebhook("UPDATE_HISTORY", {
    room_code: room,
    messages: history[room],
  });
});

// 🔹 Notifikasi Baru
app.get("/notifications/:username", (req, res) => {
  const username = req.params.username;
  res.status(200).json({ notifications: notifications[username] || {} });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

async function triggerWebhook(event, data) {
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        data,
      }),
    });
  } catch (error) {
    console.error(`⚠️ Gagal mengirim webhook ke ${receiver}`);
  }
}
