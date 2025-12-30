import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { NotFoundException } from '@nestjs/common';
import { RemoveTaskEndpoint } from './index';
import { RemoveTaskService } from '../services';
import { RemoveTaskResponseDto } from '../contract';
import { Task } from '../../../../../entities/task.entity';

describe('RemoveTaskEndpoint', () => {
  let controller: RemoveTaskEndpoint;
  let module: TestingModule;
  let service: RemoveTaskService;
  let mockService: {
    execute: sinon.SinonStub;
  };

  beforeEach(async () => {
    mockService = {
      execute: sinon.stub(),
    };

    module = await Test.createTestingModule({
      controllers: [RemoveTaskEndpoint],
      providers: [
        {
          provide: RemoveTaskService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RemoveTaskService>(RemoveTaskService);
    controller = module.get<RemoveTaskEndpoint>(RemoveTaskEndpoint);

    // Manually inject service if not injected (workaround for NestJS DI issue)
    if (!(controller as any).removeTaskService) {
      (controller as any).removeTaskService = mockService;
    }
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    sinon.restore();
  });

  test('should be defined', () => {
    assert.ok(controller);
  });

  test('should remove a task successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const responseDto: RemoveTaskResponseDto = {
      message: 'Task deleted successfully',
      id: taskId,
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.remove(taskId);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(taskId));
    assert.strictEqual(mockService.execute.callCount, 1);
  });

  test('should handle NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';

    const error = new NotFoundException(`Task with ID ${taskId} not found`);
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.remove(taskId),
      (err: Error) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
    assert.ok(mockService.execute.calledWith(taskId));
  });

  test('should handle service errors', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    const error = new Error('Service error');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.remove(taskId),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
    assert.ok(mockService.execute.calledWith(taskId));
  });

  test('should handle database errors', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    const error = new Error('Database connection failed');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.remove(taskId),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
  });

  test('should handle invalid UUID format', async () => {
    const taskId = 'invalid-uuid';

    const error = new NotFoundException(`Task with ID ${taskId} not found`);
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.remove(taskId),
      (err: Error) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });
});
