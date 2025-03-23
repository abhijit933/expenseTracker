export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const calculateProgress = (current: number, total: number): number => {
  return Math.min((current / total) * 100, 100);
};

export const getStatusColor = (isOverBudget: boolean): 'success' | 'error' | 'warning' => {
  if (isOverBudget) return 'error';
  return 'success';
}; 