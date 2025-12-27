import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTasksTable1735689600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
    `);

    await queryRunner.query(`
      CREATE TYPE "task_priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    `);

    // Create tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
            default: "'PENDING'",
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            isNullable: true,
          },
          {
            name: 'due_date',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_status',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_priority',
        columnNames: ['priority'],
      }),
    );

    await queryRunner.createIndex(
      'tasks',
      new TableIndex({
        name: 'IDX_tasks_due_date',
        columnNames: ['due_date'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('tasks', 'IDX_tasks_due_date');
    await queryRunner.dropIndex('tasks', 'IDX_tasks_priority');
    await queryRunner.dropIndex('tasks', 'IDX_tasks_status');

    // Drop table
    await queryRunner.dropTable('tasks');

    // Drop enum types
    await queryRunner.query(`DROP TYPE IF EXISTS "task_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_status_enum"`);
  }
}

