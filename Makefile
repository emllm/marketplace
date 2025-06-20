.PHONY: help build up down restart logs clean test lint format

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_FILE = docker-compose.yml

# Default target when just 'make' is run
help:
	@echo "\n\033[1mAvailable commands:\033[0m"
	@echo "\n\033[1mDevelopment:\033[0m"
	@echo "  make build           Build all services"
	@echo "  make up              Start all services in detached mode"
	@echo "  make down            Stop and remove all containers"
	@echo "  make restart         Restart all services"
	@echo "  make logs            Show logs from all services"
	@echo "  make logs-follow     Follow logs from all services"
	@echo "  make clean           Remove all containers, networks, and volumes"
	@echo "\n\033[1mService specific:\033[0m"
	@echo "  make build-server    Build server service"
	@echo "  make build-client    Build client service"
	@echo "  make build-web       Build web frontend"
	@echo "  make logs-server     Show server logs"
	@echo "  make logs-client     Show client logs"
	@echo "  make logs-web        Show web frontend logs"
	@echo "\n\033[1mMaintenance:\033[0m"
	@echo "  make install-deps    Install system dependencies"
	@echo "  make update          Update all dependencies"
	@echo "  make test            Run tests"
	@echo "  make lint            Run linters"
	@echo "  make format          Format code"

# Build targets
build:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build

build-server:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build server

build-client:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build client

build-web:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build marketplace

# Service management
up:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

down:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

restart:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) restart

# Logs
logs:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs

logs-follow:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f

logs-server:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs server

logs-client:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs client

logs-web:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs marketplace

# Maintenance
clean:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v --remove-orphans

test:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) run --rm server pytest

lint:
	@echo "Linting server code..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) run --rm server flake8 .
	@echo "\nLinting web code..."
	cd marketplace && npm run lint

format:
	@echo "Formatting server code..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) run --rm server black .
	@echo "\nFormatting web code..."
	cd marketplace && npm run format

install-deps:
	sudo apt-get update && sudo apt-get install -y \
		docker.io \
		docker-compose \
		python3-pip \
		nodejs \
		npm

update:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build --no-cache
	cd marketplace && npm update

# Database
migrate:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) run --rm server alembic upgrade head

migrate-create:
	@read -p "Enter migration name: " name; \
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) run --rm server alembic revision --autogenerate -m "$$name"

db-shell:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec db psql -U postgres

# Development
shell-server:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec server bash

shell-client:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) exec client bash

# Helpers
status:
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) ps

volumes:
	docker volume ls | grep marketplace

networks:
	docker network ls | grep marketplace
