# Task Management Application

A full-stack task management application built with NestJS (backend) and React (frontend), following modern best practices and architectural patterns. This monorepo contains a complete, production-ready solution for managing tasks with a RESTful API backend and a modern, responsive frontend interface.

## Overview

This application provides a complete CRUD (Create, Read, Update, Delete) interface for managing tasks with advanced features like filtering, searching, and pagination. The project is organized as a monorepo, containing both the backend API and frontend application in separate directories.

### What This Application Does

The Task Management Application allows users to:

- **Create** new tasks with title, description, status, priority, and due date
- **View** tasks in a responsive grid/list layout with detailed information
- **Filter** tasks by status (Pending, In Progress, Completed, Cancelled) and priority (Low, Medium, High)
- **Search** tasks by title or description with real-time filtering
- **Edit** existing tasks with form validation
- **Delete** tasks with confirmation dialogs
- **Navigate** through paginated task lists

### Architecture Highlights

- **Backend**: Follows Vertical Slice Architecture pattern for maintainable, feature-focused code organization
- **Frontend**: Uses modern React patterns with TanStack Router for type-safe, file-based routing
- **Database**: PostgreSQL with TypeORM for type-safe database operations
- **API**: RESTful API with comprehensive Swagger/OpenAPI documentation
- **Testing**: Comprehensive test coverage with multiple testing frameworks
- **Deployment**: Docker-ready with docker-compose for easy local development and deployment

## Technical Stack

### Backend

**Core Framework & Language**

- **NestJS 11.x** - Progressive Node.js framework for building efficient, scalable server-side applications
- **TypeScript 5.9.x** - Typed superset of JavaScript for enhanced developer experience and type safety

**Database & ORM**

- **PostgreSQL** - Robust, open-source relational database
- **TypeORM 0.3.x** - Object-Relational Mapping library for TypeScript and JavaScript

**Validation & Transformation**

- **class-validator** - Decorator-based validation library
- **class-transformer** - Transformation and serialization library

**API Documentation**

- **Swagger/OpenAPI** - Interactive API documentation via `@nestjs/swagger`

**Testing**

- **node:test** - Node.js built-in test runner (primary testing framework)
- **Jest** - Additional testing framework for spec files
- **Sinon** - Standalone test spies, stubs, and mocks
- **Supertest** - HTTP assertions for E2E testing

### Frontend

**Core Framework & Language**

- **React 19.2.x** - Modern UI library for building user interfaces
- **TypeScript 5.9.x** - Typed superset of JavaScript for enhanced developer experience
- **Vite 7.x** - Next-generation frontend build tool for fast development and optimized production builds

**Routing**

- **TanStack Router 1.144.x** - Type-safe, file-based routing solution with automatic code splitting

**Styling & UI**

- **Tailwind CSS 4.1.x** - Utility-first CSS framework
- **Shadcn UI** - High-quality component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library

**State Management & Forms**

- **Zustand 5.0.x** - Lightweight state management library
- **React Hook Form 7.69.x** - Performant form library
- **Zod 4.2.x** - TypeScript-first schema validation

**HTTP Client & Notifications**

- **Axios 1.13.x** - Promise-based HTTP client for API requests
- **Sonner 2.0.x** - Beautiful toast notification library

**Testing**

- **Vitest 4.0.x** - Fast unit test framework powered by Vite
- **@testing-library/react** - Simple and complete React testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM elements

### Infrastructure & DevOps

- **Docker** - Containerization for consistent development and deployment
- **Docker Compose** - Multi-container orchestration for local development
- **Nginx** - Web server for serving frontend static files and proxying API requests

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v22.16.0 or above
- **PostgreSQL**: Latest stable version
- **npm** or **yarn** package manager
- **Git** for version control

## Project Structure

This monorepo is organized into two main applications: `backend` and `frontend`. Each application is self-contained with its own dependencies, configuration, and build process.

```
task-management-monorepo/
├── backend/                          # NestJS Backend API
│   ├── src/
│   │   ├── main.ts                   # Application entry point
│   │   ├── app.module.ts             # Root application module
│   │   ├── app.controller.ts         # Root controller (health check)
│   │   ├── app.service.ts            # Root service
│   │   ├── data-source.ts            # TypeORM data source for migrations
│   │   │
│   │   ├── config/
│   │   │   └── database.config.ts    # Database configuration factory
│   │   │
│   │   ├── modules/
│   │   │   └── tasks/
│   │   │       ├── tasks.module.ts   # Tasks feature module
│   │   │       │
│   │   │       ├── entities/
│   │   │       │   └── task.entity.ts # Task entity definition
│   │   │       │
│   │   │       └── apps/
│   │   │           └── features/
│   │   │               └── v1/        # API version 1
│   │   │                   ├── createTask/
│   │   │                   │   ├── contract/    # Request/Response DTOs
│   │   │                   │   ├── endpoint/    # HTTP controller
│   │   │                   │   └── services/    # Business logic
│   │   │                   ├── updateTask/
│   │   │                   ├── removeTask/
│   │   │                   ├── getTaskById/
│   │   │                   └── getTasks/
│   │   │
│   │   └── test-utils/               # Test utilities and helpers
│   │
│   ├── migrations/                   # Database migration files
│   ├── scripts/                      # Utility scripts (migration generation)
│   ├── test/                         # E2E tests
│   ├── dist/                         # Compiled JavaScript output
│   ├── coverage/                     # Test coverage reports
│   ├── Dockerfile                    # Docker image definition
│   ├── package.json                  # Dependencies and scripts
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── nest-cli.json                 # NestJS CLI configuration
│   └── README.md                     # Backend-specific documentation
│
├── frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── main.tsx                  # Application entry point
│   │   ├── App.tsx                    # Root component with router setup
│   │   │
│   │   ├── routes/                    # TanStack Router file-based routes
│   │   │   ├── __root.tsx            # Root layout with navigation
│   │   │   ├── index.tsx             # Task list page
│   │   │   ├── $.tsx                 # 404 Not Found page
│   │   │   ├── tasks/
│   │   │   │   ├── new.tsx           # Create task route
│   │   │   │   ├── $taskId.tsx       # Task detail route
│   │   │   │   └── $taskId.edit.tsx  # Edit task route
│   │   │   └── routeTree.gen.ts      # Auto-generated route tree
│   │   │
│   │   ├── components/
│   │   │   ├── tasks/
│   │   │   │   └── create-or-edit.tsx # Shared create/edit form component
│   │   │   └── ui/                   # Shadcn UI components
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── form.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       └── ... (other UI components)
│   │   │
│   │   ├── store/
│   │   │   └── taskStore.ts          # Zustand store for task state
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                # API client and type definitions
│   │   │   └── utils.ts              # Utility functions
│   │   │
│   │   └── assets/                   # Static assets
│   │
│   ├── tests/                        # Test files
│   ├── public/                       # Public static files
│   ├── conf/
│   │   └── nginx.conf                # Nginx configuration for Docker
│   ├── dist/                         # Production build output
│   ├── coverage/                     # Test coverage reports
│   ├── Dockerfile                    # Docker image definition
│   ├── package.json                  # Dependencies and scripts
│   ├── vite.config.ts                # Vite configuration
│   ├── vitest.config.ts              # Vitest test configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── README.md                     # Frontend-specific documentation
│
├── postgres/                         # PostgreSQL configuration (if needed)
├── docker-compose.yaml               # Docker Compose configuration
├── LICENSE                           # License file
└── README.md                         # This file (root documentation)
```

### Architecture Overview

**Backend Structure (Vertical Slice Architecture)**

- Each feature is a complete vertical slice containing:
  - `contract/` - Request/Response DTOs with validation
  - `endpoint/` - HTTP controllers
  - `services/` - Business logic
- This pattern ensures features are self-contained and maintainable

**Frontend Structure (File-based Routing)**

- Routes are automatically generated from file structure
- Components are organized by feature and reusability
- State management is centralized in Zustand stores
- API client provides type-safe communication with backend

## Setup Instructions

This guide will walk you through setting up the entire application from scratch. You can run the backend and frontend separately for development, or use Docker Compose for a complete containerized setup.

### Prerequisites Check

Before starting, ensure you have:

- **Node.js** v22.16.0 or above (check with `node --version`)
- **PostgreSQL** latest stable version (check with `psql --version`)
- **npm** or **yarn** package manager
- **Git** for version control
- **Docker** and **Docker Compose** (optional, for containerized setup)

### Option 1: Local Development Setup

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd task-management-monorepo
```

#### Step 2: Backend Setup

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This will install all required packages including NestJS, TypeORM, and other dependencies.

3. **Create environment file**:
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and update the database password. The `.env.example` file contains all required variables with default values. If you prefer to create manually, use the following content:

   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password_here
   DB_NAME=task_management
   DB_SYNCHRONIZE=false
   DB_LOGGING=false

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173
   ```

   **Important**: Replace `your_password_here` with your actual PostgreSQL password.

4. **Create PostgreSQL database**:

   ```bash
   # Using createdb command
   createdb task_management

   # Or using psql
   psql -U postgres
   CREATE DATABASE task_management;
   \q
   ```

5. **Run database migrations**:

   ```bash
   npm run migration:run
   ```

   This will create the `tasks` table and all necessary indexes.

6. **Start the backend server**:

   ```bash
   npm run start:dev
   ```

   The backend will start with hot-reload enabled. You should see:

   - Server running on `http://localhost:3000`
   - API available at `http://localhost:3000/api`
   - Swagger documentation at `http://localhost:3000/api/docs`
   - Health check at `http://localhost:3000/api/`

#### Step 3: Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):

   ```bash
   cd frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

   This will install React, Vite, TanStack Router, and all other frontend dependencies.

3. **Create environment file**:
   Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   The `.env.example` file contains all required variables. If you prefer to create manually:

   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3000/api
   VITE_API_URL_VERSION=v1
   ```

   **Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

4. **Start the development server**:

   ```bash
   npm run start:dev
   ```

   The frontend will start with hot-reload enabled. You should see:

   - Application available at `http://localhost:5173`
   - Automatic browser opening (if configured)
   - Hot Module Replacement (HMR) enabled

#### Step 4: Verify Setup

1. **Check backend health**:
   Open `http://localhost:3000/api/` in your browser. You should see:

   ```json
   { "status": "ok" }
   ```

2. **Check Swagger documentation**:
   Open `http://localhost:3000/api/docs` to see the interactive API documentation.

3. **Check frontend**:
   Open `http://localhost:5173` in your browser. You should see the task management interface.

4. **Test the integration**:
   - Create a new task from the frontend
   - Verify it appears in the task list
   - Check the Swagger docs to see the API call

### Option 2: Docker Compose Setup (Recommended for Quick Start)

This option sets up the entire stack (PostgreSQL, Backend, Frontend) using Docker Compose.

#### Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0 or above

#### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd task-management-monorepo
```

#### Step 2: Configure Environment Files

1. **Backend environment** (`backend/.env`):

   ```env
   PORT=3000
   NODE_ENV=production
   ENV=production
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=task_management
   DB_SYNCHRONIZE=false
   DB_LOGGING=false
   FRONTEND_URL=http://localhost
   ```

2. **Frontend environment** (`frontend/.env`):

   ```env
   VITE_API_URL=http://localhost/api
   VITE_API_URL_VERSION=v1
   ```

3. **PostgreSQL environment** (`postgres/.env`):
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=task_management
   ```

#### Step 3: Start All Services

```bash
docker-compose up --build
```

This will:

- Build Docker images for backend and frontend
- Start PostgreSQL container
- Start backend container (waits for PostgreSQL to be healthy)
- Start frontend container (waits for backend to be healthy)
- Run database migrations automatically

#### Step 4: Access the Application

- **Frontend**: `http://localhost` (port 80)
- **Backend API**: `http://localhost/api`
- **Swagger Docs**: `http://localhost/api/docs`
- **Health Check**: `http://localhost/api/`

#### Docker Compose Commands

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v

# Rebuild and restart
docker-compose up --build
```

### Troubleshooting Setup

**Backend won't start**:

- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Check if port 3000 is available: `lsof -i :3000`

**Frontend won't start**:

- Check if port 5173 is available
- Verify `VITE_API_URL` points to correct backend URL
- Check browser console for errors

**Database connection errors**:

- Verify PostgreSQL is running
- Check database exists: `psql -l | grep task_management`
- Verify credentials match in `.env`

**Docker issues**:

- Ensure Docker Desktop is running
- Check container logs: `docker-compose logs [service-name]`
- Try rebuilding: `docker-compose build --no-cache`

## Running the Application

### Development Mode

**Backend (Terminal 1)**:

```bash
cd backend
npm run start:dev      # Development mode with hot reload
```

**Frontend (Terminal 2)**:

```bash
cd frontend
npm run dev            # Development server with HMR
```

### Production Mode

**Backend**:

```bash
cd backend
npm run build          # Compile TypeScript to JavaScript
npm run start:prod     # Run production build
```

**Frontend**:

```bash
cd frontend
npm run build          # Build for production
npm run preview        # Preview production build locally
```

### Available Scripts

**Backend Scripts** (`backend/package.json`):

- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start with debugging enabled
- `npm run start:prod` - Start production server
- `npm run build` - Build the application
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run migration:run` - Run database migrations
- `npm run migration:revert` - Revert last migration
- `npm run migration:generate` - Generate new migration
- `npm run lint` - Lint and fix code

**Frontend Scripts** (`frontend/package.json`):

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code

## How It Works

### System Architecture Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │ ──────> │  Frontend   │ ──────> │   Backend   │
│  (User UI)  │ <────── │   (React)   │ <────── │  (NestJS)   │
└─────────────┘         └─────────────┘         └─────────────┘
                                                         │
                                                         ▼
                                                  ┌─────────────┐
                                                  │ PostgreSQL  │
                                                  │  Database   │
                                                  └─────────────┘
```

### Request Flow

1. **User Action**: User interacts with the frontend (clicks button, submits form, etc.)

2. **Frontend Processing**:

   - React component handles the user action
   - Zustand store action is called (e.g., `createTask`, `fetchTasks`)
   - API client (`lib/api.ts`) makes HTTP request to backend
   - Loading state is set, UI shows loading indicator

3. **Backend Processing**:

   - Request arrives at NestJS endpoint
   - Global ValidationPipe validates request DTO
   - Controller receives validated data
   - Service executes business logic
   - TypeORM repository performs database operation
   - Response DTO is returned

4. **Response Handling**:
   - Frontend receives response
   - Zustand store updates state with new data
   - React components re-render with updated data
   - Success/error toast notification is shown
   - Loading state is cleared

### Data Flow Example: Creating a Task

```
1. User fills form → React Hook Form validates → Zod schema validation
2. User clicks "Create Task" → Component calls store.createTask()
3. Store calls API client → Axios POST /api/v1/tasks
4. Backend receives request → ValidationPipe validates DTO
5. Controller → Service → Repository → Database INSERT
6. Database returns saved task → Service → Controller → Response
7. Frontend receives response → Store updates state → UI updates
8. Toast notification shown → User redirected to task list
```

### State Management

**Frontend State (Zustand)**:

- `tasks` - Array of task objects
- `selectedTask` - Currently viewed/edited task
- `loading` - Loading state for async operations
- `error` - Error messages
- `pagination` - Pagination metadata (page, limit, total, totalPages)
- `filters` - Current filter values (status, priority, search)

**Backend State (Database)**:

- Tasks stored in PostgreSQL `tasks` table
- Each task has: id, title, description, status, priority, due_date, timestamps
- Indexes on status, priority, and due_date for performance

### API Communication

**Request Format**:

```typescript
POST /api/v1/tasks
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the task management app",
  "status": "PENDING",
  "priority": "HIGH",
  "due_date": "2024-12-31T23:59:59Z"
}
```

**Response Format**:

```typescript
{
  "id": "uuid-here",
  "title": "Complete project",
  "description": "Finish the task management app",
  "status": "PENDING",
  "priority": "HIGH",
  "due_date": "2024-12-31T23:59:59Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Error Handling

**Frontend**:

- Form validation errors shown inline below fields
- API errors displayed via toast notifications
- Network errors handled gracefully with user-friendly messages

**Backend**:

- Validation errors return 400 with detailed messages
- Not found errors return 404
- Server errors return 500 with error details
- All errors logged for debugging

## Database Migrations

### Running Migrations

```bash
cd backend
npm run migration:run
```

### Reverting Migrations

```bash
cd backend
npm run migration:revert
```

### Generating New Migrations

```bash
cd backend
npm run migration:generate
# The command will prompt you to enter the migration name
```

## Testing

The project includes comprehensive testing for both backend and frontend, ensuring code quality and reliability.

### Backend Testing

**Test Frameworks**:

- **node:test** - Primary testing framework (Node.js built-in)
- **Jest** - Secondary framework for spec-style tests
- **Sinon** - Mocking and stubbing library
- **Supertest** - HTTP assertions for E2E testing

**Running Backend Tests**:

```bash
cd backend

# Run all node:test tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run Jest tests
npm run test:jest

# Run all tests (both frameworks)
npm run test:all
```

**Test Structure**:

- Unit tests for services (`*.test.ts`)
- Spec tests for modules (`*.spec.ts`)
- E2E tests in `test/` directory
- Test utilities in `src/test-utils/`

**Coverage**:

- Code coverage reports generated in `coverage/` directory
- Coverage thresholds can be configured
- Reports available in HTML, JSON, and LCOV formats

### Frontend Testing

**Test Frameworks**:

- **Vitest** - Fast unit test framework powered by Vite
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom DOM matchers
- **@testing-library/user-event** - User interaction simulation

**Running Frontend Tests**:

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (CI mode)
npm run test:run

# Open coverage report
npm run test:coverage:open
```

**Test Structure**:

- Component tests in `tests/components/`
- Route tests in `tests/routes/`
- Store tests in `tests/store/`
- Library tests in `tests/lib/`
- Test setup in `tests/test/setup.ts`

**Coverage**:

- 100% coverage thresholds for lines, functions, branches, statements
- Coverage reports in `coverage/` directory
- Route files excluded from coverage (declaration-only code)

### Test Best Practices

1. **Write Tests First**: Consider TDD approach for new features
2. **Test Behavior**: Test what the code does, not how it does it
3. **Isolation**: Each test should be independent
4. **Coverage**: Aim for high coverage, especially for business logic
5. **Maintainability**: Keep tests readable and maintainable

### Continuous Integration

Tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Backend Tests
  run: |
    cd backend
    npm test
    npm run test:coverage

- name: Run Frontend Tests
  run: |
    cd frontend
    npm run test:run
    npm run test:coverage
```

## API Endpoints

All API endpoints are prefixed with `/api/v1/tasks`. The API follows RESTful conventions and returns JSON responses.

### Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: Configure via `VITE_API_URL` environment variable

### Task Endpoints

#### 1. Create Task

- **Method**: `POST`
- **Endpoint**: `/api/v1/tasks`
- **Description**: Creates a new task
- **Request Body**:
  ```json
  {
    "title": "Complete project documentation",
    "description": "Write comprehensive docs",
    "status": "PENDING",
    "priority": "HIGH",
    "due_date": "2024-12-31T23:59:59Z"
  }
  ```
- **Response**: `201 Created` with task object
- **Validation**:
  - `title` (required, string, max 255 chars)
  - `description` (optional, string)
  - `status` (optional, enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - `priority` (optional, enum: LOW, MEDIUM, HIGH)
  - `due_date` (optional, ISO date string)

#### 2. List Tasks

- **Method**: `GET`
- **Endpoint**: `/api/v1/tasks`
- **Description**: Retrieves paginated list of tasks with filtering and search
- **Query Parameters**:
  - `page` (optional, default: 1, min: 1) - Page number
  - `limit` (optional, default: 10, min: 1, max: 100) - Items per page
  - `status` (optional, enum) - Filter by status
  - `priority` (optional, enum) - Filter by priority
  - `search` (optional, string) - Search in title and description (case-insensitive)
- **Response**: `200 OK` with paginated data
  ```json
  {
    "data": [
      /* array of tasks */
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
  ```

#### 3. Get Task by ID

- **Method**: `GET`
- **Endpoint**: `/api/v1/tasks/:id`
- **Description**: Retrieves a single task by UUID
- **Path Parameter**: `id` (UUID)
- **Response**: `200 OK` with task object or `404 Not Found`

#### 4. Update Task

- **Method**: `PUT`
- **Endpoint**: `/api/v1/tasks/:id`
- **Description**: Updates an existing task
- **Path Parameter**: `id` (UUID)
- **Request Body**:
  ```json
  {
    "title": "Updated title",
    "description": "Updated description",
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "due_date": "2024-12-31T23:59:59Z"
  }
  ```
- **Validation**: Same as create, but `status` is required
- **Response**: `200 OK` with updated task object

#### 5. Delete Task

- **Method**: `DELETE`
- **Endpoint**: `/api/v1/tasks/:id`
- **Description**: Deletes a task by UUID
- **Path Parameter**: `id` (UUID)
- **Response**: `204 No Content` on success, `404 Not Found` if task doesn't exist

#### 6. Health Check

- **Method**: `GET`
- **Endpoint**: `/api/`
- **Description**: Returns API health status
- **Response**: `200 OK`
  ```json
  { "status": "ok" }
  ```

### Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Validation error or invalid request
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### API Documentation

**Interactive Swagger/OpenAPI Documentation**:

- **URL**: `http://localhost:3000/api/docs`
- **Features**:
  - View all available endpoints
  - See request/response schemas
  - Try out API calls directly
  - View validation rules
  - See example requests and responses

### Example API Calls

**Using cURL**:

```bash
# Create a task
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "status": "PENDING",
    "priority": "HIGH"
  }'

# Get tasks with filters
curl "http://localhost:3000/api/v1/tasks?status=PENDING&priority=HIGH&page=1&limit=10"

# Get task by ID
curl http://localhost:3000/api/v1/tasks/{task-id}

# Update task
curl -X PUT http://localhost:3000/api/v1/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task",
    "status": "COMPLETED"
  }'

# Delete task
curl -X DELETE http://localhost:3000/api/v1/tasks/{task-id}
```

**Using JavaScript/TypeScript**:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Create task
const task = await api.post('/tasks', {
  title: 'New Task',
  status: 'PENDING',
  priority: 'HIGH',
});

// Get tasks
const tasks = await api.get('/tasks', {
  params: { status: 'PENDING', page: 1, limit: 10 },
});
```

**Using Postman Collection**:

A complete Postman collection is available in the project root:
- **File**: `Task_Management_API.postman_collection.json`
- **Import**: Import this file into Postman to get all API endpoints pre-configured
- **Features**:
  - All CRUD operations (Create, Read, Update, Delete)
  - Filtering and search examples
  - Pagination examples
  - Pre-configured variables (`base_url`, `task_id`)
  - Example requests with sample data
  - Health check endpoint

To use:
1. Open Postman
2. Click "Import" button
3. Select `Task_Management_API.postman_collection.json`
4. Update the `base_url` variable if needed (default: `http://localhost:3000`)
5. Start testing the API!

## Frontend Routes

- `/` - Task list page with filtering and pagination
- `/tasks/new` - Create new task page
- `/tasks/:id` - Task detail page
- `/tasks/:id/edit` - Update task page

## Database Schema

### Tasks Table

| Column      | Type         | Constraints                 | Description           |
| ----------- | ------------ | --------------------------- | --------------------- |
| id          | UUID         | PRIMARY KEY                 | Unique identifier     |
| title       | VARCHAR(255) | NOT NULL                    | Task title            |
| description | TEXT         | NULL                        | Task description      |
| status      | ENUM         | NOT NULL, DEFAULT 'PENDING' | Task status           |
| priority    | ENUM         | NULL                        | Task priority         |
| due_date    | TIMESTAMP    | NULL                        | Task due date         |
| created_at  | TIMESTAMP    | NOT NULL                    | Creation timestamp    |
| updated_at  | TIMESTAMP    | NOT NULL                    | Last update timestamp |

### Enums

**Status**: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
**Priority**: LOW, MEDIUM, HIGH

### Indexes

- Index on `status` column
- Index on `priority` column
- Index on `due_date` column

## Architecture

### Backend: Vertical Slice Architecture

Each feature is organized as a complete vertical slice:

```
modules/tasks/apps/features/v1/{featureName}/
├── contract/
│   └── index.ts          # Request/Response DTOs with validation
├── endpoint/
│   └── index.ts          # Controller/Endpoint (HTTP handlers)
└── services/
    └── index.ts          # Business logic service
```

### Frontend: File-based Routing

Routes are automatically generated from the file structure in `src/routes/`:

- `__root.tsx` - Root layout
- `index.tsx` - Home/Task list page
- `tasks/new.tsx` - Create task page
- `tasks/$taskId.tsx` - Task detail page
- `tasks/$taskId.edit.tsx` - Update task page

## Environment Variables

### Backend (.env)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=task_management
DB_SYNCHRONIZE=false
DB_LOGGING=false
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000/api
```

## Features

### Core Functionality

#### 1. Complete CRUD Operations

- **Create**: Add new tasks with title, description, status, priority, and due date
- **Read**: View task lists with pagination and individual task details
- **Update**: Edit existing tasks with form validation
- **Delete**: Remove tasks with confirmation dialogs

#### 2. Advanced Filtering & Search

- **Status Filter**: Filter tasks by status (Pending, In Progress, Completed, Cancelled)
- **Priority Filter**: Filter tasks by priority (Low, Medium, High)
- **Search**: Real-time search across task titles and descriptions (case-insensitive)
- **Combined Filters**: Use multiple filters simultaneously
- **Pagination**: Navigate through large task lists efficiently

#### 3. User Experience Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Full dark mode support with system preference detection
- **Loading States**: Visual feedback during data operations
- **Error Handling**: User-friendly error messages and validation feedback
- **Toast Notifications**: Success and error notifications via Sonner
- **Form Validation**: Real-time validation with clear error messages
- **Empty States**: Helpful messages when no tasks are found

#### 4. Technical Features

- **Type Safety**: Full TypeScript coverage across frontend and backend
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Database Migrations**: Version-controlled database schema changes
- **Testing**: Comprehensive test coverage with multiple frameworks
- **Code Quality**: ESLint, Prettier, and TypeScript strict mode
- **Hot Reload**: Fast development experience with HMR

#### 5. Architecture & Best Practices

- **Vertical Slice Architecture**: Feature-focused backend organization
- **File-based Routing**: Type-safe routing with TanStack Router
- **State Management**: Centralized state with Zustand
- **Form Management**: Efficient forms with React Hook Form
- **Validation**: Schema-based validation with Zod and class-validator
- **Error Boundaries**: Graceful error handling (can be extended)

### Feature Details

#### Task Management

- **Task Properties**:
  - Unique UUID identifier
  - Title (required, max 255 characters)
  - Description (optional, unlimited text)
  - Status (enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
  - Priority (enum: LOW, MEDIUM, HIGH, or null)
  - Due date (optional, datetime)
  - Automatic timestamps (created_at, updated_at)

#### Filtering & Search

- **Status Filtering**: Filter by any task status
- **Priority Filtering**: Filter by priority level
- **Text Search**: Searches in both title and description fields
- **Case-Insensitive**: Search works regardless of case
- **Real-time**: Filters apply as you type (debounced)

#### Pagination

- **Configurable Page Size**: 1-100 items per page (default: 10)
- **Page Navigation**: Previous/Next buttons with page numbers
- **Total Count**: Shows total number of tasks
- **Metadata**: Displays current page and total pages

#### Form Validation

- **Frontend**: Zod schemas with React Hook Form
- **Backend**: class-validator decorators
- **Real-time**: Validation occurs as user types
- **Clear Errors**: Field-specific error messages
- **Required Fields**: Visual indicators for required fields

#### Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Responsive layouts for sm, md, lg, xl screens
- **Adaptive Grid**: Task cards adjust based on screen size
- **Touch-Friendly**: Large tap targets for mobile interaction
- **Navigation**: Mobile-optimized navigation menu

#### Dark Mode

- **System Preference**: Respects user's system theme
- **Consistent Theming**: All components support dark mode
- **Color Scheme**: Carefully designed color palette
- **Accessibility**: High contrast ratios maintained

## Development Workflow

### Code Style & Standards

**TypeScript**:

- Strict mode enabled for type safety
- Consistent code formatting
- Type definitions for all public APIs

**Linting**:

- **ESLint** - Code linting with TypeScript and React rules
- **Prettier** - Automatic code formatting
- Linting runs automatically on save (if configured in IDE)

**Code Organization**:

- Follow existing patterns and conventions
- Keep functions small and focused
- Use meaningful variable and function names
- Add comments for complex logic

### Git Workflow

**Branching Strategy**:

- `main` - Production-ready code
- `develop` - Development branch (if using Git Flow)
- Feature branches: `feature/feature-name`
- Bug fix branches: `fix/bug-description`

**Commit Messages**:

- Use meaningful, descriptive commit messages
- Follow conventional commit format when possible:
  ```
  feat: add task filtering by priority
  fix: resolve pagination issue
  docs: update API documentation
  refactor: improve error handling
  test: add tests for task service
  ```

**Pull Request Process**:

1. Create feature branch from `main`
2. Make changes and commit
3. Write/update tests
4. Ensure all tests pass
5. Update documentation if needed
6. Create pull request with description
7. Address review comments
8. Merge after approval

### Development Best Practices

**Backend Development**:

1. **Follow Vertical Slice Architecture**:

   - Keep feature code together (contract, endpoint, service)
   - Don't create shared services unless truly needed
   - Each feature should be self-contained

2. **Write Tests**:

   - Unit tests for services
   - Integration tests for endpoints
   - Test edge cases and error scenarios

3. **Database Changes**:

   - Always use migrations for schema changes
   - Never use `synchronize: true` in production
   - Test migrations on sample data

4. **API Design**:
   - Follow RESTful conventions
   - Use appropriate HTTP status codes
   - Provide clear error messages
   - Document in Swagger

**Frontend Development**:

1. **Component Structure**:

   - Keep components small and focused
   - Extract reusable logic into custom hooks
   - Use TypeScript for all props and state

2. **State Management**:

   - Use Zustand for global state
   - Use local state for component-specific data
   - Avoid prop drilling

3. **Forms**:

   - Use React Hook Form for all forms
   - Validate with Zod schemas
   - Show clear error messages

4. **Styling**:
   - Use Tailwind utility classes
   - Support both light and dark modes
   - Ensure responsive design
   - Test on multiple screen sizes

### Local Development Setup

**Recommended Workflow**:

1. Start PostgreSQL (if not using Docker)
2. Start backend in one terminal: `cd backend && npm run start:dev`
3. Start frontend in another terminal: `cd frontend && npm run dev`
4. Make changes and see hot-reload in action
5. Run tests before committing

**Debugging**:

- **Backend**: Use `npm run start:debug` for debugging
- **Frontend**: Use browser DevTools and React DevTools
- **Database**: Use `psql` or database GUI tools
- **Network**: Use browser Network tab or Postman

### Code Review Checklist

Before submitting code for review:

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.logs or debug code
- [ ] TypeScript types are correct
- [ ] No linting errors
- [ ] Code is formatted with Prettier
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

## Contributing

### Getting Started

1. **Fork the repository** (if applicable)
2. **Clone your fork**:

   ```bash
   git clone <your-fork-url>
   cd task-management-monorepo
   ```

3. **Set up development environment** (see Setup Instructions)

4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. **Make your changes** following the development guidelines
2. **Write tests** for new functionality
3. **Update documentation** as needed
4. **Run tests** to ensure everything passes
5. **Commit your changes** with meaningful messages

### Submitting Changes

1. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** with:

   - Clear description of changes
   - Reference to related issues
   - Screenshots (for UI changes)
   - Test results

3. **Address review feedback** promptly

### Contribution Guidelines

- **Code Quality**: Maintain high code quality standards
- **Testing**: Add tests for new features
- **Documentation**: Update relevant documentation
- **Communication**: Be respectful and constructive
- **Scope**: Keep changes focused and manageable

### Areas for Contribution

- Bug fixes
- New features
- Performance improvements
- Documentation improvements
- Test coverage improvements
- UI/UX enhancements
- Accessibility improvements

## Deployment

### Production Build

#### Backend Production Build

```bash
cd backend

# Build the application
npm run build

# Start production server
npm run start:prod
```

**Production Considerations**:

- Set `NODE_ENV=production` in environment
- Set `DB_SYNCHRONIZE=false` (never use true in production)
- Configure proper database connection pooling
- Set up logging and monitoring
- Configure CORS for production frontend URL
- Use environment-specific `.env` files

#### Frontend Production Build

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview
```

**Production Considerations**:

- Set `VITE_API_URL` to production backend URL
- Build generates optimized, minified assets
- Static files can be served by any web server (Nginx, Apache, CDN)
- Configure proper caching headers
- Set up HTTPS in production

### Docker Deployment

#### Using Docker Compose

The project includes a `docker-compose.yaml` file for easy deployment:

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

#### Individual Docker Images

**Backend**:

```bash
cd backend
docker build -t task-management-backend .
docker run -p 3000:3000 \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_NAME=task_management \
  task-management-backend
```

**Frontend**:

```bash
cd frontend
docker build -t task-management-frontend .
docker run -p 80:80 task-management-frontend
```

### Environment Configuration

**Production Environment Variables**:

**Backend** (`.env`):

```env
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=task_management
DB_SYNCHRONIZE=false
DB_LOGGING=false
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend** (`.env`):

```env
VITE_API_URL=https://your-api-domain.com/api
VITE_API_URL_VERSION=v1
```

### Deployment Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] CORS configured for production frontend URL
- [ ] HTTPS enabled (for production)
- [ ] Database backups configured
- [ ] Logging and monitoring set up
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Security headers configured
- [ ] Rate limiting configured (if needed)

## Troubleshooting

### Common Issues and Solutions

#### Database Connection Issues

**Problem**: Backend cannot connect to PostgreSQL

**Solutions**:

1. **Check PostgreSQL is running**:

   ```bash
   pg_isready
   # or
   sudo systemctl status postgresql
   ```

2. **Verify database credentials** in `backend/.env`:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=task_management
   ```

3. **Check if database exists**:

   ```bash
   psql -l | grep task_management
   ```

4. **Create database if missing**:

   ```bash
   createdb task_management
   ```

5. **Test connection manually**:
   ```bash
   psql -h localhost -U postgres -d task_management
   ```

#### Port Already in Use

**Problem**: Port 3000 (backend) or 5173 (frontend) is already in use

**Solutions**:

**Backend**:

- Change `PORT` in `backend/.env`:
  ```env
  PORT=3001
  ```
- Or kill the process using the port:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

**Frontend**:

- Vite will automatically use the next available port
- Or specify a port in `vite.config.ts`:
  ```typescript
  server: {
    port: 5174;
  }
  ```

#### Migration Issues

**Problem**: Database migrations fail

**Solutions**:

1. **Check database connection** (see above)
2. **Verify migration files exist** in `backend/migrations/`
3. **Ensure `DB_SYNCHRONIZE=false`** in `.env`
4. **Check migration status**:
   ```bash
   cd backend
   npm run migration:run
   ```
5. **Revert and re-run** if needed:
   ```bash
   npm run migration:revert
   npm run migration:run
   ```

#### Frontend API Connection Issues

**Problem**: Frontend cannot connect to backend API

**Solutions**:

1. **Verify backend is running**:

   - Check `http://localhost:3000/api/` returns `{ "status": "ok" }`

2. **Check `VITE_API_URL`** in `frontend/.env`:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Check CORS configuration** in backend:

   - Ensure `FRONTEND_URL` in backend `.env` matches frontend URL

4. **Check browser console** for CORS errors

5. **Verify network connectivity**:
   ```bash
   curl http://localhost:3000/api/
   ```

#### TypeScript Compilation Errors

**Problem**: TypeScript errors during build

**Solutions**:

1. **Check TypeScript version**:

   ```bash
   npm list typescript
   ```

2. **Run type check**:

   ```bash
   # Backend
   cd backend
   npm run build

   # Frontend
   cd frontend
   npm run build
   ```

3. **Clear and reinstall**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Docker Issues

**Problem**: Docker containers won't start

**Solutions**:

1. **Check Docker is running**:

   ```bash
   docker ps
   ```

2. **View container logs**:

   ```bash
   docker-compose logs [service-name]
   ```

3. **Rebuild containers**:

   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

4. **Check environment files**:

   - Ensure `.env` files exist in `backend/` and `frontend/`
   - Verify environment variables are set correctly

5. **Check port conflicts**:
   - Ensure ports 80, 3000, 5432 are not in use

#### Test Failures

**Problem**: Tests are failing

**Solutions**:

1. **Run tests individually** to identify failing test
2. **Check test database configuration**
3. **Clear test cache**:

   ```bash
   # Frontend
   rm -rf node_modules/.vite

   # Backend
   rm -rf dist coverage
   ```

4. **Update dependencies**:
   ```bash
   npm update
   ```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**:

   - Backend: Check terminal output or log files
   - Frontend: Check browser console and terminal output
   - Docker: `docker-compose logs`

2. **Review documentation**:

   - Backend README: `backend/README.md`
   - Frontend README: `frontend/README.md`

3. **Check GitHub Issues** (if applicable)

4. **Verify environment setup**:
   - Node.js version matches requirements
   - PostgreSQL is running and accessible
   - All dependencies are installed

## Additional Resources

### Documentation

- **Backend Documentation**: See `backend/README.md` for detailed backend documentation
- **Frontend Documentation**: See `frontend/README.md` for detailed frontend documentation
- **API Documentation**: Interactive Swagger docs at `http://localhost:3000/api/docs`

### Technology Documentation

**Backend Technologies**:

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [class-validator Documentation](https://github.com/typestack/class-validator)
- [Swagger/OpenAPI Documentation](https://swagger.io/specification/)

**Frontend Technologies**:

- [React Documentation](https://react.dev/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

**Testing**:

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Node.js Test Documentation](https://nodejs.org/api/test.html)

**DevOps**:

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Project Structure Quick Reference

**Key Directories**:

- `backend/src/modules/tasks/apps/features/v1/` - Feature implementations
- `backend/migrations/` - Database migration files
- `frontend/src/routes/` - Application routes
- `frontend/src/components/` - React components
- `frontend/src/store/` - State management

**Key Files**:

- `backend/src/main.ts` - Backend entry point
- `backend/src/app.module.ts` - Root module
- `frontend/src/main.tsx` - Frontend entry point
- `frontend/src/App.tsx` - Root component
- `docker-compose.yaml` - Docker Compose configuration

### Common Commands Reference

**Backend**:

```bash
cd backend
npm run start:dev          # Start development server
npm run build              # Build for production
npm test                   # Run tests
npm run migration:run      # Run migrations
npm run lint               # Lint code
```

**Frontend**:

```bash
cd frontend
npm run dev                # Start development server
npm run build              # Build for production
npm test                   # Run tests
npm run lint               # Lint code
```

**Docker**:

```bash
docker-compose up           # Start all services
docker-compose down         # Stop all services
docker-compose logs -f      # View logs
docker-compose build        # Rebuild images
```

### Performance Tips

**Backend**:

- Use database indexes for frequently queried columns
- Implement pagination for large datasets
- Use connection pooling for database connections
- Cache frequently accessed data (if needed)

**Frontend**:

- Code splitting with TanStack Router
- Lazy load components when possible
- Optimize images and assets
- Use React.memo for expensive components

### Security Considerations

- **Environment Variables**: Never commit `.env` files
- **API Keys**: Store securely, never in code
- **CORS**: Configure properly for production
- **Input Validation**: Validate on both frontend and backend
- **SQL Injection**: Use parameterized queries (TypeORM handles this)
- **XSS**: React automatically escapes content
- **HTTPS**: Use in production

### Monitoring & Logging

**Backend Logging**:

- Configure logging levels in production
- Use structured logging
- Monitor error rates
- Track API response times

**Frontend Monitoring**:

- Monitor JavaScript errors
- Track page load times
- Monitor API call success rates
- Use error tracking services (e.g., Sentry)

## License

This project is part of a technical assessment.

## Support & Contact

For questions, issues, or contributions:

- Review the detailed documentation in `backend/README.md` and `frontend/README.md`
- Check the troubleshooting section above
- Refer to the problem statement document (if applicable)
- Review the API documentation at `/api/docs` when the backend is running

---

**Last Updated**: This README is maintained as part of the project documentation. For the most up-to-date information, refer to the individual README files in the `backend/` and `frontend/` directories.
