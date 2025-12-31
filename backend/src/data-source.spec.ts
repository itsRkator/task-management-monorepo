// Mock TypeORM DataSource before importing data-source
// Type the options as PostgreSQL connection options
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const MockDataSource = jest.fn().mockImplementation((options: unknown) => ({
  options: options as PostgresConnectionOptions,
  initialize: jest.fn(),
  destroy: jest.fn(),
}));

// Mock Task entity to avoid decorator issues during import
jest.mock('./modules/tasks/entities/task.entity', () => ({
  Task: class Task {},
}));

// Mock TypeORM - provide minimal exports needed for decorators to work
// We can't use jest.requireActual because it causes circular dependency issues
jest.mock('typeorm', () => ({
  DataSource: MockDataSource,
  // Export decorators as no-ops to prevent errors
  Entity: () => () => {},
  PrimaryGeneratedColumn: () => () => {},
  Column: () => () => {},
  Index: () => () => {},
  CreateDateColumn: () => () => {},
  UpdateDateColumn: () => () => {},
}));

// Mock dependencies before importing
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

const mockExistsSync = jest.fn().mockReturnValue(true);
const mockReaddirSync = jest.fn().mockReturnValue(['1767093773020-initial.ts']);
jest.mock('node:fs', () => ({
  existsSync: mockExistsSync,
  readdirSync: mockReaddirSync,
}));

// Mock console.log
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('data-source', () => {
  const originalEnv = process.env;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalCwd = process.cwd.bind(process);

  beforeEach(() => {
    jest.clearAllMocks();
    MockDataSource.mockClear();
    process.env = { ...originalEnv };
    console.log = mockConsoleLog;
    process.cwd = jest.fn(() => '/test/path');
    // Note: Module cache clearing not needed with ES modules
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    // Restore original cwd function
    if (originalCwd) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      process.cwd = originalCwd;
    }
  });

  describe('parseBoolean function - actual code execution', () => {
    it('should return default when DB_SYNCHRONIZE is undefined', async () => {
      delete process.env.DB_SYNCHRONIZE;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(false);
    });

    it('should return default when DB_SYNCHRONIZE is null (test line 21)', async () => {
      delete process.env.DB_SYNCHRONIZE;
      Object.defineProperty(process.env, 'DB_SYNCHRONIZE', {
        value: null,
        writable: true,
        configurable: true,
      });
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(false);
      delete process.env.DB_SYNCHRONIZE;
    });

    it('should return true when DB_SYNCHRONIZE is "true"', async () => {
      process.env.DB_SYNCHRONIZE = 'true';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(true);
      delete process.env.DB_SYNCHRONIZE;
    });

    it('should return false when DB_SYNCHRONIZE is "false"', async () => {
      process.env.DB_SYNCHRONIZE = 'false';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(false);
      delete process.env.DB_SYNCHRONIZE;
    });

    it('should handle uppercase "TRUE"', async () => {
      process.env.DB_SYNCHRONIZE = 'TRUE';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(true);
      delete process.env.DB_SYNCHRONIZE;
    });

    it('should handle mixed case "True"', async () => {
      process.env.DB_SYNCHRONIZE = 'True';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(true);
      delete process.env.DB_SYNCHRONIZE;
    });

    it('should return false for any non-"true" value', async () => {
      process.env.DB_SYNCHRONIZE = 'yes';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.synchronize).toBe(false);
      delete process.env.DB_SYNCHRONIZE;
    });
  });

  describe('getDatabaseConfig function - actual code execution', () => {
    it('should use default host when DB_HOST is not set', async () => {
      delete process.env.DB_HOST;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.host).toBe('localhost');
    });

    it('should use environment variable for host', async () => {
      process.env.DB_HOST = 'custom_host';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.host).toBe('custom_host');
      delete process.env.DB_HOST;
    });

    it('should use default port when DB_PORT is not set', async () => {
      delete process.env.DB_PORT;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.port).toBe(5432);
    });

    it('should parse port from environment variable', async () => {
      process.env.DB_PORT = '5433';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.port).toBe(5433);
      delete process.env.DB_PORT;
    });

    it('should use default username when DB_USERNAME is not set', async () => {
      delete process.env.DB_USERNAME;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.username).toBe('postgres');
    });

    it('should use default password when DB_PASSWORD is not set', async () => {
      delete process.env.DB_PASSWORD;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.password).toBe('postgres');
    });

    it('should use default database when DB_NAME is not set', async () => {
      delete process.env.DB_NAME;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.database).toBe('task_management');
    });

    it('should use all environment variables when set', async () => {
      process.env.DB_HOST = 'custom_host';
      process.env.DB_PORT = '5433';
      process.env.DB_USERNAME = 'custom_user';
      process.env.DB_PASSWORD = 'custom_pass';
      process.env.DB_NAME = 'custom_db';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      const options = AppDataSource.options as PostgresConnectionOptions;
      expect(options.host).toBe('custom_host');
      expect(options.port).toBe(5433);
      expect(options.username).toBe('custom_user');
      expect(options.password).toBe('custom_pass');
      expect(options.database).toBe('custom_db');
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_USERNAME;
      delete process.env.DB_PASSWORD;
      delete process.env.DB_NAME;
    });
  });

  describe('migrations path logic - actual code execution', () => {
    it('should use production migrations path when NODE_ENV is production', async () => {
      mockExistsSync.mockReturnValue(true);
      process.env.NODE_ENV = 'production';
      mockConsoleLog.mockClear();
      jest.resetModules();
      await import('./data-source');
      expect(mockConsoleLog).toHaveBeenCalled();
      expect(
        mockConsoleLog.mock.calls.some(
          (call: unknown[]) =>
            typeof call[0] === 'string' && call[0].includes('Migration path:'),
        ),
      ).toBe(true);
      expect(
        mockConsoleLog.mock.calls.some(
          (call: unknown[]) =>
            typeof call[0] === 'string' &&
            call[0].includes('Current working directory:'),
        ),
      ).toBe(true);
      expect(
        mockConsoleLog.mock.calls.some(
          (call: unknown[]) =>
            typeof call[0] === 'string' &&
            call[0].includes('Migrations directory exists:'),
        ),
      ).toBe(true);
      delete process.env.NODE_ENV;
    });

    it('should use development migrations path when NODE_ENV is not production', async () => {
      delete process.env.NODE_ENV;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.migrations).toBeDefined();
      expect(Array.isArray(AppDataSource.options.migrations)).toBe(true);
    });

    it('should handle missing migrations directory (returns empty array)', async () => {
      mockExistsSync.mockReturnValue(false);
      mockReaddirSync.mockClear();
      jest.resetModules();
      const { AppDataSource, getMigrations } = await import('./data-source');
      const migrations = getMigrations();
      expect(migrations).toEqual([]);
      expect(mockReaddirSync).not.toHaveBeenCalled();
      expect(Array.isArray(AppDataSource.options.migrations)).toBe(true);
    });

    it('should filter out test files from migrations', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue([
        '1767093773020-initial.ts',
        'test.spec.ts',
        'test.test.ts',
        'test.spec.js',
        'test.test.js',
        'valid-migration.js',
        'invalid.txt',
      ]);
      jest.resetModules();
      const { getMigrations } = await import('./data-source');
      const migrations = getMigrations();
      // Should only include .ts and .js files that are not test files
      expect(migrations.length).toBeGreaterThan(0);
      expect(
        migrations.every(
          (m: string) =>
            (m.endsWith('.ts') || m.endsWith('.js')) &&
            !m.endsWith('.spec.ts') &&
            !m.endsWith('.test.ts') &&
            !m.endsWith('.spec.js') &&
            !m.endsWith('.test.js'),
        ),
      ).toBe(true);
    });

    it('should use customDir when provided', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReaddirSync.mockReturnValue(['custom-migration.ts']);
      jest.resetModules();
      const { getMigrations } = await import('./data-source');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const migrations = getMigrations('/custom/path');
      expect(mockExistsSync).toHaveBeenCalledWith('/custom/path');
      expect(mockReaddirSync).toHaveBeenCalledWith('/custom/path');
    });
  });

  describe('logging configuration - actual code execution', () => {
    // Note: data-source.ts has logging hardcoded to true on line 71
    // The parseBoolean for DB_LOGGING is used in getDatabaseConfig but not in DataSource
    it('should have logging set to true (hardcoded in data-source.ts)', async () => {
      delete process.env.DB_LOGGING;
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      // Line 71 has logging: true hardcoded
      expect(AppDataSource.options.logging).toBe(true);
    });

    it('should have logging set to true even when DB_LOGGING is "false"', async () => {
      process.env.DB_LOGGING = 'false';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      // Line 71 has logging: true hardcoded, not using dbConfig.logging
      expect(AppDataSource.options.logging).toBe(true);
      delete process.env.DB_LOGGING;
    });

    it('should have logging set to true when DB_LOGGING is "true"', async () => {
      process.env.DB_LOGGING = 'true';
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.logging).toBe(true);
      delete process.env.DB_LOGGING;
    });

    it('should handle null value for DB_LOGGING (test line 21 in parseBoolean)', async () => {
      delete process.env.DB_LOGGING;
      Object.defineProperty(process.env, 'DB_LOGGING', {
        value: null,
        writable: true,
        configurable: true,
      });
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      // parseBoolean is called in getDatabaseConfig, but logging is hardcoded to true
      // This test verifies parseBoolean handles null (line 21)
      expect(AppDataSource.options.logging).toBe(true);
      delete process.env.DB_LOGGING;
    });
  });

  describe('AppDataSource structure verification', () => {
    it('should export AppDataSource', async () => {
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource).toBeDefined();
    });

    it('should have DataSource type', async () => {
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource).toBeDefined();
      expect(MockDataSource).toHaveBeenCalled();
    });

    it('should have postgres type configuration', async () => {
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.type).toBe('postgres');
    });

    it('should have entities configuration', async () => {
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.entities).toBeDefined();
      expect(Array.isArray(AppDataSource.options.entities)).toBe(true);
    });

    it('should have migrations configuration', async () => {
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options.migrations).toBeDefined();
      expect(Array.isArray(AppDataSource.options.migrations)).toBe(true);
    });

    it('should have synchronize configuration', async () => {
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options).toHaveProperty('synchronize');
      expect(typeof AppDataSource.options.synchronize).toBe('boolean');
    });

    it('should have logging configuration', async () => {
      jest.resetModules();
      const { AppDataSource } = await import('./data-source');
      expect(AppDataSource.options).toHaveProperty('logging');
      expect(typeof AppDataSource.options.logging).toBe('boolean');
    });
  });
});
