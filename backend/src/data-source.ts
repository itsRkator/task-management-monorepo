import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
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
// TypeORM needs the glob pattern as a string, not a joined path
const migrationsPath =
  process.env.NODE_ENV === 'production'
    ? `${join(process.cwd(), 'migrations')}/*.ts` // Absolute path with glob pattern
    : join(__dirname, '../migrations/*.ts');

// Log migration path for debugging (only in production/Docker)
if (process.env.NODE_ENV === 'production') {
  console.log('Migration path:', migrationsPath);
  console.log('Current working directory:', process.cwd());
  console.log(
    'Migrations directory exists:',
    existsSync(join(process.cwd(), 'migrations')),
  );
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  // Use glob pattern for entities (works in both dev and prod after build)
  entities: ['dist/**/*.entity{.ts,.js}'],
  // In production (Docker), migrations are at /app/migrations
  // In development, migrations are at the project root (relative to src/)
  migrations: [migrationsPath],
  synchronize: dbConfig.synchronize,
  logging: true, // Enable logging to see what migrations are found
});
