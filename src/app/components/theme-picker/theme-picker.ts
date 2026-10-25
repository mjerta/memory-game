import { Component, HostListener, input, output } from '@angular/core';
import { CardTheme, THEME_META } from '../../models/card.model';

@Component({
  selector: 'app-theme-picker',
  standalone: true,
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.scss',
})
export class ThemePicker {
  readonly selectedTheme = input.required<CardTheme>();
  readonly selectTheme = output<CardTheme>();
  readonly close = output<void>();
  readonly themes = THEME_META;

  choose(theme: CardTheme): void {
    this.selectTheme.emit(theme);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
