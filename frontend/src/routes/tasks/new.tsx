import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from '@/components/tasks/create-or-edit';

export const Route = createFileRoute('/tasks/new')({
  component: () => <CreateOrEditTaskPage mode="create" />,
}); // Ensure closing brace is executed
