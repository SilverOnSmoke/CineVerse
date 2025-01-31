// ScrollToTopLink.tsx
'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

interface ScrollToTopLinkProps extends ComponentProps<typeof Link> {
  children: React.ReactNode;
}

export function ScrollToTopLink({ children, ...props }: ScrollToTopLinkProps) {
  // Handle both scroll and navigation
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined') {
      // Start the smooth scroll
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Link 
      {...props} 
      onClick={handleClick}
      scroll={false} // Prevent Next.js default scroll behavior
    >
      {children}
    </Link>
  );
}
