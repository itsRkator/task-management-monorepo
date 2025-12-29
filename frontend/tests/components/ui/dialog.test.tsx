import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

describe('Dialog Components', () => {
  describe('Dialog', () => {
    it('should render dialog when open', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      render(
        <Dialog open={false}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });
  });

  describe('DialogTrigger', () => {
    it('should render dialog trigger', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });
  });

  describe('DialogContent', () => {
    it('should render dialog content with children', () => {
      render(
        <Dialog open>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render dialog content with custom className', () => {
      render(
        <Dialog open>
          <DialogContent className="custom-content">
            <div>Content</div>
          </DialogContent>
        </Dialog>
      );
      const content = screen.getByText('Content').closest('[data-slot="dialog-content"]');
      expect(content).toHaveClass('custom-content');
    });

    it('should show close button by default', () => {
      render(
        <Dialog open>
          <DialogContent>
            <div>Content</div>
          </DialogContent>
        </Dialog>
      );
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should hide close button when showCloseButton is false', () => {
      render(
        <Dialog open>
          <DialogContent showCloseButton={false}>
            <div>Content</div>
          </DialogContent>
        </Dialog>
      );
      const closeButton = screen.queryByRole('button', { name: /close/i });
      expect(closeButton).not.toBeInTheDocument();
    });
  });

  describe('DialogHeader', () => {
    it('should render dialog header with children', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('should render dialog header with custom className', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader className="custom-header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const header = screen.getByText('Title').closest('[data-slot="dialog-header"]');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('DialogTitle', () => {
    it('should render dialog title', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });

    it('should render dialog title with custom className', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="custom-title">Dialog Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const title = screen.getByText('Dialog Title');
      expect(title).toHaveClass('custom-title');
    });
  });

  describe('DialogDescription', () => {
    it('should render dialog description', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('should render dialog description with custom className', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription className="custom-desc">Description</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const desc = screen.getByText('Description');
      expect(desc).toHaveClass('custom-desc');
    });
  });

  describe('DialogFooter', () => {
    it('should render dialog footer with children', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogFooter>
              <button>Cancel</button>
              <button>Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('should render dialog footer with custom className', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogFooter className="custom-footer">
              <button>Action</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      const footer = screen.getByText('Action').closest('[data-slot="dialog-footer"]');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('DialogClose', () => {
    it('should render dialog close button', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </Dialog>
      );
      const closeButtons = screen.getAllByText('Close');
      expect(closeButtons.length).toBeGreaterThan(0);
    });
  });
});

