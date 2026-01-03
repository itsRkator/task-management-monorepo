import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RemoveTaskService } from './index';
import { Task } from '../../../../../entities/task.entity';

void describe('RemoveTaskService', () => {
  let service: RemoveTaskService;

  const mockTransactionalEntityManager = {
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    remove: jest.fn(),
    manager: {
      transaction: jest.fn(async (callback) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return await callback(mockTransactionalEntityManager);
      }),
    },
  };

  void beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveTaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RemoveTaskService>(RemoveTaskService);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  void it('should be defined', () => {
    expect(service).toBeDefined();
  });

  void it('should remove a task successfully', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(mockTask);
    mockTransactionalEntityManager.remove.mockResolvedValue(mockTask);

    const result = await service.execute(taskId);

    expect(result.id).toBe(taskId);
    expect(result.message).toBe('Task deleted successfully');
    expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledWith(Task, {
      where: { id: taskId },
    });
    expect(mockTransactionalEntityManager.remove).toHaveBeenCalledWith(
      Task,
      mockTask,
    );
    expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledTimes(1);
    expect(mockTransactionalEntityManager.remove).toHaveBeenCalledTimes(1);
  });

  void it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';

    mockTransactionalEntityManager.findOne.mockResolvedValue(null);

    await expect(service.execute(taskId)).rejects.toThrow(NotFoundException);
    await expect(service.execute(taskId)).rejects.toThrow(
      `Task with ID ${taskId} not found`,
    );
    expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledWith(Task, {
      where: { id: taskId },
    });
    expect(mockTransactionalEntityManager.remove).not.toHaveBeenCalled();
  });
});
