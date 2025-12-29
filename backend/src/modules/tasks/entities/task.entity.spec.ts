import { Task, TaskStatus, TaskPriority } from './task.entity';

describe('Task Entity', () => {
  describe('TaskStatus enum', () => {
    it('should have PENDING value', () => {
      expect(TaskStatus.PENDING).toBe('PENDING');
    });

    it('should have IN_PROGRESS value', () => {
      expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    });

    it('should have COMPLETED value', () => {
      expect(TaskStatus.COMPLETED).toBe('COMPLETED');
    });

    it('should have CANCELLED value', () => {
      expect(TaskStatus.CANCELLED).toBe('CANCELLED');
    });
  });

  describe('TaskPriority enum', () => {
    it('should have LOW value', () => {
      expect(TaskPriority.LOW).toBe('LOW');
    });

    it('should have MEDIUM value', () => {
      expect(TaskPriority.MEDIUM).toBe('MEDIUM');
    });

    it('should have HIGH value', () => {
      expect(TaskPriority.HIGH).toBe('HIGH');
    });
  });

  describe('Task entity', () => {
    it('should create a task instance', () => {
      const task = new Task();
      expect(task).toBeInstanceOf(Task);
    });

    it('should have all required properties', () => {
      const task = new Task();
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('due_date');
      expect(task).toHaveProperty('created_at');
      expect(task).toHaveProperty('updated_at');
    });

    it('should allow setting task properties', () => {
      const task = new Task();
      task.title = 'Test Task';
      task.description = 'Test Description';
      task.status = TaskStatus.PENDING;
      task.priority = TaskPriority.HIGH;
      task.due_date = new Date('2024-12-31');

      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.due_date).toEqual(new Date('2024-12-31'));
    });

    it('should allow null description', () => {
      const task = new Task();
      task.description = null;
      expect(task.description).toBeNull();
    });

    it('should allow null priority', () => {
      const task = new Task();
      task.priority = null;
      expect(task.priority).toBeNull();
    });

    it('should allow null due_date', () => {
      const task = new Task();
      task.due_date = null;
      expect(task.due_date).toBeNull();
    });

    it('should accept all TaskStatus values', () => {
      const task = new Task();
      task.status = TaskStatus.PENDING;
      expect(task.status).toBe(TaskStatus.PENDING);

      task.status = TaskStatus.IN_PROGRESS;
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);

      task.status = TaskStatus.COMPLETED;
      expect(task.status).toBe(TaskStatus.COMPLETED);

      task.status = TaskStatus.CANCELLED;
      expect(task.status).toBe(TaskStatus.CANCELLED);
    });

    it('should accept all TaskPriority values', () => {
      const task = new Task();
      task.priority = TaskPriority.LOW;
      expect(task.priority).toBe(TaskPriority.LOW);

      task.priority = TaskPriority.MEDIUM;
      expect(task.priority).toBe(TaskPriority.MEDIUM);

      task.priority = TaskPriority.HIGH;
      expect(task.priority).toBe(TaskPriority.HIGH);
    });
  });
});
