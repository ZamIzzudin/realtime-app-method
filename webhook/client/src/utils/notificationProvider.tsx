'use client';

import { createContext, useContext, useState } from 'react';

const NotificationContext = createContext<any>({});

export function NotificationWrapper({ children }: { children: any }) {
  const [title, setTitle] = useState<string>('Whook');

  function handler(newTitle: string) {
    setTitle(newTitle);
  }

  return (
    <NotificationContext value={{ title, handler }}>
      {children}
    </NotificationContext>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  return context;
}
