package com.expensetracker.gatewayservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.expensetracker.gatewayservice.filter.JwtAuthenticationFilter;

import reactor.core.publisher.Mono;

@Configuration
public class GatewayConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Bean
        public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
                return builder.routes()
                                // User Service routes
                                .route("user-service", r -> r
                                                .path("/api/users/**")
                                                .filters(f -> f
                                                                .filter(jwtAuthenticationFilter.apply(
                                                                                new JwtAuthenticationFilter.Config()))
                                                                .requestRateLimiter(c -> c
                                                                                .setRateLimiter(redisRateLimiter())
                                                                                .setKeyResolver(userKeyResolver())))
                                                .uri("lb://user-service"))

                                // Transaction Service routes
                                .route("transaction-service", r -> r
                                                .path("/api/transactions/**")
                                                .filters(f -> f
                                                                .filter(jwtAuthenticationFilter.apply(
                                                                                new JwtAuthenticationFilter.Config()))
                                                                .requestRateLimiter(c -> c
                                                                                .setRateLimiter(redisRateLimiter())
                                                                                .setKeyResolver(userKeyResolver())))
                                                .uri("lb://transaction-service"))

                                // Budget Service routes
                                .route("budget-service", r -> r
                                                .path("/api/budgets/**")
                                                .filters(f -> f
                                                                .filter(jwtAuthenticationFilter.apply(
                                                                                new JwtAuthenticationFilter.Config()))
                                                                .requestRateLimiter(c -> c
                                                                                .setRateLimiter(redisRateLimiter())
                                                                                .setKeyResolver(userKeyResolver())))
                                                .uri("lb://budget-service"))

                                // Actuator endpoints
                                .route("actuator", r -> r
                                                .path("/actuator/**")
                                                .uri("lb://user-service"))
                                .build();
        }

        @Bean
        public RedisRateLimiter redisRateLimiter() {
                return new RedisRateLimiter(10, 20); // 10 requests per second, burst of 20
        }

        @Bean
        @Primary
        public KeyResolver userKeyResolver() {
                return exchange -> Mono.just(
                                exchange.getRequest().getHeaders().getFirst("Authorization") != null
                                                ? exchange.getRequest().getHeaders().getFirst("Authorization")
                                                : "anonymous");
        }
}