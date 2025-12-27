import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';
import { NotFoundException } from '@nestjs/common';
import { RemoveTaskService } from './index';
import { Task } from '../../../../../entities/task.entity';

describe('RemoveTaskService', () => {
  let service: RemoveTaskService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findOne: mock.fn(),
      remove: mock.fn(),
    };

    service = new RemoveTaskService(mockRepository);
  });

  it('should remove a task successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTask = {
      id: taskId,
      title: 'Test Task',
      description: 'Test Description',
      status: 'PENDING',
      priority: 'HIGH',
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(mockTask);
    mockRepository.remove.mockResolvedValue(mockTask);

    const result = await service.execute(taskId);

    assert.strictEqual(result.id, taskId);
    assert.strictEqual(result.message, 'Task deleted successfully');
    assert(mockRepository.findOne.calledOnce);
    assert(mockRepository.remove.calledOnce);
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
