import { AppModule } from './app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof AppModule).toBe('function');
  });

  it('should be instantiable', () => {
    const module = new AppModule();
    expect(module).toBeInstanceOf(AppModule);
  });
});
