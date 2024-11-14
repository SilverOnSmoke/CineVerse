'use client';

import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Film, Search, TrendingUp, Tv, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileMenu } from '@/components/mobile-menu';
import { useState, useEffect, useTransition, Suspense } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/tv', label: 'TV Shows', icon: Tv },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
];

// Separate the search functionality into its own component
function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 300);

  // Update search results when debounced search value changes
  useEffect(() => {
    if (debouncedSearch) {
      startTransition(() => {
        router.push(`/search?q=${encodeURIComponent(debouncedSearch)}`);
      });
    }
  }, [debouncedSearch, router]);

  const handleSearchClear = () => {
    setSearch('');
    setIsSearchOpen(false);
    if (pathname === '/search') {
      router.push('/');
    }
  };

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Small delay to ensure the input is rendered before focusing
      setTimeout(() => {
        const searchInput = document.getElementById('search-input');
        searchInput?.focus();
      }, 100);
    } else {
      handleSearchClear();
    }
  };

  return (
    <div className="relative flex items-center">
      <div
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-300',
          isSearchOpen ? 'w-[350px] opacity-100 pr-4' : 'w-0 opacity-0'
        )}
      >
        <Input
          id="search-input"
          type="text"
          placeholder="Search movies & TV shows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'w-full pr-8 transition-all duration-300 rounded-full',
            !isSearchOpen && 'pointer-events-none'
          )}
        />
        {search && isSearchOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-6 h-8 w-8 hover:bg-transparent"
            onClick={handleSearchClear}
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </Button>
        )}
      </div>
      {!isSearchOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSearchToggle}
          className="relative z-10"
        >
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Left section - Logo and mobile menu */}
        <div className="flex items-center">
          <div className="md:hidden">
            <MobileMenu />
          </div>
          <Link 
            href="/" 
            className="flex items-center space-x-2 pl-6 md:pl-8"
          >
            <span className="font-semibold text-lg">CINEVERSE</span>
          </Link>
        </div>

        {/* Center section - Navigation */}
        <nav className="hidden md:flex items-center justify-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors group relative px-3 py-2",
                pathname === item.href 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out" />
            </Link>
          ))}
        </nav>

        {/* Right section - Search */}
        <div className="flex items-center space-x-4 pr-4">
          <Suspense fallback={<div className="w-8 h-8" />}>
            <SearchBar />
          </Suspense>
        </div>
      </div>
    </header>
  );
}