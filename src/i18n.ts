import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enRegions from './locales/en/regions.json';
import enEnums from './locales/en/enums.json';
import enTranslation from './locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation', 'common', 'regions', 'enums'],
    resources: {
      en: {
        translation: enTranslation,
        common: enCommon,
        regions: enRegions,
        enums: enEnums,
      },
    },
    interpolation: {
      escapeValue: false, // React handles XSS escaping
    },
  });

export default i18n;
