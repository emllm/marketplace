# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with retry logic
RUN set -e; \
    for i in 1 2 3; do \
        if npm install --silent; then \
            break; \
        elif [ $i -eq 3 ]; then \
            echo "npm install failed after 3 attempts"; \
            exit 1; \
        else \
            echo "npm install failed, retrying..."; \
            sleep 5; \
        fi; \
    done

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:1.23.4-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built assets from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Create nginx directory if it doesn't exist
RUN mkdir -p /etc/nginx/conf.d

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose port 80 for HTTP
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]