import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from '@/components/tasks/CreateOrEdit';

const EditTaskPage = () => {
  const { taskId } = Route.useParams();

  return <CreateOrEditTaskPage mode="edit" taskId={taskId} />;
};

export const Route = createFileRoute('/tasks/$taskId/edit')({
  component: EditTaskPage,
});

export default EditTaskPage;
