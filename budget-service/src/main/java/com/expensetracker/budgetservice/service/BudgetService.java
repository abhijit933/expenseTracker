package com.expensetracker.budgetservice.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.budgetservice.client.TransactionServiceClient;
import com.expensetracker.budgetservice.model.Budget;
import com.expensetracker.budgetservice.model.BudgetPeriod;
import com.expensetracker.budgetservice.model.BudgetStatus;
import com.expensetracker.budgetservice.model.Transaction;
import com.expensetracker.budgetservice.repository.BudgetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionServiceClient transactionServiceClient;

    @Transactional
    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    public List<Budget> getUserBudgets(Long userId) {
        return budgetRepository.findByUserId(userId);
    }

    public List<Budget> getUserBudgetsByCategory(Long userId, String category) {
        return budgetRepository.findByUserIdAndCategory(userId, category);
    }

    public List<Budget> getUserBudgetsByPeriod(Long userId, BudgetPeriod period) {
        return budgetRepository.findByUserIdAndPeriod(userId, period);
    }

    @Transactional
    public Budget updateBudget(Long id, Budget budgetDetails) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        budget.setCategory(budgetDetails.getCategory());
        budget.setAmount(budgetDetails.getAmount());
        budget.setPeriod(budgetDetails.getPeriod());

        return budgetRepository.save(budget);
    }

    @Transactional
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    public BudgetStatus checkBudgetStatus(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new RuntimeException("Budget not found"));

        if (!budget.getUserId().equals(userId)) {
            throw new RuntimeException("Budget does not belong to user");
        }

        List<Transaction> transactions = transactionServiceClient.getTransactionsByUserIdAndCategory(
                userId, budget.getCategory());

        BigDecimal totalSpent = transactions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingAmount = budget.getAmount().subtract(totalSpent);

        return new BudgetStatus(
                budget,
                totalSpent,
                remainingAmount,
                remainingAmount.compareTo(BigDecimal.ZERO) < 0);
    }
}