import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { CreateTaskService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { CreateTaskRequestDto } from '../contract';

describe('CreateTaskService', () => {
  let service: CreateTaskService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      create: mock.fn(),
      save: mock.fn(),
    };

    service = new CreateTaskService(mockRepository);
  });

  it('should create a task successfully', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: '2024-12-31T23:59:59Z',
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date('2024-12-31T23:59:59Z'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    const result = await service.execute(request);

    assert.strictEqual(result.id, mockTask.id);
    assert.strictEqual(result.title, mockTask.title);
    assert.strictEqual(result.description, mockTask.description);
    assert.strictEqual(result.status, mockTask.status);
    assert.strictEqual(result.priority, mockTask.priority);
    assert(mockRepository.create.calledOnce);
    assert(mockRepository.save.calledOnce);
  });

  it('should create a task with default values', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    const result = await service.execute(request);

    assert.strictEqual(result.status, TaskStatus.PENDING);
    assert.strictEqual(result.description, null);
    assert.strictEqual(result.priority, null);
    assert.strictEqual(result.due_date, null);
  });
});
