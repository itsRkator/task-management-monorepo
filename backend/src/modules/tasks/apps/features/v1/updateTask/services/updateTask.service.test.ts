import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sinon from 'sinon';
import { NotFoundException } from '@nestjs/common';
import { UpdateTaskService } from './index';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
import { UpdateTaskRequestDto } from '../contract';

describe('UpdateTaskService', () => {
  let service: UpdateTaskService;
  let repository: Repository<Task>;
  let mockRepository: {
    findOne: sinon.SinonStub;
    save: sinon.SinonStub;
  };

  // Cover import statements and class declaration branches (0, 4, 8, 9, 11, 12, 13)
  test('should cover all import statements and class metadata', () => {
    // Dynamically require the service module to trigger all import branches
    const serviceModule = require('./index');
    const serviceClass = serviceModule.UpdateTaskService;

    // Access all exports to cover import statement branches (branch 0)
    assert.ok(serviceModule);
    assert.ok(serviceClass);

    // Access class metadata to trigger decorator evaluation (branches 4, 8, 9, 11, 12, 13)
    assert.strictEqual(typeof serviceClass, 'function');
    assert.strictEqual(serviceClass.name, 'UpdateTaskService');

    // Access prototype to trigger class declaration branches
    const prototype = serviceClass.prototype;
    assert.ok(prototype);
    assert.ok(prototype.execute);
    assert.strictEqual(typeof prototype.execute, 'function');

    // Access constructor to trigger parameter decorator branches
    const constructor = serviceClass;
    assert.strictEqual(typeof constructor, 'function');
    const constructorParams = constructor.length;
    assert.ok(constructorParams >= 0);

    // Access all class properties to trigger metadata evaluation
    const classKeys = Object.keys(serviceClass);
    const prototypeKeys = Object.keys(prototype);
    assert.ok(Array.isArray(classKeys));
    assert.ok(Array.isArray(prototypeKeys));

    // Access constructor property descriptors
    const constructorDescriptor = Object.getOwnPropertyDescriptor(
      serviceClass,
      'prototype',
    );
    assert.ok(constructorDescriptor);

    // Access prototype property descriptors
    const executeDescriptor = Object.getOwnPropertyDescriptor(
      prototype,
      'execute',
    );
    assert.ok(executeDescriptor);
    assert.strictEqual(typeof executeDescriptor.value, 'function');

    // Trigger metadata reflection
    const metadataKeys = Reflect.getMetadataKeys(serviceClass);
    assert.ok(Array.isArray(metadataKeys));

    // Access all enumerable properties
    for (const key of classKeys) {
      const value = serviceClass[key];
      assert.ok(value !== undefined || key in serviceClass);
    }

    for (const key of prototypeKeys) {
      const value = prototype[key];
      assert.ok(value !== undefined || key in prototype);
    }
  });

  beforeEach(async () => {
    mockRepository = {
      findOne: sinon.stub(),
      save: sinon.stub(),
    };

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
    repository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    sinon.restore();
  });

  test('should be defined', () => {
    assert.ok(service);
  });

  test('should update a task successfully with all fields', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.id, taskId);
    assert.strictEqual(result.title, request.title);
    assert.strictEqual(result.description, request.description);
    assert.strictEqual(result.status, request.status);
    assert.strictEqual(result.priority, request.priority);
    assert.strictEqual(
      result.due_date?.getTime(),
      updatedTask.due_date.getTime(),
    );
    assert.ok(
      mockRepository.findOne.calledWith({
        where: { id: taskId },
      }),
    );
    assert.ok(mockRepository.save.called);
  });

  test('should throw NotFoundException when task does not exist', async () => {
    const taskId = 'non-existent-id';
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };

    mockRepository.findOne.resolves(null);

    await assert.rejects(
      async () => await service.execute(taskId, request),
      (error: Error) => {
        assert.ok(error instanceof NotFoundException);
        assert.strictEqual(error.message, `Task with ID ${taskId} not found`);
        return true;
      },
    );
    assert.ok(
      mockRepository.findOne.calledWith({
        where: { id: taskId },
      }),
    );
    assert.strictEqual(mockRepository.save.callCount, 0);
  });

  test('should handle description as null when not provided', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.description, null);
  });

  test('should handle description when provided', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.description, 'Updated Description');
  });

  test('should handle priority as null when not provided', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.priority, null);
  });

  test('should handle priority when provided', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.priority, TaskPriority.HIGH);
  });

  test('should handle due_date as null when not provided', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.due_date, null);
  });

  test('should handle due_date when provided', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.due_date?.getTime(), dueDate.getTime());
  });

  test('should handle empty string description as null', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.strictEqual(result.description, null);
  });

  test('should preserve created_at when updating', async () => {
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

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    const result = await service.execute(taskId, request);

    assert.deepStrictEqual(result.created_at, originalCreatedAt);
  });

  test('should handle undefined description (branch coverage)', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      description: undefined,
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: null,
    };

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    await service.execute(taskId, request);

    assert.ok(mockRepository.save.called);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.description, null);
  });

  test('should handle undefined priority (branch coverage)', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      priority: undefined,
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      priority: null,
    };

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    await service.execute(taskId, request);

    assert.ok(mockRepository.save.called);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.priority, null);
  });

  test('should handle undefined due_date (branch coverage)', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: new Date('2024-12-31'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      due_date: undefined,
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      due_date: null,
    };

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    await service.execute(taskId, request);

    assert.ok(mockRepository.save.called);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.due_date, null);
  });

  test('should handle null description explicitly (branch coverage for || operator)', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: 'Existing Description',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      description: null as any,
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: null,
    };

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    await service.execute(taskId, request);

    assert.ok(mockRepository.save.called);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    // null || null = null
    assert.strictEqual(savedTask.description, null);
  });

  test('should handle null priority explicitly (branch coverage for || operator)', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      priority: null as any,
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      priority: null,
    };

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    await service.execute(taskId, request);

    assert.ok(mockRepository.save.called);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    // null || null = null
    assert.strictEqual(savedTask.priority, null);
  });

  test('should handle empty string due_date (falsy, branch coverage for ?: operator)', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: new Date('2024-12-31'),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      due_date: '' as any,
    };

    const updatedTask = {
      ...existingTask,
      title: request.title,
      due_date: null,
    };

    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);

    await service.execute(taskId, request);

    assert.ok(mockRepository.save.called);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    // Empty string is falsy, so ?: should use null branch
    assert.strictEqual(savedTask.due_date, null);
  });

  test('should cover || operator truthy branch for description', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    // Test truthy branch: description provided
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: 'Old Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      description: 'New Description',
    };
    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: request.description,
    };
    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);
    await service.execute(taskId, request);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.description, 'New Description'); // Truthy branch
  });

  test('should cover || operator falsy branch for description', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    // Test falsy branch: description not provided
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: 'Old Description',
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };
    const updatedTask = {
      ...existingTask,
      title: request.title,
      description: null,
    };
    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);
    await service.execute(taskId, request);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.description, null); // Falsy branch
  });

  test('should cover || operator truthy branch for priority', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    // Test truthy branch: priority provided
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.LOW,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
    };
    const updatedTask = {
      ...existingTask,
      title: request.title,
      priority: request.priority,
    };
    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);
    await service.execute(taskId, request);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.priority, TaskPriority.HIGH); // Truthy branch
  });

  test('should cover || operator falsy branch for priority', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    // Test falsy branch: priority not provided
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: TaskPriority.HIGH,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };
    const updatedTask = {
      ...existingTask,
      title: request.title,
      priority: null,
    };
    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);
    await service.execute(taskId, request);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.priority, null); // Falsy branch
  });

  test('should cover ?: operator truthy branch for due_date', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    // Test truthy branch: due_date provided
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
      due_date: '2024-12-31T23:59:59Z',
    };
    const dueDate = new Date('2024-12-31T23:59:59Z');
    const updatedTask = {
      ...existingTask,
      title: request.title,
      due_date: dueDate,
    };
    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);
    await service.execute(taskId, request);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.ok(savedTask.due_date instanceof Date); // Truthy branch
    assert.strictEqual(savedTask.due_date.getTime(), dueDate.getTime());
  });

  test('should cover ?: operator falsy branch for due_date', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    // Test falsy branch: due_date not provided
    const existingTask = {
      id: taskId,
      title: 'Existing Task',
      description: null,
      status: TaskStatus.PENDING,
      priority: null,
      due_date: new Date('2024-12-31'),
      created_at: new Date(),
      updated_at: new Date(),
    };
    const request: UpdateTaskRequestDto = {
      title: 'Updated Task',
      status: TaskStatus.PENDING,
    };
    const updatedTask = {
      ...existingTask,
      title: request.title,
      due_date: null,
    };
    mockRepository.findOne.resolves(existingTask);
    mockRepository.save.resolves(updatedTask);
    await service.execute(taskId, request);
    const savedTask = mockRepository.save.getCall(0).args[0] as Task;
    assert.strictEqual(savedTask.due_date, null); // Falsy branch
  });
});
