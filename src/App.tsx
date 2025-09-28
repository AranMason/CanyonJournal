import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import type { User } from './types/types';
import { registerSetUser } from './utils/user';

export const UserContext = createContext<{ user: User | null; setUser: (u: User | null) => void; loading: boolean }>({ user: null, setUser: () => {}, loading: true });
export const useUser = () => useContext(UserContext);

interface AppProviderProps {
  children: ReactNode;
}

const App: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerSetUser(setUser);
    fetch('/api/user', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export default App;
