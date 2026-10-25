import { Injectable, signal } from '@angular/core';
import { Language, isLanguage } from '../i18n/languages';
import { CARD_NAMES, dictionaries, TranslationKey } from '../i18n/translations';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private static readonly STORAGE_KEY = 'memory-game-language';
  readonly language = signal<Language>(this.initialLanguage());

  t(key: TranslationKey, params: Record<string, string | number> = {}): string {
    let value = dictionaries[this.language()][key];
    for (const [name, replacement] of Object.entries(params)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  }

  languageName(language: Language): string {
    return ({ en: 'English', nl: 'Nederlands', de: 'Deutsch', fr: 'Français', es: 'Español', tl: 'Tagalog' })[language];
  }

  cardName(id: number, fallback: string): string {
    const language = this.language();
    return language === 'en' ? fallback : CARD_NAMES[language][id] ?? fallback;
  }

  setLanguage(language: Language): void {
    this.language.set(language);
    try { localStorage.setItem(TranslationService.STORAGE_KEY, language); } catch { /* Storage is optional. */ }
  }

  private initialLanguage(): Language {
    try {
      const saved = localStorage.getItem(TranslationService.STORAGE_KEY);
      if (isLanguage(saved)) return saved;
    } catch { /* Storage may be unavailable. */ }
    if (typeof navigator !== 'undefined') {
      const browserLanguage = navigator.language?.split('-')[0]?.toLowerCase() ?? '';
      if (isLanguage(browserLanguage)) return browserLanguage;
    }
    return 'en';
  }
}
