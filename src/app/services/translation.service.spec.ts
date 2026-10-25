import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.setItem('memory-game-language', 'en');
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => localStorage.removeItem('memory-game-language'));

  it('translates interface strings and interpolates values', () => {
    service.setLanguage('nl');
    expect(service.t('app.title')).toBe('Memoryspel');
    expect(service.t('victory.message', { moves: 7 })).toContain('7 zetten');
  });

  it('translates card names by id and uses the source name in English', () => {
    expect(service.cardName(1, 'Rocket')).toBe('Rocket');
    service.setLanguage('fr');
    expect(service.cardName(1, 'Rocket')).toBe('Fusée');
  });

  it('persists a selected language', () => {
    service.setLanguage('es');
    expect(localStorage.getItem('memory-game-language')).toBe('es');
    expect(service.language()).toBe('es');
  });

  it('supports Tagalog interface text and card names', () => {
    service.setLanguage('tl');
    expect(service.t('app.title')).toBe('Laro ng Memorya');
    expect(service.cardName(43, 'Apple')).toBe('Mansanas');
    expect(service.languageName('tl')).toBe('Tagalog');
  });
});
