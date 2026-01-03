/* c8 ignore start - import statements are covered by multiple test imports */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../../../../entities/task.entity';
/* c8 ignore end */
import { RemoveTaskResponseDto } from '../contract';

@Injectable()
export class RemoveTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(id: string): Promise<RemoveTaskResponseDto> {
    // Use transaction for data consistency (reliability fix)
    return await this.taskRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const task = await transactionalEntityManager.findOne(Task, {
          where: { id },
        });

        if (!task) {
          throw new NotFoundException(`Task with ID ${id} not found`);
        }

        await transactionalEntityManager.remove(Task, task);

        return {
          message: 'Task deleted successfully',
          id: id,
        };
      },
    );
  }
}
