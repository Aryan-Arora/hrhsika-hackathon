
import { TimeCategory, MoneyCategory } from './types';

export const TIME_COLORS: Record<string, string> = {
  [TimeCategory.Study]: '#A7F3D0', // Pastel Green
  [TimeCategory.Reels]: '#FCA5A5', // Pastel Red
  [TimeCategory.Food]: '#FDE68A',  // Pastel Yellow
  [TimeCategory.Sleep]: '#DDD6FE', // Pastel Purple
  [TimeCategory.Fitness]: '#BFDBFE', // Pastel Blue
  [TimeCategory.Others]: '#E2E8F0',  // Light Grey
};

export const MONEY_COLORS: Record<string, string> = {
  [MoneyCategory.Food]: '#FED7AA',  // Pastel Orange
  [MoneyCategory.Transport]: '#BFDBFE', // Pastel Blue
  [MoneyCategory.Snacks]: '#FBCFE8', // Pastel Pink
  [MoneyCategory.Entertainment]: '#FCA5A5', // Pastel Red
  [MoneyCategory.Bills]: '#D1D5DB', // Grey
  [MoneyCategory.Others]: '#E2E8F0', // Light Grey
};

export const INITIAL_TIME_LOGS = [
  { id: '1', category: TimeCategory.Study, hours: 4, date: '2023-10-01', description: 'React basics' },
  { id: '2', category: TimeCategory.Reels, hours: 3.5, date: '2023-10-01', description: 'Mindless scrolling' },
  { id: '3', category: TimeCategory.Sleep, hours: 8, date: '2023-10-01', description: 'Good sleep' },
  { id: '4', category: TimeCategory.Food, hours: 1.5, date: '2023-10-02', description: 'Meal prep' },
  { id: '5', category: TimeCategory.Study, hours: 6, date: '2023-10-02', description: 'Assignment' },
];

export const INITIAL_MONEY_LOGS = [
  { id: '1', category: MoneyCategory.Food, amount: 500, date: '2023-10-01', description: 'Grocery' },
  { id: '2', category: MoneyCategory.Snacks, amount: 250, date: '2023-10-01', description: 'Vending machine' },
  { id: '3', category: MoneyCategory.Transport, amount: 120, date: '2023-10-02', description: 'Uber' },
  { id: '4', category: MoneyCategory.Entertainment, amount: 800, date: '2023-10-02', description: 'Movie' },
];
