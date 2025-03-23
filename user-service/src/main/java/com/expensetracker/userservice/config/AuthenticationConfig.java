package com.expensetracker.userservice.config;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;

import com.expensetracker.userservice.security.CustomAuthenticationProvider;

@Configuration
public class AuthenticationConfig {

    private final CustomAuthenticationProvider authenticationProvider;

    public AuthenticationConfig(@Lazy CustomAuthenticationProvider authenticationProvider) {
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    @Primary
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(Collections.singletonList(authenticationProvider));
    }
}