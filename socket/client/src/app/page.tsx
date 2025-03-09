/** @format */

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { NotificationWrapper } from "@/utils/notificationProvider";

const Register = dynamic(() => import("@/components/register"));
const Chat = dynamic(() => import("@/components/chat"));

export default function Home() {
  const [username, setUsername] = useState("");

  const handleRegister = (username: string) => {
    if (username.trim()) {
      setUsername(username);
    }
  };

  return (
    <NotificationWrapper>
      <main className="w-full min-h-[100dvh] flex justify-center items-center bg-">
        <div className="container min-h-[100dvh] min-w-[450px] w-[30%] bg-gray-300 flex flex-col items-center justify-between p-5">
          <div className="flex w-full justify-between">
            <h1 className="bg-gray-400 px-2 rounded-full">Whook</h1>
            <h1>{username}</h1>
          </div>
          {!username ? (
            <Register handler={handleRegister} />
          ) : (
            <Chat username={username} />
          )}
        </div>
      </main>
    </NotificationWrapper>
  );
}
