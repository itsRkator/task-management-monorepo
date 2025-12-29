import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { FormFieldContext, FormItemContext, useFormField } from '@/components/ui/use-form-field';
import * as React from 'react';

describe('useFormField', () => {
  it('should throw error when used outside FormField - covers error throw', () => {
    // This test covers the error throw: throw new Error('useFormField should be used within <FormField>')
    // After refactoring, the check happens before accessing fieldContext.name
    // We can test by providing a null context or a context without a name property

    // Test with null context
    const TestComponentNull = () => {
      const form = useForm({
        defaultValues: {
          test: '',
        },
      });

      const TestHook = () => {
        try {
          useFormField();
          return <div data-testid="result">Success</div>;
        } catch (error: unknown) {
          expect(error.message).toBe('useFormField should be used within <FormField>');
          return <div data-testid="error">{error.message}</div>;
        }
      };

      return (
        <FormProvider {...form}>
          <FormFieldContext.Provider value={null as any}>
            <FormItemContext.Provider value={{ id: 'test-id' }}>
              <TestHook />
            </FormItemContext.Provider>
          </FormFieldContext.Provider>
        </FormProvider>
      );
    };

    // Test with context without name property
    const TestComponentNoName = () => {
      const form = useForm({
        defaultValues: {
          test: '',
        },
      });

      const TestHook = () => {
        try {
          useFormField();
          return <div data-testid="result">Success</div>;
        } catch (error: unknown) {
          expect(error.message).toBe('useFormField should be used within <FormField>');
          return <div data-testid="error">{error.message}</div>;
        }
      };

      return (
        <FormProvider {...form}>
          <FormFieldContext.Provider value={{} as any}>
            <FormItemContext.Provider value={{ id: 'test-id' }}>
              <TestHook />
            </FormItemContext.Provider>
          </FormFieldContext.Provider>
        </FormProvider>
      );
    };

    // Test with null context
    const { unmount: unmount1 } = render(<TestComponentNull />);
    const error1 = screen.queryByTestId('error');
    expect(error1).toBeInTheDocument();
    expect(error1?.textContent).toBe('useFormField should be used within <FormField>');
    unmount1();

    // Test with context without name
    render(<TestComponentNoName />);
    const error2 = screen.queryByTestId('error');
    expect(error2).toBeInTheDocument();
    expect(error2?.textContent).toBe('useFormField should be used within <FormField>');
  });


  it('should return form field data when used within FormField', () => {
    const TestComponent = () => {
      const form = useForm({
        defaultValues: {
          test: '',
        },
      });

      return (
        <FormProvider {...form}>
          <FormFieldContext.Provider value={{ name: 'test' }}>
            <FormItemContext.Provider value={{ id: 'test-id' }}>
              <TestHook />
            </FormItemContext.Provider>
          </FormFieldContext.Provider>
        </FormProvider>
      );
    };

    const TestHook = () => {
      const result = useFormField();
      return <div data-testid="result">{JSON.stringify(result)}</div>;
    };

    render(<TestComponent />);
    const result = screen.getByTestId('result');
    expect(result).toBeInTheDocument();
  });
});

