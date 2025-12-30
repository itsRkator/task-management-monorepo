import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdEndpoint } from './index';
import { GetTaskByIdService } from '../services';
import { GetTaskByIdResponseDto } from '../contract';
import {
  TaskStatus,
  TaskPriority,
  Task,
} from '../../../../../entities/task.entity';

describe('GetTaskByIdEndpoint', () => {
  let controller: GetTaskByIdEndpoint;
  let module: TestingModule;
  let service: GetTaskByIdService;
  let mockService: {
    execute: sinon.SinonStub;
  };

  beforeEach(async () => {
    mockService = {
      execute: sinon.stub(),
    };

    module = await Test.createTestingModule({
      controllers: [GetTaskByIdEndpoint],
      providers: [
        {
          provide: GetTaskByIdService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GetTaskByIdService>(GetTaskByIdService);
    controller = module.get<GetTaskByIdEndpoint>(GetTaskByIdEndpoint);

    // Manually inject service if not injected (workaround for NestJS DI issue)
    if (!(controller as any).getTaskByIdService) {
      (controller as any).getTaskByIdService = mockService;
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

  test('should get a task by id successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const responseDto: GetTaskByIdResponseDto = {
      id: taskId,
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date('2024-12-31T23:59:59Z'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getById(taskId);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(taskId));
    assert.strictEqual(mockService.execute.callCount, 1);
  });

  test('should handle NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';

    const error = new NotFoundException(`Task with ID ${taskId} not found`);
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.getById(taskId),
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
      async () => await controller.getById(taskId),
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
      async () => await controller.getById(taskId),
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
      async () => await controller.getById(taskId),
      (err: Error) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });

  test('should handle task with all status values', async () => {
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const responseDto: GetTaskByIdResponseDto = {
        id: taskId,
        title: 'Test Task',
        description: null,
        status,
        priority: null,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.execute.resolves(responseDto);

      const result = await controller.getById(taskId);
      assert.strictEqual(result.status, status);
    }
  });
});
