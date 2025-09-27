import React from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';


import type { User } from '../types';

interface LoginButtonProps {
  className?: string;
  user?: User | null;
  loading?: boolean;
}


const LoginButton: React.FC<LoginButtonProps> = ({ className, user, loading }) => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate('/login');
  };

  if (loading) return null;

  if (user) {
    return (
      <div className="Sidebar-user">
        {user.profile.raw_attributes.picture ? (
          <img
            src={user.profile.raw_attributes.picture}
            alt="Profile"
            className="Sidebar-user-pic"
          />
        ) : (
          <div className="Sidebar-user-pic Sidebar-user-initial">
            {user.first_name.charAt(0)}
          </div>
        )}
        <span className="Sidebar-user-name">Welcome {user.first_name}</span>
      </div>
    );
  }

  return (
    <button className={className ? className : 'Login-button'} onClick={handleLogin}>
      Login
    </button>
  );
};

export default LoginButton;
