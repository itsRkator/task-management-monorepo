import { TasksModule } from './tasks.module';

void describe('TasksModule', () => {
  void it('should be defined', () => {
    expect(TasksModule).toBeDefined();
  });

  void it('should be a class', () => {
    expect(typeof TasksModule).toBe('function');
  });

  void it('should be instantiable', () => {
    const module = new TasksModule();
    expect(module).toBeInstanceOf(TasksModule);
  });
});
