/**
 * This test file specifically covers line 43 in main.ts
 * which is the closing brace of the if statement that calls bootstrap().
 *
 * IMPORTANT: This file must set environment variables BEFORE importing main.ts
 * to ensure the if condition (lines 41-43) is evaluated and executed.
 */

import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import sinon from 'sinon';

// Set environment variables BEFORE importing main.ts
// This ensures the if statement (lines 41-43) will execute bootstrap()
const originalEnv = process.env.NODE_ENV;
const originalSkipBootstrap = process.env.SKIP_BOOTSTRAP;

// Set to trigger bootstrap call (line 42)
process.env.NODE_ENV = 'development';
delete process.env.SKIP_BOOTSTRAP;

// Note: compression module is excluded from testing and coverage

void describe('main.ts - Bootstrap Call Coverage', () => {
  let createStub: sinon.SinonStub;
  let mockApp: {
    use: sinon.SinonStub;
    useGlobalPipes: sinon.SinonStub;
    useGlobalFilters: sinon.SinonStub;
    enableCors: sinon.SinonStub;
    enableShutdownHooks: sinon.SinonStub;
    setGlobalPrefix: sinon.SinonStub;
    listen: sinon.SinonStub;
    close: sinon.SinonStub;
    getHttpAdapter: sinon.SinonStub;
  };

  void beforeEach(() => {
    mockApp = {
      use: sinon.stub().returnsThis(),
      useGlobalPipes: sinon.stub().returnsThis(),
      useGlobalFilters: sinon.stub().returnsThis(),
      enableCors: sinon.stub().returnsThis(),
      enableShutdownHooks: sinon.stub().returnsThis(),
      setGlobalPrefix: sinon.stub().returnsThis(),
      listen: sinon.stub().resolves(undefined),
      close: sinon.stub().resolves(undefined),
      getHttpAdapter: sinon.stub().returns({
        getType: sinon.stub().returns('express'),
      }),
    };

    createStub = sinon
      .stub(NestFactory, 'create')
      .resolves(
        mockApp as unknown as Awaited<ReturnType<typeof NestFactory.create>>,
      );

    // Mock SwaggerModule
    sinon
      .stub(SwaggerModule, 'createDocument')
      .returns(
        {} as unknown as ReturnType<typeof SwaggerModule.createDocument>,
      );
    sinon.stub(SwaggerModule, 'setup').returns(undefined);
  });

  void afterEach(() => {
    sinon.restore();
  });

  void test('should execute bootstrap call (lines 41-43) when NODE_ENV is not test', async () => {
    // Import main.ts - this will execute the if statement (lines 41-43)
    // Since NODE_ENV is 'development' and SKIP_BOOTSTRAP is not set,
    // the condition is true and bootstrap() is called, covering line 43
    await import('./main');

    // Wait for async bootstrap to execute
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify NestFactory.create was called (bootstrap executed)
    assert.ok(createStub.called);

    // Clean up
    await mockApp.close();
  });

  void test('cleanup - restore environment', () => {
    if (originalEnv) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    if (originalSkipBootstrap) {
      process.env.SKIP_BOOTSTRAP = originalSkipBootstrap;
    } else {
      delete process.env.SKIP_BOOTSTRAP;
    }
    assert.ok(true);
  });
});
