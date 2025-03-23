package com.expensetracker.budgetservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BudgetStatus {
    private Budget budget;
    private BigDecimal totalSpent;
    private BigDecimal remainingAmount;
    private boolean isOverBudget;
}