import { TimeoutMiddleware } from './timeout.middleware';
import { Request, Response, NextFunction } from 'express';

describe('TimeoutMiddleware', () => {
  let middleware: TimeoutMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new TimeoutMiddleware();
    mockRequest = {
      setTimeout: jest.fn((timeout: number, callback: () => void) => {
        // Store callback for testing
        (mockRequest as { timeoutCallback?: () => void }).timeoutCallback =
          callback;
        return mockRequest as Request;
      }),
    };
    mockResponse = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should set default timeout of 30000ms', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRequest.setTimeout).toHaveBeenCalledWith(
      30000,
      expect.any(Function),
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use REQUEST_TIMEOUT environment variable', () => {
    const originalTimeout = process.env.REQUEST_TIMEOUT;
    process.env.REQUEST_TIMEOUT = '5000';

    const newMiddleware = new TimeoutMiddleware();
    newMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    );

    expect(mockRequest.setTimeout).toHaveBeenCalledWith(
      5000,
      expect.any(Function),
    );

    process.env.REQUEST_TIMEOUT = originalTimeout;
  });

  it('should call timeout callback when timeout occurs', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    const timeoutCallback = (mockRequest as { timeoutCallback?: () => void })
      .timeoutCallback;
    expect(timeoutCallback).toBeDefined();

    if (timeoutCallback) {
      timeoutCallback();
    }

    expect(mockResponse.status).toHaveBeenCalledWith(408);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 408,
      message: 'Request timeout',
      timestamp: expect.any(String) as string,
    });
  });

  it('should not send response if headers already sent', () => {
    mockResponse.headersSent = true;

    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    const timeoutCallback = (mockRequest as { timeoutCallback?: () => void })
      .timeoutCallback;
    expect(timeoutCallback).toBeDefined();

    if (timeoutCallback) {
      timeoutCallback();
    }

    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should call next() after setting timeout', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
