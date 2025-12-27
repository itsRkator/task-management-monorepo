import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdService } from './index';
import { Task, TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('GetTaskByIdService', () => {
  let service: GetTaskByIdService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findOne: mock.fn(),
    };

    service = new GetTaskByIdService(mockRepository);
  });

  it('should get a task by id successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTask = {
      id: taskId,
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date('2024-12-31T23:59:59Z'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(mockTask);

    const result = await service.execute(taskId);

    assert.strictEqual(result.id, taskId);
    assert.strictEqual(result.title, mockTask.title);
    assert.strictEqual(result.description, mockTask.description);
    assert.strictEqual(result.status, mockTask.status);
    assert.strictEqual(result.priority, mockTask.priority);
    assert(mockRepository.findOne.calledOnce);
  });

  it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';

    mockRepository.findOne.mockResolvedValue(null);

    await assert.rejects(
      () => service.execute(taskId),
      NotFoundException,
      `Task with ID ${taskId} not found`,
    );
  });
});

