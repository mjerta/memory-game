import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { GameBoard } from './game-board';
import { DEFAULT_CARDS } from '../../constants/card.constants';

describe('GameBoard', () => {
  let component: GameBoard;
  let fixture: ComponentFixture<GameBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameBoard],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(GameBoard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a pool of 30 items available', () => {
    expect(component.cardPool().length).toBe(30);
    expect(DEFAULT_CARDS.length).toBe(30);
  });

  it('should initialize with exactly 20 cards on the playing field', () => {
    expect(component.cards().length).toBe(20);
    const cardElements = fixture.nativeElement.querySelectorAll('.card');
    expect(cardElements.length).toBe(20);
  });

  it('should consist of 10 pairs (each pairId appears twice)', () => {
    const cards = component.cards();
    const pairCounts = new Map<number, number>();

    for (const card of cards) {
      pairCounts.set(card.pairId, (pairCounts.get(card.pairId) || 0) + 1);
    }

    expect(pairCounts.size).toBe(10);
    for (const count of pairCounts.values()) {
      expect(count).toBe(2);
    }
  });

  it('should render card image with SVG source', () => {
    const firstCard = component.cards()[0];
    const imageEl = fixture.nativeElement.querySelector('.card-image') as HTMLImageElement;
    expect(imageEl).toBeTruthy();
    expect(imageEl.src).toContain('.svg');
  });

  it('should flip card when clicked', () => {
    const firstCard = component.cards()[0];
    expect(firstCard.isFlipped).toBe(false);

    component.onCardClick(firstCard);
    fixture.detectChanges();

    const updatedCard = component.cards().find((c) => c.uid === firstCard.uid);
    expect(updatedCard?.isFlipped).toBe(true);
    expect(component.activeFlippedUids()).toContain(firstCard.uid);
  });

  it('should match two cards of the same pairId', () => {
    const cards = component.cards();
    const firstCard = cards[0];
    const matchingCard = cards.find(
      (c) => c.pairId === firstCard.pairId && c.uid !== firstCard.uid,
    )!;

    component.onCardClick(firstCard);
    component.onCardClick(matchingCard);
    fixture.detectChanges();

    expect(component.moves()).toBe(1);
    expect(component.matchedPairs()).toBe(1);

    const updatedFirst = component.cards().find((c) => c.uid === firstCard.uid);
    const updatedMatching = component.cards().find((c) => c.uid === matchingCard.uid);
    expect(updatedFirst?.isMatched).toBe(true);
    expect(updatedMatching?.isMatched).toBe(true);
  });

  it('should reset mismatched cards after delay', () => {
    vi.useFakeTimers();
    const cards = component.cards();
    const firstCard = cards[0];
    const nonMatchingCard = cards.find((c) => c.pairId !== firstCard.pairId)!;

    component.onCardClick(firstCard);
    component.onCardClick(nonMatchingCard);
    fixture.detectChanges();

    expect(component.isLocked()).toBe(true);

    vi.advanceTimersByTime(850);
    fixture.detectChanges();

    expect(component.isLocked()).toBe(false);
    const updatedFirst = component.cards().find((c) => c.uid === firstCard.uid);
    const updatedSecond = component.cards().find((c) => c.uid === nonMatchingCard.uid);
    expect(updatedFirst?.isFlipped).toBe(false);
    expect(updatedSecond?.isFlipped).toBe(false);
  });

  it('should toggle menu visibility when toggle button is clicked', () => {
    expect(component.isMenuOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.header-details')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.compact-stats')).toBeNull();

    component.toggleMenu();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(false);
    expect(fixture.nativeElement.querySelector('.header-details')).toBeNull();
    expect(fixture.nativeElement.querySelector('.compact-stats')).toBeTruthy();

    component.toggleMenu();
    fixture.detectChanges();

    expect(component.isMenuOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector('.header-details')).toBeTruthy();
  });

  it('should show victory banner when all cards are matched and reset board when play again is clicked', () => {
    expect(fixture.nativeElement.querySelector('app-victory-banner')).toBeNull();

    // Mark all cards as matched
    component.cards.update((cards) =>
      cards.map((c) => ({ ...c, isMatched: true, isFlipped: true })),
    );
    fixture.detectChanges();

    expect(component.isGameWon()).toBe(true);
    const victoryBanner = fixture.nativeElement.querySelector('app-victory-banner');
    expect(victoryBanner).toBeTruthy();
    expect(victoryBanner.textContent).toContain('Congratulations');

    // Click play again
    const playAgainBtn = fixture.nativeElement.querySelector(
      '.btn-play-again',
    ) as HTMLButtonElement;
    playAgainBtn.click();
    fixture.detectChanges();

    expect(component.isGameWon()).toBe(false);
    expect(fixture.nativeElement.querySelector('app-victory-banner')).toBeNull();
  });

  it('should flip card when clicking card button via app-game-card DOM element', () => {
    const cardButtons = fixture.nativeElement.querySelectorAll(
      '.card',
    ) as NodeListOf<HTMLButtonElement>;
    expect(cardButtons.length).toBe(20);

    cardButtons[0].click();
    fixture.detectChanges();

    const firstCardUid = component.cards()[0].uid;
    expect(component.activeFlippedUids()).toContain(firstCardUid);
  });

  it('should flip open card back when touching/clicking outside of the cards', () => {
    const firstCard = component.cards()[0];
    component.onCardClick(firstCard);
    fixture.detectChanges();

    expect(component.activeFlippedUids()).toContain(firstCard.uid);
    expect(component.cards().find((c) => c.uid === firstCard.uid)?.isFlipped).toBe(true);

    // Click outside on the playing field
    const playingField = fixture.nativeElement.querySelector('.playing-field') as HTMLElement;
    playingField.click();
    fixture.detectChanges();

    expect(component.activeFlippedUids().length).toBe(0);
    expect(component.cards().find((c) => c.uid === firstCard.uid)?.isFlipped).toBe(false);
  });

  it('should immediately dismiss mismatched cards and unlock board when clicking outside', () => {
    vi.useFakeTimers();
    const cards = component.cards();
    const firstCard = cards[0];
    const nonMatchingCard = cards.find((c) => c.pairId !== firstCard.pairId)!;

    component.onCardClick(firstCard);
    component.onCardClick(nonMatchingCard);
    fixture.detectChanges();

    expect(component.isLocked()).toBe(true);
    expect(component.activeFlippedUids().length).toBe(2);

    // Click outside on the game container
    const gameContainer = fixture.nativeElement.querySelector('.game-container') as HTMLElement;
    gameContainer.click();
    fixture.detectChanges();

    expect(component.isLocked()).toBe(false);
    expect(component.activeFlippedUids().length).toBe(0);
    expect(component.cards().find((c) => c.uid === firstCard.uid)?.isFlipped).toBe(false);
    expect(component.cards().find((c) => c.uid === nonMatchingCard.uid)?.isFlipped).toBe(false);
  });

  it('should flip card back when clicking on an opened card directly', () => {
    const firstCard = component.cards()[0];
    component.onCardClick(firstCard);
    fixture.detectChanges();

    expect(component.activeFlippedUids()).toContain(firstCard.uid);
    const openedCard = component.cards().find((c) => c.uid === firstCard.uid)!;
    expect(openedCard.isFlipped).toBe(true);

    // Click on the same opened card
    component.onCardClick(openedCard);
    fixture.detectChanges();

    expect(component.activeFlippedUids().length).toBe(0);
    const flippedBackCard = component.cards().find((c) => c.uid === firstCard.uid)!;
    expect(flippedBackCard.isFlipped).toBe(false);
    expect(component.moves()).toBe(0);
  });

  it('should flip card back when clicking the open card button via DOM', () => {
    const cardButtons = fixture.nativeElement.querySelectorAll(
      '.card',
    ) as NodeListOf<HTMLButtonElement>;
    const firstButton = cardButtons[0];
    const firstCardUid = component.cards()[0].uid;

    // Click to open
    firstButton.click();
    fixture.detectChanges();

    expect(component.activeFlippedUids()).toContain(firstCardUid);
    expect(component.cards().find((c) => c.uid === firstCardUid)?.isFlipped).toBe(true);

    // Click the opened card to flip back
    firstButton.click();
    fixture.detectChanges();

    expect(component.activeFlippedUids().length).toBe(0);
    expect(component.cards().find((c) => c.uid === firstCardUid)?.isFlipped).toBe(false);
  });
});
