import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { CardDefinition, CardTheme } from '../models/card.model';
import { ANIMAL_CARDS, DEFAULT_CARDS, FRUIT_CARDS } from '../constants/card.constants';

export type { CardDefinition } from '../models/card.model';
export { DEFAULT_CARDS } from '../constants/card.constants';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private readonly http = inject(HttpClient);

  getCards(theme: CardTheme = 'default'): Observable<CardDefinition[]> {
    return this.http.get<CardDefinition[]>('cards/cards.json').pipe(
      map((cards) => cards.filter((c) => (c.theme ?? 'default') === theme)),
      catchError(() => of(this.fallbackFor(theme))),
    );
  }

  private fallbackFor(theme: CardTheme): CardDefinition[] {
    switch (theme) {
      case 'animals':
        return ANIMAL_CARDS;
      case 'fruits':
        return FRUIT_CARDS;
      default:
        return DEFAULT_CARDS;
    }
  }
}
