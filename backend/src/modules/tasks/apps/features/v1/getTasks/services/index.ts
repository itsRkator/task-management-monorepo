/* c8 ignore start - import statements are covered by multiple test imports */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOperator } from 'typeorm';
import {
  Task,
  TaskPriority,
  TaskStatus,
} from '../../../../../entities/task.entity';
/* c8 ignore end */
import {
  GetTasksQueryDto,
  GetTasksResponseDto,
  TaskItemDto,
} from '../contract';

@Injectable()
export class GetTasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(query: GetTasksQueryDto): Promise<GetTasksResponseDto> {
    // Validate pagination parameters - validation should catch these, but be safe
    // @Type(() => Number) should have transformed strings to numbers already
    // Handle both number and potential string inputs (defensive)
    const pageRaw = query.page !== undefined ? query.page : 1;
    const limitRaw = query.limit !== undefined ? query.limit : 10;

    // Convert to numbers if needed (defensive - transformation should have handled this)
    const pageNum =
      typeof pageRaw === 'number'
        ? pageRaw
        : typeof pageRaw === 'string'
          ? parseInt(pageRaw, 10)
          : 1;
    const limitNum =
      typeof limitRaw === 'number'
        ? limitRaw
        : typeof limitRaw === 'string'
          ? parseInt(limitRaw, 10)
          : 10;

    // Reject invalid values instead of normalizing them
    // Only validate if the value was explicitly provided and is invalid
    if (query.page !== undefined) {
      if (isNaN(pageNum) || pageNum < 1 || !Number.isInteger(pageNum)) {
        throw new BadRequestException(
          'Page must be a positive integer (minimum 1)',
        );
      }
    }
    if (query.limit !== undefined) {
      if (isNaN(limitNum) || limitNum < 1 || !Number.isInteger(limitNum)) {
        throw new BadRequestException(
          'Limit must be a positive integer (minimum 1)',
        );
      }
      if (limitNum > 100) {
        throw new BadRequestException('Limit cannot exceed 100');
      }
    }

    const page = pageNum;
    const limit = limitNum;
    const skip = (page - 1) * limit;

    const where: {
      status?: TaskStatus;
      priority?: TaskPriority;
      title?: FindOperator<string>;
      description?: FindOperator<string>;
      due_date?: FindOperator<Date>;
      created_at?: FindOperator<Date>;
      updated_at?: FindOperator<Date>;
      id?: FindOperator<string>;
      order?: {
        created_at?: 'ASC' | 'DESC';
        updated_at?: 'ASC' | 'DESC';
        due_date?: 'ASC' | 'DESC';
        priority?: 'ASC' | 'DESC';
        status?: 'ASC' | 'DESC';
      };
      limit?: number;
      skip?: number;
      page?: number;
      total?: number;
      totalPages?: number;
      data?: TaskItemDto[];
      meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    } = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.search) {
      where.title = Like(`%${query.search}%`);
      // Note: TypeORM doesn't support OR conditions easily in where, so we'll handle search differently
    }

    let queryBuilder = this.taskRepository.createQueryBuilder('task');

    if (query.status) {
      queryBuilder = queryBuilder.where('task.status = :status', {
        status: query.status,
      });
    }

    if (query.priority) {
      queryBuilder = queryBuilder.andWhere('task.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.search) {
      queryBuilder = queryBuilder.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('task.created_at', 'DESC')
      .getManyAndCount();

    const taskItems: TaskItemDto[] = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: taskItems,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
