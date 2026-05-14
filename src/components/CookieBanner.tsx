import React from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';

const CookieBanner: React.FC = () => {
    const { t } = useTranslation();
    return (
        <CookieConsent
            location="top"
            cookieName="canyonjournal-cookie-consent"
            enableDeclineButton
            buttonText={t('common:actions.accept')}
            declineButtonText={t('common:actions.decline')}
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
            {t('cookie.message')}{' '}
            <a href="https://canyonjournal.co.uk/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: '#eebbc3' }}>
                {t('cookie.privacyPolicy')}
            </a>
            &#32;{t('cookie.declineWarning')}
        </CookieConsent>
    );
};

export default CookieBanner;
