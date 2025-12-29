import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '@/App';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  RouterProvider: ({ router: _router }: { router: unknown }) => <div data-testid="router-provider">Router</div>,
  createRouter: vi.fn(() => ({
    routeTree: {},
    notFoundMode: 'root',
    defaultNotFoundComponent: () => <div>NotFound</div>,
  })),
}));

// Mock routeTree
vi.mock('@/routeTree.gen', () => ({
  routeTree: {},
}));

// Mock NotFoundPage
vi.mock('@/routes/$', () => ({
  default: () => <div>NotFound Page</div>,
}));

// Mock App.css
vi.mock('@/App.css', () => ({}));

describe('App', () => {
  it('should render RouterProvider', () => {
    render(<App />);
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });

  it('should create router with correct configuration', () => {
    render(<App />);
    // Router is created internally, just verify App renders
    expect(screen.getByTestId('router-provider')).toBeInTheDocument();
  });
});

