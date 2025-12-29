import { validate } from 'class-validator';
import { CreateTaskRequestDto, CreateTaskResponseDto } from './index';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('CreateTaskRequestDto', () => {
  it('should be defined', () => {
    expect(CreateTaskRequestDto).toBeDefined();
  });

  it('should pass validation with valid data', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    dto.description = 'Test Description';
    dto.status = TaskStatus.PENDING;
    dto.priority = TaskPriority.HIGH;
    dto.due_date = '2024-12-31T23:59:59Z';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when title is empty', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('title');
  });

  it('should fail validation when title is not provided', async () => {
    const dto = new CreateTaskRequestDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation when title is not a string', async () => {
    const dto = new CreateTaskRequestDto();
    (dto as any).title = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail validation when title exceeds max length', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'a'.repeat(256);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'title')).toBe(true);
  });

  it('should pass validation when title is exactly 255 characters', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'a'.repeat(255);

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with optional description', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation when description is provided', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    dto.description = 'Test Description';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when description is not a string', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    (dto as any).description = 123;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass validation with optional status', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid status enum', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    dto.status = TaskStatus.PENDING;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid status', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    (dto as any).status = 'INVALID_STATUS';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass validation with optional priority', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid priority enum', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    dto.priority = TaskPriority.HIGH;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid priority', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    (dto as any).priority = 'INVALID_PRIORITY';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass validation with optional due_date', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation with valid ISO date string', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    dto.due_date = '2024-12-31T23:59:59Z';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid date string', async () => {
    const dto = new CreateTaskRequestDto();
    dto.title = 'Test Task';
    dto.due_date = 'invalid-date';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('CreateTaskResponseDto', () => {
  it('should be defined', () => {
    expect(CreateTaskResponseDto).toBeDefined();
  });

  it('should allow creating response object', () => {
    const response = new CreateTaskResponseDto();
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
