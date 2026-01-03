import { LoggingInterceptor } from './logging.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Suppress console.log and console.error during tests
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = jest.fn();
    console.error = jest.fn();
    interceptor = new LoggingInterceptor();
    mockExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          method: 'GET',
          url: '/test',
        })),
        getResponse: jest.fn(() => ({
          statusCode: 200,
        })),
      })),
    } as unknown as ExecutionContext;
    mockCallHandler = {
      handle: jest.fn(),
    } as unknown as CallHandler;
  });

  it('should log successful request', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'log');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('success'));

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    result.subscribe({
      next: () => {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /test 200'),
        );
        done();
      },
    });
  });

  it('should log request with delay', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'log');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('success'));

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    // Use setTimeout to ensure delay is measured
    setTimeout(() => {
      result.subscribe({
        next: () => {
          expect(loggerSpy).toHaveBeenCalledWith(
            expect.stringMatching(/GET \/test 200 - \d+ms/),
          );
          done();
        },
      });
    }, 10);
  });

  it('should log error request', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'error');
    const error = new Error('Test error');
    (mockCallHandler.handle as jest.Mock).mockReturnValue(
      throwError(() => error),
    );

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    result.subscribe({
      error: () => {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /test'),
        );
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('Test error'),
        );
        done();
      },
    });
  });

  it('should handle error without message', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'error');
    const error = {} as Error;
    (mockCallHandler.handle as jest.Mock).mockReturnValue(
      throwError(() => error),
    );

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    result.subscribe({
      error: () => {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('Unknown error'),
        );
        done();
      },
    });
  });

  it('should handle request with missing method', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'log');
    mockExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          url: '/test',
        })),
        getResponse: jest.fn(() => ({
          statusCode: 200,
        })),
      })),
    } as unknown as ExecutionContext;
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('success'));

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    result.subscribe({
      next: () => {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('UNKNOWN /test'),
        );
        done();
      },
    });
  });

  it('should handle request with missing url', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'log');
    mockExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          method: 'GET',
        })),
        getResponse: jest.fn(() => ({
          statusCode: 200,
        })),
      })),
    } as unknown as ExecutionContext;
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('success'));

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    result.subscribe({
      next: () => {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET UNKNOWN'),
        );
        done();
      },
    });
  });

  it('should handle response with missing statusCode', (done) => {
    const loggerSpy = jest.spyOn(interceptor['logger'], 'log');
    mockExecutionContext = {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({
          method: 'GET',
          url: '/test',
        })),
        getResponse: jest.fn(() => ({})),
      })),
    } as unknown as ExecutionContext;
    (mockCallHandler.handle as jest.Mock).mockReturnValue(of('success'));

    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);

    result.subscribe({
      next: () => {
        expect(loggerSpy).toHaveBeenCalledWith(
          expect.stringContaining('GET /test 200'),
        );
        done();
      },
    });
  });

  afterEach(() => {
    // Restore console.log and console.error
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });
});
