package com.expensetracker.budgetservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import lombok.Data;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.transaction")
public class TransactionServiceConfig {
    private Service service = new Service();

    @Data
    public static class Service {
        private String url;
    }
}