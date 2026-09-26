import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { CardDefinition } from '../models/card.model';
import { DEFAULT_CARDS } from '../constants/card.constants';

export type { CardDefinition } from '../models/card.model';
export { DEFAULT_CARDS } from '../constants/card.constants';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private readonly http = inject(HttpClient);

  getCards(): Observable<CardDefinition[]> {
    return this.http
      .get<CardDefinition[]>('cards/cards.json')
      .pipe(catchError(() => of(DEFAULT_CARDS)));
  }
}

