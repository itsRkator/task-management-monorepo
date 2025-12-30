import { createFileRoute, useNavigate, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  Calendar,
  Flag,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TaskStatus, TaskPriority } from '@/lib/api';

const TaskDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = Route.useParams();
  const { selectedTask, loading, error, fetchTaskById, deleteTask } =
    useTaskStore();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchTaskById(taskId);
  }, [taskId, fetchTaskById]);

  // If we're on the edit route, render the Outlet (which will show the edit form)
  if (location.pathname.endsWith('/edit')) {
    return <Outlet />;
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      navigate({ to: '/' });
    } catch {
      toast.error('Failed to delete task');
      setDeleteDialogOpen(false);
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case TaskStatus.CANCELLED:
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle2 className="h-4 w-4" />;
      case TaskStatus.IN_PROGRESS:
        return <Clock className="h-4 w-4" />;
      case TaskStatus.CANCELLED:
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority | null) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case TaskPriority.MEDIUM:
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case TaskPriority.LOW:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Loading task details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300 px-4 py-3 rounded-r-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Button variant="outline" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4 inline-block">
          <XCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          Task not found
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          The task you're looking for doesn't exist or has been deleted.
        </p>
        <Button onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Button>

      {/* Main Card */}
      <Card>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {selectedTask.title}
              </CardTitle>
              <CardDescription className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created on{' '}
                {format(
                  new Date(selectedTask.created_at),
                  'MMMM dd, yyyy'
                )} at {format(new Date(selectedTask.created_at), 'h:mm a')}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/tasks/$taskId/edit" params={{ taskId }}>
                <Button variant="edit" className="w-full sm:w-auto">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleDeleteClick}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Description
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {selectedTask.description || (
                  <span className="text-slate-400 dark:text-slate-500 italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Task Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Status
              </h3>
              <Badge
                className={`${getStatusColor(selectedTask.status)} font-medium px-2.5 py-1.5 flex items-center gap-2 w-fit`}
              >
                {getStatusIcon(selectedTask.status)}
                {selectedTask.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Flag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Priority
              </h3>
              {selectedTask.priority ? (
                <Badge
                  className={`${getPriorityColor(selectedTask.priority)} font-medium px-2.5 py-1.5 w-fit`}
                >
                  {selectedTask.priority}
                </Badge>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-sm">
                  Not set
                </span>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Due Date
              </h3>
              {selectedTask.due_date ? (
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {format(new Date(selectedTask.due_date), 'MMMM dd, yyyy')} at{' '}
                  {format(new Date(selectedTask.due_date), 'h:mm a')}
                </p>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-sm">
                  No due date set
                </span>
              )}
            </div>

            {/* Last Updated */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Last Updated
              </h3>
              <p className="text-slate-900 dark:text-slate-100 font-medium">
                {format(new Date(selectedTask.updated_at), 'MMMM dd, yyyy')} at{' '}
                {format(new Date(selectedTask.updated_at), 'h:mm a')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Route = createFileRoute('/tasks/$taskId')({
  component: TaskDetailPage,
});

export default TaskDetailPage;
