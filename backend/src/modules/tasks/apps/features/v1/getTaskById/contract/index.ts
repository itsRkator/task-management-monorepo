import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from '../../../../../entities/task.entity';

export class GetTaskByIdResponseDto {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Write comprehensive documentation',
  })
  description: string | null;

  @ApiProperty({ description: 'Task status', enum: TaskStatus })
  status: TaskStatus;

  @ApiPropertyOptional({ description: 'Task priority', enum: TaskPriority })
  priority: TaskPriority | null;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2024-12-31T23:59:59Z',
  })
  due_date: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: Date;
}
