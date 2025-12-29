import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SelectQueryBuilder } from 'typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { TasksModule } from '../src/modules/tasks/tasks.module';
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

describe('AppController (e2e)', () => {
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
        where: jest
          .fn()
          .mockImplementation(
            (condition: string, params?: Record<string, unknown>) => {
              whereConditions.length = 0; // Clear previous conditions
              whereConditions.push({ condition, params: params || {} });
              return mockQueryBuilder;
            },
          ),
        andWhere: jest
          .fn()
          .mockImplementation(
            (condition: string, params?: Record<string, unknown>) => {
              whereConditions.push({ condition, params: params || {} });
              return mockQueryBuilder;
            },
          ),
        skip: jest.fn().mockImplementation((value: number) => {
          skipValue = value;
          return mockQueryBuilder;
        }),
        take: jest.fn().mockImplementation((value: number) => {
          takeValue = value;
          return mockQueryBuilder;
        }),
        orderBy: jest
          .fn()
          .mockImplementation(
            (field: string, direction: 'ASC' | 'DESC' = 'DESC') => {
              orderByField = field.replace('task.', '');
              orderByDirection = direction;
              return mockQueryBuilder;
            },
          ),
        getManyAndCount: jest.fn().mockImplementation(async () => {
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
              const searchTerm = String(params.search)
                .replace(/%/g, '')
                .toLowerCase();
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

          return [paginatedTasks, filteredTasks.length];
        }),
      };

      return mockQueryBuilder;
    };

    return {
      create: jest.fn().mockImplementation((dto: Partial<Task>) => {
        const task = new Task();
        Object.assign(task, dto);
        return task;
      }),
      save: jest.fn().mockImplementation(async (task: Task) => {
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
      findOne: jest
        .fn()
        .mockImplementation(async (options: { where?: { id?: string } }) => {
          if (options.where?.id) {
            const id = options.where.id;
            return tasks.find((t) => t.id === id) || null;
          }
          return null;
        }),
      remove: jest.fn().mockImplementation(async (task: Task) => {
        const index = tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          tasks.splice(index, 1);
          return task;
        }
        return null;
      }),
      createQueryBuilder: jest
        .fn()
        .mockReturnValue(createQueryBuilderInstance()),
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    inMemoryTasks.length = 0;
    jest.clearAllMocks();
    await app.close();
  });

  describe('Health Check', () => {
    it('/api (GET) should return health status', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toBe('ok');
        });
    });

    it('/ (GET) should return 404 when prefix is not used', () => {
      return request(app.getHttpServer()).get('/').expect(404);
    });
  });

  describe('Tasks API', () => {
    it('POST /api/v1/tasks should create a task', async () => {
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

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('E2E Test Task');
      expect(response.body.description).toBe('E2E Test Description');
      expect(response.body.status).toBe(TaskStatus.PENDING);
      expect(response.body.priority).toBe(TaskPriority.HIGH);
    });

    it('POST /api/v1/tasks should create a task with minimal data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Minimal Task',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Minimal Task');
      expect(response.body.status).toBe(TaskStatus.PENDING);
    });

    it('POST /api/v1/tasks should fail validation with empty title', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: '',
        })
        .expect(400);
    });

    it('POST /api/v1/tasks should fail validation without title', () => {
      return request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          description: 'No title',
        })
        .expect(400);
    });

    it('GET /api/v1/tasks should get list of tasks', async () => {
      // Create a task first
      await request(app.getHttpServer()).post('/api/v1/tasks').send({
        title: 'Task for List Test',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/tasks')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('page');
      expect(response.body.meta).toHaveProperty('limit');
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('totalPages');
    });

    it('GET /api/v1/tasks?page=1&limit=5 should paginate tasks', async () => {
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

      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('GET /api/v1/tasks?status=PENDING should filter by status', async () => {
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

      expect(
        response.body.data.every(
          (task: { status: TaskStatus }) => task.status === TaskStatus.PENDING,
        ),
      ).toBe(true);
    });

    it('GET /api/v1/tasks/:id should get task by id', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Task for Get Test',
        });
      const taskId = createResponse.body.id as string;

      const response = await request(app.getHttpServer())
        .get(`/api/v1/tasks/${taskId}`)
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('status');
    });

    it('GET /api/v1/tasks/:id should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('PUT /api/v1/tasks/:id should update a task', async () => {
      // Create a task first
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Task for Update Test',
        });
      const taskId = createResponse.body.id as string;

      const response = await request(app.getHttpServer())
        .put(`/api/v1/tasks/${taskId}`)
        .send({
          title: 'Updated Task Title',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.MEDIUM,
        })
        .expect(200);

      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Updated Task Title');
      expect(response.body.status).toBe(TaskStatus.IN_PROGRESS);
      expect(response.body.priority).toBe(TaskPriority.MEDIUM);
    });

    it('PUT /api/v1/tasks/:id should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .put('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .send({
          title: 'Updated Task',
          status: TaskStatus.PENDING,
        })
        .expect(404);
    });

    it('DELETE /api/v1/tasks/:id should delete a task', async () => {
      // Create a task for deletion
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/tasks')
        .send({
          title: 'Task to Delete',
        });
      const taskIdToDelete = createResponse.body.id as string;

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/tasks/${taskIdToDelete}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');
      expect(response.body.id).toBe(taskIdToDelete);
    });

    it('DELETE /api/v1/tasks/:id should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/tasks/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });

    it('GET /api/v1/tasks?search=test should search tasks', async () => {
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

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(
        response.body.data.some(
          (task: { title: string; description?: string }) =>
            task.title.toLowerCase().includes('test') ||
            task.description?.toLowerCase().includes('test'),
        ),
      ).toBe(true);
    });

    it('GET /api/v1/tasks?priority=HIGH should filter by priority', async () => {
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

      expect(
        response.body.data.every(
          (task: { priority: TaskPriority }) =>
            task.priority === TaskPriority.HIGH,
        ),
      ).toBe(true);
    });
  });
});
