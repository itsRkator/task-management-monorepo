import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render input with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('should render input with value', () => {
      render(<Input value="Test value" readOnly />);
      const input = screen.getByDisplayValue('Test value');
      expect(input).toBeInTheDocument();
    });

    it('should render input with custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should render input with different types', () => {
      const types = ['text', 'email', 'number', 'tel', 'url'] as const;

      types.forEach((type) => {
        const { unmount, container } = render(<Input type={type} />);
        const input = container.querySelector('input');
        expect(input).toHaveAttribute('type', type);
        unmount();
      });
    });

    it('should render password input', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should be readOnly when readOnly prop is true', () => {
      render(<Input readOnly />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should handle controlled input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input value="initial" onChange={handleChange} />);
      const input = screen.getByDisplayValue('initial') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'new value');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have correct data attribute', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-slot', 'input');
    });

    it('should support aria attributes', () => {
      render(
        <Input
          aria-label="Custom label"
          aria-describedby="desc"
          aria-invalid="true"
        />
      );
      const input = screen.getByLabelText('Custom label');
      expect(input).toHaveAttribute('aria-describedby', 'desc');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support id and name attributes', () => {
      render(<Input id="test-input" name="testName" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('name', 'testName');
    });
  });

  describe('Props forwarding', () => {
    it('should forward all HTML input attributes', () => {
      render(
        <Input
          id="test"
          name="test"
          type="email"
          required
          minLength={5}
          maxLength={10}
          pattern="[a-z]+"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'test');
      expect(input).toHaveAttribute('name', 'test');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toBeRequired();
      expect(input).toHaveAttribute('minLength', '5');
      expect(input).toHaveAttribute('maxLength', '10');
      expect(input).toHaveAttribute('pattern', '[a-z]+');
    });
  });
});

