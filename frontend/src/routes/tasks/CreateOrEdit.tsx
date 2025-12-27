import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTaskStore } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TaskStatus, TaskPriority } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, Save } from 'lucide-react';
import { AxiosError } from 'axios';

const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED]).optional(),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).optional(),
  due_date: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  status: z.enum([TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED, TaskStatus.CANCELLED]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]).optional(),
  due_date: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;
type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

interface CreateOrEditTaskPageProps {
  taskId?: string;
  mode: 'create' | 'edit';
}

function CreateOrEditTaskPage({ taskId, mode }: Readonly<CreateOrEditTaskPageProps>) {
  const navigate = useNavigate();
  const { selectedTask, loading, fetchTaskById, createTask, updateTask } = useTaskStore();
  const isEditMode = mode === 'edit';

  const taskSchema = isEditMode ? updateTaskSchema : createTaskSchema;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateTaskFormData | UpdateTaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: TaskStatus.PENDING,
    },
  });

  const status = useWatch({ control, name: 'status' });
  const priority = useWatch({ control, name: 'priority' });

  // Fetch task data for edit mode
  useEffect(() => {
    if (isEditMode && taskId) {
      fetchTaskById(taskId);
    }
  }, [isEditMode, taskId, fetchTaskById]);

  // Populate form with task data when editing
  useEffect(() => {
    if (isEditMode && selectedTask) {
      reset({
        title: selectedTask.title,
        description: selectedTask.description || '',
        status: selectedTask.status,
        priority: selectedTask.priority || undefined,
        due_date: selectedTask.due_date
          ? new Date(selectedTask.due_date).toISOString().slice(0, 16)
          : '',
      });
    }
  }, [isEditMode, selectedTask, reset]);

  const onSubmit = async (data: CreateTaskFormData | UpdateTaskFormData) => {
    try {
      if (isEditMode && taskId) {
        const updateData = data as UpdateTaskFormData;
        await updateTask(taskId, {
          title: updateData.title,
          description: updateData.description || undefined,
          status: updateData.status,
          priority: updateData.priority,
          due_date: updateData.due_date ? new Date(updateData.due_date).toISOString() : undefined,
        });
        toast.success('Task updated successfully');
        navigate({ to: '/tasks/$taskId', params: { taskId } });
      } else {
        const createData = data as CreateTaskFormData;
        await createTask({
          title: createData.title,
          description: createData.description || undefined,
          status: createData.status,
          priority: createData.priority,
          due_date: createData.due_date || undefined,
        });
        toast.success('Task created successfully');
        navigate({ to: '/' });
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(isEditMode ? 'Failed to update task' : 'Failed to create task');
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode && taskId) {
      navigate({ to: '/tasks/$taskId', params: { taskId } });
    } else {
      navigate({ to: '/' });
    }
  };

  // Show loading state for edit mode while fetching task
  if (isEditMode && !selectedTask && loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Loading task details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isEditMode
              ? 'Update the details of your task'
              : 'Fill in the details below to create a new task'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <CardTitle className="text-xl">Task Details</CardTitle>
          <CardDescription className="mt-1">
            {isEditMode
              ? 'Modify the information below to update your task'
              : 'Provide information about your new task'}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title Field */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500 font-semibold">*</span>
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter task title"
                className={errors.title ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1.5 mt-1">
                  <span>•</span>
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter task description (optional)"
                rows={5}
                className={errors.description ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.description && (
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1.5 mt-1">
                  <span>•</span>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">
                  Status {isEditMode && <span className="text-red-500 font-semibold">*</span>}
                </Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue('status', value as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TaskStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={TaskStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1.5 mt-1">
                    <span>•</span>
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={priority || undefined}
                  onValueChange={(value) =>
                    setValue('priority', value === 'none' ? undefined : (value as TaskPriority))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                    <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date Field */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="datetime-local"
                {...register('due_date')}
                className={errors.due_date ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {errors.due_date && (
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1.5 mt-1">
                  <span>•</span>
                  {errors.due_date.message}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={isEditMode ? 'edit' : 'create'}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditMode ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Task
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Task
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateOrEditTaskPage;

