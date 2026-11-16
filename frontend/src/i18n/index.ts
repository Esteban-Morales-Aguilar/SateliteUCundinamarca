import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './es.json';
import en from './en.json';

const KEY = 'spacenet-lang';
const saved = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();

void i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: saved === 'en' ? 'en' : 'es',
  fallbackLng: 'es',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try { localStorage.setItem(KEY, lng); } catch { /* modo privado */ }
});
document.documentElement.lang = i18n.language;

export default i18n;
