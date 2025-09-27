import React, { useEffect, useState } from 'react';

import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name: string } | null>(null);
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

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="App-layout">
      <aside className="Sidebar">
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
        {loading ? null : user ? (
          <div className="User-greeting">Welcome, {user.first_name}!</div>
        ) : (
          <button className="Login-button" onClick={handleLogin}>
            Login
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
