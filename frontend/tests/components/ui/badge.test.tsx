import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/badge';

describe('Badge', () => {
  describe('Rendering', () => {
    it('should render badge with default variant', () => {
      render(<Badge>Default Badge</Badge>);
      const badge = screen.getByText('Default Badge');
      expect(badge).toBeInTheDocument();
    });

    it('should render badge with all variants', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<Badge variant={variant}>{variant}</Badge>);
        const badge = screen.getByText(variant);
        expect(badge).toBeInTheDocument();
        unmount();
      });
    });

    it('should render badge with custom className', () => {
      render(<Badge className="custom-class">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('should render badge with children', () => {
      render(
        <Badge>
          <span>Child content</span>
        </Badge>
      );
      const badge = screen.getByText('Child content');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Props forwarding', () => {
    it('should forward HTML div attributes', () => {
      render(
        <Badge data-testid="badge" id="test-badge" role="status">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'test-badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should handle onClick events', () => {
      const handleClick = vi.fn();
      render(<Badge onClick={handleClick}>Clickable Badge</Badge>);
      const badge = screen.getByText('Clickable Badge');
      badge.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});

