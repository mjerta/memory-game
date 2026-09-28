export interface CardDefinition {
  id: number;
  name: string;
  category?: string;
  image: string;
}

export interface PlayingCard {
  uid: string;
  pairId: number;
  name: string;
  category?: string;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
  flipDirection?: 'left' | 'right';
}
