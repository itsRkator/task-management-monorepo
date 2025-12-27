import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../../../../entities/task.entity';
import { RemoveTaskResponseDto } from '../contract';

@Injectable()
export class RemoveTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(id: string): Promise<RemoveTaskResponseDto> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.taskRepository.remove(task);

    return {
      message: 'Task deleted successfully',
      id: id,
    };
  }
}
