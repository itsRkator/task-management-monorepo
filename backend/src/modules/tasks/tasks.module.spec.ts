import { TasksModule } from './tasks.module';

describe('TasksModule', () => {
  it('should be defined', () => {
    expect(TasksModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof TasksModule).toBe('function');
  });

  it('should be instantiable', () => {
    const module = new TasksModule();
    expect(module).toBeInstanceOf(TasksModule);
  });
});
