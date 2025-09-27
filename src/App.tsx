import React from 'react';

import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

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
        <button className="Login-button" onClick={handleLogin}>
          Login
        </button>
      </main>
    </div>
  );
}

export default App;
