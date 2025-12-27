import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskService } from './index';
import { Task, TaskStatus, TaskPriority } from '../../../../../entities/task.entity';
import { UpdateTaskRequestDto } from '../contract';

describe('UpdateTaskService', () => {
  let service: UpdateTaskService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findOne: mock.fn(),
      save: mock.fn(),
    };

    service = new UpdateTaskService(mockRepository);
  });

  it('should update a task successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      due_date: '2024-12-31T23:59:59Z',
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: 'Original Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      due_date: new Date(request.due_date!),
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.id, taskId);
    assert.strictEqual(result.title, request.title);
    assert.strictEqual(result.description, request.description);
    assert.strictEqual(result.status, request.status);
    assert.strictEqual(result.priority, request.priority);
    assert(mockRepository.findOne.calledOnce);
    assert(mockRepository.save.calledOnce);
  });

  it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    mockRepository.findOne.mockResolvedValue(null);

    await assert.rejects(
      () => service.execute(taskId, request),
      NotFoundException,
      `Task with ID ${taskId} not found`,
    );
  });
});

