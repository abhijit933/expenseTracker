package com.expensetracker.budgetservice.repository;

import com.expensetracker.budgetservice.model.Budget;
import com.expensetracker.budgetservice.model.BudgetPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);

    List<Budget> findByUserIdAndCategory(Long userId, String category);

    List<Budget> findByUserIdAndPeriod(Long userId, BudgetPeriod period);

    Optional<Budget> findByUserIdAndCategoryAndPeriod(Long userId, String category, BudgetPeriod period);
}