import { RemoveTaskResponseDto } from './index';

void describe('RemoveTaskResponseDto', () => {
  void it('should be defined', () => {
    expect(RemoveTaskResponseDto).toBeDefined();
  });

  void it('should allow creating response object', () => {
    const response = new RemoveTaskResponseDto();
    response.message = 'Task deleted successfully';
    response.id = '123';

    expect(response.message).toBe('Task deleted successfully');
    expect(response.id).toBe('123');
  });
});
