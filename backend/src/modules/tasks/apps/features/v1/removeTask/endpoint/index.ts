import { Controller, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RemoveTaskService } from '../services';
import { RemoveTaskResponseDto } from '../contract';

@ApiTags('tasks')
@Controller('v1/tasks')
export class RemoveTaskEndpoint {
  constructor(private readonly removeTaskService: RemoveTaskService) {}

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({
    name: 'id',
    description: 'Task ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Task deleted successfully',
    type: RemoveTaskResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id') id: string): Promise<RemoveTaskResponseDto> {
    return this.removeTaskService.execute(id);
  }
}
