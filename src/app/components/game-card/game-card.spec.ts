import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCard } from './game-card';
import { PlayingCard } from '../../models/card.model';

describe('GameCard', () => {
  let component: GameCard;
  let fixture: ComponentFixture<GameCard>;

  const mockCard: PlayingCard = {
    uid: 'card-1-a',
    pairId: 1,
    name: 'Rocket',
    category: 'space',
    image: 'cards/svg/rocket.svg',
    isFlipped: false,
    isMatched: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GameCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('card', mockCard);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render card details and image', () => {
    const img = fixture.nativeElement.querySelector('.card-image') as HTMLImageElement;
    const name = fixture.nativeElement.querySelector('.card-name');
    expect(img.src).toContain('cards/svg/rocket.svg');
    expect(img.alt).toBe('Rocket');
    expect(name?.textContent).toBe('Rocket');
  });

  it('should have hidden aria-label when not flipped or matched', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Hidden card');
  });

  it('should have card name as aria-label and flipped class when flipped', () => {
    fixture.componentRef.setInput('card', { ...mockCard, isFlipped: true });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Rocket');
    expect(button.classList.contains('flipped')).toBe(true);
  });

  it('should apply matched class and disable button when matched', () => {
    fixture.componentRef.setInput('card', { ...mockCard, isMatched: true });
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('matched')).toBe(true);
    expect(button.disabled).toBe(true);
  });

  it('should disable button when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBe(true);
  });

  it('should emit cardClick when clicked on an eligible card', () => {
    let clickedCard: PlayingCard | undefined;
    component.cardClick.subscribe((card) => {
      clickedCard = card;
    });

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(clickedCard).toEqual(mockCard);
  });

  it('should not emit cardClick when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let clicked = false;
    component.cardClick.subscribe(() => {
      clicked = true;
    });

    component.onSelect();
    expect(clicked).toBe(false);
  });

  it('should emit cardClick when already flipped so it can be flipped back', () => {
    fixture.componentRef.setInput('card', { ...mockCard, isFlipped: true });
    fixture.detectChanges();

    let clicked = false;
    component.cardClick.subscribe(() => {
      clicked = true;
    });

    component.onSelect();
    expect(clicked).toBe(true);
  });

  it('should not emit cardClick when matched', () => {
    fixture.componentRef.setInput('card', { ...mockCard, isMatched: true });
    fixture.detectChanges();

    let clicked = false;
    component.cardClick.subscribe(() => {
      clicked = true;
    });

    component.onSelect();
    expect(clicked).toBe(false);
  });

  it('should set flip direction to left and add flip-left class when pressed on left side', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      width: 100,
      top: 0,
      right: 200,
      bottom: 100,
      height: 100,
      x: 100,
      y: 0,
      toJSON: () => {},
    });

    button.dispatchEvent(new MouseEvent('click', { clientX: 120, detail: 1, bubbles: true }));
    fixture.detectChanges();

    expect(component.flipDirection()).toBe('left');
    expect(button.classList.contains('flip-left')).toBe(true);
    expect(button.classList.contains('flip-right')).toBe(false);
  });

  it('should set flip direction to right and add flip-right class when pressed on right side', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      width: 100,
      top: 0,
      right: 200,
      bottom: 100,
      height: 100,
      x: 100,
      y: 0,
      toJSON: () => {},
    });

    button.dispatchEvent(new MouseEvent('click', { clientX: 180, detail: 1, bubbles: true }));
    fixture.detectChanges();

    expect(component.flipDirection()).toBe('right');
    expect(button.classList.contains('flip-right')).toBe(true);
    expect(button.classList.contains('flip-left')).toBe(false);
  });

  it('should update flip direction on pointerdown on left side', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    button.dispatchEvent(new PointerEvent('pointerdown', { clientX: 20, detail: 1, bubbles: true }));
    fixture.detectChanges();

    expect(component.flipDirection()).toBe('left');
    expect(button.classList.contains('flip-left')).toBe(true);
  });

  it('should not change flip direction on pointerdown when disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    component.flipDirection.set('right');
    button.dispatchEvent(new PointerEvent('pointerdown', { clientX: 20, detail: 1, bubbles: true }));
    expect(component.flipDirection()).toBe('right');
  });

  it('should keep the flip direction when clicking the other side of an opened card', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Open the card from the right side
    button.dispatchEvent(new MouseEvent('click', { clientX: 80, detail: 1, bubbles: true }));
    fixture.detectChanges();
    expect(component.flipDirection()).toBe('right');

    // Now flip it back from the left side
    fixture.componentRef.setInput('card', { ...mockCard, isFlipped: true });
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent('click', { clientX: 20, detail: 1, bubbles: true }));
    fixture.detectChanges();

    // Direction must stay put, otherwise rotateY(180deg) -> rotateY(-180deg) mid-state
    // makes the card spin a full 360deg before it settles
    expect(component.flipDirection()).toBe('right');
  });

  it('should keep a left flip direction when clicking the right side of an opened card', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      width: 100,
      top: 0,
      right: 100,
      bottom: 100,
      height: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Open the card from the left side
    button.dispatchEvent(new MouseEvent('click', { clientX: 20, detail: 1, bubbles: true }));
    fixture.detectChanges();
    expect(component.flipDirection()).toBe('left');

    // Now flip it back from the right side
    fixture.componentRef.setInput('card', { ...mockCard, isFlipped: true });
    fixture.detectChanges();
    button.dispatchEvent(new MouseEvent('click', { clientX: 80, detail: 1, bubbles: true }));
    fixture.detectChanges();

    expect(component.flipDirection()).toBe('left');
  });
});
