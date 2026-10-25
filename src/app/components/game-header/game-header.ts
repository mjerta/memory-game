import { Component, input, output } from '@angular/core';
import { CardTheme, THEME_META } from '../../models/card.model';

@Component({
  selector: 'app-game-header',
  standalone: true,
  templateUrl: './game-header.html',
  styleUrl: './game-header.scss',
})
export class GameHeader {
  readonly isMenuOpen = input<boolean>(true);
  readonly moves = input<number>(0);
  readonly matchedPairs = input<number>(0);
  readonly totalPairs = input<number>(10);
  readonly cardsCount = input<number>(0);
  readonly cardPoolCount = input<number>(0);
  readonly theme = input<CardTheme>('default');

  readonly resetGame = output<void>();
  readonly toggleMenu = output<void>();
  readonly openTheme = output<void>();

  themeName(): string {
    return THEME_META.find((theme) => theme.id === this.theme())?.label ?? 'Default';
  }
}
