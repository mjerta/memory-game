import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { CardService } from '../../services/card.service';
import { CardDefinition, PlayingCard } from '../../models/card.model';
import { DEFAULT_CARDS } from '../../constants/card.constants';
import { GameHeader } from '../game-header/game-header';
import { VictoryBanner } from '../victory-banner/victory-banner';
import { GameCard } from '../game-card/game-card';

export type { PlayingCard } from '../../models/card.model';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [GameHeader, VictoryBanner, GameCard],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss',
})
export class GameBoard implements OnInit {
  private readonly cardService = inject(CardService);

  /** Master catalog of available card definitions */
  readonly cardPool = signal<CardDefinition[]>(DEFAULT_CARDS);

  /** Target number of cards on current playing field */
  readonly targetCardCount = 20;

  /** Total pairs needed to complete current game */
  readonly totalPairs = this.targetCardCount / 2;

  /** Cards currently in play on the playing field */
  readonly cards = signal<PlayingCard[]>([]);

  /** Number of moves taken by player */
  readonly moves = signal<number>(0);

  /** UIDs of cards currently flipped in active turn */
  readonly activeFlippedUids = signal<string[]>([]);

  /** Lock board while 2 mismatched cards are animating face-down */
  readonly isLocked = signal<boolean>(false);

  /** Whether the top menu/header details are expanded */
  readonly isMenuOpen = signal<boolean>(true);

  /** Active timeout for resetting mismatched cards */
  private mismatchTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /** Computed number of matched pairs */
  readonly matchedPairs = computed(() => {
    return this.cards().filter((c) => c.isMatched).length / 2;
  });

  /** Whether the game has been won */
  readonly isGameWon = computed(() => {
    const list = this.cards();
    return list.length > 0 && list.every((c) => c.isMatched);
  });

  ngOnInit(): void {
    this.initializeBoard();
    this.cardService.getCards().subscribe({
      next: (pool) => {
        if (pool && pool.length > 0) {
          this.cardPool.set(pool);
          this.initializeBoard();
        }
      },
    });
  }

  /** Toggle menu visibility */
  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  /**
   * Initializes a playing field with 20 cards (10 matching pairs)
   * selected randomly from the master pool of items.
   */
  initializeBoard(): void {
    const pool = this.cardPool();
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const selectedItems = shuffledPool.slice(0, this.totalPairs);

    const cardList: PlayingCard[] = [];
    selectedItems.forEach((item) => {
      cardList.push({
        uid: `card-${item.id}-a`,
        pairId: item.id,
        name: item.name,
        category: item.category,
        image: item.image,
        isFlipped: false,
        isMatched: false,
      });
      cardList.push({
        uid: `card-${item.id}-b`,
        pairId: item.id,
        name: item.name,
        category: item.category,
        image: item.image,
        isFlipped: false,
        isMatched: false,
      });
    });

    cardList.sort(() => Math.random() - 0.5);

    if (this.mismatchTimeoutId) {
      clearTimeout(this.mismatchTimeoutId);
      this.mismatchTimeoutId = null;
    }

    this.cards.set(cardList);
    this.moves.set(0);
    this.activeFlippedUids.set([]);
    this.isLocked.set(false);
  }

  /**
   * Flips back open unmatched cards when user touches/clicks outside of the card.
   */
  flipBackActiveCards(): void {
    if (this.isLocked()) {
      if (this.mismatchTimeoutId) {
        clearTimeout(this.mismatchTimeoutId);
        this.mismatchTimeoutId = null;
      }
      const activeUids = this.activeFlippedUids();
      if (activeUids.length > 0) {
        this.cards.update((list) =>
          list.map((c) =>
            activeUids.includes(c.uid) ? { ...c, isFlipped: false } : c,
          ),
        );
        this.activeFlippedUids.set([]);
      }
      this.isLocked.set(false);
      return;
    }

    if (this.activeFlippedUids().length === 1) {
      const [openUid] = this.activeFlippedUids();
      this.cards.update((list) =>
        list.map((c) => (c.uid === openUid ? { ...c, isFlipped: false } : c)),
      );
      this.activeFlippedUids.set([]);
    }
  }

  /**
   * Handles click/touch on the board background or playing field outside any card.
   */
  onOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (
      target.closest('.card') ||
      target.closest('app-game-card') ||
      target.closest('.header-actions')
    ) {
      return;
    }

    this.flipBackActiveCards();
  }

  /**
   * Global listener to ensure clicking/touching outside any card flips open cards back.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (
      target.closest('.card') ||
      target.closest('app-game-card') ||
      target.closest('.header-actions')
    ) {
      return;
    }

    this.flipBackActiveCards();
  }

  /**
   * Handles user click on a card
   */
  onCardClick(card: PlayingCard): void {
    if (this.isLocked() || card.isMatched) {
      return;
    }

    // If clicking a card that is already opened, flip it back face-down
    if (card.isFlipped) {
      this.cards.update((list) =>
        list.map((c) => (c.uid === card.uid ? { ...c, isFlipped: false } : c)),
      );
      this.activeFlippedUids.update((uids) => uids.filter((id) => id !== card.uid));
      return;
    }

    const currentFlipped = [...this.activeFlippedUids(), card.uid];

    this.cards.update((list) =>
      list.map((c) => (c.uid === card.uid ? { ...c, isFlipped: true } : c)),
    );
    this.activeFlippedUids.set(currentFlipped);

    if (currentFlipped.length === 2) {
      this.moves.update((m) => m + 1);
      const [firstUid, secondUid] = currentFlipped;
      const allCards = this.cards();
      const firstCard = allCards.find((c) => c.uid === firstUid);
      const secondCard = allCards.find((c) => c.uid === secondUid);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        this.cards.update((list) =>
          list.map((c) =>
            c.uid === firstUid || c.uid === secondUid ? { ...c, isMatched: true } : c,
          ),
        );
        this.activeFlippedUids.set([]);
      } else {
        this.isLocked.set(true);
        this.mismatchTimeoutId = setTimeout(() => {
          this.cards.update((list) =>
            list.map((c) =>
              c.uid === firstUid || c.uid === secondUid ? { ...c, isFlipped: false } : c,
            ),
          );
          this.activeFlippedUids.set([]);
          this.isLocked.set(false);
          this.mismatchTimeoutId = null;
        }, 800);
      }
    }
  }
}
