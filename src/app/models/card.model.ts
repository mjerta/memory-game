export type CardTheme = 'default' | 'animals' | 'fruits';

export interface CardDefinition {
  id: number;
  name: string;
  category?: string;
  image: string;
  theme?: CardTheme;
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

export interface ThemeMeta {
  id: CardTheme;
  label: string;
  /** Three sample card images shown on the picker tile. */
  preview: string[];
  /** Card-back gradient colours for this theme. */
  backFrom: string;
  backTo: string;
  /** Accent colors used by the background aurora. */
  palette: [string, string, string, string, string];
}

export const THEME_META: ThemeMeta[] = [
  {
    id: 'default',
    label: 'Default',
    preview: ['cards/svg/rocket.svg', 'cards/svg/diamond.svg', 'cards/svg/trophy.svg'],
    backFrom: '#4f46e5',
    backTo: '#7c3aed',
    palette: ['#4f46e5', '#7c3aed', '#ec4899', '#22d3ee', '#f59e0b'],
  },
  {
    id: 'animals',
    label: 'Animals',
    preview: ['cards/svg/cat.svg', 'cards/svg/lion.svg', 'cards/svg/butterfly.svg'],
    backFrom: '#16a34a',
    backTo: '#15803d',
    palette: ['#16a34a', '#84cc16', '#0ea5e9', '#f59e0b', '#22c55e'],
  },
  {
    id: 'fruits',
    label: 'Fruits',
    preview: ['cards/svg/apple.svg', 'cards/svg/strawberry.svg', 'cards/svg/watermelon.svg'],
    backFrom: '#ea580c',
    backTo: '#c2410c',
    palette: ['#ea580c', '#fb7185', '#facc15', '#d946ef', '#22c55e'],
  },
];

export function themeLabel(id: CardTheme): string {
  return THEME_META.find((t) => t.id === id)?.label ?? 'Default';
}
