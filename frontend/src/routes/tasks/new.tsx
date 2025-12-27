import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from './CreateOrEdit';

export const Route = createFileRoute('/tasks/new')({
  component: () => <CreateOrEditTaskPage mode="create" />,
});
