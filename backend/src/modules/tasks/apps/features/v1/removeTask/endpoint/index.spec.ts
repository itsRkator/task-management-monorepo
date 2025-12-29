import { Test, TestingModule } from '@nestjs/testing';
import { RemoveTaskEndpoint } from './index';
import { RemoveTaskService } from '../services';
import { RemoveTaskResponseDto } from '../contract';

describe('RemoveTaskEndpoint', () => {
  let controller: RemoveTaskEndpoint;
  let service: RemoveTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemoveTaskEndpoint],
      providers: [
        {
          provide: RemoveTaskService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RemoveTaskEndpoint>(RemoveTaskEndpoint);
    service = module.get<RemoveTaskService>(RemoveTaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('remove', () => {
    it('should remove a task successfully', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const responseDto: RemoveTaskResponseDto = {
        message: 'Task deleted successfully',
        id: taskId,
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.remove(taskId);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(taskId);
      expect(service.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle NotFoundException when task does not exist', async () => {
      const taskId = 'non-existent-id';

      const error = new Error('Task not found');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.remove(taskId)).rejects.toThrow(error);
      expect(service.execute).toHaveBeenCalledWith(taskId);
    });

    it('should handle service errors', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';

      const error = new Error('Service error');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.remove(taskId)).rejects.toThrow(error);
      expect(service.execute).toHaveBeenCalledWith(taskId);
    });
  });
});
