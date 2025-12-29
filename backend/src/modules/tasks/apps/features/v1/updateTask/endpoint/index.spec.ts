import { Test, TestingModule } from '@nestjs/testing';
import { UpdateTaskEndpoint } from './index';
import { UpdateTaskService } from '../services';
import { UpdateTaskRequestDto, UpdateTaskResponseDto } from '../contract';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('UpdateTaskEndpoint', () => {
  let controller: UpdateTaskEndpoint;
  let service: UpdateTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateTaskEndpoint],
      providers: [
        {
          provide: UpdateTaskService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UpdateTaskEndpoint>(UpdateTaskEndpoint);
    service = module.get<UpdateTaskService>(UpdateTaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update', () => {
    it('should update a task successfully', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const requestDto: UpdateTaskRequestDto = {
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        due_date: '2024-12-31T23:59:59Z',
      };

      const responseDto: UpdateTaskResponseDto = {
        id: taskId,
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        due_date: new Date('2024-12-31T23:59:59Z'),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.update(taskId, requestDto);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(taskId, requestDto);
      expect(service.execute).toHaveBeenCalledTimes(1);
    });

    it('should update a task with minimal data', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const requestDto: UpdateTaskRequestDto = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };

      const responseDto: UpdateTaskResponseDto = {
        id: taskId,
        title: 'Updated Task',
        description: null,
        status: TaskStatus.PENDING,
        priority: null,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.update(taskId, requestDto);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(taskId, requestDto);
    });

    it('should handle NotFoundException when task does not exist', async () => {
      const taskId = 'non-existent-id';
      const requestDto: UpdateTaskRequestDto = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };

      const error = new Error('Task not found');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.update(taskId, requestDto)).rejects.toThrow(
        error,
      );
      expect(service.execute).toHaveBeenCalledWith(taskId, requestDto);
    });

    it('should handle service errors', async () => {
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const requestDto: UpdateTaskRequestDto = {
        title: 'Updated Task',
        status: TaskStatus.PENDING,
      };

      const error = new Error('Service error');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.update(taskId, requestDto)).rejects.toThrow(
        error,
      );
      expect(service.execute).toHaveBeenCalledWith(taskId, requestDto);
    });
  });
});
