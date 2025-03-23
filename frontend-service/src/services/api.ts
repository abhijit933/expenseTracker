import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, Transaction, Budget, BudgetStatus } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};

// Transaction Service
export const transactionService = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>('/transactions');
    return response.data;
  },

  getById: async (id: number): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  create: async (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions', transaction);
    return response.data;
  },

  update: async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put<Transaction>(`/transactions/${id}`, transaction);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};

// Budget Service
export const budgetService = {
  getAll: async (): Promise<Budget[]> => {
    const response = await api.get<Budget[]>('/budgets');
    return response.data;
  },

  getById: async (id: number): Promise<Budget> => {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  create: async (budget: Omit<Budget, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
    const response = await api.post<Budget>('/budgets', budget);
    return response.data;
  },

  update: async (id: number, budget: Partial<Budget>): Promise<Budget> => {
    const response = await api.put<Budget>(`/budgets/${id}`, budget);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  getStatus: async (id: number): Promise<BudgetStatus> => {
    const response = await api.get<BudgetStatus>(`/budgets/${id}/status`);
    return response.data;
  },
};

export default api; 