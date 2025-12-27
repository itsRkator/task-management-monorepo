import { create } from 'zustand';
import { taskApi } from '../lib/api';
import type { Task, TaskStatus, TaskPriority, GetTasksQuery } from '../lib/api';
import { AxiosError } from 'axios';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
  };

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTasks: (tasks: Task[]) => void;
  setSelectedTask: (task: Task | null) => void;
  setPagination: (pagination: TaskState['pagination']) => void;
  setFilters: (filters: Partial<TaskState['filters']>) => void;

  // API Actions
  fetchTasks: (query?: GetTasksQuery) => Promise<void>;
  fetchTaskById: (id: string) => Promise<void>;
  createTask: (data: Parameters<typeof taskApi.createTask>[0]) => Promise<Task>;
  updateTask: (
    id: string,
    data: Parameters<typeof taskApi.updateTask>[1]
  ) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
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

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setTasks: (tasks) => set({ tasks }),
  setSelectedTask: (selectedTask) => set({ selectedTask }),
  setPagination: (pagination) => set({ pagination }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  fetchTasks: async (query) => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const pagination = get().pagination;
      const response = await taskApi.getTasks({
        ...query,
        page: query?.page || pagination.page,
        limit: query?.limit || pagination.limit,
        status: query?.status || filters.status,
        priority: query?.priority || filters.priority,
        search: query?.search || filters.search,
      });
      set({
        tasks: response.data,
        pagination: response.meta,
        loading: false,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        set({
          error:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch tasks',
          loading: false,
        });
      } else {
        set({
          error: 'Failed to fetch tasks',
          loading: false,
        });
      }
    }
  },

  fetchTaskById: async (id) => {
    set({ loading: true, error: null });
    try {
      const task = await taskApi.getTaskById(id);
      set({ selectedTask: task, loading: false });
    } catch (error) {
      if (error instanceof AxiosError) {
        set({
          error:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch task',
          loading: false,
        });
      } else {
        set({
          error: 'Failed to fetch task',
          loading: false,
        });
      }
    }
  },

  createTask: async (data) => {
    set({ loading: true, error: null });
    try {
      const task = await taskApi.createTask(data);
      set({ loading: false });
      return task;
    } catch (error) {
      if (error instanceof AxiosError) {
        set({
          error:
            error.response?.data?.message ||
            error.message ||
            'Failed to create task',
          loading: false,
        });
      } else {
        set({
          error: 'Failed to create task',
          loading: false,
        });
      }
      throw error;
    }
  },

  updateTask: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const task = await taskApi.updateTask(id, data);
      set({ loading: false, selectedTask: task }); // Update selected task in store
      await get().fetchTasks(); // Refresh tasks list after update
      return task;
    } catch (error) {
      if (error instanceof AxiosError) {
        set({
          error:
            error.response?.data?.message ||
            error.message ||
            'Failed to update task',
          loading: false,
        });
      } else {
        set({
          error: 'Failed to update task',
          loading: false,
        });
      }
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      await taskApi.deleteTask(id);
      set({ loading: false });
      // Refresh tasks list
      await get().fetchTasks();
    } catch (error) {
      if (error instanceof AxiosError) {
        set({
          error:
            error.response?.data?.message ||
            error.message ||
            'Failed to delete task',
          loading: false,
        });
      } else {
        set({
          error: 'Failed to delete task',
          loading: false,
        });
      }
      throw error;
    }
  },
}));
