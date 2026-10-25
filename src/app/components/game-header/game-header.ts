import { Component, input, output } from '@angular/core';
import { CardTheme, THEME_META } from '../../models/card.model';
import { Language } from '../../i18n/languages';
import { TranslationService } from '../../services/translation.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-game-header',
  standalone: true,
  templateUrl: './game-header.html',
  styleUrl: './game-header.scss',
})
export class GameHeader {
  readonly translations = inject(TranslationService);
  readonly isMenuOpen = input<boolean>(true);
  readonly moves = input<number>(0);
  readonly matchedPairs = input<number>(0);
  readonly totalPairs = input<number>(10);
  readonly cardsCount = input<number>(0);
  readonly cardPoolCount = input<number>(0);
  readonly theme = input<CardTheme>('default');
  readonly language = input<Language>('en');
  readonly soundEnabled = input<boolean>(true);

  readonly resetGame = output<void>();
  readonly toggleMenu = output<void>();
  readonly openTheme = output<void>();
  readonly openLanguage = output<void>();
  readonly toggleSound = output<void>();

  themeName(): string {
    const id = THEME_META.find((theme) => theme.id === this.theme())?.id ?? 'default';
    return this.translations.t(`theme.${id}`);
  }

  languageName(): string { return this.translations.languageName(this.language()); }
}
