import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with default variant and size', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'default');
      expect(button).toHaveAttribute('data-size', 'default');
    });

    it('should render button with custom variant', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button', { name: 'Delete' });
      expect(button).toHaveAttribute('data-variant', 'destructive');
    });

    it('should render button with custom size', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: 'Small' });
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('should render button with all variants', () => {
      const variants = [
        'default',
        'create',
        'edit',
        'info',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ] as const;

      variants.forEach((variant) => {
        const { unmount } = render(<Button variant={variant}>{variant}</Button>);
        const button = screen.getByRole('button', { name: variant });
        expect(button).toHaveAttribute('data-variant', variant);
        unmount();
      });
    });

    it('should render button with all sizes', () => {
      const sizes = ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg'] as const;

      sizes.forEach((size) => {
        const { unmount } = render(<Button size={size}>{size}</Button>);
        const button = screen.getByRole('button', { name: size });
        expect(button).toHaveAttribute('data-size', size);
        unmount();
      });
    });

    it('should render button with custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button', { name: 'Button' });
      expect(button).toHaveClass('custom-class');
    });

    it('should render button as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });
  });

  describe('Interactions', () => {
    it('should call onClick handler when clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button', { name: 'Disabled' });
      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: 'Disabled' });
      expect(button).toBeDisabled();
    });

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: 'Click me' });
      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have correct data attributes', () => {
      render(<Button variant="create" size="lg">Button</Button>);
      const button = screen.getByRole('button', { name: 'Button' });
      expect(button).toHaveAttribute('data-slot', 'button');
      expect(button).toHaveAttribute('data-variant', 'create');
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should pass through aria attributes', () => {
      render(
        <Button aria-label="Custom label" aria-describedby="desc">
          Button
        </Button>
      );
      const button = screen.getByRole('button', { name: 'Custom label' });
      expect(button).toHaveAttribute('aria-describedby', 'desc');
    });
  });

  describe('Props forwarding', () => {
    it('should forward all HTML button attributes', () => {
      render(
        <Button type="submit" form="test-form" name="test-button">
          Submit
        </Button>
      );
      const button = screen.getByRole('button', { name: 'Submit' });
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
      expect(button).toHaveAttribute('name', 'test-button');
    });
  });
});

