import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { RemoveTaskService } from './index';
import { Task } from '../../../../../entities/task.entity';

void describe('RemoveTaskService', () => {
  let service: RemoveTaskService;

  const mockRepository = {
    findOne: jest.fn(),
    remove: jest.fn(),
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

    mockRepository.findOne.mockResolvedValue(mockTask);
    mockRepository.remove.mockResolvedValue(mockTask);

    const result = await service.execute(taskId);

    expect(result.id).toBe(taskId);
    expect(result.message).toBe('Task deleted successfully');
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(mockRepository.remove).toHaveBeenCalledWith(mockTask);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    expect(mockRepository.remove).toHaveBeenCalledTimes(1);
  });

  void it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.execute(taskId)).rejects.toThrow(NotFoundException);
    await expect(service.execute(taskId)).rejects.toThrow(
      `Task with ID ${taskId} not found`,
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(mockRepository.remove).not.toHaveBeenCalled();
  });
});
