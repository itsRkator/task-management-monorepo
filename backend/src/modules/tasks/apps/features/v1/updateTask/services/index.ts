/* c8 ignore start - import statements are covered by multiple test imports */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Task,
  TaskStatus,
  TaskPriority,
} from '../../../../../entities/task.entity';
/* c8 ignore end */
import { UpdateTaskRequestDto, UpdateTaskResponseDto } from '../contract';

@Injectable()
export class UpdateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(
    id: string,
    request: UpdateTaskRequestDto,
  ): Promise<UpdateTaskResponseDto> {
    // Use transaction for data consistency (reliability fix)
    return await this.taskRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const task = await transactionalEntityManager.findOne(Task, {
          where: { id },
        });

        if (!task) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }

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
        if (!Object.values(TaskStatus).includes(request.status)) {
          throw new BadRequestException(
            `Invalid status. Must be one of: ${Object.values(TaskStatus).join(', ')}`,
          );
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

        task.title = trimmedTitle;
        task.description =
          request.description && typeof request.description === 'string'
            ? request.description.trim() || null
            : null;
        task.status = request.status;
        task.priority = request.priority || null;
        task.due_date = dueDate;

        const updatedTask = await transactionalEntityManager.save(Task, task);

        return {
          id: updatedTask.id,
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          priority: updatedTask.priority,
          due_date: updatedTask.due_date,
          created_at: updatedTask.created_at,
          updated_at: updatedTask.updated_at,
        };
      },
    );
  }
}
