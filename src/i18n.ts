import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enRegions from './locales/en/regions.json';
import enRegionsLegacy from './locales/en/regions-legacy.json';
import enEnums from './locales/en/enums.json';
import enTranslation from './locales/en/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns: ['translation', 'common', 'regions', 'regions-legacy', 'enums'],
    resources: {
      en: {
        translation: enTranslation,
        common: enCommon,
        regions: enRegions,
        'regions-legacy': enRegionsLegacy, // For backward compatibility with old region keys
        enums: enEnums,
      },
    },
    interpolation: {
      escapeValue: false, // React handles XSS escaping
    },
  });

export default i18n;
