import { Controller, Put, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UpdateTaskService } from '../services';
import { UpdateTaskRequestDto, UpdateTaskResponseDto } from '../contract';

@ApiTags('tasks')
@Controller('v1/tasks')
export class UpdateTaskEndpoint {
  constructor(private readonly updateTaskService: UpdateTaskService) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: UpdateTaskResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id') id: string,

    @Body() updateTaskDto: UpdateTaskRequestDto,
  ): Promise<UpdateTaskResponseDto> {
    return this.updateTaskService.execute(id, updateTaskDto);
  }
}
