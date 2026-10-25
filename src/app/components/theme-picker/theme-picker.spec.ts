import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemePicker } from './theme-picker';

describe('ThemePicker', () => {
  let fixture: ComponentFixture<ThemePicker>;
  let component: ThemePicker;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ThemePicker] }).compileComponents();
    fixture = TestBed.createComponent(ThemePicker);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('selectedTheme', 'default');
    fixture.detectChanges();
  });

  it('renders each available theme and marks the selected one', () => {
    const options = fixture.nativeElement.querySelectorAll('.theme-option');
    expect(options.length).toBe(3);
    expect(options[0].getAttribute('aria-pressed')).toBe('true');
    expect(options[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('emits a selected theme', () => {
    let selected: string | undefined;
    component.selectTheme.subscribe((theme) => (selected = theme));
    (fixture.nativeElement.querySelectorAll('.theme-option')[1] as HTMLButtonElement).click();
    expect(selected).toBe('animals');
  });

  it('closes when the backdrop is clicked', () => {
    let closed = false;
    component.close.subscribe(() => (closed = true));
    (fixture.nativeElement.querySelector('.theme-overlay') as HTMLElement).click();
    expect(closed).toBe(true);
  });

  it('closes when Escape is pressed', () => {
    let closed = false;
    component.close.subscribe(() => (closed = true));
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toBe(true);
  });
});
