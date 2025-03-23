export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

export const validateAmount = (amount: number): string | null => {
  if (amount <= 0) {
    return 'Amount must be greater than 0';
  }
  if (amount > 1000000) {
    return 'Amount must be less than 1,000,000';
  }
  return null;
};

export const validateDate = (date: string): string | null => {
  const selectedDate = new Date(date);
  const today = new Date();
  if (selectedDate > today) {
    return 'Date cannot be in the future';
  }
  return null;
};

export const validateRequired = (value: string): string | null => {
  if (!value.trim()) {
    return 'This field is required';
  }
  return null;
}; 