import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TaskStatus, TaskPriority } from '@/lib/api';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Edit,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

function TaskListPage() {
  const navigate = useNavigate();
  const {
    tasks,
    loading,
    error,
    pagination,
    filters,
    fetchTasks,
    setFilters,
    deleteTask,
  } = useTaskStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleFilterChange = (
    key: 'status' | 'priority' | 'search',
    value: string
  ) => {
    const filterValue = value === 'all' ? undefined : value || undefined;
    setFilters({ [key]: filterValue });
    fetchTasks({
      ...filters,
      [key]: filterValue,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchTasks({
      ...filters,
      page: newPage,
    });
  };

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete);
      toast.success('Task deleted successfully');
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch {
      toast.error('Failed to delete task');
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
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

  const getGridClasses = (taskCount: number) => {
    if (taskCount === 1) {
      return 'grid-cols-1 justify-items-center max-w-md mx-auto';
    }
    if (taskCount === 2) {
      return 'grid-cols-1 sm:grid-cols-2 justify-items-stretch max-w-4xl mx-auto';
    }
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-stretch';
  };

  const getCardClasses = (taskCount: number) => {
    return taskCount === 1 ? 'w-full max-w-md' : 'w-full';
  };

  const renderTaskContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Loading tasks...
          </p>
        </div>
      );
    }

    if (tasks.length === 0) {
      const hasFilters = filters.search || filters.status || filters.priority;
      const emptyMessage = hasFilters
        ? 'Try adjusting your filters to see more results.'
        : 'Get started by creating your first task.';

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 mb-4">
            <Search className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            No tasks found
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
            {emptyMessage}
          </p>
          {!hasFilters && (
            <Button
              onClick={() => navigate({ to: '/tasks/new' })}
              variant="create"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Task
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className={`grid gap-4 p-6 ${getGridClasses(tasks.length)}`}>
          {tasks.map((task) => (
            <Card
              key={task.id}
              className={`hover:shadow-lg transition-shadow duration-200 flex flex-col ${getCardClasses(tasks.length)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to="/tasks/$taskId"
                    params={{ taskId: task.id }}
                    className="flex-1 min-w-0"
                  >
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                      {task.title}
                    </CardTitle>
                  </Link>
                  <Badge
                    className={`${getStatusColor(task.status)} font-medium px-2.5 py-1 flex-shrink-0`}
                  >
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
                {task.description && (
                  <CardDescription className="line-clamp-2 mt-2">
                    {task.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3 flex-1">
                {task.priority && (
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getPriorityColor(task.priority)} font-medium px-2.5 py-1`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(task.due_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
                <Button 
                  variant="edit" 
                  size="sm"
                  onClick={() => navigate({ to: '/tasks/edit/$taskId', params: { taskId: task.id } })}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(task.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Page{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {pagination.page}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {pagination.totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg">Filter Tasks</CardTitle>
            <Button
              onClick={() => navigate({ to: '/tasks/new' })}
              variant="create"
              className="ml-auto"
            >
              <Plus className="size-4" />
              Create Task
            </Button>
          </div>
          <CardDescription className="mt-1">
            Refine your task list with filters and search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
              <Input
                placeholder="Search tasks..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status ? filters.status : 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                <SelectItem value={TaskStatus.IN_PROGRESS}>
                  In Progress
                </SelectItem>
                <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority ? filters.priority : 'all'}
              onValueChange={(value) => handleFilterChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-800 dark:text-red-300 px-4 py-3 rounded-r-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">{renderTaskContent()}</CardContent>
        <CardFooter className="border-t border-slate-200 dark:border-slate-800 flex justify-center items-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {tasks.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {pagination.total}
            </span>{' '}
            tasks
          </p>
        </CardFooter>
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
              onClick={() => {
                setDeleteDialogOpen(false);
                setTaskToDelete(null);
              }}
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
}

export const Route = createFileRoute('/')({
  component: TaskListPage,
});
