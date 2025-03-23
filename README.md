# Expense Tracker Microservices

A microservices-based expense tracking application built with Spring Boot and Spring Cloud.

## Architecture

The application consists of the following microservices:

1. **Service Registry (Eureka Server)**

   - Port: 8761
   - Service discovery and registration

2. **Gateway Service**

   - Port: 8080
   - API Gateway with JWT authentication
   - Routes requests to appropriate microservices

3. **User Service**

   - Port: 8081
   - User management and authentication
   - JWT token generation

4. **Transaction Service**

   - Port: 8082
   - Transaction management
   - Income and expense tracking

5. **Monitoring Stack**
   - Prometheus (Port: 9090)
   - Grafana (Port: 3000)

## Prerequisites

- Docker
- Docker Compose
- Java 17
- Maven

## Running the Application

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd expense-tracker
   ```

2. Build all services:

   ```bash
   ./build.sh
   ```

3. Start the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - Gateway Service: http://localhost:8080
   - Service Registry: http://localhost:8761
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (username: admin, password: admin)

## API Endpoints

### User Service

- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login and get JWT token
- GET `/api/users/{id}` - Get user details
- PUT `/api/users/{id}` - Update user details
- DELETE `/api/users/{id}` - Delete user

### Transaction Service

- POST `/api/transactions` - Create a new transaction
- GET `/api/transactions/user/{userId}` - Get all transactions for a user
- GET `/api/transactions/user/{userId}/type/{type}` - Get transactions by type
- GET `/api/transactions/user/{userId}/category/{category}` - Get transactions by category
- PUT `/api/transactions/{id}` - Update a transaction
- DELETE `/api/transactions/{id}` - Delete a transaction

## Monitoring

1. Access Grafana at http://localhost:3000
2. Login with default credentials (admin/admin)
3. Add Prometheus as a data source (URL: http://prometheus:9090)
4. Import the provided dashboard (dashboard.json)

## Development

1. Build individual services:

   ```bash
   cd <service-directory>
   ./mvnw clean install
   ```

2. Run services locally:
   ```bash
   ./mvnw spring-boot:run
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
