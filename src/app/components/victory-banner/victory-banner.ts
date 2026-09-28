import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-victory-banner',
  standalone: true,
  templateUrl: './victory-banner.html',
  styleUrl: './victory-banner.scss',
})
export class VictoryBanner {
  readonly moves = input.required<number>();
  readonly playAgain = output<void>();
}
