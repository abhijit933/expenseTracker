package com.expensetracker.userservice.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UserUpdateDTO {
    private String firstName;
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;
}