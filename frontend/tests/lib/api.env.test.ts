import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios - needed for dynamic imports
vi.mock('axios', () => {
  // Create a mock AxiosError class that extends Error
  class MockAxiosError extends Error {
    response?: {
      status?: number;
      data?: any;
    };
    request?: any;
    config?: any;
    isAxiosError = true;

    constructor(message?: string, code?: string, config?: any, request?: any, response?: any) {
      super(message);
      this.name = 'AxiosError';
      this.response = response;
      this.request = request;
      this.config = config;
      if (code) {
        (this as any).code = code;
      }
    }
  }

  return {
    default: {
      create: vi.fn((config) => {
        // Create a mock instance that uses the provided config
        const mockAxiosInstance = {
          get: vi.fn(),
          post: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          request: vi.fn(),
          defaults: {
            baseURL: config?.baseURL || '',
            headers: {
              'Content-Type': 'application/json',
              ...config?.headers,
            },
          },
          interceptors: {
            request: {
              use: vi.fn(),
              eject: vi.fn(),
            },
            response: {
              use: vi.fn(),
              eject: vi.fn(),
            },
          },
        };
        return mockAxiosInstance;
      }),
      isCancel: vi.fn(),
      CancelToken: {
        source: vi.fn(() => ({
          token: {},
          cancel: vi.fn(),
        })),
      },
    },
    AxiosError: MockAxiosError,
  };
});

// Mock axios-retry
vi.mock('axios-retry', () => {
  const mockAxiosRetryFunction = vi.fn();
  mockAxiosRetryFunction.exponentialDelay = vi.fn();
  mockAxiosRetryFunction.isNetworkOrIdempotentRequestError = vi.fn(() => false);
  
  return {
    default: mockAxiosRetryFunction,
    exponentialDelay: vi.fn(),
    isNetworkOrIdempotentRequestError: vi.fn(() => false),
  };
});

// This test file uses dynamic imports to test both branches of the ?? operator
// for environment variables in api.ts

describe('API Client with Environment Variables', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should use custom API URL when VITE_API_URL is set - covers line 4 true branch', async () => {
    // Stub the env var before importing
    vi.stubEnv('VITE_API_URL', 'https://custom-api.example.com/api');
    
    // Clear module cache and dynamically import
    vi.resetModules();
    const { apiClient } = await import('@/lib/api');
    
    // Verify the custom URL is used (covers the true branch of line 4)
    // Line 4: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
    // When VITE_API_URL is set, it uses that value (true branch)
    expect(apiClient.defaults.baseURL).toBe('https://custom-api.example.com/api');
  });

  it('should use default API URL when VITE_API_URL is not set - covers line 4 false branch', async () => {
    // Ensure env var is not set to trigger false branch
    vi.unstubAllEnvs();
    vi.resetModules();
    
    // Explicitly delete the env var to ensure it's undefined
    delete import.meta.env.VITE_API_URL;
    
    // Dynamically import the module
    const { apiClient } = await import('@/lib/api');
    
    // Verify the default URL is used (covers the false branch of line 4)
    // Line 4: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
    // When VITE_API_URL is undefined, it uses the default (false branch)
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3000/api');
  });

  it('should use custom API URL version when VITE_API_URL_VERSION is set - covers line 6 true branch', async () => {
    // Stub the env var before importing
    vi.stubEnv('VITE_API_URL_VERSION', 'v2');
    
    // Clear module cache and dynamically import
    vi.resetModules();
    const { taskApi, apiClient } = await import('@/lib/api');
    
    // Verify the module loaded
    // The API_URL_VERSION constant would be 'v2' when the env var is set
    // This covers the true branch of line 6: import.meta.env.VITE_API_URL_VERSION ?? 'v1'
    expect(taskApi).toBeDefined();
    expect(apiClient).toBeDefined();
    
    // Verify that API_URL_VERSION is actually used in taskApi calls
    // Mock axios to capture the URL being called
    const mockGet = vi.fn().mockResolvedValue({ data: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } } });
    apiClient.get = mockGet;
    
    // Call an API method to verify the version is used
    await taskApi.getTasks();
    
    // The URL should contain /v2/ when VITE_API_URL_VERSION is set to 'v2'
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/v2/tasks'),
      expect.any(Object)
    );
  });

  it('should use default API URL version when VITE_API_URL_VERSION is not set - covers line 6 false branch', async () => {
    // Ensure env var is not set to trigger false branch
    vi.unstubAllEnvs();
    vi.resetModules();
    
    // Explicitly delete the env var to ensure it's undefined
    delete import.meta.env.VITE_API_URL_VERSION;
    
    // Dynamically import the module
    const { taskApi, apiClient } = await import('@/lib/api');
    
    // Verify the module loaded with default version
    // This covers the false branch of line 6: import.meta.env.VITE_API_URL_VERSION ?? 'v1'
    // When VITE_API_URL_VERSION is undefined, it uses 'v1' (false branch)
    expect(taskApi).toBeDefined();
    expect(apiClient).toBeDefined();
    
    // Verify that API_URL_VERSION is actually used in taskApi calls with default 'v1'
    // Mock axios to capture the URL being called
    const mockGet = vi.fn().mockResolvedValue({ data: { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } } });
    apiClient.get = mockGet;
    
    // Call an API method to verify the default version 'v1' is used
    await taskApi.getTasks();
    
    // The URL should contain /v1/ when VITE_API_URL_VERSION is not set (default)
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining('/v1/tasks'),
      expect.any(Object)
    );
  });
});

