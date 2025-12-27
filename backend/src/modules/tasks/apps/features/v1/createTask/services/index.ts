import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../../../../../entities/task.entity';
import { CreateTaskRequestDto, CreateTaskResponseDto } from '../contract';

@Injectable()
export class CreateTaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async execute(request: CreateTaskRequestDto): Promise<CreateTaskResponseDto> {
    const task = this.taskRepository.create({
      title: request.title,
      description: request.description || null,
      status: request.status || TaskStatus.PENDING,
      priority: request.priority || null,
      due_date: request.due_date ? new Date(request.due_date) : null,
    });

    const savedTask = await this.taskRepository.save(task);

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
  }
}

