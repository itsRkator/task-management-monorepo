import { Test, TestingModule } from '@nestjs/testing';
import { GetTasksEndpoint } from './index';
import { GetTasksService } from '../services';
import { GetTasksQueryDto, GetTasksResponseDto } from '../contract';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

describe('GetTasksEndpoint', () => {
  let controller: GetTasksEndpoint;
  let service: GetTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetTasksEndpoint],
      providers: [
        {
          provide: GetTasksService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GetTasksEndpoint>(GetTasksEndpoint);
    service = module.get<GetTasksService>(GetTasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTasks', () => {
    it('should get tasks with default query', async () => {
      const query: GetTasksQueryDto = {};
      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.getTasks(query);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(query);
      expect(service.execute).toHaveBeenCalledTimes(1);
    });

    it('should get tasks with pagination', async () => {
      const query: GetTasksQueryDto = {
        page: 2,
        limit: 20,
      };

      const responseDto: GetTasksResponseDto = {
        data: [
          {
            id: '1',
            title: 'Task 1',
            description: 'Description 1',
            status: TaskStatus.PENDING,
            priority: TaskPriority.HIGH,
            due_date: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        meta: {
          page: 2,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.getTasks(query);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(query);
    });

    it('should get tasks with status filter', async () => {
      const query: GetTasksQueryDto = {
        status: TaskStatus.COMPLETED,
      };

      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.getTasks(query);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(query);
    });

    it('should get tasks with priority filter', async () => {
      const query: GetTasksQueryDto = {
        priority: TaskPriority.HIGH,
      };

      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.getTasks(query);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(query);
    });

    it('should get tasks with search query', async () => {
      const query: GetTasksQueryDto = {
        search: 'test',
      };

      const responseDto: GetTasksResponseDto = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };

      jest.spyOn(service, 'execute').mockResolvedValue(responseDto);

      const result = await controller.getTasks(query);

      expect(result).toEqual(responseDto);
      expect(service.execute).toHaveBeenCalledWith(query);
    });

    it('should handle service errors', async () => {
      const query: GetTasksQueryDto = {};

      const error = new Error('Service error');
      jest.spyOn(service, 'execute').mockRejectedValue(error);

      await expect(controller.getTasks(query)).rejects.toThrow(error);
      expect(service.execute).toHaveBeenCalledWith(query);
    });
  });
});
