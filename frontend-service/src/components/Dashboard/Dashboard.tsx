import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { transactionService, budgetService } from '../../services/api';
import { Transaction, BudgetStatus, Budget } from '../../types';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, budgetsData] = await Promise.all([
          transactionService.getAll(),
          budgetService.getAll(),
        ]);

        setTransactions(transactionsData);

        // Fetch budget statuses
        const statuses = await Promise.all(
          budgetsData.map((budget: Budget) => budgetService.getStatus(budget.id))
        );
        setBudgetStatuses(statuses);
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Calculate total expenses and income
  const totalExpenses = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  // Prepare data for expense trend chart
  const expenseTrendData = [
    {
      id: 'Expenses',
      data: transactions
        .filter((t) => t.type === 'EXPENSE')
        .map((t) => ({
          x: new Date(t.date).toLocaleDateString(),
          y: t.amount,
        })),
    },
  ];

  // Prepare data for category distribution chart
  const categoryDistribution = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(categoryDistribution).map(([id, value]) => ({
    id,
    value,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" color="primary">
                ${totalIncome.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error">
                ${totalExpenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Balance
              </Typography>
              <Typography
                variant="h4"
                color={totalIncome - totalExpenses >= 0 ? 'primary' : 'error'}
              >
                ${(totalIncome - totalExpenses).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Expense Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Expense Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveLine
                data={expenseTrendData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                  legend: 'Date',
                  legendOffset: 45,
                  legendPosition: 'middle',
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Amount',
                  legendOffset: -40,
                  legendPosition: 'middle',
                }}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Category Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Category Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsivePie
                data={pieData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={1}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 1.4]] }}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 56,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: '#999',
                    symbolSize: 18,
                    symbolShape: 'circle',
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Budget Status */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Status
            </Typography>
            <Grid container spacing={2}>
              {budgetStatuses.map((status) => (
                <Grid item xs={12} sm={6} md={4} key={status.budget.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{status.budget.category}</Typography>
                      <Typography color="textSecondary">
                        Budget: ${status.budget.amount.toFixed(2)}
                      </Typography>
                      <Typography color="textSecondary">
                        Spent: ${status.totalSpent.toFixed(2)}
                      </Typography>
                      <Typography
                        color={status.isOverBudget ? 'error' : 'primary'}
                        variant="subtitle1"
                      >
                        Remaining: ${status.remainingAmount.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 