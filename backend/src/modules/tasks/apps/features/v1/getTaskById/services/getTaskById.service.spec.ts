import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { GetTaskByIdService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';

void describe('GetTaskByIdService', () => {
  let service: GetTaskByIdService;

  const mockRepository = {
    findOne: jest.fn(),
  };

  void beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTaskByIdService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GetTaskByIdService>(GetTaskByIdService);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  void it('should be defined', () => {
    expect(service).toBeDefined();
  });

  void it('should get a task by id successfully', async () => {
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

    expect(result.id).toBe(taskId);
    expect(result.title).toBe(mockTask.title);
    expect(result.description).toBe(mockTask.description);
    expect(result.status).toBe(mockTask.status);
    expect(result.priority).toBe(mockTask.priority);
    expect(result.due_date?.getTime()).toBe(mockTask.due_date.getTime());
    expect(result.created_at).toBe(mockTask.created_at);
    expect(result.updated_at).toBe(mockTask.updated_at);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
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
  });

  void it('should return all task properties', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTask = {
      id: taskId,
      title: 'Test Task',
      description: null,
      status: TaskStatus.COMPLETED,
      priority: null,
      due_date: null,
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-02'),
    };

    mockRepository.findOne.mockResolvedValue(mockTask);

    const result = await service.execute(taskId);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('priority');
    expect(result).toHaveProperty('due_date');
    expect(result).toHaveProperty('created_at');
    expect(result).toHaveProperty('updated_at');
  });

  void it('should handle task with null optional fields', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTask = {
      id: taskId,
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(mockTask);

    const result = await service.execute(taskId);

    expect(result.description).toBeNull();
    expect(result.priority).toBeNull();
    expect(result.due_date).toBeNull();
  });

  void it('should handle database errors during findOne', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const dbError = new Error('Database connection failed');
    mockRepository.findOne.mockRejectedValue(dbError);

    await expect(service.execute(taskId)).rejects.toThrow(dbError);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
  });

  void it('should handle undefined task (branch coverage for !task check)', async () => {
    const taskId = 'non-existent-id';
    mockRepository.findOne.mockResolvedValue(undefined);

    await expect(service.execute(taskId)).rejects.toThrow(NotFoundException);
    await expect(service.execute(taskId)).rejects.toThrow(
      `Task with ID ${taskId} not found`,
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
  });
});
