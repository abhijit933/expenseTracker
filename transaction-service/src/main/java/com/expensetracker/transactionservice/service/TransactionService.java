package com.expensetracker.transactionservice.service;

import com.expensetracker.transactionservice.model.Transaction;
import com.expensetracker.transactionservice.model.TransactionType;
import com.expensetracker.transactionservice.model.Category;
import com.expensetracker.transactionservice.repository.TransactionRepository;
import com.expensetracker.transactionservice.exception.TransactionNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public List<Transaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> getUserTransactionsByType(Long userId, TransactionType type) {
        return transactionRepository.findByUserIdAndType(userId, type);
    }

    public List<Transaction> getUserTransactionsByCategory(Long userId, Category category) {
        return transactionRepository.findByUserIdAndCategory(userId, category);
    }

    @Transactional
    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with id: " + id));

        transaction.setDescription(transactionDetails.getDescription());
        transaction.setAmount(transactionDetails.getAmount());
        transaction.setType(transactionDetails.getType());
        transaction.setCategory(transactionDetails.getCategory());

        return transactionRepository.save(transaction);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new TransactionNotFoundException("Transaction not found with id: " + id);
        }
        transactionRepository.deleteById(id);
    }
}