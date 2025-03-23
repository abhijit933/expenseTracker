package com.expensetracker.transactionservice.repository;

import com.expensetracker.transactionservice.model.Transaction;
import com.expensetracker.transactionservice.model.TransactionType;
import com.expensetracker.transactionservice.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndType(Long userId, TransactionType type);

    List<Transaction> findByUserIdAndCategory(Long userId, Category category);
}