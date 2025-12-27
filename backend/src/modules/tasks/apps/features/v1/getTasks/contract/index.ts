import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

export class GetTasksQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: TaskPriority,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Search term for title or description',
    example: 'project',
  })
  @IsOptional()
  search?: string;
}

export class TaskItemDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class GetTasksResponseDto {
  data: TaskItemDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
