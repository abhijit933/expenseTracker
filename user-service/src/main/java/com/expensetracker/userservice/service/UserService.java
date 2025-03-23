package com.expensetracker.userservice.service;

import com.expensetracker.userservice.dto.UserDTO;
import com.expensetracker.userservice.dto.UserRegistrationDTO;
import com.expensetracker.userservice.dto.UserUpdateDTO;
import com.expensetracker.userservice.model.User;

public interface UserService {
    UserDTO registerUser(UserRegistrationDTO registrationDTO);

    UserDTO getUserById(Long id);

    UserDTO updateUser(Long id, UserUpdateDTO updateDTO);

    void deleteUser(Long id);

    UserDTO getUserByUsername(String username);

    User getUserEntityByUsername(String username);
}