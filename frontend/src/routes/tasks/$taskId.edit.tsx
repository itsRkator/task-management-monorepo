import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from '@/components/tasks/create-or-edit';

const EditTaskPage = () => {
  const { taskId } = Route.useParams();

  return <CreateOrEditTaskPage mode="edit" taskId={taskId} />;
};

export const Route = createFileRoute('/tasks/$taskId/edit')({
  component: EditTaskPage,
});

// Ensure export default is executed by explicitly exporting and using the variable
export default EditTaskPage;
