
import type { User } from '../types';
import '../App.css';
import LoginButton from '../components/LoginButton';
import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="App-layout">
      <aside className="Sidebar">
        <div className="Sidebar-top">
          <LoginButton className="Login-button Sidebar-login-btn" user={user} loading={loading} />
        </div>
        <nav>
          <ul>
            <li>Home</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
      </aside>
      <main className="Main-content">
        <h1 className="App-title">Canyon Journal</h1>
      </main>
    </div>
  );
}

export default App;
