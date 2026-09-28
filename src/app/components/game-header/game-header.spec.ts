import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHeader } from './game-header';

describe('GameHeader', () => {
  let component: GameHeader;
  let fixture: ComponentFixture<GameHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(GameHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display title and subtitle when menu is open', () => {
    const title = fixture.nativeElement.querySelector('h1');
    const subtitle = fixture.nativeElement.querySelector('.subtitle');
    expect(title?.textContent).toContain('Memory Game');
    expect(subtitle?.textContent).toContain('Match all pairs to win');
  });

  it('should display detailed stats bar when menu is open', () => {
    fixture.componentRef.setInput('moves', 5);
    fixture.componentRef.setInput('matchedPairs', 3);
    fixture.componentRef.setInput('totalPairs', 10);
    fixture.componentRef.setInput('cardsCount', 20);
    fixture.componentRef.setInput('cardPoolCount', 30);
    fixture.detectChanges();

    const headerDetails = fixture.nativeElement.querySelector('.header-details');
    expect(headerDetails).toBeTruthy();
    expect(headerDetails.textContent).toContain('20');
    expect(headerDetails.textContent).toContain('5');
    expect(headerDetails.textContent).toContain('3 / 10');
    expect(headerDetails.textContent).toContain('30 items');
  });

  it('should display compact stats and hide details when menu is closed', () => {
    fixture.componentRef.setInput('isMenuOpen', false);
    fixture.componentRef.setInput('moves', 8);
    fixture.componentRef.setInput('matchedPairs', 4);
    fixture.componentRef.setInput('totalPairs', 10);
    fixture.detectChanges();

    const compactStats = fixture.nativeElement.querySelector('.compact-stats');
    const headerDetails = fixture.nativeElement.querySelector('.header-details');
    const subtitle = fixture.nativeElement.querySelector('.subtitle');

    expect(compactStats).toBeTruthy();
    expect(compactStats.textContent).toContain('Moves: 8');
    expect(compactStats.textContent).toContain('Pairs: 4/10');
    expect(headerDetails).toBeNull();
    expect(subtitle).toBeNull();
  });

  it('should emit resetGame when reset button is clicked', () => {
    let resetEmitted = false;
    component.resetGame.subscribe(() => {
      resetEmitted = true;
    });

    const resetBtn = fixture.nativeElement.querySelector('.btn-restart') as HTMLButtonElement;
    resetBtn.click();

    expect(resetEmitted).toBe(true);
  });

  it('should emit toggleMenu when toggle button is clicked', () => {
    let toggleEmitted = false;
    component.toggleMenu.subscribe(() => {
      toggleEmitted = true;
    });

    const toggleBtn = fixture.nativeElement.querySelector('.btn-toggle') as HTMLButtonElement;
    toggleBtn.click();

    expect(toggleEmitted).toBe(true);
  });
});
