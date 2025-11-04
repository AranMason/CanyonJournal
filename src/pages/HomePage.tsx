import React, { useEffect } from 'react';
import { useUser } from '../App';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const HomePage: React.FC = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); // Redirect to Dashboard (home page)
    } else if(!loading && !user) {
      // If not logged in, redirect to login with Auth0
      window.location.href = '/api/login'
    }
  }, [user, loading, navigate]);

  return (
    <Loader isLoading={loading}>
      <div>You will be redirected soon</div>
    </Loader>
  );
};

export default HomePage;
