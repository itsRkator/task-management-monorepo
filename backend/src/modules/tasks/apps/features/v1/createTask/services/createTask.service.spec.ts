import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateTaskService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { CreateTaskRequestDto } from '../contract';

void describe('CreateTaskService', () => {
  let service: CreateTaskService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  void beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CreateTaskService>(CreateTaskService);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  void it('should be defined', () => {
    expect(service).toBeDefined();
  });

  void it('should create a task successfully with all fields', async () => {
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

    expect(result.id).toBe(mockTask.id);
    expect(result.title).toBe(mockTask.title);
    expect(result.description).toBe(mockTask.description);
    expect(result.status).toBe(mockTask.status);
    expect(result.priority).toBe(mockTask.priority);
    expect(result.due_date?.getTime()).toBe(mockTask.due_date.getTime());
    expect(mockRepository.create).toHaveBeenCalledWith({
      title: request.title,
      description: request.description,
      status: request.status,
      priority: request.priority,
      due_date: new Date(request.due_date!),
    });
    expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
  });

  void it('should create a task with default values when optional fields are missing', async () => {
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

    expect(result.status).toBe(TaskStatus.PENDING);
    expect(result.description).toBeNull();
    expect(result.priority).toBeNull();
    expect(result.due_date).toBeNull();
    expect(mockRepository.create).toHaveBeenCalledWith({
      title: request.title,
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
    });
  });

  void it('should handle description as null when not provided', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
    );
  });

  void it('should handle description when provided', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      description: 'Test Description',
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test Description',
      }),
    );
  });

  void it('should handle status when provided', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      status: TaskStatus.IN_PROGRESS,
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.IN_PROGRESS,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TaskStatus.IN_PROGRESS,
      }),
    );
  });

  void it('should handle priority when provided', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      priority: TaskPriority.MEDIUM,
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.MEDIUM,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: TaskPriority.MEDIUM,
      }),
    );
  });

  void it('should handle priority as null when not provided', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: null,
      }),
    );
  });

  void it('should handle due_date when provided', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      due_date: '2024-12-31T23:59:59Z',
    };

    const dueDate = new Date('2024-12-31T23:59:59Z');
    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: dueDate,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        due_date: dueDate,
      }),
    );
  });

  void it('should handle due_date as null when not provided', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        due_date: null,
      }),
    );
  });

  void it('should handle empty string description as null', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      description: '',
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null,
      }),
    );
  });

  void it('should return all task properties in response', async () => {
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
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-02'),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    const result = await service.execute(request);

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('priority');
    expect(result).toHaveProperty('due_date');
    expect(result).toHaveProperty('created_at');
    expect(result).toHaveProperty('updated_at');
  });

  void it('should handle database save errors', async () => {
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
    const dbError = new Error('Database connection failed');
    mockRepository.save.mockRejectedValue(dbError);

    await expect(service.execute(request)).rejects.toThrow(dbError);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  void it('should handle database constraint violations', async () => {
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
    const constraintError = new Error('Unique constraint violation');
    mockRepository.save.mockRejectedValue(constraintError);

    await expect(service.execute(request)).rejects.toThrow(constraintError);
    expect(mockRepository.create).toHaveBeenCalled();
    expect(mockRepository.save).toHaveBeenCalled();
  });

  void it('should cover || operator truthy branch for description', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      description: 'Test Description',
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Test Description', // Truthy branch
      }),
    );
  });

  void it('should cover || operator falsy branch for description', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description: null, // Falsy branch
      }),
    );
  });

  void it('should cover || operator truthy branch for status', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      status: TaskStatus.IN_PROGRESS,
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.IN_PROGRESS,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TaskStatus.IN_PROGRESS, // Truthy branch
      }),
    );
  });

  void it('should cover || operator falsy branch for status', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: TaskStatus.PENDING, // Falsy branch (default)
      }),
    );
  });

  void it('should cover || operator truthy branch for priority', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      priority: TaskPriority.HIGH,
    };

    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: TaskPriority.HIGH, // Truthy branch
      }),
    );
  });

  void it('should cover || operator falsy branch for priority', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: null, // Falsy branch
      }),
    );
  });

  void it('should cover ?: operator truthy branch for due_date', async () => {
    const request: CreateTaskRequestDto = {
      title: 'Test Task',
      due_date: '2024-12-31T23:59:59Z',
    };

    const dueDate = new Date('2024-12-31T23:59:59Z');
    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: dueDate,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockRepository.create.mockReturnValue(mockTask);
    mockRepository.save.mockResolvedValue(mockTask);

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        due_date: expect.any(Date) as Date, // Truthy branch
      }),
    );
  });

  void it('should cover ?: operator falsy branch for due_date', async () => {
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

    await service.execute(request);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        due_date: null, // Falsy branch
      }),
    );
  });
});
