import { Component, inject, input, output, signal } from '@angular/core';
import { CardTheme, PlayingCard } from '../../models/card.model';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-game-card',
  standalone: true,
  templateUrl: './game-card.html',
  styleUrl: './game-card.scss',
})
export class GameCard {
  readonly translations = inject(TranslationService);
  readonly card = input.required<PlayingCard>();
  readonly disabled = input<boolean>(false);
  readonly showCardName = input<boolean>(true);
  readonly theme = input<CardTheme>('default');

  readonly cardClick = output<PlayingCard>();

  readonly flipDirection = signal<'left' | 'right'>('right');

  cardName(): string { return this.translations.cardName(this.card().pairId, this.card().name); }

  private updateDirection(event: MouseEvent | PointerEvent): void {
    const isSyntheticKeyboardClick =
      event.detail === 0 && event.clientX === 0 && event.clientY === 0;
    if (isSyntheticKeyboardClick) {
      return;
    }

    const el = (event.currentTarget ?? event.target) as HTMLElement | null;
    const button = (el?.closest?.('.card') as HTMLElement | null) ?? el;
    if (button) {
      const rect = button.getBoundingClientRect();
      if (rect.width > 0) {
        const clickX = event.clientX - rect.left;
        this.flipDirection.set(clickX < rect.width / 2 ? 'left' : 'right');
      }
    }
  }

  onPointerDown(event: PointerEvent): void {
    if (this.disabled() || this.card().isMatched || this.card().isFlipped) {
      return;
    }
    this.updateDirection(event);
  }

  onSelect(event?: MouseEvent): void {
    if (this.disabled() || this.card().isMatched) {
      return;
    }

    // Only pick a direction when opening. Re-picking it while the card is already
    // flipped would swap rotateY(180deg) for rotateY(-180deg) mid-state, which CSS
    // interpolates as a full 360deg spin instead of a 180deg flip back.
    if (event && !this.card().isFlipped) {
      this.updateDirection(event);
    }

    this.cardClick.emit(this.card());
  }
}
