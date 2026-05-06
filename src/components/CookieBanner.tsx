import React from 'react';
import CookieConsent from 'react-cookie-consent';

const CookieBanner: React.FC = () => {
    return (
        <CookieConsent
            location="top"
            cookieName="canyonjournal-cookie-consent"
            enableDeclineButton
            buttonText="Accept"
            declineButtonText="Decline"
            onDecline={() => {
                window.location.href = '/logout';
            }}
            style={{
                background: '#232946',
                color: '#ffffff',
                fontSize: '14px',
                alignItems: 'center',
                fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
            }}
            buttonStyle={{
                background: '#eebbc3',
                color: '#232946',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '4px',
                padding: '8px 20px',
                cursor: 'pointer',
            }}
            declineButtonStyle={{
                background: 'transparent',
                color: '#eebbc3',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '4px',
                padding: '8px 20px',
                border: '1px solid #eebbc3',
                cursor: 'pointer',
            }}
        >
            Canyon Journal uses essential cookies to keep you logged in.
            By continuing, you agree to our{' '}
            <a href="https://canyonjournal.co.uk/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#eebbc3' }}>
                Privacy Policy
            </a>
            . If you decline, you will be logged out.
        </CookieConsent>
    );
};

export default CookieBanner;
