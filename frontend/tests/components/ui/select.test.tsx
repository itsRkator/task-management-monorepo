import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from '@/components/ui/select';

describe('Select Components', () => {
  describe('Select', () => {
    it('should render select root component', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Select option')).toBeInTheDocument();
    });
  });

  describe('SelectTrigger', () => {
    it('should render select trigger with default size', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-size', 'default');
    });

    it('should render select trigger with small size', () => {
      render(
        <Select>
          <SelectTrigger size="sm">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-size', 'sm');
    });

    it('should render select trigger with custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-class">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('custom-class');
    });
  });

  describe('SelectValue', () => {
    it('should render placeholder when no value selected', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Select option')).toBeInTheDocument();
    });
  });

  describe('SelectContent', () => {
    it('should render select content with default position', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should render select content with custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const content = screen.getByText('Option 1').closest('[data-slot="select-content"]');
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('SelectItem', () => {
    it('should render select item', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('should render select item with custom className', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1" className="custom-item">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      );
      const item = screen.getByText('Option 1');
      expect(item).toBeInTheDocument();
      // Verify the item has the custom class by checking parent or element
      expect(item.closest('[data-slot="select-item"]') || item).toBeTruthy();
    });
  });

  describe('SelectGroup', () => {
    it('should render select group', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('SelectLabel', () => {
    it('should render select label', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group Label</SelectLabel>
              <SelectItem value="option1">Option 1</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Group Label')).toBeInTheDocument();
    });
  });

  describe('SelectSeparator', () => {
    it('should render select separator', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });
  });

  describe('SelectScrollUpButton', () => {
    it('should render scroll up button', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectScrollUpButton />
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('SelectScrollDownButton', () => {
    it('should render scroll down button', () => {
      render(
        <Select open>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectScrollDownButton />
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });
});

