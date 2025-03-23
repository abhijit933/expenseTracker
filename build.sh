#!/bin/bash

# Build Service Registry
echo "Building Service Registry..."
cd service-registry
./mvnw clean package -DskipTests
cd ..

# Build User Service
echo "Building User Service..."
cd user-service
./mvnw clean package -DskipTests
cd ..

# Build Transaction Service
echo "Building Transaction Service..."
cd transaction-service
./mvnw clean package -DskipTests
cd ..

# Build Gateway Service
echo "Building Gateway Service..."
cd gateway-service
./mvnw clean package -DskipTests
cd ..

echo "All services built successfully!" 