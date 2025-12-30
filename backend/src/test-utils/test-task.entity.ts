import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  TaskStatus,
  TaskPriority,
} from '../modules/tasks/entities/task.entity';

/**
 * Test-specific Task entity that uses 'text' instead of 'enum' for SQLite compatibility.
 * This allows us to test with in-memory SQLite database while maintaining the same structure.
 */
@Entity('tasks')
@Index(['status'])
@Index(['priority'])
@Index(['due_date'])
export class TestTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'text',
    default: TaskStatus.PENDING,
    nullable: false,
  })
  status: TaskStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  priority: TaskPriority | null;

  @Column({ type: 'datetime', nullable: true })
  due_date: Date | null;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
