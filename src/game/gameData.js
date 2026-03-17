// Visual token colors are intentionally high-contrast for the dark board theme.
export const PLAYER_SETUP = [
  { id: 'human', name: 'You', color: '#60A5FA', isAI: false },
  { id: 'ai-1', name: 'AI 1', color: '#F87171', isAI: true },
  { id: 'ai-2', name: 'AI 2', color: '#4ADE80', isAI: true },
  { id: 'ai-3', name: 'AI 3', color: '#FBBF24', isAI: true },
];

export const STARTING_CASH = 300;
export const LOW_CASH_THRESHOLD = 120;

export const TILES = [
  { id: 0, name: 'GO', type: 'go' },
  { id: 1, name: 'Maple St', type: 'property', price: 60, rent: 10 },
  { id: 2, name: 'Oak St', type: 'property', price: 75, rent: 12 },
  { id: 3, name: 'Pine St', type: 'property', price: 90, rent: 14 },
  { id: 4, name: 'Cedar St', type: 'property', price: 110, rent: 16 },
  { id: 5, name: 'Birch St', type: 'property', price: 130, rent: 18 },
  { id: 6, name: 'Elm St', type: 'property', price: 150, rent: 20 },
  { id: 7, name: 'Willow St', type: 'property', price: 170, rent: 22 },
  { id: 8, name: 'Park', type: 'rest' },
  { id: 9, name: 'Cherry St', type: 'property', price: 200, rent: 24 },
  { id: 10, name: 'Ash St', type: 'property', price: 220, rent: 26 },
  { id: 11, name: 'Rose St', type: 'property', price: 240, rent: 28 },
  { id: 12, name: 'Lake View', type: 'property', price: 260, rent: 30 },
  { id: 13, name: 'Garden St', type: 'property', price: 280, rent: 32 },
  { id: 14, name: 'Market St', type: 'property', price: 300, rent: 34 },
  { id: 15, name: 'Museum', type: 'rest' },
];

export const BOARD_POSITIONS = [
  { row: 3, col: 3 },
  { row: 3, col: 2 },
  { row: 3, col: 1 },
  { row: 3, col: 0 },
  { row: 2, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 0, col: 3 },
  { row: 1, col: 3 },
  { row: 2, col: 3 },
  { row: 2, col: 2 },
  { row: 2, col: 1 },
  { row: 1, col: 1 },
  { row: 1, col: 2 },
];
