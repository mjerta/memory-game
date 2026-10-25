export type Language = 'en' | 'nl' | 'de' | 'fr' | 'es' | 'tl';

export interface LanguageMeta {
  id: Language;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { id: 'en', nativeName: 'English', flag: '🇬🇧' },
  { id: 'nl', nativeName: 'Nederlands', flag: '🇳🇱' },
  { id: 'de', nativeName: 'Deutsch', flag: '🇩🇪' },
  { id: 'fr', nativeName: 'Français', flag: '🇫🇷' },
  { id: 'es', nativeName: 'Español', flag: '🇪🇸' },
  { id: 'tl', nativeName: 'Tagalog', flag: '🇵🇭' },
];

export function isLanguage(value: string | null): value is Language {
  return value === 'en' || value === 'nl' || value === 'de' || value === 'fr' || value === 'es' || value === 'tl';
}
