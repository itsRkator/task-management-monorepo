import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetTasksQueryDto, GetTasksResponseDto, TaskItemDto } from './index';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

void describe('GetTasksQueryDto', () => {
  void it('should be defined', () => {
    expect(GetTasksQueryDto).toBeDefined();
  });

  void it('should pass validation with default values', async () => {
    const dto = plainToInstance(GetTasksQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(10);
  });

  void it('should pass validation with valid page number', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { page: 1 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(1);
  });

  void it('should fail validation when page is less than 1', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { page: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should fail validation when page is negative', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { page: -1 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should fail validation when page is not an integer', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { page: 1.5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should pass validation with valid limit', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { limit: 10 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.limit).toBe(10);
  });

  void it('should fail validation when limit is less than 1', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { limit: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should fail validation when limit exceeds 100', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { limit: 101 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should pass validation when limit is exactly 100', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { limit: 100 });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  void it('should fail validation when limit is not an integer', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { limit: 10.5 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should pass validation with optional status', async () => {
    const dto = plainToInstance(GetTasksQueryDto, {
      status: TaskStatus.PENDING,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.status).toBe(TaskStatus.PENDING);
  });

  void it('should fail validation with invalid status', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { status: 'INVALID_STATUS' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should pass validation with all valid status values', async () => {
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const dto = plainToInstance(GetTasksQueryDto, { status });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  void it('should pass validation with optional priority', async () => {
    const dto = plainToInstance(GetTasksQueryDto, {
      priority: TaskPriority.HIGH,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.priority).toBe(TaskPriority.HIGH);
  });

  void it('should fail validation with invalid priority', async () => {
    const dto = plainToInstance(GetTasksQueryDto, {
      priority: 'INVALID_PRIORITY',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  void it('should pass validation with all valid priority values', async () => {
    const priorities = [
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ];

    for (const priority of priorities) {
      const dto = plainToInstance(GetTasksQueryDto, { priority });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  void it('should pass validation with optional search', async () => {
    const dto = plainToInstance(GetTasksQueryDto, { search: 'test' });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.search).toBe('test');
  });

  void it('should pass validation without search', async () => {
    const dto = plainToInstance(GetTasksQueryDto, {});
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.search).toBeUndefined();
  });
});

void describe('TaskItemDto', () => {
  void it('should be defined', () => {
    expect(TaskItemDto).toBeDefined();
  });

  void it('should allow creating task item object', () => {
    const item: TaskItemDto = {
      id: '123',
      title: 'Test',
      description: 'Desc',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    expect(item.id).toBe('123');
    expect(item.title).toBe('Test');
  });
});

void describe('GetTasksResponseDto', () => {
  void it('should be defined', () => {
    expect(GetTasksResponseDto).toBeDefined();
  });

  void it('should allow creating response object', () => {
    const response: GetTasksResponseDto = {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    expect(response.data).toEqual([]);
    expect(response.meta.page).toBe(1);
    expect(response.meta.limit).toBe(10);
  });
});
