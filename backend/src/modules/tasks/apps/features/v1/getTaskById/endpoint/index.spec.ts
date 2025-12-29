import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskByIdEndpoint } from './index';
import { GetTaskByIdService } from '../services';
import { GetTaskByIdResponseDto } from '../contract';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('GetTaskByIdEndpoint', () => {
  let controller: GetTaskByIdEndpoint;
  let service: GetTaskByIdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetTaskByIdEndpoint],
      providers: [
        {
          provide: GetTaskByIdService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GetTaskByIdEndpoint>(GetTaskByIdEndpoint);
    service = module.get<GetTaskByIdService>(GetTaskByIdService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getById', () => {
    it('should get a task by id successfully', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const responseDto: GetTaskByIdResponseDto = {
        id: taskId,
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: new Date('2024-12-31T23:59:59Z'),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.getById(taskId);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(taskId);
      expect(service.execute).toHaveBeenCalledTimes(1);
    });

    it('should handle NotFoundException when task does not exist', async () => {
      const taskId = 'non-existent-id';

      const error = new Error('Task not found');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.getById(taskId)).rejects.toThrow(error);
      expect(service.execute).toHaveBeenCalledWith(taskId);
    });

    it('should handle service errors', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';

      const error = new Error('Service error');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.getById(taskId)).rejects.toThrow(error);
      expect(service.execute).toHaveBeenCalledWith(taskId);
    });
  });
});
