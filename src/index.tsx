import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import reportWebVitals from './reportWebVitals';
import RecordPage from './pages/RecordPage';
import App from './App';
import Gear from './pages/Gear';
import CanyonList from './pages/CanyonList';
import Login from './pages/LoginAuth0';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/gear" element={<Gear />} />
          <Route path="/canyons" element={<CanyonList />} />
          {/* <Route path="*" element={<h2>404: Page Not Found</h2>} /> */}
        </Routes>
      </BrowserRouter>
    </App>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
