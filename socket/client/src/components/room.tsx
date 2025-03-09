'use client';

import { useState } from 'react';

import { IoIosSend, IoIosArrowRoundBack } from 'react-icons/io';

export default function Room({
  handlerSend,
  handlerMenu,
  messages,
  username,
  room,
}: any) {
  const [message, setMessage] = useState<string>('');

  const roomName = room
    .split('-')
    .filter((each: string) => each !== username)[0];

  return (
    <div className="w-full grow flex flex-col justify-between gap-5 bg-gray-200">
      <div className="flex justify-between px-4 py-3 bg-white">
        <div className="flex gap-3 items-center">
          <div className="bg-orange-400 h-[30px] w-[30px] flex items-center justify-center rounded-full text-white">
            {roomName[0]}
          </div>
          <span>{roomName}</span>
        </div>
        <button
          onClick={() => handlerMenu('userList')}
          className="rounded p-2 flex text-[18px] justify-center items-center"
        >
          <IoIosArrowRoundBack />
        </button>
      </div>
      <div className="p-3">
        {/* <pre>{JSON.stringify(messages, undefined, 2)}</pre> */}
        <div className="h-fit flex flex-col gap-3 pb-4">
          {messages.map((msg: any, index: number) => (
            <div
              className={`flex ${
                msg.sender === username ? 'justify-end' : 'justify-start'
              }`}
              key={index}
            >
              <span className="bg-white p-3 block w-fit rounded">
                {msg.value}
              </span>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            handlerSend(e, { message, room, sender: username });
            setMessage('');
          }}
          className="w-full flex justify-between gap-2"
        >
          <input
            className="grow rounded-full px-5"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-orange-500 rounded-full h-[50px] w-[50px] text-white flex text-[24px] justify-center items-center"
          >
            <IoIosSend />
          </button>
        </form>
      </div>
    </div>
  );
}
