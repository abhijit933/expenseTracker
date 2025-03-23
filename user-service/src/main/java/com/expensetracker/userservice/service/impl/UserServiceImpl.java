package com.expensetracker.userservice.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.userservice.dto.UserDTO;
import com.expensetracker.userservice.dto.UserRegistrationDTO;
import com.expensetracker.userservice.dto.UserUpdateDTO;
import com.expensetracker.userservice.exception.EmailAlreadyExistsException;
import com.expensetracker.userservice.exception.UserNotFoundException;
import com.expensetracker.userservice.exception.UsernameAlreadyExistsException;
import com.expensetracker.userservice.model.User;
import com.expensetracker.userservice.repository.UserRepository;
import com.expensetracker.userservice.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserDTO registerUser(UserRegistrationDTO registrationDTO) {
        if (userRepository.existsByUsername(registrationDTO.getUsername())) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        if (userRepository.existsByEmail(registrationDTO.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        User user = new User();
        user.setUsername(registrationDTO.getUsername());
        user.setEmail(registrationDTO.getEmail());
        user.setFirstName(registrationDTO.getFirstName());
        user.setLastName(registrationDTO.getLastName());
        user.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));

        User savedUser = userRepository.save(user);
        return UserDTO.fromUser(savedUser);
    }

    @Override
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        return UserDTO.fromUser(user);
    }

    @Override
    public UserDTO getUserByUsername(String username) {
        User user = getUserEntityByUsername(username);
        return UserDTO.fromUser(user);
    }

    @Override
    public User getUserEntityByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UserUpdateDTO updateDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

        user.setFirstName(updateDTO.getFirstName());
        user.setLastName(updateDTO.getLastName());
        user.setEmail(updateDTO.getEmail());

        User updatedUser = userRepository.save(user);
        return UserDTO.fromUser(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }
}