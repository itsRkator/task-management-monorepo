# Development stage: Install dev dependencies and build the application
FROM node:24 AS development

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./

RUN npm ci --development && npm cache clean --force

COPY tsconfig*.json ./
COPY src/ src/
COPY migrations/ migrations/

RUN npm run build

# Builder stage: Install only production dependencies
FROM node:24 AS builder

WORKDIR /app

ARG NODE_ENV=production

COPY package.json package-lock.json* ./

RUN npm ci --production && npm cache clean --force

# Production stage: Minimal Alpine image with only what's needed
FROM node:24-alpine AS production

WORKDIR /app

# Install postgresql-client for potential database operations
RUN apk --no-cache add curl postgresql-client

# Copy package files
COPY package.json package-lock.json* ./

# Copy production dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Install ts-node for running TypeScript migrations in production
# This is needed because migrations are TypeScript files
RUN npm install --production --save ts-node typescript @types/node

# Copy built application from development stage
COPY --from=development /usr/src/app/dist ./dist

# Copy migrations folder (needed for migration execution)
COPY --from=development /usr/src/app/migrations ./migrations

# Dev stage: Same as production but with dev dependencies for hot-reloading
FROM production AS dev

WORKDIR /app

# Copy package files (they're already there from production stage)
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies) for development mode
# This includes @nestjs/cli and other tools needed for hot-reloading
RUN npm ci && npm cache clean --force

# Set default environment variables (can be overridden at runtime)
ENV PORT=3000
ENV NODE_ENV=development

# Note: .env file is NOT copied into the image by default (see .dockerignore)
# For production, use one of these approaches:
# 1. Use docker-compose with env_file (recommended) - see docker-compose.yaml
# 2. Pass environment variables at runtime: docker run -e DB_PASSWORD=...
# 3. If you need .env in image (NOT recommended), uncomment .env in .dockerignore and add: COPY .env ./

EXPOSE 3000

# Run migrations before starting the application
# This ensures the database schema is up-to-date before the app starts
# Using ts-node to handle TypeScript migrations
# Using the existing data-source.ts which is already configured for CLI use
# Add a small delay to ensure database is fully ready
CMD ["sh", "-c", "sleep 2 && node -r ts-node/register ./node_modules/typeorm/cli.js migration:run -d dist/src/data-source.js && node dist/src/main"]