import { Component, inject, input, output } from '@angular/core';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-victory-banner',
  standalone: true,
  templateUrl: './victory-banner.html',
  styleUrl: './victory-banner.scss',
})
export class VictoryBanner {
  readonly translations = inject(TranslationService);
  readonly moves = input.required<number>();
  readonly playAgain = output<void>();
}
