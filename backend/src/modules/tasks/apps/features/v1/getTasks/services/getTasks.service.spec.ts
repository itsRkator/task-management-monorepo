import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GetTasksService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { GetTasksQueryDto } from '../contract';

void describe('GetTasksService', () => {
  let service: GetTasksService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  void beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<GetTasksService>(GetTasksService);
  });

  void afterEach(() => {
    jest.clearAllMocks();
  });

  void it('should be defined', () => {
    expect(service).toBeDefined();
  });

  void it('should get tasks with pagination', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 1]);

    const result = await service.execute(query);

    expect(result.data.length).toBe(1);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.total).toBe(1);
    expect(result.meta.totalPages).toBe(1);
    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });

  void it('should filter tasks by status', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      status: TaskStatus.COMPLETED,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'task.status = :status',
      { status: TaskStatus.COMPLETED },
    );
  });

  void it('should filter tasks by priority', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      priority: TaskPriority.HIGH,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      'task.priority = :priority',
      { priority: TaskPriority.HIGH },
    );
  });

  void it('should search tasks by title or description', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      search: 'test',
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
      '(task.title ILIKE :search OR task.description ILIKE :search)',
      { search: '%test%' },
    );
  });

  void it('should use default pagination values', async () => {
    const query: GetTasksQueryDto = {};

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.execute(query);

    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  void it('should handle multiple filters together', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      search: 'test',
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.where).toHaveBeenCalled();
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
  });

  void it('should calculate totalPages correctly', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

    const result = await service.execute(query);

    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3);
  });

  void it('should handle zero total pages', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.execute(query);

    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  void it('should map task items correctly', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    const mockTasks = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: new Date('2024-12-31'),
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      },
      {
        id: '2',
        title: 'Task 2',
        description: null,
        status: TaskStatus.COMPLETED,
        priority: null,
        due_date: null,
        created_at: new Date('2024-01-03'),
        updated_at: new Date('2024-01-04'),
      },
    ];

    mockQueryBuilder.getManyAndCount.mockResolvedValue([mockTasks, 2]);

    const result = await service.execute(query);

    expect(result.data.length).toBe(2);
    expect(result.data[0].id).toBe('1');
    expect(result.data[0].title).toBe('Task 1');
    expect(result.data[0].description).toBe('Description 1');
    expect(result.data[0].status).toBe(TaskStatus.PENDING);
    expect(result.data[0].priority).toBe(TaskPriority.HIGH);
    expect(result.data[1].description).toBeNull();
    expect(result.data[1].priority).toBeNull();
    expect(result.data[1].due_date).toBeNull();
  });

  void it('should calculate skip correctly for different pages', async () => {
    const query: GetTasksQueryDto = {
      page: 3,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });

  void it('should order by created_at DESC', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
      'task.created_at',
      'DESC',
    );
  });

  void it('should throw BadRequestException when page is invalid', async () => {
    const query: GetTasksQueryDto = {
      page: -1,
    };

    await expect(service.execute(query)).rejects.toThrow(
      'Page must be a positive integer',
    );
  });

  void it('should throw BadRequestException when page is not an integer', async () => {
    const query: GetTasksQueryDto = {
      page: 1.5,
    };

    await expect(service.execute(query)).rejects.toThrow(
      'Page must be a positive integer',
    );
  });

  void it('should throw BadRequestException when limit is invalid', async () => {
    const query: GetTasksQueryDto = {
      limit: -1,
    };

    await expect(service.execute(query)).rejects.toThrow(
      'Limit must be a positive integer',
    );
  });

  void it('should throw BadRequestException when limit is not an integer', async () => {
    const query: GetTasksQueryDto = {
      limit: 1.5,
    };

    await expect(service.execute(query)).rejects.toThrow(
      'Limit must be a positive integer',
    );
  });

  void it('should throw BadRequestException when limit exceeds 100', async () => {
    const query: GetTasksQueryDto = {
      limit: 101,
    };

    await expect(service.execute(query)).rejects.toThrow(
      'Limit cannot exceed 100',
    );
  });

  void it('should handle page as string and convert to number', async () => {
    const query = {
      page: '2' as unknown as number,
      limit: 10,
    } as GetTasksQueryDto;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
  });

  void it('should handle limit as string and convert to number', async () => {
    const query = {
      page: 1,
      limit: '20' as unknown as number,
    } as GetTasksQueryDto;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
  });

  void it('should use default page when page is undefined', async () => {
    const query: GetTasksQueryDto = {
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1-1) * 10
  });

  void it('should use default limit when limit is undefined', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });

  void it('should handle pageRaw as non-number non-string (defaults to 1)', async () => {
    const query = {
      page: true as unknown as number,
    } as GetTasksQueryDto;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1-1) * 10
  });

  void it('should handle limitRaw as non-number non-string (defaults to 10)', async () => {
    const query = {
      limit: true as unknown as number,
    } as GetTasksQueryDto;

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });
});
