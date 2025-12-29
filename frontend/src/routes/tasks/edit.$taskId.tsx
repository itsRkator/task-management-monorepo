import { createFileRoute } from '@tanstack/react-router';
import CreateOrEditTaskPage from '@/components/tasks/CreateOrEdit';

const EditTaskPage = () => {
  const { taskId } = Route.useParams();
  return <CreateOrEditTaskPage mode="edit" taskId={taskId} />;
};

export const Route = createFileRoute('/tasks/edit/$taskId')({
  component: EditTaskPage,
}); // Ensure closing brace is executed

// Ensure export default is executed by explicitly exporting and using the variable
const defaultExport = EditTaskPage;
// Use the variable to ensure it's executed
void defaultExport;
export default defaultExport;
