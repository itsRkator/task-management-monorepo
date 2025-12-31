import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health status', () => {
      const result = { status: 'ok' };
      const getHealthSpy = jest
        .spyOn(appService, 'getHealth')
        .mockReturnValue(result);

      expect(appController.getHealth()).toEqual(result);
      expect(getHealthSpy).toHaveBeenCalled();
    });

    it('should return health status with correct structure', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status');
      expect(typeof result.status).toBe('string');
      expect(result.status).toBe('ok');
    });
  });
});
