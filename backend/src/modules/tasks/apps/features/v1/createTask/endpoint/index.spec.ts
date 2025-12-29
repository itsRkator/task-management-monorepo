import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskEndpoint } from './index';
import { CreateTaskService } from '../services';
import { CreateTaskRequestDto, CreateTaskResponseDto } from '../contract';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('CreateTaskEndpoint', () => {
  let controller: CreateTaskEndpoint;
  let service: CreateTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateTaskEndpoint],
      providers: [
        {
          provide: CreateTaskService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CreateTaskEndpoint>(CreateTaskEndpoint);
    service = module.get<CreateTaskService>(CreateTaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task successfully', async () => {
      const requestDto: CreateTaskRequestDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: '2024-12-31T23:59:59Z',
      };

      const responseDto: CreateTaskResponseDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        due_date: new Date('2024-12-31T23:59:59Z'),
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.create(requestDto);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(requestDto);
      expect(service.execute).toHaveBeenCalledTimes(1);
    });

    it('should create a task with minimal data', async () => {
      const requestDto: CreateTaskRequestDto = {
        title: 'Test Task',
      };

      const responseDto: CreateTaskResponseDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Task',
        description: null,
        status: TaskStatus.PENDING,
        priority: null,
        due_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.create(requestDto);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(requestDto);
    });

    it('should handle service errors', async () => {
      const requestDto: CreateTaskRequestDto = {
        title: 'Test Task',
      };

      const error = new Error('Service error');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.create(requestDto)).rejects.toThrow(error);
      expect(service.execute).toHaveBeenCalledWith(requestDto);
    });
  });
});
