import React from 'react';
import './App.css';

const Login: React.FC = () => {
    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Log in with SSO</h2>
                <hr style={{ width: '100%', marginTop: 15, marginBottom: 20 }} />
                <form method="POST" action="/api/login" className="mb-0">
                    <div className='flex_column'>
                        <button id="Google" name="login_method" value="GoogleOAuth" className="card login_button google_button">
                            <span>Google OAuth</span>
                        </button>
                        <button id="Microsoft" name="login_method" value="MicrosoftOAuth" className="card login_button microsoft_button">
                            <span>Microsoft OAuth</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
