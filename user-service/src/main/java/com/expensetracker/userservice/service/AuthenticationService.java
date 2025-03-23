package com.expensetracker.userservice.service;

import com.expensetracker.userservice.dto.AuthenticationRequest;
import com.expensetracker.userservice.dto.AuthenticationResponse;

public interface AuthenticationService {
    AuthenticationResponse authenticateUser(AuthenticationRequest request);
}