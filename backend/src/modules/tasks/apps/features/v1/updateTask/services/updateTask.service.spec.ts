import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { UpdateTaskRequestDto } from '../contract';

describe('UpdateTaskService', () => {
  let service: UpdateTaskService;
  let repository: Repository<Task>;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateTaskService>(UpdateTaskService);
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update a task successfully with all fields', async () => {
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

    expect(result.id).toBe(taskId);
    expect(result.title).toBe(request.title);
    expect(result.description).toBe(request.description);
    expect(result.status).toBe(request.status);
    expect(result.priority).toBe(request.priority);
    expect(result.due_date?.getTime()).toBe(updatedTask.due_date.getTime());
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(mockRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.execute(taskId, request)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute(taskId, request)).rejects.toThrow(
      `Task with ID ${taskId} not found`,
    );
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: taskId },
    });
    expect(mockRepository.save).not.toHaveBeenCalled();
  });

  it('should handle description as null when not provided', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: 'Original Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: null,
      status: request.status,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBeNull();
  });

  it('should handle description when provided', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      description: 'Updated Description',
      status: TaskStatus.PENDING,
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: 'Original Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: request.description,
      status: request.status,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBe('Updated Description');
  });

  it('should handle priority as null when not provided', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      priority: null,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.priority).toBeNull();
  });

  it('should handle priority when provided', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      priority: request.priority,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.priority).toBe(TaskPriority.HIGH);
  });

  it('should handle due_date as null when not provided', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: new Date('2024-01-01'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      due_date: null,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.due_date).toBeNull();
  });

  it('should handle due_date when provided', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      due_date: '2024-12-31T23:59:59Z',
    };

    const dueDate = new Date('2024-12-31T23:59:59Z');
    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      due_date: dueDate,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.due_date?.getTime()).toBe(dueDate.getTime());
  });

  it('should handle empty string description as null', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      description: '',
      status: TaskStatus.PENDING,
    };

    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: 'Original Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: null,
      status: request.status,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBeNull();
  });

  it('should preserve created_at when updating', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    const originalCreatedAt = new Date('2024-01-01');
    const existingTask = {
      id: taskId,
      title: 'Original Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: originalCreatedAt,
      updated_at: new Date(),
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
    };

    mockRepository.findOne.mockResolvedValue(existingTask);
    mockRepository.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.created_at).toEqual(originalCreatedAt);
  });
});
