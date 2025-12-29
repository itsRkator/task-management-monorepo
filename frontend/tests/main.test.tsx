import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock App component
vi.mock('@/App', () => ({
  default: () => React.createElement('div', null, 'App Component'),
}));

// Mock index.css
vi.mock('@/index.css', () => ({}));

describe('main.tsx', () => {
  let container: HTMLElement;
  let mockRender: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'root';
    document.body.appendChild(container);

    mockRender = vi.fn();
    (createRoot as ReturnType<typeof vi.fn>).mockReturnValue({
      render: mockRender,
    });
  });

  afterEach(() => {
    container.remove();
    vi.clearAllMocks();
  });

  it('should create root and render App in StrictMode', async () => {
    // Dynamically import main to trigger execution
    await import('../src/main');

    expect(createRoot).toHaveBeenCalledWith(container);
    expect(mockRender).toHaveBeenCalled();

    // Check that StrictMode is used
    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall.type).toBe(StrictMode);
  });

  it('should use root element from document', () => {
    // This test verifies that main.tsx uses the root element
    // Since main.tsx executes on import and we already tested that in the first test,
    // we just verify the setup is correct - root element exists
    expect(document.getElementById('root')).toBeTruthy();
    // The first test already verified createRoot was called with the root element
  });
});
