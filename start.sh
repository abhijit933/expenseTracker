#!/bin/bash

# Export environment variables
export MYSQL_ROOT_PASSWORD=password
export MYSQL_DATABASE=expensetracker
# Using local MySQL server instead of containerized one
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/expensetracker
export SPRING_DATASOURCE_USERNAME=root
export SPRING_DATASOURCE_PASSWORD=password
export SPRING_PROFILES_ACTIVE=prod
export EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://service-registry:8761/eureka/
export SPRING_KAFKA_BOOTSTRAP_SERVERS=kafka:9092
export KAFKA_BROKER_ID=1
export KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181
export KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092,PLAINTEXT_HOST://localhost:29092
export KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
export KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT
export KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
export ZOOKEEPER_CLIENT_PORT=2181
export ZOOKEEPER_TICK_TIME=2000

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
    echo -e "${2}${1}${NC}"
}

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Function to check if a network exists
check_network() {
    docker network inspect expense-tracker-network >/dev/null 2>&1
    return $?
}

# Function to check if a volume exists
check_volume() {
    docker volume inspect $1 >/dev/null 2>&1
    return $?
}

# Function to check if a file exists
check_file() {
    if [ ! -f "$1" ]; then
        print_message "Error: Required file $1 not found!" "$RED"
        exit 1
    fi
}

# Function to check if a directory exists
check_directory() {
    if [ ! -d "$1" ]; then
        print_message "Error: Required directory $1 not found!" "$RED"
        exit 1
    fi
}

# Function to check if an environment variable is set
check_env_var() {
    if [ -z "${!1}" ]; then
        print_message "Error: Required environment variable $1 is not set!" "$RED"
        exit 1
    fi
}

# Check for required environment variables
print_message "Checking required environment variables..." "$YELLOW"
check_env_var "MYSQL_ROOT_PASSWORD"
check_env_var "MYSQL_DATABASE"
check_env_var "SPRING_PROFILES_ACTIVE"
check_env_var "SPRING_DATASOURCE_USERNAME"
check_env_var "SPRING_DATASOURCE_PASSWORD"
check_env_var "EUREKA_CLIENT_SERVICEURL_DEFAULTZONE"
check_env_var "SPRING_KAFKA_BOOTSTRAP_SERVERS"
check_env_var "KAFKA_BROKER_ID"
check_env_var "KAFKA_ZOOKEEPER_CONNECT"
check_env_var "KAFKA_ADVERTISED_LISTENERS"
check_env_var "KAFKA_LISTENER_SECURITY_PROTOCOL_MAP"
check_env_var "KAFKA_INTER_BROKER_LISTENER_NAME"
check_env_var "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR"
check_env_var "ZOOKEEPER_CLIENT_PORT"
check_env_var "ZOOKEEPER_TICK_TIME"

# Function to wait for a service to be ready
wait_for_service() {
    local port=$1
    local service=$2
    local max_attempts=10
    local attempt=1

    print_message "Waiting for $service to be ready..." "$YELLOW"
    while [ $attempt -le $max_attempts ]; do
        if [ "$service" = "Kafka" ]; then
            if docker exec expensetrackerproject-kafka-1 bash -c "kafka-topics --bootstrap-server kafka:9092 --list" &>/dev/null; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi
        elif [ "$service" = "Service Registry" ]; then
            if curl -s http://localhost:8761/actuator/health | grep -q "UP"; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi
        elif [ "$service" = "User Service" ]; then
            if curl -s http://localhost:8081/actuator/health | grep -q "UP"; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi
        elif [ "$service" = "Transaction Service" ]; then
            if curl -s http://localhost:8082/actuator/health | grep -q "UP"; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi
        elif [ "$service" = "Budget Service" ]; then
            if curl -s http://localhost:8083/actuator/health | grep -q "UP"; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi

        elif [ "$service" = "API Gateway" ]; then
            if curl -s http://localhost:8080/actuator/health | grep -q "UP"; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi
        else
            if ! check_port $port; then
                print_message "$service is ready!" "$GREEN"
                return 0
            fi
        fi
        print_message "Attempt $attempt/$max_attempts: Waiting for $service..." "$YELLOW"
        sleep 2
        attempt=$((attempt + 1))
    done
    print_message "Error: $service failed to start after $max_attempts attempts" "$RED"
    exit 1
}

# Function to handle Docker build failure
handle_docker_build_failure() {
    local service=$1
    print_message "Error: Failed to build $service. Please check the Dockerfile and try again." "$RED"
    print_message "You may need to build the service manually using: docker compose build $service" "$YELLOW"
    exit 1
}

# Function to start a service
start_service() {
    local service=$1
    local service_name=$2
    local port=$3
    
    print_message "Starting $service_name..." "$YELLOW"
    if ! docker compose up -d $service; then
        handle_docker_build_failure $service
    fi
    wait_for_service $port "$service_name"
}

# Check for required files and directories
print_message "Checking required files and directories..." "$YELLOW"
check_file "prometheus.yml"
check_directory "frontend-service"
check_directory "service-registry"
check_directory "api-gateway"
check_directory "user-service"
check_directory "transaction-service"
check_directory "budget-service"

# Check for required network
if ! check_network; then
    print_message "Creating expense-tracker-network..." "$YELLOW"
    docker network create expense-tracker-network
fi

# Check for required volumes
for volume in prometheus_data grafana-data; do
    if ! check_volume $volume; then
        print_message "Creating volume $volume..." "$YELLOW"
        docker volume create $volume
    fi
done

# Stop any running containers
print_message "Stopping any running containers..." "$YELLOW"
docker compose down

# Check if local MySQL is running and accessible
print_message "Checking local MySQL connection..." "$YELLOW"
if mysql -h localhost -u${SPRING_DATASOURCE_USERNAME} -p${SPRING_DATASOURCE_PASSWORD} -e "SELECT 1" >/dev/null 2>&1; then
    print_message "Local MySQL connection successful!" "$GREEN"
else
    print_message "Error: Cannot connect to local MySQL server. Please ensure it's running and accessible." "$RED"
    print_message "You may need to create the database with: mysql -u root -p -e 'CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}'" "$YELLOW"
    exit 1
fi

# Check if database exists, create if it doesn't
print_message "Checking if database exists..." "$YELLOW"
if ! mysql -h localhost -u${SPRING_DATASOURCE_USERNAME} -p${SPRING_DATASOURCE_PASSWORD} -e "USE ${MYSQL_DATABASE}" >/dev/null 2>&1; then
    print_message "Creating database ${MYSQL_DATABASE}..." "$YELLOW"
    mysql -h localhost -u${SPRING_DATASOURCE_USERNAME} -p${SPRING_DATASOURCE_PASSWORD} -e "CREATE DATABASE ${MYSQL_DATABASE}"
    print_message "Database created!" "$GREEN"
else
    print_message "Database ${MYSQL_DATABASE} exists!" "$GREEN"
fi

# Start the service registry
print_message "Starting Service Registry..." "$YELLOW"
docker compose up -d service-registry

# Wait for service registry to be ready
wait_for_service 8761 "Service Registry"

# Start Kafka and Zookeeper
print_message "Starting Kafka and Zookeeper..." "$YELLOW"
docker compose up -d zookeeper kafka

# Wait for Kafka to be ready
wait_for_service 29092 "Kafka"

# Start core microservices
print_message "Starting core microservices..." "$YELLOW"

# Start user service
start_service "user-service" "User Service" 8081

# Start transaction service
start_service "transaction-service" "Transaction Service" 8082

# Start budget service
start_service "budget-service" "Budget Service" 8083

# Start API Gateway
print_message "Starting API Gateway..." "$YELLOW"
docker compose up -d api-gateway
wait_for_service 8080 "API Gateway"

# Start monitoring services
print_message "Starting monitoring services..." "$YELLOW"
docker compose up -d prometheus grafana
wait_for_service 9090 "Prometheus"
wait_for_service 3000 "Grafana"

# Start frontend service
print_message "Starting Frontend service..." "$YELLOW"
docker compose up -d frontend-service
wait_for_service 80 "Frontend Service"

# Print service URLs
print_message "\nService URLs:" "$GREEN"
print_message "Frontend Service: http://localhost:80" "$GREEN"
print_message "API Gateway: http://localhost:8080" "$GREEN"
print_message "Service Registry: http://localhost:8761" "$GREEN"
print_message "User Service: http://localhost:8081" "$GREEN"
print_message "Transaction Service: http://localhost:8082" "$GREEN"
print_message "Budget Service: http://localhost:8083" "$GREEN"
print_message "Grafana: http://localhost:3000" "$GREEN"
print_message "Prometheus: http://localhost:9090" "$GREEN"

print_message "\nNetwork Information:" "$GREEN"
print_message "Docker Network: expense-tracker-network" "$GREEN"
print_message "Local MySQL Port: 3306" "$GREEN"
print_message "Kafka Port: 29092" "$GREEN"
print_message "Zookeeper Port: 22181" "$GREEN"

# Print logs
print_message "\nShowing logs (press Ctrl+C to stop):" "$YELLOW"
docker compose logs -f 