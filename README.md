# Expense Tracker Microservices

A microservices-based expense tracking application built with Spring Boot and Spring Cloud.

## Architecture

The application consists of the following microservices:

1. **Service Registry (Eureka Server)**

   - Port: 8761
   - Service discovery and registration

2. **API Gateway**

   - Port: 8080
   - API Gateway with JWT authentication
   - Routes requests to appropriate microservices

3. **User Service**

   - Port: 8081
   - User management and authentication
   - JWT token generation
   - MySQL database integration

4. **Transaction Service**

   - Port: 8082
   - Transaction management
   - Income and expense tracking
   - MySQL database integration

5. **Budget Service**

   - Port: 8083
   - Budget planning and management
   - Integration with Transaction Service
   - MySQL database integration

6. **Frontend Service**

   - Port: 80
   - React-based user interface
   - Material UI components
   - Data visualization with Nivo charts

7. **Infrastructure Services**
   - MySQL Database (Port: 3307)
   - Kafka & Zookeeper (Ports: 29092, 22181)
   - Prometheus (Port: 9090)
   - Grafana (Port: 3000)

## Prerequisites

- Docker
- Docker Compose
- Java 17
- Maven
- Node.js & npm (for frontend development)
- MySQL 8.0 (for local development)

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
   - Frontend UI: http://localhost
   - API Gateway: http://localhost:8080
   - Service Registry: http://localhost:8761
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (username: admin, password: admin)
   - MySQL Database: localhost:3307 (username: root, password: password)

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

### Budget Service

- POST `/api/budgets` - Create a new budget
- GET `/api/budgets/user/{userId}` - Get all budgets for a user
- GET `/api/budgets/{id}` - Get budget details
- GET `/api/budgets/user/{userId}/category/{category}` - Get budgets by category
- PUT `/api/budgets/{id}` - Update a budget
- DELETE `/api/budgets/{id}` - Delete a budget
- GET `/api/budgets/user/{userId}/status` - Get budget status with spending analytics

## Monitoring

1. Access Grafana at http://localhost:3000
2. Login with default credentials (admin/admin)
3. Add Prometheus as a data source (URL: http://prometheus:9090)
4. Import the provided dashboard (dashboard.json)

## Messaging with Kafka

The application uses Kafka for asynchronous communication between services:

1. **Event Topics**:

   - `transaction-events` - For transaction-related events
   - `budget-alerts` - For budget threshold notifications

2. **Accessing Kafka**:

   - Kafka Broker: localhost:29092
   - Zookeeper: localhost:22181

3. **Event Types**:
   - Transaction Created
   - Transaction Updated
   - Transaction Deleted
   - Budget Threshold Exceeded

## Development

### Backend Services

1. Build individual backend services:

   ```bash
   cd <service-directory>
   ./mvnw clean install
   ```

2. Run backend services locally:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Development

1. Navigate to the frontend directory:

   ```bash
   cd frontend-service
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
