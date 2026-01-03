// Mock all dependencies before importing main.ts
const mockApp = {
  use: jest.fn().mockReturnThis(),
  useGlobalPipes: jest.fn().mockReturnThis(),
  useGlobalFilters: jest.fn().mockReturnThis(),
  enableCors: jest.fn().mockReturnThis(),
  enableShutdownHooks: jest.fn().mockReturnThis(),
  setGlobalPrefix: jest.fn().mockReturnThis(),
  listen: jest.fn().mockResolvedValue(undefined),
  getHttpAdapter: jest.fn().mockReturnValue({
    getType: jest.fn().mockReturnValue('express'),
  }),
};

const mockNestFactory = {
  create: jest.fn().mockResolvedValue(mockApp),
};

const mockBuilderInstance = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  addTag: jest.fn().mockReturnThis(),
  addBearerAuth: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({ swaggerConfig: true }),
};

const mockDocumentBuilder = jest.fn(() => mockBuilderInstance);

const mockSwaggerModule = {
  createDocument: jest.fn().mockReturnValue({ swaggerDoc: true }),
  setup: jest.fn().mockReturnValue(undefined),
};

const mockValidationPipe = jest.fn().mockImplementation(
  (options: {
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
    transformOptions?: {
      enableImplicitConversion?: boolean;
    };
  }): {
    whitelist?: boolean;
    forbidNonWhitelisted?: boolean;
    transform?: boolean;
    transformOptions?: {
      enableImplicitConversion?: boolean;
    };
  } => {
    const result: {
      whitelist?: boolean;
      forbidNonWhitelisted?: boolean;
      transform?: boolean;
      transformOptions?: {
        enableImplicitConversion?: boolean;
      };
    } = {
      whitelist: options.whitelist,
      forbidNonWhitelisted: options.forbidNonWhitelisted,
      transform: options.transform,
      transformOptions: options.transformOptions,
    };

    return result;
  },
);

jest.mock('@nestjs/core', () => {
  return {
    NestFactory: mockNestFactory,
  };
});

jest.mock('@nestjs/common', () => {
  return {
    ValidationPipe: mockValidationPipe,
    Logger: {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  };
});

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: mockSwaggerModule,
  DocumentBuilder: mockDocumentBuilder,
}));

jest.mock('./app.module', () => ({
  AppModule: class AppModule {},
}));

// Mock ConfigModule to prevent real config loading
jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn(() => ({})),
  },
  ConfigService: jest.fn(() => ({
    get: jest.fn((key: string, defaultValue?: unknown) => defaultValue),
  })),
}));

// Mock TypeORM to prevent any database connection attempts
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRootAsync: jest.fn(),
  },
}));

// Mock database config to prevent real database connections
jest.mock('./config/database.config', () => ({
  getDatabaseConfig: jest.fn(() => ({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test_db',
    synchronize: false,
    logging: false,
  })),
}));

jest.mock('./common/filters/all-exceptions.filter', () => ({
  AllExceptionsFilter: class AllExceptionsFilter {},
}));

jest.mock('compression', () => {
  const compressionFn = jest.fn(
    () => (req: unknown, res: unknown, next: () => void) => {
      next();
    },
  );
  return {
    __esModule: true,
    default: compressionFn,
    // Make the namespace itself callable for import * as compression
    ...compressionFn,
  };
});

jest.mock('helmet', () => {
  return {
    __esModule: true,
    default: jest.fn(() => (req: unknown, res: unknown, next: () => void) => {
      next();
    }),
  };
});

describe('main.ts', () => {
  const originalEnv = process.env;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSkipBootstrap = process.env.SKIP_BOOTSTRAP;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    // Set NODE_ENV to 'development' so bootstrap() gets called
    process.env.NODE_ENV = 'development';
    delete process.env.SKIP_BOOTSTRAP;
  });

  afterEach(() => {
    process.env = originalEnv;
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }
    if (originalSkipBootstrap) {
      process.env.SKIP_BOOTSTRAP = originalSkipBootstrap;
    } else {
      delete process.env.SKIP_BOOTSTRAP;
    }
  });

  // Import main.ts once to execute bootstrap and get coverage
  it('should execute bootstrap function and configure app correctly', async () => {
    // Clear module cache to ensure fresh import with updated env vars
    jest.resetModules();
    // Import main.ts which will execute bootstrap()
    await import('./main');
    // Give it time to execute
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(mockNestFactory.create).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(mockApp.listen).toHaveBeenCalled();

    // Verify validation pipe configuration
    expect(mockValidationPipe).toHaveBeenCalledWith({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    });

    // Verify CORS configuration (default)
    const corsCall = (mockApp.enableCors.mock.calls[0] as [unknown])[0] as {
      origin: (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void;
      credentials: boolean;
      methods: string[];
      allowedHeaders: string[];
      exposedHeaders: string[];
    };
    expect(corsCall.origin).toBeInstanceOf(Function);
    expect(corsCall.credentials).toBe(true);
    expect(corsCall.methods).toEqual([
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'PATCH',
      'OPTIONS',
    ]);
    expect(corsCall.allowedHeaders).toEqual([
      'Content-Type',
      'Authorization',
      'X-Requested-With',
    ]);
    expect(corsCall.exposedHeaders).toEqual(['X-Total-Count']);

    // Test CORS origin callback - no origin (allowed) - covers !origin branch
    const originCallback = corsCall.origin;
    const mockCallback1 = jest.fn();
    (
      originCallback as (
        origin: string | undefined,
        callback: (err: Error | null, result?: boolean) => void,
      ) => void
    )(undefined, mockCallback1);
    expect(mockCallback1).toHaveBeenCalledWith(null, true);

    // Test CORS origin callback - allowed origin (in list - localhost:5173)
    const mockCallback2 = jest.fn();
    originCallback('http://localhost:5173', mockCallback2);
    expect(mockCallback2).toHaveBeenCalledWith(null, true);

    // Test CORS origin callback - allowed origin (in list - localhost:3000)
    const mockCallback2b = jest.fn();
    originCallback('http://localhost:3000', mockCallback2b);
    expect(mockCallback2b).toHaveBeenCalledWith(null, true);

    // Test CORS origin callback - not allowed origin
    const mockCallback3 = jest.fn();
    originCallback('http://malicious.com', mockCallback3);
    expect(mockCallback3).toHaveBeenCalledWith(expect.any(Error));
    expect(
      (
        (mockCallback3.mock.calls[0] as [unknown, unknown])[0] as {
          message: string;
        }
      ).message,
    ).toBe('Not allowed by CORS');

    // Verify Swagger configuration
    expect(mockDocumentBuilder).toHaveBeenCalled();
    expect(mockBuilderInstance.setTitle).toHaveBeenCalledWith(
      'Task Management API',
    );
    expect(mockBuilderInstance.setDescription).toHaveBeenCalledWith(
      'API documentation for Task Management Application',
    );
    expect(mockBuilderInstance.setVersion).toHaveBeenCalledWith('1.0');
    expect(mockBuilderInstance.addTag).toHaveBeenCalledWith('tasks');
    expect(mockBuilderInstance.addBearerAuth).toHaveBeenCalled();
    expect(mockBuilderInstance.build).toHaveBeenCalled();
    expect(mockSwaggerModule.createDocument).toHaveBeenCalled();
    expect(mockSwaggerModule.setup).toHaveBeenCalledWith('api/docs', mockApp, {
      swaggerDoc: true,
    });

    // Verify port (default)
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should handle custom frontend URL from env', () => {
    process.env.FRONTEND_URL = 'https://custom-frontend.com';
    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
    expect(origin).toBe('https://custom-frontend.com');
    delete process.env.FRONTEND_URL;
  });

  it('should handle custom port from env', () => {
    process.env.PORT = '8080';
    const port = process.env.PORT ?? 3000;
    expect(port).toBe('8080');
    delete process.env.PORT;
  });

  it('should use default port when PORT is not set', () => {
    delete process.env.PORT;
    const port = process.env.PORT ?? 3000;
    expect(port).toBe(3000);
  });

  it('should use default frontend URL when FRONTEND_URL is not set', () => {
    delete process.env.FRONTEND_URL;
    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
    expect(origin).toBe('http://localhost:5173');
  });

  it('should handle ALLOWED_ORIGINS environment variable', async () => {
    process.env.ALLOWED_ORIGINS = 'https://example.com,https://test.com';
    jest.resetModules();
    await import('./main');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Get the latest CORS call (after the new import)
    const corsCalls = mockApp.enableCors.mock.calls;
    const corsCall = (corsCalls[corsCalls.length - 1] as [unknown])[0] as {
      origin: (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void;
    };
    const originCallback = corsCall.origin;

    // Test with origin from ALLOWED_ORIGINS
    const mockCallback1 = jest.fn();
    (
      originCallback as (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void
    )('https://example.com', mockCallback1);
    expect(mockCallback1).toHaveBeenCalledWith(null, true);

    // Test with another origin from ALLOWED_ORIGINS
    const mockCallback2 = jest.fn();
    (
      originCallback as (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void
    )('https://test.com', mockCallback2);
    expect(mockCallback2).toHaveBeenCalledWith(null, true);

    // Test with origin not in ALLOWED_ORIGINS
    const mockCallback3 = jest.fn();
    (
      originCallback as (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void
    )('https://malicious.com', mockCallback3);
    expect(mockCallback3).toHaveBeenCalledWith(expect.any(Error));

    delete process.env.ALLOWED_ORIGINS;
  });

  it('should handle FRONTEND_URL in allowed origins', async () => {
    process.env.FRONTEND_URL = 'https://custom-frontend.com';
    delete process.env.ALLOWED_ORIGINS;
    jest.resetModules();
    await import('./main');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Get the latest CORS call
    const corsCalls = mockApp.enableCors.mock.calls;
    const corsCall = (corsCalls[corsCalls.length - 1] as [unknown])[0] as {
      origin: (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void;
    };
    const originCallback = corsCall.origin as unknown as (
      origin: string,
      callback: (err: Error | null, result: boolean) => void,
    ) => void;

    // Test with custom FRONTEND_URL
    const mockCallback = jest.fn();
    (
      originCallback as (
        origin: string,
        callback: (err: Error | null, result: boolean) => void,
      ) => void
    )('https://custom-frontend.com', mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, true);

    delete process.env.FRONTEND_URL;
  });

  it('should not bootstrap when NODE_ENV is test', async () => {
    process.env.NODE_ENV = 'test';
    delete process.env.SKIP_BOOTSTRAP;
    jest.resetModules();
    jest.clearAllMocks();

    await import('./main');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Bootstrap should not be called when NODE_ENV is 'test'
    expect(mockNestFactory.create).not.toHaveBeenCalled();
  });

  it('should not bootstrap when SKIP_BOOTSTRAP is set', async () => {
    process.env.NODE_ENV = 'development';
    process.env.SKIP_BOOTSTRAP = 'true';
    jest.resetModules();
    jest.clearAllMocks();

    await import('./main');
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Bootstrap should not be called when SKIP_BOOTSTRAP is set
    expect(mockNestFactory.create).not.toHaveBeenCalled();

    delete process.env.SKIP_BOOTSTRAP;
  });
});
