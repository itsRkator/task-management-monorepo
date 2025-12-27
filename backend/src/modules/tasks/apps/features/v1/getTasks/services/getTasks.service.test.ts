import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { GetTasksService } from './index';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';
import { GetTasksQueryDto } from '../contract';

describe('GetTasksService', () => {
  let service: GetTasksService;
  let mockRepository: any;
  let mockQueryBuilder: any;

  beforeEach(() => {
    const whereFn = mock.fn(() => mockQueryBuilder);
    const andWhereFn = mock.fn(() => mockQueryBuilder);
    const skipFn = mock.fn(() => mockQueryBuilder);
    const takeFn = mock.fn(() => mockQueryBuilder);
    const orderByFn = mock.fn(() => mockQueryBuilder);
    const getManyAndCountFn = mock.fn();

    mockQueryBuilder = {
      where: whereFn,
      andWhere: andWhereFn,
      skip: skipFn,
      take: takeFn,
      orderBy: orderByFn,
      getManyAndCount: getManyAndCountFn,
    };

    const createQueryBuilderFn = mock.fn(() => mockQueryBuilder);

    mockRepository = {
      createQueryBuilder: createQueryBuilderFn,
    };

    service = new GetTasksService(mockRepository);
  });

  it('should get tasks with pagination', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    const mockTasks = [
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
    ];

    mockQueryBuilder.getManyAndCount.mock.mockImplementation(async () => [mockTasks, 1]);

    const result = await service.execute(query);

    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.meta.page, 1);
    assert.strictEqual(result.meta.limit, 10);
    assert.strictEqual(result.meta.total, 1);
    assert.strictEqual(result.meta.totalPages, 1);
  });

  it('should filter tasks by status', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      status: TaskStatus.COMPLETED,
    };

    mockQueryBuilder.getManyAndCount.mock.mockImplementation(async () => [[], 0]);

    void service.execute(query);

    assert.strictEqual(mockQueryBuilder.where.mock.calls.length, 1);
  });

  it('should filter tasks by priority', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      priority: TaskPriority.HIGH,
    };

    mockQueryBuilder.getManyAndCount.mock.mockImplementation(async () => [[], 0]);

    void service.execute(query);

    assert.strictEqual(mockQueryBuilder.andWhere.mock.calls.length, 1);
  });

  it('should search tasks by title or description', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
    };

    mockQueryBuilder.getManyAndCount.mock.mockImplementation(async () => [[], 0]);

    void service.execute(query);

    assert.strictEqual(mockQueryBuilder.andWhere.mock.calls.length, 1);
  });

  it('should use default pagination values', async () => {
    const query: GetTasksQueryDto = {};

    mockQueryBuilder.getManyAndCount.mock.mockImplementation(async () => [[], 0]);

    const result = await service.execute(query);

    assert.strictEqual(result.meta.page, 1);
    assert.strictEqual(result.meta.limit, 10);
  });
});
