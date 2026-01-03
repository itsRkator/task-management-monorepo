import { HealthController } from './health.controller';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let typeOrmHealthIndicator: TypeOrmHealthIndicator;
  let memoryHealthIndicator: MemoryHealthIndicator;
  let diskHealthIndicator: DiskHealthIndicator;
  let mockCheck: jest.Mock;
  let mockPingCheck: jest.Mock;
  let mockCheckHeap: jest.Mock;
  let mockCheckStorage: jest.Mock;

  beforeEach(() => {
    mockCheck = jest.fn();
    mockPingCheck = jest.fn();
    mockCheckHeap = jest.fn();
    mockCheckStorage = jest.fn();

    healthCheckService = {
      check: mockCheck,
    } as unknown as HealthCheckService;
    typeOrmHealthIndicator = {
      pingCheck: mockPingCheck,
    } as unknown as TypeOrmHealthIndicator;
    memoryHealthIndicator = {
      checkHeap: mockCheckHeap,
    } as unknown as MemoryHealthIndicator;
    diskHealthIndicator = {
      checkStorage: mockCheckStorage,
    } as unknown as DiskHealthIndicator;

    controller = new HealthController(
      healthCheckService,
      typeOrmHealthIndicator,
      memoryHealthIndicator,
      diskHealthIndicator,
    );
  });

  describe('check', () => {
    it('should call health check service with all health indicators', () => {
      mockCheck.mockResolvedValue({
        status: 'ok',
      });

      void controller.check();

      expect(mockCheck).toHaveBeenCalledWith([
        expect.any(Function), // database ping check
        expect.any(Function), // memory heap check
        expect.any(Function), // disk storage check
      ]);
    });

    it('should include database ping check', () => {
      mockCheck.mockImplementation((checks: Array<() => void>) => {
        // Execute the first check (database)
        const dbCheck = checks[0];
        if (dbCheck) {
          dbCheck();
        }
        expect(mockPingCheck).toHaveBeenCalledWith('database');
      });

      void controller.check();
    });

    it('should include memory heap check', () => {
      mockCheck.mockImplementation((checks: Array<() => void>) => {
        // Execute the second check (memory)
        const memoryCheck = checks[1];
        if (memoryCheck) {
          memoryCheck();
        }
        expect(mockCheckHeap).toHaveBeenCalledWith(
          'memory_heap',
          300 * 1024 * 1024,
        );
      });

      void controller.check();
    });

    it('should include disk storage check', () => {
      mockCheck.mockImplementation((checks: Array<() => void>) => {
        // Execute the third check (disk)
        const diskCheck = checks[2];
        if (diskCheck) {
          diskCheck();
        }
        expect(mockCheckStorage).toHaveBeenCalledWith('storage', {
          path: '/',
          thresholdPercent: 0.8,
        });
      });

      void controller.check();
    });
  });

  describe('liveness', () => {
    it('should return ok status with timestamp', () => {
      const result = controller.liveness();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String) as string,
      });
      expect(new Date(result.timestamp).getTime()).toBeLessThanOrEqual(
        Date.now(),
      );
    });
  });

  describe('readiness', () => {
    it('should call health check service with database check', () => {
      mockCheck.mockResolvedValue({
        status: 'ok',
      });

      void controller.readiness();

      expect(mockCheck).toHaveBeenCalledWith([
        expect.any(Function), // database ping check
      ]);
    });

    it('should include database ping check in readiness', () => {
      mockCheck.mockImplementation((checks: Array<() => void>) => {
        // Execute the database check
        const dbCheck = checks[0];
        if (dbCheck) {
          dbCheck();
        }
        expect(mockPingCheck).toHaveBeenCalledWith('database');
      });

      void controller.readiness();
    });
  });
});
