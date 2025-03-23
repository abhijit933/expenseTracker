import { User } from '../types';

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
}; 