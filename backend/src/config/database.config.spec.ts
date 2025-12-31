import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';
import { Task } from '../modules/tasks/entities/task.entity';
import * as fs from 'node:fs';

describe('database.config', () => {
  let configService: ConfigService;
  let readdirSyncSpy: jest.SpyInstance;
  let existsSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    configService = new ConfigService();
    readdirSyncSpy = jest.spyOn(fs, 'readdirSync');
    existsSyncSpy = jest.spyOn(fs, 'existsSync');
    // Default: migrations directory exists with empty array
    existsSyncSpy.mockReturnValue(true);
    readdirSyncSpy.mockReturnValue([] as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getDatabaseConfig', () => {
    it('should return database config with default values', () => {
      const config = getDatabaseConfig(configService);

      expect(config).toBeDefined();
      expect(config.type).toBe('postgres');
      const configAny = config as unknown as {
        url?: string;
        logging?: boolean;
      };
      expect(configAny.url).toContain('postgresql://');
      expect(config.entities).toContain(Task);
      expect(config.synchronize).toBe(false);
      expect(configAny.logging).toBe(false);
    });

    it('should use default values when env vars are not set', () => {
      const config = getDatabaseConfig(configService);
      const configAny = config as unknown as { url?: string };

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
      const configAny = config as unknown as {
        url?: string;
        logging?: boolean;
      };

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
      const configAny = config as unknown as { logging?: boolean };
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

    it('should return empty array when migrations directory does not exist', () => {
      existsSyncSpy.mockReturnValue(false);
      const config = getDatabaseConfig(configService);
      expect(config.migrations).toEqual([]);
      expect(readdirSyncSpy).not.toHaveBeenCalled();
    });

    it('should include .ts migration files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.ts',
        'other-file.txt',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(1);
      expect(migrations![0]).toContain('1767093773020-initial.ts');
      expect(readdirSyncSpy).toHaveBeenCalled();
    });

    it('should include .js migration files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.js',
        'other-file.txt',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(1);
      expect(migrations![0]).toContain('1767093773020-initial.js');
    });

    it('should exclude .spec.ts files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.ts',
        '1767093773020-initial.spec.ts',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(1);
      expect(migrations![0]).toContain('1767093773020-initial.ts');
      expect(migrations![0]).not.toContain('spec');
    });

    it('should exclude .test.ts files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.ts',
        '1767093773020-initial.test.ts',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(1);
      expect(migrations![0]).toContain('1767093773020-initial.ts');
      expect(migrations![0]).not.toContain('test');
    });

    it('should exclude .spec.js files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.js',
        '1767093773020-initial.spec.js',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(1);
      expect(migrations![0]).toContain('1767093773020-initial.js');
      expect(migrations![0]).not.toContain('spec');
    });

    it('should exclude .test.js files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.js',
        '1767093773020-initial.test.js',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(1);
      expect(migrations![0]).toContain('1767093773020-initial.js');
      expect(migrations![0]).not.toContain('test');
    });

    it('should include both .ts and .js migration files', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.ts',
        '1767093773021-second.js',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(2);
      expect(migrations![0]).toContain('1767093773020-initial.ts');
      expect(migrations![1]).toContain('1767093773021-second.js');
    });

    it('should filter out all test files and include only valid migrations', () => {
      readdirSyncSpy.mockReturnValue([
        '1767093773020-initial.ts',
        '1767093773021-second.js',
        '1767093773020-initial.spec.ts',
        '1767093773020-initial.test.ts',
        '1767093773021-second.spec.js',
        '1767093773021-second.test.js',
        'other-file.txt',
      ] as any);
      const config = getDatabaseConfig(configService);
      const migrations = config.migrations as string[] | undefined;
      expect(migrations).toBeDefined();
      expect(migrations!).toHaveLength(2);
      expect(migrations![0]).toContain('1767093773020-initial.ts');
      expect(migrations![1]).toContain('1767093773021-second.js');
    });
  });
});
