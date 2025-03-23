package com.expensetracker.gatewayservice.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // Skip authentication for public endpoints
            if (isPublicEndpoint(request.getPath().toString())) {
                return chain.filter(exchange);
            }

            // Get token from Authorization header
            String token = request.getHeaders().getFirst("Authorization");
            if (token == null || !token.startsWith("Bearer ")) {
                return handleUnauthorized(exchange);
            }

            token = token.substring(7);
            try {
                // Validate token
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                // Add user ID to request headers
                String userId = claims.getSubject();
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-ID", userId)
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            } catch (Exception e) {
                return handleUnauthorized(exchange);
            }
        };
    }

    private boolean isPublicEndpoint(String path) {
        List<String> publicPaths = List.of(
                "/api/users/register",
                "/api/users/login",
                "/actuator/health",
                "/actuator/info",
                "/actuator/prometheus");
        return publicPaths.stream().anyMatch(path::startsWith);
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Empty class as we don't need any configuration
    }
}