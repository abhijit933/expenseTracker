package com.expensetracker.budgetservice.controller;

import com.expensetracker.budgetservice.model.Budget;
import com.expensetracker.budgetservice.model.BudgetPeriod;
import com.expensetracker.budgetservice.model.BudgetStatus;
import com.expensetracker.budgetservice.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<Budget> createBudget(@Valid @RequestBody Budget budget) {
        return ResponseEntity.ok(budgetService.createBudget(budget));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Budget>> getUserBudgets(@PathVariable Long userId) {
        return ResponseEntity.ok(budgetService.getUserBudgets(userId));
    }

    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<List<Budget>> getUserBudgetsByCategory(
            @PathVariable Long userId,
            @PathVariable String category) {
        return ResponseEntity.ok(budgetService.getUserBudgetsByCategory(userId, category));
    }

    @GetMapping("/user/{userId}/period/{period}")
    public ResponseEntity<List<Budget>> getUserBudgetsByPeriod(
            @PathVariable Long userId,
            @PathVariable BudgetPeriod period) {
        return ResponseEntity.ok(budgetService.getUserBudgetsByPeriod(userId, period));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody Budget budgetDetails) {
        return ResponseEntity.ok(budgetService.updateBudget(id, budgetDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<BudgetStatus> checkBudgetStatus(
            @RequestHeader("X-User-ID") Long userId,
            @PathVariable Long id) {
        return ResponseEntity.ok(budgetService.checkBudgetStatus(userId, id));
    }
}