import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from './CreateOrEdit';

function EditTaskPage() {
  const { taskId } = Route.useParams();
  return <CreateOrEditTaskPage mode="edit" taskId={taskId} />;
}

export const Route = createFileRoute('/tasks/edit/$taskId')({
  component: EditTaskPage,
});
