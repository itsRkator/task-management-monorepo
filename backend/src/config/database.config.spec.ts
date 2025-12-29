import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';
import { Task } from '../modules/tasks/entities/task.entity';

describe('database.config', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  describe('getDatabaseConfig', () => {
    it('should return database config with default values', () => {
      const config = getDatabaseConfig(configService);

      expect(config).toBeDefined();
      expect(config.type).toBe('postgres');
      const configAny = config as any;
      expect(configAny.url).toContain('postgresql://');
      expect(config.entities).toContain(Task);
      expect(config.synchronize).toBe(false);
      expect(configAny.logging).toBe(false);
    });

    it('should use default values when env vars are not set', () => {
      const config = getDatabaseConfig(configService);
      const configAny = config as any;

      expect(configAny.url).toContain('postgres');
      expect(configAny.url).toContain('localhost');
      expect(configAny.url).toContain('5432');
      expect(configAny.url).toContain('task_management');
    });

    it('should use environment variables when set', () => {
      process.env.DB_USERNAME = 'custom_user';
      process.env.DB_PASSWORD = 'custom_pass';
      process.env.DB_HOST = 'custom_host';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'custom_db';
      process.env.DB_SYNCHRONIZE = 'true';
      process.env.DB_LOGGING = 'true';

      const config = getDatabaseConfig(configService);
      const configAny = config as any;

      expect(configAny.url).toContain('custom_user');
      expect(configAny.url).toContain('custom_pass');
      expect(configAny.url).toContain('custom_host');
      expect(configAny.url).toContain('5433');
      expect(configAny.url).toContain('custom_db');
      expect(config.synchronize).toBe(true);
      expect(configAny.logging).toBe(true);

      // Cleanup
      delete process.env.DB_USERNAME;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_SYNCHRONIZE;
      delete process.env.DB_LOGGING;
    });

    it('should handle synchronize as false when env var is "false"', () => {
      process.env.DB_SYNCHRONIZE = 'false';
      const config = getDatabaseConfig(configService);
      expect(config.synchronize).toBe(false);
      delete process.env.DB_SYNCHRONIZE;
    });

    it('should handle logging as false when env var is "false"', () => {
      process.env.DB_LOGGING = 'false';
      const config = getDatabaseConfig(configService);
      const configAny = config as any;
      expect(configAny.logging).toBe(false);
      delete process.env.DB_LOGGING;
    });

    it('should include migrations path for production', () => {
      process.env.NODE_ENV = 'production';
      const config = getDatabaseConfig(configService);
      expect(config.migrations).toBeDefined();
      expect(Array.isArray(config.migrations)).toBe(true);
      delete process.env.NODE_ENV;
    });

    it('should include migrations path for development', () => {
      process.env.NODE_ENV = 'development';
      const config = getDatabaseConfig(configService);
      expect(config.migrations).toBeDefined();
      expect(Array.isArray(config.migrations)).toBe(true);
      delete process.env.NODE_ENV;
    });

    it('should set migrationsRun to true when ENV is production', () => {
      process.env.ENV = 'production';
      const config = getDatabaseConfig(configService);
      expect(config.migrationsRun).toBe(true);
      delete process.env.ENV;
    });

    it('should set migrationsRun to false when ENV is not production', () => {
      process.env.ENV = 'development';
      const config = getDatabaseConfig(configService);
      expect(config.migrationsRun).toBe(false);
      delete process.env.ENV;
    });

    it('should include Task entity in entities array', () => {
      const config = getDatabaseConfig(configService);
      expect(config.entities).toContain(Task);
    });
  });
});
