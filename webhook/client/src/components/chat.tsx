/** @format */

"use client";

import { useEffect, useState, useRef } from "react";

import UserList from "./userList";
import Room from "./room";

import { useNotification } from "@/utils/notificationProvider";

export default function Chat({ username }: { username: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any>({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [room, setRoom] = useState<string | null>(null);
  const [menu, setMenu] = useState<string>("userList");

  const roomRef = useRef(room);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  const { title, handler } = useNotification();
  // const data = useNotification();

  const registerUser = async () => {
    try {
      fetch("http://localhost:3232/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
        });
    } catch (e: any) {
      console.log(e);
    }
  };

  useEffect(() => {
    registerUser();
  }, []);

  useEffect(() => {
    if (menu === "userList") {
      setMessages([]);
    }
  }, [menu]);

  const joinRoom = async (selectedUser: string) => {
    const roomName = [username, selectedUser].sort().join("-");
    setRoom(roomName);

    fetch("http://localhost:3232/join-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room: roomName, username }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data.message);
      });
  };

  const sendMessage = async (e: any, payload: any) => {
    e.preventDefault();

    fetch("http://localhost:3232/chat-message", {
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

  // useEffect(() => {
  //   if ("Notification" in window && Notification.permission === "default") {
  //     Notification.requestPermission();
  //   }
  // }, []);

  // console.log(data);

  function updateHistory(room_code: string, messages: any[]) {
    if (roomRef.current === room_code) {
      setMessages(messages);
    }
  }

  useEffect(() => {
    const eventSource = new EventSource("/api/webhook");
    eventSource.onmessage = (e) => {
      const { event, data } = JSON.parse(e.data);

      if (event === "UPDATE_USERS") {
        setActiveUsers(Object.values(data));
      }

      if (event === "UPDATE_HISTORY") {
        const { room_code, messages } = data;

        updateHistory(room_code, messages);
      }

      console.log(event);
      console.log(data);
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
      <title>{title}</title>
      {menu === "userList" && (
        <UserList
          handlerMenu={setMenu}
          handlerJoin={joinRoom}
          activeUsers={activeUsers}
          username={username}
          notifications={notifications}
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
