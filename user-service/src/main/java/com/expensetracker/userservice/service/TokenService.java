package com.expensetracker.userservice.service;

public interface TokenService {
    String generateToken(String username);

    String extractUsername(String token);

    boolean isTokenValid(String token);
}