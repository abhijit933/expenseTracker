package com.expensetracker.apigateway.filter;

import com.expensetracker.apigateway.config.JwtConfig;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtConfig jwtConfig;

    public AuthenticationFilter(JwtConfig jwtConfig) {
        super(Config.class);
        this.jwtConfig = jwtConfig;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            if (isSecured(exchange)) {
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }

                List<String> authHeaders = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION);
                if (authHeaders == null || authHeaders.isEmpty()) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }
                String authHeader = authHeaders.get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    if (!jwtConfig.isTokenValid(token)) {
                        return onError(exchange, HttpStatus.UNAUTHORIZED);
                    }
                } else {
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }
            }
            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    private boolean isSecured(ServerWebExchange exchange) {
        String path = exchange.getRequest().getPath().toString();
        return !path.contains("/users/register") &&
                !path.contains("/users/login") &&
                !path.contains("/actuator");
    }

    public static class Config {
        // Configuration properties if needed
    }
}