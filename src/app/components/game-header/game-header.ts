import { Component, input, output } from '@angular/core';

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

  readonly resetGame = output<void>();
  readonly toggleMenu = output<void>();
}
