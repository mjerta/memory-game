import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CardService } from './card.service';
import { CardDefinition } from '../models/card.model';
import { ANIMAL_CARDS, DEFAULT_CARDS, FRUIT_CARDS } from '../constants/card.constants';

describe('CardService', () => {
  let service: CardService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch card catalog from cards/cards.json', () => {
    const mockData: CardDefinition[] = [
      { id: 1, name: 'Rocket', category: 'space', image: 'cards/svg/rocket.svg' },
    ];

    service.getCards().subscribe((cards) => {
      expect(cards.length).toBe(1);
      expect(cards[0].name).toBe('Rocket');
    });

    const req = httpTesting.expectOne('cards/cards.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should fallback to default cards if request fails', () => {
    service.getCards().subscribe((cards) => {
      expect(cards.length).toBe(DEFAULT_CARDS.length);
    });

    const req = httpTesting.expectOne('cards/cards.json');
    req.error(new ProgressEvent('Network error'));
  });

  it('should return only cards for the selected theme', () => {
    const catalog: CardDefinition[] = [
      { id: 1, name: 'Rocket', image: 'rocket.svg' },
      { id: 31, name: 'Cat', image: 'cat.svg', theme: 'animals' },
      { id: 43, name: 'Apple', image: 'apple.svg', theme: 'fruits' },
    ];

    service.getCards('animals').subscribe((cards) => {
      expect(cards.map((card) => card.name)).toEqual(['Cat']);
    });

    httpTesting.expectOne('cards/cards.json').flush(catalog);
  });

  it('should use the matching fallback pool if the catalog request fails', () => {
    service.getCards('fruits').subscribe((cards) => {
      expect(cards).toEqual(FRUIT_CARDS);
      expect(cards.length).toBeGreaterThan(10);
    });

    httpTesting.expectOne('cards/cards.json').error(new ProgressEvent('Network error'));
  });

  it('should use the animal fallback pool when the catalog request fails', () => {
    service.getCards('animals').subscribe((cards) => {
      expect(cards).toEqual(ANIMAL_CARDS);
    });

    httpTesting.expectOne('cards/cards.json').error(new ProgressEvent('Network error'));
  });
});
