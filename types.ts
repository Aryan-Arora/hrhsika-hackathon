
export enum TimeCategory {
  Study = 'Study',
  Reels = 'Reels',
  Food = 'Food',
  Sleep = 'Sleep',
  Fitness = 'Fitness',
  Others = 'Others'
}

export enum MoneyCategory {
  Food = 'Food',
  Transport = 'Transport',
  Snacks = 'Snacks',
  Entertainment = 'Entertainment',
  Bills = 'Bills',
  Others = 'Others'
}

export interface TimeEntry {
  id: string;
  category: TimeCategory;
  hours: number;
  date: string;
  description: string;
}

export interface MoneyEntry {
  id: string;
  category: MoneyCategory;
  amount: number;
  date: string;
  description: string;
}

export interface AIInsight {
  roast: string;
  summary: string;
  productivityScore: number;
  financialScore: number;
  nextWeekPlan: {
    day: string;
    focus: string;
    limit: string;
  }[];
  tips: string[];
}
