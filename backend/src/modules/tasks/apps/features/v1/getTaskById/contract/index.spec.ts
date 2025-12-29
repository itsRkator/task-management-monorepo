import { GetTaskByIdResponseDto } from './index';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('GetTaskByIdResponseDto', () => {
  it('should be defined', () => {
    expect(GetTaskByIdResponseDto).toBeDefined();
  });

  it('should allow creating response object', () => {
    const response = new GetTaskByIdResponseDto();
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
    expect(response.description).toBe('Desc');
    expect(response.status).toBe(TaskStatus.PENDING);
    expect(response.priority).toBe(TaskPriority.HIGH);
  });

  it('should allow null description', () => {
    const response = new GetTaskByIdResponseDto();
    response.description = null;
    expect(response.description).toBeNull();
  });

  it('should allow null priority', () => {
    const response = new GetTaskByIdResponseDto();
    response.priority = null;
    expect(response.priority).toBeNull();
  });

  it('should allow null due_date', () => {
    const response = new GetTaskByIdResponseDto();
    response.due_date = null;
    expect(response.due_date).toBeNull();
  });
});
