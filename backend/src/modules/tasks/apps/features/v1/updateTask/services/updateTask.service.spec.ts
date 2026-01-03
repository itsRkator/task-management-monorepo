import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { UpdateTaskRequestDto } from '../contract';

void describe('UpdateTaskService', () => {
  let service: UpdateTaskService;

  const mockTransactionalEntityManager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
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
        UpdateTaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UpdateTaskService>(UpdateTaskService);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  void it('should be defined', () => {
    expect(service).toBeDefined();
  });

  void it('should update a task successfully with all fields', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.id).toBe(taskId);
    expect(result.title).toBe(request.title);
    expect(result.description).toBe(request.description);
    expect(result.status).toBe(request.status);
    expect(result.priority).toBe(request.priority);
    expect(result.due_date?.getTime()).toBe(updatedTask.due_date.getTime());
    expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledWith(Task, {
      where: { id: taskId },
    });
    expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(
      Task,
      expect.objectContaining({
        id: taskId,
        title: request.title,
        description: request.description,
        status: request.status,
        priority: request.priority,
      }),
    );
  });

  void it('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    mockTransactionalEntityManager.findOne.mockResolvedValue(null);

    await expect(service.execute(taskId, request)).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.execute(taskId, request)).rejects.toThrow(
      `Task with ID ${taskId} not found`,
    );
    expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledWith(Task, {
      where: { id: taskId },
    });
    expect(mockTransactionalEntityManager.save).not.toHaveBeenCalled();
  });

  void it('should handle description as null when not provided', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBeNull();
  });

  void it('should handle description when provided', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBe('Updated Description');
  });

  void it('should handle priority as null when not provided', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.priority).toBeNull();
  });

  void it('should handle priority when provided', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.priority).toBe(TaskPriority.HIGH);
  });

  void it('should handle due_date as null when not provided', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.due_date).toBeNull();
  });

  void it('should handle due_date when provided', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.due_date?.getTime()).toBe(dueDate.getTime());
  });

  void it('should handle empty string description as null', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBeNull();
  });

  void it('should preserve created_at when updating', async () => {
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

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.created_at).toEqual(originalCreatedAt);
  });

  void it('should throw BadRequestException when title is not a string', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request = {
      title: 123 as unknown as string,
    } as UpdateTaskRequestDto;

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Title is required and must be a string',
    );
  });

  void it('should throw BadRequestException when title is empty after trim', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: '   ',
      status: TaskStatus.PENDING,
    };

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Title cannot be empty',
    );
  });

  void it('should throw BadRequestException when title exceeds 255 characters', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'a'.repeat(256),
      status: TaskStatus.PENDING,
    };

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Title cannot exceed 255 characters',
    );
  });

  void it('should throw BadRequestException when status is invalid', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request = {
      title: 'Test Task',
      status: 'INVALID_STATUS' as TaskStatus,
    } as UpdateTaskRequestDto;

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Invalid status',
    );
  });

  void it('should throw BadRequestException when priority is invalid', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request = {
      title: 'Test Task',
      status: TaskStatus.PENDING,
      priority: 'INVALID_PRIORITY' as TaskPriority,
    } as UpdateTaskRequestDto;

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Invalid priority',
    );
  });

  void it('should throw BadRequestException when due_date is not a string', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request = {
      title: 'Test Task',
      status: TaskStatus.PENDING,
      due_date: 123 as unknown as string,
    } as UpdateTaskRequestDto;

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Due date must be a string in ISO format',
    );
  });

  void it('should throw BadRequestException when due_date is invalid format', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request: UpdateTaskRequestDto = {
      title: 'Test Task',
      status: TaskStatus.PENDING,
      due_date: 'invalid-date',
    };

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Invalid date format',
    );
  });

  void it('should throw BadRequestException when description is not a string', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const request = {
      title: 'Test Task',
      status: TaskStatus.PENDING,
      description: 123 as unknown as string,
    } as UpdateTaskRequestDto;

    mockTransactionalEntityManager.findOne.mockResolvedValue({
      id: taskId,
      title: 'Existing Task',
    });

    await expect(service.execute(taskId, request)).rejects.toThrow(
      'Description must be a string',
    );
  });

  void it('should set description to null when trim() returns empty string', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: 'Old description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      description: '   ',
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: null,
    };

    mockTransactionalEntityManager.findOne.mockResolvedValue(existingTask);
    mockTransactionalEntityManager.save.mockResolvedValue(updatedTask);

    const result = await service.execute(taskId, request);

    expect(result.description).toBeNull();
  });
});
