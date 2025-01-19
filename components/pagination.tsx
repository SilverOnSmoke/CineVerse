'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
}

function getPaginationItems(currentPage: number, totalPages: number) {
  // For mobile, show fewer page numbers
  const maxPagesOnMobile = 3;
  const maxPagesOnDesktop = 5;

  if (totalPages <= maxPagesOnDesktop) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  // Always show first and last page
  if (currentPage <= maxPagesOnMobile) {
    // For first few pages
    pages.push(...Array.from({ length: maxPagesOnMobile }, (_, i) => i + 1));
    pages.push('...', totalPages);
  } else if (currentPage > totalPages - maxPagesOnMobile) {
    // For last few pages
    pages.push(1, '...');
    pages.push(...Array.from({ length: maxPagesOnMobile }, (_, i) => 
      totalPages - maxPagesOnMobile + i + 1
    ));
  } else {
    // For middle pages
    pages.push(1, '...');
    const startPage = currentPage - 1;
    const endPage = currentPage + 1;
    pages.push(startPage, currentPage, endPage);
    pages.push('...', totalPages);
  }

  return pages;
}

export function PaginationControl({ currentPage, totalPages, baseUrl }: PaginationControlProps) {
  const searchParams = useSearchParams();
  const pages = getPaginationItems(currentPage, totalPages);

  return (
    <Pagination className="my-6 flex justify-center">
      <PaginationContent className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
        <PaginationItem>
          <PaginationPrevious
            href={`${baseUrl}?page=${currentPage - 1}`}
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {pages.map((page, i) => (
          <PaginationItem key={i} className="hidden sm:block">
            {page === '...' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={`${baseUrl}?page=${page}`}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem className="sm:hidden">
          <PaginationLink>
            {currentPage} / {totalPages}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href={`${baseUrl}?page=${currentPage + 1}`}
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}