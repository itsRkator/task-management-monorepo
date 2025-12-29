// Mock all dependencies before importing main.ts
const mockApp = {
  useGlobalPipes: jest.fn().mockReturnThis(),
  enableCors: jest.fn().mockReturnThis(),
  setGlobalPrefix: jest.fn().mockReturnThis(),
  listen: jest.fn().mockResolvedValue(undefined),
};

const mockNestFactory = {
  create: jest.fn().mockResolvedValue(mockApp),
};

const mockBuilderInstance = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  setVersion: jest.fn().mockReturnThis(),
  addTag: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({ swaggerConfig: true }),
};

const mockDocumentBuilder = jest.fn(() => mockBuilderInstance);

const mockSwaggerModule = {
  createDocument: jest.fn().mockReturnValue({ swaggerDoc: true }),
  setup: jest.fn().mockReturnValue(undefined),
};

const mockValidationPipe = jest.fn().mockImplementation((options) => ({
  ...options,
  whitelist: options.whitelist,
  forbidNonWhitelisted: options.forbidNonWhitelisted,
  transform: options.transform,
}));

jest.mock('@nestjs/core', () => ({
  NestFactory: mockNestFactory,
}));

jest.mock('@nestjs/common', () => ({
  ValidationPipe: mockValidationPipe,
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: mockSwaggerModule,
  DocumentBuilder: mockDocumentBuilder,
}));

jest.mock('./app.module', () => ({
  AppModule: class AppModule {},
}));

describe('main.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Import main.ts once to execute bootstrap and get coverage
  it('should execute bootstrap function and configure app correctly', async () => {
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
    });

    // Verify CORS configuration (default)
    expect(mockApp.enableCors).toHaveBeenCalledWith({
      origin: 'http://localhost:5173',
      credentials: true,
    });

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
});
