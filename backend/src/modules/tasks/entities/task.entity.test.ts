import { describe, test } from 'node:test';
import { strict as assert } from 'node:assert';
import { Task, TaskStatus, TaskPriority } from './task.entity';

describe('Task Entity', () => {
  test('should be defined', () => {
    assert.ok(Task);
  });

  test('should create a task instance with all properties', () => {
    const task = new Task();
    task.id = '123e4567-e89b-12d3-a456-426614174000';
    task.title = 'Test Task';
    task.description = 'Test Description';
    task.status = TaskStatus.PENDING;
    task.priority = TaskPriority.HIGH;
    task.due_date = new Date('2024-12-31T23:59:59Z');
    task.created_at = new Date();
    task.updated_at = new Date();

    assert.strictEqual(task.id, '123e4567-e89b-12d3-a456-426614174000');
    assert.strictEqual(task.title, 'Test Task');
    assert.strictEqual(task.description, 'Test Description');
    assert.strictEqual(task.status, TaskStatus.PENDING);
    assert.strictEqual(task.priority, TaskPriority.HIGH);
    assert.ok(task.due_date instanceof Date);
    assert.ok(task.created_at instanceof Date);
    assert.ok(task.updated_at instanceof Date);
  });

  test('should create a task instance with minimal properties', () => {
    const task = new Task();
    task.id = '123e4567-e89b-12d3-a456-426614174000';
    task.title = 'Test Task';
    task.description = null;
    task.status = TaskStatus.PENDING;
    task.priority = null;
    task.due_date = null;
    task.created_at = new Date();
    task.updated_at = new Date();

    assert.strictEqual(task.title, 'Test Task');
    assert.strictEqual(task.description, null);
    assert.strictEqual(task.status, TaskStatus.PENDING);
    assert.strictEqual(task.priority, null);
    assert.strictEqual(task.due_date, null);
  });

  test('should handle all TaskStatus enum values', () => {
    const statuses = [
      TaskStatus.PENDING,
      TaskStatus.IN_PROGRESS,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED,
    ];

    for (const status of statuses) {
      const task = new Task();
      task.status = status;
      assert.strictEqual(task.status, status);
    }
  });

  test('should handle all TaskPriority enum values', () => {
    const priorities = [
      TaskPriority.LOW,
      TaskPriority.MEDIUM,
      TaskPriority.HIGH,
    ];

    for (const priority of priorities) {
      const task = new Task();
      task.priority = priority;
      assert.strictEqual(task.priority, priority);
    }
  });

  test('should handle null priority', () => {
    const task = new Task();
    task.priority = null;
    assert.strictEqual(task.priority, null);
  });

  test('should handle null description', () => {
    const task = new Task();
    task.description = null;
    assert.strictEqual(task.description, null);
  });

  test('should handle null due_date', () => {
    const task = new Task();
    task.due_date = null;
    assert.strictEqual(task.due_date, null);
  });

  test('should handle date values for due_date', () => {
    const dueDate = new Date('2024-12-31T23:59:59Z');
    const task = new Task();
    task.due_date = dueDate;
    assert.strictEqual(task.due_date.getTime(), dueDate.getTime());
  });

  test('should handle date values for created_at', () => {
    const createdAt = new Date('2024-01-01T00:00:00Z');
    const task = new Task();
    task.created_at = createdAt;
    assert.strictEqual(task.created_at.getTime(), createdAt.getTime());
  });

  test('should handle date values for updated_at', () => {
    const updatedAt = new Date('2024-01-02T00:00:00Z');
    const task = new Task();
    task.updated_at = updatedAt;
    assert.strictEqual(task.updated_at.getTime(), updatedAt.getTime());
  });

  test('should handle maximum length title', () => {
    const task = new Task();
    task.title = 'a'.repeat(255);
    assert.strictEqual(task.title.length, 255);
  });

  test('should handle empty string description', () => {
    const task = new Task();
    task.description = '';
    assert.strictEqual(task.description, '');
  });

  test('should handle very long description', () => {
    const longDescription = 'a'.repeat(10000);
    const task = new Task();
    task.description = longDescription;
    assert.strictEqual(task.description, longDescription);
  });

  test('should cover branches when properties are accessed before being set', () => {
    const task = new Task();

    // Access properties before setting them to cover initial undefined branches
    const idBefore = task.id;
    const titleBefore = task.title;
    const descBefore = task.description;
    const statusBefore = task.status;
    const priorityBefore = task.priority;
    const dueDateBefore = task.due_date;
    const createdAtBefore = task.created_at;
    const updatedAtBefore = task.updated_at;

    // Then set them
    task.id = '123';
    task.title = 'Test';
    task.description = 'Desc';
    task.status = TaskStatus.PENDING;
    task.priority = TaskPriority.HIGH;
    task.due_date = new Date();
    task.created_at = new Date();
    task.updated_at = new Date();

    // Access again after setting
    const idAfter = task.id;
    const titleAfter = task.title;
    const descAfter = task.description;
    const statusAfter = task.status;
    const priorityAfter = task.priority;
    const dueDateAfter = task.due_date;
    const createdAtAfter = task.created_at;
    const updatedAtAfter = task.updated_at;

    assert.strictEqual(idBefore, undefined);
    assert.strictEqual(titleBefore, undefined);
    assert.strictEqual(descBefore, undefined);
    assert.strictEqual(statusBefore, undefined);
    assert.strictEqual(priorityBefore, undefined);
    assert.strictEqual(dueDateBefore, undefined);
    assert.strictEqual(createdAtBefore, undefined);
    assert.strictEqual(updatedAtBefore, undefined);

    assert.strictEqual(idAfter, '123');
    assert.strictEqual(titleAfter, 'Test');
    assert.strictEqual(descAfter, 'Desc');
    assert.strictEqual(statusAfter, TaskStatus.PENDING);
    assert.strictEqual(priorityAfter, TaskPriority.HIGH);
    assert.ok(dueDateAfter instanceof Date);
    assert.ok(createdAtAfter instanceof Date);
    assert.ok(updatedAtAfter instanceof Date);
  });

  test('should cover branches with undefined and null combinations', () => {
    const task1 = new Task();
    task1.description = undefined as any;
    task1.priority = undefined as any;
    task1.due_date = undefined as any;

    const task2 = new Task();
    task2.description = null;
    task2.priority = null;
    task2.due_date = null;

    // Access properties to cover both undefined and null branches
    const desc1 = task1.description;
    const priority1 = task1.priority;
    const dueDate1 = task1.due_date;

    const desc2 = task2.description;
    const priority2 = task2.priority;
    const dueDate2 = task2.due_date;

    assert.strictEqual(desc1, undefined);
    assert.strictEqual(priority1, undefined);
    assert.strictEqual(dueDate1, undefined);

    assert.strictEqual(desc2, null);
    assert.strictEqual(priority2, null);
    assert.strictEqual(dueDate2, null);
  });
});

describe('TaskStatus Enum', () => {
  test('should have PENDING value', () => {
    assert.strictEqual(TaskStatus.PENDING, 'PENDING');
  });

  test('should have IN_PROGRESS value', () => {
    assert.strictEqual(TaskStatus.IN_PROGRESS, 'IN_PROGRESS');
  });

  test('should have COMPLETED value', () => {
    assert.strictEqual(TaskStatus.COMPLETED, 'COMPLETED');
  });

  test('should have CANCELLED value', () => {
    assert.strictEqual(TaskStatus.CANCELLED, 'CANCELLED');
  });
});

describe('TaskPriority Enum', () => {
  test('should have LOW value', () => {
    assert.strictEqual(TaskPriority.LOW, 'LOW');
  });

  test('should have MEDIUM value', () => {
    assert.strictEqual(TaskPriority.MEDIUM, 'MEDIUM');
  });

  test('should have HIGH value', () => {
    assert.strictEqual(TaskPriority.HIGH, 'HIGH');
  });
});
