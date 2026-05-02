export type ExpenseCategory =
  | 'foodoutside'
  | 'grocery'
  | 'movie'
  | 'travel'
  | 'housing'
  | 'cab'
  | 'shopping'
  | 'medical'
  | 'sports'
  | 'investments'
  | 'internet'
  | 'entertainment'
  | 'credit-card'
  | 'other';

export interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: number;
  userId: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  dateOfExpense: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  total: number;
  count: number;
}

export interface MonthlyExpenseSummary {
  userId: number;
  year: number;
  month: number;
  totalAmount: number;
  totalCount: number;
  categoryBreakdown: CategoryBreakdown[];
}

export interface CreateExpensePayload {
  userId: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  dateOfExpense: string;
}

export interface UpdateExpensePayload {
  userId: number;
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  dateOfExpense?: string;
}

export interface LastMonthsSummary {
  summaries: MonthlyExpenseSummary[];
  peakMonth: MonthlyExpenseSummary | null;
  peakMonthTopCategories: CategoryBreakdown[];
}

export interface CreateUserPayload {
  name: string;
  email?: string;
  phone: string;
}
