import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const TestForm = () => {
  const form = useForm({
    defaultValues: {
      name: '',
    },
  });

  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>Enter your name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

describe('Form Components', () => {
  describe('Form', () => {
    it('should render form with children', () => {
      const TestFormComponent = () => {
        const form = useForm();
        return (
          <Form {...form}>
            <div>Form content</div>
          </Form>
        );
      };
      render(<TestFormComponent />);
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });
  });

  describe('FormField', () => {
    it('should render form field', () => {
      render(<TestForm />);
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });
  });

  describe('FormItem', () => {
    it('should render form item with children', () => {
      const TestFormComponent = () => {
        const form = useForm();
        return (
          <Form {...form}>
            <FormItem>
              <div>Item content</div>
            </FormItem>
          </Form>
        );
      };
      render(<TestFormComponent />);
      expect(screen.getByText('Item content')).toBeInTheDocument();
    });

    it('should render form item with custom className', () => {
      const TestFormComponent = () => {
        const form = useForm();
        return (
          <Form {...form}>
            <FormItem className="custom-item">
              <div>Item</div>
            </FormItem>
          </Form>
        );
      };
      render(<TestFormComponent />);
      const item = screen.getByText('Item').closest('[data-slot="form-item"]');
      expect(item).toHaveClass('custom-item');
    });
  });

  describe('FormLabel', () => {
    it('should render form label', () => {
      render(<TestForm />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('FormControl', () => {
    it('should render form control with input', () => {
      render(<TestForm />);
      const input = screen.getByLabelText('Name');
      expect(input).toBeInTheDocument();
    });
  });

  describe('FormDescription', () => {
    it('should render form description', () => {
      render(<TestForm />);
      expect(screen.getByText('Enter your name')).toBeInTheDocument();
    });
  });

  describe('FormMessage', () => {
    it('should render form message when there is an error', () => {
      const TestFormWithError = () => {
        const form = useForm({
          defaultValues: {
            name: '',
          },
        });

        form.setError('name', { message: 'Name is required' });

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      };

      render(<TestFormWithError />);
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('should not render form message when there is no error', () => {
      render(<TestForm />);
      expect(screen.queryByText(/required/i)).not.toBeInTheDocument();
    });

    it('should render form message with error message when error.message exists', () => {
      const TestFormWithErrorMessage = () => {
        const form = useForm({
          defaultValues: {
            name: '',
          },
        });

        form.setError('name', { message: 'Custom error message', type: 'validation' });

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      };

      render(<TestFormWithErrorMessage />);
      // This covers line 100: error?.message ?? '' branch
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should render form message with empty string when error exists but no message', () => {
      const TestFormWithErrorNoMessage = () => {
        const form = useForm({
          defaultValues: {
            name: '',
          },
        });

        // Set error without message to test error?.message ?? '' branch
        form.setError('name', { type: 'validation' });

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      };

      render(<TestFormWithErrorNoMessage />);
      // This covers line 100: error?.message ?? '' when message is undefined
      // The FormMessage should not render when body is empty (line 102-104)
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should render form message with children when no error', () => {
      const TestFormWithChildren = () => {
        const form = useForm({
          defaultValues: {
            name: '',
          },
        });

        return (
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage>Default message</FormMessage>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        );
      };

      render(<TestFormWithChildren />);
      expect(screen.getByText('Default message')).toBeInTheDocument();
    });
  });
});

