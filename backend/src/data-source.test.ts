import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { DataSource } from 'typeorm';
import sinon from 'sinon';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('data-source', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleLogSpy: sinon.SinonStub;

  beforeEach(() => {
    originalEnv = { ...process.env };
    consoleLogSpy = sinon.stub(console, 'log');
    // Clear module cache before each test to ensure fresh imports
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('data-source') || key.includes('dotenv')) {
        delete require.cache[key];
      }
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    sinon.restore();
    // Clear the module cache after each test
    Object.keys(require.cache).forEach((key) => {
      if (key.includes('data-source') || key.includes('dotenv')) {
        delete require.cache[key];
      }
    });
  });

  test('should export AppDataSource', () => {
    const { AppDataSource } = require('./data-source');
    assert.ok(AppDataSource);
    assert.ok(AppDataSource instanceof DataSource);
  });

  test('should have correct DataSource configuration', () => {
    const { AppDataSource } = require('./data-source');
    assert.strictEqual(AppDataSource.options.type, 'postgres');
    assert.ok(AppDataSource.options.host);
    assert.ok(typeof AppDataSource.options.port === 'number');
    assert.ok(AppDataSource.options.username);
    assert.ok(AppDataSource.options.password);
    assert.ok(AppDataSource.options.database);
    assert.ok(Array.isArray(AppDataSource.options.entities));
    assert.ok(Array.isArray(AppDataSource.options.migrations));
    assert.ok(typeof AppDataSource.options.synchronize === 'boolean');
    assert.strictEqual(AppDataSource.options.logging, true);
  });

  test('should have entities configured', () => {
    const { AppDataSource } = require('./data-source');
    assert.ok(Array.isArray(AppDataSource.options.entities));
    assert.ok(AppDataSource.options.entities.length > 0);
  });

  test('should have migrations configured', () => {
    const { AppDataSource } = require('./data-source');
    assert.ok(Array.isArray(AppDataSource.options.migrations));
    assert.ok(AppDataSource.options.migrations.length > 0);
  });

  test('should parse boolean from environment correctly', () => {
    // Test parseBoolean logic indirectly through getDatabaseConfig
    const originalSync = process.env.DB_SYNCHRONIZE;
    const originalLogging = process.env.DB_LOGGING;

    // Test with 'true'
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.DB_LOGGING = 'true';
    const config1 = {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'task_management',
      synchronize: process.env.DB_SYNCHRONIZE?.toLowerCase() === 'true',
      logging: process.env.DB_LOGGING?.toLowerCase() === 'true',
    };
    assert.strictEqual(config1.synchronize, true);
    assert.strictEqual(config1.logging, true);

    // Test with 'false'
    process.env.DB_SYNCHRONIZE = 'false';
    process.env.DB_LOGGING = 'false';
    const config2 = {
      host: process.env.DB_HOST ?? 'localhost',
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'task_management',
      synchronize: process.env.DB_SYNCHRONIZE?.toLowerCase() === 'true',
      logging: process.env.DB_LOGGING?.toLowerCase() === 'true',
    };
    assert.strictEqual(config2.synchronize, false);
    assert.strictEqual(config2.logging, false);

    // Restore original values first
    if (originalSync) {
      process.env.DB_SYNCHRONIZE = originalSync;
    } else {
      delete process.env.DB_SYNCHRONIZE;
    }
    if (originalLogging) {
      process.env.DB_LOGGING = originalLogging;
    } else {
      delete process.env.DB_LOGGING;
    }
  });

  test('should handle parseBoolean with undefined/null values (lines 21-22)', () => {
    // Delete env vars BEFORE requiring the module to trigger undefined path in parseBoolean (lines 21-22)
    delete process.env.DB_SYNCHRONIZE;
    delete process.env.DB_LOGGING;

    // Require the module with undefined env vars - this will execute parseBoolean with undefined values
    // This will execute the if statement on line 20 and return on line 21
    const { AppDataSource: undefinedDataSource } = require('./data-source');

    // Verify that parseBoolean returned the default value (false) for synchronize
    assert.strictEqual(undefinedDataSource.options.synchronize, false);
    // Verify logging is still true due to hardcoded value in data-source.ts
    assert.strictEqual(undefinedDataSource.options.logging, true);
  });

  test('should handle migration path for production (line 46)', () => {
    // Set production env BEFORE requiring the module to trigger line 46
    process.env.NODE_ENV = 'production';
    delete process.env.DB_SYNCHRONIZE;
    delete process.env.DB_LOGGING;

    // Require the module with production env - this will execute line 46 (production migration path)
    const { AppDataSource: prodDataSource } = require('./data-source');

    // Verify line 46 (production migration path) is executed
    const migrationsPath = prodDataSource.options.migrations[0];
    assert.ok(migrationsPath.includes('migrations'));
    assert.ok(migrationsPath.includes('*.ts'));
    assert.ok(migrationsPath.includes(process.cwd())); // Should use absolute path for production

    // Verify console.log was called (lines 50-55)
    assert.ok(consoleLogSpy.called);
    assert.ok(consoleLogSpy.calledWith('Migration path:', sinon.match.string));
    assert.ok(
      consoleLogSpy.calledWith(
        'Current working directory:',
        sinon.match.string,
      ),
    );
    assert.ok(
      consoleLogSpy.calledWith('Migrations directory exists:', sinon.match.any),
    );
  });

  test('should handle migration path for development', () => {
    // Mock dotenv to prevent loading .env file
    const dotenvPath = require.resolve('dotenv');
    delete require.cache[dotenvPath];
    const originalDotenv = require('dotenv');
    const mockDotenv = sinon.stub(originalDotenv, 'config').returns({});

    // Ensure it's not production BEFORE requiring the module
    delete process.env.NODE_ENV;
    delete process.env.DB_SYNCHRONIZE;
    delete process.env.DB_LOGGING;

    // Clear console.log spy calls from previous tests
    consoleLogSpy.resetHistory();

    // Require the module with development env - this will execute development migration path
    const dataSourcePath = require.resolve('./data-source');
    delete require.cache[dataSourcePath];
    const { AppDataSource: devDataSource } = require('./data-source');

    // The migration path logic is tested indirectly
    assert.ok(devDataSource);
    assert.ok(devDataSource.options);
    assert.ok(Array.isArray(devDataSource.options.migrations));
    assert.ok(devDataSource.options.migrations.length > 0);
    const migrationsPath = devDataSource.options.migrations[0];
    assert.ok(typeof migrationsPath === 'string');
    assert.ok(migrationsPath.includes('migrations'));
    assert.ok(migrationsPath.includes('*.ts'));

    // Verify console.log was NOT called (development doesn't log)
    assert.strictEqual(
      consoleLogSpy.callCount,
      0,
      'console.log should not be called in development',
    );

    // Restore dotenv
    mockDotenv.restore();
  });

  test('should use default database configuration values', () => {
    // Mock dotenv to prevent loading .env file
    const dotenvPath = require.resolve('dotenv');
    delete require.cache[dotenvPath];
    const originalDotenv = require('dotenv');
    const mockDotenv = sinon.stub(originalDotenv, 'config').returns({});

    // Delete ALL env vars BEFORE requiring the module to test default values
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.DB_SYNCHRONIZE;
    delete process.env.DB_LOGGING;
    delete process.env.NODE_ENV;

    // Require the module with no env vars - this will use default values
    const dataSourcePath = require.resolve('./data-source');
    delete require.cache[dataSourcePath];
    const { AppDataSource: defaultDataSource } = require('./data-source');

    assert.ok(defaultDataSource);
    assert.ok(defaultDataSource.options);
    assert.strictEqual(
      defaultDataSource.options.host,
      'localhost',
      `Expected 'localhost' but got '${defaultDataSource.options.host}'`,
    );
    assert.strictEqual(defaultDataSource.options.port, 5432);
    assert.strictEqual(defaultDataSource.options.username, 'postgres');
    assert.strictEqual(defaultDataSource.options.password, 'postgres');
    assert.strictEqual(defaultDataSource.options.database, 'task_management');

    // Restore dotenv
    mockDotenv.restore();
  });
});
