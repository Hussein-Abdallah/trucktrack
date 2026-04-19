import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import en from './locales/en.json';
import fr from './locales/fr.json';

export type AppLanguage = 'en' | 'fr';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'fr'];

const getDeviceLanguage = (): AppLanguage => {
  const deviceLocale = getLocales()[0]?.languageCode;
  return SUPPORTED_LANGUAGES.includes(deviceLocale as AppLanguage)
    ? (deviceLocale as AppLanguage)
    : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export default i18n;
