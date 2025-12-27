import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Task } from '../modules/tasks/entities/task.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: `postgresql://${configService.get<string>('DB_USERNAME', 'postgres')}:${configService.get<string>('DB_PASSWORD', 'postgres')}@${configService.get<string>('DB_HOST', 'localhost')}:${configService.get<number>('DB_PORT', 5432)}/${configService.get<string>('DB_NAME', 'task_management')}`,
  entities: [Task],
  synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
  migrations: ['../migrations/*.ts'],
  migrationsRun: false,
  logging: configService.get<boolean>('DB_LOGGING', false),
});
