import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Task } from '../modules/tasks/entities/task.entity';
import { Logger } from '@nestjs/common';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const connectionString = `postgresql://${configService.get<string>('DB_USERNAME', 'postgres')}:${configService.get<string>('DB_PASSWORD', 'postgres')}@${configService.get<string>('DB_HOST', 'localhost')}:${configService.get<number>('DB_PORT', 5432)}/${configService.get<string>('DB_NAME', 'task_management')}`;
  const synchronize = configService.get<string>('DB_SYNCHRONIZE', 'false');
  const logging = configService.get<string>('DB_LOGGING', 'false');
  const migrationsRun = configService.get<string>('ENV', 'development');

  Logger.log('connectionString', connectionString);
  Logger.log('synchronize', synchronize);
  Logger.log('logging', logging);
  Logger.log('migrationsRun', migrationsRun);

  // Function to get migration files excluding test files
  const getMigrations = (): string[] => {
    const migrationsDir = join(__dirname, '../migrations');
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

  return {
    type: 'postgres',
    url: connectionString,
    entities: [Task],
    synchronize: synchronize === 'true',
    migrations: getMigrations(),
    migrationsRun: migrationsRun === 'production',
    logging: logging === 'true',
  };
};
