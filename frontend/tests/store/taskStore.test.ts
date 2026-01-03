import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from '@/store/taskStore';
import { taskApi } from '@/lib/api';
import { TaskStatus, TaskPriority, type Task, type GetTasksQuery } from '@/lib/api';
import { AxiosError } from 'axios';
import axios from 'axios';

// Mock the API
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api')>();
  return {
    ...actual,
    taskApi: {
      getTasks: vi.fn(),
      getTaskById: vi.fn(),
      createTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
    },
  };
});

const mockTaskApi = vi.mocked(taskApi);

describe('useTaskStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useTaskStore.setState({
      tasks: [],
      selectedTask: null,
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      filters: {},
    });
    vi.clearAllMocks();
    // Reset axios.isCancel to return false by default
    if (vi.isMockFunction(axios.isCancel)) {
      vi.spyOn(axios, 'isCancel').mockReturnValue(false);
    }
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useTaskStore.getState();
      expect(state.tasks).toEqual([]);
      expect(state.selectedTask).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      expect(state.filters).toEqual({});
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      useTaskStore.getState().setLoading(true);
      expect(useTaskStore.getState().loading).toBe(true);
    });

    it('should set loading state to false', () => {
      useTaskStore.getState().setLoading(false);
      expect(useTaskStore.getState().loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const errorMessage = 'Test error';
      useTaskStore.getState().setError(errorMessage);
      expect(useTaskStore.getState().error).toBe(errorMessage);
    });

    it('should clear error when set to null', () => {
      useTaskStore.getState().setError('Error');
      useTaskStore.getState().setError(null);
      expect(useTaskStore.getState().error).toBeNull();
    });
  });

  describe('setTasks', () => {
    it('should set tasks array', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          due_date: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      useTaskStore.getState().setTasks(tasks);
      expect(useTaskStore.getState().tasks).toEqual(tasks);
    });

    it('should replace existing tasks', () => {
      const initialTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: null,
          status: TaskStatus.PENDING,
          priority: null,
          due_date: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];
      useTaskStore.getState().setTasks(initialTasks);

      const newTasks: Task[] = [
        {
          id: '2',
          title: 'Task 2',
          description: null,
          status: TaskStatus.COMPLETED,
          priority: null,
          due_date: null,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];
      useTaskStore.getState().setTasks(newTasks);
      expect(useTaskStore.getState().tasks).toEqual(newTasks);
      expect(useTaskStore.getState().tasks).not.toEqual(initialTasks);
    });
  });

  describe('setSelectedTask', () => {
    it('should set selected task', () => {
      const task: Task = {
        id: '1',
        title: 'Task 1',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      useTaskStore.getState().setSelectedTask(task);
      expect(useTaskStore.getState().selectedTask).toEqual(task);
    });

    it('should clear selected task when set to null', () => {
      const task: Task = {
        id: '1',
        title: 'Task 1',
        description: null,
        status: TaskStatus.PENDING,
        priority: null,
        due_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      useTaskStore.getState().setSelectedTask(task);
      useTaskStore.getState().setSelectedTask(null);
      expect(useTaskStore.getState().selectedTask).toBeNull();
    });
  });

  describe('setPagination', () => {
    it('should set pagination data', () => {
      const pagination = {
        page: 2,
        limit: 20,
        total: 50,
        totalPages: 3,
      };
      useTaskStore.getState().setPagination(pagination);
      expect(useTaskStore.getState().pagination).toEqual(pagination);
    });
  });

  describe('setFilters', () => {
    it('should set filters', () => {
      const filters = {
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        search: 'test',
      };
      useTaskStore.getState().setFilters(filters);
      expect(useTaskStore.getState().filters).toEqual(filters);
    });

    it('should merge filters with existing ones', () => {
      useTaskStore.getState().setFilters({ status: TaskStatus.PENDING });
      useTaskStore.getState().setFilters({ priority: TaskPriority.HIGH });
      expect(useTaskStore.getState().filters).toEqual({
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
      });
    });

    it('should update existing filter', () => {
      useTaskStore.getState().setFilters({ status: TaskStatus.PENDING });
      useTaskStore.getState().setFilters({ status: TaskStatus.COMPLETED });
      expect(useTaskStore.getState().filters.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            title: 'Task 1',
            description: null,
            status: TaskStatus.PENDING,
            priority: null,
            due_date: null,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockTaskApi.getTasks.mockResolvedValue(mockResponse);

      await useTaskStore.getState().fetchTasks();

      expect(useTaskStore.getState().tasks).toEqual(mockResponse.data);
      expect(useTaskStore.getState().pagination).toEqual(mockResponse.meta);
      expect(useTaskStore.getState().loading).toBe(false);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should use filters when fetching tasks', async () => {
      const filters = {
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        search: 'test',
      };
      useTaskStore.getState().setFilters(filters);

      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockTaskApi.getTasks.mockResolvedValue(mockResponse);

      await useTaskStore.getState().fetchTasks();

      expect(mockTaskApi.getTasks).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        search: 'test',
      });
    });

    it('should use query parameters over filters', async () => {
      useTaskStore.getState().setFilters({ status: TaskStatus.PENDING });
      const query: GetTasksQuery = {
        page: 2,
        limit: 20,
        status: TaskStatus.COMPLETED,
      };

      const mockResponse = {
        data: [],
        meta: {
          page: 2,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      mockTaskApi.getTasks.mockResolvedValue(mockResponse);

      await useTaskStore.getState().fetchTasks(query);

      expect(mockTaskApi.getTasks).toHaveBeenCalledWith({
        page: 2,
        limit: 20,
        status: TaskStatus.COMPLETED,
        priority: undefined,
        search: undefined,
      });
    });

    it('should handle AxiosError with response data', async () => {
      const error = new AxiosError('Error message');
      error.response = {
        data: { message: 'Custom error message' },
      } as any;
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      expect(useTaskStore.getState().error).toBe('Custom error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no data.message, using error.message - covers branch line 101-102', async () => {
      // This covers the branch where error.response.data?.message is falsy but error.message is truthy
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: {},
        status: 500,
      } as any;
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // Should use error.message (second part of || chain)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but data is undefined, using error.message - covers branch line 101-102', async () => {
      // This covers the branch where error.response.data is undefined (optional chaining short-circuits)
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: undefined,
        status: 500,
      } as any;
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // Should use error.message (second part of || chain, data?.message short-circuits)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but data is null, using error.message - covers branch line 101-102', async () => {
      // This covers the branch where error.response.data is null (optional chaining short-circuits)
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: null,
        status: 500,
      } as any;
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // Should use error.message (second part of || chain, data?.message short-circuits on null)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError without response data', async () => {
      const error = new AxiosError('Error message');
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      expect(useTaskStore.getState().error).toBe('Error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle non-AxiosError', async () => {
      const error = new Error('Generic error');
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      expect(useTaskStore.getState().error).toBe('Failed to fetch tasks');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no message and no error.message in fetchTasks', async () => {
      const error = new AxiosError('');
      error.response = {
        data: {},
      } as any;
      error.message = '';
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // This covers branch 85: error.response?.data?.message || error.message || 'Failed to fetch tasks'
      // When both are falsy, it falls back to the default message
      expect(useTaskStore.getState().error).toBe('Failed to fetch tasks');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response in fetchTasks', async () => {
      const error = new AxiosError('Network error');
      error.request = {} as any;
      error.response = undefined;
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // This covers the error.request branch (line 106)
      // When error.message exists, it uses that (first part of || on line 106)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response and no error.message in fetchTasks - covers branch line 106', async () => {
      // This covers the || branch when error.message is falsy
      const error = new AxiosError('');
      error.request = {} as any;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // Should use fallback 'Network error' (second part of || on line 106)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request in fetchTasks - covers line 108', async () => {
      const error = new AxiosError('Setup error');
      error.request = undefined;
      error.response = undefined;
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // This covers the else branch (line 108) - error setting up request
      expect(useTaskStore.getState().error).toBe('Setup error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request and no error.message in fetchTasks - covers branch line 109', async () => {
      // This covers the || branch when error.message is falsy
      const error = new AxiosError('');
      error.request = undefined;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.getTasks.mockRejectedValue(error);

      await useTaskStore.getState().fetchTasks();

      // Should use fallback 'An unexpected error occurred' (second part of || on line 109)
      expect(useTaskStore.getState().error).toBe('An unexpected error occurred');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should set loading to true at start', async () => {
      const mockResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      mockTaskApi.getTasks.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100);
          })
      );

      const promise = useTaskStore.getState().fetchTasks();
      expect(useTaskStore.getState().loading).toBe(true);
      await promise;
    });

    it('should handle cancelled query parameter', async () => {
      // Create a mock cancelled token
      const cancelledQuery = { __cancelled: true };
      vi.spyOn(axios, 'isCancel').mockReturnValue(true);
      
      await useTaskStore.getState().fetchTasks(cancelledQuery as any);
      
      // Should return early without setting loading
      expect(useTaskStore.getState().loading).toBe(false);
      vi.restoreAllMocks();
    });

    it('should handle cancelled request error', async () => {
      class CancelError extends Error {
        constructor(message?: string) {
          super(message);
          this.name = 'Cancel';
        }
      }
      const cancelError = new CancelError('Request cancelled');
      const isCancelSpy = vi.spyOn(axios, 'isCancel').mockImplementation((err) => {
        return err === cancelError || err instanceof CancelError;
      });
      mockTaskApi.getTasks.mockRejectedValue(cancelError);
      
      await useTaskStore.getState().fetchTasks();
      
      // Should return early without setting error (covers line 90)
      expect(useTaskStore.getState().error).toBeNull();
      expect(useTaskStore.getState().loading).toBe(false);
      expect(isCancelSpy).toHaveBeenCalledWith(cancelError);
      isCancelSpy.mockRestore();
    });
  });

  describe('fetchTaskById', () => {
    it('should fetch task by id successfully', async () => {
      const taskId = '123';
      const mockTask: Task = {
        id: taskId,
        title: 'Task 1',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockTaskApi.getTaskById.mockResolvedValue(mockTask);

      await useTaskStore.getState().fetchTaskById(taskId);

      expect(useTaskStore.getState().selectedTask).toEqual(mockTask);
      expect(useTaskStore.getState().loading).toBe(false);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should handle AxiosError with response data', async () => {
      const taskId = '123';
      const error = new AxiosError('Error message');
      error.response = {
        data: { message: 'Task not found' },
      } as any;
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      expect(useTaskStore.getState().error).toBe('Task not found');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with 404 status in fetchTaskById', async () => {
      const taskId = '123';
      const error = new AxiosError('Not found');
      error.response = {
        status: 404,
        data: {},
      } as any;
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      // This covers the error.response.status === 404 branch (line 141)
      expect(useTaskStore.getState().error).toBe('Task not found');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response in fetchTaskById', async () => {
      const taskId = '123';
      const error = new AxiosError('Network error');
      error.request = {} as any;
      error.response = undefined;
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      // This covers the error.request branch (line 150)
      // When error.message exists, it uses that (first part of || on line 150)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response and no error.message in fetchTaskById - covers branch line 150', async () => {
      // This covers the || branch when error.message is falsy
      const taskId = '123';
      const error = new AxiosError('');
      error.request = {} as any;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      // Should use fallback 'Network error: Unable to reach the server' (second part of || on line 150)
      expect(useTaskStore.getState().error).toBe('Network error: Unable to reach the server');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request and no error.message in fetchTaskById - covers branch line 152', async () => {
      // This covers the || branch when error.message is falsy
      const taskId = '123';
      const error = new AxiosError('');
      error.request = undefined;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      // Should use fallback 'An unexpected error occurred' (second part of || on line 152)
      expect(useTaskStore.getState().error).toBe('An unexpected error occurred');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError without response data', async () => {
      const taskId = '123';
      const error = new AxiosError('Error message');
      error.response = undefined;
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      expect(useTaskStore.getState().error).toBe('Error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no message', async () => {
      const taskId = '123';
      const error = new AxiosError('Error message');
      error.response = {
        data: {},
      } as any;
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      // This covers branch 108: error.response?.data?.message || error.message
      // When message is missing, it falls back to error.message
      expect(useTaskStore.getState().error).toBe('Error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no message and no error.message', async () => {
      const taskId = '123';
      const error = new AxiosError('');
      error.response = {
        data: {},
      } as any;
      error.message = '';
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      // This covers branch 108: error.response?.data?.message || error.message || 'Failed to fetch task'
      // When both are falsy, it falls back to the default message
      expect(useTaskStore.getState().error).toBe('Failed to fetch task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle non-AxiosError', async () => {
      const taskId = '123';
      const error = new Error('Generic error');
      mockTaskApi.getTaskById.mockRejectedValue(error);

      await useTaskStore.getState().fetchTaskById(taskId);

      expect(useTaskStore.getState().error).toBe('Failed to fetch task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle cancelled request error', async () => {
      const taskId = '123';
      class CancelError extends Error {
        constructor(message?: string) {
          super(message);
          this.name = 'Cancel';
        }
      }
      const cancelError = new CancelError('Request cancelled');
      vi.spyOn(axios, 'isCancel').mockReturnValue(true);
      mockTaskApi.getTaskById.mockRejectedValue(cancelError);
      
      await useTaskStore.getState().fetchTaskById(taskId);
      
      // Should return early without setting error
      expect(useTaskStore.getState().error).toBeNull();
      expect(useTaskStore.getState().loading).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      const createData = {
        title: 'New Task',
        description: 'Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
      };

      const mockTask: Task = {
        id: '123',
        ...createData,
        description: createData.description || null,
        priority: createData.priority || null,
        due_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockTaskApi.createTask.mockResolvedValue(mockTask);

      const result = await useTaskStore.getState().createTask(createData);

      expect(result).toEqual(mockTask);
      expect(useTaskStore.getState().loading).toBe(false);
      expect(useTaskStore.getState().error).toBeNull();
    });

    it('should handle AxiosError with response data', async () => {
      const createData = {
        title: 'New Task',
      };

      const error = new AxiosError('Error message');
      error.response = {
        data: { message: 'Validation failed' },
      } as any;
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Validation failed');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with 400 status in createTask', async () => {
      const createData = {
        title: 'New Task',
      };
      const error = new AxiosError('Bad request');
      error.response = {
        status: 400,
        data: {},
      } as any;
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      // This covers the error.response.status === 400 branch (line 184)
      expect(useTaskStore.getState().error).toBe('Invalid task data. Please check your input.');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError without response data', async () => {
      const createData = {
        title: 'New Task',
      };

      const error = new AxiosError('Error message');
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle non-AxiosError', async () => {
      const createData = {
        title: 'New Task',
      };

      const error = new Error('Generic error');
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Failed to create task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no message field in createTask', async () => {
      const createData = {
        title: 'New Task',
      };
      const error = new AxiosError('Network error');
      error.response = {
        data: { error: 'Different format' },
      } as any;
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      // This covers branch 132: error.response?.data?.message || error.message
      // When message is missing, it falls back to error.message
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with no message and no error.message in createTask', async () => {
      const createData = {
        title: 'New Task',
      };
      const error = new AxiosError('');
      error.response = {
        data: {},
      } as any;
      error.message = '';
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      // This covers branch 132: error.response?.data?.message || error.message || 'Failed to create task'
      expect(useTaskStore.getState().error).toBe('Failed to create task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response in createTask', async () => {
      const createData = {
        title: 'New Task',
      };
      const error = new AxiosError('Network error');
      error.request = {} as any;
      error.response = undefined;
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      // This covers the error.request branch (line 195)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response and no error.message in createTask - covers branch line 195', async () => {
      // This covers the || branch when error.message is falsy
      const createData = {
        title: 'New Task',
      };
      const error = new AxiosError('');
      error.request = {} as any;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      // Should use fallback 'Network error' (second part of || on line 195)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request and no error.message in createTask - covers branch line 197', async () => {
      // This covers the || branch when error.message is falsy
      const createData = {
        title: 'New Task',
      };
      const error = new AxiosError('');
      error.request = undefined;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.createTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();

      // Should use fallback 'An unexpected error occurred' (second part of || on line 197)
      expect(useTaskStore.getState().error).toBe('An unexpected error occurred');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle cancelled request error', async () => {
      const createData = {
        title: 'New Task',
      };
      class CancelError extends Error {
        constructor(message?: string) {
          super(message);
          this.name = 'Cancel';
        }
      }
      const cancelError = new CancelError('Request cancelled');
      vi.spyOn(axios, 'isCancel').mockReturnValue(true);
      mockTaskApi.createTask.mockRejectedValue(cancelError);
      
      await expect(useTaskStore.getState().createTask(createData)).rejects.toThrow();
      
      expect(useTaskStore.getState().loading).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
      };

      const mockTask: Task = {
        id: taskId,
        ...updateData,
        description: null,
        priority: updateData.priority || null,
        due_date: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockTaskApi.updateTask.mockResolvedValue(mockTask);
      const mockGetTasksResponse = {
        data: [mockTask],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
      mockTaskApi.getTasks.mockResolvedValue(mockGetTasksResponse);

      const result = await useTaskStore.getState().updateTask(taskId, updateData);

      expect(result).toEqual(mockTask);
      expect(useTaskStore.getState().selectedTask).toEqual(mockTask);
      expect(useTaskStore.getState().loading).toBe(false);
      expect(mockTaskApi.getTasks).toHaveBeenCalled();
    });

    it('should handle AxiosError with response data', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };

      const error = new AxiosError('Error message');
      error.response = {
        data: { message: 'Update failed' },
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Update failed');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError without response data', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };

      const error = new AxiosError('Error message');
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle non-AxiosError', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };

      const error = new Error('Generic error');
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Failed to update task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no message field in updateTask', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Network error');
      error.response = {
        data: { error: 'Different format' },
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // This covers branch: error.response?.data?.message || error.message (line 239-240)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no data.message, using error.message in updateTask - covers branch line 239-240', async () => {
      // This covers the branch where error.response.data?.message is falsy but error.message is truthy
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: {},
        status: 500,
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // Should use error.message (second part of || chain)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but data is undefined in updateTask - covers branch line 239-240', async () => {
      // This covers the branch where error.response.data is undefined (optional chaining short-circuits)
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: undefined,
        status: 500,
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // Should use error.message (second part of || chain, data?.message short-circuits)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but data is null in updateTask - covers branch line 239-240', async () => {
      // This covers the branch where error.response.data is null (optional chaining short-circuits)
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: null,
        status: 500,
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // Should use error.message (second part of || chain, data?.message short-circuits on null)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with no message and no error.message in updateTask', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('');
      error.response = {
        data: {},
      } as any;
      error.message = '';
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // This covers branch 158: error.response?.data?.message || error.message || 'Failed to update task'
      expect(useTaskStore.getState().error).toBe('Failed to update task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response in updateTask', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Network error');
      error.request = {} as any;
      error.response = undefined;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // This covers the error.request branch (line 244)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response and no error.message in updateTask - covers branch line 244', async () => {
      // This covers the || branch when error.message is falsy
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('');
      error.request = {} as any;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // Should use fallback 'Network error' (second part of || on line 244)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request in updateTask - covers lines 246', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Setup error');
      error.request = undefined;
      error.response = undefined;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // This covers the else branch (line 246) - error setting up request
      expect(useTaskStore.getState().error).toBe('Setup error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request and no error.message in updateTask - covers branch line 246', async () => {
      // This covers the || branch when error.message is falsy
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('');
      error.request = undefined;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // Should use fallback 'An unexpected error occurred' (second part of || on line 246)
      expect(useTaskStore.getState().error).toBe('An unexpected error occurred');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with 404 status in updateTask', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Not found');
      error.response = {
        status: 404,
        data: {},
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // This covers the error.response.status === 404 branch (line 231)
      expect(useTaskStore.getState().error).toBe('Task not found');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with 400 status in updateTask', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      const error = new AxiosError('Bad request');
      error.response = {
        status: 400,
        data: {},
      } as any;
      mockTaskApi.updateTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();

      // This covers the error.response.status === 400 branch (line 233)
      expect(useTaskStore.getState().error).toBe('Invalid task data. Please check your input.');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle cancelled request error', async () => {
      const taskId = '123';
      const updateData = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };
      class CancelError extends Error {
        constructor(message?: string) {
          super(message);
          this.name = 'Cancel';
        }
      }
      const cancelError = new CancelError('Request cancelled');
      vi.spyOn(axios, 'isCancel').mockReturnValue(true);
      mockTaskApi.updateTask.mockRejectedValue(cancelError);
      
      await expect(useTaskStore.getState().updateTask(taskId, updateData)).rejects.toThrow();
      
      expect(useTaskStore.getState().loading).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const taskId = '123';

      mockTaskApi.deleteTask.mockResolvedValue({
        message: 'Task deleted',
        id: taskId,
      });
      const mockGetTasksResponse = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
      mockTaskApi.getTasks.mockResolvedValue(mockGetTasksResponse);

      await useTaskStore.getState().deleteTask(taskId);

      expect(useTaskStore.getState().loading).toBe(false);
      expect(mockTaskApi.getTasks).toHaveBeenCalled();
    });

    it('should handle AxiosError with response data', async () => {
      const taskId = '123';

      const error = new AxiosError('Error message');
      error.response = {
        data: { message: 'Delete failed' },
      } as any;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Delete failed');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError without response data', async () => {
      const taskId = '123';

      const error = new AxiosError('Error message');
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Error message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle non-AxiosError', async () => {
      const taskId = '123';

      const error = new Error('Generic error');
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      expect(useTaskStore.getState().error).toBe('Failed to delete task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no message field in deleteTask', async () => {
      const taskId = '123';
      const error = new AxiosError('Network error');
      error.response = {
        data: { error: 'Different format' },
      } as any;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // This covers branch: error.response?.data?.message || error.message (line 284-285)
      expect(useTaskStore.getState().error).toBe('Network error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but no data.message, using error.message in deleteTask - covers branch line 284-285', async () => {
      // This covers the branch where error.response.data?.message is falsy but error.message is truthy
      const taskId = '123';
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: {},
        status: 500,
      } as any;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // Should use error.message (second part of || chain)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but data is undefined in deleteTask - covers branch line 284-285', async () => {
      // This covers the branch where error.response.data is undefined (optional chaining short-circuits)
      const taskId = '123';
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: undefined,
        status: 500,
      } as any;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // Should use error.message (second part of || chain, data?.message short-circuits)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with response but data is null in deleteTask - covers branch line 284-285', async () => {
      // This covers the branch where error.response.data is null (optional chaining short-circuits)
      const taskId = '123';
      const error = new AxiosError('Error message from error.message');
      error.response = {
        data: null,
        status: 500,
      } as any;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // Should use error.message (second part of || chain, data?.message short-circuits on null)
      expect(useTaskStore.getState().error).toBe('Error message from error.message');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with no message and no error.message in deleteTask', async () => {
      const taskId = '123';
      const error = new AxiosError('');
      error.response = {
        data: {},
      } as any;
      error.message = '';
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // This covers branch 184: error.response?.data?.message || error.message || 'Failed to delete task'
      expect(useTaskStore.getState().error).toBe('Failed to delete task');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with 404 status in deleteTask', async () => {
      const taskId = '123';
      const error = new AxiosError('Not found');
      error.response = {
        status: 404,
        data: {},
      } as any;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // This covers the error.response.status === 404 branch (line 280)
      expect(useTaskStore.getState().error).toBe('Task not found');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with request but no response in deleteTask', async () => {
      const taskId = '123';
      const error = new AxiosError('');
      error.request = {} as any;
      error.response = undefined;
      error.message = ''; // No message to trigger the fallback
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // This covers the error.request branch (line 289)
      // When error.message is empty, it uses the fallback
      expect(useTaskStore.getState().error).toBe('Network error: Unable to reach the server');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request in deleteTask - covers line 291', async () => {
      const taskId = '123';
      const error = new AxiosError('Setup error');
      error.request = undefined;
      error.response = undefined;
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // This covers the else branch (line 291) - error setting up request
      expect(useTaskStore.getState().error).toBe('Setup error');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle AxiosError with neither response nor request and no error.message in deleteTask - covers branch line 291', async () => {
      // This covers the || branch when error.message is falsy
      const taskId = '123';
      const error = new AxiosError('');
      error.request = undefined;
      error.response = undefined;
      error.message = ''; // Falsy message
      mockTaskApi.deleteTask.mockRejectedValue(error);

      await expect(useTaskStore.getState().deleteTask(taskId)).rejects.toThrow();

      // Should use fallback 'An unexpected error occurred' (second part of || on line 291)
      expect(useTaskStore.getState().error).toBe('An unexpected error occurred');
      expect(useTaskStore.getState().loading).toBe(false);
    });

    it('should handle cancelled request error', async () => {
      const taskId = '123';
      class CancelError extends Error {
        constructor(message?: string) {
          super(message);
          this.name = 'Cancel';
        }
      }
      const cancelError = new CancelError('Request cancelled');
      const isCancelSpy = vi.spyOn(axios, 'isCancel').mockReturnValue(true);
      mockTaskApi.deleteTask.mockRejectedValue(cancelError);
      
      await useTaskStore.getState().deleteTask(taskId);
      
      // Should return early without setting error
      expect(useTaskStore.getState().error).toBeNull();
      expect(useTaskStore.getState().loading).toBe(false);
      expect(isCancelSpy).toHaveBeenCalledWith(cancelError);
      isCancelSpy.mockRestore();
    });
  });
});

