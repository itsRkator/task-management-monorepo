import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health status object', () => {
      const result = service.getHealth();
      expect(result).toEqual({ status: 'ok' });
    });

    it('should return status property as string', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('status');
      expect(typeof result.status).toBe('string');
    });

    it('should always return status "ok"', () => {
      const result1 = service.getHealth();
      const result2 = service.getHealth();
      expect(result1.status).toBe('ok');
      expect(result2.status).toBe('ok');
    });
  });
});
