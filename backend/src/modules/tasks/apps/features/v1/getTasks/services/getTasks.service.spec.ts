import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { GetTasksService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { GetTasksQueryDto } from '../contract';

describe('GetTasksService', () => {
  let service: GetTasksService;
  let repository: Repository<Task>;
  let queryBuilder: SelectQueryBuilder<Task>;

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

  beforeEach(async () => {
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
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get tasks with pagination', async () => {
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

  it('should filter tasks by status', async () => {
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

  it('should filter tasks by priority', async () => {
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

  it('should search tasks by title or description', async () => {
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

  it('should use default pagination values', async () => {
    const query: GetTasksQueryDto = {};

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.execute(query);

    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  it('should handle multiple filters together', async () => {
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

  it('should calculate totalPages correctly', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

    const result = await service.execute(query);

    expect(result.meta.total).toBe(25);
    expect(result.meta.totalPages).toBe(3);
  });

  it('should handle zero total pages', async () => {
    const query: GetTasksQueryDto = {
      page: 1,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const result = await service.execute(query);

    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(0);
  });

  it('should map task items correctly', async () => {
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

  it('should calculate skip correctly for different pages', async () => {
    const query: GetTasksQueryDto = {
      page: 3,
      limit: 10,
    };

    mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await service.execute(query);

    expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
    expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
  });

  it('should order by created_at DESC', async () => {
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
});
