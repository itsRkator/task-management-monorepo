import { validate } from 'class-validator';
import { UpdateTaskRequestDto, UpdateTaskResponseDto } from './index';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('UpdateTaskRequestDto', () => {
  it('should be defined', () => {
    expect(UpdateTaskRequestDto).toBeDefined();
  });

  it('should pass validation with valid data', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    dto.description = 'Test Description';
    dto.status = TaskStatus.PENDING;
    dto.priority = TaskPriority.HIGH;
    dto.due_date = '2024-12-31T23:59:59Z';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when title is empty', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = '';
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should fail validation when title is not provided', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation when title exceeds max length', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'a'.repeat(256);
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation when status is not provided', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation when status is empty', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    (dto as any).status = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation with invalid status', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    (dto as any).status = 'INVALID_STATUS';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass validation with all valid status values', async () => {
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const dto = new UpdateTaskRequestDto();
      dto.title = 'Test Task';
      dto.status = status;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });

  it('should pass validation with optional description', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with optional priority', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid priority enum', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    dto.status = TaskStatus.PENDING;
    dto.priority = TaskPriority.HIGH;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with optional due_date', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid date string', async () => {
    const dto = new UpdateTaskRequestDto();
    dto.title = 'Test Task';
    dto.status = TaskStatus.PENDING;
    dto.due_date = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateTaskResponseDto', () => {
  it('should be defined', () => {
    expect(UpdateTaskResponseDto).toBeDefined();
  });

  it('should allow creating response object', () => {
    const response = new UpdateTaskResponseDto();
    response.id = '123';
    response.title = 'Test';
    response.description = 'Desc';
    response.status = TaskStatus.PENDING;
    response.priority = TaskPriority.HIGH;
    response.due_date = new Date();
    response.created_at = new Date();
    response.updated_at = new Date();

    expect(response.id).toBe('123');
    expect(response.title).toBe('Test');
  });
});
