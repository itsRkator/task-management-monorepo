import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from '@/components/ui/sonner';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

describe('Toaster', () => {
  it('should render toaster component', () => {
    const { container } = render(<Toaster />);
    expect(container).toBeTruthy();
  });

  it('should render toaster with custom props', () => {
    const { container } = render(<Toaster position="bottom-right" />);
    expect(container).toBeTruthy();
  });
});

