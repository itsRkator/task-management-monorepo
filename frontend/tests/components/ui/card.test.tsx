import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with children', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render card with custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveClass('custom-class');
    });

    it('should have correct data attribute', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('[data-slot="card"]');
      expect(card).toHaveAttribute('data-slot', 'card');
    });
  });

  describe('CardHeader', () => {
    it('should render card header with children', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should render card header with custom className', () => {
      render(
        <Card>
          <CardHeader className="custom-header">Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header');
      expect(header).toHaveClass('custom-header');
    });

    it('should have correct data attribute', () => {
      render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = screen.getByText('Header');
      expect(header).toHaveAttribute('data-slot', 'card-header');
    });
  });

  describe('CardTitle', () => {
    it('should render card title with children', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should render card title with custom className', () => {
      render(
        <Card>
          <CardTitle className="custom-title">Title</CardTitle>
        </Card>
      );
      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
    });

    it('should have correct data attribute', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = screen.getByText('Title');
      expect(title).toHaveAttribute('data-slot', 'card-title');
    });
  });

  describe('CardDescription', () => {
    it('should render card description with children', () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render card description with custom className', () => {
      render(
        <Card>
          <CardDescription className="custom-desc">Description</CardDescription>
        </Card>
      );
      const desc = screen.getByText('Description');
      expect(desc).toHaveClass('custom-desc');
    });

    it('should have correct data attribute', () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const desc = screen.getByText('Description');
      expect(desc).toHaveAttribute('data-slot', 'card-description');
    });
  });

  describe('CardContent', () => {
    it('should render card content with children', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render card content with custom className', () => {
      render(
        <Card>
          <CardContent className="custom-content">Content</CardContent>
        </Card>
      );
      const content = screen.getByText('Content');
      expect(content).toHaveClass('custom-content');
    });

    it('should have correct data attribute', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      const content = screen.getByText('Content');
      expect(content).toHaveAttribute('data-slot', 'card-content');
    });
  });

  describe('CardFooter', () => {
    it('should render card footer with children', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('should render card footer with custom className', () => {
      render(
        <Card>
          <CardFooter className="custom-footer">Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer');
      expect(footer).toHaveClass('custom-footer');
    });

    it('should have correct data attribute', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = screen.getByText('Footer');
      expect(footer).toHaveAttribute('data-slot', 'card-footer');
    });
  });

  describe('CardAction', () => {
    it('should render card action with children', () => {
      render(
        <Card>
          <CardAction>Action</CardAction>
        </Card>
      );
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render card action with custom className', () => {
      render(
        <Card>
          <CardAction className="custom-action">Action</CardAction>
        </Card>
      );
      const action = screen.getByText('Action');
      expect(action).toHaveClass('custom-action');
    });

    it('should have correct data attribute', () => {
      render(
        <Card>
          <CardAction>Action</CardAction>
        </Card>
      );
      const action = screen.getByText('Action');
      expect(action).toHaveAttribute('data-slot', 'card-action');
    });
  });

  describe('Card Composition', () => {
    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });
});

