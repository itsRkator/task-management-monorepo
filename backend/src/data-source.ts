import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { existsSync, readdirSync } from 'node:fs';
import { Task } from './modules/tasks/entities/task.entity';

// Load environment variables the same way NestJS ConfigModule does
// @nestjs/config uses dotenv under the hood, so we use it directly for CLI tools
// This ensures consistency with how the application loads config in database.config.ts
import { config } from 'dotenv';

// Load .env file from the backend root (same path as NestJS ConfigModule uses)
config({ path: join(__dirname, '../.env') });

// Helper to parse boolean from environment variable (same logic as database.config.ts)
// Environment variables are strings, so 'false' is truthy
const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

// Get configuration values using the same defaults as database.config.ts
const getDatabaseConfig = () => ({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'task_management',
  synchronize: parseBoolean(process.env.DB_SYNCHRONIZE, false),
  logging: parseBoolean(process.env.DB_LOGGING, false),
});

const dbConfig = getDatabaseConfig();

// Determine migrations path based on environment
// In production (Docker), migrations are at /app/migrations
// In development, migrations are at the project root (relative to src/)
// Function to get migration files excluding test files
const getMigrations = (): string[] => {
  const migrationsDir =
    process.env.NODE_ENV === 'production'
      ? join(process.cwd(), 'migrations')
      : join(__dirname, '../migrations');

  if (!existsSync(migrationsDir)) {
    return [];
  }

  const files = readdirSync(migrationsDir);
  const migrationFiles = files
    .filter(
      (file) =>
        (file.endsWith('.ts') || file.endsWith('.js')) &&
        !file.endsWith('.spec.ts') &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.spec.js') &&
        !file.endsWith('.test.js'),
    )
    .map((file) => join(migrationsDir, file));

  return migrationFiles;
};

// Log migration path for debugging (only in production/Docker)
if (process.env.NODE_ENV === 'production') {
  const migrationsDir = join(process.cwd(), 'migrations');
  console.log('Migration path:', migrationsDir);
  console.log('Current working directory:', process.cwd());
  console.log('Migrations directory exists:', existsSync(migrationsDir));
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  // Explicitly import entities to exclude test entities (e.g., TestTask from test-utils)
  entities: [Task],
  // In production (Docker), migrations are at /app/migrations
  // In development, migrations are at the project root (relative to src/)
  // Exclude test files (.spec.ts, .test.ts, .spec.js, .test.js)
  migrations: getMigrations(),
  synchronize: dbConfig.synchronize,
  logging: true, // Enable logging to see what migrations are found
});
