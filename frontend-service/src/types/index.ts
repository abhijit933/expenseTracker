export interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  category: string;
  description: string;
  type: 'EXPENSE' | 'INCOME';
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: number;
  userId: number;
  category: string;
  amount: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStatus {
  budget: Budget;
  totalSpent: number;
  remainingAmount: number;
  isOverBudget: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string;
}

export interface ApiError {
  message: string;
  status: number;
  timestamp: string;
} 