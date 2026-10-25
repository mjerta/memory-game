import { Component, HostListener, input, output } from '@angular/core';
import { CardTheme, THEME_META } from '../../models/card.model';
import { TranslationService } from '../../services/translation.service';
import { inject } from '@angular/core';

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
  readonly translations = inject(TranslationService);

  themeLabel(id: CardTheme): string {
    switch (id) {
      case 'animals': return this.translations.t('theme.animals');
      case 'fruits': return this.translations.t('theme.fruits');
      default: return this.translations.t('theme.default');
    }
  }

  choose(theme: CardTheme): void {
    this.selectTheme.emit(theme);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
