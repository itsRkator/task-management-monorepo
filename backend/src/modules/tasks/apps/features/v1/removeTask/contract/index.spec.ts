import { RemoveTaskResponseDto } from './index';

describe('RemoveTaskResponseDto', () => {
  it('should be defined', () => {
    expect(RemoveTaskResponseDto).toBeDefined();
  });

  it('should allow creating response object', () => {
    const response = new RemoveTaskResponseDto();
    response.message = 'Task deleted successfully';
    response.id = '123';

    expect(response.message).toBe('Task deleted successfully');
    expect(response.id).toBe('123');
  });
});
