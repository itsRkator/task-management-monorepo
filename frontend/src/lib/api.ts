import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const API_URL_VERSION = import.meta.env.VITE_API_URL_VERSION ?? 'v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
}

export interface GetTasksResponse {
  data: Task[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetTasksQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

export const taskApi = {
  getTasks: async (query?: GetTasksQuery): Promise<GetTasksResponse> => {
    const response = await apiClient.get<GetTasksResponse>(
      `/${API_URL_VERSION}/tasks`,
      {
        params: query,
      }
    );
    return response.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(
      `/${API_URL_VERSION}/tasks/${id}`
    );
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>(
      `/${API_URL_VERSION}/tasks`,
      data
    );
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.put<Task>(
      `/${API_URL_VERSION}/tasks/${id}`,
      data
    );
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ message: string; id: string }> => {
    const response = await apiClient.delete<{ message: string; id: string }>(
      `/${API_URL_VERSION}/tasks/${id}`
    );
    return response.data;
  },
};
