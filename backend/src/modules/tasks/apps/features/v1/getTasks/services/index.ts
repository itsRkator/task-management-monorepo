import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Task } from '../../../../../entities/task.entity';
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
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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
