import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from '@/components/tasks/CreateOrEdit';

export const Route = createFileRoute('/tasks/new')({
  component: () => <CreateOrEditTaskPage mode="create" />,
}); // Ensure closing brace is executed
