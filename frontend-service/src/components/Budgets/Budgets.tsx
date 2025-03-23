import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  LinearProgress,
  SelectChangeEvent,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { budgetService } from '../../services/api';
import { Budget, BudgetStatus } from '../../types';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'MONTHLY' as Budget['period'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const categories = [
    'Food',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Other',
  ];

  const periods: Budget['period'][] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const budgetsData = await budgetService.getAll();
      const statusesData = await Promise.all(
        budgetsData.map((budget: Budget) => budgetService.getStatus(budget.id))
      );
      setBudgets(budgetsData);
      setBudgetStatuses(statusesData);
    } catch {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        amount: budget.amount.toString(),
        period: budget.period,
        startDate: budget.startDate,
        endDate: budget.endDate,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category: '',
        amount: '',
        period: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        period: formData.period as Budget['period'],
      };

      if (editingBudget) {
        await budgetService.update(editingBudget.id, budgetData);
      } else {
        await budgetService.create(budgetData);
      }

      handleCloseDialog();
      fetchBudgets();
    } catch {
      setError('Failed to save budget');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.delete(id);
        fetchBudgets();
      } catch {
        setError('Failed to delete budget');
      }
    }
  };

  const getBudgetStatus = (budget: Budget) => {
    return budgetStatuses.find((status) => status.budget.id === budget.id);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Budgets</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Budget
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Budget Amount</TableCell>
              <TableCell align="right">Spent</TableCell>
              <TableCell align="right">Remaining</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.map((budget) => {
              const status = getBudgetStatus(budget);
              const progress = status ? (status.totalSpent / status.budget.amount) * 100 : 0;
              const isOverBudget = status ? status.isOverBudget : false;

              return (
                <TableRow key={budget.id}>
                  <TableCell>{budget.category}</TableCell>
                  <TableCell>{budget.period}</TableCell>
                  <TableCell align="right">${budget.amount.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    ${status?.totalSpent.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: isOverBudget ? 'error.main' : 'primary.main' }}
                  >
                    ${status?.remainingAmount.toFixed(2) || budget.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progress, 100)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: isOverBudget ? 'error.main' : 'primary.main',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenDialog(budget)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(budget.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBudget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              margin="normal"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              select
              fullWidth
              label="Period"
              name="period"
              value={formData.period}
              onChange={handleChange}
              margin="normal"
              required
            >
              {periods.map((period) => (
                <MenuItem key={period} value={period}>
                  {period}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingBudget ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Budgets; 