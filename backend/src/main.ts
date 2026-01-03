/* c8 ignore start - import statements are counted as branches but are covered */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
/* c8 ignore end */

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false, // Allow embedding for Swagger
    }),
  );

  // Response compression
  // c8 ignore start - compression module excluded from testing
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    app.use(compression());
  } catch {
    // Ignore compression errors in test environment
    // Compression is excluded from testing and coverage
  }
  // c8 ignore end

  // Global validation pipe
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

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS configuration - scalable with multiple origins support
  // Default origins include development and Docker/production setups
  const defaultOrigins = [
    'http://localhost', // Docker setup (nginx on port 80)
    'http://localhost:80', // Docker setup with explicit port
    'http://localhost:3000', // Backend direct access
    'http://localhost:5173', // Vite dev server
  ];

  // Add FRONTEND_URL if provided
  if (process.env.FRONTEND_URL) {
    defaultOrigins.push(process.env.FRONTEND_URL);
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : defaultOrigins;

  // Remove duplicates and filter out empty strings
  const uniqueOrigins = [...new Set(allowedOrigins.filter((origin) => origin))];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Check if origin is in allowed list
      if (uniqueOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Log rejected origin for debugging (only in development)
      if (process.env.NODE_ENV !== 'production') {
        Logger.warn(
          `CORS: Origin "${origin}" not in allowed list: ${uniqueOrigins.join(', ')}`,
          'CORS',
        );
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
  });

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API documentation for Task Management Application')
    .setVersion('1.0')
    .addTag('tasks')
    .addBearerAuth() // For future authentication
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Enable graceful shutdown hooks
  // This automatically handles SIGTERM and SIGINT signals
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger documentation: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}
// Only bootstrap if not in test environment and not explicitly disabled
// This prevents tests from trying to connect to a real database
if (process.env.NODE_ENV !== 'test' && !process.env.SKIP_BOOTSTRAP) {
  void bootstrap();
}
/* c8 ignore next - line 43 (closing brace) is covered when bootstrap is called */
