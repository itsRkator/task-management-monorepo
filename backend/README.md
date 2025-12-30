# Task Management API - Backend

## Overview

This is the backend API for the Task Management Application, built with **NestJS** following a **Vertical Slice Architecture** pattern. The backend provides a RESTful API for managing tasks with full CRUD operations, pagination, filtering, and search capabilities.

The application is designed to be scalable, maintainable, and follows industry best practices for enterprise-level Node.js applications. It uses TypeScript for type safety, PostgreSQL for data persistence, and includes comprehensive testing, validation, and API documentation.

## Technology Stack

### Core Framework & Language
- **NestJS 11.x** - Progressive Node.js framework for building efficient and scalable server-side applications
- **TypeScript 5.9.x** - Typed superset of JavaScript for enhanced developer experience and type safety

### Database & ORM
- **PostgreSQL** - Robust, open-source relational database
- **TypeORM 0.3.x** - Object-Relational Mapping library for TypeScript and JavaScript

### Validation & Transformation
- **class-validator** - Decorator-based validation library
- **class-transformer** - Transformation and serialization library

### API Documentation
- **Swagger/OpenAPI** - Interactive API documentation via `@nestjs/swagger`

### Testing
- **node:test** - Node.js built-in test runner (primary testing framework)
- **Jest** - Additional testing framework for spec files
- **Sinon** - Standalone test spies, stubs, and mocks
- **Supertest** - HTTP assertions for E2E testing
- **c8** - Code coverage tool

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **tsx** - TypeScript execution engine for running tests
- **ts-node** - TypeScript execution engine for migrations

## Architecture

### Vertical Slice Architecture

The backend follows a **Vertical Slice Architecture** pattern, which organizes code by features rather than by technical layers. Each feature is a complete vertical slice that includes:

- **Contract** - Request/Response DTOs with validation decorators
- **Endpoint** - HTTP controllers that handle routing
- **Services** - Business logic and data access

This approach provides several benefits:
- **Cohesion**: All code related to a feature is in one place
- **Independence**: Features can be developed and tested independently
- **Maintainability**: Changes to a feature are localized
- **Scalability**: Easy to add new features without affecting existing ones

### Feature Structure

Each feature follows this structure:

```
modules/tasks/apps/features/v1/{featureName}/
├── contract/
│   └── index.ts          # Request/Response DTOs with validation decorators
├── endpoint/
│   └── index.ts          # Controller/Endpoint (HTTP handlers)
└── services/
    └── index.ts          # Business logic service
```

### Request Flow

1. **HTTP Request** → Endpoint receives the request
2. **Validation** → Global ValidationPipe validates the request DTO using class-validator decorators
3. **Service Layer** → Business logic is executed in the service
4. **Data Access** → TypeORM repository handles database operations
5. **Response** → Response DTO is returned to the client

## Project Structure

```
backend/
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root application module
│   ├── app.controller.ts                # Root controller (health check)
│   ├── app.service.ts                   # Root service
│   ├── data-source.ts                   # TypeORM data source for migrations
│   │
│   ├── config/
│   │   └── database.config.ts           # Database configuration factory
│   │
│   ├── modules/
│   │   └── tasks/
│   │       ├── tasks.module.ts          # Tasks feature module
│   │       │
│   │       ├── entities/
│   │       │   └── task.entity.ts       # Task entity definition
│   │       │
│   │       └── apps/
│   │           └── features/
│   │               └── v1/
│   │                   ├── createTask/  # Create task feature
│   │                   │   ├── contract/
│   │                   │   ├── endpoint/
│   │                   │   └── services/
│   │                   ├── getTasks/    # List tasks feature
│   │                   ├── getTaskById/ # Get single task feature
│   │                   ├── updateTask/  # Update task feature
│   │                   └── removeTask/  # Delete task feature
│   │
│   └── test-utils/                      # Test utilities and helpers
│
├── migrations/                          # Database migration files
├── scripts/                             # Utility scripts (e.g., migration generation)
├── test/                                # E2E tests
├── dist/                                # Compiled JavaScript output
├── coverage/                            # Test coverage reports
│
├── package.json                         # Dependencies and scripts
├── tsconfig.json                        # TypeScript configuration
├── tsconfig.build.json                  # Build-specific TypeScript config
├── nest-cli.json                        # NestJS CLI configuration
├── eslint.config.mjs                    # ESLint configuration
├── .prettierrc                          # Prettier configuration
├── .c8rc.json                           # Code coverage configuration
├── Dockerfile                           # Docker image definition
└── README.md                            # This file
```

## Features

### Task Management API

The backend provides complete CRUD operations for tasks:

#### 1. Create Task
- **Endpoint**: `POST /api/v1/tasks`
- **Description**: Creates a new task
- **Request Body**:
  - `title` (required, string, max 255 chars)
  - `description` (optional, string)
  - `status` (optional, enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - `priority` (optional, enum: LOW, MEDIUM, HIGH)
  - `due_date` (optional, ISO date string)
- **Response**: Created task object with all fields including `id`, `created_at`, `updated_at`

#### 2. List Tasks
- **Endpoint**: `GET /api/v1/tasks`
- **Description**: Retrieves a paginated list of tasks with filtering and search
- **Query Parameters**:
  - `page` (optional, default: 1, min: 1)
  - `limit` (optional, default: 10, min: 1, max: 100)
  - `status` (optional, enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - `priority` (optional, enum: LOW, MEDIUM, HIGH)
  - `search` (optional, string) - Searches in title and description (case-insensitive)
- **Response**: 
  ```json
  {
    "data": [/* array of tasks */],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
  ```

#### 3. Get Task by ID
- **Endpoint**: `GET /api/v1/tasks/:id`
- **Description**: Retrieves a single task by its UUID
- **Path Parameter**: `id` (UUID)
- **Response**: Task object or 404 if not found

#### 4. Update Task
- **Endpoint**: `PUT /api/v1/tasks/:id`
- **Description**: Updates an existing task
- **Path Parameter**: `id` (UUID)
- **Request Body**:
  - `title` (required, string, max 255 chars)
  - `description` (optional, string)
  - `status` (required, enum)
  - `priority` (optional, enum)
  - `due_date` (optional, ISO date string)
- **Response**: Updated task object

#### 5. Delete Task
- **Endpoint**: `DELETE /api/v1/tasks/:id`
- **Description**: Deletes a task by its UUID
- **Path Parameter**: `id` (UUID)
- **Response**: 204 No Content on success, 404 if not found

### Health Check
- **Endpoint**: `GET /api/`
- **Description**: Returns API health status
- **Response**: `{ "status": "ok" }`

## Database Schema

### Task Entity

The `Task` entity represents a task in the system:

```typescript
{
  id: string (UUID, primary key, auto-generated)
  title: string (varchar 255, required)
  description: string | null (text, optional)
  status: TaskStatus (enum, default: PENDING)
  priority: TaskPriority | null (enum, optional)
  due_date: Date | null (timestamp, optional)
  created_at: Date (timestamp, auto-generated)
  updated_at: Date (timestamp, auto-updated)
}
```

### Enums

**TaskStatus**:
- `PENDING` - Task is not yet started
- `IN_PROGRESS` - Task is currently being worked on
- `COMPLETED` - Task has been finished
- `CANCELLED` - Task has been cancelled

**TaskPriority**:
- `LOW` - Low priority task
- `MEDIUM` - Medium priority task
- `HIGH` - High priority task

### Database Indexes

The following indexes are created for performance optimization:
- Index on `status` column
- Index on `priority` column
- Index on `due_date` column

## Setup

### Prerequisites

- **Node.js** 24.x or higher
- **PostgreSQL** 12.x or higher
- **npm** or **yarn** package manager

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create a `.env` file in the backend root directory with the following variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=task_management
   DB_SYNCHRONIZE=false
   DB_LOGGING=false
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

3. **Create PostgreSQL database**:
   ```bash
   createdb task_management
   # Or using psql:
   # psql -U postgres
   # CREATE DATABASE task_management;
   ```

4. **Run database migrations**:
   ```bash
   npm run migration:run
   ```

5. **Start the development server**:
   ```bash
   npm run start:dev
   ```

The API will be available at:
- **API Base URL**: `http://localhost:3000/api`
- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/`

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL host | `localhost` | No |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_USERNAME` | Database username | `postgres` | No |
| `DB_PASSWORD` | Database password | `postgres` | No |
| `DB_NAME` | Database name | `task_management` | No |
| `DB_SYNCHRONIZE` | Auto-sync schema (dev only) | `false` | No |
| `DB_LOGGING` | Enable SQL query logging | `false` | No |
| `PORT` | Application port | `3000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `ENV` | Environment identifier | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` | No |

### Global Configuration

The application uses NestJS `ConfigModule` for configuration management:
- Configuration is loaded from `.env` file
- `ConfigModule` is set as global, available throughout the application
- Database configuration is loaded asynchronously using `ConfigService`

### Validation Configuration

Global validation is configured in `main.ts`:
- **whitelist**: true - Strips properties that don't have decorators
- **forbidNonWhitelisted**: true - Throws error if non-whitelisted properties are present
- **transform**: true - Automatically transforms payloads to DTO instances

### CORS Configuration

CORS is enabled with:
- Origin: Configurable via `FRONTEND_URL` environment variable
- Credentials: Enabled for cookie-based authentication support

## Database Migrations

### Migration Workflow

Migrations are managed using TypeORM's migration system. The migration files are located in the `migrations/` directory.

### Available Commands

**Generate a new migration** (after entity changes):
```bash
npm run migration:generate
```
This will create a new migration file based on entity changes.

**Run pending migrations**:
```bash
npm run migration:run
```

**Run migrations in production**:
```bash
npm run migration:run:prod
```

**Revert the last migration**:
```bash
npm run migration:revert
```

### Migration Files

Migrations are TypeScript files that implement `MigrationInterface`. Each migration has:
- `up()` method - Applies the migration
- `down()` method - Reverts the migration

Example migration structure:
```typescript
export class Initial1766854085689 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tables, indexes, etc.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables, indexes, etc.
  }
}
```

### Data Source Configuration

The `data-source.ts` file is used by TypeORM CLI for running migrations. It:
- Loads environment variables using `dotenv`
- Configures database connection
- Points to migration files in the `migrations/` directory
- Uses different paths for development and production environments

## Testing

### Test Structure

The project uses two testing frameworks:

1. **node:test** (Primary) - Node.js built-in test runner
   - Test files: `*.test.ts`
   - Located alongside source files
   - Fast execution, no additional dependencies

2. **Jest** (Secondary) - For spec-style tests
   - Test files: `*.spec.ts`
   - Located alongside source files
   - Full-featured testing framework

### Running Tests

**Run all node:test tests**:
```bash
npm test
```

**Run tests in watch mode**:
```bash
npm run test:watch
```

**Run tests with coverage**:
```bash
npm run test:coverage
```

**Run Jest tests**:
```bash
npm run test:jest
```

**Run Jest tests in watch mode**:
```bash
npm run test:jest:watch
```

**Run Jest tests with coverage**:
```bash
npm run test:coverage:jest
```

**Run all tests** (both node:test and Jest):
```bash
npm run test:all
```

**Run E2E tests**:
```bash
npm run test:e2e
```

### Test Coverage

Code coverage is generated using `c8` for node:test and Jest's built-in coverage for spec files. Coverage reports are generated in the `coverage/` directory.

### Test Utilities

The `src/test-utils/` directory contains:
- `test-task.entity.ts` - Test entity for unit tests
- `test-database.config.ts` - Test database configuration

## Development Workflow

### Code Quality

**Linting**:
```bash
npm run lint
```
Automatically fixes linting issues where possible.

**Formatting**:
```bash
npm run format
```
Formats all TypeScript files using Prettier.

### Building

**Build for production**:
```bash
npm run build
```
Compiles TypeScript to JavaScript in the `dist/` directory.

**Start production server**:
```bash
npm run start:prod
```

### Development Server

**Start with hot-reload**:
```bash
npm run start:dev
```

**Start with debugging**:
```bash
npm run start:debug
```

## How Things Work

### Application Bootstrap

1. **Entry Point** (`main.ts`):
   - Creates NestJS application instance
   - Configures global validation pipe
   - Enables CORS
   - Sets global API prefix (`/api`)
   - Configures Swagger documentation
   - Starts HTTP server on configured port

2. **Root Module** (`app.module.ts`):
   - Imports `ConfigModule` for environment variables
   - Configures TypeORM with database connection
   - Imports feature modules (e.g., `TasksModule`)

3. **Feature Module** (`tasks.module.ts`):
   - Registers Task entity with TypeORM
   - Registers all feature endpoints (controllers)
   - Registers all feature services (providers)

### Request Processing Flow

1. **HTTP Request** arrives at the endpoint
2. **ValidationPipe** validates the request body/query using DTO decorators
3. **Endpoint** (Controller) receives validated data
4. **Service** executes business logic
5. **Repository** (TypeORM) performs database operations
6. **Response DTO** is returned to the client

### Data Validation

Validation is performed using `class-validator` decorators:

- `@IsString()` - Validates string type
- `@IsNotEmpty()` - Ensures value is not empty
- `@IsOptional()` - Makes field optional
- `@IsEnum()` - Validates enum values
- `@IsDateString()` - Validates ISO date string
- `@MaxLength()` - Validates maximum string length
- `@Min()`, `@Max()` - Validates number range

Invalid requests return `400 Bad Request` with detailed error messages.

### Database Operations

TypeORM is used for all database operations:

- **Repositories**: Injected into services using `@InjectRepository()`
- **Query Builder**: Used for complex queries (e.g., search with ILIKE)
- **Transactions**: Can be used for atomic operations
- **Migrations**: Manage schema changes

### Error Handling

- **Validation Errors**: Automatically handled by ValidationPipe (400 status)
- **Not Found Errors**: Return 404 status
- **Server Errors**: Return 500 status with error details

## API Documentation

### Swagger/OpenAPI

Interactive API documentation is available at `/api/docs` when the server is running. The documentation includes:

- All available endpoints
- Request/response schemas
- Validation rules
- Example requests and responses
- Try-it-out functionality

### API Versioning

The API uses URL versioning:
- Current version: `v1`
- All task endpoints are under `/api/v1/tasks`

Future versions can be added as `v2`, `v3`, etc., maintaining backward compatibility.

## Docker Deployment

### Dockerfile

The project includes a multi-stage Dockerfile with three stages:

1. **Development Stage**: Installs dev dependencies and builds the application
2. **Builder Stage**: Installs only production dependencies
3. **Production Stage**: Minimal Alpine image with compiled application

### Building Docker Image

```bash
docker build -t task-management-backend .
```

### Running with Docker

```bash
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=task_management \
  task-management-backend
```

### Docker Compose

For a complete setup with PostgreSQL, use docker-compose (if available in the project root).

## Code Quality Tools

### ESLint

ESLint is configured with:
- TypeScript ESLint rules
- Prettier integration
- Recommended Node.js and Jest globals

Configuration file: `eslint.config.mjs`

### Prettier

Prettier is configured for consistent code formatting:
- Single quotes
- Trailing commas

Configuration file: `.prettierrc`

### TypeScript

TypeScript configuration includes:
- Strict null checks
- Decorator support (for NestJS)
- Source maps for debugging
- Incremental compilation

Configuration files:
- `tsconfig.json` - Main TypeScript configuration
- `tsconfig.build.json` - Build-specific configuration

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build` | Build the application |
| `npm run format` | Format code with Prettier |
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot-reload |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start in production mode |
| `npm run lint` | Lint and fix code |
| `npm run migration:generate` | Generate a new migration |
| `npm run migration:run` | Run pending migrations |
| `npm run migration:run:prod` | Run migrations in production |
| `npm run migration:revert` | Revert the last migration |
| `npm test` | Run node:test tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:jest` | Run Jest tests |
| `npm run test:all` | Run all tests |

## Best Practices

### Adding a New Feature

1. Create a new feature directory under `modules/{module}/apps/features/v1/{featureName}/`
2. Create three subdirectories: `contract/`, `endpoint/`, `services/`
3. Define DTOs in `contract/index.ts` with validation decorators
4. Create controller in `endpoint/index.ts` with Swagger decorators
5. Implement business logic in `services/index.ts`
6. Register the endpoint and service in the module file
7. Write tests for all three layers

### Code Organization

- Keep features independent and self-contained
- Use dependency injection for all dependencies
- Follow single responsibility principle
- Write tests for business logic
- Use TypeScript types strictly
- Document complex logic with comments

### Database Best Practices

- Always use migrations for schema changes
- Never use `synchronize: true` in production
- Use indexes for frequently queried columns
- Use transactions for multi-step operations
- Validate data at the application level

## Troubleshooting

### Common Issues

**Database connection errors**:
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

**Migration errors**:
- Check migration files are in `migrations/` directory
- Verify database connection
- Check for conflicting migrations

**Port already in use**:
- Change `PORT` in `.env`
- Or stop the process using port 3000

**TypeScript compilation errors**:
- Run `npm run build` to see detailed errors
- Check `tsconfig.json` configuration
- Ensure all dependencies are installed

## Contributing

When contributing to this project:

1. Follow the Vertical Slice Architecture pattern
2. Write tests for new features
3. Ensure all tests pass
4. Run linter and formatter
5. Update API documentation (Swagger decorators)
6. Follow TypeScript best practices

## License

This project is part of a private monorepo and is UNLICENSED.

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI Documentation](https://swagger.io/specification/)

---

For detailed setup instructions for the entire monorepo, see the main [README.md](../README.md) in the project root.
