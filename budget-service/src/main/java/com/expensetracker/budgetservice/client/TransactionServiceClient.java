package com.expensetracker.budgetservice.client;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.expensetracker.budgetservice.model.Transaction;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@FeignClient(name = "transaction-service", url = "${app.transaction.service.url}")
@CircuitBreaker(name = "transactionService", fallbackMethod = "getTransactionsFallback")
public interface TransactionServiceClient {
    @GetMapping("/api/transactions/user/{userId}")
    List<Transaction> getTransactionsByUserId(@PathVariable("userId") Long userId);

    @GetMapping("/api/transactions/user/{userId}/category/{category}")
    List<Transaction> getTransactionsByUserIdAndCategory(
            @PathVariable("userId") Long userId,
            @PathVariable("category") String category);

    default List<Transaction> getTransactionsFallback(Long userId, Exception ex) {
        // Return empty list as fallback
        return List.of();
    }

    default List<Transaction> getTransactionsByUserIdAndCategoryFallback(Long userId, String category, Exception ex) {
        // Return empty list as fallback
        return List.of();
    }
}