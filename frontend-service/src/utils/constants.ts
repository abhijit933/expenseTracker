export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Expense Tracker';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/transactions',
  BUDGETS: '/budgets',
} as const;

export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Other',
] as const;

export const BUDGET_PERIODS = [
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY',
] as const;

export const CHART_COLORS = [
  '#1976d2',
  '#9c27b0',
  '#2e7d32',
  '#f57c00',
  '#d32f2f',
  '#455a64',
  '#7b1fa2',
  '#388e3c',
  '#ffa000',
  '#c62828',
] as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    BY_ID: (id: number) => `/transactions/${id}`,
  },
  BUDGETS: {
    BASE: '/budgets',
    BY_ID: (id: number) => `/budgets/${id}`,
    STATUS: (id: number) => `/budgets/${id}/status`,
  },
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
} as const;

export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in.',
  REGISTER: 'Successfully registered.',
  LOGOUT: 'Successfully logged out.',
  CREATE: 'Successfully created.',
  UPDATE: 'Successfully updated.',
  DELETE: 'Successfully deleted.',
} as const; 