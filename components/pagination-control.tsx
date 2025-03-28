'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
}

export function PaginationControl({ currentPage, totalPages }: PaginationControlProps) {
  const pathname = usePathname();
  
  // Calculate range of pages to show
  const pageItems = [];
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  
  // Adjust if we're near the end
  if (endPage - startPage < 4 && startPage > 1) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // First page
  if (startPage > 1) {
    pageItems.push(
      <Link href={`${pathname}?page=1`} key="first">
        <Button variant="outline" size="icon" className="h-8 w-8">
          1
        </Button>
      </Link>
    );
    
    if (startPage > 2) {
      pageItems.push(
        <span key="dots-1" className="mx-1">…</span>
      );
    }
  }
  
  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pageItems.push(
      <Link href={`${pathname}?page=${i}`} key={i}>
        <Button 
          variant={i === currentPage ? "default" : "outline"} 
          size="icon" 
          className="h-8 w-8"
        >
          {i}
        </Button>
      </Link>
    );
  }
  
  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageItems.push(
        <span key="dots-2" className="mx-1">…</span>
      );
    }
    
    pageItems.push(
      <Link href={`${pathname}?page=${totalPages}`} key="last">
        <Button variant="outline" size="icon" className="h-8 w-8">
          {totalPages}
        </Button>
      </Link>
    );
  }
  
  return (
    <div className="flex items-center gap-1 sm:gap-2 pb-6 md:pb-2">
      <Link 
        href={`${pathname}?page=${Math.max(1, currentPage - 1)}`}
        aria-disabled={currentPage === 1}
        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
      >
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
      </Link>
      
      <div className="flex items-center gap-1">
        {pageItems}
      </div>
      
      <Link 
        href={`${pathname}?page=${Math.min(totalPages, currentPage + 1)}`}
        aria-disabled={currentPage === totalPages}
        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
      >
        <Button variant="outline" size="icon" className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </Link>
    </div>
  );
}