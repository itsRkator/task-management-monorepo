/* c8 ignore start - import statements are covered by multiple test imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskEndpoint } from './apps/features/v1/createTask/endpoint';
import { CreateTaskService } from './apps/features/v1/createTask/services';
import { UpdateTaskEndpoint } from './apps/features/v1/updateTask/endpoint';
import { UpdateTaskService } from './apps/features/v1/updateTask/services';
import { RemoveTaskEndpoint } from './apps/features/v1/removeTask/endpoint';
import { RemoveTaskService } from './apps/features/v1/removeTask/services';
import { GetTaskByIdEndpoint } from './apps/features/v1/getTaskById/endpoint';
import { GetTaskByIdService } from './apps/features/v1/getTaskById/services';
import { GetTasksEndpoint } from './apps/features/v1/getTasks/endpoint';
import { GetTasksService } from './apps/features/v1/getTasks/services';
/* c8 ignore end */

@Module({
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [
    CreateTaskEndpoint,
    UpdateTaskEndpoint,
    RemoveTaskEndpoint,
    GetTaskByIdEndpoint,
    GetTasksEndpoint,
  ],
  providers: [
    CreateTaskService,
    UpdateTaskService,
    RemoveTaskService,
    GetTaskByIdService,
    GetTasksService,
  ],
})
export class TasksModule {}
