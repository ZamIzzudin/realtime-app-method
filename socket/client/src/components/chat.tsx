'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

import UserList from './userList';
import Room from './room';

import { useNotification } from '@/utils/notificationProvider';

const socket = io('http://localhost:3232');

export default function Chat({ username }: { username: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any>({});
  const [activeUsers, setActiveUsers] = useState([]);
  const [room, setRoom] = useState<string | null>(null);

  const [menu, setMenu] = useState<string>('userList');
  const { title, handler } = useNotification();
  const data = useNotification();

  useEffect(() => {
    socket.emit('set username', username);

    socket.on('active users', (users) => {
      setActiveUsers(users);
    });

    socket.on('chat message', (messages) => {
      setMessages(messages);
    });

    socket.on('recover message history', (messages) => {
      setMessages(messages);
    });

    socket.on('new message notification', (notifications) => {
      const userNotification = notifications[username];
      setNotifications(userNotification);

      if (Object.keys(userNotification).length !== 0) {
        handler('New Message');
      }
    });

    return () => {
      socket.off('active users');
      socket.off('chat message');
      socket.off('new message notification');
    };
  }, [username]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const joinRoom = (selectedUser: string) => {
    const newRoom = [username, selectedUser].sort().join('-');
    setRoom(newRoom);
    socket.emit('join room', { room: newRoom, username });
    setMessages([]);
  };

  function sendMessage(e: any, payload: any) {
    e.preventDefault();
    if (payload.message.trim()) {
      socket.emit('chat message', payload);
    }
  }

  console.log(data);

  return (
    <div className="w-full grow flex flex-col justify-end gap-5 my-4">
      <title>{title}</title>
      {menu === 'userList' && (
        <UserList
          handlerMenu={setMenu}
          handlerJoin={joinRoom}
          activeUsers={activeUsers}
          username={username}
          notifications={notifications}
        />
      )}
      {menu === 'room' && (
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
