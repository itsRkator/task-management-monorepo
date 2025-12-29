import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '@/components/ui/label';

describe('Label', () => {
  describe('Rendering', () => {
    it('should render label with text', () => {
      render(<Label>Test Label</Label>);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render label with htmlFor attribute', () => {
      render(<Label htmlFor="test-input">Label</Label>);
      const label = screen.getByText('Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    it('should render label with custom className', () => {
      render(<Label className="custom-class">Label</Label>);
      const label = screen.getByText('Label');
      expect(label).toHaveClass('custom-class');
    });

    it('should render label with children', () => {
      render(
        <Label>
          <span>Child content</span>
        </Label>
      );
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct data attribute', () => {
      render(<Label>Label</Label>);
      const label = screen.getByText('Label');
      expect(label).toHaveAttribute('data-slot', 'label');
    });

    it('should support aria attributes', () => {
      render(
        <Label aria-label="Custom label" aria-describedby="desc">
          Label
        </Label>
      );
      const label = screen.getByText('Label');
      expect(label).toHaveAttribute('aria-label', 'Custom label');
      expect(label).toHaveAttribute('aria-describedby', 'desc');
    });
  });

  describe('Props forwarding', () => {
    it('should forward all HTML label attributes', () => {
      render(
        <Label htmlFor="input" id="label-id" className="test-class">
          Label
        </Label>
      );
      const label = screen.getByText('Label');
      expect(label).toHaveAttribute('for', 'input');
      expect(label).toHaveAttribute('id', 'label-id');
      expect(label).toHaveClass('test-class');
    });
  });
});

