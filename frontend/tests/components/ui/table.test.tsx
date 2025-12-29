import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table';

describe('Table Components', () => {
  describe('Table', () => {
    it('should render table with children', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });

    it('should render table with custom className', () => {
      render(
        <Table className="custom-table">
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      const table = screen.getByRole('table');
      expect(table).toHaveClass('custom-table');
    });
  });

  describe('TableHeader', () => {
    it('should render table header', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
    });
  });

  describe('TableBody', () => {
    it('should render table body', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });
  });

  describe('TableFooter', () => {
    it('should render table footer', () => {
      render(
        <Table>
          <TableFooter>
            <TableRow>
              <TableCell>Footer</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('TableHead', () => {
    it('should render table head', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      );
      expect(screen.getByText('Header')).toBeInTheDocument();
    });
  });

  describe('TableRow', () => {
    it('should render table row', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });
  });

  describe('TableCell', () => {
    it('should render table cell', () => {
      render(
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Cell')).toBeInTheDocument();
    });
  });

  describe('TableCaption', () => {
    it('should render table caption', () => {
      render(
        <Table>
          <TableCaption>Table Caption</TableCaption>
          <TableBody>
            <TableRow>
              <TableCell>Cell</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
      expect(screen.getByText('Table Caption')).toBeInTheDocument();
    });
  });

  describe('Complete Table Structure', () => {
    it('should render complete table with all components', () => {
      render(
        <Table>
          <TableCaption>Test Table</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John</TableCell>
              <TableCell>30</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell>1</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      );

      expect(screen.getByText('Test Table')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Age')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});

