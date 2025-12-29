import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
  describe('Rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should render textarea with placeholder', () => {
      render(<Textarea placeholder="Enter text" />);
      const textarea = screen.getByPlaceholderText('Enter text');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea with value', () => {
      render(<Textarea value="Test value" readOnly />);
      const textarea = screen.getByDisplayValue('Test value');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea with custom className', () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-class');
    });

    it('should render textarea with rows attribute', () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should render textarea with cols attribute', () => {
      render(<Textarea cols={50} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });
  });

  describe('Interactions', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should handle onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Textarea onFocus={handleFocus} />);
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Textarea onBlur={handleBlur} />);
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should be readOnly when readOnly prop is true', () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should handle controlled textarea', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea value="initial" onChange={handleChange} />);
      const textarea = screen.getByDisplayValue('initial') as HTMLTextAreaElement;
      await user.clear(textarea);
      await user.type(textarea, 'new value');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should support aria attributes', () => {
      render(
        <Textarea
          aria-label="Custom label"
          aria-describedby="desc"
          aria-invalid="true"
        />
      );
      const textarea = screen.getByLabelText('Custom label');
      expect(textarea).toHaveAttribute('aria-describedby', 'desc');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support id and name attributes', () => {
      render(<Textarea id="test-textarea" name="testName" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(textarea).toHaveAttribute('name', 'testName');
    });
  });

  describe('Props forwarding', () => {
    it('should forward all HTML textarea attributes', () => {
      render(
        <Textarea
          id="test"
          name="test"
          required
          minLength={5}
          maxLength={100}
          rows={10}
          cols={50}
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'test');
      expect(textarea).toHaveAttribute('name', 'test');
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('minLength', '5');
      expect(textarea).toHaveAttribute('maxLength', '100');
      expect(textarea).toHaveAttribute('rows', '10');
      expect(textarea).toHaveAttribute('cols', '50');
    });
  });
});

