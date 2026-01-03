/* c8 ignore start - import statements are covered by multiple test imports */
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
/* c8 ignore end */
import { CreateTaskRequestDto, CreateTaskResponseDto } from '../contract';

@Injectable()
export class CreateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(request: CreateTaskRequestDto): Promise<CreateTaskResponseDto> {
    // Use transaction for data consistency (reliability fix)
    return await this.taskRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // Defensive checks - validation should catch these, but be safe
        if (!request.title || typeof request.title !== 'string') {
          throw new BadRequestException(
            'Title is required and must be a string',
          );
        }
        const trimmedTitle = request.title.trim();
        if (trimmedTitle.length === 0) {
          throw new BadRequestException('Title cannot be empty');
        }
        if (trimmedTitle.length > 255) {
          throw new BadRequestException('Title cannot exceed 255 characters');
        }

        // Validate status enum
        if (request.status !== undefined) {
          if (!Object.values(TaskStatus).includes(request.status)) {
            throw new BadRequestException(
              `Invalid status. Must be one of: ${Object.values(TaskStatus).join(', ')}`,
            );
          }
        }

        // Validate priority enum
        if (request.priority !== undefined && request.priority !== null) {
          if (!Object.values(TaskPriority).includes(request.priority)) {
            throw new BadRequestException(
              `Invalid priority. Must be one of: ${Object.values(TaskPriority).join(', ')}`,
            );
          }
        }

        // Validate date format
        let dueDate: Date | null = null;
        if (request.due_date) {
          if (typeof request.due_date !== 'string') {
            throw new BadRequestException(
              'Due date must be a string in ISO format',
            );
          }
          const parsedDate = new Date(request.due_date);
          if (isNaN(parsedDate.getTime())) {
            throw new BadRequestException(
              'Invalid date format. Must be a valid ISO date string',
            );
          }
          dueDate = parsedDate;
        }

        // Validate description type if provided
        if (
          request.description !== undefined &&
          request.description !== null &&
          typeof request.description !== 'string'
        ) {
          throw new BadRequestException('Description must be a string');
        }

        const task = transactionalEntityManager.create(Task, {
          title: trimmedTitle,
          description:
            request.description && typeof request.description === 'string'
              ? request.description.trim() || null
              : null,
          status: request.status || TaskStatus.PENDING,
          priority: request.priority || null,
          due_date: dueDate,
        });

        const savedTask = await transactionalEntityManager.save(Task, task);

        return {
          id: savedTask.id,
          title: savedTask.title,
          description: savedTask.description,
          status: savedTask.status,
          priority: savedTask.priority,
          due_date: savedTask.due_date,
          created_at: savedTask.created_at,
          updated_at: savedTask.updated_at,
        };
      },
    );
  }
}
