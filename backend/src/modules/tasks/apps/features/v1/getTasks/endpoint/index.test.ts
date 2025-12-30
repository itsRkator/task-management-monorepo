import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import sinon from 'sinon';
import { GetTasksEndpoint } from './index';
import { GetTasksService } from '../services';
import { GetTasksQueryDto, GetTasksResponseDto } from '../contract';
import {
  TaskStatus,
  TaskPriority,
  Task,
} from '../../../../../entities/task.entity';

describe('GetTasksEndpoint', () => {
  let controller: GetTasksEndpoint;
  let module: TestingModule;
  let service: GetTasksService;
  let mockService: {
    execute: sinon.SinonStub;
  };

  beforeEach(async () => {
    mockService = {
      execute: sinon.stub(),
    };

    module = await Test.createTestingModule({
      controllers: [GetTasksEndpoint],
      providers: [
        {
          provide: GetTasksService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GetTasksService>(GetTasksService);
    controller = module.get<GetTasksEndpoint>(GetTasksEndpoint);

    // Manually inject service if not injected (workaround for NestJS DI issue)
    if (!(controller as any).getTasksService) {
      (controller as any).getTasksService = mockService;
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

  test('should get tasks with default query', async () => {
    const query: GetTasksQueryDto = {};
    const responseDto: GetTasksResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getTasks(query);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(query));
    assert.strictEqual(mockService.execute.callCount, 1);
  });

  test('should get tasks with pagination', async () => {
    const query: GetTasksQueryDto = {
      page: 2,
      limit: 20,
    };

    const responseDto: GetTasksResponseDto = {
      data: [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          due_date: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      meta: {
        page: 2,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getTasks(query);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(query));
  });

  test('should get tasks with status filter', async () => {
    const query: GetTasksQueryDto = {
      status: TaskStatus.COMPLETED,
    };

    const responseDto: GetTasksResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getTasks(query);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(query));
  });

  test('should get tasks with priority filter', async () => {
    const query: GetTasksQueryDto = {
      priority: TaskPriority.HIGH,
    };

    const responseDto: GetTasksResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getTasks(query);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(query));
  });

  test('should get tasks with search query', async () => {
    const query: GetTasksQueryDto = {
      search: 'test',
    };

    const responseDto: GetTasksResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getTasks(query);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(query));
  });

  test('should get tasks with all filters combined', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 5,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      search: 'important',
    };

    const responseDto: GetTasksResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 0,
      },
    };

    mockService.execute.resolves(responseDto);

    const result = await controller.getTasks(query);

    assert.deepStrictEqual(result, responseDto);
    assert.ok(mockService.execute.calledWith(query));
  });

  test('should handle service errors', async () => {
    const query: GetTasksQueryDto = {};

    const error = new Error('Service error');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.getTasks(query),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
    assert.ok(mockService.execute.calledWith(query));
  });

  test('should handle database errors', async () => {
    const query: GetTasksQueryDto = {};

    const error = new Error('Database connection failed');
    mockService.execute.rejects(error);

    await assert.rejects(
      async () => await controller.getTasks(query),
      (err: Error) => {
        assert.strictEqual(err.message, error.message);
        return true;
      },
    );
  });

  test('should handle all status enum values in filter', async () => {
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const query: GetTasksQueryDto = { status };
      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockService.execute.resolves(responseDto);

      const result = await controller.getTasks(query);
      assert.ok(mockService.execute.calledWith(query));
    }
  });

  test('should handle all priority enum values in filter', async () => {
    const priorities = [
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ];

    for (const priority of priorities) {
      const query: GetTasksQueryDto = { priority };
      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockService.execute.resolves(responseDto);

      const result = await controller.getTasks(query);
      assert.ok(mockService.execute.calledWith(query));
    }
  });

  test('should handle boundary pagination values', async () => {
    const testCases = [
      { page: 1, limit: 1 },
      { page: 1, limit: 100 },
      { page: 1000, limit: 10 },
    ];

    for (const query of testCases) {
      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: query.page,
          limit: query.limit,
          total: 0,
          totalPages: 0,
        },
      };

      mockService.execute.resolves(responseDto);

      const result = await controller.getTasks(query);
      assert.ok(mockService.execute.calledWith(query));
    }
  });
});
