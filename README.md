# Task Management Application

A full-stack task management application built with NestJS (backend) and React (frontend), following modern best practices and architectural patterns.

## Overview

This application provides a complete CRUD interface for managing tasks with features like filtering, searching, and pagination. The backend follows a Vertical Slice Architecture pattern, and the frontend uses modern React patterns with TanStack Router for file-based routing.

## Technical Stack

### Backend
- **Framework**: NestJS (latest stable version)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **API Documentation**: Swagger/OpenAPI
- **Testing**: node:test (Node.js built-in test runner)

### Frontend
- **Framework**: React (latest stable version)
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Form Validation**: Zod
- **State Management**: Zustand
- **HTTP Client**: Axios

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: v22.16.0 or above
- **PostgreSQL**: Latest stable version
- **npm** or **yarn** package manager
- **Git** for version control

## Project Structure

```
task-management-monorepo/
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── modules/
│   │   │   └── tasks/
│   │   │       ├── apps/
│   │   │       │   └── features/
│   │   │       │       └── v1/
│   │   │       │           ├── createTask/
│   │   │       │           ├── updateTask/
│   │   │       │           ├── removeTask/
│   │   │       │           ├── getTaskById/
│   │   │       │           └── getTasks/
│   │   │       ├── entities/
│   │   │       └── tasks.module.ts
│   │   ├── config/
│   │   ├── migrations/
│   │   └── main.ts
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── routes/          # TanStack Router file-based routes
│   │   ├── components/
│   │   ├── lib/
│   │   ├── store/
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd task-management-monorepo
```

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `backend` directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your PostgreSQL credentials:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=task_management
DB_SYNCHRONIZE=false
DB_LOGGING=false
FRONTEND_URL=http://localhost:5173
```

5. Create the PostgreSQL database:
```bash
createdb task_management
```

6. Run database migrations:
```bash
npm run migration:run
```

7. Start the backend server:
```bash
npm run start:dev
```

The backend API will be available at `http://localhost:3000`
Swagger documentation will be available at `http://localhost:3000/api/docs`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `frontend` directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file if needed:
```env
VITE_API_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## Running the Application

### Backend

```bash
cd backend
npm run start:dev      # Development mode with hot reload
npm run start          # Production mode
npm run start:prod     # Production build
```

### Frontend

```bash
cd frontend
npm run dev            # Development server
npm run build          # Production build
npm run preview        # Preview production build
```

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

### Backend Tests

Run unit tests using node:test:
```bash
cd backend
npm test
```

### Frontend Tests (Optional)

```bash
cd frontend
npm test
```

## API Endpoints

All API endpoints are prefixed with `/api/v1/tasks`

### Task Endpoints

- **POST** `/api/v1/tasks` - Create a new task
- **GET** `/api/v1/tasks` - Get list of tasks (with pagination, filtering, and search)
- **GET** `/api/v1/tasks/:id` - Get a task by ID
- **PUT** `/api/v1/tasks/:id` - Update a task
- **DELETE** `/api/v1/tasks/:id` - Delete a task

### Query Parameters (GET /api/v1/tasks)

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `priority` - Filter by priority (LOW, MEDIUM, HIGH)
- `search` - Search in title and description

### API Documentation

Swagger/OpenAPI documentation is available at:
```
http://localhost:3000/api/docs
```

## Frontend Routes

- `/` - Task list page with filtering and pagination
- `/tasks/new` - Create new task page
- `/tasks/:id` - Task detail page
- `/tasks/:id/edit` - Update task page

## Database Schema

### Tasks Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | NULL | Task description |
| status | ENUM | NOT NULL, DEFAULT 'PENDING' | Task status |
| priority | ENUM | NULL | Task priority |
| due_date | TIMESTAMP | NULL | Task due date |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

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

- ✅ Complete CRUD operations for tasks
- ✅ Task filtering by status and priority
- ✅ Search functionality
- ✅ Pagination
- ✅ Form validation (Zod on frontend, class-validator on backend)
- ✅ Error handling and user feedback
- ✅ Loading states
- ✅ Responsive design
- ✅ API documentation (Swagger)
- ✅ Unit tests for backend services

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting

### Git Workflow

- Use meaningful commit messages
- Create feature branches for new features
- Follow conventional commit format when possible

## Troubleshooting

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify database credentials in `.env`
3. Check if the database exists: `psql -l | grep task_management`

### Port Already in Use

If port 3000 (backend) or 5173 (frontend) is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically use the next available port

### Migration Issues

If migrations fail:
1. Check database connection
2. Verify migration files are in `src/migrations/`
3. Ensure `DB_SYNCHRONIZE=false` in `.env`

## License

This project is part of a technical assessment.

## Contact

For questions or issues, please refer to the problem statement document.
