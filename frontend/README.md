# Task Management UI - Frontend

## Overview

This is the frontend application for the Task Management system, built with **React 19**, **Vite**, and **TanStack Router**. The application provides a modern, responsive user interface for managing tasks with full CRUD operations, filtering, search, and pagination capabilities.

The frontend is designed with a focus on user experience, featuring a clean and intuitive interface with dark mode support, real-time feedback through toast notifications, and comprehensive form validation. It follows modern React best practices and uses TypeScript for type safety throughout.

## Technology Stack

### Core Framework & Language
- **React 19.2.x** - Modern UI library for building user interfaces
- **TypeScript 5.9.x** - Typed superset of JavaScript for enhanced developer experience
- **Vite 7.x** - Next-generation frontend build tool for fast development and optimized production builds

### Routing
- **TanStack Router 1.144.x** - Type-safe, file-based routing solution
  - File-based routing system
  - Type-safe route parameters and search params
  - Built-in code splitting and lazy loading

### Styling & UI
- **Tailwind CSS 4.1.x** - Utility-first CSS framework
- **Shadcn UI** - High-quality component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Beautiful icon library
- **class-variance-authority** - Component variant management
- **tailwind-merge** - Utility for merging Tailwind CSS classes
- **clsx** - Utility for constructing className strings

### State Management
- **Zustand 5.0.x** - Lightweight state management library
  - Simple API with minimal boilerplate
  - Built-in TypeScript support
  - Efficient re-renders

### Form Handling & Validation
- **React Hook Form 7.69.x** - Performant form library
- **Zod 4.2.x** - TypeScript-first schema validation
- **@hookform/resolvers** - Validation resolver for React Hook Form

### HTTP Client
- **Axios 1.13.x** - Promise-based HTTP client for API requests

### Notifications
- **Sonner 2.0.x** - Beautiful toast notification library

### Date Handling
- **date-fns 4.1.x** - Modern JavaScript date utility library

### Testing
- **Vitest 4.0.x** - Fast unit test framework powered by Vite
- **@testing-library/react** - Simple and complete React testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM elements
- **@testing-library/user-event** - Fire events the same way the user does
- **@vitest/ui** - Visual test runner interface
- **@vitest/coverage-v8** - Code coverage tool
- **jsdom** - DOM implementation for Node.js (for testing)

### Development Tools
- **ESLint** - Code linting with TypeScript and React support
- **TypeScript ESLint** - TypeScript-specific linting rules
- **@tanstack/router-devtools** - Development tools for TanStack Router
- **@tanstack/router-plugin** - Vite plugin for TanStack Router

## Architecture

### File-Based Routing

The application uses **TanStack Router's file-based routing system**, where routes are automatically generated based on the file structure in the `src/routes/` directory:

- `__root.tsx` - Root layout component (wraps all routes)
- `index.tsx` - Home page (task list)
- `$.tsx` - Catch-all route (404 page)
- `tasks/new.tsx` - Create task page
- `tasks/$taskId.tsx` - Task detail page (dynamic route)
- `tasks/$taskId.edit.tsx` - Edit task page (dynamic route)

### Component Architecture

The application follows a component-based architecture:

1. **Route Components** - Page-level components in `src/routes/`
2. **Feature Components** - Business logic components in `src/components/tasks/`
3. **UI Components** - Reusable UI primitives in `src/components/ui/`

### State Management Flow

1. **Zustand Store** (`src/store/taskStore.ts`) - Centralized state management
   - Manages tasks list, selected task, loading states, errors
   - Handles pagination and filters
   - Provides actions for all CRUD operations

2. **API Client** (`src/lib/api.ts`) - HTTP client layer
   - Axios instance with base configuration
   - Type-safe API methods for all endpoints
   - Type definitions for requests and responses

3. **Component Integration** - Components use the store via hooks
   - `useTaskStore()` hook provides state and actions
   - Components subscribe to relevant state slices
   - Actions trigger API calls and update state

### Data Flow

```
User Action → Component → Zustand Store → API Client → Backend API
                ↓              ↓              ↓
            UI Update ← State Update ← Response Handling
```

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Root component with router setup
│   ├── App.css                     # Application styles
│   ├── index.css                   # Global styles and Tailwind imports
│   │
│   ├── routes/                     # TanStack Router file-based routes
│   │   ├── __root.tsx              # Root layout with navigation
│   │   ├── index.tsx               # Task list page
│   │   ├── $.tsx                   # 404 Not Found page
│   │   ├── tasks/
│   │   │   ├── new.tsx             # Create task route
│   │   │   ├── $taskId.tsx         # Task detail route
│   │   │   └── $taskId.edit.tsx    # Edit task route
│   │   └── routeTree.gen.ts        # Auto-generated route tree
│   │
│   ├── components/
│   │   ├── tasks/
│   │   │   └── create-or-edit.tsx    # Shared create/edit form component
│   │   └── ui/                     # Shadcn UI components
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── sonner.tsx
│   │       ├── table.tsx
│   │       ├── textarea.tsx
│   │       └── use-form-field.tsx
│   │
│   ├── store/
│   │   └── taskStore.ts             # Zustand store for task state
│   │
│   ├── lib/
│   │   ├── api.ts                   # API client and type definitions
│   │   └── utils.ts                 # Utility functions (cn helper)
│   │
│   └── assets/                      # Static assets
│
├── tests/                           # Test files
│   ├── test/
│   │   ├── setup.ts                 # Test setup configuration
│   │   └── test-utils.tsx           # Testing utilities
│   ├── App.test.tsx
│   ├── main.test.tsx
│   ├── components/                  # Component tests
│   ├── routes/                      # Route tests
│   ├── store/                       # Store tests
│   └── lib/                          # Library tests
│
├── public/                           # Public static files
├── conf/                             # Configuration files (nginx, etc.)
│
├── package.json                      # Dependencies and scripts
├── vite.config.ts                    # Vite configuration
├── vitest.config.ts                  # Vitest test configuration
├── tsconfig.json                     # TypeScript configuration
├── tsconfig.app.json                 # App-specific TypeScript config
├── tsconfig.node.json                # Node-specific TypeScript config
├── tsconfig.test.json                # Test-specific TypeScript config
├── eslint.config.js                  # ESLint configuration
├── components.json                    # Shadcn UI configuration
├── index.html                        # HTML entry point
├── Dockerfile                        # Docker image definition
└── README.md                         # This file
```

## Features

### Task Management

#### 1. Task List Page (`/`)
- **Display**: Grid layout of task cards with responsive design
- **Filtering**: Filter by status (Pending, In Progress, Completed, Cancelled)
- **Priority Filter**: Filter by priority (Low, Medium, High)
- **Search**: Real-time search across task titles and descriptions
- **Pagination**: Navigate through pages of tasks
- **Actions**: Quick access to edit and delete from list view
- **Empty States**: Helpful messages when no tasks are found
- **Loading States**: Visual feedback during data fetching

#### 2. Create Task Page (`/tasks/new`)
- **Form Fields**:
  - Title (required, max 255 characters)
  - Description (optional, multi-line text)
  - Status (optional, defaults to Pending)
  - Priority (optional: Low, Medium, High, or None)
  - Due Date (optional, datetime picker)
- **Validation**: Real-time form validation with error messages
- **Success Handling**: Redirects to task list on success
- **Error Handling**: Displays error messages via toast notifications

#### 3. Task Detail Page (`/tasks/:id`)
- **Display**: Full task information in a detailed card layout
- **Information Shown**:
  - Title and description
  - Status with color-coded badge
  - Priority with color-coded badge
  - Due date (formatted)
  - Creation date and time
  - Last updated date and time
- **Actions**: Edit and delete buttons
- **Navigation**: Back button to return to task list
- **Loading States**: Shows loading spinner while fetching
- **Error Handling**: Displays error message if task not found

#### 4. Edit Task Page (`/tasks/:id/edit`)
- **Pre-filled Form**: Automatically loads existing task data
- **Validation**: Same validation rules as create form
- **Status Requirement**: Status is required when editing
- **Success Handling**: Redirects to task detail page on success
- **Cancel Action**: Returns to task detail page

#### 5. Delete Functionality
- **Confirmation Dialog**: Prevents accidental deletions
- **Available From**: Task list and task detail pages
- **Success Handling**: Refreshes task list and shows success message
- **Error Handling**: Displays error message if deletion fails

### User Interface Features

#### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Responsive layouts for sm, md, lg, xl screens
- **Adaptive Grid**: Task cards adjust based on screen size
- **Touch-Friendly**: Large tap targets for mobile interaction

#### Dark Mode
- **System Preference**: Respects user's system theme preference
- **Consistent Theming**: All components support dark mode
- **Color Scheme**: Carefully designed color palette for both modes
- **Accessibility**: High contrast ratios maintained in both modes

#### Visual Feedback
- **Toast Notifications**: Success and error messages via Sonner
- **Loading Indicators**: Spinners during async operations
- **Hover States**: Visual feedback on interactive elements
- **Active States**: Button press animations
- **Transitions**: Smooth animations for state changes

#### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Visible focus indicators
- **ARIA Labels**: Proper semantic HTML and ARIA attributes
- **Screen Reader Support**: Accessible component structure

## Setup

### Prerequisites

- **Node.js** 24.x or higher
- **npm** or **yarn** package manager
- **Backend API** running (see backend README for setup)

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   Create a `.env` file in the frontend root directory:
   ```env
   # API Configuration
   VITE_API_URL=http://localhost:3000/api
   VITE_API_URL_VERSION=v1
   ```

3. **Start the development server**:
   ```bash
   npm run start:dev
   # or
   npm run dev
   ```

The application will be available at `http://localhost:5173`

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` | No |
| `VITE_API_URL_VERSION` | API version prefix | `v1` | No |

**Note**: Vite requires the `VITE_` prefix for environment variables to be exposed to the client.

## Development

### Development Server

**Start with hot-reload**:
```bash
npm run start:dev
```

The development server includes:
- **Hot Module Replacement (HMR)** - Instant updates without page refresh
- **Fast Refresh** - Preserves component state during updates
- **TypeScript Checking** - Real-time type checking
- **Route Generation** - Auto-generates route tree on file changes

### Building for Production

**Build the application**:
```bash
npm run build
```

This will:
- Type-check the codebase
- Compile TypeScript to JavaScript
- Bundle and optimize assets
- Generate production-ready files in `dist/`

**Preview production build**:
```bash
npm run preview
```

Serves the production build locally for testing.

### Code Quality

**Linting**:
```bash
npm run lint
```

ESLint is configured with:
- TypeScript ESLint rules
- React Hooks rules
- React Refresh rules
- Custom rules for test files and routes

## Testing

### Test Structure

Tests are organized to mirror the source structure:
- Component tests in `tests/components/`
- Route tests in `tests/routes/`
- Store tests in `tests/store/`
- Library tests in `tests/lib/`

### Running Tests

**Run all tests**:
```bash
npm test
```

**Run tests in watch mode**:
```bash
npm test
# Press 'w' to enter watch mode
```

**Run tests with UI**:
```bash
npm run test:ui
```

Opens Vitest UI in browser for interactive testing.

**Run tests with coverage**:
```bash
npm run test:coverage
```

**Open coverage report**:
```bash
npm run test:coverage:open
```

**Run tests once (CI mode)**:
```bash
npm run test:run
```

### Test Configuration

- **Environment**: jsdom (browser-like environment)
- **Coverage Thresholds**: 100% for lines, functions, branches, statements
- **Coverage Exclusions**: Route files, config files, test files
- **Test Files**: `tests/**/*.{test,spec}.{ts,tsx}`

### Testing Utilities

- **Test Setup** (`tests/test/setup.ts`): Configures testing environment
- **Test Utils** (`tests/test/test-utils.tsx`): Custom render functions and helpers
- **@testing-library/react**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation

## How Things Work

### Application Bootstrap

1. **Entry Point** (`main.tsx`):
   - Renders React app in StrictMode
   - Mounts to `#root` element
   - Loads global CSS

2. **App Component** (`App.tsx`):
   - Creates TanStack Router instance
   - Configures route tree
   - Sets up 404 handler
   - Provides router to application

3. **Root Route** (`__root.tsx`):
   - Defines application layout
   - Renders navigation bar
   - Provides outlet for child routes
   - Includes toast notification system

### Routing System

**File-Based Routing**:
- Routes are automatically generated from file structure
- File names determine route paths:
  - `index.tsx` → `/`
  - `tasks/new.tsx` → `/tasks/new`
  - `tasks/$taskId.tsx` → `/tasks/:id`
  - `$.tsx` → Catch-all (404)

**Route Parameters**:
- Dynamic segments use `$` prefix: `$taskId`
- Accessed via `Route.useParams()` hook
- Type-safe parameter extraction

**Navigation**:
- `useNavigate()` hook for programmatic navigation
- `<Link>` component for declarative navigation
- Type-safe route references

### State Management

**Zustand Store Structure**:
```typescript
{
  // State
  tasks: Task[]
  selectedTask: Task | null
  loading: boolean
  error: string | null
  pagination: { page, limit, total, totalPages }
  filters: { status?, priority?, search? }
  
  // Actions
  fetchTasks()
  fetchTaskById()
  createTask()
  updateTask()
  deleteTask()
  setFilters()
  // ... setters
}
```

**State Updates**:
- Actions trigger API calls
- Loading state set during async operations
- Success: Update state with response data
- Error: Set error message in state
- Components automatically re-render on state changes

### Form Handling

**React Hook Form Integration**:
1. **Schema Definition**: Zod schemas for validation
2. **Form Setup**: `useForm()` hook with zodResolver
3. **Field Registration**: `register()` for input fields
4. **Controlled Components**: `useWatch()` for select fields
5. **Validation**: Automatic validation on submit
6. **Error Display**: Field-level error messages

**Validation Flow**:
- User types → React Hook Form tracks changes
- On submit → Zod schema validates data
- Errors → Displayed inline below fields
- Success → Submit handler called with validated data

### API Integration

**API Client** (`lib/api.ts`):
- Axios instance with base URL configuration
- Type-safe request/response interfaces
- Centralized error handling
- Environment-based configuration

**API Methods**:
- `getTasks(query)` - Fetch paginated task list
- `getTaskById(id)` - Fetch single task
- `createTask(data)` - Create new task
- `updateTask(id, data)` - Update existing task
- `deleteTask(id)` - Delete task

**Error Handling**:
- Axios errors caught in store actions
- Error messages extracted from response
- User-friendly error messages via toast
- Loading states reset on error

### Component Lifecycle

**Task List Page**:
1. Component mounts
2. `useEffect` triggers `fetchTasks()`
3. Store sets loading state
4. API call made
5. Response updates store
6. Component re-renders with tasks
7. User interactions trigger filter/page changes
8. New API calls made with updated params

**Task Detail Page**:
1. Route params extracted (`taskId`)
2. `useEffect` triggers `fetchTaskById()`
3. Store sets loading state
4. API call made
5. Response updates `selectedTask` in store
6. Component re-renders with task details

**Create/Edit Form**:
1. Component mounts
2. Edit mode: `useEffect` fetches task data
3. Form populated with default/loaded values
4. User fills form
5. Validation on submit
6. API call made
7. Success: Navigate to appropriate page
8. Error: Display toast notification

## Styling System

### Tailwind CSS

**Configuration**:
- Tailwind CSS 4.x with Vite plugin
- Custom color system with CSS variables
- Dark mode via `.dark` class
- Custom animations via `tw-animate-css`

**Design System**:
- **Colors**: Semantic color tokens (primary, secondary, destructive, etc.)
- **Spacing**: Consistent spacing scale
- **Typography**: System font stack with optimized rendering
- **Borders**: Consistent border radius and colors
- **Shadows**: Elevation system for depth

### Component Styling

**Shadcn UI Components**:
- Built on Radix UI primitives
- Styled with Tailwind CSS
- Fully customizable via CSS variables
- Accessible by default

**Custom Variants**:
- Button variants: `default`, `outline`, `ghost`, `create`, `edit`, `destructive`
- Badge variants: Status and priority color schemes
- Card components: Consistent card styling

### Dark Mode

**Implementation**:
- CSS variables for theme colors
- `.dark` class on root element
- Automatic theme detection (can be extended)
- Smooth transitions between themes

**Color Palette**:
- Light mode: White backgrounds, dark text
- Dark mode: Dark backgrounds, light text
- Consistent contrast ratios
- Accessible color combinations

## API Integration

### API Client Configuration

The API client is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
const API_URL_VERSION = import.meta.env.VITE_API_URL_VERSION ?? 'v1'
```

### Request/Response Types

All API interactions are fully typed:
- **Task**: Core task entity type
- **CreateTaskRequest**: Request payload for creating tasks
- **UpdateTaskRequest**: Request payload for updating tasks
- **GetTasksResponse**: Paginated response with metadata
- **GetTasksQuery**: Query parameters for filtering

### Error Handling

**Network Errors**:
- Connection failures
- Timeout errors
- CORS errors

**API Errors**:
- 400: Validation errors (displayed in forms)
- 404: Not found (handled with user-friendly messages)
- 500: Server errors (displayed via toast)

**Error Display**:
- Form errors: Inline below fields
- API errors: Toast notifications
- Store errors: Displayed in error sections

## Routes

### Available Routes

| Route | Path | Component | Description |
|-------|------|-----------|-------------|
| Home | `/` | `index.tsx` | Task list with filters and pagination |
| Create Task | `/tasks/new` | `tasks/new.tsx` | Create new task form |
| Task Detail | `/tasks/:id` | `tasks/$taskId.tsx` | View task details |
| Edit Task | `/tasks/:id/edit` | `tasks/$taskId.edit.tsx` | Edit task form |
| 404 | `*` | `$.tsx` | Not found page |

### Navigation

**Programmatic Navigation**:
```typescript
const navigate = useNavigate()
navigate({ to: '/tasks/new' })
navigate({ to: '/tasks/$taskId', params: { taskId: '123' } })
```

**Declarative Navigation**:
```tsx
<Link to="/tasks/new">Create Task</Link>
<Link to="/tasks/$taskId" params={{ taskId: task.id }}>
  View Task
</Link>
```

**Active Route Styling**:
- `activeProps` on `<Link>` components
- Automatic active state detection
- Visual indication of current route

## Docker Deployment

### Dockerfile

The project includes a multi-stage Dockerfile:

1. **Builder Stage**: Installs dependencies and builds the application
2. **Nginx Stage**: Serves the built application with Nginx

### Building Docker Image

```bash
docker build -t task-management-frontend .
```

### Running with Docker

```bash
docker run -p 80:80 task-management-frontend
```

### Nginx Configuration

The Dockerfile copies nginx configuration from `conf/nginx.conf`:
- Serves static files from `/usr/share/nginx/html`
- Handles client-side routing (SPA)
- Configurable via `conf/nginx.conf`

## Code Quality Tools

### ESLint

**Configuration** (`eslint.config.js`):
- TypeScript ESLint rules
- React Hooks rules
- React Refresh rules
- Custom rules for test files

**Rules**:
- Enforces React best practices
- Prevents common mistakes
- TypeScript-specific linting
- Relaxed rules for test files

### TypeScript

**Configuration Files**:
- `tsconfig.json` - Base configuration
- `tsconfig.app.json` - Application-specific config
- `tsconfig.node.json` - Node-specific config
- `tsconfig.test.json` - Test-specific config

**Features**:
- Strict type checking
- Path aliases (`@/*` → `src/*`)
- Modern ES features
- React JSX support

### Prettier

Code formatting is handled by ESLint with Prettier integration.

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Lint code |
| `npm test` | Run tests in watch mode |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:coverage:open` | Run tests with coverage and open report |
| `npm run test:run` | Run tests once (CI mode) |

## Best Practices

### Component Development

1. **Functional Components**: Use function components with hooks
2. **TypeScript**: Fully type all props and state
3. **Separation of Concerns**: Keep components focused and reusable
4. **Custom Hooks**: Extract reusable logic into custom hooks
5. **Error Boundaries**: Handle errors gracefully (can be added)

### State Management

1. **Zustand Store**: Use for global application state
2. **Local State**: Use `useState` for component-specific state
3. **Derived State**: Compute from store state when possible
4. **Optimistic Updates**: Consider for better UX (can be added)

### Form Handling

1. **React Hook Form**: Use for all forms
2. **Zod Schemas**: Define validation schemas
3. **Error Messages**: Display clear, actionable error messages
4. **Loading States**: Disable forms during submission

### API Integration

1. **Type Safety**: Use TypeScript interfaces for all API types
2. **Error Handling**: Handle all error cases gracefully
3. **Loading States**: Show loading indicators during requests
4. **Optimistic Updates**: Consider for better perceived performance

### Styling

1. **Tailwind Utilities**: Use utility classes for styling
2. **Component Variants**: Use CVA for component variants
3. **Dark Mode**: Ensure all components support dark mode
4. **Responsive Design**: Test on multiple screen sizes

### Testing

1. **Component Tests**: Test component behavior, not implementation
2. **User Interactions**: Test from user's perspective
3. **Edge Cases**: Test error states and edge cases
4. **Accessibility**: Test with screen readers when possible

## Troubleshooting

### Common Issues

**Port already in use**:
- Change port in `vite.config.ts` or use `--port` flag
- Kill process using port 5173

**API connection errors**:
- Verify backend is running
- Check `VITE_API_URL` in `.env`
- Check CORS configuration on backend

**Route not found**:
- Ensure route file exists in `src/routes/`
- Check file naming convention
- Restart dev server after adding routes

**Type errors**:
- Run `npm run build` to see all TypeScript errors
- Check `tsconfig.json` configuration
- Ensure all dependencies are installed

**Build errors**:
- Clear `dist/` directory
- Delete `node_modules` and reinstall
- Check for TypeScript errors

**Test failures**:
- Ensure test setup file is correct
- Check test environment configuration
- Verify all dependencies are installed

## Contributing

When contributing to this project:

1. Follow the existing code structure
2. Write tests for new features
3. Ensure all tests pass
4. Run linter before committing
5. Use TypeScript types strictly
6. Follow React best practices
7. Maintain accessibility standards
8. Support both light and dark modes

## Additional Resources

- [React Documentation](https://react.dev/)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)

---

For detailed setup instructions for the entire monorepo, see the main [README.md](../README.md) in the project root.
