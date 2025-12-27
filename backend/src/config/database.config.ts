import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Task } from '../modules/tasks/entities/task.entity';
import { Logger } from '@nestjs/common';

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

  return {
    type: 'postgres',
    url: connectionString,
    entities: [Task],
    synchronize: synchronize === 'true',
    migrations: [
      process.env.NODE_ENV === 'production'
        ? '../migrations/*.js'
        : '../migrations/*.ts',
    ],
    migrationsRun: migrationsRun === 'production',
    logging: logging === 'true',
  };
};
