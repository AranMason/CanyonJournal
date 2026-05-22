import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';

const CookieBanner: React.FC = () => {
    const { t } = useTranslation();
    return (
        <CookieConsent
            location="top"
            cookieName="handlines-cookie-consent"
            flipButtons
            enableDeclineButton
            buttonText={t('common:actions.accept')}
            declineButtonText={t('common:actions.decline')}
            onDecline={() => {
                window.location.href = '/logout';
            }}
            style={{
                background: '#25606e',
                color: '#ffffff',
                fontSize: '14px',
                alignItems: 'center',
                fontFamily: `'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
                zIndex: 1400,
            }}
            buttonStyle={{
                background: '#ff6b35',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '4px',
                padding: '8px 20px',
                cursor: 'pointer',
            }}
            declineButtonStyle={{
                background: 'transparent',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '4px',
                padding: '8px 20px',
                border: '1px solid #ffffff',
                cursor: 'pointer',
            }}
        >
            {t('cookie.message')}{' '}
            <a href="https://www.handlinne.co.uk/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#eebbc3' }}>
                {t('cookie.privacyPolicy')}
            </a>
            &#32;{t('cookie.declineWarning')}
        </CookieConsent>
    );
};

export default CookieBanner;
