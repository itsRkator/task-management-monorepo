import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from '../modules/tasks/entities/task.entity';

/**
 * Creates a test database configuration using SQLite in-memory database.
 * This configuration automatically converts enum columns to text for SQLite compatibility.
 */
export function getTestDatabaseConfig(): TypeOrmModuleOptions {
  return {
    type: 'sqlite',
    database: ':memory:',
    entities: [Task],
    synchronize: true,
    dropSchema: true,
    // SQLite doesn't support enums, TypeORM will automatically convert them to text
    // We need to ensure the entity metadata is properly handled
  };
}
