/** @format */

"use client";

import { useEffect, useState, useRef } from "react";

import UserList from "./userList";
import Room from "./room";

export default function Chat({ username }: { username: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [room, setRoom] = useState<string | null>(null);
  const [menu, setMenu] = useState<string>("userList");

  const roomRef = useRef(room);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const registerUser = async () => {
    try {
      fetch("http://localhost:3232/user/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          port: "http://localhost:3000/api/webhook",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setActiveUsers(data.user_active);
        });
    } catch (e: any) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (username) {
      registerUser();
    }
  }, [username]);

  useEffect(() => {
    if (menu === "userList") {
      setMessages([]);
    }
  }, [menu]);

  const joinRoom = async (selectedUser: string) => {
    const roomName = [username, selectedUser].sort().join("-");
    setRoom(roomName);

    fetch("http://localhost:3232/message/join-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: roomName }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages);
      });
  };

  const sendMessage = async (e: any, payload: any) => {
    e.preventDefault();

    fetch("http://localhost:3232/message/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room,
        message: payload.message,
        sender: username,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.messages);
      });
  };

  function updateHistory(room_code: string, messages: any[]) {
    console.log(roomRef.current, room_code);
    console.log(messages);
    if (roomRef.current === room_code) {
      setMessages(messages);
    }
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/webhook");
    eventSource.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);

      if (event === "UPDATE_USERS") {
        const { user_active } = data;

        setActiveUsers(user_active);
      }

      if (event === "UPDATE_HISTORY") {
        const { room_code, messages } = data;

        updateHistory(room_code, messages);
      }
    };

    eventSource.onerror = () => {
      console.error("EventSource error, reconnecting...");
      eventSource.close();
      setTimeout(() => new EventSource("/api/webhook"), 3000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="w-full grow flex flex-col justify-end gap-5 my-4">
      {menu === "userList" && (
        <UserList
          handlerMenu={setMenu}
          handlerJoin={joinRoom}
          activeUsers={activeUsers}
          username={username}
          notifications={[]}
        />
      )}
      {menu === "room" && (
        <Room
          handlerMenu={setMenu}
          handlerSend={sendMessage}
          messages={messages}
          username={username}
          room={room}
        />
      )}
    </div>
  );
}
