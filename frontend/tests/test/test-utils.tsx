import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { routeTree } from '@/routeTree.gen';

// Helper function to render components with router
export const renderWithRouter = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] }
) => {
  const history = createMemoryHistory({
    initialEntries: options?.initialEntries || ['/'],
  });

  const router = createRouter({
    routeTree,
    history,
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return <RouterProvider router={router}>{children}</RouterProvider>;
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Helper function to render without router
export const renderWithoutRouter = (ui: ReactElement, options?: RenderOptions) => {
  return render(ui, options);
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

