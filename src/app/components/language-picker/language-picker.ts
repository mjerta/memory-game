import { Component, HostListener, inject, input, output } from '@angular/core';
import { Language, LANGUAGES } from '../../i18n/languages';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-language-picker',
  standalone: true,
  templateUrl: './language-picker.html',
  styleUrl: './language-picker.scss',
})
export class LanguagePicker {
  readonly selectedLanguage = input.required<Language>();
  readonly selectLanguage = output<Language>();
  readonly close = output<void>();
  readonly languages = LANGUAGES;
  readonly translations = inject(TranslationService);

  choose(language: Language): void { this.selectLanguage.emit(language); }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.close.emit(); }
}
