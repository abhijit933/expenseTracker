#!/bin/bash

# Parse command line arguments
FORCE_REBUILD=false
for arg in "$@"; do
    case $arg in
        --rebuild)
            FORCE_REBUILD=true
            shift
            ;;
    esac
done

# Export environment variables
export MYSQL_ROOT_PASSWORD=password
export MYSQL_DATABASE=expensetracker
# Using local MySQL server instead of containerized one
export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3307/expensetracker
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
            # Get the actual container name for Kafka
            local kafka_container=$(docker ps --filter "name=kafka" --format "{{.Names}}" | grep -i kafka | head -n 1)
            if [ -n "$kafka_container" ]; then
                # Try to list topics to check if Kafka is ready
                if docker exec $kafka_container bash -c "kafka-topics --bootstrap-server kafka:9092 --list" &>/dev/null; then
                    print_message "$service is ready!" "$GREEN"
                    return 0
                fi
            else
                print_message "Kafka container not found. Checking port instead..." "$YELLOW"
                # Fallback to port check if container not found
                if ! check_port $port; then
                    print_message "$service is ready (port check)!" "$GREEN"
                    return 0
                fi
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

    print_message "Building and starting $service_name..." "$YELLOW"
    if ! docker compose build $service && docker compose up -d $service; then
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

# If force rebuild is enabled, remove all images to ensure fresh builds
if [ "$FORCE_REBUILD" = true ]; then
    print_message "Force rebuild enabled. Removing existing images..." "$YELLOW"
    # Get all service names from docker-compose.yml that have a build directive
    services=$(grep -A1 "build:" docker-compose.yml | grep -v "build:" | grep -v "\-\-" | awk '{print $1}' | tr -d ':')
    for service in $services; do
        # Get the image name for this service
        image_name=$(docker compose images | grep $service | awk '{print $2}')
        if [ ! -z "$image_name" ]; then
            print_message "Removing image for $service..." "$YELLOW"
            docker rmi $image_name 2>/dev/null || true
        fi
    done
fi

# Check if local MySQL is running and accessible
print_message "Checking local MySQL connection..." "$YELLOW"
if mysql -h localhost -P 3307 -u${SPRING_DATASOURCE_USERNAME} -p${SPRING_DATASOURCE_PASSWORD} -e "SELECT 1" >/dev/null 2>&1; then
    print_message "Local MySQL connection successful!" "$GREEN"
else
    print_message "Error: Cannot connect to local MySQL server. Please ensure it's running and accessible." "$RED"
    print_message "You may need to create the database with: mysql -h localhost -P 3307 -u root -p -e 'CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}'" "$YELLOW"
    exit 1
fi

# Check if database exists, create if it doesn't
print_message "Checking if database exists..." "$YELLOW"
if ! mysql -h localhost -P 3307 -u${SPRING_DATASOURCE_USERNAME} -p${SPRING_DATASOURCE_PASSWORD} -e "USE ${MYSQL_DATABASE}" >/dev/null 2>&1; then
    print_message "Creating database ${MYSQL_DATABASE}..." "$YELLOW"
    mysql -h localhost -P 3307 -u${SPRING_DATASOURCE_USERNAME} -p${SPRING_DATASOURCE_PASSWORD} -e "CREATE DATABASE ${MYSQL_DATABASE}"
    print_message "Database created!" "$GREEN"
else
    print_message "Database ${MYSQL_DATABASE} exists!" "$GREEN"
fi

# Make sure the user service database configuration is consistent
print_message "Ensuring user service database configuration is consistent..." "$YELLOW"
# The user service uses the same database as other services (expensetracker)
# No need to create a separate database for it
print_message "User service will use the ${MYSQL_DATABASE} database" "$GREEN"

# Start the service registry
print_message "Building and starting Service Registry..." "$YELLOW"
docker compose build service-registry && docker compose up -d service-registry

# Wait for service registry to be ready
wait_for_service 8761 "Service Registry"

# Start Zookeeper first
print_message "Starting Zookeeper..." "$YELLOW"
docker compose up -d zookeeper
wait_for_service 2181 "Zookeeper"

# Start Kafka after Zookeeper is ready
print_message "Starting Kafka..." "$YELLOW"
docker compose up -d kafka

# Wait for Kafka to be ready with increased timeout
print_message "Waiting for Kafka to be ready (this may take a moment)..." "$YELLOW"
wait_for_service 29092 "Kafka"

# Verify Kafka is operational
print_message "Verifying Kafka connection..." "$YELLOW"
kafka_container=$(docker ps --filter "name=kafka" --format "{{.Names}}" | grep -i kafka | head -n 1)
if [ -n "$kafka_container" ]; then
    retry_count=0
    max_retries=5
    while [ $retry_count -lt $max_retries ]; do
        if docker exec $kafka_container bash -c "kafka-topics --bootstrap-server kafka:9092 --list" &>/dev/null; then
            print_message "Kafka is fully operational!" "$GREEN"
            break
        else
            retry_count=$((retry_count + 1))
            if [ $retry_count -eq $max_retries ]; then
                print_message "Warning: Kafka may not be fully operational, but continuing startup..." "$YELLOW"
            else
                print_message "Waiting for Kafka to become fully operational (attempt $retry_count/$max_retries)..." "$YELLOW"
                sleep 3
            fi
        fi
    done
else
    print_message "Warning: Could not verify Kafka operation, but continuing startup..." "$YELLOW"
fi

# Start core microservices
print_message "Starting core microservices..." "$YELLOW"

# Start user service with correct database configuration
print_message "Building and starting User Service..." "$YELLOW"
# Override the database URL to match what's expected in the application.yml
docker compose build user-service && \
docker compose up -d \
  --env SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3307/expensetracker \
  user-service
wait_for_service 8081 "User Service"

# Start transaction service
start_service "transaction-service" "Transaction Service" 8082

# Start budget service
start_service "budget-service" "Budget Service" 8083

# Start API Gateway
print_message "Building and starting API Gateway..." "$YELLOW"
docker compose build api-gateway && docker compose up -d api-gateway
wait_for_service 8080 "API Gateway"

# Start monitoring services
print_message "Starting monitoring services..." "$YELLOW"
docker compose up -d prometheus grafana
wait_for_service 9090 "Prometheus"
wait_for_service 3000 "Grafana"

# Start frontend service
print_message "Building and starting Frontend service..." "$YELLOW"
docker compose build frontend-service && docker compose up -d frontend-service
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

print_message "\nTip: To force rebuild all services in the future, run:" "$YELLOW"
print_message "./start.sh --rebuild" "$YELLOW"

# Print logs
print_message "\nShowing logs (press Ctrl+C to stop):" "$YELLOW"
docker compose logs -f 