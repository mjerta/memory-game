import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VictoryBanner } from './victory-banner';

describe('VictoryBanner', () => {
  let component: VictoryBanner;
  let fixture: ComponentFixture<VictoryBanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VictoryBanner],
    }).compileComponents();

    fixture = TestBed.createComponent(VictoryBanner);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('moves', 12);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the number of moves in the victory message', () => {
    const heading = fixture.nativeElement.querySelector('h2');
    expect(heading?.textContent).toContain('You won in 12 moves!');
  });

  it('should emit playAgain when the Play Again button is clicked', () => {
    let playAgainEmitted = false;
    component.playAgain.subscribe(() => {
      playAgainEmitted = true;
    });

    const button = fixture.nativeElement.querySelector('.btn-play-again') as HTMLButtonElement;
    button.click();

    expect(playAgainEmitted).toBe(true);
  });
});
