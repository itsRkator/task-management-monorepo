import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskEndpoint } from './index';
import { UpdateTaskService } from '../services';
import { UpdateTaskRequestDto, UpdateTaskResponseDto } from '../contract';
import {
  TaskStatus,
  TaskPriority,
  Task,
} from '../../../../../entities/task.entity';

describe('UpdateTaskEndpoint', () => {
  let controller: UpdateTaskEndpoint;
  let module: TestingModule;
  let service: UpdateTaskService;
  let mockService: {
    execute: sinon.SinonStub;
  };

  beforeEach(async () => {
    mockService = {
      execute: sinon.stub(),
    };

    module = await Test.createTestingModule({
      controllers: [UpdateTaskEndpoint],
      providers: [
        {
          provide: UpdateTaskService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<UpdateTaskService>(UpdateTaskService);
    controller = module.get<UpdateTaskEndpoint>(UpdateTaskEndpoint);

    // Manually inject service if not injected (workaround for NestJS DI issue)
    if (!(controller as any).updateTaskService) {
      (controller as any).updateTaskService = mockService;
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

  test('should update a task successfully with all fields', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const requestDto: UpdateTaskRequestDto = {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      due_date: '2024-12-31T23:59:59Z',
    };

    const responseDto: UpdateTaskResponseDto = {
      id: taskId,
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      due_date: new Date('2024-12-31T23:59:59Z'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.update(taskId, requestDto);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(taskId, requestDto));
    assert.strictEqual(mockService.execute.callCount, 1);
  });

  test('should update a task with minimal data', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const requestDto: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const responseDto: UpdateTaskResponseDto = {
      id: taskId,
      title: 'Updated Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.update(taskId, requestDto);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(taskId, requestDto));
  });

  test('should handle NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';
    const requestDto: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const error = new NotFoundException(`Task with ID ${taskId} not found`);
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.update(taskId, requestDto),
      (err: Error) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
    assert.ok(mockService.execute.calledWith(taskId, requestDto));
  });

  test('should handle service errors', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const requestDto: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const error = new Error('Service error');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.update(taskId, requestDto),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
    assert.ok(mockService.execute.calledWith(taskId, requestDto));
  });

  test('should handle database errors', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const requestDto: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const error = new Error('Database connection failed');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.update(taskId, requestDto),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
  });

  test('should handle all status enum values', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const requestDto: UpdateTaskRequestDto = {
        title: 'Updated Task',
        status,
      };

      const responseDto: UpdateTaskResponseDto = {
        id: taskId,
        title: 'Updated Task',
        description: null,
        status,
        priority: null,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.execute.resolves(responseDto);

      const result = await controller.update(taskId, requestDto);
      assert.strictEqual(result.status, status);
    }
  });

  test('should handle invalid UUID format', async () => {
    const taskId = 'invalid-uuid';
    const requestDto: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const error = new NotFoundException(`Task with ID ${taskId} not found`);
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.update(taskId, requestDto),
      (err: Error) => {
        assert.ok(err instanceof NotFoundException);
        return true;
      },
    );
  });
});
