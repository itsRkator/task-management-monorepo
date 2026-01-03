// MUST import reflect-metadata FIRST before any other imports
// This ensures decorator metadata is available for class-validator
import 'reflect-metadata';
import { describe, test, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import sinon from 'sinon';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { TasksModule } from '../src/modules/tasks/tasks.module';
import { CreateTaskService } from '../src/modules/tasks/apps/features/v1/createTask/services';
import { CreateTaskEndpoint } from '../src/modules/tasks/apps/features/v1/createTask/endpoint';
import { UpdateTaskService } from '../src/modules/tasks/apps/features/v1/updateTask/services';
import { UpdateTaskEndpoint } from '../src/modules/tasks/apps/features/v1/updateTask/endpoint';
import { RemoveTaskService } from '../src/modules/tasks/apps/features/v1/removeTask/services';
import { RemoveTaskEndpoint } from '../src/modules/tasks/apps/features/v1/removeTask/endpoint';
import { GetTaskByIdService } from '../src/modules/tasks/apps/features/v1/getTaskById/services';
import { GetTaskByIdEndpoint } from '../src/modules/tasks/apps/features/v1/getTaskById/endpoint';
import { GetTasksService } from '../src/modules/tasks/apps/features/v1/getTasks/services';
import { GetTasksEndpoint } from '../src/modules/tasks/apps/features/v1/getTasks/endpoint';
import {
  TaskStatus,
  TaskPriority,
  Task,
} from '../src/modules/tasks/entities/task.entity';

// Simple UUID v4 generator for testing
const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

void describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let inMemoryTasks: Task[] = [];

  // Mock repository with in-memory storage
  const createMockRepository = () => {
    const tasks: Task[] = [];

    const createQueryBuilderInstance = () => {
      const whereConditions: Array<{
        condition: string;
        params: Record<string, unknown>;
      }> = [];
      let skipValue = 0;
      let takeValue = 10;
      let orderByField = 'created_at';
      let orderByDirection: 'ASC' | 'DESC' = 'DESC';

      const mockQueryBuilder: Partial<SelectQueryBuilder<Task>> = {
        where: sinon
          .stub()
          .callsFake((condition: string, params?: Record<string, unknown>) => {
            whereConditions.length = 0; // Clear previous conditions
            whereConditions.push({ condition, params: params || {} });
            return mockQueryBuilder;
          }),
        andWhere: sinon
          .stub()
          .callsFake((condition: string, params?: Record<string, unknown>) => {
            whereConditions.push({ condition, params: params || {} });
            return mockQueryBuilder;
          }),
        skip: sinon.stub().callsFake((value: number) => {
          skipValue = value;
          return mockQueryBuilder;
        }),
        take: sinon.stub().callsFake((value: number) => {
          takeValue = value;
          return mockQueryBuilder;
        }),
        orderBy: sinon
          .stub()
          .callsFake((field: string, direction: 'ASC' | 'DESC' = 'DESC') => {
            orderByField = field.replace('task.', '');
            orderByDirection = direction;
            return mockQueryBuilder;
          }),
        getManyAndCount: sinon.stub().callsFake(() => {
          let filteredTasks = [...tasks];

          // Apply filters from where/andWhere calls
          for (const { condition, params } of whereConditions) {
            if (condition.includes('task.status = :status') && params?.status) {
              filteredTasks = filteredTasks.filter(
                (t) => t.status === params.status,
              );
            }
            if (
              condition.includes('task.priority = :priority') &&
              params?.priority
            ) {
              filteredTasks = filteredTasks.filter(
                (t) => t.priority === params.priority,
              );
            }
            if (condition.includes('ILIKE :search') && params?.search) {
              const searchValue = params.search;
              const searchTerm =
                typeof searchValue === 'string'
                  ? searchValue.replace(/%/g, '').toLowerCase()
                  : typeof searchValue === 'object' &&
                      searchValue !== null &&
                      'toString' in searchValue
                    ? (searchValue as { toString: () => string })
                        .toString()
                        .replace(/%/g, '')
                        .toLowerCase()
                    : '';
              filteredTasks = filteredTasks.filter(
                (t) =>
                  t.title.toLowerCase().includes(searchTerm) ||
                  (t.description &&
                    t.description.toLowerCase().includes(searchTerm)),
              );
            }
          }

          // Apply sorting
          filteredTasks.sort((a, b) => {
            const aValue = (a as unknown as Record<string, unknown>)[
              orderByField
            ];
            const bValue = (b as unknown as Record<string, unknown>)[
              orderByField
            ];
            if (!aValue && !bValue) return 0;
            if (!aValue) return 1;
            if (!bValue) return -1;
            if (aValue < bValue) return orderByDirection === 'ASC' ? -1 : 1;
            if (aValue > bValue) return orderByDirection === 'ASC' ? 1 : -1;
            return 0;
          });

          // Apply pagination
          const paginatedTasks = filteredTasks.slice(
            skipValue,
            skipValue + takeValue,
          );

          return Promise.resolve([paginatedTasks, filteredTasks.length]);
        }),
      };

      return mockQueryBuilder;
    };

    // Create transactional manager methods
    const createTransactionalManager = () => ({
      create: sinon
        .stub()
        .callsFake((entity: typeof Task, dto: Partial<Task>) => {
          const task = new Task();
          Object.assign(task, dto);
          return task;
        }),
      save: sinon.stub().callsFake((entity: typeof Task, task: Task) => {
        if (!task.id) {
          task.id = generateId();
          task.created_at = new Date();
          task.updated_at = new Date();
          tasks.push(task);
        } else {
          const index = tasks.findIndex((t) => t.id === task.id);
          if (index !== -1) {
            task.updated_at = new Date();
            tasks[index] = task;
          } else {
            task.created_at = new Date();
            task.updated_at = new Date();
            tasks.push(task);
          }
        }
        return Promise.resolve(task);
      }),
      findOne: sinon
        .stub()
        .callsFake(
          (entity: typeof Task, options: { where?: { id?: string } }) => {
            if (options.where?.id) {
              const id = options.where.id;
              return Promise.resolve(tasks.find((t) => t.id === id) || null);
            }
            return Promise.resolve(null);
          },
        ),
      remove: sinon.stub().callsFake((entity: typeof Task, task: Task) => {
        const index = tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          tasks.splice(index, 1);
          return Promise.resolve(task);
        }
        return Promise.resolve(null);
      }),
    });

    return {
      create: sinon.stub().callsFake((dto: Partial<Task>) => {
        const task = new Task();
        Object.assign(task, dto);
        return task;
      }),
      save: sinon.stub().callsFake((task: Task) => {
        if (!task.id) {
          task.id = generateId();
          task.created_at = new Date();
          task.updated_at = new Date();
          tasks.push(task);
        } else {
          const index = tasks.findIndex((t) => t.id === task.id);
          if (index !== -1) {
            task.updated_at = new Date();
            tasks[index] = task;
          } else {
            task.created_at = new Date();
            task.updated_at = new Date();
            tasks.push(task);
          }
        }
        return task;
      }),
      findOne: sinon
        .stub()
        .callsFake((options: { where?: { id?: string } }) => {
          if (options.where?.id) {
            const id = options.where.id;
            return tasks.find((t) => t.id === id) || null;
          }
          return null;
        }),
      remove: sinon.stub().callsFake((task: Task) => {
        const index = tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          tasks.splice(index, 1);
          return task;
        }
        return null;
      }),
      createQueryBuilder: sinon.stub().returns(createQueryBuilderInstance()),
      manager: {
        transaction: sinon
          .stub()
          .callsFake(
            async (
              callback: (
                manager: ReturnType<typeof createTransactionalManager>,
              ) => Promise<unknown>,
            ) => {
              const transactionalManager = createTransactionalManager();
              return await callback(transactionalManager);
            },
          ),
      },
      // Expose tasks array for test setup
      _tasks: tasks,
    };
  };

  beforeEach(async () => {
    const mockRepository = createMockRepository();
    inMemoryTasks = mockRepository._tasks;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideProvider(getRepositoryToken(Task))
      .useValue(mockRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    // Apply ValidationPipe BEFORE app.init() to ensure it's registered
    // Configuration matches main.ts exactly to ensure validation works
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();

    // Workaround for NestJS DI issue with node:test - manually inject services after app init
    const appService = moduleFixture.get<AppService>(AppService);
    const createTaskService =
      moduleFixture.get<CreateTaskService>(CreateTaskService);
    const updateTaskService = moduleFixture.get(UpdateTaskService);
    const removeTaskService = moduleFixture.get(RemoveTaskService);
    const getTaskByIdService = moduleFixture.get(GetTaskByIdService);
    const getTasksService = moduleFixture.get(GetTasksService);

    // Get controllers from the app (these are the actual instances used by HTTP server)
    const appController = app.get<AppController>(AppController);
    const createTaskEndpoint = app.get(CreateTaskEndpoint);
    const updateTaskEndpoint = app.get(UpdateTaskEndpoint);
    const removeTaskEndpoint = app.get(RemoveTaskEndpoint);
    const getTaskByIdEndpoint = app.get(GetTaskByIdEndpoint);
    const getTasksEndpoint = app.get(GetTasksEndpoint);

    // Manually inject services into controllers (workaround for NestJS DI issue with node:test)
    const appControllerAny = appController as unknown as Record<
      string,
      unknown
    >;
    if (!appControllerAny.appService) {
      appControllerAny.appService = appService;
    }

    const createTaskEndpointAny = createTaskEndpoint as unknown as Record<
      string,
      unknown
    >;
    if (!createTaskEndpointAny.createTaskService) {
      createTaskEndpointAny.createTaskService = createTaskService;
    }

    const updateTaskEndpointAny = updateTaskEndpoint as unknown as Record<
      string,
      unknown
    >;
    if (!updateTaskEndpointAny.updateTaskService) {
      updateTaskEndpointAny.updateTaskService = updateTaskService;
    }

    const removeTaskEndpointAny = removeTaskEndpoint as unknown as Record<
      string,
      unknown
    >;
    if (!removeTaskEndpointAny.removeTaskService) {
      removeTaskEndpointAny.removeTaskService = removeTaskService;
    }

    const getTaskByIdEndpointAny = getTaskByIdEndpoint as unknown as Record<
      string,
      unknown
    >;
    if (!getTaskByIdEndpointAny.getTaskByIdService) {
      getTaskByIdEndpointAny.getTaskByIdService = getTaskByIdService;
    }

    const getTasksEndpointAny = getTasksEndpoint as unknown as Record<
      string,
      unknown
    >;
    if (!getTasksEndpointAny.getTasksService) {
      getTasksEndpointAny.getTasksService = getTasksService;
    }
  });

  afterEach(async () => {
    inMemoryTasks.length = 0;
    sinon.restore();
    await app.close();
  });

  void describe('Health Check', () => {
    void test('/api (GET) should return health status', async () => {
      await request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          const body = res.body as { status?: string };
          assert.ok(body.status);
          assert.strictEqual(body.status, 'ok');
        });
    });

    void test('/ (GET) should return 404 when prefix is not used', async () => {
      await request(app.getHttpServer()).get('/').expect(404);
    });
  });

  void describe('Tasks API', () => {
    void test('POST /api/v1/tasks should create a task', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'E2E Test Task',
          description: 'E2E Test Description',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          due_date: '2024-12-31T23:59:59Z',
        })
        .expect(201);

      const body = response.body as {
        id?: string;
        title?: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
      };
      assert.ok(body.id);
      assert.strictEqual(body.title, 'E2E Test Task');
      assert.strictEqual(body.description, 'E2E Test Description');
      assert.strictEqual(body.status, TaskStatus.PENDING);
      assert.strictEqual(body.priority, TaskPriority.HIGH);
    });

    void test('POST /api/v1/tasks should create a task with minimal data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Minimal Task',
        })
        .expect(201);

      const body = response.body as {
        id?: string;
        title?: string;
        status?: TaskStatus;
      };
      assert.ok(body.id);
      assert.strictEqual(body.title, 'Minimal Task');
      assert.strictEqual(body.status, TaskStatus.PENDING);
    });

    void test('POST /api/v1/tasks should fail validation with empty title', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: '',
        });
      // Empty string should be rejected by @IsNotEmpty()
      assert.strictEqual(
        response.status,
        400,
        `Expected 400 but got ${response.status}. Response: ${JSON.stringify(response.body)}`,
      );
    });

    void test('POST /api/v1/tasks should fail validation without title', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          description: 'No title',
        })
        .expect(400);
    });

    void test('GET /api/v1/tasks should get list of tasks', async () => {
      // Create a task first
      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Task for List Test',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks')
        .expect(200);

      const body = response.body as {
        data?: unknown[];
        meta?: {
          page?: number;
          limit?: number;
          total?: number;
          totalPages?: number;
        };
      };
      assert.ok(body.data);
      assert.ok(body.meta);
      assert.strictEqual(Array.isArray(body.data), true);
      assert.ok(body.meta.page);
      assert.ok(body.meta.limit);
      assert.ok(body.meta.total);
      assert.ok(body.meta.totalPages);
    });

    void test('GET /api/v1/tasks?page=1&limit=5 should paginate tasks', async () => {
      // Create multiple tasks
      for (let i = 0; i < 10; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: `Task ${i}`,
          });
      }

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks?page=1&limit=5')
        .expect(200);

      const body = response.body as {
        meta?: { page?: number; limit?: number };
        data?: unknown[];
      };
      assert.strictEqual(body.meta?.page, 1);
      assert.strictEqual(body.meta?.limit, 5);
      assert.ok(body.data && body.data.length <= 5);
    });

    void test('GET /api/v1/tasks?status=PENDING should filter by status', async () => {
      // Create tasks with different statuses
      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Pending Task',
        status: TaskStatus.PENDING,
      });

      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Completed Task',
        status: TaskStatus.COMPLETED,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks?status=PENDING')
        .expect(200);

      const body = response.body as { data?: Array<{ status?: TaskStatus }> };
      if (body.data) {
        assert.ok(
          body.data.every((task) => task.status === TaskStatus.PENDING),
        );
      }
    });

    void test('GET /api/v1/tasks/:id should get task by id', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Task for Get Test',
        });
      const createBody = createResponse.body as { id?: string };
      const taskId = createBody.id as string;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .expect(200);

      const body = response.body as {
        id?: string;
        title?: string;
        status?: TaskStatus;
      };
      assert.strictEqual(body.id, taskId);
      assert.ok(body.title);
      assert.ok(body.status);
    });

    void test('GET /api/v1/tasks/:id should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    void test('PUT /api/v1/tasks/:id should update a task', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Task for Update Test',
        });
      const createBody = createResponse.body as { id?: string };
      const taskId = createBody.id as string;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/tasks/${taskId}`)
        .send({
          title: 'Updated Task Title',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
        })
        .expect(200);

      const body = response.body as {
        id?: string;
        title?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
      };
      assert.strictEqual(body.id, taskId);
      assert.strictEqual(body.title, 'Updated Task Title');
      assert.strictEqual(body.status, TaskStatus.IN_PROGRESS);
      assert.strictEqual(body.priority, TaskPriority.MEDIUM);
    });

    void test('PUT /api/v1/tasks/:id should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .send({
          title: 'Updated Task',
          status: TaskStatus.PENDING,
        })
        .expect(404);
    });

    void test('DELETE /api/v1/tasks/:id should delete a task', async () => {
      // Create a task for deletion
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Task to Delete',
        });
      const createBody = createResponse.body as { id?: string };
      const taskIdToDelete = createBody.id as string;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskIdToDelete}`)
        .expect(200);

      const body = response.body as { message?: string; id?: string };
      assert.strictEqual(body.message, 'Task deleted successfully');
      assert.strictEqual(body.id, taskIdToDelete);
    });

    void test('DELETE /api/v1/tasks/:id should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    void test('GET /api/v1/tasks?search=test should search tasks', async () => {
      // Create tasks with searchable content
      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Test Task',
        description: 'This is a test description',
      });

      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Another Task',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks?search=test')
        .expect(200);

      const body = response.body as {
        data?: Array<{ title?: string; description?: string }>;
      };
      assert.ok(body.data && body.data.length > 0);
      if (body.data) {
        assert.ok(
          body.data.some(
            (task) =>
              task.title?.toLowerCase().includes('test') ||
              task.description?.toLowerCase().includes('test'),
          ),
        );
      }
    });

    void test('GET /api/v1/tasks?priority=HIGH should filter by priority', async () => {
      // Create tasks with different priorities
      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'High Priority Task',
        priority: TaskPriority.HIGH,
      });

      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Low Priority Task',
        priority: TaskPriority.LOW,
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks?priority=HIGH')
        .expect(200);

      const body = response.body as {
        data?: Array<{ priority?: TaskPriority }>;
      };
      if (body.data) {
        assert.ok(
          body.data.every((task) => task.priority === TaskPriority.HIGH),
        );
      }
    });

    // ========== Comprehensive Validation Tests ==========

    void describe('POST /api/v1/tasks - Validation Tests', () => {
      void test('should fail with title exceeding max length (255 chars)', async () => {
        const longTitle = 'a'.repeat(256);
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: longTitle })
          .expect(400);
      });

      void test('should pass with title at max length (255 chars)', async () => {
        const maxTitle = 'a'.repeat(255);
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: maxTitle })
          .expect(201);
        const body = response.body as { title?: string };
        assert.strictEqual(body.title, maxTitle);
      });

      void test('should fail with invalid status enum value', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            status: 'INVALID_STATUS',
          })
          .expect(400);
      });

      void test('should fail with invalid priority enum value', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            priority: 'INVALID_PRIORITY',
          })
          .expect(400);
      });

      void test('should fail with invalid date format', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            due_date: 'invalid-date',
          })
          .expect(400);
      });

      void test('should pass with valid ISO date string', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            due_date: '2024-12-31T23:59:59Z',
          })
          .expect(201);
        const body = response.body as { due_date?: string | null };
        assert.ok(body.due_date);
      });

      void test('should accept all valid status values', async () => {
        const statuses = [
          TaskStatus.PENDING,
          TaskStatus.IN_PROGRESS,
          TaskStatus.COMPLETED,
          TaskStatus.CANCELLED,
        ];

        for (const status of statuses) {
          const response = await request(app.getHttpServer())
            .post('/api/v1/tasks')
            .send({
              title: `Task with ${status} status`,
              status,
            })
            .expect(201);
          const body = response.body as { status?: TaskStatus };
          assert.strictEqual(body.status, status);
        }
      });

      void test('should accept all valid priority values', async () => {
        const priorities = [
          TaskPriority.LOW,
          TaskPriority.MEDIUM,
          TaskPriority.HIGH,
        ];

        for (const priority of priorities) {
          const response = await request(app.getHttpServer())
            .post('/api/v1/tasks')
            .send({
              title: `Task with ${priority} priority`,
              priority,
            })
            .expect(201);
          const body = response.body as { priority?: TaskPriority };
          assert.strictEqual(body.priority, priority);
        }
      });

      void test('should handle null description', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Task with null description',
            description: null,
          })
          .expect(201);
        const body = response.body as { description?: string | null };
        assert.strictEqual(body.description, null);
      });

      void test('should handle empty string description as null', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Task with empty description',
            description: '',
          })
          .expect(201);
        const body = response.body as { description?: string | null };
        assert.strictEqual(body.description, null);
      });

      void test('should fail with non-string title', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 12345,
          })
          .expect(400);
      });

      void test('should fail with non-string description', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            description: 12345,
          })
          .expect(400);
      });
    });

    // ========== PUT /api/v1/tasks/:id - Comprehensive Tests ==========

    void describe('PUT /api/v1/tasks/:id - Comprehensive Tests', () => {
      void test('should fail validation with empty title', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: 'Test Task' });
        const taskId = (createResponse.body as { id?: string }).id;

        await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: '',
            status: TaskStatus.PENDING,
          })
          .expect(400);
      });

      void test('should fail validation without title', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: 'Test Task' });
        const taskId = (createResponse.body as { id?: string }).id;

        await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            status: TaskStatus.PENDING,
          })
          .expect(400);
      });

      void test('should fail validation without status', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: 'Test Task' });
        const taskId = (createResponse.body as { id?: string }).id;

        await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Updated Title',
          })
          .expect(400);
      });

      void test('should fail with invalid status enum value', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: 'Test Task' });
        const createBody = createResponse;
        const taskId = (createBody.body as { id?: string }).id;

        await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Updated Title',
            status: 'INVALID_STATUS',
          })
          .expect(400);
      });

      void test('should update all fields successfully', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Original Task',
            description: 'Original Description',
            status: TaskStatus.PENDING,
            priority: TaskPriority.LOW,
          });
        const taskId = (createResponse.body as { id?: string }).id;

        const response = await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Updated Task',
            description: 'Updated Description',
            status: TaskStatus.COMPLETED,
            priority: TaskPriority.HIGH,
            due_date: '2024-12-31T23:59:59Z',
          })
          .expect(200);

        const body = response.body as {
          id?: string;
          title?: string;
          description?: string;
          status?: TaskStatus;
          priority?: TaskPriority;
        };
        assert.strictEqual(body.title, 'Updated Task');
        assert.strictEqual(body.description, 'Updated Description');
        assert.strictEqual(body.status, TaskStatus.COMPLETED);
        assert.strictEqual(body.priority, TaskPriority.HIGH);
      });

      void test('should handle null description update', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            description: 'Original Description',
          });
        const taskId = (createResponse.body as { id?: string }).id;

        const response = await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Updated Task',
            status: TaskStatus.PENDING,
            description: null,
          })
          .expect(200);
        const body = response.body as { description?: string | null };
        assert.strictEqual(body.description, null);
      });

      void test('should handle empty string description as null', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Test Task',
            description: 'Original Description',
          });
        const taskId = (createResponse.body as { id?: string }).id;

        const response = await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Updated Task',
            status: TaskStatus.PENDING,
            description: '',
          })
          .expect(200);
        const body = response.body as { description?: string | null };
        assert.strictEqual(body.description, null);
      });

      void test('should preserve created_at when updating', async () => {
        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({ title: 'Test Task' });
        const createBody = createResponse.body as {
          id?: string;
          created_at?: string;
        };
        const taskId = createBody.id as string;
        const originalCreatedAt = createBody.created_at;

        const updateResponse = await request(app.getHttpServer())
          .put(`/api/v1/tasks/${taskId}`)
          .send({
            title: 'Updated Task',
            status: TaskStatus.PENDING,
          })
          .expect(200);
        const updateBody = updateResponse.body as { created_at?: string };
        assert.strictEqual(updateBody.created_at, originalCreatedAt);
      });
    });

    // ========== GET /api/v1/tasks - Comprehensive Query Tests ==========

    void describe('GET /api/v1/tasks - Comprehensive Query Tests', () => {
      beforeEach(async () => {
        // Create test data
        await request(app.getHttpServer()).post('/api/v1/tasks').send({
          title: 'Test Task 1',
          description: 'Test description',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
        });
        await request(app.getHttpServer()).post('/api/v1/tasks').send({
          title: 'Another Task',
          description: 'Another description',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
        });
        await request(app.getHttpServer()).post('/api/v1/tasks').send({
          title: 'Completed Task',
          status: TaskStatus.COMPLETED,
          priority: TaskPriority.LOW,
        });
      });

      void test('should reject page 0 (validation should fail)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/tasks?page=0&limit=10')
          .expect(400);
      });

      void test('should reject negative page (validation should fail)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/tasks?page=-1&limit=10')
          .expect(400);
      });

      void test('should reject limit exceeding max (validation should fail)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/tasks?page=1&limit=200')
          .expect(400);
      });

      void test('should reject limit 0 (validation should fail)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/tasks?page=1&limit=0')
          .expect(400);
      });

      void test('should reject negative limit (validation should fail)', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/tasks?page=1&limit=-5')
          .expect(400);
      });

      void test('should combine status and priority filters', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?status=PENDING&priority=HIGH')
          .expect(200);

        const body = response.body as {
          data?: Array<{ status?: TaskStatus; priority?: TaskPriority }>;
        };
        if (body.data) {
          assert.ok(
            body.data.every(
              (task) =>
                task.status === TaskStatus.PENDING &&
                task.priority === TaskPriority.HIGH,
            ),
          );
        }
      });

      void test('should combine status, priority, and search filters', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?status=PENDING&priority=HIGH&search=Test')
          .expect(200);

        const body = response.body as {
          data?: Array<{
            status?: TaskStatus;
            priority?: TaskPriority;
            title?: string;
            description?: string;
          }>;
        };
        if (body.data) {
          assert.ok(
            body.data.every(
              (task) =>
                task.status === TaskStatus.PENDING &&
                task.priority === TaskPriority.HIGH &&
                (task.title?.toLowerCase().includes('test') ||
                  task.description?.toLowerCase().includes('test')),
            ),
          );
        }
      });

      void test('should handle empty search string', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?search=')
          .expect(200);
        const body = response.body as { data?: unknown[] };
        assert.ok(body.data);
      });

      void test('should search case-insensitively', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?search=TEST')
          .expect(200);

        const body = response.body as {
          data?: Array<{ title?: string; description?: string }>;
        };
        if (body.data) {
          assert.ok(
            body.data.some(
              (task) =>
                task.title?.toLowerCase().includes('test') ||
                task.description?.toLowerCase().includes('test'),
            ),
          );
        }
      });

      void test('should return empty array when search has no matches', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?search=nonexistentterm12345')
          .expect(200);
        const body = response.body as { data?: unknown[] };
        assert.deepStrictEqual(body.data, []);
      });

      void test('should handle pagination with last page', async () => {
        // Create 15 tasks
        for (let i = 0; i < 15; i++) {
          await request(app.getHttpServer())
            .post('/api/v1/tasks')
            .send({
              title: `Task ${i}`,
            });
        }

        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?page=2&limit=10')
          .expect(200);
        const body = response.body as {
          meta?: { page?: number; totalPages?: number };
          data?: unknown[];
        };
        assert.strictEqual(body.meta?.page, 2);
        assert.ok(
          body.meta && body.meta.totalPages && body.meta.totalPages >= 2,
        );
        assert.ok(body.data && body.data.length > 0);
      });

      void test('should return empty array for page beyond total pages', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/tasks?page=999&limit=10')
          .expect(200);
        const body = response.body as {
          data?: unknown[];
          meta?: { page?: number };
        };
        assert.deepStrictEqual(body.data, []);
        assert.strictEqual(body.meta?.page, 999);
      });
    });

    // ========== Error Handling Tests ==========

    void describe('Error Handling Tests', () => {
      void test('GET /api/v1/tasks/:id should return 400 or 404 for invalid UUID format', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/tasks/invalid-uuid')
          .expect((res) => {
            assert.ok([400, 404].includes(res.status));
          });
      });

      void test('PUT /api/v1/tasks/:id should return 400 or 404 for invalid UUID format', async () => {
        await request(app.getHttpServer())
          .put('/api/v1/tasks/invalid-uuid')
          .send({
            title: 'Test',
            status: TaskStatus.PENDING,
          })
          .expect((res) => {
            assert.ok([400, 404].includes(res.status));
          });
      });

      void test('DELETE /api/v1/tasks/:id should return 400 or 404 for invalid UUID format', async () => {
        await request(app.getHttpServer())
          .delete('/api/v1/tasks/invalid-uuid')
          .expect((res) => {
            assert.ok([400, 404].includes(res.status));
          });
      });

      void test('should handle malformed JSON in request body', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .set('Content-Type', 'application/json')
          .send('{"title": "Test", invalid json}')
          .expect(400);
      });

      void test('should handle missing Content-Type header gracefully', async () => {
        // Supertest automatically sets Content-Type, so this test verifies
        // that the endpoint handles requests properly
        await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .set('Content-Type', '')
          .send({ title: 'Test' })
          .expect((res) => {
            // Should either accept (201) or reject (400) based on validation
            assert.ok([201, 400].includes(res.status));
          });
      });
    });

    // ========== Edge Cases ==========

    void describe('Edge Cases', () => {
      void test('should handle task with all optional fields null', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Minimal Task',
            description: null,
            priority: null,
            due_date: null,
          })
          .expect(201);

        const body = response.body as {
          title?: string;
          description?: string | null;
          priority?: TaskPriority | null;
          due_date?: string | null;
        };
        assert.strictEqual(body.title, 'Minimal Task');
        assert.strictEqual(body.description, null);
        assert.strictEqual(body.priority, null);
        assert.strictEqual(body.due_date, null);
      });

      void test('should handle task with very long description', async () => {
        const longDescription = 'a'.repeat(10000);
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Task with long description',
            description: longDescription,
          })
          .expect(201);
        const body = response.body as { description?: string };
        assert.strictEqual(body.description, longDescription);
      });

      void test('should handle special characters in title and description', async () => {
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: `Task ${specialChars}`,
            description: `Description ${specialChars}`,
          })
          .expect(201);
        const body = response.body as {
          title?: string;
          description?: string;
        };
        assert.ok(body.title?.includes(specialChars));
        assert.ok(body.description?.includes(specialChars));
      });

      void test('should handle unicode characters', async () => {
        const unicodeText = '测试任务 🎯 émoji';
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: unicodeText,
            description: unicodeText,
          })
          .expect(201);
        const body = response.body as {
          title?: string;
          description?: string;
        };
        assert.strictEqual(body.title, unicodeText);
        assert.strictEqual(body.description, unicodeText);
      });

      void test('should handle future due dates', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Future Task',
            due_date: futureDate.toISOString(),
          })
          .expect(201);
        const body = response.body as { due_date?: string | null };
        assert.ok(body.due_date);
      });

      void test('should handle past due dates', async () => {
        const pastDate = new Date();
        pastDate.setFullYear(pastDate.getFullYear() - 1);
        const response = await request(app.getHttpServer())
          .post('/api/v1/tasks')
          .send({
            title: 'Past Task',
            due_date: pastDate.toISOString(),
          })
          .expect(201);
        const body = response.body as { due_date?: string | null };
        assert.ok(body.due_date);
      });
    });
  });
});
