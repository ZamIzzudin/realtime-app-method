'use client';

import { useState } from 'react';

import { IoMdPersonAdd } from 'react-icons/io';

export default function Register({ handler }: any) {
  const [username, setUsername] = useState('');

  return (
    <div className="grow w-full flex flex-col items-center justify-center gap-5">
      <h1 className="text-xl">Welcome Newcomers</h1>
      <div className="w-full gap-2 flex">
        <input
          type="text"
          placeholder="Enter Your Username"
          className="grow rounded-full px-5"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          className="bg-orange-500 rounded-full h-[50px] w-[50px] text-white flex text-[24px] justify-center items-center"
          onClick={() => handler(username)}
        >
          <IoMdPersonAdd />
        </button>
      </div>
    </div>
  );
}
