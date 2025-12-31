import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { CreateTaskEndpoint } from './index';
import { CreateTaskService } from '../services';
import { CreateTaskRequestDto, CreateTaskResponseDto } from '../contract';
import {
  TaskStatus,
  TaskPriority,
  Task,
} from '../../../../../entities/task.entity';

void describe('CreateTaskEndpoint', () => {
  let controller: CreateTaskEndpoint;
  let module: TestingModule;
  let mockService: {
    execute: sinon.SinonStub;
  };

  void beforeEach(async () => {
    mockService = {
      execute: sinon.stub(),
    };

    module = await Test.createTestingModule({
      controllers: [CreateTaskEndpoint],
      providers: [
        {
          provide: CreateTaskService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CreateTaskEndpoint>(CreateTaskEndpoint);

    // Manually inject service if not injected (workaround for NestJS DI issue)
    const controllerAny = controller as unknown as {
      createTaskService?: typeof mockService;
    };
    if (!controllerAny.createTaskService) {
      controllerAny.createTaskService = mockService;
    }
  });

  void afterEach(async () => {
    if (module) {
      await module.close();
    }
    sinon.restore();
  });

  void test('should be defined', () => {
    assert.ok(controller);
  });

  void test('should create a task successfully with all fields', async () => {
    const requestDto: CreateTaskRequestDto = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: '2024-12-31T23:59:59Z',
    };

    const responseDto: CreateTaskResponseDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date('2024-12-31T23:59:59Z'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.create(requestDto);

    assert.deepStrictEqual(result, responseDto);
    sinon.assert.calledWith(mockService.execute, requestDto);
    sinon.assert.calledOnce(mockService.execute);
  });

  void test('should create a task with minimal data', async () => {
    const requestDto: CreateTaskRequestDto = {
      title: 'Test Task',
    };

    const responseDto: CreateTaskResponseDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.create(requestDto);

    assert.deepStrictEqual(result, responseDto);
    sinon.assert.calledWith(mockService.execute, requestDto);
  });

  void test('should handle service errors', async () => {
    const requestDto: CreateTaskRequestDto = {
      title: 'Test Task',
    };

    const error = new Error('Service error');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.create(requestDto),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
    sinon.assert.calledWith(mockService.execute, requestDto);
  });

  void test('should handle database errors', async () => {
    const requestDto: CreateTaskRequestDto = {
      title: 'Test Task',
    };

    const error = new Error('Database connection failed');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.create(requestDto),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
    sinon.assert.calledWith(mockService.execute, requestDto);
  });

  void test('should handle all status enum values', async () => {
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const requestDto: CreateTaskRequestDto = {
        title: 'Test Task',
        status,
      };

      const responseDto: CreateTaskResponseDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        description: null,
        status,
        priority: null,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.execute.reset();
      mockService.execute.resolves(responseDto);

      const result = await controller.create(requestDto);
      assert.strictEqual(result.status, status);
      sinon.assert.calledWith(mockService.execute, requestDto);
    }
  });

  void test('should handle all priority enum values', async () => {
    const priorities = [
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ];

    for (const priority of priorities) {
      const requestDto: CreateTaskRequestDto = {
        title: 'Test Task',
        priority,
      };

      const responseDto: CreateTaskResponseDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        description: null,
        status: TaskStatus.PENDING,
        priority,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockService.execute.reset();
      mockService.execute.resolves(responseDto);

      const result = await controller.create(requestDto);
      assert.strictEqual(result.priority, priority);
      sinon.assert.calledWith(mockService.execute, requestDto);
    }
  });
});
